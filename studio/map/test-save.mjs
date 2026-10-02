import assert from 'node:assert/strict';
import {readFile, readdir, mkdtemp, rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

// Run the real App and form sources with a persistent hook/effect harness, as in
// the repo's source-component tests. Media, DOM and course content are synthetic;
// storage is an injected in-memory fixture. No browser data or network is used.
const root=new URL('../',import.meta.url),baseline=process.argv.includes('--baseline');
const pnpmRoot=new URL('node_modules/.pnpm/',root);
const builder=(await readdir(pnpmRoot)).find(name=>/^esbuild@\d+\.\d+\.\d+$/.test(name));
assert(builder,'Install the locked project dependencies before running source checks');
const {build}=await import(new URL(`${builder}/node_modules/esbuild/lib/main.js`,pnpmRoot));
const harnessSource=`
export const harness={frame:null,root:null};
function slot(initial){const f=harness.frame,index=f.cursor++;if(!(index in f.values))f.values[index]=typeof initial==='function'?initial():initial;return [f,index]}
export function useState(initial){const [f,i]=slot(initial);return [f.values[i],value=>{const next=typeof value==='function'?value(f.values[i]):value;if(!Object.is(next,f.values[i])){f.values[i]=next;f.dirty=true}}]}
export function useRef(initial){const [f,i]=slot(()=>({current:initial}));return f.values[i]}
export function useMemo(fn,deps){const [f,i]=slot(()=>({deps:undefined})),old=f.values[i];if(!old.deps||!deps||deps.some((d,j)=>!Object.is(d,old.deps[j]))||deps.length!==old.deps.length)f.values[i]={deps,value:fn()};return f.values[i].value}
export const useCallback=(fn,deps)=>useMemo(()=>fn,deps);
export const useLayoutEffect=(fn,deps)=>useEffect(fn,deps);
export const createContext=value=>({value,Provider:'ContextProvider'});
export const useContext=context=>context.value;
export function useEffect(fn,deps){const [f,i]=slot(()=>({deps:undefined})),old=f.values[i];if(!old.deps||!deps||deps.some((d,j)=>!Object.is(d,old.deps[j]))||deps.length!==old.deps.length){f.effects.push(()=>{old.cleanup?.();old.cleanup=fn();old.deps=deps})}}
export const jsx=(type,props)=>({type,props:props||{}}),jsxs=jsx,Fragment='Fragment';
export default {createElement:(type,props,...children)=>jsx(type,{...props,children}),Fragment};
`;
const fixtureSource=`
const station=(id,kind,requires=[],extra={})=>({id,kind,requires,title:id,subtitle:'Synthetic fixture',stage:'skills',minutes:5,...extra});
export const unitNodes=[station('nce1-1','unit',[],{parent:'chapter-1'}),station('nce1-3','unit',['nce1-1'],{parent:'chapter-1'})];
export const nodes=[station('first','starter',[],{stage:'starter'}),station('small-exchange','starter',['first'],{stage:'starter'}),station('chapter-1','course',['first'],{chapter:0,members:unitNodes.map(n=>n.id),project:'Synthetic reviewed work'}),station('chapter-2','course',['chapter-1'],{chapter:1,members:[]}),station('reading-short','task',['chapter-1'],{lane:'reading'}),station('reading-after','task',['reading-short'],{lane:'reading'}),station('mock-one','mock',['reading-after']),station('mock-two','mock',['mock-one']),station('finish','finish',['mock-two'])];
export const nodeById=id=>[...nodes,...unitNodes].find(n=>n.id===id);
export const units=unitNodes.map(n=>({id:n.id,book:'NCE1',lesson:n.id==='nce1-1'?1:3,lastLesson:n.id==='nce1-1'?2:4,title:n.title,rows:[],sourceSha256:'synthetic'}));
export const unitById=id=>units.find(u=>u.id===id);
export const chapters=Array.from({length:14},()=>['Synthetic','','',6]);
export const questionsFor=(node,round=0,bank)=>{
 if(!['starter','unit','lesson','checkpoint'].includes(node.kind))return [];
 if(['first','small-exchange'].includes(node.id)){
  const legacy={prompt:'Synthetic legacy '+node.id,answer:'legacy answer '+node.id,explanation:'Synthetic legacy reference '+node.id};
  if(bank!=='starter-v2'||round%2===0)return [legacy];
  return [{prompt:'Synthetic fresh lesson 3 '+node.id,answer:'fresh answer '+node.id,explanation:'Synthetic fresh lesson 3 reference '+node.id,type:'choice',options:['fresh answer '+node.id,'unmatched'],clip:{book:'NCE1',lesson:3,start:node.id==='first'?1:11,end:node.id==='first'?3:13}}];
 }
 return [{prompt:'Synthetic bank '+round%2,answer:'answer '+round%2,explanation:'Synthetic reference'}];
};
export const unitQuestions=(unit,round=0)=>questionsFor(nodeById(unit.id),round);
export const starterQuestions=(id,round=0,bank)=>questionsFor(nodeById(id),round,bank);
export const stages=[{id:'skills',title:'Synthetic skills'},{id:'starter',title:'Synthetic start'}],originalSite='/';
export const resources={scoring:{url:'/synthetic-scoring',title:'Synthetic scoring'}},courseUrl=()=>'/synthetic',sourceLabel=u=>u.id;
const oldLines=id=>Array.from({length:3},(_,i)=>({en:'Synthetic legacy '+id+' line '+(i+1),zh:'原示范 '+(i+1),clip:{book:'NCE1',lesson:1,start:i+1,end:i+2}}));
const newLines=id=>Array.from({length:3},(_,i)=>({en:'Synthetic new lesson 3 '+id+' line '+(i+1),zh:'新示范 '+(i+1),clip:{book:'NCE1',lesson:3,start:i+1,end:i+2}}));
export const starters=['first','small-exchange'].map(id=>({id,lines:oldLines(id),question:'Synthetic guided '+id,options:['a'],answer:'a',tip:''}));
export const starterStudyLines=(id,bank)=>bank==='starter-v2'?[...oldLines(id),...newLines(id)]:oldLines(id);
export const guidesFor=()=>[],firstChapterFocus={};
`;
const icons='ArrowRight ArrowUpRight Check CheckCircle2 ChevronLeft Lightbulb Lock RotateCcw X Flag BookOpen ExternalLink Clock3 Download Upload ChevronRight Milestone Unlock Settings2 Volume2 Square Mic'.split(' ');
const mocks={
 'test:harness':harnessSource,
 'test:fixture':fixtureSource,
 'react':`export * from 'test:harness';export {default} from 'test:harness';`,
 'react/jsx-runtime':`export {jsx,jsxs,Fragment} from 'test:harness';`,
 'react-dom/client':`import {harness} from 'test:harness';export const createRoot=()=>({render:element=>harness.root=element});`,
 'lucide-react':icons.map(name=>`export const ${name}='${name}';`).join(''),
 './content':`export * from 'test:fixture';`,
 './curriculum':`export * from 'test:fixture';`,
 './media':`export const AudioSpace='AudioSpace',StopAudio='StopAudio',Recorder='Recorder',ClipButton='ClipButton',PlayerContext={value:{}};`,
 './graph':`export const LearningGraph='LearningGraph',skillIcon=()=> 'SkillIcon';`,
 './speaking':`export const SpeakingPractice='SpeakingPractice';`,
 './expression':`export const GuidedExpression='GuidedExpression';`,
 './lesson-reader':`export const LessonReader='LessonReader';`,
 './lesson-plan':`export const lessonPlan=u=>({goal:u.id}),questionSkills=()=>[];`,
 '../app/course-loop-ui':`export const CourseLoopWorkspace='CourseLoopWorkspace';`,
 '../app/course-loop-summary-ui':`export const CourseLoopHeadingSummary='CourseLoopHeadingSummary';`,
 './current-route':`export const CurrentRoute='CurrentRoute';`,
 './catalogue':`export const CourseCatalogue='CourseCatalogue';`,
 '../app/study-mode':`export const StudioHeader='StudioHeader';`,
 '../app/use-classic-progress':`export const useClassicProgress=()=>({state:{drafts:{}},ready:false,error:''});`,
 '../app/today-practice-ui':`export const TodayPracticeQueue='TodayPracticeQueue';`,
 '../app/language':`export const loadLessonLanguage=()=>Promise.reject(Error('No fixture media')),loadDictionary=()=>Promise.resolve({}),findWord=()=>undefined;`,
 '../app/network':`export const readJsonResource=()=>Promise.reject(Error('No fixture network'));`,
 '../app/lesson-structure':`export const splitLesson=()=>({body:[]});`,
 '../app/textbook-grammar':`export const grammarEntryFor=()=>undefined,grammarSourceHash=()=>'';`,
};
const dir=await mkdtemp(join(tmpdir(),'english-map-save-')),output=join(dir,'components.mjs');
try{
 await build({
  stdin:{contents:"import './map/main.tsx';export {LearningRoom} from './map/learning.tsx';export {CourseRoom,StarterTeaching} from './map/course.tsx';export * as model from './map/model.ts';export * as content from 'test:fixture';export {harness} from 'test:harness';",resolveDir:fileURLToPath(root),sourcefile:'save-test-entry.ts',loader:'ts'},
  bundle:true,platform:'node',format:'esm',target:'node22',jsx:'automatic',outfile:output,logLevel:'silent',
  plugins:[{name:'save-source-components',setup(build){
   build.onResolve({filter:/.*/},args=>Object.hasOwn(mocks,args.path)?{path:args.path,namespace:'save-fixture'}:args.path.endsWith('.css')?{path:args.path,namespace:'empty-css'}:undefined);
   build.onLoad({filter:/.*/,namespace:'save-fixture'},args=>({contents:mocks[args.path],loader:'js'}));
   build.onLoad({filter:/.*/,namespace:'empty-css'},()=>({contents:'',loader:'js'}));
   if(baseline)build.onLoad({filter:/\/map\/(main|learning|course)\.tsx$/},args=>({contents:execFileSync('git',['show',`97c85c5:studio/map/${args.path.split('/').at(-1)}`],{cwd:fileURLToPath(root),encoding:'utf8'}),loader:'tsx'}));
  }}],
 });
 globalThis.document={getElementById:()=>({focus(){}}),querySelector:()=>null};
 globalThis.window={scrollTo(){}};
 const {LearningRoom,CourseRoom,StarterTeaching,model:m,content:c,harness:h}=await import(pathToFileURL(output));
 const App=h.root.type;
 let checks=0;
 const check=(value,label)=>{assert.ok(value,label);checks++};
 function renderFrame(Component,props){
  const frame={values:[],cursor:0,effects:[],dirty:false,tree:null,Component,props};
  frame.render=(next=frame.props)=>{frame.props=next;for(let i=0;i<20;i++){frame.cursor=0;frame.effects=[];frame.dirty=false;h.frame=frame;frame.tree=Component(frame.props);h.frame=null;for(const effect of frame.effects)effect();if(!frame.dirty)return frame.tree}throw Error('Fixture render did not settle')};
  frame.render();return frame;
 }
 function elements(node){if(!node||typeof node!=='object')return [];if(Array.isArray(node))return node.flatMap(elements);return [node,...elements(node.props?.children)]}
 const find=(tree,predicate)=>{const item=elements(tree).find(predicate);assert(item,'Expected component element missing');return item};
 const textOf=node=>['string','number'].includes(typeof node)?String(node):Array.isArray(node)?node.map(textOf).join(''):node&&typeof node==='object'?textOf(node.props?.children):'';
 const input=(frame,label)=>find(frame.tree,n=>n.type==='label'&&textOf(n).startsWith(label));
 const field=(frame,label)=>find(input(frame,label),n=>['input','textarea','select'].includes(n.type));
 const submit=async frame=>{await find(frame.tree,n=>n.type==='form').props.onSubmit({preventDefault(){}});frame.render()};
 const evidenceSuccess=frame=>elements(frame.tree).some(n=>n.props?.className==='saved-message');
 const projectSuccess=frame=>textOf(frame.tree).includes('作品记录已保存。');
 const now=Date.now(),day=m.reviewDelay;
 const proof=(node,round,at,bank)=>{const qs=c.questionsFor(node,round,bank);return {round,at,answers:qs.map(q=>q.answer),assisted:false,...(bank?{bank}:{}),...(qs.some(q=>q.clip)?{heard:qs.flatMap((q,i)=>q.clip?[i]:[])}:{})}};
 const evidence={date:m.today(now),material:'Synthetic unseen paper A',work:'My own answer with a retained source and clear details.',reviewer:'Synthetic external teacher',feedback:'Specific errors were reviewed and corrected with evidence.',criteria:[true,true,true,true],unseen:true,timed:true,correct:'30',total:'40',dimensions:['','','',''],revision:'New paper B: the same error was checked and corrected.'};
 const project={text:'This is my own original story. I can describe my day clearly. '.repeat(4),recording:'synthetic-take.wav',reviewer:'Synthetic external teacher',feedback:'The reviewer identified tense errors and checked the revised response.',criteria:[true,true,true,true],at:now};
 function progress(kind='evidence'){
  const state=m.emptyProgress();state.access={all:false,nodes:[kind==='project'?'chapter-1':'reading-short']};
  if(kind==='project'){
   for(const node of c.unitNodes)state.records[node.id]={...m.emptyRecord(),attempts:[proof(node,0,now-2*day),proof(node,1,now)]};
   state.records['chapter-1']={...m.emptyRecord(),draft:structuredClone(project)};
  }else state.records['reading-short']={...m.emptyRecord(),draft:structuredClone(evidence)};
  return state;
 }
 function storageFixture(value){return {
  value,getError:false,setError:false,reads:0,writes:0,
  getItem(key){this.reads++;if(this.getError)throw Error('injected read failure');return key===m.storageKey?this.value:null},
  setItem(key,value){this.writes++;if(this.setError)throw Error('injected write failure');assert.equal(key,m.storageKey);this.value=value},
 }}
 // Faithful FIFO acquisition/release; callback errors propagate to the caller.
 // The fulfilled tail models release so a rejected holder cannot poison a lock.
 class FixtureLocks {
  tails=new Map();requests=[];
  request(name,options,callback){
   this.requests.push({name,mode:options.mode});
   const previous=this.tails.get(name)||Promise.resolve(),result=previous.then(()=>callback({name,mode:options.mode}));
   this.tails.set(name,result.then(()=>undefined,()=>undefined));return result;
  }
  async hold(name){let release,entered;const acquired=new Promise(resolve=>entered=resolve),finished=this.request(name,{mode:'exclusive'},async()=>{entered();await new Promise(resolve=>release=resolve)});await acquired;return async()=>{release();await finished};}
 }
 async function settle(app){
  for(let i=0;i<40;i++){
   const pending=[...app.pending];app.pending.clear();await Promise.all(pending);await Promise.resolve();
   app.frame.render();
   if(!app.pending.size){await Promise.resolve();if(!app.pending.size)return;}
  }
  throw Error('Async App save fixture did not settle');
 }
 function appFixture(state,route='#/learn/reading-short',config={}){
  const storage=storageFixture(JSON.stringify(state));Object.assign(storage,config);globalThis.localStorage=storage;
  const locks=new FixtureLocks();Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks}});
  const pending=new Set(),wrappers=new WeakMap();
  const tracked=fn=>{if(!wrappers.has(fn))wrappers.set(fn,change=>{const result=fn(change);if(result&&typeof result.then==='function')pending.add(result);return result});return wrappers.get(fn)};
  const listeners=new Map();globalThis.window={innerWidth:1000,scrollY:0,scrollTo(){},addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)};
  globalThis.location={hash:route};globalThis.history={state:null,replaceState(state,title,url){this.state=state;location.hash=new URL(url,'http://synthetic.local/').hash}};
  const frame=renderFrame(App,{});
  const room=()=>{const props=find(frame.render(),n=>n.type===LearningRoom).props;return {...props,save:tracked(props.save)}};
  return {storage,frame,listeners,locks,pending,room,state:()=>room().state,save:change=>room().save(change)};
 }
 const warmRoom=renderFrame(LearningRoom,{node:c.nodeById('reading-short'),state:progress(),save:async()=>true,close(){},select(){}});
 const EvidenceForm=find(warmRoom.tree,n=>typeof n.type==='function'&&n.type.name==='EvidenceForm').type;
 const evidenceFrame=(app,id='reading-short')=>renderFrame(EvidenceForm,{node:c.nodeById(id),state:app.state(),save:app.room().save,close(){}});
 const refresh=async(frame,app)=>{await settle(app);return frame.render({...frame.props,state:app.state()})};
 // Registered units expose their legacy quiz through the actual UI choice.
 // Keep the real registry and avoid pretending a registered course is absent.
 async function learningFrame(app){
  const frame=renderFrame(LearningRoom,{...app.room(),close(){},select(){}});
  if(elements(frame.tree).some(n=>n.type==='CourseLoopWorkspace')){
   find(frame.tree,n=>n.type==='button'&&textOf(n)==='查看原有听读与练习记录').props.onClick();
   await Promise.resolve();await refresh(frame,app);
  }
  return frame;
 }


 // The old code demonstrates all three false-success paths before the patch.
 {
  const app=appFixture(progress()),form=evidenceFrame(app),original=app.storage.value;
  app.storage.setError=true;await submit(form);await refresh(form,app);
  check(app.storage.value===original,'Failed writes preserve the original bytes');
  check(evidenceSuccess(form)===baseline,'Evidence receipt requires a successful write');
  check(m.achieved(c.nodeById('reading-short'),app.state())===baseline,'Uncommitted evidence cannot complete a station');
  check((m.statusMap(app.state())['reading-after']==='available')===baseline,'Uncommitted evidence cannot light the next station');
  if(!baseline){
   check(field(form,'材料与题目编号').props.value===evidence.material,'Failed submission retains editable evidence');
   app.storage.setError=false;await submit(form);await refresh(form,app);
   check(evidenceSuccess(form)&&m.achieved(c.nodeById('reading-short'),app.state()),'The same evidence can be retried successfully');
   check(m.achieved(c.nodeById('reading-short'),m.parseProgress(app.storage.value)),'Success survives a backup round trip');
  }
 }
 {
  const app=appFixture(progress('project'),'#/learn/chapter-1'),form=renderFrame(CourseRoom,{node:c.nodeById('chapter-1'),state:app.state(),save:app.room().save,select(){}}),original=app.storage.value;
  app.storage.setError=true;await submit(form);await refresh(form,app);
  check(app.storage.value===original,'Failed project write preserves original bytes');
  check(projectSuccess(form)===baseline,'Project receipt requires a successful write');
  check(m.achieved(c.nodeById('chapter-1'),app.state())===baseline,'Uncommitted project cannot complete a chapter');
  check((m.statusMap(app.state())['chapter-2']==='available')===baseline,'Uncommitted project cannot unlock a chapter');
  if(!baseline){app.storage.setError=false;await submit(form);await refresh(form,app);check(projectSuccess(form)&&m.achieved(c.nodeById('chapter-1'),app.state()),'The preserved project retries successfully')}
 }
 {
  const app=appFixture(progress()),form=evidenceFrame(app),original=app.storage.value;
  const remote={...progress(),records:{...progress().records,first:{...m.emptyRecord(),startedAt:now}}};
  remote.records['reading-short'].draft.material='Remote draft from another tab';
  app.storage.value=JSON.stringify(remote);
  field(form,'材料与题目编号').props.onChange({target:{value:'My attempted material'}});await refresh(form,app);
  check(app.storage.writes===0,'Conflict is detected before any write');
  check(app.state().records.first.startedAt===now,'Conflict loads the other tab record');
  check(field(form,'材料与题目编号').props.value===(baseline?'Remote draft from another tab':'My attempted material'),'Conflict preserves the local attempted input for retry');
  if(!baseline){
   field(form,'你的作答与作品').props.onChange({target:{value:'My revised answer retained while conflict is unresolved.'}});await refresh(form,app);
   check(app.storage.writes===0,'Further local edits do not silently overwrite the conflicting record');
   await submit(form);await refresh(form,app);
   check(evidenceSuccess(form),'Explicit retry saves the retained input');
   const restored=m.parseProgress(app.storage.value);
   check(restored.records.first.startedAt===now&&restored.records['reading-short'].evidence.material==='My attempted material','Retry merges the assessment into the latest record');
  }
  check(original!==app.storage.value,'Fixture used distinct remote data');
 }
 if(baseline){console.log(`BASELINE REPRODUCED (${checks} assertions): write rejection still showed evidence/project success, changed completion/unlocks, and cross-tab conflict erased the attempted input.`);process.exitCode=0;}
 else{
  for(const kind of ['evidence','project']){
   const app=appFixture(progress(kind),kind==='project'?'#/learn/chapter-1':'#/learn/reading-short');
   const form=kind==='project'?renderFrame(CourseRoom,{node:c.nodeById('chapter-1'),state:app.state(),save:app.room().save,select(){}}):evidenceFrame(app);
   const label=kind==='project'?'自己的英文原稿':'你的作答与作品',original=app.storage.value,before=structuredClone(app.state());
   app.storage.setError=true;field(form,label).props.onChange({target:{value:'This input remains editable after a write failure. '.repeat(4)}});await refresh(form,app);
   check(field(form,label).props.value.startsWith('This input remains'),'Failed draft write retains local input');
   check(app.storage.value===original&&JSON.stringify(app.state())===JSON.stringify(before),'Failed drafts leave durable progress and completion unchanged');
   field(form,label).props.onChange({target:{value:'Further input remains editable for the explicit retry. '.repeat(4)}});await refresh(form,app);
   check(app.storage.writes===1,'After a failed draft write, autosaving pauses until explicit retry');
   app.storage.setError=false;await submit(form);await refresh(form,app);
   check(kind==='project'?projectSuccess(form):evidenceSuccess(form),'Failed draft can be edited and submitted successfully');
  }
  {
   const app=appFixture(progress()),before=structuredClone(app.state()),original=app.storage.value;
   app.storage.getError=true;
   check(!await app.save(s=>({...s,minimum:'6'})),'Read exception rejects a save');
   check(app.storage.writes===0&&app.storage.value===original,'Read failure never overwrites unreadable data');
   check(JSON.stringify(app.state())===JSON.stringify(before),'Read failure keeps the previously committed state');
   app.storage.getError=false;check(await app.save(s=>({...s,minimum:'6'})),'Read failure can be retried');
  }
  {
   const initial=progress(),app=appFixture(initial,'#/learn/reading-short',{getError:true}),original=app.storage.value;
   check(!Object.keys(app.state().records).length,'Startup read failure uses a temporary empty view');
   check(!await app.save(s=>({...s,minimum:'6'}))&&app.storage.value===original,'Startup read failure blocks writes while storage is unavailable');
   app.storage.getError=false;
   check(!await app.save(s=>({...s,minimum:'6'}))&&app.storage.writes===0,'Recovered storage is loaded before any new write');
   check(app.state().records['reading-short'].draft.material===evidence.material,'Recovered original input is preserved');
   check(await app.save(s=>({...s,minimum:'6'})),'Recovered storage accepts an explicit retry');
  }
  {
   const app=appFixture(progress()),before=structuredClone(app.state());app.storage.value='{invalid-original-json';
   check(!await app.save(s=>({...s,minimum:'6'})),'Corrupt storage rejects a save');
   check(app.storage.writes===0&&app.storage.value==='{invalid-original-json','Corrupt original bytes are never rewritten');
   check(JSON.stringify(app.state())===JSON.stringify(before),'Corrupt storage cannot promote uncommitted progress');
  }
  {
   const app=appFixture(progress()),form=evidenceFrame(app);field(form,'材料与题目编号').props.onChange({target:{value:'My locally edited paper'}});await refresh(form,app);
   const remote=progress();remote.records['reading-short'].draft.material='Remote storage event paper';remote.records.first={...m.emptyRecord(),startedAt:now};app.storage.value=JSON.stringify(remote);
   app.listeners.get('storage')({key:m.storageKey,newValue:app.storage.value});await refresh(form,app);
   check(field(form,'材料与题目编号').props.value==='My locally edited paper','Storage events retain actively edited input');
   const writes=app.storage.writes;field(form,'你的作答与作品').props.onChange({target:{value:'My local revision after the external draft update.'}});await refresh(form,app);
   check(app.storage.writes===writes&&m.parseProgress(app.storage.value).records['reading-short'].draft.material==='Remote storage event paper','Editing after an external draft update pauses autosaving until explicit retry');
   await submit(form);await refresh(form,app);check(app.state().records.first.startedAt===now,'Retry after a storage event preserves unrelated remote records');
  }
  for(const kind of ['evidence','project']){
   const app=appFixture(progress(kind),kind==='project'?'#/learn/chapter-1':'#/learn/reading-short');
   const form=kind==='project'?renderFrame(CourseRoom,{node:c.nodeById('chapter-1'),state:app.state(),save:app.room().save,select(){}}):evidenceFrame(app);
   const label=kind==='project'?'自己的英文原稿':'你的作答与作品',id=kind==='project'?'chapter-1':'reading-short';
   field(form,label).props.onChange({target:{value:'My first locally saved expression. '.repeat(4)}});await refresh(form,app);
   const remote=m.parseProgress(app.storage.value);remote.records[id].startedAt=now;remote.records[id].phase='challenge';app.storage.value=JSON.stringify(remote);
   app.listeners.get('storage')({key:m.storageKey,newValue:app.storage.value});await refresh(form,app);
   const writes=app.storage.writes;field(form,label).props.onChange({target:{value:'My second locally saved expression. '.repeat(4)}});await refresh(form,app);
   check(app.storage.writes===writes+1,'Unrelated started/phase markers do not pause draft autosaving');
   check(m.parseProgress(app.storage.value).records[id].startedAt===now,'Autosaving after unrelated markers preserves them');
  }
  {
   const app=appFixture(progress('project'),'#/learn/chapter-1'),form=renderFrame(CourseRoom,{node:c.nodeById('chapter-1'),state:app.state(),save:app.room().save,select(){}});
   field(form,'自己的英文原稿').props.onChange({target:{value:'My locally saved original project. '.repeat(4)}});await refresh(form,app);
   const remote=m.parseProgress(app.storage.value);remote.records['chapter-1'].draft.feedback='The other reviewer updated this draft with concrete feedback.';app.storage.value=JSON.stringify(remote);
   app.listeners.get('storage')({key:m.storageKey,newValue:app.storage.value});await refresh(form,app);
   const writes=app.storage.writes;field(form,'自己的英文原稿').props.onChange({target:{value:'My revision after the other draft update. '.repeat(4)}});await refresh(form,app);
   check(app.storage.writes===writes&&m.parseProgress(app.storage.value).records['chapter-1'].draft.feedback===remote.records['chapter-1'].draft.feedback,'Project storage events pause autosaving and preserve the remote draft');
   await submit(form);await refresh(form,app);check(projectSuccess(form),'Project storage-event input can be saved by explicit retry');
  }
  {
   const app=appFixture(progress('project'),'#/learn/chapter-1'),form=renderFrame(CourseRoom,{node:c.nodeById('chapter-1'),state:app.state(),save:app.room().save,select(){}});
   const earlierRecorder=find(form.tree,n=>n.type==='Recorder');
   const remote=progress('project');remote.records['chapter-1'].draft.text='Remote chapter draft';remote.records.first={...m.emptyRecord(),startedAt:now};app.storage.value=JSON.stringify(remote);
   const attempted='My attempted chapter expression remains intact across a conflict. '.repeat(4);
   field(form,'自己的英文原稿').props.onChange({target:{value:attempted}});await refresh(form,app);
   check(app.storage.writes===0&&field(form,'自己的英文原稿').props.value===attempted,'Chapter conflict preserves the attempted expression without writing');
   earlierRecorder.props.onSaved('late-synthetic-take.wav');await refresh(form,app);
   check(field(form,'自己的英文原稿').props.value===attempted&&field(form,'录音文件名或保存位置').props.value==='late-synthetic-take.wav','An old Recorder callback merges into the latest local input');
   check(app.storage.writes===0,'The recording callback does not overwrite an unresolved conflict');
   await submit(form);await refresh(form,app);const restored=m.parseProgress(app.storage.value);
   check(projectSuccess(form)&&restored.records.first.startedAt===now,'Chapter retry retains unrelated remote records');
   check(restored.records['chapter-1'].project.text===attempted&&restored.records['chapter-1'].project.recording==='late-synthetic-take.wav','Chapter retry saves both local expression and late recording');
  }
  {
   const app=appFixture(progress()),room=await learningFrame(app),form=evidenceFrame(app);
   const originalElement=find(room.tree,n=>n.type===EvidenceForm),remote=progress();remote.access={all:false,nodes:[]};app.storage.value=JSON.stringify(remote);
   field(form,'材料与题目编号').props.onChange({target:{value:'My input retained after the node relocks'}});await refresh(form,app);room.render({...room.props,...app.room()});
   const hidden=find(room.tree,n=>n.type==='div'&&n.props.hidden===true&&elements(n).some(child=>child.type===EvidenceForm));
   check(find(hidden,n=>n.type===EvidenceForm).type===originalElement.type,'A relocking conflict keeps the same form mounted inside a hidden container');
   check(textOf(room.tree).includes('这一课还没有开放'),'The lock screen remains visible while the pending form is hidden');
   check(field(form,'材料与题目编号').props.value==='My input retained after the node relocks','A relocking conflict retains the attempted input');
   const lockPanel=find(room.tree,n=>n.props?.className==='locked-room');await find(lockPanel,n=>n.type==='button').props.onClick();room.render({...room.props,...app.room()});await refresh(form,app);
   check(elements(room.tree).some(n=>n.type==='div'&&n.props.hidden===false&&elements(n).some(child=>child.type===EvidenceForm)),'Manual unlock reveals the same pending form');
   await submit(form);await refresh(form,app);check(app.state().records['reading-short'].evidence.material==='My input retained after the node relocks','The revealed pending input can be retried successfully');
  }
  {
   const state=m.emptyProgress();state.access={all:false,nodes:['mock-one']};
   state.records['mock-one']={...m.emptyRecord(),draft:{...evidence,scores:['6.5','6.5','6.5','6.5'],kind:'academic',reference:'Synthetic answer and band table'}};
   const app=appFixture(state,'#/learn/mock-one'),form=evidenceFrame(app,'mock-one');app.storage.setError=true;
   field(form,'接收机构的单项要求').props.onChange({target:{value:'6'}});await refresh(form,app);
   check(field(form,'接收机构的单项要求').props.value==='6'&&app.state().minimum==='unconfirmed','A failed requirement save retains the local selection without committing it');
   await submit(form);await refresh(form,app);check(!evidenceSuccess(form)&&!m.achieved(c.nodeById('mock-one'),app.state()),'Rejected mock save cannot satisfy readiness evidence');
   app.storage.setError=false;await submit(form);await refresh(form,app);
   check(evidenceSuccess(form)&&app.state().minimum==='6'&&m.achieved(c.nodeById('mock-one'),m.parseProgress(app.storage.value)),'Explicit mock retry atomically saves its requirement and result');
   const savedMock=JSON.stringify(app.state().records['mock-one'].mock),remote=m.parseProgress(app.storage.value);
   app.listeners.get('storage')({key:m.storageKey,newValue:app.storage.value});await refresh(form,app);
   check(evidenceSuccess(form)&&JSON.stringify(app.state().records['mock-one'].mock)===savedMock,'An unchanged valid requirement retains the actual saved mock receipt');
   remote.minimum='7';app.storage.value=JSON.stringify(remote);app.listeners.get('storage')({key:m.storageKey,newValue:app.storage.value});await refresh(form,app);
   check(!evidenceSuccess(form),'A later requirement change cannot leave a stale unlocked receipt');
   remote.minimum='5.5';app.storage.value=JSON.stringify(remote);app.listeners.get('storage')({key:m.storageKey,newValue:app.storage.value});await refresh(form,app);
   check(evidenceSuccess(form)&&JSON.stringify(app.state().records['mock-one'].mock)===savedMock,'A lower valid requirement retains the actual saved mock receipt');
  }
  {
   const state=m.emptyProgress();state.access={all:false,nodes:['finish']};
   const app=appFixture(state,'#/learn/finish'),room=await learningFrame(app);
   const FinishForm=find(room.tree,n=>typeof n.type==='function'&&n.type.name==='FinishForm').type;
   const form=renderFrame(FinishForm,{state:app.state(),save:app.room().save});app.storage.setError=true;
   field(form,'成绩来源备注').props.onChange({target:{value:'Synthetic Academic official result'}});form.render();
   const scores=find(form.tree,n=>typeof n.type==='function'&&n.type.name==='ScoreFields');scores.props.set(['6.5','6.5','6.5','6.5']);form.render();
   field(form,'接收机构单项要求').props.onChange({target:{value:'6'}});await refresh(form,app);
   check(field(form,'接收机构单项要求').props.value==='6','Official result form retains a rejected requirement selection');
   await submit(form);await refresh(form,app);
   check(!m.officialReached(app.state())&&!app.state().official&&textOf(form.tree).includes('尚未保存正式成绩'),'Rejected official result stays editable and cannot show achievement');
   check(field(form,'成绩来源备注').props.value==='Synthetic Academic official result','Official result input survives a rejected save');
   app.storage.setError=false;await submit(form);await refresh(form,app);
   check(m.officialReached(m.parseProgress(app.storage.value))&&textOf(form.tree).includes('你记录了 6.5 达标成绩。'),'Official result retry saves the selected requirement and exact result');
  }
  {
   const state=m.emptyProgress(),node=c.nodeById('first');state.records.first={...m.emptyRecord(),round:0,phase:'challenge',answers:proof(node,0,now).answers};
   const app=appFixture(state,'#/learn/first'),room=await learningFrame(app);
   const FocusedQuiz=find(room.tree,n=>typeof n.type==='function'&&n.type.name==='FocusedQuiz').type;
   const form=renderFrame(FocusedQuiz,{node,state:app.state(),save:app.room().save,close(){},select(){}});app.storage.setError=true;
   await submit(form);await refresh(form,app);
   check(!elements(form.tree).some(n=>n.props?.className?.includes('quiz-receipt'))&&!m.achieved(node,app.state()),'Rejected quiz assessment cannot render a passing receipt');
   app.storage.setError=false;await submit(form);await refresh(form,app);
   check(elements(form.tree).some(n=>n.props?.className?.includes('quiz-receipt'))&&m.achieved(node,m.parseProgress(app.storage.value)),'The retained quiz assessment can be retried');
  }
  {
   const state=progress('project'),node=c.nodeById('nce1-1');state.records[node.id].round=1;state.records[node.id].phase='challenge';
   const app=appFixture(state,'#/learn/nce1-1'),room=await learningFrame(app);
   const FocusedQuiz=find(room.tree,n=>typeof n.type==='function'&&n.type.name==='FocusedQuiz').type;
   const form=renderFrame(FocusedQuiz,{node,state:app.state(),save:app.room().save,close(){},select(){}}),writes=app.storage.writes;
   find(form.tree,n=>n.props?.className==='answer-review').props.onToggle({currentTarget:{open:false}});
   check(app.storage.writes===writes,'Closing the answer reference does not record new help');
   find(form.tree,n=>n.props?.className==='answer-review').props.onToggle({currentTarget:{open:true}});await refresh(form,app);
   check(app.state().records[node.id].quizHelpAt>=now&&!m.stable(node,app.state()),'Opening the real answer reference records help and resets consolidation');
   check(!app.state().records[node.id].assisted,'Opening a completed answer reference preserves the historical independent attempt');
   await app.save(s=>({...s,records:{...s.records,[node.id]:{...s.records[node.id],round:2,answers:[],assisted:false}}}));await refresh(form,app);
   find(form.tree,n=>n.props?.className==='hint-button').props.onClick();await refresh(form,app);
   check(app.state().records[node.id].assisted&&app.state().records[node.id].quizHelpAt>=now,'The real hint callback records assisted practice and exposure');
  }
  for(const id of ['first','small-exchange']){
   const node=c.nodeById(id),legacy=proof(node,1,now-2*day),state=m.emptyProgress();state.access={all:false,nodes:[id]};
   state.records[id]={...m.emptyRecord(),round:1,phase:'challenge',answers:[...legacy.answers],attempts:[legacy]};
   const app=appFixture(state,`#/learn/${id}`),room=await learningFrame(app);
   const FocusedQuiz=find(room.tree,n=>typeof n.type==='function'&&n.type.name==='FocusedQuiz').type;
   const form=renderFrame(FocusedQuiz,{node,state:app.state(),save:app.room().save,close(){},select(){}});
   check(elements(form.tree).some(n=>n.props?.className?.includes('quiz-receipt'))&&textOf(form.tree).includes('Synthetic legacy reference '+id)&&textOf(form.tree).includes('✓ 已匹配'),id+': unmarked historical receipt keeps its original questions and grading');
   await app.save(s=>({...s,records:{...s.records,[id]:{...s.records[id],bank:'starter-v2',round:1,phase:'challenge',answers:[],heard:[]}}}));await refresh(form,app);
   check(!elements(form.tree).some(n=>n.props?.className?.includes('quiz-receipt')),id+': the same round in another bank is a pending challenge');
   const question=find(form.tree,n=>typeof n.type==='function'&&n.type.name==='QuestionAnswer');
   check(question.props.q.prompt==='Synthetic fresh lesson 3 '+id&&question.props.q.clip.lesson===3,id+': the active component selects new source material by bank marker');
   const fresh=proof(node,1,now,'starter-v2');
   check(m.grade(node,legacy.answers,1,'starter-v2').every(value=>!value),id+': adding a bank label cannot make old answers match new material');
   check(!m.passedQuiz(node,{...fresh,heard:[]}),id+': the new source audio must be heard');
   const sameMaterial=proof(node,0,now,'starter-v2'),sameState={...app.state(),records:{...app.state().records,[id]:{...app.state().records[id],round:0,attempts:[legacy,sameMaterial]}}};
   check(!m.stable(node,sameState),id+': a bank marker over unchanged source material cannot prove consolidation');
   const answer=renderFrame(question.type,question.props);find(answer.tree,n=>n.type==='button'&&textOf(n)==='fresh answer '+id).props.onClick();await refresh(form,app);
   const updatedQuestion=find(form.tree,n=>typeof n.type==='function'&&n.type.name==='QuestionAnswer'),heardAnswer=renderFrame(updatedQuestion.type,updatedQuestion.props);find(heardAnswer.tree,n=>n.type==='ClipButton').props.done();await refresh(form,app);
   await submit(form);await refresh(form,app);const durable=m.parseProgress(app.storage.value),last=durable.records[id].attempts.at(-1);
   check(last.bank==='starter-v2'&&last.heard.includes(0)&&m.passedQuiz(node,last),id+': actual choice, audio and submit callbacks persist the matching versioned proof');
   check(textOf(form.tree).includes('Synthetic fresh lesson 3 reference '+id)&&textOf(form.tree).includes('✓ 已匹配')&&!textOf(form.tree).includes('Synthetic legacy reference '+id),id+': the new historical receipt grades and explains the proof bank');
   check(m.stable(node,durable)&&JSON.stringify(durable.records[id].attempts[0])===JSON.stringify(legacy),id+': a delayed independent new group consolidates without rewriting the old proof');
  }
  for(const id of ['first','small-exchange']){
   const node=c.nodeById(id),legacy=proof(node,1,now-2*day);let state=m.emptyProgress();state.access={all:false,nodes:[id]};
   state.records[id]={...m.emptyRecord(),round:1,phase:'learn',attempts:[legacy]};
   const save=async change=>{state=change(state);return true},room=renderFrame(LearningRoom,{node,state,save,close(){},select(){}});
   await find(room.tree,n=>n.type==='button'&&textOf(n).endsWith('自己试')).props.onClick();
   check(state.records[id].bank==='starter-v2'&&c.questionsFor(node,state.records[id].round,state.records[id].bank)[0].clip?.lesson===3,id+': learning after a completed old round starts an independent marked group');
   state={...state,records:{...state.records,[id]:{...m.emptyRecord(),bank:'starter-v2',round:1,phase:'learn',attempts:[legacy]}}};room.render({...room.props,state});
   await find(room.tree,n=>n.type==='button'&&textOf(n).endsWith('自己试')).props.onClick();
   check(state.records[id].round===1&&state.records[id].bank==='starter-v2'&&state.records[id].phase==='challenge',id+': the step transition compares both round and bank before restarting');
   const oldStudy={...state,records:{...state.records,[id]:{...state.records[id],bank:undefined,exampleIndex:3}}},oldTeaching=renderFrame(StarterTeaching,{node,state:oldStudy,save,ready(){}});
   check(textOf(oldTeaching.tree).includes('Synthetic guided '+id)&&!textOf(oldTeaching.tree).includes('Synthetic new lesson 3'),id+': unmarked teaching keeps the original three-line guided path');
   const newStudy={...state,records:{...state.records,[id]:{...state.records[id],exampleIndex:3}}},newTeaching=renderFrame(StarterTeaching,{node,state:newStudy,save,ready(){}});
   check(textOf(newTeaching.tree).includes('示范 4 / 6')&&textOf(newTeaching.tree).includes('Synthetic new lesson 3 '+id+' line 1'),id+': marked teaching appends the new three source lines');
   check(find(newTeaching.tree,n=>n.type==='ClipButton').props.clip.lesson===3,id+': the appended teaching line plays the fixed new lesson source');
  }


  {
   const locks=new FixtureLocks(),error=Error('Expected callback rejection');
   await assert.rejects(locks.request('synthetic-error-lock',{mode:'exclusive'},()=>{throw error}),actual=>actual===error);checks++;
   check(await locks.request('synthetic-error-lock',{mode:'exclusive'},()=>true)===true,'Fixture lock propagates the original rejection and still releases for the next holder');
   const app=appFixture(progress()),before=app.storage.value;
   check(await app.save(()=>{throw Error('Synthetic transformation failure')})===false,'The real host returns false for a rejected transformation');
   check(app.storage.value===before&&app.storage.writes===0,'Rejected transformation cannot alter durable progress');
  }
  // Real host Promise and named lock: no transform/publication before acquiring.
  {
   const app=appFixture(progress()),before=app.storage.value,key='english-studio-map-restore:'+m.storageKey;
   const release=await app.locks.hold(key);let transformed=0,finished=false;
   const saving=app.save(s=>{transformed++;return {...s,minimum:'6'}});saving.then(()=>finished=true);
   check(saving instanceof Promise,'The real host Save returns Promise<boolean>');await Promise.resolve();app.frame.render();
   check(!finished&&transformed===0&&app.storage.value===before,'Held lock keeps the transform, durable write and Promise confirmation pending');
   check(app.state().minimum==='unconfirmed','Held save cannot publish the proposed state');await release();
   check(await saving===true&&transformed===1&&m.parseProgress(app.storage.value).minimum==='6','Released lock confirms the actual native write exactly once');
   check(app.locks.requests.every(r=>r.name===key&&r.mode==='exclusive'),'The real save requests the restore lock in exclusive mode');
  }
  // The old submission is valid, but its later resolution cannot clear or claim
  // success for an input edited after submission began. Use the real save queue.
  for(const kind of ['evidence','project']){
   const app=appFixture(progress(kind),kind==='project'?'#/learn/chapter-1':'#/learn/reading-short');
   const form=kind==='project'?renderFrame(CourseRoom,{node:c.nodeById('chapter-1'),state:app.state(),save:app.room().save,select(){}}):evidenceFrame(app);
   const label=kind==='project'?'自己的英文原稿':'你的作答与作品',id=kind==='project'?'chapter-1':'reading-short',original=app.storage.value;
   const release=await app.locks.hold('english-studio-map-restore:'+m.storageKey),saving=submit(form);
   const later='My newer original expression stays editable while an earlier submission is pending. '.repeat(4);
   field(form,label).props.onChange({target:{value:later}});form.render();await Promise.resolve();
   check(app.storage.value===original&&!(kind==='project'?projectSuccess(form):evidenceSuccess(form)),kind+': delayed submission has no premature write or receipt');
   check(field(form,label).props.value===later,kind+': later input remains visible while its autosave queues');
   await release();await saving;await refresh(form,app);
   check(field(form,label).props.value===later,kind+': older submission completion does not clear newer input');
   check(!(kind==='project'?projectSuccess(form):evidenceSuccess(form)),kind+': older submitted input cannot claim a receipt for the newer draft');
   check(m.parseProgress(app.storage.value).records[id].draft[kind==='project'?'text':'work']===later,kind+': queued newer draft survives the older submission commit');
   await submit(form);await refresh(form,app);
   check(kind==='project'?projectSuccess(form):evidenceSuccess(form),kind+': explicitly submitting the newer input confirms its own receipt');
  }
  {
   const state=m.emptyProgress(),node=c.nodeById('first');state.records.first={...m.emptyRecord(),exampleIndex:3};
   const app=appFixture(state,'#/learn/first'),form=renderFrame(StarterTeaching,{node,state:app.state(),save:app.room().save,ready(){}});
   find(form.tree,n=>n.type==='button'&&textOf(n)==='a').props.onClick();form.render();app.storage.setError=true;
   const release=await app.locks.hold('english-studio-map-restore:'+m.storageKey),moving=find(form.tree,n=>n.type==='button'&&textOf(n)==='回看示范').props.onClick();await Promise.resolve();form.render();
   check(elements(form.tree).some(n=>n.props?.className==='picked'),'Starter delayed move retains the selected guided answer');await release();await moving;await refresh(form,app);
   check(app.state().records.first.exampleIndex===3&&elements(form.tree).some(n=>n.props?.className==='picked'),'Starter async false preserves both step and selected answer');
   app.storage.setError=false;await find(form.tree,n=>n.type==='button'&&textOf(n)==='回看示范').props.onClick();await refresh(form,app);
   check(app.state().records.first.exampleIndex===2,'Starter awaits true before entering the earlier example');
   await find(form.tree,n=>n.type==='button'&&textOf(n).startsWith('跟着试一次')).props.onClick();await refresh(form,app);
   check(!elements(form.tree).some(n=>n.props?.className==='picked'),'Starter successful move clears the guided answer only after confirmation');
  }
  // Browser hash events are synthetic here; the actual App handler and its
  // await/rollback logic are unchanged. A pending or false save cannot unload.
  for(const succeeds of [false,true]){
   const app=appFixture(progress()),before=app.storage.value,key='english-studio-map-restore:'+m.storageKey,release=await app.locks.hold(key);
   app.storage.setError=!succeeds;const saving=app.save(s=>({...s,minimum:'6'}));
   const oldURL='http://synthetic.local/#/learn/reading-short';location.hash='#/learn/reading-after';app.listeners.get('hashchange')({oldURL});
   for(let i=0;i<6;i++)await Promise.resolve();app.frame.render();
   check(app.room().node.id==='reading-short'&&app.storage.value===before,'Navigation keeps the original room while the save Promise is pending');
   await release();check(await saving===succeeds,'Navigation receives the exact asynchronous save result');
   for(let i=0;i<6;i++)await Promise.resolve();app.frame.render();
   check(app.room().node.id===(succeeds?'reading-after':'reading-short'),'Navigation changes the room only after confirmed true');
   check(location.hash===(succeeds?'#/learn/reading-after':'#/learn/reading-short'),'Failed navigation restores the original browser hash');
  }
  console.log(`PASS save reliability (${checks} assertions): real App/form/quiz callbacks; read/write exceptions; corrupt/startup reads; failed draft and assessment retry; no false completion/unlocks; conflict and storage-event input retention; late Recorder callback; mock/official requirements; help exposure; versioned starter questions, source audio and historical receipts; backup round trip; awaited lock acquisition, later edits during submission, starter clearing and guarded navigation. No browser data, media or network.`);
 }
}finally{await rm(dir,{recursive:true,force:true})}
