import type {VideoSource} from './manifest';
export type VideoIdentity={courseId:string;book:VideoSource['book'];lessons:number[];bvid:string;p:number};
export type AccessKind='open-link'|'load-player'|'open-summary';
export type AccessEvent={kind:AccessKind;at:number;sourceUrl:string;evidenceId:string};
export type VideoNotes={kind:'course-video-notes';version:1;identity:VideoIdentity;text:string;access:AccessEvent[]};
export function identityFor(courseId:string,source:VideoSource):VideoIdentity{if(!/^[a-z0-9-]{1,80}$/.test(courseId))throw Error('课程标识无效。');return {courseId,book:source.book,lessons:[...source.lessons],bvid:source.bvid,p:source.p}}
export const noteKey=(id:VideoIdentity)=>`course-video-notes-v1:${id.courseId}:${id.book}:${id.lessons.join('-')}:${id.bvid}:${id.p}`;
const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
export function parseNotes(raw:string|null,id:VideoIdentity):VideoNotes{
 if(raw===null)return {kind:'course-video-notes',version:1,identity:structuredClone(id),text:'',access:[]};
 try{
  if(raw.length>1024*1024)throw Error();const n=JSON.parse(raw);
  if(!n||Object.keys(n).sort().join(',')!=='access,identity,kind,text,version'||n.kind!=='course-video-notes'||n.version!==1||!same(n.identity,id)||typeof n.text!=='string'||n.text.length>12000||!Array.isArray(n.access)||n.access.length>4096)throw Error();
  let last=0;for(const e of n.access){if(!e||Object.keys(e).sort().join(',')!=='at,evidenceId,kind,sourceUrl'||!['open-link','load-player','open-summary'].includes(e.kind)||!Number.isSafeInteger(e.at)||e.at<last||e.at<=0||e.sourceUrl!==`https://www.bilibili.com/video/${id.bvid}/?p=${id.p}`||typeof e.evidenceId!=='string'||!e.evidenceId||e.evidenceId.length>120)throw Error();last=e.at}
  return n;
 }catch{throw Error('这份视频笔记格式暂不支持，原文仍保留。请先备份核对。')}
}
export function editNotes(notes:VideoNotes,text:string){if(text.length>12000)throw Error('笔记最多 12000 字。');return {...notes,text}}
export function addAccess(notes:VideoNotes,kind:AccessKind,source:VideoSource,at=Date.now()):VideoNotes{
 if(notes.access.length>=4096)throw Error('本课视频访问记录已满，请先备份。');
 return {...notes,access:[...notes.access,{kind,at:Math.max(at,notes.access.at(-1)?.at||0),sourceUrl:source.sourceUrl,evidenceId:kind==='open-summary'?source.summary?.evidence[0].id||'':kind==='load-player'?source.embed?.id||'':source.mapping.id}]};
}
