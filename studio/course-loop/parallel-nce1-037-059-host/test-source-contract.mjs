/** Read-only source integration checks. Execute the untouched SourcePanel
 * acceptance expression and actual production comic guard; no UI fixture. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {productionHost} from './binding.mjs';

const root=new URL('../../',import.meta.url),assets=new URL('dist-online/',root);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async url=>JSON.parse(await readFile(url,'utf8'));
const [host,ui,manifest,index,comics,pages]=await Promise.all([
 productionHost(),readFile(new URL('app/course-loop-ui.tsx',root),'utf8'),
 json(new URL('materials/manifest.json',assets)),json(new URL('language/index.json',assets)),
 json(new URL('app/data/nce-illustrations.json',root)),json(new URL('app/data/nce-pages.json',root)),
]);
const panel=ui.slice(ui.indexOf('function SourcePanel('));
const predicates=[...panel.matchAll(/const valid=([^;]+);setLanguage\(valid\?result:null\)/g)];
assert.equal(predicates.length,1,'find one exact production SourcePanel acceptance expression');
// This is the actual source expression, extracted rather than restated in tests.
const accepts=new Function('result','lesson','first',`return (${predicates[0][1]});`);
const IDS=Array.from({length:30},(_,i)=>`nce1-${1+2*i}`);
assert.deepEqual(host.courseLoopBindings.map(course=>course.id),IDS,'actual production registry must contain the thirty selected groups');
const sources=Object.fromEntries(await Promise.all(IDS.map(async id=>{
 const {lesson}=host.courseLoopFor(id),first=lesson.lessons[0],path=`language/${lesson.book}/${first}.json`,bytes=await readFile(new URL(path,assets)),language=JSON.parse(bytes);
 const lrc=manifest.files.filter(f=>f.book===lesson.book&&f.lesson===first&&f.textFormat==='lrc'&&f.sha256===language.sourceSha256);
 assert.equal(lrc.length,1,`${id}: actual transcript has one matching packaged LRC`);
 const lrcBytes=Buffer.concat(await Promise.all(lrc[0].parts.map(part=>readFile(new URL(part.path.slice(1),assets)))));
 return [id,{lesson,first,path,bytes,language,lrc:lrc[0],lrcBytes,comic:comics.lessons[`${lesson.book}-${first}`]}];
})));

for(const id of IDS)test(`${id}: authored source agrees with JSON transcript, original LRC and comic metadata`,async()=>{
 const {lesson,first,path,bytes,language,lrc,lrcBytes,comic}=sources[id];
 assert.equal(lesson.book,'NCE1');assert.equal(first,Number(id.slice(5)));assert.equal(first%2,1);assert.deepEqual(lesson.lessons,[first,first+1]);
 assert.equal(lesson.source.languagePath,`/${path}`);assert.equal(lesson.source.comicKey,`NCE1-${first}`);assert.equal(lesson.source.groupId,`NCE1-${first}`);
 assert.equal(language.version,1);assert.equal(language.book,lesson.book);assert.equal(language.lesson,first);
 assert.match(lesson.source.languageSha256,/^[a-f0-9]{64}$/);assert.equal(lesson.source.languageSha256,language.sourceSha256);
 if(Object.hasOwn(lesson.source,'sourceSha256'))assert.equal(lesson.source.sourceSha256,language.sourceSha256);
 assert.equal(lrc.book,lesson.book);assert.equal(lrc.lesson,first);assert.equal(lrc.sha256,language.sourceSha256);assert.equal(sha(lrcBytes),lrc.sha256);assert.equal(lrcBytes.length,lrc.size);
 assert.equal(comic.sourceSha256,language.sourceSha256);assert.equal(comics.sources[lesson.book],pages[lesson.book].sourceSha256);
 assert.equal(accepts(language,lesson,first),true,`${id}: unchanged SourcePanel guard must accept the real source`);
 // JSON bytes have their own identity; never use it as the original LRC hash.
 const fileSha=sha(bytes);assert.equal(index.files[`${lesson.book}/${first}.json`].sha256,fileSha);assert.equal(index.files[`${lesson.book}/${first}.json`].size,bytes.length);
 assert.notEqual(fileSha,language.sourceSha256);if(Object.hasOwn(lesson.source,'languageFileSha256'))assert.equal(lesson.source.languageFileSha256,fileSha);
 const picture=await readFile(new URL(`lesson-pages/${comic.pageSha256}.jpg`,assets));assert.equal(sha(picture),comic.pageSha256);
});

test('exact SourcePanel guard accepts only the matching source in all 30 by 30 pairs',()=>{
 assert.equal(new Set(IDS.map(id=>sources[id].language.sourceSha256)).size,30);
 for(const receiver of IDS)for(const sender of IDS){const r=sources[receiver],s=sources[sender];assert.equal(accepts(s.language,r.lesson,r.first),receiver===sender,`${sender} textbook to ${receiver}`)}
});

test('exact SourcePanel guard rejects hash tampering, JSON-byte-hash substitution and wrong book or lesson',()=>{
 for(const id of IDS){const {language,lesson,first,bytes}=sources[id],before=JSON.stringify({language,lesson});
  for(const candidate of [null,{...language,sourceSha256:'0'.repeat(64)},{...language,sourceSha256:sha(bytes)},{...language,sourceSha256:language.sourceSha256.toUpperCase()},{...language,book:'NCE2'},{...language,lesson:first+1},{...language,lesson:String(first)}])assert.equal(!!accepts(candidate,lesson,first),false,`${id}: corrupted source must fail`);
  const wrongContent={...structuredClone(lesson),source:{...lesson.source,languageSha256:'f'.repeat(64)}};assert.equal(accepts(language,wrongContent,first),false);
  assert.equal(JSON.stringify({language,lesson}),before);
 }
});

test('actual comic guard accepts only same-course source and body row count in all 30 by 30 pairs',()=>{
 assert.equal(typeof host.lessonIllustration,'function');assert.equal(typeof host.splitLesson,'function');
 for(const receiver of IDS){const r=sources[receiver],rows=host.splitLesson(r.language.rows,r.language.book,true).body,before=JSON.stringify(r.language);
  assert.equal(rows.length,r.comic.linePanels.length);
  for(const sender of IDS){const s=sources[sender],entry=host.lessonIllustration(r.lesson.book,r.first,s.language.sourceSha256,rows.length);if(sender===receiver)assert.deepEqual(entry,r.comic);else assert.equal(entry,null,`${sender} comic identity to ${receiver}`)}
  for(const hash of ['0'.repeat(64),sha(r.bytes),undefined])assert.equal(host.lessonIllustration(r.lesson.book,r.first,hash,rows.length),null);
  assert.equal(host.lessonIllustration(r.lesson.book,r.first,r.language.sourceSha256,rows.length+1),null);
  assert.equal(host.lessonIllustration('NCE2',r.first,r.language.sourceSha256,rows.length),null);
  assert.equal(host.lessonIllustration(r.lesson.book,r.first+1,r.language.sourceSha256,rows.length),null);
  assert.equal(JSON.stringify(r.language),before);
 }
});

test('audio clip intervals stay within the matching LRC timeline and use teaching targets from this course',()=>{
 for(const id of IDS){const {lesson,language,lrc}=sources[id],targets=new Set(lesson.teaching.map(t=>t.target)),firstTime=language.rows[0]?.time;
  assert.ok(Number.isFinite(firstTime));assert.equal(lrc.textFormat,'lrc');assert.ok(lesson.source.clips.length>0);
  for(const clip of lesson.source.clips){assert.ok(targets.has(clip.target),`${id}: clip target belongs to selected teaching`);assert.ok(Number.isFinite(clip.start)&&Number.isFinite(clip.end));assert.ok(clip.start>=firstTime&&clip.end>clip.start,`${id}: ordered clip interval`);assert.ok(clip.start<=lrc.lastTimestamp,`${id}: clip begins inside actual transcript`)}
 }
});
