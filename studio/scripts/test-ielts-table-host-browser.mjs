import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const origin = process.env.TABLE_HOST_ORIGIN || 'http://127.0.0.1:4328';
const debugOrigin = process.env.TABLE_HOST_DEBUG_ORIGIN || 'http://127.0.0.1:4330';
const evidenceDir = process.env.TABLE_HOST_EVIDENCE_DIR || '/tmp/ielts-table-host-browser-evidence';
const fixturePath = process.env.TABLE_FROZEN_KEYS_FILE || '/tmp/ielts-table-frozen-keys.json';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const receipt = {
  result: 'running', origin, debugOrigin, checks: [], screenshots: [], keyboardCharacters: 0,
  runtimeErrors: [], consoleErrors: [], browserLogErrors: [], networkFailures: [], httpErrors: [],
  audioNotApplicable: true, audioChecksPerformed: 0, reviewClock: { mode: 'not-exercised', actual24HoursElapsed: false },
};
let client;
let targetId;
let activeQuestion;
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
      message.error ? handler.reject(new Error(JSON.stringify(message.error))) : handler.resolve(message.result);
      return;
    }
    const value = message.params;
    if (message.method === 'Page.loadEventFired') loads += 1;
    if (message.method === 'Page.fileChooserOpened') chooser = value;
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
    matches[0].scrollIntoView({ block: 'center', inline: 'nearest' });
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
    matches[0].scrollIntoView({ block: 'center', inline: 'nearest' });
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
  const params = { key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9, modifiers: shift ? 8 : 0 };
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
async function readFixture() {
  const file = await readFile(fixturePath);
  const fixture = JSON.parse(file);
  assert.equal(fixture.status, 'frozen', 'Answer fixture must be independently frozen');
  assert.ok(fixture.answers && typeof fixture.answers === 'object');
  receipt.answerFixture = { file: fixturePath, sha256: sha256(file), sourceHash: fixture.sourceHash };
  return fixture.answers;
}
async function finish(error) {
  receipt.executionResult = error ? 'failed' : 'passed';
  receipt.result = error ? 'failed' : receipt.blockers?.length ? 'checks-passed-with-blocker' : 'passed';
  receipt.releaseReady = false;
  receipt.checkCount = receipt.checks.length;
  if (error) {
    receipt.failure = { message: error.message, stack: error.stack };
    if (client) {
      try {
        receipt.failureDom = await evaluate(() => ({
          url: location.href, title: document.title, active: document.activeElement?.outerHTML,
          tables: [...document.querySelectorAll('.ielts-table-stimulus')].map(node => ({ tableId: node.dataset.tableId })),
          visibleText: document.body.innerText.slice(-7000),
        }));
        await screenshot('host-failure');
      } catch (captureError) { receipt.captureFailure = captureError.message; }
    }
  }
  await writeFile(path.join(evidenceDir, 'browser-verification.json'), JSON.stringify(receipt, null, 2) + '\n');
  if (client) client.close();
  if (browserClient) browserClient.close();
  if (targetId) await fetch(debugOrigin + '/json/close/' + targetId).catch(() => {});
  process.stdout.write(JSON.stringify({ result: receipt.result, checks: receipt.checkCount, screenshots: receipt.screenshots.length, runtimeErrors: receipt.runtimeErrors.length, consoleErrors: receipt.consoleErrors.length, httpErrors: receipt.httpErrors.length, networkFailures: receipt.networkFailures.length, evidenceDir }) + '\n');
  if (error) process.exitCode = 1;
  else if (receipt.blockers?.length) process.exitCode = 2;
}

