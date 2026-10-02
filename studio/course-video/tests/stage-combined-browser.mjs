import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {mkdtemp,mkdir,readFile,readdir,writeFile,rm,rename} from 'node:fs/promises';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Focused final combination only. Full production builds, existing IndexedDB
// writer/Web Locks, native fields/download/file upload, fresh synthetic profile.
// /api.js is a QA-only fixture tool and is never part of either learner build.
const studio=fileURLToPath(new URL('../../',import.meta.url));
const out=path.resolve(process.env.COMBINED_QA_OUT||path.join(studio,'../qa/stage-video/browser'));
const publicAssets=process.env.COMBINED_ASSET_ROOT||'/Users/finnlyu/Projects/english-studio/studio/dist-online';
const temporary=await mkdtemp(path.join(os.tmpdir(),'stage-video-combined-'));
const checks=[],exceptions=[],external=[],requests=[],artifacts=[],sockets=[],driverRetries=[];
const hash=b=>createHash('sha256').update(b).digest('hex');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let chrome,server,browser,origin,page,version,active;

class CDP {
 constructor(socket){
  this.socket=socket;this.pending=new Map();this.seq=0;this.loads=0;
  socket.addEventListener('message',e=>{
   const m=JSON.parse(String(e.data));
   if(m.id){const p=this.pending.get(m.id);if(p){this.pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}
   if(m.method==='Page.loadEventFired')this.loads++;
   if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails);
   if(m.method==='Network.requestWillBeSent'&&/^https?:/.test(m.params.request.url)&&!m.params.request.url.startsWith(origin+'/'))external.push(m.params.request.url);
   if(m.method==='Page.javascriptDialogOpening')void this.send('Page.handleJavaScriptDialog',{accept:false});
  });
 }
 static async connect(url){const ws=new WebSocket(url);await new Promise((r,j)=>{ws.addEventListener('open',r,{once:true});ws.addEventListener('error',j,{once:true});});const c=new CDP(ws);sockets.push(c);return c;}
 send(method,params={}){const id=++this.seq;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(Error('CDP timeout '+method));},12000);this.pending.set(id,{resolve,reject,timer});this.socket.send(JSON.stringify({id,method,params}));});}
 async eval(fn,arg){const r=await this.send('Runtime.evaluate',{expression:`(${fn.toString()})(${JSON.stringify(arg)})`,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
 async wait(fn,arg,label){for(let n=0;n<200;n++){if(await this.eval(fn,arg))return;await delay(50);}throw Error('Timeout '+label);}
 async click(selector,text){
  await this.wait(({selector,text})=>[...document.querySelectorAll(selector)].some(b=>(text===undefined||b.textContent.trim()===text||b.getAttribute('aria-label')===text)&&!b.disabled&&b.getBoundingClientRect().width>0),{selector,text},'click '+(text||selector));
  const p=await this.eval(({selector,text})=>{const b=[...document.querySelectorAll(selector)].find(b=>(text===undefined||b.textContent.trim()===text||b.getAttribute('aria-label')===text)&&!b.disabled&&b.getBoundingClientRect().width>0);b.scrollIntoView({block:'center',behavior:'instant'});const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};},{selector,text});
  await this.send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await this.send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});await delay(120);
 }
 async type(selector,text){
  for(let attempt=0;attempt<5;attempt++){await this.click(selector);await delay(90);if(await this.eval(sel=>document.activeElement===document.querySelector(sel),selector))break;driverRetries.push({kind:'native focus settled after dialog/heading autofocus',selector,attempt});if(attempt===4)throw Error('Native field focus did not settle');}
  await this.send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:process.platform==='darwin'?4:2,commands:['selectAll']});
  await this.send('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:process.platform==='darwin'?4:2});
  await this.send('Input.insertText',{text});await this.wait(({selector,text})=>document.querySelector(selector)?.value===text,{selector,text},'native text value');
 }
}
const apiSource=`
import * as store from './app/offline-store';
import {initial,validateState} from './app/model';
import * as stage from './stage-assessment/model';
import * as stageHost from './stage-assessment/host-progress';
import {getCourseBinding} from './course-loop/registry.mjs';
import {parseManifest} from './course-video/manifest';
import {courseVideoManifest} from './course-video/sources';
function fixture(){
 let r=stage.emptyRecord('combined-synthetic-fixture-only',true),at=Date.now()-12*stage.DAY,n=0;
 const send=command=>{r=stage.append(r,{id:'synthetic-'+(++n),at:++at,command},at)};
 send({type:'learning',skills:['reading'],kind:'complete',note:'pure fixture, not natural observation'});
 for(const phase of ['T1','T2']){
  if(phase==='T2')at+=stage.DAY;
  send({type:'open',skill:'reading',phase,unseen:true});const id=stage.project(r).attempts.at(-1).id;
  send({type:'draft',id,answers:['Synthetic original stage first answer','','','','','']});send({type:'submit',id});
  send({type:'review',id,review:{reviewer:{role:'teacher',qualified:true,calibrated:true,external:true,basis:'QA fixture only; no real external review'},targetElicited:true,disputed:false,secondReview:false,basis:'QA fixture only',judgments:Array(6).fill('correct'),criticalReversed:false}});
 }
 const s={...structuredClone(initial),completed:[1],scores:{synthetic:7},attempts:7,correct:3,nceLast:{book:'NCE3',lesson:1},nce:{'NCE3-1':{title:'Synthetic old NCE entry',text:'Last week, I visited a small museum.\\nIt was quiet and I liked it.',notes:'Synthetic original old NCE personal notes',steps:['listen']}},drafts:{unrelated:'Synthetic unrelated raw byte sentinel'}};
 s.drafts[stage.draftKey]=JSON.stringify(r);if(!validateState(s))throw Error('Invalid synthetic fixture');return s;
}
function stageObservation(raw){const v=stage.project(JSON.parse(raw));return {raw,attempts:v.attempts,intervals:['T2','T3'].map(p=>{const i=stage.interval(v,'reading',p,Date.now());return {anchor:i.anchor,dueAt:i.dueAt,verification:i.verification}})}}
window.qa={store,stage,stageHost,fixture,stageObservation,getCourseBinding,manifest:courseVideoManifest,parseManifest};
`;
async function check(name,fn){try{const detail=await fn();checks.push({name,ok:true,detail});console.log('PASS '+name);}catch(e){checks.push({name,ok:false,error:String(e)});throw e;}}
async function go(url){const before=page.loads;const same=await page.eval(href=>location.href===href,origin+url);if(same)await page.send('Page.reload');else await page.send('Page.navigate',{url:origin+url});for(let n=0;n<200&&page.loads===before;n++)await delay(50);assert(page.loads>before,'real document loaded');await page.eval(()=>import('/api.js'));}
const snapshot=()=>page.eval(()=>qa.store.readState());
async function noteReady(){await page.wait(()=>!!document.querySelector('.course-video textarea')&&!document.querySelector('.course-video textarea').disabled,null,'ready real video notes');}
async function grammar(){await page.eval(()=>{location.hash='#/nce/NCE3/1?tab=grammar'});await noteReady();}
async function shot(name){const {data}=await page.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});const raw=Buffer.from(data,'base64');await writeFile(path.join(out,name+'.png'),raw);artifacts.push({file:name+'.png',bytes:raw.length,sha256:hash(raw)});}
async function download(name,action){const before=new Set(await readdir(path.join(temporary,'downloads')));await action();let filename;for(let n=0;n<200;n++){filename=(await readdir(path.join(temporary,'downloads'))).find(f=>!before.has(f)&&!f.endsWith('.crdownload'));if(filename)break;await delay(50);}assert(filename,'native downloaded file');const raw=await readFile(path.join(temporary,'downloads',filename));const file=path.join(out,name+'.json');await rename(path.join(temporary,'downloads',filename),file);artifacts.push({file:name+'.json',nativeDownload:true,bytes:raw.length,sha256:hash(raw)});return {file,raw,value:JSON.parse(raw)};}
const button=(text,selector='button')=>page.click(selector,text);
const noteKey='course-video-notes-v1:nce3-1:NCE3:1:BV1zY4y187cK:2',learningKey='learning-v1-NCE3-1';
const finalNote='Synthetic unsaved video draft: exact text retained through three refused routes, then retried.';
let stageBefore,initialLearning,originalNotes,backup;
try{
 await mkdir(out,{recursive:true});await mkdir(path.join(temporary,'downloads'));
 const packages=path.join(studio,'node_modules/.pnpm'),builders=(await readdir(packages)).filter(n=>/^esbuild@\d+\.\d+\.\d+$/.test(n)).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}));
 const {build}=await import(path.join(packages,builders[0],'node_modules/esbuild/lib/main.js'));
 await build({stdin:{contents:apiSource,resolveDir:studio,loader:'ts'},bundle:true,format:'esm',platform:'browser',target:'chrome120',outfile:path.join(temporary,'api.js'),logLevel:'silent'});
 const api=await readFile(path.join(temporary,'api.js'));
 server=createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');const pathname=new URL(req.url,'http://local').pathname;
  if(pathname==='/api.js'){res.setHeader('Content-Type','text/javascript');res.end(api);return;}
  if(pathname==='/seed'){res.setHeader('Content-Type','text/html');res.end('<script type="module" src="/api.js"></script>');return;}
  let dir,relative;
  if(/^\/(language|materials|illustrations|comics|lesson-pages)\//.test(pathname)){dir=publicAssets;relative=pathname.slice(1);}
  else if(pathname.startsWith('/map/')){dir=path.join(studio,'map/dist');relative=pathname.slice(5)||'index.html';}
  else{dir=path.join(studio,'static-export');relative=pathname==='/'?'standalone.html':pathname.slice(1);}
  const file=path.resolve(dir,relative);
  try{assert(file.startsWith(dir+'/'));const raw=await readFile(file);requests.push({pathname,bytes:raw.length,sha256:hash(raw),publicAsset:dir===publicAssets});const ext=path.extname(file),mime={'.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.wav':'audio/wav','.bin':'application/octet-stream'}[ext]||'text/html';res.setHeader('Content-Type',mime);res.end(raw);}catch{res.statusCode=404;res.end('Missing static QA asset');}
 });
 await new Promise((r,j)=>{server.once('error',j);server.listen(0,'127.0.0.1',r)});origin='http://127.0.0.1:'+server.address().port;
 const profile=path.join(temporary,'fresh-synthetic-profile');
 chrome=spawn(process.env.CHROME_BIN||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-sync','--host-resolver-rules=MAP *.bilibili.com ~NOTFOUND','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe']});
 let launchError;chrome.once('error',e=>launchError=e);for(let n=0;n<200;n++){if(launchError)throw launchError;try{active=(await readFile(profile+'/DevToolsActivePort','utf8')).trim().split('\n');break;}catch{await delay(50);}}
 assert(active,'fresh isolated Chrome');browser=await CDP.connect(`ws://127.0.0.1:${active[0]}${active[1]}`);version=await browser.send('Browser.getVersion');console.log('Browser '+version.product+'; full StudyApp; fresh profile; unchanged clock');
 await browser.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:path.join(temporary,'downloads'),eventsEnabled:true});
 const {targetId}=await browser.send('Target.createTarget',{url:origin+'/seed'}),tabs=await fetch('http://127.0.0.1:'+active[0]+'/json/list').then(r=>r.json());page=await CDP.connect(tabs.find(t=>t.id===targetId).webSocketDebuggerUrl);
 for(const method of ['Page.enable','Runtime.enable','Network.enable'])await page.send(method);
 await page.send('Network.setBlockedURLs',{urls:['*://*.bilibili.com/*']});await page.send('Emulation.setDeviceMetricsOverride',{width:1280,height:920,deviceScaleFactor:1,mobile:false});
 await page.wait(()=>!!window.qa,null,'QA fixture loaded');await page.eval(()=>qa.store.writeState(qa.fixture()));
 stageBefore=await page.eval(async()=>{const s=await qa.store.readState();return qa.stageObservation(s.drafts[qa.stage.draftKey]);});
 await go('/#/nce/NCE3/1?tab=notes');
 await check('normal older NCE notes entry restores and natively saves existing personal notes',async()=>{
  await page.wait(()=>document.querySelector('.expression-free-notes textarea')?.value==='Synthetic original old NCE personal notes',null,'original personal note');
  originalNotes='Synthetic original old NCE personal notes; native edit before video.';await page.type('.expression-free-notes textarea',originalNotes);
  await page.wait(async value=>(await qa.store.readState()).nce?.['NCE3-1']?.notes===value,originalNotes,'confirmed old NCE notes');
  assert.equal(await page.eval(()=>document.querySelectorAll('.course-video textarea,iframe').length),0);
 });
 await button('2 讲解','button[role=tab]');await noteReady();await button('3 练习','button[role=tab]');await page.wait(()=>!!document.querySelector('.learning-practice'),null,'actual independent practice');
 await button('合上示范，自己试','.learning-practice button');await page.type('.learning-stage textarea','Synthetic unsubmitted original classic answer');
 await page.wait(async key=>{const s=await qa.store.readState(),v=JSON.parse(s.drafts[key]||'null');return v?.phase==='independent'&&v.goals[v.goal].answer==='Synthetic unsubmitted original classic answer';},learningKey,'original independent first answer saved');
 initialLearning=JSON.parse((await snapshot()).drafts[learningKey]);assert.equal(initialLearning.goals[initialLearning.goal].hinted,false);
 await button('2 讲解','button[role=tab]');await noteReady();
 await check('actual failed video save keeps text and blocks mini, placement and stage before unmount',async()=>{
  await page.eval(()=>{window.originalPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){if(this.name==='state')throw new DOMException('Synthetic combined durable rejection','QuotaExceededError');return originalPut.apply(this,args);};});
  await page.type('.course-video textarea',finalNote);await page.wait(()=>document.querySelector('.course-video [role=alert]')?.textContent.includes('Synthetic combined'),null,'native IDB failure surfaced');
  for(const target of ['#/mini-task/mini-n1-01','#/placement','#/stage-assessment']){
   await page.eval(hash=>{location.hash=hash},target);await page.wait(()=>location.hash==='#/nce/NCE3/1?tab=grammar'&&!!document.querySelector('.course-video textarea'),null,'retained accepted route '+target);
   assert.equal(await page.eval(()=>document.querySelector('.course-video textarea').value),finalNote);
   assert.equal(await page.eval(()=>document.querySelectorAll('[data-mini-host],[data-placement-host],[data-stage-host]').length),0);
  }
  const s=await snapshot();assert.equal(s.drafts[noteKey],undefined);assert.equal(s.nce['NCE3-1'].notes,originalNotes);assert.equal(s.drafts[qaStageKey()],stageBefore.raw);
  assert.equal(await page.eval(()=>document.querySelectorAll('.course-video a[href*="/video/"],.course-video iframe').length),0);await shot('failed-three-routes');
 });
 await check('restored writer and native retry confirm the exact retained draft and allow source preparation',async()=>{
  await page.eval(()=>{IDBObjectStore.prototype.put=originalPut;delete window.originalPut;});await button('重试保存笔记','.course-video button');
  await page.wait(async key=>{const s=await qa.store.readState();return s.drafts[key]&&JSON.parse(s.drafts[key]).text===document.querySelector('.course-video textarea').value&&!document.querySelector('.course-video [role=alert]');},noteKey,'native retry confirmed');
  await page.click('.course-video [data-prepare-original]');await page.wait(()=>!!document.querySelector('.course-video a[href*="/video/"]'),null,'confirmed original link after retry');
  const s=await snapshot(),notes=JSON.parse(s.drafts[noteKey]),learning=JSON.parse(s.drafts[learningKey]);assert.equal(notes.text,finalNote);assert.equal(notes.access.length,1);assert.equal(notes.access[0].kind,'open-link');assert.equal(notes.access[0].sourceUrl,'https://www.bilibili.com/video/BV1zY4y187cK/?p=2');
  assert.equal(learning.goals[learning.goal].hinted,true);assert.deepEqual(learning.goals[learning.goal].attempts,initialLearning.goals[initialLearning.goal].attempts);assert.equal(learning.goals[learning.goal].answer,initialLearning.goals[initialLearning.goal].answer);
  assert.equal(s.attempts,7);assert.equal(s.correct,3);assert.equal(s.nce['NCE3-1'].notes,originalNotes);await shot('retry-confirmed-original');
 });
 for(const [target,selector] of [['#/mini-task/mini-n1-01','[data-mini-host]'],['#/placement','[data-placement-host] .placement'],['#/stage-assessment','[data-stage-host]']]){
  await check('confirmed NCE video notes enter '+target+' and return with original raw and due unchanged',async()=>{
   const before=await snapshot();await page.eval(hash=>{location.hash=hash},target);await page.wait(sel=>!!document.querySelector(sel),selector,'actual accepted host '+target);
   assert.equal(await page.eval(()=>location.hash),target);await page.eval(()=>{location.hash='#/nce/NCE3/1?tab=notes'});
   await page.wait(text=>document.querySelector('.expression-free-notes textarea')?.value===text,originalNotes,'returned old NCE notes');await button('2 讲解','button[role=tab]');await noteReady();
   assert.equal(await page.eval(()=>document.querySelector('.course-video textarea').value),finalNote);const after=await snapshot();assert.equal(after.drafts[noteKey],before.drafts[noteKey]);assert.equal(after.drafts[learningKey],before.drafts[learningKey]);
   const observation=await page.eval(async()=>{const s=await qa.store.readState();return qa.stageObservation(s.drafts[qa.stage.draftKey]);});assert.deepEqual(observation,stageBefore);
  });
 }
 await check('native reload restores confirmed notes and preserves original stage anchor and due',async()=>{
  const before=await snapshot();await go('/#/nce/NCE3/1?tab=grammar');await noteReady();assert.equal(await page.eval(()=>document.querySelector('.course-video textarea').value),finalNote);
  const after=await snapshot();assert.equal(after.nce['NCE3-1'].notes,originalNotes);assert.equal(after.drafts[noteKey],before.drafts[noteKey]);assert.equal(after.drafts[learningKey],before.drafts[learningKey]);
  assert.deepEqual(await page.eval(async()=>{const s=await qa.store.readState();return qa.stageObservation(s.drafts[qa.stage.draftKey]);}),stageBefore);
 });
 await check('same-page ProgressSave natively exports current notes, original learning, unrelated data and exact stage raw',async()=>{
  const before=await snapshot();backup=await download('same-page-progress',async()=>{await page.click('button[aria-label="进度备份与恢复"]');await button('保存进度到本地','[role=dialog] button');});
  const s=backup.value.state;assert.equal(s.nce['NCE3-1'].notes,originalNotes);assert.equal(s.drafts[noteKey],before.drafts[noteKey]);assert.equal(s.drafts[learningKey],before.drafts[learningKey]);assert.equal(s.drafts[qaStageKey()],stageBefore.raw);assert.equal(s.drafts.unrelated,before.drafts.unrelated);assert.equal(s.attempts,7);assert.equal(s.correct,3);assert.deepEqual(s.completed,[1]);
  await page.click('.progress-save-dialog [data-slot=dialog-close]');await page.wait(()=>!document.querySelector('[role=dialog]'),null,'native dialog closed');return {sha256:hash(backup.raw),nativeDownload:true};
 });
 await check('same-page native backup restore preserves exact stage raw/due and confirmed video/classic notes',async()=>{
  await page.type('.course-video textarea','Synthetic newer note overwritten by intentional same-page restore');await page.wait(async key=>JSON.parse((await qa.store.readState()).drafts[key]).text.startsWith('Synthetic newer'),noteKey,'newer draft confirmed');
  await page.click('button[aria-label="进度备份与恢复"]');await button('从文件恢复进度','[role=dialog] button');const {root}=await page.send('DOM.getDocument');const {nodeId}=await page.send('DOM.querySelector',{nodeId:root.nodeId,selector:'.progress-save-dialog input[type=file]'});assert(nodeId,'real native file input');await page.send('DOM.setFileInputFiles',{nodeId,files:[backup.file]});await page.wait(()=>document.body.innerText.includes('恢复这份学习进度？'),null,'restore preview');await button('确认替换并恢复','[role=dialog] button');
  await page.wait(async key=>JSON.parse((await qa.store.readState()).drafts[key]).text===document.querySelector('.course-video textarea')?.value&&document.querySelector('.course-video textarea')?.value.startsWith('Synthetic unsaved'),noteKey,'native restore notification refresh');
  const s=await snapshot();assert.equal(s.drafts[noteKey],backup.value.state.drafts[noteKey]);assert.equal(s.drafts[learningKey],backup.value.state.drafts[learningKey]);assert.equal(s.nce['NCE3-1'].notes,originalNotes);assert.equal(s.drafts[qaStageKey()],stageBefore.raw);assert.equal(s.drafts.unrelated,backup.value.state.drafts.unrelated);
  assert.deepEqual(await page.eval(async()=>{const s=await qa.store.readState();return qa.stageObservation(s.drafts[qa.stage.draftKey]);}),stageBefore);await shot('same-page-restored');
 });
 await go('/map/#/learn/nce1-1?access=1');
 await check('normal course diagnostic hides video and notes before learning entry',async()=>{
  await page.wait(()=>document.querySelector('.course-loop')?.dataset.phase==='diagnostic',null,'real course diagnostic');assert.equal(await page.eval(()=>document.querySelectorAll('.course-video textarea,.course-video iframe').length),0);
 });
 for(let i=0;i<3;i++){await button('暂时不会，先记下','.course-loop button');await button(i===2?'看针对性讲解':'下一题','.course-loop button');}
 await page.wait(()=>document.querySelector('.course-loop')?.dataset.phase==='learn',null,'real targeted learning');await noteReady();
 await check('actual video access saves semantic video event without text event or extra test credit',async()=>{
  const before=await snapshot(),binding=await page.eval(()=>({key:qa.getCourseBinding('nce1-1').key}));
  const old=JSON.parse(before.drafts[binding.key]);await page.click('.course-video [data-prepare-original]');await page.wait(()=>!!document.querySelector('.course-video a[href*="/video/"]'),null,'learning source prepared');
  const after=await snapshot(),fresh=JSON.parse(after.drafts[binding.key]),events=fresh.events.slice(old.events.length);assert(events.some(e=>e.type==='source'&&e.source==='video'));assert(!events.some(e=>e.type==='source'&&e.source==='text'));
  assert.equal(after.attempts,before.attempts);assert.equal(after.correct,before.correct);assert.equal(after.drafts[qaStageKey()],stageBefore.raw);return {appendedSourceEvents:events.filter(e=>e.type==='source')};
 });
 await button('跟着换一句','.course-loop button');
 for(let i=0;i<3;i++){const q=await page.eval(async()=>{const b=qa.getCourseBinding('nce1-1'),s=await qa.store.readState();return b.model.currentQuestion(b.model.restore(s.drafts[b.key]).view)});if(q.kind==='choice')await button(q.accepted[0],'.course-loop-choices button');else await page.type('.course-loop-card input',q.accepted[0]);await button('提交本题','.course-loop button');await button(i===2?'收起示范，自己试':'下一题','.course-loop button');}
 await check('normal independent test phase hides video notes and original source link',async()=>{
  await page.wait(()=>document.querySelector('.course-loop')?.dataset.phase==='independent',null,'independent test phase');assert.equal(await page.eval(()=>document.querySelectorAll('.course-video textarea,.course-video iframe,.course-video a[href*="/video/"]').length),0);
 });
 await check('catalog remains 703 verified parts, 287 lessons, unchanged summary-null source bytes',async()=>{
  const manifest=await page.eval(()=>{const m=qa.parseManifest(qa.manifest);return {sources:m.sources.length,lessons:new Set(m.sources.flatMap(s=>s.lessons.map(l=>s.book+':'+l))).size,summaryCount:m.sources.filter(s=>s.summary!=null).length}});
  assert.deepEqual(manifest,{sources:703,lessons:287,summaryCount:0});assert.equal(hash(await readFile(path.join(studio,'course-video/sources.json'))),'12c318c867e20cf61f7e6c2beb89f75be1047c6d744611c4b6dcb6100a9f5ef4');return manifest;
 });
 assert.equal(exceptions.length,0,'application Runtime exceptions');assert.equal(external.length,0,'no external page requests');
}catch(error){console.error(error);process.exitCode=1;if(page){await shot('failure').catch(()=>{});await writeFile(path.join(out,'failure-dom.txt'),await page.eval(()=>document.body.innerText).catch(()=>''));}}
finally{
 const sourceFiles=['app/study-app.tsx','app/nce.tsx','app/course-loop-ui.tsx','course-loop/model.mjs','course-loop/host-contract.d.ts','map/learning.tsx','course-video/ui.tsx','course-video/controller.ts','course-video/sources.json','stage-assessment/host.tsx','stage-assessment/host-progress.ts','app/offline-store.ts'];
 const hashes=Object.fromEntries(await Promise.all(sourceFiles.map(async p=>[p,hash(await readFile(path.join(studio,p)))])));
 const report={scope:'focused actual stage + video accepted route and normal NCE combination; fresh synthetic profile; native UI/storage/files; unchanged clock',stageBase:'cccefc12c3f40f322bcbbd991d829f0ad17d6082',candidate:execFileSync('git',['rev-parse','HEAD'],{cwd:studio,encoding:'utf8'}).trim(),browser:version?.product,origin,checks,passed:checks.filter(c=>c.ok).length,failed:checks.filter(c=>!c.ok).length,driverExitedWithError:!!process.exitCode,RuntimeExceptions:exceptions,externalRequests:external,requests,artifacts,sourceSha256:hashes,driverRetries,stageBefore,unverified:['published origin','native right-click context menu','actual Bilibili playback/audio','natural 24h/7d retention','human voice or external human review','physical phone','video content summaries','learning gain'],noProfilesOrRealLearningRecordsCopied:true,fixtureApiInLearnerBuild:false};
 await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 for(const c of sockets)c.socket.close();if(chrome){const exited=new Promise(r=>chrome.exitCode===null?chrome.once('exit',r):r());chrome.kill('SIGTERM');await exited;}
 if(server)await new Promise(r=>server.close(r));await rm(temporary,{recursive:true,force:true,maxRetries:5,retryDelay:100});console.log(JSON.stringify({out,passed:report.passed,failed:report.failed,driverExitedWithError:report.driverExitedWithError}));
}
function qaStageKey(){return 'stage-assessment-v1:NCE1-1-6';}
