import {reviewSets,reviewById} from './review-content.mjs';
const validTime=(n,now)=>Number.isSafeInteger(n)&&n>0&&n<=now;
const validTaskId=id=>typeof id==='string'&&/^capability:yesterday-past:v1@[1-9]\d{0,15}$/.test(id)&&Number.isSafeInteger(Number(id.split('@')[1]));
export function beginReview(taskId,seenIds=[],completedCount=0,now=Date.now()) {
  if(!validTaskId(taskId)||!validTime(now,now))return null;
  const seen=new Set(knownReviewIds(seenIds)),fresh=reviewSets.findIndex(set=>set.every(q=>!seen.has(q.id)));
  const setIndex=fresh<0?(Number.isSafeInteger(completedCount)&&completedCount>=0?completedCount:0)%reviewSets.length:fresh;
  return {version:1,taskId,setIndex,index:0,createdAt:now,attempts:[],hints:[],seenIds:[],repeatedIds:reviewSets[setIndex].filter(q=>seen.has(q.id)).map(q=>q.id),finishedAt:null};
}
export function currentReviewQuestion(s){return s?reviewSets[s.setIndex]?.[s.index]:undefined;}
export function showReviewQuestion(s){const q=currentReviewQuestion(s);return !q||s.seenIds.includes(q.id)?s:{...s,seenIds:[...s.seenIds,q.id]};}
export function hintReview(s){const q=currentReviewQuestion(s);return !q||s.hints.includes(q.id)||s.attempts.some(a=>a.id===q.id)?s:{...s,hints:[...s.hints,q.id]};}
export function showReviewRules(s,target=null){if(!s)return s;const pending=s.seenIds.filter(id=>(!target||reviewById.get(id)?.target===target)&&!s.attempts.some(a=>a.id===id)&&!s.hints.includes(id));return pending.length?{...s,hints:[...s.hints,...pending]}:s;}
export function answerReview(s,choice,now=Date.now()) {
  const q=currentReviewQuestion(s);
  if(!q||!Number.isInteger(choice)||choice<0||choice>=q.options.length||!validTime(now,now)||now<Math.max(s.createdAt,...s.attempts.map(a=>a.at))||s.attempts.some(a=>a.id===q.id))return s;
  return {...s,attempts:[...s.attempts,{id:q.id,choice,correct:choice===q.correct,hinted:s.hints.includes(q.id),repeated:s.repeatedIds.includes(q.id),at:now}]};
}
export function advanceReview(s,now=Date.now()){const q=currentReviewQuestion(s);if(!q||!s.attempts.some(a=>a.id===q.id)||!validTime(now,now)||now<Math.max(s.createdAt,...s.attempts.map(a=>a.at)))return s;return s.index<2?{...s,index:s.index+1}:{...s,finishedAt:s.finishedAt||now};}
export function reviewOutcome(s){return !s||!s.finishedAt||s.attempts.length!==3?null:s.attempts.every(a=>a.correct&&!a.hinted)?'passed':'needs-practice';}
export const knownReviewIds=ids=>[...new Set((Array.isArray(ids)?ids:[]).filter(id=>reviewById.has(id)))];
export function restoreReviewSession(value,now=Date.now()) {
  if(!value||value.version!==1||!validTaskId(value.taskId)||!validTime(value.createdAt,now)||!Number.isInteger(value.setIndex)||!reviewSets[value.setIndex]||!Array.isArray(value.attempts))return null;
  const ids=reviewSets[value.setIndex].map(q=>q.id),filtered=values=>[...new Set((Array.isArray(values)?values:[]).filter(id=>ids.includes(id)))];
  let s={version:1,taskId:value.taskId,setIndex:value.setIndex,index:0,createdAt:value.createdAt,attempts:[],hints:filtered([...(Array.isArray(value.hints)?value.hints:[]),...value.attempts.filter(a=>a?.hinted===true).map(a=>a.id)]),seenIds:filtered(value.seenIds),repeatedIds:filtered([...(Array.isArray(value.repeatedIds)?value.repeatedIds:[]),...value.attempts.filter(a=>a?.repeated===true).map(a=>a.id)]),finishedAt:null};
  for(let i=0;i<3;i++){s.index=i;const a=value.attempts.find(a=>a&&a.id===ids[i]&&validTime(a.at,now)&&a.at>=s.createdAt);if(!a)break;const next=answerReview(s,a.choice,a.at);if(next===s)break;s=next;}
  s.index=Math.min(s.attempts.length,2);if(Number.isInteger(value.index)&&value.index>=0&&value.index<=2&&value.index<=s.attempts.length)s.index=value.index;
  if(s.attempts.length===3&&validTime(value.finishedAt,now)&&value.finishedAt>=Math.max(...s.attempts.map(a=>a.at)))s.finishedAt=value.finishedAt;
  return s;
}
