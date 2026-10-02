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
const out=fileURLToPath(new URL('../docs/verification/r47-all-writers/',import.meta.url));
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
import {nodeById,questionsFor} from './map/content';
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
window.qa={store,map,nodeById,questionsFor,review,fixture,capability,pair,setPair:(d,p)=>{localStorage.setItem(demo.storageKey,JSON.stringify(d));localStorage.setItem(review.STORAGE_KEY,JSON.stringify(p))},clearPair:()=>{localStorage.removeItem(demo.storageKey);localStorage.removeItem(review.STORAGE_KEY)}};
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

 const a=await open(),b=await open();await apiOn(a);await apiOn(b);
 const key=await evaluate(a,'qa.map.storageKey'),lock='english-studio-map-restore:'+key;
 const initial=await evaluate(a,"({...qa.map.emptyProgress(),minimum:'6',access:{all:true,nodes:[]},lastNode:'nce1-13',records:{'nce1-13':{...qa.map.emptyRecord(),phase:'learn',studyStep:2,practice:{...qa.map.emptyPractice(),step:2},draft:{note:'Synthetic expression original'}}}})");
 await evaluate(a,`localStorage.setItem(qa.map.storageKey,JSON.stringify(${JSON.stringify({...initial,minimum:'5.5'})}))`);await go(a,'/map/');await evaluate(a,"document.querySelector('.map-settings summary').click()");
 const candidate=await downloaded('real-map-candidate',()=>click(a,'导出地图进度'));
 async function seed(value,url='/map/#/learn/nce1-13'){
  await go(b,'/seed');await evaluate(b,`localStorage.setItem(qa.map.storageKey,JSON.stringify(${JSON.stringify(value)}))`);await go(b,url);await delay(200);await go(a,'/map/');await delay(100);
 }
 async function instrument(tab){await evaluate(tab,`window.trace=[];window.nativeSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===${JSON.stringify(key)})trace.push({kind:'write',value:JSON.parse(v)});return nativeSet.call(this,k,v)};window.nativeRequest=navigator.locks.request.bind(navigator.locks);navigator.locks.request=function(name,...rest){trace.push({kind:'lock',name});return nativeRequest(name,...rest)}`)}
 async function hold(){await evaluate(b,`void nativeRequest(${JSON.stringify(lock)},{mode:'exclusive'},async()=>{window.held=true;await new Promise(resolve=>window.release=resolve)})`);await until(()=>evaluate(b,'!!window.held'),'Holder not acquired')}
 async function release(){await evaluate(b,'release();held=false');await delay(250)}
 async function edit(tab,selector,value){await evaluate(tab,`{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing input');Object.getOwnPropertyDescriptor(e instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}))}`);await delay(70)}
 async function raw(){return evaluate(a,'localStorage.getItem(qa.map.storageKey)')}
 async function traces(){return [...await evaluate(a,'trace'),...await evaluate(b,'trace')]}
 // Both actual production settings saves and actual downloaded-file restore
 // confirmations enter a lock held by a third request, in each FIFO ordering.
 for(const first of ['restore','ordinary']){
  await seed(initial,'/map/');await upload(a,candidate.file);for(const tab of [a,b])await instrument(tab);await evaluate(b,"document.querySelector('.map-settings summary').click()");await hold();const before=await raw();
  const restore=()=>click(a,'备份当前进度并恢复'),ordinary=()=>click(b,'恢复按路线解锁');
  if(first==='restore'){await restore();await ordinary()}else{await ordinary();await restore()}
  const waiting=await traces();check(waiting.filter(x=>x.kind==='lock'&&x.name===lock).length===2,first+' order: ordinary save and restore request the identical native lock');check(await raw()===before,first+' order: neither writer commits before lock acquisition');
  check(await evaluate(a,"document.querySelector('.restore-dialog button.primary').disabled"),first+' order: restore waits without a premature success');await release();
  const after=JSON.parse(await raw()),done=await traces();check(done.filter(x=>x.kind==='write').length===1,first+' order: exactly one native write from competing snapshots');
  check(first==='restore'?after.minimum==='5.5'&&after.access.all:after.minimum==='6'&&!after.access.all,first+' order: first lock holder wins without mixed state');
  check(await evaluate(first==='restore'?b:a,first==='restore'?"document.body.textContent.includes('尚未保存')":"document.querySelector('.restore-dialog [role=alert]')?.textContent.includes('重新核对')"),first+' order: stale loser displays rejection');await shot(first==='restore'?b:a,first+'-wins');
 }
 // Restore races against real expression autosave. Preserve the local text and
 // prevent step/navigation on failed save; explicit retry confirms it later.
 await seed(initial);await upload(a,candidate.file);for(const tab of [a,b])await instrument(tab);await hold();await click(a,'备份当前进度并恢复');await edit(b,'.expression-practice textarea','Synthetic local expression must survive a competing restore.');
 const beforeExpression=await raw();check(await evaluate(b,"document.querySelector('.expression-practice textarea').value.includes('must survive')"),'expression: delayed write keeps typed local text');await release();
 check((await traces()).filter(x=>x.kind==='write').length===1,'expression and restore: stale autosave cannot overwrite the winner');
 check(await evaluate(b,"document.querySelector('.expression-practice textarea').value.includes('must survive')"),'expression: losing autosave retains local input after foreign state publication');
 check(await evaluate(b,"document.querySelector('.expression-practice [role=alert]').textContent.includes('尚未保存')"),'expression: failed asynchronous save shows no saved claim');
 await click(b,'重试保存本页表达');check(JSON.parse(await raw()).records['nce1-13'].draft.note.includes('must survive'),'expression: explicit retry commits the retained input');await shot(b,'expression-retry');
 // Multiple edits from one page queue under one lock and retain the last value.
 await seed(initial);await instrument(b);await hold();for(const value of ['Synthetic rapid 1','Synthetic rapid 2','Synthetic rapid FINAL'])await edit(b,'.expression-practice textarea',value);await release();
 check(JSON.parse(await raw()).records['nce1-13'].draft.note==='Synthetic rapid FINAL','same-page queued asynchronous writes retain the newest input');check(await evaluate(b,"document.querySelector('.expression-practice textarea').value==='Synthetic rapid FINAL'"),'same-page UI is not reset to earlier queued input');
 // An edit made while a step save is waiting must survive its older completion.
 await seed(initial);await instrument(b);await hold();await click(b,'← 回到上一步表达练习');await edit(b,'.expression-practice textarea','Synthetic newer text during delayed step save');await release();
 check(await evaluate(b,"document.querySelector('.expression-practice textarea')?.value==='Synthetic newer text during delayed step save'"),'expression: older step completion cannot clear a newer typed draft');check(JSON.parse(await raw()).records['nce1-13'].draft.note==='Synthetic newer text during delayed step save','expression: queued newer draft persists after delayed step completion');
 // Native quota failure and absent lock support never clear expression or move.
 for(const failure of ['quota','no-lock']){
  await seed(initial);const before=await raw();
  await evaluate(b,failure==='quota'?`window.oldSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===${JSON.stringify(key)})throw new DOMException('Synthetic quota','QuotaExceededError');return oldSet.call(this,k,v)}`:"Object.defineProperty(navigator,'locks',{configurable:true,value:undefined})");
  await edit(b,'.expression-practice textarea','Synthetic '+failure+' retained');await click(b,'收起资料，开始检验');
  await evaluate(b,"document.querySelector('.focus-header .back-button').click()");await delay(150);check(await evaluate(b,"location.hash==='#/learn/nce1-13'&&!!document.querySelector('.expression-practice textarea')"),failure+': native back navigation refuses to unload failed input');await evaluate(b,"document.querySelector('.focus-steps button').click()");await delay(100);check(await raw()===before&&await evaluate(b,"!!document.querySelector('.expression-practice textarea')"),failure+': step navigation refuses to discard failed input');check(await raw()===before,failure+': failed expression autosave and transition preserve stored bytes');check(await evaluate(b,`document.querySelector('.expression-practice textarea')?.value==='Synthetic ${failure} retained'`),failure+': input and current step remain present');
  await evaluate(b,failure==='quota'?'Storage.prototype.setItem=oldSet':'delete navigator.locks');await click(b,'重试保存本页表达');await click(b,'收起资料，开始检验');check(await evaluate(b,'!!document.querySelector(".focus-quiz")'),failure+': transition happens after confirmed retry');
 }
 // Full production chapter and evidence forms, native quota failures, and
 // delayed submission while holding the same lock (no mocked Save function).
 const evidence={date:new Date().toISOString().slice(0,10),material:'Synthetic unseen Academic paper',work:'Synthetic original answers and recording with concrete supporting details.',reviewer:'Synthetic fixture teacher',feedback:'The reviewer checked specific corrections and the new retest.',criteria:[true,true,true,true],unseen:true,timed:true,correct:'30',total:'40',dimensions:Array(4).fill('Specific evidence and actionable correction.'),revision:'Synthetic paper B retest corrected the same issue.',scores:['6.5','6.5','6.5','6.5'],kind:'academic',reference:'Synthetic answer key conversion table'};
 const project={text:'I am a student. This is my book. I read every day. '.repeat(30),recording:'Synthetic-project.wav',reviewer:'Synthetic fixture teacher',feedback:'The reviewer checked specific tense corrections and the new retest.',criteria:[true,true,true,true],at:Date.now()};
 for(const kind of ['mock','project']){
  const id=kind==='mock'?'mock-one':'chapter-1';const value=await evaluate(b,`({...qa.map.emptyProgress(),minimum:'6',access:{all:true,nodes:[]},lastNode:${JSON.stringify(id)},records:{[${JSON.stringify(id)}]:{...qa.map.emptyRecord(),draft:${JSON.stringify(kind==='mock'?evidence:project)}}}})`);
  await seed(value,'/map/#/learn/'+id);if(kind==='project')await click(b,'章节作品与评阅');await instrument(b);const selector=kind==='mock'?'.evidence-form textarea':'.chapter-project textarea',text=kind==='mock'?evidence.work:project.text;
  const before=await raw();await evaluate(b,`window.oldSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===${JSON.stringify(key)})throw new DOMException('Synthetic quota','QuotaExceededError');return oldSet.call(this,k,v)}`);await edit(b,selector,text+' Synthetic failed draft preserved.');await evaluate(b,"document.querySelector('form').requestSubmit()");await delay(150);
  check(await raw()===before,kind+': native failure leaves original bytes unchanged');check(await evaluate(b,`document.querySelector(${JSON.stringify(selector)}).value.includes('failed draft preserved')`),kind+': async false retains editable local draft');check(!await evaluate(b,"!!document.querySelector('.saved-message')||[...document.querySelectorAll('[role=status]')].some(x=>x.textContent.includes('作品记录已保存'))"),kind+': async false has no successful receipt');
  await evaluate(b,'Storage.prototype.setItem=oldSet');await hold();await evaluate(b,"document.querySelector('form').requestSubmit()");await delay(100);check(await raw()===before,kind+': delayed retry has no premature native commit');await release();
  check(JSON.parse(await raw()).records[id][kind==='mock'?'mock':'project'][kind==='mock'?'work':'text'].includes('failed draft preserved'),kind+': awaited true commits the retained input');check(await evaluate(b,"!!document.querySelector('.saved-message')||[...document.querySelectorAll('[role=status]')].some(x=>x.textContent.includes('作品记录已保存'))"),kind+': only awaited true displays the successful receipt');check((await evaluate(b,'trace')).filter(x=>x.kind==='lock').every(x=>x.name===lock),kind+': all real form writer calls use the shared restore lock');await shot(b,kind+'-async-retry');
 }
 // Quiz answer is local until confirmed; failed choice must remain visible.
 const quiz=await evaluate(b,"({...qa.map.emptyProgress(),access:{all:true,nodes:[]},records:{letters:{...qa.map.emptyRecord(),phase:'challenge',studyStep:0}}})");await seed(quiz,'/map/#/learn/letters');const quizBefore=await raw();await evaluate(b,`window.oldSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===${JSON.stringify(key)})throw new DOMException('Synthetic quota','QuotaExceededError');return oldSet.call(this,k,v)}`);await evaluate(b,"{const button=document.querySelector('.answer-choices button');if(button)button.click();else{const e=document.querySelector('.focus-quiz input');if(!e)throw Error(document.body.textContent);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'Synthetic quiz answer');e.dispatchEvent(new Event('input',{bubbles:true}))}}");await delay(150);check(await evaluate(b,"!!document.querySelector('.answer-choices .picked')||document.querySelector('.focus-quiz input')?.value==='Synthetic quiz answer'"),'quiz: rejected async answer remains selected');check(await raw()===quizBefore,'quiz: failed answer leaves stored bytes unchanged');await evaluate(b,"document.querySelector('.focus-steps button').click()");await delay(100);check(await evaluate(b,"!!document.querySelector('.answer-choices .picked')"),'quiz: step change cannot unload rejected local answer');await evaluate(b,"document.querySelector('.focus-header .back-button').click()");await delay(150);check(await evaluate(b,"location.hash==='#/learn/letters'&&!!document.querySelector('.answer-choices .picked')"),'quiz: native back cannot unload rejected local answer');await evaluate(b,'Storage.prototype.setItem=oldSet');await click(b,'重试保存本轮答案');check(!!JSON.parse(await raw()).records.letters.answers[0],'quiz: retry saves the retained choice');

 await instrument(b);const qs=await evaluate(b,"qa.questionsFor(qa.nodeById('letters'),0)");
 for(const [i,q] of qs.entries()){
  await evaluate(b,`[...document.querySelectorAll('.answer-choices button')].find(x=>x.textContent===${JSON.stringify(q.answer)}).click()`);await delay(80);
  if(i===qs.length-1){await hold();const before=await raw();await evaluate(b,"document.querySelector('.focus-quiz form').requestSubmit()");await delay(100);check(await raw()===before&&!await evaluate(b,'!!document.querySelector(".quiz-receipt")'),'quiz: held submit cannot publish completion before confirmed write');await release();check(await evaluate(b,'!!document.querySelector(".quiz-receipt.success")'),'quiz: confirmed native commit publishes the passing receipt');}
  else{await evaluate(b,"document.querySelector('.focus-quiz form').requestSubmit()");await delay(100)}
 }
 check((await evaluate(b,'trace')).filter(x=>x.kind==='lock').every(x=>x.name===lock),'quiz: answer, movement and submission all use the restore lock');await shot(b,'quiz-confirmed');
 const testedFiles={};for(const file of ['map/main.tsx','map/learning.tsx','map/course.tsx','map/expression.tsx','map/speaking.tsx','map/progress-write.ts','map/progress-file-restore.ts','scripts/test-map-writers-browser-r47.mjs'])testedFiles[file]=createHash('sha256').update(await readFile(new URL('../'+file,import.meta.url))).digest('hex');
 const report={testedFiles,sourceHead:execFileSync('git',['rev-parse','HEAD'],{cwd:fileURLToPath(root),encoding:'utf8'}).trim(),browser:version.product,scope:'Production built App, real native shared Web Locks/localStorage in two isolated-profile tabs; actual native downloaded map file uploaded through DOM; synthetic data only; no changed clock',checks,artifacts,passed:checks.length,unmeasured:['Noncooperating pre-upgrade tabs','iOS/Safari/iCloud and production deployment','Natural-time personal archives','Speaking audio transport is covered by owner c3a308b/040beb native UI tests; no user recording used here']};await writeFile(path.join(out,'browser-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:checks.length,out}));
} finally {
 if(browser)try{await browser.send('Browser.close')}catch{}
 for(const tab of tabs)tab.close();browser?.close();if(chrome&&chrome.exitCode===null)chrome.kill('SIGTERM');if(server)await new Promise(resolve=>server.close(resolve));await rm(temporary,{recursive:true,force:true,maxRetries:10,retryDelay:200});
}
