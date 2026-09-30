import type {NceBookId,State} from './model';
import type {StudioRoute} from './navigation';
import {grammarCategories,grammarEntries,grammarEntryFor} from './textbook-grammar';
import {emptyGoal,learningSummary,nextLearning,stableEvidence,learningFor,lessonGoals,updateGoal,updateLearning,type LearningPhase} from './learning-plan';
import {studyUnit} from './study-path';

export const roadmapBooks=[
 {id:'NCE1',title:'日常对话',description:'发音、基本句型与日常表达',outcome:'用简单句介绍自己，描述日常、经历和计划。'},
 {id:'NCE2',title:'连贯表达',description:'时态、叙事与段落组织',outcome:'把一段经历讲清楚，写出有开头、经过和结果的短文。'},
 {id:'NCE3',title:'深入理解',description:'长句、语篇与准确表达',outcome:'读懂句子之间的关系，概括内容并解释自己的观点。'},
 {id:'NCE4',title:'观点与论证',description:'抽象议题与进阶阅读',outcome:'练习分析观点与论证；可按需要选学，不必全部学完才练雅思。'},
] as const;
export const roadmapSteps=[
 {id:'listen',label:'听懂',description:'听课文，试着说出大意'},
 {id:'grammar',label:'看懂',description:'理解本课句型与用法'},
 {id:'model',label:'跟练',description:'看示范，合上后自己试'},
 {id:'independent',label:'独立试',description:'不看提示，表达并核对'},
 {id:'transfer',label:'自己用',description:'换成自己的情况说一遍'},
 {id:'review',label:'隔天复习',description:'换日期、换题，再试一次'},
] as const;
export type RoadmapStep=typeof roadmapSteps[number]['id'];
export type RoadmapStatus='new'|'active'|'practiced'|'stable'|'due'|'legacy';
export const roadmapStatusLabels:Record<RoadmapStatus,string>={new:'未开始',active:'学习中',practiced:'本轮已练',stable:'间隔检验通过',due:'待复习',legacy:'有旧记录'};

export function roadmapUnit(state:State,book:NceBookId,lesson:number,now=Date.now()){
 const unit=studyUnit(book,lesson),entry=grammarEntryFor(book,lesson)!,summary=learningSummary(state,book,lesson);
 const records=summary.goals.map(g=>summary.record.goals[g.id]||emptyGoal());
 const due=records.some(g=>g.dueAt>0&&g.dueAt<=now);
 const started=summary.record.listened||records.some(g=>g.worked||g.answer.trim()||g.transfer.trim()||g.attempts.length);
 const legacy=[unit.first,unit.last].some(n=>{const e=state.nce?.[`${book}-${n}`];return e&&(e.steps.length||e.notes.trim()||e.review)});
 const status:RoadmapStatus=due?'due':summary.stable===summary.goals.length&&summary.goals.length>0?'stable':summary.practiced?'practiced':started?'active':legacy?'legacy':'new';
 return {unit,entry,summary,status};
}
export function roadmapSnapshot(state:State,now=Date.now()){
 const units=grammarEntries.map(e=>roadmapUnit(state,e.book,e.lesson,now));
 return roadmapBooks.map(book=>{
  const entries=units.filter(u=>u.unit.book===book.id);
  return {...book,entries,started:entries.filter(u=>u.status!=='new').length,practiced:entries.filter(u=>u.summary.practiced).length,due:entries.filter(u=>u.status==='due').length,
   topics:grammarCategories.map(category=>({...category,entries:entries.filter(u=>u.entry.category===category.id)})).filter(t=>t.entries.length)};
 });
}
export function roadmapCurrent(state:State,now=Date.now()){
 const next=nextLearning(state,now);
 return {route:{view:'nce',book:next.book,lesson:next.lesson,tab:next.tab,goal:next.tab==='practice'?next.goal:undefined,practice:next.tab==='practice'?next.practice:undefined} as StudioRoute,
  book:next.book,lesson:next.lesson,step:(next.tab==='listen'?'listen':next.practice) as RoadmapStep,goal:next.goal,review:next.review};
}
export function roadmapStepRoute(book:NceBookId,lesson:number,step:RoadmapStep,goal?:string):StudioRoute{
 return {view:'nce',book,lesson,tab:step==='listen'?'listen':step==='grammar'?'grammar':'practice',...(step==='listen'?{}:step==='grammar'?{goal}:{goal,practice:step as LearningPhase})};
}
export function roadmapActiveStep(route:StudioRoute,state:State):RoadmapStep{
 if(route.tab==='grammar'||route.tab==='words')return 'grammar';
 if(route.tab==='practice')return route.practice||learningSummary(state,route.book!,route.lesson!).record.phase;
 if(route.tab==='notes')return 'transfer';
 return 'listen';
}
export function roadmapGoalSteps(state:State,book:NceBookId,lesson:number,goalId?:string,now=Date.now()){
 const {goals,record}=learningSummary(state,book,lesson),guide=goals.find(g=>g.id===(goalId||record.goal))||goals[0];
 const goal=record.goals[guide.id]||emptyGoal(),last=goal.attempts.at(-1);
 return roadmapSteps.map(step=>{
  const done=step.id==='listen'?record.listened:step.id==='model'?goal.worked:step.id==='independent'?!!last?.matched&&!last.hinted:step.id==='transfer'?!!goal.transfer.trim()&&goal.checkedTransfer===goal.transfer:step.id==='review'?stableEvidence(goal):false;
  const detail=step.id==='listen'&&done?'已尝试概括':step.id==='model'&&done?'已跟练':step.id==='independent'&&done?'核对通过':step.id==='transfer'&&done?'已保存 · 待核对':step.id==='review'&&goal.dueAt?goal.dueAt<=now?'已到复习时间':`下次 ${new Date(goal.dueAt).toLocaleDateString('zh-CN',{month:'numeric',day:'numeric'})}`:step.description;
  return {...step,done,detail,route:roadmapStepRoute(book,lesson,step.id,guide.id)};
 });
}

export function prepareRoadmapLesson(state:State,route:StudioRoute,from?:StudioRoute):State{
 if(!route.book||!route.lesson)return state;
  const book=route.book!,lesson=route.lesson!,record=learningFor(state,book,lesson);
  const source=from?.book===book&&studyUnit(book,from.lesson||1).key===studyUnit(book,lesson).key?from:undefined;
  const id=route.goal||source?.goal||record.goal||lessonGoals(book,lesson)[0]?.id,phase=source?.practice||record.phase;
  let next=state;
  if((route.tab==='grammar'||route.practice==='model')&&id&&(phase==='independent'||phase==='review')){
   const goal=record.goals[id];
   if(!goal?.checked||goal.checked!==goal.answer)next=updateGoal(next,book,lesson,id,g=>({...g,hinted:true}));
  }
  if(route.practice)next=updateLearning(next,book,lesson,r=>({...r,goal:route.goal||r.goal,phase:route.practice!}));
  return next;
}
