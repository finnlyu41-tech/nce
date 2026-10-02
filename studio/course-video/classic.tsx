import {useCallback,useEffect,useMemo,useRef} from 'react';
import type {State} from '../app/model';
import {learningKey} from '../app/learning-plan';
import {StateStorageConflict} from '../app/offline-store';
import {classicNotesPort,type NotesPort} from './adapter';
import {CourseVideoHelp} from './ui';
import {courseVideoManifest} from './sources';
import type {VideoSource} from './manifest';
type Guard=()=>Promise<boolean>;
/** Reuse the classic learning contract's pending-answer hinted flag. Keep all
 * existing raw fields/attempts; video provenance lives in the video-note draft. */
export async function recordClassicVideoHelp(port:NotesPort,book:VideoSource['book'],lesson:number,publish?:(key:string,raw:string)=>void){
 const key=learningKey(book,lesson);
 for(let retry=0;retry<4;retry++){
  const read=await port.read(),raw=read.state.drafts[key];if(raw===undefined)return true;
  let value;try{value=JSON.parse(raw)}catch{throw Error('这份课程练习记录无法核对，未打开视频。')}
  if(value?.version!==1||!value.goals||typeof value.goals!=='object')throw Error('这份课程练习记录版本暂不支持，未打开视频。');
  const goal=value.goals[value.goal];if(!['independent','review'].includes(value.phase)||!goal||goal.hinted||goal.checked&&goal.checked===goal.answer)return true;
  const nextRaw=JSON.stringify({...value,goals:{...value.goals,[value.goal]:{...goal,hinted:true}}});
  try{await port.write({...read.state,drafts:{...read.state.drafts,[key]:nextRaw}},read.storage,()=>true);const confirmed=await port.read();if(confirmed.state.drafts[key]!==nextRaw)throw Error('视频帮助记录保存后发生变化，未打开视频。');publish?.(key,nextRaw);return true}catch(e){if(!(e instanceof StateStorageConflict)||retry===3)throw e}
 }
 return false;
}
export function ClassicCourseVideoHelp({book,lesson,update,bindGuard}:{book:VideoSource['book'];lesson:number;update:(fn:(state:State)=>State)=>void;bindGuard:(guard:Guard|null)=>void}){
 const guard=useRef<Guard|null>(null);
 const publish=useCallback((key:string,raw:string)=>update(s=>({...s,drafts:{...s.drafts,[key]:raw}})),[update]);
 const port=useMemo(()=>classicNotesPort(read=>{if(read.raw!==null)publish(read.key,read.raw)}),[publish]);
 const bind=useCallback((fn:Guard|null)=>{guard.current=fn;bindGuard(fn)},[bindGuard]);
 useEffect(()=>{
  const click=(event:MouseEvent)=>{if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;const anchor=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;
   if(!anchor||anchor.download||anchor.target&&anchor.target!=='_self')return;const target=new URL(anchor.href,location.href);if(!['http:','https:','file:'].includes(target.protocol))return;
   // Hash navigation is fenced by the accepted-route hook. Document exits
   // must await the same queue before the browser unloads this component.
   if(target.origin===location.origin&&target.pathname===location.pathname&&target.search===location.search)return;
   event.preventDefault();event.stopPropagation();void(async()=>{if(!guard.current||await guard.current())location.assign(target.href)})();
  };document.addEventListener('click',click,true);return()=>document.removeEventListener('click',click,true);
 },[]);
 return <CourseVideoHelp key={`${book}-${lesson}`} courseId={`${book.toLowerCase()}-${lesson}`} book={book} lessons={[lesson]} phase="learn" manifest={courseVideoManifest} port={port} bindGuard={bind} recordHelp={()=>recordClassicVideoHelp(port,book,lesson,publish)}/>;
}
