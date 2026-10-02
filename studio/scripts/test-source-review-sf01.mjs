import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdir,readdir,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const root=new URL('../',import.meta.url),pnpm=new URL('node_modules/.pnpm/',root);
const record=JSON.parse(await readFile(new URL('docs/source-review-sf01-20261002.json',root),'utf8'));
const versions=(await readdir(pnpm)).filter(n=>/^esbuild@\d+\.\d+\.\d+$/.test(n)).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}));
const {build}=await import(new URL(versions[0]+'/node_modules/esbuild/lib/main.js',pnpm));
const work=new URL('work/source-fixes-sf01/tests/',root);await mkdir(work,{recursive:true});
const contents=`export * from './app/source-review-batch1';export * from './app/data/source-review-sf01';export * from './app/textbook-vocabulary';export * as cards from './app/flashcards';export * as progress from './app/progress-file';export {initial} from './app/model';export {originalVocabularyExamples} from './app/vocabulary-examples';export {ieltsFlashcardExamples} from './app/ielts-flashcard-examples';`;
const baselineHelper="import {withReviewedSF02Associations} from './source-review-sf02';\n"+execFileSync('git',['show',record.baseCommit+':studio/app/source-review-batch1.ts'],{cwd:fileURLToPath(root),encoding:'utf8'}).replace('export function withReviewedSourceAssociations(index:PageIndex):PageIndex{','export function withReviewedSourceAssociations(index:PageIndex):PageIndex{\n index=withReviewedSF02Associations(index);');
async function bundle(name,baseline=false){
 const output=new URL(name+'.mjs',work);
 await build({stdin:{contents,resolveDir:fileURLToPath(root),loader:'ts'},bundle:true,platform:'node',format:'esm',target:'node22',outfile:fileURLToPath(output),logLevel:'silent',plugins:baseline?[{name:'actual-v34-helper',setup(builder){builder.onLoad({filter:/app\/source-review-batch1\.ts$/},()=>({contents:baselineHelper,loader:'ts'}));}}]:[]});
 return import(output);
}
const baseline=await bundle('baseline',true),m=await bundle('candidate');
const indexBytes=await readFile(new URL('dist-online/lesson-pages/index.json',root));
const dictionaryBytes=await readFile(new URL('dist-online/language/dictionary.json',root));
const index=JSON.parse(indexBytes),dictionary=JSON.parse(dictionaryBytes).words;
const original=structuredClone(index),prior=baseline.withReviewedSourceAssociations(index),projected=m.withReviewedSourceAssociations(index);
const before=baseline.buildVocabularyCatalog(index),after=m.buildVocabularyCatalog(index),groups=[];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const sourceIds=catalog=>catalog.terms.flatMap(term=>term.sources.map(source=>source.book+'-'+source.lesson+':'+term.key)).sort();
function check(name,fn){fn();groups.push(name)}

