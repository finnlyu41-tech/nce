import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fixtureForId,productionHost,supportedCourseIds} from './production-test-binding.mjs';
const earliestSix=Object.freeze(['nce1-1','nce1-3','nce1-5','nce1-7','nce1-9','nce1-11']);
const unknownCourse='__test_unknown_course__';
const host=await productionHost(),NOW=1790940000000,DAY=86400000;
const fixtures=Object.fromEntries(await Promise.all(supportedCourseIds.map(async id=>[id,await fixtureForId(id)])));
function complete(id,start=NOW){
 const {model,content}=fixtures[id];let state=model.initialState(start),at=start;
 const send=action=>{const result=model.transition(state,action,++at);assert.ok(result.ok,result.message);state=result.state;return result.view};
 for(const stage of ['diagnostic','guided','independent','repair']){
  if(stage==='guided'||stage==='repair')send({type:'next'});
  for(const q of content.questionsFor(stage)){send({type:'draft',value:q.accepted[0]});send({type:'submit'});send({type:'next'})}
 }
 send({type:'own-draft',value:'Own expression '+id+' awaiting human review.'});const view=send({type:'finish'});
 return {state,view,at};
}
const completed=Object.fromEntries(supportedCourseIds.map(id=>[id,complete(id)]));
const stateWith=entries=>({...structuredClone(host.initial),drafts:Object.fromEntries(entries.map(([id,state])=>[fixtures[id].keys.snapshot,JSON.stringify(state)]))});
const entries=ids=>ids.map(id=>[id,completed[id].state]);
test('actual registry retains earliest six keys/defaults and exposes every registered binding',()=>{
 assert.deepEqual(host.courseLoopBindings.map(c=>c.id),supportedCourseIds);assert.deepEqual(supportedCourseIds.slice(0,earliestSix.length),earliestSix);
 assert.equal(host.courseLoopFor().id,'nce1-1');assert.equal(host.courseLoopKey,'nce-course-loop-v1:NCE1-1');assert.equal(host.courseLoopInputsKey,'nce-course-loop-inputs-v1:NCE1-1');
 for(const id of earliestSix){const n=id.slice(5),b=host.courseLoopFor(id);assert.equal(b.key,`nce-course-loop-v1:NCE1-${n}`);assert.equal(b.inputsKey,`nce-course-loop-inputs-v1:NCE1-${n}`);}
 assert.equal(new Set(earliestSix.flatMap(id=>Object.values(fixtures[id].keys))).size,12);assert.equal(new Set(host.courseLoopBindings.flatMap(b=>[b.key,b.inputsKey])).size,supportedCourseIds.length*2);assert.throws(()=>host.courseLoopFor(unknownCourse));
 for(const id of supportedCourseIds){const b=host.courseLoopFor(id);assert.equal(b.key,fixtures[id].keys.snapshot);assert.equal(b.inputsKey,fixtures[id].keys.inputs);assert.equal(b.lesson.id,id)}
});
test('production matcher keeps the nationality question guard, original text and help state',()=>{
 const m=host.courseLoopFor('nce1-5').model;let state=m.initialState(NOW),at=NOW;
 for(const q of fixtures['nce1-5'].content.questionsFor('diagnostic')){for(const action of [{type:'draft',value:q.target==='nationality'?'He is German?':q.accepted[0]},{type:'submit'},{type:'next'}]){const r=m.transition(state,action,++at);assert.ok(r.ok,r.message);state=r.state}}
 const parsed=host.parseCourseLoop(JSON.stringify(state),at,'nce1-5');assert.ok(parsed.ok);const original=parsed.view.attempts.at(-1);assert.equal(original.answer,'He is German?');assert.equal(original.correct,false);assert.equal(original.hinted,false);assert.equal(m.teachingFor(parsed.view)[0].target,'nationality');
});
test('one actual recommendation advances every registered course with access-only map starts',()=>{
 let map=host.emptyProgress();const at=NOW+1000;
 for(const [i,last] of supportedCourseIds.entries()){
  assert.match(last,/^nce[12]-[1-9]\d*$/);const [book,number]=last.split('-'),n=Number(number);if(book==='nce1')assert.equal(n%2,1,'NCE1 retains the odd-course contract');
  const ids=supportedCourseIds.slice(0,i+1),want=book==='nce1'?(n===143?'chapter-6':`nce1-${n+2}`):`nce2-${n+1}`;assert.ok(host.nodeById(want),`${last}: independently expected successor ${want} must exist`);
  map=host.startNode(host.unlockNode(map,last),last,at);const state=stateWith(entries(ids)),before=JSON.stringify({state,map});
  const d=host.courseDestination(state,map,at);assert.equal(d.node.id,want);assert.equal(host.courseContinuation(state,map,last,at).href,d.href);const textbookTasks=host.todayPractice(state,map,at).filter(t=>t.kind==='course'&&t.id.startsWith('course:'));assert.equal(textbookTasks.length,1);assert.equal(textbookTasks[0].href,d.href);
  assert.equal(JSON.stringify({state,map}),before);assert.equal(host.achieved(host.nodeById(last),map,at),false);
 }
});
test('advanced map route survives six waiting courses',()=>{
 const state=stateWith(entries(earliestSix)),map={...host.emptyProgress(),lastNode:'nce1-25',access:{all:true,nodes:[]}},before=JSON.stringify({state,map});
 assert.equal(host.nextCourse(state,map,NOW+1000).id,'nce1-25');
 for(const id of earliestSix){const raw=state.drafts[fixtures[id].keys.snapshot];assert.equal(raw,JSON.stringify(completed[id].state));assert.deepEqual(host.parseCourseLoop(raw,NOW+1000,id).view.attempts,completed[id].view.attempts);}
 assert.equal(JSON.stringify({state,map}),before);
});
test('access reset condition link preserves v31 behavior with the old CL00-only backup',()=>{
 const state=stateWith(entries(['nce1-1'])),map={...host.unlockNode(host.emptyProgress(),'nce1-1'),lastNode:'nce1-3'},before=JSON.stringify({state,map});
 const c=host.courseContinuation(state,map,'nce1-1',NOW+1000);assert.equal(c.currentRoute,true);assert.equal(c.href,'/map/#/map/nce1-1?conditions=1');assert.equal(c.label,'查看当前路线条件');assert.equal(JSON.stringify({state,map}),before);
});
test('pending selected courses resume before due work and agree with Today oldest pending order',()=>{
 const pending5=fixtures['nce1-5'].model.initialState(NOW-3000),pending3=fixtures['nce1-3'].model.initialState(NOW-2000);
 const old=complete('nce1-1',NOW-2*DAY).state,state=stateWith([['nce1-1',old],['nce1-3',pending3],['nce1-5',pending5]]),map=host.emptyProgress();
 assert.equal(host.nextCourse(state,map,NOW).id,'nce1-5');const tasks=host.todayPractice(state,map,NOW).filter(t=>t.id.startsWith('course-loop:'));assert.equal(tasks[0].id,'course-loop:nce1-5');assert.deepEqual(tasks.map(t=>t.kind),['resume','resume','review']);assert.equal(new Set(tasks.map(t=>t.href)).size,3);assert.equal(host.todayPractice(state,map,NOW).some(t=>t.kind==='course'&&t.href===tasks[0].href),false);
});
test('multiple waiting due courses choose earliest due and expose one Today task per course',()=>{
 const state=stateWith([['nce1-3',complete('nce1-3',NOW-2*DAY).state],['nce1-5',complete('nce1-5',NOW-3*DAY).state]]),map=host.emptyProgress();
 assert.equal(host.nextCourse(state,map,NOW).id,'nce1-5');const tasks=host.todayPractice(state,map,NOW).filter(t=>t.id.startsWith('course-loop:'));assert.deepEqual(tasks.map(t=>t.id),['course-loop:nce1-5','course-loop:nce1-3']);assert.equal(tasks.length,2);
});
test('every selected record summary stays in its own course and unknown raw remains unchanged',()=>{
 const state=stateWith(entries(supportedCourseIds)),map=host.emptyProgress();for(const id of supportedCourseIds){const s=host.courseLoopSummary(state,map,NOW+1000,id);assert.equal(s.status,'ready');assert.equal(s.attempts,12);assert.equal(s.ownStatus,'awaiting-human-review');assert.equal(s.mapLabel,'地图检验：尚未达标')}
 const raw=JSON.stringify({...completed['nce1-3'].state,contentVersion:99});state.drafts[fixtures['nce1-3'].keys.snapshot]=raw;const before=JSON.stringify(state);assert.equal(host.courseLoopSummary(state,map,NOW+1000,'nce1-3').status,'blocked');assert.equal(host.nextCourse(state,map,NOW+1000).id,'nce1-3');assert.equal(JSON.stringify(state),before);
});
test('wrong target, unknown record and foreign correction sidecar never silently bind to CL00',()=>{
 for(const id of supportedCourseIds){for(const other of supportedCourseIds.filter(x=>x!==id)){const raw=JSON.stringify(completed[other].state),r=host.parseCourseLoop(raw,NOW+1000,id);assert.equal(r.ok,false);assert.equal(r.raw,raw);const q=fixtures[other].content.questionsFor('independent')[0];assert.throws(()=>host.parseLoopInputs(JSON.stringify({version:1,corrections:{[q.id]:{answer:'foreign original',note:'foreign reason'}}}),id))}}
 const raw=JSON.stringify(completed['nce1-5'].state);assert.equal(host.parseCourseLoop(raw,NOW+1000,unknownCourse).raw,raw);
});
test('course completion does not create map passes, flashcard grades, listening scores or free-expression judgments',()=>{
 const state=stateWith(entries(supportedCourseIds)),map=host.emptyProgress();const before=JSON.stringify({state,map});host.todayPractice(state,map,NOW+1000);for(const id of supportedCourseIds){const {model}=fixtures[id],r=model.receipt(completed[id].view,NOW+1000);assert.equal(r.listening,'not-tested');assert.equal(r.pronunciation,'not-tested');assert.equal(r.mastery,'not-assessed');assert.equal(r.band,null);assert.equal(r.openExpression,'awaiting-human-review')}
 assert.equal(state.flashcards,undefined);assert.deepEqual(map.records,{});assert.equal(JSON.stringify({state,map}),before);
});
test('starter, NCE unit, IELTS task and finish explain their own conditions, including honest fallback',()=>{
 const starter=host.nodeById('first'),unit=host.nodeById('nce1-1'),task=host.nodes.find(n=>n.kind==='task'),finish=host.nodeById('finish');
 assert.match(host.conditionGoal(starter),/点击作答/);assert.match(host.conditionGoal(unit),/地图检验.*独立答对.*实际播放/);assert.doesNotMatch(host.conditionGoal(unit),/模考|成绩单/);assert.equal(host.conditionGoal(task),task.mission.assignment.check);assert.match(host.conditionGoal(finish),/两套模考.*成绩单/);assert.equal(host.conditionGoal({...task,mission:undefined}),'按本任务要求完成作品，并保留评阅与修订证据。');assert.equal(host.conditionGoal({...unit,kind:'future'}),'按这一站列出的检验条件完成实际练习。');
});
test('production factory, registry and UI never import the historical preview or test adapter',async()=>{
 for(const file of ['../model.mjs','../registry.mjs','../../app/course-loop-progress.ts','../../app/course-loop-ui.tsx'])assert.doesNotMatch(await readFile(new URL(file,import.meta.url),'utf8'),/model-fixture|production-test-binding|bindContent/);
});
