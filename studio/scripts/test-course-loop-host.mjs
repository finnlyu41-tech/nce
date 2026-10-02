import assert from 'node:assert/strict';
import {readFile,readdir,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url),pnpm=new URL('node_modules/.pnpm/',root),names=(await readdir(pnpm)).filter(n=>/^esbuild@\d+\.\d+\.\d+$/.test(n)).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}));
const {build}=await import(new URL(names[0]+'/node_modules/esbuild/lib/main.js',pnpm));
const output=new URL('work/course-loop-host/model.mjs',root);await mkdir(new URL('.',output),{recursive:true});
await build({stdin:{contents:`export * from './app/course-loop-progress';export * from './app/course-loop-next';export {todayPractice} from './app/today-practice';export {initial} from './app/model';export {emptyProgress} from './map/model';export {questionsFor} from './course-loop/lesson-nce1-001.mjs';`,resolveDir:fileURLToPath(root),loader:'ts'},bundle:true,platform:'node',format:'esm',target:'node22',outfile:fileURLToPath(output),logLevel:'silent'});
const {parseCourseLoop,parseLoopInputs,loopModel,courseLoopKey,nextCourse,courseLoopTask,todayPractice,initial,emptyProgress,questionsFor}=await import(output);
const now=Date.now(),start=now-3*86400000;let tick=start,s=loopModel.initialState(start);
const send=action=>{const r=loopModel.transition(s,action,++tick);assert(r.ok,r.message);s=r.state;return r.view};
const view=()=>{const r=parseCourseLoop(JSON.stringify(s),now);assert(r.ok,r.message);return r.view};
const state=()=>({...structuredClone(initial),drafts:{[courseLoopKey]:JSON.stringify(s)}}),map=emptyProgress();
assert.equal(nextCourse(initial,map,now).id,'first');assert.equal(nextCourse(state(),map,now).id,'nce1-1');
assert.equal(todayPractice(state(),map,now).filter(t=>t.href==='/map/#/learn/nce1-1').length,1);
assert.equal(view().exposures.length,1);assert.equal(view().attempts.length,0);
assert.equal(parseCourseLoop('').ok,false);assert.equal(parseCourseLoop(JSON.stringify({...s,version:2})).ok,false);assert.equal(parseCourseLoop(JSON.stringify({...s,unexpected:'unknown'})).ok,false);assert.equal(parseCourseLoop(' '.repeat(2*1024*1024+1)).ok,false);
assert.equal(parseCourseLoop(JSON.stringify({...s,createdAt:now+1}),now).ok,false);
assert.throws(()=>parseLoopInputs(''));assert.throws(()=>parseLoopInputs('{"version":2,"corrections":{}}'));assert.throws(()=>parseLoopInputs('{"version":1,"corrections":{"unseen":{"answer":"x","note":"y"}}}'));
for(const stage of ['diagnostic','guided','independent']){
 if(stage==='guided'){assert.equal(view().phase,'learn');send({type:'next'})}
 for(const [i,q] of questionsFor(stage).entries()){
  if(stage==='independent'&&i===0)send({type:'source',source:'text'});
  send({type:'draft',value:stage==='independent'&&i===1?'Yes, I am.':q.accepted[0]});send({type:'submit'});send({type:'next'});
 }
}
assert.equal(view().phase,'feedback');const originals=structuredClone(view().attempts);
for(const a of view().attempts.filter(a=>a.stage==='independent'&&(!a.correct||a.hinted))){const q=questionsFor('independent').find(q=>q.id===a.id);send({type:'correct',id:a.id,answer:q.accepted[0],note:'确认的是物品，保留首答并写出改动理由。'})}
assert.deepEqual(view().attempts,originals);send({type:'next'});
for(const q of questionsFor('repair')){send({type:'draft',value:q.accepted[0]});send({type:'submit'});send({type:'next'})}
send({type:'own-draft',value:'Is this your phone? Yes, it is.'});send({type:'finish'});
const due=view().dueAt;assert.equal(due,tick+86400000);assert.equal(nextCourse(state(),map,due-1).id,'nce1-3');assert.equal(courseLoopTask(state(),due-1),null);assert.equal(loopModel.transition(s,{type:'review'},due-1).ok,false);
assert.equal(nextCourse(state(),{...emptyProgress(),lastNode:'nce1-25',access:{all:true,nodes:[]}},due-1).id,'nce1-25','Waiting pilot never pins an advanced route back to lesson 3');
assert.equal(nextCourse(state(),map,due).id,'nce1-1');assert.equal(todayPractice(state(),map,due).filter(t=>t.href==='/map/#/learn/nce1-1').length,1);
tick=due;send({type:'review'});assert.equal(view().phase,'review-a');
for(const q of questionsFor('review-a')){send({type:'draft',value:q.accepted[0]});send({type:'submit'});send({type:'next'})}
assert.equal(view().reviewResults.at(-1).independent,true);assert.equal(view().dueAt,tick+604800000);assert.deepEqual(view().attempts.slice(0,originals.length),originals);
assert.deepEqual(map,emptyProgress());assert.equal(initial.flashcards,undefined);
console.log('PASS 8 host-envelope, first-exposure, source-assistance, immutable correction, single-selector, 24h gate, new-bank/7d and unchanged map/FSRS groups (synthetic timestamps).');
