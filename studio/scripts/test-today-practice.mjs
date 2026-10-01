import assert from 'node:assert/strict';
import {readFile, readdir, mkdir} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';

// Bundle the production recommendation model with actual project data and FSRS.
const root = new URL('../', import.meta.url);
const here = new URL('work/map-verification/today-practice/', root);
await mkdir(here,{recursive:true});
const pnpm = new URL('node_modules/.pnpm/', root);
const builders = (await readdir(pnpm)).filter(name => /^esbuild@\d+\.\d+\.\d+$/.test(name)).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}));
assert(builders.length, 'The locked project dependencies must be installed');
const {build} = await import(new URL(`${builders[0]}/node_modules/esbuild/lib/main.js`, pnpm));
const output = new URL('today-practice-model.mjs', here);
const contents = await readFile(new URL('app/today-practice.ts', root), 'utf8');
const ts = (await import(new URL('node_modules/typescript/lib/typescript.js',root))).default;
const config = ts.readConfigFile(fileURLToPath(new URL('tsconfig.json',root)),ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config,ts.sys,fileURLToPath(root));
const virtual = fileURLToPath(new URL('app/today-practice-draft.ts',root));
const host = ts.createCompilerHost(parsed.options);
const originalSource = host.getSourceFile.bind(host),originalExists = host.fileExists.bind(host),originalRead = host.readFile.bind(host);
host.getSourceFile = (file,language,onError,newFile)=>file===virtual?ts.createSourceFile(file,contents,language,true):originalSource(file,language,onError,newFile);
host.fileExists = file=>file===virtual||originalExists(file);
host.readFile = file=>file===virtual?contents:originalRead(file);
const program = ts.createProgram({rootNames:[virtual],options:{...parsed.options,noEmit:true},host});
const source = program.getSourceFile(virtual);
const diagnostics = [...program.getSyntacticDiagnostics(source),...program.getSemanticDiagnostics(source)];
assert.equal(diagnostics.length,0,ts.formatDiagnosticsWithColorAndContext(diagnostics,{getCanonicalFileName:f=>f,getCurrentDirectory:()=>fileURLToPath(root),getNewLine:()=> '\n'}));
console.log('PASS recommendation TypeScript check');
await build({stdin:{contents:contents+`
import * as testModel from './model';
import * as testMap from '../map/model';
import * as testContent from '../map/content';
import * as testGrammar from './grammar-curriculum-progress';
import * as testCurriculum from './grammar-curriculum';
import * as testGoals from './learning-plan';
import * as testTextbook from './textbook-grammar';
import * as testCards from './flashcards';
import * as testJourney from './ielts-journey';
import * as testJourneyContent from './ielts-journey-content';
import * as testNavigation from './navigation';
import * as testReview from '../map/review-route';
export {testModel,testMap,testContent,testGrammar,testCurriculum,testGoals,testTextbook,testCards,testJourney,testJourneyContent,testNavigation,testReview};
`,resolveDir:fileURLToPath(new URL('app/',root)),sourcefile:'today-practice-draft.ts',loader:'ts'},bundle:true,platform:'node',format:'esm',target:'node22',outfile:fileURLToPath(output),logLevel:'silent'});
const {todayPractice:recommend,testModel:m,testMap:map,testContent:content,testGrammar:g,testCurriculum:curriculum,testGoals:goals,testTextbook:textbook,testCards:cards,testJourney:journey,testJourneyContent:journeyContent,testNavigation:nav,testReview:reviewRoute} = await import(pathToFileURL(fileURLToPath(output)).href);
const DAY=86_400_000, MINUTE=60_000, NOW=Date.parse('2026-10-20T12:00:00.000Z');
const tests=[];
const test=(name,run)=>tests.push({name,run});
const base=()=>structuredClone(m.initial);
const first=content.nodes.find(n=>n.id==='first');
const letters=content.nodes.find(n=>n.id==='letters');
const grammarUnit=curriculum.grammarUnits[0];
const grammarId='grammar:'+grammarUnit.id;
function proof(node,at,round=0,passed=true,assisted=false){
 const qs=content.questionsFor(node,round);
 assert(qs.length);
 return {at,round,answers:qs.map((q,i)=>!passed&&i===0?'definitely-wrong':q.answer.split(/\s+\/\s+/)[0]),assisted,heard:qs.map((q,i)=>i).filter(i=>qs[i].clip)};
}
function mapState(node,attempts=[],patch={}){
 return {...map.emptyProgress(),lastNode:node.id,access:{all:true,nodes:[]},records:{[node.id]:{...map.emptyRecord(),round:attempts.at(-1)?.round||0,attempts,...patch}}};
}
function grammarState(attempts=[],patch={}){
 const progress={...g.emptyGrammarProgress(),round:attempts.at(-1)?.round||0,attempts,...patch};
 return {...base(),drafts:{[g.grammarProgressKey(grammarUnit.id)]:JSON.stringify(progress)}};
}
const attempt=(at,round=0,passed=true,independent=true)=>({at,round,variant:round%2,passed,independent});
const find=(tasks,id)=>tasks.find(t=>t.id===id);
const select=(state,mapState=map.emptyProgress(),now=NOW)=>recommend(state,mapState,now);
function deepFreeze(value){Object.freeze(value);for(const v of Object.values(value))if(v&&typeof v==='object'&&!Object.isFrozen(v))deepFreeze(v);return value;}
const entry=textbook.grammarEntries.find(e=>e.book==='NCE1'&&e.lesson===1);
const guide=textbook.grammarGuidesFor(entry)[1];
assert(guide,'Use a non-first goal so accidental default routing fails');
function goalState(goal,phase='review'){
 return {...base(),drafts:{[goals.learningKey(entry.book,entry.lesson)]:JSON.stringify({version:1,listened:true,goal:guide.id,phase,goals:{[guide.id]:{...goals.emptyGoal(),...goal}}})}};
}
const goalId=`goal:${entry.id}:${guide.id}`;
const mini=journeyContent.journeyMissions.find(x=>x.mini);
function journeyState(record){return {...base(),drafts:{[journey.journeyKey]:JSON.stringify({version:2,focus:mini.id,missions:{[mini.id]:{...journey.emptyMission(),...record}}})}};}
const word=n=>({word:n,meaning:'释义 '+n,example:'This is '+n+'.'});
function enroll(state,n,at){return cards.enrollFlashcard(state,word(n),[],at);}
function rate(state,n,rating,at){const note=Object.values(state.flashcards.notes).find(x=>x.word===n),card=Object.values(state.flashcards.cards).find(x=>x.noteId===note.id),token={cardId:card.id,revision:card.revision};return cards.rateFlashcard(cards.revealFlashcard(cards.selectFlashcard(state,card.id),token),token,rating,at);}