const phase = process.env.TABLE_HOST_PHASE || 'core';
assert.ok(['core', 'backup', 'backup-existing', 'today'].includes(phase), 'TABLE_HOST_PHASE must be core, backup, backup-existing, or today');
const coreOnly = phase === 'core';
receipt.phase = phase;
const contextKey = 'ielts-table-context-v1';
const sampleKey = 'ielts-sample-sequence-v1';
const sampleRoot = '.ielts-sample-sequence';
const stageLabels = { explain: '理解方法', model: '看一个示范', guided: '跟着试', independent: '撤提示 · 新题', timed: '训练用限时', feedback: '反馈与订正', review: '延迟 · 新题复验' };
let browserClient;
let loads = 0;
let downloadCompleted;
let chooser;
async function storedState() {
  return evaluate(async () => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('english-studio-offline', 1);
      request.onupgradeneeded = () => { request.transaction.abort(); reject(Error('The real host must create its progress database first')); };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction('state', 'readonly'), request = tx.objectStore('state').get('current');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } finally { db.close(); }
  });
}
function sampleRecord(state) {
  const raw = state?.drafts?.[sampleKey];
  assert.equal(typeof raw, 'string', 'The real host must persist the sample inside State.drafts');
  const envelope = JSON.parse(raw);
  assert.equal(envelope.version, 1);
  assert.ok(envelope.value && ['academic', 'general-training'].includes(envelope.value.variant));
  return { raw, value: envelope.value, session: envelope.value.sessions[envelope.value.variant + ':' + envelope.value.lessonId] };
}
async function progress() { return sampleRecord(await storedState()); }
async function untilStored(name, condition) {
  const deadline = Date.now() + 12000;
  let value;
  while (Date.now() < deadline) {
    const state = await storedState();
    if (typeof state?.drafts?.[sampleKey] !== 'string') { await pause(80); continue; }
    value = sampleRecord(state);
    if (condition(value)) return value;
    await pause(80);
  }
  throw Error('Stored progress did not settle: ' + name + '; last=' + JSON.stringify(value));
}
async function stageIs(stage) {
  await settle('stage ' + stage, label => document.querySelector('.sample-steps [aria-current="step"]')?.textContent.includes(label), stageLabels[stage]);
  return stage === 'explain' ? progress() : untilStored('stage ' + stage, record => record.session?.stage === stage);
}
async function realLoad(method, params) {
  const before = loads;
  const response = await client.send(method, params);
  if (method === 'Page.navigate' && !response.loaderId) await client.send('Page.reload', { ignoreCache: true });
  const deadline = Date.now() + 12000;
  while (loads <= before && Date.now() < deadline) await pause(80);
  assert.ok(loads > before, 'The new real main-site document must finish loading');
  await settle('real main workspace', () => Boolean(document.querySelector('main.workspace#main')));
}
async function showHistory() {
  const open = await evaluate(() => document.querySelector('#sample-answer-history')?.hidden === false);
  if (!open) await clickText('查看作答与订正', 'section[aria-label="作答与订正记录"] button', false);
  await settle('answer history open', () => document.querySelector('#sample-answer-history')?.hidden === false);
}
async function fields(scope = '.sample-stage') {
  return evaluate(scope => [...document.querySelectorAll(scope + ' input[data-question-id]')].map(input => ({
    id: input.id, qid: input.dataset.questionId, number: input.dataset.questionNumber,
    value: input.value, readOnly: input.readOnly, disabled: input.disabled,
  })), scope);
}
async function editableFields(scope = '.sample-stage') {
  const all = await fields(scope);
  const result = all.filter(field => !field.readOnly && !field.disabled);
  assert.equal(result.length, 3, 'The current structured material has three editable table blanks');
  return result;
}
async function fillMaterial(values, scope = '.sample-stage', correction = false) {
  const inputs = await editableFields(scope);
  const opened = await progress();
  const materialId = opened.session.exposures.at(-1);
  for (const [index, field] of inputs.entries()) {
    const raw = typeof values === 'function' ? values(field, index) : values[field.qid];
    assert.equal(typeof raw, 'string', 'A frozen fixture answer must exist for ' + field.qid);
    activeQuestion = field.qid;
    await replaceText('#' + field.id, raw);
    const current = await untilStored('native input ' + field.qid, record =>
      (correction ? record.session.correctionAnswers[field.qid] : record.session.drafts[materialId]?.answers[field.qid]) === raw);
    check('Real host stores the complete raw input for ' + field.qid,
      (correction ? current.session.correctionAnswers[field.qid] : current.session.drafts[materialId].answers[field.qid]) === raw);
  }
  return { inputs, materialId, answers: Object.fromEntries(inputs.map((field, index) => [field.qid, typeof values === 'function' ? values(field, index) : values[field.qid]])) };
}
async function verifyReadonly(scope, expected, label) {
  const all = await fields(scope);
  assert.equal(all.length, Object.keys(expected).length, label + ': exact original blanks');
  check(label, all.every(field => field.readOnly && !field.disabled && field.value === expected[field.qid]), all.map(({ qid, readOnly, disabled }) => ({ qid, readOnly, disabled })));
  const first = all[0];
  await clickSelector('#' + first.id);
  await typeCharacters('x');
  check(label + ' rejects native editing', await evaluate(({ id, original }) => document.getElementById(id)?.value === original, { id: first.id, original: expected[first.qid] }));
}
async function hostViewportEvidence(width) {
  await viewport(width);
  const inputs = await editableFields();
  await clickSelector('#' + inputs[0].id);
  await pressTab();
  const focus = await evaluate(() => {
    const input = document.activeElement, scroller = input?.closest('.ielts-table-stimulus__viewport');
    const box = input?.getBoundingClientRect(), clip = scroller?.getBoundingClientRect(), style = input && getComputedStyle(input);
    return {
      qid: input?.dataset?.questionId,
      outlined: style?.outlineStyle !== 'none' && parseFloat(style?.outlineWidth || '0') >= 2,
      visible: Boolean(box && clip && box.left >= clip.left - 1 && box.right <= clip.right + 1),
      width: innerWidth, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth,
      localScroller: Boolean(scroller && getComputedStyle(scroller).overflowX === 'auto'),
    };
  });
  check(width + 'px main host keeps the table inside the page', focus.documentWidth <= width + 1 && focus.bodyWidth <= width + 1, focus);
  check(width + 'px host keyboard focus is visible inside the real local table scroller', focus.qid === inputs[1].qid && focus.outlined && focus.visible && focus.localScroller, focus);
  await pressTab(true);
  check(width + 'px Shift-Tab returns to the first table blank', await evaluate(id => document.activeElement?.id === id, inputs[0].id));
  await screenshot('host-table-keyboard-focus-' + width);
}
async function closeDialog() {
  await client.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await settle('backup dialog closed', () => !document.querySelector('.progress-save-dialog'));
}
async function openBackup() {
  await clickSelector('button[aria-label="进度备份与恢复"]');
  await settle('real backup dialog open', () => Boolean(document.querySelector('.progress-save-dialog')));
}
async function uploadBackup(file) {
  chooser = undefined;
  await client.send('Page.setInterceptFileChooserDialog', { enabled: true });
  await clickText('从文件恢复进度');
  const deadline = Date.now() + 10000;
  while (!chooser && Date.now() < deadline) await pause(50);
  assert.ok(chooser?.backendNodeId, 'The real restore button must open its file input');
  await client.send('DOM.setFileInputFiles', { backendNodeId: chooser.backendNodeId, files: [file] });
  await client.send('Page.setInterceptFileChooserDialog', { enabled: false });
  await settle('real import preview', () => [...document.querySelectorAll('.progress-save-dialog button')].some(button => button.textContent.trim() === '确认替换并恢复'));
}

