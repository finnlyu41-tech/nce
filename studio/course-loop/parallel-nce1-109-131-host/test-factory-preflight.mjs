/** Synthetic candidate factory checks; no registration, store or natural delay. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createCourseLoopModel} from '../model.mjs';
import {getCourseBinding,registeredCourseIds} from '../registry.mjs';
import {arrived,arrivedIds,baseIds,pendingIds,productionHost} from './preflight-binding.mjs';
const NOW=2000000000000,DAY=86400000,host=await productionHost();
const expected=['nce1-109','nce1-111','nce1-113','nce1-115','nce1-117','nce1-119','nce1-121','nce1-123','nce1-125','nce1-127','nce1-129','nce1-131'];
assert.deepEqual(arrivedIds,expected);
function replay(c){
 const model=createCourseLoopModel(c),snapshots=new Map();let at=NOW,state=model.initialState(at),view=model.inspect(state,at).view;
 const send=action=>{const r=model.transition(state,action,++at);assert.ok(r.ok,c.lesson.id+': '+r.message);state=r.state;view=r.view;return r};
 while(snapshots.size<c.questions.length){
  const q=model.currentQuestion(view);
  if(q){snapshots.set(q.id,{state:structuredClone(state),at});send({type:'draft',value:q.accepted[0]});send({type:'submit'});send({type:'next'});}
  else if(['learn','feedback','review-feedback'].includes(view.phase))send({type:'next'});
  else if(view.phase==='own'){send({type:'own-draft',value:'Synthetic QA expression requiring a human reviewer.'});send({type:'finish'});}
  else if(view.phase==='waiting'){at=view.dueAt;send({type:'review'});}
  else assert.fail('Unexpected phase '+view.phase);
 }
 return {model,snapshots,state,at,view};
}
const runs=new Map(arrived.map(c=>[c.lesson.id,replay(c)]));
test('exact unchanged actual factory, existing 54 bindings, and no invented pending registration',async()=>{
 assert.deepEqual(registeredCourseIds,baseIds);assert.deepEqual(host.courseLoopBindings.map(c=>c.id),baseIds);
 const sha=createHash('sha256').update(await readFile(new URL('../model.mjs',import.meta.url))).digest('hex');
 assert.equal(sha,'4b3a67cf22c23f2d263af523ac6e314c37714f4b03784efbd935d695571daa57');
 for(const id of [...arrivedIds,...pendingIds])assert.throws(()=>getCourseBinding(id));
 assert.equal(host.courseSuccessorNode('nce1-107',host.nodeById('nce1-1')).id,'nce1-109');
 for(const id of arrivedIds)assert.equal(host.courseSuccessorNode(id,host.nodeById('nce1-1')).id,id);
});
for(const c of arrived)test(c.lesson.id+' submits every listed variant and semantic counterexample through real factory',()=>{
 const r=runs.get(c.lesson.id);assert.equal(c.questions.length,18);assert.equal(c.byId.size,18);
 assert.equal(c.lesson.own.status,'awaiting-human-review');
 assert.equal(new Set(c.questions.map(q=>q.id)).size,18);
 for(const q of c.questions){
  const checkpoint=r.snapshots.get(q.id);
  const submit=answer=>{const d=r.model.transition(checkpoint.state,{type:'draft',value:answer},checkpoint.at+1);assert.ok(d.ok);const s=r.model.transition(d.state,{type:'submit'},checkpoint.at+2);assert.ok(s.ok);const attempt=s.view.attempts.at(-1);assert.equal(attempt.answer,answer);return attempt};
  for(const answer of q.accepted){assert.equal(submit(answer).correct,true,q.id+': '+answer);assert.equal(submit('  '+answer.toUpperCase().replace(/ /g,'  ').replaceAll("'",'’')+'  ').correct,true);}
  for(const x of q.counterexamples){assert.ok(x.reason);assert.equal(submit(x.answer).correct,false,q.id+': '+x.answer);}
  const a=q.accepted[0],badPunctuation=q.form==='question'?a.replace(/\?$/,'.'):a.replace(/\.$/,'')+'?';
  assert.equal(submit(badPunctuation).correct,false,q.id+' punctuation changes meaning');
  const fullwidth=a.replace(/[A-Za-z0-9]/g,x=>String.fromCharCode(x.charCodeAt(0)+0xfee0));assert.notEqual(fullwidth,a);assert.equal(submit(fullwidth).correct,false,q.id+' fullwidth characters stay distinct');
 }
 assert.equal(r.view.attempts.length,18);assert.equal(r.view.phase,'review-feedback');
 assert.equal(r.model.receipt(r.view,r.at).openExpression,'awaiting-human-review');
 assert.equal(r.model.receipt(r.view,r.at).listening,'not-tested');
 assert.equal(r.view.dueAt,r.at+7*DAY);
});
test('candidate and old54 raw envelopes reject every foreign course without changing original bytes',()=>{
 const models=[...baseIds.map(id=>getCourseBinding(id).model),...arrived.map(c=>runs.get(c.lesson.id).model)];
 const ids=[...baseIds,...arrivedIds],raws=models.map(m=>JSON.stringify(m.initialState(NOW)));
 for(let a=0;a<models.length;a++)for(let b=0;b<models.length;b++){
  const restored=models[a].restore(raws[b],NOW);assert.equal(restored.ok,a===b,ids[a]+' / '+ids[b]);if(a!==b)assert.equal(restored.raw,raws[b]);
 }
 for(const c of arrived){const raw=JSON.stringify(runs.get(c.lesson.id).state),r=host.parseCourseLoop(raw,NOW,c.lesson.id);assert.equal(r.ok,false);assert.equal(r.raw,raw);}
});
test('future-version and foreign-course envelopes retain raw under candidate factory',()=>{
 for(const c of arrived){const r=runs.get(c.lesson.id),future={...r.state,contentVersion:999};
  for(const forged of [future,{...r.state,version:999},{...r.state,lessonId:'nce1-999'}]){const raw=JSON.stringify(forged),result=r.model.restore(raw,r.at);assert.equal(result.ok,false);assert.equal(result.raw,raw);}
 }
});
