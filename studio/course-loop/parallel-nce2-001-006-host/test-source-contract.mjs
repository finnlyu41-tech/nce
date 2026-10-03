/** Read-only source integration checks. Execute the untouched SourcePanel
 * acceptance expression and actual production comic guard; no UI fixture. */
import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {productionHost,fixtureForId,supportedCourseIds,newIds} from './binding.mjs';

const root=new URL('../../',import.meta.url),assets=new URL('dist-online/',root);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async url=>JSON.parse(await readFile(url,'utf8'));
const [host,ui,manifest,index,comics,pages,grammar,grammarIndex,pageIndex,previousBookOneContractBytes]=await Promise.all([
 productionHost(),readFile(new URL('app/course-loop-ui.tsx',root),'utf8'),
 json(new URL('materials/manifest.json',assets)),json(new URL('language/index.json',assets)),
 json(new URL('app/data/nce-illustrations.json',root)),json(new URL('app/data/nce-pages.json',root)),
 json(new URL('app/data/textbook-grammar.json',root)),json(new URL('grammar/index.json',assets)),json(new URL('lesson-pages/index.json',assets)),readFile(new URL('docs/parallel-nce1-133-143-host/source-contract.json',root)),
]);
const panel=ui.slice(ui.indexOf('function SourcePanel('));
const predicates=[...panel.matchAll(/const valid=([^;]+);setLanguage\(valid\?result:null\)/g)];
assert.equal(predicates.length,1,'find one exact production SourcePanel acceptance expression');
// This is the actual source expression, extracted rather than restated in tests.
const accepts=new Function('result','lesson','first',`return (${predicates[0][1]});`);
const NCE1_IDS=Array.from({length:72},(_,i)=>`nce1-${1+2*i}`),NCE2_IDS=Array.from({length:6},(_,i)=>`nce2-${1+i}`),IDS=[...NCE1_IDS,...NCE2_IDS];
const fixtures=Object.fromEntries(await Promise.all(IDS.map(async id=>[id,await fixtureForId(id)])));
const sources=Object.fromEntries(await Promise.all(IDS.map(async id=>{
 const {lesson}=host.courseLoopFor(id),first=lesson.lessons[0],path=`language/${lesson.book}/${first}.json`,bytes=await readFile(new URL(path,assets)),language=JSON.parse(bytes);
 const lrc=manifest.files.filter(f=>f.book===lesson.book&&f.lesson===first&&f.textFormat==='lrc'&&f.sha256===language.sourceSha256);
 assert.equal(lrc.length,1,`${id}: actual transcript has one matching packaged LRC`);
 const lrcBytes=Buffer.concat(await Promise.all(lrc[0].parts.map(part=>readFile(new URL(part.path.slice(1),assets)))));
 return [id,{lesson,first,path,bytes,language,lrc:lrc[0],lrcBytes,comic:comics.lessons[`${lesson.book}-${first}`]}];
})));
const pdfSources=await Promise.all(['NCE1','NCE2'].map(async book=>{
 const selected=manifest.files.filter(file=>file.book===book&&file.type==='application/pdf'&&file.sha256===pages[book].sourceSha256);
 assert.equal(selected.length,1,`${book}: one original textbook edition`);
 const pdf=selected[0],parts=await Promise.all(pdf.parts.map(part=>readFile(new URL(part.path.slice(1),assets))));
 return {book,pdf,parts};
}));
const checks=[],records=[];
function checked(name,body){test(name,async()=>{try{await body();checks.push({name,passed:true})}catch(error){checks.push({name,passed:false,error:String(error)});throw error}})}
after(async()=>{
 // Focused runs may intentionally skip most checks; preserve the complete
 // source receipt rather than replace it with partial execution evidence.
 if(checks.length!==IDS.length+7)return;
 const dir=new URL('docs/parallel-nce2-001-006-host/',root);await mkdir(dir,{recursive:true});
 await writeFile(new URL('source-contract.json',dir),JSON.stringify({
  actualTreeHead:execFileSync('git',['rev-parse','HEAD'],{cwd:fileURLToPath(root),encoding:'utf8'}).trim(),
  productionRegistrySha256:sha(await readFile(new URL('course-loop/registry.mjs',root))),
  testBindingSha256:sha(await readFile(new URL('./binding.mjs',import.meta.url))),
  registeredIds:[...supportedCourseIds],registeredCount:host.courseLoopBindings.length,newIds:[...newIds],
  sourcePanelPredicateSha256:sha(predicates[0][1]),sourcePanelFileSha256:sha(ui),testFileSha256:sha(await readFile(new URL('./test-source-contract.mjs',import.meta.url))),
  preservedBookOneSourceContractReceiptSha256:sha(previousBookOneContractBytes),checks,passed:checks.length===IDS.length+7&&checks.every(c=>c.passed),sources:records,
  sourceMatrices:{sourcePanelPairs:IDS.length**2,comicGuardPairs:IDS.length**2},
  pdfSources:pdfSources.map(({book,pdf})=>({book,sha256:pdf.sha256,bytes:pdf.size,pages:pdf.pages})),
  comicCatalogGapIds:[...NCE2_IDS],comicStatusPolicy:'NCE1:72 original catalog images; NCE2:6 missing catalog entries, actual guard returns null with host fallback; never counted as loaded images.',
  scope:'Actual production registration and exact source guards; original transcript/audio/page byte integrity. No changes to source content or production guards.',
  audioPlayback:'not-audited',audioDuration:'not-audited',acousticClipBoundaries:'not-audited',
 },null,2)+'\n');
});
checked('actual production has seventy-eight exact bindings and distinct keys while prior seventy-two book-one sources remain intact',()=>{
 assert.deepEqual(supportedCourseIds,IDS);assert.deepEqual(host.courseLoopBindings.map(course=>course.id),IDS);
 assert.deepEqual([...newIds],NCE2_IDS);
 assert.equal(new Set(host.courseLoopBindings.map(c=>c.key)).size,78);assert.equal(new Set(host.courseLoopBindings.map(c=>c.inputsKey)).size,78);
 assert.equal(new Set(host.courseLoopBindings.flatMap(c=>[c.key,c.inputsKey])).size,156);
 for(const id of IDS){const b=host.courseLoopFor(id);assert.deepEqual(b.lesson,fixtures[id].content.lesson);assert.equal(b.key,`nce-course-loop-v1:${b.lesson.book}-${b.lesson.lessons[0]}`);assert.equal(b.inputsKey,`nce-course-loop-inputs-v1:${b.lesson.book}-${b.lesson.lessons[0]}`)}
 const earlier=JSON.parse(previousBookOneContractBytes);assert.equal(earlier.passed,true);assert.equal(earlier.registeredIds.length,72);assert.equal(earlier.registeredCount,72);assert.equal(earlier.sources.length,72);
 for(const id of ['nce1-145','nce1-144','nce2-7','nce2-01','NCE2-1','__proto__'])assert.throws(()=>host.courseLoopFor(id));
});


