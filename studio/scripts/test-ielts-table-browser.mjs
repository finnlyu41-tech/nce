import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

// The runner starts a localhost preview and Chrome with an empty task-owned
// profile. This check creates its own tab and never selects a personal tab.
// Answer fixtures must be supplied by the root after independent review freezes.
const origin=process.env.TABLE_PREVIEW_ORIGIN||'http://127.0.0.1:4326';
const debugging=process.env.TABLE_DEBUG_ORIGIN||'http://127.0.0.1:4327';
const evidence=path.resolve(process.env.TABLE_EVIDENCE_DIR||'/tmp/ielts-table-browser-evidence');
const previewKey='ielts-table-preview:v1';
const fixtureFile=process.env.TABLE_FROZEN_KEYS_FILE;
const simulatedReview=process.env.TABLE_TEST_SIMULATED_REVIEW==='1';
for(const address of [origin,debugging]){
 const url=new URL(address);
 assert.equal(url.protocol,'http:','Only a task-owned HTTP localhost preview is allowed');
 assert(['127.0.0.1','localhost','[::1]'].includes(url.hostname),'Only loopback origins are allowed');
}
assert(/^\/(?:private\/)?tmp\/.+/.test(evidence),'Evidence must remain in a task-owned temporary directory');
await mkdir(evidence,{recursive:true});

