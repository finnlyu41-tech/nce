import * as core from '../course-loop/model.mjs';
import {byId} from '../course-loop/lesson-nce1-001.mjs';
import type {Action,Snapshot} from '../course-loop/host-contract';
import {initial,validateState,type State} from './model';
import {readStateSnapshot,writeState,writeLegacyState,StateStorageConflict,type StateStorageSnapshot} from './offline-store';

export const courseLoopKey='nce-course-loop-v1:NCE1-1';
export const courseLoopInputsKey='nce-course-loop-inputs-v1:NCE1-1';
const legacyKey='english-studio-v1',MAX_RAW=2*1024*1024;
export type LoopAttempt={id:string;stage:string;answer:string;correct:boolean;hinted:boolean;fresh:boolean;exposure:number;at:number};
export type LoopView={phase:string;index:number;draft:string;hinted:boolean;attempts:LoopAttempt[];exposures:{id:string;kind:string;at:number}[];learning:{id:string;at:number}[];corrections:Record<string,{answer:string;note:string;at:number}>;ownDraft:string;ownFinal:null|{text:string;at:number;status:string};dueAt:number|null;reviewResults:{bank:string;at:number;independent:boolean;attemptIds:string[]}[];lastAt:number};
export type LoopResult={ok:true;state:Snapshot;view:LoopView}|{ok:false;message:string;raw?:string};
type Question={id:string;stage:string;target:string;context:string;prompt:string;kind:string;options?:string[];accepted:string[];why:string};
export const loopModel=core as unknown as {
 initialState:(at?:number)=>Snapshot;
 restore:(raw:string,now?:number)=>LoopResult;
 transition:(state:Snapshot,action:Action,at?:number)=>LoopResult;
 currentQuestion:(view:LoopView)=>Question|null;
 teachingFor:(view:LoopView)=>{target:string;title:string;explanation:string;example:string;meaning:string;check:string;source:string}[];
 recommendation:(view:LoopView,now?:number)=>{kind:string;lessonId:string;dueAt?:number};
};
export type LoopInputs={version:1;corrections:Record<string,{answer:string;note:string}>};
const emptyInputs=():LoopInputs=>({version:1,corrections:{}});
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const keys=(value:Record<string,unknown>,allowed:string[])=>Object.keys(value).every(k=>allowed.includes(k))&&allowed.every(k=>Object.hasOwn(value,k));
const bounded=(raw:string)=>raw.length<=MAX_RAW&&new TextEncoder().encode(raw).length<=MAX_RAW;
const actionFields:Record<string,string[]>={draft:['type','value'], 'own-draft':['type','value'],source:['type','source'],correct:['type','id','answer','note'],help:['type'],'not-yet':['type'],submit:['type'],retry:['type'],next:['type'],finish:['type'],review:['type']};

/** Validate the whole finite envelope before replaying. Unknown raw is never reset. */
export function parseCourseLoop(raw:string,now=Date.now()):LoopResult {
 try{
  if(!bounded(raw))throw Error();
  const value:unknown=JSON.parse(raw);
  if(!object(value)||!keys(value,['kind','version','lessonId','contentVersion','createdAt','events'])||!Array.isArray(value.events))throw Error();
  for(const event of value.events){
   if(!object(event)||typeof event.type!=='string'||!actionFields[event.type]||!keys(event,[...actionFields[event.type],'at']))throw Error();
  }
  return loopModel.restore(raw,now);
 }catch{return {ok:false,message:'课程记录格式或容量不支持，原文仍保留。请在记录页备份后核对。',raw}}
}
export function parseLoopInputs(raw:string|null):LoopInputs {
 if(raw===null)return emptyInputs();
 if(!bounded(raw))throw Error('订正草稿超过容量，原文保留。');
 const value:unknown=JSON.parse(raw);
 if(!object(value)||!keys(value,['version','corrections'])||value.version!==1||!object(value.corrections))throw Error('订正草稿格式不支持，原文保留。');
 for(const [id,item] of Object.entries(value.corrections)){
  if(!byId.has(id)||!id.startsWith('independent-')||!object(item)||!keys(item,['answer','note'])||typeof item.answer!=='string'||item.answer.length>1000||typeof item.note!=='string'||item.note.length>1000)throw Error('订正草稿格式不支持，原文保留。');
 }
 return value as unknown as LoopInputs;
}
export type CourseRead={storage:StateStorageSnapshot;state:State;raw:string|null;inputsRaw:string|null};
export async function readCourseLoop():Promise<CourseRead>{
 let storage:StateStorageSnapshot;
 try{storage=await readStateSnapshot()}catch{storage={mode:'legacy',raw:localStorage.getItem(legacyKey)}}
 // A missing database key can still contain the existing legacy record. Migrate
 // it into the guarded database writer only after a real course action.
 const legacy=storage.mode==='db'&&storage.raw===null?localStorage.getItem(legacyKey):null;
 const value=storage.raw===null?(legacy===null?initial:JSON.parse(legacy)):JSON.parse(storage.raw);
 if(!validateState(value))throw Error('学习记录格式异常，未覆盖原始记录。请先在记录页备份。');
 return {storage,state:value,raw:value.drafts[courseLoopKey]??null,inputsRaw:value.drafts[courseLoopInputsKey]??null};
}
export function notifyProgressSaved(){
 window.dispatchEvent(new Event('english-studio-progress-saved'));
 if(typeof BroadcastChannel!=='undefined'){const channel=new BroadcastChannel('english-studio-progress');channel.postMessage('saved');channel.close()}
}
/** Re-read full State; preserve other entries, refuse any same-course change,
 * then compare the full frozen value inside the existing atomic writer. */
export async function commitCourseLoop(expected:CourseRead,nextRaw:string,nextInputs:LoopInputs,unchanged:()=>boolean):Promise<CourseRead>{
 const parsed=parseCourseLoop(nextRaw);if(!parsed.ok)throw Error(parsed.message);
 const inputsRaw=JSON.stringify(nextInputs);parseLoopInputs(inputsRaw);
 for(let retry=0;retry<4;retry++){
  if(!unchanged())throw new StateStorageConflict();
  const fresh=await readCourseLoop();
  if(fresh.storage.mode!==expected.storage.mode||fresh.raw!==expected.raw||fresh.inputsRaw!==expected.inputsRaw)throw Error('另一页面修改了本课。当前输入仍保留，未覆盖已保存记录。先保存未提交内容，再读取最新记录。');
  const next:State={...fresh.state,drafts:{...fresh.state.drafts,[courseLoopKey]:nextRaw,[courseLoopInputsKey]:inputsRaw}};
  try{
   const guard={expectedRaw:fresh.storage.raw,unchanged};
   if(fresh.storage.mode==='db')await writeState(next,guard);else await writeLegacyState(next,legacyKey,guard);
   const confirmed=await readCourseLoop();
   if(confirmed.raw!==nextRaw||confirmed.inputsRaw!==inputsRaw)throw Error('保存后的本课记录发生变化，当前内容保留，请重新读取核对。');
   notifyProgressSaved();return confirmed;
  }catch(error){if(!(error instanceof StateStorageConflict)||!unchanged()||retry===3)throw error}
 }
 throw new StateStorageConflict();
}
