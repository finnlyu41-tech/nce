import assert from 'node:assert/strict';
import {mkdir,readdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const root=new URL('../',import.meta.url),packages=new URL('node_modules/.pnpm/',root);
const builder=(await readdir(packages)).find(name=>/^esbuild@\d+\.\d+\.\d+$/.test(name));
assert(builder,'Install locked dependencies before running vocabulary example checks');
const {build}=await import(new URL(builder+'/node_modules/esbuild/lib/main.js',packages));
const output=new URL('work/vocabulary-examples/test-bundle.mjs',root);
await mkdir(new URL('work/vocabulary-examples/',root),{recursive:true});
await build({stdin:{contents:"export {originalVocabularyExamples,examplesForMeaning} from './app/vocabulary-examples';export {usageExamples,loadVocabularyContext} from './app/vocabulary-usage';export {VocabularyExamples} from './app/vocabulary-example-ui';export {FlashcardReview} from './app/flashcard-ui';export {initial,validateState} from './app/model';export * from './app/flashcards';export {buildVocabularyCatalog,vocabularyKey} from './app/textbook-vocabulary';export {vocabularyExample} from './app/nce-utils';export {ieltsFlashcardExamples} from './app/ielts-flashcard-examples';export {renderToStaticMarkup} from 'react-dom/server';export {createElement} from 'react';",resolveDir:fileURLToPath(root),sourcefile:'example-check.ts',loader:'ts'},bundle:true,platform:'node',format:'esm',target:'node22',jsx:'automatic',outfile:fileURLToPath(output),packages:'external',logLevel:'silent',plugins:[{name:'local-example-checks',setup(builder){builder.onResolve({filter:/\.css$/},args=>({path:args.path,namespace:'empty-css'}));builder.onLoad({filter:/.*/,namespace:'empty-css'},()=>({contents:'',loader:'js'}));builder.onResolve({filter:/^\.\/runtime-mode$/},()=>({path:'runtime',namespace:'local-mode'}));builder.onLoad({filter:/.*/,namespace:'local-mode'},()=>({contents:'export const ONLINE=true;',loader:'js'}));}}]});
const m=await import(output.href),now=Date.now(),base=()=>structuredClone(m.initial);
const render=(component,props)=>m.renderToStaticMarkup(m.createElement(component,props));

assert.equal(new Set(m.originalVocabularyExamples.map(example=>example.id)).size,m.originalVocabularyExamples.length,'Every sense has its own stable content ID');
assert.equal(new Set(m.originalVocabularyExamples.map(example=>example.word)).size,32,'The documented first batch has 32 headwords');
for(const example of m.originalVocabularyExamples){
 assert(example.en.trim()&&example.zh.trim()&&example.sense.trim()&&example.matches.length);
 assert(example.collocation.en.trim()&&example.collocation.zh.trim());
 assert.equal(example.origin,'original');
 assert(m.examplesForMeaning(example.word,example.sense).some(item=>item.id===example.id),'Each example supports its labelled sense');
}
for(const [word,meaning,id] of [['BANK','银行','bank-finance'],['bank','河岸','bank-riverside'],['book','预订','book-reserve'],['watch','观看','watch-observe'],['light','轻','light-weight'],['match','火柴','match-fire'],['park','停车','park-vehicle']]){
 assert.deepEqual(m.examplesForMeaning(word,meaning).map(item=>item.id),[id],'A meaning selects the corresponding sense and no unrelated sense');
}
assert.deepEqual(m.examplesForMeaning('book','书法'),[]);
assert.deepEqual(m.examplesForMeaning('park','停车处'),[]);
assert.deepEqual(m.examplesForMeaning('bank','n. 银行；河岸','河岸').map(item=>item.id),['bank-riverside'],'A Chinese meaning search focuses the matching sense');
assert.deepEqual(m.examplesForMeaning('light','轻浮'),[],'A shared Chinese character cannot select the light-weight sense');
assert.deepEqual(m.examplesForMeaning('watch','看守'),[],'Watching and guarding are different senses');
assert.deepEqual(m.examplesForMeaning('bank','<script>unrelated</script>'),[]);
assert.deepEqual(m.examplesForMeaning('mysteryword','未知义项'),[],'Missing content is not filled with a universal sentence');
assert.deepEqual(m.examplesForMeaning('bank',''),[]);
assert.equal(m.usageExamples('bank','银行',[{en:'A custom sentence.',zh:'用户译文'}])[0].zh,'用户译文');
const known=m.examplesForMeaning('bank','银行')[0];
assert.equal(m.usageExamples('bank','银行',[{en:known.en,zh:known.zh}]).filter(item=>item.en===known.en).length,1,'A stored original is displayed only once');
assert.equal(m.usageExamples('bank','河岸').filter(item=>item.sense?.includes('银行')).length,0,'Other senses are not attached to an imported note');

let state=m.enrollFlashcard(base(),{word:'bank',meaning:'银行',example:''},[{kind:'nce',book:'NCE1',lesson:63},{kind:'nce',book:'NCE2',lesson:7}],now);
const before=structuredClone(state),card=Object.values(state.flashcards.cards)[0],token={cardId:card.id,revision:card.revision};
const front=render(m.FlashcardReview,{state,update:()=>{},ready:true,onAdd:()=>{},onSelectWords:()=>{}});
assert(!front.includes(known.en),'The unscored review front contains no answer-bearing example');
state=m.revealFlashcard(m.selectFlashcard(state,card.id),token);
const back=render(m.FlashcardReview,{state,update:()=>{},ready:true,onAdd:()=>{},onSelectWords:()=>{}});
assert(back.includes(known.en)&&back.includes(known.zh)&&back.includes(known.collocation.en),'Revealing displays the correct sense, translation and collocation');
assert.deepEqual(before.flashcards.cards,state.flashcards.cards,'Rendering and revealing never reschedule a card');
assert.deepEqual(before.flashcards.notes,state.flashcards.notes,'Missing examples are a read-only display fallback');
assert(m.validateState(state));
const graded=m.rateFlashcard(state,token,'good',now),schedule=structuredClone(graded.flashcards.cards);
const augmented=m.enrollFlashcard(graded,{word:'bank',meaning:'银行',example:known.en,exampleTranslation:known.zh},[{kind:'nce',book:'NCE1',lesson:63}],now);
assert.deepEqual(augmented.flashcards.cards,schedule,'Explicitly adding an example retains all FSRS due/revision/history');
assert.deepEqual(augmented.flashcards.reviews,graded.flashcards.reviews);
assert.equal(Object.keys(augmented.flashcards.notes).length,1);
assert.equal(Object.values(augmented.flashcards.notes)[0].sources.length,2);
const imported={...base(),personalWords:[{word:'book',meaning:'预订',example:''}],cards:{book:{box:3,due:now+300000}}};
const migrated=m.migrateFlashcards(imported,[],now),legacyCard=Object.values(migrated.flashcards.cards)[0];
const snapshot=JSON.stringify(migrated);
m.usageExamples('book','预订');
assert.equal(JSON.stringify(migrated),snapshot);
assert.equal(legacyCard.due,imported.cards.book.due);
assert.equal(legacyCard.fsrs,undefined);
const unsafe=render(m.VocabularyExamples,{examples:[{en:'<script>alert(1)</script>',zh:'<img src=x onerror=alert(1)>',origin:'saved'}]});
assert(!unsafe.includes('<script>')&&!unsafe.includes('<img'),'Examples and translations remain escaped text');
assert(unsafe.includes('&lt;script&gt;'));
for(const word of m.ieltsFlashcardExamples){const examples=m.usageExamples(word.word,word.meaning,[{en:word.example,zh:word.exampleTranslation}]);assert.equal(examples.length,1);assert(examples[0].zh&&examples[0].collocation,'All 12 original IELTS seeds retain translation and collocation');}

const fetchBefore=globalThis.fetch,reads=[];
globalThis.fetch=async(path,options)=>{assert(/^\/language\/NCE[1-4]\/\d+\.json$/.test(path),'Only existing same-origin lesson resources may be read');assert.equal(options.credentials,'same-origin');reads.push(path);return new Response(await readFile(new URL('dist-online'+path,root)),{headers:{'content-type':'application/json'}})};
try{
 const context=await m.loadVocabularyContext('handbag',[{book:'NCE1',lesson:2},{book:'NCE1',lesson:1}]);
 assert.deepEqual(context.source,{book:'NCE1',lesson:1},'A paired exercise labels the actual source of the sentence');
 assert(context.en.toLowerCase().includes('handbag')&&context.zh.trim());
 assert.equal(reads.length,1,'Repeated sources read the lesson once');
 assert.equal(await m.loadVocabularyContext('definitely-missing-word',[{book:'NCE1',lesson:1}]),undefined,'Missing words never receive unrelated context');
 assert.equal(reads.length,1,'The existing lesson cache is reused');
}finally{globalThis.fetch=fetchBefore}

const pageIndex=JSON.parse(await readFile(new URL('dist-online/lesson-pages/index.json',root),'utf8'));
const dictionary=JSON.parse(await readFile(new URL('dist-online/language/dictionary.json',root),'utf8')).words;
const catalog=m.buildVocabularyCatalog(pageIndex),contexts=new Map(),missing=[],byBook={};
let occurrenceCandidates=0,termCandidates=0,originalTerms=0,totalCovered=0;
for(const term of catalog.terms){
 let found=false;
 for(const source of term.sources){
  const no=source.book==='NCE1'&&source.lesson%2===0?source.lesson-1:source.lesson,id=source.book+'-'+no;
  if(!contexts.has(id))contexts.set(id,JSON.parse(await readFile(new URL('dist-online/language/'+source.book+'/'+no+'.json',root),'utf8')).rows);
  const forms=catalog.lessons.find(lesson=>lesson.key===source.book+'-'+source.lesson).words.find(word=>m.vocabularyKey(word.word)===term.key)?.forms||[];
  const row=m.vocabularyExample(contexts.get(id),term.word,forms);
  if(row?.zh.trim()){found=true;occurrenceCandidates++;byBook[source.book]=(byBook[source.book]||0)+1}
 }
 const authored=m.examplesForMeaning(term.word,dictionary[term.key]?.meaning||'');
 if(found)termCandidates++;
 if(authored.length)originalTerms++;
 if(found||authored.length)totalCovered++;else missing.push({word:term.word,sources:term.sources.map(source=>source.book+'-'+source.lesson)});
}
const coverage={basis:'Existing indexed lesson sentences: lexical candidates, not a manual audit of all dictionary senses',textbookTerms:catalog.terms.length,textbookOccurrences:catalog.entries,occurrencesWithBilingualCandidate:occurrenceCandidates,termsWithBilingualCandidate:termCandidates,candidatesByBook:byBook,originalHeadwords:32,originalSenseExamples:m.originalVocabularyExamples.length,originalsMatchingIndexedDefinitions:originalTerms,termsWithCandidateOrReviewedOriginal:totalCovered,termsWithoutEither:missing.length,ieltsSeedExamples:12};
await writeFile(new URL('work/vocabulary-examples/coverage.json',root),JSON.stringify(coverage,null,2));
await writeFile(new URL('work/vocabulary-examples/missing-examples.csv',root),'word,sources\n'+missing.map(item=>'"'+item.word.replaceAll('"','""')+'","'+item.sources.join(' | ')+'"').join('\n')+'\n');
console.log(JSON.stringify(coverage,null,2));
console.log('Vocabulary example checks passed: sense matching, bilingual content, review conceal/reveal, unchanged FSRS/imported progress, duplicate sources and escaping.');
