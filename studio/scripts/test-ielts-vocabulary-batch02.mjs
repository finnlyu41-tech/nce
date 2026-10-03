import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const root=new URL('../',import.meta.url),output=new URL('work/ielts-vocabulary-batch02/integration-test.mjs',root);
const pnpmRoot=new URL('node_modules/.pnpm/',root);
const builder=(await readdir(pnpmRoot)).find(name=>/^esbuild@\d+\.\d+\.\d+$/.test(name));
assert(builder,'Install locked project dependencies first');
const {build}=await import(new URL(`${builder}/node_modules/esbuild/lib/main.js`,pnpmRoot));
await mkdir(new URL('work/ielts-vocabulary-batch02/',root),{recursive:true});
// Real model/FSRS and component callbacks; no saved user data or material fetch.
const mocks={
 'test:harness':`export const h={states:[],cursor:0};`,
 'react':`import {h} from 'test:harness';export const useEffect=()=>{},useMemo=f=>f(),useRef=v=>({current:v});export function useState(v){const i=h.cursor++;if(!(i in h.states))h.states[i]=typeof v==='function'?v():v;return [h.states[i],v=>{h.states[i]=typeof v==='function'?v(h.states[i]):v}]}`,
 'react/jsx-runtime':`export const Fragment='Fragment',jsx=(type,props)=>({type,props:props||{}}),jsxs=jsx;`,
 'lucide-react':`export const ArrowRight='ArrowRight',BookOpen='BookOpen',Check='Check',Plus='Plus',RotateCcw='RotateCcw',Volume2='Volume2';`,
 './playback-speed':`export const PlaybackSpeed='PlaybackSpeed';`,
 './speech':`export const speak=()=>{};`,
};
await build({stdin:{contents:`export * from './app/ielts-flashcard-examples';export * from './app/data/ielts-vocabulary-r20';export * from './app/data/ielts-vocabulary-batch02';export {makeProgressFile,readProgressFile} from './app/progress-file';export * from './app/flashcards';export {initial,validateState} from './app/model';export {usageExamples} from './app/vocabulary-usage';export {FlashcardReview} from './app/flashcard-ui';export {h} from 'test:harness';`,resolveDir:fileURLToPath(root),sourcefile:'ielts-r20-test.ts',loader:'ts'},bundle:true,platform:'node',format:'esm',target:'node22',jsx:'automatic',outfile:fileURLToPath(output),logLevel:'silent',plugins:[{name:'isolated-component',setup(b){
 b.onResolve({filter:/.*/},a=>Object.hasOwn(mocks,a.path)?{path:a.path,namespace:'mock'}:a.path.endsWith('.css')?{path:a.path,namespace:'css'}:undefined);
 b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:mocks[a.path],loader:'js'}));
 b.onLoad({filter:/.*/,namespace:'css'},()=>({contents:'',loader:'js'}));
}}]});

