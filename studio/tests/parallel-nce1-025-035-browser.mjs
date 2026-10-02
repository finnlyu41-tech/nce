/** Isolated, in-memory content preview. Never reads or writes a learner store. */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {server} from './parallel-nce1-025-035-preview-server.mjs';
const proof=fileURLToPath(new URL('../docs/parallel-nce1-025-035-proof/',import.meta.url));
const profile=await mkdtemp(join(tmpdir(),'nce-content-025-035-'));
const errors=[],checks=[];let chrome,ws;
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label){for(let i=0;i<100;i++){const v=await fn();if(v)return v;await pause(50)}throw Error('Timeout '+label)}
async function connect(url){const socket=new WebSocket(url),pending=new Map();let sequence=0;await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j});socket.onmessage=e=>{const m=JSON.parse(String(e.data));if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)}};return {close:()=>socket.close(),send:(method,params={})=>new Promise((r,j)=>{const id=++sequence,timer=setTimeout(()=>{pending.delete(id);j(Error('CDP timeout '+method))},10000);pending.set(id,{resolve:r,reject:j,timer});socket.send(JSON.stringify({id,method,params}))})}}
try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
 chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
 await until(async()=>{try{return await readFile(join(profile,'DevToolsActivePort'),'utf8')}catch{return false}},'Chrome endpoint');
 const [port]=String(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n');
 const target=await(await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(origin+'/course-loop/parallel-nce1-025-035/preview.html')}`,{method:'PUT'})).json();ws=await connect(target.webSocketDebuggerUrl);await ws.send('Runtime.enable');await ws.send('Page.enable');
 const evaluate=async expression=>{const r=await ws.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value};
 const click=async label=>{const found=await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent===${JSON.stringify(label)});if(!b)return false;b.click();return true})()`);assert.ok(found,'Missing button '+label)};
 const phase=()=>evaluate(`document.querySelector('#root')?.dataset.phase`);
 const answer=async value=>{assert.ok(await evaluate(`(()=>{const i=document.querySelector('.card input');if(!i)return false;i.value=${JSON.stringify(value)};i.dispatchEvent(new Event('input',{bubbles:true}));return true})()`));await click('提交本题')};
 const next=async()=>{const labels=['下一题','看针对性讲解','收起示范，自己试','看首答与反馈','换成自己的问答','看本次复习记录'];const label=await evaluate(`([...document.querySelectorAll('button')].find(x=>${JSON.stringify(labels)}.includes(x.textContent)))?.textContent`);assert.ok(label);await click(label)};
 for(const n of [25,27,29,31,33,35]){
  const c=await import(`../course-loop/parallel-nce1-025-035/lesson-nce1-${String(n).padStart(3,'0')}.mjs`);
  await ws.send('Page.navigate',{url:origin+`/course-loop/parallel-nce1-025-035/preview.html?course=${n}`});await until(async()=>await phase()==='diagnostic','loaded '+n);
  assert.ok((await evaluate('document.body.innerText')).includes(c.lesson.title));
  for(const width of [320,390]){await ws.send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:false});const m=await evaluate('({inner:innerWidth,scroll:document.documentElement.scrollWidth})');assert.ok(m.scroll<=width+1,JSON.stringify(m));const shot=await ws.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(join(proof,`preview-${n}-${width}.png`),Buffer.from(shot.data,'base64'));checks.push({course:c.lesson.id,viewport:width,overflow:false})}
  await click('看原课文');await until(()=>evaluate(`document.querySelector('#media').innerText.includes('Lesson ${n}')||document.querySelector('#media').querySelectorAll('div p').length>5`),'text source');
  await click('看本课漫画');await until(()=>evaluate(`!![...document.querySelectorAll('#media img')].find(x=>x.complete&&x.naturalWidth>0)`),'comic source');
  await click('听原声片段');await until(()=>evaluate(`document.querySelectorAll('#media audio').length===3&&[...document.querySelectorAll('#media audio')].every(x=>x.readyState>=1&&x.duration>0)`),'audio metadata');
  for(const stage of ['diagnostic','guided','independent']){
   if(stage==='guided')await click('跟着换一句');
   for(const q of c.questionsFor(stage)){assert.equal(await evaluate(`document.querySelector('.card')?.dataset.question`),q.id);await answer(q.accepted[0]);await next()}
  }
  assert.equal(await phase(),'feedback');assert.ok((await evaluate('document.body.innerText')).includes('你的首答：'));
  await click('换三个情境，再试一次');
  for(const q of c.questionsFor('repair')){await answer(q.accepted[0]);await next()}
  assert.equal(await phase(),'own');await evaluate(`(()=>{const t=document.querySelector('textarea');t.value='明确虚构的开放表达，等待伙伴阅读。';t.dispatchEvent(new Event('input',{bubbles:true}))})()`);await click('保留本次记录，安排复习');assert.equal(await phase(),'waiting');
  for(const bank of ['review-a','review-b']){await click('用演示时间进入到期练习');assert.equal(await phase(),bank);for(const q of c.questionsFor(bank)){await answer(q.accepted[0]);await next()}assert.equal(await phase(),'review-feedback');await click('查看下一次安排')}
  assert.ok((await evaluate('document.body.innerText')).includes('两组新题已用完'));
  assert.equal(await evaluate('localStorage.length'),0);assert.equal(await evaluate('sessionStorage.length'),0);checks.push({course:c.lesson.id,completedBanks:6,sourceText:true,comicLoaded:true,audioMetadata:true,audibility:'not-verified',storageEntries:0,delays:'synthetic'});
 }
 assert.equal(errors.length,0,JSON.stringify(errors));
}catch(e){console.error(e);process.exitCode=1}
finally{
 await writeFile(join(proof,'browser-receipt.json'),JSON.stringify({base:'d9c7c48a7d419c230be06bf81cc956d63b124649',scope:'six candidate content modules in isolated in-memory preview using unchanged production factory; not integrated host',checks,runtimeExceptions:errors,passed:!process.exitCode,unverified:['production registry/routes/store/CAS/Today integration','natural24h/7d','physical phone','audible playback','human open expression']},null,2));
 ws?.close();if(chrome){const exited=new Promise(r=>chrome.exitCode!==null?r():chrome.once('exit',r));chrome.kill('SIGTERM');await exited}await new Promise(r=>server.close(r));await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});
}
