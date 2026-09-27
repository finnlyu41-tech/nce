import illustrationData from './data/nce-illustrations.json';
import pageData from './data/nce-pages.json';
import type {NceBookId} from './model';

export type Illustration={sourceSha256:string;pageSha256:string;mode:'panels'|'lesson';size:[number,number];boxes:[number,number,number,number][];linePanels:number[]};
// Numeric crop data is checked against the packaged pages by verify:illustrations.
const data=illustrationData as unknown as {version:number;sources:Partial<Record<NceBookId,string>>;lessons:Record<string,Illustration>};

// A row index is meaningful only for the exact transcript and textbook edition.
export function lessonIllustration(book:NceBookId,lesson:number,sourceSha256:string|undefined,rowCount:number){
 const entry=data.lessons[`${book}-${lesson}`];
 if(!entry||entry.sourceSha256!==sourceSha256||entry.linePanels.length!==rowCount||data.sources[book]!==pageData[book].sourceSha256)return null;
 return entry;
}

export function illustrationPanel(entry:Illustration,line:number){
 if(!Number.isInteger(line)||line<0||line>=entry.linePanels.length)return null;
 const index=entry.linePanels[line],box=entry.boxes[index];
 return box?{index,box}:null;
}

export function sentenceAtTime(rows:readonly {time?:number}[],time:number){
 if(!Number.isFinite(time)||time<0)return -1;
 let current=-1;
 rows.forEach((row,index)=>{if(row.time!==undefined&&row.time<=time)current=index});
 return current;
}

export function sentenceEnd(rows:readonly {time?:number}[],line:number){
 const time=rows[line]?.time;
 return time===undefined?null:rows.slice(line+1).find(row=>row.time!==undefined&&row.time>time)?.time??null;
}
