import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {mkdtemp,mkdir,readFile,readdir,rename,rm,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Full built StudyApp, native IndexedDB/Web Locks, native files and real Chrome.
// Only fresh temporary profiles and explicitly synthetic model records. Neither
// Date.now nor any device/browser clock is replaced; no natural-delay claim.
const studio=fileURLToPath(new URL('../../',import.meta.url));
const out=path.resolve(process.env.STAGE_QA_OUT||fileURLToPath(new URL('../../../qa/stage-browser/',import.meta.url)));
const temporary=await mkdtemp(path.join(os.tmpdir(),'stage-shared-browser-'));
const checks=[],errors=[],external=[],artifacts=[],sockets=[];
let chrome,server,browser,origin,page;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const hash=b=>createHash('sha256').update(b).digest('hex');
const check=(ok,name)=>{assert.ok(ok,name);checks.push(name);console.log('PASS '+name);};
class CDP {
 constructor(socket){this.socket=socket;this.pending=new Map();this.seq=0;this.loads=0;
  socket.addEventListener('message',event=>{const m=JSON.parse(String(event.data));
   if(m.id){const p=this.pending.get(m.id);if(p){this.pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}
   if(m.method==='Page.loadEventFired')this.loads++;
   if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);
   if(m.method==='Network.requestWillBeSent'&&/^https?:/.test(m.params.request.url)&&!m.params.request.url.startsWith(origin+'/'))external.push(m.params.request.url);
   if(m.method==='Page.javascriptDialogOpening')void this.send('Page.handleJavaScriptDialog',{accept:false});
  });
 }
 static async connect(url){const socket=new WebSocket(url);await new Promise((r,j)=>{socket.addEventListener('open',r,{once:true});socket.addEventListener('error',j,{once:true});});const c=new CDP(socket);sockets.push(c);return c;}
 send(method,params={}){const id=++this.seq;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(Error('CDP timeout '+method));},12000);this.pending.set(id,{resolve,reject,timer});this.socket.send(JSON.stringify({id,method,params}));});}
 async eval(fn,arg){const r=await this.send('Runtime.evaluate',{expression:`(${fn.toString()})(${JSON.stringify(arg)})`,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
 async wait(fn,arg,label){for(let n=0;n<150;n++){if(await this.eval(fn,arg))return;await delay(40);}throw Error('Timeout '+label);}
 async click(label,selector='button'){
  await this.wait(({label,selector})=>[...document.querySelectorAll(selector)].some(b=>(b.textContent.trim()===label||b.getAttribute('aria-label')===label)&&!b.disabled),{label,selector},label);
  const p=await this.eval(({label,selector})=>{const b=[...document.querySelectorAll(selector)].find(b=>b.textContent.trim()===label||b.getAttribute('aria-label')===label);b.scrollIntoView({block:'center',behavior:'instant'});const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};},{label,selector});
  await this.send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await this.send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});await delay(100);
 }
}
const apiSource=`
import * as store from './app/offline-store';
import {initial} from './app/model';
import * as stage from './stage-assessment/model';
import * as host from './stage-assessment/host-progress';
import {createStageAdapter} from './stage-assessment/adapter';
import * as capability from './app/capability-review-backup';
import * as demo from './public/demos/yesterday/model.mjs';
import * as review from './public/demos/yesterday/review-adapter.mjs';
const pair=()=>({demo:localStorage.getItem(demo.storageKey),review:localStorage.getItem(review.STORAGE_KEY)});
const bare=()=>({...structuredClone(initial),drafts:{note:'Synthetic unrelated original'},scores:{synthetic:7}});
function fixture(){
 let r=stage.emptyRecord('browser-synthetic-only',true),at=Date.now()-12*stage.DAY,n=0;
 const send=command=>{r=stage.append(r,{id:'synthetic-'+(++n),at:++at,command},at);};
 send({type:'learning',skills:['reading'],kind:'complete',note:'synthetic model fixture, not natural observation'});
 for(const phase of ['T1','T2']){if(phase==='T2')at+=stage.DAY;send({type:'open',skill:'reading',phase,unseen:true});const id=stage.project(r).attempts.at(-1).id;send({type:'draft',id,answers:['synthetic original first','','','','','']});send({type:'submit',id});send({type:'review',id,review:{reviewer:{role:'teacher',qualified:true,calibrated:true,external:true,basis:'pure fixture only'},targetElicited:true,disputed:false,secondReview:false,basis:'synthetic fixture only',judgments:Array(6).fill('correct'),criticalReversed:false}});}
 const state=bare();state.drafts[stage.draftKey]=JSON.stringify(r);return state;
}
function observation(raw){const r=JSON.parse(raw),v=stage.project(r);return {events:r.events,attempts:v.attempts,learning:v.learning,restorations:v.restorations,intervals:['T2','T3'].map(p=>{const i=stage.interval(v,'reading',p,Date.now());return {anchor:i.anchor,dueAt:i.dueAt,ready:i.ready,verification:i.verification};})};}
function cap(){const at=Date.now()-86400000;let d=demo.initialState(at);d=demo.showQuestion(d,'new-omar');d=demo.submit(d,'new-omar',1,at+1);d=demo.showQuestion(d,'new-may');d=demo.submit(d,'new-may',2,at+2);d=demo.finishDemo(d,'Synthetic capability restore fixture.',at+3);const p=review.ensurePlan(review.emptySnapshot(),demo.completedDemo(d),at+3).snapshot;localStorage.setItem(demo.storageKey,JSON.stringify(d));localStorage.setItem(review.STORAGE_KEY,JSON.stringify(p));const b=capability.captureCapabilityReviewBackup();if(!b.ok)throw Error(b.message);return b.backup;}
window.qa={store,stage,host,createStageAdapter,capability,fixture,bare,observation,pair,cap};
`;
try {
 await mkdir(out,{recursive:true});await mkdir(path.join(temporary,'downloads'));
 const packages=path.join(studio,'node_modules/.pnpm'),builders=(await readdir(packages)).filter(n=>/^esbuild@\d+\.\d+\.\d+$/.test(n)).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}));
 const {build}=await import(path.join(packages,builders[0],'node_modules/esbuild/lib/main.js'));
 await build({stdin:{contents:apiSource,resolveDir:studio,loader:'ts'},bundle:true,platform:'browser',format:'esm',target:'chrome120',outfile:path.join(temporary,'api.js'),logLevel:'silent'});
 const api=await readFile(path.join(temporary,'api.js'));
 server=createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');const pathname=new URL(req.url,'http://local').pathname;
  if(pathname==='/api.js'){res.setHeader('Content-Type','text/javascript');res.end(api);return;}
  if(pathname==='/seed'){res.setHeader('Content-Type','text/html');res.end('<script type="module" src="/api.js"></script>');return;}
  const mapped=pathname.startsWith('/map/'),dir=path.join(studio,mapped?'map/dist':'static-export');
  const relative=mapped?pathname.slice(5)||'index.html':pathname==='/'?'standalone.html':pathname.slice(1);
  const file=path.resolve(dir,relative);
  try {assert.ok(file.startsWith(dir+'/'));const data=await readFile(file);res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':file.endsWith('.wav')?'audio/wav':'text/html');res.end(data);}catch{res.statusCode=404;res.end('Missing static test asset');}
 });
 await new Promise((r,j)=>{server.once('error',j);server.listen(0,'127.0.0.1',r);});origin=`http://127.0.0.1:${server.address().port}`;
 const profile=path.join(temporary,'fresh-synthetic-profile');
 chrome=spawn(process.env.CHROME_BIN||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-sync','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe']});
 let launchError;chrome.once('error',e=>launchError=e);let active;
 for(let n=0;n<150;n++){if(launchError)throw launchError;try{active=(await readFile(profile+'/DevToolsActivePort','utf8')).trim().split('\n');break;}catch{await delay(40);}}
 assert.ok(active,'Fresh Chrome launch');browser=await CDP.connect(`ws://127.0.0.1:${active[0]}${active[1]}`);
 await browser.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:path.join(temporary,'downloads'),eventsEnabled:true});
 const version=await browser.send('Browser.getVersion');console.log('Browser '+version.product+'; full built StudyApp, fresh profile, unchanged clock');
 async function open(){const {targetId}=await browser.send('Target.createTarget',{url:origin+'/seed'});const targets=await fetch(`http://127.0.0.1:${active[0]}/json/list`).then(r=>r.json());const t=await CDP.connect(targets.find(t=>t.id===targetId).webSocketDebuggerUrl);await t.send('Page.enable');await t.send('Runtime.enable');await t.send('Network.enable');await t.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});await t.wait(()=>!!window.qa,null,'seed API');return t;}
 async function go(t,url){const loads=t.loads,same=await t.eval(target=>location.href===target,origin+url);if(same)await t.send('Page.reload');else {const navigation=await t.send('Page.navigate',{url:origin+url});if(!navigation.loaderId)await t.send('Page.reload');}for(let n=0;n<150&&t.loads===loads;n++)await delay(40);assert.ok(t.loads>loads,'Actual page navigation/reload');await t.eval(()=>import('/api.js'));await t.wait(()=>!!window.qa,null,'API after navigation');}
 const snapshot=async t=>t.eval(async()=>({main:await qa.store.readStateSnapshot(),pair:qa.pair()}));
 async function download(t,name,action){const before=await readdir(path.join(temporary,'downloads'));await action();let filename;for(let n=0;n<150;n++){filename=(await readdir(path.join(temporary,'downloads'))).find(f=>!before.includes(f)&&!f.endsWith('.crdownload'));if(filename)break;await delay(40);}assert.ok(filename,'Native download '+name);const file=path.join(out,name+'.json');await rename(path.join(temporary,'downloads',filename),file);const raw=await readFile(file,'utf8');artifacts.push({file:path.basename(file),bytes:Buffer.byteLength(raw),sha256:hash(raw),nativeDownload:true});return {file,value:JSON.parse(raw),raw};}
 async function file(name,data){const file=path.join(out,name+'.json');await writeFile(file,JSON.stringify(data));return file;}
 async function upload(t,file){const {root}=await t.send('DOM.getDocument');const {nodeId}=await t.send('DOM.querySelector',{nodeId:root.nodeId,selector:'.progress-save-dialog input[type=file]'});assert.ok(nodeId,'Shared ProgressSave native input');await t.send('DOM.setFileInputFiles',{nodeId,files:[file]});await t.wait(()=>document.body.innerText.includes('恢复这份学习进度？'),null,'restore preview');}
 async function apply(t,file){await t.click('进度备份与恢复');await upload(t,file);await t.click('确认替换并恢复');await delay(250);}
 async function shot(t,name){const {data}=await t.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});const bytes=Buffer.from(data,'base64');await writeFile(path.join(out,name+'.png'),bytes);artifacts.push({file:name+'.png',bytes:bytes.length,sha256:hash(bytes)});}
 const envelope=state=>({format:'english-studio-progress',version:1,savedAt:new Date().toISOString(),state});
 page=await open();const second=await open();await page.eval(()=>qa.store.writeState(qa.bare()));await go(page,'/#/stage-assessment');
 await page.wait(()=>!!document.querySelector('select'),null,'real stage');
 await page.eval(()=>{const s=document.querySelector('select');s.value='writing';s.dispatchEvent(new Event('change',{bubbles:true}));});
 await page.eval(()=>{document.querySelector('.stage-check input').click();});await page.click('开始写作 · 学习前基线');
 await page.wait(()=>!!document.querySelector('textarea[aria-label="写作首答"]'),null,'writing task after durable exposure');
 await page.eval(()=>document.querySelector('textarea[aria-label="写作首答"]').focus());await page.send('Input.insertText',{text:'Synthetic saved draft A; refresh preserves original deadline.'});
 await page.wait(async()=>{const s=await qa.store.readState();return JSON.parse(s.drafts[qa.stage.draftKey]).events.some(e=>e.command.type==='draft'&&e.command.answers[0].includes('draft A'));},null,'real draft confirmation');
 await page.wait(()=>document.querySelector('textarea[aria-label="写作首答"]')&&!document.querySelector('textarea[aria-label="写作首答"]').disabled&&document.body.innerText.includes('当前输入已确认保存。'),null,'UI finished confirmed draft');
 const draftBefore=await page.eval(async()=>{const s=await qa.store.readState();return {raw:s.drafts[qa.stage.draftKey],attempt:qa.stage.project(JSON.parse(s.drafts[qa.stage.draftKey])).attempts[0]};});
 await go(page,'/#/stage-assessment');await page.wait(()=>document.querySelector('textarea[aria-label="写作首答"]')?.value.includes('draft A'),null,'real reload restored draft');
 const refreshed=await page.eval(async()=>{const s=await qa.store.readState();return {raw:s.drafts[qa.stage.draftKey],attempt:qa.stage.project(JSON.parse(s.drafts[qa.stage.draftKey])).attempts[0]};});
 check(JSON.stringify(refreshed)===JSON.stringify(draftBefore),'actual reload preserves exact saved raw, draft, exposure and original deadline');await shot(page,'refresh-draft');
 await page.eval(()=>{window.originalPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(){throw new DOMException('Synthetic durable rejection','QuotaExceededError');};document.querySelector('textarea[aria-label="写作首答"]').focus();});
 await page.send('Input.insertText',{text:' Pending draft B must stay on failure.'});
 await page.wait(()=>document.querySelector('.stage-error')?.textContent.includes('Synthetic durable rejection'),null,'native failure surfaced');
 const input=await page.eval(()=>document.querySelector('textarea[aria-label="写作首答"]').value);
 for(const requested of ['#/placement','#/mini-task/mini-n1-01']){
  await page.eval(hash=>{location.hash=hash;},requested);await page.wait(()=>location.hash==='#/stage-assessment'&&!!document.querySelector('[data-stage-host]'),null,'accepted stage route after refused leave');
  check(await page.eval(v=>document.querySelector('textarea[aria-label="写作首答"]').value===v,input),'failed departure to '+requested+' retains mounted stage and current input');
 }
 check(await page.eval(raw=>qa.store.readState().then(s=>s.drafts[qa.stage.draftKey]===raw),draftBefore.raw),'native failed draft save does not change persisted raw');
 const pending=await download(page,'unconfirmed-input',()=>page.click('下载未确认输入'));check(pending.value.counted===false&&pending.value.pendingInput[0]===input,'native failed-input file preserves exact pending input with counted false');await shot(page,'failed-save-leave');
 await page.eval(()=>{IDBObjectStore.prototype.put=originalPut;});await page.click('保存首答草稿');await page.wait(async()=>{const s=await qa.store.readState();return qa.stage.project(JSON.parse(s.drafts[qa.stage.draftKey])).attempts[0].answers[0].includes('Pending draft B');},null,'retry confirmed');
 await page.click('查看今天安排');await page.wait(()=>location.pathname==='/map/'&&!!document.querySelector('.today-practice'),null,'actual online Today redirect after safe leave');
 check(await page.eval(()=>!!document.querySelector('a[href="/#/stage-assessment"]')),'actual Today provides stage resume entry');
 await go(page,'/#/stage-assessment');await page.wait(v=>document.querySelector('textarea[aria-label="写作首答"]')?.value===v,input,'saved retry resumes exact input');
 check(await page.eval(async()=>{const s=await qa.store.readState();const a=qa.stage.project(JSON.parse(s.drafts[qa.stage.draftKey])).attempts[0];return a.submittedAt===undefined&&a.reviews.length===0;}),'draft/retry/Today do not invent a submission or external review');

 // Same matrix at shared StudyWorkspace header AND actual StageHost header.
 // Native download/upload exercises the real ProgressSave handlers in both.
 for(const route of ['/#/progress','/#/stage-assessment']){
  const label=route.endsWith('progress')?'shared':'stage-host';
  await page.eval(()=>{localStorage.clear();return qa.store.writeState(qa.fixture());});await go(page,route);
  await page.wait(()=>!!document.querySelector('.progress-save-button:not(:disabled)'),null,label+' backup ready');await delay(200);
  const original=await snapshot(page),originalRaw=JSON.parse(original.main.raw).drafts['stage-assessment-v1:NCE1-1-6'];
  const observation=await page.eval(raw=>qa.observation(raw),originalRaw);
  const backup=await download(page,label+'-roundtrip',()=>page.click('保存进度'));
  check(backup.value.state.drafts['stage-assessment-v1:NCE1-1-6']===originalRaw,label+' actual progress file carries exact raw');
  await apply(page,backup.file);check(JSON.stringify(await snapshot(page))===JSON.stringify(original),label+' same-location native file roundtrip is exact');
  await go(page,route);const old=structuredClone(backup.value);delete old.state.drafts['stage-assessment-v1:NCE1-1-6'];old.state.drafts.note='Synthetic old-file note';
  await apply(page,await file(label+'-missing-stage',old));
  check(await page.eval(raw=>qa.store.readState().then(s=>s.drafts[qa.stage.draftKey]===raw),originalRaw),label+' missing stage in legacy backup retains current evidence');
  const older=structuredClone(backup.value),record=JSON.parse(originalRaw);older.state.drafts['stage-assessment-v1:NCE1-1-6']=JSON.stringify({...record,events:record.events.slice(0,-1)});
  await go(page,route);await apply(page,await file(label+'-older-stage',older));
  check(await page.eval(raw=>qa.store.readState().then(s=>s.drafts[qa.stage.draftKey]===raw),originalRaw),label+' older stage history retains exact live raw');
  for(const kind of ['divergent','future','schema','unknown','equal-future','equal-schema']){
   const changed=structuredClone(record);if(kind==='divergent')changed.events[2].command.answers[0]='Synthetic fork';if(kind.includes('future'))changed.events.at(-1).at=Date.now()+86400000;if(kind.includes('schema'))changed.version=99;if(kind==='unknown')changed.unsupported=true;
   const bad=structuredClone(backup.value);bad.state.drafts['stage-assessment-v1:NCE1-1-6']=JSON.stringify(changed);
   if(kind.startsWith('equal-'))await page.eval(state=>qa.store.writeState(state),bad.state);else await page.eval(state=>qa.store.writeState(state),backup.value.state);
   await go(page,route);const before=await snapshot(page);await apply(page,await file(label+'-'+kind,bad));
   check(JSON.stringify(await snapshot(page))===JSON.stringify(before),label+' '+kind+' native restore refuses and preserves all stores');
  }
  await page.eval(()=>qa.store.writeState(qa.bare()));await go(page,route);await apply(page,backup.file);
  const imported=await page.eval(async()=>{const s=await qa.store.readState();return qa.observation(s.drafts[qa.stage.draftKey]);});
  check(JSON.stringify(imported.events.slice(0,-1))===JSON.stringify(observation.events)&&imported.events.at(-1).command.type==='restore',label+' new source appends provenance without changing original events');
  check(JSON.stringify(imported.attempts)===JSON.stringify(observation.attempts)&&imported.intervals.every((i,n)=>i.anchor===observation.intervals[n].anchor&&i.dueAt===observation.intervals[n].dueAt&&!i.ready&&i.verification==='restored-time-unverified'),label+' imported first answers and original anchor/due survive; qualification pending');
  await shot(page,label+'-imported');
  // Native capability failure occurs only after main IDB commit; rollback must
  // restore the actual main raw including exact original stage representation.
  const payload=await page.eval(()=>qa.cap());await page.eval(state=>{localStorage.clear();return qa.store.writeState(state);},backup.value.state);await go(page,route);const before=await snapshot(page);
  const incoming=structuredClone(backup.value);incoming.version=2;incoming.capability=payload;incoming.state.drafts.note='Synthetic replacement pending rollback';
  const extended=JSON.parse(incoming.state.drafts['stage-assessment-v1:NCE1-1-6']);extended.events.push({id:'synthetic-unseen-exposure',at:Date.now(),command:{type:'expose',pack:'F'}});incoming.state.drafts['stage-assessment-v1:NCE1-1-6']=JSON.stringify(extended);
  await page.click('进度备份与恢复');await upload(page,await file(label+'-rollback-input',incoming));
  await page.eval(()=>{window.oldSet=Storage.prototype.setItem;window.puts=0;window.oldPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){window.puts++;return oldPut.apply(this,args);};window.denyOnce=true;Storage.prototype.setItem=function(key,value){if(key==='nce-demo-yesterday-v1'&&denyOnce){denyOnce=false;throw new DOMException('Synthetic capability rejection','QuotaExceededError');}return oldSet.call(this,key,value);};});
  await page.click('确认替换并恢复');await delay(250);const putCount=await page.eval(()=>window.puts);await page.eval(()=>{Storage.prototype.setItem=oldSet;IDBObjectStore.prototype.put=oldPut;});
  check(putCount>=2&&JSON.stringify(await snapshot(page))===JSON.stringify(before),label+' actual post-commit failure rolls exact IDB/stage and both namespaces back');
  await shot(page,label+'-rollback');
  // Preview-to-confirm CAS uses the whole persisted State, even if this stage
  // key did not change. Another tab's unrelated draft is protected.
  await go(page,route);await page.click('进度备份与恢复');await upload(page,backup.file);
  await second.eval(async()=>{const s=await qa.store.readState();await qa.store.writeState({...s,drafts:{...s.drafts,note:'Synthetic other-tab edit after preview'}});});
  const concurrent=await snapshot(second);await page.click('确认替换并恢复');await delay(250);
  check(JSON.stringify(await snapshot(page))===JSON.stringify(concurrent),label+' full-State CAS refuses another-tab unrelated edit after preview');
 }
 const denied=await page.eval(async()=>{const before=await qa.store.readStateSnapshot();const a=qa.createStageAdapter({courseVersion:'synthetic',read:()=>qa.store.readState(),commit:qa.host.commitStageDraft});let review=false,delivery=false;try{await a.examiner.recordReview('fake',{reviewer:{role:'teacher',qualified:true,calibrated:true,external:true,basis:'frontend bool'}});}catch{review=true;}try{await a.examiner.recordDelivery('fake',{mode:'live-reader',heard:true,singlePresentation:true,humanChecked:true,note:'frontend bool'});}catch{delivery=true;}return review&&delivery&&!a.examiner.available&&(await qa.store.readStateSnapshot()).raw===before.raw;});
 check(denied,'production adapter rejects frontend qualification bools without any external-review write');
 check(errors.length===0,'no browser JavaScript exceptions');check(external.length===0,'no external requests from test pages');
 const sourcePaths=['app/progress-save.tsx','app/study-app.tsx','stage-assessment/host-progress.ts','stage-assessment/host.tsx','stage-assessment/StageAssessment.tsx'];const sources={};for(const p of sourcePaths)sources[p]=hash(await readFile(path.join(studio,p)));
 const assets={};for(const f of await readdir(path.join(studio,'static-export/assets')))if(f.endsWith('.js'))assets[f]=hash(await readFile(path.join(studio,'static-export/assets',f)));
 await writeFile(path.join(out,'receipt.json'),JSON.stringify({base:'bd5d1f731dc4c2d7e1cf213485c75af903d47fa1',testedHead:execFileSync('git',['rev-parse','HEAD'],{cwd:studio,encoding:'utf8'}).trim(),checkedAt:new Date().toISOString(),browser:version.product,checks,artifacts,sources,assets,errors,externalRequests:external,clockUnchanged:true,freshSyntheticProfile:true,scope:'full built StudyApp; shared and StageHost ProgressSave native files; real IDB full-State CAS/rollback; saved-draft refresh and refused route leave',natural24hVerified:false,natural7dVerified:false,humanSpeechVerified:false,humanReviewVerified:false,deployed:false},null,2)+'\n');
 console.log(checks.length+' actual browser checks passed; receipt '+path.join(out,'receipt.json'));
}catch(error){console.error(error);if(page)console.error(await page.eval(()=>document.body.innerText).catch(()=>''));await writeFile(path.join(out,'failure.json'),JSON.stringify({checks,errors,externalRequests:external,error:String(error)},null,2));throw error;
}finally{if(browser)try{await browser.send('Browser.close');}catch{}for(const s of sockets)s.socket.close();chrome?.kill();if(server)await new Promise(r=>server.close(r));await rm(temporary,{recursive:true,force:true,maxRetries:10,retryDelay:100}).catch(()=>{});}
