import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const nums=[25,27,29,31,33,35];
const grammar=JSON.parse(await readFile(new URL('../app/data/textbook-grammar.json',import.meta.url))).entries;
const comics=JSON.parse(await readFile(new URL('../app/data/nce-illustrations.json',import.meta.url))).lessons;
for(const n of nums){const c=await import(`../course-loop/parallel-nce1-025-035/lesson-nce1-${String(n).padStart(3,'0')}.mjs`);
 test(`NCE1-${n}: full six-bank coverage and original target-specific teaching`,()=>{assert.equal(c.questions.length,18);assert.equal(c.lesson.teaching.length,3);assert.deepEqual(c.lesson.lessons,[n,n+1]);assert.equal(c.lesson.source.groupId,`NCE1-${n}`);assert.equal(c.lesson.source.comicKey,`NCE1-${n}`);assert.equal(c.lesson.own.status,'awaiting-human-review');assert.equal(grammar.find(g=>g.id===`NCE1-${n}`).lastLesson,n+1);for(const stage of ['diagnostic','guided','independent','repair','review-a','review-b']){assert.equal(c.questionsFor(stage).length,3);assert.equal(new Set(c.questionsFor(stage).map(q=>q.target)).size,3)}assert.equal(c.lesson.source.clips.length,3);for(const clip of c.lesson.source.clips){assert.ok(clip.start>=0&&clip.end>clip.start);assert.ok(c.lesson.teaching.some(t=>t.target===clip.target));assert.ok(clip.label.length>5)}assert.equal(new Set(c.questions.map(q=>q.context)).size,18);assert.ok(c.questions.every(q=>q.counterexamples.length>=4))});
 test(`NCE1-${n}: optional read-only asset audit agrees with language/comic sources`,async()=>{if(!process.env.NCE_SOURCE_ROOT)return;const raw=await readFile(`${process.env.NCE_SOURCE_ROOT}/language/NCE1/${n}.json`),data=JSON.parse(raw);assert.equal(createHash('sha256').update(raw).digest('hex'),c.lesson.source.languageSha256);assert.equal(data.lesson,n);assert.equal(data.book,'NCE1');assert.equal(data.sourceSha256,comics[`NCE1-${n}`].sourceSha256);for(const clip of c.lesson.source.clips){assert.ok(data.rows.some(row=>row.time===clip.start),clip.label);assert.ok(data.rows.some(row=>row.time===clip.end),clip.label)}});
}
