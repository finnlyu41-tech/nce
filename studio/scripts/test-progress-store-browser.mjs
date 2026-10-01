import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Real storage transactions in two fresh Chrome tabs on a temporary localhost
// origin. Synthetic fixtures only; this is not deployed-site or device UI QA.
// CHROME_BIN may select an installed Chrome/Chromium. No package is downloaded.
const root = new URL('../', import.meta.url), temporary = await mkdtemp(path.join(os.tmpdir(), 'english-progress-store-browser-'));
const packages = new URL('node_modules/.pnpm/', root);
const builders = (await readdir(packages)).filter(name => /^esbuild@\d+\.\d+\.\d+$/.test(name)).sort((a,b) => b.localeCompare(a,undefined,{numeric:true}));
assert.ok(builders.length, 'Install the existing project dependencies.');
const {build} = await import(new URL(`${builders[0]}/node_modules/esbuild/lib/main.js`, packages));
const chromeBin = process.env.CHROME_BIN || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/chromium');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const tests = [], test = (name, run) => tests.push({name, run});
let chrome, server, browser, tabs = [], failures = 0;

async function connect(url) {
  const socket = new WebSocket(url), pending = new Map(); let id = 0;
  await new Promise((resolve,reject) => {socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  socket.addEventListener('message',event => {
    const message = JSON.parse(String(event.data)), callback = pending.get(message.id);
    if (!callback) return;
    pending.delete(message.id); clearTimeout(callback.timer);
    if (message.error) callback.reject(Error(JSON.stringify(message.error))); else callback.resolve(message.result);
  });
  return {close:()=>socket.close(),send(method,params={}) {
    return new Promise((resolve,reject) => {
      const requestId=++id,timer=setTimeout(()=>{pending.delete(requestId);reject(Error(`CDP timeout: ${method}`));},10_000);
      pending.set(requestId,{resolve,reject,timer});socket.send(JSON.stringify({id:requestId,method,params}));
    });
  }};
}
async function evaluate(tab, expression) {
  const result=await tab.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
  if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);
  return result.result.value;
}
async function until(check, message) {
  for(let i=0;i<100;i++){if(await check())return;await delay(30);}
  throw Error(message);
}

try {
  await build({stdin:{contents:`import * as store from './app/offline-store';import {initial} from './app/model';window.store=store;window.fixture=note=>({...structuredClone(initial),drafts:{note}});`,resolveDir:fileURLToPath(root),sourcefile:'progress-store-browser.ts',loader:'ts'},bundle:true,platform:'browser',format:'esm',target:'chrome120',outfile:path.join(temporary,'store.js'),logLevel:'silent'});
  const bundle=await readFile(path.join(temporary,'store.js'));
  server=createServer((request,response)=>{
    response.setHeader('Cache-Control','no-store');
    if(request.url==='/store.js'){response.setHeader('Content-Type','text/javascript');response.end(bundle);}
    else{response.setHeader('Content-Type','text/html');response.end('<!doctype html><title>Isolated progress storage check</title><script type="module" src="/store.js"></script>');}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const origin=`http://127.0.0.1:${server.address().port}`,profile=path.join(temporary,'chrome-profile');
  chrome=spawn(chromeBin,['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
  let chromeError;chrome.once('error',error=>{chromeError=error;});
  await until(async()=>{if(chromeError)throw chromeError;try{return (await readFile(path.join(profile,'DevToolsActivePort'),'utf8')).length>0;}catch{return false;}},'Chrome did not expose its isolated debugging endpoint.');
  const [port,browserPath]=(await readFile(path.join(profile,'DevToolsActivePort'),'utf8')).trim().split('\n');
  browser=await connect(`ws://127.0.0.1:${port}${browserPath}`);
  const version=await browser.send('Browser.getVersion');console.log(`Browser: ${version.product}; temporary localhost origin and fresh profile.`);
  for(let i=0;i<2;i++){
    const {targetId}=await browser.send('Target.createTarget',{url:origin});
    const targets=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const target=targets.find(value=>value.id===targetId);assert.ok(target);
    const tab=await connect(target.webSocketDebuggerUrl);tabs.push(tab);
    await until(()=>evaluate(tab,'!!window.store'),'Production storage module did not load.');
  }
  const [a,b]=tabs;
  const reset=()=>evaluate(a,'store.writeState(undefined)');
  const note=()=>evaluate(a,'store.readState().then(value=>value?.drafts.note)');

  test('an absent snapshot and normal guarded commit round-trip through real IndexedDB',async()=>{
    await reset();assert.deepEqual(await evaluate(a,'store.readStateSnapshot()'),{mode:'db',raw:null});
    await evaluate(a,"store.writeState(fixture('normal restore'),{expectedRaw:null})");assert.equal(await note(),'normal restore');
    const raw=await evaluate(a,'store.readStateSnapshot().then(value=>value.raw)');assert.equal(JSON.parse(raw).drafts.note,'normal restore');
  });
  test('another tab saving after the snapshot rejects restore and preserves its real stored input',async()=>{
    await evaluate(a,"(async()=>{await store.writeState(fixture('preview original'));window.preview=await store.readStateSnapshot();})()");
    await evaluate(b,"store.writeState(fixture('other tab AFTER preview'))");
    const outcome=await evaluate(a,"store.writeState(fixture('old imported backup'),{expectedRaw:preview.raw}).then(()=>({ok:true}),error=>({ok:false,message:error.message}))");
    assert.equal(outcome.ok,false);assert.match(outcome.message,/重新核对/);assert.equal(await note(),'other tab AFTER preview');
  });
  test('a writer queued before confirmation is checked inside the restore readwrite transaction',async()=>{
    await evaluate(a,"(async()=>{await store.writeState(fixture('before queued writer'));window.preview=await store.readStateSnapshot();})()");
    await evaluate(b,`(async()=>{
      const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('english-studio-offline',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
      const t=db.transaction('state','readwrite'),s=t.objectStore('state');window.writerReleased=false;window.writerStarted=false;
      window.writerDone=new Promise((resolve,reject)=>{t.oncomplete=()=>{db.close();resolve(true);};t.onabort=()=>reject(t.error);});
      s.put(fixture('queued writer committed AFTER preview'),'current');
      function hold(){const r=s.get('current');r.onsuccess=()=>{window.writerStarted=true;if(!window.writerReleased)hold();};}hold();
    })()`);
    await until(()=>evaluate(b,'window.writerStarted'),'Queued transaction did not start.');
    await evaluate(a,"window.restoreDone=store.writeState(fixture('stale import behind writer'),{expectedRaw:preview.raw}).then(()=>({ok:true}),error=>({ok:false,message:error.message}));true");
    await evaluate(b,'window.writerReleased=true;writerDone');
    const outcome=await evaluate(a,'restoreDone');assert.equal(outcome.ok,false);assert.match(outcome.message,/重新核对/);
    assert.equal(await note(),'queued writer committed AFTER preview');
  });
  test('two simultaneous restores with one snapshot permit exactly one commit',async()=>{
    await evaluate(a,"(async()=>{await store.writeState(fixture('common preview'));window.preview=await store.readStateSnapshot();})()");
    await evaluate(b,'store.readStateSnapshot().then(value=>window.preview=value)');
    const results=await Promise.all([
      evaluate(a,"store.writeState(fixture('restore A'),{expectedRaw:preview.raw}).then(()=>true,()=>false)"),
      evaluate(b,"store.writeState(fixture('restore B'),{expectedRaw:preview.raw}).then(()=>true,()=>false)"),
    ]);
    assert.equal(results.filter(Boolean).length,1);assert.equal(await note(),results[0]?'restore A':'restore B');
  });
  test('an unchanged-storage but changed-page guard aborts without a write',async()=>{
    await evaluate(a,"(async()=>{await store.writeState(fixture('same persisted original'));window.preview=await store.readStateSnapshot();})()");
    const ok=await evaluate(a,"store.writeState(fixture('must not replace local input'),{expectedRaw:preview.raw,unchanged:()=>false}).then(()=>true,()=>false)");
    assert.equal(ok,false);assert.equal(await note(),'same persisted original');
  });
  test('guarded rollback preserves a newer writer and can precisely restore an absent key',async()=>{
    await evaluate(a,"(async()=>{await store.writeState(fixture('applied restore'));window.applied=await store.readStateSnapshot();})()");
    await evaluate(b,"store.writeState(fixture('new input DURING rollback'))");
    const ok=await evaluate(a,"store.writeState(undefined,{expectedRaw:applied.raw}).then(()=>true,()=>false)");
    assert.equal(ok,false);assert.equal(await note(),'new input DURING rollback');
    await reset();await evaluate(a,"(async()=>{await store.writeState(fixture('temporary restore'),{expectedRaw:null});window.applied=await store.readStateSnapshot();await store.writeState(undefined,{expectedRaw:applied.raw});})()");
    assert.deepEqual(await evaluate(a,'store.readStateSnapshot()'),{mode:'db',raw:null});
  });
  test('exact storage rollback preserves a damaged original, its absence, and rejects late writes',async()=>{
    await evaluate(a,`(async()=>{
      const db=await new Promise(resolve=>{const r=indexedDB.open('english-studio-offline',1);r.onsuccess=()=>resolve(r.result);});
      await new Promise(resolve=>{const t=db.transaction('state','readwrite');t.objectStore('state').put({damaged:'synthetic original'},'current');t.oncomplete=resolve;});db.close();
      window.damaged=await store.readStateSnapshot();await store.writeState(fixture('repaired'),{expectedRaw:damaged.raw});window.repaired=await store.readStateSnapshot();
      await store.restoreStateSnapshot(damaged,{expectedRaw:repaired.raw});
    })()`);
    assert.deepEqual(await evaluate(a,'store.readState()'),{damaged:'synthetic original'});
    await reset();await evaluate(a,"(async()=>{window.absent=await store.readStateSnapshot();await store.writeState(fixture('temporary'),{expectedRaw:absent.raw});window.applied=await store.readStateSnapshot();await store.restoreStateSnapshot(absent,{expectedRaw:applied.raw});})()");
    assert.deepEqual(await evaluate(a,'store.readStateSnapshot()'),{mode:'db',raw:null});
    await evaluate(a,"(async()=>{await store.writeState(fixture('applied'));window.applied=await store.readStateSnapshot();})()");await evaluate(b,"store.writeState(fixture('new input before exact rollback'))");
    assert.equal(await evaluate(a,"store.restoreStateSnapshot(absent,{expectedRaw:applied.raw}).then(()=>true,()=>false)"),false);assert.equal(await note(),'new input before exact rollback');
  });
  test('legacy writers share a Web Lock and a queued restore refuses the newer raw value',async()=>{
    await evaluate(a,"store.writeLegacyState(fixture('legacy preview'),'english-studio-v1');window.legacyPreview=localStorage.getItem('english-studio-v1')");
    await evaluate(b,`window.legacyStarted=false;window.legacyDone=navigator.locks.request('english-studio-progress:english-studio-v1',{mode:'exclusive'},async()=>{
      window.legacyStarted=true;await new Promise(resolve=>window.releaseLegacy=resolve);localStorage.setItem('english-studio-v1',JSON.stringify(fixture('legacy other tab AFTER preview')));
    });true`);
    await until(()=>evaluate(b,'window.legacyStarted'),'Legacy shared lock was not acquired.');
    await evaluate(a,"window.legacyRestore=store.writeLegacyState(fixture('legacy old backup'),'english-studio-v1',{expectedRaw:legacyPreview}).then(()=>true,()=>false);true");
    await evaluate(b,'releaseLegacy();legacyDone');assert.equal(await evaluate(a,'legacyRestore'),false);
    assert.equal(await evaluate(a,"JSON.parse(localStorage.getItem('english-studio-v1')).drafts.note"),'legacy other tab AFTER preview');
  });
  test('legacy guarded restore has no unlocked fallback when Web Locks are unavailable',async()=>{
    const outcome=await evaluate(a,`(async()=>{
      const before=localStorage.getItem('english-studio-v1');Object.defineProperty(navigator,'locks',{configurable:true,value:undefined});
      try{await store.writeLegacyState(fixture('unsafe restore'),'english-studio-v1',{expectedRaw:before});return {ok:true};}
      catch(error){return {ok:false,message:error.message,unchanged:localStorage.getItem('english-studio-v1')===before};}
      finally{delete navigator.locks;}
    })()`);
    assert.equal(outcome.ok,false);assert.equal(outcome.unchanged,true);assert.match(outcome.message,/无法安全核对/);
  });
  for(const {name,run} of tests){try{await run();console.log('PASS '+name);}catch(error){failures++;console.error('FAIL '+name+'\n'+error.stack);}}
  const receipt={browser:version.product,scope:'two isolated localhost tabs; production offline-store; synthetic storage fixtures',passed:tests.length-failures,total:tests.length};
  await writeFile(path.join(temporary,'receipt.json'),JSON.stringify(receipt,null,2));
  console.log(`${receipt.passed}/${receipt.total} real browser storage checks passed.`);
  if(process.env.KEEP_PROGRESS_BROWSER_EVIDENCE)console.log(`Local receipt: ${path.join(temporary,'receipt.json')}`);
  if(failures)process.exitCode=1;
} finally {
  if(browser)try{await browser.send('Browser.close');}catch{}
  for(const tab of tabs)tab.close();browser?.close();
  if(chrome&&chrome.exitCode===null)chrome.kill('SIGTERM');
  if(server)await new Promise(resolve=>server.close(resolve));
  if(!process.env.KEEP_PROGRESS_BROWSER_EVIDENCE)await rm(temporary,{recursive:true,force:true});
}
