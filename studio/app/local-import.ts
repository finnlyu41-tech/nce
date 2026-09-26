import {NceBookId,bookCounts} from './model';
export type ImportRow={path:string,book:NceBookId,lesson:number,title:string,text?:string,audio?:File,include:boolean};
export type ImportPlan={rows:ImportRow[],notices:string[]};
export async function planImport(files:File[],fallback:NceBookId):Promise<ImportPlan>{
 if(files.length>2000)throw Error('一次最多选择 2,000 个文件，请分册导入');
 const groups=new Map<string,{path:string,text?:File,audio?:File}>(),notices:string[]=[],catalogs=new Map<string,Map<string,string>>();
 for(const f of files){const path=f.webkitRelativePath||f.name;if(/(^|\/)book\.json$/i.test(path)){if(f.size>1024**2){notices.push(`${path} 太大，未读取目录`);continue}try{const j=JSON.parse(await f.text());if(Array.isArray(j.units)){const names=new Map<string,string>();for(const u of j.units)if(typeof u.filename==='string'&&typeof u.title==='string')names.set(u.filename.replace(/\.(mp3|lrc|txt)$/i,'').toLowerCase(),u.title.slice(0,120));catalogs.set(path.replace(/book\.json$/i,''),names)}}catch{notices.push(`${path} 不是有效目录，按文件名识别`)}continue}
  if(!/\.(txt|lrc|mp3|m4a|wav|ogg|webm|flac|aac)$/i.test(path))continue;
  const stem=path.replace(/\.[^.]+$/,'');const g=groups.get(stem)||{path:stem};
  if(/\.(txt|lrc)$/i.test(path)){if(f.size>200000){notices.push(`${path} 超过 200 KB，已跳过`);continue}if(!g.text||/\.lrc$/i.test(path))g.text=f}else{if(f.size<1){notices.push(`${path} 是空音频，已跳过`);continue}if(f.size>200*1024**2){notices.push(`${path} 超过 200 MB，已跳过`);continue}if(g.audio){notices.push(`${path} 与同名音频重复，已跳过`);continue}g.audio=f}groups.set(stem,g);
 }
 const rows:ImportRow[]=[];for(const g of groups.values()){const detected=g.path.match(/(?:^|[/_\- ])NCE([1-4])(?=$|[/_\- ])/i);const book=(detected?`NCE${detected[1]}`:fallback) as NceBookId;const base=g.path.split('/').pop()||g.path;const clean=base.replace(/^NCE[1-4][ _-]+/i,'');const match=clean.match(/^(?:(?:lesson|unit|第)[ _-]*)?(\d{1,3})(?=$|\D)/i);const no=match?Number(match[1]):0;const dir=g.path.slice(0,g.path.lastIndexOf('/')+1);const title=catalogs.get(dir)?.get(base.toLowerCase())||base;let text:string|undefined;if(g.text){text=await g.text.text();if(text.length>50000){notices.push(`${g.text.name} 超过 50,000 字符，跳过文本`);text=undefined}}if(text===undefined&&!g.audio)continue;rows.push({path:g.path,book,lesson:no>=1&&no<=bookCounts[book]?no:0,title:title.slice(0,120),text,audio:g.audio,include:true})}
 rows.sort((a,b)=>a.book.localeCompare(b.book)||a.lesson-b.lesson||a.path.localeCompare(b.path,undefined,{numeric:true}));if(rows.length>348)throw Error('每次最多导入 348 组课文，请缩小选择范围');return {rows,notices};
}
