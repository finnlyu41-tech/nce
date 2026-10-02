import assert from 'node:assert/strict';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url),pnpm=new URL('node_modules/.pnpm/',root),versions=(await readdir(pnpm)).filter(n=>/^esbuild@\d+\.\d+\.\d+$/.test(n)).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}));
const {build}=await import(new URL(`${versions[0]}/node_modules/esbuild/lib/main.js`,pnpm));
await mkdir(new URL('work/mini-task/',root),{recursive:true});
const output=new URL('work/mini-task/test-model.mjs',root);
await build({stdin:{contents:`export * from './mini-task/model';export * from './mini-task/content';export * from './mini-task/adapter';export * from './mini-task/manifest';export * from './mini-task/route';export {initial} from './app/model';export {emptyProgress} from './map/model';export {courseLoopBindings} from './app/course-loop-progress';export {todayPractice} from './app/today-practice';`,resolveDir:fileURLToPath(root),loader:'ts'},bundle:true,platform:'node',format:'esm',target:'node22',outfile:fileURLToPath(output),logLevel:'silent'});
const m=await import(output),now=Date.now(),checks=[];
const check=(name,fn)=>{fn();checks.push(name);console.log('PASS '+name)};
function ownCourse(binding){let at=now-10*m.DAY,s=binding.model.initialState(at),r=binding.model.restore(JSON.stringify(s),now);let safety=0;while(r.view.phase!=='own'){
 assert(++safety<150);const q=binding.model.currentQuestion(r.view);let a;if(q){const last=r.view.attempts.at(-1);if(last?.id===q.id&&last.exposure===r.view.exposures.filter(e=>e.id===q.id).length)a={type:'next'};else if(r.view.draft===q.accepted[0])a={type:'submit'};else a={type:'draft',value:q.accepted[0]}}else a={type:'next'};
 r=binding.model.transition(s,a,++at);assert(r.ok,r.message);s=r.state;
 }return s}
