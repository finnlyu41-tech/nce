// Fresh temporary Chrome profile; native clicks/input; memory-only practice page.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {startPreview} from './preview-server.mjs';
const numbers=process.env.NCE_CHECKPOINT==='1'?[13,15,17]:[13,15,17,19,21,23];
const proof=process.env.NCE_PROOF_ROOT||await mkdtemp(join(tmpdir(),'nce013-023-preview-'));await mkdir(proof,{recursive:true});
const profile=await mkdtemp(join(tmpdir(),'nce013-023-chrome-'));
const {server,origin}=await startPreview();
const checks=[],errors=[];let chrome,socket,stderr='',sequence=0;const pending=new Map();
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let i=0;i<200;i++){const result=await fn();if(result)return result;await wait(40);}throw Error('Preview timeout');}
try{
 chrome=spawn(process.env.NCE_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--no-first-run','--no-default-browser-check',`--user-data-dir=${profile}`,'--remote-debugging-port=0',origin+'/studio/course-loop/parallel-nce1-013-023/preview.html?course=nce1-13'],{stdio:['ignore','ignore','pipe']});chrome.stderr.on('data',x=>stderr+=x.toString());
 const endpoint=await until(()=>stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/)?.[1]);const address=new URL(endpoint);const pages=await fetch(`http://${address.host}/json/list`).then(r=>r.json());const page=pages.find(p=>p.url.startsWith(origin));assert.ok(page);
 socket=new WebSocket(page.webSocketDebuggerUrl);socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}};
 await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j;});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>reject(Error('CDP timeout '+method)),10000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}));});
 const evaluate=async(expression)=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
 await send('Runtime.enable');await send('Page.enable');
 async function click(label){const point=await evaluate(`(()=>{const n=[...document.querySelectorAll('button,summary')].find(n=>n.textContent===${JSON.stringify(label)});if(!n||n.disabled)throw Error('Control unavailable');n.scrollIntoView({block:'center'});const r=n.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);await send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});}
 async function fill(value,index=0){const point=await evaluate(`(()=>{const n=document.querySelectorAll('input,textarea')[${index}];n.scrollIntoView({block:'center'});const r=n.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);await send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});await send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:4,commands:['selectAll']});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:4});await send('Input.insertText',{text:value});}
 const visible=()=>evaluate("document.querySelector('#root').innerText");
 async function answer(q,value=q.accepted[0]){if(q.kind==='choice')await click(value);else await fill(value);await click('提交本题');}
 async function check(label,run){await run();checks.push({label,ok:true});console.log('PASS '+label);}
 for(const n of numbers){const c=await import(`./lesson-nce1-${String(n).padStart(3,'0')}.mjs`),id=c.lesson.id,banks=s=>c.questionsFor(s);
  await send('Page.navigate',{url:origin+'/studio/course-loop/parallel-nce1-013-023/preview.html?course='+id});await until(()=>evaluate(`document.querySelector('.card')?.dataset.question===${JSON.stringify(banks('diagnostic')[0].id)}`));
  await check(id+' identity, no persistence and no later answers',async()=>{assert.equal(await evaluate('document.querySelector("h1").textContent'),c.lesson.title);assert.ok(!(await visible()).includes(banks('review-a')[0].context));assert.equal(await evaluate('localStorage.length'),0);assert.deepEqual(await evaluate('indexedDB.databases().then(x=>x.map(d=>d.name))'),[]);});
  if(process.env.NCE_ASSET_ROOT)await check(id+' correct original source and comic',async()=>{await click('看本课原文');await until(()=>evaluate("document.querySelectorAll('[lang=en]').length>0"));const lang=JSON.parse(await readFile(join(process.env.NCE_ASSET_ROOT,`language/NCE1/${n}.json`)));assert.ok((await visible()).includes(lang.rows[4].en));await click('收起教材');await click('看本课漫画');await until(()=>evaluate("document.querySelector('#root img')?.complete&&document.querySelector('#root img')?.naturalWidth>0"));assert.equal(await evaluate("document.querySelector('#root img').getAttribute('src')"),'/source-comic/'+n+'.jpg');await click('收起教材');});
  for(const [i,q]of banks('diagnostic').entries()){await answer(q);await click(i<2?'下一题':'看针对性讲解');}
  await check(id+' diagnostic teaching matches this lesson targets',async()=>{const text=await visible();for(const t of c.lesson.teaching)assert.ok(text.includes(t.title));for(const clip of c.lesson.source.clips)assert.ok(text.includes(clip.label));assert.ok(!text.includes('集成时'));});
  await click('跟着换一句');for(const [i,q]of banks('guided').entries()){await answer(q);await click(i<2?'下一题':'收起示范，自己试');}
  await check(id+' independent examples withdrawn and feedback deferred',async()=>{assert.ok(!(await visible()).includes(c.lesson.teaching[0].example));await answer(banks('independent')[0],banks('independent')[0].counterexamples[0].answer);const text=await visible();assert.ok(text.includes('完成这三题后一起看反馈'));assert.ok(!text.includes('参考：'));});
  await click('下一题');await click('需要提示');await answer(banks('independent')[1]);await click('下一题');await answer(banks('independent')[2]);await click('看首答与反馈');
  for(const [index,q]of banks('independent').slice(0,2).entries()){await fill(q.accepted[0],0);await fill(q.why,1);await click('保留这条订正');}
  await check(id+' original wrong answer retained alongside correction',async()=>{const text=await visible();assert.ok(text.includes('你的首答：'+banks('independent')[0].counterexamples[0].answer));assert.ok(text.includes('订正：'+banks('independent')[0].accepted[0]));});
  await click('换三个情境，再试一次');for(const [i,q]of banks('repair').entries()){await answer(q);await click(i<2?'下一题':'换成自己的问答');}
  await fill('This is a fictional preview expression for '+id+'.');await click('保留本次记录，安排复习');
  await check(id+' waiting and human review status only in page memory',async()=>{const text=await visible();assert.ok(text.includes('当前未到期'));assert.ok(text.includes('待人工核对'));assert.equal(await evaluate('localStorage.length'),0);assert.deepEqual(await evaluate('indexedDB.databases().then(x=>x.map(d=>d.name))'),[]);});
  for(const width of [320,390]){await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:false});assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'));const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile(join(proof,`${id}-${width}.png`),Buffer.from(shot.data,'base64'));}await send('Emulation.clearDeviceMetricsOverride');
  await send('Page.reload');await until(()=>evaluate(`document.querySelector('.card')?.dataset.question===${JSON.stringify(banks('diagnostic')[0].id)}`));assert.equal(await evaluate('document.querySelector("input")?.value'),'');
 }
 assert.equal(errors.length,0);const sha=b=>createHash('sha256').update(b).digest('hex');await writeFile(join(proof,'receipt.json'),JSON.stringify({scope:'isolated memory-only preview using unmodified production createCourseLoopModel; native CDP clicks/input; own temporary Chrome profile',origin,courses:numbers,checks,errors,modelSha256:sha(await readFile(new URL('../model.mjs',import.meta.url))),unverified:['formal host save/CAS/Today/route','natural24h/7d','audible audio','physical phone','human expression']},null,2));console.log(JSON.stringify({proof,checks:checks.length,exceptions:errors.length}));
}catch(error){console.error(error);process.exitCode=1;await writeFile(join(proof,'failure.json'),JSON.stringify({checks,errors,error:String(error)},null,2));}
finally{socket?.close();for(const p of pending.values())clearTimeout(p.timer);if(chrome){const ended=new Promise(r=>chrome.exitCode!==null?r():chrome.once('exit',r));chrome.kill('SIGTERM');await ended;}await new Promise(r=>server.close(r));await rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});}
