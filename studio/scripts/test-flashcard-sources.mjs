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

// The compact word row must bind originals to its visible meaning line. The
// full dictionary definition is still retained by the enrollment callback.
const bookEntry={word:'book',ipa:'bʊk',meaning:'n. 书, 书籍\nv. 登记, 预订',source:'ecdict'};
const bookCatalog={lessons:[{...first,key:'NCE1-1',words:[{word:'book',forms:[]}]}],terms:[{key:'book',word:'book',sources:[first]}],entries:1};
for(const [query,sense] of [['','书；书籍'],['预订','预订；预约']]){
 reset([bookCatalog,'',0,{book:bookEntry},false,false,0,null],{view:'words',tab:'index',query});
 let saved;
 const tree=TextbookVocabularyBrowser({state,onAdd:word=>{saved=word}});
 const row=find(tree,node=>typeof node.type==='function'&&node.type.name==='VocabularyRow');
 const rendered=row.type(row.props);
 const usage=find(rendered,node=>typeof node.type==='function'&&node.type.name==='VocabularyExamples');
 assert.deepEqual(usage.props.examples.map(example=>example.sense),[sense],'Only the displayed dictionary sense receives an original example');
 find(rendered,node=>node.type==='button'&&node.props.className?.includes('vocabulary-enroll')).props.onClick();
 assert.equal(saved.meaning,bookEntry.meaning,'A display filter must not rewrite the saved definition');
 assert.equal(saved.example,usage.props.examples[0].en);
 assert.equal(saved.exampleTranslation,usage.props.examples[0].zh);
}
reset([{word:'book',example:''},bookEntry,false,'',false],{});let savedFallback;
const lookupFallback=WordLookupProvider({children:null,onAdd:word=>{savedFallback=word}});
find(lookupFallback,node=>node.type==='button'&&node.props.className==='btn').props.onClick();
assert(savedFallback.example.includes('borrowed a book')&&savedFallback.exampleTranslation.includes('借了一本'),'Lookup fallback enrollment retains a matched original and translation');
reset([{word:'books',example:''},bookEntry,false,'',false],{});let inflectedWord;
const inflectedLookup=WordLookupProvider({children:null,onAdd:word=>{inflectedWord=word}});
find(inflectedLookup,node=>node.type==='button'&&node.props.className==='btn').props.onClick();
assert.equal(inflectedWord.word,'books','The saved surface form remains unchanged');
assert.equal(inflectedWord.example,savedFallback.example,'An unreviewed inflection retains dictionary-headword example fallback');

