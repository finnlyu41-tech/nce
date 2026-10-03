import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {productionHost} from '../batch-01/production-test-binding.mjs';
import {registeredCourseIds} from '../registry.mjs';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const prefix='studio/course-loop/parallel-nce1-109-119/',docs='studio/docs/parallel-nce1-109-119/';
const baseline='7b7c1283d12f0c6d784478cda8353080598f6980';
const sha=x=>createHash('sha256').update(x).digest('hex');
test('shared production implementations and source guard are byte identical to exact frozen baseline',async()=>{
 for(const file of ['studio/course-loop/model.mjs','studio/course-loop/registry.mjs','studio/course-loop/host-contract.d.ts','studio/app/course-loop-next.ts','studio/app/course-loop-ui.tsx','studio/app/course-loop-progress.ts','studio/app/model.ts','studio/app/offline-store.ts','studio/app/today-practice.ts','studio/app/progress-file.ts','studio/app/progress-save.tsx','studio/map/model.ts']){
  const original=execFileSync('git',['show',baseline+':'+file],{cwd:root});assert.equal(sha(await readFile(new URL('../../../'+file,import.meta.url))),sha(original),file);
 }
});
test('all tracked diff and untracked delivery files stay in this content/test/docs ownership',()=>{
 const tracked=execFileSync('git',['diff','--name-only',baseline],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean);
 const untracked=execFileSync('git',['ls-files','--others','--exclude-standard'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean);
 for(const file of [...tracked,...untracked])assert.ok(file.startsWith(prefix)||file.startsWith(docs),file);
});
test('new task contexts are distinct, target banks include real first/repair/delayed material',async()=>{
 const names=(await readdir(new URL('.',import.meta.url))).filter(n=>/^lesson-nce1-\d+\.mjs$/.test(n)&&(!process.env.NCE_CONTENT_IDS||process.env.NCE_CONTENT_IDS.split(',').map(Number).includes(Number(n.match(/(\d+)\.mjs/)[1]))));
 assert.ok([3,6].includes(names.length),'A deliverable batch must have all three or all six complete modules.');
 const all=[];
 for(const name of names){const c=await import('./'+name);assert.equal(new Set(c.questions.map(q=>q.context)).size,18);assert.equal(new Set(c.questions.map(q=>q.id)).size,18);assert.ok(c.lesson.prerequisites.length);for(const stage of ['independent','repair','review-a','review-b'])assert.equal(c.questionsFor(stage).length,3);all.push(...c.questions.map(q=>q.id));}
 assert.equal(new Set(all).size,all.length);
});
test('unwired successors keep the real current route; QA registration is not production integration',async()=>{
 const host=await productionHost(),fallback=host.nodeById('nce1-109');assert.ok(fallback);
 assert.equal(registeredCourseIds.length,42);
 for(const n of [109,111,113,115,117,119])assert.equal(registeredCourseIds.includes('nce1-'+n),false,'The production registry is deliberately unchanged.');
 assert.equal(host.courseSuccessorNode('nce1-83',fallback).id,'nce1-85');const prior=host.nodeById('nce1-107');assert.ok(prior);assert.equal(host.courseSuccessorNode(prior.id,prior).id,prior.id);
 for(const n of [109,111,113,115,117,119]){const node=host.nodeById('nce1-'+n);assert.ok(node);assert.equal(host.courseSuccessorNode(node.id,node).id,node.id)}
 assert.equal(host.courseSuccessorNode('unknown-qa-course',fallback).id,'nce1-109');
});
