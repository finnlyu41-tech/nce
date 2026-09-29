import pageMapping from './data/nce-pages.json';
import {type NceBookId, bookCounts} from './model';
import {withNetworkTimeout} from './network';
export type SiteMaterial = {
  id:string; name:string; book:NceBookId; lesson:number;
  type:'application/pdf'|'text/plain'|`audio/${string}`;
  size:number; sha256:string; parts:{path:string;size:number}[];
  accent?:'us'|'uk'|'unknown'; pairId?:string; title?:string;
  sourceLessons?:number[]; lessonNote?:string;
  pages?:number; textStatus?:'scan'|'extractable'|'unchecked';
};
export type MaterialManifest={version:1;files:SiteMaterial[];notices?:string[]};
const idPattern=/^[A-Za-z0-9_-]{1,100}$/;
const shortText=(v:unknown,max:number)=>v===undefined||typeof v==='string'&&v.length<=max;
export function validateMaterials(v:unknown):v is MaterialManifest {
  const m=v as MaterialManifest|null;
  if(m?.version!==1||!Array.isArray(m.files)||m.files.length>2000)return false;
  if(m.notices!==undefined&&(!Array.isArray(m.notices)||m.notices.length>2000||!m.notices.every(s=>typeof s==='string'&&s.length<=1000)))return false;
  const ids=new Set<string>();
  const valid=m.files.every(f=>{
    if(!f||typeof f.id!=='string'||!idPattern.test(f.id)||ids.has(f.id)||typeof f.name!=='string'||!f.name.trim()||f.name.length>250||
      !Object.hasOwn(bookCounts,f.book)||!Number.isInteger(f.lesson)||f.lesson<0||f.lesson>bookCounts[f.book]||
      !['application/pdf','text/plain','audio/mpeg','audio/mp4','audio/wav','audio/ogg','audio/webm','audio/flac','audio/aac'].includes(f.type)||
      !Number.isInteger(f.size)||f.size<1||f.size>200*1024**2||typeof f.sha256!=='string'||!/^[a-f0-9]{64}$/.test(f.sha256)||
      !Array.isArray(f.parts)||f.parts.length<1||f.parts.length>25||![undefined,'us','uk','unknown'].includes(f.accent)||
      (f.pairId!==undefined&&(typeof f.pairId!=='string'||!idPattern.test(f.pairId)))||!shortText(f.title,120)||!shortText(f.lessonNote,500)||
      (f.pages!==undefined&&(!Number.isInteger(f.pages)||f.pages<1||f.pages>10000))||![undefined,'scan','extractable','unchecked'].includes(f.textStatus)||
      (f.sourceLessons!==undefined&&(!Array.isArray(f.sourceLessons)||f.sourceLessons.length>2||new Set(f.sourceLessons).size!==f.sourceLessons.length||f.sourceLessons.some(n=>!Number.isInteger(n)||n<1||n>bookCounts[f.book])))
    )return false;
    ids.add(f.id);
    return f.parts.every((p,index)=>p&&p.path===`/materials/${f.sha256}/${String(index).padStart(4,'0')}.bin`&&Number.isInteger(p.size)&&p.size>0&&p.size<=8*1024**2)&&f.parts.reduce((total,p)=>total+p.size,0)===f.size;
  });
  if(!valid)return false;
  const pairs=new Map<string,SiteMaterial[]>();
  for(const file of m.files){
    if(!file.pairId)continue;
    const group=pairs.get(file.pairId)||[];
    if(file.type==='application/pdf'||group.some(f=>f.book!==file.book||f.lesson!==file.lesson||f.accent!==file.accent||(f.type==='text/plain')===(file.type==='text/plain')))return false;
    group.push(file);pairs.set(file.pairId,group);
  }
  return true;
}
export function pairedMaterials(files:SiteMaterial[],selected:SiteMaterial){
  return selected.pairId?files.filter(f=>f.pairId===selected.pairId&&f.book===selected.book&&f.lesson===selected.lesson&&f.accent===selected.accent):[selected];
}
// Mappings are tied to exact PDFs and verified against their lesson headings.
export function materialLessonPage(file:SiteMaterial,lesson:number):number|undefined {
  const map=pageMapping[file.book];
  if(file.type!=='application/pdf'||file.sha256!==map.sourceSha256||!Number.isInteger(lesson))return undefined;
  return (map.starts as Record<string,number>)[String(lesson)];
}
let manifestCache:{data:MaterialManifest;expires:number}|undefined;
const materialCache=new Map<string,Blob>();
const cacheLimit=24*1024**2;
let cacheBytes=0;
export function clearMaterialCache(){manifestCache=undefined;materialCache.clear();cacheBytes=0}
export async function readMaterialManifest(signal?:AbortSignal,refresh=false):Promise<MaterialManifest>{
 if(signal?.aborted)throw new DOMException('Aborted','AbortError');
 if(!refresh&&manifestCache&&manifestCache.expires>Date.now())return manifestCache.data;
 return withNetworkTimeout(async requestSignal=>{
  const response=await fetch('/materials/manifest.json',{signal:requestSignal,cache:'no-store',credentials:'same-origin',redirect:'error'});
  if(!response.ok)throw Error(`暂时无法读取教材目录（${response.status}）`);
  const text=await response.text();
  if(text.length>4*1024**2)throw Error('教材目录超过大小限制');
  let data:unknown;
  try{data=JSON.parse(text)}catch{throw Error('教材目录暂时无法读取，请刷新重试')}
  if(!validateMaterials(data))throw Error('教材目录格式需要检查');
  if(requestSignal.aborted)throw requestSignal.reason;
  manifestCache={data,expires:Date.now()+5*60*1000};
  return data;
 },signal);
}
export async function loadSiteMaterial(file:SiteMaterial,signal?:AbortSignal,progress?:(value:number)=>void){
  if(!validateMaterials({version:1,files:[file]}))throw Error('教材目录格式需要检查');
  if(signal?.aborted)throw new DOMException('Aborted','AbortError');
  const cached=materialCache.get(file.sha256);
  if(cached&&cached.size===file.size&&cached.type===file.type){materialCache.delete(file.sha256);materialCache.set(file.sha256,cached);progress?.(100);return cached}
  return withNetworkTimeout(async (requestSignal,activity)=>{
  const parts:BlobPart[]=[];let downloaded=0;
  for(const part of file.parts){
    const r=await fetch(part.path,{signal:requestSignal,credentials:'same-origin',redirect:'error'});
    activity();
    if(!r.ok)throw Error(`教材文件暂时无法读取（${r.status}）`);
    const length=r.headers.get('Content-Length');
    if(length!==null&&Number(length)!==part.size)throw Error('教材下载不完整，请重试');
    const reader=r.body?.getReader();if(!reader)throw Error('教材下载没有内容');
    let received=0;const chunks:Uint8Array<ArrayBuffer>[]=[];
    try{for(;;){const {done,value}=await reader.read();if(done)break;if(requestSignal.aborted)throw requestSignal.reason;activity();received+=value.byteLength;if(received>part.size)throw Error('教材分段超过目录标注大小');chunks.push(new Uint8Array(value));progress?.(Math.min(99,(downloaded+received)/file.size*100))}}
    finally{await reader.cancel().catch(()=>{})}
    if(received!==part.size)throw Error('教材下载不完整，请重试');
    parts.push(...chunks);downloaded+=received;
  }
  if(requestSignal.aborted)throw requestSignal.reason;
  const blob=new Blob(parts,{type:file.type});
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())),x=>x.toString(16).padStart(2,'0')).join('');
  if(hash!==file.sha256)throw Error('教材内容校验不通过，请重新加载');
  if(requestSignal.aborted)throw requestSignal.reason;
  if(blob.size<=cacheLimit){
   // Cache only verified files, with a bounded least-recently-used footprint.
   const existing=materialCache.get(file.sha256);if(existing){cacheBytes-=existing.size;materialCache.delete(file.sha256)}
   while(cacheBytes+blob.size>cacheLimit){const key=materialCache.keys().next().value!;cacheBytes-=materialCache.get(key)!.size;materialCache.delete(key)}
   materialCache.set(file.sha256,blob);cacheBytes+=blob.size;
  }
  progress?.(100);
  return blob;
  },signal);
}
