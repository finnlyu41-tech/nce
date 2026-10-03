/** Unregistered candidate source preflight. Actual production registry/guards
 * are retained; authored modules are imported directly without registering. */
import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {productionHost} from '../batch-01/production-test-binding.mjs';
import {registeredCourseIds,getCourseBinding} from '../registry.mjs';

const root=new URL('../../',import.meta.url),assets=new URL('dist-online/',root);
const sha=value=>createHash('sha256').update(value).digest('hex');
const json=async url=>JSON.parse(await readFile(url,'utf8'));
const CANDIDATES=Array.from({length:12},(_,i)=>109+2*i),OLD=Array.from({length:54},(_,i)=>`nce1-${1+2*i}`);
const contents=await Promise.all(CANDIDATES.map(n=>import(`../parallel-nce1-${n<120?'109-119':'121-131'}/lesson-nce1-${n}.mjs`)));
const [host,ui,manifest,index,comics,pages,grammar,grammarIndex,pageIndex]=await Promise.all([
 productionHost(),readFile(new URL('app/course-loop-ui.tsx',root),'utf8'),
 json(new URL('materials/manifest.json',assets)),json(new URL('language/index.json',assets)),
 json(new URL('app/data/nce-illustrations.json',root)),json(new URL('app/data/nce-pages.json',root)),
 json(new URL('app/data/textbook-grammar.json',root)),json(new URL('grammar/index.json',assets)),json(new URL('lesson-pages/index.json',assets)),
]);
const predicate=[...ui.slice(ui.indexOf('function SourcePanel(')).matchAll(/const valid=([^;]+);setLanguage\(valid\?result:null\)/g)];
assert.equal(predicate.length,1,'one exact untouched SourcePanel predicate');
const accepts=new Function('result','lesson','first',`return (${predicate[0][1]});`);
const source=async lesson=>{const first=lesson.lessons[0],path=`language/${lesson.book}/${first}.json`,bytes=await readFile(new URL(path,assets)),language=JSON.parse(bytes);return {lesson,first,path,bytes,language}};
const candidateSources=await Promise.all(contents.map(c=>source(c.lesson)));
const oldSources=await Promise.all(OLD.map(id=>source(getCourseBinding(id).lesson)));
const checks=[],records=[];
function checked(name,body){test(name,async()=>{try{await body();checks.push({name,passed:true})}catch(error){checks.push({name,passed:false,error:String(error)});throw error}})}
after(async()=>{
 const dir=new URL('docs/parallel-nce1-109-131-host/',root);await mkdir(dir,{recursive:true});
 await writeFile(new URL('source-preflight.json',dir),JSON.stringify({
  candidateTreeHead:execFileSync('git',['rev-parse','HEAD'],{cwd:fileURLToPath(root),encoding:'utf8'}).trim(),
  registeredIds:[...registeredCourseIds],candidateIds:contents.map(c=>c.lesson.id),candidateRegistration:'unregistered',
  sourcePanelPredicateSha256:sha(predicate[0][1]),sourcePanelFileSha256:sha(ui),testFileSha256:sha(await readFile(new URL('./test-source-preflight.mjs',import.meta.url))),
  checks,passed:checks.length===CANDIDATES.length+6&&checks.every(c=>c.passed),candidateSources:records,
  sourceMatrices:{candidatePairs:CANDIDATES.length**2,oldCoursePairsPerDirection:CANDIDATES.length*OLD.length,directions:2},
  scope:'Transcript, audio and page identity plus guard contracts; no factory registration or production modification.',
  audioPlayback:'not-audited',audioDuration:'not-audited',acousticClipBoundaries:'not-audited',
 },null,2)+'\n');
});

checked('actual production registration remains exactly the existing fifty-four groups',()=>{
 assert.deepEqual(registeredCourseIds,OLD);assert.deepEqual(host.courseLoopBindings.map(c=>c.id),OLD);
 assert.deepEqual(contents.map(c=>c.lesson.id),CANDIDATES.map(n=>`nce1-${n}`));
 for(const c of contents){assert.throws(()=>getCourseBinding(c.lesson.id));assert.throws(()=>host.courseLoopFor(c.lesson.id))}
});

