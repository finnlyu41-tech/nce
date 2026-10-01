import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

// Actual React and DOM, in a new temporary Chrome profile. The fixture replaces
// localStorage with an in-memory Map before importing App. No real profile,
// learner record, external service, browser extension or extra dependency is used.
const args=process.argv.slice(2),option=(key,fallback)=>args.includes(key)?args[args.indexOf(key)+1]:fallback;
const browser=option('--browser','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
const base=option('--url','http://127.0.0.1:43327/fixtures/save.html');
assert.equal(new URL(base).hostname,'127.0.0.1','Use the local synthetic fixture only');
const out=fileURLToPath(new URL('../docs/verification/map-reliability/',import.meta.url));
await mkdir(out,{recursive:true});
const profile=await mkdtemp(join(tmpdir(),'english-map-browser-'));
const chrome=spawn(browser,['--headless=new','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-component-update','--disable-sync','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
let socket,sequence=0;
const pending=new Map(),checks=[];
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try{
 const endpoint=await new Promise((resolve,reject)=>{let output='';const timeout=setTimeout(()=>reject(Error('Temporary browser did not start')),20_000);chrome.once('error',reject);chrome.stderr.on('data',chunk=>{output+=chunk;const match=output.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match){clearTimeout(timeout);resolve(match[1])}});chrome.once('exit',code=>reject(Error(`Temporary browser exited ${code}`)));});
 socket=new WebSocket(endpoint);
 await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
 socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id&&pending.has(message.id)){const {resolve,reject,timer}=pending.get(message.id);pending.delete(message.id);clearTimeout(timer);message.error?reject(Error(JSON.stringify(message.error))):resolve(message.result)}});
 const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(Error(`CDP timeout: ${method}`))},20_000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params,...sessionId?{sessionId}:{}}));});
 function check(value,name){assert.ok(value,name);checks.push(name);}
 async function open(kind){
  const {targetId}=await send('Target.createTarget',{url:'about:blank'}),{sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
  await send('Page.enable',{},sessionId);
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true},sessionId);
  const run=async expression=>{const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},sessionId);if(result.exceptionDetails)throw Error(result.exceptionDetails.text+': '+result.exceptionDetails.exception?.description);return result.result.value;};
  const wait=async expression=>{for(let i=0;i<100;i++){if(await run(expression))return;await delay(100)}throw Error(`Fixture did not settle: ${expression}`)};
  await send('Page.navigate',{url:base+(kind==='project'?'?kind=project':'')},sessionId);
  await wait("!!document.querySelector('#root form')");
  const state=()=>run("document.querySelector('#inspect').click();JSON.parse(document.querySelector('#report').textContent)");
  const click=async id=>{await run(`document.querySelector('#${id}').click()`);await delay(100)};
  const textSelector=kind==='project'?'.chapter-project textarea':'.evidence-form textarea';
  const value=()=>run(`document.querySelector('${textSelector}').value`);
  const edit=async text=>{await run(`{const e=document.querySelector('${textSelector}');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(e,${JSON.stringify(text)});e.dispatchEvent(new Event('input',{bubbles:true}));}`);await delay(100)};
  const submit=async()=>{await run("document.querySelector('#root form').requestSubmit()");await delay(150)};
  const success=()=>run("!!document.querySelector('.saved-message')||[...document.querySelectorAll('#root [role=status]')].some(e=>e.textContent.includes('作品记录已保存。'))");
  const screenshot=async name=>{const height=await run('Math.min(document.documentElement.scrollHeight,7000)');const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:390,height,scale:1}},sessionId);await writeFile(join(out,name),Buffer.from(data,'base64'));};
  return {run,wait,state,click,value,edit,submit,success,screenshot,close:()=>send('Target.closeTarget',{targetId})};
 }
 for(const kind of ['mock','project']){
  const page=await open(kind),initial=await page.value(),edited=initial+' Synthetic local correction retained after write rejection.';
  await page.click('fail');await page.edit(edited);await page.submit();
  let committed=await page.state();
  check(!committed.hasResult&&!committed.completed&&committed.successor==='locked',`${kind}: rejected write cannot save, complete or unlock`);
  check(!await page.success(),`${kind}: rejected write cannot display success`);
  check(await page.value()===edited,`${kind}: rejected write retains editable input`);
  await page.screenshot(`${kind}-write-rejected.png`);
  await page.click('restore');await page.submit();committed=await page.state();
  check(committed.hasResult&&committed.completed&&committed.successor==='available',`${kind}: retry commits and unlocks`);
  check(await page.success(),`${kind}: successful retry displays receipt`);
  check(committed.writing===edited,`${kind}: retry commits retained input`);
  await page.screenshot(`${kind}-retry-saved.png`);
  if(kind==='mock'){
   await page.click('minimum-event');committed=await page.state();
   check(committed.hasResult&&!committed.completed,`${kind}: a higher minimum preserves evidence and recomputes completion`);
   check(!await page.success(),`${kind}: higher minimum removes stale success receipt`);
  }
  await page.close();
 }
 for(const kind of ['mock','project']){
  const page=await open(kind),edited=(await page.value())+' Synthetic local edit before conflict.';
  await page.click('fail');await page.edit(edited);await page.click('restore');await page.click('conflict');await page.submit();
  let committed=await page.state();
  check(!committed.hasResult&&!await page.success(),`${kind}: cross-tab conflict cannot show success`);
  check(await page.value()===edited,`${kind}: conflict keeps the local input`);
  check(committed.minimum==='5.5'&&committed.lastNode==='letters',`${kind}: conflict loads remote settings and position`);
  await page.submit();committed=await page.state();
  check(committed.completed&&committed.writing===edited,`${kind}: explicit conflict retry commits retained input`);
  check(committed.minimum==='5.5'&&committed.lastNode==='letters',`${kind}: retry merges remote settings and position`);
  await page.close();
 }
 for(const kind of ['mock','project']){
  const page=await open(kind),edited=(await page.value())+' Synthetic local edit before storage event.';
  await page.edit(edited);await page.click('draft-event');
  check(await page.value()===edited,`${kind}: incoming draft event keeps local input`);
  const remote=await page.state();await page.edit(edited+' Further local edit.');
  check((await page.state()).writing===remote.writing,`${kind}: unresolved event prevents silent autosave overwrite`);
  await page.submit();
  check((await page.state()).writing===edited+' Further local edit.'&&await page.success(),`${kind}: explicit event retry commits local input`);
  await page.close();
 }
 for(const kind of ['mock','project']){
  const page=await open(kind),edited=(await page.value())+' Synthetic local input survives relock.';
  await page.click('fail');await page.edit(edited);await page.click('restore');await page.click('relock');await page.submit();
  await page.wait("!!document.querySelector('.locked-room')");
  check(await page.value()===edited,`${kind}: relock hides but does not unmount the edited form`);
  check(!(await page.state()).hasResult&&!await page.success(),`${kind}: relock conflict remains uncommitted`);
  await page.run("document.querySelector('.locked-room button').click()");await page.wait("!document.querySelector('.locked-room')");
  check(await page.value()===edited,`${kind}: explicit unlock restores the same input`);
  await page.submit();check((await page.state()).writing===edited&&await page.success(),`${kind}: same input can be saved after unlock`);
  await page.close();
 }
 const report={runtime:'Actual React 19.2.6 in isolated headless Chrome; in-memory localStorage only',passed:checks.length,failed:0,checks};
 await writeFile(join(out,'browser-after.json'),JSON.stringify(report,null,2)+'\n');
 console.log(`PASS (${checks.length} actual browser assertions): storage rejection/retry, concurrent updates, storage events, relock retention and stale receipts.`);
}finally{
 socket?.close();chrome.kill('SIGTERM');await delay(250);await rm(profile,{recursive:true,force:true});
}