async function configureDownloads() {
  const version = await fetch(debugOrigin + '/json/version').then(response => response.json());
  receipt.browser = { product: version.Browser, userAgent: version['User-Agent'] };
  const socket = new WebSocket(version.webSocketDebuggerUrl), pending = new Map();
  let serial = 0;
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  socket.addEventListener('message', event => {
    const message = JSON.parse(String(event.data));
    if (message.id) {
      const callback = pending.get(message.id);
      if (!callback) return;
      pending.delete(message.id); clearTimeout(callback.timer);
      message.error ? callback.reject(Error(JSON.stringify(message.error))) : callback.resolve(message.result);
    }
    if (message.method === 'Browser.downloadWillBegin') receipt.download = message.params;
    if (message.method === 'Browser.downloadProgress' && message.params.state === 'completed') downloadCompleted = message.params;
  });
  browserClient = {
    send(method, params) {
      return new Promise((resolve, reject) => {
        const id = ++serial, timer = setTimeout(() => { pending.delete(id); reject(Error('Browser CDP timeout: ' + method)); }, 12000);
        pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params }));
      });
    },
    close() { socket.close(); },
  };
  const directory = path.join(evidenceDir, 'downloads');
  await mkdir(directory, { recursive: true });
  await browserClient.send('Browser.setDownloadBehavior', { behavior: 'allowAndName', downloadPath: directory, eventsEnabled: true });
}
async function exportBackup() {
  downloadCompleted = undefined;
  await clickText('保存进度', 'button', true);
  const deadline = Date.now() + 12000;
  while (!downloadCompleted && Date.now() < deadline) await pause(60);
  assert.ok(downloadCompleted?.guid, 'The real host export must complete a native browser download');
  const file = path.join(evidenceDir, 'downloads', downloadCompleted.guid), bytes = await readFile(file);
  const value = JSON.parse(bytes);
  check('The real downloaded backup includes the table record in the whole-site State', value.format === 'english-studio-progress' && typeof value.state?.drafts?.[sampleKey] === 'string');
  receipt.backupFile = { file, name: receipt.download.suggestedFilename, bytes: bytes.length, sha256: sha256(bytes), format: value.format, version: value.version };
  return { file, value };
}

