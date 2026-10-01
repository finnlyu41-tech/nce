import {practiceIssues, retryFeedback, type PracticeIssue, type PronunciationResult} from '../app/pronunciation';
import type {Unit} from './curriculum';

export type SpeakingTake = {id:string;at:number;assisted:boolean;review:boolean};
export type SpeakingRecord = {
  row:number;
  source:string;
  takes:SpeakingTake[];
  correction?:{at:number;issues:PracticeIssue[]};
  comparison:string[];
  hintAt?:number;
  recalledAt?:number;
};
export const speakingDelay=24*60*60*1000;
export function speakingRow(unit:Unit) {
  const index=unit.rows.findIndex(r=>r.en.trim().split(/\s+/).length>=4&&r.en.trim().split(/\s+/).length<=18&&r.end-r.start<=25);
  return index<0?0:index;
}
export function emptySpeaking(unit:Unit):SpeakingRecord {
  return {row:speakingRow(unit),source:unit.sourceSha256,takes:[],comparison:[]};
}
export function speakingReviewAt(record?:SpeakingRecord):number|undefined {
  if(!record?.correction?.issues.length)return;
  const due=Math.max(record.correction.at,record.hintAt||0)+speakingDelay;
  return record.recalledAt&&record.recalledAt>=due?undefined:due;
}
export function speakingDue(record?:SpeakingRecord,now=Date.now()) {
  const date=speakingReviewAt(record);return date!==undefined&&now>=date;
}
export function recordedSpeaking(record:SpeakingRecord,id:string,review:boolean,assisted:boolean,now=Date.now()):SpeakingRecord {
  const independent=review&&!assisted&&speakingDue(record,now);
  return {...record,takes:[{id,at:now,review,assisted},...record.takes].slice(0,2),comparison:[],recalledAt:independent?now:record.recalledAt};
}
export function assessedSpeaking(record:SpeakingRecord,result:PronunciationResult,previous?:PronunciationResult,now=Date.now()):SpeakingRecord {
  const issues=practiceIssues(result);
  return {...record,correction:issues.length?{at:now,issues}:record.correction,comparison:previous?retryFeedback(previous,result):[]};
}
const object=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const string=(x:unknown,max=500):x is string=>typeof x==='string'&&x.length<=max;
const time=(x:unknown)=>typeof x==='number'&&Number.isFinite(x)&&x>0&&x<=Date.now();
export function validSpeakingRecord(x:unknown,unit:Unit):x is SpeakingRecord {
  if(!object(x)||!Number.isInteger(x.row)||Number(x.row)<0||Number(x.row)>=unit.rows.length||x.source!==unit.sourceSha256||!Array.isArray(x.takes)||x.takes.length>2||!Array.isArray(x.comparison)||x.comparison.length>2||x.comparison.some(v=>!string(v)))return false;
  if(x.takes.some(t=>!object(t)||!string(t.id,80)||!/^take-[a-z0-9-]+$/.test(t.id)||!time(t.at)||typeof t.assisted!=='boolean'||typeof t.review!=='boolean'))return false;
  if(new Set(x.takes.map(t=>t.id)).size!==x.takes.length||x.takes.length===2&&x.takes[0].at<x.takes[1].at)return false;
  for(const key of ['hintAt','recalledAt'])if(x[key]!==undefined&&!time(x[key]))return false;
  if(x.recalledAt!==undefined&&(!x.takes.length||Number(x.recalledAt)>x.takes[0].at))return false;
  if(x.correction!==undefined){
    const c=x.correction;
    if(!object(c)||!time(c.at)||!Array.isArray(c.issues)||!c.issues.length||c.issues.length>2)return false;
    for(const issue of c.issues){
      if(!object(issue)||!string(issue.title)||!string(issue.action))return false;
      for(const key of ['word','phoneme','example'])if(issue[key]!==undefined&&!string(issue[key],100))return false;
      if(issue.clip!==undefined){const p=issue.clip;if(!object(p)||typeof p.start!=='number'||typeof p.end!=='number'||!Number.isFinite(p.start)||!Number.isFinite(p.end)||p.start<0||p.end>30||p.end<=p.start)return false;}
    }
  }
  return true;
}
