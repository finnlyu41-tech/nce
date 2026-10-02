import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdir,readdir,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url),pnpm=new URL('node_modules/.pnpm/',root);
const version=(await readdir(pnpm)).find(n=>/^esbuild@\d+\.\d+\.\d+$/.test(n));
const {build}=await import(new URL(version+'/node_modules/esbuild/lib/main.js',pnpm));
const work=new URL('work/r19/tests/',root);await mkdir(work,{recursive:true});
const proof=JSON.parse(await readFile(new URL('docs/source-review-r19-20261002.json',root)));
const contents="export * from './app/source-review-r19';export * from './app/source-review-batch1';export * from './app/textbook-vocabulary';export * as cards from './app/flashcards';export * as progress from './app/progress-file';export {initial} from './app/model';export {originalVocabularyExamples} from './app/vocabulary-examples';export {ieltsFlashcardExamples} from './app/ielts-flashcard-examples';";
async function bundle(name,baseline=false){
 const output=new URL(name+'.mjs',work);
 const helper=baseline?execFileSync('git',['show',proof.baseCommit+':studio/app/source-review-batch1.ts'],{cwd:fileURLToPath(root),encoding:'utf8'}):null;
 await build({stdin:{contents,resolveDir:fileURLToPath(root),loader:'ts'},bundle:true,platform:'node',format:'esm',target:'node22',outfile:fileURLToPath(output),logLevel:'silent',plugins:helper?[{name:'actual-v37-helper',setup(b){b.onLoad({filter:/app\/source-review-batch1\.ts$/},()=>({contents:"import {withR19TailPages} from './source-review-r19-tail';\n"+helper.replace('export function withReviewedSourceAssociations(index:PageIndex):PageIndex{','export function withReviewedSourceAssociations(index:PageIndex):PageIndex{\n index=withR19TailPages(index);'),loader:'ts'}));}}]:[]});return import(output);
}
const m=await bundle('candidate'),baseline=await bundle('v37',true);
const indexBytes=await readFile(new URL('dist-online/lesson-pages/index.json',root)),dictionaryBytes=await readFile(new URL('dist-online/language/dictionary.json',root));
const index=JSON.parse(indexBytes),dictionary=JSON.parse(dictionaryBytes).words,original=structuredClone(index);
const prior=baseline.withReviewedSourceAssociations(index),projected=m.withReviewedSourceAssociations(index);
const groups=[],sha=b=>createHash('sha256').update(b).digest('hex');
const check=(name,fn)=>{fn();groups.push(name)};
check('56 accepted source IDs and six held IDs exactly partition frozen 62 without certifying all senses',()=>{
 assert.equal(proof.counts.sourceInterpretationNotes,51);assert.equal(proof.counts.identityNotes,5);assert.equal(m.reviewedR19SourceNotes.length,56);
 const ids=m.reviewedR19SourceNotes.map(r=>r.sourceWordId).sort();assert.deepEqual(ids,proof.closedUniqueIds);assert.equal(new Set(ids).size,56);
 assert.deepEqual([...ids,...proof.heldUniqueIds].sort(),proof.originalSortedUniqueIds);assert.equal(proof.counts.literalUnknownAfter,5);
 assert.deepEqual(proof.heldUniqueIds,['NCE1-142:regularly','NCE1-143:throw','NCE1-42:any','NCE1-81:ready','NCE2-66:lancaster','NCE2-73:lorry']);
 assert.equal(proof.counts.wholePrintedMeaningDenominator,null);assert.equal(proof.humanReview,false);
 for(const r of m.reviewedR19SourceNotes){const row=proof.decisions.find(d=>d.sourceWordId===r.sourceWordId);assert.equal(row.accepted,true);for(const k of ['book','lesson','word','sourceBookSha256','pdfPage','imageSha256','printedEntryId','printedPartOfSpeech','printedGloss','target','boundary'])assert.deepEqual(r[k],row[k]);assert(r.printedEntryId.startsWith(r.imageSha256+':'))}
});
check('raw index/dictionary bytes and every catalog source/head/form/title/glossary page unchanged',()=>{
 assert.equal(sha(indexBytes),proof.rawIndexSha256);assert.equal(sha(dictionaryBytes),proof.rawDictionarySha256);assert.deepEqual(index,original);
 const before=baseline.buildVocabularyCatalog(index),after=m.buildVocabularyCatalog(index);assert.deepEqual(after,before);assert.equal(after.entries,3626);assert.equal(after.terms.length,3356);
 const pure=m.withR19SupplementalPages(prior);assert.deepEqual(pure,projected);const changed=Object.keys(prior.lessons).filter(id=>prior.lessons[id]!==pure.lessons[id]);assert.deepEqual(changed.sort(),m.reviewedR19SupplementalPages.map(r=>r.book+'-'+r.lesson).sort());
 for(const [id,l] of Object.entries(prior.lessons)){const next=pure.lessons[id];assert.equal(next.title,l.title);assert.equal(next.vocabulary,l.vocabulary);if(changed.includes(id)){assert.deepEqual(next.pages.slice(0,l.pages.length),l.pages);assert.equal(next.pages.length,l.pages.length+1)}else assert.equal(next,l)}
 assert.equal(m.withReviewedSourceAssociations(projected),projected);assert.equal(m.withR19SupplementalPages(projected),projected);
});
check('all 56 actual source notes visible through shared page clarification with exact provenance',()=>{
 for(const r of m.reviewedR19SourceNotes){const page=projected.lessons[r.book+'-'+r.lesson].pages.find(p=>p.page===r.pdfPage);assert(page);assert(m.sourcePageClarification(projected,r.book,r.lesson,page).includes(r.text));assert(m.r19SourcePageNotes(projected,r.book,r.lesson,page).includes(r.text))}
 for(const r of m.reviewedR19SourceNotes){const id=r.book+'-'+r.lesson,page=projected.lessons[id].pages.find(p=>p.page===r.pdfPage);
  for(const mutate of [x=>{x.version=2},x=>{x.sources[r.book]='0'.repeat(64)},x=>{x.lessons[id].vocabulary.pages=[]},x=>{x.lessons[id].vocabulary.words=x.lessons[id].vocabulary.words.filter(w=>w.word!==r.word)},x=>{x.lessons[id].vocabulary.words.push({word:r.word,forms:[]})},x=>{x.lessons[id].pages=x.lessons[id].pages.filter(p=>p.page!==r.pdfPage)},x=>{x.lessons[id].pages.push(page)},x=>{x.lessons[r.book+'-1'].pages.push(page)},x=>{x.lessons[id].vocabulary.words.push({word:r.word.toUpperCase(),forms:[]})},x=>{x.lessons[id].vocabulary.words.push({word:' '+r.word+' ',forms:[]})}]){const bad=structuredClone(projected);mutate(bad);assert(!(m.r19SourcePageNotes(bad,r.book,r.lesson,page)||'').includes(r.text))}
  assert.equal(m.r19SourcePageNotes(projected,r.book,r.lesson,{...page,sha256:'0'.repeat(64)}),undefined);assert.equal(m.r19SourcePageNotes(projected,r.book,r.lesson,{...page,src:'/other.jpg'}),undefined);assert.equal(m.r19SourcePageNotes(projected,r.book,r.lesson+1,page),undefined);
 }
});
check('five identity links retain printed characters and existing canonical strings; no global remapping',()=>{
 const rows=m.reviewedR19SourceNotes.filter(r=>r.kind==='identity');assert.equal(rows.length,5);
 const pairs=proof.decisions.filter(r=>r.kind==='identity').map(r=>[r.sourceWordId,r.printedHead,r.word]);
 assert.deepEqual(pairs,[['NCE2-10:jazz','jazz','Jazz'],['NCE2-83:ex','ex-','ex'],['NCE2-86:waterski','water ski','waterski'],['NCE4-47:maître d\'hôtel','maître d’hôtel',"maître d'hôtel"],['NCE4-4:lotto','lotto','Lotto']].sort((a,b)=>a[0]<b[0]?-1:1));
 for(const r of rows){const l=projected.lessons[r.book+'-'+r.lesson],old=prior.lessons[r.book+'-'+r.lesson];assert.equal(l.vocabulary,old.vocabulary);assert.equal(l.vocabulary.words.filter(w=>w.word===r.word).length,1)}
 assert.equal(rows.find(r=>r.sourceWordId==='NCE2-86:waterski').printedPartOfSpeech,null);
});
check('four original R19 pages and historical PDF424 receipt stay unchanged by that batch',()=>{
 assert.equal(m.reviewedR19SupplementalPages.length,4);
 for(const r of m.reviewedR19SupplementalPages){const l=projected.lessons[r.book+'-'+r.lesson],page=l.pages.at(-1);assert.equal(page.page,r.pdfPage);assert.equal(page.sha256,r.imageSha256);assert.equal(page.src,r.src);assert(!l.vocabulary.pages.includes(r.pdfPage));assert(m.sourcePageClarification(projected,r.book,r.lesson,page).includes(r.text));assert.equal(m.sourcePageClarification(prior,r.book,r.lesson,page),undefined);assert.equal(m.sourcePageClarification(projected,r.book,r.lesson+1,page),undefined)}
 assert.deepEqual(projected.lessons['NCE2-83'].pages,prior.lessons['NCE2-83'].pages);assert.equal(proof.unresolvedEditorial.inferenceAccepted,false);
 const legacy=projected.lessons['NCE2-34'].pages.find(p=>p.page===199);assert(m.sourcePageClarification(projected,'NCE2',34,legacy).includes('第 34 课'));
});
check('supplemental projection rejects wrong editions/anchor/duplicate/foreign placement before mutation',()=>{
 for(const r of m.reviewedR19SupplementalPages){const id=r.book+'-'+r.lesson,extra={page:r.pdfPage,sha256:r.imageSha256,src:r.src};
  for(const mutate of [x=>{x.version=2},x=>{x.sources[r.book]='0'.repeat(64)},x=>{x.lessons[id].pages=[]},x=>{x.lessons[id].pages.push({...x.lessons[id].pages[0]})},x=>{x.lessons[id].pages.push({...x.lessons[id].pages[0],sha256:'0'.repeat(64)})},x=>{x.lessons[id].pages[0].src='/other.jpg'},x=>{x.lessons[id].vocabulary.pages.push(r.pdfPage)},x=>{x.lessons[id].pages.push({...extra,sha256:'0'.repeat(64)})},x=>{x.lessons[id].pages.push(extra,extra)},x=>{x.lessons[r.book+'-1'].pages.push(extra)}]){const bad=structuredClone(prior);mutate(bad);const snapshot=structuredClone(bad);assert.throws(()=>m.withR19SupplementalPages(bad));assert.deepEqual(bad,snapshot)}
 }
});
check('critical interpretative boundaries and literal POS/gloss remain distinct',()=>{
 const at=id=>m.reviewedR19SourceNotes.find(r=>r.sourceWordId===id);
 assert.equal(at('NCE3-8:rashly').printedPartOfSpeech,'adj.');assert(at('NCE3-8:rashly').target.startsWith('adv.'));
 assert.equal(at('NCE3-34:dealer').printedPartOfSpeech,'v.');assert.equal(at('NCE4-45:envision').printedPartOfSpeech,'n.');assert(at('NCE4-45:envision').target.includes('process'));
 assert.equal(at('NCE4-16:dimension').printedGloss,'直径');assert(at('NCE4-16:dimension').target.includes('尺寸'));
 assert.equal(at('NCE4-26:vole').printedGloss,'野鼠，鼹鼠');assert(at('NCE4-26:vole').target.includes('田鼠'));
 assert(at('NCE3-13:metre').boundary.includes('metre'));assert(at('NCE3-46:fuse').boundary.includes('short circuit'));
 for(const id of ['NCE2-3:single','NCE2-26:curtain','NCE2-36:solid','NCE2-95:heaven'])assert.equal(at(id).target,proof.decisions.find(r=>r.sourceWordId===id).target);
 assert.equal(at('NCE1-37:pink').printedPartOfSpeech,'n. & adj.');assert.equal(at('NCE1-48:wine').printedGloss,'酒，果酒');
});
check('authored examples, IELTS seed, dictionary/enrollment/parser/store/scheduler files untouched',()=>{
 assert.equal(m.originalVocabularyExamples.length,420);assert.equal(new Set(m.originalVocabularyExamples.map(e=>e.word.toLowerCase())).size,315);assert.deepEqual(m.originalVocabularyExamples,baseline.originalVocabularyExamples);assert.deepEqual(m.ieltsFlashcardExamples,baseline.ieltsFlashcardExamples);
 for(const path of ['app/vocabulary-examples.ts','app/ielts-flashcard-examples.ts','app/flashcards.ts','app/progress-file.ts','app/model.ts','app/language.ts','app/offline-store.ts','app/lesson-context.tsx']){const actual=execFileSync('git',['show',proof.baseCommit+':studio/'+path],{cwd:fileURLToPath(root)});assert.equal(sha(actual),sha(execFileSync('cat',[fileURLToPath(new URL(path,root))])))}
});
const now=Date.UTC(2026,9,2,12),f=m.cards;let state=structuredClone(m.initial);state.drafts['saved']='Existing unrelated note';
for(const [i,r] of m.reviewedR19SourceNotes.entries()){
 const entry=dictionary[r.word.toLowerCase()];assert(entry,r.word);state=f.enrollFlashcard(state,{word:r.word,meaning:entry.meaning.slice(0,300),ipa:entry.ipa,example:'Existing saved example.'},[{kind:'nce',book:r.book,lesson:r.lesson}],now+i);
 const note=Object.values(state.flashcards.notes).find(n=>n.word===r.word),card=Object.values(state.flashcards.cards).find(c=>c.noteId===note.id),token={cardId:card.id,revision:card.revision};state=f.rateFlashcard(f.revealFlashcard(f.selectFlashcard(state,card.id),token),token,['again','hard','good','easy'][i%4],now+i+1);
}
const snapshot=structuredClone(state);
check('browsing all reviewed pages does not change saved definitions/card IDs/history/absolute due times',()=>{
 m.buildVocabularyCatalog(index);for(const r of m.reviewedR19SourceNotes){const page=projected.lessons[r.book+'-'+r.lesson].pages.find(p=>p.page===r.pdfPage);m.sourcePageClarification(projected,r.book,r.lesson,page)}assert.deepEqual(state,snapshot);
 for(const r of m.reviewedR19SourceNotes){const e=dictionary[r.word.toLowerCase()];state=f.enrollFlashcard(state,{word:r.word,meaning:e.meaning.slice(0,300),ipa:e.ipa,example:''},[{kind:'nce',book:r.book,lesson:r.lesson}],now+1000)}assert.deepEqual(state,snapshot);
});
const restored=await m.progress.readProgressFile(m.progress.makeProgressFile(snapshot,new Date(now)));assert.deepEqual(restored.state,snapshot);groups.push('full backup reload preserves all 56 existing meanings/cards/ratings/schedules/source tags');
const fresh=await bundle('fresh-refresh');assert.deepEqual(fresh.withReviewedSourceAssociations(index),projected);assert.deepEqual(fresh.cards.getFlashcardQueue(restored.state,now+86400000),f.getFlashcardQueue(snapshot,now+86400000));groups.push('fresh module and cross-day queue preserve exact source projection and stored schedule');
console.log(JSON.stringify({passed:groups.length,groups,closedUniqueIds:56,heldUniqueIds:6,newCards:0,newExamples:0,wholeMeaningDenominator:null,realBrowserEvidence:false}));
