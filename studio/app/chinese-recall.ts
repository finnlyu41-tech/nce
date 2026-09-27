import type {LanguageRow} from './language';

export type RecallPrompt={en:string;zh:string;first:number;last:number};

// Join adjacent timed subtitle fragments through the end of a sentence. Keep
// their original row indices so playback covers exactly the same source audio.
export function chineseRecallPrompts(rows:LanguageRow[]):RecallPrompt[]{
 const prompts:RecallPrompt[]=[];
 let first=0;
 for(let i=0;i<rows.length;i++){
  const adjacentTimed=rows[i].time!==undefined&&rows[i+1]?.time!==undefined;
  if(adjacentTimed&&!/[.!?]["'”’)]*\s*$/.test(rows[i].en)&&i<rows.length-1)continue;
  const group=rows.slice(first,i+1);
  prompts.push({en:group.map(r=>r.en.trim()).join(' '),zh:group.every(r=>r.zh.trim())?group.map(r=>r.zh.trim()).join(' '):'',first,last:i});
  first=i+1;
 }
 return prompts;
}
