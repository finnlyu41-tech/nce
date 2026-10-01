import type {SavedTake} from '../app/recording-feedback';
import type {PronunciationResult} from '../app/pronunciation';

export type SpeechAudio={revision:string;takes:SavedTake[]};
const object=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const score=(x:unknown)=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=100;
const seconds=(x:unknown)=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=30;
const text=(x:unknown,max:number)=>typeof x==='string'&&x.length<=max;
function validResult(x:unknown):x is PronunciationResult {
  return object(x)&&text(x.text,4000)&&score(x.accuracy)&&score(x.fluency)&&score(x.completeness)&&Array.isArray(x.words)&&x.words.length<=200&&x.words.every(w=>object(w)&&text(w.word,100)&&(w.accuracy===null||score(w.accuracy))&&['None','Omission','Insertion','Mispronunciation'].includes(String(w.error))&&seconds(w.start)&&seconds(w.duration)&&(w.phonemes===undefined||Array.isArray(w.phonemes)&&w.phonemes.length<=100&&w.phonemes.every(p=>object(p)&&text(p.phoneme,100)&&(p.accuracy===null||score(p.accuracy)))));
}
export function validSpeechAudio(x:unknown):x is SpeechAudio {
  return object(x)&&text(x.revision,80)&&Array.isArray(x.takes)&&x.takes.length<=2&&x.takes.every(t=>object(t)&&typeof t.id==='string'&&/^take-[a-z0-9-]{1,75}$/.test(t.id)&&t.blob instanceof Blob&&t.blob.size>0&&t.blob.size<=2_000_000&&(t.result===undefined||validResult(t.result)))&&new Set(x.takes.map(t=>t.id)).size===x.takes.length;
}
function openStore():Promise<IDBDatabase>{
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('wayfinder-recordings-v2',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('recordings');
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(Error('本机录音库暂时不可用。'));
  });
}
export async function readSpeechAudio(id:string):Promise<SpeechAudio|undefined>{
  const db=await openStore();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('recordings','readonly'),request=tx.objectStore('recordings').get(`sentence:${id}`);
    tx.oncomplete=()=>{db.close();const value=request.result;if(value!==undefined&&!validSpeechAudio(value)){reject(Error('本句录音记录无法读取，原记录仍保留。请使用已下载的音频，或检查浏览器存储。'));return}resolve(value)};
    tx.onabort=tx.onerror=()=>{db.close();reject(Error('本机录音暂时无法读取。'))};
  });
}
// Both takes change in one transaction. A second tab cannot overwrite a newer pair.
export async function writeSpeechAudio(id:string,expected:string|undefined,takes:SavedTake[]):Promise<string>{
  if(!validSpeechAudio({revision:expected||'new',takes}))throw Error('本句录音或评估数据不完整，未覆盖之前的录音。');
  const db=await openStore(),revision=crypto.randomUUID();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('recordings','readwrite'),store=tx.objectStore('recordings');
    let conflict=false;
    const request=store.get(`sentence:${id}`);
    request.onsuccess=()=>{if(request.result?.revision!==expected){conflict=true;tx.abort();return}store.put({revision,takes:takes.slice(0,2)},`sentence:${id}`)};
    tx.oncomplete=()=>{db.close();resolve(revision)};
    tx.onabort=tx.onerror=()=>{db.close();reject(Error(conflict?'另一页面已更新本句录音。请先下载当前录音，再重新打开本句。':'录音尚未存入本机，请先下载保留。'))};
  });
}
