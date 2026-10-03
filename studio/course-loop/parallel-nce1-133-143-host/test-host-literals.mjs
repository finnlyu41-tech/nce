/** The public host contract must admit exactly the real registered source IDs. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {registeredCourseIds,getCourseBinding} from '../registry.mjs';
test('CourseId, source lesson and comicKey literals cover the actual 72 bindings exactly',async()=>{
 const contract=await readFile(new URL('../host-contract.d.ts',import.meta.url),'utf8');
 const course=contract.match(/export type CourseId = ([^;]+);/);assert.ok(course);
 const courseIds=[...course[1].matchAll(/'(nce1-\d+)'/g)].map(m=>m[1]);
 assert.deepEqual(courseIds,registeredCourseIds);assert.equal(new Set(courseIds).size,72);
 const source=contract.match(/showSource\(input:\{kind:SourceKind;book:'NCE1';lesson:([^;]+);comicKey:([^;]+);clip\?:/);assert.ok(source);
 const lessonIds=source[1].split('|').map(Number),comicKeys=[...source[2].matchAll(/'(NCE1-\d+)'/g)].map(m=>m[1]);
 assert.deepEqual(lessonIds,registeredCourseIds.map(id=>getCourseBinding(id).lesson.lessons[0]));
 assert.deepEqual(comicKeys,registeredCourseIds.map(id=>getCourseBinding(id).lesson.source.groupId));
 assert.equal(new Set(lessonIds).size,72);assert.equal(new Set(comicKeys).size,72);
 assert.equal(contract.match(/export type SourceKind = ([^;]+);/)?.[1],"'text' | 'audio' | 'comic' | 'video'");
});
