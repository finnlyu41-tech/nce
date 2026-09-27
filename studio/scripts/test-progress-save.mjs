import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';

const root = new URL('../app/', import.meta.url);
const moduleUrl = text => 'data:text/javascript;base64,' + Buffer.from(text).toString('base64');
const modelUrl = moduleUrl(stripTypeScriptTypes(await readFile(new URL('model.ts', root), 'utf8')));
const source = (await readFile(new URL('progress-file.ts', root), 'utf8')).replace(
  "import {State, validateState} from './model';", `import {validateState} from '${modelUrl}';`,
);
const {initial} = await import(modelUrl);
const {makeProgressFile, readProgressFile, downloadProgress, saveProgressToFiles, MAX_PROGRESS_BYTES} = await import(moduleUrl(stripTypeScriptTypes(source)));
const state = {
  ...structuredClone(initial), completed: [1, 3], lastLesson: 3,
  nce: {'NCE1-1': {title: 'Excuse me!', text: 'Excuse me!', notes: '先听后说', steps: ['listen', 'words'], review: {checks: ['meaning'], checkedAt: 1000, dueAt: 2000}}},
  nceLast: {book: 'NCE1', lesson: 1}, nceEdition: 'standard',
  personalWords: [{word: 'handbag', ipa: '/ˈhændbæɡ/', meaning: '手提包', example: 'Is this your handbag?'}],
  cards: {handbag: {box: 2, due: 1790500000000}}, scores: {'unit-1': 75},
  mistakes: {q1: {id: 'q1', type: 'choice', prompt: 'I … happy.', options: ['am', 'is'], answer: 'am', explanation: 'I am'}},
  days: ['2026-09-27'], attempts: 3, correct: 2,
  drafts: {'nce-guide-NCE1-1': '{"step":3,"own":"This is my bag."}', 'ielts-writing': '我的草稿'},
  custom: [{id: 'one', title: '自备文字', text: 'Hello world.'}],
};
const now = new Date('2026-09-27T03:00:00.123Z');
const file = makeProgressFile(state, now);
assert.match(file.name, /^English-Studio-progress-2026-09-27T03-00-00-123Z\.json$/);
assert.equal(file.type, 'application/json');
assert.deepEqual(await readProgressFile(file), {state, savedAt: now.toISOString()});
const envelope = JSON.parse(await file.text());
state.nce['NCE1-1'].notes = '保存后新写的笔记';
assert.equal((await readProgressFile(file)).state.nce['NCE1-1'].notes, '先听后说', 'Saving must capture a stable snapshot immediately');
assert.equal((await readProgressFile(makeProgressFile(state))).state.nce['NCE1-1'].notes, '保存后新写的笔记');
assert.deepEqual(await readProgressFile(new Blob([JSON.stringify(state)])), {state, savedAt: null}, 'Legacy JSON stays readable');

for (const bad of [null, [], {}, {...state, format: 'another-app'}, {...envelope, version: 2}, {...envelope, savedAt: 'bad-date'},
  {...envelope, state: {...state, nceLast: {book: 'NCE1', lesson: 145}}},
  {...envelope, state: {...state, cards: {bad: null}}},
  {...envelope, state: {...state, correct: 10}},
  {...envelope, state: {...state, drafts: JSON.parse('{"__proto__":"bad"}')}},
]) await assert.rejects(readProgressFile(new Blob([JSON.stringify(bad)])));
await assert.rejects(readProgressFile(new Blob(['{not JSON'])), /文件无法读取/);
await assert.rejects(readProgressFile({size: MAX_PROGRESS_BYTES + 1, text() {throw Error('Do not read oversized input');}}), /25 MB/);
assert.throws(() => makeProgressFile({...state, drafts: {big: 'x'.repeat(MAX_PROGRESS_BYTES)}}), /25 MB/);

const calls = [];
let downloadCount = 0;
let removed = false;
let filename;
const oldTimeout = globalThis.setTimeout;
globalThis.setTimeout = callback => { callback(); return 0; };
globalThis.document = {
  body: {appendChild(link) {assert.equal(link.download, file.name);}},
  createElement() {return {href: '', download: '', click() {downloadCount++; filename = this.download;}, remove() {removed = true;}};},
};
globalThis.window = {};
Object.defineProperty(globalThis, 'navigator', {configurable: true, value: {}});
assert.equal(downloadProgress(file), 'downloaded');
assert.equal(filename, file.name);
assert(removed);
assert.equal(await saveProgressToFiles(file), 'downloaded', 'Unsupported browsers still allow a local download');

window.showSaveFilePicker = async options => {
  calls.push('picker');
  assert.equal(options.suggestedName, file.name);
  return {createWritable: async () => ({
    write: async data => {calls.push('write'); assert.equal(await data.text(), await file.text());},
    close: async () => {calls.push('close');}, abort: async () => {calls.push('abort');},
  })};
};
const saving = saveProgressToFiles(file);
assert.deepEqual(calls, ['picker'], 'Open native picker synchronously inside the click gesture');
assert.equal(await saving, 'written');
assert.deepEqual(calls, ['picker', 'write', 'close']);
window.showSaveFilePicker = async () => {throw new DOMException('cancelled', 'AbortError');};
assert.equal(await saveProgressToFiles(file), 'cancelled');
assert.equal(downloadCount, 2, 'Cancelling never starts an unexpected download');
window.showSaveFilePicker = async () => ({createWritable: async () => ({
  write: async () => {throw Error('disk full');}, close: async () => assert.fail('Do not close failed writes'),
  abort: async () => {calls.push('abort');},
})});
await assert.rejects(saveProgressToFiles(file), /disk full/);
assert.equal(calls.at(-1), 'abort', 'Abort a failed native write to preserve the prior file');

delete window.showSaveFilePicker;
navigator.canShare = data => data.files[0] === file;
navigator.share = async data => {calls.push('share'); assert.deepEqual(data, {files: [file]});};
const sharing = saveProgressToFiles(file);
assert.equal(calls.at(-1), 'share', 'Open the system share panel before losing the user gesture');
assert.equal(await sharing, 'shared');
navigator.share = async () => {throw new DOMException('cancelled', 'AbortError');};
assert.equal(await saveProgressToFiles(file), 'cancelled');
navigator.share = async () => {throw new DOMException('not allowed', 'NotAllowedError');};
await assert.rejects(saveProgressToFiles(file), /not allowed/);
assert.equal(downloadCount, 2, 'Failures do not silently create a second copy');
navigator.canShare = () => false;
assert.equal(await saveProgressToFiles(file), 'downloaded');
globalThis.setTimeout = oldTimeout;
console.log('Progress checks passed: complete and legacy round trips; invalid/oversized inputs; native write, share, download, cancellation and failure paths.');