for(const s of candidateSources)checked(`${s.lesson.id}: actual JSON, LRC, original audio, comic and paired exercise bytes agree`,async()=>{
 const {lesson,first,path,bytes,language}=s;
 assert.equal(lesson.book,'NCE1');assert.equal(lesson.id,`nce1-${first}`);assert.deepEqual(lesson.lessons,[first,first+1]);assert.equal(first%2,1);
 assert.equal(lesson.source.groupId,`NCE1-${first}`);assert.equal(lesson.source.languagePath,`/${path}`);assert.equal(lesson.source.comicKey,`NCE1-${first}`);
 assert.equal(language.version,1);assert.equal(language.book,lesson.book);assert.equal(language.lesson,first);
 assert.equal(language.sourceSha256,lesson.source.languageSha256);if(Object.hasOwn(lesson.source,'sourceSha256'))assert.equal(lesson.source.sourceSha256,language.sourceSha256);
 assert.equal(accepts(language,lesson,first),true);
 const jsonHash=sha(bytes);assert.notEqual(jsonHash,language.sourceSha256);assert.equal(index.files[`${lesson.book}/${first}.json`].sha256,jsonHash);assert.equal(index.files[`${lesson.book}/${first}.json`].size,bytes.length);
 if(Object.hasOwn(lesson.source,'languageFileSha256'))assert.equal(lesson.source.languageFileSha256,jsonHash);
 const lrcs=manifest.files.filter(f=>f.book===lesson.book&&f.lesson===first&&f.textFormat==='lrc'&&f.sha256===language.sourceSha256);assert.equal(lrcs.length,1);
 const lrc=lrcs[0],lrcBytes=Buffer.concat(await Promise.all(lrc.parts.map(p=>readFile(new URL(p.path.slice(1),assets)))));
 assert.equal(sha(lrcBytes),lrc.sha256);assert.equal(lrcBytes.length,lrc.size);assert.deepEqual(lrc.sourceLessons,[first,first+1]);
 const audio=manifest.files.filter(f=>f.book===lesson.book&&f.lesson===first&&f.type==='audio/mpeg'&&f.pairId===lrc.pairId);assert.ok(audio.length>0);
 for(const track of audio){assert.deepEqual(track.sourceLessons,[first,first+1]);const parts=await Promise.all(track.parts.map(p=>readFile(new URL(p.path.slice(1),assets))));
  for(const [i,part] of parts.entries()){assert.equal(part.length,track.parts[i].size);if(track.parts[i].sha256)assert.equal(sha(part),track.parts[i].sha256)}
  const audioBytes=Buffer.concat(parts);assert.equal(audioBytes.length,track.size);assert.equal(sha(audioBytes),track.sha256);
 }
 const comic=comics.lessons[lesson.source.comicKey],body=host.splitLesson(language.rows,language.book,true).body;
 assert.equal(comic.sourceSha256,language.sourceSha256);assert.equal(comic.linePanels.length,body.length);assert.equal(comics.sources[lesson.book],pages[lesson.book].sourceSha256);
 assert.deepEqual(host.lessonIllustration(lesson.book,first,language.sourceSha256,body.length),comic);
 assert.equal(sha(await readFile(new URL(`lesson-pages/${comic.pageSha256}.jpg`,assets))),comic.pageSha256);
 const entry=grammar.entries.find(e=>e.id===`NCE1-${first}`);assert.ok(entry);assert.equal(entry.lastLesson,first+1);
 const exercisePages=[];
 for(const n of entry.pages){const p=grammarIndex.pages[`NCE1-${n}`];assert.ok(p);assert.equal(sha(await readFile(new URL(p.src.slice(1),assets))),p.sha256);exercisePages.push({page:n,sha256:p.sha256})}
 const paired=lesson.source.pairedExercise;
 if(paired){assert.equal(paired.entryId,entry.id);assert.deepEqual(paired.lessons,lesson.lessons);const numbered=paired.pages||paired.catalogPages||[paired.page??Number(paired.pageKey.split('-').at(-1))];
  for(const n of numbered){assert.ok(entry.pages.includes(n));const actual=grammarIndex.pages[`NCE1-${n}`];assert.ok(actual);if(paired.page===n){assert.equal(paired.path,actual.src);assert.equal(paired.sha256,actual.sha256)}}
 }
 for(const p of lesson.source.comicPages||[]){const actual=pageIndex.lessons[`${lesson.book}-${first}`].pages.find(x=>x.page===p.page);assert.ok(actual);assert.equal(p.src,actual.src);assert.equal(p.sha256,actual.sha256);assert.equal(sha(await readFile(new URL(p.src.slice(1),assets))),p.sha256)}
 records.push({id:lesson.id,languageSha256:language.sourceSha256,languageFileSha256:jsonHash,lrcSize:lrc.size,audio:audio.map(a=>({sha256:a.sha256,size:a.size,pairId:a.pairId})),comicPageSha256:comic.pageSha256,bodyRows:body.length,pdfSourceSha256:pages[lesson.book].sourceSha256,exercisePages});
});

