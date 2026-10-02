import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root=new URL('../',import.meta.url),read=async p=>JSON.parse(await readFile(new URL(p,root),'utf8'));
test('coverage ledger is reproducible against hashed source files',()=>{execFileSync(process.execPath,[new URL('./audit.mjs',import.meta.url).pathname,'--check'],{stdio:'pipe'})});
test('all 348 course numbers map exactly once to 276 real groups; 168 maps and 108 accessible supplements remain distinct',async()=>{
 const {entries}=await read('app/data/textbook-grammar.json'),pages=await read('app/data/nce-pages.json');const all=[];
 for(const e of entries){assert.ok(e.lastLesson>=e.lesson);for(let n=e.lesson;n<=e.lastLesson;n++){assert.ok(pages[e.book].starts[n]);all.push(`${e.book}-${n}`)}}
 assert.equal(entries.length,276);assert.equal(all.length,348);assert.equal(new Set(all).size,348);
 for(const [book,count] of Object.entries({NCE1:144,NCE2:96,NCE3:60,NCE4:48}))for(let n=1;n<=count;n++)assert.ok(all.includes(`${book}-${n}`));
 assert.equal(entries.filter(e=>e.book==='NCE1'||e.book==='NCE2').length,168);assert.equal(entries.filter(e=>e.book==='NCE3'||e.book==='NCE4').length,108);
});
test('pilot media locators match existing first-lesson source binding without copying or changing media',async()=>{
 const {lesson}=await import('./lesson-nce1-001.mjs'),comics=await read('app/data/nce-illustrations.json');assert.equal(comics.lessons[lesson.source.comicKey].sourceSha256,lesson.source.languageSha256);
 const curriculum=await readFile(new URL('map/curriculum.ts',root),'utf8');for(const c of lesson.source.clips)assert.ok(curriculum.includes(`clip(1, ${c.start}, ${c.end})`));
});
test('grammar association is shared content, never falsely counted as 276 bespoke loops',async()=>{const a=await read('docs/course-loop-audit.json');assert.equal(a.counts.sharedGuides,97);assert.equal(a.counts.grammarUnits,28);assert.equal(a.counts.grammarQuestions,168);const csv=await readFile(new URL('docs/course-loop-groups-coverage.csv',root),'utf8');assert.equal(csv.split('not-established-per-lesson').length-1,276)});