await mkdir(evidenceDir, { recursive: true });
receipt.sourceSha256 = sha256(await readFile(fileURLToPath(import.meta.url)));
receipt.sourceFiles = {
  baseline: '1cb23fdd47a297b41ed9458ab386c5ff786386dc',
  contentCommit: 'e3adbf88d3d4e2d5dc0ae8326f5ab2d3db969a03',
  renderer: sha256(await readFile(new URL('../ielts-blueprint/structured-table/table-stimulus.tsx', import.meta.url))),
  host: sha256(await readFile(new URL('../ielts-blueprint/sample-sequence-ui.tsx', import.meta.url))),
  registration: sha256(await readFile(new URL('../ielts-blueprint/curriculum/registered.ts', import.meta.url))),
  workspace: sha256(await readFile(new URL('../app/ielts-sample-workspace.tsx', import.meta.url))),
  contextHelper: sha256(await readFile(new URL('../app/ielts-table-context.ts', import.meta.url))),
};
receipt.profile = 'new-task-owned-empty';
receipt.entry = origin + '/standalone.html#/ielts';
receipt.stagesVisited = [];
try {
  if (!coreOnly) {
    if (phase === 'backup-existing') await runExistingBackupGroup();
    else if (phase === 'today') await runTodayOnly();
    else await runBackupGroup();
    await finish();
  } else {
  const keys = await readFixture();
  await connectPage();
  await configureDownloads();
  await viewport(1280);
  await realLoad('Page.navigate', { url: receipt.entry });
  check('The real main-site IELTS overview loads its public course entry',
    await evaluate(() => document.querySelector('a[href="#/ielts?tab=course"]')?.textContent.includes('进入练习')));
  const initial = await storedState();
  check('The new task profile begins without a learner sample record', !initial?.drafts?.[sampleKey]);
  await clickSelector('a[href="#/ielts?tab=course"]');
  await settle('real IELTS workspace', () => Boolean(document.querySelector('section[aria-label="雅思小任务工作区"] .ielts-sample-sequence')));
  check('The public entry selects the actual course route', await evaluate(() => location.hash === '#/ielts?tab=course'));
  await clickText('Academic');
  await clickText('查看课程目录', '.sample-catalog button', false);
  await clickText('Academic · 按行列补全表格', 'nav[aria-label="课程学习次序"] button');
  await untilStored('registered table lesson chosen', record => record.value.lessonId === 'reading-table-completion');
  await stageIs('explain'); receipt.stagesVisited.push('explain');
  check('The registered table lesson is chosen through the actual catalogue', await evaluate(() => document.querySelector('.sample-stage h3')?.textContent === 'Academic · 按行列补全表格'));
  await clickText('看一个完整小示范');
  const model = await stageIs('model'); receipt.stagesVisited.push('model');
  const modelFields = await fields();
  check('The actual host model displays only readonly example table blanks', modelFields.length === 3 && modelFields.every(field => field.readOnly && !field.disabled && field.value.length > 0));
  check('Viewing the explicit model does not create a learner answer or attempt', model.session.attempts.length === 0 && Object.values(model.session.drafts).every(draft => Object.keys(draft.answers).length === 0 && draft.submittedAt === 0));
  await clickText('带着方法试一次');
  await stageIs('guided'); receipt.stagesVisited.push('guided');
  check('The unsubmitted guided host hides answer explanations', await evaluate(() => !document.querySelector('.sample-stage ol[aria-label="示范答案与依据"]')));
  const guided = await fillMaterial(field => '  ' + keys[field.qid] + '  ');
  const draftSnapshot = await progress();
  await realLoad('Page.reload', { ignoreCache: true });
  await stageIs('guided');
  check('Refreshing the real main site restores the exact raw table draft', (await progress()).raw === draftSnapshot.raw && (await fields()).every(field => field.value === guided.answers[field.qid]));
  await hostViewportEvidence(320);
  await hostViewportEvidence(390);
  await viewport(1280);
  await clickText('记录原始作答');
  const submitted = await untilStored('first guided original', record => record.session.attempts.length === 1);
  const guidedOriginal = structuredClone(submitted.session.attempts[0]);
  check('The real submission records the complete original answers', JSON.stringify(guidedOriginal.answers) === JSON.stringify(guided.answers) && guidedOriginal.correct === 3);
  await verifyReadonly('.sample-stage', guided.answers, 'The current submitted original is readonly and copyable');
  check('Attempted editing leaves the first stored original unchanged', JSON.stringify((await progress()).session.attempts[0]) === JSON.stringify(guidedOriginal));
  await showHistory();
  const historyScope = '#sample-answer-history section[aria-label="第 1 次作答记录"]';
  await verifyReadonly(historyScope, guided.answers, 'The history preserves the first original in its real table');
  check('Original history keeps the task instruction, passage, caption and row/column context', await evaluate(scope => {
    const node = document.querySelector(scope);
    return node?.textContent.includes('NO MORE THAN TWO WORDS') && Boolean(node.querySelector('.sample-context')) &&
      Boolean(node.querySelector('caption')?.textContent.trim()) && node.querySelectorAll('th[scope="row"]').length === 3 && node.querySelectorAll('th[scope="col"]').length >= 2;
  }, historyScope));
  const beforeToday = await progress();
  await clickSelector('section[aria-label="雅思小任务工作区"] a[href="#/today"]');
  await settle('Today queue after table work', () => Boolean(document.querySelector('.today-practice[aria-label="今日推荐学习"]')));
  const targetHref = '#/ielts?tab=course&task=sample-academic-reading-table-completion';
  const targetVisible = await evaluate(href => {
    const anchor = [...document.querySelectorAll('.today-practice a')].find(node => node.getAttribute('href') === href);
    if (!anchor) return false;
    return { inClosedPlan: Boolean(anchor.closest('details') && !anchor.closest('details').open) };
  }, targetHref);
  check('Today derives a real resume link for the registered table course', Boolean(targetVisible));
  if (targetVisible.inClosedPlan) await clickSelector('.today-plan > summary');
  await clickSelector('.today-practice a[href="' + targetHref + '"]');
  await stageIs('guided');
  await settle('consumed real Today target', () => location.hash === '#/ielts?tab=course');
  check('Today returns to the saved stage without adding attempts or exposure', (await progress()).raw === beforeToday.raw);
  await clickText('撤掉提示，换新题');
  await stageIs('independent'); receipt.stagesVisited.push('independent');
  const independent = await fillMaterial(() => 'Own  Draft');
  check('The actual independent host uses a different new material', independent.materialId !== guided.materialId);
  await clickText('记录原始作答');
  await untilStored('independent original', record => record.session.attempts.length === 2);
  await verifyReadonly('.sample-stage', independent.answers, 'Independent submission renders the saved original readonly');
  await clickText('再换一份新材料，练计时');
  const unopened = await stageIs('timed'); receipt.stagesVisited.push('timed');
  check('The actual timed host hides the new table, passage and inputs before start', await evaluate(() => !document.querySelector('.sample-stage .ielts-table-stimulus') && !document.querySelector('.sample-stage .sample-context') && !document.querySelector('.sample-stage input[data-question-id]')) && unopened.session.drafts[unopened.session.exposures.at(-1)].startedAt === 0);
  await screenshot('host-timed-before-start');
  await clickText('开始训练计时');
  await untilStored('real training start', record => record.session.drafts[record.session.exposures.at(-1)].startedAt > 0);
  const timed = await fillMaterial(() => 'Original  Note');
  check('The actual timed table uses its own new material', timed.materialId !== guided.materialId && timed.materialId !== independent.materialId);
  await clickText('记录原始作答');
  const timedSubmitted = await untilStored('timed original', record => record.session.attempts.length === 3);
  const originals = structuredClone(timedSubmitted.session.attempts);
  await verifyReadonly('.sample-stage', timed.answers, 'Timed submission renders the saved original readonly');
  await clickText('查看反馈，订正一处');
  await stageIs('feedback'); receipt.stagesVisited.push('feedback');
  const feedbackFields = (await fields('.sample-stage > .sample-feedback')).filter(field => field.readOnly);
  check('The actual feedback includes both saved originals as readonly tables', feedbackFields.length === 6 && feedbackFields.every(field => !field.disabled && field.value === (originals.find(attempt => Object.hasOwn(attempt.answers, field.qid))?.answers[field.qid])));
  const corrected = await fillMaterial(keys, '.sample-correction', true);
  check('The correction uses the same timed questions and preserves its row/column context', corrected.inputs.every(field => Object.hasOwn(timed.answers, field.qid)) && await evaluate(() => Boolean(document.querySelector('.sample-correction caption'))));
  await replaceText('.sample-stage > label.sample-field textarea', '按行与栏目核对来源词，保留首次原答作比较。');
  await untilStored('real correction note', record => record.session.correctionNote === '按行与栏目核对来源词，保留首次原答作比较。');
  check('Correction inputs do not overwrite any submitted original', JSON.stringify((await progress()).session.attempts) === JSON.stringify(originals));
  await showHistory();
  await screenshot('host-feedback-and-history-desktop');
  await clickText('保留订正，安排隔天新题');
  const completed = await stageIs('review'); receipt.stagesVisited.push('review');
  check('The actual host schedules delayed review only after saving correction', completed.session.correctedAt > 0 && completed.session.correctionNote.length >= 8 && Object.keys(completed.session.correctionAnswers).length === 3);
  const rollbackRaw = completed.raw;
  await showHistory();
  await verifyReadonly('#sample-answer-history section[aria-label="自己的订正"]', corrected.answers, 'Saved correction history is readonly and distinct from the originals');
  await screenshot('host-saved-correction-history-desktop');
  await clickText('查看课程目录', '.sample-catalog button', false);
  const oldLessonTitle = await evaluate(() => [...document.querySelectorAll('nav[aria-label="课程学习次序"] button')].map(node => node.textContent.trim()).find(text => text !== 'Academic · 按行列补全表格' && text.startsWith('Academic')));
  assert.ok(oldLessonTitle, 'At least one previously registered Academic course must remain reachable');
  await clickText(oldLessonTitle, 'nav[aria-label="课程学习次序"] button');
  await stageIs('explain');
  await clickText('看一个完整小示范');
  await stageIs('model');
  check('An existing registered course still renders its original lesson model', await evaluate(title => document.querySelector('.sample-stage h3')?.textContent === title && !document.querySelector('.sample-stage .ielts-table-stimulus'), oldLessonTitle));
  receipt.existingLessonSmoke = { title: oldLessonTitle, lessonId: (await progress()).value.lessonId };
  await clickText('查看课程目录', '.sample-catalog button', false);
  await clickText('Academic · 按行列补全表格', 'nav[aria-label="课程学习次序"] button');
  await stageIs('review');
  check('Switching to an existing course and back preserves table originals and correction', JSON.stringify((await progress()).session) === JSON.stringify(completed.session));
  check('All seven real host teaching stages were reached', receipt.stagesVisited.join(',') === 'explain,model,guided,independent,timed,feedback,review', receipt.stagesVisited);
  check('No runtime exception or console error occurred in the main-site run', receipt.runtimeErrors.length === 0 && receipt.consoleErrors.length === 0);
  await finish();
  }
} catch (error) { await finish(error); }

