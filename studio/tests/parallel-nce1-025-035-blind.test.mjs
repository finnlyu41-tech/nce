/** Frozen answers written by independent prompt-only reviewers, through the real factory. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const proof=new URL('../docs/parallel-nce1-025-035-proof/',import.meta.url);
const root=new URL('../../',import.meta.url);
for(const name of ['final-blind-cases-025-029.json','resume-blind-cases-025-029.json','final-blind-cases-031-035.json']){
 test(`${name}: every independent meaning/format judgement survives actual production factory submission`,()=>{
  const output=execFileSync(process.execPath,['studio/tests/parallel-nce1-025-035-probe.mjs',new URL(name,proof).pathname],{cwd:root.pathname,maxBuffer:16*1024*1024,encoding:'utf8'});
  const cases=JSON.parse(output);assert.ok(cases.length>=300);
  const mismatches=cases.filter(c=>c.correct!==c.expected);assert.deepEqual(mismatches,[]);
  for(const id of new Set(cases.map(c=>c.id)))assert.ok(cases.some(c=>c.id===id&&c.role==='first'&&c.expected&&c.correct),id);
 });
}
test('frozen six-course semantic hashes still bind questions, explanations and source metadata',async()=>{
 const binding=JSON.parse(await readFile(new URL('resume-content-binding.json',proof)));
 for(const [id,digest] of Object.entries(binding.semanticSha256)){
  const n=id.split('-').at(-1).padStart(3,'0');const c=await import(`../course-loop/parallel-nce1-025-035/lesson-nce1-${n}.mjs`);
  const {contentStatus,...lesson}=c.lesson;
  assert.equal(createHash('sha256').update(JSON.stringify({lesson,questions:c.questions})).digest('hex'),digest,id);
 }
});
