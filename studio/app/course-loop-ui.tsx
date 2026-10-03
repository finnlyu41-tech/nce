/* eslint-disable @next/next/no-html-link-for-pages -- This component runs in the static map app; /#/progress opens its separate existing workspace. */
import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {isRegisteredCourse} from '../course-loop/registry.mjs';
import type {Action} from '../course-loop/host-contract';
import {CourseRead,LoopInputs,LoopView,commitCourseLoop,courseLoopFor,parseCourseLoop,parseLoopInputs,readCourseLoop} from './course-loop-progress';
import {loadLessonLanguage,type LessonLanguage} from './language';
import {splitLesson} from './lesson-structure';
import {SentenceIllustration} from './sentence-illustration-ui';
import {ClipButton,StopAudio} from '../map/media';
import {LessonReader} from '../map/lesson-reader';
import type {State} from './model';
import type {Progress} from '../map/model';
import {courseContinuation} from './course-loop-next';
import {miniTaskForCourseExit} from '../mini-task/adapter';
import './course-loop.css';
import {CourseAnswerFeedback as Attempt,CourseAnswerHistory} from './course-loop-learning-ui';
import {CourseVideoHelp} from '../course-video/ui';
import {courseVideoManifest} from '../course-video/sources';
import {canShowVideo} from '../course-video/manifest';

