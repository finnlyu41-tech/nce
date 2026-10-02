'use client';
import {TodayPracticeQueue} from './today-practice-ui';
import {GrammarWorkspace} from './grammar-workspace';
import {IELTSSampleWorkspace} from './ielts-sample-workspace';
import {useState,useEffect,useMemo,useRef} from 'react';
import {BookOpen,LayoutDashboard,Layers,NotebookPen,GraduationCap,ChartNoAxesCombined,ArrowUpRight,ArrowRight,Play,Check,Volume2,Search,Headphones,Flame,Target,Clock3,ChevronRight,Plus,RotateCcw,FolderOpen,Info} from 'lucide-react';
import {SidebarProvider,Sidebar,SidebarContent,SidebarHeader,SidebarFooter,SidebarMenu,SidebarMenuItem,SidebarMenuButton,SidebarTrigger,useSidebar} from '@/components/ui/sidebar';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {Progress} from '@/components/ui/progress';
import {Toaster,toast} from 'sonner';
import lessonsData from './data/lessons.json';
import ieltsData from './data/ielts.json';
import {Lesson,Question,Word,State,NceBookId,initial,validateState,day} from './model';
import {LessonView,Grammar,Quiz,WordCard,speak,Recorder} from './learning';
import IELTS from './ielts';
import {ExpressionCollection} from './expression-guide-ui';
import NceStudio,{nceCompleted} from './nce';
import {LearningRecords} from './learning-plan-ui';
import {LearningRoadmap} from './learning-roadmap-ui';
import {BlueprintPosition,JourneyRecords} from './ielts-blueprint-ui';
import {journeySnapshot} from './ielts-journey';
import {roadmapActiveStep,roadmapSteps} from './learning-roadmap';
import {dueLearningGoals} from './learning-plan';
import {bookNames,studyUnit,recommendedStudy} from './study-path';
import {TextbookVocabulary} from './lesson-context';
import {TextbookVocabularyBrowser} from './textbook-vocabulary-ui';
import {FlashcardReview} from './flashcard-ui';
import {enrollFlashcard,flashcardSummary,isFlashcardEnrolled,migrateFlashcards,prepareFlashcardRestore} from './flashcards';
import {loadLessonLanguage,rowsToText,type LessonLanguage} from './language';
import {readState,readStateSnapshot,writeState,writeLegacyState,restoreStateSnapshot,restoreLegacyStateSnapshot,type LocalAudio} from './offline-store';
import {mergeProgressEdits,saveProgressEdits,saveProgressCollection} from './progress-autosave';
import {ProgressSave} from './progress-save';
import type {ProgressRestoreCheckpoint,ProgressRestoreOptions} from './progress-file';
import {ONLINE} from './runtime-mode';
import {StudioHeader} from './study-mode';
import {studioSection,learningRedirect} from './studio-navigation';
import {unitById} from '../map/content';
import {continueNode} from '../map/model';
import {MapConnection,useMapProgress,mapHref,mapUnitId} from './map-connection';
import SiteMaterials from './site-materials';
import {WordLookupProvider} from './word-lookup';
import {PlaybackSpeed} from './playback-speed';
import {navigate} from './navigation';
import {useRoute,useRouteScroll} from './use-route';
import nceAttribution from './data/nce-attribution.json';
const lessons=lessonsData as Lesson[];
const courseWords=Array.from(new Map(lessons.flatMap(l=>l.vocab).map(w=>[w.word.toLowerCase(),w])).values());
const KEY='english-studio-v1';
const navs=[['today','学习',LayoutDashboard],['library','课程',BookOpen],['review','复习',RotateCcw]] as const;
const activeNav=(view:string)=>(view==='today'||view==='roadmap')?'today':view==='review'?'review':'library';
function SideNav({view,go,state}:{view:string,go:(v:string)=>void,state:State}){const {setOpenMobile}=useSidebar();return <Sidebar className="studio-sidebar"><SidebarHeader><a href="#/today" onClick={e=>{e.preventDefault();go('today');setOpenMobile(false)}} className="brand"><span className="brand-icon">E<span>.</span></span><span>句句有进步<small>ENGLISH STUDIO</small></span></a></SidebarHeader><SidebarContent><span className="nav-caption">你的英语学习空间</span><SidebarMenu>{navs.map(([id,label,Icon])=><SidebarMenuItem key={id}><SidebarMenuButton isActive={activeNav(view)===id} onClick={()=>{go(id);setOpenMobile(false)}}><Icon/><span>{label}</span>{id==='review'&&((Object.keys(state.flashcards?.cards||state.cards).length>0)||dueLearningGoals(state).length>0||journeySnapshot(state).due.length>0)&&<span className="nav-count">{flashcardSummary(state,Date.now()).due+dueLearningGoals(state).length+journeySnapshot(state).due.length}</span>}</SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu><div className="sidebar-course"><span className="tiny-label">IELTS ACADEMIC · 6.5</span><p>按能力前进，按缺口补课。</p><button className="text-btn" onClick={()=>{go('roadmap');setOpenMobile(false)}}>我的学习路线<ArrowRight size={14}/></button></div></SidebarContent><SidebarFooter><button className="profile" onClick={()=>{go('progress');setOpenMobile(false)}}><span className="avatar">E</span><div><strong>学习记录</strong><small>草稿、检验与已保存的进度</small></div></button></SidebarFooter></Sidebar>}
export default function StudyApp(){
 const route=useRoute(),destination=ONLINE?learningRedirect(route):undefined;
 useEffect(()=>{if(destination)location.replace(destination)},[destination]);
 return destination?<main className="loading" role="status">正在打开学习… <a href={destination}>进入学习</a></main>:<StudyWorkspace/>;
}
function StudyWorkspace(){
 const {state:mapState,error:mapError}=useMapProgress(ONLINE);
 const route=useRoute();useRouteScroll();const view=route.view,lessonId=route.lesson||1;
 const materialStart=useMemo(()=>route.book&&route.lesson?{book:route.book,lesson:route.lesson}:null,[route.book,route.lesson]);
 const [persisted,setPersisted]=useState<State|null>(null);
 const [state,setState]=useState<State>(initial),[ready,setReady]=useState(false),[storageError,setStorageError]=useState(false),[storageBlocked,setStorageBlocked]=useState(false),[storageMode,setStorageMode]=useState('db'),[search,setSearch]=useState(''),[stage,setStage]=useState('all'),[customActive,setCustomActive]=useState(''),[,setReviewClock]=useState(0);const stateRef=useRef(state);stateRef.current=state;
 const editBase=useRef<State>(initial),saveQueue=useRef<Promise<void>>(Promise.resolve()),saveEpoch=useRef(0);
 const [saveIssue,setSaveIssue]=useState(''),[saveRetry,setSaveRetry]=useState(0);
 useEffect(()=>{let alive=true;(async()=>{try{let parsed:unknown,dbFailed=false;try{parsed=await readState()}catch{dbFailed=true;if(alive)setStorageMode('legacy')}const databaseValue=parsed;if(parsed===undefined){const raw=localStorage.getItem(KEY);if(raw)parsed=JSON.parse(raw)}if(alive&&parsed!==undefined){if(validateState(parsed)){editBase.current=dbFailed?parsed:validateState(databaseValue)?databaseValue:initial;setState(migrateFlashcards(parsed,courseWords))}else{setStorageError(true);setStorageBlocked(true)}}}catch{if(alive){setStorageError(true);setStorageBlocked(true)}}finally{if(alive)setReady(true)}})();return()=>{alive=false}},[]);
 useEffect(()=>{
  if(!ready||storageBlocked||persisted===state)return;
  let alive=true;const base=editBase.current,epoch=saveEpoch.current,candidate=state;
  const unchanged=()=>alive&&saveEpoch.current===epoch&&stateRef.current===candidate;
  saveQueue.current=saveQueue.current.catch(()=>{}).then(async()=>{
   if(!unchanged())return;
   try{
    const saved=await saveProgressEdits(base,candidate,storageMode,KEY,unchanged);
    if(saveEpoch.current!==epoch)return;
    const latest=stateRef.current,next=latest===candidate?saved:mergeProgressEdits(candidate,latest,saved);
    editBase.current=saved;stateRef.current=next;setState(next);setPersisted(saved);setStorageError(false);setSaveIssue('');
    window.dispatchEvent(new Event('english-studio-progress-saved'));
   }catch(error){if(unchanged()){setStorageError(true);setSaveIssue(error instanceof Error?error.message:'本次输入尚未保存，请先备份。')}}
  });
  return()=>{alive=false};
 },[state,ready,storageBlocked,storageMode,persisted,saveRetry]);
 async function commitMaterialCollection(expected:State,next:State,media:LocalAudio[]){
  if(!ready||storageBlocked||storageMode!=='db')throw Error('当前不能安全保存课文资料。原记录仍保留，请先核对存储状态。');
  const previous=saveQueue.current;await previous.catch(()=>{});
  if(saveQueue.current!==previous||stateRef.current!==expected)throw Error('学习记录刚完成保存或出现新输入，请重试保存课文资料。');
  const epoch=++saveEpoch.current;let applied=false;
  const operation=Promise.resolve().then(async()=>{
   const unchanged=()=>saveEpoch.current===epoch&&stateRef.current===expected;
   if(!unchanged())throw Error('保存期间学习记录更新，请核对后重试。');
   const saved=await saveProgressCollection(editBase.current,next,media,unchanged);
   if(saveEpoch.current!==epoch)throw Error('本次课文资料已提交，随后发生了其他恢复，请重新核对当前记录。');
   const latest=stateRef.current,published=latest===expected?saved:mergeProgressEdits(expected,latest,saved);
   editBase.current=saved;stateRef.current=published;setState(published);setPersisted(saved);setStorageError(false);setSaveIssue('');applied=true;
   window.dispatchEvent(new Event('english-studio-progress-saved'));
  });
  saveQueue.current=operation.then(()=>{},()=>{});
  try{await operation}finally{if(!applied&&saveEpoch.current===epoch)setSaveRetry(n=>n+1)}
 }
 async function readLatestProgress(){
  const epoch=++saveEpoch.current,expected=stateRef.current;let applied=false;
  try{
  await saveQueue.current;
  const snapshot=storageMode==='db'?await readStateSnapshot():{raw:localStorage.getItem(KEY)};
  const value=snapshot.raw===null?initial:JSON.parse(snapshot.raw);
  if(!validateState(value))throw Error('已保存记录格式异常，原始内容仍保留。');
  if(saveEpoch.current!==epoch||stateRef.current!==expected)throw Error('读取期间本页有新的输入或恢复，请先保留输入，再重新读取。');
  editBase.current=value;stateRef.current=value;setState(value);setPersisted(value);setStorageError(false);setStorageBlocked(false);setSaveIssue('');applied=true;
 }catch(error){if(saveEpoch.current===epoch){setStorageError(true);setSaveIssue(error instanceof Error?error.message:'最新记录暂时无法读取。')}}
 finally{if(!applied&&saveEpoch.current===epoch)setSaveRetry(n=>n+1)}}
 useEffect(()=>{const tick=setInterval(()=>setReviewClock(Date.now()),30000);return()=>clearInterval(tick)},[]);
 async function captureProgressRestore():Promise<ProgressRestoreCheckpoint>{
  const expected=stateRef.current,persisted=storageMode==='db'?await readStateSnapshot():{mode:'legacy' as const,raw:localStorage.getItem(KEY)};
  if(stateRef.current!==expected)throw Error('学习记录已更新，请重新核对后恢复。');
  let current=expected;
  if(persisted.raw!==null)try{const value=JSON.parse(persisted.raw);if(validateState(value))current=value}catch{}
  return {state:current,expected,persisted};
 }
 async function restoreProgress(incoming:State,options:ProgressRestoreOptions={}){
  const unchanged=()=>!options.expected||stateRef.current===options.expected;
  if(!unchanged()||options.persisted&&options.persisted.mode!==storageMode)throw Error('学习记录已更新，请重新核对后恢复。');
  if(!validateState(incoming))throw Error('恢复内容无效，当前记录未改变。');
  if(options.rollbackTo&&(!options.exact||!options.persisted||options.rollbackTo.mode!==storageMode))throw Error('回退快照无效，当前记录未改变。');
  let current=stateRef.current;
  if(options.persisted?.raw)try{const value=JSON.parse(options.persisted.raw);if(validateState(value))current=value}catch{}
  const next=options.exact?incoming:prepareFlashcardRestore(current,incoming,courseWords);
  const guard=options.persisted?{expectedRaw:options.persisted.raw,unchanged}:undefined;
  const epoch=++saveEpoch.current;
  try{
  if(options.rollbackTo){if(storageMode==='db')await restoreStateSnapshot(options.rollbackTo,guard!);else await restoreLegacyStateSnapshot(options.rollbackTo,KEY,guard!);}
  else if(storageMode==='db')await writeState(next,guard);else await writeLegacyState(next,KEY,guard);
  }catch(error){if(saveEpoch.current===epoch){setStorageError(true);setSaveIssue(error instanceof Error?error.message:'恢复未保存，本次输入仍保留。');setSaveRetry(n=>n+1)}throw error;}
  options.onCommitted?.(next);
  if(!unchanged())throw Error('保存期间学习记录已更新，请保留当前输入并重新核对。');
  let validStored=true;
  if(options.rollbackTo?.raw!==undefined&&options.rollbackTo.raw!==null)try{validStored=validateState(JSON.parse(options.rollbackTo.raw))}catch{validStored=false}
  let storedBase=next;
  if(options.rollbackTo){storedBase=initial;if(options.rollbackTo.raw!==null)try{const value=JSON.parse(options.rollbackTo.raw);if(validateState(value))storedBase=value}catch{}}
  const absentRollback=options.rollbackTo?.raw===null;
  editBase.current=storedBase;stateRef.current=next;setState(next);setPersisted(next);setStorageError(!validStored||absentRollback);setStorageBlocked(!validStored);setSaveIssue(absentRollback?'已回退到尚未保存的本机状态。当前页面内容仍可备份；继续编辑后会重新保存。':'');return next;
 }
 const saveStatus=!ready?'读取中':storageError||storageBlocked?'尚未自动保存':persisted===state?'本机已保存':'正在保存';
 function go(v:string){if(ONLINE&&v==='roadmap'){location.href=mapHref(mapState,route.book,route.lesson);return}navigate({view:v});setSearch('');setStage('all')}
 function openLesson(id:number){setState(s=>({...s,lastLesson:id}));navigate({view:'lesson',lesson:id})}
 useEffect(()=>{const ctx=(document as any).modelContext;if(!ctx?.registerTool)return;const a=new AbortController();for(const t of [{name:'read_learning_progress',title:'读取学习进度',description:'Read locally saved completed units and mistake counts.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({completed:stateRef.current.completed,lastLesson:stateRef.current.lastLesson,mistakes:Object.keys(stateRef.current.mistakes).length})},{name:'open_learning_unit',title:'打开课程',description:'Navigate to an original unit without marking it complete.',inputSchema:{type:'object',properties:{unit:{type:'integer',minimum:1,maximum:36}},required:['unit'],additionalProperties:false},annotations:{readOnlyHint:false},execute:(x:any)=>{if(!Number.isInteger(x?.unit)||x.unit<1||x.unit>36)throw Error('unit must be 1–36');openLesson(x.unit);return {openedUnit:x.unit}}}]){try{Promise.resolve(ctx.registerTool(t,{signal:a.signal})).catch(()=>{})}catch{}}return()=>a.abort()},[]);
 function touch(s:State){return [...new Set([...s.days,day()])]}
 function addWord(w:Word){return addPersonalWord({...w,sources:w.sources||[{kind:'reserve',...(view==='lesson'?{lesson:lessonId}:{})}]})}
 function addPersonalWord(w:Word){try{const sources=w.sources?.length?w.sources:route.book&&route.lesson?[{kind:'nce' as const,book:route.book,lesson:route.lesson}]:[{kind:'personal' as const}];const before=stateRef.current,next=enrollFlashcard(before,w,sources);if(next!==before){stateRef.current=next;setState(next)}toast.success(next===before?'这个词义已在复习中':'已加入闪卡，保留已有释义并合并来源');return true}catch(e){toast.error(e instanceof Error?e.message:'加词未完成，请重试');return false}}
 function answer(q:Question,ok:boolean){setState(s=>{const mistakes={...s.mistakes};if(ok)delete mistakes[q.id];else mistakes[q.id]=q;return {...s,mistakes,attempts:s.attempts+1,correct:s.correct+(ok?1:0),days:touch(s)}})}
 function finish(score:number,id?:number){setState(s=>({...s,scores:{...s.scores,[id?'unit-'+id:quizMode]:Math.max(s.scores[id?'unit-'+id:quizMode]||0,score)},completed:id&&score>=75?[...new Set([...s.completed,id])]:s.completed,days:touch(s)}));if(id&&score>=75)toast.success('本课已完成，继续保持！')}
 const quizMode=route.task==='mistakes'?'mistakes':'diagnostic',quizItems=quizMode==='mistakes'?Object.values(state.mistakes):lessons.filter((_,i)=>i%3===0).map(l=>l.exercises[1]);
 function startQuiz(mode:string){navigate({view:'quiz',task:mode})}
 const lesson=lessons.find(l=>l.id===lessonId)||lessons[0],last=(ONLINE?unitById(continueNode(mapState).id):undefined)||state.nceLast||{book:'NCE1' as const,lesson:1};
 const dueCount=flashcardSummary(state,Date.now()).due;
 const filteredLessons=lessons.filter(l=>(stage==='all'||l.level===stage)&&`${l.id} ${l.title} ${l.subtitle} ${l.grammar.title}`.toLowerCase().includes(search.toLowerCase()));
 const streak=useMemo(()=>{let n=0;const d=new Date();if(!state.days.includes(d.toLocaleDateString('en-CA')))d.setDate(d.getDate()-1);while(state.days.includes(d.toLocaleDateString('en-CA'))){n++;d.setDate(d.getDate()-1)}return n},[state.days]);

 if(!lessons.length)return <main className="loading">正在准备课程…</main>;
 return <WordLookupProvider onAdd={addPersonalWord}><SidebarProvider>{!ONLINE&&<SideNav view={view} go={go} state={state}/>}<div className={"main-shell"+(ONLINE?" studio-classic":"")}>{ONLINE?<StudioHeader active={studioSection(view)} mapUrl={mapHref(mapState)} reference={route.book&&route.lesson?{book:route.book,lesson:route.lesson}:unitById(continueNode(mapState).id)||state.nceLast} actions={<ProgressSave state={state} ready={ready} status={saveStatus} captureRestore={captureProgressRestore} restore={restoreProgress}/>}/>:<header className="topbar"><div className="row"><SidebarTrigger className="mobile-menu" aria-label="打开导航菜单"/><span className="breadcrumb"><span className="breadcrumb-root">学习空间</span><ChevronRight size={14}/> {view==='nce'&&route.book&&route.lesson?<button className="text-btn topbar-route-location" aria-label="在路线图中查看当前位置" onClick={()=>navigate({view:'roadmap',book:route.book,lesson:route.lesson,goal:route.goal})}>第 {route.lesson} 课 · {roadmapSteps.find(s=>s.id===roadmapActiveStep(route,state))?.label}</button>:navs.find(n=>n[0]===view)?.[1]||({roadmap:'学习路线图',nce:'新概念课程',words:'教材词汇',grammar:'语法与句型',ielts:'雅思训练',progress:'学习记录',cloud:'新概念 · 整册资料',courses:'备用练习素材',lesson:'备用素材学习',quiz:'练习中心',materials:'我的课文'} as any)[view]}</span></div><div className="row"><span className="local-status" role="status"><span/>{saveStatus}</span><button className="text-btn learning-record-link" onClick={()=>go('progress')} aria-label="打开学习记录"><ChartNoAxesCombined size={17}/><span>记录</span></button><ProgressSave state={state} ready={ready} status={saveStatus} captureRestore={captureProgressRestore} restore={restoreProgress}/></div></header>}<main className="workspace" id="main">{storageMode==='legacy'&&<div className="notice">此浏览器暂不支持大容量本地资料库，当前仅保存文字记录。需要持久音频时，请使用本地版压缩包里的启动器打开。</div>}{storageError&&<div role="alert" className="notice">本机存储不可用或原记录需要检查。当前学习仍可继续，请用顶部「保存进度」保留当前页面的学习记录；当前更改尚未自动保存。</div>}{saveIssue&&<div className="notice" role="alert"><p>{saveIssue}</p><button className="btn secondary" onClick={()=>void readLatestProgress()}>已备份，读取最新保存记录</button></div>}{!ready&&<div className="notice">正在读取本机学习记录…</div>}
 {ready&&!ONLINE&&<BlueprintPosition state={state}/>}
 {ONLINE&&['nce','cloud','ielts','courses','materials'].includes(view)&&!(view==='ielts'&&route.tab==='course')&&<a className="studio-learning-back" href="/map/#/courses">← 学习 · 找课</a>}
 {ONLINE&&view==='nce'&&mapUnitId(route.book,route.lesson)&&<MapConnection view="course" book={route.book} lesson={route.lesson}/>}
 {ONLINE&&view==='cloud'&&<button className="text-btn nce-back" onClick={()=>go('nce')}>返回新概念四册目录</button>}
 {ONLINE&&<SiteMaterials startAt={materialStart} visible={view==='cloud'} state={state} commitCollection={commitMaterialCollection} restore={incoming=>{setState(s=>prepareFlashcardRestore(s,incoming,courseWords));setStorageError(false);setStorageBlocked(false)}} openLesson={(book,lesson)=>navigate({view:'nce',book,lesson,tab:'listen'})}/>}
 {(view==='nce'||view==='library')&&<>{view==='library'&&<nav className="course-resources" aria-label="课程资料与专项"><button onClick={()=>go('grammar')}>语法与句型检索</button><button onClick={()=>go('words')}>教材词汇索引</button><button onClick={()=>go('ielts')}>雅思专项</button><details className="course-more"><summary>更多资料</summary><button onClick={()=>go('courses')}>备用练习素材</button><button onClick={()=>go('cloud')}>整册资料与下载</button></details></nav>}<NceStudio commitCollection={commitMaterialCollection} goCloud={(book,lesson)=>navigate({view:'cloud',book,lesson})} state={state} update={setState} addWord={addPersonalWord} onAnswer={answer} goIELTS={()=>go('ielts')}/></>}
 {view==='roadmap'&&ready&&<LearningRoadmap state={state} update={setState}/>}
 {(view==='today'||view==='review')&&<TodayPracticeQueue state={state} map={mapState} ready={ready} online={ONLINE} error={mapError}/> }

 {view==='courses'&&<><PageTitle eyebrow="EXTRA PRACTICE" title="需要时，再来练一练。" text="36 个原创单元作为备用素材，不需要另学一套课程。听读优先使用新概念原声；这里的语音为设备合成。"/><div className="filter-bar"><Tabs value={stage} onValueChange={setStage}><TabsList>{['all','基础起步','表达进阶','雅思衔接'].map(v=><TabsTrigger key={v} value={v}>{v==='all'?'全部课程':v}</TabsTrigger>)}</TabsList></Tabs><SearchField value={search} onChange={setSearch} placeholder="搜索课程或语法"/></div><div className="course-grid">{filteredLessons.map(l=><button className="course-card" key={l.id} onClick={()=>openLesson(l.id)}><div className="section-top"><span className="unit-label">UNIT {String(l.id).padStart(2,'0')}</span>{state.completed.includes(l.id)?<span className="completed"><Check size={14}/>已完成</span>:<span className="muted small">{l.level}</span>}</div><h3>{l.title}</h3><p className="course-sub" lang="en">{l.subtitle}</p><p className="muted small">{l.grammar.title}</p><div className="course-bottom"><span>8 个词汇 · 8 道练习</span><ArrowRight size={17}/></div></button>)}</div>{!filteredLessons.length&&<div className="empty">没有找到相关课程，换个关键词试试。</div>}<div className="notice row spread"><p>沿着新概念主线继续学习，遇到卡点时再回来。</p><button className="btn secondary" onClick={()=>go('nce')}>返回新概念</button></div></>}
 {view==='lesson'&&<LessonView key={lesson.id} lesson={lesson} state={state} addWord={addWord} onAnswer={answer} onFinish={score=>finish(score,lesson.id)} onNext={()=>lesson.id===36?go('courses'):openLesson(lesson.id+1)}/>}
 {view==='quiz'&&<><PageTitle eyebrow="PRACTICE ROOM" title={quizMode==='mistakes'?'把错题，变成会的题。':'12 题基础诊断'} text={quizMode==='mistakes'?'答对后移出错题本；记录保存在当前浏览器。':'覆盖三个阶段的语法要点，仅用于发现薄弱项，不是雅思估分。'}/><section className="panel narrow"><Quiz key={quizMode} questions={quizItems} onAnswer={answer} onFinish={score=>finish(score)}/></section></>}
 {view==='words'&&<>
  <PageTitle eyebrow="NEW CONCEPT ENGLISH · VOCABULARY" title="单词" text="在例句里理解，在回想中记住。按课查找，或继续复习。"/>
  <nav className="vocabulary-tabs" aria-label="词汇学习方式">{[['book','按课词表'],['index','单词索引'],['review','生词复习']].map(([id,label])=><button key={id} className={(route.tab||'book')===id?'active':''} aria-current={(route.tab||'book')===id?'page':undefined} onClick={()=>navigate(id==='review'?{view:'words',book:route.book,lesson:route.lesson,tab:'review'}:id==='book'?{view:'words',book:route.book||last.book,lesson:route.lesson||(route.book&&route.book!==last.book?1:last.lesson),tab:id}:{view:'words',tab:id})}>{label}{id==='review'&&dueCount>0?` · ${dueCount}`:''}</button>)}</nav>
  {route.tab!=='review'?<TextbookVocabularyBrowser state={state} currentCourse={last} onAdd={addPersonalWord}/>:<>
   <FlashcardReview state={state} update={setState} ready={ready} onAdd={addPersonalWord} onSelectWords={()=>navigate({view:ONLINE?'words':'nce',book:last.book,lesson:last.lesson,tab:ONLINE?'book':'listen'})}/>
   <details className="panel section-space"><summary>需要加词时，查看当前课词表</summary><CurrentCourseVocabulary state={state} currentCourse={last}/></details>
   <ReserveVocabulary words={courseWords} cards={state.cards} isEnrolled={w=>isFlashcardEnrolled(state,w)} addWord={addWord}/>
  </>}
 </>}

 {view==='grammar'&&ready&&<GrammarWorkspace state={state} update={setState}/>}
 {view==='ielts'&&(route.tab==='course'?<IELTSSampleWorkspace state={state} update={setState} ready={ready} task={route.task} onTargetOpened={()=>navigate({view:'ielts',tab:'course'},{replace:true,keepScroll:true})}/>:<IELTS data={ieltsData} drafts={state.drafts} saveDraft={(id,text)=>setState(s=>({...s,drafts:{...s.drafts,[id]:text}}))} onAnswer={answer} onFinish={(id,score)=>setState(s=>({...s,scores:{...s.scores,[id]:score},days:touch(s)}))}/>)}
 {view==='progress'&&<><PageTitle eyebrow="YOUR LEARNING RECORD" title="每一步，都算数。" text={ONLINE?"教材由网站直接提供；学习进度保存在当前浏览器。":"全程本地运行。学习记录与已保存音频保存在当前浏览器。"}/>{ONLINE&&<MapConnection view="records"/>}<details className="panel reserve-materials"><summary>旧版路线记录</summary><JourneyRecords state={state}/><button className="text-btn" onClick={()=>navigate({view:'roadmap'})}>打开旧版练习路线</button></details><div className="panel nce-progress-summary"><div><h2>新概念四册进度</h2><p className="muted">{nceCompleted(state)} / 276 组完成训练 · {Object.keys(state.flashcards?.notes||{}).length||state.personalWords?.length||0} 个词条</p></div><button className="btn secondary" onClick={()=>go('nce')}>返回四册学习 <ArrowRight size={16}/></button></div><LearningRecords state={state} map={ONLINE?mapState:undefined} mapError={mapError}/><ExpressionCollection drafts={state.drafts}/><details className="panel progress-panel reserve-materials"><summary>备用素材进度 · {state.completed.length} / 36 <ChevronRight size={17}/></summary><Progress value={state.completed.length/36*100}/><div className="unit-dots">{lessons.map(l=><button key={l.id} className={state.completed.includes(l.id)?'done':''} onClick={()=>openLesson(l.id)} aria-label={`打开第${l.id}单元${state.completed.includes(l.id)?'，已完成':''}`}>{l.id}</button>)}</div><p className="muted">完成标准：本课练习至少答对 6 / 8 题。</p></details><div className="two-col section-space"><section className="panel"><h2>学习记录</h2><div className="record-row"><span>练习活跃天数</span><strong>{state.days.length} 天</strong></div><div className="record-row"><span>常规练习累计答题</span><strong>{state.attempts} 题</strong></div><div className="record-row"><span>常规练习累计答对</span><strong>{state.correct} 题</strong></div><div className="record-row"><span>待巩固错题</span><strong>{Object.keys(state.mistakes).length} 题</strong></div><button className="btn secondary full" onClick={()=>startQuiz('mistakes')}>重做错题 <ArrowRight size={17}/></button></section><section className="panel"><h2>本机学习记录</h2><p className="muted">进度、笔记和生词保存在当前浏览器，暂不自动跨设备同步。跟读录音仅在本次练习中保留。</p>{state.custom.length>0&&<button className="text-btn" onClick={()=>go('materials')}><FolderOpen size={17}/>查看已保存课文（{state.custom.length}）</button>}</section></div><section className="panel section-space"><h2>关于课程与考试</h2><p>「句句有进步」是独立英语学习工具，未获新概念英语或 IELTS 官方认证。{ONLINE?'网站教材按实际清单提供；扫描 PDF 未自动识别正文，逐句听读采用配套 LRC，英音缺项会明确显示。':'本地版未预装四册教材，可继续使用本机已有课文和音频。'}语法与句型按教材课次组织，讲解、例句与随手练习由本站编写；原书作为参考，分类名称是本站整理的检索标签。36 个备用单元为原创素材。已保存的个人课文仍可阅读与跟读。</p><p>基础课程与少量专项训练不等于完整雅思备考，也不能据此保证分数。朗读使用设备合成语音；口语录音与写作检查用于自评，不提供自动雅思评分。</p><details className="nce-license"><summary>来源与开源许可</summary><p>点读入口与目录配置来自 <span>finnlyu41-tech/nce</span>。本地版不请求原仓库中的远程资源；本机已有字幕请对照原书。</p><pre>{nceAttribution.license}</pre></details></section></>}
 {view==='materials'&&<><PageTitle eyebrow="YOUR OWN TEXTS" title="已保存的课文" text="继续阅读和跟读此前保存在当前浏览器的课文。"/><div className="materials-grid section-space"><div className="panel material-list">{state.custom.length?state.custom.map(c=><button key={c.id} className={customActive===c.id?'selected':''} onClick={()=>setCustomActive(c.id)}><BookOpen size={17}/>{c.title}<ChevronRight size={16}/></button>):<div className="empty"><BookOpen size={30}/><p>没有已保存的课文</p></div>}</div><div className="panel">{(()=>{const c=state.custom.find(x=>x.id===customActive)||state.custom[0];return c?<><div className="section-top"><h2>{c.title}</h2></div><div className="row wrap"><p className="muted">点击右侧听单句，再跟读。含中文的行会只朗读其中的英文。</p><PlaybackSpeed ariaLabel="自备课文语速"/></div>{c.text.split('\n').filter(x=>x.trim()).map((line,i)=><div className="custom-line" key={i}><p>{line}</p><button className="icon-btn" aria-label={'朗读自备课文第'+(i+1)+'行'} onClick={()=>speak(line.replace(/[^\x00-\x7F]/g,' ').trim())}><Volume2 size={18}/></button></div>)}<Recorder/></>:<div className="empty"><h3>从四册课程开始学习</h3><button className="btn" onClick={()=>go('nce')}>打开新概念课程 <ArrowRight size={16}/></button></div>})()}</div></div></>}
 {!ONLINE&&<nav className={'phone-nav '+(view==='nce'&&route.lesson?'in-lesson':'')} aria-label="手机快捷导航">{navs.map(([id,label,Icon])=>{const NavIcon=Icon as typeof BookOpen;return <button key={id as string} className={activeNav(view)===id?'active':''} aria-current={activeNav(view)===id?'page':undefined} onClick={()=>go(id as string)}><NavIcon size={20}/><span>{label as string}</span></button>})}</nav>}<footer className="footer"><span>句句有进步 · English Studio</span><span>{ONLINE?"独立在线版 · 原书听读 · 语法讲解":"完全本地运行 · 语法讲解 · 无云端上传"}</span></footer></main></div><Toaster position="top-center" richColors/></SidebarProvider></WordLookupProvider>
}
function PageTitle({eyebrow,title,text}:{eyebrow:string,title:string,text:string}){return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{text}</p></div></div>}
function SearchField({value,onChange,placeholder}:{value:string,onChange:(s:string)=>void,placeholder:string}){return <label className="search"><Search size={18}/><input aria-label={placeholder} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}/></label>}

function CurrentCourseVocabulary({state,currentCourse}:{state:State;currentCourse?:{book:NceBookId;lesson:number}}){
 const {book,lesson}=currentCourse||state.nceLast||{book:'NCE1' as const,lesson:1},unit=studyUnit(book,lesson);
 const [loaded,setLoaded]=useState<LessonLanguage|null>(null);
 useEffect(()=>{let active=true;setLoaded(null);void loadLessonLanguage(book,unit.first).then(data=>{if(active)setLoaded(data)});return()=>{active=false}},[book,unit.first]);
 const language=loaded?.book===book&&loaded.lesson===unit.first?loaded:null;
 const text=state.nce?.[unit.key]?.text||(language?rowsToText(language.rows):'');
 return <section className="panel current-course-vocabulary"><div className="section-top"><h2>{ONLINE?'当前课程词表':'当前课程词句'}</h2><BookOpen size={21}/></div><p className="muted">{bookNames[book]} · 第 {lesson} 课</p><TextbookVocabulary key={`${book}-${lesson}`} book={book} lesson={lesson} text={text}/><button className="text-btn" onClick={()=>navigate({view:ONLINE?'words':'nce',book,lesson,tab:ONLINE?'book':'listen'})}>{ONLINE?'打开本课词表':'回到本课听读'} <ArrowRight size={17}/></button></section>;
}
function ReserveVocabulary({words,cards,addWord,isEnrolled}:{words:Word[];cards:State['cards'];addWord:(w:Word)=>void;isEnrolled?:(w:Word)=>boolean}){
 const [open,setOpen]=useState(false),[query,setQuery]=useState('');
 const filtered=words.filter(w=>(w.word+' '+w.meaning).toLowerCase().includes(query.toLowerCase()));
 return <details className="panel reserve-materials" open={open} onToggle={event=>setOpen(event.currentTarget.open)}><summary>备用素材词汇 · {words.length} <ChevronRight size={17}/></summary><p className="muted small">来自 36 个原创备用单元；已加入的词卡继续按原计划复习。个人生词在上方单独显示。</p>{open&&<><div className="section-top section-space"><SearchField value={query} onChange={setQuery} placeholder="搜索备用素材词汇"/></div><div className="word-grid">{filtered.map(w=><WordCard key={w.word} word={w} enrolled={isEnrolled?isEnrolled(w):!!cards[w.word.toLowerCase()]} onAdd={()=>addWord(w)}/>)}</div>{!filtered.length&&<p className="empty">没有找到相关备用词汇，换个关键词试试。</p>}</>}</details>;
}
