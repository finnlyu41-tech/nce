import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTs} from '../../tests/load-ts.mjs';
const get=file=>loadTs(new URL(file,import.meta.url).pathname);
const {createStageModel,DAY}=get('../../model.ts');
const {firstStageDefinition}=get('../../protocol.ts');
const {nextStageDefinition:def}=get('../definition.ts');
const {createStageAdapter,stateWithStageDraft,hasPriorLearning,registeredStageTodayTasks}=get('../../adapter.ts');
const {prepareStageBackupRestore}=get('../../host-progress.ts');
const {initial}=get('../../../app/model.ts');
const {makeProgressFile,readProgressFile}=get('../../../app/progress-file.ts');
const {parseStageRoute,stageHashForTarget}=get('../../route.ts');
const {WorkspaceController}=get('../workspace-controller.ts');
const {encodeWorkspaceNote,workspaceDraft}=get('../workspace-notes.ts');
const {nextForms}=get('../learner-pack.ts');
const M=createStageModel(def),F=createStageModel(firstStageDefinition),T=1_700_000_000_000;
// All dates, identities and external reviews here are synthetic unit fixtures.
function fixture(model=M){let record=model.emptyRecord('synthetic-r13',true),at=T,n=0;return {get record(){return record},get at(){return at},send(command){record=model.append(record,{id:'unit-'+(++n),at:++at,command},at);return model.project(record);}};}
function evidence(model=M){const f=fixture(model);f.send({type:'learning',skills:['reading'],kind:'complete',note:'synthetic only'});let view=f.send({type:'open',skill:'reading',phase:'T1',unseen:true});const id=view.attempts.at(-1).id;f.send({type:'draft',id,answers:['synthetic original','','','','','']});f.send({type:'submit',id});f.send({type:'review',id,review:{reviewer:{role:'teacher',qualified:true,calibrated:true,external:true,basis:'synthetic only'},targetElicited:true,disputed:false,secondReview:false,basis:'unit fixture; no human validation',judgments:Array(6).fill('correct'),criticalReversed:false}});return {record:f.record,raw:JSON.stringify(f.record),now:f.at+DAY};}
function host(){let state=structuredClone(initial),fail=false;const adapter=createStageAdapter({courseVersion:'synthetic-r13',read:()=>state,commit:async(expected,next)=>{if(fail)return false;state=stateWithStageDraft(state,expected,next,def);return true;}},def);return {adapter,get state(){return state},set state(v){state=v},fail(v){fail=v}};}
const blank=slot=>({version:1,slot,answers:[''],note:''});
function controller(h,slot='writing'){return new WorkspaceController(h.adapter,blank(slot),()=>{},()=>{});}