const state=structuredClone(m.initial),map=m.emptyProgress(),loops={};for(const b of m.courseLoopBindings){loops[b.id]=ownCourse(b);state.drafts[b.key]=JSON.stringify(loops[b.id])}
check('6 group identities and explicit 12 lesson bindings / partial-target gaps',()=>{
 assert.equal(m.miniTasks.length,6);assert.equal(new Set(m.miniTasks.map(t=>t.groupId)).size,6);assert.deepEqual(m.lessonBindings.map(b=>b.lesson),Array.from({length:12},(_,i)=>i+1));
 assert.deepEqual(m.miniTasks.map(t=>t.skill),['listening','reading','speaking','writing','listening','reading']);
 for(const row of m.lessonBindings){assert(row.target&&row.prerequisite&&row.sharedReason&&row.uncovered.length);assert.equal(row.coverage,'partial-target');assert.equal(m.getMiniTask(row.taskId).courseId,row.courseId)}
 for(const t of m.miniTasks){assert.equal(m.parseMiniTaskRoute('#/mini-task/'+t.id).taskId,t.id);assert.equal(t.items.length,5);assert.equal(new Set(t.items.map(i=>i.material)).size,5);assert.equal(t.calibration,'uncalibrated')}
 for(const hash of ['#/mini-task/unknown','#/mini-task/%GG','#/mini-task/mini-n1-01/extra','#/mini-task/mini-n1-01?auto=1'])assert.equal(m.parseMiniTaskRoute(hash),null);assert.equal(m.miniTasks.filter(t=>t.track==='general-training')[0].skill,'writing');assert(!m.miniTasks.some(t=>t.track==='academic'));
});
check('graded prerequisites, no fixed hub index and one task per paired group',()=>{
 assert.equal(m.miniPracticeTasks(m.initial,now).length,0);assert.equal(m.miniPracticeTasks(state,now).length,6);assert.equal(m.miniPracticeTasks(state,now,false).length,0);
 for(const t of m.miniTasks){assert(m.miniPrerequisite(state,t.courseId,now).eligible);assert.equal(m.miniTaskForCourseExit(state,t.courseId,now).taskId,t.id)}
 assert.equal(new Set(m.miniPracticeTasks(state,now).map(t=>t.id)).size,6);
 for(const task of m.miniPracticeTasks(state,now))assert(task.priority>2&&task.priority<4);
});
const finalSnapshots={};
for(const task of m.miniTasks){
 let at=now-9*m.DAY,s=m.initialMini(task.id,at),r=m.restoreMini(JSON.stringify(s),now,task.id);
 const send=a=>{const n=m.transitionMini(s,a,++at);assert(n.ok,n.message);s=n.snapshot;r=n;assert.deepEqual(m.restoreMini(JSON.stringify(s),now,task.id).view,r.view);return n.view};
 check(task.id+' first answers/help/exposure/refresh/finite A-B',()=>{
  assert.equal(r.view.phase,'teaching');send({type:'next'});
  for(const bank of ['guided','independent','repair','delayed-a','delayed-b']){
   if(bank.startsWith('delayed')){assert.equal(r.view.phase,'waiting');assert(!m.transitionMini(s,{type:'review'},r.view.dueAt-1).ok);at=r.view.dueAt;send({type:'review'})}
   const q=m.itemFor(task.id,r.view);assert.equal(q.bank,bank);
   if(bank==='independent')send({type:'help'});
   if(task.skill==='listening'){assert(!m.transitionMini(s,{type:'submit'},at).ok);send({type:'audio-ended'})}
   if(task.skill==='speaking'){assert(!m.transitionMini(s,{type:'submit'},at).ok);send({type:'speech-captured',durationMs:1500,bytes:15000})}
   if(task.skill!=='speaking')send({type:'draft',value:q.accepted[0]||'I am a teacher. Are you an engineer?'});
   const originals=structuredClone(r.view.attempts);send({type:'submit'});assert.equal(r.view.phase,'feedback');assert.deepEqual(r.view.attempts.slice(0,-1),originals);assert(!m.transitionMini(s,{type:'submit'},at).ok);
   const last=r.view.attempts.at(-1);assert.equal(last.independent,!['guided','independent'].includes(bank));
   if(['speaking','writing'].includes(task.skill)){assert.equal(last.matched,null);assert.equal(last.status,'awaiting-external-review')}
   send({type:'correction-draft',value:'Revised local text',note:'One reason'});assert.equal(r.view.correctionDraft,'Revised local text');
   const first=structuredClone(r.view.attempts);send({type:'correct',value:'Revised local text',note:'One reason'});assert.deepEqual(r.view.attempts,first);send({type:'next'});
  }
  assert.equal(r.view.phase,'exhausted');assert.equal(r.view.reviewCount,2);assert.equal(r.view.exposures.filter(e=>e.kind==='question').length,5);assert.equal(r.view.attempts.length,5);assert(!m.transitionMini(s,{type:'review'},at).ok);finalSnapshots[task.id]=s;
 });
 check(task.id+' text modality and exact-envelope/future/corruption preserved',()=>{
  let snap=m.initialMini(task.id,now-1000);let p=m.transitionMini(snap,{type:'next'},now-999);assert(p.ok);snap=p.snapshot;
  if(['listening','speaking'].includes(task.skill)){
   p=m.transitionMini(snap,{type:'text-mode'},now-998);assert(p.ok);snap=p.snapshot;p=m.transitionMini(snap,{type:'draft',value:'local text only'},now-997);snap=p.snapshot;p=m.transitionMini(snap,{type:'submit'},now-996);assert(p.ok);assert.equal(p.view.attempts[0].modality,'text');assert.equal(p.view.attempts[0].independent,false);
  }
  for(const bad of ['',JSON.stringify({...s,version:2}),JSON.stringify({...s,extra:true}),JSON.stringify({...s,createdAt:now+1}),JSON.stringify({...s,events:[{type:'finish',at:now}]}),' '.repeat(256*1024+1)]){const v=m.restoreMini(bad,now,task.id);assert.equal(v.ok,false);assert.equal(v.raw,bad)}
  assert(!m.restoreMini(JSON.stringify(s),now,m.miniTasks.find(t=>t.id!==task.id).id).ok);
 });
}
check('no CL, map, FSRS, score or completion mutation; finite pool omitted from Today',()=>{
 const saved=structuredClone(state),original=JSON.stringify({state,map});for(const s of Object.values(finalSnapshots))Object.assign(saved,m.withMiniSnapshot(saved,s,now));
 for(const key of Object.keys(state.drafts))assert.equal(saved.drafts[key],state.drafts[key]);
 assert.deepEqual({...saved,drafts:state.drafts},state);assert.equal(JSON.stringify({state,map}),original);assert.equal(m.miniPracticeTasks(saved,now).length,0);
 const c=m.miniTasks[0],unknown={...state,drafts:{...state.drafts,[m.miniDraftKey(c.id)]:'{"version":999}'}};assert.equal(m.miniPracticeTasks(unknown,now).filter(t=>t.id==='mini-task:'+c.groupId).length,1);assert.equal(unknown.drafts[m.miniDraftKey(c.id)],'{"version":999}');
});
// Exercise actual legacy writer + re-read/conflict protocol in an empty synthetic store.
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
globalThis.window=new EventTarget();Object.defineProperty(globalThis,'navigator',{value:{locks:{request:async(_name,_options,callback)=>callback()}},configurable:true});globalThis.BroadcastChannel=undefined;
const task=m.miniTasks[0];memory.set('english-studio-v1',JSON.stringify(state));let expected=await m.readMiniTask(task.id);let next=m.initialMini(task.id,now-100);
const unrelated=structuredClone(state);unrelated.drafts['other-author']='keep concurrent data';memory.set('english-studio-v1',JSON.stringify(unrelated));
let confirmed=await m.commitMiniTask(expected,next);assert.equal(confirmed.state.drafts['other-author'],'keep concurrent data');assert.equal(confirmed.raw,JSON.stringify(next));checks.push('actual guarded legacy writer preserves concurrent unrelated State fields');
await assert.rejects(m.commitMiniTask(expected,next),/另一页面/);await assert.rejects(m.commitMiniTask(confirmed,{...next,taskId:m.miniTasks[1].id}),/不一致/);await assert.rejects(m.commitMiniTask(confirmed,next,()=>false));checks.push('stale same-task writes, mismatched targets and invalidated controller refused');
memory.set('english-studio-v1',JSON.stringify(m.initial));await assert.rejects(m.commitMiniTask(await m.readMiniTask(task.id),next),/前提/);checks.push('adapter refuses first write without graded prerequisite');
const review=JSON.parse(await readFile(new URL('mini-task/blind-review.json',root),'utf8'));assert.equal(review.completedItemCount,30);
const answers=review.items||review.reviews||review.tasks;assert(answers);assert.equal(answers.length,30);let closed=0;for(const t of m.miniTasks)for(const q of t.items){const row=answers.find(a=>a.itemId===q.id);assert(row);if(q.accepted.length){assert(q.accepted.some(a=>a.toLowerCase()===row.answer.toLowerCase()),q.id);closed++}else{assert.equal(q.accepted.length,0)}}assert.equal(closed,20);checks.push('blind solutions match all 20 closed keys; 10 open responses stay ungraded');
const fixtures={state,loops,finalSnapshots};await writeFile(new URL('work/mini-task/fixtures.json',root),JSON.stringify(fixtures,null,2));
await writeFile(new URL('work/mini-task/model-validation.json',root),JSON.stringify({at:new Date().toISOString(),syntheticTimestamps:true,checks,groupCount:6,explicitLessonBindings:12,coverage:'partial-target',naturalDelayVerified:false},null,2)+'\n');
console.log(`PASS ${checks.length} R12 model/host/content groups; synthetic dates do not establish natural-delay mastery.`);
