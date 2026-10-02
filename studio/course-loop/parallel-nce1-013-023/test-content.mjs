import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createCourseLoopModel} from '../model.mjs';
import * as pilot from '../lesson-nce1-001.mjs';
import * as defaults from '../model.mjs';
import {registeredCourseIds,getCourseBinding} from '../registry.mjs';
import {stageIds,normalizedResponse} from './content-contract.mjs';
const numbers=process.env.NCE_CHECKPOINT==='1'?[13,15,17]:[13,15,17,19,21,23];
const contents=await Promise.all(numbers.map(n=>import(`./lesson-nce1-${String(n).padStart(3,'0')}.mjs`)));
const NOW=1791028800000,DAY=86400000,WEEK=604800000;
const illustrations=JSON.parse(await readFile(new URL('../../app/data/nce-illustrations.json',import.meta.url)));
function runner(c){const m=createCourseLoopModel(c);let now=NOW,s=m.initialState(now);return {m,get now(){return now},get state(){return s},get view(){return m.inspect(s,now).view},time:t=>now=t,send:a=>{const r=m.transition(s,a,++now);assert.equal(r.ok,true,r.message);s=r.state;return r.view;},reject:a=>{const r=m.transition(s,a,++now);assert.equal(r.ok,false);assert.deepEqual(r.state,s);return r;}};}
function answer(r,c,value){const q=r.m.currentQuestion(r.view);r.send({type:'draft',value:value??q.accepted[0]});r.send({type:'submit'});return q;}
function bank(r,c){for(const q of c.questionsFor(r.view.phase)){assert.equal(r.m.currentQuestion(r.view).id,q.id);answer(r,c);r.send({type:'next'});}}
function finish(r,c){bank(r,c);assert.equal(r.view.phase,'learn');r.send({type:'next'});bank(r,c);bank(r,c);r.send({type:'next'});bank(r,c);assert.equal(r.view.phase,'own');r.send({type:'own-draft',value:'A clearly fictional expression to be reviewed by a person.'});r.send({type:'finish'});}
for(const c of contents){
 test(c.lesson.id+' complete six banks, own task and correct source identity',()=>{
  assert.equal(c.questions.length,18);assert.equal(c.byId.size,18);assert.equal(c.lesson.teaching.length,3);for(const stage of stageIds){assert.equal(c.questionsFor(stage).length,3);assert.equal(new Set(c.questionsFor(stage).map(q=>q.target)).size,3);}
  const n=c.lesson.lessons[0],source=c.lesson.source;assert.deepEqual(c.lesson.lessons,[n,n+1]);assert.equal(source.groupId,`NCE1-${n}`);assert.equal(source.comicKey,source.groupId);assert.equal(source.languagePath,`/language/NCE1/${n}.json`);assert.equal(illustrations.lessons[source.comicKey].sourceSha256,source.languageSha256);assert.equal(source.clips.length,3);for(const clip of source.clips){assert.ok(c.lesson.teaching.some(t=>t.target===clip.target));assert.ok(clip.start>0&&clip.end>clip.start);assert.ok(clip.label.length>4);}assert.equal(c.lesson.own.status,'awaiting-human-review');assert.equal(c.lesson.rights,'original-authored');
 });
 test(c.lesson.id+' authored matches and meaning-changing boundaries through real factory',()=>{
  for(const q of c.questions){for(const value of q.accepted){assert.equal(c.matches(q,value),true,q.id+': '+value);assert.equal(c.matches(q,'  '+value.toUpperCase().replace(/'/g,'’')+'  '),true);}
   for(const {answer:wrong} of q.counterexamples)assert.equal(c.matches(q,wrong),false,q.id+': '+wrong);
   assert.equal(c.matches(q,''),false);assert.equal(c.matches(q,null),false);assert.equal(c.matches({...q},q.accepted[0]),false);
   if(q.form==='statement'){assert.equal(c.matches(q,q.accepted[0].replace(/[.!。！]$/u,'')+'?'),false);assert.equal(c.matches(q,q.accepted[0].replace(/[.!。！]$/u,'')+'?!'),false);}
   if(q.form==='question'){assert.equal(c.matches(q,q.accepted[0].replace(/\?$/,'')),false);assert.equal(c.matches(q,q.accepted[0].replace(/\?$/,'.')),false);assert.equal(c.matches(q,q.accepted[0]+'?'),false);assert.equal(c.matches(q,q.accepted[0].replace(/\?$/,'？')),true);}
  }
  const r=runner(c);for(const phase of stageIds){if(phase==='guided')r.send({type:'next'});if(phase==='repair')r.send({type:'next'});if(phase.startsWith('review')){if(r.view.phase==='own')r.send({type:'finish'});else r.send({type:'next'});r.time(r.view.dueAt);r.send({type:'review'});}bank(r,c);}assert.equal(r.view.attempts.length,18);assert.ok(r.view.attempts.every(a=>a.correct));
 });
 test(c.lesson.id+' help, first answers, deferred feedback, corrections and retry remain distinct',()=>{
  const r=runner(c);r.send({type:'source',source:'text'});answer(r,c);assert.equal(r.view.attempts[0].hinted,true);r.reject({type:'submit'});r.send({type:'next'});for(let i=0;i<2;i++){answer(r,c);r.send({type:'next'});}assert.equal(r.m.teachingFor(r.view)[0].target,c.questions[0].target);r.send({type:'next'});
  const guided=r.m.currentQuestion(r.view),bad=guided.counterexamples[0].answer;answer(r,c,bad);r.reject({type:'next'});r.send({type:'retry'});answer(r,c);assert.equal(r.view.attempts.at(-1).fresh,false);assert.equal(r.view.attempts.find(a=>a.id===guided.id).answer,bad);r.send({type:'next'});for(let i=0;i<2;i++){answer(r,c);r.send({type:'next'});}
  const originals=[];for(let i=0;i<3;i++){const q=r.m.currentQuestion(r.view);if(i===1)r.send({type:'help'});answer(r,c,i===0?q.counterexamples[0].answer:undefined);originals.push(structuredClone(r.view.attempts.at(-1)));r.send({type:'next'});if(i<2)assert.equal(r.view.phase,'independent');}
  assert.equal(r.view.phase,'feedback');r.reject({type:'next'});const affected=originals.filter(a=>!a.correct||a.hinted);assert.equal(affected.length,2);
  for(const a of affected){const q=c.byId.get(a.id);r.reject({type:'correct',id:a.id,answer:q.accepted[0],note:''});r.reject({type:'correct',id:a.id,answer:q.counterexamples[0].answer,note:'Incorrect correction'});r.send({type:'correct',id:a.id,answer:q.accepted[0],note:q.why});}
  r.reject({type:'correct',id:'independent-foreign',answer:'foreign',note:'foreign'});assert.deepEqual(r.view.attempts.filter(a=>a.stage==='independent'),originals);r.send({type:'next'});bank(r,c);assert.equal(r.view.phase,'own');r.send({type:'finish'});assert.equal(r.view.ownFinal.status,'not-recorded');
 });
 test(c.lesson.id+' synthetic delayed A/B, seven-day/day schedule and bank exhaustion',()=>{
  const r=runner(c);finish(r,c);const initial=r.view.attempts.map(a=>structuredClone(a));assert.equal(r.view.dueAt,r.now+DAY);r.reject({type:'review'});r.time(r.view.dueAt);r.send({type:'review'});assert.equal(r.view.phase,'review-a');bank(r,c);assert.equal(r.view.reviewResults[0].independent,true);assert.equal(r.view.dueAt,r.now+WEEK);r.send({type:'next'});r.time(r.view.dueAt);r.send({type:'review'});
  const q=r.m.currentQuestion(r.view);r.send({type:'help'});answer(r,c,q.counterexamples[0].answer);r.send({type:'next'});for(let i=0;i<2;i++){answer(r,c);r.send({type:'next'});}assert.equal(r.view.reviewResults[1].independent,false);assert.equal(r.view.dueAt,r.now+DAY);r.send({type:'next'});r.time(r.view.dueAt);r.reject({type:'review'});assert.equal(r.m.recommendation(r.view,r.now).kind,'needs-new-material');assert.deepEqual(r.view.attempts.slice(0,initial.length),initial);const receipt=r.m.receipt(r.view,r.now);assert.equal(receipt.openExpression,'awaiting-human-review');assert.equal(receipt.listening,'not-tested');assert.equal(receipt.pronunciation,'not-tested');assert.equal(receipt.mastery,'not-assessed');assert.equal(receipt.band,null);
 });
 test(c.lesson.id+' replay preserves original raw for foreign course and future content',()=>{
  const m=createCourseLoopModel(c);for(const other of contents){const raw=JSON.stringify(createCourseLoopModel(other).initialState(NOW));const restored=m.restore(raw,NOW);assert.equal(restored.ok,c.lesson.id===other.lesson.id);if(!restored.ok)assert.equal(restored.raw,raw);}
  for(const patch of [{contentVersion:999},{lessonId:'nce1-999'},{version:999}]){const raw=JSON.stringify({...m.initialState(NOW),...patch});const restored=m.restore(raw,NOW);assert.equal(restored.ok,false);assert.equal(restored.raw,raw);}
 });
}
test('question IDs isolated across all owned courses and unregistered courses reject binding',()=>{assert.equal(new Set(contents.flatMap(c=>c.questions.map(q=>q.id))).size,contents.length*18);for(const c of contents){assert.ok(!registeredCourseIds.includes(c.lesson.id));assert.throws(()=>getCourseBinding(c.lesson.id));}});
test('unchanged default CL00 factory behavior',()=>{const m=createCourseLoopModel(pilot);let a=defaults.initialState(NOW),b=m.initialState(NOW),at=NOW;assert.deepEqual(a,b);for(const q of pilot.questionsFor('diagnostic'))for(const action of [{type:'draft',value:q.accepted[0]},{type:'submit'},{type:'next'}]){const x=defaults.transition(a,action,++at),y=m.transition(b,action,at);assert.deepEqual(x,y);a=x.state;b=y.state;}assert.equal(a.lessonId,'nce1-1');});
test('formatting never erases sentence polarity or question punctuation',()=>{assert.equal(normalizedResponse('statement','It is blue?'),null);assert.equal(normalizedResponse('question','Is it blue.'),null);assert.notEqual(normalizedResponse('statement','It is blue.'),normalizedResponse('statement','It is not blue.'));assert.equal(normalizedResponse('question','Is it blue?!'),null);assert.notEqual(normalizedResponse('statement','It is blue.'),normalizedResponse('statement','It was blue.'));assert.equal(normalizedResponse('statement','Ｉｔ is blue.'),'ｉｔ is blue');});
