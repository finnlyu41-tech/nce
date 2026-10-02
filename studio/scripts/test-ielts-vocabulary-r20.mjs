import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const root=new URL('../',import.meta.url),output=new URL('work/ielts-r20/integration-test.mjs',root);
const pnpmRoot=new URL('node_modules/.pnpm/',root);
const builder=(await readdir(pnpmRoot)).find(name=>/^esbuild@\d+\.\d+\.\d+$/.test(name));
assert(builder,'Install locked project dependencies first');
const {build}=await import(new URL(`${builder}/node_modules/esbuild/lib/main.js`,pnpmRoot));
await mkdir(new URL('work/ielts-r20/',root),{recursive:true});
// Real model/FSRS and component callbacks; no saved user data or material fetch.
const mocks={
 'test:harness':`export const h={states:[],cursor:0};`,
 'react':`import {h} from 'test:harness';export const useEffect=()=>{},useMemo=f=>f(),useRef=v=>({current:v});export function useState(v){const i=h.cursor++;if(!(i in h.states))h.states[i]=typeof v==='function'?v():v;return [h.states[i],v=>{h.states[i]=typeof v==='function'?v(h.states[i]):v}]}`,
 'react/jsx-runtime':`export const Fragment='Fragment',jsx=(type,props)=>({type,props:props||{}}),jsxs=jsx;`,
 'lucide-react':`export const ArrowRight='ArrowRight',BookOpen='BookOpen',Check='Check',Plus='Plus',RotateCcw='RotateCcw',Volume2='Volume2';`,
 './playback-speed':`export const PlaybackSpeed='PlaybackSpeed';`,
 './speech':`export const speak=()=>{};`,
};
await build({stdin:{contents:`export * from './app/ielts-flashcard-examples';export * from './app/data/ielts-vocabulary-r20';export * from './app/flashcards';export {initial,validateState} from './app/model';export {usageExamples} from './app/vocabulary-usage';export {FlashcardReview} from './app/flashcard-ui';export {h} from 'test:harness';`,resolveDir:fileURLToPath(root),sourcefile:'ielts-r20-test.ts',loader:'ts'},bundle:true,platform:'node',format:'esm',target:'node22',jsx:'automatic',outfile:fileURLToPath(output),logLevel:'silent',plugins:[{name:'isolated-component',setup(b){
 b.onResolve({filter:/.*/},a=>Object.hasOwn(mocks,a.path)?{path:a.path,namespace:'mock'}:a.path.endsWith('.css')?{path:a.path,namespace:'css'}:undefined);
 b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:mocks[a.path],loader:'js'}));
 b.onLoad({filter:/.*/,namespace:'css'},()=>({contents:'',loader:'js'}));
}}]});
const m=await import(output.href),batch=m.ieltsVocabularyR20,words=m.ieltsVocabularyR20Words,seeds=m.ieltsFlashcardSeeds;
assert.equal(batch.length,48);assert.equal(seeds.length,12);assert.equal(m.ieltsFlashcardExamples.length,60);
assert.equal(new Set(batch.map(s=>s.id)).size,48);
assert.equal(new Set(words.map(w=>JSON.stringify([w.word,w.meaning]))).size,48);
for(const use of ['listening','speaking','reading','writing'])assert.equal(batch.filter(s=>s.use===use).length,12);
assert.equal(new Set(batch.map(s=>s.headword)).size,44);
for(const headword of ['book','charge','figure','decline']){
 const senses=batch.filter(s=>s.headword===headword);
 assert.equal(senses.length,2);assert.equal(new Set(senses.map(s=>s.prompt)).size,2,'Ambiguous senses need different English prompts');
 assert.equal(new Set(senses.map(s=>s.definition)).size,2);
}
for(let i=0;i<48;i++){
 const s=batch[i],w=words[i];
 assert(!seeds.some(seed=>seed.word===s.headword),`Seed duplicated: ${s.headword}`);
 assert(s.scenario&&s.contrast&&s.group&&s.collocation.en&&s.collocation.zh);
 assert(w.meaning.length<=300&&w.word.length<=100&&w.example.length<=1000);
 assert(!/[<>]/.test(w.meaning+w.example+w.exampleTranslation),'Content must remain plain text');
 const usage=m.usageExamples(w.word,w.meaning,[{en:w.example,zh:w.exampleTranslation}]);
 assert.equal(usage.length,1,'A sense must not pull in another IELTS or NCE meaning');
 assert.equal(usage[0].origin,'original');assert.deepEqual(usage[0].collocation,s.collocation);
 assert.equal(usage[0].en,s.en);assert.equal(usage[0].zh,s.zh);
}

