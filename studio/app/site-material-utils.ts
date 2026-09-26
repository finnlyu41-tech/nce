import {NceBookId,bookCounts} from './model';
export type SiteMaterial={id:string;name:string;book:NceBookId;lesson:number;type:'application/pdf'|'text/plain'|`audio/${string}`;size:number;sha256:string;parts:{path:string;size:number}[]};
export function validateMaterials(v:any):v is {version:1;files:SiteMaterial[]}{
  if(v?.version!==1||!Array.isArray(v.files)||v.files.length>2000)return false;
  const ids=new Set<string>();
  return v.files.every((f:any)=>{
    if(!f||typeof f.id!=='string'||!/^[A-Za-z0-9_-]{1,100}$/.test(f.id)||ids.has(f.id)||typeof f.name!=='string'||!f.name.trim()||f.name.length>250||!Object.hasOwn(bookCounts,f.book)||!Number.isInteger(f.lesson)||f.lesson<0||f.lesson>bookCounts[f.book as NceBookId]||!['application/pdf','text/plain','audio/mpeg','audio/mp4','audio/wav','audio/ogg','audio/webm','audio/flac','audio/aac'].includes(f.type)||!Number.isInteger(f.size)||f.size<1||f.size>200*1024**2||!/^[a-f0-9]{64}$/.test(f.sha256)||!Array.isArray(f.parts)||f.parts.length<1||f.parts.length>25)return false;
    ids.add(f.id);const parts=new Set<string>();
    return f.parts.every((p:any)=>{if(!p||typeof p.path!=='string'||!new RegExp('^/materials/'+f.sha256+'/[0-9]{4}\\.bin$').test(p.path)||parts.has(p.path)||!Number.isInteger(p.size)||p.size<1||p.size>8*1024**2)return false;parts.add(p.path);return true})&&f.parts.reduce((s:number,p:any)=>s+p.size,0)===f.size;
  });
}
export async function loadSiteMaterial(file:SiteMaterial,signal?:AbortSignal,progress?:(value:number)=>void){
  if(!validateMaterials({version:1,files:[file]}))throw Error('教材目录格式需要检查');
  const parts:BlobPart[]=[];let downloaded=0;
  for(const part of file.parts){const r=await fetch(part.path,{signal,credentials:'same-origin',redirect:'error'});if(!r.ok)throw Error(`教材文件暂时无法读取（${r.status}）`);const buffer=await r.arrayBuffer();if(buffer.byteLength!==part.size)throw Error('教材下载不完整，请重试');parts.push(buffer);downloaded+=buffer.byteLength;progress?.(downloaded/file.size*100)}
  const blob=new Blob(parts,{type:file.type});const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())),x=>x.toString(16).padStart(2,'0')).join('');
  if(hash!==file.sha256)throw Error('教材内容校验不通过，请重新加载');return blob;
}
