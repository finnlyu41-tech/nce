import type {State} from './model';
import {learningStages,variants,type Variant} from '../ielts-blueprint/types';
import {sampleLessonById,sampleLessonsFor,sampleMaterials,sampleSequence,type SampleMaterial} from '../ielts-blueprint/sample-sequence';
import {emptySampleState,isStoredSampleResponse,type SampleState,type SampleSession,type SampleDraft,type SampleAttempt} from '../ielts-blueprint/sample-sequence-model';

export const sampleProgressKey='ielts-sample-sequence-v1';
const MAX_RAW=2_000_000,MAX_ATTEMPTS=200,MAX_PLAYBACKS=100;
const sessionKeys=new Set(variants.flatMap(variant=>sampleLessonsFor(variant).map(lesson=>`${variant}:${lesson.id}`)));
type Envelope={version:1;contentVersion:number;sequenceId:string;value:SampleState};
export type SampleProgressRead={status:'empty'|'ready';value:SampleState;raw:string|undefined}|{status:'blocked';reason:string;raw:string};
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value)&&[Object.prototype,null].includes(Object.getPrototypeOf(value));
function requireThat(ok:unknown,message:string):asserts ok{if(!ok)throw Error(message)}
function exact(value:unknown,fields:string[],optional:string[]=[]):asserts value is Record<string,unknown>{
 requireThat(object(value)&&Object.keys(value).every(k=>fields.includes(k)||optional.includes(k))&&fields.every(k=>Object.hasOwn(value,k)),'记录字段不完整或包含不支持的内容。');
}
const text=(v:unknown,max:number)=>typeof v==='string'&&v.length<=max;
const time=(v:unknown,now:number,zero=false)=>Number.isSafeInteger(v)&&Number(v)>=(zero?0:1)&&Number(v)<=now;
const count=(v:unknown,max:number)=>Number.isSafeInteger(v)&&Number(v)>=0&&Number(v)<=max;
const normal=(s:string)=>s.trim().replace(/\s+/g,' ').toLowerCase();
function answers(value:unknown,material:SampleMaterial){
 const ids=material.questions?.map(q=>q.id)||[];
 requireThat(object(value)&&Object.keys(value).length<=ids.length&&Object.entries(value).every(([id,v])=>ids.includes(id)&&text(v,500)),'答案与原题不匹配。');
}
function draft(value:unknown,material:SampleMaterial,isTimed:boolean,now:number):asserts value is SampleDraft{
 exact(value,['openedAt','freshAtOpen','unseenConfirmed','answers','response','hinted','startedAt','submittedAt','playbacks']);
 requireThat(time(value.openedAt,now)&&time(value.startedAt,now,true)&&time(value.submittedAt,now,true),'记录时间异常；请核对设备时间后重试。');
 requireThat([value.freshAtOpen,value.unseenConfirmed,value.hinted].every(v=>typeof v==='boolean')&&text(value.response,4000),'作答或提示记录格式不正确。');
 requireThat((!value.startedAt||isTimed&&Number(value.startedAt)>=Number(value.openedAt))&&(!value.submittedAt||Number(value.submittedAt)>=Math.max(Number(value.openedAt),Number(value.startedAt))),'作答时间顺序不正确。');
 answers(value.answers,material);
 requireThat(Array.isArray(value.playbacks)&&value.playbacks.length<=MAX_PLAYBACKS,'播放记录过多或格式不正确，原记录保留。');
 requireThat(!!material.script||value.playbacks.length===0,'当前材料不支持音频记录。');
 const ids=new Set<string>();
 for(const playback of value.playbacks){
  exact(playback,['id','requestedAt','startedAt','endedAt','status','audible','failure']);
  requireThat(text(playback.id,100)&&!!String(playback.id).trim()&&!ids.has(String(playback.id)),'播放标识重复或无效。');ids.add(String(playback.id));
  requireThat(time(playback.requestedAt,now)&&Number(playback.requestedAt)>=Number(value.openedAt)&&time(playback.startedAt,now,true)&&time(playback.endedAt,now,true),'播放时间异常。');
  requireThat(['requested','playing','ended','failed'].includes(String(playback.status))&&typeof playback.audible==='boolean'&&text(playback.failure,500),'播放记录格式不正确。');
  requireThat(!playback.startedAt||Number(playback.startedAt)>=Number(playback.requestedAt),'播放开始时间异常。');
  requireThat(!playback.endedAt||!!playback.startedAt&&Number(playback.endedAt)>=Number(playback.startedAt),'播放结束时间异常。');
  requireThat(playback.status==='failed'?playback.audible===false:playback.failure===''&&(playback.status==='requested'?!playback.startedAt&&!playback.endedAt&&!playback.audible:playback.status==='playing'?!!playback.startedAt&&!playback.endedAt&&!playback.audible:!!playback.startedAt&&!!playback.endedAt),'播放状态与实际记录不一致。');
 }
 requireThat(value.playbacks.filter(p=>p.status==='requested'||p.status==='playing').length<=1,'存在多个未结束的播放请求。');
}
function attempt(value:unknown,material:SampleMaterial,variant:Variant,lessonId:string,source:SampleDraft,now:number):asserts value is SampleAttempt{
 exact(value,['promptId','materialId','lessonId','variant','stage','at','answers','response','matched','correct','total','fresh','hinted','audioUsable','playbackCount','playbackFailures','startedAt','elapsedMs','withinTrainingTime','feedback']);
 requireThat(value.promptId===material.id&&value.materialId===material.id&&value.lessonId===lessonId&&value.variant===variant,'作答来源与类别不一致。');
 requireThat(time(value.at,now)&&Number(value.at)>=source.openedAt&&time(value.startedAt,now,true),'作答时间异常。');
 requireThat([value.fresh,value.hinted,value.audioUsable].every(v=>typeof v==='boolean')&&text(value.response,4000),'作答证据格式不正确。');
 requireThat(!value.fresh||source.freshAtOpen,'已见过的材料不能成为新题证据。');
 requireThat(count(value.playbackCount,source.playbacks.length)&&count(value.playbackFailures,Number(value.playbackCount)),'播放次数与原记录不一致。');
 requireThat(material.script?value.audioUsable===true&&Number(value.playbackCount)>0:value.audioUsable===false&&value.playbackCount===0&&value.playbackFailures===0,'音频证据与材料不一致。');
 requireThat(!value.hinted||source.hinted,'提示历史缺失。');
 answers(value.answers,material);
 if(material.questions){
  requireThat(material.questions.every(q=>String((value.answers as Record<string,string>)[q.id]||'').trim()),'原始答案缺失。');
  const correct=material.questions.filter(q=>q.accepted.some(a=>normal(a)===normal((value.answers as Record<string,string>)[q.id]||''))).length;
  requireThat(value.correct===correct&&value.total===material.questions.length&&value.matched===(correct===material.questions.length)&&value.feedback==='answer-key','原始答案与客观核对结果不一致。');
 }else requireThat(isStoredSampleResponse(String(value.response),material.minimumWords||1)&&value.correct===null&&value.total===null&&value.matched===null&&value.feedback==='self-review-awaiting-human','开放作答必须保留为待人工核对。');
 if(value.stage==='timed'){
  requireThat(value.startedAt===source.startedAt&&Number(value.startedAt)>=source.openedAt&&Number(value.startedAt)>0&&Number(value.at)>=Number(value.startedAt)&&value.elapsedMs===Number(value.at)-Number(value.startedAt)&&value.withinTrainingTime===(Number(value.elapsedMs)<=material.seconds*1000),'训练计时记录不一致。');
 }else requireThat(value.startedAt===0&&value.elapsedMs===null&&value.withinTrainingTime===null,'非限时题不能带有计时通过结果。');
}
function validate(value:unknown,now:number):asserts value is SampleState{
 exact(value,['version','variant','lessonId','sessions']);
 requireThat(value.version===1,'样例状态版本暂不支持；请使用支持该版本的网站。');
 requireThat(value.variant===null||variants.includes(value.variant as Variant),'考试类别不受支持。');
 requireThat((value.variant===null?value.lessonId==='hub-listening':!!sampleLessonById(value.variant as Variant,String(value.lessonId)))&&object(value.sessions)&&Object.keys(value.sessions).length<=sessionKeys.size&&Object.keys(value.sessions).every(key=>sessionKeys.has(key)),'当前课程或课程记录无效。');
 requireThat(value.variant!==null||Object.keys(value.sessions).length===0&&value.lessonId==='hub-listening','未选择类别的记录包含不明学习内容。');
 const allDrafts:{id:string;draft:SampleDraft}[]=[],allAttempts:SampleAttempt[]=[];
 for(const [key,rawSession] of Object.entries(value.sessions)){
  const [variant,id,...rest]=key.split(':');
  const lesson=variants.includes(variant as Variant)&&!rest.length?sampleLessonById(variant as Variant,id):undefined;
  requireThat(lesson,'课程记录的类别或来源不存在。');
  exact(rawSession,['stage','exposures','drafts','attempts','correctionAnswers','correctionResponse','correctionNote','correctedAt'],['reviewPromptId']);
  requireThat(learningStages.includes(rawSession.stage as never)&&Array.isArray(rawSession.exposures)&&rawSession.exposures.length<=6&&new Set(rawSession.exposures).size===rawSession.exposures.length&&object(rawSession.drafts)&&Object.keys(rawSession.drafts).length<=6,'课程阶段或材料曝光记录无效。');
  const materials=sampleMaterials(lesson);
  requireThat(rawSession.exposures.every(id=>typeof id==='string'&&materials.some(m=>m.id===id)&&Object.hasOwn(rawSession.drafts as object,id)),'已见材料记录缺失，不能重新当成新题。');
  for(const [materialId,rawDraft] of Object.entries(rawSession.drafts)){
   const material=materials.find(m=>m.id===materialId);requireThat(material&&rawSession.exposures.includes(materialId),'材料或曝光记录不匹配。');
   draft(rawDraft,material,materialId===lesson.timed.id,now);allDrafts.push({id:materialId,draft:rawDraft});
  }
  requireThat(Array.isArray(rawSession.attempts)&&rawSession.attempts.length<=MAX_ATTEMPTS,'作答次数过多或格式不正确，原始记录保留。');
  for(const [index,rawAttempt] of rawSession.attempts.entries()){
   requireThat(object(rawAttempt)&&['guided','independent','timed','review'].includes(String(rawAttempt.stage)),'作答阶段不正确。');
   const material=rawAttempt.stage==='review'?lesson.reviews.find(m=>m.id===rawAttempt.promptId):lesson[rawAttempt.stage as 'guided'|'independent'|'timed'];
   const source=material&&rawSession.drafts[material.id];requireThat(material&&source,'原始作答材料缺失。');
   attempt(rawAttempt,material,variant as Variant,id,source as SampleDraft,now);
   requireThat(!index||rawAttempt.at>=(rawSession.attempts[index-1] as SampleAttempt).at,'作答记录时间倒序，需核对原记录。');allAttempts.push(rawAttempt);
  }
  const session=rawSession as unknown as SampleSession;
  for(const [materialId,current] of Object.entries(session.drafts))if(current.submittedAt){
   const last=session.attempts.filter(a=>a.promptId===materialId).at(-1);
   requireThat(last&&last.at===current.submittedAt&&last.response===current.response&&Object.keys(last.answers).length===Object.keys(current.answers).length&&Object.entries(last.answers).every(([id,value])=>current.answers[id]===value),'当前作答与最后提交记录不一致。');
  }
  requireThat(text(session.correctionResponse,4000)&&text(session.correctionNote,4000)&&time(session.correctedAt,now,true),'订正内容或时间格式不正确。');answers(session.correctionAnswers,lesson.timed);
  requireThat(session.reviewPromptId===undefined||session.stage==='review'&&lesson.reviews.some(m=>m.id===session.reviewPromptId)&&!!session.drafts[session.reviewPromptId],'复验材料标识不正确。');
  const rank=learningStages.indexOf(session.stage);
  if(rank>=1)requireThat(session.drafts[lesson.model.id],'示范材料曝光记录缺失。');
  if(rank>=2)requireThat(session.drafts[lesson.guided.id],'引导材料曝光记录缺失。');
  if(rank>=3)requireThat(session.attempts.some(a=>a.stage==='guided')&&session.drafts[lesson.independent.id],'前一步作答记录缺失。');
  if(rank>=4)requireThat(session.attempts.some(a=>a.stage==='independent')&&session.drafts[lesson.timed.id],'独立作答记录缺失。');
  if(rank>=5)requireThat(session.attempts.some(a=>a.stage==='timed'),'训练用限时作答缺失。');
  if(session.correctedAt){
   const timed=session.attempts.filter(a=>a.stage==='timed').at(-1);
   requireThat(session.stage==='review'&&timed&&session.correctedAt>=timed.at&&session.correctionNote.trim().length>=8,'订正顺序不正确。');
   requireThat(lesson.timed.questions?lesson.timed.questions.every(q=>q.accepted.some(a=>normal(a)===normal(session.correctionAnswers[q.id]||''))):isStoredSampleResponse(session.correctionResponse,lesson.timed.minimumWords||1),'保存的订正作品不完整。');
  }else requireThat(session.stage!=='review','复验缺少订正时间。');
 }
 // Checking all variants together keeps shared listening/reading/speaking material seen.
 for(const {id,draft} of allDrafts){
  if(draft.freshAtOpen)requireThat(allDrafts.filter(x=>x.id===id&&x.draft.freshAtOpen).length===1&&!allDrafts.some(x=>x.id===id&&x.draft.openedAt<draft.openedAt),'跨类别的材料曝光记录互相矛盾。');
 }
 for(const current of allAttempts)if(current.fresh){
  const owner=allDrafts.find(x=>x.id===current.promptId&&x.draft.freshAtOpen);
  requireThat(owner&&owner.draft.openedAt<=current.at&&allAttempts.filter(a=>a.promptId===current.promptId&&a.fresh).length===1&&!allAttempts.some(a=>a.promptId===current.promptId&&a.at<current.at),'重复材料不能再次成为新题证据。');
 }
}
function envelope(value:SampleState):Envelope{return {version:1,contentVersion:sampleSequence.version,sequenceId:sampleSequence.id,value}}
export function readSampleProgress(raw:string|undefined,now=Date.now()):SampleProgressRead{
 if(raw===undefined)return {status:'empty',value:emptySampleState(),raw};
 try{
  requireThat(raw.length<=MAX_RAW,'这段样例记录超过安全读取大小，请保留备份后核对。');
  const parsed:unknown=JSON.parse(raw);
  exact(parsed,['version','contentVersion','sequenceId','value']);
  requireThat(parsed.version===1&&parsed.contentVersion===sampleSequence.version&&parsed.sequenceId===sampleSequence.id,'样例记录或内容版本暂不支持，请保留原文并使用对应版本的网站。');
  validate(parsed.value,now);return {status:'ready',value:parsed.value,raw};
 }catch(error){return {status:'blocked',reason:error instanceof SyntaxError?'样例记录不是完整的 JSON，原文已保留。':error instanceof Error?error.message:'样例记录暂时无法读取，原文已保留。',raw}}
}
export function serializeSampleProgress(value:SampleState,now=Date.now()){
 validate(value,now);const raw=JSON.stringify(envelope(value));requireThat(raw.length<=MAX_RAW,'这段样例记录已到保存上限；原记录保留，请先保存整站备份。');return raw;
}
/** Recovery changes only dangling playback metadata; no audio, score, answer or exposure is invented. */
export function recoverSamplePlayback(value:SampleState){
 let interrupted=0;const next=structuredClone(value);
 for(const session of Object.values(next.sessions))for(const draft of Object.values(session.drafts))for(const playback of draft.playbacks)if(playback.status==='requested'||playback.status==='playing'){
  playback.status='failed';playback.audible=false;playback.failure='页面离开或刷新时播放中断，未确认完整听到。';interrupted++;
 }
 return {value:interrupted?next:value,interrupted};
}
/** Optimistic compare-and-swap keeps a restore or a newer writer from being overwritten. */
export function replaceSampleProgress(state:State,expectedRaw:string|undefined,nextRaw:string,now=Date.now()):State{
 if(state.drafts[sampleProgressKey]!==expectedRaw||readSampleProgress(expectedRaw,now).status==='blocked'||readSampleProgress(nextRaw,now).status!=='ready')return state;
 return {...state,drafts:{...state.drafts,[sampleProgressKey]:nextRaw}};
}
