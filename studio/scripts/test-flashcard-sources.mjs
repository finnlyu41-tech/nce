import assert from 'node:assert/strict';
import {mkdir,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

// Exercise the real source components' click callbacks without a browser, network
// or generated textbook bundle. These checks do not replace layout/browser QA.
const root=new URL('../',import.meta.url),pnpmRoot=new URL('node_modules/.pnpm/',root);
const builder=(await readdir(pnpmRoot)).find(name=>/^esbuild@\d+\.\d+\.\d+$/.test(name));
assert(builder,'Install the locked project dependencies before running source checks');
const {build}=await import(new URL(`${builder}/node_modules/esbuild/lib/main.js`,pnpmRoot));
const harnessSource=`export const harness={states:[],cursor:0,writes:[],route:{},enrolled:false,enrolledChecks:[],open:()=>{}};`;
const mocks={
 'test:harness':harnessSource,
 'react':`import {harness as h} from 'test:harness';export const useEffect=()=>{},useMemo=f=>f(),useRef=v=>({current:v}),createContext=()=>({Provider:'ContextProvider'}),useContext=()=>h.open;export function useState(initial){const index=h.cursor++;if(!(index in h.states))h.states[index]=initial;return [h.states[index],value=>{h.states[index]=typeof value==='function'?value(h.states[index]):value;h.writes.push({index,value:h.states[index]})}]}`,
 'react/jsx-runtime':`export const Fragment='Fragment';export const jsx=(type,props)=>({type,props:props||{}});export const jsxs=jsx;`,
 'lucide-react':`export const ArrowRight='ArrowRight',BookOpen='BookOpen',Check='Check',ChevronLeft='ChevronLeft',ChevronRight='ChevronRight',Plus='Plus',Search='Search',Volume2='Volume2';`,
 '@/components/ui/dialog':`export const Dialog='Dialog',DialogContent='DialogContent',DialogHeader='DialogHeader',DialogTitle='DialogTitle',DialogDescription='DialogDescription';`,
 './use-route':`import {harness} from 'test:harness';export const useRoute=()=>harness.route;`,
 './flashcards':`import {harness} from 'test:harness';export const isFlashcardEnrolled=(state,word)=>{harness.enrolledChecks.push(word);return harness.enrolled};`,
 './runtime-mode':`export const ONLINE=true;`,
 './study-path':`export const bookNames={NCE1:'第一册',NCE2:'第二册',NCE3:'第三册',NCE4:'第四册'};`,
 './lesson-context':`export const loadPages=()=>{throw Error('Source checks must not fetch textbook material')};`,
 './language':`export const loadDictionary=()=>{throw Error('Source checks must not fetch dictionary material')},loadLessonLanguage=()=>{throw Error('Source checks must not fetch lesson material')},findWord=()=>undefined;`,
 './speech':`export const speak=()=>{};`,
 './playback-speed':`export const PlaybackSpeed='PlaybackSpeed';`,
 './navigation':`export const navigate=()=>{};`,
 './map-connection':`export const mapUnitId=()=>undefined;`,
 './textbook-grammar':`export const grammarPrintedPage=(book,page)=>page;`,
};
const output=new URL('work/flashcards/source-components-test.mjs',root);
await mkdir(new URL('work/flashcards/',root),{recursive:true});
await build({
 stdin:{contents:"export {TextbookVocabularyBrowser} from './app/textbook-vocabulary-ui.tsx';export {WordLookupProvider,WordLookupButton,WordText} from './app/word-lookup.tsx';export {initial} from './app/model.ts';export {ieltsFlashcardExamples,ieltsFlashcardDescription} from './app/ielts-flashcard-examples.ts';export {harness} from 'test:harness';",resolveDir:fileURLToPath(root),sourcefile:'source-test-entry.ts',loader:'ts'},
 bundle:true,platform:'node',format:'esm',target:'node22',jsx:'automatic',outfile:fileURLToPath(output),logLevel:'silent',
 plugins:[{name:'source-component-harness',setup(build){
  build.onResolve({filter:/.*/},args=>Object.hasOwn(mocks,args.path)?{path:args.path,namespace:'source-check'}:args.path.endsWith('.css')?{path:args.path,namespace:'empty-css'}:undefined);
  build.onLoad({filter:/.*/,namespace:'source-check'},args=>({contents:mocks[args.path],loader:'js'}));
  build.onLoad({filter:/.*/,namespace:'empty-css'},()=>({contents:'',loader:'js'}));
 }}],
});
const {TextbookVocabularyBrowser,WordLookupProvider,WordLookupButton,WordText,initial,ieltsFlashcardExamples,ieltsFlashcardDescription,harness:h}=await import(output.href);
const reset=(states,route)=>Object.assign(h,{states,cursor:0,writes:[],route,enrolledChecks:[],open:()=>{}});
function elements(node){if(!node||typeof node!=='object')return [];if(Array.isArray(node))return node.flatMap(elements);return [node,...elements(node.props?.children)]}
const find=(tree,predicate)=>{const item=elements(tree).find(predicate);assert(item,'Expected component element missing');return item};

const first={book:'NCE1',lesson:1,title:'Source fixture one',pages:[]};
const second={book:'NCE2',lesson:9,title:'Source fixture two',pages:[]};
const catalog={lessons:[{...first,key:'NCE1-1',words:[{word:'network',forms:[]}]},{...second,key:'NCE2-9',words:[{word:'network',forms:[]}]}],terms:[{key:'network',word:'network',sources:[first,second]}],entries:2};
const expectedSources=[{kind:'nce',book:'NCE1',lesson:1},{kind:'nce',book:'NCE2',lesson:9}];
const entry={word:'network',ipa:'netwɜːk',meaning:'n. 网络',source:'ecdict'};
const example={en:'We built a small network.',zh:'我们建立了一个小型网络。'};
const state={...structuredClone(initial),cards:{network:{box:2,due:1234567}}},before=structuredClone(state);
for(const tab of ['index','book']){
 reset([catalog,'',0,{network:entry},false,false,0,{key:'NCE1-1',rows:[example]}],{view:'words',book:'NCE1',lesson:tab==='book'?1:undefined,tab});h.enrolled=true;
 const added=[],tree=TextbookVocabularyBrowser({state,onAdd:word=>added.push(word)});
 const row=find(tree,node=>typeof node.type==='function'&&node.type.name==='VocabularyRow');
 assert.deepEqual(row.props.sources,expectedSources,`${tab}: callbacks retain the cross-book source even when the displayed index is filtered`);
 if(tab==='index')assert.equal(elements(row.props.children).filter(node=>node.props?.className==='vocabulary-occurrence').length,1,'The display still respects the selected book');
 const rendered=row.type(row.props),button=find(rendered,node=>node.type==='button'&&node.props.className?.includes('vocabulary-enroll'));
 assert.equal(button.props.disabled,false,'An enrolled word can receive missing sources');
 assert.equal(button.props['aria-label'],'补充复习词条来源 network');
 button.props.onClick();assert.equal(added.length,1);assert.deepEqual(added[0].sources,expectedSources);assert.equal(added[0].meaning,entry.meaning);
 assert.deepEqual(h.enrolledChecks[0],{word:'network',meaning:entry.meaning,example:''},'Enrollment checks use the same sense as the actual add callback');
 const lookup=find(rendered,node=>node.type===WordLookupButton),selections=[];h.open=selection=>selections.push(selection);lookup.type(lookup.props).props.onClick();
 assert.deepEqual(selections[0].sources,expectedSources,'Headword lookups retain all sources');
 if(tab==='book'){assert.equal(added[0].example,example.en);assert.equal(added[0].exampleTranslation,example.zh);assert.equal(selections[0].exampleTranslation,example.zh)}
 assert.deepEqual(state,before,'Source components do not alter a legacy schedule themselves');
}

const selection={word:'network',example:example.en,exampleTranslation:example.zh};
for(const {sources,route,expected} of [
 {sources:expectedSources,route:{book:'NCE3',lesson:51},expected:expectedSources},
 {sources:undefined,route:{book:'NCE3',lesson:51},expected:[{kind:'nce',book:'NCE3',lesson:51}]},
 {sources:[],route:{book:'NCE1',lesson:145},expected:undefined},
 {sources:undefined,route:{},expected:undefined},
]){
 reset([{...selection,sources},entry,false,'',false],route);let saved;
 const tree=WordLookupProvider({children:null,onAdd:word=>{saved=word}}),button=find(tree,node=>node.type==='button'&&node.props.className==='btn');
 button.props.onClick();assert.deepEqual(saved.sources,expected);assert.equal(saved.exampleTranslation,example.zh);assert.equal(h.states[4],true,'Existing void callbacks remain compatible');
}
for(const result of [false,true]){
 reset([selection,entry,false,'',false],{book:'NCE1',lesson:1});
 const button=find(WordLookupProvider({children:null,onAdd:()=>result}),node=>node.type==='button'&&node.props.className==='btn');
 button.props.onClick();assert.equal(h.states[4],result,'A rejected add must leave the lookup available and must not claim success');
}
reset([],{});let clicked;h.open=value=>{clicked=value};
const text=WordText({text:'network',...selection,sources:expectedSources});find(text,node=>node.type==='button').props.onClick();
assert.deepEqual(clicked.sources,expectedSources);assert.equal(clicked.exampleTranslation,example.zh);
assert.equal(ieltsFlashcardExamples.length,12);assert(ieltsFlashcardDescription.includes('本站原创')&&ieltsFlashcardDescription.includes('非 IELTS 官方题库'));
console.log('PASS source component callbacks: cross-book sources under filters, enrolled-source updates, translations, valid route fallback, rejected-add feedback and original examples.');
