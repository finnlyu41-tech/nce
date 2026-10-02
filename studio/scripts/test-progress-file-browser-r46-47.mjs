import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp, mkdir, readFile, readdir, rm, writeFile, rename} from 'node:fs/promises';
import {createServer} from 'node:http';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
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

// Actual built StudyApp + map App, actual native Chrome downloads and uploads.
// Never open any existing browser profile. Synthetic timestamps are fixture
// inputs to canonical models; Date.now and the browser clock are not replaced.
const out=fileURLToPath(new URL('../docs/verification/r46-47-real-files/',import.meta.url));
const baseline=process.argv.includes('--baseline-map-conflict');
const checks=[],artifacts=[];
const check=(ok,name)=>{assert.ok(ok,name);checks.push(name);console.log('PASS '+name)};
const apiSource=`
import * as store from './app/offline-store';
import {initial} from './app/model';
import * as cards from './app/flashcards';
import * as loop from './app/course-loop-progress';
import * as demo from './public/demos/yesterday/model.mjs';
import * as review from './public/demos/yesterday/review-adapter.mjs';
import * as reviewModel from './public/demos/yesterday/review-model.mjs';
import * as map from './map/model';
const copy=v=>structuredClone(v);
function fixture(note){
 let state={...copy(initial),drafts:{note,[loop.courseLoopKey]:JSON.stringify(loop.loopModel.initialState())},nce:{'NCE1-1':{title:'Synthetic lesson',text:'This is a synthetic book.',notes:'R46 original note',steps:['listen']}},personalWords:[{word:'synthetic',meaning:'合成',example:'This is synthetic.',sources:[{kind:'personal'}]}]};
 state=cards.enrollFlashcard(state,{word:'synthetic',meaning:'合成',example:'This is synthetic.'},[{kind:'personal'}]);
 const id=Object.keys(state.flashcards.cards)[0];state=cards.selectFlashcard(state,id);state=cards.revealFlashcard(state,{cardId:id,revision:state.flashcards.cards[id].revision});return state;
}
function capability(){
 const start=Date.now()-3*86400000;let d=demo.goTo(demo.initialState(start),2);
 d=demo.advanceIndependent(demo.submit(demo.showQuestion(d,'new-omar'),'new-omar',1,start+1000));
 d=demo.advanceIndependent(demo.submit(demo.showQuestion(d,'new-may'),'new-may',2,start+2000));
 d=demo.finishDemo(d,'Synthetic diary to restore.',start+3000);
 const plan=review.ensurePlan(review.emptySnapshot(),demo.completedDemo(d),start+3000).snapshot;
 const task=review.getDueTasks(plan,plan.plan.dueAt)[0];let session=reviewModel.beginReview(task.taskId,[],0,task.dueAt);
 for(let i=0;i<3;i++){session=reviewModel.showReviewQuestion(session);session=reviewModel.answerReview(session,reviewModel.currentReviewQuestion(session).correct,task.dueAt+i+1);session=reviewModel.advanceReview(session,task.dueAt+i+1)}
 const livePlan=review.recordResult(plan,{taskId:task.taskId,resultId:task.taskId+':result',outcome:reviewModel.reviewOutcome(session),at:session.finishedAt},session.finishedAt).snapshot;
 return {demo:d,plan,liveDemo:{...d,reviewSession:session,reviewSeenIds:session.seenIds},livePlan};
}
const pair=()=>({demo:localStorage.getItem(demo.storageKey),review:localStorage.getItem(review.STORAGE_KEY)});
window.qa={store,map,review,fixture,capability,pair,setPair:(d,p)=>{localStorage.setItem(demo.storageKey,JSON.stringify(d));localStorage.setItem(review.STORAGE_KEY,JSON.stringify(p))},clearPair:()=>{localStorage.removeItem(demo.storageKey);localStorage.removeItem(review.STORAGE_KEY)}};
`;
try {
 await mkdir(out,{recursive:true});await mkdir(path.join(temporary,'downloads'));
 await build({stdin:{contents:apiSource,resolveDir:fileURLToPath(root),loader:'ts'},bundle:true,platform:'browser',format:'esm',target:'chrome120',outfile:path.join(temporary,'api.js'),logLevel:'silent'});
 const api=await readFile(path.join(temporary,'api.js'));
 server=createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api.js'){res.setHeader('Content-Type','text/javascript');res.end(api);return}
  if(url.pathname==='/seed'){res.setHeader('Content-Type','text/html');res.end('<script type="module" src="/api.js"></script>');return}
  const map=url.pathname.startsWith('/map/');const dir=map?new URL('../map/dist/',import.meta.url):new URL('../static-export/',import.meta.url);
  const relative=map?url.pathname.slice(5)||'index.html':url.pathname==='/'?'standalone.html':url.pathname.slice(1);
  try{const file=path.resolve(fileURLToPath(dir),relative);assert.ok(file.startsWith(fileURLToPath(dir)));const data=await readFile(file);res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':'text/html');res.end(data)}catch{res.statusCode=404;res.end('Not found')}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
 const origin=`http://127.0.0.1:${server.address().port}`,profile=path.join(temporary,'fresh-synthetic-profile');
 chrome=spawn(chromeBin,['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-sync','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
 let launchError;chrome.once('error',e=>launchError=e);
 await until(async()=>{if(launchError)throw launchError;try{return !!(await readFile(path.join(profile,'DevToolsActivePort'),'utf8'))}catch{return false}},'Isolated Chrome did not launch');
 const [port,browserPath]=(await readFile(path.join(profile,'DevToolsActivePort'),'utf8')).trim().split('\n');browser=await connect(`ws://127.0.0.1:${port}${browserPath}`);
 await browser.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:path.join(temporary,'downloads'),eventsEnabled:true});
 const version=await browser.send('Browser.getVersion');
 async function open(url='/seed'){
  const {targetId}=await browser.send('Target.createTarget',{url:origin+url});const targets=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();const tab=await connect(targets.find(t=>t.id===targetId).webSocketDebuggerUrl);tabs.push(tab);await tab.send('Page.enable');await tab.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});return tab;
 }
 async function apiOn(tab){await evaluate(tab,"import('/api.js')");await until(()=>evaluate(tab,'!!window.qa'),'API did not load')}
 async function go(tab,url){await tab.send('Page.navigate',{url:origin+url});await until(()=>evaluate(tab,'document.readyState==="complete"'),'Page not ready');await apiOn(tab)}
 async function click(tab,label){await until(()=>evaluate(tab,`[...document.querySelectorAll('button')].some(b=>(b.textContent.trim()===${JSON.stringify(label)}||b.getAttribute('aria-label')===${JSON.stringify(label)})&&!b.disabled)`),'Missing enabled button '+label);await evaluate(tab,`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(label)}||b.getAttribute('aria-label')===${JSON.stringify(label)}).click()`);await delay(100)}
 async function upload(tab,file){const {root:doc}=await tab.send('DOM.getDocument');const {nodeId}=await tab.send('DOM.querySelector',{nodeId:doc.nodeId,selector:'input[type=file]'});assert.ok(nodeId);await tab.send('DOM.setFileInputFiles',{nodeId,files:[file]});await delay(180)}
 async function downloaded(label,action){const before=await readdir(path.join(temporary,'downloads'));await action();let name;await until(async()=>{name=(await readdir(path.join(temporary,'downloads'))).find(n=>!before.includes(n)&&!n.endsWith('.crdownload'));return !!name},'No real download: '+label);const file=path.join(out,label+'.json');await rename(path.join(temporary,'downloads',name),file);const raw=await readFile(file,'utf8');artifacts.push({file:label+'.json',suggestedName:name,bytes:Buffer.byteLength(raw),sha256:createHash('sha256').update(raw).digest('hex')});return {file,raw,value:JSON.parse(raw)}}
 async function shot(tab,name){const {data}=await tab.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(path.join(out,name+'.png'),Buffer.from(data,'base64'))}
 const a=await open();await apiOn(a);await evaluate(a,"window.seed=qa.fixture('R46 full original');window.cap=qa.capability();qa.store.writeState(seed).then(()=>qa.setPair(cap.demo,cap.plan))");
 const expected=await evaluate(a,'({state:seed,pair:qa.pair()})');await go(a,'/#/progress');
 const textbook=await downloaded('textbook-v2-original',()=>click(a,'保存进度'));
 check(textbook.value.version===2&&textbook.value.format==='english-studio-progress','real textbook download is a version 2 file');
 check(JSON.stringify(textbook.value.state)===JSON.stringify(expected.state),'real file preserves notes, word sources, flashcard reveal and course draft');
 check(Object.keys(textbook.value.capability.stores).length===2,'real textbook file carries both capability stores');
 await shot(a,'textbook-export');
 await evaluate(a,"qa.store.writeState(qa.fixture('replace target')).then(()=>qa.clearPair())");await go(a,'/#/progress');await click(a,'进度备份与恢复');await upload(a,textbook.file);await until(()=>evaluate(a,"document.body.textContent.includes('恢复这份学习进度？')"),'No restore preview');await click(a,'确认替换并恢复');
 check(await evaluate(a,"qa.store.readState().then(s=>s.drafts.note==='R46 full original')"),'actual uploaded downloaded file restores textbook state');
 check(await evaluate(a,`qa.pair().demo===${JSON.stringify(expected.pair.demo)}&&qa.pair().review===${JSON.stringify(expected.pair.review)}`),'actual upload restores original answers, hints, seen IDs and exact due');await shot(a,'textbook-restored');
 await click(a,'进度备份与恢复');await upload(a,textbook.file);await click(a,'确认替换并恢复');
 check(await evaluate(a,`qa.pair().review===${JSON.stringify(expected.pair.review)}`),'repeat textbook restore does not duplicate plan or receipt');
 const before=await evaluate(a,'(async()=>({main:await qa.store.readStateSnapshot(),pair:qa.pair()}))()');
 for(const [name,data] of [['corrupt','{broken'],['future',JSON.stringify({...textbook.value,version:99})],['bad-capability',JSON.stringify({...textbook.value,capability:{...textbook.value.capability,version:99}})]]){
  const file=path.join(out,name+'.json');await writeFile(file,data);await go(a,'/#/progress');await click(a,'进度备份与恢复');await upload(a,file);
  check(JSON.stringify(await evaluate(a,'(async()=>({main:await qa.store.readStateSnapshot(),pair:qa.pair()}))()'))===JSON.stringify(before),name+' upload preserves original bytes');
  check(!await evaluate(a,"[...document.querySelectorAll('button')].some(b=>b.textContent==='确认替换并恢复')"),name+' has no restore confirmation');
  await evaluate(a,"document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))");await delay(100);
 }
 // Open fresh page to close dialogs reliably, without clearing any data.
 await go(a,'/#/progress');await evaluate(a,'window.cap=qa.capability()');
 // Use the original completion identity, then its canonical newer result.
 const cap=await evaluate(a,'cap');cap.demo=JSON.parse(expected.pair.demo);cap.plan=JSON.parse(expected.pair.review);
 // Rebuild a canonical result using the original plan and production scheduler.
 await evaluate(a,`{const plan=${JSON.stringify(cap.plan)};const at=plan.plan.dueAt+10;const taskId=plan.plan.planId+'@'+plan.plan.dueAt;const result=qa.review.recordResult(plan,{taskId,resultId:taskId+':result',outcome:'passed',at},at);if(!result.ok)throw Error(JSON.stringify(result));qa.setPair(${JSON.stringify(cap.demo)},result.snapshot)}`);
 const newerPair=await evaluate(a,'qa.pair()');await go(a,'/#/progress');await click(a,'进度备份与恢复');await upload(a,textbook.file);await click(a,'确认替换并恢复');
 check(JSON.stringify(await evaluate(a,'qa.pair()'))===JSON.stringify(newerPair),'older downloaded file retains newer live capability receipt and exact due');
 const legacy=path.join(out,'legacy-v1.json');await writeFile(legacy,JSON.stringify({...textbook.value,version:1,capability:undefined}));await click(a,'进度备份与恢复');await upload(a,legacy);await click(a,'确认替换并恢复');check(JSON.stringify(await evaluate(a,'qa.pair()'))===JSON.stringify(newerPair),'legacy v1 actual upload preserves capability stores');
 const plain=path.join(out,'legacy-plain.json');await writeFile(plain,JSON.stringify(textbook.value.state));await click(a,'进度备份与恢复');await upload(a,plain);await click(a,'确认替换并恢复');check(JSON.stringify(await evaluate(a,'qa.pair()'))===JSON.stringify(newerPair),'legacy plain State JSON upload preserves capability stores');
 const b=await open();await apiOn(b);await click(a,'进度备份与恢复');await upload(a,textbook.file);
 await evaluate(b,"qa.store.writeState(qa.fixture('B committed after preview'))");const concurrent=await evaluate(b,'qa.store.readStateSnapshot()');await click(a,'确认替换并恢复');
 check(JSON.stringify(await evaluate(a,'qa.store.readStateSnapshot()'))===JSON.stringify(concurrent),'textbook UI stale preview refuses other tab committed state');check(await evaluate(a,"document.body.textContent.includes('重新核对')"),'textbook UI exposes conflict and recheck');await shot(a,'textbook-cross-tab-refused');
 await go(a,'/#/progress');await click(a,'进度备份与恢复');await upload(a,textbook.file);
 await evaluate(b,"{const d=JSON.parse(qa.pair().demo);d.draft='B later capability diary';localStorage.setItem('nce-demo-yesterday-v1',JSON.stringify(d))}");const pairConflict=await evaluate(b,'qa.pair()'),mainConflict=await evaluate(b,'qa.store.readStateSnapshot()');await click(a,'确认替换并恢复');check(JSON.stringify(await evaluate(a,'qa.pair()'))===JSON.stringify(pairConflict)&&JSON.stringify(await evaluate(a,'qa.store.readStateSnapshot()'))===JSON.stringify(mainConflict),'capability stale preview preserves both capability and main stores');
 // Main IndexedDB rejection is injected at the native put surface only.
 await evaluate(b,`qa.setPair(${JSON.stringify(expected.pair.demo?JSON.parse(expected.pair.demo):null)},${JSON.stringify(JSON.parse(expected.pair.review))})`);await go(a,'/#/progress');await click(a,'进度备份与恢复');await upload(a,textbook.file);const failBefore=await evaluate(a,'(async()=>({main:await qa.store.readStateSnapshot(),pair:qa.pair()}))()');
 await evaluate(a,"window.originalPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(){throw new DOMException('Synthetic quota rejection','QuotaExceededError')}");await click(a,'确认替换并恢复');await evaluate(a,'IDBObjectStore.prototype.put=originalPut');check(JSON.stringify(await evaluate(a,'(async()=>({main:await qa.store.readStateSnapshot(),pair:qa.pair()}))()'))===JSON.stringify(failBefore),'native IndexedDB write rejection retains all original stores');await shot(a,'textbook-write-failure');
 // A capability write failure after main commit must roll back the actual IDB.
 await go(a,'/#/progress');await evaluate(a,'qa.clearPair()');await click(a,'进度备份与恢复');await upload(a,textbook.file);const dualBefore=await evaluate(a,'(async()=>({main:await qa.store.readStateSnapshot(),pair:qa.pair()}))()');
 await evaluate(a,"window.oldCapabilitySet=Storage.prototype.setItem;window.rejectOnce=true;Storage.prototype.setItem=function(key,value){if(key==='nce-demo-yesterday-v1'&&rejectOnce){rejectOnce=false;throw new DOMException('Synthetic capability write denial','QuotaExceededError')}return oldCapabilitySet.call(this,key,value)}");await click(a,'确认替换并恢复');await evaluate(a,'Storage.prototype.setItem=oldCapabilitySet');
 check(JSON.stringify(await evaluate(a,'(async()=>({main:await qa.store.readStateSnapshot(),pair:qa.pair()}))()'))===JSON.stringify(dualBefore),'capability native write rejection rolls back committed textbook state and preserves both local stores');
 // Separate map file and full production map restore dialog.
 await go(a,'/map/');await evaluate(a,"localStorage.setItem(qa.map.storageKey,JSON.stringify({...qa.map.emptyProgress(),minimum:'5.5',lastNode:'letters',access:{all:false,nodes:['first']},records:{'nce1-1':{...qa.map.emptyRecord(),draft:{note:'R47 original map draft'}}}}))");await go(a,'/map/');await evaluate(a,"document.querySelector('.map-settings summary').click()");const mapFile=await downloaded('map-v2-original',()=>click(a,'导出地图进度'));check(mapFile.value.version===2&&mapFile.value.records['nce1-1'].draft.note==='R47 original map draft','actual map download preserves original draft and settings');
 await evaluate(a,"localStorage.setItem(qa.map.storageKey,JSON.stringify({...qa.map.emptyProgress(),minimum:'6'}))");await go(a,'/map/');await upload(a,mapFile.file);const rollback=await downloaded('map-before-restore',()=>click(a,'备份当前进度并恢复'));check(rollback.value.minimum==='6','map restore actually downloads recoverable prior state');check(await evaluate(a,"JSON.parse(localStorage.getItem(qa.map.storageKey)).records['nce1-1'].draft.note==='R47 original map draft'"),'actual map file upload restores map state');await shot(a,'map-restored');
 await upload(a,mapFile.file);await evaluate(b,"localStorage.setItem(qa.map.storageKey,JSON.stringify({...qa.map.emptyProgress(),minimum:'7',lastNode:'letters',records:{'nce1-1':{...qa.map.emptyRecord(),draft:{note:'B new map draft after A preview'}}}}))");await delay(100);const mapConcurrent=await evaluate(b,'localStorage.getItem(qa.map.storageKey)');
 const conflictBackup=await downloaded('map-conflict-before-restore',()=>click(a,'备份当前进度并恢复'));const afterMap=await evaluate(a,'localStorage.getItem(qa.map.storageKey)');
 if(baseline){check(afterMap!==mapConcurrent&&JSON.parse(afterMap).minimum==='5.5','BASELINE reproduced: map restore overwrites newer other-tab map draft');await shot(a,'baseline-map-overwrite')}
 else{check(afterMap===mapConcurrent,'map stale preview refuses overwrite and preserves newer draft');check(await evaluate(a,"document.querySelector('.restore-dialog [role=alert]')?.textContent.includes('重新')"),'map restore reports conflict');await shot(a,'map-cross-tab-refused')}
 if(!baseline){
 // Failed/map-incompatible inputs do not write and leave the prior preview closed.
 await go(a,'/map/');const mapSafe=await evaluate(a,'localStorage.getItem(qa.map.storageKey)');
 for(const [name,data] of [['map-corrupt','{damaged'],['map-old',JSON.stringify({...mapFile.value,version:1})],['map-future',JSON.stringify({...mapFile.value,version:99})]]){
  const file=path.join(out,name+'.json');await writeFile(file,data);await upload(a,file);
  check(await evaluate(a,'localStorage.getItem(qa.map.storageKey)')===mapSafe,name+' actual upload retains original map');
  check(!await evaluate(a,"!!document.querySelector('.restore-dialog')"),name+' rejects preview');
 }
 await upload(a,mapFile.file);await evaluate(a,"window.oldSet=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key===qa.map.storageKey)throw new DOMException('Synthetic map quota','QuotaExceededError');return oldSet.call(this,key,value)}");
 await downloaded('map-failure-rollback',()=>click(a,'备份当前进度并恢复'));await evaluate(a,'Storage.prototype.setItem=oldSet');
 check(await evaluate(a,'localStorage.getItem(qa.map.storageKey)')===mapSafe,'map native quota rejection retains original bytes');check(await evaluate(a,"document.querySelector('.restore-dialog [role=alert]')?.textContent.includes('恢复未完成')"),'map native rejection exposes failure without success');await shot(a,'map-write-failure');
 await go(a,'/map/');await upload(a,mapFile.file);await downloaded('map-retry-rollback',()=>click(a,'备份当前进度并恢复'));
 check(await evaluate(a,"JSON.parse(localStorage.getItem(qa.map.storageKey)).records['nce1-1'].draft.note==='R47 original map draft'"),'map explicit retry restores after storage write recovers');
 await upload(a,mapFile.file);await downloaded('map-repeat-rollback',()=>click(a,'备份当前进度并恢复'));check(await evaluate(a,"Object.keys(JSON.parse(localStorage.getItem(qa.map.storageKey)).records).length===1"),'map repeated actual upload has one record');
 if(!baseline){
  await evaluate(b,"localStorage.setItem(qa.map.storageKey,JSON.stringify({...qa.map.emptyProgress(),minimum:'7'}))");await go(a,'/map/');await go(b,'/map/');await upload(a,mapFile.file);await upload(b,mapFile.file);
  // Different native files avoid an identical idempotent write counting twice.
  const otherFile=path.join(out,'map-second-candidate.json');await writeFile(otherFile,JSON.stringify({...mapFile.value,minimum:'6.5'}));await upload(b,otherFile);
  for(const tab of [a,b])await evaluate(tab,"window.mapWrites=0;window.nativeMapSet=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key===qa.map.storageKey)mapWrites++;return nativeMapSet.call(this,key,value)}");await Promise.all([click(a,'备份当前进度并恢复'),click(b,'备份当前进度并恢复')]);
   check((await evaluate(a,'mapWrites'))+(await evaluate(b,'mapWrites'))===1,'two actual map restore dialogs sharing a snapshot commit exactly one different candidate');for(const tab of [a,b])await evaluate(tab,'Storage.prototype.setItem=nativeMapSet');
  await go(a,'/map/');const noLockBefore=await evaluate(a,'localStorage.getItem(qa.map.storageKey)');await upload(a,mapFile.file);
  await evaluate(a,"Object.defineProperty(navigator,'locks',{configurable:true,value:undefined})");await click(a,'备份当前进度并恢复');await evaluate(a,'delete navigator.locks');
  check(await evaluate(a,'localStorage.getItem(qa.map.storageKey)')===noLockBefore,'map restore has no unsafe unlocked fallback');check(await evaluate(a,"document.querySelector('.restore-dialog [role=alert]')?.textContent.includes('Web Locks')"),'missing lock support is explained in the actual dialog failure');
 }
 check(await evaluate(a,'qa.store.readStateSnapshot().then(v=>v.raw)')===mainConflict.raw,'map restore/failures preserve separate textbook database');

 }
 const testedFiles={};for(const file of ['map/main.tsx',...baseline?[]:['map/progress-file-restore.ts'],'scripts/test-progress-file-browser-r46-47.mjs'])testedFiles[file]=createHash('sha256').update(await readFile(new URL('../'+file,import.meta.url))).digest('hex');
 const report={testedFiles,sourceHead:execFileSync('git',['rev-parse','HEAD'],{cwd:fileURLToPath(root),encoding:'utf8'}).trim(),baseline,browser:version.product,scope:'Actual built production apps; fresh isolated Chrome profile; actual downloaded JSON on disk then DOM file upload; synthetic records only; unchanged real browser clock',checks,artifacts,unmeasured:['Safari/iOS/iCloud native picker and share-sheet','production deployment and personal records','natural elapsed-time scheduling','OS-wide power loss and disk exhaustion','atomicity against noncooperating synchronous legacy map writers in the check/set micro-window'],passed:checks.length};
 await writeFile(path.join(out,baseline?'baseline-report.json':'browser-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:checks.length,baseline,out}));
} finally {
 if(browser)try{await browser.send('Browser.close')}catch{}
 for(const tab of tabs)tab.close();browser?.close();if(chrome&&chrome.exitCode===null)chrome.kill('SIGTERM');if(server)await new Promise(resolve=>server.close(resolve));await rm(temporary,{recursive:true,force:true,maxRetries:10,retryDelay:200});
}
