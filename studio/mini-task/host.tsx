import {useCallback,useEffect,useRef,useState} from 'react';
import {useRoute} from '../app/use-route';
import {routeHash,type StudioRoute} from '../app/navigation';
import {StudioHeader} from '../app/study-mode';
import {MiniTaskWorkspace} from '../app/mini-task-ui';
import {getMiniTask} from './content';

/** Fence the rendered mini workspace while a requested hash/back navigation
 * waits for its actual save queue. The existing route/redirect logic remains
 * in charge after confirmation; a false/throwing guard retains the component. */
export function useMiniTaskHostRoute(){
 const requested=useRoute(),[route,setRoute]=useState<StudioRoute>(requested),[miniNotice,setMiniNotice]=useState('');
 const guard=useRef<(()=>Promise<boolean>)|null>(null);
 const bindMiniLeaveGuard=useCallback((next:(()=>Promise<boolean>)|null)=>{guard.current=next},[]);
 const beforeMiniLeave=useCallback(async()=>{
  try{if(!guard.current||await guard.current()){setMiniNotice('');return true}}catch{}
  setMiniNotice('小任务输入还没有确认保存。当前原答仍保留，请重试保存或先保存未提交文字。');return false;
 },[]);
 useEffect(()=>{
  if(routeHash(requested)===routeHash(route))return;
  let current=true;const outgoing=routeHash(route),incoming=routeHash(requested);
  void(async()=>{
   if(route.view==='mini-task'&&!await beforeMiniLeave()){
    if(current){history.replaceState(history.state,'',outgoing);window.dispatchEvent(new CustomEvent('studio:navigation',{detail:{keepScroll:true}}))}return;
   }
   if(current&&routeHash(requested)===incoming)setRoute(requested);
  })();
  return()=>{current=false};
 },[requested,route,beforeMiniLeave]);
 return {route,bindMiniLeaveGuard,beforeMiniLeave,miniNotice};
}
export function MiniTaskHost({taskId,onLeaveGuard,beforeLeave,notice}:{taskId:string;onLeaveGuard:(guard:(()=>Promise<boolean>)|null)=>void;beforeLeave:()=>Promise<boolean>;notice:string}){
 const task=getMiniTask(taskId),courseHref=`/map/#/learn/${task.courseId}`;
 const leave=useCallback(async(href:string)=>{if(await beforeLeave())location.assign(href)},[beforeLeave]);
 useEffect(()=>{
  // Document exits (header/records/Today/course links) must wait for the same
  // guard as hash/browser-back exits. Downloads and separate tabs stay local.
  const click=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const anchor=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;
   if(!anchor||anchor.download||anchor.target&&anchor.target!=='_self')return;
   const destination=new URL(anchor.href,location.href);if(!['http:','https:'].includes(destination.protocol))return;
   event.preventDefault();event.stopPropagation();void leave(destination.href);
  };
  document.addEventListener('click',click,true);return()=>document.removeEventListener('click',click,true);
 },[leave]);
 return <div className="mini-task-host" data-mini-host={taskId}>
  <StudioHeader active="learn" mapUrl="/map/" reference={{book:'NCE1',lesson:task.lessons[0]}}/>
  <main id="main"><nav aria-label="小任务返回" className="mini-task"><button type="button" onClick={()=>void leave(courseHref)}>回到本组课程</button><button type="button" onClick={()=>void leave('/map/')}>查看今天安排</button></nav>
   {notice&&<p className="mini-task" role="alert">{notice}</p>}
   <MiniTaskWorkspace key={taskId} taskId={taskId} onLeaveGuard={onLeaveGuard} onContinue={()=>void leave(courseHref)}/>
  </main>
 </div>;
}
