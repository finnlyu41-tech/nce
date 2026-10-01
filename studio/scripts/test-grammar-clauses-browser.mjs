import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

// Run against a separately started Chrome with an empty task-owned profile and
// a localhost-only debugging port. No personal browser session is inspected.
const origin=process.env.GRAMMAR_CLAUSES_PREVIEW_ORIGIN||'http://127.0.0.1:4201';
const debugging=process.env.GRAMMAR_CLAUSES_DEBUG_ORIGIN||'http://127.0.0.1:4202';
const previewKey='english-studio-grammar-clauses-review-v1';
const app=new URL('../app/',import.meta.url);
const data=new URL('data/grammar-curriculum/depth-clauses/',app);
const manifest=JSON.parse(await readFile(new URL('batch-manifest.json',data),'utf8'));
const units=await Promise.all(manifest.unitIds.map(id=>readFile(new URL(id+'.json',data),'utf8').then(JSON.parse)));
const guides=JSON.parse(await readFile(new URL('data/grammar-explanations.json',app),'utf8')).guides;
const output=new URL('../work/clauses-browser-check/',import.meta.url);
await mkdir(output,{recursive:true});
const pages=await fetch(debugging+'/json/list').then(response=>response.json());
const page=pages.find(item=>item.type==='page'&&item.url.startsWith(origin))||pages.find(item=>item.type==='page');
assert(page?.webSocketDebuggerUrl,'Start task-owned headless Chrome before this check');
const socket=new WebSocket(page.webSocketDebuggerUrl),pending=new Map(),errors=[];
let sequence=0,loads=0;
socket.addEventListener('message',event=>{
 const message=JSON.parse(event.data);
 if(message.method==='Page.loadEventFired')loads++;
 if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.text);
 if(message.id&&pending.has(message.id)){
  const {resolve,reject,timer}=pending.get(message.id);pending.delete(message.id);clearTimeout(timer);
  if(message.error)reject(Error(JSON.stringify(message.error)));else resolve(message.result);
 }
});
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
function send(method,params={}){
 const id=++sequence;
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method))},10000);
  pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}));
 });
}
async function evaluate(fn,arg){
 const result=await send('Runtime.evaluate',{expression:'('+fn.toString()+')('+JSON.stringify(arg)+')',returnByValue:true,awaitPromise:true});
 if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);
 return result.result.value;
}
async function until(fn,arg,label){
 const end=Date.now()+10000;
 while(Date.now()<end){if(await evaluate(fn,arg))return;await new Promise(resolve=>setTimeout(resolve,80))}
 throw Error('DOM did not settle: '+label);
}
async function loadPage(method,params={}){
 const previous=loads,end=Date.now()+10000;
 const navigation=await send(method,params);
 if(method==='Page.navigate'&&!navigation.loaderId)await send('Page.reload',{ignoreCache:true});
 while(loads===previous&&Date.now()<end)await new Promise(resolve=>setTimeout(resolve,80));
 assert(loads>previous,'The new document must finish loading before reading its DOM');
 await until(ready,null,'loaded preview');
}
const ready=()=>!!document.querySelector('nav[aria-label="本批五个新单元"]');
const titleIs=title=>document.querySelector('.grammar-unit-heading h1')?.textContent===title;
async function click(selector,text){
 await evaluate(({selector,text})=>{
  const button=[...document.querySelectorAll(selector)].find(element=>element.textContent.trim()===text);
  if(!button)throw Error('Button missing: '+text);if(button.disabled)throw Error('Button disabled: '+text);button.click();
 },{selector,text});
}
async function input(selector,value){
 await evaluate(({selector,value})=>{
  const element=document.querySelector(selector);if(!element)throw Error('Input missing: '+selector);
  const prototype=element.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:element.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype,'value').set.call(element,value);
  element.dispatchEvent(new Event(element.tagName==='SELECT'?'change':'input',{bubbles:true}));
 },{selector,value});
}
async function screenshot(name){
 const result=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
 await writeFile(new URL(name,output),Buffer.from(result.data,'base64'));
}
async function noOverflow(label){
 const sizes=await evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
 assert(sizes.document<=sizes.viewport+1&&sizes.body<=sizes.viewport+1,label+': horizontal overflow '+JSON.stringify(sizes));
}
async function state(){return evaluate(key=>JSON.parse(localStorage.getItem(key)),previewKey)}
async function choose(unit){
 await click('nav[aria-label="本批五个新单元"] button',unit.order+' · '+unit.title);
 await until(titleIs,unit.title,'unit '+unit.id);
 assert((await evaluate(()=>location.hash)).includes('unit='+unit.id),'Actual unit route contains its ID');
}
const summary={profile:'task-owned-empty',preview:origin,localSourceRegistered:process.argv.includes('--integrated'),productionRegistered:false,productionPublished:false,viewports:[],questions:0,checks:[],runtimeErrors:errors};
try{
 await send('Page.enable');await send('Runtime.enable');
 await loadPage('Page.navigate',{url:origin+'/previews/clauses-review.html#/grammar?tab=path'});
 await evaluate(key=>localStorage.removeItem(key),previewKey);
 await loadPage('Page.reload',{ignoreCache:true});
 await until(key=>!!JSON.parse(localStorage.getItem(key)||'null')?.nce['NCE1-1'],previewKey,'initial sample persisted');
 const initial=await state();assert.equal(initial.nce['NCE1-1'].notes,'保留的示例笔记。');
 assert.equal(initial.drafts['expression-NCE1-1'],'保留的示例自由表达草稿');
 for(const width of [320,390]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
  await evaluate(()=>window.scrollTo(0,document.querySelector('.grammar-curriculum').offsetTop));
  await noOverflow('catalog '+width);await screenshot('catalog-'+width+'.png');summary.viewports.push(width);
 }
 await input('input[aria-label="搜索语法主线"]','unlikely');
 await until(()=>document.querySelector('.grammar-curriculum-count')?.textContent.includes('找到 1 个'),null,'semantic search');
 await input('select[aria-label="筛选学习阶段"]','foundation');
 await until(()=>!!document.querySelector('.empty'),null,'AND filter empty');
 await click('.empty button','清除筛选');
 await until(()=>document.querySelector('.grammar-curriculum-count')?.textContent.includes('找到 18 个'),null,'cleared filters');
 summary.checks.push('semantic search / AND empty / clear');
 for(const unit of units){
  await choose(unit);
  if(unit.prerequisites.length){
   const prerequisite=await evaluate(()=>document.querySelector('.grammar-unit-prerequisites button')?.textContent);
   await click('.grammar-unit-prerequisites button',prerequisite);
   await until(title=>document.querySelector('.grammar-unit-heading h1')?.textContent===title,prerequisite,'prerequisite link');
   await choose(unit);
  }
  await noOverflow(unit.id+' lesson');
  await click('.grammar-exercise-start button','开始三步练习');
  for(const variant of [0,1]){
   const questions=unit.practices.filter(question=>question.variant===variant);
   for(const [position,question] of questions.entries()){
    await until(prompt=>document.querySelector('.grammar-progressive-practice h3')?.textContent===prompt,question.prompt,question.id);
    if(unit.id==='past-background'&&variant===0&&position===0){
     await click('.grammar-progressive-practice button','先给一点提示');
     await until(()=>document.querySelector('.grammar-gradual-hint strong')?.textContent==='提示 1 / 2',null,'hint one');
     await until(({key,id,questionId})=>{
      const saved=JSON.parse(localStorage.getItem(key)||'null');
      const record=JSON.parse(saved?.drafts['grammar-curriculum-v1-'+id]||'null');
      return record?.responses[questionId]?.hintLevel===1;
     },{key:previewKey,id:unit.id,questionId:question.id},'hint persisted before human reload');
     await loadPage('Page.reload',{ignoreCache:true});await until(titleIs,unit.title,'route and hint reload');
     await until(()=>document.querySelector('.grammar-gradual-hint strong')?.textContent==='提示 1 / 2',null,'restored hint');
     await click('.grammar-progressive-practice button','再给一点帮助');
     await until(()=>document.querySelector('.grammar-gradual-hint strong')?.textContent==='提示 2 / 2',null,'hint two');
     assert(await evaluate(()=>[...document.querySelectorAll('.grammar-progressive-practice button')].find(button=>button.textContent==='再给一点帮助')?.disabled));
     await evaluate(()=>document.querySelector('.grammar-progressive-practice').scrollIntoView({block:'start'}));await screenshot('practice-hints-390.png');
    }
    const answer=question.id==='relative-reference-v1-produce'?question.answer.replace(/,/g,''):question.answer;
    if(question.options){
     await evaluate(value=>{const label=[...document.querySelectorAll('.grammar-question-options label')].find(element=>element.querySelector('span').textContent===value);if(!label)throw Error('Choice missing');label.querySelector('input').click()},answer);
    }else await input('.grammar-progressive-practice textarea',answer);
    await until(()=>[...document.querySelectorAll('.grammar-progressive-practice button')].some(button=>button.classList.contains('btn')&&!button.disabled&&/记录这一题|提交本轮/.test(button.textContent)),null,'answer saved');
    assert(!(await evaluate(()=>!!document.querySelector('.grammar-round-result'))),'No reference feedback before whole-round submission');
    await click('.grammar-progressive-practice button',position===2?'提交本轮，核对三题':'记录这一题，下一步');summary.questions++;
   }
   await until(()=>!!document.querySelector('.grammar-round-result'),null,'round result');
   await until(({key,id,variant})=>{
    const saved=JSON.parse(localStorage.getItem(key)||'null');
    const record=JSON.parse(saved?.drafts['grammar-curriculum-v1-'+id]||'null');
    return record?.attempts.at(-1)?.variant===variant;
   },{key:previewKey,id:unit.id,variant},'round persisted');
   const record=JSON.parse((await state()).drafts['grammar-curriculum-v1-'+unit.id]);
   assert.equal(record.attempts.at(-1).variant,variant);
   assert.equal(record.attempts.at(-1).passed,!(unit.id==='relative-reference'&&variant===1));
   if(unit.id==='past-background'&&variant===0)assert.equal(record.attempts.at(-1).independent,false);
   if(unit.id==='relative-reference'&&variant===1){
    assert.equal(record.responses['relative-reference-v1-produce'].matched,false);
    await evaluate(()=>document.querySelector('.grammar-round-result').scrollIntoView({block:'start'}));await screenshot('comma-failure-390.png');
    await loadPage('Page.reload',{ignoreCache:true});await until(titleIs,unit.title,'failed round reload');
    const reloaded=JSON.parse((await state()).drafts['grammar-curriculum-v1-'+unit.id]);assert.equal(reloaded.responses['relative-reference-v1-produce'].matched,false);assert.equal(reloaded.attempts.at(-1).passed,false);
   }
   if(variant===0)await click('.grammar-round-result button','换一组题重做');
  }
 }
 assert.equal(summary.questions,30);summary.checks.push('30 actual browser answers / variants / hints / reload / no early feedback / comma failure');
 const sourceConcept=manifest.concepts.find(concept=>concept.sourceEntries.some(source=>source.book==='NCE2'&&source.position>0));
 assert(sourceConcept,'The batch has a verified secondary NCE2 guide association');
 const transferUnit=units.find(unit=>unit.guideIds.includes(sourceConcept.guideId));
 await click('button','返回主线与筛选结果');
 await until(()=>!!document.querySelector('select[aria-label="筛选关联教材"]'),null,'catalog back');
 await input('select[aria-label="筛选关联教材"]','NCE2');
 await choose(transferUnit);
 // Returning from the catalog mounts the unit in its teaching view. A live
 // result view needs the explicit theory button; both are valid entry states.
 if(await evaluate(()=>!!document.querySelector('.grammar-round-result')))await click('.grammar-round-result button','回看讲解');
 await until(()=>!!document.querySelector('.grammar-transfer-links'),null,'unit transfer links');
 const guideId=sourceConcept.guideId,link=sourceConcept.sourceEntries.find(source=>source.book==='NCE2');
 await click('.grammar-transfer-links button',guides[guideId].title);
 await until(()=>!!document.querySelector('#learning-practice h1'),null,'real transfer callback');
 const route=await evaluate(()=>({hash:location.hash,title:document.querySelector('#learning-practice h1')?.textContent,prompt:document.querySelector('#learning-practice .learning-prompt')?.textContent}));
 assert(route.hash.startsWith('#/grammar/NCE2/'+link.lesson+'?'));assert(route.hash.includes('goal='+guideId));assert(route.hash.includes('unit='+transferUnit.id));assert(route.hash.includes('practice=transfer'));assert.equal(route.title,guides[guideId].title);assert.equal(route.prompt,transferUnit.transfer.prompt);
 const expression='I borrowed a torch from the ranger, which helped me find the path.';
 await input('#learning-practice textarea',expression);await click('#learning-practice button','检查这一版文字');
 await until(()=>document.querySelector('#learning-practice')?.textContent.includes('自由表达已保存 · 待核对'),null,'pending free expression');
 await loadPage('Page.reload',{ignoreCache:true});await until(()=>!!document.querySelector('#learning-practice h1'),null,'transfer address reload');
 assert.equal(await evaluate(()=>document.querySelector('#learning-practice textarea')?.value),expression);
 const final=await state();assert.equal(final.nce['NCE1-1'].notes,initial.nce['NCE1-1'].notes);assert.equal(final.drafts['expression-NCE1-1'],initial.drafts['expression-NCE1-1']);
 summary.checks.push('NCE2 filtered selected-guide route / reload / exact transfer task / saved free expression pending / old sample retained');summary.transferRoute=route.hash;
 await evaluate(()=>document.querySelector('#learning-practice').scrollIntoView({block:'start'}));await noOverflow('free expression');await screenshot('transfer-390.png');
 assert.equal(errors.length,0,'No uncaught browser runtime exceptions');
 summary.result='passed';await writeFile(new URL('browser-verification.json',output),JSON.stringify(summary,null,2)+'\n');
 console.log(JSON.stringify({...summary,evidence:fileURLToPath(output)},null,2));
}finally{socket.close()}
