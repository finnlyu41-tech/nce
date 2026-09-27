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
  let restoring=false,frame=0,timer=0,observer:ResizeObserver|undefined,heldHeight:string|undefined;
  const stop=()=>{
   restoring=false;clearTimeout(timer);cancelAnimationFrame(frame);observer?.disconnect();window.removeEventListener('scrollend',settle);
   if(heldHeight!==undefined){document.body.style.minHeight=heldHeight;heldHeight=undefined}
  };
  const save=()=>{if(restoring)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(!restoring)history.replaceState({...history.state,studioScroll:window.scrollY},'')})};
  const settle=()=>{stop();save()};
  const restore=(event?:Event)=>{
   stop();cancelAnimationFrame(frame);window.speechSynthesis?.cancel();
   const detail=event instanceof CustomEvent?event.detail:undefined;
   // Keep the outgoing height until the destination is laid out. Otherwise
   // a short/loading panel can clamp scrollY before we have moved anywhere.
   if(detail?.keepScroll){heldHeight=document.body.style.minHeight;document.body.style.minHeight=`${document.documentElement.scrollHeight}px`}
   restoring=true;
   const y=Number(history.state?.studioScroll)||0;
   const attempt=()=>{
    const target=detail?.scrollTarget?document.getElementById(detail.scrollTarget):null;
    if(target){
     restoring=false;
     clearTimeout(timer);
     window.addEventListener('scrollend',settle,{once:true});
     target.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
     timer=window.setTimeout(settle,1800);
    }else{
     window.scrollTo({top:y,behavior:'instant'});
     if(document.documentElement.scrollHeight-window.innerHeight>=y)stop();
    }
   };
   timer=window.setTimeout(stop,5000);
   if(!detail?.scrollTarget){observer=new ResizeObserver(attempt);observer.observe(document.body)}
   frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(attempt)});
  };
  const interrupt=()=>{if(restoring||heldHeight!==undefined){cancelAnimationFrame(frame);stop();save()}};
  for(const event of ['popstate','hashchange','studio:navigation'])window.addEventListener(event,restore);
  window.addEventListener('scroll',save,{passive:true});window.addEventListener('wheel',interrupt,{passive:true});window.addEventListener('touchstart',interrupt,{passive:true});
  restore();
  return()=>{stop();cancelAnimationFrame(frame);history.scrollRestoration=previous;for(const event of ['popstate','hashchange','studio:navigation'])window.removeEventListener(event,restore);window.removeEventListener('scroll',save);window.removeEventListener('wheel',interrupt);window.removeEventListener('touchstart',interrupt)};
 },[]);
}
