'use client';
import {useState,useSyncExternalStore} from 'react';
import {ensureReadingEntry,readingEntryMatches,readingEntrySnapshot,readReadingLine,writeReadingLine} from './reading-position';

function subscribe(callback:()=>void){
 const refresh=(event?:Event)=>{ensureReadingEntry(event?.type==='popstate');callback()};
 for(const name of ['popstate','hashchange','studio:navigation'])window.addEventListener(name,refresh);
 refresh();
 return()=>{for(const name of ['popstate','hashchange','studio:navigation'])window.removeEventListener(name,refresh)};
}
export function useReadingPosition(source:string|undefined,rowCount:number){
 const entry=useSyncExternalStore(subscribe,readingEntrySnapshot,()=> '["",""]');
 const [url,id]=JSON.parse(entry) as [string,string];
 const [selection,setSelection]=useState<{entry:string;source:string;line:number}|null>(null);
 const line=source&&selection?.entry===entry&&selection.source===source&&selection.line<rowCount?selection.line:typeof window==='undefined'?0:readReadingLine(source,rowCount);
 const setLine=(next:number)=>{
  if(!source||!readingEntryMatches({url,id})||!Number.isInteger(next)||next<0||next>=rowCount)return false;
  writeReadingLine({url,id},source,rowCount,next);
  setSelection(previous=>previous?.entry===entry&&previous.source===source&&previous.line===next?previous:{entry,source,line:next});
  return true;
 };
 return {line,setLine,entry};
}
