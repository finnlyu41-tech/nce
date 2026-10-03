import test from 'node:test';import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import {createCourseLoopModel} from '../model.mjs';
const numbers=(await readdir(new URL('.',import.meta.url))).filter(n=>/^lesson-nce1-\d+\.mjs$/.test(n)&&(!process.env.NCE_IDS||process.env.NCE_IDS.split(',').map(Number).includes(Number(n.match(/(\d+)\.mjs/)[1])))).sort();
export const contents=await Promise.all(numbers.map(n=>import('./'+n)));
assert.ok(contents.length,'no authored modules selected');if(process.env.NCE_IDS)assert.equal(contents.length,new Set(process.env.NCE_IDS.split(',').map(Number)).size);
const now=2000000000000;
function engine(content){const model=createCourseLoopModel(content);let state=model.initialState(now),at=now;const send=action=>{const r=model.transition(state,action,++at);assert.ok(r.ok,r.message);state=r.state;return r.view};return {model,send,get state(){return state},get at(){return at},view:()=>model.inspect(state,at).view,jumpToDue(){at=this.view().dueAt;return send({type:'review'})}}}
function passBank(e,c){const stage=e.view().phase;while(e.view().phase===stage&&e.model.currentQuestion(e.view())){const q=e.model.currentQuestion(e.view());e.send({type:'draft',value:q.accepted[0]});e.send({type:'submit'});e.send({type:'next'})}}
for(const c of contents){
 test(c.lesson.id+' complete banks, meaningful variants and near-miss boundaries through production factory',()=>{
  assert.equal(c.questions.length,18);assert.equal(c.byId.size,18);assert.equal(c.lesson.teaching.length,3);assert.equal(c.lesson.own.status,'awaiting-human-review');
  const e=engine(c),snapshots=new Map();
  while(snapshots.size<18){let v=e.view(),q=e.model.currentQuestion(v);
   if(q){snapshots.set(q.id,{state:e.state,at:e.at});e.send({type:'draft',value:q.accepted[0]});e.send({type:'submit'});e.send({type:'next'});}
   else if(['learn','feedback','review-feedback'].includes(v.phase))e.send({type:'next'});
   else if(v.phase==='own'){e.send({type:'own-draft',value:'虚构场景，等待伙伴核对。'});e.send({type:'finish'});}
   else if(v.phase==='waiting')e.jumpToDue();else assert.fail(v.phase);
  }
  for(const q of c.questions){const {state,at}=snapshots.get(q.id);const run=answer=>{const draft=e.model.transition(state,{type:'draft',value:answer},at+1);assert.ok(draft.ok);const sub=e.model.transition(draft.state,{type:'submit'},at+2);assert.ok(sub.ok);return sub.view.attempts.at(-1)};
   for(const answer of q.accepted){assert.ok(c.matches(q,answer),q.id);assert.ok(run(answer).correct,q.id+' production matched '+answer);assert.ok(run('  '+answer.toUpperCase().replace(/ /g,'  ').replaceAll("'",'’')+'  ').correct);if(q.form==='statement'&&answer.endsWith('.'))assert.ok(run(answer.slice(0,-1)).correct);}
   for(const x of q.counterexamples){assert.ok(!c.matches(q,x.answer),q.id+' rejects '+x.answer);assert.ok(!run(x.answer).correct);assert.ok(x.reason)}
   for(const wrong of [q.accepted[0]+'?',q.accepted[0]+'!',q.accepted[0]+'。',''])assert.ok(!c.matches(q,wrong));
  }
 });
 test(c.lesson.id+' assistance, preserved first answer, real correction guard, replay and finite delayed pools',()=>{
  const e=engine(c);passBank(e,c);assert.equal(e.view().phase,'learn');e.send({type:'next'});passBank(e,c);assert.equal(e.view().phase,'independent');
  let q=e.model.currentQuestion(e.view());const first=q.id,bad=q.counterexamples[0].answer;e.send({type:'draft',value:bad});e.send({type:'submit'});e.send({type:'next'});
  q=e.model.currentQuestion(e.view());const assisted=q.id;e.send({type:'source',source:'text'});e.send({type:'draft',value:q.accepted[0]});e.send({type:'submit'});e.send({type:'next'});passBank(e,c);
  assert.equal(e.view().phase,'feedback');assert.equal(e.view().attempts.find(a=>a.id===first).answer,bad);assert.equal(e.model.transition(e.state,{type:'next'},e.at+1).ok,false);
  const before=JSON.stringify(e.state);for(const id of ['unknown',contents.find(x=>x!==c)?.questions[0].id||'diagnostic-n999-unknown']){const r=e.model.transition(e.state,{type:'correct',id,answer:'x',note:'x'},e.at+1);assert.equal(r.ok,false);assert.equal(JSON.stringify(r.state),before)}
  assert.equal(e.model.transition(e.state,{type:'correct',id:first,answer:bad,note:'wrong'},e.at+1).ok,false);
  for(const id of [first,assisted])e.send({type:'correct',id,answer:c.byId.get(id).accepted[0],note:'按新情境核对主语与意思。'});
  e.send({type:'next'});q=e.model.currentQuestion(e.view());e.send({type:'draft',value:q.counterexamples[0].answer});e.send({type:'submit'});e.send({type:'retry'});e.send({type:'draft',value:q.accepted[0]});e.send({type:'submit'});let retry=e.view().attempts.at(-1);assert.equal(retry.fresh,false);assert.equal(retry.hinted,true);e.send({type:'next'});passBank(e,c);
  e.send({type:'own-draft',value:'人工待核对，不声称口语通过。'});e.send({type:'finish'});assert.equal(e.view().dueAt,e.at+86400000);assert.equal(e.model.transition(e.state,{type:'review'},e.at+1).ok,false);
  e.jumpToDue();passBank(e,c);assert.equal(e.view().reviewResults.at(-1).independent,true);assert.equal(e.view().dueAt,e.at+604800000);e.send({type:'next'});
  e.jumpToDue();e.send({type:'help'});passBank(e,c);assert.equal(e.view().reviewResults.at(-1).independent,false);assert.equal(e.view().dueAt,e.at+86400000);e.send({type:'next'});
  const raw=JSON.stringify(e.state);assert.ok(e.model.restore(raw,e.at).ok);assert.equal(e.model.receipt(e.view(),e.at).openExpression,'awaiting-human-review');assert.equal(e.model.receipt(e.view(),e.at).listening,'not-tested');assert.equal(e.model.receipt(e.view(),e.at).band,null);
  const exhausted=e.model.transition(e.state,{type:'review'},e.view().dueAt);assert.equal(exhausted.ok,false);assert.equal(JSON.stringify(exhausted.state),raw);
  assert.equal(e.model.recommendation(e.view(),e.view().dueAt).kind,'needs-new-material');
  for(const invalid of ['not json',JSON.stringify({...e.state,lessonId:'nce1-999'}),JSON.stringify({...e.state,version:999})]){const r=e.model.restore(invalid,e.at);assert.equal(r.ok,false);assert.equal(r.raw,invalid)}
 });
}
for(const a of contents)for(const b of contents)if(a!==b)test(a.lesson.id+' rejects '+b.lesson.id+' raw without overwriting',()=>{const model=createCourseLoopModel(a),other=createCourseLoopModel(b),raw=JSON.stringify(other.initialState(now));const r=model.restore(raw,now);assert.equal(r.ok,false);assert.equal(r.raw,raw)});
for(const range of ['121-125','127-131'].filter(r=>!process.env.NCE_IDS||process.env.NCE_IDS.split(',').map(Number).some(n=>n>=Number(r.split('-')[0])&&n<=Number(r.split('-')[1]))))try{const blind=JSON.parse(await readFile(new URL('../../docs/parallel-nce1-121-131/blind-answers-final-'+range+'.json',import.meta.url)));test('external independent blind '+range+' answers and reasonable variants match current authored contracts',async()=>{assert.equal(blind.length,54);assert.equal(new Set(blind.map(a=>a.id)).size,54);assert.ok(blind.every(a=>!a.concern));const prompts=JSON.parse(await readFile(new URL('../../docs/parallel-nce1-121-131/blind-prompts-'+range+'.json',import.meta.url)));assert.equal(prompts.length,54);for(const p of prompts){const c=contents.find(c=>c.byId.has(p.id));if(!c&&process.env.NCE_IDS)continue;assert.ok(c,p.id);const q=c.byId.get(p.id);assert.equal(p.context,q.context);assert.equal(p.prompt,q.prompt);assert.equal(p.form,q.form);}for(const a of blind){const c=contents.find(c=>c.byId.has(a.id));if(!c&&process.env.NCE_IDS)continue;assert.ok(c,a.id);const q=c.byId.get(a.id);assert.ok(c.matches(q,a.answer),a.id+' blind: '+a.answer);for(const v of a.variants||[])assert.ok(c.matches(q,v),a.id+' variant: '+v)}})}catch(error){if(error.code!=='ENOENT')throw error}
test('independent and delayed tasks are distinct originals, not source recital or reordered banks',async()=>{const ids=new Set(),contexts=new Set(),prompts=new Set();for(const c of contents){const source=JSON.parse(await readFile(new URL('../../dist-online'+c.lesson.source.languagePath,import.meta.url)));const answers=new Set();for(const q of c.questions){assert.ok(!ids.has(q.id));ids.add(q.id);assert.ok(!contexts.has(q.context));contexts.add(q.context);assert.ok(!prompts.has(q.prompt));prompts.add(q.prompt);const a=q.accepted[0].toLowerCase();assert.ok(!(q.context+' '+q.prompt).toLowerCase().includes(a),q.id+' full answer embedded in prompt');assert.ok(!answers.has(a),q.id+' duplicate task answer');answers.add(a);assert.ok(!source.rows.some(r=>r.en.toLowerCase()===a),q.id+' quotes original');assert.ok(q.novelty===q.context||q.context.endsWith(q.novelty));}assert.deepEqual(c.lesson.lessons,[c.lesson.lessons[0],c.lesson.lessons[0]+1])}});
