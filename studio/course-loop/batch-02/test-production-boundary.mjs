/** Compiles the actual integrated host. No parser, registry or reducer substitution. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {productionHost,fixtureForId,supportedCourseIds} from '../batch-01/production-test-binding.mjs';
const host=await productionHost(),NOW=1791028800000;
const fixtures=Object.fromEntries(await Promise.all(supportedCourseIds.map(async id=>[id,await fixtureForId(id)])));
test('production registry explicitly binds six groups with twelve unique keys, preserving the three existing pairs',()=>{
 assert.deepEqual(host.courseLoopBindings.map(c=>c.id),['nce1-1','nce1-3','nce1-5','nce1-7','nce1-9','nce1-11']);
 assert.equal(new Set(host.courseLoopBindings.flatMap(c=>[c.key,c.inputsKey])).size,12);
 for(const id of supportedCourseIds){const b=host.courseLoopFor(id);assert.equal(b.key,`nce-course-loop-v1:NCE1-${id.split('-')[1]}`);assert.equal(b.inputsKey,`nce-course-loop-inputs-v1:NCE1-${id.split('-')[1]}`);assert.equal(b.lesson.id,id)}
 for(const id of ['nce1-13','NCE1-7','nce1-07','__proto__'])assert.throws(()=>host.courseLoopFor(id));
});
test('real host accepts only the selected course envelope and correction sidecar across all six courses',()=>{
 for(const sender of supportedCourseIds){const f=fixtures[sender],raw=JSON.stringify(f.model.initialState(NOW)),q=f.content.questionsFor('independent')[0],inputs=JSON.stringify({version:1,corrections:{[q.id]:{answer:'pending original',note:'pending note'}}});
  for(const receiver of [...supportedCourseIds,'nce1-13']){const result=host.parseCourseLoop(raw,NOW,receiver);assert.equal(result.ok,receiver===sender);if(!result.ok)assert.equal(result.raw,raw);if(receiver===sender)assert.deepEqual(host.parseLoopInputs(inputs,receiver),JSON.parse(inputs));else assert.throws(()=>host.parseLoopInputs(inputs,receiver))}
 }
});
test('old default parser and keys, initial recommendation and original state remain compatible',()=>{
 const before=JSON.stringify(host.initial);assert.equal(host.courseLoopKey,'nce-course-loop-v1:NCE1-1');assert.equal(host.courseLoopInputsKey,'nce-course-loop-inputs-v1:NCE1-1');const raw=JSON.stringify(host.courseLoopFor().model.initialState(NOW));assert.ok(host.parseCourseLoop(raw,NOW).ok);assert.equal(host.nextCourse(host.initial,host.emptyProgress(),NOW).id,'first');assert.equal(JSON.stringify(host.initial),before);
});
test('unknown correction IDs and current-course foreign events retain raw rather than silently resetting',()=>{
 for(const id of supportedCourseIds){const f=fixtures[id];let state=f.model.initialState(NOW),at=NOW;const send=action=>{const r=f.model.transition(state,action,++at);assert.ok(r.ok,r.message);state=r.state};
  for(const stage of ['diagnostic','guided','independent']){if(stage==='guided')send({type:'next'});for(const [i,q] of f.content.questionsFor(stage).entries()){send({type:'draft',value:stage==='independent'&&i===0?'original wrong':q.accepted[0]});send({type:'submit'});send({type:'next'})}}
  const other=fixtures[supportedCourseIds.find(x=>x!==id)].content.questionsFor('independent')[0];
  for(const questionId of [other.id,'independent-unknown']){const raw=JSON.stringify({...state,events:[...state.events,{type:'correct',id:questionId,answer:'pending',note:'reason',at:++at}]});const parsed=host.parseCourseLoop(raw,at,id);assert.equal(parsed.ok,false);assert.equal(parsed.raw,raw);assert.throws(()=>host.parseLoopInputs(JSON.stringify({version:1,corrections:{[questionId]:{answer:'pending',note:'reason'}}}),id))}
 }
});
test('six simultaneous pending courses have one task each and the oldest pending beats any due course',()=>{
 const state={...structuredClone(host.initial),drafts:{}};
 for(const [i,id] of supportedCourseIds.entries())state.drafts[fixtures[id].keys.snapshot]=JSON.stringify(fixtures[id].model.initialState(NOW-(i+1)*1000));
 const map=host.emptyProgress(),before=JSON.stringify({state,map}),tasks=host.todayPractice(state,map,NOW).filter(t=>t.id.startsWith('course-loop:'));
 assert.equal(tasks.length,6);assert.equal(new Set(tasks.map(t=>t.href)).size,6);assert.equal(tasks[0].id,'course-loop:nce1-11');assert.equal(host.nextCourse(state,map,NOW).id,'nce1-11');assert.equal(host.todayPractice(state,map,NOW).some(t=>t.kind==='course'&&t.href===tasks[0].href),false);assert.equal(JSON.stringify({state,map}),before);
});
