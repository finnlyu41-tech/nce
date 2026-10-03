import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const origin = process.env.GT_TABLE_HOST_ORIGIN || 'http://127.0.0.1:4348';
const debugOrigin = process.env.GT_TABLE_HOST_DEBUG_ORIGIN || 'http://127.0.0.1:4350';
const evidenceDir = process.env.GT_TABLE_EVIDENCE_DIR || '/tmp/ielts-gt-table-host-browser-evidence';
const fixturePath = process.env.GT_TABLE_KEYS_FILE || '/tmp/gt-table-options-frozen-keys-20261003.json';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const receipt = {
  result: 'running', origin, debugOrigin, checks: [], screenshots: [], keyboardCharacters: 0,
  runtimeErrors: [], consoleErrors: [], browserLogErrors: [], networkFailures: [], httpErrors: [],
  audioNotApplicable: true, audioChecksPerformed: 0, reviewClock: { mode: 'not-exercised', actual24HoursElapsed: false },
};
let client;
let targetId;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function connectPage() {
  const response = await fetch(debugOrigin + '/json/new?about:blank', { method: 'PUT' });
  assert.ok(response.ok, 'Task-owned CDP must allow creation of a fresh test tab');
  const target = await response.json();
  targetId = target.id;
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let counter = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(String(event.data));
    if (message.id) {
      const handler = pending.get(message.id);
      if (!handler) return;
      pending.delete(message.id);
      clearTimeout(handler.timer);
      if(message.error)handler.reject(new Error(JSON.stringify(message.error)));else handler.resolve(message.result);
      return;
    }
    const value = message.params;
    if (message.method === 'Page.loadEventFired') loads += 1;
    if (message.method === 'Runtime.exceptionThrown') receipt.runtimeErrors.push(value.exceptionDetails);
    if (message.method === 'Runtime.consoleAPICalled' && value.type === 'error') {
      receipt.consoleErrors.push(value.args.map(arg => arg.value ?? arg.description ?? '').join(' '));
    }
    if (message.method === 'Log.entryAdded' && value.entry.level === 'error') receipt.browserLogErrors.push(value.entry);
    if (message.method === 'Network.responseReceived' && value.response.status >= 400) {
      receipt.httpErrors.push({ url: value.response.url, status: value.response.status, type: value.type, requestId: value.requestId });
    }
    if (message.method === 'Network.loadingFailed') receipt.networkFailures.push(value);
  });
  client = {
    send(method, params = {}) {
      const id = ++counter;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 12000);
        pending.set(id, { resolve, reject, timer });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    close() { socket.close(); },
  };
  for (const domain of ['Page', 'Runtime', 'Log', 'Network']) await client.send(domain + '.enable');
}
async function evaluate(fn, ...args) {
  const result = await client.send('Runtime.evaluate', {
    expression: '(' + fn.toString() + ')(...' + JSON.stringify(args) + ')',
    awaitPromise: true, returnByValue: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text + ': ' + (result.exceptionDetails.exception?.description || ''));
  return result.result.value;
}
function check(name, condition, detail) {
  assert.ok(condition, name + (detail ? ': ' + JSON.stringify(detail) : ''));
  receipt.checks.push({ name, ...(detail === undefined ? {} : { detail }) });
}
async function settle(name, fn, ...args) {
  const deadline = Date.now() + 10000;
  let observed;
  while (Date.now() < deadline) {
    observed = await evaluate(fn, ...args);
    if (observed) return observed;
    await pause(80);
  }
  throw new Error('DOM did not settle: ' + name + '; last=' + JSON.stringify(observed));
}
async function findClickable(text, tag = 'button', exact = true) {
  return evaluate((label, type, matchExactly) => {
    const matches = [...document.querySelectorAll(type)].filter(node => {
      const normalized = node.textContent.trim().replace(/\s+/g, ' ');
      return !node.disabled && node.getClientRects().length && (matchExactly ? normalized === label : normalized.includes(label));
    });
    if (matches.length !== 1) throw new Error('Expected one visible ' + type + ': ' + label + '; found=' + matches.length);
    matches[0].scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    const rect = matches[0].getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }, text, tag, exact);
}
async function clickText(text, tag = 'button', exact = true) {
  const point = await findClickable(text, tag, exact);
  await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
  await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
}
async function clickSelector(selector) {
  const point = await evaluate(selector => {
    const matches = [...document.querySelectorAll(selector)].filter(node => node.getClientRects().length);
    if (matches.length !== 1) throw new Error('Expected one visible selector: ' + selector + '; found=' + matches.length);
    matches[0].scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    const rect = matches[0].getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }, selector);
  await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
  await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
}
async function typeCharacters(raw) {
  for (const character of raw) {
    await client.send('Input.insertText', { text: character });
    receipt.keyboardCharacters += 1;
  }
}
async function replaceText(selector, raw) {
  await clickSelector(selector);
  const meta = await evaluate(() => /Mac/i.test(navigator.platform));
  await client.send('Input.dispatchKeyEvent', {
    type: 'keyDown', key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, nativeVirtualKeyCode: 65,
    modifiers: meta ? 4 : 2, commands: ['selectAll'],
  });
  await client.send('Input.dispatchKeyEvent', {
    type: 'keyUp', key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, nativeVirtualKeyCode: 65, modifiers: meta ? 4 : 2,
  });
  const selected = await evaluate(selector => {
    const input = document.querySelector(selector);
    return { active: document.activeElement === input, value: input.value, start: input.selectionStart, end: input.selectionEnd };
  }, selector);
  assert.ok(selected.active && selected.start === 0 && selected.end === selected.value.length, 'Native Select All must select the full field: ' + JSON.stringify(selected));
  await typeCharacters(raw);
}
async function pressTab(shift = false) {
  const params = { key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers: shift ? 8 : 0 };
  await client.send('Input.dispatchKeyEvent', { type: 'keyDown', ...params });
  await client.send('Input.dispatchKeyEvent', { type: 'keyUp', ...params });
}
async function viewport(width, height = 860) {
  await client.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
}
async function screenshot(name) {
  const value = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  const bytes = Buffer.from(value.data, 'base64');
  const file = path.join(evidenceDir, name + '.png');
  await writeFile(file, bytes);
  receipt.screenshots.push({ name, file, bytes: bytes.length, sha256: sha256(bytes), viewport: await evaluate(() => ({ width: innerWidth, height: innerHeight })) });
}

let loads = 0;
const sampleKey = 'ielts-sample-sequence-v1';
const contextKey = 'ielts-gt-table-context-v1';
const lessonId = 'reading-gt-table-options';
const lessonTitle = 'General Training · 选项式表格专项';
const stageLabels = {explain:'理解方法',model:'看一个示范',guided:'跟着试',independent:'撤提示 · 新题',timed:'训练用限时',feedback:'反馈与订正',review:'延迟 · 新题复验'};
receipt.stagesVisited = [];
receipt.profile = 'requires-task-owned-empty-profile';
receipt.entry = origin + (process.env.GT_TABLE_HOST_ENTRY || '/standalone.html#/ielts');
receipt.reviewClock = {mode:'not-exercised',actual24HoursElapsed:false};
receipt.inputMethod = 'CDP native mouse/key events; no DOM event dispatch or store writes';
async function storedState() {
  return evaluate(async () => {
    const db = await new Promise((resolve,reject) => {
      const request = indexedDB.open('english-studio-offline',1);
      request.onupgradeneeded=()=>{request.transaction.abort();reject(Error('Host database must already exist'));};
      request.onerror=()=>reject(request.error); request.onsuccess=()=>resolve(request.result);
    });
    try {return await new Promise((resolve,reject)=>{
      const request=db.transaction('state','readonly').objectStore('state').get('current');
      request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error);
    });} finally {db.close();}
  });
}
function record(state) {
  const raw=state?.drafts?.[sampleKey];
  assert.equal(typeof raw,'string','Host persists real sample State.drafts');
  const envelope=JSON.parse(raw);
  assert.equal(envelope.version,1);
  const contextRaw=state.drafts[contextKey];
  return {raw,value:envelope.value,session:envelope.value.sessions['general-training:'+lessonId],
    contextRaw,context:contextRaw===undefined?undefined:JSON.parse(contextRaw)};
}
async function progress(){return record(await storedState());}
async function untilStored(name,predicate) {
  const end=Date.now()+12000; let last;
  while(Date.now()<end) {
    const state=await storedState();
    if(typeof state?.drafts?.[sampleKey]==='string'){last=record(state);if(predicate(last))return last;}
    await pause(80);
  }
  throw Error('Stored state did not settle: '+name+'; '+JSON.stringify(last));
}
async function stageIs(stage) {
  await settle('stage '+stage,label=>document.querySelector('.sample-steps [aria-current="step"]')?.textContent.includes(label),stageLabels[stage]);
  return untilStored('stage '+stage,r=>r.value.variant==='general-training'&&r.value.lessonId===lessonId&&(r.session?.stage||(stage==='explain'?'explain':undefined))===stage);
}
async function realLoad(method,params) {
  const before=loads; const response=await client.send(method,params);
  if(method==='Page.navigate'&&!response.loaderId)await client.send('Page.reload',{ignoreCache:true});
  const end=Date.now()+12000;
  while(loads<=before&&Date.now()<end)await pause(80);
  check('Main-site document completes real load',loads>before);
  await settle('real workspace',()=>Boolean(document.querySelector('main.workspace#main')));
}
async function controls(scope='.sample-stage',type='select') {
  return evaluate((scope,type)=>[...document.querySelectorAll(scope+' '+type+'[data-question-id]')].map(node=>({
    id:node.id,qid:node.dataset.questionId,value:node.value,readOnly:node.readOnly,disabled:node.disabled,
    selector:scope+' '+type+'[data-question-id="'+node.dataset.questionId+'"]',
    options:node.options?[...node.options].map(option=>option.value):undefined,
  })),scope,type);
}
async function key(key,code,number) {
  for(const type of ['keyDown','keyUp'])await client.send('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode:number});
}
async function choose(field,letter) {
  assert.match(letter,/^[A-F]$/);
  assert.ok(field.options.includes(letter));
  await clickSelector(field.selector);
  await key('Escape','Escape',27);
  await client.send('Input.dispatchKeyEvent',{type:'keyDown',key:letter.toLowerCase(),code:'Key'+letter,windowsVirtualKeyCode:letter.charCodeAt(0),text:letter.toLowerCase()});
  await client.send('Input.dispatchKeyEvent',{type:'keyUp',key:letter.toLowerCase(),code:'Key'+letter,windowsVirtualKeyCode:letter.charCodeAt(0)});
  await settle('native letter selection '+field.qid,(selector,letter)=>document.querySelector(selector)?.value===letter,field.selector,letter);
}
async function fill(stage,keys,wrong,scope='.sample-stage',correction=false) {
  const fields=await controls(scope); assert.equal(fields.length,3,'Three GT table select blanks');
  assert.ok(fields.every(field=>!field.disabled&&field.options.filter(Boolean).join('')==='ABCDEF'));
  const answers={...keys[stage].answers};
  if(wrong)answers[fields[0].qid]=wrong;
  for(const field of fields) {
    await choose(field,answers[field.qid]);
    await untilStored('native persisted '+field.qid,r=>(correction?r.session.correctionAnswers[field.qid]:r.session.drafts[keys[stage].materialId]?.answers[field.qid])===answers[field.qid]);
  }
  check('Native select choices persist exact raw letters: '+stage,true,answers);
  return answers;
}
async function readonly(scope,expected,label) {
  const fields=await controls(scope,'input');
  assert.equal(fields.length,Object.keys(expected).length,label+' field count');
  check(label,fields.every(field=>field.readOnly&&!field.disabled&&field.value===expected[field.qid]),fields);
  assert.equal((await controls(scope)).length,0,'Original records do not retain editable selects');
  await clickSelector(fields[0].selector); await typeCharacters('X');
  check(label+' rejects native overwrite',await evaluate((selector,value)=>document.querySelector(selector)?.value===value,fields[0].selector,expected[fields[0].qid]));
}
async function showHistory() {
  if(!await evaluate(()=>document.querySelector('#sample-answer-history')?.hidden===false))
    await clickText('查看作答与订正','section[aria-label="作答与订正记录"] button',false);
  await settle('history open',()=>document.querySelector('#sample-answer-history')?.hidden===false);
}
async function visibleMaterial(scope) {
  return evaluate(scope=>{
    const root=document.querySelector(scope),section=root?.querySelector('[data-gt-table-id]');
    return {id:section?.dataset.gtTableId,
      passage:root?.querySelector('.sample-context')?.textContent.trim(),
      caption:section?.querySelector('caption')?.textContent.trim(),
      rowHeaders:[...section?.querySelectorAll('th[scope="row"]')||[]].map(node=>node.textContent.trim()),
      columnHeaders:[...section?.querySelectorAll('th[scope="col"]')||[]].map(node=>node.textContent.trim())};
  },scope);
}
async function phone(width) {
  await viewport(width);
  const fields=await controls(); await clickSelector(fields[0].selector); await key('Escape','Escape',27);
  await pressTab();
  const focus=await evaluate(()=>{
    const node=document.activeElement,box=node?.getBoundingClientRect(),style=node&&getComputedStyle(node);
    return {qid:node?.dataset?.questionId,width:innerWidth,documentWidth:document.documentElement.scrollWidth,
      bodyWidth:document.body.scrollWidth,visible:!!box&&box.left>=-1&&box.right<=innerWidth+1&&box.width>=44,
      outlined:style?.outlineStyle!=='none'&&parseFloat(style?.outlineWidth||'0')>=2};
  });
  check(width+'px no document horizontal overflow',focus.documentWidth<=width+1&&focus.bodyWidth<=width+1,focus);
  check(width+'px native select keyboard focus visible',focus.qid===fields[1].qid&&focus.visible&&focus.outlined,focus);
  await screenshot('gt-select-focus-'+width);
}
async function finish(error) {
  receipt.result=error?'failed':'passed'; receipt.checkCount=receipt.checks.length; receipt.releaseReady=false;
  if(error) {
    receipt.failure={message:error.message,stack:error.stack};
    try {receipt.failureDom=await evaluate(()=>({url:location.href,active:document.activeElement?.outerHTML,text:document.body.innerText.slice(-10000)}));await screenshot('gt-host-failure');}
    catch(captureError){receipt.captureFailure=captureError.message;}
  }
  await writeFile(path.join(evidenceDir,'browser-verification.json'),JSON.stringify(receipt,null,2)+'\n');
  client?.close();
  if(targetId)await fetch(debugOrigin+'/json/close/'+targetId).catch(()=>{});
  process.stdout.write(JSON.stringify({result:receipt.result,checks:receipt.checkCount,screenshots:receipt.screenshots.length,evidenceDir,failure:receipt.failure?.message})+'\n');
  if(error)process.exitCode=1;
}
await mkdir(evidenceDir,{recursive:true});
receipt.sourceSha256=sha256(await readFile(fileURLToPath(import.meta.url)));
const watchdog=setTimeout(()=>{process.stderr.write('Bounded host browser check exceeded 180 seconds\n');process.exit(1);},180000);
try {
  const bytes=await readFile(fixturePath),keys=JSON.parse(bytes);
  for(const stage of ['model','guided','independent','timed','review-a','review-b']) {
    assert.equal(keys[stage].materialId,'gt-table-'+stage);
    assert.equal(Object.keys(keys[stage].answers).length,3);
  }
  receipt.answerFixture={file:fixturePath,sha256:sha256(bytes)};
  await connectPage(); await viewport(1280);
  await realLoad('Page.navigate',{url:receipt.entry});
  check('Fresh real host has no learner sample record',!(await storedState())?.drafts?.[sampleKey]);
  await clickSelector('a[href="#/ielts?tab=course"]');
  await settle('public course workspace',()=>Boolean(document.querySelector('section[aria-label="雅思小任务工作区"] .ielts-sample-sequence')));
  if(!await evaluate(()=>[...document.querySelectorAll('button')].some(node=>node.getClientRects().length&&node.textContent.trim()==='General Training')))
    await clickText('切换考试类别');
  await clickText('General Training');
  await clickText('查看课程目录','.sample-catalog button',false);
  await clickText(lessonTitle,'nav[aria-label="课程学习次序"] button');
  await stageIs('explain'); receipt.stagesVisited.push('explain');
  check('GT lesson selected through public course catalogue',await evaluate(title=>document.querySelector('.sample-stage h3')?.textContent===title,lessonTitle));
  await clickText('看一个完整小示范'); const model=await stageIs('model'); receipt.stagesVisited.push('model');
  await readonly('.sample-stage',keys.model.answers,'Model has readonly example answers');
  check('Model creates no learner attempts',model.session.attempts.length===0);
  await clickText('带着方法试一次'); await stageIs('guided'); receipt.stagesVisited.push('guided');
  check('Unsubmitted guided hides answers and explanations',await evaluate(()=>!document.querySelector('.sample-stage ol[aria-label="示范答案与依据"]')));
  const guided=await fill('guided',keys);
  const originalMaterial=await visibleMaterial('.sample-stage');
  const draft=await progress();
  await realLoad('Page.reload',{ignoreCache:true}); await stageIs('guided');
  check('Refresh restores exact raw GT draft and context', (await progress()).raw===draft.raw&&(await progress()).contextRaw===draft.contextRaw);
  check('Refresh restores native select values',(await controls()).every(field=>field.value===guided[field.qid]));
  await phone(320); await phone(390); await viewport(1280);
  await clickText('记录原始作答');
  const guidedSaved=await untilStored('guided original',r=>r.session.attempts.length===1);
  check('Guided correct raw letters scored once',guidedSaved.session.attempts[0].correct===3&&JSON.stringify(guidedSaved.session.attempts[0].answers)===JSON.stringify(guided));
  await readonly('.sample-stage',guided,'Submitted guided original readonly');
  await clickText('撤掉提示，换新题'); await stageIs('independent'); receipt.stagesVisited.push('independent');
  const independent=await fill('independent',keys,'A');
  await clickText('记录原始作答');
  const independentSaved=await untilStored('independent original',r=>r.session.attempts.length===2);
  check('New independent material and one selected wrong letter',independentSaved.session.attempts[1].promptId===keys.independent.materialId&&independentSaved.session.attempts[1].correct===2);
  await clickText('再换一份新材料，练计时'); const unopened=await stageIs('timed'); receipt.stagesVisited.push('timed');
  check('Unstarted timed material remains hidden in DOM and stored public snapshot',
    await evaluate(()=>!document.querySelector('.sample-stage [data-gt-table-id]')&&!document.querySelector('.sample-stage .sample-context')&&!document.querySelector('.sample-stage select[data-question-id]')&&!document.querySelector('.sample-stage ol[aria-label="示范答案与依据"]'))
    &&!unopened.context?.materials?.[keys.timed.materialId]&&unopened.session.drafts[keys.timed.materialId].startedAt===0);
  await screenshot('gt-timed-before-start');
  await clickText('开始训练计时');
  await untilStored('timed begun',r=>r.session.drafts[keys.timed.materialId]?.startedAt>0);
  const timed=await fill('timed',keys,'B');
  await clickText('记录原始作答');
  const submitted=await untilStored('timed original',r=>r.session.attempts.length===3);
  const originals=structuredClone(submitted.session.attempts);
  check('New timed material records one wrong letter',originals[2].promptId===keys.timed.materialId&&originals[2].correct===2);
  await readonly('.sample-stage',timed,'Submitted timed original readonly');
  await clickText('查看反馈，订正一处'); await stageIs('feedback'); receipt.stagesVisited.push('feedback');
  check('Selected wrong-letter explanations match frozen source',await evaluate((a,b)=>{
    const text=document.querySelector('.sample-stage')?.innerText;
    return text.includes(a)&&text.includes(b);
  },keys.independent.firstWrongFeedback,keys.timed.firstWrongFeedback));
  await readonly('.sample-stage > .sample-feedback', {...independent,...timed},'Feedback preserves both original readonly tables');
  const correction=await fill('timed',keys,undefined,'.sample-correction',true);
  await replaceText('.sample-stage > label.sample-field textarea','核对每行条件，再选对应行动；原答保留用于比较。');
  await untilStored('correction note',r=>r.session.correctionNote==='核对每行条件，再选对应行动；原答保留用于比较。');
  check('Independent correction does not overwrite originals',JSON.stringify((await progress()).session.attempts)===JSON.stringify(originals));
  await clickText('保留订正，安排隔天新题');
  const completed=await stageIs('review'); receipt.stagesVisited.push('review');
  check('Correction saved separately and actual delay retained',completed.session.correctedAt>0&&JSON.stringify(completed.session.correctionAnswers)===JSON.stringify(correction)&&await evaluate(()=>document.querySelector('.sample-stage')?.textContent.includes('尚未到 24 小时')));
  check('No unopened delayed review content stored',!completed.context.materials[keys['review-a'].materialId]&&!completed.context.materials[keys['review-b'].materialId]);
  const savedRaw=completed.raw,savedContextRaw=completed.contextRaw;
  for(const stage of ['guided','independent','timed']) {
    const snapshot=completed.context.materials[keys[stage].materialId];
    check('Public '+stage+' snapshot retains passage/options/table without keys',snapshot?.context&&snapshot.instruction&&snapshot.table&&snapshot.options.map(o=>o.letter).join('')==='ABCDEF'
      &&snapshot.options.every(o=>Object.keys(o).sort().join(',')==='letter,text'&&o.text)&&!JSON.stringify(snapshot).includes('"accepted"')&&!JSON.stringify(snapshot).includes('"why"'));
  }
  await realLoad('Page.reload',{ignoreCache:true}); await stageIs('review');
  check('Real refresh preserves exact whole sample and GT snapshot bytes',(await progress()).raw===savedRaw&&(await progress()).contextRaw===savedContextRaw);
  await showHistory();
  for(const [index,expected] of [guided,independent,timed].entries())
    await readonly('#sample-answer-history section[aria-label="第 '+(index+1)+' 次作答记录"]',expected,'Refreshed original history '+(index+1));
  await readonly('#sample-answer-history section[aria-label="自己的订正"]',correction,'Saved correction history');
  const restoredMaterial=await visibleMaterial('#sample-answer-history section[aria-label="第 1 次作答记录"]');
  check('Refreshed history restores original passage, table caption, row/column context',JSON.stringify(restoredMaterial)===JSON.stringify(originalMaterial)&&restoredMaterial.caption&&restoredMaterial.rowHeaders.length===3);
  const historyOptions=await evaluate(scope=>[...document.querySelectorAll(scope+' [data-gt-table-id] li')].map(node=>node.textContent.replace(/\s+/g,' ').trim()),'#sample-answer-history section[aria-label="第 1 次作答记录"]');
  const snapshotOptions=completed.context.materials[keys.guided.materialId].options;
  check('Refreshed history restores all six saved options',historyOptions.length===6&&snapshotOptions.every((o,index)=>historyOptions[index].includes(o.letter)&&historyOptions[index].includes(o.text)),historyOptions);
  await screenshot('gt-saved-originals-and-correction');
  const beforeToday=await progress();
  await clickSelector('section[aria-label="雅思小任务工作区"] a[href="#/today"]');
  await settle('Today',()=>Boolean(document.querySelector('.today-practice[aria-label="今日推荐学习"]')));
  const href='#/ielts?tab=course&task=sample-general-training-'+lessonId;
  const target=await evaluate(href=>{
    const node=[...document.querySelectorAll('.today-practice a')].find(node=>node.getAttribute('href')===href);
    return node?{closed:!!node.closest('details:not([open])')}:false;
  },href);
  receipt.todayLinks=await evaluate(()=>[...document.querySelectorAll('.today-practice a')].map(node=>({href:node.getAttribute('href'),text:node.textContent.trim()})));
  if(target) {
    receipt.returnEntry={mode:'today-lesson-link',href};
    if(target.closed)await clickSelector('.today-plan > summary');
    await clickSelector('.today-practice a[href="'+href+'"]'); await stageIs('review');
    check('Today resumes registered GT lesson',true);
  } else {
    receipt.returnEntry={mode:'existing-course-catalogue',todayLessonLinkPresent:false,note:'Existing course catalogue return after Today; Today currently prioritizes another course.'};
    await realLoad('Page.navigate',{url:receipt.entry});
    await settle('existing public course entry',()=>!!document.querySelector('a[href="#/ielts?tab=course"]'));
    await clickSelector('a[href="#/ielts?tab=course"]'); await stageIs('review');
    await clickText('查看课程目录','.sample-catalog button',false);
    await clickText(lessonTitle,'nav[aria-label="课程学习次序"] button'); await stageIs('review');
    check('Existing public course entry and catalogue resume saved GT stage',await evaluate(()=>location.hash==='#/ielts?tab=course'));
  }
  check('Return entry preserves exact originals, corrections and snapshots',(await progress()).raw===beforeToday.raw&&(await progress()).contextRaw===beforeToday.contextRaw);
  check('All seven teaching stages exercised',receipt.stagesVisited.join(',')==='explain,model,guided,independent,timed,feedback,review',receipt.stagesVisited);
  check('No host runtime or console errors',receipt.runtimeErrors.length===0&&receipt.consoleErrors.length===0);
  receipt.incidentalHTTPResponses=receipt.httpErrors.filter(item=>item.status===404&&item.type==='Other'&&new URL(item.url).pathname==='/favicon.ico');
  // The unchanged finite production Worker rejects this browser-generated fallback path.
  // Keep the full response log; only this exact unrelated request is outside the course asset gate.
  check('No failed course documents, scripts, styles or data requests',receipt.httpErrors.length===receipt.incidentalHTTPResponses.length,receipt.httpErrors);
  await finish();
} catch(error) {await finish(error);} finally {clearTimeout(watchdog);}
