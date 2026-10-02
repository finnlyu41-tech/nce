/** Production-only integration regressions. Explicit test timestamps exercise
 * scheduling boundaries; they are not learner saves or natural delayed proof. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {createCourseLoopModel} from '../model.mjs';
import {productionHost,fixtureForId,supportedCourseIds} from './binding.mjs';

const host=await productionHost();
const IDS=Array.from({length:30},(_,i)=>`nce1-${i*2+1}`),OLD=IDS.slice(0,18),NEW=IDS.slice(18);
const NOW=1791028800000,DAY=86400000;
assert.deepEqual(supportedCourseIds.slice(0,IDS.length),IDS,'production registry must retain the thirty authored groups in order');
const fixtures=Object.fromEntries(await Promise.all(IDS.map(async id=>[id,await fixtureForId(id)])));

function complete(id,start=NOW,{wrong=true}={}){
 const {content}=fixtures[id],model=host.courseLoopFor(id).model;
 let state=model.initialState(start),at=start,view;
 const send=action=>{const result=model.transition(state,action,++at);assert.ok(result.ok,`${id}: ${result.message}`);state=result.state;view=result.view;return result};
 const answerStage=stage=>{for(const [i,q] of content.questionsFor(stage).entries()){
  send({type:'draft',value:wrong&&stage==='independent'&&i===0?`My original answer for ${id} was wrong.`:q.accepted[0]});
  send({type:'submit'});send({type:'next'});
 }};
 answerStage('diagnostic');send({type:'next'});answerStage('guided');answerStage('independent');
 const correction=content.questionsFor('independent')[0],feedbackState=structuredClone(state);
 if(wrong)send({type:'correct',id:correction.id,answer:correction.accepted[0],note:`I checked the meaning and grammar for ${id}.`});
 send({type:'next'});answerStage('repair');
 send({type:'own-draft',value:`My own expression for ${id}; a human reviewer still needs to check it.`});send({type:'finish'});
 return {state,view,at,correction,feedbackState};
}
const completed=Object.fromEntries(IDS.map(id=>[id,complete(id)]));
const stateWith=entries=>({...structuredClone(host.initial),drafts:Object.fromEntries(entries.flatMap(([id,state])=>[
 [fixtures[id].keys.snapshot,JSON.stringify(state)],
 [fixtures[id].keys.inputs,JSON.stringify({version:1,corrections:{[completed[id].correction.id]:{answer:'An unsubmitted correction draft.',note:'Keep my pending reason.'}}})],
]))});
const completedEntries=ids=>ids.map(id=>[id,completed[id].state]);
const loopTasks=(state,map=host.emptyProgress(),at=NOW)=>host.todayPractice(state,map,at).filter(t=>t.id.startsWith('course-loop:'));
function rejectRaw(value,id,at=NOW+10000){const raw=JSON.stringify(value),before=structuredClone(value),result=host.parseCourseLoop(raw,at,id);assert.equal(result.ok,false,`${id}: forged record accepted`);assert.equal(result.raw,raw);assert.deepEqual(value,before)}

test('thirty real bindings preserve old defaults and distinct storage keys',()=>{
 assert.deepEqual(host.courseLoopBindings.slice(0,IDS.length).map(c=>c.id),IDS);
 assert.equal(new Set(host.courseLoopBindings.slice(0,IDS.length).flatMap(c=>[c.key,c.inputsKey])).size,60);
 assert.equal(host.courseLoopFor().id,'nce1-1');
 assert.equal(host.courseLoopKey,'nce-course-loop-v1:NCE1-1');assert.equal(host.courseLoopInputsKey,'nce-course-loop-inputs-v1:NCE1-1');
 for(const id of IDS){const b=host.courseLoopFor(id),number=Number(id.slice(5));assert.equal(b.key,`nce-course-loop-v1:NCE1-${number}`);assert.equal(b.inputsKey,`nce-course-loop-inputs-v1:NCE1-${number}`);assert.deepEqual(b.lesson.lessons,[number,number+1]);assert.equal(b.lesson.id,id)}
 const raw=JSON.stringify(completed['nce1-1'].state);assert.deepEqual(host.parseCourseLoop(raw,NOW+10000),host.parseCourseLoop(raw,NOW+10000,'nce1-1'));
 assert.deepEqual(host.parseLoopInputs(null),{version:1,corrections:{}});
 for(const id of ['nce1-85','nce1-2','nce1-013','NCE1-13','unknown','__proto__','constructor'])assert.throws(()=>host.courseLoopFor(id));
 assert.equal(host.nextCourse(host.initial,host.emptyProgress(),NOW).id,'first');
});

test('actual factory and registered model retain first answers and corrections for all thirty courses',()=>{
 for(const id of IDS){const {state,view,correction}=completed[id],content=fixtures[id].content;
  const raw=JSON.stringify(state),parsed=host.parseCourseLoop(raw,NOW+10000,id),direct=createCourseLoopModel(content).restore(raw,NOW+10000);
  assert.ok(parsed.ok);assert.ok(direct.ok);assert.deepEqual(parsed,direct);
  assert.equal(view.phase,'waiting');assert.equal(view.attempts.length,12);
  const original=view.attempts.find(a=>a.id===correction.id);assert.equal(original.answer,`My original answer for ${id} was wrong.`);assert.equal(original.correct,false);assert.equal(original.hinted,false);
  assert.equal(view.corrections[correction.id].answer,correction.accepted[0]);assert.match(view.corrections[correction.id].note,new RegExp(id));
  assert.deepEqual(parsed.view.attempts,view.attempts);assert.deepEqual(parsed.view.corrections,view.corrections);
  const receipt=createCourseLoopModel(content).receipt(view,NOW+10000);assert.equal(receipt.openExpression,'awaiting-human-review');assert.equal(receipt.listening,'not-tested');assert.equal(receipt.pronunciation,'not-tested');assert.equal(receipt.mastery,'not-assessed');assert.equal(receipt.band,null);
 }
});

test('every envelope and correction sidecar is accepted only by its exact course across 30 by 30 pairs',()=>{
 for(const sender of IDS){const raw=JSON.stringify(completed[sender].state),q=completed[sender].correction,inputs=JSON.stringify({version:1,corrections:{[q.id]:{answer:`Pending ${sender}`,note:'Keep this original note.'}}});
  for(const receiver of IDS){const result=host.parseCourseLoop(raw,NOW+10000,receiver);assert.equal(result.ok,sender===receiver,`${sender} envelope to ${receiver}`);
   if(sender===receiver)assert.deepEqual(host.parseLoopInputs(inputs,receiver),JSON.parse(inputs));
   else {assert.equal(result.raw,raw);assert.throws(()=>host.parseLoopInputs(inputs,receiver),`${sender} sidecar to ${receiver}`)}
  }
 }
});

test('foreign correction events reject in the valid feedback phase and retain the original answer',()=>{
 for(const receiver of IDS){const {feedbackState,correction}=completed[receiver],model=host.courseLoopFor(receiver).model,before=JSON.stringify(feedbackState),view=model.restore(before,NOW+10000).view;
  assert.equal(view.phase,'feedback');
  for(const sender of IDS){const q=completed[sender].correction,event={type:'correct',id:q.id,answer:q.accepted[0],note:'I checked this correction.',at:NOW+1000},raw=JSON.stringify({...feedbackState,events:[...feedbackState.events,event]}),result=host.parseCourseLoop(raw,NOW+10000,receiver);
   assert.equal(result.ok,sender===receiver,`${sender} correction event to ${receiver}`);
   if(sender===receiver){assert.equal(result.view.corrections[correction.id].answer,correction.accepted[0]);assert.equal(result.view.attempts.find(a=>a.id===correction.id).answer,`My original answer for ${receiver} was wrong.`)}
   else assert.equal(result.raw,raw);
  }
  assert.equal(JSON.stringify(feedbackState),before);
 }
});

test('future envelopes, unknown course or question IDs, forged event keys and unsafe sidecars reject without changing raw',()=>{
 for(const id of IDS){const state=completed[id].state,other=completed[IDS.find(x=>x!==id)].correction;
  for(const patch of [{version:2},{contentVersion:99},{kind:'future-course-loop'},{lessonId:'nce1-61'},{lessonId:'nce1-013'},{createdAt:NOW+20000},{unknown:'preserve me'}])rejectRaw({...state,...patch},id);
  for(const event of [{type:'draft',value:'forged extra',extra:true,at:NOW+200},{type:'help',id:other.id,at:NOW+200},{type:'future',at:NOW+200},{type:'correct',id:other.id,answer:'foreign',note:'preserve',at:NOW+200},{type:'correct',id:'independent-unknown',answer:'foreign',note:'preserve',at:NOW+200}])rejectRaw({...state,events:[...state.events,event]},id);
  // Even a valid first draft with an added field must fail the host's finite schema.
  rejectRaw({...host.courseLoopFor(id).model.initialState(NOW),events:[{type:'draft',value:'still mine',at:NOW+1,foreignId:other.id}]},id);
  rejectRaw({...host.courseLoopFor(id).model.initialState(NOW),events:[{type:'draft',value:'future',at:NOW+20000}]},id);
  for(const inputs of [{version:2,corrections:{}},{version:1,corrections:{'independent-unknown':{answer:'a',note:'n'}}},{version:1,corrections:{[completed[id].correction.id]:{answer:'a',note:'n',forged:true}}},{version:1,corrections:{},forged:true}])assert.throws(()=>host.parseLoopInputs(JSON.stringify(inputs),id));
 }
 const raw=JSON.stringify(completed['nce1-13'].state);for(const id of ['nce1-85','unknown','__proto__']){const parsed=host.parseCourseLoop(raw,NOW+10000,id);assert.equal(parsed.ok,false);assert.equal(parsed.raw,raw);assert.throws(()=>host.parseLoopInputs(null,id))}
});

test('thirty pending courses produce distinct Today tasks and oldest pending wins without mutation',()=>{
 const state=stateWith(IDS.map((id,i)=>[id,host.courseLoopFor(id).model.initialState(NOW-(i+1)*1000)])),map=host.emptyProgress(),before=JSON.stringify({state,map}),tasks=loopTasks(state,map);
 assert.equal(tasks.length,30);assert.equal(new Set(tasks.map(t=>t.id)).size,30);assert.equal(new Set(tasks.map(t=>t.href)).size,30);assert.ok(tasks.every(t=>t.kind==='resume'));assert.equal(tasks[0].id,'course-loop:nce1-59');assert.equal(host.nextCourse(state,map,NOW).id,'nce1-59');
 assert.equal(host.todayPractice(state,map,NOW).some(t=>t.kind==='course'&&tasks.some(x=>x.href===t.href)),false);assert.equal(JSON.stringify({state,map}),before);
});

test('thirty due courses produce distinct tasks ordered by earliest due, while any pending course wins',()=>{
 const dueEntries=IDS.map((id,i)=>[id,complete(id,NOW-(i+2)*DAY).state]),state=stateWith(dueEntries),map=host.emptyProgress(),before=JSON.stringify({state,map}),tasks=loopTasks(state,map);
 assert.equal(tasks.length,30);assert.equal(new Set(tasks.map(t=>t.href)).size,30);assert.ok(tasks.every(t=>t.kind==='review'));assert.equal(tasks[0].id,'course-loop:nce1-59');assert.equal(host.nextCourse(state,map,NOW).id,'nce1-59');
 assert.ok(tasks.every((t,i)=>!i||t.at>=tasks[i-1].at));assert.equal(JSON.stringify({state,map}),before);
 const pending=stateWith([...dueEntries.filter(([id])=>id!=='nce1-13'),['nce1-13',host.courseLoopFor('nce1-13').model.initialState(NOW-1000)]]),mixed=loopTasks(pending,map);
 assert.equal(mixed.length,30);assert.equal(mixed[0].id,'course-loop:nce1-13');assert.equal(mixed[0].kind,'resume');assert.equal(host.nextCourse(pending,map,NOW).id,'nce1-13');
});

test('shared continuation advances every odd course through 59 to existing 61 with access intent only',()=>{
 let map=host.emptyProgress();
 for(const [i,id] of IDS.entries()){map=host.startNode(host.unlockNode(map,id),id,NOW+1000);const state=stateWith(completedEntries(IDS.slice(0,i+1))),before=JSON.stringify({state,map}),want=IDS[i+1]||'nce1-61',d=host.courseDestination(state,map,NOW+1000),c=host.courseContinuation(state,map,id,NOW+1000);
  assert.equal(d.node.id,want);assert.equal(c.node.id,want);assert.equal(c.href,d.href);assert.equal(c.currentRoute,false);assert.match(d.href,new RegExp(`/map/#/learn/${want}`));assert.equal(d.needsAccess,true);assert.match(d.href,/\?access=1$/);
  const courses=host.todayPractice(state,map,NOW+1000).filter(t=>t.kind==='course');assert.equal(courses.length,1);assert.equal(courses[0].href,d.href);
  assert.equal(host.achieved(host.nodeById(id),map,NOW+1000),false);assert.equal(JSON.stringify({state,map}),before);
 }
});

test('advanced, reset and explicitly unlocked map routes retain their existing intentions',()=>{
 const state=stateWith(completedEntries(IDS)),advanced={...host.emptyProgress(),lastNode:'nce1-79',access:{all:true,nodes:[]}},before=JSON.stringify({state,advanced});
 assert.equal(host.nextCourse(state,advanced,NOW+1000).id,'nce1-79');assert.equal(JSON.stringify({state,advanced}),before);
 const resetState=stateWith(completedEntries(['nce1-1'])),reset={...host.unlockNode(host.emptyProgress(),'nce1-1'),lastNode:'nce1-3'},resetBefore=JSON.stringify({resetState,reset});
 const c=host.courseContinuation(resetState,reset,'nce1-1',NOW+1000);assert.equal(c.currentRoute,true);assert.equal(c.href,'/map/#/map/nce1-1?conditions=1');assert.equal(JSON.stringify({resetState,reset}),resetBefore);
 const unlocked=host.unlockNode(host.emptyProgress(),'nce1-35'),empty=structuredClone(host.initial),unlockedBefore=JSON.stringify({empty,unlocked});
 assert.equal(host.courseAccessHref('nce1-35',unlocked,NOW),'/map/#/learn/nce1-35');assert.equal(JSON.stringify({empty,unlocked}),unlockedBefore);
});

test('selected summaries stay isolated and malformed records remain blocked with original text intact',()=>{
 const state=stateWith(completedEntries(IDS)),map=host.emptyProgress(),before=JSON.stringify({state,map});
 for(const id of IDS){const summary=host.courseLoopSummary(state,map,NOW+1000,id);assert.equal(summary.status,'ready');assert.equal(summary.attempts,12);assert.equal(summary.corrections,1);assert.equal(summary.independent,3);assert.equal(summary.independentMatched,2);assert.equal(summary.reviewResults,0);assert.equal(summary.ownStatus,'awaiting-human-review');assert.equal(summary.mapLabel,'地图检验：尚未达标')}
 assert.equal(JSON.stringify({state,map}),before);assert.deepEqual(map.records,{});assert.equal(state.flashcards,undefined);
 for(const id of NEW){const raw=JSON.stringify({...completed[id].state,contentVersion:99}),blocked=structuredClone(state);blocked.drafts[fixtures[id].keys.snapshot]=raw;const blockedBefore=JSON.stringify(blocked);assert.equal(host.courseLoopSummary(blocked,map,NOW+1000,id).status,'blocked');assert.equal(host.nextCourse(blocked,map,NOW+1000).id,id);assert.equal(blocked.drafts[fixtures[id].keys.snapshot],raw);assert.equal(JSON.stringify(blocked),blockedBefore)}
});

test('actual progress backup and validator preserve all thirty records, sidecars and original classic history',async()=>{
 assert.equal(typeof host.makeProgressFile,'function');assert.equal(typeof host.readProgressFile,'function');assert.equal(typeof host.validateState,'function');
 const state={...stateWith(completedEntries(IDS)),lastLesson:7,completed:[1,3,7],scores:{1:60,3:80},cards:{legacy:{box:2,due:NOW+DAY}},days:['2026-10-01'],attempts:7,correct:5};
 state.drafts['classic-unrelated-draft']='Keep my old unrelated draft.';
 // Backup transports invalid/future nested course raw intact; the course owner
 // rejects it on use. File validation must never silently discard that raw.
 const future=JSON.stringify({...completed['nce1-59'].state,contentVersion:99});state.drafts[fixtures['nce1-59'].keys.snapshot]=future;
 const before=JSON.stringify(state);assert.equal(host.validateState(state),true);
 const file=host.makeProgressFile(state,new Date(NOW)),restored=await host.readProgressFile(file);assert.deepEqual(restored.state,state);assert.equal(restored.savedAt,new Date(NOW).toISOString());assert.equal(JSON.stringify(state),before);
 const capability={version:1,payload:'An opaque capability payload remains unchanged.'},v2=await host.readProgressFile(host.makeProgressFile(state,new Date(NOW),capability));assert.deepEqual(v2.state,state);assert.deepEqual(v2.capability,capability);
 for(const id of OLD)assert.equal(restored.state.drafts[fixtures[id].keys.snapshot],state.drafts[fixtures[id].keys.snapshot]);
 for(const id of IDS)assert.equal(restored.state.drafts[fixtures[id].keys.inputs],state.drafts[fixtures[id].keys.inputs]);
 const rejected=host.parseCourseLoop(restored.state.drafts[fixtures['nce1-59'].keys.snapshot],NOW+1000,'nce1-59');assert.equal(rejected.ok,false);assert.equal(rejected.raw,future);
 assert.deepEqual((await host.readProgressFile(new Blob([JSON.stringify(state)]))).state,state);
 const bad={...state,version:99};assert.equal(host.validateState(bad),false);assert.throws(()=>host.makeProgressFile(bad,new Date(NOW)));await assert.rejects(()=>host.readProgressFile(new Blob([JSON.stringify({format:'english-studio-progress',version:99,savedAt:new Date(NOW).toISOString(),state})])));
 assert.equal(JSON.stringify(state),before);
});


test('actual guarded successor covers mapped boundaries and preserves known or supplied fallback destinations',()=>{
 assert.equal(typeof host.courseSuccessorNode,'function');
 const fallback=host.nodeById('nce1-49');assert.ok(fallback);const before=JSON.stringify(fallback);
 for(const id of IDS){const want=`nce1-${Number(id.slice(5))+2}`,node=host.courseSuccessorNode(id,fallback);assert.ok(node,`${id} collapsed to undefined`);assert.strictEqual(node,host.nodeById(want));assert.notEqual(node.id,id);}
 for(const [id,want] of [['nce1-35','nce1-37'],['nce1-47','nce1-49'],['nce1-59','nce1-61']])assert.equal(host.courseSuccessorNode(id,fallback).id,want);
 const real85=host.nodeById('nce1-85');assert.ok(real85);assert.strictEqual(host.courseSuccessorNode('nce1-85',fallback),real85);
 for(const id of ['unknown','nce1-999','nce1-037','__proto__','constructor','toString',''])assert.strictEqual(host.courseSuccessorNode(id,fallback),fallback,`${id}: unknown ID must preserve supplied current route`);
 assert.equal(JSON.stringify(fallback),before);
});