const summary={
 result:'running',previewOrigin:origin,debugOrigin:debugging,
 profile:'empty task-owned profile supplied by runner',storageKey:previewKey,
 productionStorageWritten:false,productionPublished:false,
 audioNotApplicable:true,audioChecksPerformed:0,
 reviewClock:{mode:simulatedReview?'simulated':'not-advanced',actual24HoursElapsed:false},
 excludedChecks:[{id:'invalid-question-id',owner:'root pure-interface tests',browserChecked:false}],
 checks:[],checkCount:0,keyboardCharacters:0,viewports:[],screenshots:[],
 consoleErrors:[],runtimeErrors:[],browserLogErrors:[],
 startedAt:new Date().toISOString(),
};
let socket,pageId,clockScript,sequence=0,loads=0;
const pending=new Map();
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function record(label,detail){
 summary.checks.push({label,...(detail===undefined?{}:{detail})});
 summary.checkCount=summary.checks.length;
}
function check(condition,label,detail){
 assert.ok(condition,label+(detail===undefined?'':': '+JSON.stringify(detail)));
 record(label,detail);
}
async function send(method,params={}){
 const id=++sequence;
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method))},15000);
  pending.set(id,{resolve,reject,timer});
  socket.send(JSON.stringify({id,method,params}));
 });
}
async function evaluate(fn,arg){
 const result=await send('Runtime.evaluate',{
  expression:'('+fn.toString()+')('+JSON.stringify(arg)+')',returnByValue:true,awaitPromise:true,
 });
 if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);
 return result.result.value;
}
async function until(fn,arg,label){
 const end=Date.now()+12000;
 while(Date.now()<end){
  if(await evaluate(fn,arg))return;
  await pause(80);
 }
 throw Error('DOM did not settle: '+label);
}
const ready=()=>typeof window.__ieltsTablePreviewInspect==='function'&&!!document.querySelector('main[data-preview-key]');
async function loadPage(method,params={}){
 const previous=loads;
 const result=await send(method,params);
 if(method==='Page.navigate'&&!result.loaderId)await send('Page.reload',{ignoreCache:true});
 const end=Date.now()+12000;
 while(loads===previous&&Date.now()<end)await pause(80);
 assert.ok(loads>previous,'The task-owned document must finish loading');
 await until(ready,null,'table preview inspection API');
}
async function inspect(){
 const value=await evaluate(()=>window.__ieltsTablePreviewInspect());
 assert.equal(value.storageKey,previewKey,'Inspection must read only the isolated preview key');
 const raw=await evaluate(key=>localStorage.getItem(key),previewKey);
 assert.equal(value.raw??null,raw,'Inspection must read the current stored raw text');
 return value;
}
function session(snapshot){
 assert.equal(snapshot.status,'ready','Progress must pass the real canonical parser');
 assert.equal(snapshot.value.variant,'academic','This preview exercises only the Academic table chain');
 const value=snapshot.value.sessions[snapshot.value.variant+':'+snapshot.value.lessonId];
 assert.ok(value,'The selected canonical session must exist');
 return value;
}
async function waitStage(stage){
 await until(stage=>window.__ieltsTablePreviewInspect().stage===stage,stage,'canonical stage '+stage);
 const snapshot=await inspect();
 if(stage==='explain'){
  assert.equal(snapshot.status,'ready');
  assert.equal(snapshot.value.variant,'academic');
  const owner=snapshot.value.sessions[snapshot.value.variant+':'+snapshot.value.lessonId];
  // open-lesson selects the lesson without inventing a session or an exposure.
  // The real sampleSession selector legitimately supplies the empty explain view.
  assert.ok(owner===undefined||owner.stage==='explain');
 }else assert.equal(session(snapshot).stage,stage);
 return snapshot;
}
async function click(text){
 await evaluate(text=>{
  const button=[...document.querySelectorAll('button')].find(element=>element.textContent.trim()===text);
  if(!button)throw Error('Button missing: '+text);
  if(button.disabled)throw Error('Button disabled: '+text);
  button.click();
 },text);
}
async function key(key,modifiers=0,text){
 const special={Tab:9,Backspace:8,ArrowLeft:37,ArrowRight:39,Enter:13};
 const params={key,modifiers,...(special[key]?{windowsVirtualKeyCode:special[key]}:{}),...(text?{text,unmodifiedText:text}:{})};
 await send('Input.dispatchKeyEvent',{type:'keyDown',...params});
 await send('Input.dispatchKeyEvent',{type:'keyUp',key,modifiers,...(special[key]?{windowsVirtualKeyCode:special[key]}:{})});
}
async function activeQuestion(){
 return evaluate(()=>{
  const input=document.activeElement;
  return input?.matches('input')?{
   id:input.closest('[data-question-id]')?.getAttribute('data-question-id'),
   role:input.closest('[data-table-role]')?.getAttribute('data-table-role'),
   value:input.value,readOnly:input.readOnly,disabled:input.disabled,
  }:null;
 });
}
async function tabTo(questionId,role='draft',reverse=false){
 for(let step=0;step<70;step++){
  await key('Tab',reverse?8:0);
  const active=await activeQuestion();
  if(active?.id===questionId&&active.role===role)return;
 }
 throw Error('Keyboard navigation did not reach '+role+' '+questionId);
}
async function selectAll(){
 const mac=await evaluate(()=>/Mac/.test(navigator.platform));
 const modifiers=mac?4:2;
 // CDP explicitly supports native editing commands such as selectAll.
 // https://github.com/ChromeDevTools/devtools-protocol/blob/master/json/browser_protocol.json
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers,commands:['selectAll']});
 await send('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers});
 const selection=await evaluate(()=>{
  const input=document.activeElement;
  return {textControl:input?.matches('input,textarea'),length:input?.value?.length,start:input?.selectionStart,end:input?.selectionEnd};
 });
 assert.ok(selection.textControl&&selection.start===0&&selection.end===selection.length,'Native CDP Select All must select the entire focused input: '+JSON.stringify(selection));
}
async function inputDiagnostic(label,questionId){
 const detail=await evaluate(questionId=>{
  const input=[...document.querySelectorAll('[data-table-role="draft"] input')].find(element=>element.closest('[data-question-id]')?.getAttribute('data-question-id')===questionId);
  const active=document.activeElement;
  const describe=element=>element?{
   tag:element.tagName,id:element.id,questionId:element.closest('[data-question-id]')?.getAttribute('data-question-id'),
   role:element.closest('[data-table-role]')?.getAttribute('data-table-role'),
   value:element.value,valueLength:element.value?.length,
   selectionStart:element.selectionStart,selectionEnd:element.selectionEnd,selectionDirection:element.selectionDirection,
   readOnly:element.readOnly,disabled:element.disabled,
  }:null;
  const snapshot=window.__ieltsTablePreviewInspect();
  const owner=snapshot.value?.sessions[snapshot.value.variant+':'+snapshot.value.lessonId];
  return {
   platform:navigator.platform,active:describe(active),target:describe(input),
   status:snapshot.status,stage:snapshot.stage,materialId:snapshot.materialId,
   canonicalRaw:snapshot.raw,canonicalAnswer:owner?.drafts[snapshot.materialId]?.answers[questionId],
   alerts:[...document.querySelectorAll('[role="alert"]')].map(element=>element.textContent),
   unsaved:[...document.querySelectorAll('[data-unsaved-input="true"]')].map(element=>element.textContent),
  };
 },questionId);
 (summary.inputDiagnostics||=[]).push({label,questionId,...detail});
}
async function replaceText(value,diagnosticLabel,questionId){
 if(diagnosticLabel)await inputDiagnostic(diagnosticLabel+' before Select All',questionId);
 await selectAll();
 if(diagnosticLabel)await inputDiagnostic(diagnosticLabel+' after Select All',questionId);
 await send('Input.insertText',{text:value});
 if(diagnosticLabel){await pause(30);await inputDiagnostic(diagnosticLabel+' after native Insert Text',questionId)}
}
async function typeCharacters(questionId,value,role='draft'){
 const active=await activeQuestion();
 if(active?.id!==questionId||active.role!==role)await tabTo(questionId,role);
 await selectAll();await key('Backspace');
 await until(({questionId,role})=>{
  const snapshot=window.__ieltsTablePreviewInspect();
  const owner=snapshot.value?.sessions[snapshot.value.variant+':'+snapshot.value.lessonId];
  const answers=role==='correction'?owner?.correctionAnswers:owner?.drafts[snapshot.materialId]?.answers;
  return answers?.[questionId]===''||answers?.[questionId]===undefined;
 },{questionId,role},'empty raw input saved');
 let raw='';
 for(const character of value){
  await key(character,0,character);raw+=character;summary.keyboardCharacters++;
  await until(({questionId,role,raw})=>{
   const snapshot=window.__ieltsTablePreviewInspect();
   const owner=snapshot.value?.sessions[snapshot.value.variant+':'+snapshot.value.lessonId];
   const answers=role==='correction'?owner?.correctionAnswers:owner?.drafts[snapshot.materialId]?.answers;
   return snapshot.status==='ready'&&answers?.[questionId]===raw;
  },{questionId,role,raw},'each typed raw character persisted');
  const focused=await activeQuestion();
  assert.equal(focused?.id,questionId,'Typing must preserve the active question');
  assert.equal(focused?.value,raw,'The input must preserve exact raw characters');
  assert.equal(await evaluate(()=>scrollX),0,'Typing must not shift the whole page horizontally');
 }
 record('Every keyboard character reaches canonical raw progress without focus jumping',{questionId,role,characters:value.length,raw:value});
}
async function viewport(width,height=844){
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});
 summary.viewports.push({width,height});
}
async function installClockFixture(offsetMs){
 if(clockScript)await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:clockScript});
 const source='(()=>{const actualNow=Date.now.bind(Date);const fixture={offsetMs:'+offsetMs+'};Object.defineProperty(window,"__tableBrowserClockFixture",{value:fixture});Date.now=()=>actualNow()+fixture.offsetMs})()';
 clockScript=(await send('Page.addScriptToEvaluateOnNewDocument',{source})).identifier;
 summary.reviewClock.fixture='CDP-only Date.now offset in the task tab; no preview clock API or system clock change';
}
async function advanceClockFixture(milliseconds){
 const offsetMs=(summary.reviewClock.offsetMs||0)+milliseconds;
 await installClockFixture(offsetMs);
 await evaluate(offsetMs=>{
  if(!window.__tableBrowserClockFixture)throw Error('The explicit CDP clock fixture was not installed');
  window.__tableBrowserClockFixture.offsetMs=offsetMs;
 },offsetMs);
 summary.reviewClock.offsetMs=offsetMs;
}
async function noOverflow(label){
 const sizes=await evaluate(()=>({
  viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth,pageX:scrollX,
 }));
 check(sizes.document<=sizes.viewport+1&&sizes.body<=sizes.viewport+1&&sizes.pageX===0,label+' has no page-wide horizontal overflow',sizes);
}
async function screenshot(name){
 const png=Buffer.from((await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64');
 const file=path.join(evidence,name+'.png');
 await writeFile(file,png);
 summary.screenshots.push({
  name:name+'.png',file,sha256:createHash('sha256').update(png).digest('hex'),bytes:png.length,
  viewport:await evaluate(()=>({width:innerWidth,height:innerHeight})),activeQuestion:await activeQuestion(),
 });
}
async function tableInfo(role='draft'){
 return evaluate(role=>{
  const wrapper=document.querySelector('[data-table-role="'+role+'"]');
  const table=wrapper?.querySelector('table');
  if(!table)return null;
  const inputs=[...table.querySelectorAll('input')].map((input,index)=>{
   const cell=input.closest('td');
   const ids=(cell?.getAttribute('headers')||'').trim().split(/\s+/).filter(Boolean);
   const headers=ids.map(id=>document.getElementById(id));
   const row=headers.find(header=>header?.getAttribute('scope')==='row');
   const column=headers.find(header=>header?.getAttribute('scope')==='col');
   const q=input.closest('[data-question-id]');
   const questionId=q?.getAttribute('data-question-id');
   const number=input.getAttribute('data-question-number')||q?.getAttribute('data-question-number')||questionId?.match(/(?:-q|question-?|q)(\d+)$/i)?.[1]||String(index+1);
   return {
    questionId,number,inputId:input.id,
    headers:ids,row:row?.textContent.trim(),column:column?.textContent.trim(),
    validHeaders:headers.length>=2&&headers.every(header=>header&&table.contains(header)&&document.querySelectorAll('#'+CSS.escape(header.id)).length===1),
    value:input.value,readOnly:input.readOnly,disabled:input.disabled,
   };
  });
  let scroller=table.parentElement;
  while(scroller&&scroller!==wrapper.parentElement&&!['auto','scroll'].includes(getComputedStyle(scroller).overflowX))scroller=scroller.parentElement;
  if(!scroller||scroller===wrapper.parentElement)scroller=table.parentElement;
  return {
   materialId:wrapper.getAttribute('data-material-id'),role,caption:table.caption?.textContent.trim(),
   rowHeaders:[...table.querySelectorAll('tbody th[scope="row"]')].map(th=>th.textContent.trim()),
   columnHeaders:[...table.querySelectorAll('thead th[scope="col"]')].map(th=>th.textContent.trim()),
   allThScoped:[...table.querySelectorAll('th')].every(th=>['row','col','rowgroup','colgroup'].includes(th.getAttribute('scope'))),
   inputs,scroller:{tabIndex:scroller.tabIndex,overflowX:getComputedStyle(scroller).overflowX,scrollWidth:scroller.scrollWidth,clientWidth:scroller.clientWidth,scrollLeft:scroller.scrollLeft},
  };
 },role);
}
async function accessibleName(inputId){
 assert.ok(inputId,'Every table input must have a stable unique DOM id');
 const {root}=await send('DOM.getDocument');
 const {nodeId}=await send('DOM.querySelector',{nodeId:root.nodeId,selector:'#'+inputId.replace(/([^\w-])/g,'\\$1')});
 assert.ok(nodeId,'The actual input DOM node must exist');
 const result=await send('Accessibility.getPartialAXTree',{nodeId,fetchRelatives:false});
 return result.nodes.find(node=>!node.ignored)?.name?.value||'';
}
async function validateTable(role='draft'){
 const info=await tableInfo(role);
 check(!!info,role+' is rendered as a real HTML table');
 check(!!info.caption,role+' table has a nonempty native caption',{caption:info.caption});
 check(info.rowHeaders.length>0&&info.columnHeaders.length>0&&info.allThScoped,role+' has scoped row and column headers');
 const normalize=value=>value.replace(/\s+/g,' ').trim();
 for(const input of info.inputs){
  check(input.validHeaders&&!!input.row&&!!input.column,'Cell headers map to unique row and column th elements',{questionId:input.questionId,headers:input.headers,row:input.row,column:input.column});
  const name=normalize(await accessibleName(input.inputId));
  const number=new RegExp('(?:Question\\s*|Q\\s*)'+input.number+'\\b|第\\s*'+input.number+'\\s*题','i');
  check(number.test(name)&&name.includes(normalize(input.row))&&name.includes(normalize(input.column)),'Native accessible input name includes question number, row and column',{questionId:input.questionId,name});
 }
 return info;
}
async function visibleFocus(questionId,role='draft'){
 const focus=await evaluate(({questionId,role})=>{
  const input=document.activeElement;
  const wrapper=input?.closest('[data-table-role]');
  const table=input?.closest('table');
  let scroller=table?.parentElement;
  while(scroller&&scroller!==wrapper?.parentElement&&!['auto','scroll'].includes(getComputedStyle(scroller).overflowX))scroller=scroller.parentElement;
  if(!scroller||scroller===wrapper?.parentElement)scroller=table?.parentElement;
  if(!input?.matches('input')||!scroller)return null;
  const r=input.getBoundingClientRect(),s=scroller.getBoundingClientRect(),style=getComputedStyle(input);
  const outline=parseFloat(style.outlineWidth)>0&&style.outlineStyle!=='none'&&!/^(transparent|rgba\(0, 0, 0, 0\))$/.test(style.outlineColor);
  return {
   expected:input.closest('[data-question-id]')?.getAttribute('data-question-id')===questionId&&wrapper.getAttribute('data-table-role')===role,
   focusVisible:input.matches(':focus-visible'),outline,outlineStyle:style.outline,
   input:{left:r.left,right:r.right,top:r.top,bottom:r.bottom},
   clip:{left:s.left+scroller.clientLeft,right:s.left+scroller.clientLeft+scroller.clientWidth,top:s.top+scroller.clientTop,bottom:s.top+scroller.clientTop+scroller.clientHeight},
   inViewport:r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1,
  };
 },{questionId,role});
 check(focus?.expected&&focus.focusVisible&&focus.outline,'Tab focus is visibly styled',{questionId,role,focus});
 check(focus.inViewport&&focus.input.left>=focus.clip.left-1&&focus.input.right<=focus.clip.right+1&&focus.input.top>=focus.clip.top-1&&focus.input.bottom<=focus.clip.bottom+1,'Focused input remains visible inside its local scroller',{questionId,role});
}
async function showTable(role='draft'){
 await evaluate(role=>{
  const table=document.querySelector('[data-table-role="'+role+'"] table');
  if(!table)throw Error('Visible table missing: '+role);
  const wrapper=table.closest('[data-table-role]');
  let scroller=table.parentElement;
  while(scroller&&scroller!==wrapper.parentElement&&!['auto','scroll'].includes(getComputedStyle(scroller).overflowX))scroller=scroller.parentElement;
  if(!scroller||scroller===wrapper.parentElement)scroller=table.parentElement;
  scroller.scrollIntoView({block:'center',inline:'nearest'});
 },role);
}
async function exerciseScroll(role,width){
 const before=await tableInfo(role);
 check(before.scroller.tabIndex>=0&&['auto','scroll'].includes(before.scroller.overflowX),'Table has a keyboard-operable local scroll container',{width,role,scroller:before.scroller});
 if(before.scroller.scrollWidth<=before.scroller.clientWidth+1){
  record('This table fits the local viewport without horizontal scrolling',{width,role});
  return false;
 }
 await key('Tab');
 await evaluate(role=>{
  const wrapper=document.querySelector('[data-table-role="'+role+'"]'),table=wrapper.querySelector('table');
  let scroller=table.parentElement;
  while(scroller&&scroller!==wrapper.parentElement&&!['auto','scroll'].includes(getComputedStyle(scroller).overflowX))scroller=scroller.parentElement;
  if(!scroller||scroller===wrapper.parentElement)scroller=table.parentElement;
  scroller.scrollLeft=0;scroller.focus();
 },role);
 await key('ArrowRight');await key('ArrowRight');await key('ArrowRight');
 await until(role=>{
  const wrapper=document.querySelector('[data-table-role="'+role+'"]'),table=wrapper.querySelector('table');
  let scroller=table.parentElement;
  while(scroller&&scroller!==wrapper.parentElement&&!['auto','scroll'].includes(getComputedStyle(scroller).overflowX))scroller=scroller.parentElement;
  if(!scroller||scroller===wrapper.parentElement)scroller=table.parentElement;
  return scroller.scrollLeft>0;
 },role,'keyboard local table scrolling');
 const after=await tableInfo(role);
 check(after.scroller.scrollLeft>0,'Arrow keys scroll the actual local table',{width,role,before:before.scroller.scrollLeft,after:after.scroller.scrollLeft});
 await noOverflow('keyboard table scrolling '+width);
 return true;
}
async function noEarlyFeedback(label){
 const data=await evaluate(()=>{
  const stage=document.querySelector('[data-stage]');
  return {
   stage:stage?.getAttribute('data-stage'),text:stage?.textContent||'',html:stage?.innerHTML||'',
   references:stage?.querySelectorAll('[data-why],[data-golden],[data-answer-key],ol[aria-label="示范答案与依据"]').length||0,
  };
 });
 check(data.stage!=='model'&&data.references===0&&!/答案与依据|参考答案|参考字母组/.test(data.text)&&!/data-(?:accepted|why|golden|answer-key)=/.test(data.html),label+' has no unsubmitted answer-key or why DOM');
 return data;
}
async function confirmUnseen(){
 await evaluate(()=>{
  const checkbox=[...document.querySelectorAll('[data-stage] input[type="checkbox"]')].find(input=>input.closest('label')?.textContent.includes('我此前没有接触过'));
  if(checkbox&&!checkbox.checked)checkbox.click();
 });
}
async function fillFrozenAnswers(packet,role='draft'){
 const table=await tableInfo(role);
 assert.ok(table?.inputs.length,'The real table must expose its question inputs');
 for(const input of table.inputs){
  const answer=packet.answers[input.questionId];
  assert.equal(typeof answer,'string','Frozen fixture missing '+input.questionId);
  await typeCharacters(input.questionId,answer,role);
 }
}
async function submitAndCheckReadOnly(stage){
 const before=await inspect(),materialId=before.materialId;
 const expected=structuredClone(session(before).drafts[materialId].answers);
 await click('记录原始作答');
 await until(materialId=>{
  const snapshot=window.__ieltsTablePreviewInspect();
  return snapshot.value?.sessions[snapshot.value.variant+':'+snapshot.value.lessonId]?.drafts[materialId]?.submittedAt>0;
 },materialId,'submitted original');
 const after=await inspect(),owner=session(after),attempt=owner.attempts.at(-1);
 assert.equal(attempt.stage,stage);assert.equal(attempt.materialId,materialId);
 assert.deepEqual(attempt.answers,expected);
 const original=await tableInfo('original');
 check(!!original&&original.inputs.every(input=>input.readOnly||input.disabled),'First submitted answers render read-only',{stage,materialId});
 const first=original.inputs.find(input=>!input.disabled);
 if(first){
  await tabTo(first.questionId,'original');
  await send('Input.insertText',{text:'SHOULD_NOT_EDIT_ORIGINAL'});
  const unchanged=await inspect();
  assert.deepEqual(session(unchanged).attempts.at(-1),attempt);
  assert.deepEqual(session(unchanged).drafts[materialId].answers,expected);
  assert.equal((await activeQuestion())?.value,expected[first.questionId]);
  record('A real keyboard edit cannot overwrite the submitted original',{stage,materialId});
 }
 check(attempt.audioUsable===false&&attempt.playbackCount===0&&attempt.playbackFailures===0,'Reading attempt contains no invented audio evidence',{stage,materialId});
 return {materialId,attempt,answers:expected};
}
async function testBlockedRaw(kind,raw){
 await evaluate(({key,raw})=>localStorage.setItem(key,raw),{key:previewKey,raw});
 await loadPage('Page.reload',{ignoreCache:true});
 await until(()=>window.__ieltsTablePreviewInspect().status==='blocked',null,kind+' canonical blocked state');
 const snapshot=await inspect();
 assert.equal(snapshot.raw,raw);
 const locked=await evaluate(()=>({
  alert:document.querySelector('[role="alert"]')?.textContent,
  editable:[...document.querySelectorAll('input,textarea,select')].filter(input=>!input.disabled&&!input.readOnly).length,
  tables:document.querySelectorAll('[data-table-role]').length,
 }));
 check(!!locked.alert&&locked.editable===0&&locked.tables===0,kind+' raw opens a read-only recovery view',locked);
 await click('重新读取已保存记录');
 await pause(120);
 check((await inspect()).raw===raw,kind+' raw is retained byte for byte after rereading',{bytes:Buffer.byteLength(raw),sha256:createHash('sha256').update(raw).digest('hex')});
 await noOverflow(kind+' recovery');await screenshot('blocked-'+kind+'-390');
}

try{
 assert.ok(fixtureFile,'Set TABLE_FROZEN_KEYS_FILE to root-provided independently frozen browser fixtures');
 const packet=JSON.parse(await readFile(fixtureFile,'utf8'));
 assert.equal(packet.status,'frozen','The browser answer fixture must be frozen before use');
 assert.ok(packet.answers&&typeof packet.answers==='object','Frozen fixture must provide an answers map by DOM question id');
 summary.fixture={file:fixtureFile,status:packet.status,sourceHash:packet.sourceHash??null};
 const response=await fetch(debugging+'/json/new?'+encodeURIComponent(origin+'/'),{method:'PUT'});
 assert.ok(response.ok,'Start task-owned Chrome on the specified debugging origin before this check');
 const page=await response.json();pageId=page.id;
 assert.ok(page.webSocketDebuggerUrl,'Chrome must return a new task-owned page target');
 assert(['127.0.0.1','localhost','[::1]'].includes(new URL(page.webSocketDebuggerUrl).hostname),'The CDP socket must remain on loopback');
 socket=new WebSocket(page.webSocketDebuggerUrl);
 socket.addEventListener('message',event=>{
  const message=JSON.parse(event.data);
  if(message.method==='Page.loadEventFired')loads++;
  if(message.method==='Runtime.exceptionThrown')summary.runtimeErrors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);
  if(message.method==='Runtime.consoleAPICalled'&&message.params.type==='error')summary.consoleErrors.push(message.params.args.map(arg=>arg.value??arg.description??'').join(' '));
  if(message.method==='Log.entryAdded'&&message.params.entry.level==='error')summary.browserLogErrors.push(message.params.entry.text);
  if(message.id&&pending.has(message.id)){
   const request=pending.get(message.id);pending.delete(message.id);clearTimeout(request.timer);
   if(message.error)request.reject(Error(JSON.stringify(message.error)));else request.resolve(message.result);
  }
 });
 await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
 await send('Page.enable');await send('Runtime.enable');await send('Log.enable');await send('Accessibility.enable');
 if(simulatedReview)await installClockFixture(0);
 await loadPage('Page.navigate',{url:origin+'/'});
 const otherStorage=await evaluate(key=>Object.fromEntries(Object.keys(localStorage).filter(item=>item!==key).map(item=>[item,localStorage.getItem(item)])),previewKey);
 await evaluate(key=>localStorage.removeItem(key),previewKey);
 await loadPage('Page.reload',{ignoreCache:true});
 await until(()=>window.__ieltsTablePreviewInspect().status!=='blocked',null,'empty isolated preview');
 if(await evaluate(()=>!![...document.querySelectorAll('button')].find(button=>button.textContent.trim()==='Academic'&&!button.disabled)))await click('Academic');
 if(await evaluate(()=>!![...document.querySelectorAll('button')].find(button=>button.textContent.trim()==='打开表格练习'&&!button.disabled)))await click('打开表格练习');
 await waitStage('explain');
 await click('看一个完整小示范');await waitStage('model');
 await viewport(1280,960);await showTable('model');
 await validateTable('model');await noOverflow('desktop model');await screenshot('table-model-desktop');
 const modelInputs=await tableInfo('model');
 check(modelInputs.inputs.length>0&&modelInputs.inputs.every(input=>input.readOnly&&!input.disabled&&input.value.trim()),'Explicit model answers use read-only, focusable controls');
 check(await evaluate(()=>[...document.querySelectorAll('[data-table-role="draft"] input,[data-table-role="correction"] input')].every(input=>input.readOnly||input.disabled)),'The model has no editable learner answer or correction inputs');
 const modelSnapshot=await inspect(),modelOwner=session(modelSnapshot),modelDraft=modelOwner.drafts[modelSnapshot.materialId];
 check(!!modelDraft&&Object.keys(modelDraft.answers).length===0&&modelDraft.response===''&&modelDraft.submittedAt===0&&!modelOwner.attempts.some(attempt=>attempt.materialId===modelSnapshot.materialId),'Displayed model answers do not become learner draft answers or submitted attempts',{materialId:modelSnapshot.materialId});
 check(await evaluate(()=>!document.querySelector('audio,.sample-audio')),'This reading preview has no audio UI');
 await click('带着方法试一次');await waitStage('guided');
 const guidedBefore=await noEarlyFeedback('guided');
 await validateTable('draft');
 let narrowScrollable=false;
 for(const width of [320,390,1280]){
  await viewport(width,width===1280?960:844);await showTable();
  await noOverflow('draft table '+width);await screenshot('table-current-'+width);
  if(width<600)narrowScrollable=await exerciseScroll('draft',width)||narrowScrollable;
  const info=await tableInfo();
  await tabTo(info.inputs[0].questionId);await showTable();await visibleFocus(info.inputs[0].questionId);
  await screenshot('table-keyboard-focus-'+width);
  if(info.inputs.length>1){
   await key('Tab');assert.equal((await activeQuestion())?.id,info.inputs[1].questionId);
   await visibleFocus(info.inputs[1].questionId);
   await key('Tab',8);assert.equal((await activeQuestion())?.id,info.inputs[0].questionId);
   await visibleFocus(info.inputs[0].questionId);
   record('Tab and Shift+Tab follow actual table inputs',{width,from:info.inputs[0].questionId,to:info.inputs[1].questionId});
  }
  if(width<600)await typeCharacters(info.inputs[0].questionId,width===320?'Raw  Draft':'New  Draft');
 }
 check(narrowScrollable,'At least one narrow viewport exercises real local horizontal scrolling');
 const first=(await tableInfo()).inputs[0];
 await tabTo(first.questionId);
 await replaceText('x'.repeat(500));
 await until(({qid,value})=>{
  const state=window.__ieltsTablePreviewInspect();
  return state.value?.sessions[state.value.variant+':'+state.value.lessonId]?.drafts[state.materialId]?.answers[qid]===value;
 },{qid:first.questionId,value:'x'.repeat(500)},'500-character host capability boundary');
 check((await activeQuestion())?.value.length===500,'The existing host capability accepts and preserves 500 raw characters');
 const previous=await inspect(),savedRaw=session(previous).drafts[previous.materialId].answers[first.questionId];
 await key('x',0,'x');
 await until(()=>!!document.querySelector('[role="alert"]'),null,'over-limit pending raw warning');
 check((await activeQuestion())?.value.length===501,'The complete 501-character pending input stays visible');
 const overlong=await inspect();
 check(overlong.raw===previous.raw&&session(overlong).drafts[overlong.materialId].answers[first.questionId]===savedRaw,'Over-limit input does not replace the last valid canonical progress');
 check(await evaluate(()=>[...document.querySelectorAll('[role="alert"]')].some(element=>/未保存/.test(element.textContent))),'Over-limit pending input has an explicit unsaved warning');
 await replaceText('Short  Draft','shorten after 501 characters',first.questionId);
 try{
  await until(({qid,value})=>{
   const state=window.__ieltsTablePreviewInspect();
   return state.value?.sessions[state.value.variant+':'+state.value.lessonId]?.drafts[state.materialId]?.answers[qid]===value;
  },{qid:first.questionId,value:'Short  Draft'},'shortened raw resumes saving');
 }catch(error){
  await inputDiagnostic('shortened raw save timeout',first.questionId);
  await screenshot('diagnostic-shortened-raw-save-timeout');
  throw error;
 }
 record('Shortening the pending input resumes canonical saving');
 const saved=await inspect(),savedAnswers=structuredClone(session(saved).drafts[saved.materialId].answers);
 await loadPage('Page.reload',{ignoreCache:true});await waitStage('guided');
 assert.deepEqual(session(await inspect()).drafts[saved.materialId].answers,savedAnswers);
 assert.equal((await tableInfo()).inputs[0].value,'Short  Draft');
 record('Refreshing restores exact raw answer drafts');
 await noEarlyFeedback('reloaded guided');
 await fillFrozenAnswers(packet);
 await submitAndCheckReadOnly('guided');
 check(await evaluate(before=>{
  const feedback=document.querySelector('[data-stage] [role="status"]')?.textContent||'';
  return feedback.trim().length>0&&!before.includes(feedback.trim());
 },guidedBefore.text),'Guided feedback is revealed only after actual submission');
 await click('撤掉提示，换新题');await waitStage('independent');
 await noEarlyFeedback('independent');await confirmUnseen();
 for(const input of (await tableInfo()).inputs)await typeCharacters(input.questionId,'Independent  Raw');
 await submitAndCheckReadOnly('independent');
 await click('再换一份新材料，练计时');await waitStage('timed');
 check(await evaluate(()=>!document.querySelector('[data-stage] table,[data-stage] .sample-context,[data-stage] [data-question-id]')),'An unstarted timer does not expose the new table, passage or inputs');
 const waiting=await inspect();
 check(session(waiting).drafts[waiting.materialId].startedAt===0,'The timer waits for the explicit start action');
 await screenshot('timed-before-start');
 await click('开始训练计时');await waitStage('timed');
 await until(()=>!!document.querySelector('[data-table-role="draft"] table'),null,'started timed table');
 await noEarlyFeedback('started timed');await confirmUnseen();await validateTable();
 for(const input of (await tableInfo()).inputs)await typeCharacters(input.questionId,'Timed  Raw');
 const timed=await submitAndCheckReadOnly('timed');
 await showTable('original');await screenshot('timed-readonly-original');
 await click('查看反馈，订正一处');await waitStage('feedback');
 await validateTable('correction');await fillFrozenAnswers(packet,'correction');
 await evaluate(()=>{
  const textarea=[...document.querySelectorAll('textarea')].find(element=>element.closest('label')?.textContent.includes('具体修了什么'));
  if(!textarea)throw Error('Correction note input missing');
  textarea.focus();
 });
 await send('Input.insertText',{text:'根据本轮材料订正表格单元格，保留首次原答。'});
 await until(()=>{
  const snapshot=window.__ieltsTablePreviewInspect();
  return snapshot.value?.sessions[snapshot.value.variant+':'+snapshot.value.lessonId]?.correctionNote?.length>=8;
 },null,'correction note saved');
 const correctedDraft=await inspect();
 assert.deepEqual(session(correctedDraft).attempts.find(attempt=>attempt.materialId===timed.materialId),timed.attempt);
 await showTable('correction');await screenshot('separate-correction');
 await click('保留订正，安排隔天新题');await waitStage('review');
 const corrected=await inspect();
 check(session(corrected).correctedAt>0&&Object.keys(session(corrected).correctionAnswers).length>0,'Corrections are stored separately from the original attempt');
 assert.deepEqual(session(corrected).attempts.find(attempt=>attempt.materialId===timed.materialId),timed.attempt);
 record('Saving a correction leaves the original attempt unchanged');
 check(await evaluate(()=>{
  const button=[...document.querySelectorAll('button')].find(button=>button.textContent.trim()==='打开一份没接触过的复验题');
  return !document.querySelector('[data-table-role="draft"]')&&(!button||button.disabled);
 }),'A new review is unavailable before the required interval');
 if(simulatedReview){
  for(let round=0;round<2;round++){
   await advanceClockFixture(24*60*60*1000+1000);
   await until(()=>[...document.querySelectorAll('button')].some(button=>/打开一份没接触过的复验题|至少再隔\s*24\s*小时，换下一份材料/.test(button.textContent)&&!button.disabled),null,'simulated review due');
   const button=await evaluate(()=>[...document.querySelectorAll('button')].find(button=>/打开一份没接触过的复验题|至少再隔\s*24\s*小时，换下一份材料/.test(button.textContent)&&!button.disabled)?.textContent.trim());
   await click(button);await waitStage('review');
   await until(()=>!!document.querySelector('[data-table-role="draft"] table'),null,'new review material table');
   await noEarlyFeedback('fresh review '+(round+1));
   await confirmUnseen();await validateTable();await fillFrozenAnswers(packet);
   await submitAndCheckReadOnly('review');await showTable('original');await screenshot('review-'+(round+1)+'-simulated');
  }
  record('Two new review materials are exercised with an explicitly simulated clock',{actual24HoursElapsed:false,offsetMs:summary.reviewClock.offsetMs});
 }
 await viewport(390);const valid=await inspect(),future=JSON.parse(valid.raw);future.version=999;
 await testBlockedRaw('future',JSON.stringify(future));
 await testBlockedRaw('malformed',valid.raw.slice(0,-1));
 await evaluate(({key,raw})=>localStorage.setItem(key,raw),{key:previewKey,raw:valid.raw});
 await loadPage('Page.reload',{ignoreCache:true});await until(()=>window.__ieltsTablePreviewInspect().status==='ready',null,'valid preview restored after fixtures');
 const final=await inspect();
 assert.deepEqual(session(final).attempts,session(valid).attempts);
 record('Restoring the valid task fixture preserves its real attempt history');
 const otherFinal=await evaluate(key=>Object.fromEntries(Object.keys(localStorage).filter(item=>item!==key).map(item=>[item,localStorage.getItem(item)])),previewKey);
 assert.deepEqual(otherFinal,otherStorage);
 record('No localStorage key outside the isolated preview key is changed');
 check(summary.runtimeErrors.length===0&&summary.consoleErrors.length===0,'No uncaught runtime errors or console.error calls',{runtimeErrors:summary.runtimeErrors,consoleErrors:summary.consoleErrors,browserLogErrors:summary.browserLogErrors});
 summary.attempts=session(final).attempts.map(attempt=>({materialId:attempt.materialId,stage:attempt.stage,correct:attempt.correct,total:attempt.total,audioUsable:attempt.audioUsable,playbackCount:attempt.playbackCount}));
 summary.result='passed';
}catch(error){
 summary.result='failed';summary.failure=error instanceof Error?error.stack:String(error);
 process.exitCode=1;
}finally{
 summary.finishedAt=new Date().toISOString();
 summary.checkCount=summary.checks.length;
 await writeFile(path.join(evidence,'browser-verification.json'),JSON.stringify(summary,null,2)+'\n');
 console.log(JSON.stringify(summary,null,2));
 for(const request of pending.values()){clearTimeout(request.timer);request.reject(Error('Browser verification finished'))}
 pending.clear();
 socket?.close();
 if(pageId)await fetch(debugging+'/json/close/'+pageId).catch(()=>{});
}
