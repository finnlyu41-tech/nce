import {loadTs} from './load-ts.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
const {createStageAdapter,stateWithStageDraft,stageTodayTasks,stageRouteTarget,stageTarget}=loadTs(new URL('../adapter.ts',import.meta.url).pathname);
const {draftKey,readRecord}=loadTs(new URL('../model.ts',import.meta.url).pathname);
const base=()=>({version:1,lastLesson:1,completed:[],scores:{legacy:7},mistakes:{},cards:{old:{box:1,due:42}},days:[],attempts:0,correct:0,drafts:{other:'keep'},custom:[],nce:{}});
function host(){let state=base(),fail=false;const h={read:()=>state,courseVersion:'fixture-course',commit:async(expected,next)=>{if(fail)return false;state=stateWithStageDraft(state,expected,next);return true;}};return {adapter:createStageAdapter(h),get state(){return state},setFail(v){fail=v},setState(v){state=v}};}
test('only one State.drafts key changes; scores/cards/nce/other drafts unchanged',async()=>{
 const h=host(),before=structuredClone(h.state);await h.adapter.learner({type:'open',skill:'reading',phase:'T0',unseen:true});assert.equal(Object.keys(h.state.drafts).length,2);const after={...h.state,drafts:{other:h.state.drafts.other}};assert.deepEqual(after,before);
 const stale=undefined;assert.throws(()=>stateWithStageDraft(h.state,stale,'{}'),/冲突/);assert.equal(stageRouteTarget(stageTarget).scope,'NCE1-1-6');assert.equal(stageRouteTarget('other'),null);
});
test('failed durable save cannot expose new question or mark any result; retry succeeds',async()=>{
 const h=host();h.setFail(true);await assert.rejects(h.adapter.learner({type:'open',skill:'reading',phase:'T0',unseen:true}),/未确认/);assert.equal((await h.adapter.load()).status,'empty');h.setFail(false);await h.adapter.learner({type:'open',skill:'reading',phase:'T0',unseen:true});assert.equal((await h.adapter.load()).view.attempts.length,1);
});
test('restore preserves first/drafts, duplicate is no-op, corrupt/conflicting backup refuses overwrite',async()=>{
 const h=host();await h.adapter.learner({type:'open',skill:'reading',phase:'T0',unseen:true});const id=(await h.adapter.load()).view.attempts[0].id;await h.adapter.learner({type:'draft',id,answers:['首答','','','','','']});await h.adapter.learner({type:'submit',id});const exported=await h.adapter.exportEvidence();const another=host();await another.adapter.restoreEvidence(exported);let read=await another.adapter.load();assert.equal(read.view.attempts[0].first[0],'首答');assert.equal(read.view.learning.length,0);assert.equal(read.view.restorations.length,1);assert.equal(another.state.drafts.other,'keep');
 const full=await another.adapter.exportEvidence(),before=another.state.drafts[draftKey];await another.adapter.restoreEvidence(full);assert.equal(another.state.drafts[draftKey],before);
 const conflicting=JSON.parse(full),record=JSON.parse(conflicting.raw);record.events[1].command.answers[0]='覆盖';conflicting.raw=JSON.stringify(record);await assert.rejects(another.adapter.restoreEvidence(JSON.stringify(conflicting)),/覆盖|分叉/);assert.equal(another.state.drafts[draftKey],before);await assert.rejects(another.adapter.restoreEvidence('{}'),/格式/);
});
test('learner cannot call external-review/delivery or restore command, pending is honest',async()=>{
 const h=host();await h.adapter.learner({type:'open',skill:'writing',phase:'T0',unseen:true});const id=(await h.adapter.load()).view.attempts[0].id;await assert.rejects(h.adapter.learner({type:'review',id,review:{}}),/外评/);await assert.rejects(h.adapter.learner({type:'delivery',id,delivery:{}}),/外评/);await assert.rejects(h.adapter.learner({type:'restore'}),/外评/);await h.adapter.learner({type:'submit',id});assert.equal(stageTodayTasks(h.state,Date.now(),'stage','today').length,0);
});
test('host prior nce learning makes baseline unavailable; malformed data blocks and exports raw',async()=>{
 const h=host();h.setState({...h.state,nce:{'NCE1-1':{title:'legacy',text:'',notes:'',steps:['listen']}}});await assert.rejects(h.adapter.learner({type:'open',skill:'reading',phase:'T0',unseen:true}),/基线/);h.setState({...h.state,drafts:{...h.state.drafts,[draftKey]:'broken'}});await assert.rejects(h.adapter.learner({type:'prior-learning'}));assert.equal((await h.adapter.load()).status,'blocked');assert.equal(JSON.parse(await h.adapter.exportEvidence()).raw,'broken');
});