function contextRecord(state) {
  const raw = state?.drafts?.[contextKey];
  assert.equal(typeof raw, 'string', 'The host must persist the public table context inside whole-site State');
  const value = JSON.parse(raw);
  assert.equal(value.version, 1);
  assert.ok(value.materials && typeof value.materials === 'object');
  return { raw, value };
}
async function untilContext(name, condition) {
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    const state = await storedState();
    if (typeof state?.drafts?.[contextKey] === 'string') {
      const record = contextRecord(state);
      if (condition(record, state)) return { state, ...record };
    }
    await pause(80);
  }
  throw Error('Stored public context did not settle: ' + name);
}
function noAnswerKeys(value) {
  if (!value || typeof value !== 'object') return true;
  return Object.entries(value).every(([key, item]) => !['accepted', 'why', 'model', 'modelNotes'].includes(key) && noAnswerKeys(item));
}
async function selectTableCourse() {
  await clickText('查看课程目录', '.sample-catalog button', false);
  await clickText('Academic · 按行列补全表格', 'nav[aria-label="课程学习次序"] button');
  await untilStored('table lesson selected', record => record.value.lessonId === 'reading-table-completion');
}
async function verifyTableHistory(session, label) {
  await showHistory();
  for (const [index, attempt] of session.attempts.entries()) {
    const scope = '#sample-answer-history section[aria-label="第 ' + (index + 1) + ' 次作答记录"]';
    const actual = await fields(scope);
    check(label + ' original ' + (index + 1) + ' stays readonly in full table context',
      actual.length === 3 && actual.every(field => field.readOnly && !field.disabled && field.value === attempt.answers[field.qid]) &&
      await evaluate(selector => {
        const node = document.querySelector(selector);
        return Boolean(node?.querySelector('caption')?.textContent.trim()) && Boolean(node.querySelector('.sample-context')) &&
          node.querySelectorAll('th[scope="row"]').length === 3 && node.querySelectorAll('th[scope="col"]').length >= 2;
      }, scope));
  }
  const correction = await fields('#sample-answer-history section[aria-label="自己的订正"]');
  check(label + ' saved correction remains separate and readonly',
    correction.length === 3 && correction.every(field => field.readOnly && !field.disabled && field.value === session.correctionAnswers[field.qid]));
}
async function runBackupGroup() {
  receipt.profile = 'same-task-owned-profile-containing-only-core-synthetic-progress';
  await connectPage();
  await configureDownloads();
  await viewport(1280);
  await realLoad('Page.navigate', { url: origin + '/standalone.html#/ielts?tab=course' });
  const original = await stageIs('review');
  await clickText('切换考试类别');
  await clickText('General Training');
  await untilStored('legacy capture through a real category change', record => record.value.variant === 'general-training' && record.value.lessonId === 'hub-listening');
  await clickText('切换考试类别');
  await clickText('Academic');
  await untilStored('Academic after legacy capture', record => record.value.variant === 'academic');
  await selectTableCourse();
  await stageIs('review');
  const reconstructed = await untilContext('legacy context of core originals', record =>
    original.session.attempts.every(attempt => record.value.materials[attempt.materialId]?.legacyReconstructed === true));
  receipt.legacyContext = {
    materials: Object.fromEntries(Object.entries(reconstructed.value.materials).map(([id, item]) => [id, item.legacyReconstructed])),
    limitation: 'Earlier core attempts preceded context capture. Their task context was reconstructed from current frozen content and does not prove the historical stimulus version.',
  };
  check('Earlier core attempts explicitly retain legacy reconstruction markers',
    original.session.attempts.every(attempt => reconstructed.value.materials[attempt.materialId].legacyReconstructed === true));
  check('The legacy reconstruction limitation is visible in the actual workspace',
    await evaluate(() => document.querySelector('section[aria-label="雅思小任务工作区"]')?.textContent.includes('由当前冻结内容补建，不能证明当时题面')));
  check('Saved public context contains no answer keys or explanations', noAnswerKeys(reconstructed.value));
  check('The legacy context contains no unopened review material', Object.keys(reconstructed.value.materials).every(id => !id.includes('-review-')));
  await verifyTableHistory(original.session, 'Before transfer');
  await verifyAllSnapshotHistory(original.session, reconstructed.value, 'Before transfer');
  check('Academic table → General Training → Academic preserves the existing table session',
    JSON.stringify((await progress()).session) === JSON.stringify(original.session) && contextRecord(await storedState()).raw === reconstructed.raw);
  const checkpoint = await progress(), contextCheckpoint = contextRecord(await storedState());
  const backup = await exportBackup();
  check('The actual exported backup includes the original table session and complete public context',
    backup.value.state.drafts[sampleKey] === checkpoint.raw && backup.value.state.drafts[contextKey] === contextCheckpoint.raw);
  receipt.legacyBackup = receipt.backupFile;
  await clickText('查看课程目录', '.sample-catalog button', false);
  await clickText('Academic · 找准作者的观点', 'nav[aria-label="课程学习次序"] button');
  await stageIs('guided');
  const later = await progress(), laterContext = contextRecord(await storedState());
  check('A real later course selection creates a distinct checkpoint without editing table originals',
    later.raw !== checkpoint.raw && JSON.stringify(later.value.sessions['academic:reading-table-completion']) === JSON.stringify(original.session));
  await openBackup();
  await uploadBackup(backup.file);
  check('Previewing the true downloaded backup does not write either progress namespace',
    (await progress()).raw === later.raw && contextRecord(await storedState()).raw === laterContext.raw);
  await clickText('确认替换并恢复');
  await untilStored('real table backup import', record => record.raw === checkpoint.raw);
  await untilContext('real imported public context', record => record.raw === contextCheckpoint.raw);
  await closeDialog();
  await stageIs('review');
  check('The real import restores exact sample progress and public task context',
    (await progress()).raw === checkpoint.raw && contextRecord(await storedState()).raw === contextCheckpoint.raw);
  await verifyTableHistory((await progress()).session, 'After true import');
  await verifyAllSnapshotHistory((await progress()).session, contextCheckpoint.value, 'After true import');
  await screenshot('host-backup-import-originals-and-context');
  await openBackup();
  await clickText('恢复上一次替换前的教材记录');
  await settle('true previous checkpoint rollback preview', () => [...document.querySelectorAll('.progress-save-dialog button')].some(button => button.textContent.trim() === '确认替换并恢复'));
  await clickText('确认替换并恢复');
  await untilStored('true previous checkpoint rollback', record => record.raw === later.raw);
  await untilContext('rolled back public context', record => record.raw === laterContext.raw);
  await closeDialog();
  await stageIs('guided');
  check('The real previous-checkpoint rollback restores both namespaces exactly',
    (await progress()).raw === later.raw && contextRecord(await storedState()).raw === laterContext.raw);
  await realLoad('Page.reload', { ignoreCache: true });
  await stageIs('guided');
  check('Refreshing preserves the genuine imported-then-rolled-back whole-site record',
    (await progress()).raw === later.raw && contextRecord(await storedState()).raw === laterContext.raw);
  await selectTableCourse();
  await stageIs('review');
  await verifyTableHistory((await progress()).session, 'After true rollback and refresh');
  await verifyAllSnapshotHistory((await progress()).session, contextCheckpoint.value, 'After true rollback and refresh');
  check('The table originals and saved correction remain byte-for-byte equivalent after transfer',
    JSON.stringify((await progress()).session) === JSON.stringify(original.session) && contextRecord(await storedState()).raw === contextCheckpoint.raw);
  await screenshot('host-backup-rollback-history');
  const beforeToday = await progress();
  await clickSelector('section[aria-label="雅思小任务工作区"] a[href="#/today"]');
  await settle('new-base Today recommendations', () => Boolean(document.querySelector('.today-practice[aria-label="今日推荐学习"]')));
  const oldTaskHref = '#/ielts?tab=course&task=sample-academic-reading-writer-views';
  const oldTask = await evaluate(href => {
    const anchor = [...document.querySelectorAll('.today-practice a')].find(node => node.getAttribute('href') === href);
    return anchor ? { inClosedPlan: Boolean(anchor.closest('details') && !anchor.closest('details').open), text: anchor.textContent.trim() } : undefined;
  }, oldTaskHref);
  assert.ok(oldTask, 'The actual new Today UI must retain the unfinished existing course task');
  if (oldTask.inClosedPlan) await clickSelector('.today-plan > summary');
  await clickSelector('.today-practice a[href="' + oldTaskHref + '"]');
  await stageIs('guided');
  await settle('consumed real new Today target', () => location.hash === '#/ielts?tab=course');
  const afterToday = await progress();
  check('The new-base Today UI resumes the unfinished existing course without creating an attempt or exposure',
    afterToday.value.lessonId === 'reading-writer-views' &&
    JSON.stringify(afterToday.value.sessions) === JSON.stringify(beforeToday.value.sessions));
  receipt.todayResume = { href: oldTaskHref, title: oldTask.text, lessonId: afterToday.value.lessonId, rawUnchanged: afterToday.raw === beforeToday.raw,
    sessionsUnchanged: JSON.stringify(afterToday.value.sessions) === JSON.stringify(beforeToday.value.sessions), note: 'The real target selects its lesson. Selection may change the envelope lessonId; answer/attempt/exposure records are unchanged.' };
  await selectTableCourse();
  await stageIs('review');
  const freshOrigin = 'http://localhost:' + new URL(origin).port;
  receipt.freshOrigin = freshOrigin;
  await realLoad('Page.navigate', { url: freshOrigin + '/standalone.html#/ielts' });
  const freshInitial = await storedState();
  check('The localhost hostname supplies a genuinely fresh task-owned origin',
    await evaluate(expected => location.origin === expected, freshOrigin) && !freshInitial?.drafts?.[sampleKey] && !freshInitial?.drafts?.[contextKey]);
  await clickSelector('a[href="#/ielts?tab=course"]');
  await settle('fresh real course workspace', () => Boolean(document.querySelector('.ielts-sample-sequence')));
  await clickText('Academic');
  await selectTableCourse();
  await stageIs('explain');
  await clickText('看一个完整小示范');
  await stageIs('model');
  await clickText('带着方法试一次');
  const freshGuided = await stageIs('guided');
  const beforeAnswer = await untilContext('public table context before the first learner answer', record =>
    Boolean(record.value.materials['ielts-r12-a-model']) && Boolean(record.value.materials['ielts-r12-a-guided']));
  check('A fresh host persists public context before any learner answer',
    freshGuided.session.attempts.length === 0 && Object.keys(freshGuided.session.drafts['ielts-r12-a-guided'].answers).length === 0 &&
    Object.keys(beforeAnswer.value.materials).length === 2 && Object.values(beforeAnswer.value.materials).every(item => item.legacyReconstructed === false));
  check('Fresh capture omits answer keys and unopened independent, timed and review materials',
    noAnswerKeys(beforeAnswer.value) && Object.keys(beforeAnswer.value.materials).every(id => id === 'ielts-r12-a-model' || id === 'ielts-r12-a-guided'));
  const one = (await editableFields())[0], raw = '  Own  Raw  ';
  await replaceText('#' + one.id, raw);
  await untilStored('one fresh native table input', record => record.session.drafts['ielts-r12-a-guided'].answers[one.qid] === raw);
  const afterAnswer = contextRecord(await storedState());
  check('One real learner input preserves the exact context already captured before typing',
    afterAnswer.raw === beforeAnswer.raw && (await fields()).find(field => field.qid === one.qid)?.value === raw);
  const freshBackup = await exportBackup(), freshProgress = await progress();
  check('A real fresh-origin export retains exact raw input and pre-answer context',
    freshBackup.value.state.drafts[sampleKey] === freshProgress.raw && freshBackup.value.state.drafts[contextKey] === beforeAnswer.raw);
  receipt.freshBackup = receipt.backupFile;
  receipt.freshContext = { ids: Object.keys(beforeAnswer.value.materials), capturedBeforeAnswer: true, legacyReconstructed: false, learnerInputs: 1, attempts: freshProgress.session.attempts.length };
  await screenshot('host-fresh-context-before-first-attempt');
  check('No runtime exception or console error occurs in the finite backup group', receipt.runtimeErrors.length === 0 && receipt.consoleErrors.length === 0);
}

