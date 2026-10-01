import assert from 'node:assert/strict';
import {mkdir,readdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root=new URL('../',import.meta.url),packages=new URL('node_modules/.pnpm/',root);
const builder=(await readdir(packages)).find(name=>/^esbuild@\d+\.\d+\.\d+$/.test(name));
assert(builder,'Install locked dependencies before running vocabulary example checks');
const {build}=await import(new URL(builder+'/node_modules/esbuild/lib/main.js',packages));
const output=new URL('work/vocabulary-examples/test-bundle.mjs',root);
await mkdir(new URL('work/vocabulary-examples/',root),{recursive:true});
await build({stdin:{contents:"export {originalVocabularyExamples,examplesForMeaning,reviewedTeachingDefinition} from './app/vocabulary-examples';export {usageExamples,loadVocabularyContext} from './app/vocabulary-usage';export {VocabularyExamples} from './app/vocabulary-example-ui';export {FlashcardReview} from './app/flashcard-ui';export {initial,validateState} from './app/model';export * from './app/flashcards';export {buildVocabularyCatalog,vocabularyKey} from './app/textbook-vocabulary';export {vocabularyExample} from './app/nce-utils';export {ieltsFlashcardExamples} from './app/ielts-flashcard-examples';export {renderToStaticMarkup} from 'react-dom/server';export {createElement} from 'react';",resolveDir:fileURLToPath(root),sourcefile:'example-check.ts',loader:'ts'},bundle:true,platform:'node',format:'esm',target:'node22',jsx:'automatic',outfile:fileURLToPath(output),packages:'external',logLevel:'silent',plugins:[{name:'local-example-checks',setup(builder){builder.onResolve({filter:/\.css$/},args=>({path:args.path,namespace:'empty-css'}));builder.onLoad({filter:/.*/,namespace:'empty-css'},()=>({contents:'',loader:'js'}));builder.onResolve({filter:/^\.\/runtime-mode$/},()=>({path:'runtime',namespace:'local-mode'}));builder.onLoad({filter:/.*/,namespace:'local-mode'},()=>({contents:'export const ONLINE=true;',loader:'js'}));}}]});
const m=await import(output.href),now=Date.now(),base=()=>structuredClone(m.initial);
const render=(component,props)=>m.renderToStaticMarkup(m.createElement(component,props));

assert.equal(new Set(m.originalVocabularyExamples.map(example=>example.id)).size,m.originalVocabularyExamples.length,'Every sense has its own stable content ID');
const reviewIndex=JSON.parse(await readFile(new URL('docs/vocabulary-examples-review-index.json',root),'utf8'));
const baseline=JSON.parse(await readFile(new URL(reviewIndex.baseline,root),'utf8'));
const registeredLedgers=await Promise.all(reviewIndex.registeredLedgers.map(async path=>JSON.parse(await readFile(new URL(path,root),'utf8'))));
const contentHash=example=>createHash('sha256').update(JSON.stringify({id:example.id,word:example.word,sense:example.sense,matches:example.matches,en:example.en,zh:example.zh,collocation:example.collocation,origin:example.origin,partOfSpeech:example.partOfSpeech,teachingDefinition:example.teachingDefinition,teachingSources:example.teachingSources,teachingIpa:example.teachingIpa})).digest('hex');
const registeredReviews=new Map([...baseline.reviewedOriginals,...registeredLedgers.flatMap(ledger=>ledger.entries)].map(item=>[item.id,item]));
const expectedIds=new Set([...baseline.reviewedOriginals.map(item=>item.id),...registeredLedgers.flatMap(ledger=>ledger.entries.map(item=>item.id))]);
for(const path of reviewIndex.independentContentReviews||[]){
 const review=JSON.parse(await readFile(new URL(path,root),'utf8'));
 assert.equal(review.status,'passed','A registered independent review must have completed its content reading');
 for(const input of [review.contentFile,review.ledger])assert.equal(createHash('sha256').update(await readFile(new URL(input.path,root))).digest('hex'),input.sha256,'Independent review binds the exact registered file: '+input.path);
 const reviewedLedger=JSON.parse(await readFile(new URL(review.ledger.path,root),'utf8'));
 assert.deepEqual(new Set(review.reviewedExamples.map(item=>item.id)),new Set(reviewedLedger.entries.map(item=>item.id)),'Independent review includes every unique content ID, including repeated-source records');
 for(const item of review.reviewedExamples)assert.equal(item.contentSha256,registeredReviews.get(item.id)?.contentSha256,'Independent per-ID review binds its frozen content');
}
assert.deepEqual(new Set(m.originalVocabularyExamples.map(example=>example.id)),expectedIds,'Every prior and registered content ID is retained, without unreviewed additions');
for(const example of m.originalVocabularyExamples){
 assert(example.en.trim()&&example.zh.trim()&&example.sense.trim()&&example.matches.length);
 assert(example.collocation.en.trim()&&example.collocation.zh.trim());
 assert.equal(example.origin,'original');
 assert(m.examplesForMeaning(example.word,example.sense).some(item=>item.id===example.id),'Each example supports its labelled sense');
 assert.equal(contentHash(example),registeredReviews.get(example.id)?.contentSha256,'Changed content requires an updated content review');
}
for(const ledger of registeredLedgers)for(const item of ledger.entries){
 const example=m.originalVocabularyExamples.find(example=>example.id===item.id);
 assert(example&&example.word===item.word,'Registered review resolves to its actual content');
 assert(m.examplesForMeaning(item.word,item.meaningForCheck).some(example=>example.id===item.id),'Reviewed sense and POS select the intended example');
 for(const meaning of item.excludedMeaningLabels||[])assert(!m.examplesForMeaning(item.word,meaning).some(example=>example.id===item.id),'An excluded sense or POS cannot select this example');
 const rendered=render(m.VocabularyExamples,{examples:m.usageExamples(item.word,item.meaningForCheck)});
 assert(rendered.includes(example.en.replaceAll('&','&amp;').replaceAll("'",'&#x27;').replaceAll('"','&quot;'))&&rendered.includes(example.zh),'Reviewed bilingual content renders as escaped text');
 if(example.teachingSources?.length)assert(rendered.includes('关联词表：'),'Original content identifies its associated list without claiming to be a textbook quote');
}
assert.deepEqual(m.examplesForMeaning('Swedish','n. 瑞典人；瑞典语\nadj. 瑞典的；瑞典语的','瑞典人').map(item=>item.id),['swedish-people-collective']);
assert.deepEqual(m.examplesForMeaning('Fiat','命令'),[]);
assert.deepEqual(m.examplesForMeaning('Mini','超短裙'),[]);
assert.deepEqual(m.examplesForMeaning('Ford','浅滩'),[]);
assert.deepEqual(m.examplesForMeaning('his','possessive adjective 他的').map(item=>item.id),['his-possessive-determiner']);
assert.deepEqual(m.examplesForMeaning('his','pron. 他的').map(item=>item.id),['his-possessive-pronoun']);
assert.deepEqual(m.examplesForMeaning('her','pron. 她').map(item=>item.id),['her-object']);
assert.deepEqual(m.examplesForMeaning('her','possessive adjective 她的').map(item=>item.id),['her-possessive-determiner']);
assert.deepEqual(m.examplesForMeaning('old','n. 以前'),[]);
assert.deepEqual(m.examplesForMeaning('short','adj. 简短的'),[]);
assert.deepEqual(m.examplesForMeaning('thin','adj. 稀薄的'),[]);
assert.equal(m.reviewedTeachingDefinition('Fiat',[{book:'NCE1',lesson:6}]),'n. 菲亚特（汽车品牌）');
assert.equal(m.reviewedTeachingDefinition('Fiat',[{book:'NCE2',lesson:87}]),'','Unrelated source cannot override a dictionary sense');
for(const [word,meaning,id] of [['carpet','n. 地毯','carpet-floor'],['case','n. 箱子','case-luggage'],['dog','n. 狗','dog-animal']]){
 assert.equal(m.reviewedTeachingDefinition(word,[{book:'NCE1',lesson:14}]),meaning);
 assert.deepEqual(m.examplesForMeaning(word,meaning).map(example=>example.id),[id],'Printed noun targets cannot select an extension');
 assert.equal(m.reviewedTeachingDefinition(word,[{book:'NCE1',lesson:13}]),'','Word-list association does not certify the previous lesson');
}
assert.deepEqual(m.examplesForMeaning('case','n. 容器（化学反应罐）'),[],'A coarse container label cannot certify the protective-case sense');
assert.deepEqual(m.examplesForMeaning('case','n. 案例'),[],'A coarse example-case label cannot certify a court case');
const ledger=JSON.parse(await readFile(new URL('docs/vocabulary-examples-batch2.json',root),'utf8'));
assert.equal(new Set(ledger.entries.map(item=>item.word)).size,ledger.headwords);
assert.equal(ledger.entries.length,ledger.senseExamples);
for(const item of ledger.entries){
 const example=m.originalVocabularyExamples.find(example=>example.id===item.id);
 assert(example&&example.word===item.word,'Each reviewed batch entry resolves to its actual content');
 assert(m.examplesForMeaning(item.word,item.meaningForCheck).some(example=>example.id===item.id),'The stated sense selects this reviewed example');
 for(const meaning of item.excludedMeaningLabels)assert(!m.examplesForMeaning(item.word,meaning).some(example=>example.id===item.id),'An excluded meaning label must not select this example');
}
assert.deepEqual(m.examplesForMeaning('hot','热的').map(item=>item.id),['hot-temperature']);
assert.deepEqual(m.examplesForMeaning('hot','辣的').map(item=>item.id),['hot-spicy']);
assert.deepEqual(m.examplesForMeaning('hot','热心的'),[]);
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
let oldFiat=m.enrollFlashcard(base(),{word:'Fiat',meaning:'n. 命令',example:'A user sentence.',exampleTranslation:'用户原译文'},[{kind:'personal'}],now-1000);
const oldFiatCard=Object.values(oldFiat.flashcards.cards)[0],oldFiatToken={cardId:oldFiatCard.id,revision:oldFiatCard.revision};
oldFiat=m.revealFlashcard(m.selectFlashcard(oldFiat,oldFiatCard.id),oldFiatToken);
oldFiat=m.rateFlashcard(oldFiat,oldFiatToken,'good',now);
const preservedFiat=structuredClone(oldFiat),oldSchedule=structuredClone(oldFiat.flashcards.cards[oldFiatCard.id]);
m.reviewedTeachingDefinition('Fiat',[{book:'NCE1',lesson:6}]);m.usageExamples('Fiat','n. 命令',[{en:'A user sentence.',zh:'用户原译文'}]);
assert.deepEqual(oldFiat,preservedFiat,'Teaching display never rewrites a saved other sense or its FSRS log');
const brandMeaning=m.reviewedTeachingDefinition('Fiat',[{book:'NCE1',lesson:6}]),brand=m.examplesForMeaning('Fiat',brandMeaning)[0];
const brandWord={word:'Fiat',meaning:brandMeaning,example:brand.en,exampleTranslation:brand.zh};
const withBrand=m.enrollFlashcard(oldFiat,brandWord,[{kind:'nce',book:'NCE1',lesson:6}],now);
const addedAgain=m.enrollFlashcard(withBrand,brandWord,[{kind:'nce',book:'NCE1',lesson:6}],now);
assert.equal(Object.keys(addedAgain.flashcards.notes).length,2,'An explicit different sense is separate; repeated same-sense enrollment is deduplicated');
assert.deepEqual(addedAgain.flashcards.cards[oldFiatCard.id],oldSchedule);
assert.deepEqual(addedAgain.flashcards.reviews,oldFiat.flashcards.reviews);
assert(m.validateState(addedAgain));
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
 const sourceCatalog=m.buildVocabularyCatalog(JSON.parse(await readFile(new URL('dist-online/lesson-pages/index.json',root),'utf8')));
 const make=sourceCatalog.terms.find(term=>term.key==='make');assert(make);
 const hints=make.sources.map(source=>({book:source.book,lesson:source.lesson,forms:sourceCatalog.lessons.find(lesson=>lesson.book===source.book&&lesson.lesson===source.lesson).words.find(word=>m.vocabularyKey(word.word)==='make').forms}));
 const makeContext=await m.loadVocabularyContext('make',hints);
 assert.equal(makeContext.en,'Making a bookcase');assert.equal(makeContext.zh,'制作一个书架');
 assert.deepEqual(makeContext.source,{book:'NCE1',lesson:37},'The real cross-course lexical fallback has a manufacturing sense, rather than the Lesson 6 brand target');
 assert.equal(m.reviewedTeachingDefinition('make',[{book:'NCE1',lesson:6}]),'n. （产品的）牌子');
}finally{globalThis.fetch=fetchBefore}

