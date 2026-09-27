import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import worker from './pages-access.js';
const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const catalog=JSON.parse(await read('app/data/textbook-grammar.json'));
const mapping=JSON.parse(await read('app/data/nce-pages.json'));
const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const source=(await read('app/textbook-grammar.ts')).replace("import data from './data/textbook-grammar.json';",`const data=${JSON.stringify(catalog)};`).replace("import pageMapping from './data/nce-pages.json';",`const pageMapping=${JSON.stringify(mapping)};`);
const {grammarEntryFor,grammarPrintedPage,searchGrammar}=await import(moduleUrl(stripTypeScriptTypes(source)));
const counts={NCE1:144,NCE2:96,NCE3:60,NCE4:48};
assert.equal(catalog.entries.length,276);
assert.equal(new Set(catalog.entries.map(e=>e.id)).size,276);
for(const [book,count] of Object.entries(counts)){
 for(let lesson=1;lesson<=count;lesson++){
  const entries=catalog.entries.filter(e=>e.book===book&&lesson>=e.lesson&&lesson<=e.lastLesson);
  assert.equal(entries.length,1,`${book}-${lesson} must have one source index`);
  assert.deepEqual(grammarEntryFor(book,lesson),entries[0]);
 }
 for(const entry of catalog.entries.filter(e=>e.book===book)){
  assert(catalog.categories.some(c=>c.id===entry.category));
  assert(entry.title&&entry.terms&&entry.sections.length&&entry.pages.length);
  assert.deepEqual(entry.pages,[...new Set(entry.pages)].sort((a,b)=>a-b));
  assert(entry.sections.every(s=>entry.pages.includes(s.page)));
  assert(entry.pages.every(p=>p>=(mapping[book].starts[entry.lesson]+(book==='NCE1'?1:0))&&p<=mapping[book].pageCount));
  if(book==='NCE1')assert.deepEqual(entry.pages,[mapping[book].starts[entry.lesson]+1,mapping[book].starts[entry.lastLesson],mapping[book].starts[entry.lastLesson]+1]);
  else assert(entry.pages.every(p=>p<(mapping[book].starts[entry.lesson+1]||mapping[book].pageCount)));
  assert(entry.references.every(r=>grammarEntryFor(r.book,r.lesson)));
 }
}
assert.equal(grammarEntryFor('NCE1',1).id,grammarEntryFor('NCE1',2).id);
assert.equal(grammarEntryFor('NCE1',60).category,'noun','The written exercise covers plurals and some/any, despite the time-related lesson title');
assert.equal(grammarEntryFor('NCE1',96).category,'modal');
assert.equal(grammarEntryFor('NCE2',24).sections[0].section,'Special difficulties · 难点','Review lesson 24 must not be relabelled as Key structures');
assert.equal(grammarEntryFor('NCE3',20).sections[0].page,118,'Do not index the following pre-unit test as lesson 20');
assert.equal(grammarEntryFor('NCE3',47).sections[0].page,244,'Singular Key structure heading is a real source');
assert.equal(grammarEntryFor('NCE4',10).sections[0].page,91);
for(const [book,page,printed] of [['NCE1',7,3],['NCE1',155,151],['NCE2',53,13],['NCE3',42,16],['NCE4',36,7]])assert.equal(grammarPrintedPage(book,page),printed);
assert.deepEqual(searchGrammar({book:'NCE1',query:'第60课'}).map(e=>e.id),['NCE1-59']);
assert(searchGrammar({book:'NCE2',query:'被动'}).some(e=>e.lesson===10));
assert.deepEqual(searchGrammar({book:'NCE1',query:'SOME ANY',category:'noun'}).map(e=>e.lesson),[59,115]);
assert.equal(searchGrammar({book:'NCE1',query:'unlikely-no-result'}).length,0);
assert(searchGrammar({book:'NCE4',category:'nonfinite'}).every(e=>e.category==='nonfinite'));
const index=JSON.parse(await read('dist-online/grammar/index.json'));
for(const entry of catalog.entries)for(const page of entry.pages)assert(index.pages[`${entry.book}-${page}`]);
let requested=[];
const env={ASSETS:{fetch:async request=>{requested.push(new URL(request.url).pathname);return new Response('asset')}}};
for(const path of ['/grammar/index.json',...Object.values(index.pages).slice(-2).map(p=>p.src)])assert.equal((await worker.fetch(new Request('https://example.test'+path),env)).status,200);
for(const path of ['/grammar/book1.jsonl','/grammar/source.pdf','/grammar/private.json','/grammar/../../../.env'])assert.equal((await worker.fetch(new Request('https://example.test'+path),env)).status,404);
assert.equal(requested.length,3);
console.log('348 lesson links, 276 textbook groups, source ranges, printed pages, Chinese/English/lesson search, review/cross-book references and grammar asset boundaries passed.');
