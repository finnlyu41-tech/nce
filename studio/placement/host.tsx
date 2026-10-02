/* eslint-disable @next/next/no-html-link-for-pages -- Existing static classic/map document routes. */
import {useCallback,useEffect,useRef,useState} from 'react';
import {StudioHeader} from '../app/study-mode';
import {useMapProgress} from '../app/map-connection';
import {courseDestination} from '../app/course-loop-next';
import {ONLINE} from '../app/runtime-mode';
import {routeHash,type StudioRoute} from '../app/navigation';
import {Placement} from './placement-ui';
import {placementEntryHref} from './entry-access';
import {placementKey} from './model';
import {readPlacementCheckpoint,commitPlacementCheckpoint,type PlacementCheckpoint} from './host-progress';
import type {State} from '../app/model';
import './host.css';

/** Compose after the mini owner's route fence, preserving its guard and routes. */
export function usePlacementHostRoute(requested:StudioRoute){
 const [route,setRoute]=useState(requested),[notice,setNotice]=useState('');
 const guard=useRef<(()=>Promise<boolean>)|null>(null);
 const bind=useCallback((next:(()=>Promise<boolean>)|null)=>{guard.current=next},[]);
 const beforeLeave=useCallback(async()=>{
  try{if(!guard.current||await guard.current()){setNotice('');return true}}catch{}
  setNotice('诊断输入还没有确认保存，当前页面和原答保留。请重试保存后再离开。');return false;
 },[]);
 useEffect(()=>{
  const outgoing=routeHash(route),incoming=routeHash(requested);if(outgoing===incoming)return;
  let alive=true;
  void(async()=>{
   if(route.view==='placement'&&!await beforeLeave()){
    if(alive){history.replaceState(history.state,'',outgoing);window.dispatchEvent(new CustomEvent('studio:navigation',{detail:{keepScroll:true}}))}return;
   }
   if(alive)setRoute(requested);
  })();return()=>{alive=false};
 },[requested,route,beforeLeave]);
 return {route,bind,beforeLeave,notice};
}

export function PlacementHost({bind,beforeLeave,notice}:{bind:(guard:(()=>Promise<boolean>)|null)=>void;beforeLeave:()=>Promise<boolean>;notice:string}){
 const {state:map,error:mapError}=useMapProgress(true);
 const [view,setView]=useState<State|null>(null),[issue,setIssue]=useState(''),[busy,setBusy]=useState(false),[loadError,setLoadError]=useState('');
 const viewRef=useRef<State|null>(null),confirmed=useRef<PlacementCheckpoint|null>(null),queue=useRef<Promise<void>>(Promise.resolve()),pending=useRef<State|null>(null),failed=useRef(false),controlBusy=useRef(false),alive=useRef(true);
 const publish=useCallback((state:State)=>{viewRef.current=state;if(alive.current)setView(state)},[]);
 useEffect(()=>{alive.current=true;void readPlacementCheckpoint().then(value=>{confirmed.current=value;publish(value.state)},e=>setLoadError(e instanceof Error?e.message:'无法读取本机学习记录，原文保留。'));return()=>{alive.current=false}},[publish]);
 const schedule=useCallback((candidate:State,control:boolean)=>{
  pending.current=candidate;if(control){controlBusy.current=true;setBusy(true)}
  const operation=queue.current.catch(()=>{}).then(async()=>{
   if(failed.current||!confirmed.current)return;
   try{
    const raw=candidate.drafts[placementKey];
    const result=await commitPlacementCheckpoint(confirmed.current,raw,()=>alive.current);
    confirmed.current=result;
    const latest=pending.current;
    if(latest===candidate){pending.current=null;publish(result.state);setIssue('')}
    else if(latest&&viewRef.current){publish({...result.state,drafts:{...result.state.drafts,[placementKey]:viewRef.current.drafts[placementKey]}})}
   }catch(e){failed.current=true;setIssue(e instanceof Error?e.message:'诊断尚未保存，当前输入保留。')}
  }).finally(()=>{if(control){controlBusy.current=false;if(alive.current)setBusy(false)}});
  queue.current=operation;
 },[publish]);
 const update=useCallback((fn:(state:State)=>State)=>{
  if(!viewRef.current||failed.current||controlBusy.current)return;
  const candidate=fn(viewRef.current);if(candidate===viewRef.current){setIssue('诊断记录刚改变，本次操作尚未应用，请核对后重试。');return}
  const events=JSON.parse(candidate.drafts[placementKey]).events as {type:string}[],type=events.at(-1)?.type;
  const control=type!=='draft'&&type!=='correction-draft';
  if(!control)publish(candidate); // Input stays responsive; advancement waits for commit.
  schedule(candidate,control);
 },[publish,schedule]);
 const flush=useCallback(async()=>{
  await queue.current;
  return !failed.current&&pending.current===null&&!!confirmed.current&&viewRef.current?.drafts[placementKey]===confirmed.current.raw;
 },[]);
 useEffect(()=>{bind(flush);return()=>bind(null)},[bind,flush]);
 useEffect(()=>{
  const unload=(event:BeforeUnloadEvent)=>{if(pending.current||failed.current){event.preventDefault();event.returnValue=''}};
  const click=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const anchor=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;
   if(!anchor||anchor.download||anchor.target&&anchor.target!=='_self')return;
   const destination=new URL(anchor.href,location.href);if(!['http:','https:'].includes(destination.protocol))return;
   event.preventDefault();event.stopPropagation();void beforeLeave().then(ok=>{if(ok)location.assign(destination.href)});
  };
  window.addEventListener('beforeunload',unload);document.addEventListener('click',click,true);
  return()=>{window.removeEventListener('beforeunload',unload);document.removeEventListener('click',click,true)};
 },[beforeLeave]);
 const retry=()=>{if(controlBusy.current)return;const candidate=pending.current;if(candidate){failed.current=false;setIssue('');schedule(candidate,true)}};
 const backup=()=>{if(!pending.current)return;const blob=new Blob([JSON.stringify(pending.current,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='english-studio-placement-pending.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 const continueHref=view?courseDestination(view,map).href:'/map/';
 return <div data-placement-host><StudioHeader active="learn" mapUrl="/map/"/><main id="main">
  {notice&&<p className="notice" role="alert">{notice}</p>}
  {issue&&<section className="panel placement" role="alert"><p>{issue} 当前输入仍保留，尚未离开或计入课程完成。</p><button className="btn" onClick={retry} disabled={busy}>重试保存当前输入</button><button className="btn secondary" onClick={backup}>备份未保存输入</button></section>}
  {busy&&<p className="notice" role="status">正在确认保存；确认后继续这一步。</p>}
  {view?<fieldset disabled={busy||failed.current} style={{border:0,padding:0,margin:0}}><Placement state={view} update={update} ready={true} error={loadError||mapError} continueHref={continueHref} trialHref={placementEntryHref(view,map,Date.now(),ONLINE)||undefined}/></fieldset>:<p role={loadError?'alert':'status'}>{loadError||'正在读取现有学习记录…'}</p>}
 </main></div>;
}