const pageIndex=JSON.parse(await readFile(new URL('dist-online/lesson-pages/index.json',root),'utf8'));
const dictionary=JSON.parse(await readFile(new URL('dist-online/language/dictionary.json',root),'utf8')).words;
const catalog=m.buildVocabularyCatalog(pageIndex),contexts=new Map(),missing=[],byBook={};
for(const ledger of registeredLedgers)for(const item of ledger.entries){
 if(!item.source)continue;
 const lesson=catalog.lessons.find(lesson=>lesson.book===item.source.book&&lesson.lesson===item.source.lesson);
 assert(lesson?.words.some(word=>m.vocabularyKey(word.word)===m.vocabularyKey(item.word)),'Claimed associated word-list source exists');
 if(item.sourcePDFPage)assert(lesson.pages.some(page=>page.page===item.sourcePDFPage&&page.sha256===item.sourcePageSha256),'Reviewed source points to the actual indexed vocabulary page');
 const example=m.originalVocabularyExamples.find(example=>example.id===item.id);
 if(['textbook-target','textbook-target-grammar-normalized','textbook-target-editorial-normalized'].includes(item.scope)){
  const meaning=m.reviewedTeachingDefinition(item.word,[item.source]);
  assert(example.teachingDefinition&&m.examplesForMeaning(item.word,meaning).some(example=>example.id===item.id),'The actual source-scoped teaching definition displays its target');
 }
}
for(const item of ledger.entries){
 const term=catalog.terms.find(term=>term.key===m.vocabularyKey(item.word));
 assert(term?.sources.some(source=>source.book===item.source.book&&source.lesson===item.source.lesson),'The reviewed word belongs to the claimed actual lesson');
 const displayed=dictionary[term.key]?.meaning.split('\n')[0]||'';
 assert(m.examplesForMeaning(item.word,displayed).some(example=>example.id===item.id),'The current compact dictionary meaning can display the reviewed sense');
}
let occurrenceCandidates=0,termCandidates=0,originalTerms=0,indexedOriginalTerms=0,totalCovered=0;
for(const term of catalog.terms){
 let found=false;
 for(const source of term.sources){
  const no=source.book==='NCE1'&&source.lesson%2===0?source.lesson-1:source.lesson,id=source.book+'-'+no;
  if(!contexts.has(id))contexts.set(id,JSON.parse(await readFile(new URL('dist-online/language/'+source.book+'/'+no+'.json',root),'utf8')).rows);
  const forms=catalog.lessons.find(lesson=>lesson.key===source.book+'-'+source.lesson).words.find(word=>m.vocabularyKey(word.word)===term.key)?.forms||[];
  const row=m.vocabularyExample(contexts.get(id),term.word,forms);
  if(row?.zh.trim()){found=true;occurrenceCandidates++;byBook[source.book]=(byBook[source.book]||0)+1}
 }
 const indexed=m.examplesForMeaning(term.word,dictionary[term.key]?.meaning||'');
 const authored=m.examplesForMeaning(term.word,m.reviewedTeachingDefinition(term.word,term.sources)||dictionary[term.key]?.meaning||'');
 if(indexed.length)indexedOriginalTerms++;
 if(found)termCandidates++;
 if(authored.length)originalTerms++;
 if(found||authored.length)totalCovered++;else missing.push({word:term.word,sources:term.sources.map(source=>source.book+'-'+source.lesson)});
}
const coverage={basis:'Existing lesson sentences are lexical candidates; reviewed source teaching meanings override dictionary display only in the associated vocabulary list. This is not an audit of all senses',textbookTerms:catalog.terms.length,textbookOccurrences:catalog.entries,occurrencesWithBilingualCandidate:occurrenceCandidates,termsWithBilingualCandidate:termCandidates,candidatesByBook:byBook,originalHeadwords:new Set(m.originalVocabularyExamples.map(example=>m.vocabularyKey(example.word))).size,originalSenseExamples:m.originalVocabularyExamples.length,originalsMatchingIndexedDefinitions:indexedOriginalTerms,originalsMatchingTeachingOrIndexedDefinitions:originalTerms,termsWithCandidateOrReviewedOriginal:totalCovered,termsWithoutEither:missing.length,ieltsSeedExamples:12};
await writeFile(new URL('work/vocabulary-examples/coverage.json',root),JSON.stringify(coverage,null,2));
await writeFile(new URL('work/vocabulary-examples/missing-examples.csv',root),'word,sources\n'+missing.map(item=>'"'+item.word.replaceAll('"','""')+'","'+item.sources.join(' | ')+'"').join('\n')+'\n');
console.log(JSON.stringify(coverage,null,2));
console.log('Vocabulary example checks passed: sense matching, bilingual content, review conceal/reveal, unchanged FSRS/imported progress, duplicate sources and escaping.');
