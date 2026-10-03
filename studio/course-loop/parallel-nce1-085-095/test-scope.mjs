import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {productionHost} from '../batch-01/production-test-binding.mjs';
import {registeredCourseIds} from '../registry.mjs';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const prefix='studio/course-loop/parallel-nce1-085-095/',docs='studio/docs/parallel-nce1-085-095/';
// The original content-only ownership receipt remains frozen in its two commits.
// This test now runs after the publisher integrated the complete 54-group host.
const baseline='7b7c1283d12f0c6d784478cda8353080598f6980';
// Use the byte-identical cherry-picked ancestors so a fresh release clone also
// has every Git object required by these guards.
const integrated='8d7f0d10578e110fba96a0f2c40b7d29d5a27b01';
const localRecords='9fbda71620e13d4fda80b39eda150d1fa79693b5';
const wired=new Set(['studio/course-loop/registry.mjs','studio/course-loop/host-contract.d.ts','studio/app/course-loop-next.ts']);
const recordFiles=new Set(['studio/README.md','studio/docs/grammar-material-exposure-v45.md']);
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'});
const lines=value=>value.trim().split('\n').filter(Boolean);
const sha=x=>createHash('sha256').update(x).digest('hex');
test('shared production implementations and source guard are byte identical to exact frozen baseline',async()=>{
 for(const file of ['studio/course-loop/model.mjs','studio/course-loop/registry.mjs','studio/course-loop/host-contract.d.ts','studio/app/course-loop-next.ts','studio/app/course-loop-ui.tsx','studio/app/course-loop-progress.ts','studio/app/model.ts','studio/app/offline-store.ts','studio/app/today-practice.ts','studio/app/progress-file.ts','studio/app/progress-save.tsx','studio/map/model.ts']){
  const original=execFileSync('git',['show',(wired.has(file)?integrated:baseline)+':'+file],{cwd:root});assert.equal(sha(await readFile(new URL('../../../'+file,import.meta.url))),sha(original),file);
 }
});
test('frozen author commits stay in content/test/docs ownership and publisher delta stays explicitly bounded',async()=>{
 for(const commit of ['db1a085a4cd661b4fa1bd2b0906b12817d500d29','883f54f194783009a1b5216281abfb5a283c98d6']){
  const files=lines(git('diff','--name-only',commit+'^',commit));assert.ok(files.length);
  for(const file of files)assert.ok(file.startsWith(prefix)||file.startsWith(docs),file);
 }
 const approved=new Set(lines(git('diff','--name-only',baseline,integrated)));
 const scopedTest=prefix+'test-scope.mjs';
 const tracked=lines(git('diff','--name-only',baseline));
 const untracked=lines(git('ls-files','--others','--exclude-standard'));
 for(const file of tracked){
  assert.ok(approved.has(file)||recordFiles.has(file),file);
  if(file!==scopedTest){
   const pin=recordFiles.has(file)?localRecords:integrated;
   assert.equal(sha(await readFile(new URL('../../../'+file,import.meta.url))),sha(execFileSync('git',['show',pin+':'+file],{cwd:root})),file);
  }
 }
 for(const file of untracked)assert.ok(file.startsWith(prefix)||file.startsWith(docs),file);
});
test('new task contexts are distinct, target banks include real first/repair/delayed material',async()=>{
 const names=(await readdir(new URL('.',import.meta.url))).filter(n=>/^lesson-nce1-\d+\.mjs$/.test(n)&&(!process.env.NCE_CONTENT_IDS||process.env.NCE_CONTENT_IDS.split(',').map(Number).includes(Number(n.match(/(\d+)\.mjs/)[1]))));
 assert.ok([3,6].includes(names.length),'A deliverable batch must have all three or all six complete modules.');
 const all=[];
 for(const name of names){const c=await import('./'+name);assert.equal(new Set(c.questions.map(q=>q.context)).size,18);assert.equal(new Set(c.questions.map(q=>q.id)).size,18);assert.ok(c.lesson.prerequisites.length);for(const stage of ['independent','repair','review-a','review-b'])assert.equal(c.questionsFor(stage).length,3);all.push(...c.questions.map(q=>q.id));}
 assert.equal(new Set(all).size,all.length);
});
test('integrated successors advance while unregistered and unknown successors keep the real current route',async()=>{
 const host=await productionHost(),fallback=host.nodeById('nce1-85');assert.ok(fallback);
 assert.deepEqual(registeredCourseIds,Array.from({length:54},(_,i)=>'nce1-'+(2*i+1)));
 assert.deepEqual(registeredCourseIds.slice(0,42),Array.from({length:42},(_,i)=>'nce1-'+(2*i+1)),'The original registrations remain in their exact order.');
 assert.equal(host.courseSuccessorNode('nce1-83',fallback).id,'nce1-85');
 for(const n of [85,87,89,91,93,95]){const node=host.nodeById('nce1-'+n);assert.ok(node);assert.equal(host.courseSuccessorNode(node.id,node).id,'nce1-'+(n+2))}
 for(const n of [109,111]){const node=host.nodeById('nce1-'+n);assert.ok(node);assert.equal(registeredCourseIds.includes(node.id),false);assert.equal(host.courseSuccessorNode(node.id,node).id,node.id)}
 assert.equal(host.courseSuccessorNode('unknown-qa-course',fallback).id,'nce1-85');
});
