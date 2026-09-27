// Node 22+; no test framework or package download is needed.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {createHash} from 'node:crypto';
import worker from './pages-access.js';

const root=new URL('../',import.meta.url);
const asModule=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const model=asModule(stripTypeScriptTypes(await readFile(new URL('app/model.ts',root),'utf8')));
const pageMapping=JSON.parse(await readFile(new URL('app/data/nce-pages.json',root),'utf8'));
const utils=await import(asModule(stripTypeScriptTypes((await readFile(new URL('app/site-material-utils.ts',root),'utf8')).replace("'./model'",JSON.stringify(model)).replace("import pageMapping from './data/nce-pages.json';",`const pageMapping=${JSON.stringify(pageMapping)};`))));
const {parseLessonText,vocabularyExample}=await import(asModule(stripTypeScriptTypes(await readFile(new URL('app/nce-utils.ts',root),'utf8'))));
const exampleRows=[{en:'This is my handbag.',zh:'这是我的手提包。'},{en:'The experts felt obliged to investigate.',zh:'专家们觉得有必要调查。'},{en:'Thank you very much.',zh:'非常感谢你。'},{en:'Her fiancé is here.',zh:'她的未婚夫在这里。'}];
assert.equal(vocabularyExample(exampleRows,'handbag'),exampleRows[0]);
assert.equal(vocabularyExample(exampleRows,'oblige',['obliged','obliges']),exampleRows[1]);
assert.equal(vocabularyExample(exampleRows,'thank you'),exampleRows[2]);
assert.equal(vocabularyExample(exampleRows,'fiancé'),exampleRows[3]);
assert.equal(vocabularyExample(exampleRows,'bag'),undefined,'Do not match a substring inside a different word');
assert.equal(vocabularyExample(exampleRows,'pen'),undefined,'Do not invent an example for words absent from the source');
const vocabularyPages=JSON.parse(await readFile(new URL('dist-online/lesson-pages/index.json',root),'utf8'));
const vocabularyWords=key=>vocabularyPages.lessons[key].vocabulary.words.map(w=>w.word);
assert.deepEqual(vocabularyWords('NCE1-1'),['excuse','me','yes','is','this','your','handbag','pardon','it','thank you','very much']);
assert.deepEqual(vocabularyWords('NCE1-2'),['pen','pencil','book','watch','coat','dress','skirt','shirt','car','house']);
assert.deepEqual(vocabularyWords('NCE2-1'),['private','conversation','theatre','seat','play','loudly','angry','angrily','attention','bear','business','rudely']);
assert.deepEqual(vocabularyWords('NCE1-18'),[],'No fabricated list for a practice lesson without a word list');
assert.deepEqual(vocabularyPages.lessons['NCE3-51'].vocabulary.pages,[258,259],'Include the continuation on the next page');
assert(vocabularyWords('NCE3-51').includes('network'));
const manifest=JSON.parse(await readFile(new URL('dist-online/materials/manifest.json',root),'utf8'));
assert(utils.validateMaterials(manifest));
const firstBookPdf=manifest.files.find(f=>f.book==='NCE1'&&f.type==='application/pdf');
// Verified contents page references, including the mid-book test-page gap.
for(const [lesson,page] of [[1,5],[2,7],[4,11],[6,15],[8,19],[72,147],[73,153],[144,295]]){
  assert.equal(utils.materialLessonPage(firstBookPdf,lesson),page);
}
assert.equal(utils.materialLessonPage({...firstBookPdf,sha256:'0'.repeat(64)},2),undefined);
assert.equal(utils.materialLessonPage(firstBookPdf,145),undefined);
assert.equal(utils.materialLessonPage(firstBookPdf,0),undefined);
const malformed=mutate=>{const m=structuredClone(manifest);mutate(m);assert.equal(utils.validateMaterials(m),false)};
malformed(m=>m.files.push(m.files[0]));
malformed(m=>m.files[0].parts[0].path='https://example.com/leak');
malformed(m=>m.files[0].parts[0].path='/materials/../secret');
malformed(m=>m.files[0].parts.reverse());
malformed(m=>m.files[0].size++);
malformed(m=>m.files[0].lesson=999);
malformed(m=>m.files[0].parts[0].size=8*1024**2+1);
malformed(m=>{const f=m.files.find(x=>x.pairId);m.files.find(x=>x!==f&&x.pairId===f.pairId).accent='uk'});
malformed(m=>m.notices=[42]);

