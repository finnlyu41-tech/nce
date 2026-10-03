import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {productionHost} from '../batch-01/production-test-binding.mjs';
import {registeredCourseIds} from '../registry.mjs';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const prefix='studio/course-loop/parallel-nce2-001-006/',docs='studio/docs/parallel-nce2-001-006/';
const baseline='d717bad909d889fd305d667bd1d8530883aaf23a';
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
 const names=(await readdir(new URL('.',import.meta.url))).filter(n=>/^lesson-nce2-\d+\.mjs$/.test(n)&&(!process.env.NCE_CONTENT_IDS||process.env.NCE_CONTENT_IDS.split(',').map(Number).includes(Number(n.match(/(\d+)\.mjs/)[1]))));
 assert.ok([3,6].includes(names.length),'A deliverable batch must have all three or all six complete modules.');
 const all=[];
 for(const name of names){const c=await import('./'+name);assert.equal(new Set(c.questions.map(q=>q.context)).size,18);assert.equal(new Set(c.questions.map(q=>q.id)).size,18);assert.ok(c.lesson.prerequisites.length);for(const stage of ['independent','repair','review-a','review-b'])assert.equal(c.questionsFor(stage).length,3);all.push(...c.questions.map(q=>q.id));}
 assert.equal(new Set(all).size,all.length);
});
test('six real NCE2 units remain unwired; no bypass from completed book one',async()=>{
 const host=await productionHost(),fallback=host.nodeById('nce2-1');assert.ok(fallback);
 assert.equal(registeredCourseIds.length,72);
 assert.equal(host.courseSuccessorNode('nce1-143',fallback).id,'chapter-6');
 for(const n of [1,2,3,4,5,6]){const id='nce2-'+n,node=host.nodeById(id),units=JSON.parse(await readFile(new URL('../../map/curriculum.json',import.meta.url))),unit=units.find(u=>u.id===id);assert.ok(node);assert.equal(registeredCourseIds.includes(id),false);assert.equal(host.courseSuccessorNode(id,node).id,id);assert.equal(node.unitId,id);assert.equal(unit.lesson,n);assert.equal(unit.lastLesson,n)}
 assert.equal(host.courseSuccessorNode('unknown-qa-course',fallback).id,'nce2-1');
 const chapter=host.nodeById(fallback.parent);assert.equal(chapter.id,'chapter-7');assert.ok(chapter.requires.includes('chapter-6'));assert.equal(host.achieved(host.nodeById('chapter-6'),host.emptyProgress()),false);
});
