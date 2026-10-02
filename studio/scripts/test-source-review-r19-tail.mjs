import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdir,readFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url),pnpm=new URL('node_modules/.pnpm/',root),proof=JSON.parse(await readFile(new URL('docs/source-review-r19-tail-20261002.json',root)));
const version=(await readdir(pnpm)).find(n=>/^esbuild@\d+\.\d+\.\d+$/.test(n)),{build}=await import(new URL(version+'/node_modules/esbuild/lib/main.js',pnpm));
const work=new URL('work/r19-tail/tests/',root);await mkdir(work,{recursive:true});
const contents="export * from './app/source-review-r19-tail';export * from './app/source-review-batch1';export * from './app/textbook-vocabulary';export * as cards from './app/flashcards';export * as progress from './app/progress-file';export {initial} from './app/model';export {originalVocabularyExamples} from './app/vocabulary-examples';export {ieltsFlashcardExamples} from './app/ielts-flashcard-examples';";
async function bundle(name,baseline=false){const output=new URL(name+'.mjs',work);await build({stdin:{contents,loader:'ts',resolveDir:fileURLToPath(root)},bundle:true,platform:'node',format:'esm',target:'node22',outfile:fileURLToPath(output),logLevel:'silent',plugins:baseline?[{name:'actual-dcbc9b0-helper',setup(b){b.onLoad({filter:/app\/source-review-r19\.ts$/},()=>({contents:execFileSync('git',['show',proof.baseCommit+':studio/app/source-review-r19.ts'],{cwd:fileURLToPath(root),encoding:'utf8'}),loader:'ts'}));}}]:[]});return import(output)}
const m=await bundle('candidate'),before=await bundle('baseline',true);
const raw=JSON.parse(await readFile(new URL('dist-online/lesson-pages/index.json',root))),dictionary=JSON.parse(await readFile(new URL('dist-online/language/dictionary.json',root))).words,original=structuredClone(raw);
const prior=before.withReviewedSourceAssociations(raw),index=m.withReviewedSourceAssociations(raw),groups=[];
const check=(name,fn)=>{fn();groups.push(name)},sha=b=>createHash('sha256').update(b).digest('hex');
check('six scoped notes cover held IDs while all original literal/meaning holds remain explicit',()=>{
 assert.equal(m.reviewedR19TailNotes.length,6);assert.deepEqual(m.reviewedR19TailNotes.map(r=>r.sourceWordId).sort(),proof.originalQuestions.map(r=>r.sourceWordId).sort());
 assert.equal(proof.counts.originalUnresolvedIdsBefore,6);assert.equal(proof.counts.originalUnresolvedIdsAfter,6);assert.equal(proof.counts.originalUnresolvedIdsClosed,0);assert.equal(proof.counts.literalUnknownRowsAfter,5);assert.equal(proof.counts.wholePrintedMeaningDenominator,null);assert.equal(proof.humanReview,false);
 for(const r of m.reviewedR19TailNotes){const old=proof.originalQuestions.find(d=>d.sourceWordId===r.sourceWordId);assert.equal(r.fullInterpretationConfirmed,false);assert.equal(r.completePrintedGloss,old.printedGloss);assert.equal(r.printedEntryId,old.printedEntryId);assert.equal(r.printedPartOfSpeech,old.printedPartOfSpeech);assert.equal(r.literalCompleteVerified,r.word==='ready');assert(r.text.includes('仍'))}
});
check('all six actual source-bound uncertainty notes reach shared clarification with exact gates',()=>{
 for(const r of m.reviewedR19TailNotes){const id=r.book+'-'+r.lesson,page=index.lessons[id].pages.find(p=>p.page===r.pdfPage);assert(m.sourcePageClarification(index,r.book,r.lesson,page).includes(r.text));assert(m.r19TailPageNotes(index,r.book,r.lesson,page).includes('完整条目仍待核'));
  const mutate=[x=>{x.version=2},x=>{x.sources[r.book]='0'.repeat(64)},x=>{x.lessons[id].vocabulary.pages=[]},x=>{x.lessons[id].vocabulary.words=x.lessons[id].vocabulary.words.filter(w=>w.word!==r.word)},x=>{x.lessons[id].vocabulary.words.push({word:' '+r.word.toUpperCase()+' ',forms:[]})},x=>{x.lessons[id].vocabulary.words.push({word:null,forms:[]})},x=>{x.lessons[id].pages.push(page)},x=>{x.lessons[r.book+'-1'].pages.push(page)}];
  for(const fn of mutate){const bad=structuredClone(index);fn(bad);assert.equal(m.r19TailPageNotes(bad,r.book,r.lesson,page),undefined)}
  assert.equal(m.r19TailPageNotes(index,r.book,r.lesson+1,page),undefined);assert.equal(m.r19TailPageNotes(index,r.book,r.lesson,{...page,sha256:'0'.repeat(64)}),undefined);assert.equal(m.r19TailPageNotes(index,r.book,r.lesson,{...page,src:'/other.jpg'}),undefined);
 }
});
check('PDF424 content link retains printed80 and associated83; only one display page appended',()=>{
 assert.equal(m.reviewedR19TailPages.length,1);const r=m.reviewedR19TailPages[0],page=index.lessons['NCE2-83'].pages.at(-1);assert.equal(page.page,424);assert.equal(page.sha256,r.imageSha256);assert.equal(page.src,r.src);assert.equal(r.printedLesson,80);assert.equal(r.contentAssociationLesson,83);assert.equal(r.publisherErratumVerified,false);
 const text=m.sourcePageClarification(index,'NCE2',83,page);assert(text.includes('Lesson 80'));assert(text.includes('第83课'));assert(text.includes('原印课号保留'));assert.equal(m.sourcePageClarification(index,'NCE2',80,page),undefined);
 assert.equal(proof.editorialPrintingStillUnresolved.originalHeaderRewritten,false);assert.equal(proof.editorialPrintingStillUnresolved.publisherErratumVerified,false);
 const pure=m.withR19TailPages(prior);assert.deepEqual(pure,index);assert.equal(m.withR19TailPages(index),index);assert.equal(m.withReviewedSourceAssociations(index),index);
 assert.deepEqual(Object.keys(prior.lessons).filter(id=>prior.lessons[id]!==pure.lessons[id]),['NCE2-83']);
 for(const [id,l] of Object.entries(prior.lessons)){const next=pure.lessons[id];assert.equal(next.title,l.title);assert.equal(next.vocabulary,l.vocabulary);if(id==='NCE2-83'){assert.deepEqual(next.pages.slice(0,-1),l.pages);assert.equal(next.pages.length,l.pages.length+1);assert(!next.vocabulary.pages.includes(424))}else assert.equal(next,l)}
});
check('both surrounding indexed pages, edition, exercise role and unique ownership gate PDF424',()=>{
 const r=m.reviewedR19TailPages[0],id='NCE2-83',extra={page:424,sha256:r.imageSha256,src:r.src};
 for(const fn of [x=>{x.version=2},x=>{x.sources.NCE2='0'.repeat(64)},x=>{x.lessons[id].pages=x.lessons[id].pages.filter(p=>p.page!==422)},x=>{x.lessons[id].pages.find(p=>p.page===423).sha256='0'.repeat(64)},x=>{x.lessons[id].pages.push({...x.lessons[id].pages[0]})},x=>{x.lessons[id].vocabulary.pages.push(424)},x=>{x.lessons[id].pages.push({...extra,src:'/wrong.png'})},x=>{x.lessons[id].pages.push(extra,extra)},x=>{x.lessons['NCE2-80'].pages.push(extra)}]){const bad=structuredClone(prior);fn(bad);const snapshot=structuredClone(bad);assert.throws(()=>m.withR19TailPages(bad));assert.deepEqual(bad,snapshot)}
 for(const fn of [x=>{x.lessons[id].pages.find(p=>p.page===423).sha256='0'.repeat(64)},x=>{x.lessons[id].pages.push(extra)},x=>{x.lessons['NCE2-80'].pages.push(extra)},x=>{x.sources.NCE2='0'.repeat(64)}]){const bad=structuredClone(index);fn(bad);assert.equal(m.r19TailPageNotes(bad,'NCE2',83,extra),undefined)}
});
check('raw bundle and every old catalog association/form remain exact; no additional meanings or authored content',()=>{
 assert.deepEqual(raw,original);assert.deepEqual(m.buildVocabularyCatalog(raw),before.buildVocabularyCatalog(raw));assert.equal(m.buildVocabularyCatalog(raw).entries,3626);assert.equal(m.buildVocabularyCatalog(raw).terms.length,3356);
 assert.deepEqual(m.originalVocabularyExamples,before.originalVocabularyExamples);assert.equal(m.originalVocabularyExamples.length,420);assert.equal(new Set(m.originalVocabularyExamples.map(e=>e.word.toLowerCase())).size,315);assert.deepEqual(m.ieltsFlashcardExamples,before.ieltsFlashcardExamples);
 for(const path of ['app/data/source-review-r19.json','app/data/source-review-r19-pages.json','docs/source-review-r19-20261002.json','app/flashcards.ts','app/progress-file.ts','app/model.ts','app/language.ts','app/offline-store.ts','app/vocabulary-examples.ts','app/ielts-flashcard-examples.ts','app/lesson-context.tsx'])assert.equal(sha(execFileSync('git',['show',(path==='app/ielts-flashcard-examples.ts'?'92f777d7d4c61811689b353263d7d59076b4e507':proof.baseCommit)+':studio/'+path],{cwd:fileURLToPath(root)})),sha(execFileSync('cat',[fileURLToPath(new URL(path,root))])));
});
const now=Date.UTC(2026,9,2,12),f=m.cards;let state=structuredClone(m.initial);state.drafts['saved']='Personal test fixture retained';
for(const [i,r] of m.reviewedR19TailNotes.entries()){const e=dictionary[r.word.toLowerCase()];assert(e);state=f.enrollFlashcard(state,{word:r.word,meaning:e.meaning.slice(0,300),ipa:e.ipa,example:'Existing saved example.'},[{kind:'nce',book:r.book,lesson:r.lesson}],now+i);const note=Object.values(state.flashcards.notes).find(n=>n.word===r.word),card=Object.values(state.flashcards.cards).find(c=>c.noteId===note.id),token={cardId:card.id,revision:card.revision};state=f.rateFlashcard(f.revealFlashcard(f.selectFlashcard(state,card.id),token),token,['again','hard','good','easy'][i%4],now+i+1)}
const saved=structuredClone(state);
check('annotation browsing and duplicate enrollment preserve all six saved card meanings/IDs/FSRS logs',()=>{
 for(const r of m.reviewedR19TailNotes){const page=index.lessons[r.book+'-'+r.lesson].pages.find(p=>p.page===r.pdfPage);m.sourcePageClarification(index,r.book,r.lesson,page);const e=dictionary[r.word.toLowerCase()];state=f.enrollFlashcard(state,{word:r.word,meaning:e.meaning.slice(0,300),ipa:e.ipa,example:''},[{kind:'nce',book:r.book,lesson:r.lesson}],now+1000)}assert.deepEqual(state,saved);
});
const restored=await m.progress.readProgressFile(m.progress.makeProgressFile(saved,new Date(now)));assert.deepEqual(restored.state,saved);assert.deepEqual(f.getFlashcardQueue(restored.state,now+86400000),f.getFlashcardQueue(saved,now+86400000));groups.push('backup refresh and cross-day queue preserve every saved field');
const fresh=await bundle('fresh');assert.deepEqual(fresh.withReviewedSourceAssociations(raw),index);assert.deepEqual(raw,original);groups.push('fresh module reproduces one supplemental page and six uncertainty notes without input mutation');
console.log(JSON.stringify({passed:groups.length,groups,scopedNotes:6,originalUnresolvedIdsClosed:0,originalUnresolvedIdsAfter:6,literalUnknownAfter:5,supplementalPages:1,wholeMeaningDenominator:null,realBrowserEvidence:false}));
