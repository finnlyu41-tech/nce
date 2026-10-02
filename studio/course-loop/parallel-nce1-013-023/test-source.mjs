import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const assetRoot=process.env.NCE_ASSET_ROOT;if(!assetRoot)throw Error('Set NCE_ASSET_ROOT to existing read-only textbook package');
const numbers=process.env.NCE_CHECKPOINT==='1'?[13,15,17]:[13,15,17,19,21,23];
const index=JSON.parse(await readFile(new URL('../../app/data/nce-illustrations.json',import.meta.url))).lessons;
const grammar=JSON.parse(await readFile(new URL('../../app/data/textbook-grammar.json',import.meta.url))).entries;
const sha=b=>createHash('sha256').update(b).digest('hex');
for(const n of numbers)test('NCE1-'+n+' original source hashes, timestamp rows, grammar mapping and comic bytes',async()=>{
 const c=await import(`./lesson-nce1-${String(n).padStart(3,'0')}.mjs`),s=c.lesson.source;
 const bytes=await readFile(join(assetRoot,`language/NCE1/${n}.json`)),language=JSON.parse(bytes),comic=index[s.comicKey];
 assert.equal(language.book,'NCE1');assert.equal(language.lesson,n);assert.equal(language.sourceSha256,s.languageSha256);assert.equal(comic.sourceSha256,s.languageSha256);if(s.languageFileSha256)assert.equal(sha(bytes),s.languageFileSha256);
 assert.equal(sha(await readFile(join(assetRoot,'lesson-pages',comic.pageSha256+'.jpg'))),comic.pageSha256);
 const timestamps=language.rows.map(r=>r.time);for(const clip of s.clips){assert.ok(timestamps.includes(clip.start),'start not original row '+clip.target);assert.ok(timestamps.includes(clip.end),'end not original row '+clip.target);assert.ok(clip.end>clip.start);}
 const g=grammar.find(x=>x.book==='NCE1'&&x.lesson===n);assert.equal(g.lastLesson,n+1);assert.deepEqual(g.pages,s.grammarPages);
});