test('registered route, metadata and prior-learning are isolated from the first stage',()=>{
 assert.equal(M.readRecord(JSON.stringify(F.emptyRecord('old',false)),T).status,'blocked');assert.equal(F.readRecord(JSON.stringify(M.emptyRecord('new',false)),T).status,'blocked');
 assert.equal(stageHashForTarget(def.target),'#/stage-assessment?task=stage-nce1-7-12');assert.equal(parseStageRoute(stageHashForTarget(def.target)).task,def.target);assert.equal(stageHashForTarget('unknown'),null);assert.equal(parseStageRoute('#/stage-assessment?task=unknown'),null);
 const prior={...initial,nce:{'NCE1-1':{steps:['listen']}}};assert.equal(hasPriorLearning(prior,def),false);assert.equal(hasPriorLearning({...initial,nce:{'NCE1-7':{steps:['listen']}}},def),true);
});
test('all six new forms have distinct factual contexts and four actual skill tasks',()=>{
 assert.equal(Object.keys(nextForms).length,6);assert.equal(new Set(Object.values(nextForms).map(f=>f.reading.passages.join(' '))).size,6);
 for(const f of Object.values(nextForms)){assert.equal(f.listening.length,6);assert.equal(f.reading.questions.length,6);assert.equal(f.reading.passages.length,2);assert.deepEqual(f.reading.critical,[0,1,3,5]);assert.match(f.speaking,/职业未知/);assert.match(f.writing,/4–5句自然英文/);}
});
test('reading names and ownership facts are not reused as the speaking or writing scenario',()=>{
 for(const f of Object.values(nextForms)){const names=[...f.reading.passages.join(' ').matchAll(/([A-Z][a-z]+)'s/g)].map(m=>m[1]);for(const name of names){assert.equal(f.speaking.includes(name),false);assert.equal(f.writing.includes(name),false);}}
});
test('new stage uses original 3/4/4/7 minute timers and preserves first answers on correction',()=>{
 for(const [skill,minutes] of [['listening',3],['reading',4],['speaking',4],['writing',7]]){
  const f=fixture();f.send({type:'learning',skills:[skill],kind:'complete',note:'synthetic'});let v=f.send({type:'open',skill,phase:'T1',unseen:true});const a=v.attempts.at(-1),answers=Array(['reading','listening'].includes(skill)?6:1).fill('first');assert.equal(a.deadline-a.openedAt,minutes*60_000);
  f.send({type:'draft',id:a.id,answers});v=f.send({type:'submit',id:a.id});const first=[...v.attempts.at(-1).first];v=f.send({type:'revise',id:a.id,answers:answers.map(()=> 'correction'),note:'reason'});assert.deepEqual(v.attempts.at(-1).first,first);assert.equal(v.attempts.at(-1).deadline,a.deadline);
  assert.ok(['pending','invalid'].includes(M.result(v.attempts.at(-1)).status));
 }
});
test('whole ProgressSave file roundtrip preserves both raw records and exact due',async()=>{
 const a=evidence(F),b=evidence(M),state={...structuredClone(initial),drafts:{keep:'synthetic',[firstStageDefinition.draftKey]:a.raw,[def.draftKey]:b.raw}};
 const parsed=await readProgressFile(makeProgressFile(state)),restored=prepareStageBackupRestore(state,parsed.state,b.now);assert.deepEqual(restored,state);
 for(const [d,m,e] of [[firstStageDefinition,F,a],[def,M,b]]){assert.equal(restored.drafts[d.draftKey],e.raw);assert.deepEqual(m.interval(m.project(JSON.parse(restored.drafts[d.draftKey])),'reading','T2',b.now),m.interval(m.project(e.record),'reading','T2',b.now));}
});
test('new-source provenance preserves originals and due; missing and earlier records retain live stage',()=>{
 const a=evidence(F),b=evidence(M),current={...initial,drafts:{[firstStageDefinition.draftKey]:a.raw,[def.draftKey]:b.raw}},incoming={...initial,drafts:{[def.draftKey]:b.raw}};
 assert.equal(prepareStageBackupRestore(current,initial,b.now).drafts[def.draftKey],b.raw);assert.equal(prepareStageBackupRestore(current,incoming,b.now).drafts[firstStageDefinition.draftKey],a.raw);
 const older={...b.record,events:b.record.events.slice(0,-1)};assert.equal(prepareStageBackupRestore(current,{...initial,drafts:{[def.draftKey]:JSON.stringify(older)}},b.now).drafts[def.draftKey],b.raw);
 const restored=prepareStageBackupRestore(initial,incoming,b.now),record=JSON.parse(restored.drafts[def.draftKey]);assert.deepEqual(record.events.slice(0,-1),b.record.events);assert.equal(record.events.at(-1).command.type,'restore');
 const before=M.interval(M.project(b.record),'reading','T2',b.now),after=M.interval(M.project(record),'reading','T2',b.now);assert.equal(after.anchor,before.anchor);assert.equal(after.dueAt,before.dueAt);assert.equal(after.ready,false);assert.equal(after.verification,'restored-time-unverified');assert.deepEqual(prepareStageBackupRestore(initial,restored,b.now),restored);
});
test('future, fork, unknown stage/workspace schemas reject the whole restore without mutating either stage',()=>{
 const a=evidence(F),b=evidence(M),current={...initial,drafts:{[firstStageDefinition.draftKey]:a.raw,[def.draftKey]:b.raw}},before=JSON.stringify(current);
 for(const [name,mutate] of [['schema',r=>r.version=99],['pack',r=>r.packVersion='future'],['time',r=>r.events[0].at=b.now+DAY],['fork',r=>r.events[0].command.note='fork'],['workspace',r=>r.events[0].command.note='stage-workspace-007-012:v2:{}']]){
  const r=structuredClone(b.record);mutate(r);const raw=JSON.stringify(r);assert.throws(()=>prepareStageBackupRestore(current,{...initial,drafts:{[def.draftKey]:raw}},b.now));assert.equal(JSON.stringify(current),before);
  if(name!=='fork')assert.throws(()=>prepareStageBackupRestore({...current,drafts:{...current.drafts,[def.draftKey]:raw}},initial,b.now));
 }
});
test('production next-stage learner and examiner reject fake external grades and heard booleans',async()=>{
 const h=host(),before=JSON.stringify(h.state);await assert.rejects(h.adapter.learner({type:'review',id:'fake',review:{}}),/外评/);await assert.rejects(h.adapter.examiner.recordDelivery('fake',{mode:'live-reader',heard:true,humanChecked:true,singlePresentation:true,note:'frontend'}),/前端布尔/);await assert.rejects(h.adapter.examiner.recordReview('fake',{reviewer:{external:true,qualified:true,calibrated:true}}),/前端布尔/);assert.equal(h.adapter.examiner.available,false);assert.equal(JSON.stringify(h.state),before);
});
test('actual learner workspace saves through existing adapter, resumes after refresh and preserves unrelated state',async()=>{
 const h=host(),first=evidence(F);h.state={...h.state,scores:{keep:8},drafts:{other:'keep',[firstStageDefinition.draftKey]:first.raw}};const before=structuredClone(h.state),c=controller(h);await c.load();c.edit(['new current draft']);assert.equal(await c.flush(),true);
 assert.deepEqual({...h.state,drafts:before.drafts},before);const reloaded=controller(h);await reloaded.load();assert.equal(reloaded.snapshot().value.answers[0],'new current draft');assert.equal(reloaded.snapshot().dirty,false);assert.equal(h.state.drafts[firstStageDefinition.draftKey],first.raw);assert.equal((await h.adapter.load()).view.learning.at(-1).kind,'practice');c.dispose();reloaded.dispose();
});
test('failed workspace save and retry retain typed draft; no confirmed event or fake count on failure',async()=>{
 const h=host(),c=controller(h);await c.load();c.edit(['must survive']);h.fail(true);assert.equal(await c.flush(),false);assert.equal(h.state.drafts[def.draftKey],undefined);assert.equal(c.snapshot().value.answers[0],'must survive');assert.equal(c.snapshot().dirty,true);const pending=JSON.parse(c.exportPending());assert.equal(pending.counted,false);assert.equal(pending.pending.answers[0],'must survive');h.fail(false);assert.equal(await c.retry(),true);assert.equal(workspaceDraft(await h.adapter.load(),'writing').answers[0],'must survive');c.dispose();
});
test('edits made during delayed commit drain in order without overwriting newer local text',async()=>{
 const h=host();let release;const wait=new Promise(r=>release=r),port={...h.adapter,learner:async(...args)=>{await wait;return h.adapter.learner(...args);}};const c=new WorkspaceController(port,blank('writing'),()=>{},()=>{});await c.load();c.edit(['one']);const saving=c.flush();await new Promise(r=>setImmediate(r));c.edit(['two']);release();assert.equal(await saving,true);assert.equal(workspaceDraft(await h.adapter.load(),'writing').answers[0],'two');assert.equal(c.snapshot().dirty,false);c.dispose();
});
test('two tabs cannot replace the same saved workspace; different skill drafts can merge',async()=>{
 const h=host(),a=controller(h),b=controller(h),reading=controller(h,'reading');await Promise.all([a.load(),b.load(),reading.load()]);a.edit(['first tab']);assert.equal(await a.flush(),true);b.edit(['stale second tab']);assert.equal(await b.flush(),false);assert.match(b.snapshot().error,/另一页面/);assert.equal(b.snapshot().value.answers[0],'stale second tab');reading.edit(['reading tab']);assert.equal(await reading.flush(),true);const read=await h.adapter.load();assert.equal(workspaceDraft(read,'writing').answers[0],'first tab');assert.equal(workspaceDraft(read,'reading').answers[0],'reading tab');[a,b,reading].forEach(c=>c.dispose());
});
test('persisted current correction and separate revision preserve submitted original and skill timing',async()=>{
 const h=host();await h.adapter.learner({type:'open',skill:'reading',phase:'T0',unseen:true});const id=(await h.adapter.load()).view.attempts.at(-1).id;await h.adapter.learner({type:'draft',id,answers:Array(6).fill('immutable first')});await h.adapter.learner({type:'submit',id});const c=new WorkspaceController(h.adapter,{...blank('correction'),attemptId:id,answers:Array(6).fill('')},()=>{},()=>{},'reading');await c.load();c.edit(Array(6).fill('saved correction'),'factual reason');assert.equal(await c.flush(),true);
 const read=await h.adapter.load(),note=workspaceDraft(read,'correction',id);assert.deepEqual(read.view.learning.at(-1).skills,['reading']);const reloaded=new WorkspaceController(h.adapter,{...blank('correction'),attemptId:id,answers:Array(6).fill('')},()=>{},()=>{},'reading');await reloaded.load();assert.deepEqual(reloaded.snapshot().value,note);await h.adapter.learner({type:'revise',id,answers:note.answers,note:note.note});const attempt=(await h.adapter.load()).view.attempts.at(-1);assert.deepEqual(attempt.first,Array(6).fill('immutable first'));assert.equal(attempt.revisions.length,1);assert.deepEqual(workspaceDraft(await h.adapter.load(),'correction',id),note);c.dispose();reloaded.dispose();
});
test('unsupported workspace schema blocks load and restore without initializing an empty record',async()=>{
 const h=host(),r=M.emptyRecord('synthetic',false);r.events=[{id:'unknown',at:Date.now()-1000,command:{type:'learning',skills:['writing'],kind:'practice',note:'stage-workspace-007-012:v9:{}'}}];const raw=JSON.stringify(r);h.state={...h.state,drafts:{[def.draftKey]:raw}};const c=controller(h);await c.load();assert.equal(c.snapshot().ready,false);assert.match(c.snapshot().error,/版本未知/);assert.equal(await c.flush(),false);assert.equal(h.state.drafts[def.draftKey],raw);assert.throws(()=>encodeWorkspaceNote({...blank('writing'),unsupported:true}));c.dispose();
});
test('registered Today routes active next-stage drafts to their scope and retains first-stage resume',async()=>{
 const h=host();await h.adapter.learner({type:'open',skill:'writing',phase:'T0',unseen:true});const record=F.append(F.emptyRecord('synthetic',false),{id:'first-open',at:T,command:{type:'open',skill:'reading',phase:'T0',unseen:true}},T);h.state={...h.state,drafts:{...h.state.drafts,[firstStageDefinition.draftKey]:JSON.stringify(record)}};const tasks=registeredStageTodayTasks(h.state,Date.now(),t=>stageHashForTarget(t),'#/today');assert.equal(tasks.length,2);assert.ok(tasks.some(t=>t.href.endsWith('?task=stage-nce1-7-12')));assert.ok(tasks.some(t=>t.href==='#/stage-assessment'));
});
test('confirmed practice-only current draft is a scoped Today resume without an assessment or mastery claim',async()=>{
 const h=host(),c=controller(h);await c.load();c.edit(['synthetic unfinished practice']);await c.flush();const tasks=registeredStageTodayTasks(h.state,Date.now(),t=>stageHashForTarget(t),'#/today');assert.equal(tasks.length,1);assert.equal(tasks[0].kind,'resume');assert.equal(tasks[0].href,stageHashForTarget(def.target));assert.match(tasks[0].evidence,/不代表独立通过/);assert.equal((await h.adapter.load()).view.attempts.length,0);c.dispose();
});