check('exact v34 public index and dictionary; evidence agrees with compiled source gates',()=>{
 assert.equal(sha(indexBytes),record.publicBaseline.indexSha256);assert.equal(sha(dictionaryBytes),record.publicBaseline.dictionarySha256);
 assert.deepEqual(m.reviewedPrintedSourceAssociations.map(r=>r.book+'-'+r.lesson+':'+r.word).sort(),record.catalogCounts.addedAssociationIds);
 for(const repair of m.reviewedPrintedSourceAssociations){
  const evidence=record.candidates.find(row=>row.associationId===repair.book+'-'+repair.lesson+':'+repair.word);assert(evidence);
  for(const field of ['sourceBookSha256','sourcePDFPage','sourcePageSha256','printedPartOfSpeech','printedGloss'])assert.equal(repair[field],evidence[field]);
  assert.deepEqual(dictionary[repair.word],evidence.dictionaryEntry);
 }
});
check('exactly two catalog associations added; every prior source and raw byte object retained',()=>{
 assert.equal(before.entries,3624);assert.equal(before.terms.length,3354);assert.equal(after.entries,3626);assert.equal(after.terms.length,3356);
 const oldIds=new Set(sourceIds(before)),newIds=new Set(sourceIds(after));
 assert.deepEqual([...newIds].filter(id=>!oldIds.has(id)).sort(),record.catalogCounts.addedAssociationIds);
 assert([...oldIds].every(id=>newIds.has(id)));assert.deepEqual(index,original);
 const changed=Object.keys(prior.lessons).filter(id=>JSON.stringify(prior.lessons[id])!==JSON.stringify(projected.lessons[id]));
 assert.deepEqual(changed,['NCE1-51','NCE3-58']);
 for(const id of changed){
  assert.equal(projected.lessons[id].pages,index.lessons[id].pages);
  assert.equal(projected.lessons[id].vocabulary.pages,index.lessons[id].vocabulary.pages);
  const word=id==='NCE1-51'?'snow':'balcony';
  assert.deepEqual(projected.lessons[id].vocabulary.words.filter(w=>w.word!==word),prior.lessons[id].vocabulary.words);
 }
 assert(after.terms.find(t=>t.key==='low').sources.some(s=>s.book==='NCE1'&&s.lesson===103));
 assert(after.terms.find(t=>t.key==='assail').sources.some(s=>s.book==='NCE4'&&s.lesson===9));
});
check('printed order and empty inflections; repeat loading returns the existing projection',()=>{
 const snow=projected.lessons['NCE1-51'].vocabulary.words,balcony=projected.lessons['NCE3-58'].vocabulary.words;
 const snowAt=snow.findIndex(w=>w.word==='snow'),balconyAt=balcony.findIndex(w=>w.word==='balcony');
 assert.equal(snow[snowAt-1].word,'winter');assert.equal(snow[snowAt+1].word,'January');assert.deepEqual(snow[snowAt].forms,[]);
 assert.equal(balcony[balconyAt-1].word,'ransack');assert.deepEqual(balcony[balconyAt].forms,[]);
 assert.equal(m.withReviewedSourceAssociations(projected),projected);
 assert.deepEqual(m.buildVocabularyCatalog(projected),after);
 const existing=structuredClone(index);
 for(const id of ['NCE1-51','NCE3-58'])existing.lessons[id].vocabulary.words=structuredClone(projected.lessons[id].vocabulary.words);
 assert.deepEqual(m.buildVocabularyCatalog(existing),after,'A corrected source bundle does not add duplicate rows');
});
check('edition, physical page, image hash, URL and glossary role must all match',()=>{
 for(const repair of m.reviewedPrintedSourceAssociations){
  const id=repair.book+'-'+repair.lesson;
  const mutations=[
   x=>{x.version=2},x=>{x.sources[repair.book]='0'.repeat(64)},
   x=>{x.lessons[id].pages=x.lessons[id].pages.filter(p=>p.page!==repair.sourcePDFPage)},
   x=>{x.lessons[id].pages.find(p=>p.page===repair.sourcePDFPage).sha256='0'.repeat(64)},
   x=>{x.lessons[id].pages.find(p=>p.page===repair.sourcePDFPage).src='/other.jpg'},
   x=>{x.lessons[id].vocabulary.pages=x.lessons[id].vocabulary.pages.filter(p=>p!==repair.sourcePDFPage)},
  ];
  for(const mutate of mutations){const x=structuredClone(index);mutate(x);const snapshot=structuredClone(x);assert.throws(()=>m.withReviewedSourceAssociations(x));assert.deepEqual(x,snapshot)}
  const enriched=structuredClone(projected);enriched.sources[repair.book]='0'.repeat(64);assert.throws(()=>m.withReviewedSourceAssociations(enriched));
 }
});
check('duplicate/missing anchors, conflicting forms and misplaced existing heads fail without partial mutation',()=>{
 for(const repair of m.reviewedPrintedSourceAssociations){
  const id=repair.book+'-'+repair.lesson;
  const mutations=[
   x=>{x.lessons[id].vocabulary.words=x.lessons[id].vocabulary.words.filter(w=>w.word!==repair.anchorWord)},
   x=>{x.lessons[id].vocabulary.words.push({word:repair.anchorWord.toUpperCase(),forms:[]})},
   x=>{x.lessons[id].vocabulary.words.push({word:repair.word,forms:['unreviewed-form']})},
   x=>{x.lessons[id].vocabulary.words.push({word:repair.word,forms:[]},{word:repair.word.toUpperCase(),forms:[]})},
   x=>{x.lessons[id].vocabulary.words.unshift({word:repair.word,forms:[]})},
  ];
  for(const mutate of mutations){const x=structuredClone(index);mutate(x);const snapshot=structuredClone(x);assert.throws(()=>m.withReviewedSourceAssociations(x));assert.deepEqual(x,snapshot)}
 }
});
check('authored content, supplemental pool and legacy page clarification retain their identities',()=>{
 assert.deepEqual(m.originalVocabularyExamples,baseline.originalVocabularyExamples);
 assert.equal(new Set(m.originalVocabularyExamples.map(item=>item.word.toLowerCase())).size,315);assert.equal(m.originalVocabularyExamples.length,420);
 assert.deepEqual(m.ieltsFlashcardExamples,baseline.ieltsFlashcardExamples);
 for(const word of ['snow','balcony']){
  assert.equal(after.terms.filter(t=>t.key===word).length,1);assert.equal(after.terms.find(t=>t.key===word).sources.length,1);
  assert(!m.ieltsFlashcardExamples.some(item=>item.word.toLowerCase()===word));assert(!m.originalVocabularyExamples.some(item=>item.word.toLowerCase()===word));
 }
 const notePage=index.lessons['NCE2-34'].pages.find(page=>page.page===199);
 assert.equal(m.sourcePageClarification(index,'NCE2',34,notePage),baseline.sourcePageClarification(index,'NCE2',34,notePage));
});
check('62 unique unresolved IDs are unchanged; this batch resolves none of that overlapping set',()=>{
 const pending=record.unresolvedSourceWordIds,ids=pending.unchangedSortedIds;
 assert.equal(ids.length,62);assert.equal(new Set(ids).size,62);assert.deepEqual(ids,[...ids].sort());
 assert.equal(sha(JSON.stringify(ids)+'\n'),pending.unchangedSortedIdsSha256);
 assert.deepEqual(pending.resolvedByThisBatch,[]);assert.equal(pending.uniqueBefore,62);assert.equal(pending.uniqueAfter,62);
 assert(record.catalogCounts.addedAssociationIds.every(id=>!ids.includes(id)));
 assert.deepEqual(pending.rowCountsBeforeAndAfter,{literalUnknownRows:5,identityMappingRows:5,sourceWordInterpretationRows:57});
 assert.equal(record.wholePrintedMeaningDenominator,null);assert.equal(record.humanReview,false);
 assert.deepEqual(record.editorialAppliedByThisBatch,[]);assert.equal(record.remainingEditorialProposals.length,5);
 const held=record.remainingEditorialProposals.find(row=>row.book==='NCE2'&&row.pdfPage===424);
 assert.equal(held.printedLesson,80);assert.equal(held.inferredLesson,83);assert.equal(held.status,'unresolved');
});