const now=Date.now(),clone=v=>structuredClone(v);
const enrol=(s,list)=>list.reduce((s,w)=>m.enrollFlashcard(s,w,[],now),s);
let seeded=enrol(clone(m.initial),seeds);
const oldCard=Object.values(seeded.flashcards.cards)[0],token={cardId:oldCard.id,revision:oldCard.revision};
seeded=m.revealFlashcard(m.selectFlashcard(seeded,oldCard.id),token);
seeded=m.rateFlashcard(seeded,token,'good',now);
const prior=clone(seeded),withBatch=enrol(seeded,words);
assert(m.validateState(withBatch));assert.equal(Object.keys(withBatch.flashcards.notes).length,60);
assert.equal(Object.keys(withBatch.flashcards.cards).length,60);
for(const [id,note] of Object.entries(prior.flashcards.notes))assert.deepEqual(withBatch.flashcards.notes[id],note,'Seed identity/content must stay stable');
for(const [id,card] of Object.entries(prior.flashcards.cards))assert.deepEqual(withBatch.flashcards.cards[id],card,'Old due/revision/FSRS must stay stable');
assert.deepEqual(withBatch.flashcards.reviews,prior.flashcards.reviews);
assert.deepEqual(withBatch.flashcards.undo,prior.flashcards.undo);
for(const key of Object.keys(prior).filter(k=>k!=='flashcards'))assert.deepEqual(withBatch[key],prior[key]);
assert.deepEqual(seeded,prior,'Enrollment cannot mutate its input');
assert.deepEqual(enrol(withBatch,m.ieltsFlashcardExamples),withBatch,'Repeat bulk add must be idempotent');
assert.deepEqual(JSON.parse(JSON.stringify(withBatch)),withBatch,'JSON refresh retains all notes and existing history');
const queue=m.getFlashcardQueue(withBatch,now,'ielts');
assert.equal(queue.length,59,'Already reviewed seed stays scheduled; the 48 additions are new');
for(const entry of queue.filter(e=>words.some(w=>w.word===e.note.word))){
 assert.equal(entry.phase,'new');assert.equal(entry.card.due,now);assert.equal(entry.card.fsrs,undefined);
}

function elements(node){if(!node||typeof node!=='object')return [];if(Array.isArray(node))return node.flatMap(elements);return [node,...elements(node.props?.children)]}
function texts(node){if(typeof node==='string'||typeof node==='number')return String(node);if(Array.isArray(node))return node.map(texts).join(' ');return node?.props?texts(node.props.children):''}
const find=(tree,p)=>{const node=elements(tree).find(p);assert(node,'Expected real component control missing');return node};
let state=withBatch;
const render=(query='')=>{Object.assign(m.h,{states:[now,'ielts',query,'','',{key:'',value:''}],cursor:0});return m.FlashcardReview({state,ready:true,update:op=>{state=typeof op==='function'?op(state):op},onAdd:w=>{state=m.enrollFlashcard(state,w,[],now)},onSelectWords:()=>{}})};
for(const w of words){
 const note=Object.values(state.flashcards.notes).find(n=>n.word===w.word&&n.meaning===w.meaning);
 const card=Object.values(state.flashcards.cards).find(c=>c.noteId===note.id);
 state=m.selectFlashcard(state,card.id);
 let tree=render();
 let face=find(tree,n=>n.props?.className==='flash-content');
 assert(texts(face).includes(w.word));assert(!texts(face).includes(w.meaning));
 assert(!elements(face).some(n=>n.type?.name==='VocabularyExamples'),'Example must be hidden before recall');
 find(tree,n=>n.type==='button'&&texts(n)==='翻开答案').props.onClick();
 tree=render();face=find(tree,n=>n.props?.className==='flash-content');
 assert(texts(face).includes(w.meaning));
 const examples=find(face,n=>n.type?.name==='VocabularyExamples').props.examples;
 assert.deepEqual(examples.map(e=>[e.en,e.zh]),[[w.example,w.exampleTranslation]]);
 assert.deepEqual(examples[0].collocation,batch.find(s=>s.prompt===w.word).collocation);
 assert.equal(state.flashcards.reviews.length,1,'Revealing answers must not score them');
}
// Exercise real input onChange and memoized search, including both members of polysemy pairs.
let tree=render();const input=find(tree,n=>n.type==='input'&&n.props.placeholder==='英文或中文意思');
input.props.onChange({target:{value:'charge'}});
tree=render(m.h.states[2]);let library=find(tree,n=>n.props?.className?.includes('flashcard-library'));
assert.equal(elements(library).filter(n=>n.type==='article').length,2);
// Contrast text is searchable too: “充电” correctly retrieves both charge senses.
for(const [query,count] of [['充电',2],['公众人物',1],['拒绝参与',1],['抽样偏差',1],['confirm a reservation',1]]){
 tree=render(query);library=find(tree,n=>n.props?.className?.includes('flashcard-library'));
 assert.equal(elements(library).filter(n=>n.type==='article').length,count,`Search failed: ${query}`);
}
// The existing bulk-add callback reaches the combined collection and preserves genuine reviews.
const history=clone(state.flashcards.reviews),cards=clone(state.flashcards.cards);
find(render(),n=>n.type==='button'&&texts(n).includes('加入这组主题词卡')).props.onClick();
assert.deepEqual(state.flashcards.reviews,history);assert.deepEqual(state.flashcards.cards,cards);

// Review evidence is mandatory for this finite content batch, rather than a generated linguistic verdict.
const review=JSON.parse(await readFile(new URL('docs/verification/ielts-vocabulary-r20-review.json',root),'utf8'));
assert.equal(createHash('sha256').update(await readFile(new URL('app/data/ielts-vocabulary-r20.ts',root))).digest('hex'),review.contentSha256,'Content changed after independent sign-off');
assert.equal(createHash('sha256').update(JSON.stringify(seeds)).digest('hex'),review.seedSha256,'The original seed payload must remain unchanged');
assert.equal(review.blindReview.length,48);assert.equal(review.answerReview.length,48);
assert.deepEqual(new Set(review.blindReview.map(r=>r.id)),new Set(batch.map(s=>s.id)));
assert.deepEqual(new Set(review.answerReview.map(r=>r.id)),new Set(batch.map(s=>s.id)));
assert(review.answerReview.every(r=>r.verdict==='pass'),'Independent answer/translation review has unresolved issues');
console.log('PASS R20: 48 reviewed senses + unchanged 12 seeds; 4 use groups, 4 separated polysemy pairs, 48 real flip callbacks, bilingual/collocation display, English/Chinese search, repeat enrollment, JSON refresh and preserved prior FSRS/history.');
