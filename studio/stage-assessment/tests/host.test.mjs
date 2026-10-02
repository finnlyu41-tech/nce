import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTs} from './load-ts.mjs';
const {emptyRecord,append,project,interval,DAY,draftKey}=loadTs(new URL('../model.ts',import.meta.url).pathname);
const {stageTodayTasks,createStageAdapter}=loadTs(new URL('../adapter.ts',import.meta.url).pathname);
const {prepareStageBackupRestore}=loadTs(new URL('../host-progress.ts',import.meta.url).pathname);
const {initial}=loadTs(new URL('../../app/model.ts',import.meta.url).pathname);
const {makeProgressFile,readProgressFile}=loadTs(new URL('../../app/progress-file.ts',import.meta.url).pathname);
function evidence(){
 let r=emptyRecord('synthetic-fixture',true),at=1_700_000_000_000,n=0;
 const send=command=>{r=append(r,{id:'fixture-'+(++n),at:++at,command},at);};
 send({type:'learning',skills:['reading'],kind:'complete',note:'synthetic'});send({type:'open',skill:'reading',phase:'T1',unseen:true});const id=project(r).attempts.at(-1).id;send({type:'draft',id,answers:['原答','','','','','']});send({type:'submit',id});send({type:'review',id,review:{reviewer:{role:'teacher',qualified:true,calibrated:true,external:true,basis:'pure model synthetic'},targetElicited:true,disputed:false,secondReview:false,basis:'fixture only',judgments:Array(6).fill('correct'),criticalReversed:false}});
 return {r,raw:JSON.stringify(r),now:at+DAY};
}
test('normal whole progress-file backup roundtrip preserves exact stage raw, all original due and other drafts',async()=>{
 const e=evidence(),state={...structuredClone(initial),drafts:{other:'do not modify',[draftKey]:e.raw},scores:{other:7}};
 const file=makeProgressFile(state),parsed=await readProgressFile(file),restored=prepareStageBackupRestore(state,parsed.state,e.now);
 assert.deepEqual(restored,state);assert.equal(restored.drafts[draftKey],e.raw);assert.deepEqual(interval(project(JSON.parse(restored.drafts[draftKey])),'reading','T2',e.now),interval(project(e.r),'reading','T2',e.now));
});
test('new-location restore adds provenance only: same originals, draft, deadline, anchor/due; natural qualification pending',()=>{
 const e=evidence(),incoming={...structuredClone(initial),drafts:{[draftKey]:e.raw}},restored=prepareStageBackupRestore(initial,incoming,e.now),r=JSON.parse(restored.drafts[draftKey]);
 assert.deepEqual(r.events.slice(0,-1),e.r.events);assert.equal(r.events.at(-1).command.type,'restore');const before=project(e.r),after=project(r);assert.deepEqual(after.attempts,before.attempts);assert.deepEqual(after.learning,before.learning);assert.equal(after.priorLearning,before.priorLearning);
 const a=interval(before,'reading','T2',e.now),b=interval(after,'reading','T2',e.now);assert.equal(b.anchor,a.anchor);assert.equal(b.dueAt,a.dueAt);assert.equal(b.ready,false);assert.equal(b.verification,'restored-time-unverified');
});
test('missing or earlier backup preserves current stage, divergent history refuses, future raw separately blocked',()=>{
 const e=evidence(),current={...structuredClone(initial),drafts:{[draftKey]:e.raw}};
 assert.equal(prepareStageBackupRestore(current,initial,e.now).drafts[draftKey],e.raw);
 const earlier={...e.r,events:e.r.events.slice(0,-1)};assert.equal(prepareStageBackupRestore(current,{...initial,drafts:{[draftKey]:JSON.stringify(earlier)}},e.now).drafts[draftKey],e.raw);
 const changed=structuredClone(e.r);changed.events[0].command.note='divergent';assert.throws(()=>prepareStageBackupRestore(current,{...initial,drafts:{[draftKey]:JSON.stringify(changed)}},e.now),/分叉/);
 changed.events[0].at=e.now+DAY;assert.throws(()=>prepareStageBackupRestore(initial,{...initial,drafts:{[draftKey]:JSON.stringify(changed)}},e.now),/未来/);
});
test('production adapter refuses external grades and delivery even with every frontend qualification bool set',async()=>{
 let state=structuredClone(initial);const adapter=createStageAdapter({courseVersion:'test',read:()=>state,commit:async(_,raw)=>{state={...state,drafts:{[draftKey]:raw}};return true;}});
 assert.equal(adapter.examiner.available,false);const before=JSON.stringify(state);
 await assert.rejects(adapter.examiner.recordReview('id',{reviewer:{external:true,qualified:true,calibrated:true,role:'teacher',basis:'checkbox'}}),/前端布尔/);
 await assert.rejects(adapter.examiner.recordDelivery('id',{mode:'live-reader',heard:true,humanChecked:true,singlePresentation:true,note:'checkbox'}),/前端布尔/);assert.equal(JSON.stringify(state),before);
});

test('shared then StageHost restore preparation is idempotent and corrupt Today offers honest inspection',()=>{
 const e=evidence(),incoming={...structuredClone(initial),drafts:{[draftKey]:e.raw}};
 const prepared=prepareStageBackupRestore(initial,incoming,e.now);
 assert.deepEqual(prepareStageBackupRestore(initial,prepared,e.now),prepared);
 const tasks=stageTodayTasks({...initial,drafts:{[draftKey]:'corrupt'}},e.now,'/#/stage-assessment','/#/today');
 assert.equal(tasks.length,1);assert.equal(tasks[0].kind,'resume');assert.match(tasks[0].evidence,/不当作自然到期/);
});

test('equal raw cannot bypass future, unknown schema, or unknown field validation during a whole-site restore',()=>{
 const e=evidence();
 for(const [name,change] of [
  ['future',r=>{r.events.at(-1).at=e.now+DAY;}],
  ['schema',r=>{r.version=99;}],
  ['unknown',r=>{r.unsupported=true;}]
 ]){
  const r=structuredClone(e.r);change(r);const raw=JSON.stringify(r);
  const current={...structuredClone(initial),drafts:{other:'keep',[draftKey]:raw}};
  const before=JSON.stringify(current);
  assert.throws(()=>prepareStageBackupRestore(current,{...current,scores:{replace:1}},e.now),undefined,name);
  assert.equal(JSON.stringify(current),before);
 }
});
