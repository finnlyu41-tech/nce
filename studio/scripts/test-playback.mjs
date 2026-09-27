import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';

const moduleUrl = source => 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
const rateSource = stripTypeScriptTypes(await readFile(new URL('../app/playback-rate.ts', import.meta.url), 'utf8'));
const rateUrl = moduleUrl(rateSource);
const values = new Map();
const windowEvents = new EventTarget();
globalThis.window = Object.assign(windowEvents, {
  localStorage: {getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value)},
});
const {getPlaybackRate, setPlaybackRate, subscribePlaybackRate, PLAYBACK_RATES} = await import(rateUrl);
assert.equal(getPlaybackRate(), '1');
let changes = 0;
const unsubscribe = subscribePlaybackRate(() => changes++);
for (const rate of PLAYBACK_RATES) { setPlaybackRate(rate);assert.equal(getPlaybackRate(), rate); }
const beforeInvalid = changes;
for (const invalid of ['0', '-1', '3', 'NaN', '1.01', '']) setPlaybackRate(invalid);
assert.equal(changes, beforeInvalid);assert.equal(getPlaybackRate(), '2');
unsubscribe();setPlaybackRate('0.85');assert.equal(changes, beforeInvalid);
const reloaded = await import(moduleUrl(rateSource + '\n// New page instance'));
assert.equal(reloaded.getPlaybackRate(), '0.85', 'Speed survives a new page instance');

const spoken = [], notices = [];
const localVoice = {lang: 'en-GB', localService: true};
const remoteVoice = {lang: 'en-US', localService: false};
const synth = {speaking: false, pending: false, getVoices: () => [remoteVoice, localVoice],
  cancel() { this.speaking = false;this.pending = false; },
  speak(utterance) { spoken.push(utterance);this.speaking = true; },
};
window.speechSynthesis = synth;
globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
globalThis.playbackTestNotices = notices;
const speechSource = (await readFile(new URL('../app/speech.ts', import.meta.url), 'utf8'))
  .replace("import {toast} from 'sonner';", 'const toast = {error: text => globalThis.playbackTestNotices.push(text)};')
  .replace("'./playback-rate'", JSON.stringify(rateUrl));
const {speak} = await import(moduleUrl(stripTypeScriptTypes(speechSource)));

const ended = [];
speak('The same sentence.', ok => ended.push(ok));
assert.equal(spoken.at(-1).rate, .85);assert.equal(spoken.at(-1).voice, localVoice);
const lateEnd = spoken.at(-1).onend;
setPlaybackRate('0.5');assert.equal(spoken.at(-1).rate, .5);assert.equal(spoken.at(-1).text, 'The same sentence.');
lateEnd();assert.deepEqual(ended, [], 'Changing speed cannot complete or skip the current sentence');
setPlaybackRate('2');assert.equal(spoken.at(-1).rate, 2);
synth.speaking = false;spoken.at(-1).onend();assert.deepEqual(ended, [true]);
const completedCount = spoken.length;
setPlaybackRate('1');assert.equal(spoken.length, completedCount, 'Completed speech does not restart');

const canceled = [];
speak('Stop this sentence.', ok => canceled.push(ok));synth.cancel();
const stoppedCount = spoken.length;
setPlaybackRate('0.7');assert.equal(spoken.length, stoppedCount, 'Navigation cancellation is not undone by a speed change');
assert.deepEqual(canceled, [false]);

const sequence = [];
function next(index) { if (index < 2) speak('Line ' + index, ok => {if (ok) {sequence.push(index);next(index + 1);}}); }
next(0);setPlaybackRate('1.5');synth.speaking = false;spoken.at(-1).onend();
assert.equal(spoken.at(-1).text, 'Line 1');assert.equal(spoken.at(-1).rate, 1.5);
synth.speaking = false;spoken.at(-1).onend();assert.deepEqual(sequence, [0, 1]);

synth.getVoices = () => [remoteVoice];
const noVoiceCount = spoken.length;let unavailable;
speak('Local voices only.', ok => unavailable = ok);
assert.equal(unavailable, false);assert.equal(spoken.length, noVoiceCount);assert.equal(notices.length, 1);
const localAmerican={lang:'en-US',localService:true};
synth.getVoices=()=>[remoteVoice,localVoice,localAmerican];
speak('this',undefined,'en-US');assert.equal(spoken.at(-1).voice,localAmerican,'Pronunciation coaching uses the same accent as assessment');
synth.getVoices=()=>[localVoice];const beforeAmerican=spoken.length;
speak('this',ok=>unavailable=ok,'en-US');assert.equal(unavailable,false);assert.equal(spoken.length,beforeAmerican,'Do not silently switch pronunciation coaching to a different accent');

const realSet = window.localStorage.setItem;
window.localStorage.setItem = () => {throw Error('Storage unavailable');};
setPlaybackRate('0.5');assert.equal(getPlaybackRate(), '0.5', 'Speed still changes when saving is unavailable');
window.localStorage.setItem = realSet;
console.log('Playback speed persistence, boundaries, live speech changes, sentence sequencing and local-voice checks passed.');
