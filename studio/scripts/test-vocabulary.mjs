import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';

const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const model=moduleUrl(stripTypeScriptTypes(await read('app/model.ts')));
const mapping=await read('app/data/nce-pages.json');
const corrections=moduleUrl(stripTypeScriptTypes(await read('app/data/vocabulary-source-corrections.ts')));
const source=(await read('app/textbook-vocabulary.ts')).replace("'./model'",JSON.stringify(model)).replace("'./data/vocabulary-source-corrections'",JSON.stringify(corrections)).replace("import pageMapping from './data/nce-pages.json';",`const pageMapping=${mapping};`);
const {buildVocabularyCatalog,searchVocabulary,vocabularyPage,vocabularyLetter}=await import(moduleUrl(stripTypeScriptTypes(source)));
const index=JSON.parse(await read('dist-online/lesson-pages/index.json'));
const dictionary=JSON.parse(await read('dist-online/language/dictionary.json')).words;
const catalog=buildVocabularyCatalog(index);
assert.equal(catalog.lessons.length,348);
assert.equal(catalog.entries,3614);
assert.equal(catalog.terms.length,3346);
assert.equal(catalog.lessons.filter(l=>l.words.length).length,321);
assert.equal(catalog.lessons.filter(l=>!l.words.length).length,27);
assert.equal(catalog.lessons.find(l=>l.key==='NCE1-2').words.length,10,'Even lessons keep their own word lists');
assert.deepEqual(catalog.lessons.find(l=>l.key==='NCE1-18').words,[],'A practice lesson without new words stays empty');
assert.deepEqual(catalog.lessons.find(l=>l.key==='NCE3-51').pages.map(p=>p.page),[258,259],'Cross-page vocabulary retains both sources');
const actual=[],expected=[];
for(const term of catalog.terms){
 assert(dictionary[term.key],`Dictionary reference missing for ${term.word}`);
 for(const source of term.sources){
  actual.push(`${source.book}-${source.lesson}:${term.key}`);
  assert(source.pages.every(p=>index.lessons[`${source.book}-${source.lesson}`].vocabulary.pages.includes(p.page)));
 }
}
for(const [key,lesson] of Object.entries(index.lessons))for(const word of lesson.vocabulary.words){
 if(key==='NCE3-19'&&word.word==='withdrawn')continue;
 expected.push(`${key}:${word.word.toLowerCase()}`);
}
assert.deepEqual(actual.sort(),expected.sort(),'Every source headword appears exactly once, excluding the reviewed printed inflection');
const withdrawalLesson=catalog.lessons.find(lesson=>lesson.key==='NCE3-19');
assert.equal(withdrawalLesson.words.filter(word=>word.word==='withdraw').length,1);
assert(!withdrawalLesson.words.some(word=>word.word==='withdrawn'));
assert(withdrawalLesson.words.find(word=>word.word==='withdraw').forms.includes('withdrawn'));
assert(index.lessons['NCE3-19'].vocabulary.words.some(word=>word.word==='withdrawn'),'Raw material metadata is retained unchanged');
const alreadyCorrected=structuredClone(index);
alreadyCorrected.lessons['NCE3-19'].vocabulary.words=alreadyCorrected.lessons['NCE3-19'].vocabulary.words.filter(word=>word.word!=='withdrawn');
assert.deepEqual(buildVocabularyCatalog(alreadyCorrected),catalog,'An already corrected source remains idempotent');
for(const [book,lessonCount,entryCount] of [['NCE1',144,904],['NCE2',96,861],['NCE3',60,1058],['NCE4',48,791]]){
 assert.equal(catalog.lessons.filter(l=>l.book===book).length,lessonCount);
 assert.equal(searchVocabulary(catalog.terms,{book}).reduce((n,w)=>n+w.sources.length,0),entryCount);
 assert(searchVocabulary(catalog.terms,{book}).every(w=>w.sources.every(s=>s.book===book)));
}
assert(searchVocabulary(catalog.terms,{query:'HANDBAG'}).some(w=>w.key==='handbag'));
assert(searchVocabulary(catalog.terms,{query:'手提包',dictionary}).some(w=>w.key==='handbag'));
assert(searchVocabulary(catalog.terms,{query:'thank you'}).some(w=>w.key==='thank you'),'Phrases remain whole terms');
assert(searchVocabulary(catalog.terms,{query:'  X-RAY  ',dictionary}).some(w=>w.key==='x-ray'));
assert(searchVocabulary(catalog.terms,{query:'handbag',letter:'B',dictionary}).length===0,'Search and initial filters intersect');
assert(searchVocabulary(catalog.terms,{query:'no_such_word_123',dictionary}).length===0);
assert.equal(vocabularyLetter('éclair'),'E');
assert.equal(vocabularyLetter('X-ray'),'X');
const alphabetResults='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').flatMap(letter=>searchVocabulary(catalog.terms,{letter}));
assert.deepEqual(alphabetResults.map(w=>w.key).sort(),catalog.terms.map(w=>w.key).sort(),'A–Z covers every term once');
const firstPage=vocabularyPage(catalog.terms);
assert.equal(firstPage.items.length,50);
assert.equal(firstPage.pages,67);
const allPages=Array.from({length:firstPage.pages},(_,i)=>vocabularyPage(catalog.terms,i+1).items).flat();
assert.deepEqual(allPages,catalog.terms,'Pagination neither drops nor repeats terms');
assert.equal(vocabularyPage(catalog.terms,9999).page,67);
assert.equal(vocabularyPage(catalog.terms,-1).page,1);
assert.equal(vocabularyPage(catalog.terms,NaN).page,1);
assert.deepEqual(vocabularyPage([],99),{page:1,pages:1,items:[]});
for(const mutate of [
 d=>{d.sources.NCE1='0'.repeat(64)},
 d=>{delete d.lessons['NCE1-144']},
 d=>{delete d.lessons['NCE1-18'].vocabulary},
 d=>{d.lessons['NCE3-51'].vocabulary.pages=[999]},
 d=>{d.lessons['NCE1-1'].pages[1].src='https://example.com/unknown.jpg'},
 d=>{d.lessons['NCE1-1'].vocabulary.words.push(d.lessons['NCE1-1'].vocabulary.words[0])},
 d=>{d.lessons['NCE3-19'].vocabulary.words=d.lessons['NCE3-19'].vocabulary.words.filter(word=>word.word!=='withdraw')},
 d=>{const page=d.lessons['NCE3-19'].pages.find(page=>page.page===112);page.sha256='0'.repeat(64);page.src='/lesson-pages/'+page.sha256+'.jpg'},
 d=>{d.lessons['NCE3-19'].vocabulary.words=d.lessons['NCE3-19'].vocabulary.words.filter(word=>!['withdraw','withdrawn'].includes(word.word))},
 d=>{d.lessons['NCE3-19'].vocabulary.words=d.lessons['NCE3-19'].vocabulary.words.filter(word=>word.word!=='withdrawn');const page=d.lessons['NCE3-19'].pages.find(page=>page.page===112);page.sha256='0'.repeat(64);page.src='/lesson-pages/'+page.sha256+'.jpg'},
]){
 const changed=structuredClone(index);mutate(changed);assert.throws(()=>buildVocabularyCatalog(changed));
}
console.log('Validated 348 lessons, 3,614 corrected source headwords, 3,346 indexed terms; raw 3,615 entries retained, one printed inflection removed; A–Z/Chinese filters, links, pagination and malformed data handling.');
