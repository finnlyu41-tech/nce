import {initial,validateState,type State} from '../app/model';
import {readStateSnapshot,writeState,writeLegacyState,StateStorageConflict,type StateStorageSnapshot} from '../app/offline-store';
import {courseLoopFor,parseCourseLoop} from '../app/course-loop-progress';
import {getMiniTask,miniTasks,miniTaskForCourse,miniDraftKey} from './content';
import {initialMini,restoreMini,miniRecommendation,type MiniSnapshot} from './model';
const legacyKey='english-studio-v1';
export type MiniRead={taskId:string;state:State;storage:StateStorageSnapshot;raw:string|null};
/** Existing State and existing guarded writer only; no second progress database. */
export async function readMiniTask(taskId:string):Promise<MiniRead>{
 getMiniTask(taskId);let storage:StateStorageSnapshot;
 try{storage=await readStateSnapshot()}catch{storage={mode:'legacy',raw:localStorage.getItem(legacyKey)}}
 const legacy=storage.raw===null&&storage.mode==='db'?localStorage.getItem(legacyKey):null;
 const value=storage.raw===null?(legacy===null?structuredClone(initial):JSON.parse(legacy)):JSON.parse(storage.raw);
 if(!validateState(value))throw Error('整站学习记录格式异常，未覆盖原文。请在记录页备份核对。');
 return {taskId,state:value,storage,raw:value.drafts[miniDraftKey(taskId)]??null};
}
export function withMiniSnapshot(state:State,snapshot:MiniSnapshot,now=Date.now()):State{
 const raw=JSON.stringify(snapshot),result=restoreMini(raw,now,snapshot.taskId);if(!result.ok)throw Error(result.message);
 return {...state,drafts:{...state.drafts,[miniDraftKey(snapshot.taskId)]:raw}};
}
export async function commitMiniTask(expected:MiniRead,snapshot:MiniSnapshot,unchanged=()=>true):Promise<MiniRead>{
 if(snapshot.taskId!==expected.taskId)throw Error('任务读取与写入目标不一致，原答保留。');
 const raw=JSON.stringify(snapshot),parsed=restoreMini(raw,Date.now(),expected.taskId);if(!parsed.ok)throw Error(parsed.message);
 for(let retry=0;retry<4;retry++){
  if(!unchanged())throw new StateStorageConflict();
  const fresh=await readMiniTask(expected.taskId);
  if(fresh.storage.mode!==expected.storage.mode||fresh.raw!==expected.raw)throw Error('另一页面修改了本任务。当前输入保留，请保存未提交内容后读取最新记录。');
  if(fresh.raw===null&&!miniPrerequisite(fresh.state,getMiniTask(expected.taskId).courseId).eligible)throw Error('本组学习前提尚未满足，未创建任务记录。');
  const next=withMiniSnapshot(fresh.state,snapshot),guard={expectedRaw:fresh.storage.raw,unchanged};
  try{
   if(fresh.storage.mode==='db')await writeState(next,guard);else await writeLegacyState(next,legacyKey,guard);
   const confirmed=await readMiniTask(expected.taskId);if(confirmed.raw!==raw)throw Error('保存后记录发生变化，当前输入保留，请读取核对。');
   window.dispatchEvent(new Event('english-studio-progress-saved'));
   if(typeof BroadcastChannel!=='undefined'){const channel=new BroadcastChannel('english-studio-progress');channel.postMessage('saved');channel.close()}
   return confirmed;
  }catch(error){if(!(error instanceof StateStorageConflict)||retry===3||!unchanged())throw error}
 }
 throw new StateStorageConflict();
}
/** Graded prerequisite: the paired beginner CL has reached own/waiting. This
 * uses CL learning position only, never map unlock/completion or IELTS level. */
export function miniPrerequisite(state:State,courseId:string,now=Date.now()){
 const task=miniTaskForCourse(courseId);if(!task)return {eligible:false,reason:'本组还没有编写适级小任务。'};
 const binding=courseLoopFor(courseId),raw=state.drafts[binding.key];
 if(!raw)return {eligible:false,reason:'先完成本组教学、提示练习和独立尝试，再进入适级小任务。'};
 const parsed=parseCourseLoop(raw,now,courseId);
 return {eligible:parsed.ok&&['own','waiting','review-a','review-b','review-feedback'].includes(parsed.view.phase),reason:parsed.ok?'依据本组已保存学习位置；难度未校准，不代表 IELTS 达标。':'本组记录需先核对，原文保留。'};
}
export const miniTaskHref=(taskId:string)=>`/#/mini-task/${encodeURIComponent(getMiniTask(taskId).id)}`;
export function miniTaskForCourseExit(state:State,courseId:string,now=Date.now()){
 const task=miniTaskForCourse(courseId);if(!task||!miniPrerequisite(state,courseId,now).eligible)return null;
 const raw=state.drafts[miniDraftKey(task.id)];
 if(raw){const p=restoreMini(raw,now,task.id);if(p.ok&&['waiting','exhausted'].includes(miniRecommendation(p.view,now)))return null}
 return {taskId:task.id,title:task.title,href:miniTaskHref(task.id)};
}
/** Insert before default courseDestination; existing repairs/resumes/due work
 * stay ahead. One identity per group, finite banks never silently recycle. */
export function miniPracticeTasks(state:State,now=Date.now(),online=true){
 if(!online)return [];
 return miniTasks.flatMap(task=>{
  const raw=state.drafts[miniDraftKey(task.id)];
  if(!raw&&!miniPrerequisite(state,task.courseId,now).eligible)return [];
  const parsed=raw?restoreMini(raw,now,task.id):null;
  const kind=parsed?.ok?miniRecommendation(parsed.view,now):'resume';
  if(kind==='waiting'||kind==='exhausted')return [];
  return [{id:`mini-task:${task.groupId}`,title:task.title,reason:parsed&&!parsed.ok?'小任务记录需核对，原文保留。':kind==='review'?'本组小任务已到期，用尚未曝光的延迟题。':raw?'接着已保存的小任务与原答继续。':'把本组目标用到一个初学者雅思式小任务。',method:'教学、提示练习、独立尝试、修补，再按期换题。',evidence:'帮助/曝光/原答分开留存；开放口写待外评，难度未校准。',href:miniTaskHref(task.id),returnHref:'/#/today',priority:kind==='review'?2:raw?1:3.5,at:parsed?.ok?parsed.view.dueAt??parsed.view.lastAt:now,kind:raw?kind==='review'?'review' as const:'resume' as const:'new' as const}];
 });
}
export {initialMini};