// Real source components must use the reviewed teaching sense rather than a
// homograph's dictionary default. Other courses and existing records retain
// their own dictionary meaning; source labels alone cannot override it.
const lesson6={book:'NCE1',lesson:6,title:'',pages:[]};
for(const [word,raw,expected,id] of [['Fiat','n. 命令, 严命, 许可','n. 菲亚特（汽车品牌）','fiat-car-brand'],['make','vt. 制造, 安排','n. （产品的）牌子','make-product-brand'],['English','n. 英语\na. 英文的, 英国人的','adj. 英格兰的（原书简释：英国的）','english-country-adjective']]){
 const key=word.toLowerCase(),entry={word:key,ipa:'test',meaning:raw};
 const catalog={lessons:[{...lesson6,key:'NCE1-6',words:[{word,forms:[]}]}],terms:[{key,word,sources:[lesson6]}],entries:1};
 reset([catalog,'',0,{[key]:entry},false,false,0,null],{view:'words',book:'NCE1',lesson:6,tab:'book'});
 const added=[],tree=TextbookVocabularyBrowser({state,onAdd:word=>added.push(word)}),row=find(tree,node=>typeof node.type==='function'&&node.type.name==='VocabularyRow'),rendered=row.type(row.props);
 const usage=find(rendered,node=>typeof node.type==='function'&&node.type.name==='VocabularyExamples');
 assert(usage.props.examples.some(example=>example.id===id),'A source-scoped target is displayed even when dictionary default differs');
 find(rendered,node=>node.type==='button'&&node.props.className?.includes('vocabulary-enroll')).props.onClick();
 assert.equal(added[0].meaning,expected);assert(added[0].example&&added[0].exampleTranslation);
 assert.deepEqual(added[0].sources,[{kind:'nce',book:'NCE1',lesson:6}]);
 assert.equal(h.enrolledChecks[0].meaning,expected,'Enrollment indicator and add callback use the same teaching sense');
 reset([{word,example:'',sources:added[0].sources},entry,false,'',false],{});let lookupWord;
 const lookup=WordLookupProvider({children:null,onAdd:word=>{lookupWord=word}});
 assert(elements(lookup).some(node=>node.props?.className==='lookup-meaning'&&node.props.children===raw),'Lookup retains the complete original dictionary text');
 find(lookup,node=>node.type==='button'&&node.props.className==='btn').props.onClick();
 assert.equal(lookupWord.meaning,expected);assert.deepEqual(lookupWord.sources,added[0].sources);
 assert.deepEqual(state,before,'Reading or explicitly passing a new teaching word never edits legacy state by itself');
}
const fiatEntry={word:'fiat',ipa:'test',meaning:'n. 命令'};
for(const [word,lesson,raw,expected,id] of [
 ['old',10,'n. 以前, 往昔\\na. 年老的, 古老的','adj. 老的','old-age'],
 ['her',12,'pron. 她的, 她','possessive adjective 她的','her-possessive-determiner'],
 ['his',12,'pron. 他的','possessive adjective 他的','his-possessive-determiner'],
 ['blouse',12,'n. 宽松的上衣','n. 女衬衫','blouse-clothing'],
]){
 const source={book:'NCE1',lesson,title:'',pages:[]},entry={word,meaning:raw};
 const catalog={lessons:[{...source,key:'NCE1-'+lesson,words:[{word,forms:[]}]}],terms:[{key:word,word,sources:[source]}],entries:1};
 reset([catalog,'',0,{[word]:entry},false,false,0,null],{view:'words',book:'NCE1',lesson,tab:'book'});let saved;
 const tree=TextbookVocabularyBrowser({state,onAdd:word=>{saved=word}}),row=find(tree,node=>typeof node.type==='function'&&node.type.name==='VocabularyRow'),rendered=row.type(row.props);
 const usage=find(rendered,node=>typeof node.type==='function'&&node.type.name==='VocabularyExamples');
 assert.deepEqual(usage.props.examples.map(example=>example.id),[id],'The word row binds the reviewed source target and grammatical function');
 find(rendered,node=>node.type==='button'&&node.props.className?.includes('vocabulary-enroll')).props.onClick();
 assert.equal(saved.meaning,expected);assert.equal(saved.example,usage.props.examples[0].en);assert.equal(h.enrolledChecks[0].meaning,expected);
 reset([{word,example:'',sources:saved.sources},entry,false,'',false],{});let lookupWord;
 const lookup=WordLookupProvider({children:null,onAdd:word=>{lookupWord=word}});
 find(lookup,node=>node.type==='button'&&node.props.className==='btn').props.onClick();
 assert.equal(lookupWord.meaning,expected);assert.equal(lookupWord.example,saved.example,'The lookup default add preserves the target function');
}
reset([{word:'Fiat',example:'',sources:[{kind:'nce',book:'NCE2',lesson:87}]},fiatEntry,false,'',false],{});let unrelatedFiat;
const unrelatedLookup=WordLookupProvider({children:null,onAdd:word=>{unrelatedFiat=word}});
find(unrelatedLookup,node=>node.type==='button'&&node.props.className==='btn').props.onClick();
assert.equal(unrelatedFiat.meaning,fiatEntry.meaning,'An unrelated lesson cannot apply a brand definition');
assert.equal(unrelatedFiat.example,'','An unrelated dictionary meaning cannot enroll a brand example merely because the lookup can display other reviewed uses');
assert.equal(unrelatedFiat.exampleTranslation,undefined);

// Reviewed extensions remain visible in the full lookup even when the coarse
// dictionary omits a collective noun. The default add still uses the lesson's
// target adjective, rather than saving a different displayed sense.
for(const [word,raw,count,target] of [
 ['English','n. 英语\\na. 英文的, 英国人的',4,'english-country-adjective'],
 ['Swedish','n. 瑞典语\\na. 瑞典的, 瑞典语的',4,'swedish-country-adjective'],
 ['American','n. 美国人\\na. 美国的, 美洲的',2,'american-country-adjective'],
 ['Italian','n. 意大利人, 意大利语\\na. 意大利的, 意大利语的',4,'italian-country-adjective'],
]){
 reset([{word,example:'',sources:[{kind:'nce',book:'NCE1',lesson:6}]},{word,meaning:raw},false,'',false],{});let saved;
 const lookup=WordLookupProvider({children:null,onAdd:word=>{saved=word}});
 const usage=find(lookup,node=>typeof node.type==='function'&&node.type.name==='VocabularyExamples');
 assert.equal(usage.props.examples.filter(example=>example.origin==='original').length,count,'All explicitly reviewed senses are accessible in the full lookup');
 const teachingExample=usage.props.examples.find(example=>example.id===target);assert(teachingExample);
 find(lookup,node=>node.type==='button'&&node.props.className==='btn').props.onClick();
 assert.equal(saved.example,teachingExample.en,'The default add keeps the source target example');
 assert.equal(saved.exampleTranslation,teachingExample.zh);
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
