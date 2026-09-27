import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import worker from './pages-access.js';
const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const catalog=JSON.parse(await read('app/data/textbook-grammar.json'));
const mapping=JSON.parse(await read('app/data/nce-pages.json'));
const explanations=JSON.parse(await read('app/data/grammar-explanations.json'));
const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const source=(await read('app/textbook-grammar.ts')).replace("import data from './data/textbook-grammar.json';",`const data=${JSON.stringify(catalog)};`).replace("import pageMapping from './data/nce-pages.json';",`const pageMapping=${JSON.stringify(mapping)};`).replace("import explanations from './data/grammar-explanations.json';",`const explanations=${JSON.stringify(explanations)};`);
const {grammarEntryFor,grammarPrintedPage,grammarGuidesFor,searchGrammar}=await import(moduleUrl(stripTypeScriptTypes(source)));
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
for(const lesson of [59,115])assert(searchGrammar({book:'NCE1',query:'SOME ANY',category:'noun'}).some(e=>e.lesson===lesson));
assert(searchGrammar({book:'NCE1',query:'一个也没有'}).some(e=>e.lesson===113),'Search includes explanations, not just the index labels');
assert(searchGrammar({book:'NCE1',query:'coffee left'}).some(e=>e.lesson===113),'Original example sentences are searchable');
assert.equal(searchGrammar({book:'NCE1',query:'unlikely-no-result'}).length,0);
assert(searchGrammar({book:'NCE4',category:'nonfinite'}).every(e=>e.category==='nonfinite'));
assert.deepEqual(Object.keys(explanations.lessons).sort(),catalog.entries.map(e=>e.id).sort(),'Every textbook group has an explicit teaching map');
const used=new Set();
for(const entry of catalog.entries){
 const keys=explanations.lessons[entry.id];
 assert(keys.length>=1&&keys.length<=4,entry.id);
 assert.equal(new Set(keys).size,keys.length);
 const guides=grammarGuidesFor(entry);
 assert.equal(guides.length,keys.length);
 for(const key of keys){assert(explanations.guides[key],`${entry.id}: missing ${key}`);used.add(key)}
}
for(const [key,g] of Object.entries(explanations.guides)){
 assert(used.has(key),`Orphan teaching content: ${key}`);
 for(const field of ['title','idea','pattern','pitfall'])assert(g[field]?.trim(),`${key}: ${field}`);
 assert(g.explain.length>=2&&g.explain.every(text=>text.trim()));
 assert.equal(g.examples.length,2);
 assert(g.examples.every(e=>e.en&&e.zh&&e.note));
 assert(g.practice.prompt&&g.practice.answer&&g.practice.explanation);
 assert(g.sources.every(source=>explanations.sources[source]?.url.startsWith('https://')));
 assert(!/TODO|待补充|PLACEHOLDER/.test(JSON.stringify(g)),key);
}
assert.deepEqual(grammarGuidesFor(grammarEntryFor('NCE1',114)).map(g=>g.id),['none']);
assert(grammarGuidesFor(grammarEntryFor('NCE2',61)).some(g=>g.id==='future-perfect-continuous'));
assert(grammarGuidesFor(grammarEntryFor('NCE4',29)).some(g=>g.id==='absolute'));
const index=JSON.parse(await read('dist-online/grammar/index.json'));
for(const entry of catalog.entries)for(const page of entry.pages)assert(index.pages[`${entry.book}-${page}`]);
let requested=[];
const env={ASSETS:{fetch:async request=>{requested.push(new URL(request.url).pathname);return new Response('asset')}}};
for(const path of ['/grammar/index.json',...Object.values(index.pages).slice(-2).map(p=>p.src)])assert.equal((await worker.fetch(new Request('https://example.test'+path),env)).status,200);
for(const path of ['/grammar/book1.jsonl','/grammar/source.pdf','/grammar/private.json','/grammar/../../../.env'])assert.equal((await worker.fetch(new Request('https://example.test'+path),env)).status,404);
assert.equal(requested.length,3);
console.log(`${catalog.entries.length} groups / 348 lesson links, ${used.size} complete teaching guides, ${used.size*2} bilingual examples, explanation search, source ranges and asset boundaries passed.`);
