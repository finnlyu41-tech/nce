import {initial,validateState,type State} from '../app/model';
import {readStateSnapshot,writeState,writeLegacyState,StateStorageConflict,type StateStorageSnapshot} from '../app/offline-store';
import {placementKey,readPlacement} from './model';
const legacyKey='english-studio-v1';
export type PlacementCheckpoint={storage:StateStorageSnapshot;state:State;raw:string|undefined};
/** Read the same classic State and guarded writer; no new persistence namespace. */
export async function readPlacementCheckpoint():Promise<PlacementCheckpoint>{
 let storage:StateStorageSnapshot;
 try{storage=await readStateSnapshot()}catch{storage={mode:'legacy',raw:localStorage.getItem(legacyKey)}}
 const legacy=storage.mode==='db'&&storage.raw===null?localStorage.getItem(legacyKey):null;
 const state:unknown=storage.raw===null?(legacy===null?initial:JSON.parse(legacy)):JSON.parse(storage.raw);
 if(!validateState(state))throw Error('本机学习记录无效，原文保留，请先备份核对。');
 return {storage,state,raw:state.drafts[placementKey]};
}
/** Rebase other namespaces, compare placement evidence, then atomically commit. */
export async function commitPlacementCheckpoint(expected:PlacementCheckpoint,nextRaw:string,unchanged:()=>boolean):Promise<PlacementCheckpoint>{
 const previous=readPlacement(expected.raw);if(previous.status==='blocked')throw Error(previous.reason);
 const parsed=readPlacement(nextRaw);if(parsed.status==='blocked')throw Error(parsed.reason);
 if(JSON.stringify(parsed.value.events.slice(0,previous.value.events.length))!==JSON.stringify(previous.value.events))throw Error('诊断证据只能追加；首答、曝光和帮助历史仍保留。');
 for(let retry=0;retry<4;retry++){
  if(!unchanged())throw new StateStorageConflict();
  const current=await readPlacementCheckpoint();
  if(current.storage.mode!==expected.storage.mode||current.raw!==expected.raw)throw Error('另一页面或恢复操作修改了诊断记录。当前输入保留，尚未覆盖原记录。');
  const state:State={...current.state,drafts:{...current.state.drafts,[placementKey]:nextRaw}};
  try{
   const guard={expectedRaw:current.storage.raw,unchanged};
   if(current.storage.mode==='db')await writeState(state,guard);else await writeLegacyState(state,legacyKey,guard);
   const confirmed=await readPlacementCheckpoint();
   if(confirmed.raw!==nextRaw)throw Error('保存后的诊断记录已改变，输入保留，请重新核对。');
   window.dispatchEvent(new Event('english-studio-progress-saved'));
   return confirmed;
  }catch(error){if(!(error instanceof StateStorageConflict)||!unchanged()||retry===3)throw error}
 }
 throw new StateStorageConflict();
}
