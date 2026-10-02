import test from 'node:test';
import assert from 'node:assert/strict';
import {getCourseBinding} from '../registry.mjs';

function feedback(id){
 const binding=getCourseBinding(id),{model}=binding;
 let at=Date.now()-10000,state=model.initialState(at);
 const act=action=>{const r=model.transition(state,action,++at);assert.equal(r.ok,true,r.message);state=r.state;return r.view};
 let view=model.inspect(state,at).view;
 while(view.phase!=='feedback'){
  const q=model.currentQuestion(view);
  if(q){act({type:'draft',value:view.phase==='independent'?'Actual wrong original.':q.accepted[0]});act({type:'submit'})}
  view=act({type:'next'});
 }
 const originals=structuredClone(view.attempts);
 return {binding,originals,get state(){return state},get view(){return model.inspect(state,at).view},
  correct(question,answer,note){const before=JSON.stringify(state),r=model.transition(state,{type:'correct',id:question.id,answer,note},++at);if(r.ok)state=r.state;else assert.equal(JSON.stringify(r.state),before);assert.deepEqual(model.inspect(state,at).view.attempts,originals);return r;}
 };
}
test('nationality feedback identifies complete mismatches without changing matching or originals',()=>{
 const run=feedback('nce1-5'),q=[...run.binding.byId.values()].filter(q=>q.stage==='independent').find(q=>q.target==='nationality'),note='核对人物和现在时肯定陈述，首答另行保留。';
 for(const answer of ['She is Korean?','She is Korean？','She is French.','She was Korean.','She is a Korean.','He is Korean.']){
  const r=run.correct(q,answer,note);assert.equal(r.ok,false);assert.match(r.message,/订正答案与本题要求不符/);assert.match(r.message,/人称、be 动词、国籍信息和现在时肯定陈述句/);assert(!r.message.includes('请先写出'));assert(!r.message.includes('请补充'));
 }
 const r=run.correct(q,"She's Korean.",note);assert.equal(r.ok,true,r.message);assert.equal(run.view.corrections[q.id].answer,"She's Korean.");assert.equal(run.view.corrections[q.id].note,note);
 const restored=run.binding.model.restore(JSON.stringify(run.state),Date.now());assert.equal(restored.ok,true,restored.message);assert.deepEqual(restored.view.attempts,run.originals);
});
test('all three production bindings distinguish missing answer and missing reason',()=>{
 for(const id of ['nce1-1','nce1-3','nce1-5']){
  const run=feedback(id),q=[...run.binding.byId.values()].filter(q=>q.stage==='independent')[0];
  assert.match(run.correct(q,'  ','specific reason').message,/请先写出本题的订正答案/);
  assert.match(run.correct(q,q.accepted[0],'  ').message,/请补充一条具体的订正原因/);
  assert.match(run.correct(q,'complete wrong answer','complete reason').message,/订正答案与本题要求不符/);
  assert.match(run.correct(q,'x'.repeat(1001),'reason').message,/订正答案超过 1000 字/);
  assert.match(run.correct(q,q.accepted[0],'x'.repeat(1001)).message,/订正原因超过 1000 字/);
  const r=run.correct(q,q.accepted[0],'核对本题人物、结构和事实要求。');assert.equal(r.ok,true,r.message);
 }
});
