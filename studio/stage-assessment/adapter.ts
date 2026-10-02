import type {State} from '../app/model';
import {append,draftKey,emptyRecord,openReason,readRecord,result} from './model';
import {skills,type Command,type Delivery,type Review,type Skill} from './types';
export const stageTarget = 'stage-nce1-1-6';
type LearnerCommand = Exclude<Command,{type:'review'}|{type:'delivery'}|{type:'restore'}>;
export type Host = {
 /** Read the host's latest State. No separate stage store. */
 read:()=>State|Promise<State>;
 /** Atomically compare the one draft key, persist via the existing host writer,
  * and resolve true only after durable save confirmation. */
 commit:(expectedRaw:string|undefined,nextRaw:string)=>Promise<boolean>;
 courseVersion:string;
};
const id=()=>crypto.randomUUID();
export const stateWithStageDraft=(state:State,expectedRaw:string|undefined,nextRaw:string):State=>{
 if(state.drafts[draftKey]!==expectedRaw)throw Error('保存冲突；先重新读取，当前输入保留。');
 if(readRecord(nextRaw).status!=='ready')throw Error('新证据不能通过校验。');
 return {...state,drafts:{...state.drafts,[draftKey]:nextRaw}};
};
export function hasPriorLearning(state:State){
 if([1,2,3,4,5,6].some(n=>!!state.nce?.[`NCE1-${n}`]?.steps.length))return true;
 return Object.keys(state.drafts).some(k=>/^nce-course-loop-v\d+:NCE1-(1|3|5)$/.test(k));
}
/** Operations serialize within this adapter, while commit's CAS handles other tabs. */
export function createStageAdapter(host:Host){
 let queue:Promise<unknown>=Promise.resolve();
 const serial=<T>(fn:()=>Promise<T>):Promise<T>=>{const task=queue.then(fn);queue=task.catch(()=>undefined);return task;};
 async function load(){const state=await host.read();return readRecord(state.drafts[draftKey]);}
 async function run(command:Command,actor:'learner'|'examiner'){
  if(actor==='learner'&&['review','delivery','restore'].includes(command.type))throw Error('此操作需要宿主绑定的合格外评入口。');
  const state=await host.read(),raw=state.drafts[draftKey],read=readRecord(raw),at=Date.now();
  if(read.status==='blocked')throw Error(read.reason);
  const record=read.status==='empty'?emptyRecord(host.courseVersion,hasPriorLearning(state)):read.record;
  if(command.type==='open'&&command.phase==='T0'&&hasPriorLearning(state))throw Error('宿主已有相关学习记录，不能补造基线。');
  const next=append(record,{id:id(),at,command},at),nextRaw=JSON.stringify(next);
  if(!await host.commit(raw,nextRaw))throw Error('保存未确认，不能打开新题或点亮结果。请重试；输入保留。');
  const confirmed=await host.read();if(confirmed.drafts[draftKey]!==nextRaw)throw Error('持久保存回读未确认，重新读取后继续。');
  return readRecord(nextRaw);
 }
 return {
  load,
  /** Compatibility name: marks restored provenance only. It never deletes
   * answers/drafts, rewrites historical scores, or resets original anchor/due. */
  invalidateRestoredIntervals:()=>serial(()=>run({type:'restore'},'examiner')),
  learner:(command:LearnerCommand)=>serial(()=>run(command,'learner')),
  /** Only bind this port to an authorized external reviewer workflow. Never
   * expose it as learner self-rating or infer it from a transcript/AI output. */
  examiner:{
   available:false as const,
   recordDelivery:(_attemptId:string,_delivery:Delivery)=>Promise.reject(Error('当前未连接真实已授权的合格校准外评者。前端布尔或播放回调不能创建人工证据。')),
   recordReview:(_attemptId:string,_review:Review)=>Promise.reject(Error('当前未连接真实已授权的合格校准外评者。学习者自评、转写、AI或前端布尔不能创建外评成绩。'))
  },
  exportEvidence:async()=>{const state=await host.read(),raw=state.drafts[draftKey];return JSON.stringify({format:'english-studio-stage-evidence',version:1,key:draftKey,raw:raw??null},null,2);},
  restoreEvidence:(input:string)=>serial(async()=>{
   if(input.length>2_100_000)throw Error('备份过大。');
   const data=JSON.parse(input);
   if(!data||Object.keys(data).sort().join(',')!=='format,key,raw,version'||data.format!=='english-studio-stage-evidence'||data.version!==1||data.key!==draftKey||typeof data.raw!=='string')throw Error('备份格式不符；原始记录保留。');
   const restored=readRecord(data.raw),state=await host.read(),raw=state.drafts[draftKey],existing=readRecord(raw);
   if(restored.status!=='ready')throw Error(restored.status==='blocked'?restored.reason:'备份没有证据。');
   if(existing.status==='blocked')throw Error(existing.reason);
   if(raw===data.raw)return existing;
   if(existing.status==='ready'){
    const before=existing.record,after=restored.record;
    if(before.courseVersion!==after.courseVersion||before.priorLearning!==after.priorLearning||before.events.length>after.events.length||before.events.some((e,i)=>JSON.stringify(e)!==JSON.stringify(after.events[i])))throw Error('恢复会覆盖已保存首答或分叉证据，拒绝合并；保留两个备份供核对。');
   }
   // Add provenance only; preserve every source event, answer, draft and due.
   const at=Date.now(),next=append(restored.record,{id:id(),at,command:{type:'restore'}},at),nextRaw=JSON.stringify(next);
   if(!await host.commit(raw,nextRaw))throw Error('恢复保存未确认，原始记录保留。');
   if((await host.read()).drafts[draftKey]!==nextRaw)throw Error('恢复回读未确认。');
   return readRecord(nextRaw);
  })
 };
}
export type StageAdapter=ReturnType<typeof createStageAdapter>;
export type LearnerPort=Pick<StageAdapter,'load'|'learner'|'exportEvidence'|'restoreEvidence'>;
/** Proposed Today interface: caller owns route generation; no host route changes. */
export function stageTodayTasks(state:State,now:number,href:string,returnHref:string){
 const read=readRecord(state.drafts[draftKey],now);if(read.status==='blocked')return [{id:stageTarget,title:'核对阶段原始证据',reason:read.reason,method:'打开阶段页面，下载原始记录供核对；不重置。',evidence:'格式/时间异常待核验，不当作自然到期。',href,returnHref,priority:0,at:now,kind:'resume' as const}];if(read.status==='empty')return [];
 const active=read.view.attempts.find(a=>!a.submittedAt&&!a.interruption);
 if(active)return [{id:stageTarget,title:'第1–6课阶段观察',reason:'继续已保存的首答；限时按实际时间继续。',method:'一次完成本科技能，保存首答。',evidence:'功能候选；真人学习效果待验。',href,returnHref,priority:1,at:active.openedAt,kind:'resume' as const}];
 const failures=skills.map(s=>read.view.attempts.filter(a=>a.skill===s).at(-1)).filter(a=>a&&a.phase!=='T0'&&a.submittedAt&&['failed','invalid','insufficient'].includes(result(a).status));
 if(failures.length)return [{id:stageTarget,title:'第1–6课分科修补',reason:'保留失败，从对应技能的一项目标修补。',method:'先记录专项修补，再用尚未见的备用题。',evidence:'订正不覆盖首答；其他科原观察保留。',href,returnHref,priority:0,at:failures.at(-1)!.submittedAt!,kind:'repair' as const}];
 const due=skills.some(s=>(['T2','T3'] as const).some(p=>openReason(read.view,s,p,now)===null));
 if(due)return [{id:stageTarget,title:'第1–6课自然到期复验',reason:'实际间隔已到，有尚未见的题。',method:'先测，再反馈；四科分别保留结果。',evidence:'待合格外评，不转换为IELTS分数。',href,returnHref,priority:2,at:now,kind:'review' as const}];
 return [];
}
export function stageRouteTarget(task:unknown){return task===stageTarget?{scope:'NCE1-1-6' as const}:null;}