type Operation={action?:Action;input?:{id:string;field:'answer'|'note';value:string};resolve?:(saved:boolean)=>void};
const labels:Record<string,string>={diagnostic:'1 · 先尝试',learn:'2 · 针对性学习',guided:'2 · 跟着试',independent:'3 · 收起示范，换情境',feedback:'4 · 订正与再练',repair:'4 · 换题再试',own:'4 · 用在自己身上',waiting:'5 · 等到期再回想','review-a':'5 · 到期的新题 A','review-b':'5 · 到期的新题 B','review-feedback':'5 · 本次复习反馈'};
const questionIdentity=(v:LoopView)=>`${v.phase}:${v.index}:${v.exposures.length}`;
const time=(at:number)=>new Date(at).toLocaleString('zh-CN',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'});

/** The pilot owns only two entries in the existing State.drafts. Its inputs
 * queue through the guarded writer; no new lesson appears before confirmation. */
type WorkspaceProps={continueRoute:(confirmed:State)=>void;onLeaveGuard:(guard:(()=>Promise<boolean>)|null)=>void;map:Progress;courseId?:string;onMiniTask?:(confirmed:State,courseId:string)=>void};
export function CourseLoopWorkspace(props:WorkspaceProps){
 const courseId=props.courseId||'nce1-1';
 if(!isRegisteredCourse(courseId))return <section role="alert"><p>课程尚未注册，原始记录保留。请先打开记录页备份核对。</p><a href="/#/progress">打开记录与整站备份</a></section>;
 return <BoundCourseLoopWorkspace key={courseId} {...props} courseId={courseId}/>;
}
function BoundCourseLoopWorkspace({continueRoute,onLeaveGuard,map,courseId='nce1-1',onMiniTask}:WorkspaceProps){
 const {lesson,model:loopModel}=courseLoopFor(courseId);
 const [confirmedState,setConfirmedState]=useState<State|null>(null);
 const [view,setView]=useState<LoopView|null>(null),[draft,setDraft]=useState(''),[own,setOwn]=useState('');
 const [inputs,setInputs]=useState<LoopInputs>({version:1,corrections:{}}),[busy,setBusy]=useState(false),[reading,setReading]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[blocked,setBlocked]=useState(false);
 const [source,setSource]=useState<'text'|'audio'|'comic'|'reader'|null>(null),[clock,setClock]=useState(()=>Date.now()),[exported,setExported]=useState(false);
 const readRef=useRef<CourseRead|null>(null),viewRef=useRef<LoopView|null>(null),inputsRef=useRef<LoopInputs>(inputs),ops=useRef<Operation[]>([]),working=useRef(false),failed=useRef(false),alive=useRef(true),epoch=useRef(0);
 const draftRef=useRef(draft),ownRef=useRef(own),title=useRef<HTMLHeadingElement>(null),inputRevision=useRef(0),loading=useRef(false);
 const flushRef=useRef<()=>Promise<boolean>>(async()=>false);
 const videoGuard=useRef<(()=>Promise<boolean>)|null>(null);
 const bindVideoGuard=useCallback((guard:(()=>Promise<boolean>)|null)=>{videoGuard.current=guard},[]);
 useLayoutEffect(()=>{draftRef.current=draft;ownRef.current=own;inputsRef.current=inputs},[draft,own,inputs]);
 function apply(read:CourseRead,reset=false){
  if(read.raw===null)throw Error('本课尚未保存。');
  const result=parseCourseLoop(read.raw,Date.now(),courseId);if(!result.ok)throw Error(result.message);
  const changed=reset||!viewRef.current||questionIdentity(viewRef.current)!==questionIdentity(result.view);
  readRef.current=read;setConfirmedState(read.state);viewRef.current=result.view;setView(result.view);setClock(Date.now());
  if(reset){const restored=parseLoopInputs(read.inputsRaw,courseId);inputsRef.current=restored;setInputs(restored);setOwn(result.view.ownDraft)}
  if(changed){setDraft(result.view.draft);setSource(null);requestAnimationFrame(()=>title.current?.focus({preventScroll:true}))}
 }
 async function drain(){
  if(working.current||failed.current||!alive.current)return;
  working.current=true;setBusy(true);const generation=epoch.current;
  try{
   while(ops.current.length&&alive.current&&epoch.current===generation){
    const operation=ops.current[0],read=readRef.current;if(!read)throw Error('课程记录还没有读完。');
    const restored=read.raw===null?{ok:true as const,state:loopModel.initialState(),view:null}:parseCourseLoop(read.raw,Date.now(),courseId);
    if(!restored.ok)throw Error(restored.message);
    const next=operation.action?loopModel.transition(restored.state,operation.action):restored;
    if(!next.ok){ops.current.shift();operation.resolve?.(false);setNotice(next.message);continue}
    let nextInputs=parseLoopInputs(read.inputsRaw,courseId);
    if(operation.input){const {id,field,value}=operation.input;nextInputs={version:1,corrections:{...nextInputs.corrections,[id]:{...(nextInputs.corrections[id]||{answer:'',note:''}),[field]:value}}}}
    const confirmed=await commitCourseLoop(read,JSON.stringify(next.state),nextInputs,()=>alive.current&&epoch.current===generation,courseId);
    if(!alive.current||epoch.current!==generation)return;
    apply(confirmed);ops.current.shift();operation.resolve?.(true);
   }
  }catch(cause){if(alive.current&&epoch.current===generation){failed.current=true;setError(cause instanceof Error?cause.message:'本次保存未完成，输入仍保留。');ops.current[0]?.resolve?.(false);setExported(false)}}
  finally{working.current=false;if(alive.current)setBusy(false)}
 }
 async function send(action?:Action,input?:Operation['input']):Promise<boolean>{
  if(action&&['next','finish','review'].includes(action.type)&&videoGuard.current&&!await videoGuard.current()){setNotice('视频笔记尚未保存，请先重试或备份笔记。');return false}
  inputRevision.current++;
  return new Promise(resolve=>{
   const edit=!!input||action?.type==='draft'||action?.type==='own-draft';
   if(blocked||loading.current||failed.current&&!edit){resolve(false);return}
   setNotice('');ops.current.push({action,input,resolve});
   if(edit)setExported(false);
   // Typing after a failed save remains queued and exportable. A retry must
   // confirm all these edits before Submit can record a first answer.
   if(failed.current)resolve(false);else void drain();
  });
 }
 async function load(){
  const generation=++epoch.current,revision=inputRevision.current;loading.current=true;setReading(true);setBusy(true);setError('');setSource(null);
  try{
   const read=await readCourseLoop(courseId);if(!alive.current||generation!==epoch.current)return;
   if(inputRevision.current!==revision)throw Error('读取期间本页有新的输入，内容仍保留。先保存未提交内容，再重新读取。');
   if(read.raw!==null){const parsed=parseCourseLoop(read.raw,Date.now(),courseId);if(!parsed.ok)throw Error(parsed.message);parseLoopInputs(read.inputsRaw,courseId);apply(read,true)}
   else{parseLoopInputs(read.inputsRaw,courseId);readRef.current=read;ops.current.push({});failed.current=false;await drain();if(!failed.current&&readRef.current?.raw)apply(readRef.current,true)}
   setBlocked(false);
  }catch(cause){if(alive.current&&generation===epoch.current){setBlocked(true);failed.current=true;setError(cause instanceof Error?cause.message:'课程记录暂时不能读取。原文仍保留。')}}
  finally{loading.current=false;if(alive.current){setBusy(false);setReading(false)}}
 }
 useEffect(()=>{alive.current=true;
  // The mount read is an external-store synchronization, not derived render state.
  void Promise.resolve().then(load);const tick=setInterval(()=>setClock(Date.now()),30000);
  const focus=()=>{setClock(Date.now());if(!working.current&&!ops.current.length&&!failed.current&&!loading.current){const generation=epoch.current,expected=readRef.current,revision=inputRevision.current;
   void readCourseLoop(courseId).then(read=>{if(alive.current&&epoch.current===generation&&readRef.current===expected&&inputRevision.current===revision&&!working.current&&!ops.current.length&&!failed.current&&!loading.current){if(read.raw!==expected?.raw||read.inputsRaw!==expected?.inputsRaw)apply(read,true);else if(read.storage.raw!==expected?.storage.raw){readRef.current=read;setConfirmedState(read.state);setClock(Date.now())}}}).catch(cause=>{if(alive.current&&epoch.current===generation&&inputRevision.current===revision)setError(String(cause))})}};
  window.addEventListener('focus',focus);window.addEventListener('pageshow',focus);window.addEventListener('english-studio-progress-restored',focus);
  async function flush(){
   if(!viewRef.current&&!ops.current.length)return true;
   const deadline=Date.now()+5000;
   while(alive.current&&(working.current||ops.current.length)&&!failed.current&&Date.now()<deadline){if(!working.current)void drain();await new Promise(resolve=>setTimeout(resolve,20))}
   return !working.current&&!ops.current.length&&!failed.current&&!loading.current;
  }
  const flushAll=async()=> (!videoGuard.current||await videoGuard.current())&&await flush();
  flushRef.current=flushAll;onLeaveGuard(flushAll);
  const unload=(event:BeforeUnloadEvent)=>{if(working.current||ops.current.length){event.preventDefault();event.returnValue=''}};
  window.addEventListener('beforeunload',unload);
  return()=>{alive.current=false;flushRef.current=async()=>false;onLeaveGuard(null);clearInterval(tick);window.removeEventListener('beforeunload',unload);window.removeEventListener('focus',focus);window.removeEventListener('pageshow',focus);window.removeEventListener('english-studio-progress-restored',focus)};
 // This controller owns one component lifetime. All changing data is re-read
 // through transaction refs; re-running it would reset pending operations.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 const identity=view?questionIdentity(view):'';
 const continuation=readRef.current?courseContinuation(readRef.current.state,map,courseId,clock):null;
 async function continueSavedCourse(openMini=false){
  if(videoGuard.current&&!await videoGuard.current()){setNotice('视频笔记尚未保存，请先重试或备份笔记。');return}
  if(!await flushRef.current()){setError('本课输入还没有保存。请先保存未提交内容，再离开本课。');return}
  const expected=readRef.current,revision=inputRevision.current,generation=epoch.current;
  try{
   const confirmed=await readCourseLoop(courseId);
   if(!expected||!alive.current||epoch.current!==generation||inputRevision.current!==revision||working.current||ops.current.length||confirmed.raw!==expected.raw||confirmed.inputsRaw!==expected.inputsRaw){setError('本课记录已更新，请先核对最新记录再继续。');return}
   readRef.current=confirmed;
   if(openMini&&onMiniTask&&miniTaskForCourseExit(confirmed.state,courseId,Date.now()))onMiniTask(confirmed.state,courseId);else continueRoute(confirmed.state);
  }catch(cause){setError(cause instanceof Error?cause.message:'本课记录暂时不能确认，请先备份核对。')}

 }
 function exportPending(){
  const payload={kind:'english-studio-unsaved-course-input',version:1,savedRaw:readRef.current?.raw??null,savedInputsRaw:readRef.current?.inputsRaw??null,draft:draftRef.current,ownDraft:ownRef.current,corrections:inputsRef.current,queued:ops.current.map(({action,input})=>({action,input}))};
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='English-Studio-unsubmitted-course-input.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setExported(true);
 }
 async function openSpeaking(){
  if(!await flushRef.current()){setError('本课输入还没有保存。请先保存未提交内容，再离开本课。');return}
  location.assign(new URL(`#/learn/${courseId}?speaking=practice`,location.href).href);
 }
 async function showSource(kind:'text'|'audio'|'comic'|'reader'){
  const start=viewRef.current?questionIdentity(viewRef.current):'';
  const kinds=kind==='reader'?['text','audio','comic'] as const:[kind];
  for(const item of kinds)if(!await send({type:'source',source:item}))return;
  if(viewRef.current&&questionIdentity(viewRef.current)===start)setSource(kind);
 }
 const successorLesson=continuation&&!continuation.currentRoute&&isRegisteredCourse(continuation.node.id)?courseLoopFor(continuation.node.id).lesson:null;
 const disabled=busy||!!error||blocked;
 const q=view?loopModel.currentQuestion(view):null;
 const attempt=q&&view?view.attempts.find(a=>a.id===q.id&&a.exposure===view.exposures.filter(e=>e.id===q.id).length):null;
 return <section className="course-loop" aria-label={`第 ${lesson.lessons[0]}–${lesson.lessons[1]} 课连续练习`} data-course={courseId} data-phase={view?.phase||'loading'}>
  <div className="course-loop-status" role="status">{blocked?'已保留原始记录':busy?'正在保存本次输入…':error?'尚未保存，输入仍在本页':'进度已保存'}</div>
  {notice&&<p role="alert">{notice}</p>}
  {error&&<div className="course-loop-error" role="alert"><p>{error}</p><button type="button" onClick={exportPending}>保存未提交内容</button>{!blocked&&<button type="button" disabled={busy} onClick={()=>{failed.current=false;setError('');void drain()}}>重试保存</button>}<button type="button" disabled={busy||!exported&&!blocked} onClick={()=>{ops.current=[];failed.current=false;setExported(false);void load()}}>读取最新记录</button><a href="/#/progress">打开记录与整站备份</a></div>}
  {!view?<p>正在核对本课记录，核对完成后才显示第一题。</p>:<>
   <StopAudio key={`${identity}:${source||'closed'}`}/>
   <p className="course-loop-step">{labels[view.phase]}</p>
   <section className="course-loop-card">
    {q?<>
     <p className="course-loop-position">第 {view.index+1} / 3 题 · {view.phase==='guided'||view.hinted?'使用帮助':'先独立尝试'}</p><p>{q.context}</p><h2 ref={title} tabIndex={-1}>{q.prompt}</h2>
     {(view.phase==='guided'||view.hinted)&&<div className="course-loop-help">{lesson.teaching.filter(t=>t.target===q.target).map(t=><div key={t.target}><p>{t.check}</p><p lang="en">{t.example}</p><p>{t.explanation}</p></div>)}</div>}
     {q.kind==='choice'?<div className="course-loop-choices" role="group" aria-label="你的回答">{q.options?.map(option=><button type="button" key={option} aria-pressed={draft===option} disabled={!!attempt||!!error} onClick={()=>{setDraft(option);void send({type:'draft',value:option})}}>{option}</button>)}</div>:<label>你的英文回答<input value={draft} autoComplete="off" spellCheck={false} maxLength={1000} disabled={!!attempt||blocked||reading} onChange={e=>{setDraft(e.target.value);void send({type:'draft',value:e.target.value})}}/></label>}
     {attempt?<><p role="status" className="course-loop-submission-feedback">{['diagnostic','independent'].includes(view.phase)?(view.index<2?'已保存，继续下一题。':'已保存，接着看反馈。'):`${attempt.correct?'本次与目标句一致。':'本次需要修补。'} 参考：${q.accepted[0]} ${q.why}`}</p>{!attempt.correct&&['guided','repair'].includes(view.phase)?<button className="primary" disabled={disabled} onClick={()=>void send({type:'retry'})}>对照后重试</button>:<button className="primary" disabled={disabled} onClick={()=>void send({type:'next'})}>{view.index<2?'下一题':view.phase==='diagnostic'?'看针对性讲解':view.phase==='guided'?'收起示范，自己试':view.phase==='independent'?'看反馈，改一处':view.phase==='repair'?'换成自己的问答':'看本次复习记录'}</button>}</>:<div className="course-loop-actions"><button className="primary" disabled={disabled||!draft.trim()} onClick={()=>void send({type:'submit'})}>提交本题</button>{view.phase!=='guided'&&!view.hinted&&<button disabled={disabled} onClick={()=>void send({type:'help'})}>需要提示</button>}<button disabled={disabled} onClick={()=>void send({type:'not-yet'})}>暂时不会，先记下</button></div>}
    </>:view.phase==='learn'?<><h2 ref={title} tabIndex={-1}>先补本次最需要的一处</h2>{loopModel.teachingFor(view).map(t=><article key={t.target}><h3>{t.title}</h3><p>{t.explanation}</p><p lang="en">{t.example}</p><p>{t.meaning}</p></article>)}<button className="primary" disabled={disabled} onClick={()=>void send({type:'next'})}>跟着换一句</button></>:view.phase==='feedback'?<><h2 ref={title} tabIndex={-1}>看看哪里需要改</h2>{view.attempts.filter(a=>a.stage==='independent').sort((a,b)=>Number(!b.correct||b.hinted)-Number(!a.correct||a.hinted)).map(a=><article key={a.id}><Attempt courseId={courseId} attempt={a} view={view}/>{(!a.correct||a.hinted)&&!view.corrections[a.id]&&<><label>订正句子<input value={inputs.corrections[a.id]?.answer||''} maxLength={1000} disabled={blocked||reading} onChange={e=>{const value=e.target.value;setInputs(s=>({...s,corrections:{...s.corrections,[a.id]:{...(s.corrections[a.id]||{answer:'',note:''}),answer:value}}}));void send(undefined,{id:a.id,field:'answer',value})}}/></label><label>改动说明（用中文也可以）<textarea value={inputs.corrections[a.id]?.note||''} maxLength={1000} disabled={blocked||reading} onChange={e=>{const value=e.target.value;setInputs(s=>({...s,corrections:{...s.corrections,[a.id]:{...(s.corrections[a.id]||{answer:'',note:''}),note:value}}}));void send(undefined,{id:a.id,field:'note',value})}}/></label><button className="course-loop-correction-save" disabled={disabled||!inputs.corrections[a.id]?.answer.trim()||!inputs.corrections[a.id]?.note.trim()} onClick={()=>void send({type:'correct',id:a.id,answer:inputs.corrections[a.id]?.answer||'',note:inputs.corrections[a.id]?.note||''})}>保存订正</button></>}</article>)}<button className="primary" disabled={disabled||view.attempts.some(a=>a.stage==='independent'&&(!a.correct||a.hinted)&&!view.corrections[a.id])} onClick={()=>void send({type:'next'})}>换三个情境，再试一次</button></>:view.phase==='own'?<><h2 ref={title} tabIndex={-1}>写一段自己的问答</h2><p>{lesson.own.prompt}</p><label>自己的文字（可留待以后）<textarea maxLength={2000} disabled={blocked||reading} value={own} onChange={e=>{setOwn(e.target.value);void send({type:'own-draft',value:e.target.value})}}/></label><p>{lesson.own.reviewerPrompt}</p><button className="primary" disabled={disabled} onClick={()=>void send({type:'finish'})}>保存问答，安排复习</button></>:view.phase==='review-feedback'?<><h2 ref={title} tabIndex={-1}>{view.reviewResults.at(-1)?.independent?'本次新题独立完成':'本次仍需修补'}</h2>{view.attempts.filter(a=>a.stage===view.reviewResults.at(-1)?.bank).map(a=><Attempt courseId={courseId} key={a.id} attempt={a} view={view}/>)}<p>这次题目的记录已保存，听力与发音仍未评分。</p><button className="primary" disabled={disabled} onClick={()=>void send({type:'next'})}>查看下一次安排</button></>:<><h2 ref={title} tabIndex={-1}>本轮练习完成</h2><p>下一次复习：{view.dueAt?time(view.dueAt):'尚未安排'}。</p>{loopModel.recommendation(view,clock).kind==='review'?<button className="primary" disabled={disabled} onClick={()=>void send({type:'review'})}>开始到期的新题</button>:loopModel.recommendation(view,clock).kind==='needs-new-material'?<p>本课两组新题已用完，需要补充材料；不会把旧题当作新的迁移。</p>:<p>{continuation?.reason}</p>}<button className={loopModel.recommendation(view,clock).kind==='review'?undefined:'primary'} disabled={disabled} onClick={()=>void continueSavedCourse()}>{continuation&&!continuation.currentRoute?successorLesson?`继续第 ${successorLesson.lessons[0]}–${successorLesson.lessons[1]} 课 · ${continuation.node.title}`:`继续 · ${continuation.node.title}`:continuation?.label||'查看下一步'}</button><p>{view.ownFinal?.status==='awaiting-human-review'?'你的自由问答已保存，待人工核对。':'自由问答可稍后补写。'}</p></>}
   </section>
   {onMiniTask&&['own','waiting'].includes(view.phase)&&confirmedState&&miniTaskForCourseExit(confirmedState,courseId,clock)&&<button disabled={disabled} onClick={()=>void continueSavedCourse(true)}>本组适级雅思式小任务</button>}
   <aside className="course-loop-sources" aria-label="本课教材"><h3>回到原文、原声和漫画</h3><div className="course-loop-actions">{(['text','audio','comic'] as const).map((kind,i)=><button type="button" key={kind} disabled={disabled} aria-expanded={source===kind} onClick={()=>void showSource(kind)}>{['看原文','听本课原声','看本课漫画'][i]}</button>)}{view.phase==='learn'&&<><button disabled={disabled} onClick={()=>void showSource('reader')}>逐句听与看</button><button type="button" disabled={disabled} onClick={()=>void openSpeaking()}>跟读一句，练清楚发音</button></>}</div>{q&&!attempt&&<p className="course-loop-note">作答时查看教材会记为使用帮助。切换到下一题后会收起教材。</p>}{source&&<><button type="button" onClick={()=>setSource(null)}>收起教材</button><SourcePanel key={`${source}:${identity}`} kind={source} courseId={courseId}/></>}</aside>
   {['waiting','review-feedback'].includes(view.phase)&&view.attempts.length>0&&<CourseAnswerHistory courseId={courseId} view={view}/>}
   <CourseVideoHelp courseId={courseId} book={lesson.book} lessons={lesson.lessons} phase={view.phase} manifest={courseVideoManifest} bindGuard={bindVideoGuard} recordHelp={async()=>{const before=viewRef.current;if(!before||!canShowVideo(before.phase))return false;const identity=questionIdentity(before);if(!await send({type:'source',source:'video'}))return false;return !!viewRef.current&&canShowVideo(viewRef.current.phase)&&questionIdentity(viewRef.current)===identity}}/>
   <p className="course-loop-note">{lesson.scope}</p><a className="course-loop-records" href="/#/progress" onClick={e=>{if(disabled){e.preventDefault();setError('请先等输入保存完成；如果保存失败，请先保存未提交内容。')}}}>打开学习记录与整站备份</a>
  </>}
 </section>;
}
function SourcePanel({kind,courseId}:{kind:'text'|'audio'|'comic'|'reader';courseId:string}){
 const {lesson}=courseLoopFor(courseId),first=lesson.lessons[0];
 const [language,setLanguage]=useState<LessonLanguage|null>(null),[failed,setFailed]=useState(false),[retry,setRetry]=useState(0),[line,setLine]=useState(0);
 useEffect(()=>{let alive=true;void loadLessonLanguage(lesson.book,first).then(result=>{if(alive){const valid=!!result&&result.book===lesson.book&&result.lesson===first&&result.sourceSha256===lesson.source.languageSha256;setLanguage(valid?result:null);setFailed(!valid)}});return()=>{alive=false}},[retry,courseId]);
 if(!language)return <p role="status">{failed?<>课文暂时未能加载。<button onClick={()=>setRetry(n=>n+1)}>重试课文</button></>:'正在读取本课教材…'}</p>;
 const rows=splitLesson(language.rows,language.book,true).body;
 if(kind==='reader')return <LessonReader language={language}/>;
 if(kind==='text')return <div className="course-loop-text" aria-label="本课原文">{rows.map((row,i)=><article key={i}><p lang="en">{row.en}</p><p>{row.zh}</p></article>)}</div>;
 if(kind==='audio')return <div className="course-loop-actions"><ClipButton clip={{book:lesson.book,lesson:first,start:rows[0]?.time||0,end:99999}} label="听完整课文"/>{lesson.source.clips.map(clip=><ClipButton key={clip.target} clip={{book:lesson.book,lesson:first,start:clip.start,end:clip.end}} label={clip.label|| (clip.target==='ask'?'听询问物品':clip.target==='confirm'?'听确认物品':'听请求重说')}/>)}</div>;
 return <><SentenceIllustration book={lesson.book} lesson={first} sourceSha256={language.sourceSha256} rowCount={rows.length} line={line}/><div className="course-loop-actions"><button disabled={line===0} onClick={()=>setLine(n=>n-1)}>上一幅</button><span>对应第 {line+1} / {rows.length} 句</span><button disabled={line===rows.length-1} onClick={()=>setLine(n=>n+1)}>下一幅</button></div></>;
}
