// Native Chrome/CDP against the exact built candidate, fresh synthetic profile.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url),run=new URL(`work/mini-task/browser-${Date.now()}/`,root),origin='http://127.0.0.1:5187';
await mkdir(run,{recursive:true});const profile=fileURLToPath(new URL('chrome-profile/',run));
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--autoplay-policy=no-user-gesture-required','--mute-audio','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
const checks=[],errors=[],requests=[];let page,browser;
class CDP{
 constructor(socket){this.socket=socket;this.seq=0;this.navSeq=0;this.pending=new Map();socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=this.pending.get(m.id);if(p){this.pending.delete(m.id);clearTimeout(p.timer);if(m.error)p.reject(Error(JSON.stringify(m.error)));else p.resolve(m.result)}}if(m.method==='Page.frameNavigated'&&!m.params.frame.parentId)this.navSeq++;if(m.method==='Page.javascriptDialogOpening')void this.send('Page.handleJavaScriptDialog',{accept:true});if(m.method==='Runtime.exceptionThrown')errors.push(m.params);if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url)})}
 static async connect(url){const socket=new WebSocket(url);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});return new CDP(socket)}
 send(method,params={}){const id=++this.seq;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('CDP timeout '+method)),12000);this.pending.set(id,{resolve,reject,timer});this.socket.send(JSON.stringify({id,method,params}))})}
 async eval(fn,arg){const r=await this.send('Runtime.evaluate',{expression:`(${fn.toString()})(${JSON.stringify(arg)})`,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value}
 async wait(fn,arg,label){for(let i=0;i<120;i++){if((await this.send('Runtime.evaluate',{expression:`!!((${fn.toString()})(${JSON.stringify(arg)}))`,returnByValue:true})).result.value)return;await new Promise(r=>setTimeout(r,100))}throw Error('Timeout '+label)}
 async click(text){await this.wait(text=>{const b=[...document.querySelectorAll('.mini-task button')].find(b=>b.textContent===text);return b&&!b.disabled},text,text);const point=await this.eval(text=>{const b=[...document.querySelectorAll('.mini-task button')].find(b=>b.textContent===text);b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}},text);await this.send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});await this.send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1})}
}
try{
 let active;for(let i=0;i<100;i++){try{active=(await readFile(profile+'/DevToolsActivePort','utf8')).trim().split('\n');break}catch{await new Promise(r=>setTimeout(r,100))}}assert(active,'isolated Chrome started');
 browser=await CDP.connect(`ws://127.0.0.1:${active[0]}${active[1]}`);const {targetId}=await browser.send('Target.createTarget',{url:origin+'/mini-task/preview.html'});const list=await fetch(`http://127.0.0.1:${active[0]}/json/list`).then(r=>r.json());page=await CDP.connect(list.find(t=>t.id===targetId).webSocketDebuggerUrl);await page.send('Page.enable');await page.send('Runtime.enable');await page.send('Network.enable');
 await page.wait(()=>document.querySelector('.mini-task[data-phase=teaching]'),null,'first read');
 const fixtures=JSON.parse(await readFile(new URL('work/mini-task/fixtures.json',root),'utf8'));
 await page.eval(state=>{localStorage.setItem('english-studio-v1',JSON.stringify(state));localStorage.setItem('wayfinder-ielts-map:v2','R12-QA-map-sentinel')},fixtures.state);
 const model=await import(new URL('work/mini-task/test-model.mjs',root));
 const phase=p=>page.wait(p=>document.querySelector('.mini-task')?.dataset.phase===p&&!document.querySelector('.mini-task [role=alert]')&&!document.querySelector('.mini-task [role=status]')?.textContent.includes('正在'),p,p);
 async function reload(){const n=page.navSeq;await page.send('Page.reload');for(let i=0;i<120&&page.navSeq===n;i++)await new Promise(r=>setTimeout(r,100));assert(page.navSeq>n,'reload committed before checking restored UI')}
 const saved=()=>page.eval(()=>new Promise((resolve,reject)=>{const r=indexedDB.open('english-studio-offline',1);r.onsuccess=()=>{const db=r.result,t=db.transaction('state'),g=t.objectStore('state').get('current');g.onsuccess=()=>resolve(g.result);g.onerror=()=>reject(g.error);t.oncomplete=()=>db.close()};r.onerror=()=>reject(r.error)}));
 async function navigate(task){await page.send('Page.navigate',{url:origin+'/mini-task/preview.html?task='+task.id});await phase('teaching');await page.click('开始有提示练习');await phase('guided')}
 async function fill(value,index=0){const p=await page.eval(index=>{const e=document.querySelectorAll('.mini-task textarea')[index];e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+10,y:r.y+10}},index);await page.send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});await page.send('Input.insertText',{text:value});await page.wait(()=>!document.querySelector('.mini-task [role=status]').textContent.includes('正在'),null,'text confirmed')}
 async function answer(task,bank){const q=task.items.find(q=>q.bank===bank);
  if(task.skill==='listening'){
   assert.equal(await page.eval(script=>document.querySelector('.mini-task').innerText.includes(script),q.material),false,'listening script hidden until recorded help');
   await page.eval(()=>document.querySelector('.mini-task audio').play());await page.wait(()=>document.querySelector('.mini-task audio')?.ended,null,'real WAV playback ended');
   await page.wait(()=>!document.querySelector('.mini-task [role=status]').textContent.includes('正在'),null,'audio receipt saved');
  }
  if(task.skill==='speaking'){
   const doc=await page.send('DOM.getDocument'),node=await page.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'input[type=file]'});
   await page.send('DOM.setFileInputFiles',{nodeId:node.nodeId,files:[fileURLToPath(new URL('mini-task/audio/mini-n1-01-guided.wav',root))]});
   await page.wait(()=>!!document.querySelector('.mini-task audio'),null,'local audio selected');
  }else await fill(q.accepted[0]||q.reference);
  await page.click('保留首答，提交本题');await phase('feedback');
 }
 for(const task of model.miniTasks){
  await navigate(task);await answer(task,'guided');
  const before=await saved();const key=model.miniDraftKey(task.id),original=model.restoreMini(before.drafts[key]).view.attempts[0];
  await fill('修订草稿',0);await fill('原因草稿',1);await reload();await phase('feedback');assert.equal(await page.eval(()=>document.querySelectorAll('.mini-task textarea')[0].value),'修订草稿');
  await page.click('收起示范，换新材料');await phase('independent');
  if(task.skill==='listening'){await page.click('看文字稿（记帮助）');await page.wait(()=>!!document.querySelector('[aria-label="帮助文字稿"]'),null,'transcript after saved help');await page.eval(()=>document.querySelector('.mini-task audio').play());await page.wait(()=>document.querySelector('.mini-task audio')?.ended,null,'helped audio ended');await fill(task.items[1].accepted[0]);await page.click('保留首答，提交本题');await phase('feedback')}
  else if(task.skill==='speaking'){await page.click('改用文字备选（不记口语）');await page.wait(()=>!!document.querySelector('.mini-task textarea'),null,'text fallback');await fill('This is Ken. He is Japanese.');await page.click('保留首答，提交本题');await phase('feedback')}
  else {await fill(task.items[1].accepted[0]||task.items[1].reference);await reload();await phase('independent');assert.equal(await page.eval(()=>document.querySelector('.mini-task textarea').value),task.items[1].accepted[0]||task.items[1].reference);await page.click('保留首答，提交本题');await phase('feedback')}
  const current=await saved(),p=model.restoreMini(current.drafts[key]);assert(p.ok);assert.deepEqual(p.view.attempts[0],original);assert.equal(p.view.attempts.length,2);
  if(['speaking','listening'].includes(task.skill))assert.equal(p.view.attempts[1].independent,false);
  if(['speaking','writing'].includes(task.skill))assert(p.view.attempts.every(a=>a.status==='awaiting-external-review'&&a.matched===null));
  for(const b of model.courseLoopBindings)assert.equal(current.drafts[b.key],fixtures.state.drafts[b.key]);assert.equal(current.attempts,0);assert.equal(current.flashcards,undefined);assert.equal(await page.eval(()=>localStorage.getItem('wayfinder-ielts-map:v2')),'R12-QA-map-sentinel');
  console.log('PASS browser '+task.id);checks.push(task.id+': real UI guided/independent, refresh original/correction drafts, isolated CL/map/FSRS');
 }
 for(const width of [1280,390,320]){await page.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await page.eval(()=>scrollTo(0,0));const size=await page.eval(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert(size.scroll<=size.width);const shot=await page.send('Page.captureScreenshot',{format:'png'});await writeFile(new URL(`width-${width}.png`,run),Buffer.from(shot.data,'base64'));checks.push('no horizontal overflow '+width)}
 assert.equal(errors.length,0);const external=requests.filter(url=>/^https?:/.test(url)&&!url.startsWith(origin));assert.deepEqual(external,[],'no remote HTTP requests or audio uploads');
 await writeFile(new URL('receipt.json',run),JSON.stringify({checks,exceptions:errors.length,externalRequests:external,inlineOrLocalSchemes:[...new Set(requests.filter(u=>!/^https?:/.test(u)).map(u=>u.split(':')[0]))],profile:'fresh synthetic QA only',actualPlayback:'HTMLAudioElement play/ended with bundled WAV',realLearnerSpeech:false,naturalDelayVerified:false},null,2)+'\n');console.log('PASS '+checks.length+' exact-build browser groups. Evidence '+fileURLToPath(run));
}finally{if(browser)try{await browser.send('Browser.close')}catch{}page?.socket.close();browser?.socket.close();chrome.kill()}
