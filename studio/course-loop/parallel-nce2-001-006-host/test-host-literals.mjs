import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {registeredCourseIds,getCourseBinding} from '../registry.mjs';
test('78 CourseIds and exact book-discriminated source literals retain72 NCE1 and add6 NCE2',async()=>{
 const s=await readFile(new URL('../host-contract.d.ts',import.meta.url),'utf8');
 assert.deepEqual([...s.match(/export type CourseId = ([^;]+);/)[1].matchAll(/'(nce[12]-\d+)'/g)].map(m=>m[1]),registeredCourseIds);assert.equal(registeredCourseIds.length,78);
 for(const book of ['NCE1','NCE2']){const branch=s.match(new RegExp("book:'"+book+"';lesson:([^;]+);comicKey:([^;]+);clip\\?:"));assert.ok(branch);const bindings=registeredCourseIds.map(getCourseBinding).filter(b=>b.lesson.book===book);assert.deepEqual(branch[1].split('|').map(Number),bindings.map(b=>b.lesson.lessons[0]));assert.deepEqual([...branch[2].matchAll(/'(NCE[12]-\d+)'/g)].map(m=>m[1]),bindings.map(b=>b.lesson.source.groupId));}
 assert.ok(s.includes("export type SourceKind = 'text' | 'audio' | 'comic' | 'video';"));
});
test('all learner-facing shared course labels format source lesson arrays without undefined',async()=>{
 for(const name of ['course-loop-ui.tsx','course-loop-next.ts','course-loop-summary-ui.tsx']){const s=await readFile(new URL('../../app/'+name,import.meta.url),'utf8');assert.ok(!s.includes('lessons[1]'));assert.ok(s.includes("lessons.join('–')"));}
});
