import type {State} from './model';
import {grammarRemainingAnswerMatches} from './grammar-remaining-answer';
import {grammarCurriculumVersion,grammarUnitFor} from './grammar-curriculum';
import type {GrammarPractice,GrammarUnit} from './grammar-curriculum-types';

export type GrammarResponse={value:string;hintLevel:number;checkedValue:string|null;matched:boolean};
export type GrammarRoundAttempt={at:number;round:number;variant:0|1;passed:boolean;independent:boolean};
export type GrammarUnitProgress={version:1;contentVersion:number;seenAt:number;round:number;inRound:boolean;assisted:boolean;responses:Record<string,GrammarResponse>;attempts:GrammarRoundAttempt[]};
const MAX_TIME=8640000000000000;
const validTime=(n:unknown):n is number=>Number.isSafeInteger(n)&&Number(n)>0&&Number(n)<=MAX_TIME;
const validRound=(n:unknown):n is number=>Number.isInteger(n)&&Number(n)>=0&&Number(n)<1000000;
export const grammarProgressKey=(id:string)=>`grammar-curriculum-v1-${id}`;
export const emptyGrammarProgress=():GrammarUnitProgress=>({version:1,contentVersion:grammarCurriculumVersion,seenAt:0,round:0,inRound:false,assisted:false,responses:{},attempts:[]});
export const emptyGrammarResponse=():GrammarResponse=>({value:'',hintLevel:0,checkedValue:null,matched:false});
export function grammarRoundQuestions(unit:GrammarUnit,round:number){return unit.practices.filter(p=>p.variant===round%2)}
export function grammarAnswerMatches(practice:GrammarPractice,value:string){return grammarRemainingAnswerMatches(practice,value)}

