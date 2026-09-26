import {bookCounts, type NceBookId, type NceReview, type State} from './model';

export const bookNames:Record<NceBookId,string>={NCE1:'第一册',NCE2:'第二册',NCE3:'第三册',NCE4:'第四册'};
export const reviewChecks=['meaning','listening','expression'] as const;
export const studyUnitCount=276;

export function studyUnit(book:NceBookId,lesson:number){
 const first=book==='NCE1'?lesson-(lesson%2===0?1:0):lesson;
 return {book,first,last:book==='NCE1'?first+1:first,key:`${book}-${first}`,label:book==='NCE1'?`第 ${first}–${first+1} 课`:`第 ${first} 课`,next:first+(book==='NCE1'?2:1)<=bookCounts[book]?first+(book==='NCE1'?2:1):null};
}
export function unitTrained(state:State,book:NceBookId,lesson:number){
 const unit=studyUnit(book,lesson),entry=state.nce?.[unit.key];
 return ['listen','words','retell'].every(step=>entry?.steps.includes(step))&&!!(entry?.steps.includes('practice')||(book==='NCE1'&&state.nce?.[`${book}-${unit.last}`]?.steps.includes('practice')));
}
export function trainedUnits(state:State,onlyBook?:NceBookId){
 return (onlyBook?[onlyBook]:Object.keys(bookCounts) as NceBookId[]).reduce((total,book)=>total+Array.from({length:book==='NCE1'?72:bookCounts[book]},(_,i)=>book==='NCE1'?i*2+1:i+1).filter(lesson=>unitTrained(state,book,lesson)).length,0);
}
export function dueUnits(state:State,now=Date.now()){
 return (Object.keys(bookCounts) as NceBookId[]).flatMap(book=>Array.from({length:book==='NCE1'?72:bookCounts[book]},(_,i)=>studyUnit(book,book==='NCE1'?i*2+1:i+1))).filter(unit=>{const review=state.nce?.[unit.key]?.review;return !!review&&review.dueAt<=now}).sort((a,b)=>state.nce![a.key].review!.dueAt-state.nce![b.key].review!.dueAt);
}
export function recommendedStudy(state:State,now=Date.now()){
 const due=dueUnits(state,now);
 if(due.length)return {...due[0],review:true,dueCount:due.length};
 const last=state.nceLast||{book:'NCE1' as const,lesson:1};
 let unit=studyUnit(last.book,last.lesson);
 while(unit.next&&unitTrained(state,unit.book,unit.first)&&reviewChecks.every(check=>state.nce?.[unit.key]?.review?.checks.includes(check)))unit=studyUnit(unit.book,unit.next);
 return {...unit,review:false,dueCount:0};
}
export function reviewInterval(checks:string[],previous?:NceReview,now=Date.now()){
 return previous&&previous.dueAt<=now&&reviewChecks.every(check=>checks.includes(check))?3:1;
}
export function makeReview(checks:string[],previous?:NceReview,now=Date.now()):NceReview{
 const due=new Date(now);due.setDate(due.getDate()+reviewInterval(checks,previous,now));due.setHours(0,0,0,0);
 return {checks:reviewChecks.filter(check=>checks.includes(check)),checkedAt:now,dueAt:due.getTime()};
}
export function saveUnitReview(state:State,book:NceBookId,lesson:number,checks:string[],now=Date.now()):State{
 const unit=studyUnit(book,lesson),entry=state.nce?.[unit.key]||{title:'',text:'',notes:'',steps:[]};
 return {...state,nce:{...state.nce,[unit.key]:{...entry,review:makeReview(checks,entry.review,now)}}};
}

export const stageChecks:Record<NceBookId,string>={
 NCE1:'阶段自查：换一段同难度的基础对话，能抓住意思；能用简单句介绍自己、描述经历和计划。',
 NCE2:'阶段自查：能理解同难度的新短文，连贯讲一段经历，并写出有开头、经过和结果的短文。中后段开始接触雅思日常话题。',
 NCE3:'按弱项选学：理解长句与段落关系，能概括内容并解释观点；同时练雅思听说读写，逐步加入限时。',
 NCE4:'进阶拓展：练抽象议题和论证。以雅思 6.5 为目标时，这一册可留到以后，先补专项弱项。'
};
