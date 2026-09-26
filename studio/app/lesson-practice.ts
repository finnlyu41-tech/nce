import type {LanguageRow} from './language';

export type RecallItem={id:string;prompt:string;answer:string;original:string;translation:string;rowIndex:number};
export const recallAnswer=(value:string)=>value.trim().toLowerCase().replace(/[’‘]/g,"'").replace(/[.!?,;:]+$/,'');

// Use the supplied lesson sentences, never a shared bank disguised as lesson work.
export function lessonRecall(rows:LanguageRow[],key:string):RecallItem[]{
 let start=/^lesson\s+\d+/i.test(rows[0]?.en||'')?2:0;
 const instruction=rows.findIndex(r=>/^(?:first\s+)?listen to (?:the )?(?:tape|recording)/i.test(r.en));
 if(instruction>=0)start=instruction+1;
 if(/\?\s*$/.test(rows[start]?.en||''))start++;
 const seen=new Set<string>();
 const candidates=rows.flatMap((row,rowIndex)=>{
  const tokens=[...row.en.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)];
  const choices=tokens.filter(t=>t[0].length>=3);
  if(rowIndex<start||tokens.length<3||tokens.length>45||!choices.length||seen.has(row.en))return [];
  seen.add(row.en);return [{row,rowIndex,choices}];
 });
 const count=Math.min(3,candidates.length);
 return Array.from({length:count},(_,i)=>{
  const {row,rowIndex,choices}=candidates[Math.floor(i*candidates.length/count)];
  const word=choices[(rowIndex+i)%choices.length],index=word.index!;
  return {id:`${key}-${rowIndex}`,prompt:row.en.slice(0,index)+'____'+row.en.slice(index+word[0].length),answer:word[0],original:row.en,translation:row.zh,rowIndex};
 });
}
