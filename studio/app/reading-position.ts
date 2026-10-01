// Reading position belongs to a browser-history entry, never to learning progress.
type PositionState={version:1;entry:string;source?:string;line?:number};
export type ReadingEntry={url:string;id:string};
const key='studioReadingPosition';
let fallback:{url:string;position:PositionState}|undefined;
const record=(state:unknown):PositionState|undefined=>{
 const value=state&&typeof state==='object'?(state as Record<string,unknown>)[key]:undefined;
 if(!value||typeof value!=='object')return;
 const position=value as PositionState;
 return position.version===1&&typeof position.entry==='string'&&position.entry.length>0&&position.entry.length<=80?position:undefined;
};
const envelope=(state:unknown)=>state&&typeof state==='object'&&!Array.isArray(state)?state:{};
function historyState():unknown{try{return history.state}catch{return undefined}}
function currentPosition(){
 const stored=record(historyState());
 return fallback?.url===location.href&&(!stored||stored.entry===fallback.position.entry)?fallback.position:stored;
}
export function ensureReadingEntry(traversal=false){
 if(record(historyState()))return;
 if(!traversal&&fallback?.url===location.href)return;
 const position:PositionState={version:1,entry:crypto.randomUUID()};
 fallback={url:location.href,position};
 try{history.replaceState({...envelope(historyState()),[key]:position},'')}catch{}
}
export function readingEntrySnapshot(){
 return JSON.stringify([location.href,currentPosition()?.entry||'']);
}
export function readingEntryMatches(entry:ReadingEntry){
 return entry.url===location.href&&!!entry.id&&currentPosition()?.entry===entry.id;
}
export function readReadingLine(source:string|undefined,rowCount:number,state?:unknown){
 const position=arguments.length===3?record(state):currentPosition(),line=position?.line;
 return source&&position?.source===source&&Number.isInteger(line)&&line!>=0&&line!<rowCount?line!:0;
}
export function writeReadingLine(entry:ReadingEntry,source:string|undefined,rowCount:number,line:number){
 if(!source||!readingEntryMatches(entry)||!Number.isInteger(line)||line<0||line>=rowCount)return false;
 const previous=currentPosition()!;
 if(previous.source!==source||previous.line!==line){
  const position={...previous,source,line};fallback={url:location.href,position};
  try{history.replaceState({...envelope(historyState()),[key]:position},'')}catch{}
 }
 return true;
}

// A compact content identity for UI restoration, not a security or provenance hash.
export function readingContentId(value:unknown){
 const text=JSON.stringify(value);let first=2166136261,second=5381;
 for(let i=0;i<text.length;i++){const char=text.charCodeAt(i);first=Math.imul(first^char,16777619);second=Math.imul(second,33)^char;}
 return `${text.length}:${(first>>>0).toString(16)}:${(second>>>0).toString(16)}`;
}
export async function readingAudioId(blob:Blob){
 return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())),byte=>byte.toString(16).padStart(2,'0')).join('');
}