async function runExistingBackupGroup() {
  receipt.profile = 'same-task-owned-profile-containing-only-core-synthetic-progress';
  await connectPage();
  await configureDownloads();
  await viewport(1280);
  await realLoad('Page.navigate', { url: origin + '/standalone.html#/ielts?tab=course' });
  const original = await stageIs('review'), currentState = await storedState();
  assert.equal(currentState.drafts[contextKey], undefined, 'The scope-limited workspace has not connected the new context namespace');
  receipt.contextIntegration = {
    status: 'missing', key: contextKey, observedRaw: null, assertionsPassed: 0,
    notRun: ['legacy reconstruction marker', 'fresh public context before answer', 'fresh context export', 'context import and rollback', 'hidden timed snapshot exclusion'],
    limitation: 'Current history uses the current frozen material. The real exported file does not preserve its article/table/question snapshot, so the historical stimulus version is not proven.',
  };
  receipt.blockers = [{ code: 'table-context-workspace-not-connected', key: contextKey, message: 'The prepared workspace context patch is not applied. Existing answers transfer, but public task snapshots are missing from whole-site backup.' }];
  await verifyTableHistory(original.session, 'Current frozen view before transfer');
  await clickText('切换考试类别');
  await clickText('General Training');
  await untilStored('valid General Training category', record => record.value.variant === 'general-training' && record.value.lessonId === 'hub-listening');
  await clickText('切换考试类别');
  await clickText('Academic');
  await untilStored('valid Academic category', record => record.value.variant === 'academic');
  await selectTableCourse();
  await stageIs('review');
  check('Academic table → General Training → Academic preserves every original and correction',
    JSON.stringify((await progress()).session) === JSON.stringify(original.session));
  const checkpoint = await progress(), backup = await exportBackup();
  check('The real existing backup includes the exact canonical answer checkpoint',
    backup.value.state.drafts[sampleKey] === checkpoint.raw);
  receipt.backupContextIncluded = Object.hasOwn(backup.value.state.drafts, contextKey);
  assert.equal(receipt.backupContextIncluded, false, 'Do not pretend the disconnected snapshot namespace was exported');
  await clickText('查看课程目录', '.sample-catalog button', false);
  await clickText('Academic · 找准作者的观点', 'nav[aria-label="课程学习次序"] button');
  await stageIs('model');
  await clickText('带着方法试一次');
  await stageIs('guided');
  const later = await progress();
  check('A real subsequent course step changes learning position while preserving table originals',
    later.raw !== checkpoint.raw && JSON.stringify(later.value.sessions['academic:reading-table-completion']) === JSON.stringify(original.session));
  await openBackup();
  await uploadBackup(backup.file);
  check('Previewing the genuine downloaded file does not change current progress', (await progress()).raw === later.raw);
  await clickText('确认替换并恢复');
  await untilStored('existing real backup import', record => record.raw === checkpoint.raw);
  await closeDialog();
  await stageIs('review');
  check('The real existing backup restores the exact canonical answer checkpoint', (await progress()).raw === checkpoint.raw);
  await verifyTableHistory((await progress()).session, 'Current frozen view after true import');
  await screenshot('host-existing-backup-import-originals');
  await openBackup();
  await clickText('恢复上一次替换前的教材记录');
  await settle('real previous checkpoint rollback preview', () => [...document.querySelectorAll('.progress-save-dialog button')].some(button => button.textContent.trim() === '确认替换并恢复'));
  await clickText('确认替换并恢复');
  await untilStored('existing real previous checkpoint rollback', record => record.raw === later.raw);
  await closeDialog();
  await stageIs('guided');
  check('The real previous-checkpoint rollback restores the later learning position exactly', (await progress()).raw === later.raw);
  await realLoad('Page.reload', { ignoreCache: true });
  await stageIs('guided');
  check('Refreshing preserves the genuine imported-then-rolled-back answer state', (await progress()).raw === later.raw);
  await selectTableCourse();
  await stageIs('review');
  await verifyTableHistory((await progress()).session, 'Current frozen view after rollback and refresh');
  check('Originals and saved correction remain unchanged after actual export/import/undo/refresh',
    JSON.stringify((await progress()).session) === JSON.stringify(original.session));
  assert.equal((await storedState()).drafts[contextKey], undefined, 'The unconnected namespace remains a blocker after transfer');
  await screenshot('host-existing-backup-rollback-history');
  const beforeHome = await progress();
  await realLoad('Page.navigate', { url: origin + '/standalone.html' });
  await settle('actual default main homepage', () => Boolean(document.querySelector('.today-practice[aria-label="今日推荐学习"]')));
  receipt.homeEntry = { url: await evaluate(() => location.href), clicks: ['课程', '雅思专项', '进入练习'] };
  await clickText('课程', '.studio-sidebar button');
  await settle('real library navigation', () => Boolean(document.querySelector('nav[aria-label="课程资料与专项"]')));
  await clickText('雅思专项', 'nav[aria-label="课程资料与专项"] button');
  await settle('real IELTS overview from homepage navigation', () => location.hash === '#/ielts' && Boolean(document.querySelector('a[href="#/ielts?tab=course"]')));
  await clickSelector('a[href="#/ielts?tab=course"]');
  await stageIs('review');
  check('The actual default main homepage reaches the course through visible catalogue and IELTS links',
    await evaluate(() => location.hash === '#/ielts?tab=course' && Boolean(document.querySelector('section[aria-label="雅思小任务工作区"]'))) &&
    (await progress()).raw === beforeHome.raw);
  await screenshot('host-default-home-navigation-to-course');
  check('The finite existing-backup group has no runtime or console error', receipt.runtimeErrors.length === 0 && receipt.consoleErrors.length === 0);
}

