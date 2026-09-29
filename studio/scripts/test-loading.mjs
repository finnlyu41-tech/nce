import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {createHash} from 'node:crypto';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64');
const network=moduleUrl(await read('app/network.ts'));
const {withNetworkTimeout,readJsonResource}=await import(network);
const model=moduleUrl(await read('app/model.ts'));
const utils=await import(moduleUrl((await read('app/site-material-utils.ts')).replace("'./network'",JSON.stringify(network)).replace("'./model'",JSON.stringify(model)).replace("import pageMapping from './data/nce-pages.json';",`const pageMapping=${await read('app/data/nce-pages.json')};`)));

const originalFetch=globalThis.fetch;
const originalTimeout=globalThis.setTimeout,originalClear=globalThis.clearTimeout;
const timers=new Map();let nextTimer=0;
globalThis.setTimeout=(fn)=>{const id=++nextTimer;timers.set(id,fn);return id};
globalThis.clearTimeout=id=>timers.delete(id);
const expire=()=>{const pending=[...timers.values()];timers.clear();for(const fn of pending)fn()};
try{
 let requestSignal;
 const stuck=withNetworkTimeout(async signal=>{requestSignal=signal;return new Promise(()=>{})});
 expire();await assert.rejects(stuck,/网络等待过久/);assert(requestSignal.aborted);
 const cancel=new AbortController();
 const cancelled=withNetworkTimeout(()=>new Promise(()=>{}),cancel.signal);
 cancel.abort();await assert.rejects(cancelled,{name:'AbortError'});assert.equal(timers.size,0);
 let activity,finish;
 const active=withNetworkTimeout(async (_signal,touch)=>{activity=touch;return new Promise(resolve=>{finish=resolve})});
 const oldTimer=[...timers.keys()][0];activity();assert(!timers.has(oldTimer));
 finish('ready');assert.equal(await active,'ready');assert.equal(timers.size,0);
 globalThis.fetch=async (_path,{signal})=>{requestSignal=signal;return {ok:true,json:()=>new Promise(()=>{})}};
 const bodyStalled=readJsonResource('/test.json');await Promise.resolve();expire();
 await assert.rejects(bodyStalled,/网络等待过久/);assert(requestSignal.aborted);
}finally{globalThis.setTimeout=originalTimeout;globalThis.clearTimeout=originalClear;globalThis.fetch=originalFetch}

const bytes=new TextEncoder().encode('[00:01.00]Hello.\n[00:02.00]Welcome.');
const hash=createHash('sha256').update(bytes).digest('hex');
const file={id:'loading-test',name:'test.lrc',book:'NCE1',lesson:1,type:'text/plain',size:bytes.length,sha256:hash,parts:[{path:`/materials/${hash}/0000.bin`,size:bytes.length}]};
let calls=0;const progress=[];
try{
 globalThis.fetch=async ()=>{calls++;return new Response(new ReadableStream({start(controller){controller.enqueue(bytes.slice(0,10));controller.enqueue(bytes.slice(10));controller.close()}}))};
 const blob=await utils.loadSiteMaterial(file,undefined,value=>progress.push(value));
 assert.equal(await blob.text(),new TextDecoder().decode(bytes));
 assert(progress.some(value=>value>0&&value<99),'Progress updates before a complete part arrives');
 assert.equal(progress.at(-1),100,'Only verified bytes report completion');
 assert.equal(await utils.loadSiteMaterial(file),blob);assert.equal(calls,1,'Reopening a verified material uses memory');
 const cancel=new AbortController();cancel.abort();
 await assert.rejects(utils.loadSiteMaterial(file,cancel.signal),{name:'AbortError'});
 utils.clearMaterialCache();
 globalThis.fetch=async ()=>{calls++;return new Response(new Uint8Array(bytes.length))};
 await assert.rejects(utils.loadSiteMaterial(file),/校验不通过/);
 await assert.rejects(utils.loadSiteMaterial(file),/校验不通过/);
 assert.equal(calls,3,'Failed material never enters cache');
 globalThis.fetch=async ()=>{calls++;return Response.json({version:1,files:[file]})};
 await utils.readMaterialManifest();await utils.readMaterialManifest();assert.equal(calls,4,'Repeated lesson visits reuse the directory');
 await utils.readMaterialManifest(undefined,true);assert.equal(calls,5,'An explicit refresh still fetches the directory');
 utils.clearMaterialCache();let closed=false;
 const pendingCancel=new AbortController();
 globalThis.fetch=async (_url,{signal})=>new Response(new ReadableStream({start(controller){signal.addEventListener('abort',()=>controller.error(signal.reason),{once:true});controller.enqueue(bytes.slice(0,5))},cancel(){closed=true}}));
 await assert.rejects(utils.loadSiteMaterial(file,pendingCancel.signal,()=>pendingCancel.abort()),{name:'AbortError'});
 // A cancellation, including during a stream, must allow a fresh successful retry.
 globalThis.fetch=async ()=>new Response(bytes);
 assert.equal((await utils.loadSiteMaterial(file)).size,bytes.length);
}finally{globalThis.fetch=originalFetch;utils.clearMaterialCache()}
console.log('Loading checks passed: stalled headers/body, active transfer, cancellation, incremental progress, integrity, bounded-cache reuse and explicit refresh.');
