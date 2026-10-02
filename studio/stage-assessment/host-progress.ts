import {initial,validateState,type State} from '../app/model';
import {readStateSnapshot,writeState,writeLegacyState,restoreStateSnapshot,restoreLegacyStateSnapshot,StateStorageConflict,type StateStorageSnapshot} from '../app/offline-store';
import {append,draftKey,readRecord} from './model';
const legacyKey='english-studio-v1';
export type StageCheckpoint={storage:StateStorageSnapshot;state:State;raw:string|undefined};
export async function readStageCheckpoint():Promise<StageCheckpoint>{
 let storage:StateStorageSnapshot;
 try{storage=await readStateSnapshot()}catch{storage={mode:'legacy',raw:localStorage.getItem(legacyKey)}}
 const legacy=storage.mode==='db'&&storage.raw===null?localStorage.getItem(legacyKey):null;
 const value:unknown=storage.raw===null?(legacy===null?initial:JSON.parse(legacy)):JSON.parse(storage.raw);
 if(!validateState(value))throw Error('已有学习记录无效，原文保留；未建立新的阶段store。');
 return {storage,state:value,raw:value.drafts[draftKey]};
}
export async function commitStageDraft(expectedRaw:string|undefined,nextRaw:string,unchanged:()=>boolean=()=>true):Promise<boolean>{
 const read=readRecord(nextRaw);if(read.status!=='ready')throw Error(read.status==='blocked'?read.reason:'证据缺失。');
 for(let retry=0;retry<4;retry++){
  if(!unchanged())throw new StateStorageConflict();
  const current=await readStageCheckpoint();
  if(current.raw!==expectedRaw)throw Error('另一页面或恢复操作修改了阶段证据。当前输入保留，未覆盖原答。');
  const next:State={...current.state,drafts:{...current.state.drafts,[draftKey]:nextRaw}};
  try{
   const guard={expectedRaw:current.storage.raw,unchanged};
   if(current.storage.mode==='db')await writeState(next,guard);else await writeLegacyState(next,legacyKey,guard);
   if((await readStageCheckpoint()).raw!==nextRaw)throw Error('持久保存回读未确认。原输入保留，请重新核对。');
   window.dispatchEvent(new Event('english-studio-progress-saved'));return true;
  }catch(e){if(!(e instanceof StateStorageConflict)||!unchanged()||retry===3)throw e;}
 }
 throw new StateStorageConflict();
}
const samePrefix=(a:ReturnType<typeof JSON.parse>,b:ReturnType<typeof JSON.parse>)=>a.courseVersion===b.courseVersion&&a.priorLearning===b.priorLearning&&a.events.length<=b.events.length&&a.events.every((e:unknown,i:number)=>JSON.stringify(e)===JSON.stringify(b.events[i]));
/** Pure backup preparation: no practice event or date rewrite. A normal same-
 * evidence roundtrip is byte-identical. Older/missing backups retain newer live
 * stage evidence; divergent history is refused before any persistence. */
export function prepareStageBackupRestore(current:State,incoming:State,now=Date.now()):State{
 if(!validateState(current)||!validateState(incoming))throw Error('整站备份格式无效，未修改记录。');
 const existing=current.drafts[draftKey],source=incoming.drafts[draftKey];
 if(source===undefined)return existing===undefined?incoming:{...incoming,drafts:{...incoming.drafts,[draftKey]:existing}};
 const restored=readRecord(source,now),live=readRecord(existing,now);
 if(restored.status!=='ready')throw Error(restored.status==='blocked'?restored.reason:'恢复证据缺失。');
 if(existing===source)return incoming;
 if(live.status==='blocked')throw Error(live.reason);
 if(live.status==='ready'){
  if(JSON.stringify(restored.record.events.slice(0,-1))===JSON.stringify(live.record.events)&&restored.record.events.at(-1)?.command.type==='restore'&&restored.record.courseVersion===live.record.courseVersion&&restored.record.priorLearning===live.record.priorLearning)return incoming;
  if(samePrefix(restored.record,live.record))return {...incoming,drafts:{...incoming.drafts,[draftKey]:existing!}};
  if(!samePrefix(live.record,restored.record))throw Error('阶段首答/草稿历史分叉，恢复会覆盖证据；未写入任何记录。');
 }
 if(restored.record.events.at(-1)?.command.type==='restore')return incoming;
 const marked=append(restored.record,{id:crypto.randomUUID(),at:now,command:{type:'restore'}},now);
 return {...incoming,drafts:{...incoming.drafts,[draftKey]:JSON.stringify(marked)}};
}
export async function restoreStageCheckpoint(checkpoint:StageCheckpoint,incoming:State,unchanged:()=>boolean,rollbackTo?:StateStorageSnapshot){
 if(!validateState(incoming))throw Error('整站备份格式无效。');
 const current=await readStageCheckpoint();
 if(current.storage.mode!==checkpoint.storage.mode||current.storage.raw!==checkpoint.storage.raw||!unchanged())throw new StateStorageConflict();
 const guard={expectedRaw:current.storage.raw,unchanged};
 const next=rollbackTo?incoming:prepareStageBackupRestore(current.state,incoming);
 if(rollbackTo){
  if(current.storage.mode==='db')await restoreStateSnapshot(rollbackTo,guard);else await restoreLegacyStateSnapshot(rollbackTo,legacyKey,guard);
 }else if(current.storage.mode==='db')await writeState(next,guard);else await writeLegacyState(next,legacyKey,guard);
 const confirmed=await readStageCheckpoint();
 const expected=rollbackTo?rollbackTo.raw:JSON.stringify(next);
 if(confirmed.storage.raw!==expected)throw Error('整站恢复回读未确认。保留备份，未宣称恢复成功。');
 window.dispatchEvent(new Event('english-studio-progress-restored'));return confirmed;
}