async function verifySnapshotDom(scope, snapshot, expectedAnswers, label) {
  const result = await evaluate(({ scope, snapshot, expectedAnswers }) => {
    const node = document.querySelector(scope), table = node?.querySelector('table');
    if (!node || !table) return { ok: false, reason: 'Missing archived task table' };
    const source = snapshot.table, actualRows = [...table.querySelectorAll('tbody > tr')];
    const passageMatches = node.querySelector('.sample-context')?.textContent === snapshot.context;
    const instructionMatches = node.textContent.includes(snapshot.instruction) &&
      node.querySelector('.ielts-table-stimulus__instruction')?.textContent === source.instruction;
    const captionMatches = table.querySelector('caption')?.textContent === source.caption;
    const columnsMatch = JSON.stringify([...table.querySelectorAll('thead th[scope="col"]')].map(th => th.textContent)) ===
      JSON.stringify([source.rowHeaderLabel, ...source.columns.map(column => column.label)]);
    const rowsMatch = actualRows.length === source.rows.length && actualRows.every((row, index) => row.querySelector('th[scope="row"]')?.textContent === source.rows[index].label);
    const cellsMatch = rowsMatch && actualRows.every((row, rowIndex) => source.columns.every((column, columnIndex) => {
      const cell = source.rows[rowIndex].cells[column.id], td = row.querySelectorAll('td')[columnIndex];
      if (!td) return false;
      if (cell.kind === 'text') return td.textContent === cell.text;
      const input = td.querySelector('input[data-question-id]');
      const affixes = [...td.querySelectorAll('.ielts-table-stimulus__surrounding')].map(span => span.textContent);
      const expectedAffixes = [cell.before, cell.after].filter(value => value !== undefined);
      return input?.dataset.questionId === cell.questionId && input.value === expectedAnswers[cell.questionId] &&
        input.readOnly && !input.disabled && JSON.stringify(affixes) === JSON.stringify(expectedAffixes);
    }));
    const questionsMatch = snapshot.questions.every(question => node.textContent.includes(question.prompt));
    return { ok: passageMatches && instructionMatches && captionMatches && columnsMatch && rowsMatch && cellsMatch && questionsMatch,
      passageMatches, instructionMatches, captionMatches, columnsMatch, rowsMatch, cellsMatch, questionsMatch, materialId: snapshot.id };
  }, { scope, snapshot, expectedAnswers });
  check(label + ' matches the persisted passage, instructions, caption, rows, columns, affixes and questions', result.ok, result);
}
async function verifyAllSnapshotHistory(session, contexts, label) {
  await showHistory();
  for (const [index, attempt] of session.attempts.entries()) {
    await verifySnapshotDom('#sample-answer-history section[aria-label="第 ' + (index + 1) + ' 次作答记录"]',
      contexts.materials[attempt.materialId], attempt.answers, label + ' original ' + (index + 1));
  }
  await verifySnapshotDom('#sample-answer-history section[aria-label="自己的订正"]',
    contexts.materials['ielts-r12-a-timed'], session.correctionAnswers, label + ' saved correction');
}