let assetCalls=0;
const env={ASSETS:{fetch:async request=>{
  assetCalls++;
  assert.equal(request.headers.has('Authorization'),false);
  const path=new URL(request.url).pathname==='/'?'/index.html':new URL(request.url).pathname;
  return new Response(await readFile(new URL('dist-online'+path,root)));
}}};
const probe=manifest.files.find(f=>f.type==='text/plain');
for(const path of ['/','/materials/manifest.json',probe.parts[0].path,'/version.json']){
  for(const headers of [{},{Authorization:'Basic invalid'},{Authorization:'Basic '+btoa('learner:wrong')}]){
    const response=await worker.fetch(new Request('https://site.pages.dev'+path,{headers}),env);
    assert.equal(response.status,200);assert.equal(response.headers.get('WWW-Authenticate'),null);
  }
  assert.equal((await worker.fetch(new Request('https://site.pages.dev'+path),{})).status,503);
}
assert.equal(assetCalls,12,'Public requests did not reach static assets');
for(const path of ['/scripts/pages-access.js','/materials/.inventory.json','/materials/%2e%2e/.env']){
  assert.equal((await worker.fetch(new Request('https://site.pages.dev'+path),env)).status,404);
}
assert.equal((await worker.fetch(new Request('https://site.pages.dev/',{method:'POST'}),env)).status,405);
for(const path of ['/language/index.json','/language/dictionary.json','/language/NCE1/1.json'])assert.equal((await worker.fetch(new Request('https://site.pages.dev'+path),env)).status,200);
const originalFetch=globalThis.fetch;
globalThis.fetch=async (path,options)=>worker.fetch(new Request(new URL(path,'https://site.pages.dev'),options),env);
assert.deepEqual(await utils.readMaterialManifest(),manifest);
let checked=0;
for(const file of manifest.files){
  const blob=await utils.loadSiteMaterial(file);
  assert.equal(blob.size,file.size);
  if(file.type==='text/plain'){
    const rows=parseLessonText(await blob.text());
    assert(rows.length>0&&rows.every(r=>r.time!==undefined));
    const group=utils.pairedMaterials(manifest.files,file);
    assert.equal(group.length,2);
    assert(group.some(f=>f.type==='audio/mpeg'));
    assert(file.lesson>0);
    if(file.book==='NCE1')assert.equal(file.lesson%2,1);
  }
  checked++;
}
globalThis.fetch=async()=>new Response(new Uint8Array(probe.size));
await assert.rejects(()=>utils.loadSiteMaterial(probe),/校验不通过/);
globalThis.fetch=async()=>new Response(new Uint8Array(probe.size-1));
await assert.rejects(()=>utils.loadSiteMaterial(probe),/不完整/);
globalThis.fetch=async()=>new Response(new Uint8Array(probe.size+1));
await assert.rejects(()=>utils.loadSiteMaterial(probe),/超过/);
globalThis.fetch=async()=>new Response('blocked',{status:401});
await assert.rejects(()=>utils.readMaterialManifest(),/读取/);
const abort=new AbortController();abort.abort();
globalThis.fetch=async (_url,options)=>{if(options.signal?.aborted)throw new DOMException('Aborted','AbortError');return new Response()};
await assert.rejects(()=>utils.loadSiteMaterial(probe,abort.signal),{name:'AbortError'});
globalThis.fetch=originalFetch;
console.log(JSON.stringify({verifiedMaterials:checked,pairedLessons:manifest.files.filter(f=>f.type==='text/plain').length,access:'anonymous access works; stale Basic headers are ignored and stripped; non-assets blocked',integrity:'corrupt, truncated, oversized and invalid manifests rejected'},null,2));