for(const id of IDS)checked(`${id}: authored source agrees with JSON transcript, original LRC and comic metadata`,async()=>{
 const {lesson,first,path,bytes,language,lrc,lrcBytes,comic}=sources[id];
 assert.equal(lesson.book,id.startsWith('nce1-')?'NCE1':'NCE2');assert.equal(first,Number(id.slice(5)));const sourceLessons=lesson.book==='NCE1'?[first,first+1]:[first];assert.deepEqual(lesson.lessons,sourceLessons);if(lesson.book==='NCE1')assert.equal(first%2,1);
 assert.equal(lesson.source.languagePath,`/${path}`);assert.equal(lesson.source.comicKey,`${lesson.book}-${first}`);assert.equal(lesson.source.groupId,`${lesson.book}-${first}`);
 assert.equal(language.version,1);assert.equal(language.book,lesson.book);assert.equal(language.lesson,first);
 assert.match(lesson.source.languageSha256,/^[a-f0-9]{64}$/);assert.equal(lesson.source.languageSha256,language.sourceSha256);
 if(Object.hasOwn(lesson.source,'sourceSha256'))assert.equal(lesson.source.sourceSha256,language.sourceSha256);
 assert.equal(lrc.book,lesson.book);assert.equal(lrc.lesson,first);assert.deepEqual(lrc.sourceLessons,sourceLessons);assert.equal(lrc.sha256,language.sourceSha256);assert.equal(sha(lrcBytes),lrc.sha256);assert.equal(lrcBytes.length,lrc.size);
 if(lesson.book==='NCE1'){assert.equal(comic.sourceSha256,language.sourceSha256);assert.equal(comics.sources[lesson.book],pages[lesson.book].sourceSha256)}else assert.equal(comic,undefined,'NCE2 has no comic catalog entry; do not invent a source image');
 assert.equal(accepts(language,lesson,first),true,`${id}: unchanged SourcePanel guard must accept the real source`);
 // JSON bytes have their own identity; never use it as the original LRC hash.
 const fileSha=sha(bytes);assert.equal(index.files[`${lesson.book}/${first}.json`].sha256,fileSha);assert.equal(index.files[`${lesson.book}/${first}.json`].size,bytes.length);
 assert.notEqual(fileSha,language.sourceSha256);if(Object.hasOwn(lesson.source,'languageFileSha256'))assert.equal(lesson.source.languageFileSha256,fileSha);
 // Check original audio transport for every registered group.
 {
  const audio=manifest.files.filter(file=>file.book===lesson.book&&file.lesson===first&&file.type==='audio/mpeg'&&file.pairId===lrc.pairId);
  assert.ok(audio.length>0,`${id}: matching original audio exists`);
  for(const track of audio){
   assert.deepEqual(track.sourceLessons,sourceLessons);
   const parts=await Promise.all(track.parts.map(part=>readFile(new URL(part.path.slice(1),assets))));
   for(const [i,part] of parts.entries()){assert.equal(part.length,track.parts[i].size);if(track.parts[i].sha256)assert.equal(sha(part),track.parts[i].sha256)}
   const audioBytes=Buffer.concat(parts);
   assert.equal(audioBytes.length,track.size);assert.equal(sha(audioBytes),track.sha256);
  }
 }
 const body=host.splitLesson(language.rows,language.book,true).body;assert.ok(body.length>0);
 if(comic){const picture=await readFile(new URL(`lesson-pages/${comic.pageSha256}.jpg`,assets));assert.equal(sha(picture),comic.pageSha256);assert.equal(body.length,comic.linePanels.length)}else assert.equal(host.lessonIllustration(lesson.book,first,language.sourceSha256,body.length),null);
 const exercisePages=[];
 if(lesson.book==='NCE2'){const printed=pageIndex.lessons[`${lesson.book}-${first}`]?.pages;assert.ok(printed?.length);for(const page of printed)assert.equal(sha(await readFile(new URL(page.src.slice(1),assets))),page.sha256)}
 if(newIds.includes(id)){
  const entry=grammar.entries.find(e=>e.id===`${lesson.book}-${first}`);assert.ok(entry);assert.equal(entry.lastLesson,first);
  assert.equal(pageIndex.sources[lesson.book],pages[lesson.book].sourceSha256);assert.equal(grammarIndex.sources[lesson.book],pages[lesson.book].sourceSha256);
  for(const page of entry.pages){const p=grammarIndex.pages[`${lesson.book}-${page}`];assert.ok(p);assert.equal(sha(await readFile(new URL(p.src.slice(1),assets))),p.sha256);exercisePages.push({page,sha256:p.sha256})}
  const paired=lesson.source.pairedExercise;
  if(paired){assert.equal(paired.entryId,entry.id);assert.deepEqual(paired.lessons,lesson.lessons);const numbered=paired.pages||paired.catalogPages||[paired.page??Number(paired.pageKey.split('-').at(-1))];
   for(const page of numbered){assert.ok(entry.pages.includes(page));const actual=grammarIndex.pages[`${lesson.book}-${page}`];assert.ok(actual);if(paired.page===page){assert.equal(paired.path,actual.src);assert.equal(paired.sha256,actual.sha256)}}
  }
  for(const p of lesson.source.comicPages||[]){const actual=pageIndex.lessons[`${lesson.book}-${first}`].pages.find(x=>x.page===p.page);assert.ok(actual);assert.equal(p.src,actual.src);assert.equal(p.sha256,actual.sha256);assert.equal(sha(await readFile(new URL(p.src.slice(1),assets))),p.sha256)}
 }
 records.push({id,languageSha256:language.sourceSha256,languageFileSha256:fileSha,lrcSha256:lrc.sha256,lrcSize:lrc.size,
  audio:manifest.files.filter(f=>f.book===lesson.book&&f.lesson===first&&f.type==='audio/mpeg'&&f.pairId===lrc.pairId).map(a=>({sha256:a.sha256,size:a.size,pairId:a.pairId})),
  comicStatus:comic?'mapped-original-image':'catalog-absent',comicPageSha256:comic?.pageSha256??null,bodyRows:body.length,pdfSourceSha256:pages[lesson.book].sourceSha256,exercisePages,printedPages:pageIndex.lessons[`${lesson.book}-${first}`]?.pages??[]});
});