async function runTodayOnly() {
  receipt.profile = 'same-task-owned-profile-containing-only-earlier-synthetic-progress';
  await connectPage();
  await viewport(1280);
  await realLoad('Page.navigate', { url: origin + '/standalone.html#/ielts?tab=course' });
  await settle('actual course workspace on updated base', () => Boolean(document.querySelector('.ielts-sample-sequence')));
  const selected = await progress();
  if (selected.value.lessonId !== 'reading-writer-views') {
    await clickText('查看课程目录', '.sample-catalog button', false);
    await clickText('Academic · 找准作者的观点', 'nav[aria-label="课程学习次序"] button');
  }
  await stageIs('guided');
  const before = await progress(), beforeContext = contextRecord(await storedState());
  await clickSelector('section[aria-label="雅思小任务工作区"] a[href="#/today"]');
  await settle('actual updated Today queue', () => Boolean(document.querySelector('.today-practice[aria-label="今日推荐学习"]')));
  const href = '#/ielts?tab=course&task=sample-academic-reading-writer-views';
  const task = await evaluate(href => {
    const anchor = [...document.querySelectorAll('.today-practice a')].find(node => node.getAttribute('href') === href);
    return anchor ? { inClosedPlan: Boolean(anchor.closest('details') && !anchor.closest('details').open), title: anchor.textContent.trim() } : undefined;
  }, href);
  assert.ok(task, 'The actual updated Today UI must expose the existing unfinished course task');
  if (task.inClosedPlan) await clickSelector('.today-plan > summary');
  await clickSelector('.today-practice a[href="' + href + '"]');
  await stageIs('guided');
  await settle('actual Today target consumed', () => location.hash === '#/ielts?tab=course');
  const after = await progress(), afterContext = contextRecord(await storedState());
  check('The updated Today UI resumes the same unfinished course with exact raw progress and context unchanged',
    after.raw === before.raw && afterContext.raw === beforeContext.raw && JSON.stringify(after.value.sessions) === JSON.stringify(before.value.sessions));
  receipt.todayResume = { href, title: task.title, lessonId: after.value.lessonId, rawUnchanged: after.raw === before.raw, contextUnchanged: afterContext.raw === beforeContext.raw,
    sessionsUnchanged: JSON.stringify(after.value.sessions) === JSON.stringify(before.value.sessions) };
  await screenshot('host-new-today-same-course-resume');
  assert.equal(receipt.runtimeErrors.length, 0, 'The focused Today check has no runtime exception');
  assert.equal(receipt.consoleErrors.length, 0, 'The focused Today check has no console error');
}