export function readGrammarProgress(raw:string|undefined,unit:GrammarUnit):GrammarUnitProgress{
 const clean=emptyGrammarProgress();
 try{
  const data=JSON.parse(raw||'{}');if(data?.version!==1)return clean;
  clean.contentVersion=Number.isInteger(data.contentVersion)?data.contentVersion:0;
  clean.seenAt=validTime(data.seenAt)?data.seenAt:0;
  clean.round=validRound(data.round)?data.round:0;
  // An older content version keeps reading evidence but cannot establish current test evidence.
  if(clean.contentVersion!==grammarCurriculumVersion)return {...clean,contentVersion:grammarCurriculumVersion};
  clean.inRound=data.inRound===true;clean.assisted=data.assisted===true;
  for(const q of grammarRoundQuestions(unit,clean.round)){
   const response=data.responses?.[q.id];if(!response||typeof response.value!=='string')continue;
   const value=response.value.slice(0,1000),checkedValue=typeof response.checkedValue==='string'?response.checkedValue.slice(0,1000):null;
   clean.responses[q.id]={value,checkedValue,hintLevel:Number.isInteger(response.hintLevel)?Math.max(0,Math.min(2,response.hintLevel)):0,matched:checkedValue!==null&&grammarAnswerMatches(q,checkedValue)};
  }
  if(Array.isArray(data.attempts))clean.attempts=data.attempts.filter((a:GrammarRoundAttempt)=>a&&validTime(a.at)&&validRound(a.round)&&a.round<=clean.round&&a.variant===a.round%2&&typeof a.passed==='boolean'&&typeof a.independent==='boolean').slice(-12).map((a:GrammarRoundAttempt)=>({at:a.at,round:a.round,variant:a.variant,passed:a.passed,independent:a.independent}));
 }catch{/* Optional malformed draft does not block access to any old records. */}
 return clean;
}
export function grammarProgressFor(state:State,unit:GrammarUnit){return readGrammarProgress(state.drafts[grammarProgressKey(unit.id)],unit)}
export function grammarProgressNeedsNewerVersion(raw?:string){
 try{const data=JSON.parse(raw||'{}');return data?.version>1||data?.contentVersion>grammarCurriculumVersion}catch{return false}
}
export function updateGrammarProgress(state:State,id:string,change:(progress:GrammarUnitProgress)=>GrammarUnitProgress):State{
 const unit=grammarUnitFor(id);if(!unit)return state;
 const key=grammarProgressKey(id),raw=state.drafts[key];
 if(grammarProgressNeedsNewerVersion(raw))return state;
 const next=change(readGrammarProgress(raw,unit));
 // Canonicalize bounded answers and attempt history before writing to the existing backup namespace.
 const safe=readGrammarProgress(JSON.stringify(next),unit);
 return {...state,drafts:{...state.drafts,[key]:JSON.stringify(safe)}};
}
export function markGrammarSeen(progress:GrammarUnitProgress,at=Date.now()){return progress.seenAt?progress:{...progress,seenAt:at}}
export function beginGrammarRound(progress:GrammarUnitProgress){
 if(progress.inRound)return progress;
 const round=progress.attempts.length?progress.round+1:progress.round;
 return {...progress,round,inRound:true,assisted:false,responses:{}};
}
export function setGrammarAnswer(progress:GrammarUnitProgress,unit:GrammarUnit,id:string,value:string){
 if(!progress.inRound||!grammarRoundQuestions(unit,progress.round).some(q=>q.id===id))return progress;
 const response=progress.responses[id]||emptyGrammarResponse();
 return {...progress,responses:{...progress.responses,[id]:{...response,value:value.slice(0,1000),checkedValue:null,matched:false}}};
}
export function showGrammarHint(progress:GrammarUnitProgress,unit:GrammarUnit,id:string){
 if(!progress.inRound||!grammarRoundQuestions(unit,progress.round).some(q=>q.id===id))return progress;
 const response=progress.responses[id]||emptyGrammarResponse();
 return {...progress,assisted:true,responses:{...progress.responses,[id]:{...response,hintLevel:Math.min(2,response.hintLevel+1)}}};
}
export function revisitGrammarTheory(progress:GrammarUnitProgress){return progress.inRound?{...progress,assisted:true}:progress}
export function checkGrammarResponse(progress:GrammarUnitProgress,unit:GrammarUnit,id:string){
 const q=grammarRoundQuestions(unit,progress.round).find(q=>q.id===id),response=progress.responses[id];
 if(!progress.inRound||!q||!response?.value.trim())return progress;
 return {...progress,responses:{...progress.responses,[id]:{...response,checkedValue:response.value,matched:grammarAnswerMatches(q,response.value)}}};
}
export function finishGrammarRound(progress:GrammarUnitProgress,unit:GrammarUnit,at=Date.now()){
 const questions=grammarRoundQuestions(unit,progress.round);
 if(!progress.inRound||!validTime(at)||questions.length!==3||questions.some(q=>!progress.responses[q.id]?.value.trim()||progress.responses[q.id].checkedValue!==progress.responses[q.id].value))return progress;
 const attempt:GrammarRoundAttempt={at,round:progress.round,variant:progress.round%2 as 0|1,
  passed:questions.every(q=>grammarAnswerMatches(q,progress.responses[q.id].value)),independent:!progress.assisted&&questions.every(q=>!progress.responses[q.id].hintLevel)};
 return {...progress,inRound:false,attempts:[...progress.attempts,attempt].slice(-12)};
}
export function delayedGrammarEvidence(progress:GrammarUnitProgress,now=Date.now()){
 if(progress.inRound&&progress.assisted)return false;
 let previous:GrammarRoundAttempt|undefined,delayed=false;
 let firstPass:Partial<Record<0|1,GrammarRoundAttempt>>={};
 for(const attempt of progress.attempts){
  const ordered=!previous||(attempt.round>previous.round&&attempt.at>previous.at);
  previous=attempt;
  // Failure, assistance or invalid chronology breaks the evidence chain; keep the raw history intact.
  if(!ordered||!validTime(attempt.at)||attempt.at>now||!validRound(attempt.round)||attempt.round>progress.round||attempt.variant!==attempt.round%2||!attempt.passed||!attempt.independent){
   firstPass={};delayed=false;continue;
  }
  const other=firstPass[attempt.variant===0?1:0];
  delayed=!!other&&attempt.at-other.at>=24*60*60*1000;
  firstPass[attempt.variant]??=attempt;
 }
 return delayed;
}
export function grammarProgressStatus(progress:GrammarUnitProgress,now=Date.now()){
 if(progress.inRound)return '练习进行中';
 const last=progress.attempts.at(-1);if(!last)return progress.seenAt?'已看过 · 尚未检验':'未开始';
 if(last.at>now)return '练习时间待核对';
 if(!last.passed)return '已练习 · 有题待核对';
 if(!last.independent)return '已跟练 · 使用过提示';
 return delayedGrammarEvidence(progress,now)?'延迟异题检验通过':'本轮独立检验通过';
}