const f=m.cards,p=m.progress,now=Date.UTC(2026,9,2,12);
let state=structuredClone(m.initial);state.drafts['old-personal-note']='Unrelated saved work';
for(const [offset,word] of ['snow','balcony'].entries()){
 const entry=dictionary[word];
 state=f.enrollFlashcard(state,{word:entry.word,ipa:entry.ipa,meaning:entry.meaning.slice(0,300),example:'Existing saved example.'},[{kind:'ielts',topic:'Existing personal topic',use:'speaking'}],now);
 const note=Object.values(state.flashcards.notes).find(n=>n.word.toLowerCase()===word),card=Object.values(state.flashcards.cards).find(c=>c.noteId===note.id);
 const token={cardId:card.id,revision:card.revision};
 state=f.rateFlashcard(f.revealFlashcard(f.selectFlashcard(state,card.id),token),token,offset?'good':'again',now+offset+1);
}
const old=structuredClone(state);
check('browsing source projection cannot enroll or alter a saved card',()=>{
 m.buildVocabularyCatalog(index);m.withReviewedSourceAssociations(index);assert.deepEqual(state,old);
});
for(const repair of m.reviewedPrintedSourceAssociations){
 const entry=dictionary[repair.word],sources=after.terms.find(term=>term.key===repair.word).sources.map(({book,lesson})=>({kind:'nce',book,lesson}));
 state=f.enrollFlashcard(state,{word:entry.word,ipa:entry.ipa,meaning:entry.meaning.slice(0,300),example:''},sources,now+1000);
}
check('same dictionary identity merges NCE into old cross-pool cards; schedules/logs/content stay exact',()=>{
 assert.equal(Object.keys(state.flashcards.notes).length,2);assert.equal(Object.keys(state.flashcards.cards).length,2);
 assert.deepEqual(state.flashcards.cards,old.flashcards.cards);assert.deepEqual(state.flashcards.reviews,old.flashcards.reviews);
 assert.deepEqual(state.drafts,old.drafts);assert.equal(state.attempts,old.attempts);assert.equal(state.correct,old.correct);
 for(const note of Object.values(state.flashcards.notes)){
  const prior=old.flashcards.notes[note.id];assert(prior);assert.deepEqual({...note,sources:prior.sources},prior);
  assert.equal(note.sources.length,2);assert.deepEqual(note.sources[0],prior.sources[0]);
 }
 const again=structuredClone(state);
 for(const repair of m.reviewedPrintedSourceAssociations){const entry=dictionary[repair.word];state=f.enrollFlashcard(state,{word:entry.word,ipa:entry.ipa,meaning:entry.meaning.slice(0,300),example:''},[{kind:'nce',book:repair.book,lesson:repair.lesson}],now+2000)}
 assert.deepEqual(state,again,'Repeated source enrollment adds no duplicate or new timestamp');
});
check('source enrichment retains undo and a different sense stays separate',()=>{
 const undo=f.undoFlashcardReview(state),oldUndo=f.undoFlashcardReview(old);
 assert.deepEqual(undo.flashcards.cards,oldUndo.flashcards.cards);assert.deepEqual(undo.flashcards.reviews,oldUndo.flashcards.reviews);
 for(const note of Object.values(undo.flashcards.notes))assert.equal(note.sources.length,2);
 const separate=f.enrollFlashcard(state,{word:'snow',meaning:'n. 雪',example:''},[{kind:'ielts',topic:'Separate noun sense',use:'reading'}],now+3000);
 assert.equal(Object.keys(separate.flashcards.notes).length,3);
 for(const [id,card] of Object.entries(state.flashcards.cards))assert.deepEqual(separate.flashcards.cards[id],card);
 assert.deepEqual(separate.flashcards.reviews,state.flashcards.reviews);
});
for(const [label,snapshot] of [['old-cross-pool',old],['source-enriched',state]]){
 const decoded=await p.readProgressFile(p.makeProgressFile(snapshot,new Date(now)));
 assert.deepEqual(decoded.state,snapshot);groups.push(label+' complete backup roundtrip preserves IDs, due, logs and source tags');
}
assert.deepEqual(index,original);
console.log(JSON.stringify({passed:groups.length,groups,baseCommit:record.baseCommit,addedAssociations:record.catalogCounts.addedAssociationIds,authoredHeadwords:315,authoredExamples:420,unresolvedUniqueIds:62,personalStorageAccessed:false,realBrowserEvidence:false,naturalRetentionEvidence:false}));
