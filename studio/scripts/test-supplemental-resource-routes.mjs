import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url),source=await readFile(new URL('scripts/pages-access.js',root),'utf8'),before=execFileSync('git',['show','ae4a678bf0aac4dc1eef343d922d511a1dd8e52a:studio/scripts/pages-access.js'],{cwd:fileURLToPath(root),encoding:'utf8'});
assert.equal(source.slice(source.indexOf('const headers'),source.indexOf('const reply')),before.slice(before.indexOf('const headers'),before.indexOf('const reply')));
assert.equal(source.slice(source.indexOf('// Assessment')),before.slice(before.indexOf('// Assessment')));
const worker=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).default,version=JSON.parse(await readFile(new URL('dist-online/version.json',root))),types=new Map();let checks=2;
for(const prefix of ['', 'map/'])for(const path of Object.keys(version.mini_audio_assets))types.set('/'+prefix+path,'audio/wav');
for(const name of ['source-review-r19-pages.json','source-review-r19-tail-pages.json'])for(const row of JSON.parse(await readFile(new URL('app/data/'+name,root))))types.set(row.src,'image/png');
for(const name of ['review-r19-manifest.json','review-r19-tail-manifest.json'])types.set('/lesson-pages/'+name,'application/json; charset=utf-8');assert.equal(types.size,27);
for(const [path,type] of types){
 const bytes=await readFile(new URL('dist-online'+path,root));
 for(const method of ['GET','HEAD']){let forwarded=0;const response=await worker.fetch(new Request('https://study.example'+path,{method,headers:{Authorization:'Basic synthetic-only'}}),{ASSETS:{fetch:async request=>{forwarded++;assert.equal(request.headers.get('Authorization'),null);return new Response(method==='HEAD'?null:bytes,{headers:{'Content-Type':'application/octet-stream','WWW-Authenticate':'synthetic-fixture','Vary':'Authorization'}})}}});assert.equal(forwarded,1);assert.equal(response.status,200);assert.equal(response.headers.get('Content-Type'),type);assert.equal(response.headers.get('WWW-Authenticate'),null);assert.equal(response.headers.get('Vary'),null);if(method==='GET')assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes);checks++}
}
for(const path of ['/assets/unknown-Abcdefgh.wav','/map/assets/unknown-Abcdefgh.wav','/lesson-pages/'+'0'.repeat(64)+'.png','/lesson-pages/review-unknown.json','/scripts/pages-access.js','/mini-task/model.ts']){let forwarded=false;const r=await worker.fetch(new Request('https://study.example'+path),{ASSETS:{fetch:async()=>{forwarded=true;return new Response('wrong')}}});assert.equal(r.status,404);assert.equal(forwarded,false);checks++}
for(const method of ['POST','PUT'])assert.equal((await worker.fetch(new Request('https://study.example'+types.keys().next().value,{method}),{ASSETS:{fetch:async()=>new Response('wrong')}})).status,405);
checks+=2;console.log('PASS '+checks+' exact supplemental Worker GET/HEAD/body/MIME/unknown/method checks; API and security-header source bytes unchanged. No external request.');