checked('exact SourcePanel guard accepts only the matching source in all 78 by 78 pairs',()=>{
 assert.equal(new Set(IDS.map(id=>sources[id].language.sourceSha256)).size,78);
 for(const receiver of IDS)for(const sender of IDS){const r=sources[receiver],s=sources[sender];assert.equal(accepts(s.language,r.lesson,r.first),receiver===sender,`${sender} textbook to ${receiver}`)}
});

checked('exact SourcePanel guard rejects hash tampering, JSON-byte-hash substitution and wrong book or lesson',()=>{
 for(const id of IDS){const {language,lesson,first,bytes}=sources[id],before=JSON.stringify({language,lesson});
  for(const candidate of [null,{...language,sourceSha256:'0'.repeat(64)},{...language,sourceSha256:sha(bytes)},{...language,sourceSha256:language.sourceSha256.toUpperCase()},{...language,book:lesson.book==='NCE1'?'NCE2':'NCE1'},{...language,lesson:first+1},{...language,lesson:String(first)}])assert.equal(!!accepts(candidate,lesson,first),false,`${id}: corrupted source must fail`);
  const wrongContent={...structuredClone(lesson),source:{...lesson.source,languageSha256:'f'.repeat(64)}};assert.equal(accepts(language,wrongContent,first),false);
  assert.equal(JSON.stringify({language,lesson}),before);
 }
});

