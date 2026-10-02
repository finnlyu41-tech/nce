/* eslint-disable @next/next/no-html-link-for-pages -- Existing static document routes. */
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {StudioHeader} from '../app/study-mode';
import {ProgressSave} from '../app/progress-save';
import type {ProgressRestoreCheckpoint,ProgressRestoreOptions} from '../app/progress-file';
import {routeHash,type StudioRoute} from '../app/navigation';
import type {State} from '../app/model';
import {createStageAdapter} from './adapter';
import {StageAssessment} from './StageAssessment';
import {commitStageDraft,readStageCheckpoint,restoreStageCheckpoint,type StageCheckpoint} from './host-progress';

/** Compose after mini and placement accepted routes. Failed departure retains
 * this mounted workspace and restores the stage hash before shared redirects. */
export function useStageHostRoute(requested:StudioRoute){
 const [route,setRoute]=useState(requested),[notice,setNotice]=useState('');
 const guard=useRef<(()=>Promise<boolean>)|null>(null);
 const bind=useCallback((next:(()=>Promise<boolean>)|null)=>{guard.current=next},[]);
 const beforeLeave=useCallback(async()=>{
  try{if(!guard.current||await guard.current()){setNotice('');return true;}}catch{}
  setNotice('阶段首答尚未确认保存。当前页面和输入保留，请重试保存或先下载未确认输入。');return false;
 },[]);
 useEffect(()=>{
  const outgoing=routeHash(route);if(outgoing===routeHash(requested))return;
  let alive=true;
  void(async()=>{
   if(route.view==='stage-assessment'&&!await beforeLeave()){
    if(alive){history.replaceState(history.state,'',outgoing);window.dispatchEvent(new CustomEvent('studio:navigation',{detail:{keepScroll:true}}));}return;
   }
   if(alive)setRoute(requested);
  })();return()=>{alive=false};
 },[requested,route,beforeLeave]);
 return {route,bind,beforeLeave,notice};
}
export function StageHost({bind,beforeLeave,notice,write=commitStageDraft}:{bind:(guard:(()=>Promise<boolean>)|null)=>void;beforeLeave:()=>Promise<boolean>;notice:string;write?:typeof commitStageDraft}){
 const alive=useRef(true),checkpoint=useRef<StageCheckpoint|null>(null);
 const [state,setState]=useState<State|null>(null),[error,setError]=useState(''),[restoring,setRestoring]=useState(false),[revision,setRevision]=useState(0);
 const publish=useCallback((next:StageCheckpoint)=>{checkpoint.current=next;if(alive.current)setState(next.state)},[]);
 const [adapter]=useState(()=>createStageAdapter({courseVersion:'bd5d1f731dc4c2d7e1cf213485c75af903d47fa1+stage-candidate',
  read:async()=>{const next=await readStageCheckpoint();publish(next);return next.state;},
  commit:(expected,next)=>write(expected,next,()=>alive.current&&!restoringRef.current)
 }));
 const restoringRef=useRef(false);
 useEffect(()=>{alive.current=true;void readStageCheckpoint().then(publish,e=>setError(e instanceof Error?e.message:String(e)));return()=>{alive.current=false};},[publish]);
 const leave=useCallback(async(href:string)=>{if(await beforeLeave())location.assign(href)},[beforeLeave]);
 useEffect(()=>{
  const click=(e:MouseEvent)=>{
   if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
   const a=e.target instanceof Element?e.target.closest<HTMLAnchorElement>('a[href]'):null;
   if(!a||a.download||a.target&&a.target!=='_self')return;
   const target=new URL(a.href,location.href);if(!['http:','https:'].includes(target.protocol))return;
   e.preventDefault();e.stopPropagation();void leave(target.href);
  };
  document.addEventListener('click',click,true);return()=>document.removeEventListener('click',click,true);
 },[leave]);
 async function captureRestore():Promise<ProgressRestoreCheckpoint>{
  if(!await beforeLeave())throw Error('当前输入尚未确认保存，先重试保存或下载未确认输入。');
  const next=await readStageCheckpoint();publish(next);
  return {state:next.state,expected:next.state,persisted:next.storage};
 }
 async function restore(incoming:State,options:ProgressRestoreOptions={}){
  const expected=checkpoint.current;if(!expected||!options.persisted||options.persisted.raw!==expected.storage.raw||options.persisted.mode!==expected.storage.mode)throw Error('恢复预览已过期，请重新选择备份。');
  setRestoring(true);restoringRef.current=true;
  try{
   const next=await restoreStageCheckpoint(expected,incoming,()=>alive.current&&checkpoint.current?.storage.raw===expected.storage.raw,options.rollbackTo);
   options.onCommitted?.(next.state);publish(next);setError('');setRevision(n=>n+1);return next.state;
  }catch(e){setError(e instanceof Error?e.message:String(e));throw e;}
  finally{setRestoring(false);restoringRef.current=false;}
 }
 // Production always supplies only LearnerPort. ExaminerPanel is not mounted;
 // adapter examiner rejects unbound access even if passed frontend role bools.
 const learner=useMemo(()=>({load:adapter.load,learner:adapter.learner,exportEvidence:adapter.exportEvidence,restoreEvidence:adapter.restoreEvidence}),[adapter]);
 return <div data-stage-host><StudioHeader active="learn" mapUrl="/map/" reference={{book:'NCE1',lesson:1}} actions={state?<ProgressSave state={state} ready={!restoring} status="阶段记录沿已有本机资料库保存" captureRestore={captureRestore} restore={restore}/>:undefined}/>
  <div id="main"><nav className="stage-assessment"><button onClick={()=>void leave('/#/today')}>查看今天安排</button></nav>
   {notice&&<p role="alert" className="stage-assessment stage-error">{notice}</p>}{error&&<p role="alert" className="stage-assessment stage-error">{error}</p>}
   {restoring?<p role="status">正在恢复原始证据与草稿…</p>:state?<StageAssessment key={revision} port={learner} onLeaveGuard={bind} onReturn={()=>void leave('/#/today')}/>:<p role="status">正在读取已有学习记录…</p>}
  </div>
 </div>;
}
export function StageEntry(){return <a className="stage-entry" href="/#/stage-assessment"><strong>第1–6课阶段观察</strong><span>听、读、说、写分别保留原答；人工与自然间隔待验。</span></a>;}
