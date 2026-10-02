import assert from 'node:assert/strict';
import {readdir,mkdtemp,rm} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import os from 'node:os';
import path from 'node:path';
const id=process.argv[2]||'04';assert.match(id,/^(04|05)$/);
const root=fileURLToPath(new URL('../',import.meta.url)),pnpm=path.join(root,'node_modules/.pnpm');
const builder=(await readdir(pnpm)).filter(n=>/^esbuild@\d+\.\d+\.\d+$/.test(n)).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}))[0];
const {build}=await import(pathToFileURL(path.join(pnpm,builder,'node_modules/esbuild/lib/main.js')));
const temp=await mkdtemp(path.join(os.tmpdir(),'ielts-registered-batch-'));
try{
 const output=path.join(temp,'checks.cjs');
 await build({stdin:{contents:`import * as b from './ielts-blueprint/curriculum/batch-${id}';import * as c from './ielts-blueprint/sample-sequence';import * as m from './ielts-blueprint/sample-sequence-model';import * as p from './app/ielts-sample-progress';import * as n from './app/ielts-sample-next';import * as f from './app/progress-file';import {initial} from './app/model';export {b,c,m,p,n,f,initial};`,resolveDir:root,loader:'ts'},bundle:true,platform:'node',format:'cjs',target:'node22',outfile:output,logLevel:'silent'});
 const {b,c,m,p,n,f,initial}=(await import(pathToFileURL(output))).default,lessonsFor=b['batch'+id+'LessonsFor'];
 const variants=['academic','general-training'],DAY=86400000;let clock=Date.now()-60*DAY,roundTrips=0,groups=0;
 const test=async(name,fn)=>{await fn();groups++;console.log('PASS '+name)};
 function roundTrip(value){const raw=p.serializeSampleProgress(value,clock),read=p.readSampleProgress(raw,clock);assert.equal(read.status,'ready',read.reason);assert.deepEqual(read.value,JSON.parse(JSON.stringify(value)));roundTrips++;return raw}
 function act(value,action){const result=m.transitionSample(value,action,clock+=10);assert.equal(result.issue,undefined,result.issue);roundTrip(result.state);return result.state}
 function reject(value,action,pattern){const raw=JSON.stringify(value),r=m.transitionSample(value,action,clock+=10);assert.match(r.issue,pattern);assert.equal(JSON.stringify(r.state),raw)}
 function choose(value,variant,lessonId){return act(act(value,{type:'select-variant',variant}),{type:'open-lesson',lessonId})}
 function answer(value,material,values=material.questions.map(q=>q.accepted[0])){for(let i=0;i<material.questions.length;i++)value=act(value,{type:'answer',questionId:material.questions[i].id,value:values[i]});return value}
 // Controlled model callbacks only: this is not real playback or hearing evidence.
 function syntheticAudio(value){const promptId=m.activeSampleMaterial(value).id,playbackId='model-only-'+clock;for(const type of ['audio-request','audio-start','audio-end','audio-confirm'])value=act(value,{type,promptId,playbackId});return value}
 let value=m.emptySampleState();
 await test('authored lessons are the exact objects in the production directory; variants and materials stay bounded',()=>{
  for(const variant of variants)for(const lesson of lessonsFor(variant))assert.equal(c.sampleLessonById(variant,lesson.id),lesson);
  assert.throws(()=>lessonsFor('unknown'));assert.equal(c.sampleLessonById('academic','unregistered'),undefined);
  const listening=lessonsFor('academic').find(l=>l.skill==='listening'),readingA=lessonsFor('academic').find(l=>l.skill==='reading'),readingGT=lessonsFor('general-training').find(l=>l.skill==='reading');
  assert.equal(listening,lessonsFor('general-training').find(l=>l.skill==='listening'));assert.notEqual(readingA,readingGT);assert(c.sampleMaterials(readingA).every(a=>!c.sampleMaterials(readingGT).some(g=>a.id===g.id)));
 });
 for(const variant of variants)for(const lesson of lessonsFor(variant)){if(variant==='general-training'&&lesson.skill==='listening')continue;await test(variant+' '+lesson.id+' complete production transitions, preserved originals, correction and two gated fresh banks',()=>{
  value=choose(value,variant,lesson.id);value=act(act(value,{type:'next'}),{type:'next'});
  for(const stage of ['guided','independent','timed']){
   const material=m.activeSampleMaterial(value);if(stage==='timed'){reject(value,{type:'answer',questionId:material.questions[0].id,value:'premature'},/先主动开始/);value=act(value,{type:'start-timed'})}
   if(stage!=='guided')value=act(value,{type:'confirm-unseen',value:true});
   const raw=material.questions.map(q=>q.accepted[0]);if(stage==='timed')raw[0]+=' EXTRA WORDS';value=answer(value,material,raw);
   if(lesson.skill==='listening'){reject(value,{type:'submit'},/先完整播放并确认实际听到声音/);value=syntheticAudio(value)}
   value=act(value,{type:'submit'});const original=m.sampleSession(value).attempts.at(-1);assert.equal(original.answers[material.questions[0].id],raw[0]);if(stage==='timed'){assert.equal(original.matched,false);assert.equal(original.correct,material.questions.length-1)}
   value=act(value,{type:'next'});
  }
  const originals=structuredClone(m.sampleSession(value).attempts);reject(value,{type:'save-correction'},/还没有订正答案/);
  for(const q of lesson.timed.questions)value=act(value,{type:'correction-answer',questionId:q.id,value:q.accepted[0]});reject(value,{type:'save-correction'},/至少 8 字/);
  value=act(value,{type:'correction-note',value:'逐项核对本轮题干、原材料及输入要求，保留原答。'});value=act(value,{type:'correction-answer',questionId:lesson.timed.questions[0].id,value:'complete mismatched original'});reject(value,{type:'save-correction'},/第 1 题的订正与本轮材料不符/);
  value=act(value,{type:'correction-answer',questionId:lesson.timed.questions[0].id,value:lesson.timed.questions[0].accepted[0]});value=act(value,{type:'save-correction'});assert.deepEqual(m.sampleSession(value).attempts,originals);reject(value,{type:'start-review'},/至少隔 24 小时/);
  for(const bank of lesson.reviews){clock=m.sampleReviewDueAt(m.sampleSession(value));value=act(value,{type:'start-review'});assert.equal(m.activeSampleMaterial(value).id,bank.id);value=act(value,{type:'confirm-unseen',value:true});value=answer(value,bank);if(lesson.skill==='listening')value=syntheticAudio(value);value=act(value,{type:'submit'});const attempt=m.sampleSession(value).attempts.at(-1);assert.equal(attempt.matched,true);assert.equal(attempt.variant,variant);assert.equal(attempt.lessonId,lesson.id);reject(value,{type:'start-review'},/至少隔 24 小时/)}
  clock=m.sampleReviewDueAt(m.sampleSession(value));reject(value,{type:'start-review'},/两份复验新材料/);assert.equal(m.sampleLessonReceipt(value,clock).band,null);
 });}
 await test('shared listening exposure cannot become new evidence through an exam-category switch',()=>{
  const lesson=lessonsFor('general-training').find(l=>l.skill==='listening');value=choose(value,'general-training',lesson.id);value=act(act(value,{type:'next'}),{type:'next'});value=act(syntheticAudio(answer(value,lesson.guided)),{type:'submit'});value=act(value,{type:'next'});value=act(value,{type:'confirm-unseen',value:true});value=act(syntheticAudio(answer(value,lesson.independent)),{type:'submit'});assert.equal(m.sampleSession(value).attempts.at(-1).fresh,false);
 });
 await test('all saved sessions and unrelated CL keys survive the actual host backup parser; unknown and cross-category records remain raw',async()=>{
  const raw=roundTrip(value),host={...structuredClone(initial),drafts:{'nce-course-loop-v1:NCE1-1':'preserved host-owned original','nce-course-loop-inputs-v1:NCE1-5':'preserved host-owned correction sidecar',[p.sampleProgressKey]:raw}},restored=await f.readProgressFile(f.makeProgressFile(host));assert.deepEqual(restored.state,host);assert.equal(p.readSampleProgress(restored.state.drafts[p.sampleProgressKey],clock).status,'ready');
  for(const mutate of [x=>x.value.sessions['academic:unknown']={},x=>{const l=lessonsFor('academic').find(l=>l.skill==='reading');x.value.sessions['academic:'+l.id].attempts[0].variant='general-training'}]){const bad=JSON.parse(raw);mutate(bad);const text=JSON.stringify(bad),read=p.readSampleProgress(text,clock);assert.equal(read.status,'blocked');assert.equal(read.raw,text)}
  const changed={...host,drafts:{...host.drafts,[p.sampleProgressKey]:'newer raw'}};assert.equal(p.replaceSampleProgress(changed,raw,raw,clock),changed);
 });
 console.log(JSON.stringify({batch:id,groups,roundTrips,productionBinding:true,syntheticAudioCallbacks:true,realAudibility:false,naturalDelay:false}));
}finally{await rm(temp,{recursive:true,force:true})}