checked('actual comic guard accepts only same-course source and body row count in all 78 by 78 pairs',()=>{
 assert.equal(typeof host.lessonIllustration,'function');assert.equal(typeof host.splitLesson,'function');
 for(const receiver of IDS){const r=sources[receiver],rows=host.splitLesson(r.language.rows,r.language.book,true).body,before=JSON.stringify(r.language);
  if(r.comic)assert.equal(rows.length,r.comic.linePanels.length);else assert.equal(r.lesson.book,'NCE2');
  for(const sender of IDS){const s=sources[sender],entry=host.lessonIllustration(r.lesson.book,r.first,s.language.sourceSha256,rows.length);if(sender===receiver&&r.comic)assert.deepEqual(entry,r.comic);else assert.equal(entry,null,`${sender} comic identity to ${receiver}`)}
  for(const hash of ['0'.repeat(64),sha(r.bytes),undefined])assert.equal(host.lessonIllustration(r.lesson.book,r.first,hash,rows.length),null);
  assert.equal(host.lessonIllustration(r.lesson.book,r.first,r.language.sourceSha256,rows.length+1),null);
  assert.equal(host.lessonIllustration(r.lesson.book==='NCE1'?'NCE2':'NCE1',r.first,r.language.sourceSha256,rows.length),null);
  assert.equal(host.lessonIllustration(r.lesson.book,r.first+1,r.language.sourceSha256,rows.length),null);
  assert.equal(JSON.stringify(r.language),before);
 }
});

