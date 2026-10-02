import test from 'node:test';
import assert from 'node:assert/strict';
import {contents,host,root} from './test-binding.mjs';
import {createCourseLoopModel} from '../model.mjs';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const production=await host();
const sha=b=>createHash('sha256').update(b).digest('hex');
const json=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const [ui,manifest,index,comics,grammar]=await Promise.all([readFile(new URL('app/course-loop-ui.tsx',root),'utf8'),json('dist-online/materials/manifest.json'),json('dist-online/language/index.json'),json('app/data/nce-illustrations.json'),json('dist-online/grammar/index.json')]);
const expression=[...ui.slice(ui.indexOf('function SourcePanel(')).matchAll(/const valid=([^;]+);setLanguage\(valid\?result:null\)/g)];assert.equal(expression.length,1);
const accepts=new Function('result','lesson','first',`return (${expression[0][1]});`);
const sources=await Promise.all(contents.map(async c=>json(`dist-online/language/NCE1/${c.lesson.lessons[0]}.json`)));
for(const [i,c] of contents.entries()){
 const {lesson,questions,matches}=c,model=createCourseLoopModel(c),n=lesson.lessons[0];
 test(lesson.id+' complete distinct banks, meaningful variants and near misses',()=>{
  assert.equal(questions.length,18);assert.equal(new Set(questions.map(q=>q.id)).size,18);assert.equal(new Set(questions.map(q=>q.context)).size,18);
  assert.deepEqual(lesson.lessons,[n,n+1]);assert.equal(lesson.teaching.length,3);
  for(const stage of ['diagnostic','guided','independent','repair','review-a','review-b']){assert.equal(c.questionsFor(stage).length,3);assert.equal(new Set(c.questionsFor(stage).map(q=>q.target)).size,3)}
  for(const q of questions){for(const a of q.accepted){assert.ok(matches(q,a));assert.ok(matches(q,'  '+a.toUpperCase().replace(/'/g,'’').replace(/ /g,'  ')+'  '));if(q.form!=='question')assert.ok(matches(q,a.replace(/\.$/,'')))}for(const b of q.counterexamples)assert.equal(matches(q,b.answer),false,q.id+': '+b.answer)}
 });
 test(lesson.id+' actual SourcePanel guard, LRC bytes, index hash and comic identity',async()=>{
  const source=sources[i],path=`language/NCE1/${n}.json`,bytes=await readFile(new URL('dist-online/'+path,root));assert.equal(lesson.source.languageSha256,source.sourceSha256);assert.notEqual(lesson.source.languageSha256,sha(bytes));assert.equal(index.files[`NCE1/${n}.json`].sha256,sha(bytes));
  const lrc=manifest.files.filter(f=>f.book==='NCE1'&&f.lesson===n&&f.textFormat==='lrc'&&f.sha256===source.sourceSha256);assert.equal(lrc.length,1);const lrcBytes=Buffer.concat(await Promise.all(lrc[0].parts.map(p=>readFile(new URL('dist-online/'+p.path.slice(1),root)))));assert.equal(sha(lrcBytes),source.sourceSha256);
  assert.ok(accepts(source,lesson,n));for(const other of sources)assert.equal(accepts(other,lesson,n),other===source);for(const hash of ['0'.repeat(64),sha(bytes)])assert.equal(accepts({...source,sourceSha256:hash},lesson,n),false);
  const rows=production.splitLesson(source.rows,'NCE1',true).body,comic=comics.lessons[`NCE1-${n}`];assert.equal(comic.sourceSha256,source.sourceSha256);assert.equal(comic.linePanels.length,rows.length);assert.deepEqual(production.lessonIllustration('NCE1',n,source.sourceSha256,rows.length),comic);assert.equal(production.lessonIllustration('NCE1',n,sha(bytes),rows.length),null);assert.equal(sha(await readFile(new URL(`dist-online/lesson-pages/${comic.pageSha256}.jpg`,root))),comic.pageSha256);
  const page=(n+1)*2+3,entry=grammar.pages[`NCE1-${page}`];assert.ok(entry);assert.equal(sha(await readFile(new URL('dist-online/'+entry.src.slice(1),root))),entry.sha256);
  for(const clip of lesson.source.clips){assert.ok(clip.start>=0&&clip.end>clip.start);assert.ok(clip.start<=lrc[0].lastTimestamp);assert.ok(lesson.teaching.some(t=>t.target===clip.target))}
 });
 test(lesson.id+' production factory preserves matcher, originals, assistance, correction and simulated delayed banks',()=>{
  const t=1770000000000;let at=t,state=model.initialState(t);
  const act=a=>{const r=model.transition(state,a,++at);assert.ok(r.ok,r.message);state=r.state;return r.view};
  const answer=(q,a)=>{act({type:'draft',value:a});act({type:'submit'});return act({type:'next'})};
  for(const q of c.questionsFor('diagnostic'))answer(q,q.counterexamples[0].answer);
  act({type:'next'});for(const q of c.questionsFor('guided'))answer(q,q.accepted.at(-1));
  const independent=c.questionsFor('independent');act({type:'source',source:'text'});answer(independent[0],independent[0].accepted[0]);answer(independent[1],independent[1].counterexamples[0].answer);answer(independent[2],independent[2].accepted[0]);
  let v=model.inspect(state,at).view;assert.ok(v.attempts.find(a=>a.id===independent[0].id).hinted);assert.equal(model.transition(state,{type:'next'},++at).ok,false);
  for(const q of independent.slice(0,2)){const before=JSON.stringify(state),bad=model.transition(state,{type:'correct',id:q.id,answer:q.counterexamples[0].answer,note:'不匹配'},++at);assert.equal(bad.ok,false);assert.equal(JSON.stringify(state),before);act({type:'correct',id:q.id,answer:q.accepted.at(-1),note:q.why})}
  act({type:'next'});for(const q of c.questionsFor('repair'))answer(q,q.accepted.at(-1));act({type:'own-draft',value:'Synthetic QA expression pending human review.'});v=act({type:'finish'});assert.equal(v.ownFinal.status,'awaiting-human-review');assert.equal(model.receipt(v,at).mastery,'not-assessed');assert.equal(model.transition(state,{type:'review'},++at).ok,false);
  for(const bank of ['review-a','review-b']){at=v.dueAt;v=act({type:'review'});assert.equal(v.phase,bank);for(const q of c.questionsFor(bank))v=answer(q,q.accepted.at(-1));assert.ok(v.reviewResults.at(-1).independent);v=act({type:'next'})}
  assert.equal(v.attempts.find(a=>a.id===independent[1].id).answer,independent[1].counterexamples[0].answer);assert.equal(v.attempts.length,18);at=v.dueAt;assert.equal(model.transition(state,{type:'review'},++at).ok,false);assert.equal(model.recommendation(v,at).kind,'needs-new-material');
  const raw=JSON.stringify(state);assert.ok(production.parseCourseLoop(raw,at,lesson.id).ok);for(const other of contents.filter(x=>x!==c)){const bad=production.parseCourseLoop(raw,at,other.lesson.id);assert.equal(bad.ok,false);assert.equal(bad.raw,raw)}
  assert.throws(()=>production.parseLoopInputs(JSON.stringify({version:1,corrections:{'independent-unknown':{answer:'x',note:'x'}}}),lesson.id));
 });
 test(lesson.id+' exact module matcher controls submit and correction',()=>{
  let calls=0;const wrapped={...c,matches(q,a){calls++;return c.matches(q,a)}},bound=createCourseLoopModel(wrapped);let s=bound.initialState(100);s=bound.transition(s,{type:'draft',value:c.questions[0].accepted[0]},101).state;const r=bound.transition(s,{type:'submit'},102);assert.ok(r.ok&&r.view.attempts[0].correct);assert.ok(calls>0);
 });
}
test('unknown production course rejects without reset; malformed raw is returned verbatim',()=>{assert.equal(production.isRegisteredCourse('nce1-49'),false);assert.throws(()=>production.getCourseBinding('nce1-49'));const raw='{"preserve":"raw"}';assert.equal(production.parseCourseLoop(raw,Date.now(),'nce1-37').raw,raw)});
