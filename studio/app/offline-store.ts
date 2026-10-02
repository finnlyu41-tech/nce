import type {State} from './model';
export type LocalAudio={key:string,name:string,type:string,blob:Blob};
export type StateStorageSnapshot={mode:'db'|'legacy';raw:string|null};
export type StateWriteGuard={expectedRaw:string|null;unchanged?:()=>boolean};
const stateRaw=(value:unknown)=>value===undefined?null:JSON.stringify(value);
export class StateStorageConflict extends Error {constructor(){super('学习记录已更新，请重新核对后恢复。')}}
const stateConflict=()=>new StateStorageConflict();
let connection:Promise<IDBDatabase>|undefined;
function database(){if(!connection)connection=new Promise<IDBDatabase>((resolve,reject)=>{if(!('indexedDB' in window)){reject(Error('此浏览器不支持本地资料库'));return}const r=indexedDB.open('english-studio-offline',1);r.onupgradeneeded=()=>{r.result.createObjectStore('state');r.result.createObjectStore('audio',{keyPath:'key'})};r.onsuccess=()=>{r.result.onversionchange=()=>{r.result.close();connection=undefined};resolve(r.result)};r.onerror=()=>{connection=undefined;reject(r.error)};r.onblocked=()=>{connection=undefined;reject(Error('请关闭其他学习窗口后重试'))}});return connection}
export async function readState():Promise<State|undefined>{const db=await database();return new Promise((resolve,reject)=>{const t=db.transaction('state'),r=t.objectStore('state').get('current');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
/** Freeze the persisted value, including an absent key, without writing. */
export async function readStateSnapshot():Promise<StateStorageSnapshot>{
 const db=await database();return new Promise((resolve,reject)=>{
  const t=db.transaction('state'),r=t.objectStore('state').get('current');let raw:string|null=null,error:unknown;
  r.onsuccess=()=>{try{raw=stateRaw(r.result)}catch(cause){error=cause;t.abort()}};
  t.oncomplete=()=>resolve({mode:'db',raw});t.onabort=()=>reject(error||t.error||Error('本机记录读取失败'));t.onerror=()=>{};
 });
}
/** Compare and write in ONE readwrite transaction; resolve only after commit.
 * undefined is used only to restore a previously absent key during rollback.
 */
async function commitState(state:unknown,guard?:StateWriteGuard){
 const db=await database();return new Promise<void>((resolve,reject)=>{
  const t=db.transaction('state','readwrite'),store=t.objectStore('state');let error:unknown;
  const write=()=>{if(state===undefined)store.delete('current');else store.put(state,'current')};
  if(guard){const r=store.get('current');r.onsuccess=()=>{try{
   if(stateRaw(r.result)!==guard.expectedRaw||guard.unchanged&&!guard.unchanged()){error=stateConflict();t.abort();return}write();
  }catch(cause){error=cause;t.abort()}};}else write();
  t.oncomplete=()=>resolve();t.onabort=()=>reject(error||t.error||Error('本机保存失败'));t.onerror=()=>{};
 });
}
export async function writeState(state:State|undefined,guard?:StateWriteGuard){return commitState(state,guard)}
/** Rollback restores the actual prior value, even if it was a damaged record. */
export async function restoreStateSnapshot(snapshot:StateStorageSnapshot,guard:StateWriteGuard){
 if(snapshot.mode!=='db')throw Error('回退存储位置无效');
 return commitState(snapshot.raw===null?undefined:JSON.parse(snapshot.raw),guard);
}
/** All legacy writers in this version share this lock. A guarded restore has
 * no unlocked fallback; older tabs that do not use this protocol are outside it.
 */
async function writeLegacyRaw(raw:string|null,key:string,guard?:StateWriteGuard){
 const locks=globalThis.navigator?.locks;
 if(guard&&!locks?.request)throw Error('此浏览器无法安全核对文字记录，请改用支持本地资料库的浏览器恢复。');
 const write=()=>{
  if(guard&&(localStorage.getItem(key)!==guard.expectedRaw||guard.unchanged&&!guard.unchanged()))throw stateConflict();
  if(raw===null)localStorage.removeItem(key);else localStorage.setItem(key,raw);
 };
 if(locks?.request)await locks.request('english-studio-progress:'+key,{mode:'exclusive'},write);else write();
}
export async function writeLegacyState(state:State|undefined,key:string,guard?:StateWriteGuard){return writeLegacyRaw(state===undefined?null:JSON.stringify(state),key,guard)}
export async function restoreLegacyStateSnapshot(snapshot:StateStorageSnapshot,key:string,guard:StateWriteGuard){
 if(snapshot.mode!=='legacy')throw Error('回退存储位置无效');
 return writeLegacyRaw(snapshot.raw,key,guard);
}
export async function readAudio(key:string):Promise<LocalAudio|undefined>{const db=await database();return new Promise((resolve,reject)=>{const r=db.transaction('audio').objectStore('audio').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
export async function saveCollection(state:State,media:LocalAudio[]){const db=await database();return new Promise<void>((resolve,reject)=>{const t=db.transaction(['audio','state'],'readwrite');const a=t.objectStore('audio');for(const item of media)a.put(item);t.objectStore('state').put(state,'current');t.oncomplete=()=>resolve();t.onabort=()=>reject(t.error||Error('本地资料保存失败，原记录未改变'));t.onerror=()=>{}})}
