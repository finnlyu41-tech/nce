import assert from 'node:assert/strict';
import {mkdir,readdir,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url),pnpm=new URL('node_modules/.pnpm/',root);
const versions=(await readdir(pnpm)).filter(n=>/^esbuild@\d+\.\d+\.\d+$/.test(n)).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}));
const {build}=await import(new URL(versions[0]+'/node_modules/esbuild/lib/main.js',pnpm));
const output=new URL('work/source-review-batch1/model.mjs',root);await mkdir(new URL('.',output),{recursive:true});
await build({stdin:{contents:`export * from './app/source-review-batch1';export * from './app/data/source-review-batch1';export {reviewedR19SupplementalPages} from './app/source-review-r19';export {reviewedSF02Associations} from './app/data/source-review-sf02';export * from './app/textbook-vocabulary';export * as cards from './app/flashcards';export * as progress from './app/progress-file';export {initial} from './app/model';`,resolveDir:fileURLToPath(root),loader:'ts'},bundle:true,platform:'node',format:'esm',target:'node22',outfile:fileURLToPath(output),logLevel:'silent'});
const m=await import(output),f=m.cards,p=m.progress;
const index=JSON.parse(await readFile(new URL('dist-online/lesson-pages/index.json',root),'utf8'));
const dictionary=JSON.parse(await readFile(new URL('dist-online/language/dictionary.json',root),'utf8')).words;
const original=structuredClone(index),projected=m.withReviewedSourceAssociations(index),catalog=m.buildVocabularyCatalog(index),groups=[];
function check(name,fn){fn();groups.push(name)}
check('legacy two, SF01 two plus SF02 eight associations; raw bundle and all old rows preserved',()=>{
 assert.deepEqual(index,original);assert.equal(catalog.entries,3626);assert.equal(catalog.terms.length,3356);
 const sourceIds=x=>Object.entries(x.lessons).flatMap(([id,l])=>l.vocabulary.words.map(w=>id+':'+w.word.toLowerCase()));
 const before=new Set(sourceIds(index)),after=new Set(sourceIds(projected));
 assert.deepEqual([...after].filter(id=>!before.has(id)).sort(),['NCE1-103:low','NCE1-51:snow','NCE3-58:balcony','NCE4-9:assail',...m.reviewedSF02Associations.map(r=>r.book+'-'+r.lesson+':'+r.word)].sort());
 assert([...before].every(id=>after.has(id)));assert.equal(m.withReviewedSourceAssociations(projected),projected);
 for(const [id,lesson] of Object.entries(index.lessons))if(!['NCE1-103','NCE1-51','NCE3-58','NCE4-9',...m.reviewedSF02Associations.map(r=>r.book+'-'+r.lesson),...m.reviewedR19SupplementalPages.map(r=>r.book+'-'+r.lesson),'NCE2-83'].includes(id))assert.equal(projected.lessons[id],lesson);
});
check('existing normalized words, forms and printed ordering',()=>{
 for(const repair of m.reviewedSourceAssociations){
  const target=projected.lessons[repair.book+'-'+repair.lesson].vocabulary.words;
  const existing=index.lessons[repair.existingBook+'-'+repair.existingLesson].vocabulary.words.find(w=>w.word.toLowerCase()===repair.word);
  const position=target.findIndex(w=>w.word===repair.word);
  assert.deepEqual(target[position].forms,existing.forms);assert.equal(target[position+1].word,repair.beforeWord);
  assert.equal(catalog.terms.filter(t=>t.key===repair.word).length,1);
  assert.equal(catalog.terms.find(t=>t.key===repair.word).sources.length,2);
 }
});
check('wrong source, missing page and orphan link fail before projection',()=>{
 const bad=[x=>{x.sources.NCE1='0'.repeat(64)},x=>{x.lessons['NCE1-103'].vocabulary.pages=[]},x=>{x.lessons['NCE4-9'].pages.find(p=>p.page===83).sha256='0'.repeat(64)},x=>{x.lessons['NCE1-103'].pages.find(p=>p.page===214).src='/different.jpg'},x=>{x.lessons['NCE3-28'].vocabulary.words=x.lessons['NCE3-28'].vocabulary.words.filter(w=>w.word!=='assail')},x=>{x.lessons['NCE1-103'].vocabulary.words=x.lessons['NCE1-103'].vocabulary.words.filter(w=>w.word!=='cheer')}];
 for(const mutate of bad){const changed=structuredClone(index);mutate(changed);const before=structuredClone(changed);assert.throws(()=>m.withReviewedSourceAssociations(changed));assert.deepEqual(changed,before)}
 const stale=structuredClone(projected);stale.sources.NCE4='0'.repeat(64);assert.throws(()=>m.withReviewedSourceAssociations(stale),'Already added words retain their original-source gate');
});
check('clarification is bound to the existing lesson, PDF page and SHA',()=>{
 const page=index.lessons['NCE2-34'].pages.find(p=>p.page===199);assert(page);
 assert(m.sourcePageClarification(index,'NCE2',34,page).includes('第 34 课'));
 assert.equal(m.sourcePageClarification(index,'NCE2',33,page),undefined);
 assert.equal(m.sourcePageClarification(index,'NCE2',34,{...page,sha256:'0'.repeat(64)}),undefined);
 assert.equal(m.sourcePageClarification({...index,sources:{...index.sources,NCE2:'0'.repeat(64)}},'NCE2',34,page),undefined);
 assert.equal(m.sourcePageClarification(index,'NCE2',83,{...page,page:424}),undefined);
 assert.deepEqual(index,original);
});
const now=Date.now();let state=structuredClone(m.initial);
state.drafts['independent-old-note']='Unrelated old note remains';
for(const repair of m.reviewedSourceAssociations){
 const entry=dictionary[repair.word];assert(entry);
 state=f.enrollFlashcard(state,{word:entry.word,ipa:entry.ipa,meaning:entry.meaning.slice(0,300),example:'An existing saved example.'},[{kind:'nce',book:repair.existingBook,lesson:repair.existingLesson}],now);
 const note=Object.values(state.flashcards.notes).find(n=>n.word.toLowerCase()===repair.word),card=Object.values(state.flashcards.cards).find(c=>c.noteId===note.id),token={cardId:card.id,revision:card.revision};
 state=f.rateFlashcard(f.revealFlashcard(f.selectFlashcard(state,card.id),token),token,'good',now+1);
}
const old=structuredClone(state);
for(const repair of m.reviewedSourceAssociations){
 const entry=dictionary[repair.word];state=f.enrollFlashcard(state,{word:entry.word,ipa:entry.ipa,meaning:entry.meaning.slice(0,300),example:''},[{kind:'nce',book:repair.book,lesson:repair.lesson}],now+1000);
}
check('genuine old FSRS cards and histories retained without duplicate senses',()=>{
 assert.equal(Object.keys(state.flashcards.notes).length,2);assert.equal(Object.keys(state.flashcards.cards).length,2);
 assert.deepEqual(state.flashcards.cards,old.flashcards.cards);assert.deepEqual(state.flashcards.reviews,old.flashcards.reviews);
 assert.deepEqual(state.drafts,old.drafts);assert.equal(state.attempts,old.attempts);assert.equal(state.correct,old.correct);
 for(const repair of m.reviewedSourceAssociations){
  const note=Object.values(state.flashcards.notes).find(n=>n.word.toLowerCase()===repair.word),prior=old.flashcards.notes[note.id];
  assert.deepEqual({...note,sources:prior.sources},prior);assert.equal(note.sources.length,2);
 }
});
check('undo still restores absolute prior scheduling after a source-only merge',()=>{
 const undo=f.undoFlashcardReview(state),prior=f.undoFlashcardReview(old);
 assert.deepEqual(undo.flashcards.cards,prior.flashcards.cards);assert.deepEqual(undo.flashcards.reviews,prior.flashcards.reviews);
 for(const note of Object.values(undo.flashcards.notes))assert.equal(note.sources.length,2);
});
for(const [label,snapshot] of [['old',old],['source-enriched',state]]){
 const decoded=await p.readProgressFile(p.makeProgressFile(snapshot,new Date(now)));
 assert.deepEqual(decoded.state,snapshot);groups.push(label+' backup roundtrip preserves card IDs, schedules, sources and unrelated notes');
}
assert.deepEqual(index,original);
console.log(JSON.stringify({passed:groups.length,groups,legacySourceAssociations:2,sf01SourceAssociations:2,sf02SourceAssociations:8,newNormalizedWordsSinceRaw:10,newDictionaryEntries:2,newAuthoredExamples:0,naturalTimeEvidence:false,realBrowserEvidence:false}));
