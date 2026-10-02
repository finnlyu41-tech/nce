/** Review-only HTTP/CDP harness. Never import this in the application. */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {bindingFor,fixtureSource,baseRuntime} from './model-fixture.mjs';
const root=fileURLToPath(new URL('./',import.meta.url));
const proof=fileURLToPath(new URL('../../work/course-loop-batch-01/',import.meta.url));
await mkdir(proof,{recursive:true});const profile=await mkdtemp(join(proof,'profile-'));
const courses=['nce1-3','nce1-5'],contents=Object.fromEntries(await Promise.all(courses.map(async id=>[id,await import(bindingFor(id).content.href)])));
const core={},render={};let provenance;
const originalRenderer=await readFile(new URL('../preview.mjs',import.meta.url),'utf8');
for(const id of courses){
 const fixture=await fixtureSource(`/content/${id}.mjs`);core[id]=fixture.source;provenance={runtime:baseRuntime,modelSha256:fixture.sourceSha256,rendererSha256:createHash('sha256').update(originalRenderer).digest('hex'),transformations:fixture.transformations};
 render[id]=originalRenderer.replace("from './lesson-nce1-001.mjs'",`from '/content/${id}.mjs'`).replace("from './model.mjs'",`from '/model/${id}.mjs'`)
  .replace('集成时在这里展示原文、原声和对应漫画：先听整段理解场景，再回听问句、请求重说和确认回答。看后模仿；原声和漫画不计为新题作答。',`集成时连接本组教材原文、原声和漫画。三段定位：${contents[id].lesson.source.clips.map(c=>c.label).join('；')}。查看教材属于学习，不计为独立新题作答。`);
}
const server=createServer(async(req,res)=>{try{
 const path=new URL(req.url,'http://local').pathname;let body;
 if(path==='/')body=await readFile(join(root,'preview.html'),'utf8');
 else if(path==='/preview.mjs'||path==='/content/content-contract.mjs')body=await readFile(join(root,path.endsWith('preview.mjs')?'preview.mjs':'content-contract.mjs'),'utf8');
 else{const match=path.match(/^\/(content|model|render)\/(nce1-[35])\.mjs$/);if(!match){res.writeHead(404).end();return}const [,kind,id]=match;body=kind==='content'?await readFile(bindingFor(id).content,'utf8'):kind==='model'?core[id]:render[id];}
 res.setHeader('content-type',path==='/'?'text/html; charset=utf-8':'text/javascript; charset=utf-8');res.end(body);
 }catch(err){res.writeHead(500).end('Review fixture failed');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const chrome=spawn(process.env.COURSE_LOOP_BROWSER||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--no-first-run','--no-default-browser-check',`--user-data-dir=${profile}`,'--remote-debugging-port=0',`${origin}/?course=nce1-3`],{stdio:['ignore','ignore','pipe']});
let browserWS='';chrome.stderr.on('data',x=>browserWS+=x.toString());
const until=async fn=>{const end=Date.now()+15000;while(Date.now()<end){const value=await fn();if(value)return value;await new Promise(r=>setTimeout(r,50))}throw Error('Timed out')};
let socket;const errors=[],checks=[];let sequence=0;const pending=new Map();
try{
 await until(()=>browserWS.match(/DevTools listening on (ws:\/\/[^\s]+)/));const address=new URL(browserWS.match(/DevTools listening on (ws:\/\/[^\s]+)/)[1]);
 const pages=await fetch(`http://${address.host}/json/list`).then(r=>r.json());const page=pages.find(p=>p.url.startsWith(origin));assert(page);
 socket=new WebSocket(page.webSocketDebuggerUrl);socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)}};
 await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>reject(Error(method+' timeout')),10000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}))});
 const evaluate=async(fn,arg)=>{const r=await send('Runtime.evaluate',{expression:`(${fn.toString()})(${JSON.stringify(arg)})`,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value};
 await send('Runtime.enable');await send('Page.enable');
 const text=()=>evaluate(()=>document.querySelector('#root').innerText);
 const click=async label=>{const p=await evaluate(label=>{const n=[...document.querySelectorAll('button,summary')].find(n=>n.textContent===label);if(!n)throw Error('No button '+label);n.scrollIntoView({block:'center'});const r=n.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}},label);await send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1})};
 const fill=async(value,index=0)=>{await evaluate(index=>{const n=document.querySelectorAll('input,textarea')[index];n.focus();n.select()},index);await send('Input.insertText',{text:value})};
 const answer=async(q,value=q.accepted[0])=>{if(q.kind==='choice')await click(value);else await fill(value);await click('提交本题')};
 const check=async(label,fn)=>{await fn();checks.push(label);console.log('PASS '+label)};
 for(const id of courses){
  await send('Page.navigate',{url:`${origin}/?course=${id}`});await until(()=>evaluate(()=>document.querySelector('#root h2')?.textContent.length>0));
  const c=contents[id],banks=stage=>c.questionsFor(stage);
  await check(`${id}: correct identity, first question, no future key or persistence`,async()=>{assert.equal(await evaluate(()=>document.querySelector('h1').textContent),c.lesson.title);assert.match(await text(),new RegExp(banks('diagnostic')[0].context));assert.doesNotMatch(await text(),new RegExp(banks('review-a')[0].context));assert.equal(await evaluate(()=>localStorage.length),0)});
  await click('暂时不会，先记下');await click('下一题');await answer(banks('diagnostic')[1]);await click('下一题');await answer(banks('diagnostic')[2]);await click('看针对性讲解');
  await check(`${id}: diagnostic targets learning; media remains explicit pending host`,async()=>{assert.match(await text(),new RegExp(c.lesson.teaching[0].title));assert.match(await text(),/当前预览只提供宿主接口说明/);assert.match(await text(),new RegExp(c.lesson.source.clips[0].label))});
  await click('跟着换一句');for(const [i,q]of banks('guided').entries()){await answer(q);await click(i<2?'下一题':'收起示范，自己试')}
  await check(`${id}: independent stage conceals model example and later banks`,async()=>{assert.match(await text(),new RegExp(banks('independent')[0].context));assert.doesNotMatch(await text(),new RegExp(c.lesson.teaching[0].example.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));assert.doesNotMatch(await text(),new RegExp(banks('review-b')[0].context))});
  const wrong=id==='nce1-3'?'This not my phone.':'This Mina.';
  const affected=id==='nce1-3'?[banks('independent')[0],banks('independent')[1]]:[banks('independent')[0],banks('independent')[1]];
  for(const [i,q]of banks('independent').entries()){
   if(q.kind==='choice'){await click('需要提示');await answer(q)}else if(q.id===affected.find(q=>q.kind==='input').id)await answer(q,wrong);else await answer(q);
   await click(i<2?'下一题':'看首答与反馈');
  }
  await check(`${id}: original/help retained; feedback cannot skip missing corrections`,async()=>{assert.match(await text(),new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));assert.match(await text(),/使用过帮助/);await click('换三个情境，再试一次');assert.match(await evaluate(()=>document.querySelector('#error').textContent),/订正/)});
  for(const q of affected){await fill(q.accepted[0]);await fill('核对本题明确的人物或物主，并保留正确的be。',1);await click('保留这条订正')}
  await click('换三个情境，再试一次');
  for(const [i,q]of banks('repair').entries()){
   if(i===0){await answer(q,q.kind==='choice'?q.options.find(x=>!c.matches(q,x)):'This Sam.');await click('对照后重试')}
   await answer(q);await click(i<2?'下一题':'换成自己的问答');
  }
  await fill(id==='nce1-3'?"This is not my pen. No, it isn't.":'This is my friend Emma. She is French.');await click('保留本次记录，安排复习');await click('回看本页原答与订正');
  await check(`${id}: future due, original and retry, human review; no early fake review/save`,async()=>{assert.match(await text(),/当前未到期/);assert.match(await text(),/待人工核对/);assert.match(await text(),/有帮助/);assert.match(await text(),/同题重试/);assert.match(await text(),new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));assert.equal(await evaluate(()=>[...document.querySelectorAll('button')].some(n=>n.textContent==='开始到期的新题')),false);assert.equal(await evaluate(()=>localStorage.length),0)});
  const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile(join(proof,`${id}-complete.png`),Buffer.from(shot.data,'base64'));
  await send('Page.reload');await until(()=>evaluate(()=>document.querySelector('#root')?.innerText.includes('先尝试')));
  await check(`${id}: truthful refresh reset and no cross-course original`,async()=>{assert.match(await evaluate(()=>document.body.innerText),/刷新会清空/);assert.doesNotMatch(await text(),/你的首答/);assert.equal(await evaluate(()=>localStorage.length),0)});
 }
 await send('Page.navigate',{url:`${origin}/?course=nce1-7`});await until(()=>evaluate(()=>document.querySelector('#error')?.textContent.includes('不会改用')));
 await check('unknown course fails closed without CL00/default content',async()=>{assert.equal(await text(),'');assert.equal(await evaluate(()=>document.querySelector('h1').textContent),'课程标识不受支持');assert.deepEqual(errors,[])});
 await writeFile(join(proof,'receipt.json'),JSON.stringify({source:'local unintegrated batch-01 content preview',browser:(await send('Browser.getVersion')).product,provenance,checks,errors,scope:'Native CDP clicks/insertText with fresh task-owned Chrome. No production state, user records, audio playback, phone claim or injected browser clock. Delayed model times are separate simulations.',screenshots:courses.map(id=>`${id}-complete.png`)},null,2)+'\n');
}finally{socket?.close();const exited=new Promise(r=>{if(chrome.exitCode!==null)r();else chrome.once('exit',r)});chrome.kill('SIGTERM');await exited;await new Promise(r=>server.close(r));await rm(profile,{recursive:true,force:true,maxRetries:4,retryDelay:150})}
