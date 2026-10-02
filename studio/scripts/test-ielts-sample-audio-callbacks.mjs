import assert from 'node:assert/strict';
import {mkdtemp,readdir,rm} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import os from 'node:os';

// Source-component callback regression. Speech callbacks are explicit unit-test
// events, never evidence of ended, audible or successful browser playback.
const root=new URL('../',import.meta.url),packages=new URL('node_modules/.pnpm/',root);
const builder=(await readdir(packages)).find(name=>/^esbuild@\d+\.\d+\.\d+$/.test(name));
assert(builder);const {build}=await import(new URL(builder+'/node_modules/esbuild/lib/main.js',packages));
const temp=await mkdtemp(path.join(os.tmpdir(),'ielts-audio-callback-check-'));
const mocks={
 'test:harness':'export const h={states:[],refs:[],cursor:0,refCursor:0};',
 react:`import {h} from 'test:harness';export const useEffect=()=>{},useLayoutEffect=f=>f();export function useRef(v){const i=h.refCursor++;return h.refs[i]||(h.refs[i]={current:v})}export function useState(v){const i=h.cursor++;if(!(i in h.states))h.states[i]=typeof v==='function'?v():v;return [h.states[i],next=>{h.states[i]=typeof next==='function'?next(h.states[i]):next}]}`,
 'react/jsx-runtime':"export const Fragment='Fragment';export const jsx=(type,props)=>({type,props:props||{}});export const jsxs=jsx;",
};
let currentUtterance;
globalThis.window={speechSynthesis:{cancel(){},getVoices(){return []},speak(value){currentUtterance=value}}};
globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
try{
 const output=path.join(temp,'checks.mjs');
 await build({stdin:{contents:"export {IELTSSampleSequence as Sequence} from './ielts-blueprint/sample-sequence-ui';export * as m from './ielts-blueprint/sample-sequence-model';export * as p from './app/ielts-sample-progress';export {initial} from './app/model';export {h} from 'test:harness';",resolveDir:fileURLToPath(root),loader:'ts'},bundle:true,platform:'node',format:'esm',target:'node22',jsx:'automatic',outfile:output,logLevel:'silent',plugins:[{name:'callback-contract',setup(b){b.onResolve({filter:/.*/},args=>Object.hasOwn(mocks,args.path)?{path:args.path,namespace:'mock'}:path.resolve(args.resolveDir,args.path)===path.resolve(fileURLToPath(root),'app/recording-feedback')?{path:'Recorder',namespace:'recorder'}:undefined);b.onLoad({filter:/.*/,namespace:'mock'},args=>({contents:mocks[args.path],loader:'js'}));b.onLoad({filter:/.*/,namespace:'recorder'},()=>({contents:'export function Recorder(){return null}',loader:'js'}));}}]});
 const {Sequence,m,p,initial,h}=await import(pathToFileURL(output));
 const find=(node,predicate)=>{if(!node||typeof node!=='object')return;if(Array.isArray(node)){for(const n of node){const found=find(n,predicate);if(found)return found}return}if(predicate(node))return node;return find(node.props?.children,predicate)};
 let passed=0;
 for(const variant of ['academic','general-training'])for(const lessonId of ['listening-form','listening-multiple-answers']){
  h.states=[];h.refs=[];
  let value=m.emptySampleState();
  for(const action of [{type:'select-variant',variant},{type:'open-lesson',lessonId},{type:'next'},{type:'next'}]){const r=m.transitionSample(value,action,Date.now());assert(!r.issue);value=r.state}
  const material=m.activeSampleMaterial(value);
  for(const q of material.questions){const r=m.transitionSample(value,{type:'answer',questionId:q.id,value:q.accepted[0]},Date.now());assert(!r.issue);value=r.state}
  const originalAnswers=structuredClone(m.activeSampleDraft(value).answers),originalRaw=p.serializeSampleProgress(value);
  let host={...structuredClone(initial),drafts:{other:'untouched',[p.sampleProgressKey]:originalRaw}},pending,generation=0;
  const factory=()=>{const expected=host.drafts[p.sampleProgressKey],bound=++generation;return next=>{const nextRaw=p.serializeSampleProgress(next);const result=p.replaceSampleProgress(host,pending?.raw??expected,nextRaw);pending={raw:nextRaw};host=result;return bound}};
  const render=()=>{h.cursor=0;h.refCursor=0;return Sequence({value:p.readSampleProgress(host.drafts[p.sampleProgressKey]).value,onChange:factory(),guidedFlow:true})};
  const ack=()=>{pending=undefined;return render()};
  let tree=render();const button=()=>find(tree,n=>n.type==='button'&&typeof n.props.onClick==='function'&&['播放这段音频','再次播放（保留重播记录）'].includes(n.props.children));
  assert(button());button().props.onClick();const utterance=currentUtterance;assert(utterance);
  assert.equal(m.activeSampleDraft(p.readSampleProgress(host.drafts[p.sampleProgressKey]).value).playbacks.at(-1).status,'requested');
  tree=ack();utterance.onstart();
  assert.equal(m.activeSampleDraft(p.readSampleProgress(host.drafts[p.sampleProgressKey]).value).playbacks.at(-1).status,'playing','The asynchronous callback must use the newly committed host callback, after the pending request was acknowledged');
  tree=ack();utterance.onerror({error:'synthetic-unit-test-failure'});
  let current=p.readSampleProgress(host.drafts[p.sampleProgressKey]).value;
  assert.equal(m.activeSampleDraft(current).playbacks.at(-1).status,'failed');assert.equal(m.activeSampleDraft(current).playbacks.at(-1).audible,false);
  assert.deepEqual(m.activeSampleDraft(current).answers,originalAnswers);assert.equal(m.sampleSession(current).attempts.length,0);assert.equal(host.drafts.other,'untouched');
  tree=ack();button().props.onClick();const second=currentUtterance;tree=ack();utterance.onstart();
  assert.equal(m.activeSampleDraft(p.readSampleProgress(host.drafts[p.sampleProgressKey]).value).playbacks.at(-1).status,'requested','A superseded playback callback is ignored');
  second.onstart();tree=ack();second.onerror({error:'synthetic-unit-test-failure'});tree=ack();
  assert.equal(m.activeSampleDraft(p.readSampleProgress(host.drafts[p.sampleProgressKey]).value).playbacks.length,2);
  // Actual host semantics are unchanged: a writer captured before an external
  // restore must fail CAS, and a callback for a removed playback cannot revive it.
  const staleWriter=factory(),beforeRestore=host.drafts[p.sampleProgressKey];
  host={...host,drafts:{...host.drafts,[p.sampleProgressKey]:originalRaw}};pending=undefined;tree=render();
  const restored=host;staleWriter(p.readSampleProgress(beforeRestore).value);assert.equal(host,restored,'CAS still refuses a genuine external restore conflict');
  pending=undefined;tree=render();second.onstart();assert.equal(host,restored,'Removed audio metadata cannot be reintroduced by a stale event');
  assert.equal(m.activeSampleDraft(p.readSampleProgress(host.drafts[p.sampleProgressKey]).value).playbacks.length,0);
  passed++;console.log('PASS fresh host callback, replay, superseded event and external restore: '+variant+'/'+lessonId);
 }
 console.log(passed+' source-component asynchronous callback cases passed; no ended/audible callback fabricated');
}finally{delete globalThis.window;delete globalThis.SpeechSynthesisUtterance;await rm(temp,{recursive:true,force:true})}
