import type {NceBookId,State} from './model';
import {normal} from './model';
import {grammarEntries,grammarEntryFor,grammarGuidesFor} from './textbook-grammar';
import {studyUnit} from './study-path';

export type LearningPhase='model'|'independent'|'transfer'|'review';
export type LearningAttempt={at:number;variant:number;matched:boolean;hinted:boolean};
export type GoalRecord={worked:boolean;answer:string;hinted:boolean;checked:string;transfer:string;checkedTransfer:string;attempts:LearningAttempt[];dueAt:number;round:number;difficulty:string};
export type LearningRecord={version:1;listened:boolean;goal:string;phase:LearningPhase;goals:Record<string,GoalRecord>};
export const learningPhases:LearningPhase[]=['model','independent','transfer','review'];
export const emptyGoal=():GoalRecord=>({worked:false,answer:'',hinted:false,checked:'',transfer:'',checkedTransfer:'',attempts:[],dueAt:0,round:0,difficulty:''});
export const learningKey=(book:NceBookId,lesson:number)=>`learning-v1-${studyUnit(book,lesson).key}`;
export function lessonGoals(book:NceBookId,lesson:number){const entry=grammarEntryFor(book,lesson);return entry?grammarGuidesFor(entry):[];}
export function readLearning(raw?:string):LearningRecord{
 const result:LearningRecord={version:1,listened:false,goal:'',phase:'model',goals:{}};
 try{
  const data=JSON.parse(raw||'{}');if(data?.version!==1)return result;
  result.listened=data.listened===true;
  if(typeof data.goal==='string'&&/^[a-z-]{1,60}$/.test(data.goal))result.goal=data.goal;
  if(learningPhases.includes(data.phase))result.phase=data.phase;
  if(data.goals&&typeof data.goals==='object'&&!Array.isArray(data.goals))for(const [id,value] of Object.entries(data.goals).slice(0,8)){
   if(!/^[a-z-]{1,60}$/.test(id)||['constructor','prototype'].includes(id)||!value||typeof value!=='object')continue;
   const v=value as Partial<GoalRecord>,g=emptyGoal();g.worked=v.worked===true;g.hinted=v.hinted===true;
   for(const k of ['answer','checked','transfer','checkedTransfer','difficulty'] as const)if(typeof v[k]==='string')g[k]=v[k].slice(0,k==='difficulty'?40:5000);
   if(Array.isArray(v.attempts))g.attempts=v.attempts.filter(a=>a&&Number.isSafeInteger(a.at)&&a.at>0&&a.at<=8640000000000000&&Number.isInteger(a.variant)&&a.variant>=0&&a.variant<3&&typeof a.matched==='boolean'&&typeof a.hinted==='boolean').slice(-12);
   if(Number.isSafeInteger(v.dueAt)&&v.dueAt!>0&&v.dueAt!<=8640000000000000)g.dueAt=v.dueAt!;
   if(Number.isSafeInteger(v.round)&&v.round!>=0&&v.round!<=100000)g.round=v.round!;
   result.goals[id]=g;
  }
 }catch{/* An invalid optional draft never prevents access to the existing learning records. */}
 return result;
}
export function learningFor(state:State,book:NceBookId,lesson:number){return readLearning(state.drafts[learningKey(book,lesson)]);}
export function updateLearning(state:State,book:NceBookId,lesson:number,change:(record:LearningRecord)=>LearningRecord):State{
 const key=learningKey(book,lesson),record=change(readLearning(state.drafts[key]));
 return {...state,drafts:{...state.drafts,[key]:JSON.stringify(record)}};
}
export function updateGoal(state:State,book:NceBookId,lesson:number,id:string,change:(goal:GoalRecord)=>GoalRecord){
 if(!lessonGoals(book,lesson).some(g=>g.id===id))return state;
 return updateLearning(state,book,lesson,record=>({...record,goals:{...record.goals,[id]:change(record.goals[id]||emptyGoal())}}));
}
const dateKey=(at:number)=>new Date(at).toLocaleDateString('en-CA');
export function stableEvidence(goal:GoalRecord){
 const last=goal.attempts.at(-1);if(!last?.matched||last.hinted)return false;
 // Only successful, unassisted checks on different days and different questions count.
 return goal.attempts.some(a=>a.matched&&!a.hinted&&a.variant!==last.variant&&dateKey(a.at)!==dateKey(last.at));
}
export function goalStatus(goal:GoalRecord,now=Date.now()){
 const last=goal.attempts.at(-1);
 if(!last)return goal.worked?'已跟练':'待学习';
 if(!last.matched)return '待核对';
 if(last.hinted)return '需要提示';
 if(goal.dueAt&&goal.dueAt<=now)return '到期巩固';
 return stableEvidence(goal)?'间隔检验已通过':'独立练习已通过';
}
export function recordCheck(goal:GoalRecord,attempt:LearningAttempt){
 const attempts=[...goal.attempts,attempt].slice(-12),next={...goal,attempts};
 const interval=!goal.attempts.length||!attempt.matched||attempt.hinted?1:stableEvidence(next)?7:3;
 const due=new Date(attempt.at);due.setDate(due.getDate()+interval);due.setHours(0,0,0,0);
 // The first successful check is revisited the next day. Repeating early does not postpone it.
 next.dueAt=goal.dueAt>attempt.at?Math.min(goal.dueAt,due.getTime()):due.getTime();
 return next;
}
export function nextReviewRound(goal:GoalRecord){return {...goal,round:goal.round+1,answer:'',checked:'',hinted:false};}
export function answerMatches(answer:string,reference:string){
 const expand=(value:string)=>normal(value.replace(/[—–-]/g,' ')).replace(/\b(can't)\b/g,'cannot').replace(/\b(won't)\b/g,'will not').replace(/\b(\w+)n't\b/g,'$1 not').replace(/\bi'm\b/g,'i am').replace(/\b(\w+)'re\b/g,'$1 are').replace(/\b(\w+)'ve\b/g,'$1 have').replace(/\b(\w+)'ll\b/g,'$1 will');
 return reference.split(/\s+\/\s+/).some(r=>expand(answer)===expand(r));
}
export function goalQuestion(guide:ReturnType<typeof lessonGoals>[number],variant:number){
 if(variant===2)return {prompt:guide.practice.prompt.replace('用两种方式','任选一种方式'),answer:guide.practice.answer,explanation:guide.practice.explanation};
 const example=guide.examples[variant===1?0:1];
 return {prompt:`用本课用法表达：${example.zh}`,answer:example.en,explanation:example.note};
}
export function dueLearningGoals(state:State,now=Date.now()){
 return grammarEntries.flatMap(entry=>{
  const record=learningFor(state,entry.book,entry.lesson);
  return grammarGuidesFor(entry).flatMap(guide=>{
   const goal=record.goals[guide.id];return goal?.dueAt&&goal.dueAt<=now?[{entry,guide,goal}]:[];
  });
 }).sort((a,b)=>a.goal.dueAt-b.goal.dueAt);
}
export function learningSummary(state:State,book:NceBookId,lesson:number){
 const goals=lessonGoals(book,lesson),record=learningFor(state,book,lesson);
 const checked=goals.filter(g=>record.goals[g.id]?.attempts.some(a=>a.matched&&!a.hinted)).length;
 const stable=goals.filter(g=>record.goals[g.id]&&stableEvidence(record.goals[g.id])).length;
 const practiced=goals.every(g=>{const goal=record.goals[g.id];return goal?.attempts.length&&goal.transfer.trim()&&goal.checkedTransfer===goal.transfer});
 return {goals,record,checked,stable,practiced:goals.length>0&&record.listened&&practiced};
}
export function nextLearning(state:State,now=Date.now()){
 const due=dueLearningGoals(state,now);
 if(due.length){const {entry,guide}=due[0];return {book:entry.book,lesson:entry.lesson,tab:'practice',goal:guide.id,practice:'review' as LearningPhase,review:true};}
 const last=state.nceLast||{book:'NCE1' as const,lesson:1};
 let unit=studyUnit(last.book,last.lesson),summary=learningSummary(state,unit.book,unit.first);
 while(summary.practiced&&unit.next){unit=studyUnit(unit.book,unit.next);summary=learningSummary(state,unit.book,unit.first)}
 const incomplete=summary.goals.find(g=>{const goal=summary.record.goals[g.id];return !goal?.attempts.length||!goal.transfer.trim()||goal.checkedTransfer!==goal.transfer});
 const id=incomplete?.id||summary.goals[0]?.id;
 const phase=summary.record.goal===id?summary.record.phase:summary.record.goals[id]?.worked?'independent':'model';
 return {book:unit.book,lesson:unit.first,tab:summary.record.listened?'practice':'listen',goal:id,practice:phase as LearningPhase,review:false};
}
