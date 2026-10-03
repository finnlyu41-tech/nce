import assert from 'node:assert/strict';
import {mkdtemp,readdir,rm} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import os from 'node:os';

// Exercise the actual component callbacks with explicit metadata/save fixtures.
// Not evidence of human speech, service assessment or natural-time review.
const root=new URL('../',import.meta.url),packages=new URL('node_modules/.pnpm/',root);
const builder=(await readdir(packages)).find(n=>/^esbuild@\d+\.\d+\.\d+$/.test(n));assert(builder);
const {build}=await import(new URL(builder+'/node_modules/esbuild/lib/main.js',packages));
const temp=await mkdtemp(path.join(os.tmpdir(),'speaking-hint-save-'));
const mocks={
 'test:harness':`export const h={states:[],refs:[],effects:[],jobs:[],cursor:0,refCursor:0,effectCursor:0};`,
 react:`import {h} from 'test:harness';export default {};export const useContext=()=>({stop(){},play(){}});export function useRef(v){const i=h.refCursor++;return h.refs[i]||(h.refs[i]={current:v})}export function useState(v){const i=h.cursor++;if(!(i in h.states))h.states[i]=typeof v==='function'?v():v;return[h.states[i],next=>{h.states[i]=typeof next==='function'?next(h.states[i]):next}]}export function useEffect(f,deps){const i=h.effectCursor++,old=h.effects[i];if(!old||!deps||deps.some((d,j)=>d!==old.deps?.[j]))h.jobs.push(()=>{old?.cleanup?.();h.effects[i]={deps,cleanup:f()}})}`,
 'react/jsx-runtime':`export const Fragment='Fragment';export const jsx=(type,props)=>({type,props:props||{}});export const jsxs=jsx;`,
 Recorder:`export const Recorder='Recorder';`,
 media:`export const PlayerContext={},StopAudio='StopAudio';`,
 model:`export const emptyRecord=()=>({round:0,answers:[],assisted:false,phase:'learn',attempts:[]});`,
 audio:`export const readSpeechAudio=async()=>null,writeSpeechAudio=async()=> 'synthetic-audio-revision';`,
};
const aliases={'app/recording-feedback':'Recorder','map/media':'media','map/model':'model','map/speech-recordings':'audio'};
const listeners=new Map();globalThis.window={addEventListener(n,f){listeners.set(n,f)},removeEventListener(n,f){if(listeners.get(n)===f)listeners.delete(n)}};
try{
 const output=path.join(temp,'checks.mjs');
 await build({stdin:{contents:"export {SpeakingPractice} from './map/speaking';export {h} from 'test:harness';",resolveDir:fileURLToPath(root),loader:'ts'},bundle:true,platform:'node',format:'esm',target:'node22',jsx:'automatic',outfile:output,logLevel:'silent',plugins:[{name:'save-contract',setup(b){
  b.onResolve({filter:/.*/},a=>{if(Object.hasOwn(mocks,a.path))return{path:a.path,namespace:'mock'};const resolved=path.resolve(a.resolveDir,a.path);for(const [suffix,key]of Object.entries(aliases))if(resolved===path.resolve(fileURLToPath(root),suffix))return{path:key,namespace:'mock'}});
  b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:mocks[a.path],loader:'js'}));
 }}]});
 const {SpeakingPractice,h}=await import(pathToFileURL(output));
 const find=(node,test)=>{if(!node||typeof node!=='object')return;if(Array.isArray(node)){for(const n of node){const r=find(n,test);if(r)return r}return}if(test(node))return node;return find(node.props?.children,test)};
 const flush=()=>new Promise(r=>setImmediate(r));
 function fixture(review){
  h.states=[];h.refs=[];h.effects=[];h.jobs=[];listeners.clear();
  const unit={id:'synthetic-unit',sourceSha256:'synthetic-source',rows:[{en:'Is this your handbag?',zh:'这是你的手提包吗？',start:0,end:1}]};
  const original={row:0,source:unit.sourceSha256,takes:[{id:'take-old',at:Date.now()-90000000,review:false,assisted:true}],comparison:['Synthetic saved comparison'],correction:{at:Date.now()-90000000,issues:[{title:'Synthetic word issue',action:'Listen again',word:'this',phoneme:'ð'}]}};
  let progress={records:{[unit.id]:{round:0,answers:[],assisted:false,phase:'learn',attempts:[],speaking:original}}},guard,closed=0,tree;
  const calls=[],save=change=>new Promise((resolve,reject)=>calls.push({change,resolve,reject}));
  function render(){h.cursor=0;h.refCursor=0;h.effectCursor=0;tree=SpeakingPractice({unit,state:progress,save,review,close:()=>closed++,onLeaveGuard:g=>guard=g});for(const f of h.jobs.splice(0))f();return tree}
  const button=text=>find(tree,n=>n.type==='button'&&n.props.children===text);
  const retry=()=>find(tree,n=>n.type==='button'&&['重试保存提示记录','正在保存提示记录…'].includes(n.props.children));
  const evaluate=call=>call.change(progress).records[unit.id].speaking;
  async function commit(call){progress=call.change(progress);call.resolve(true);await flush();render()}
  return {unit,original,calls,render,button,retry,evaluate,commit,get tree(){return tree},get record(){return progress.records[unit.id].speaking},get closed(){return closed},guard:()=>guard()};
 }
 let passed=0;
 for(const review of [true,false]){
  const f=fixture(review);f.render();await flush();f.render();if(review){f.button('还想不起，先看原句').props.onClick();f.render()}
  assert.equal(f.calls.length,1);const hintAt=f.evaluate(f.calls[0]).hintAt;
  assert.equal(await f.guard(),false);f.button('← 回到本课').props.onClick();assert.equal(f.closed,0);f.render();assert(listeners.has('beforeunload'));
  let warned=false;listeners.get('beforeunload')({preventDefault(){warned=true}});assert(warned);
  f.calls[0].resolve(false);await flush();f.render();assert(f.retry()&&!f.retry().props.disabled);assert.equal(f.record.hintAt,undefined);
  const retry=f.retry();retry.props.onClick();retry.props.onClick();assert.equal(f.calls.length,2,'Double click creates one retry');assert.equal(f.evaluate(f.calls[1]).hintAt,hintAt);
  f.calls[1].reject(Error('Synthetic rejected save'));await flush();f.render();assert.equal(await f.guard(),false);assert(find(f.tree,n=>n.props?.role==='alert'&&n.props.children==='Synthetic rejected save'));
  f.retry().props.onClick();await f.commit(f.calls[2]);assert.equal(f.record.hintAt,hintAt);for(const field of ['takes','correction','comparison'])assert.deepEqual(f.record[field],f.original[field]);assert.equal(await f.guard(),true);assert(!listeners.has('beforeunload'));f.button('← 回到本课').props.onClick();assert.equal(f.closed,1);passed++;
 }
 // Recorder cached its payload before a separately retried hint was committed.
 // Its subsequent retry must keep the newer help event without altering the take.
 const f=fixture(true);f.render();await flush();f.render();f.button('还想不起，先看原句').props.onClick();f.render();const hintAt=f.evaluate(f.calls[0]).hintAt;f.calls[0].resolve(false);await flush();f.render();
 const recorder=find(f.tree,n=>n.type==='Recorder'),take={id:'take-new',blob:new Blob(['unit metadata fixture'])};
 const recorded=recorder.props.onTakesChange([take],'recorded');await flush();assert.equal(f.calls.length,2);f.calls[1].resolve(false);await assert.rejects(recorded,/学习记录未保存成功/);f.render();
 f.retry().props.onClick();await f.commit(f.calls[2]);const retried=recorder.props.onTakesChange([take],'recorded');await flush();await f.commit(f.calls[3]);await retried;f.render();assert.equal(f.record.hintAt,hintAt);assert.equal(f.record.takes[0].assisted,true);assert.equal(f.record.recalledAt,undefined);assert.equal(await f.guard(),true);passed++;
 console.log(`${passed} source-component hint save cases passed: false, throw, true retry, duplicate click, beforeunload, leave guard and overlapping recorder retry. Metadata fixtures only.`);
}finally{delete globalThis.window;await rm(temp,{recursive:true,force:true})}