const m=await import(output.href),batch=m.ieltsVocabularyBatch02,words=m.ieltsVocabularyBatch02Words,previous=[...m.ieltsFlashcardSeeds,...m.ieltsVocabularyR20Words];
const hash=v=>createHash('sha256').update(v).digest('hex');
assert.equal(batch.length,24);assert.equal(new Set(batch.map(s=>s.id)).size,24);assert.equal(new Set(words.map(w=>w.word)).size,24);
assert.equal(m.ieltsFlashcardExamples.length,84);
assert.equal(hash(JSON.stringify(previous)),'2b42bd1a7e5077bb8d0e1e6c495e999ff94903a6172629c31dae228e4a8d74d0','Frozen previous 60 changed');
for(const use of ['listening','speaking','reading','writing'])assert.equal(batch.filter(s=>s.use===use).length,6);
for(let i=0;i<24;i++){
 const s=batch[i],w=words[i];assert(!previous.some(p=>p.word.toLowerCase()===w.word.toLowerCase()));
 assert(s.definition&&s.scenario&&s.contrast&&s.collocation.en&&s.collocation.zh);
 assert(w.sources.length===1&&w.sources[0].kind==='ielts'&&w.sources[0].topic.startsWith('本站原创 · '));
 assert(!/[<>]/.test(w.meaning+w.example+w.exampleTranslation));
 const usage=m.usageExamples(w.word,w.meaning,[{en:w.example,zh:w.exampleTranslation}]);
 assert.equal(usage.length,1);assert.equal(usage[0].origin,'original');assert.deepEqual(usage[0].collocation,s.collocation);assert.deepEqual([usage[0].en,usage[0].zh],[s.en,s.zh]);
}
// Independent arithmetic guard for the linked but distinct senses.
assert.equal(12-10,2);assert.equal((12-10)/10*100,20);
assert(batch.find(s=>s.id==='iv02-percentage-point').contrast.includes('2 个百分点'));
assert(batch.find(s=>s.id==='iv02-percentage-increase').contrast.includes('20%'));
const now=Date.now(),enrol=(state,list)=>list.reduce((s,w)=>m.enrollFlashcard(s,w,[],now),state);
let before=enrol(structuredClone(m.initial),previous);
const first=Object.values(before.flashcards.cards)[0],token={cardId:first.id,revision:first.revision};
before=m.rateFlashcard(m.revealFlashcard(m.selectFlashcard(before,first.id),token),token,'good',now);
const frozen=structuredClone(before);let state=enrol(before,words);
assert(m.validateState(state));assert.equal(Object.keys(state.flashcards.cards).length,84);
for(const key of ['notes','cards'])for(const [id,item]of Object.entries(frozen.flashcards[key]))assert.deepEqual(state.flashcards[key][id],item);
for(const key of ['reviews','undo'])assert.deepEqual(state.flashcards[key],frozen.flashcards[key]);
for(const key of Object.keys(frozen).filter(k=>k!=='flashcards'))assert.deepEqual(state[key],frozen[key]);
assert.deepEqual(before,frozen);assert.deepEqual(enrol(state,m.ieltsFlashcardExamples),state);
const restored=await m.readProgressFile(m.makeProgressFile(state,new Date(now)));
assert.deepEqual(restored.state,state,'New records must survive the actual progress-file save/read contract');
function elements(node){if(!node||typeof node!=='object')return [];if(Array.isArray(node))return node.flatMap(elements);return [node,...elements(node.props?.children)]}
function texts(node){if(typeof node==='string'||typeof node==='number')return String(node);if(Array.isArray(node))return node.map(texts).join(' ');return node?.props?texts(node.props.children):''}
const find=(tree,p)=>{const n=elements(tree).find(p);assert(n,'Expected real component control missing');return n};
const render=(query='')=>{Object.assign(m.h,{states:[now,'ielts',query,'','',{key:'',value:''}],cursor:0});return m.FlashcardReview({state,ready:true,update:op=>{state=typeof op==='function'?op(state):op},onAdd:w=>{state=m.enrollFlashcard(state,w,[],now)},onSelectWords:()=>{}})};
for(const w of words){
 const note=Object.values(state.flashcards.notes).find(n=>n.word===w.word&&n.meaning===w.meaning),card=Object.values(state.flashcards.cards).find(c=>c.noteId===note.id);
 state=m.selectFlashcard(state,card.id);let tree=render(),face=find(tree,n=>n.props?.className==='flash-content');
 assert(texts(face).includes(w.word));assert(!texts(face).includes(w.meaning));assert(!elements(face).some(n=>n.type?.name==='VocabularyExamples'));
 find(tree,n=>n.type==='button'&&texts(n)==='翻开答案').props.onClick();tree=render();face=find(tree,n=>n.props?.className==='flash-content');
 assert(texts(face).includes(w.meaning));const usage=find(face,n=>n.type?.name==='VocabularyExamples').props.examples;
 assert.deepEqual(usage.map(e=>[e.en,e.zh]),[[w.example,w.exampleTranslation]]);assert.deepEqual(usage[0].collocation,batch.find(s=>s.prompt===w.word).collocation);
 assert.equal(state.flashcards.reviews.length,1,'Revealing is not scoring');
}
for(const [query,count]of [['percentage',2],['百分点',1],['eligible for a course',1],['身份证明',1],['a plausible explanation',1]]){
 const library=find(render(query),n=>n.props?.className?.includes('flashcard-library'));
 assert.equal(elements(library).filter(n=>n.type==='article').length,count,`Search: ${query}`);
}
state=structuredClone(m.initial);find(render(),n=>n.type==='button'&&texts(n).includes('加入这组主题词卡')).props.onClick();
assert.equal(Object.keys(state.flashcards.cards).length,84);const all=structuredClone(state);
find(render(),n=>n.type==='button'&&texts(n).includes('加入这组主题词卡')).props.onClick();assert.deepEqual(state,all);
const review=JSON.parse(await readFile(new URL('docs/verification/ielts-vocabulary-batch02-review.json',root),'utf8'));
assert.equal(review.contentSha256,hash(await readFile(new URL('app/data/ielts-vocabulary-batch02.ts',root))));
assert.equal(review.previousPayloadSha256,hash(JSON.stringify(previous)));
for(const field of ['blindReview','answerReview']){assert.equal(review[field].length,24);assert.deepEqual(new Set(review[field].map(r=>r.id)),new Set(batch.map(s=>s.id)));}
assert(review.answerReview.every(r=>r.verdict==='pass'),'Unresolved independent answer issue');
console.log('PASS batch02: 24 reviewed original senses, 6/use, 24 real flip callbacks, isolated examples/collocations, bilingual search, frozen previous 60, real FSRS history preserved, new progress file save/read, idempotent bulk84.');