checked('twelve arrived candidate sources pass only their own exact SourcePanel predicate in all one hundred forty-four pairs',()=>{
 for(const receiver of candidateSources)for(const sender of candidateSources)assert.equal(accepts(sender.language,receiver.lesson,receiver.first),sender===receiver);
});

checked('candidate and old fifty-four sources reject every foreign course in both directions',()=>{
 for(const c of candidateSources)for(const o of oldSources){assert.equal(accepts(o.language,c.lesson,c.first),false);assert.equal(accepts(c.language,o.lesson,o.first),false)}
});

checked('exact SourcePanel rejects hash substitution, book mismatches and wrong lesson IDs without mutating metadata',()=>{
 for(const s of candidateSources){const before=JSON.stringify(s);
  for(const value of [null,{...s.language,sourceSha256:sha(s.bytes)},{...s.language,sourceSha256:'0'.repeat(64)},{...s.language,book:'NCE2'},{...s.language,lesson:s.first+1},{...s.language,lesson:String(s.first)}])assert.equal(!!accepts(value,s.lesson,s.first),false);
  assert.equal(JSON.stringify(s),before);
 }
});

checked('actual comic guard rejects candidate cross-courses, old course hashes and wrong body rows',()=>{
 for(const c of candidateSources){const body=host.splitLesson(c.language.rows,c.lesson.book,true).body;
  for(const sender of candidateSources){const found=host.lessonIllustration(c.lesson.book,c.first,sender.language.sourceSha256,body.length);if(sender===c)assert.deepEqual(found,comics.lessons[c.lesson.source.comicKey]);else assert.equal(found,null)}
  for(const o of oldSources){assert.equal(host.lessonIllustration(c.lesson.book,c.first,o.language.sourceSha256,body.length),null);const oldBody=host.splitLesson(o.language.rows,o.lesson.book,true).body;assert.equal(host.lessonIllustration(o.lesson.book,o.first,c.language.sourceSha256,oldBody.length),null)}
  for(const hash of [sha(c.bytes),'0'.repeat(64),undefined])assert.equal(host.lessonIllustration(c.lesson.book,c.first,hash,body.length),null);
  assert.equal(host.lessonIllustration(c.lesson.book,c.first,c.language.sourceSha256,body.length+1),null);
 }
});

checked('candidate clip links have finite ordered windows and starts from the exact LRC timeline',()=>{
 for(const c of candidateSources){const targets=new Set(c.lesson.teaching.map(t=>t.target));assert.ok(c.lesson.source.clips.length>0);
  for(const clip of c.lesson.source.clips){assert.ok(targets.has(clip.target));assert.ok(Number.isFinite(clip.start)&&Number.isFinite(clip.end));assert.ok(clip.start>=c.language.rows[0].time&&clip.end>clip.start);assert.ok(clip.start<=c.language.rows.at(-1).time);assert.ok(c.language.rows.some(row=>Math.abs(row.time-clip.start)<0.001))}
  // LRC timestamps identify line starts. They cannot establish a final acoustic
  // endpoint, nor prove the 113 final So have I line is in an authored clip.
 }
});
