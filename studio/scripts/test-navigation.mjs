import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const model=moduleUrl(stripTypeScriptTypes(await readFile(new URL('../app/model.ts',import.meta.url),'utf8')));
const source=(await readFile(new URL('../app/navigation.ts',import.meta.url),'utf8')).replace("'./model'",JSON.stringify(model));
const {parseRoute,routeHash,navigate}=await import(moduleUrl(stripTypeScriptTypes(source)));
for(const route of [
 {view:'nce'}, {view:'nce',book:'NCE1'}, {view:'nce',book:'NCE1',lesson:1,tab:'notes',step:0}, {view:'nce',book:'NCE2',lesson:11,tab:'notes',step:4}, {view:'nce',book:'NCE1',lesson:144,tab:'practice'},
 {view:'nce',book:'NCE3',filter:'active',query:'自己的笔记'}, {view:'lesson',lesson:36,tab:'grammar'},
 {view:'ielts',tab:'writing',task:'ielts-w3'}, {view:'ielts',tab:'speaking',task:'bank-3-25-5'}, {view:'cloud',book:'NCE2',file:'m_example'}, {view:'quiz',task:'mistakes'},
])assert.deepEqual(parseRoute(routeHash(route)),route);
assert.deepEqual(parseRoute('#/nce/__proto__/1'),{view:'nce'});
assert.deepEqual(parseRoute('#/nce/NCE1/145?tab=invalid'),{view:'nce',book:'NCE1'});
assert.deepEqual(parseRoute('#/lesson/-10'),{view:'lesson',lesson:1});
assert.deepEqual(parseRoute('#/unknown'),{view:'nce'});
assert.equal(parseRoute('#/nce/NCE1/1?tab=notes&step=9').step,undefined);
assert.equal(parseRoute('#/nce/NCE1/1?tab=words&step=3').step,undefined);
let entries=[{hash:'#/nce',state:{}}],cursor=0,events=0;
globalThis.location={get hash(){return entries[cursor].hash}};
globalThis.history={get state(){return entries[cursor].state},replaceState(state,_unused,hash){entries[cursor]={state,hash:hash||entries[cursor].hash}},pushState(state,_unused,hash){entries=entries.slice(0,cursor+1);entries.push({state,hash});cursor++}};
globalThis.window={scrollY:340,speechSynthesis:{cancel(){}},dispatchEvent(){events++}};
navigate({view:'nce',book:'NCE1',lesson:1});
assert.equal(entries[0].state.studioScroll,340);assert.equal(entries[1].state.studioScroll,0);
window.scrollY=800;navigate({view:'nce',book:'NCE1',lesson:1,tab:'words'},{keepScroll:true});
assert.equal(entries[2].state.studioScroll,800);
navigate({view:'nce',book:'NCE1',lesson:1,tab:'words'});assert.equal(entries.length,3,'Duplicate URL adds no history entry');
cursor--;assert.equal(parseRoute(location.hash).lesson,1);cursor++;assert.equal(parseRoute(location.hash).tab,'words');
assert.equal(events,2);
console.log('Course, tab, task, invalid URL and browser-history entry checks passed.');