checked('audio clips have finite ordered windows, matching source starts and selected teaching targets',()=>{
 for(const id of IDS){const {lesson,language,lrc}=sources[id],targets=new Set(lesson.teaching.map(t=>t.target)),firstTime=language.rows[0]?.time;
  assert.ok(Number.isFinite(firstTime));assert.equal(lrc.textFormat,'lrc');assert.ok(lesson.source.clips.length>0);
  for(const clip of lesson.source.clips){assert.ok(targets.has(clip.target),`${id}: clip target belongs to selected teaching`);assert.ok(Number.isFinite(clip.start)&&Number.isFinite(clip.end));assert.ok(clip.start>=firstTime&&clip.end>clip.start,`${id}: ordered clip interval`);assert.ok(clip.start<=lrc.lastTimestamp,`${id}: clip begins inside actual transcript`);
   if(newIds.includes(id))assert.ok(language.rows.some(row=>Math.abs(row.time-clip.start)<0.001),`${id}: new clip starts at an actual LRC row timestamp`);
   // A selection endpoint need not be a subtitle start (95:88.77,99:66.83).
   // In particular, 95's 86.16-88.77 selection is only the original question;
   // these tests do not claim it contains an answer or establish listening quality.
   // The 113 final So have I and 143 final future/rescue lines lack a next LRC
   // time. Their text plus paired 114/144 page support is checked; no final
   // acoustic endpoint, answer completeness or hearing result is guessed.
   // Finite ordered windows are checked here; playback and duration are not audited.
  }
 }
});

checked('both original textbook PDFs and book-two print/grammar indexes share the actual edition bytes',()=>{
 for(const {book,pdf,parts} of pdfSources){const bytes=Buffer.concat(parts);assert.equal(bytes.length,pdf.size);assert.equal(sha(bytes),pdf.sha256);assert.equal(pdf.sha256,pages[book].sourceSha256);assert.equal(pdf.pages,pages[book].pageCount);
  for(const [i,part] of parts.entries()){assert.equal(part.length,pdf.parts[i].size);if(pdf.parts[i].sha256)assert.equal(sha(part),pdf.parts[i].sha256)}
 }
 assert.equal(pageIndex.sources.NCE2,pages.NCE2.sourceSha256);assert.equal(grammarIndex.sources.NCE2,pages.NCE2.sourceSha256);
});

checked('actual host has an explanatory null-comic branch without counting unavailable book-two images as mapped',()=>{
 const fallback=/if\s*\(!lessonIllustration\(lesson\.book,first,language\.sourceSha256,rows\.length\)\)return <p role="status">([^<]+)<\/p>;/;
 const branch=panel.match(fallback);assert.ok(branch,'actual SourcePanel must check the production comic guard before image/cursor controls');
 assert.match(branch[1],/暂无已核对的逐句漫画/);assert.match(branch[1],/原文.*原声/);
 assert.ok(panel.indexOf(branch[0])>panel.indexOf("if(kind==='audio')return"));assert.ok(panel.indexOf(branch[0])<panel.indexOf('return <><SentenceIllustration'));
 for(const id of NCE2_IDS){const {lesson,first,language}=sources[id],rows=host.splitLesson(language.rows,lesson.book,true).body;assert.equal(comics.lessons[lesson.source.comicKey],undefined);assert.equal(host.lessonIllustration(lesson.book,first,language.sourceSha256,rows.length),null)}
 assert.equal(NCE1_IDS.filter(id=>sources[id].comic).length,72);assert.equal(NCE2_IDS.filter(id=>sources[id].comic).length,0);
});