test('empty state recommends only the first course and never seeds optional queues',()=>{
 const state=base(),progress=map.emptyProgress(),out=select(state,progress);
 assert.equal(out.length,1);assert.equal(out[0].id,'course:first');assert.equal(out[0].href,'/map/#/learn/first');
 assert.equal(state.flashcards,undefined);assert.equal(Object.keys(state.drafts).length,0);
});
test('manual unlock is access only; it adds no completion, review or repair',()=>{
 const progress={...map.emptyProgress(),access:{all:true,nodes:['letters']}};
 assert.deepEqual(select(base(),progress).map(t=>t.kind),['course']);
});
test('map first failed check immediately recommends repair, once',()=>{
 const progress=mapState(first,[proof(first,NOW-1000,0,false)]),out=select(base(),progress);
 assert.equal(out[0].id,'map:first');assert.equal(out[0].kind,'repair');
 assert.equal(out.filter(t=>t.href.split('?')[0]==='/map/#/learn/first').length,1);
});
test('a hinted correct map answer stays repair, never mastery',()=>{
 assert.equal(select(base(),mapState(first,[proof(first,NOW-1000,0,true,true)]))[0].kind,'repair');
});
test('map failure takes priority over an older due review',()=>{
 const progress=mapState(first,[proof(first,NOW-1000,0,false)]);
 progress.records[letters.id]={...map.emptyRecord(),attempts:[proof(letters,NOW-4*DAY)]};
 assert.equal(select(base(),progress)[0].id,'map:first');
});
test('map first pass is due only after exactly 24 hours',()=>{
 const progress=mapState(first,[proof(first,NOW-DAY)]);
 assert.equal(find(select(base(),progress,NOW-1),'map:first'),undefined);
 assert.equal(find(select(base(),progress),'map:first')?.kind,'review');
});
test('a future map attempt never turns an older pass into a due task',()=>{
 const progress=mapState(first,[proof(first,NOW-2*DAY),proof(first,NOW+DAY,1)]);
 assert.equal(find(select(base(),progress),'map:first'),undefined);
});
test('future-only map proof cannot advance the current course using wall-clock time',()=>{
 const historical=NOW-100*DAY,progress=mapState(first,[proof(first,historical+DAY)]);
 assert.equal(select(base(),progress,historical).at(-1).id,'course:first');
});
test('unfinished map check resumes without producing a second review or course entry',()=>{
 const progress=mapState(first,[proof(first,NOW-2*DAY)],{round:1,phase:'challenge',answers:['unfinished'],questionIndex:1});
 const out=select(base(),progress),task=find(out,'map:first');
 assert.equal(task?.kind,'resume');assert.equal(task?.href,'/map/#/learn/first');
 assert.equal(out.filter(t=>t.href.split('?')[0]==='/map/#/learn/first').length,1);
});
test('a never-submitted map check can resume from its saved question',()=>{
 assert.equal(find(select(base(),mapState(first,[],{phase:'challenge',questionIndex:1,answers:['pending']})),'map:first')?.kind,'resume');
});
test('map delayed different rounds follow actual seven-day and twenty-one-day intervals',()=>{
 for(const [count,interval] of [[2,7],[4,21]]){
  const attempts=Array.from({length:count},(_,i)=>proof(letters,NOW-(interval+count-1-i)*DAY,i));
  const progress=mapState(letters,attempts);assert(map.stable(letters,progress,NOW));
  assert.equal(find(select(base(),progress,NOW-1),'map:letters'),undefined);
  assert.equal(find(select(base(),progress),'map:letters')?.kind,'review');
 }
});
test('speech correction waits 24h, fresh hints postpone it, and a recorded recall clears only that task',()=>{
 const node=content.unitNodes[0],unit=content.unitById(node.id),speech={row:0,source:unit.sourceSha256,takes:[],comparison:[],correction:{at:NOW-DAY,issues:[{title:'核对一个音',action:'先听再说'}]}};
 const progress=mapState(node,[],{speaking:speech});
 assert.equal(find(select(base(),progress,NOW-1),'speaking:'+node.id),undefined);
 assert.equal(find(select(base(),progress),'speaking:'+node.id)?.kind,'review');
 progress.records[node.id].speaking={...speech,hintAt:NOW-DAY/2};assert.equal(find(select(base(),progress),'speaking:'+node.id),undefined);
 progress.records[node.id].speaking={...speech,takes:[{id:'take-test',at:NOW,review:true,assisted:false}],recalledAt:NOW};assert.equal(find(select(base(),progress),'speaking:'+node.id),undefined);
 assert(!map.achieved(node,progress,NOW),'A recording must not complete the course');
});
test('a changed speech source does not reuse an obsolete recording task',()=>{
 const node=content.unitNodes[0],progress=mapState(node,[],{speaking:{row:0,source:'obsolete-source',takes:[],comparison:[],correction:{at:NOW-2*DAY,issues:[{title:'核对',action:'重说'}]}}});
 assert.equal(find(select(base(),progress),'speaking:'+node.id),undefined);
});
test('locked repair targets are not recommended as actionable',()=>{
 const progress=mapState(letters,[proof(letters,NOW-1000,0,false)]);delete progress.access;
 assert.equal(find(select(base(),progress),'map:letters'),undefined);
});
test('grammar first pass waits 24h and keeps a direct check route',()=>{
 const state=grammarState([attempt(NOW-DAY)]);
 assert.equal(find(select(state,map.emptyProgress(),NOW-1),grammarId),undefined);
 const task=find(select(state),grammarId);assert.equal(task?.kind,'review');assert.match(task.href,/unit=.*&check=1$/);
});
test('early grammar repeat cannot postpone the first delayed check',()=>{
 const state=grammarState([attempt(NOW-DAY),attempt(NOW-DAY/2,1)]);
 assert.equal(find(select(state),grammarId)?.kind,'review');
});
test('same-bank grammar success does not create a seven-day interval',()=>{
 const state=grammarState([attempt(NOW-3*DAY),attempt(NOW-2*DAY,2)]);
 assert.equal(find(select(state),grammarId)?.kind,'review');
});
test('a delayed different grammar bank waits seven days before the next check',()=>{
 const state=grammarState([attempt(NOW-8*DAY),attempt(NOW-7*DAY,1)]);
 assert.equal(find(select(state,map.emptyProgress(),NOW-1),grammarId),undefined);
 assert.equal(find(select(state),grammarId)?.kind,'review');
});
test('an early grammar repeat does not postpone an established weekly check',()=>{
 const state=grammarState([attempt(NOW-8*DAY),attempt(NOW-7*DAY,1),attempt(NOW-6*DAY,2)]);
 assert.equal(find(select(state),grammarId)?.kind,'review');
});
test('grammar repair followed by success starts a fresh 24h check, not another week',()=>{
 const state=grammarState([attempt(NOW-10*DAY),attempt(NOW-9*DAY,1),attempt(NOW-2*DAY,2,false),attempt(NOW-DAY,3)]);
 assert.equal(find(select(state,map.emptyProgress(),NOW-1),grammarId),undefined);
 assert.equal(find(select(state),grammarId)?.kind,'review');
});
test('grammar failed and assisted attempts repair immediately, even before their next day',()=>{
 for(const a of [attempt(NOW-1000,0,false),attempt(NOW-1000,0,true,false)])assert.equal(find(select(grammarState([a])),grammarId)?.kind,'repair');
});
test('a grammar round in progress resumes without altering its answers',()=>{
 const q=g.grammarRoundQuestions(grammarUnit,1)[0],state=grammarState([attempt(NOW-DAY)],{round:1,inRound:true,responses:{[q.id]:{value:'my unfinished answer',hintLevel:0,checkedValue:null,matched:false}}}),before=structuredClone(state);
 assert.equal(find(select(state),grammarId)?.kind,'resume');assert.deepEqual(state,before);
});
test('future grammar schema/content is preserved and never put into a writable task',()=>{
 for(const patch of [{version:2},{contentVersion:curriculum.grammarCurriculumVersion+1}]){
  const state=grammarState([attempt(NOW-2*DAY)],patch),before=structuredClone(state);
  assert.equal(find(select(state),grammarId),undefined);assert.deepEqual(state,before);
 }
});
test('future grammar times are not due, successful or resumable evidence',()=>{
 for(const state of [grammarState([attempt(NOW+DAY)],{inRound:true}),grammarState([attempt(NOW+DAY),attempt(NOW-2*DAY,1)]),grammarState([],{inRound:true,seenAt:NOW+1})])assert.equal(find(select(state),grammarId),undefined);
});
test('mere grammar reading or an empty malformed draft does not become a task',()=>{
 const state=grammarState([],{seenAt:NOW-DAY});assert.equal(find(select(state),grammarId),undefined);
 state.drafts[g.grammarProgressKey(grammarUnit.id)]='{';assert.equal(find(select(state),grammarId),undefined);
});
test('non-first textbook goal due route keeps exact book, lesson and guide',()=>{
 const state=goalState({answer:'I am ready.',checked:'I am ready.',dueAt:NOW-1,attempts:[{at:NOW-DAY,variant:0,matched:true,hinted:false}]}),task=find(select(state),goalId);
 assert(task);const route=nav.parseRoute(task.href.slice(1));
 assert.deepEqual({book:route.book,lesson:route.lesson,goal:route.goal,practice:route.practice},{book:entry.book,lesson:entry.lesson,goal:guide.id,practice:'review'});
});
test('a failed textbook goal repairs before its future review date',()=>{
 const state=goalState({answer:'wrong',checked:'wrong',dueAt:NOW+DAY,attempts:[{at:NOW-1000,variant:0,matched:false,hinted:false}]},'independent');
 assert.equal(find(select(state),goalId)?.kind,'repair');
});
test('unfinished textbook goal and transfer resume the actual saved phase',()=>{
 for(const phase of ['independent','transfer']){
  const state=goalState({worked:true,answer:phase==='independent'?'unfinished':'',transfer:phase==='transfer'?'My own unfinished story.':''},phase),task=find(select(state),goalId);
  assert.equal(task?.kind,'resume');assert.equal(nav.parseRoute(task.href.slice(1)).practice,phase);
 }
});
test('future textbook attempts and not-yet-due successful goals are not due tasks',()=>{
 for(const state of [goalState({dueAt:NOW-1,attempts:[{at:NOW+DAY,variant:0,matched:true,hinted:false}]}),goalState({answer:'I am ready.',checked:'I am ready.',dueAt:NOW+DAY,attempts:[{at:NOW-1,variant:0,matched:true,hinted:false}]})])assert.equal(find(select(state),goalId),undefined);
});
test('legacy self-check is secondary and not described as mastery',()=>{
 const state={...base(),nce:{'NCE1-1':{title:'',text:'',notes:'keep me',steps:['listen'],review:{checks:['meaning','listening','expression'],checkedAt:NOW-2*DAY,dueAt:NOW-1}}}};
 const task=find(select(state),'legacy:NCE1-1');assert(task);assert.match(task.evidence,/自查|勾选/);assert.doesNotMatch(task.evidence,/已掌握|检验通过/);assert.equal(task.href,'/#/nce/NCE1/1?tab=notes');
});
test('legacy whole-lesson check is not duplicated beside its exact active goal',()=>{
 const state=goalState({answer:'I am ready.',checked:'I am ready.',dueAt:NOW-1,attempts:[{at:NOW-DAY,variant:0,matched:true,hinted:false}]});
 state.nce={'NCE1-1':{title:'',text:'',notes:'',steps:[],review:{checks:[],checkedAt:NOW-2*DAY,dueAt:NOW-1}}};
 const out=select(state);assert(find(out,goalId));assert.equal(find(out,'legacy:NCE1-1'),undefined);
});
test('an unsupported legacy journey version stays untouched',()=>{
 const state=journeyState({dueAt:NOW-1});state.drafts[journey.journeyKey]=state.drafts[journey.journeyKey].replace('"version":2','"version":3');
 assert(!select(state).some(t=>t.id.startsWith('journey:')));
});
test('legacy journey due and unfinished checks keep their original source',()=>{
 for(const record of [
  {phase:'done',answer:'x',checked:'x',dueAt:NOW-1,attempts:[{at:NOW-DAY,round:0,matched:true,hinted:false}]},
  {phase:'guided',choice:'my chosen answer',startedAt:NOW-1000},
  {phase:'recall',answer:'half done',startedAt:NOW-1000,round:1}
 ]){
  const task=find(select(journeyState(record)),'journey:'+mini.id);assert(task);assert.equal(nav.parseRoute(task.href.slice(1)).mission,mini.id);
 }
});
test('legacy journey failure repairs immediately and future history never masquerades as due',()=>{
 const failed=journeyState({phase:'recall',answer:'wrong',checked:'wrong',dueAt:NOW+DAY,attempts:[{at:NOW-1,round:0,matched:false,hinted:false}]});
 assert.equal(find(select(failed),'journey:'+mini.id)?.kind,'repair');
 const future=journeyState({dueAt:NOW-1,attempts:[{at:NOW+DAY,round:0,matched:true,hinted:false}]});
 assert.equal(find(select(future),'journey:'+mini.id),undefined);
});
test('FSRS legacy migration is read-only and produces only one word task',()=>{
 const state={...base(),cards:{old:{box:3,due:NOW-1}},personalWords:[word('old')]},before=structuredClone(state),out=select(state);
 assert.equal(out.filter(t=>t.id==='words').length,1);assert.equal(find(out,'words')?.kind,'review');assert.deepEqual(state,before);assert.equal(state.flashcards,undefined);
});
test('future cards stay out, new cards stay new, and due reviews outrank new cards',()=>{
 let state=enroll(base(),'future',NOW+DAY);assert.equal(find(select(state),'words'),undefined);
 state=enroll(state,'new',NOW-DAY);assert.equal(find(select(state),'words')?.kind,'new');
 state=enroll(state,'review',NOW-30*DAY);state=rate(state,'review','easy',NOW-30*DAY);
 const task=find(select(state),'words');assert.equal(task?.kind,'review');assert.match(task.reason,/1 张/);
 assert.equal(task.at,cards.getFlashcardQueue(state,NOW).find(c=>c.phase==='review').card.due);
});
test('a newly due learning card outranks reviews and new cards using real FSRS',()=>{
 let state=enroll(base(),'new',NOW-20*DAY);state=enroll(state,'review',NOW-30*DAY);state=rate(state,'review','easy',NOW-30*DAY);state=enroll(state,'learning',NOW-MINUTE);state=rate(state,'learning','again',NOW-MINUTE);
 const queue=cards.getFlashcardQueue(state,NOW);assert.deepEqual(queue.map(c=>c.phase),['learning','review','new']);
 assert.equal(find(select(state),'words')?.at,queue[0].card.due);assert.match(find(select(state),'words').reason,/短时|刚学/);
});
test('a half-finished revealed word resumes honestly before another card',()=>{
 let state=enroll(base(),'alpha',NOW-1000);state=enroll(state,'beta',NOW-1000);
 const card=Object.values(state.flashcards.cards).find(c=>state.flashcards.notes[c.noteId].word==='beta'),token={cardId:card.id,revision:card.revision};
 state=cards.revealFlashcard(cards.selectFlashcard(state,card.id),token);
 const task=select(state).find(t=>t.id==='words');assert.equal(task.kind,'resume');assert.equal(task.title,'继续上次的词卡');assert.match(task.reason,/已翻开/);
});
test('unknown FSRS version is rejected rather than silently downgraded',()=>{
 const state=enroll(base(),'word',NOW);state.flashcards.version=2;const before=structuredClone(state);
 assert.throws(()=>select(state),/版本|支持/);assert.deepEqual(state,before);
});
test('offline empty fallback opens an actual lesson instead of linking to itself',()=>{
 const out=recommend(base(),map.emptyProgress(),NOW,false);
 assert.equal(out.length,1);assert.match(out[0].href,/^#\/nce\/NCE1\/1\?/);assert.notEqual(out[0].href,'#/today');assert.equal(out[0].returnHref,'#/today');
});
test('recommending, reordering or locally skipping does not change any saved evidence',()=>{
 const state=grammarState([attempt(NOW-DAY)]);state.cards={old:{box:4,due:NOW-1}};
 const progress=mapState(first,[proof(first,NOW-1000,0,false)]),before=JSON.stringify({state,progress});
 deepFreeze(state);deepFreeze(progress);const out=select(state,progress),skip=out[0].id;
 out.filter(t=>t.id!==skip).reverse();assert.equal(JSON.stringify({state,progress}),before);assert.deepEqual(select(state,progress),out);
});
test('course fallback is last when present and never required when it would repeat the only task',()=>{
 const withCourse=select(grammarState([attempt(NOW-DAY)]));
 assert.equal(withCourse.at(-1).kind,'course');
 const onlyRepair=select(base(),mapState(first,[proof(first,NOW-1,0,false)]));
 assert.equal(onlyRepair.length,1);assert.equal(onlyRepair[0].kind,'repair');
 const skipped=new Set([onlyRepair[0].id]);assert.deepEqual(onlyRepair.filter(t=>!skipped.has(t.id)),[]);
});
test('every generated task has a unique id, a real local destination and a safe return target',()=>{
 const state=grammarState([attempt(NOW-DAY)]);state.cards={old:{box:4,due:NOW-1}};
 const out=select(state,mapState(first,[proof(first,NOW-1000,0,false)]));
 assert.equal(new Set(out.map(t=>t.id)).size,out.length);
 for(const task of out){assert.match(task.href,/^\/(?:map\/)?#\//);assert.equal(task.returnHref,'/#/today');assert(Number.isFinite(task.at));}
});

test('due link opens one fresh round and preserves the finished evidence',()=>{
 const state=mapState(first,[proof(first,NOW-DAY)],{phase:'challenge',answers:['old'],heard:[0],assisted:true,questionIndex:2});
 const next=reviewRoute.prepareDueReview(state,first.id,NOW);
 assert.equal(next.records.first.round,1);assert.equal(next.records.first.phase,'challenge');
 assert.deepEqual(next.records.first.answers,[]);assert.deepEqual(next.records.first.attempts,state.records.first.attempts);
 assert.equal(next.records.first.assisted,false);assert.equal(next.records.first.questionIndex,0);
 assert.equal(reviewRoute.prepareDueReview(next,first.id,NOW),next,'Repeated opening retains the new unfinished round');
});
test('stale due links never discard answers or reopen early and failed checks',()=>{
 for(const state of [mapState(first,[proof(first,NOW-DAY+1)]),mapState(first,[proof(first,NOW-1,0,false)]),mapState(first,[proof(first,NOW-DAY)],{round:1,answers:['keep'],phase:'challenge'})]){
  const before=JSON.stringify(state);assert.equal(reviewRoute.prepareDueReview(state,first.id,NOW),state);assert.equal(JSON.stringify(state),before);
 }
 assert.equal(reviewRoute.prepareDueReview(map.emptyProgress(),'unknown',NOW).lastNode,undefined);
});

const uiSource=(await readFile(new URL('app/today-practice-ui.tsx',root),'utf8')).replace(/^import .*;$/gm,'');
const harness=`
 const ArrowRight=()=>null;
 let slots=[],index=0;
 function useState(initial){const i=index++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],change=>{slots[i]=typeof change==='function'?change(slots[i]):change}]}
 function useRef(value){return {current:value}}
 function useEffect(){}
 function useMemo(fn){return fn()}
 function testJSX(type,props,...children){return {type,props:{...props,children:children.flat(Infinity).filter(x=>x!=null&&x!==false)}}}
 const testFragment='fragment';
 export function render(props){index=0;return TodayPractice(props)}
 export function reset(){slots=[];index=0}
`;
const uiCode=ts.transpileModule(uiSource+harness,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.React,jsxFactory:'testJSX',jsxFragmentFactory:'testFragment'}}).outputText;
const ui=await import('data:text/javascript;base64,'+Buffer.from(uiCode).toString('base64'));
const children=node=>typeof node==='object'&&node?node.props?.children||[]:[];
const text=node=>typeof node==='string'?node:children(node).map(text).join('');
const elements=node=>typeof node==='object'&&node?[node,...children(node).flatMap(elements)]:[];
test('all skipped recommendations expose an honest paused state and can restore',()=>{
 ui.reset();const tasks=select(base(),mapState(first,[proof(first,NOW-1,0,false)]));
 let tree=ui.render({tasks});const skip=elements(tree).find(n=>n.type==='button'&&text(n)==='这项稍后再做');assert(skip);skip.props.onClick();
 tree=ui.render({tasks});assert.match(text(tree),/本次安排已暂缓/);assert.doesNotMatch(text(tree),/继续今日学习|全部完成/);
 assert.equal(elements(tree).filter(n=>n.type==='a').length,1);
 elements(tree).find(n=>n.type==='button'&&text(n)==='恢复推荐顺序').props.onClick();
 assert.match(text(ui.render({tasks})),/继续今日学习/);
});
test('unreadable records stay visible even when no recommendation is safe',()=>{
 ui.reset();const tree=ui.render({tasks:[],error:'原记录保留，请检查'});
 assert(elements(tree).some(n=>n.props.role==='alert'&&text(n).includes('原记录保留')));
 assert.doesNotMatch(text(tree),/全部完成|已掌握/);
});

let failed=0;
for(const {name,run} of tests){try{await run();console.log('PASS '+name)}catch(error){failed++;console.error('FAIL '+name+'\n'+error.stack)}}
console.log(`${tests.length-failed}/${tests.length} today-practice model checks passed.`);
if(failed)process.exitCode=1;
