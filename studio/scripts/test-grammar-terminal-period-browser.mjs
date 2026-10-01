import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';

// Run against the existing, built production-curriculum preview with a fresh
// task-owned Chrome profile. No learner/browser account or remote app is read.
const origin=process.env.GRAMMAR_PERIOD_PREVIEW_ORIGIN||'http://127.0.0.1:4217';
const debug=process.env.GRAMMAR_PERIOD_DEBUG_ORIGIN||'http://127.0.0.1:4218';
const previewKey='english-studio-grammar-preview-v1';
const app=new URL('../app/',import.meta.url);
const core=JSON.parse(await readFile(new URL('data/grammar-curriculum/core-units.json',app),'utf8'))[0];
const relative=JSON.parse(await readFile(new URL('data/grammar-curriculum/depth-clauses/relative-reference.json',app),'utf8'));
const nonfinite=JSON.parse(await readFile(new URL('data/grammar-curriculum/depth-remaining/requests-nonfinite.json',app),'utf8'));
const rewrite=JSON.parse(await readFile(new URL('data/grammar-curriculum/depth-remaining/structure-rewrite.json',app),'utf8'));
const output=new URL('../work/terminal-period-browser-check/',import.meta.url);
await mkdir(output,{recursive:true});
const pages=await fetch(debug+'/json/list').then(response=>response.json());
const page=pages.find(item=>item.type==='page'&&item.url.startsWith(origin));
assert(page?.webSocketDebuggerUrl,'Start task-owned Chrome at the local preview URL before running this test');
const socket=new WebSocket(page.webSocketDebuggerUrl),pending=new Map(),exceptions=[];
let sequence=0;
socket.addEventListener('message',event=>{
 const message=JSON.parse(event.data);
 if(message.method==='Runtime.exceptionThrown')exceptions.push(message.params.exceptionDetails.text);
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
 const deadline=Date.now()+10000;
 while(Date.now()<deadline){if(await evaluate(fn,arg))return;await new Promise(resolve=>setTimeout(resolve,80))}
 throw Error('DOM did not settle: '+label);
}
await send('Page.enable');await send('Runtime.enable');
const cases=[
 {unit:core,id:'core-p1',value:"We're at home.",passed:true},
 {unit:core,id:'core-p1',value:"We're at home。",passed:true,screenshot:'u1-chinese-period-desktop.png'},
 {unit:core,id:'core-p1',value:"We’re at home。 \n",passed:true,mobile:true,screenshot:'u1-chinese-period-mobile.png'},
 {unit:core,id:'core-p1',value:"We aren't at home。",passed:false},
 {unit:core,id:'core-p1',value:'We were at home。',passed:false},
 {unit:core,id:'core-p1',value:'We at home。',passed:false},
 {unit:relative,id:'relative-reference-v1-produce',value:relative.practices.find(q=>q.id==='relative-reference-v1-produce').answer.replaceAll('.','。'),passed:true},
 {unit:relative,id:'relative-reference-v1-produce',value:relative.practices.find(q=>q.id==='relative-reference-v1-produce').answer.replace('. ',' ').replace(/\.$/,'。'),passed:false},
 {unit:nonfinite,id:'requests-nonfinite-v1-produce',value:nonfinite.practices.find(q=>q.id==='requests-nonfinite-v1-produce').answer.replaceAll(',','，').replace(/\.$/,'。'),passed:true},
 {unit:nonfinite,id:'requests-nonfinite-v1-produce',value:nonfinite.practices.find(q=>q.id==='requests-nonfinite-v1-produce').answer.replaceAll(',','').replace(/\.$/,'。'),passed:false},
 {unit:rewrite,id:'structure-rewrite-v1-produce',value:rewrite.practices.find(q=>q.id==='structure-rewrite-v1-produce').answer.replaceAll('.','。'),passed:true},
 {unit:rewrite,id:'structure-rewrite-v1-produce',value:rewrite.practices.find(q=>q.id==='structure-rewrite-v1-produce').answer.replace('. ','; ').replace(/\.$/,'。'),passed:false},
];
const results=[];
try{
 for(const test of cases){
  await send('Emulation.setDeviceMetricsOverride',{width:test.mobile?390:1280,height:test.mobile?844:900,deviceScaleFactor:1,mobile:!!test.mobile});
  const questions=test.unit.practices.filter(q=>q.variant===1),key=`grammar-curriculum-v1-${test.unit.id}`;
  assert.equal(questions.at(-1).id,test.id,'This browser fixture resumes the actual third question');
  const record={version:1,contentVersion:1,seenAt:Date.now()-1000,round:1,inRound:true,assisted:false,attempts:[],responses:Object.fromEntries(questions.slice(0,2).map(q=>[q.id,{value:q.answer,checkedValue:q.answer,matched:true,hintLevel:0}]))};
  const state={version:1,lastLesson:1,completed:[],scores:{},mistakes:{},cards:{},days:[],attempts:0,correct:0,custom:[],nce:{'NCE1-1':{title:'Old lesson',text:'',notes:'Original note',steps:['listen']}},drafts:{[key]:JSON.stringify(record),'expression-NCE1-1':'Original unchecked draft'}};
  await evaluate(({previewKey,state})=>localStorage.setItem(previewKey,JSON.stringify(state)),{previewKey,state});
  await send('Page.reload');
  await until(()=>document.querySelectorAll('.grammar-unit-order').length===28,undefined,'all 28 registered units');
  await evaluate(order=>{
   const number=[...document.querySelectorAll('.grammar-unit-order')].find(node=>node.textContent===String(order));
   if(!number)throw Error('Missing actual unit card');number.closest('button').click();
  },test.unit.order);
  await until(()=>document.querySelector('.grammar-question-position')?.textContent.includes('第 3 / 3 题'),undefined,'actual group 2 Q3');
  await evaluate(value=>{
   const textarea=document.querySelector('.grammar-progressive-practice textarea');
   Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(textarea,value);
   textarea.dispatchEvent(new Event('input',{bubbles:true}));
  },test.value);
  await until(({previewKey,key,id,value})=>{
   const saved=JSON.parse(localStorage.getItem(previewKey)||'{}');
   return JSON.parse(saved.drafts?.[key]||'{}').responses?.[id]?.value===value;
  },{previewKey,key,id:test.id,value:test.value},'real React answer write');
  await evaluate(()=>[...document.querySelectorAll('button')].find(node=>node.textContent.includes('提交本轮')).click());
  await until(()=>!!document.querySelector('.grammar-round-result'),undefined,'actual submitted feedback');
  const observed=await evaluate(({previewKey,key,prompt})=>{
   const saved=JSON.parse(localStorage.getItem(previewKey));
   const row=[...document.querySelectorAll('.grammar-round-result li')].find(node=>node.textContent.includes(prompt));
   return {text:row?.textContent,status:row?.querySelector('strong')?.textContent,saved,record:JSON.parse(saved.drafts[key]),overflow:document.documentElement.scrollWidth>innerWidth};
  },{previewKey,key,prompt:questions.at(-1).prompt});
  assert.equal(observed.status.includes('与参考一致'),test.passed);
  assert.equal(observed.status.includes('待核对'),!test.passed);
  assert.equal(observed.record.responses[test.id].checkedValue,test.value);
  assert.equal(observed.record.responses[test.id].matched,test.passed);
  assert.equal(observed.record.attempts.at(-1).passed,test.passed);
  assert.equal(observed.saved.drafts['expression-NCE1-1'],state.drafts['expression-NCE1-1']);
  assert.deepEqual(observed.saved.nce,state.nce);
  assert(!observed.overflow,'The tested desktop/mobile feedback has no horizontal overflow');
  if(test.screenshot){
   const screenshot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
   await writeFile(new URL(test.screenshot,output),Buffer.from(screenshot.data,'base64'));
  }
  await send('Page.reload');
  await until(()=>document.querySelectorAll('.grammar-unit-order').length===28,undefined,'reload overview');
  const afterReload=await evaluate(({previewKey,key})=>JSON.parse(JSON.parse(localStorage.getItem(previewKey)).drafts[key]),{previewKey,key});
  assert.equal(afterReload.responses[test.id].checkedValue,test.value);assert.equal(afterReload.responses[test.id].matched,test.passed);
  assert.equal(afterReload.attempts.at(-1).passed,test.passed);
  results.push({unit:test.unit.order,id:test.id,value:test.value,passed:test.passed,viewport:test.mobile?'390x844':'1280x900',feedback:observed.status});
 }
 assert.deepEqual(exceptions,[],'No browser runtime exceptions');
 await writeFile(new URL('results.json',output),JSON.stringify({cases:results,exceptions},null,2)+'\n');
 console.log(`Real Chrome: ${results.length} bounded cases passed; U1 ASCII/Chinese/curly contraction, negation/tense/missing-be rejection, U16/U27/U28 required boundaries, desktop/mobile screenshots, raw answers and unrelated records preserved after reload; no runtime exceptions.`);
}finally{socket.close()}
