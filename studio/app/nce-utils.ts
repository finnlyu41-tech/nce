export function parseLessonText(text:string){const rows:{en:string,zh:string,time?:number}[]=[];for(const raw of text.split(/\r?\n/)){const times=[...raw.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)].map(m=>Number(m[1])*60+Number(m[2]));const line=raw.replace(/\[\d+:\d+(?:\.\d+)?\]/g,'').trim();if(!line||/^\[(?:ar|ti|al|by|offset|length):/i.test(line))continue;const [en,...zh]=line.split('|');if(!/[A-Za-z]/.test(en)&&/[\u3400-\u9fff]/.test(en)&&rows.length&&!rows[rows.length-1].zh){rows[rows.length-1].zh=line;continue}if(times.length)for(const time of times)rows.push({en:en.trim(),zh:zh.join('|').trim(),time});else rows.push({en:en.trim(),zh:zh.join('|').trim()})}if(rows.every(r=>r.time!==undefined))rows.sort((a,b)=>a.time!-b.time!);return rows;}

export function vocabularyExample(rows:{en:string;zh:string}[],word:string,forms:string[]=[]){
 for(const form of [word,...forms]){
  const escaped=form.replace(/’/g,"'").replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s+');
  if(!escaped)continue;
  const pattern=new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`,'iu');
  const row=rows.find(r=>pattern.test(r.en.replace(/’/g,"'")));
  if(row)return row;
 }
}
