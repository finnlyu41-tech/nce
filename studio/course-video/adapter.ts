import {readCourseLoop,notifyProgressSaved} from '../app/course-loop-progress';
import {StateStorageConflict,readStateSnapshot,writeState,writeLegacyState,type StateStorageSnapshot} from '../app/offline-store';
import {initial,validateState,type State} from '../app/model';
import {noteKey,parseNotes,type VideoIdentity,type VideoNotes} from './notes';
export type StoreRead={storage:StateStorageSnapshot;state:State};
export type NotesPort={read:()=>Promise<StoreRead>;write:(next:State,expected:StateStorageSnapshot,unchanged:()=>boolean)=>Promise<void>;notify?:(confirmed:NotesRead)=>void};
export type NotesRead=StoreRead&{key:string;raw:string|null;notes:VideoNotes};
export function courseNotesPort(courseId:string):NotesPort{return {
 read:()=>readCourseLoop(courseId),
 write:async(next,expected,unchanged)=>{const guard={expectedRaw:expected.raw,unchanged};if(expected.mode==='db')await writeState(next,guard);else await writeLegacyState(next,'english-studio-v1',guard)},
 notify:notifyProgressSaved,
}}
/** Same existing DB/legacy State namespace as the classic host, no new store. */
export function classicNotesPort(onConfirmed?:(confirmed:NotesRead)=>void):NotesPort{return {
 read:async()=>{let storage:StateStorageSnapshot;try{storage=await readStateSnapshot()}catch{storage={mode:'legacy',raw:localStorage.getItem('english-studio-v1')}}
  const legacy=storage.mode==='db'&&storage.raw===null?localStorage.getItem('english-studio-v1'):null;
  const raw=storage.raw??legacy,state=raw===null?structuredClone(initial):JSON.parse(raw);if(!validateState(state))throw Error('学习记录格式异常，原文保留。');return {storage,state};},
 write:async(next,expected,unchanged)=>{const guard={expectedRaw:expected.raw,unchanged};if(expected.mode==='db')await writeState(next,guard);else await writeLegacyState(next,'english-studio-v1',guard)},
 notify:confirmed=>{notifyProgressSaved();onConfirmed?.(confirmed)},
}}
export async function readNotes(port:NotesPort,id:VideoIdentity):Promise<NotesRead>{
 const read=await port.read();if(!validateState(read.state))throw Error('学习记录格式异常，原始记录保留。');
 const key=noteKey(id),raw=read.state.drafts[key]??null;return {...read,key,raw,notes:parseNotes(raw,id)};
}
/** Only this identity's raw is compared; other course edits are preserved.
 * Full-State CAS happens inside the existing production writer/lock. */
export async function commitNotes(port:NotesPort,expected:NotesRead,notes:VideoNotes,unchanged:()=>boolean):Promise<NotesRead>{
 const raw=JSON.stringify(notes);parseNotes(raw,expected.notes.identity);if(noteKey(notes.identity)!==expected.key)throw Error('笔记课程不一致，文本仍保留。');
 for(let retry=0;retry<4;retry++){
  if(!unchanged())throw new StateStorageConflict();const fresh=await readNotes(port,notes.identity);
  if(fresh.storage.mode!==expected.storage.mode||fresh.raw!==expected.raw)throw Error('另一页面更新了这份笔记。你的文本仍在本页；请先复制或下载，再读取最新笔记。');
  try{
   await port.write({...fresh.state,drafts:{...fresh.state.drafts,[fresh.key]:raw}},fresh.storage,unchanged);
   const confirmed=await readNotes(port,notes.identity);if(confirmed.raw!==raw)throw Error('保存后笔记发生变化，文本仍保留，请备份后核对。');
   port.notify?.(confirmed);return confirmed;
  }catch(error){if(!(error instanceof StateStorageConflict)||!unchanged()||retry===3)throw error}
 }
 throw new StateStorageConflict();
}
