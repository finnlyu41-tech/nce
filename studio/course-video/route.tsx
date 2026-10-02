import {useCallback,useEffect,useRef,useState} from 'react';
import {routeHash,type StudioRoute} from '../app/navigation';
/** Compose AFTER the host's accepted mini/placement/stage route. The calling
 * workspace and NceStudio must both render this accepted route, not raw hash. */
export function useCourseVideoHostRoute(requested:StudioRoute){
 const [route,setRoute]=useState(requested),[videoNotice,setVideoNotice]=useState(''),guard=useRef<(()=>Promise<boolean>)|null>(null);
 const bindVideoLeaveGuard=useCallback((fn:(()=>Promise<boolean>)|null)=>{guard.current=fn},[]);
 const beforeVideoLeave=useCallback(async()=>{try{if(!guard.current||await guard.current()){setVideoNotice('');return true}}catch{}setVideoNotice('视频笔记还没有确认保存，文本仍保留。请先重试或下载未保存笔记。');return false},[]);
 useEffect(()=>{if(routeHash(requested)===routeHash(route))return;let current=true;const outgoing=routeHash(route),incoming=routeHash(requested);
  void(async()=>{if(!await beforeVideoLeave()){if(current){history.replaceState(history.state,'',outgoing);window.dispatchEvent(new CustomEvent('studio:navigation',{detail:{keepScroll:true}}))}return}if(current&&routeHash(requested)===incoming)setRoute(requested)})();return()=>{current=false};
 },[requested,route,beforeVideoLeave]);
 return {route,bindVideoLeaveGuard,beforeVideoLeave,videoNotice};
}
