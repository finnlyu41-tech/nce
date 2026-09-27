export type AssessedWord={word:string;accuracy:number|null;error:'None'|'Omission'|'Insertion'|'Mispronunciation';start:number;duration:number};
export type PronunciationResult={text:string;accuracy:number;fluency:number;completeness:number;words:AssessedWord[]};
export type PracticeIssue={word?:string;title:string;action:string};

export function practiceIssues(result:PronunciationResult):PracticeIssue[]{
 const priorities=result.words.filter(w=>w.error!=='None'||(w.accuracy!==null&&w.accuracy<60))
  .sort((a,b)=>(a.error==='Omission'?0:1)-(b.error==='Omission'?0:1)||(a.accuracy??100)-(b.accuracy??100));
 const seen=new Set<string>(),issues:PracticeIssue[]=[];
 for(const w of priorities){
  if(seen.has(w.word.toLowerCase()))continue;seen.add(w.word.toLowerCase());
  issues.push({word:w.word,title:w.error==='Omission'?`可能漏读了 ${w.word}`:w.error==='Insertion'?`可能多读了 ${w.word}`:`再听听 ${w.word} 的发音`,
   action:w.error==='Omission'?'听原句时找到这个词，再把前后几个词一起读出来。':w.error==='Insertion'?'对照原句，确认是否重复或多读，再完整读一遍。':'先回听自己的录音，再听原声，把这个词和前后词连起来重读。'});
  if(issues.length===2)break;
 }
 if(issues.length<2&&result.fluency<70)issues.push({title:'再练一遍整句的连贯度',action:'听原声在哪里停顿，先慢速跟读，再用舒适的速度完整说一遍。'});
 return issues;
}

let personalToken='';
export const getPersonalToken=()=>personalToken;
export const setPersonalToken=(value:string)=>{personalToken=value.trim()};

export async function assessRecording(audio:string,reference:string,signal:AbortSignal):Promise<PronunciationResult>{
 const response=await fetch('/api/pronunciation',{method:'POST',signal,cache:'no-store',credentials:'omit',
  headers:{'Content-Type':'application/json','Authorization':`Bearer ${personalToken}`},
  body:JSON.stringify({audio,reference,consent:true})});
 const data=await response.json() as {error?:unknown}&PronunciationResult;
 if(!response.ok)throw Error(typeof data.error==='string'?data.error:'评估暂时不可用，请保留录音稍后再试。');
 return data as PronunciationResult;
}
