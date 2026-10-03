/** Production-only integration regressions. Explicit test timestamps exercise
 * scheduling boundaries; they are not learner saves or natural delayed proof. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {createCourseLoopModel} from '../model.mjs';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {productionHost,fixtureForId,supportedCourseIds} from './binding.mjs';

const host=await productionHost();
const OLD=Object.freeze(Array.from({length:54},(_,i)=>`nce1-${i*2+1}`));
const NEW=Object.freeze(['nce1-109','nce1-111','nce1-113','nce1-115','nce1-117','nce1-119','nce1-121','nce1-123','nce1-125','nce1-127','nce1-129','nce1-131']);
const IDS=Object.freeze([...OLD,...NEW]),UNREGISTERED=Object.freeze(['nce1-133','nce1-135','__test_unknown_course__']);
const expectedSuccessor=id=>`nce1-${Number(id.slice(5))+2}`;
const NOW=1791028800000,DAY=86400000;
assert.deepEqual(supportedCourseIds,IDS,'production registry must expose the sixty-six authored groups');
const fixtures=Object.fromEntries(await Promise.all(IDS.map(async id=>[id,await fixtureForId(id)])));

function complete(id,start=NOW,{wrong=true,video=false}={}){
 const {content}=fixtures[id],model=host.courseLoopFor(id).model;
 let state=model.initialState(start),at=start,view;
 const send=action=>{const result=model.transition(state,action,++at);assert.ok(result.ok,`${id}: ${result.message}`);state=result.state;view=result.view;return result};
 const answerStage=stage=>{for(const [i,q] of content.questionsFor(stage).entries()){
  if(video&&stage==='independent'&&i===0)send({type:'source',source:'video'});
  send({type:'draft',value:wrong&&stage==='independent'&&i===0?`My original answer for ${id} was wrong.`:q.accepted[0]});
  send({type:'submit'});send({type:'next'});
 }};
 answerStage('diagnostic');send({type:'next'});answerStage('guided');answerStage('independent');
 const correction=content.questionsFor('independent')[0],feedbackState=structuredClone(state);
 if(wrong||video)send({type:'correct',id:correction.id,answer:correction.accepted[0],note:`I checked the meaning and grammar for ${id}.`});
 send({type:'next'});answerStage('repair');
 send({type:'own-draft',value:`My own expression for ${id}; a human reviewer still needs to check it.`});send({type:'finish'});
 return {state,view,at,correction,feedbackState};
}
const completed=Object.fromEntries(IDS.map(id=>[id,complete(id)]));
const stateWith=entries=>({...structuredClone(host.initial),drafts:{'qa-ordinary-note':'Synthetic ordinary note must survive selector and backup unchanged.',...Object.fromEntries(entries.flatMap(([id,state])=>[
 [fixtures[id].keys.snapshot,JSON.stringify(state)],
 [fixtures[id].keys.inputs,JSON.stringify({version:1,corrections:{[completed[id].correction.id]:{answer:'An unsubmitted correction draft.',note:'Keep my pending reason.'}}})],
]))}});
const completedEntries=ids=>ids.map(id=>[id,completed[id].state]);
const loopTasks=(state,map=host.emptyProgress(),at=NOW)=>host.todayPractice(state,map,at).filter(t=>t.id.startsWith('course-loop:'));
function rejectRaw(value,id,at=NOW+10000){const raw=JSON.stringify(value),before=structuredClone(value),result=host.parseCourseLoop(raw,at,id);assert.equal(result.ok,false,`${id}: forged record accepted`);assert.equal(result.raw,raw);assert.deepEqual(value,before)}

test('sixty-six real bindings preserve old defaults and distinct storage keys',()=>{
 assert.deepEqual(host.courseLoopBindings.map(c=>c.id),IDS);
 assert.equal(new Set(host.courseLoopBindings.flatMap(c=>[c.key,c.inputsKey])).size,132);
 assert.equal(host.courseLoopFor().id,'nce1-1');
 assert.equal(host.courseLoopKey,'nce-course-loop-v1:NCE1-1');assert.equal(host.courseLoopInputsKey,'nce-course-loop-inputs-v1:NCE1-1');
 for(const id of IDS){const b=host.courseLoopFor(id),number=Number(id.slice(5));assert.equal(b.key,`nce-course-loop-v1:NCE1-${number}`);assert.equal(b.inputsKey,`nce-course-loop-inputs-v1:NCE1-${number}`);assert.deepEqual(b.lesson.lessons,[number,number+1]);assert.equal(b.lesson.id,id)}
 const raw=JSON.stringify(completed['nce1-1'].state);assert.deepEqual(host.parseCourseLoop(raw,NOW+10000),host.parseCourseLoop(raw,NOW+10000,'nce1-1'));
 assert.deepEqual(host.parseLoopInputs(null),{version:1,corrections:{}});
 for(const id of ['__test_unknown_course__','nce1-2','nce1-013','NCE1-13','unknown','__proto__','constructor'])assert.throws(()=>host.courseLoopFor(id));
 assert.equal(host.nextCourse(host.initial,host.emptyProgress(),NOW).id,'first');
});

test('actual factory and registered model retain first answers and corrections for all sixty-six courses',()=>{
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

test('every envelope and correction sidecar is accepted only by its exact course across 66 by 66 pairs',()=>{
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
  for(const patch of [{version:2},{contentVersion:99},{kind:'future-course-loop'},{lessonId:'__test_unknown_course__'},{lessonId:'nce1-013'},{createdAt:NOW+20000},{unknown:'preserve me'}])rejectRaw({...state,...patch},id);
  for(const event of [{type:'draft',value:'forged extra',extra:true,at:NOW+200},{type:'help',id:other.id,at:NOW+200},{type:'future',at:NOW+200},{type:'correct',id:other.id,answer:'foreign',note:'preserve',at:NOW+200},{type:'correct',id:'independent-unknown',answer:'foreign',note:'preserve',at:NOW+200}])rejectRaw({...state,events:[...state.events,event]},id);
  // Even a valid first draft with an added field must fail the host's finite schema.
  rejectRaw({...host.courseLoopFor(id).model.initialState(NOW),events:[{type:'draft',value:'still mine',at:NOW+1,foreignId:other.id}]},id);
  rejectRaw({...host.courseLoopFor(id).model.initialState(NOW),events:[{type:'draft',value:'future',at:NOW+20000}]},id);
  for(const inputs of [{version:2,corrections:{}},{version:1,corrections:{'independent-unknown':{answer:'a',note:'n'}}},{version:1,corrections:{[completed[id].correction.id]:{answer:'a',note:'n',forged:true}}},{version:1,corrections:{},forged:true}])assert.throws(()=>host.parseLoopInputs(JSON.stringify(inputs),id));
 }
 const raw=JSON.stringify(completed['nce1-13'].state);for(const id of ['__test_unknown_course__','unknown','__proto__']){const parsed=host.parseCourseLoop(raw,NOW+10000,id);assert.equal(parsed.ok,false);assert.equal(parsed.raw,raw);assert.throws(()=>host.parseLoopInputs(null,id))}
});

test('sixty-six pending courses produce distinct Today tasks and oldest pending wins without mutation',()=>{
 const state=stateWith(IDS.map((id,i)=>[id,host.courseLoopFor(id).model.initialState(NOW-(i+1)*1000)])),map=host.emptyProgress(),before=JSON.stringify({state,map}),tasks=loopTasks(state,map);
 assert.equal(tasks.length,66);assert.equal(new Set(tasks.map(t=>t.id)).size,66);assert.equal(new Set(tasks.map(t=>t.href)).size,66);assert.ok(tasks.every(t=>t.kind==='resume'));assert.equal(tasks[0].id,'course-loop:nce1-131');assert.equal(host.nextCourse(state,map,NOW).id,'nce1-131');
 assert.equal(host.todayPractice(state,map,NOW).some(t=>t.kind==='course'&&tasks.some(x=>x.href===t.href)),false);assert.equal(JSON.stringify({state,map}),before);
});

test('sixty-six due courses produce distinct tasks ordered by earliest due, while any pending course wins',()=>{
 const dueEntries=IDS.map((id,i)=>[id,complete(id,NOW-(i+2)*DAY).state]),state=stateWith(dueEntries),map=host.emptyProgress(),before=JSON.stringify({state,map}),tasks=loopTasks(state,map);
 assert.equal(tasks.length,66);assert.equal(new Set(tasks.map(t=>t.href)).size,66);assert.ok(tasks.every(t=>t.kind==='review'));assert.equal(tasks[0].id,'course-loop:nce1-131');assert.equal(host.nextCourse(state,map,NOW).id,'nce1-131');
 assert.ok(tasks.every((t,i)=>!i||t.at>=tasks[i-1].at));assert.equal(JSON.stringify({state,map}),before);
 const pending=stateWith([...dueEntries.filter(([id])=>id!=='nce1-13'),['nce1-13',host.courseLoopFor('nce1-13').model.initialState(NOW-1000)]]),mixed=loopTasks(pending,map);
 assert.equal(mixed.length,66);assert.equal(mixed[0].id,'course-loop:nce1-13');assert.equal(mixed[0].kind,'resume');assert.equal(host.nextCourse(pending,map,NOW).id,'nce1-13');
});

test('all registered courses advance independently by n+2 through the existing 133 textbook node',()=>{
 let map=host.emptyProgress();
 for(const [i,id] of IDS.entries()){
  map=host.startNode(host.unlockNode(map,id),id,NOW+1000);
  const state=stateWith(completedEntries(IDS.slice(0,i+1))),before=JSON.stringify({state,map}),want=expectedSuccessor(id),d=host.courseDestination(state,map,NOW+1000),c=host.courseContinuation(state,map,id,NOW+1000);
  assert.ok(host.nodeById(want),`${id}: independently expected destination must exist`);assert.equal(d.node.id,want);assert.equal(c.node.id,want);
  assert.equal(c.currentRoute,false);assert.equal(c.href,d.href);assert.equal(d.needsAccess,true);assert.match(d.href,/\?access=1$/);
  const tasks=host.todayPractice(state,map,NOW+1000),courses=tasks.filter(t=>t.kind==='course'&&t.id.startsWith('course:nce1-'));assert.equal(courses.length,1);assert.equal(courses[0].href,d.href);
  // Placement is an existing independent entry in this protected baseline.
  assert.ok(tasks.some(t=>t.id==='placement:offer'&&t.href==='/#/placement'));
  assert.equal(host.achieved(host.nodeById(id),map,NOW+1000),false);assert.equal(JSON.stringify({state,map}),before);
 }
});

test('advanced, reset and explicitly unlocked map routes retain their existing intentions',()=>{
 const state=stateWith(completedEntries(IDS)),advanced={...host.emptyProgress(),lastNode:'nce1-139',access:{all:true,nodes:[]}},before=JSON.stringify({state,advanced});
 assert.equal(host.nextCourse(state,advanced,NOW+1000).id,'nce1-139');assert.equal(JSON.stringify({state,advanced}),before);
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

test('actual progress backup and validator preserve all sixty-six records, sidecars and original classic history',async()=>{
 assert.equal(typeof host.makeProgressFile,'function');assert.equal(typeof host.readProgressFile,'function');assert.equal(typeof host.validateState,'function');
 const state={...stateWith(completedEntries(IDS)),lastLesson:7,completed:[1,3,7],scores:{1:60,3:80},cards:{legacy:{box:2,due:NOW+DAY}},days:['2026-10-01'],attempts:7,correct:5};
 state.drafts['classic-unrelated-draft']='Keep my old unrelated draft.';
 // Backup transports invalid/future nested course raw intact; the course owner
 // rejects it on use. File validation must never silently discard that raw.
 const future=JSON.stringify({...completed['nce1-131'].state,contentVersion:99});state.drafts[fixtures['nce1-131'].keys.snapshot]=future;
 const before=JSON.stringify(state);assert.equal(host.validateState(state),true);
 const file=host.makeProgressFile(state,new Date(NOW)),restored=await host.readProgressFile(file);assert.deepEqual(restored.state,state);assert.equal(restored.savedAt,new Date(NOW).toISOString());assert.equal(JSON.stringify(state),before);
 const capability={version:1,payload:'An opaque capability payload remains unchanged.'},v2=await host.readProgressFile(host.makeProgressFile(state,new Date(NOW),capability));assert.deepEqual(v2.state,state);assert.deepEqual(v2.capability,capability);
 for(const id of OLD)assert.equal(restored.state.drafts[fixtures[id].keys.snapshot],state.drafts[fixtures[id].keys.snapshot]);
 for(const id of IDS)assert.equal(restored.state.drafts[fixtures[id].keys.inputs],state.drafts[fixtures[id].keys.inputs]);
 const rejected=host.parseCourseLoop(restored.state.drafts[fixtures['nce1-131'].keys.snapshot],NOW+1000,'nce1-131');assert.equal(rejected.ok,false);assert.equal(rejected.raw,future);
 assert.deepEqual((await host.readProgressFile(new Blob([JSON.stringify(state)]))).state,state);
 const bad={...state,version:99};assert.equal(host.validateState(bad),false);assert.throws(()=>host.makeProgressFile(bad,new Date(NOW)));await assert.rejects(()=>host.readProgressFile(new Blob([JSON.stringify({format:'english-studio-progress',version:99,savedAt:new Date(NOW).toISOString(),state})])));
 assert.equal(JSON.stringify(state),before);
});


test('actual successor guards the continuous chain and existing 133 route with unknown safe fallback',()=>{
 assert.equal(typeof host.courseSuccessorNode,'function');const fallback=host.nodeById('nce1-49');assert.ok(fallback);const before=JSON.stringify(fallback);
 for(const id of IDS){const want=expectedSuccessor(id),node=host.courseSuccessorNode(id,fallback);assert.ok(node,`${id}: undefined destination`);assert.ok(host.nodeById(want));assert.strictEqual(node,host.nodeById(want));assert.equal(UNREGISTERED.includes(node.id),id==='nce1-131');}
 for(const id of ['nce1-107',...NEW]){const want=`nce1-${Number(id.slice(5))+2}`;assert.equal(host.courseSuccessorNode(id,fallback).id,want);assert.ok(host.nodeById(want));}
 const real133=host.nodeById('nce1-133');assert.ok(real133);assert.strictEqual(host.courseSuccessorNode('nce1-133',fallback),real133);
 for(const id of ['__test_unknown_course__','unknown','nce1-999','nce1-037','__proto__','constructor','toString',''])assert.strictEqual(host.courseSuccessorNode(id,fallback),fallback);
 assert.equal(JSON.stringify(fallback),before);
});

test('133, 135 and stable unknown have no registered course-loop model, keys, sidecars or envelopes',async()=>{
 for(const id of UNREGISTERED){assert.equal(supportedCourseIds.includes(id),false);assert.equal(host.courseLoopBindings.some(b=>b.id===id),false);assert.throws(()=>host.courseLoopFor(id));await assert.rejects(()=>fixtureForId(id));assert.throws(()=>host.parseLoopInputs(null,id));
  const raw=JSON.stringify({...completed['nce1-85'].state,lessonId:id}),parsed=host.parseCourseLoop(raw,NOW+1000,id);assert.equal(parsed.ok,false);assert.equal(parsed.raw,raw);
  for(const registered of IDS){const next=host.courseSuccessorNode(registered,host.nodeById(registered));if(id==='nce1-133')assert.equal(next.id===id,registered==='nce1-131');else assert.notEqual(next.id,id);}
 }
});

test('factory is the current video-capable production file and SourceKind includes video',async()=>{
 const bytes=await readFile(new URL('../model.mjs',import.meta.url)),sha=createHash('sha256').update(bytes).digest('hex');assert.equal(sha,'4b3a67cf22c23f2d263af523ac6e314c37714f4b03784efbd935d695571daa57');
 const contract=await readFile(new URL('../host-contract.d.ts',import.meta.url),'utf8');assert.match(contract,/export type SourceKind[^;]*'video'/);
 console.log('Current production factory SHA256: '+sha);
});

test('video source events before answers persist assistance and after answers preserve the unassisted original',async()=>{
 const videoSnapshots=[];
 for(const id of IDS){const model=host.courseLoopFor(id).model,content=fixtures[id].content,q=content.questionsFor('diagnostic')[0];
  let state=model.initialState(NOW),at=NOW;const send=action=>{const r=model.transition(state,action,++at);assert.ok(r.ok,r.message);state=r.state;return r.view};
  send({type:'draft',value:'Synthetic QA pending original draft'});let v=send({type:'source',source:'video'});assert.equal(v.draft,'Synthetic QA pending original draft');assert.equal(v.hinted,true);assert.equal(v.learning.at(-1).id,`${id}:video`);
  send({type:'draft',value:q.accepted[0]});v=send({type:'submit'});assert.equal(v.attempts[0].hinted,true);assert.equal(v.attempts[0].answer,q.accepted[0]);assert.equal(v.attempts[0].correct,true);
  const raw=JSON.stringify(state),parsed=host.parseCourseLoop(raw,at,id);assert.ok(parsed.ok);assert.deepEqual(parsed.view,v);assert.equal(model.receipt(v,at).listening,'not-tested');assert.equal(model.receipt(v,at).mastery,'not-assessed');videoSnapshots.push([id,state]);
  state=model.initialState(NOW);at=NOW;send({type:'draft',value:q.accepted[0]});v=send({type:'submit'});const original=structuredClone(v.attempts);v=send({type:'source',source:'video'});assert.deepEqual(v.attempts,original);assert.equal(v.attempts[0].hinted,false);assert.equal(v.learning.at(-1).id,`${id}:video`);v=send({type:'next'});assert.equal(v.hinted,false);
  for(const invalid of ['Video','videos','youtube','',null]){const r=model.transition(state,{type:'source',source:invalid},++at);assert.equal(r.ok,false);assert.deepEqual(r.state,state);}
  const forged=JSON.stringify({...model.initialState(NOW),events:[{type:'source',source:'video',courseId:id,at:NOW+1}]});const r=host.parseCourseLoop(forged,NOW+1000,id);assert.equal(r.ok,false);assert.equal(r.raw,forged);
 }
 const state=stateWith(videoSnapshots),before=JSON.stringify(state),restored=await host.readProgressFile(host.makeProgressFile(state,new Date(NOW+1000)));assert.deepEqual(restored.state,state);assert.equal(JSON.stringify(state),before);
 for(const [id] of videoSnapshots){const r=host.parseCourseLoop(restored.state.drafts[fixtures[id].keys.snapshot],NOW+1000,id);assert.ok(r.ok);assert.equal(r.view.attempts[0].hinted,true);assert.equal(r.view.learning.at(-1).id,`${id}:video`);}
});

test('video-assisted independent correct originals still require correction and retain scoped help through repair and backup',async()=>{
 const records=[];
 for(const id of IDS){const c=complete(id,NOW,{wrong:false,video:true}),model=host.courseLoopFor(id).model,q=c.correction,feedback=model.inspect(c.feedbackState,NOW+1000).view;
  assert.equal(feedback.phase,'feedback');const original=feedback.attempts.find(a=>a.id===q.id);assert.equal(original.correct,true);assert.equal(original.hinted,true);assert.equal(original.answer,q.accepted[0]);
  const blocked=model.transition(c.feedbackState,{type:'next'},NOW+1000);assert.equal(blocked.ok,false);assert.deepEqual(blocked.state,c.feedbackState);
  assert.deepEqual(c.view.attempts.find(a=>a.id===q.id),original);assert.equal(c.view.corrections[q.id].answer,q.accepted[0]);assert.ok(c.view.learning.some(e=>e.id===`${id}:video`));
  const remaining=c.view.attempts.filter(a=>a.stage==='independent'&&a.id!==q.id);assert.ok(remaining.every(a=>!a.hinted&&a.correct&&a.fresh));assert.equal(model.receipt(c.view,NOW+1000).independent.find(a=>a.id===q.id).assisted,true);records.push([id,c.state]);
 }
 const state=stateWith(records),before=JSON.stringify(state),restored=await host.readProgressFile(host.makeProgressFile(state,new Date(NOW+1000)));assert.deepEqual(restored.state,state);
 for(const [id] of records){const r=host.parseCourseLoop(restored.state.drafts[fixtures[id].keys.snapshot],NOW+1000,id);assert.ok(r.ok);assert.equal(r.view.attempts.find(a=>a.stage==='independent').hinted,true);assert.ok(r.view.learning.some(e=>e.id===`${id}:video`));assert.equal(host.courseLoopSummary(restored.state,host.emptyProgress(),NOW+1000,id).mapLabel,'地图检验：尚未达标');}
 assert.equal(JSON.stringify(state),before);assert.equal(state.flashcards,undefined);
});

// These are lexical-cued construction and contextual semantic-selection tasks.
// Engine freshness/independence flags do not establish spontaneous transfer.
test('all twelve new courses preserve constrained accepted forms and semantic negatives through actual factory replay',()=>{
 let questions=0,accepted=0,negatives=0,punctuation=0,width=0;
 for(const id of NEW){const content=fixtures[id].content,model=host.courseLoopFor(id).model,factory=createCourseLoopModel(content);
  let state=model.initialState(NOW),at=NOW,view=model.inspect(state,at).view;
  const send=action=>{const r=model.transition(state,action,++at);assert.ok(r.ok,`${id}: ${r.message}`);state=r.state;view=r.view;};
  const checkBank=stage=>{
   assert.equal(view.phase,stage);
   for(const [index,q] of content.questionsFor(stage).entries()){
    assert.equal(view.index,index);assert.ok(q.accepted.length);assert.ok(q.counterexamples.length>=3);questions++;
    const before=JSON.stringify(state),cases=[...q.accepted.map(answer=>({answer,want:true})),...q.counterexamples.map(({answer})=>({answer,want:false}))];
    const first=q.accepted[0];
    if(q.form==='question')cases.push({answer:first+'?',want:false,punctuation:true});
    else {assert.ok(['statement','imperative'].includes(q.form),`${q.id}: new form requires an explicit test boundary`);cases.push({answer:first.replace(/[.!。！]$/,'')+'?',want:false,punctuation:true});}
    cases.push({answer:first.replace(/[A-Za-z]/,char=>String.fromCharCode(char.charCodeAt(0)+0xfee0)),want:false,width:true});
    for(const {answer,want,punctuation:punct,width:wide} of cases){
     const draft=model.transition(state,{type:'draft',value:answer},at+1);assert.ok(draft.ok,`${q.id}: draft rejected`);
     const result=model.transition(draft.state,{type:'submit'},at+2);assert.ok(result.ok,`${q.id}: submit rejected`);
     const original=result.view.attempts.at(-1);assert.equal(original.id,q.id);assert.equal(original.answer,answer);assert.equal(original.correct,want,`${q.id}: ${answer}`);assert.equal(original.hinted,stage==='guided');
     const raw=JSON.stringify(result.state),parsed=host.parseCourseLoop(raw,at+2,id),direct=factory.restore(raw,at+2);assert.ok(parsed.ok);assert.deepEqual(parsed,direct);assert.deepEqual(parsed.view.attempts.at(-1),original);
     const overwrite=model.transition(result.state,{type:'draft',value:q.accepted[0]},at+3);assert.equal(overwrite.ok,false);assert.deepEqual(overwrite.state,result.state);
     if(wide)width++;else if(punct)punctuation++;else if(want)accepted++;else negatives++;
    }
    assert.equal(JSON.stringify(state),before);send({type:'draft',value:first});send({type:'submit'});send({type:'next'});
   }
  };
  checkBank('diagnostic');send({type:'next'});checkBank('guided');checkBank('independent');send({type:'next'});checkBank('repair');
  send({type:'own-draft',value:'Synthetic constrained-response QA; open expression awaits human review.'});send({type:'finish'});
  for(const stage of ['review-a','review-b']){at=view.dueAt;send({type:'review'});checkBank(stage);send({type:'next'});}
  assert.equal(view.ownFinal.status,'awaiting-human-review');assert.equal(model.receipt(view,at).mastery,'not-assessed');
 }
 assert.equal(questions,12*18);assert.ok(negatives>=12*18*3);assert.equal(punctuation,questions);assert.equal(width,questions);
 console.log('New-course constrained matcher replay: '+JSON.stringify({courses:NEW.length,questions,accepted,semanticNegatives:negatives,punctuationNegatives:punctuation,widthNegatives:width,spontaneousTransfer:'not-assessed'}));
});
