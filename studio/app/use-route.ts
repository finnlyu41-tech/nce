'use client';
import {useEffect,useMemo,useSyncExternalStore} from 'react';
import {parseRoute,routeHash} from './navigation';

function subscribe(callback:()=>void){
 for(const name of ['popstate','hashchange','studio:navigation'])window.addEventListener(name,callback);
 return()=>{for(const name of ['popstate','hashchange','studio:navigation'])window.removeEventListener(name,callback)};
}
const snapshot=()=>window.location.hash;
export function useRoute(){
 const hash=useSyncExternalStore(subscribe,snapshot,()=>'' );
 return useMemo(()=>parseRoute(hash),[hash]);
}
// History entries own their scroll positions. Retry restoration as async lesson
// content arrives, without storing navigation in the learner's progress data.
export function useRouteScroll(){
 useEffect(()=>{
  const previous=history.scrollRestoration;history.scrollRestoration='manual';
  if(!location.hash)history.replaceState({studioScroll:0},'',routeHash({view:'nce'}));
  let restoring=false,frame=0,timer=0,observer:ResizeObserver|undefined;
  const stop=()=>{restoring=false;clearTimeout(timer);observer?.disconnect()};
  const save=()=>{if(restoring)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(!restoring)history.replaceState({...history.state,studioScroll:window.scrollY},'')})};
  const restore=()=>{
   stop();cancelAnimationFrame(frame);restoring=true;window.speechSynthesis?.cancel();
   const y=Number(history.state?.studioScroll)||0;
   const attempt=()=>{window.scrollTo({top:y,behavior:'instant'});if(document.documentElement.scrollHeight-window.innerHeight>=y){stop()}};
   observer=new ResizeObserver(attempt);observer.observe(document.body);frame=requestAnimationFrame(()=>requestAnimationFrame(attempt));timer=window.setTimeout(stop,5000);
  };
  const interrupt=()=>{if(restoring){stop();save()}};
  for(const event of ['popstate','hashchange','studio:navigation'])window.addEventListener(event,restore);
  window.addEventListener('scroll',save,{passive:true});window.addEventListener('wheel',interrupt,{passive:true});window.addEventListener('touchstart',interrupt,{passive:true});
  restore();
  return()=>{stop();cancelAnimationFrame(frame);history.scrollRestoration=previous;for(const event of ['popstate','hashchange','studio:navigation'])window.removeEventListener(event,restore);window.removeEventListener('scroll',save);window.removeEventListener('wheel',interrupt);window.removeEventListener('touchstart',interrupt)};
 },[]);
}
