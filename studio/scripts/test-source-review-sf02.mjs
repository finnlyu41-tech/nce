import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {mkdir,readdir,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const root=new URL('../',import.meta.url),pnpm=new URL('node_modules/.pnpm/',root);
const record=JSON.parse(await readFile(new URL('docs/source-review-sf02-20261002.json',root),'utf8'));
const version=(await readdir(pnpm)).find(n=>/^esbuild@\d+\.\d+\.\d+$/.test(n));
const {build}=await import(new URL(version+'/node_modules/esbuild/lib/main.js',pnpm));
const work=new URL('work/source-fixes-sf02/tests/',root);await mkdir(work,{recursive:true});
const gitFile=(commit,path)=>execFileSync('git',['show',commit+':studio/'+path],{cwd:fileURLToPath(root),encoding:'utf8'});
// Use the accepted ancestor, available in ordinary publisher checkouts; the
// original local SF01 commit was cherry-picked and need not be in their Git DB.
const sf01=record.deliveryBaseCommit,hasSF01=existsSync(new URL('app/data/source-review-sf01.ts',root));
const contents="export * from './app/source-review-batch1';export * from './app/source-review-sf02';export * from './app/data/source-review-sf02';export * from './app/textbook-vocabulary';export * as cards from './app/flashcards';export * as progress from './app/progress-file';export {initial} from './app/model';export {loadDictionary,findWord} from './app/language';export {originalVocabularyExamples} from './app/vocabulary-examples';export {ieltsFlashcardExamples} from './app/ielts-flashcard-examples';";
async function bundle(name,{helper,online=true}={}){
 const output=new URL(name+'.mjs',work);
 await build({stdin:{contents,resolveDir:fileURLToPath(root),loader:'ts'},bundle:true,platform:'node',format:'esm',target:'node22',outfile:fileURLToPath(output),logLevel:'silent',plugins:[{name:'bounded-read-fixtures',setup(builder){
  if(helper)builder.onLoad({filter:/app\/source-review-batch1\.ts$/},()=>({contents:helper,loader:'ts'}));
  builder.onResolve({filter:/^\.\/data\/source-review-sf01$/},()=>({path:'sf01',namespace:'audit-sf01'}));
  builder.onLoad({filter:/.*/,namespace:'audit-sf01'},()=>({contents:gitFile(sf01,'app/data/source-review-sf01.ts'),loader:'ts'}));
  builder.onResolve({filter:/^\.\/runtime-mode$/},()=>({path:'runtime',namespace:'audit-runtime'}));
  builder.onLoad({filter:/.*/,namespace:'audit-runtime'},()=>({contents:'export const ONLINE='+online+';',loader:'js'}));
  builder.onResolve({filter:/^\.\/network$/},()=>({path:'network',namespace:'audit-network'}));
  builder.onLoad({filter:/.*/,namespace:'audit-network'},()=>({contents:"export async function readJsonResource(path){globalThis.__sf02Reads.push(path);if(path!=='/language/dictionary.json')throw Error('Unexpected resource');return structuredClone(globalThis.__sf02Dictionary);}",loader:'js'}));
 }}]});return import(output);
}
const baseline=await bundle('baseline',{helper:gitFile(hasSF01?sf01:record.baseCommit,'app/source-review-batch1.ts')});
const legacy=await bundle('actual-sf01',{helper:gitFile(sf01,'app/source-review-batch1.ts')});
const m=await bundle('candidate'),offline=await bundle('offline',{online:false});
const indexBytes=await readFile(new URL('dist-online/lesson-pages/index.json',root)),dictionaryBytes=await readFile(new URL('dist-online/language/dictionary.json',root));
const index=JSON.parse(indexBytes),raw=JSON.parse(dictionaryBytes),original=structuredClone(index),dictionary=m.withReviewedSF02Dictionary(raw.words);
const prior=baseline.withReviewedSourceAssociations(index),projected=m.withReviewedSourceAssociations(index);
const before=baseline.buildVocabularyCatalog(index),after=m.buildVocabularyCatalog(index),groups=[];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const ids=catalog=>catalog.terms.flatMap(term=>term.sources.map(source=>source.book+'-'+source.lesson+':'+term.key)).sort();
function check(name,fn){fn();groups.push(name)}
check('public baseline hashes and all eight literal source gates match evidence',()=>{
 assert.equal(sha(indexBytes),record.publicBaseline.indexSha256);assert.equal(sha(dictionaryBytes),record.publicBaseline.dictionarySha256);
 assert.deepEqual(m.reviewedSF02Associations.map(r=>r.book+'-'+r.lesson+':'+r.word).sort(),record.catalogCounts.addedAssociationIds);
 for(const r of m.reviewedSF02Associations){const evidence=record.candidates.find(e=>e.associationId===r.book+'-'+r.lesson+':'+r.word);assert(evidence);
  for(const field of ['sourceBookSha256','sourcePDFPage','sourcePageSha256','printedPartOfSpeech','printedGloss'])assert.equal(r[field],evidence[field]);
  assert.deepEqual(raw.words[r.word]??null,evidence.dictionaryEntryBefore);
 }
});
check('exact eight additions; all old associations, raw input and page references preserved',()=>{
 assert.equal(before.entries,hasSF01?3618:3616);assert.equal(before.terms.length,hasSF01?3348:3346);
 assert.equal(after.entries,before.entries+8);assert.equal(after.terms.length,before.terms.length+8);
 const oldIds=new Set(ids(before)),newIds=new Set(ids(after));assert.deepEqual([...newIds].filter(id=>!oldIds.has(id)).sort(),record.catalogCounts.addedAssociationIds);assert([...oldIds].every(id=>newIds.has(id)));
 const changed=Object.keys(prior.lessons).filter(id=>JSON.stringify(prior.lessons[id])!==JSON.stringify(projected.lessons[id]));
 assert.deepEqual(changed.sort(),m.reviewedSF02Associations.map(r=>r.book+'-'+r.lesson).sort());
 for(const id of changed){assert.equal(projected.lessons[id].pages,index.lessons[id].pages);assert.equal(projected.lessons[id].vocabulary.pages,index.lessons[id].vocabulary.pages);
  const word=m.reviewedSF02Associations.find(r=>r.book+'-'+r.lesson===id).word;assert.deepEqual(projected.lessons[id].vocabulary.words.filter(w=>w.word!==word),prior.lessons[id].vocabulary.words);
 }assert.deepEqual(index,original);assert.equal(m.withReviewedSourceAssociations(projected),projected);
});
check('SF01 and SF02 compose in either order; ransack balcony fussy ordering retained',()=>{
 const first=m.withReviewedSF02Associations(legacy.withReviewedSourceAssociations(index));
 const second=legacy.withReviewedSourceAssociations(m.withReviewedSF02Associations(index));assert.deepEqual(first,second);
 const catalog=m.buildVocabularyCatalog(first);assert.equal(catalog.entries,3626);assert.equal(catalog.terms.length,3356);
 const words=first.lessons['NCE3-58'].vocabulary.words.map(w=>w.word),at=words.indexOf('ransack');assert.deepEqual(words.slice(at,at+3),['ransack','balcony','fussy']);
 assert.equal(m.withReviewedSF02Associations(first),first);assert.equal(legacy.withReviewedSourceAssociations(first),first);
});
check('all edition/page/hash/URL/glossary gates and duplicate/position conflicts fail without mutation',()=>{
 for(const r of m.reviewedSF02Associations){const id=r.book+'-'+r.lesson;
  const bad=[x=>{x.version=2},x=>{x.sources[r.book]='0'.repeat(64)},x=>{x.lessons[id].pages=x.lessons[id].pages.filter(p=>p.page!==r.sourcePDFPage)},x=>{x.lessons[id].pages.find(p=>p.page===r.sourcePDFPage).sha256='0'.repeat(64)},x=>{x.lessons[id].pages.find(p=>p.page===r.sourcePDFPage).src='/other.jpg'},x=>{x.lessons[id].vocabulary.pages=[]},x=>{x.lessons[id].vocabulary.words=x.lessons[id].vocabulary.words.filter(w=>w.word!==r.anchorWord)},x=>{x.lessons[id].vocabulary.words.push({word:r.anchorWord,forms:[]})},x=>{x.lessons[id].vocabulary.words.push({word:r.word,forms:['invented']})},x=>{x.lessons[id].vocabulary.words.push({word:r.word,forms:[]},{word:r.word.toUpperCase(),forms:[]})},x=>{x.lessons[id].vocabulary.words.unshift({word:r.word,forms:[]})}];
  for(const mutate of bad){const x=structuredClone(index);mutate(x);const snapshot=structuredClone(x);assert.throws(()=>m.withReviewedSF02Associations(x));assert.deepEqual(x,snapshot)}
  const stale=structuredClone(projected);stale.sources[r.book]='0'.repeat(64);assert.throws(()=>m.withReviewedSF02Associations(stale));
  const words=projected.lessons[id].vocabulary.words,at=words.findIndex(w=>w.word===r.word);assert.deepEqual(words[at].forms,[]);
 }
});
check('two whole-phrase dictionary heads only; missing POS/IPA not invented and conflicts explicit',()=>{
 assert.deepEqual(Object.keys(dictionary).filter(key=>!Object.hasOwn(raw.words,key)).sort(),['a little','bargain hunter']);
 for(const [key,value] of Object.entries(raw.words))assert.equal(dictionary[key],value);assert.equal(m.withReviewedSF02Dictionary(dictionary),dictionary);
 for(const item of m.reviewedSF02DictionaryEntries){assert.equal(m.findWord(dictionary,item.word.toUpperCase()),dictionary[item.word]);assert.equal(dictionary[item.word].ipa,'');
  const x=structuredClone(raw.words);x[item.word]={word:item.word,ipa:'unverified',meaning:'Different user definition'};const original=structuredClone(x);assert.throws(()=>m.withReviewedSF02Dictionary(x));assert.deepEqual(x,original);
 }
 assert.deepEqual(JSON.parse(dictionaryBytes),raw);
});
globalThis.__sf02Reads=[];globalThis.__sf02Dictionary={version:2,words:raw.words};
await assert.rejects(m.loadDictionary());globalThis.__sf02Dictionary=raw;
const loaded=await m.loadDictionary();assert.deepEqual(loaded,dictionary);assert.equal(await m.loadDictionary(),loaded);
const offlineDictionary=await offline.loadDictionary();for(const item of m.reviewedSF02DictionaryEntries)assert.deepEqual(offlineDictionary[item.word],dictionary[item.word]);
groups.push('actual dictionary parser rejects malformed input, retries, caches; offline phrase lookup works without network');
check('authored 315 heads/420 examples and supplemental pool unchanged; no source-driven sense rewrite',()=>{
 assert.deepEqual(m.originalVocabularyExamples,baseline.originalVocabularyExamples);assert.equal(m.originalVocabularyExamples.length,420);assert.equal(new Set(m.originalVocabularyExamples.map(e=>e.word.toLowerCase())).size,315);assert.deepEqual(m.ieltsFlashcardExamples,baseline.ieltsFlashcardExamples);
 for(const r of m.reviewedSF02Associations){assert.equal(after.terms.filter(t=>t.key===r.word).length,1);assert(!m.originalVocabularyExamples.some(e=>e.word.toLowerCase()===r.word));assert(!m.ieltsFlashcardExamples.some(e=>e.word.toLowerCase()===r.word))}
});
check('62 unique unresolved IDs close zero; editorial 4 supported notes and one unresolved header remain separate',()=>{
 const pending=record.unresolvedSourceWordIds,ids=pending.unchangedSortedIds;assert.equal(new Set(ids).size,62);assert.equal(ids.length,62);assert.equal(sha(JSON.stringify(ids)+'\n'),pending.unchangedSortedIdsSha256);assert.deepEqual(pending.resolvedByThisBatch,[]);assert.equal(pending.uniqueAfter,62);assert(record.catalogCounts.addedAssociationIds.every(id=>!ids.includes(id)));
 assert.equal(record.editorialDecisions.length,5);assert.equal(record.editorialDecisions.filter(e=>e.decision==='evidence-sufficient-resource-wiring-blocked').length,4);assert(record.editorialDecisions.every(e=>!e.runtimeApplied));
 for(const e of record.editorialDecisions)assert(!Object.entries(index.lessons).filter(([id])=>id.startsWith(e.book+'-')).some(([,l])=>l.pages.some(p=>p.page===e.sourcePDFPage)));
 const held=record.editorialDecisions.find(e=>e.sourcePDFPage===424);assert.equal(held.printedLesson,80);assert.equal(held.inferredLesson,83);assert.equal(held.inferenceAcceptedAsCorrection,false);assert.equal(record.wholePrintedMeaningDenominator,null);assert.equal(record.humanReview,false);
});
const f=m.cards,p=m.progress,now=Date.UTC(2026,9,2,12);let state=structuredClone(m.initial);state.drafts['unrelated']='Saved personal note';
const oldHeads=m.reviewedSF02Associations.filter(r=>Object.hasOwn(raw.words,r.word));assert.equal(oldHeads.length,6);
for(const [i,r] of oldHeads.entries()){
 const e=dictionary[r.word];state=f.enrollFlashcard(state,{word:e.word,ipa:e.ipa,meaning:e.meaning.slice(0,300),example:'Existing saved example.'},[{kind:'ielts',topic:'Existing topic',use:'speaking'}],now);
 const note=Object.values(state.flashcards.notes).find(n=>n.word===r.word),card=Object.values(state.flashcards.cards).find(c=>c.noteId===note.id),token={cardId:card.id,revision:card.revision};state=f.rateFlashcard(f.revealFlashcard(f.selectFlashcard(state,card.id),token),token,['again','hard','good','easy'][i%4],now+i+1);
}
const old=structuredClone(state);
check('source browsing cannot enroll cards or alter saved learning state',()=>{m.buildVocabularyCatalog(index);m.withReviewedSF02Dictionary(raw.words);assert.deepEqual(state,old)});
for(const r of oldHeads){const e=dictionary[r.word];state=f.enrollFlashcard(state,{word:e.word,ipa:e.ipa,meaning:e.meaning.slice(0,300),example:''},[{kind:'nce',book:r.book,lesson:r.lesson}],now+1000)}
check('six old note/card IDs, meanings, examples, schedules and histories exact; only NCE tags merge',()=>{
 assert.equal(Object.keys(state.flashcards.notes).length,6);assert.deepEqual(state.flashcards.cards,old.flashcards.cards);assert.deepEqual(state.flashcards.reviews,old.flashcards.reviews);assert.deepEqual(state.drafts,old.drafts);
 for(const note of Object.values(state.flashcards.notes)){const prior=old.flashcards.notes[note.id];assert.deepEqual({...note,sources:prior.sources},prior);assert.equal(note.sources.length,2)}
 const enriched=structuredClone(state);for(const r of oldHeads){const e=dictionary[r.word];state=f.enrollFlashcard(state,{word:e.word,ipa:e.ipa,meaning:e.meaning.slice(0,300),example:''},[{kind:'nce',book:r.book,lesson:r.lesson}],now+2000)}assert.deepEqual(state,enriched);
 const undo=f.undoFlashcardReview(state),oldUndo=f.undoFlashcardReview(old);assert.deepEqual(undo.flashcards.cards,oldUndo.flashcards.cards);assert.deepEqual(undo.flashcards.reviews,oldUndo.flashcards.reviews);
});
for(const e of m.reviewedSF02DictionaryEntries){const r=m.reviewedSF02Associations.find(r=>r.word===e.word);state=f.enrollFlashcard(state,{word:e.word,ipa:e.ipa,meaning:e.meaning,example:''},[{kind:'nce',book:r.book,lesson:r.lesson}],now+3000)}
check('two new phrases have stable IDs, one queue entry each and no invented IPA; duplicate adds preserve schedules',()=>{
 assert.equal(Object.keys(state.flashcards.notes).length,8);for(const e of record.newPhraseIdentities){const note=state.flashcards.notes[e.noteId];assert.equal(note.word,e.word);assert(state.flashcards.cards[e.recognitionCardId]);assert(!note.ipa)}
 const enrolled=structuredClone(state);for(const e of m.reviewedSF02DictionaryEntries){const r=m.reviewedSF02Associations.find(r=>r.word===e.word);state=f.enrollFlashcard(state,{word:e.word,meaning:e.meaning,example:''},[{kind:'nce',book:r.book,lesson:r.lesson}],now+4000)}assert.deepEqual(state,enrolled);
 for(const e of m.reviewedSF02DictionaryEntries)assert.equal(f.getFlashcardQueue(state,now+4000).filter(row=>row.note.word===e.word).length,1);
 for(const [id,card] of Object.entries(old.flashcards.cards))assert.deepEqual(state.flashcards.cards[id],card);assert.deepEqual(state.flashcards.reviews,old.flashcards.reviews);
});
for(const [label,snapshot] of [['six-old',old],['eight-enriched',state]]){const restored=await p.readProgressFile(p.makeProgressFile(snapshot,new Date(now)));assert.deepEqual(restored.state,snapshot);groups.push(label+' backup/refresh restores every ID, timestamp and source tag')}
const reload=await bundle('online-refresh');globalThis.__sf02Dictionary=raw;assert.deepEqual(await reload.loadDictionary(),dictionary);assert.deepEqual(reload.buildVocabularyCatalog(index),after);groups.push('fresh online module recreates exact read projections; offline backup restores phrase cards');
assert.deepEqual(index,original);delete globalThis.__sf02Dictionary;delete globalThis.__sf02Reads;
console.log(JSON.stringify({passed:groups.length,groups,integratedSF01:hasSF01,addedAssociations:8,existingGlobalHeads:6,newDictionaryHeads:2,authoredHeadwords:315,authoredExamples:420,unresolvedUniqueIds:62,personalStorageAccessed:false,realBrowserEvidence:false,naturalRetentionEvidence:false}));
