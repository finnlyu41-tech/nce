import {initial,validateState,type State} from './model';
import {readStateSnapshot,StateStorageConflict,writeLegacyState,writeState} from './offline-store';

// Histories and schedulers are indivisible. Only separate dictionary entries
// can be rebased; simultaneous edits to one entry never win by timestamp.
const dictionaries=new Set(['drafts','nce','scores','mistakes','cards']);
const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
export class ProgressEditConflict extends Error {
 constructor(){super('另一页面更改了同一段记录。本次输入仍在当前页面，尚未覆盖已保存记录。请先保存进度备份，再读取最新记录。')}
}
function mergeValue(base:unknown,edited:unknown,current:unknown):unknown {
 if(same(edited,base))return current;
 if(same(current,base)||same(current,edited))return edited;
 throw new ProgressEditConflict();
}
export function mergeProgressEdits(base:State,edited:State,current:State):State {
 const before=base as unknown as Record<string,unknown>,local=edited as unknown as Record<string,unknown>,fresh=current as unknown as Record<string,unknown>,next:Record<string,unknown>={};
 for(const key of new Set([...Object.keys(before),...Object.keys(local),...Object.keys(fresh)])){
  if(dictionaries.has(key)){
   const b=(before[key]||{}) as Record<string,unknown>,e=(local[key]||{}) as Record<string,unknown>,c=(fresh[key]||{}) as Record<string,unknown>,entries:Record<string,unknown>={};
   for(const id of new Set([...Object.keys(b),...Object.keys(e),...Object.keys(c)])){
    const value=mergeValue(b[id],e[id],c[id]);if(value!==undefined)entries[id]=value;
   }
   if(key in before||key in local||key in fresh)next[key]=entries;
  }else {
   if(['attempts','correct'].includes(key)&&!same(local[key],before[key])&&!same(fresh[key],before[key]))throw new ProgressEditConflict();
   const value=mergeValue(before[key],local[key],fresh[key]);if(value!==undefined)next[key]=value;
  }
 }
 if(!validateState(next))throw new ProgressEditConflict();
 return next;
}
export async function saveProgressEdits(base:State,edited:State,mode:string,key:string,unchanged:()=>boolean):Promise<State>{
 for(let attempt=0;attempt<4;attempt++){
  if(!unchanged())throw new StateStorageConflict();
  const snapshot=mode==='db'?await readStateSnapshot():{raw:localStorage.getItem(key)};
  const fresh=snapshot.raw===null?initial:JSON.parse(snapshot.raw);
  if(!validateState(fresh))throw Error('已保存记录需要检查，未覆盖原文。请先备份当前输入。');
  const next=mergeProgressEdits(base,edited,fresh);
  try{
   const guard={expectedRaw:snapshot.raw,unchanged};
   if(mode==='db')await writeState(next,guard);else await writeLegacyState(next,key,guard);
   return next;
  }catch(error){if(!(error instanceof StateStorageConflict)||!unchanged()||attempt===3)throw error;}
 }
 throw new StateStorageConflict();
}
