import type {State,Question} from './model';
import {day,isCorrect,wordCount} from './model';
import {learningFor} from './learning-plan';
import {blueprintKey,blueprintSnapshot,readBlueprint,evidencePassed} from './ielts-blueprint';
import {journeyMissions,journeyStages,missionById,type JourneyMission,type JourneyStage} from './ielts-journey-content';
export const journeyKey='ielts-journey-v2';
export type MissionPhase='learn'|'guided'|'recall'|'done';
export type MissionAttempt={at:number;round:number;matched:boolean;hinted:boolean};
export type MissionRecord={phase:MissionPhase;round:number;choice:string;answer:string;checked:string;hinted:boolean;attempts:MissionAttempt[];dueAt:number;artifact:string;reflection:string;savedAt:number;startedAt:number;practicedAt:number};
export type JourneyRecord={version:2;focus?:string;startAt?:JourneyStage;missions:Record<string,MissionRecord>};
export const emptyMission=():MissionRecord=>({phase:'learn',round:0,choice:'',answer:'',checked:'',hinted:false,attempts:[],dueAt:0,artifact:'',reflection:'',savedAt:0,startedAt:0,practicedAt:0});
const safeTime=(n:unknown)=>Number.isSafeInteger(n)&&Number(n)>0&&Number(n)<=8640000000000000?Number(n):0;
export function readJourney(raw?:string):JourneyRecord{
 const result:JourneyRecord={version:2,missions:{}};
 try{
  const data=JSON.parse(raw||'{}');if(data?.version!==2)return result;
  if(missionById(data.focus))result.focus=data.focus;
  if(journeyStages.some(s=>s.id===data.startAt))result.startAt=data.startAt;
  for(const mission of journeyMissions){
   const value=data.missions?.[mission.id];if(!value||typeof value!=='object')continue;
   const record=emptyMission();
   if(['learn','guided','recall','done'].includes(value.phase))record.phase=value.phase;
   if(Number.isSafeInteger(value.round)&&value.round>=0&&value.round<100000)record.round=value.round;
   for(const key of ['choice','answer','checked','artifact','reflection'] as const)if(typeof value[key]==='string')record[key]=value[key].slice(0,key==='artifact'?6000:3000);
   record.hinted=value.hinted===true;record.dueAt=safeTime(value.dueAt);record.savedAt=safeTime(value.savedAt);record.startedAt=safeTime(value.startedAt);record.practicedAt=safeTime(value.practicedAt);
   if(Array.isArray(value.attempts))record.attempts=value.attempts.filter((a:MissionAttempt)=>a&&safeTime(a.at)&&Number.isInteger(a.round)&&a.round>=0&&a.round<100000&&typeof a.matched==='boolean'&&typeof a.hinted==='boolean').slice(-12);
   result.missions[mission.id]=record;
  }
 }catch{/* Optional new records never replace existing coursework or backups. */}
 return result;
}
export function updateJourney(state:State,change:(record:JourneyRecord)=>JourneyRecord):State{
 return {...state,drafts:{...state.drafts,[journeyKey]:JSON.stringify(change(readJourney(state.drafts[journeyKey])))}};
}
export function updateMission(state:State,id:string,change:(record:MissionRecord)=>MissionRecord):State{
 if(!missionById(id))return state;
 return updateJourney(state,r=>({...r,missions:{...r.missions,[id]:change(r.missions[id]||emptyMission())}}));
}
export function startMission(state:State,id:string,mode:'learn'|'check'|'review'='learn',now=Date.now()):State{
 const mission=missionById(id);if(!mission)return state;
 let next=updateJourney(state,r=>({...r,focus:id}));
 next=updateMission(next,id,r=>mode==='learn'?{...r,startedAt:r.startedAt||now}:{...r,phase:'recall',round:mode==='review'?r.round+1:r.round,answer:'',checked:'',hinted:false,choice:'',startedAt:now});
 return next;
}
export function missionQuestion(mission:JourneyMission,record:MissionRecord):Question|undefined{return mission.mini?.checks[record.round%mission.mini.checks.length]}
export function submitMission(state:State,id:string,now=Date.now()):State{
 const mission=missionById(id);if(!mission?.mini)return state;
 const record=readJourney(state.drafts[journeyKey]).missions[id]||emptyMission(),question=missionQuestion(mission,record)!;
 if(!record.answer.trim()||record.answer===record.checked)return state;
 const matched=isCorrect(question,record.answer),previous=record.attempts.at(-1);
 const spaced=matched&&!record.hinted&&previous?.matched&&!previous.hinted&&previous.round%mission.mini.checks.length!==record.round%mission.mini.checks.length&&new Date(previous.at).toDateString()!==new Date(now).toDateString();
 const due=new Date(now);due.setDate(due.getDate()+(spaced?7:1));due.setHours(0,0,0,0);
 return updateMission({...state,attempts:state.attempts+1,correct:state.correct+(matched?1:0),days:[...new Set([...state.days,day()])]},id,r=>({...r,phase:matched?'done':'recall',practicedAt:r.practicedAt||(matched?now:0),checked:r.answer,hinted:r.hinted||!matched,attempts:[...r.attempts,{at:now,round:r.round,matched,hinted:r.hinted}].slice(-12),dueAt:r.dueAt>now?Math.min(r.dueAt,due.getTime()):due.getTime()}));
}
export function saveAssignment(state:State,id:string,now=Date.now()):State{
 const mission=missionById(id),record=readJourney(state.drafts[journeyKey]).missions[id];
 if(!mission?.assignment||!record?.artifact.trim()||!record.reflection.trim())return state;
 return updateMission({...state,days:[...new Set([...state.days,day()])]},id,r=>({...r,savedAt:now,practicedAt:r.practicedAt||now,phase:'done'}));
}
export function missionEvidence(state:State,mission:JourneyMission,now=Date.now()){
 const record=readJourney(state.drafts[journeyKey]).missions[mission.id],last=record?.attempts.at(-1);
 // A course goal may support only its first matching foundation checkpoint, not
 // every later skill that happens to reference the same grammar material.
 const course=mission.course,firstCourse=course&&journeyMissions.find(m=>m.course?.book===course.book&&m.course.lesson===course.lesson&&m.course.goal===course.goal)?.id===mission.id;
 const goal=course&&firstCourse?learningFor(state,course.book,course.lesson).goals[course.goal]:undefined;
 const courseAttempt=goal?.attempts.at(-1),courseMatched=!!courseAttempt&&courseAttempt.at<=now&&courseAttempt.matched&&!courseAttempt.hinted&&!!goal?.answer.trim()&&goal.checked===goal.answer;
 const old=mission.legacy?readBlueprint(state.drafts[blueprintKey]).tasks[mission.legacy]:undefined;
 const oldDone=!record?.startedAt&&!last&&evidencePassed(old);
 const attempted=!!last&&last.at<=now,matched=attempted&&last.matched&&record?.phase==='done'&&record.checked===record.answer;
 const assignment=!!record?.savedAt&&record.savedAt<=now&&!!record.artifact.trim()&&!!record.reflection.trim();
 const hasScore=!!mission.scoreKey&&Number.isFinite(state.scores[mission.scoreKey]);
 const written=mission.draftKey?wordCount(state.drafts[mission.draftKey]||''):0;
 const activeCheck=record?.phase==='recall'||record?.phase==='guided';
 const currentCourse=courseMatched&&(!last||courseAttempt!.at>last.at)&&(!activeCheck||courseAttempt!.at>(record?.startedAt||0));
 const done=!!(matched||currentCourse||assignment||oldDone||hasScore);
 const recorded=done||courseMatched||evidencePassed(old)||!!record?.practicedAt&&record.practicedAt<=now||!!record?.attempts.some(a=>a.matched&&a.at<=now);
 const status=matched?(last!.hinted?'借助提示完成':'核对通过'):currentCourse?'已读取课内核对':assignment?'练习已记录':hasScore?'已读取专项练习':oldDone?'保留旧练习记录':activeCheck&&record?.round?'换题巩固中':attempted?'这一题再试一次':record?.answer||record?.choice||record?.artifact||written?'进行中':'还没开始';
 const due=!!record?.dueAt&&record.dueAt<=now;
 return {done,recorded,status,record:record||emptyMission(),due,independent:!!(matched&&!last!.hinted||currentCourse),related:!!goal,score:hasScore?state.scores[mission.scoreKey!]:undefined,written,legacy:old};
}
export function journeySnapshot(state:State,now=Date.now()){
 const record=readJourney(state.drafts[journeyKey]),blueprint=blueprintSnapshot(state,now);
 const missions=journeyMissions.map(m=>({...m,evidence:missionEvidence(state,m,now)}));
 const stages=journeyStages.map(s=>({...s,missions:missions.filter(m=>m.stage===s.id)})).map(s=>({...s,done:s.missions.filter(m=>m.evidence.recorded).length}));
 const start=record.startAt||(blueprint.record.entry==='exam'?'listening':blueprint.record.entry==='rusty'?'foundation':'starter');
 const startIndex=journeyStages.findIndex(s=>s.id===start),foundations=stages.slice(Math.min(startIndex,3),3).flatMap(s=>s.missions);
 const skillStages=blueprint.assessed?blueprint.priority.map(p=>stages.find(s=>s.id===p.id)!):stages.slice(3);
 const skills=startIndex>3&&!blueprint.assessed?[...stages.slice(startIndex),...stages.slice(3,startIndex)]:skillStages;
 const ordered=[...foundations,...skills.flatMap(s=>s.missions)];
 const focus=missions.find(m=>m.id===record.focus);
 const pending=ordered.find(m=>!m.evidence.done);
 const nextWithinStage=focus?.evidence.done?stages.find(s=>s.id===focus.stage)?.missions.find(m=>!m.evidence.done):undefined;
 const next=blueprint.ready?undefined:focus&&!focus.evidence.done?focus:nextWithinStage||pending;
 const due=missions.filter(m=>m.mini&&m.evidence.due).sort((a,b)=>a.evidence.record.dueAt-b.evidence.record.dueAt);
 return {record,blueprint,missions,stages,next,due,completed:missions.filter(m=>m.evidence.recorded).length,total:missions.length};
}
export const missionRoute=(mission:JourneyMission)=>({view:'roadmap',node:mission.stage,mission:mission.id});
