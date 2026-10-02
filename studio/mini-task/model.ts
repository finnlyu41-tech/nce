import {getMiniTask,type Bank,type MiniItem} from './content';
export const DAY=86_400_000;
export type MiniAction = {type:'draft';value:string}|{type:'help'|'transcript'|'audio-ended'|'next'|'submit'|'review'}|{type:'speech-captured';durationMs:number;bytes:number}|{type:'text-mode'}|{type:'correct'|'correction-draft';value:string;note:string};
export type MiniEvent=MiniAction&{at:number};
export type MiniSnapshot={kind:'english-mini-task';version:1;contentVersion:1;taskId:string;createdAt:number;events:MiniEvent[]};
export type MiniAttempt={itemId:string;bank:Bank;answer:string;at:number;helped:boolean;fresh:boolean;modality:'listening'|'reading'|'speaking'|'writing'|'text';independent:boolean;matched:boolean|null;status:'matched'|'needs-repair'|'awaiting-external-review';audioPlays:number;durationMs:number;bytes:number};
export type MiniView={phase:'teaching'|Bank|'feedback'|'waiting'|'exhausted';bank:Bank|null;draft:string;correctionDraft:string;correctionNote:string;helped:boolean;transcript:boolean;audioPlays:number;durationMs:number;bytes:number;textMode:boolean;attempts:MiniAttempt[];exposures:{itemId:string;kind:'question'|'help'|'transcript'|'audio';at:number}[];corrections:{itemId:string;value:string;note:string;at:number}[];dueAt:number|null;reviewCount:number;lastAt:number};
const MAX_EVENTS=1600,MAX_BYTES=256*1024;
const int=(v:unknown)=>Number.isSafeInteger(v)&&Number(v)>0&&Number(v)<=8640000000000000;
const text=(v:unknown)=>typeof v==='string'&&v.length<=2000;
const fields:Record<MiniAction['type'],string[]>={draft:['value'],help:[],transcript:[],'audio-ended':[],next:[],submit:[],review:[],'speech-captured':['durationMs','bytes'],'text-mode':[],correct:['value','note'],'correction-draft':['value','note']};
const exact=(v:unknown,keys:string[]):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length===keys.length&&Object.keys(v).every(k=>keys.includes(k));
export function initialMini(taskId:string,at=Date.now()):MiniSnapshot{getMiniTask(taskId);if(!int(at))throw Error('时间无效');return {kind:'english-mini-task',version:1,contentVersion:1,taskId,createdAt:at,events:[]}}
const emptyView=(at:number):MiniView=>({phase:'teaching',bank:null,draft:'',correctionDraft:'',correctionNote:'',helped:false,transcript:false,audioPlays:0,durationMs:0,bytes:0,textMode:false,attempts:[],exposures:[],corrections:[],dueAt:null,reviewCount:0,lastAt:at});
export const itemFor=(taskId:string,v:MiniView):MiniItem|null=>v.bank?getMiniTask(taskId).items.find(i=>i.bank===v.bank)||null:null;
const normal=(s:string)=>s.normalize('NFKC').trim().toLowerCase(); // one-word extraction: no broad semantic scoring
const enter=(v:MiniView,bank:Bank,taskId:string,at:number)=>{v.phase=bank;v.bank=bank;v.draft='';v.correctionDraft='';v.correctionNote='';v.helped=bank==='guided';v.transcript=false;v.audioPlays=0;v.durationMs=0;v.bytes=0;v.textMode=false;v.exposures.push({itemId:itemFor(taskId,v)!.id,kind:'question',at})};
function apply(v:MiniView,a:MiniAction,taskId:string,at:number){
 const task=getMiniTask(taskId),q=itemFor(taskId,v),active=q&&v.phase===v.bank;
 const fail=(s:string):never=>{throw Error(s)};
 if(a.type==='draft'){if(!active||!text(a.value))fail('本题输入无效或已提交，原答保留。');v.draft=a.value}
 else if(a.type==='help'||a.type==='transcript'){
  if(!active||a.type==='transcript'&&task.skill!=='listening')fail('当前没有可查看的帮助。');
  v.helped=true;if(a.type==='transcript')v.transcript=true;
  v.exposures.push({itemId:q!.id,kind:a.type,at});
 }else if(a.type==='audio-ended'){
  if(!active||task.skill!=='listening'||v.textMode)fail('当前不是听力播放。');
  v.audioPlays++;v.exposures.push({itemId:q!.id,kind:'audio',at});
 }else if(a.type==='text-mode'){
  if(!active||!['speaking','listening'].includes(task.skill))fail('当前无文字备选。');
  v.textMode=true;v.durationMs=0;v.bytes=0;
  if(task.skill==='listening'){v.helped=true;v.transcript=true;v.exposures.push({itemId:q!.id,kind:'transcript',at})}
 }else if(a.type==='speech-captured'){
  if(!active||task.skill!=='speaking'||v.textMode||!Number.isSafeInteger(a.durationMs)||a.durationMs<500||a.durationMs>120000||!Number.isSafeInteger(a.bytes)||a.bytes<128||a.bytes>20*1024*1024)fail('没有可核对的本地口语录制，不能记为口语提交。');
  v.durationMs=a.durationMs;v.bytes=a.bytes;
 }else if(a.type==='submit'){
  if(!active)fail('本题已提交，不能重复覆盖首答。');
  if(task.skill==='listening'&&!v.textMode&&v.audioPlays===0)fail('请先完整播放声音；播放失败可选受限文字练习。');
  if(task.skill==='speaking'&&!v.textMode&&!v.bytes)fail('请先本地录制口语，或明确改用文字备选。');
  if((task.skill!=='speaking'||v.textMode)&&!v.draft.trim())fail('请填写本题原答。');
  const fresh=v.exposures.filter(e=>e.itemId===q!.id&&e.kind==='question').length===1;
  const open=task.skill==='speaking'||task.skill==='writing';
  const matched=open?null:q!.accepted.some(s=>normal(s)===normal(v.draft));
  const independent=!v.helped&&fresh&&v.bank!=='guided'&&(!['listening','speaking'].includes(task.skill)||!v.textMode);
  v.attempts.push({itemId:q!.id,bank:v.bank!,answer:v.draft,at,helped:v.helped,fresh,modality:v.textMode?'text':task.skill,independent,matched,status:open?'awaiting-external-review':matched?'matched':'needs-repair',audioPlays:v.audioPlays,durationMs:v.durationMs,bytes:v.bytes});
  v.phase='feedback';
 }else if(a.type==='correction-draft'){
  if(v.phase!=='feedback'||!text(a.value)||!text(a.note))fail('修订草稿无效。');v.correctionDraft=a.value;v.correctionNote=a.note;
 }else if(a.type==='correct'){
  if(v.phase!=='feedback'||!q||!text(a.value)||!a.value.trim()||!text(a.note)||!a.note.trim()||v.corrections.some(c=>c.itemId===q.id))fail('订正需保留新答案与原因，不能覆盖已有订正或首答。');
  v.corrections.push({itemId:q!.id,value:a.value,note:a.note,at});
 }else if(a.type==='next'){
  if(v.phase==='teaching')enter(v,'guided',taskId,at);
  else if(v.phase==='feedback'){
   const last=v.attempts.at(-1)!;
   if(last.bank==='guided')enter(v,'independent',taskId,at);
   else if(last.bank==='independent')enter(v,'repair',taskId,at);
   else if(last.bank==='repair'){v.phase='waiting';v.bank=null;v.draft='';v.dueAt=at+DAY}
   else {v.reviewCount++;v.phase=v.reviewCount===2?'exhausted':'waiting';v.bank=null;v.draft='';v.dueAt=v.reviewCount===2?null:at+7*DAY}
  }else fail('当前不能进入下一步。');
 }else if(a.type==='review'){
  if(v.phase!=='waiting'||!v.dueAt||at<v.dueAt)fail('尚未到期，不能提前消耗新题。');
  enter(v,v.reviewCount===0?'delayed-a':'delayed-b',taskId,at);
 }else fail('未知操作，原记录保留。');
 v.lastAt=at;return v;
}
export function restoreMini(raw:string,now=Date.now(),taskId?:string):{ok:true;snapshot:MiniSnapshot;view:MiniView}|{ok:false;message:string;raw:string}{
 try{
  if(typeof raw!=='string'||new TextEncoder().encode(raw).length>MAX_BYTES)throw Error('容量');
  const s:unknown=JSON.parse(raw);
  if(!exact(s,['kind','version','contentVersion','taskId','createdAt','events'])||s.kind!=='english-mini-task'||s.version!==1||s.contentVersion!==1||typeof s.taskId!=='string'||taskId&&s.taskId!==taskId||!int(s.createdAt)||Number(s.createdAt)>now||!Array.isArray(s.events)||s.events.length>MAX_EVENTS)throw Error('格式');
  getMiniTask(s.taskId);const v=emptyView(Number(s.createdAt));let previous=Number(s.createdAt);
  for(const e of s.events){
   if(!e||typeof e.type!=='string'||!Object.hasOwn(fields,e.type)||!exact(e,['type',...fields[e.type as MiniAction['type']],'at'])||!int(e.at)||Number(e.at)<previous||Number(e.at)>now)throw Error('事件');
   apply(v,e as MiniEvent,s.taskId,Number(e.at));previous=Number(e.at);
  }
  return {ok:true,snapshot:s as unknown as MiniSnapshot,view:v};
 }catch{return {ok:false,message:'小任务记录版本、时间、格式或容量不支持；原文保留，请到记录页备份核对。',raw}}
}
export function transitionMini(s:MiniSnapshot,a:MiniAction,at=Date.now()){
 const prior=restoreMini(JSON.stringify(s),at,s.taskId);if(!prior.ok)return prior;
 try{if(!int(at)||at<prior.view.lastAt)throw Error('时间倒退，原答保留。');apply(structuredClone(prior.view),a,s.taskId,at);
  // Only unsubmitted draft edits may compact; evidence/first answers never do.
  const events=s.events.slice();if((a.type==='draft'||a.type==='correction-draft')&&events.at(-1)?.type===a.type)events.pop();events.push({...a,at});
  return restoreMini(JSON.stringify({...s,events}),at,s.taskId);
 }catch(error){return {ok:false as const,message:error instanceof Error?error.message:'操作失败，原答保留。',raw:JSON.stringify(s)}}
}
export function miniRecommendation(v:MiniView,now=Date.now()):'resume'|'review'|'waiting'|'exhausted'{if(v.phase==='exhausted')return 'exhausted';if(v.phase==='waiting')return v.dueAt&&v.dueAt<=now?'review':'waiting';return 'resume'}
