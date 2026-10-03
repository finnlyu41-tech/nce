import {skills,phases,minutes,type Skill,type Phase,type Pack,type Attempt,type RecordState,type View,type Command,type Event,type Review,type Result} from './types';
import {firstStageDefinition,type StageDefinition} from './protocol';
export const draftKey=firstStageDefinition.draftKey;
export const DAY = 86_400_000;
export function createStageModel(definition:StageDefinition){
const packs:Pack[] = ['A','B','C','D','E','F'];
const preferred:Record<Phase,Pack> = {T0:'A',T1:'B',T2:'C',T3:'D',repair:'E'};
const requireThat: (ok:unknown,message:string)=>asserts ok = (ok,message) => {if(!ok)throw Error(message);};
const object=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
function shape(x:unknown,required:string[],optional:string[]=[]){requireThat(object(x)&&required.every(k=>Object.hasOwn(x,k))&&Object.keys(x).every(k=>required.includes(k)||optional.includes(k)),'证据字段缺失或包含未知字段，原始记录保留。');}
const text=(x:unknown,max=4000)=>typeof x==='string'&&x.length<=max;
const nonempty=(x:unknown,max=4000)=>text(x,max)&&!!(x as string).trim();
const time=(x:unknown)=>Number.isSafeInteger(x)&&Number(x)>0;
const list=(x:unknown,allowed:readonly string[])=>Array.isArray(x)&&x.length>0&&x.length<=allowed.length&&x.every(v=>allowed.includes(v))&&new Set(x).size===x.length;
function reviewShape(r:Review,skill:Skill){
 shape(r,['reviewer','targetElicited','disputed','secondReview','basis'],['judgments','criticalReversed','dimensions','purposes','actualHeard']);
 shape(r.reviewer,['role','qualified','calibrated','external','basis']);
 requireThat(['teacher','calibrated-reviewer'].includes(r.reviewer.role)&&r.reviewer.qualified===true&&r.reviewer.calibrated===true&&r.reviewer.external===true&&nonempty(r.reviewer.basis)&&nonempty(r.basis),'必须由合格、校准过的外部评阅者提供依据。');
 requireThat([r.targetElicited,r.disputed,r.secondReview].every(x=>typeof x==='boolean'),'评阅条件缺失。');
 if(skill==='listening'||skill==='reading')requireThat(Array.isArray(r.judgments)&&r.judgments.length===6&&r.judgments.every(x=>['correct','wrong','unfinished'].includes(x))&&typeof r.criticalReversed==='boolean'&&r.dimensions===undefined&&r.purposes===undefined,'听读须六项语义判定与关键事实反转判断。');
 else requireThat(Array.isArray(r.dimensions)&&r.dimensions.length===4&&r.dimensions.every(x=>Number.isInteger(x)&&x>=0&&x<=2)&&Array.isArray(r.purposes)&&r.purposes.length===(skill==='speaking'?5:4)&&r.purposes.every(x=>typeof x==='boolean')&&r.judgments===undefined&&r.criticalReversed===undefined,'口写须四维0–2和全部交际目的判定。');
 if(skill==='listening'||skill==='speaking')requireThat(typeof r.actualHeard==='boolean','实际听评不能由转写替代。');
}
function commandShape(c:Command){
 requireThat(object(c)&&typeof c.type==='string','操作无效。');
 const fields:Record<string,[string[],string[]?]>={
  'prior-learning':[['type']],learning:[['type','skills','kind','note']],expose:[['type','pack']],open:[['type','skill','phase','unseen']],draft:[['type','id','answers']],help:[['type','id','help']],delivery:[['type','id','delivery']],submit:[['type','id']],interrupt:[['type','id','reason']],revise:[['type','id','answers','note']],review:[['type','id','review']],restore:[['type']]
 };
 requireThat(fields[c.type],'不支持的操作，不能降级读取。');shape(c,...fields[c.type]);
 if('id' in c)requireThat(nonempty(c.id,128),'作答标识缺失。');
 if('answers' in c)requireThat(Array.isArray(c.answers)&&c.answers.length<=6&&c.answers.every(x=>text(x,12000)),'答案字段无效。');
 if(c.type==='learning')requireThat(list(c.skills,skills)&&['complete','practice','repair','interval-start','unknown'].includes(c.kind)&&text(c.note),'学习范围或时间依据缺失。');
 if(c.type==='learning')definition.validateLearningNote?.(c.note);
 if(c.type==='expose')requireThat(packs.includes(c.pack),'题包不支持。');
 if(c.type==='open')requireThat(skills.includes(c.skill)&&phases.includes(c.phase)&&typeof c.unseen==='boolean','测评条件缺失。');
 if(c.type==='help')requireThat(['neutral-repeat','english-prompt','reference','answer-seen','translator'].includes(c.help),'帮助来源无效。');
 if(c.type==='delivery'){shape(c.delivery,['mode','heard','singlePresentation','humanChecked','note']);requireThat(['live-reader','human-checked-audio'].includes(c.delivery.mode)&&[c.delivery.heard,c.delivery.singlePresentation,c.delivery.humanChecked].every(x=>typeof x==='boolean')&&text(c.delivery.note),'人声施测证据缺失。');}
 if(c.type==='interrupt')requireThat(nonempty(c.reason),'中断原因缺失。');
 if(c.type==='revise')requireThat(nonempty(c.note),'订正说明缺失。');
}
function emptyRecord(courseVersion:string,priorLearning:boolean):RecordState{
 requireThat(nonempty(courseVersion,128)&&typeof priorLearning==='boolean','须冻结课程版本与学习前条件。');
 return {version:1,scope:definition.scope,protocol:definition.protocol,courseVersion,packVersion:definition.packVersion,priorLearning,events:[]};
}
function result(a:Attempt):Result{
 if(!a.submittedAt)return {status:'pending',reason:a.interruption?'本次中断，题目已曝光；换未见题。':'首答尚未提交。'};
 if(a.interruption)return {status:'invalid',reason:'中断/设备异常，保留首答但不记零分或通过。'};
 if(!a.unseen||a.help.some(h=>h!=='neutral-repeat')||a.help.filter(h=>h==='neutral-repeat').length>1||a.skill!=='speaking'&&a.help.length>0)return {status:'invalid',reason:'材料已见或获得帮助，本次不计独立通过。'};
 if(a.skill==='listening'&&(!a.delivery?.heard||!a.delivery.singlePresentation||a.delivery.mode==='human-checked-audio'&&!a.delivery.humanChecked))return {status:'invalid',reason:'未建立实际人声听见、完整一次呈现条件。'};
 const r=a.reviews.at(-1)?.value;
 if(!r)return {status:'pending',reason:'待合格人工外评；不自动评分。'};
 if(!r.targetElicited)return {status:'insufficient',reason:'目标未充分引出，需另用未见题。'};
 if((a.skill==='speaking'||a.skill==='listening')&&!r.actualHeard)return {status:'insufficient',reason:'缺实际听评依据，转写不能替代。'};
 const score=r.judgments?r.judgments.filter(x=>x==='correct').length:r.dimensions!.reduce((n,x)=>n+x,0),max=r.judgments?6:8;
 const passed=r.judgments?score>=5&&!r.criticalReversed:score>=6&&r.dimensions!.every(x=>x>0)&&r.purposes!.every(Boolean);
 const data={score,max,dimensions:r.dimensions};
 if(!passed)return {...data,status:'failed',reason:'本科技能/关键事实未过候选门槛；原失败保留。'};
 if((score===(max===6?5:6)||r.disputed||a.phase==='T3')&&!r.secondReview)return {...data,status:'provisional',reason:'单人暂评；临界、争议或7天通过待第二评阅者复核。'};
 return {...data,status:'candidate',reason:'本任务达到待真人试测的产品候选门槛。'};
}
const passed=(a:Attempt)=>['candidate','provisional'].includes(result(a).status);
function interval(view:View,skill:Skill,phase:'T2'|'T3',now:number){
 const relevant=view.learning.filter(l=>l.skills.includes(skill));
 const last=relevant.at(-1);
 const known=!!last&&last.kind!=='unknown';
 const priorCandidate=phase==='T2'?view.attempts.filter(a=>a.skill===skill&&(a.phase==='T1'||a.phase==='repair')).at(-1):view.attempts.filter(a=>a.skill===skill&&a.phase==='T2').at(-1);
 const prior=priorCandidate&&passed(priorCandidate)?priorCandidate:undefined;
 // Every retrieval, including a failed test, resets the next interval.
 const latestAssessment=view.attempts.filter(a=>a.skill===skill&&a.submittedAt).at(-1)?.submittedAt||0;
 const anchor=Math.max(last?.at||0,prior?.submittedAt||0,latestAssessment);
 const dueAt=known&&prior?anchor+(phase==='T2'?DAY:7*DAY):0;
 // Restoration is provenance, never practice. Preserve all original anchors
 // and due dates; separately fence unverified imported time qualifications.
 const restore=view.restorations.at(-1),verification=restore&&(!last||last.order<restore.order)?'restored-time-unverified' as const:'recorded' as const;
 return {known,anchor,dueAt,hours:anchor?(now-anchor)/3_600_000:0,verification,ready:dueAt>0&&dueAt<=now&&verification==='recorded'};
}
function availablePack(view:View,skill:Skill,phase:Phase):Pack|undefined{
 const consumed=new Set([...view.exposed,...view.attempts.filter(a=>a.skill===skill).map(a=>a.pack)]);
 const candidates=phase==='repair'?['E','F'] as Pack[]:[preferred[phase],'E','F'] as Pack[];
 return candidates.find(p=>!consumed.has(p));
}
function openReason(view:View,skill:Skill,phase:Phase,now:number):string|null{
 if(view.attempts.some(a=>!a.submittedAt&&!a.interruption))return '先结束或记录当前科目中断，再打开新题。';
 if(phase==='T0'&&(view.priorLearning||view.learning.length||view.attempts.some(a=>a.skill===skill&&a.phase!=='T0')))return '已学过或已开始学习，不能补造学习前基线。';
 const same=view.attempts.filter(a=>a.skill===skill&&a.phase===phase).at(-1);
 if(same?.submittedAt&&result(same).status==='pending')return '这份首答仍待合格人工外评，先保留并核对。';
 if(phase==='T0'&&same?.submittedAt&&!['invalid','insufficient'].includes(result(same).status))return '本科技能已有基线，不重复刷分。';
 if(phase==='T1'&&!view.learning.some(l=>l.kind==='complete'&&l.skills.includes(skill)))return `先记录${definition.label}相关学习完成；声明与人工验证分别保留。`;
 if(phase==='T1'&&same?.submittedAt&&result(same).status==='failed')return '学后首测失败已保留；先针对性修补，再进入修补后新题。';
 if(phase==='T1'&&view.attempts.some(a=>a.skill===skill&&a.phase==='T1'&&passed(a)))return '已有学后观察，请进入真实延迟。';
 if(phase==='repair'){
  const a=view.attempts.filter(a=>a.skill===skill&&a.submittedAt).at(-1);
  if(!a||passed(a)||result(a).status==='pending')return '修补需要已评阅的失败/无效首测。';
  if(a.phase==='T0'||!view.learning.some(l=>l.skills.includes(skill)&&l.kind==='complete'))return `基线之后先完成正常${definition.label}学习，再做学后首测。`;
  if(!view.learning.some(l=>l.skills.includes(skill)&&l.kind==='repair'&&l.order>(a.submittedOrder||a.openOrder)))return '先记录本科技能修补，再换备用新题。';
 }
 if(phase==='T2'||phase==='T3'){
  const i=interval(view,skill,phase,now);
  if(i.verification==='restored-time-unverified')return '原答、草稿和原到期时间已保留；导入历史的自然间隔资格待人工核验，不能据导入直接通过。可明确从现在建立新的观察区间。';
  if(!i.known)return '最近专项练习时间未知；从现在开始新的可观察间隔。';
  if(!i.dueAt)return phase==='T2'?'先取得学后/修补后的有效本科技能观察。':'先取得有效24小时观察，不能跳过。';
  if(!i.ready)return `尚未自然到期，需等到 ${new Date(i.dueAt).toISOString()}。`;
  const last=view.attempts.filter(a=>a.skill===skill&&a.phase===phase).at(-1);
  if(last&&result(last).status==='failed'&&!view.learning.some(l=>l.skills.includes(skill)&&l.kind==='repair'&&l.order>(last.submittedOrder||last.openOrder)))return '本次延迟失败，先记录对应目标修补，再重新等待真实间隔。';
  if(last&&passed(last)&&!view.learning.some(l=>l.skills.includes(skill)&&l.order>(last.submittedOrder||last.openOrder)))return '该间隔已有观察；后续专项练习应如实另记。';
 }
 if(!availablePack(view,skill,phase))return '题池耗尽，待新未见题；不能重用旧卷过线。';
 return null;
}
function applyToView(view:View,event:Event):View{
 const v:View=structuredClone(view),c=event.command,at=event.at;v.sequence++;
 commandShape(c);
 if(c.type==='prior-learning'){v.priorLearning=true;return v;}
 if(c.type==='restore'){v.restorations.push({at,order:v.sequence});return v;}
 if(c.type==='learning'){
  v.learning.push({at,order:v.sequence,skills:c.skills,kind:c.kind,note:c.note});v.priorLearning=true;
  v.attempts.filter(a=>!a.submittedAt&&c.skills.includes(a.skill)).forEach(a=>a.help.push('reference'));
  return v;
 }
 if(c.type==='expose'){
  if(!v.exposed.includes(c.pack))v.exposed.push(c.pack);
  // A late disclosure of prior exposure withdraws independence as well.
  v.attempts.filter(a=>a.pack===c.pack).forEach(a=>{a.unseen=false;});return v;
 }
 if(c.type==='open'){
  const reason=openReason(v,c.skill,c.phase,at);requireThat(!reason,reason||'不能打开题目。');
  const pack=availablePack(v,c.skill,c.phase)!;
  const observedInterval=c.phase==='T2'||c.phase==='T3'?interval(v,c.skill,c.phase,at):undefined;
  v.attempts.push({id:event.id,skill:c.skill,phase:c.phase,pack,openedAt:at,openOrder:v.sequence,deadline:at+minutes[c.skill]*60_000,unseen:c.unseen,answers:Array(c.skill==='reading'||c.skill==='listening'?6:1).fill(''),help:[],observedInterval,revisions:[],reviews:[]});return v;
 }
 const a=v.attempts.find(x=>x.id===c.id);requireThat(a,'原始作答缺失。');
 if(c.type==='draft'){requireThat(!a.submittedAt&&!a.interruption&&at<=a.deadline,'首答已锁定或限时结束；修改只能另存订正。');requireThat(c.answers.length===a.answers.length,'答案数量不符。');a.answers=c.answers;}
 if(c.type==='help'){requireThat(!a.submittedAt&&!a.interruption,'帮助只能记录在作答期间。');a.help.push(c.help);}
 if(c.type==='delivery'){requireThat(a.skill==='listening'&&!a.submittedAt&&!a.interruption&&!a.delivery,'听力施测证据只能由外评入口记录一次。');a.delivery=c.delivery;}
 if(c.type==='submit'){requireThat(!a.submittedAt&&!a.interruption,'首次提交不可重复或覆盖。');a.first=[...a.answers];a.submittedAt=at;a.submittedOrder=v.sequence;}
 if(c.type==='interrupt'){requireThat(!a.submittedAt&&!a.interruption,'已结束作答不能重复中断。');a.interruption=c.reason;a.first=[...a.answers];a.submittedAt=at;a.submittedOrder=v.sequence;}
 if(c.type==='revise'){requireThat(a.submittedAt&&c.answers.length===a.answers.length,'先保留首答；订正字段不符。');a.revisions.push({at,answers:c.answers,note:c.note});}
 if(c.type==='review'){
  requireThat(a.submittedAt,'先提交首答，不能边评分边作答。');reviewShape(c.review,a.skill);requireThat(a.reviews.length<2,'本次评阅最多首评和复核；争议需新观察。');
  requireThat(c.review.secondReview===(a.reviews.length===1),'第二复核须在首评之后另存，不能由首评直接声明。');
  if(c.review.secondReview)requireThat(c.review.reviewer.basis!==a.reviews[0].value.reviewer.basis,'第二复核须有独立评阅依据，不能重复首评。');
  a.reviews.push({at,value:c.review});
 }
 return v;
}
function project(record:RecordState):View{
 let view:View={sequence:0,priorLearning:record.priorLearning,attempts:[],learning:[],exposed:[],restorations:[]};
 for(const event of record.events)view=applyToView(view,event);
 return view;
}
function readRecord(raw:string|undefined,now=Date.now()):{status:'empty'}|{status:'ready';record:RecordState;view:View}|{status:'blocked';reason:string}{
 if(raw===undefined)return {status:'empty'};
 try{
  requireThat(raw.length<=2_000_000,'记录超出上限，保留原文件。');const r=JSON.parse(raw) as RecordState;
  shape(r,['version','scope','protocol','courseVersion','packVersion','priorLearning','events']);
  requireThat(r.version===1&&r.scope===definition.scope&&r.protocol===definition.protocol&&r.packVersion===definition.packVersion&&nonempty(r.courseVersion,128)&&typeof r.priorLearning==='boolean'&&Array.isArray(r.events)&&r.events.length<=10000,'版本或范围不支持，不能初始化覆盖。');
  let last=0;const ids=new Set<string>();
  for(const e of r.events){shape(e,['id','at','command']);requireThat(nonempty(e.id,128)&&!ids.has(e.id)&&time(e.at)&&e.at>=last&&e.at<=now,'时间逆序/未来记录或重复标识，不能作为自然间隔证据。');ids.add(e.id);last=e.at;}
  return {status:'ready',record:r,view:project(r)};
 }catch(e){return {status:'blocked',reason:e instanceof Error?e.message:'原始证据读取失败。'};}
}
function append(record:RecordState,event:Event,now:number):RecordState{
 const next={...record,events:[...record.events,event]};const read=readRecord(JSON.stringify(next),now);requireThat(read.status==='ready',read.status==='blocked'?read.reason:'操作失败。');return next;
}
function skillResults(view:View,skill:Skill,now:number){
 return (['T0','T1','T2','T3'] as const).map(phase=>{
  const a=view.attempts.filter(a=>a.skill===skill&&a.phase===phase).at(-1);
  let value:Result=a?result(a):{status:'pending',reason:phase==='T0'&&view.priorLearning?'缺真实基线，不能归因学习收益。':'尚未测评。'};
  if(a&&(phase==='T2'||phase==='T3')&&view.learning.some(l=>l.skills.includes(skill)&&l.order>(a.submittedOrder||a.openOrder)))value={...value,status:'pending',reason:'之后有专项练习/修补或未知间隔，当前保持需另验。'};
  return {phase,attempt:a,result:value,restoredTimeUnverified:!!view.restorations.length&&!view.learning.some(l=>l.skills.includes(skill)&&l.order>view.restorations.at(-1)!.order),interval:phase==='T2'||phase==='T3'?a?.observedInterval??interval(view,skill,phase,now):undefined};
 });
}

return {emptyRecord,result,interval,availablePack,openReason,project,readRecord,append,skillResults};
}
export const {emptyRecord,result,interval,availablePack,openReason,project,readRecord,append,skillResults}=createStageModel(firstStageDefinition);
