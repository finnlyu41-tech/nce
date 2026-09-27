import type {LanguageRow} from './language';
import type {NceBookId} from './model';

// Keep original rows and timestamps intact; segmentation only changes presentation.
export function splitLesson(rows:LanguageRow[],book?:NceBookId,packaged=false){
 let cursor=0;let title:LanguageRow|undefined;
 const numbered=/^lesson\s+\d+\s*$/i.test(rows[0]?.en||'');
 if(numbered){cursor=1;title=rows[cursor++];}
 const instruction:LanguageRow[]=[];
 while(/^(?:first\s+)?listen to (?:the )?(?:tape|recording)/i.test(rows[cursor]?.en||''))instruction.push(rows[cursor++]);
 const question:LanguageRow[]=[];
 // Book two omits the spoken title in its supplied LRC. Never guess for custom text.
 if(numbered||instruction.length||(packaged&&book==='NCE2')){
  const end=rows.findIndex((r,i)=>i>=cursor&&i<cursor+3&&/[?？]\s*$/.test(r.en));
  if(end>=cursor){question.push(...rows.slice(cursor,end+1));cursor=end+1;}
 }
 return {title,instruction,question,intro:rows.slice(0,cursor),body:rows.slice(cursor),bodyStart:cursor};
}
