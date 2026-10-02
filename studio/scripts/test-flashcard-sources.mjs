import assert from 'node:assert/strict';
import {mkdir,readdir,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

// Exercise the real source components' click callbacks without a browser, network
// or generated textbook bundle. These checks do not replace layout/browser QA.
const root=new URL('../',import.meta.url),pnpmRoot=new URL('node_modules/.pnpm/',root);
const builder=(await readdir(pnpmRoot)).find(name=>/^esbuild@\d+\.\d+\.\d+$/.test(name));
assert(builder,'Install the locked project dependencies before running source checks');
const {build}=await import(new URL(`${builder}/node_modules/esbuild/lib/main.js`,pnpmRoot));
const harnessSource=`export const harness={states:[],cursor:0,refs:[],refCursor:0,writes:[],route:{},enrolled:false,enrolledChecks:[],speechCalls:[],open:()=>{}};`;
const mocks={
 'test:harness':harnessSource,
 'react':`import {harness as h} from 'test:harness';export const useEffect=()=>{},useMemo=f=>f(),createContext=()=>({Provider:'ContextProvider'}),useContext=()=>h.open;export function useRef(value){const index=h.refCursor++;return h.refs[index]||(h.refs[index]={current:value})}export function useState(initial){const index=h.cursor++;if(!(index in h.states))h.states[index]=initial;return [h.states[index],value=>{h.states[index]=typeof value==='function'?value(h.states[index]):value;h.writes.push({index,value:h.states[index]})}]}`,
 'react/jsx-runtime':`export const Fragment='Fragment';export const jsx=(type,props)=>({type,props:props||{}});export const jsxs=jsx;`,
 'lucide-react':`export const ArrowRight='ArrowRight',BookOpen='BookOpen',Check='Check',ChevronLeft='ChevronLeft',ChevronRight='ChevronRight',Plus='Plus',Search='Search',Volume2='Volume2';`,
 '@/components/ui/dialog':`export const Dialog='Dialog',DialogContent='DialogContent',DialogHeader='DialogHeader',DialogTitle='DialogTitle',DialogDescription='DialogDescription';`,
 './use-route':`import {harness} from 'test:harness';export const useRoute=()=>harness.route;`,
 './flashcards':`import {harness} from 'test:harness';export const isFlashcardEnrolled=(state,word)=>{harness.enrolledChecks.push(word);return harness.enrolled};`,
 './runtime-mode':`export const ONLINE=true;`,
 './study-path':`export const bookNames={NCE1:'第一册',NCE2:'第二册',NCE3:'第三册',NCE4:'第四册'};`,
 './lesson-context':`import {harness as h} from 'test:harness';export const loadPages=refresh=>{if(h.loadPages)return h.loadPages(refresh);throw Error('Source checks must not fetch textbook material')};`,
 './language':`import {harness as h} from 'test:harness';export const loadDictionary=()=>{if(h.loadDictionary)return h.loadDictionary();throw Error('Source checks must not fetch dictionary material')},loadLessonLanguage=()=>{throw Error('Source checks must not fetch lesson material')},findWord=(dictionary,word)=>h.findWord?.(dictionary,word);`,
 './speech':`import {harness} from 'test:harness';export const speak=word=>harness.speechCalls.push(word);`,
 './playback-speed':`export const PlaybackSpeed='PlaybackSpeed';`,
 './navigation':`export const navigate=()=>{};`,
 './map-connection':`export const mapUnitId=()=>undefined;`,
 './textbook-grammar':`export const grammarPrintedPage=(book,page)=>page;`,
};
const output=new URL('work/flashcards/source-components-test.mjs',root);
await mkdir(new URL('work/flashcards/',root),{recursive:true});
await build({
 stdin:{contents:"export {TextbookVocabularyBrowser} from './app/textbook-vocabulary-ui.tsx';export {WordLookupProvider,WordLookupButton,WordText} from './app/word-lookup.tsx';export {initial} from './app/model.ts';export {ieltsFlashcardExamples,ieltsFlashcardDescription} from './app/ielts-flashcard-examples.ts';export {findWord as actualFindWord} from './app/language';export {reviewedHeadwordForForm,resolveReviewedLookupEntry} from './app/reviewed-word-forms';export {withReviewedSF02Dictionary} from './app/source-review-sf02';export {buildVocabularyCatalog} from './app/textbook-vocabulary';export {enrollFlashcard as actualEnrollFlashcard} from './app/flashcards';export {originalVocabularyExamples,examplesForMeaning,reviewedTeachingDefinition,reviewedTeachingSources} from './app/vocabulary-examples';export {harness} from 'test:harness';",resolveDir:fileURLToPath(root),sourcefile:'source-test-entry.ts',loader:'ts'},
 bundle:true,platform:'node',format:'esm',target:'node22',jsx:'automatic',outfile:fileURLToPath(output),logLevel:'silent',
 plugins:[{name:'source-component-harness',setup(build){
  build.onResolve({filter:/.*/},args=>Object.hasOwn(mocks,args.path)?{path:args.path,namespace:'source-check'}:args.path.endsWith('.css')?{path:args.path,namespace:'empty-css'}:undefined);
  build.onLoad({filter:/.*/,namespace:'source-check'},args=>({contents:mocks[args.path],loader:'js'}));
  build.onLoad({filter:/.*/,namespace:'empty-css'},()=>({contents:'',loader:'js'}));
 }}],
});
const {TextbookVocabularyBrowser,WordLookupProvider,WordLookupButton,WordText,initial,ieltsFlashcardExamples,ieltsFlashcardDescription,actualFindWord,reviewedHeadwordForForm,resolveReviewedLookupEntry,withReviewedSF02Dictionary,buildVocabularyCatalog,actualEnrollFlashcard,originalVocabularyExamples,examplesForMeaning,reviewedTeachingDefinition,reviewedTeachingSources,harness:h}=await import(output.href);
const reset=(states,route)=>Object.assign(h,{states,cursor:0,refs:[],refCursor:0,writes:[],route,enrolledChecks:[],speechCalls:[],loadPages:undefined,loadDictionary:undefined,findWord:actualFindWord,open:()=>{}});
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
for(const [word,lesson,raw,selected,target] of [
 ['his',12,'pron. 他的',{en:'This bag is mine, and the one beside it is his.',zh:'这个包是我的，旁边那个是他的。'},'his-possessive-determiner'],
 ['old',10,'n. 以前\\na. 年老的, 旧的',{en:'This old coat has a torn pocket, but it is still warm.',zh:'这件旧大衣的一个口袋破了，但穿着仍然暖和。'},'old-age'],
 ['make',6,'vt. 制造, 安排',{en:'Making a bookcase',zh:'制作一个书架',source:{book:'NCE1',lesson:37}},'make-product-brand'],
 ['case',14,'n. 情形, 情况, 箱, 容器, 事实, 病例, 案例',{en:'The court heard the case after both sides submitted their evidence.',zh:'双方提交证据后，法院审理了这起案件。'},'case-luggage'],
 ['carpet',14,'n. 地毯, 地毯状物\nvt. 铺以地毯, 铺盖',{en:'They carpeted the stairs to make them quieter to walk on.',zh:'他们给楼梯铺了地毯，使上下楼时的脚步声小一些。'},'carpet-floor'],
 ['dog',14,'n. 狗, 坏蛋\nvt. 跟踪, 尾随',{en:'Reporters dogged the actor from the hotel to the airport.',zh:'记者们从酒店一直尾随这名演员到机场。'},'dog-animal'],
]){
 const selection={word,example:selected.en,exampleTranslation:selected.zh,exampleSource:selected.source,sources:[{kind:'nce',book:'NCE1',lesson}]};
 reset([selection,{word,meaning:raw},false,'',false],{});let saved;
 const lookup=WordLookupProvider({children:null,onAdd:word=>{saved=word}});
 const usage=find(lookup,node=>typeof node.type==='function'&&node.type.name==='VocabularyExamples');
 assert(usage.props.examples.some(example=>example.en===selected.en),'The selected original or textbook context stays available for reading');
 const targetExample=usage.props.examples.find(example=>example.id===target);assert(targetExample);
 find(lookup,node=>node.type==='button'&&node.props.className==='btn').props.onClick();
 assert.equal(saved.example,targetExample.en,'Source-target enrollment cannot save a selected sentence from another sense');
 assert.equal(saved.exampleTranslation,targetExample.zh);
 assert.equal(h.states[0].example,selected.en,'Explicit target enrollment does not rewrite the selected or existing context');
}

// The genuine make source list can fall back from Lesson 6 to the Lesson 37
// manufacturing title. Exercise the loaded-context state in the actual row:
// it stays labelled as Lesson 37, while add and lookup select the brand target.
{
 const other={book:'NCE1',lesson:37,title:'',pages:[]},catalog={lessons:[{...lesson6,key:'NCE1-6',words:[{word:'make',forms:[]}]},{...other,key:'NCE1-37',words:[{word:'make',forms:['making']}]}],terms:[{key:'make',word:'make',sources:[lesson6,other]}],entries:2};
 reset([catalog,'',0,{make:{word:'make',meaning:'vt. 制造'}},false,false,0,null],{view:'words',book:'NCE1',lesson:6,tab:'book'});let saved;
 const tree=TextbookVocabularyBrowser({state,onAdd:word=>{saved=word}}),row=find(tree,node=>typeof node.type==='function'&&node.type.name==='VocabularyRow');
 const context={en:'Making a bookcase',zh:'制作一个书架',source:{book:'NCE1',lesson:37}};
 h.states[h.cursor]={key:'make:'+JSON.stringify(row.props.hints),busy:false,context};
 const rendered=row.type(row.props),usage=find(rendered,node=>typeof node.type==='function'&&node.type.name==='VocabularyExamples');
 assert(usage.props.examples.some(example=>example.en===context.en&&example.origin==='textbook'&&example.source.lesson===37),'Cross-course context keeps its actual provenance');
 const target=usage.props.examples.find(example=>example.id==='make-product-brand');assert(target);
 find(rendered,node=>node.type==='button'&&node.props.className?.includes('vocabulary-enroll')).props.onClick();
 assert.equal(saved.meaning,'n. （产品的）牌子');assert.equal(saved.example,target.en);assert.equal(saved.exampleTranslation,target.zh);
 const wordLookup=find(rendered,node=>node.type===WordLookupButton);assert.equal(wordLookup.props.example,target.en);assert.equal(wordLookup.props.exampleSource,undefined,'An original target cannot acquire the other textbook sentence\'s provenance');
 assert.deepEqual(saved.sources,[{kind:'nce',book:'NCE1',lesson:6}]);assert.deepEqual(state,before);
}
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

for(const [word,rawIpa,expected] of [['Fiat','ˈfaɪæt','ˈfiːæt'],['Volvo','ˈvɔlvəj','ˈvɒlvəʊ']]){
 const key=word.toLowerCase(),entry={word:key,meaning:word==='Fiat'?'n. 命令':'n. 沃尔沃',ipa:rawIpa};
 const catalog={lessons:[{...lesson6,key:'NCE1-6',words:[{word,forms:[]}]}],terms:[{key,word,sources:[lesson6]}],entries:1};
 reset([catalog,'',0,{[key]:entry},false,false,0,null],{view:'words',book:'NCE1',lesson:6,tab:'book'});let saved;
 const tree=TextbookVocabularyBrowser({state,onAdd:word=>{saved=word}}),row=find(tree,node=>typeof node.type==='function'&&node.type.name==='VocabularyRow'),rendered=row.type(row.props);
 const ipa=find(rendered,node=>node.props?.className==='vocabulary-ipa');assert.equal([ipa.props.children].flat().join(''),'/'+expected+'/');assert.equal(ipa.props.title,'原书词表音标');
 find(rendered,node=>node.type==='button'&&node.props.className?.includes('vocabulary-enroll')).props.onClick();assert.equal(saved.ipa,expected);
 reset([{word,example:'',sources:saved.sources},entry,false,'',false],{});let lookupWord;
 const lookup=WordLookupProvider({children:null,onAdd:word=>{lookupWord=word}});
 assert.equal(find(lookup,node=>node.props?.className==='lookup-ipa').props.children,'/'+expected+'/');
 find(lookup,node=>node.type==='button'&&node.props.className==='text-btn').props.onClick();assert.deepEqual(h.speechCalls,[word],'Pronunciation receives the displayed proper name; this checks input, not real audio');
 find(lookup,node=>node.type==='button'&&node.props.className==='btn').props.onClick();assert.equal(lookupWord.ipa,expected);
}

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

// Use the real packaged dictionary and validated source index. In particular,
// carpets has no dictionary entry; cases and dogs have coarse plural entries.
const realDictionary=withReviewedSF02Dictionary(JSON.parse(await readFile(new URL('dist-online/language/dictionary.json',root),'utf8')).words);
const realPages=JSON.parse(await readFile(new URL('dist-online/lesson-pages/index.json',root),'utf8'));
const realCatalog=buildVocabularyCatalog(realPages),source14={book:'NCE1',lesson:14};
assert.equal(actualFindWord(realDictionary,'carpets'),undefined);
assert.equal(actualFindWord(realDictionary,'cases').word,'cases');
assert.equal(actualFindWord(realDictionary,'dogs').word,'dogs');
const renderLookup=onAdd=>{h.cursor=0;h.refCursor=0;return WordLookupProvider({children:null,onAdd})};
async function openRealLookup(selected,onAdd,route={}){
 reset([null,undefined,false,'',false],route);
 h.loadDictionary=async()=>realDictionary;h.loadPages=async()=>realPages;
 await renderLookup(onAdd).props.value(selected);
 return renderLookup(onAdd);
}
// SF02 needs no template/UI rewrite: existing full-phrase rows and lookup
// callbacks accept literal meanings and intentionally empty IPA.
for(const [word,book,lesson] of [['bargain hunter','NCE3',34],['a little','NCE1',109]]){
 const entry=realDictionary[word],sources=[{kind:'nce',book,lesson}];assert(entry);assert.equal(entry.ipa,'');
 for(const tab of ['book','index']){
  reset([realCatalog,'',0,realDictionary,false,false,0,null],{view:'words',book,lesson:tab==='book'?lesson:undefined,query:tab==='index'?word:undefined,tab});h.enrolled=false;
  let added;const tree=TextbookVocabularyBrowser({state,onAdd:record=>{added=record}});
  const row=find(tree,node=>typeof node.type==='function'&&node.type.name==='VocabularyRow'&&node.props.word===word);
  const rendered=row.type(row.props);assert(!elements(rendered).some(node=>node.props?.className==='vocabulary-ipa'));
  const button=find(rendered,node=>node.type==='button'&&node.props.className?.includes('vocabulary-enroll'));
  assert.equal(button.props.disabled,false);button.props.onClick();assert.equal(added.word,word);assert.equal(added.meaning,entry.meaning);assert.deepEqual(added.sources,sources);
 }
 let added;const lookup=await openRealLookup({word,example:'',sources},record=>{added=record});
 find(lookup,node=>node.type==='button'&&node.props.className==='btn').props.onClick();assert.equal(added.word,word);assert.equal(added.meaning,entry.meaning);assert.deepEqual(added.sources,sources);
 assert.equal(actualFindWord(realDictionary,word.toUpperCase()),entry);
}
// Every registered source target, including explicitly recorded grammar and
// editorial normalizations, must work through both real component add callbacks. Source
// normalization does not imply the printed source's other noun senses are done.
const reviewIndex=JSON.parse(await readFile(new URL('docs/vocabulary-examples-review-index.json',root),'utf8'));
const registeredLedgers=await Promise.all(reviewIndex.registeredLedgers.map(async relative=>JSON.parse(await readFile(new URL(relative,root),'utf8'))));
const targets=new Map();
for(const ledger of registeredLedgers)for(const record of ledger.entries){
 if(!['textbook-target','textbook-target-grammar-normalized','textbook-target-editorial-normalized'].includes(record.scope))continue;
 const example=originalVocabularyExamples.find(example=>example.id===record.id);assert(example);
 for(const source of example.teachingSources||[]){
  const key=JSON.stringify([example.word.toLowerCase(),source.book,source.lesson]);
  targets.set(key,{word:example.word,source});
 }
}
for(const {word,source} of targets.values()){
 const lesson=realCatalog.lessons.find(lesson=>lesson.book===source.book&&lesson.lesson===source.lesson);
 assert(lesson.words.some(item=>item.word.toLowerCase()===word.toLowerCase()),word+' canonical source headword');
 const targetMeaning=reviewedTeachingDefinition(word,[source]);assert(targetMeaning);
 const targetExamples=examplesForMeaning(word,targetMeaning).filter(example=>example.teachingSources?.some(item=>item.book===source.book&&item.lesson===source.lesson));assert(targetExamples.length);
 const expectedSources=reviewedTeachingSources(word,[source]).map(source=>({kind:'nce',...source}));
 reset([realCatalog,'',0,realDictionary,false,false,0,null],{view:'words',book:source.book,lesson:source.lesson,tab:'book'});let fromRow;
 const tree=TextbookVocabularyBrowser({state,onAdd:word=>{fromRow=word}}),row=find(tree,node=>typeof node.type==='function'&&node.type.name==='VocabularyRow'&&node.props.word.toLowerCase()===word.toLowerCase());
 const rendered=row.type(row.props),button=find(rendered,node=>node.type==='button'&&node.props.className?.includes('vocabulary-enroll'));
 assert.equal(button.props.disabled,false,word+' canonical dictionary entry enables enrollment');button.props.onClick();
 assert.equal(fromRow.word,row.props.word);assert.equal(fromRow.meaning,targetMeaning);assert.deepEqual(fromRow.sources,expectedSources);
 assert(targetExamples.some(example=>example.en===fromRow.example&&example.zh===fromRow.exampleTranslation),word+' row enrolls the reviewed target example');
 let fromLookup;const lookup=await openRealLookup({word,example:'',sources:expectedSources},word=>{fromLookup=word});
 find(lookup,node=>node.type==='button'&&node.props.className==='btn').props.onClick();
 assert.equal(fromLookup.word,word);assert.equal(fromLookup.meaning,targetMeaning);assert.deepEqual(fromLookup.sources,expectedSources);
 assert(targetExamples.some(example=>example.en===fromLookup.example&&example.zh===fromLookup.exampleTranslation),word+' lookup enrolls the reviewed target example');
 assert.equal(reviewedTeachingDefinition(word,[{book:source.book,lesson:source.lesson===1?2:1}]),'','No unrelated lesson target certification');
}
console.log('PASS registered canonical target callbacks: '+targets.size+' source-headword pairs through both vocabulary row and asynchronous lookup.');
if(process.argv.includes('--registered-targets-only'))process.exit(0);
let enrolledCarpet;
for(const [surface,headword,meaning,target] of [
 ['carpets','carpet','n. 地毯','carpet-floor'],
 ['cases','case','n. 箱子','case-luggage'],
 ['dogs','dog','n. 狗','dog-animal'],
 ["carpet's",'carpet','n. 地毯','carpet-floor'],
 ["case's",'case','n. 箱子','case-luggage'],
 ["dog's",'dog','n. 狗','dog-animal'],
]){
 const selected={word:surface,example:'The selected context stays visible.',exampleTranslation:'所选语境保持可见。',sources:[{kind:'nce',...source14}]};
 let saved;
 const lookup=await openRealLookup(selected,word=>{saved=word});
 assert.equal(h.states[1].reviewedHeadword,headword);
 assert(elements(lookup).some(node=>node.props?.className==='muted small'&&node.props.children.join?.('')==='词形对应：'+headword));
 const usage=find(lookup,node=>typeof node.type==='function'&&node.type.name==='VocabularyExamples');
 assert(usage.props.examples.some(example=>example.en===selected.example),'Selected context is retained');
 const targetExample=usage.props.examples.find(example=>example.id===target);assert(targetExample);
 const raw=actualFindWord(realDictionary,surface)||realDictionary[headword];
 assert(elements(lookup).some(node=>node.props?.className==='lookup-meaning'&&node.props.children===raw.meaning),'Original dictionary text is retained');
 find(lookup,node=>node.type==='button'&&node.props.className==='text-btn').props.onClick();
 assert.deepEqual(h.speechCalls,[headword],'Pronunciation receives the canonical headword; real audio is not tested');
 find(lookup,node=>node.type==='button'&&node.props.className==='btn').props.onClick();
 assert.equal(saved.word,headword);assert.equal(saved.meaning,meaning);assert.equal(saved.ipa,realDictionary[headword].ipa);
 assert.equal(saved.example,targetExample.en);assert.equal(saved.exampleTranslation,targetExample.zh);
 assert.deepEqual(saved.sources,[{kind:'nce',...source14}]);assert.equal(h.states[0].word,surface);
 if(surface==='carpets')enrolledCarpet=saved;
}
for(const [surface,sources] of [['carpets',[{book:'NCE1',lesson:13}]],['cases',[]],['dogged',[source14]],['japanning',[{book:'NCE1',lesson:54}]],['polishing',[{book:'NCE1',lesson:54}]]]){
 assert.equal(reviewedHeadwordForForm(surface,sources,realCatalog),undefined,'Unreviewed forms or unrelated sources cannot approve a target');
 const resolved=await resolveReviewedLookupEntry(surface,sources,realDictionary,async()=>realCatalog);
 assert.deepEqual(resolved,actualFindWord(realDictionary,surface),'Unapproved lookup preserves the actual dictionary fallback');
}
{
 let saved;
 const lookup=await openRealLookup({word:'cases',example:'',sources:[{kind:'nce',book:'NCE1',lesson:13}]},word=>{saved=word});
 find(lookup,node=>node.type==='button'&&node.props.className==='btn').props.onClick();
 assert.equal(saved.word,'cases');assert.equal(saved.meaning,realDictionary.cases.meaning);
 assert(!elements(lookup).some(node=>node.props?.children==='加入本课义项'));
}
for(const loadCatalog of [async()=>{throw Error('Source index temporarily unavailable')},async()=>buildVocabularyCatalog({...realPages,version:99})]){
 assert.deepEqual(await resolveReviewedLookupEntry('cases',[source14],realDictionary,loadCatalog),realDictionary.cases,'Failure keeps the dictionary entry without target certification');
 assert.equal(await resolveReviewedLookupEntry('carpets',[source14],realDictionary,loadCatalog),undefined);
 assert.equal((await resolveReviewedLookupEntry('cases',[source14],realDictionary,async()=>realCatalog)).reviewedHeadword,'case','A later open retries successfully');
}
{
 let reads=0;
 const ordinary=await resolveReviewedLookupEntry('network',[{book:'NCE1',lesson:14}],realDictionary,()=>{reads++;throw Error('A normal dictionary lookup must not load the source index')});
 assert.deepEqual(ordinary,actualFindWord(realDictionary,'network'));assert.equal(reads,0);
 const selected={word:'cases',example:'',sources:[{kind:'nce',...source14}]};
 reset([null,undefined,false,'',false],{});h.loadDictionary=async()=>realDictionary;
 const cachedInvalid=structuredClone(realPages);cachedInvalid.lessons['NCE1-14'].vocabulary.words[0].forms=null;
 const refreshCalls=[];let cached=cachedInvalid;
 h.loadPages=async refresh=>{refreshCalls.push(refresh===true);if(refresh)cached=realPages;return cached};
 await renderLookup(()=>{}).props.value(selected);
 assert.deepEqual(refreshCalls,[false,true],'A structurally invalid cached index requests an actual fresh load');
 assert.equal(h.states[1].reviewedHeadword,'case');
 h.loadPages=async()=>cachedInvalid;
 await renderLookup(()=>{}).props.value(selected);
 assert.equal(h.states[1].reviewedHeadword,undefined,'Repeated invalid data safely retains the dictionary fallback');
 h.loadPages=async refresh=>refresh?realPages:cachedInvalid;
 await renderLookup(()=>{}).props.value(selected);
 assert.equal(h.states[1].reviewedHeadword,'case','Reopening can refresh and recover from a previously invalid cached index');
}
{
 const corrupt=structuredClone(realCatalog);
 corrupt.lessons.find(lesson=>lesson.key==='NCE1-14').words.find(word=>word.word==='case').forms.push('carpets');
 assert.equal(reviewedHeadwordForForm('carpets',[source14],corrupt),'carpet','An unrelated automatic hint cannot expand the reviewed form list');
 const dictionary={cases:{...realDictionary.cases,reviewedHeadword:'dog',headwordIpa:'untrusted'}};
 assert.deepEqual(await resolveReviewedLookupEntry('cases',[],dictionary,async()=>realCatalog),realDictionary.cases,'Dictionary metadata cannot certify a source or override canonical IPA');
}
{
 reset([null,undefined,false,'',false],{});h.loadDictionary=async()=>realDictionary;
 let release;h.loadPages=()=>new Promise(resolve=>{release=resolve});
 const open=renderLookup(()=>{}).props.value;
 const firstRequest=open({word:'carpets',example:'',sources:[{kind:'nce',...source14}]});
 await Promise.resolve();
 const secondRequest=open({word:'Fiat',example:'',sources:[{kind:'nce',book:'NCE1',lesson:6}]});
 await secondRequest;assert(release);release(realPages);await firstRequest;
 assert.equal(h.states[0].word,'Fiat');assert.equal(h.states[1].word,'fiat','An old catalog response cannot overwrite the later lookup');assert.equal(h.states[2],false);
}
{
 reset([null,undefined,false,'',false],{});h.loadDictionary=async()=>realDictionary;
 let release;h.loadPages=()=>new Promise(resolve=>{release=resolve});
 const pending=renderLookup(()=>{}).props.value({word:'carpets',example:'',sources:[{kind:'nce',...source14}]});
 await Promise.resolve();assert(release);
 find(renderLookup(()=>{}),node=>node.type==='Dialog').props.onOpenChange(false);
 const writesAfterClose=h.writes.length;release(realPages);await pending;
 assert.equal(h.states[0],null);assert.equal(h.writes.length,writesAfterClose,'Closing cancels stale entry and loading writes');
}
{
 const at=Date.UTC(2026,9,1,10),firstEnrollment=actualEnrollFlashcard(structuredClone(initial),enrolledCarpet,[],at);
 const snapshot=structuredClone(firstEnrollment),again=actualEnrollFlashcard(firstEnrollment,{...enrolledCarpet,word:'carpet'},[],at+1000);
 assert.equal(Object.keys(again.flashcards.notes).length,1);assert.equal(Object.keys(again.flashcards.cards).length,1);
 assert.deepEqual(again.flashcards.cards,snapshot.flashcards.cards);assert.deepEqual(again.flashcards.reviews,snapshot.flashcards.reviews);
 assert.deepEqual(JSON.parse(JSON.stringify(again)),again,'Local JSON refresh preserves the canonical word and schedule');
 const legacy={...structuredClone(initial),personalWords:[{word:'carpets',meaning:'我的旧释义',example:'My old example.'}],cards:{carpets:{box:3,due:at+5000}}};
 const prior=actualEnrollFlashcard(legacy,{word:'carpets',meaning:'我的旧释义',example:'My old example.'},[],at),next=actualEnrollFlashcard(prior,enrolledCarpet,[],at);
 assert.deepEqual(next.personalWords,prior.personalWords);assert.deepEqual(next.cards,prior.cards);
 for(const [id,card] of Object.entries(prior.flashcards.cards))assert.deepEqual(next.flashcards.cards[id],card,'Existing alias schedules are never silently rewritten');
 for(const [id,note] of Object.entries(prior.flashcards.notes))assert.deepEqual(next.flashcards.notes[id],note,'Existing alias content is retained');
}
console.log('PASS reviewed word forms: six source-scoped noun plurals/possessives, real dictionary fallback, index failure/retry, stale async lookup, canonical enrollment and preservation of old aliases.');
// The source prints these two verb forms under one withdraw headword. A
// previously stored withdrawn entry retains its own content and legacy due.
{
 const source={book:'NCE3',lesson:19},meaning=reviewedTeachingDefinition('withdraw',[source]);
 assert.equal(meaning,'v.（从银行）取钱');
 const target=examplesForMeaning('withdraw',meaning).find(example=>example.id==='gap6d-withdraw-bank-money');assert(target);
 const lesson=realCatalog.lessons.find(lesson=>lesson.key==='NCE3-19');
 assert.equal(lesson.words.filter(item=>item.word==='withdraw').length,1);
 assert(!lesson.words.some(item=>item.word==='withdrawn'));
 let enrolled;
 for(const surface of ['withdrew','withdrawn']){
  const selected={word:surface,example:'The selected context stays visible.',sources:[{kind:'nce',...source}]};
  let saved;const lookup=await openRealLookup(selected,word=>{saved=word});
  assert.equal(h.states[1].reviewedHeadword,'withdraw');
  const raw=actualFindWord(realDictionary,surface)||realDictionary.withdraw;
  assert(elements(lookup).some(node=>node.props?.className==='lookup-meaning'&&node.props.children===raw.meaning),'Inflection dictionary evidence remains visible');
  find(lookup,node=>node.type==='button'&&node.props.className==='btn').props.onClick();
  assert.equal(saved.word,'withdraw');assert.equal(saved.meaning,meaning);
  assert.equal(saved.example,target.en);assert.equal(saved.exampleTranslation,target.zh);
  assert.deepEqual(saved.sources,[{kind:'nce',...source}]);assert.equal(h.states[0].word,surface);
  const wrongSource={book:'NCE3',lesson:18};
  assert.equal(reviewedHeadwordForForm(surface,[wrongSource],realCatalog),undefined);
  assert.deepEqual(await resolveReviewedLookupEntry(surface,[wrongSource],realDictionary,async()=>realCatalog),actualFindWord(realDictionary,surface),'An unrelated lesson preserves its dictionary fallback');
  assert.deepEqual(await resolveReviewedLookupEntry(surface,[source],realDictionary,async()=>{throw Error('Unavailable source')}),actualFindWord(realDictionary,surface),'Failure cannot approve a source target');
  enrolled=saved;
 }
 const at=Date.UTC(2026,9,1,12),legacy={...structuredClone(initial),personalWords:[{word:'withdrawn',meaning:'我的旧释义',example:'My saved sentence.'}],cards:{withdrawn:{box:4,due:at+3600000}}};
 const prior=actualEnrollFlashcard(legacy,legacy.personalWords[0],[],at),next=actualEnrollFlashcard(prior,enrolled,[],at+1000);
 assert.deepEqual(next.personalWords,prior.personalWords);assert.deepEqual(next.cards,prior.cards);
 for(const [id,note] of Object.entries(prior.flashcards.notes))assert.deepEqual(next.flashcards.notes[id],note);
 for(const [id,card] of Object.entries(prior.flashcards.cards))assert.deepEqual(next.flashcards.cards[id],card);
 const again=actualEnrollFlashcard(next,enrolled,[],at+2000);
 assert.equal(Object.keys(again.flashcards.notes).length,2,'Explicit canonical target is separate from the preserved old meaning; repeated add is deduplicated');
 assert.deepEqual(again.flashcards.cards,next.flashcards.cards);assert.deepEqual(again.flashcards.reviews,next.flashcards.reviews);
 assert.deepEqual(JSON.parse(JSON.stringify(again)),again,'Offline JSON refresh retains the old and canonical entries');
}
console.log('PASS withdraw source correction: printed verb forms, source/failure isolation, canonical bank target, repeat enrollment and preserved old withdrawn content/schedules.');
console.log('PASS source component callbacks: cross-book sources under filters, enrolled-source updates, translations, valid route fallback, rejected-add feedback and original examples.');
