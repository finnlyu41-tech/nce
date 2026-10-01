import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';

const sourcePath=process.argv[2]||new URL('../app/reading-position.ts',import.meta.url);
const source=stripTypeScriptTypes(await readFile(sourcePath,'utf8'));
const {ensureReadingEntry,readingEntrySnapshot,readReadingLine,writeReadingLine,readingContentId,readingAudioId}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const url=lesson=>`https://example.test/#/nce/NCE1/${lesson}?tab=listen`;
let entries=[{url:url(99),state:{studioScroll:2267,existing:'preserved'}}],cursor=0;
globalThis.location={get href(){return entries[cursor].url}};
globalThis.history={
 get state(){return entries[cursor].state},
 replaceState(state){entries[cursor]={...entries[cursor],state}},
};
const owner=()=>{ensureReadingEntry();const [url,id]=JSON.parse(readingEntrySnapshot());return {url,id}};
const push=lesson=>{entries=entries.slice(0,cursor+1);entries.push({url:url(lesson),state:{studioScroll:0}});cursor++;return owner()};
const source99='site:NCE1:99:transcript-us-99:recording-us-99';
const source97='site:NCE1:97:transcript-us-97:recording-us-97';

const first99=owner();
assert.deepEqual(owner(),first99,'Renders do not create a fresh history identity');
assert.equal(readReadingLine(source99,16),0);
assert.equal(writeReadingLine(first99,source99,16,9),true);
assert.equal(readReadingLine(source99,16),9);
assert.equal(history.state.studioScroll,2267,'Sentence selection preserves the existing scroll record');
assert.equal(history.state.existing,'preserved');
assert.equal(entries.length,1,'Changing sentence never pushes a history entry');

const entry97=push(97);
assert.equal(readReadingLine(source97,12),0,'A new lesson starts at its own first sentence');
writeReadingLine(entry97,source97,12,3);
cursor--;
assert.equal(readReadingLine(source99,16),9,'Back restores sentence 10, without waiting for an audio event');
cursor++;
assert.equal(readReadingLine(source97,12),3,'Forward restores that entry independently');
const second99=push(99);
assert.notEqual(second99.id,first99.id);
assert.equal(readReadingLine(source99,16),0,'A later visit to the same URL is a separate history entry');
writeReadingLine(second99,source99,16,2);
cursor=0;
assert.equal(writeReadingLine(second99,source99,16,5),false,'Late events from a different same-URL entry cannot overwrite the destination');
assert.equal(writeReadingLine(entry97,source97,12,4),false,'Late events from the outgoing lesson cannot affect the destination');
assert.equal(readReadingLine(source99,16),9);
cursor=2;
assert.equal(readReadingLine(source99,16),2,'The second visit retains its own sentence');
assert.equal(readReadingLine(source99,16,structuredClone(history.state)),2,'A reload reads serializable history state without in-memory progress');

for(const different of [source97,'site:NCE1:99:transcript-uk-99:recording-uk-99','site:NCE1:99:transcript-us-99:updated-recording'])assert.equal(readReadingLine(different,16),0,'Different lessons, text or recordings do not reuse the sentence');
assert.equal(readReadingLine(source99,2),0,'An out-of-range saved sentence resets safely after content changes');
assert.equal(readReadingLine(undefined,16),0,'An async loading placeholder does not consume the saved selection');
const beforeInvalid=structuredClone(history.state);
for(const line of [-1,16,1.5,NaN,Infinity,'3'])assert.equal(writeReadingLine(second99,source99,16,line),false);
assert.equal(writeReadingLine(second99,undefined,16,0),false);
assert.deepEqual(history.state,beforeInvalid,'Invalid or incomplete input cannot erase a saved selection');
for(const malformed of [null,{}, {studioReadingPosition:{version:2,entry:'old',source:source99,line:2}}, {studioReadingPosition:{version:1,entry:'ok',source:source99,line:'2'}}])assert.equal(readReadingLine(source99,16,malformed),0);

const sentence=[['A sentence.',10.1],['Another sentence.',13.2]];
assert.equal(readingContentId(sentence),readingContentId(structuredClone(sentence)));
assert.notEqual(readingContentId(sentence),readingContentId([['A changed sentence.',10.1],sentence[1]]));
assert.notEqual(readingContentId(sentence),readingContentId([['A sentence.',11.1],sentence[1]]));
assert.notEqual(await readingAudioId(new Blob(['abc'])),await readingAudioId(new Blob(['xyz'])),'Even equal-size replacement recordings get a different identity');
assert.equal(await readingAudioId(new Blob(['abc'])),await readingAudioId(new Blob(['abc'])),'Reloading the same recording retains its identity');
// History is optional UI storage. Refusing reads/writes must leave selection usable.
const liveHistory=globalThis.history;
entries.push({url:url(101),state:{}});cursor=entries.length-1;
globalThis.history={get state(){throw Error('History unavailable')},replaceState(){throw Error('History unavailable')}};
assert.doesNotThrow(()=>ensureReadingEntry());
const denied=owner();
assert.equal(writeReadingLine(denied,'saved:101',12,6),true);
assert.equal(readReadingLine('saved:101',12),6,'A denied history write still keeps the current reader usable');
assert.doesNotThrow(()=>readingEntrySnapshot());
ensureReadingEntry(true);
assert.notEqual(owner().id,denied.id,'Without persistent history, a traversal starts a safe fresh entry');
assert.equal(writeReadingLine(denied,'saved:101',12,8),false,'Stale callbacks remain isolated when history is unavailable');
entries.push({url:url(103),state:{studioScroll:400}});cursor=entries.length-1;
globalThis.history={get state(){return entries[cursor].state},replaceState(){throw Error('Writes refused')}};
assert.doesNotThrow(()=>ensureReadingEntry());
const readOnly=owner();
assert.equal(writeReadingLine(readOnly,'saved:103',12,4),true);
assert.equal(readReadingLine('saved:103',12),4,'Read-only history also falls back to in-memory selection');
assert.equal(history.state.studioScroll,400);
globalThis.history=liveHistory;
console.log('Reading history: Back, Forward, reload, duplicate URLs, late media events, invalid indices, text/audio source isolation and refused history storage passed.');
