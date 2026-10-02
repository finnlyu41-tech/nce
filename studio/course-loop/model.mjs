import {lesson,byId,questionsFor,matches} from './lesson-nce1-001.mjs';
const stages=['diagnostic','guided','independent','repair','review-a','review-b'];
const learningSources=['text','audio','comic'];
const clone=value=>structuredClone(value);
const validTime=n=>Number.isSafeInteger(n)&&n>0&&n<=8640000000000000;
export function initialState(at=Date.now()) {
 if(!validTime(at))throw Error('Invalid creation time');
 return {kind:'nce-course-loop-proposal',version:1,lessonId:lesson.id,contentVersion:lesson.version,createdAt:at,events:[]};
}
function base(state){return {phase:'diagnostic',index:0,draft:'',hinted:false,attempts:[],exposures:[{id:'diagnostic-ask',kind:'assessment',at:state.createdAt}],learning:[],corrections:{},ownDraft:'',ownFinal:null,dueAt:null,reviewResults:[],lastAt:state.createdAt};}
export const currentQuestion=v=>stages.includes(v.phase)?questionsFor(v.phase)[v.index]:null;
const exposureCount=(v,id)=>v.exposures.filter(x=>x.id===id).length;
const activeAttempt=v=>{const q=currentQuestion(v);return q?v.attempts.find(a=>a.id===q.id&&a.exposure===exposureCount(v,q.id)):null};
const rejected=message=>({ok:false,message});
function activate(v,phase,at){v.phase=phase;v.index=0;v.draft='';v.hinted=false;expose(v,at);}
function expose(v,at){const q=currentQuestion(v);if(q)v.exposures.push({id:q.id,kind:'assessment',at});}
const affected=v=>v.attempts.filter(a=>a.stage==='independent'&&(!a.correct||a.hinted));
const targetOrder=v=>[...new Set([...v.attempts.filter(a=>a.stage==='diagnostic'&&(!a.correct||a.hinted)).map(a=>byId.get(a.id).target),...lesson.teaching.map(t=>t.target)])];
function reduce(v,event){
 const {type,at}=event;
 if(!validTime(at)||at<v.lastAt)return rejected('时间无效或早于现有记录。');
 const q=currentQuestion(v),a=activeAttempt(v);
 if(type==='draft'){
  if(!q||a||typeof event.value!=='string'||event.value.length>1000)return rejected('本题无法修改。');
  v.draft=event.value;
 }else if(type==='help'){
  if(!q||a)return rejected('当前没有未提交的题目。');
  v.hinted=true;v.learning.push({id:`hint:${q.target}`,at});
 }else if(type==='source'){
  if(!learningSources.includes(event.source))return rejected('未知教材入口。');
  v.learning.push({id:`nce1-1:${event.source}`,at});
  // Any source access while answering is assistance, including before the first answer.
  if(q&&!a)v.hinted=true;
 }else if(type==='not-yet'){
  if(!q||a)return rejected('当前没有待回答的题。');
  v.attempts.push({id:q.id,stage:v.phase,answer:'（暂时不会）',responseKind:'not-yet',correct:false,hinted:v.hinted||v.phase==='guided',fresh:exposureCount(v,q.id)===1,exposure:exposureCount(v,q.id),at});
 }else if(type==='submit'){
  if(!q||a||!v.draft.trim())return rejected('先留下本题真实作答；已提交首答不能覆盖。');
  const previouslySeen=v.exposures.filter(x=>x.id===q.id).length>1;
  v.attempts.push({id:q.id,stage:v.phase,answer:v.draft,correct:matches(q,v.draft),hinted:v.hinted||v.phase==='guided',fresh:!previouslySeen,exposure:exposureCount(v,q.id),at});
 }else if(type==='retry'){
  if(!a||a.correct||!['guided','repair'].includes(v.phase))return rejected('只对当前跟练或修补中的错题重试。');
  // Keep the wrong original. A repeated item can never become fresh evidence.
  v.draft='';v.hinted=true;expose(v,at);
 }else if(type==='next'){
  if(q){
   if(!a||a.pending)return rejected('先提交本题。');
   if(['guided','repair'].includes(v.phase)&&!a.correct)return rejected('对照反馈后重试这一句。');
   if(v.index<questionsFor(v.phase).length-1){v.index++;v.draft='';v.hinted=false;expose(v,at)}
   else if(v.phase==='diagnostic'){v.phase='learn';v.learning.push(...targetOrder(v).map(target=>({id:`teaching:${target}`,at})))}
   else if(v.phase==='guided')activate(v,'independent',at);
   else if(v.phase==='independent')v.phase='feedback';
   else if(v.phase==='repair')v.phase='own';
   else {const attempts=v.attempts.filter(a=>a.stage===v.phase&&!a.pending);const independent=attempts.length===3&&attempts.every(a=>a.correct&&!a.hinted&&a.fresh);v.reviewResults.push({bank:v.phase,at,independent,attemptIds:attempts.map(a=>a.id)});v.dueAt=at+(independent?lesson.intervals.subsequent:lesson.intervals.repair);v.phase='review-feedback';}
  }else if(v.phase==='learn')activate(v,'guided',at);
  else if(v.phase==='feedback'){
   if(affected(v).some(a=>!v.corrections[a.id]))return rejected('保留首答，为错题或有帮助的题目提交订正和原因。');
   activate(v,'repair',at);
  }else if(v.phase==='review-feedback')v.phase='waiting';
  else return rejected('当前步骤不能跳过。');
 }else if(type==='correct'){
  const target=byId.get(event.id);
  if(v.phase!=='feedback'||!affected(v).some(a=>a.id===event.id)||!target||typeof event.answer!=='string'||event.answer.length>1000||!matches(target,event.answer)||typeof event.note!=='string'||!event.note.trim()||event.note.length>1000)return rejected('请写出订正和一条具体原因；这不会覆盖首答。');
  v.corrections[event.id]={answer:event.answer,note:event.note,at};
 }else if(type==='own-draft'){
  if(v.phase!=='own'||typeof event.value!=='string'||event.value.length>2000)return rejected('开放草稿无效。');
  v.ownDraft=event.value;
 }else if(type==='finish'){
  if(v.phase!=='own')return rejected('请先完成前面的实际作答与修补。');
  v.ownFinal={text:v.ownDraft,at,status:v.ownDraft.trim()?'awaiting-human-review':'not-recorded'};
  v.dueAt=at+lesson.intervals.first;v.phase='waiting';
 }else if(type==='review'){
  if(v.phase!=='waiting'||at<v.dueAt)return rejected('复习尚未到期。');
  const bank=['review-a','review-b'].find(bank=>!v.exposures.some(x=>x.kind==='assessment'&&x.id.startsWith(bank+'-')));
  if(!bank)return rejected('本课两组新题已用完，需补充新材料；不能将同题当成陌生迁移。');
  activate(v,bank,at);
 }else return rejected('未知操作。');
 v.lastAt=at;return {ok:true,view:v};
}
export function inspect(state,now=Date.now()){
 if(!state||state.kind!=='nce-course-loop-proposal'||state.version!==1||state.lessonId!==lesson.id||state.contentVersion!==lesson.version||!validTime(state.createdAt)||state.createdAt>now||!Array.isArray(state.events)||state.events.length>2000)return rejected('记录格式或版本不支持；保留原文，不重置。');
 let v=base(state);
 for(const event of state.events){if(!event||event.at>now)return rejected('记录包含未来时间。');const result=reduce(v,event);if(!result.ok)return result;v=result.view;}
 return {ok:true,view:v};
}
export function transition(state,action,at=Date.now()){
 const current=inspect(state,at);if(!current.ok)return {...current,state};
 if(!action||typeof action!=='object'||'at' in action)return {...rejected('时间由宿主提供。'),state};
 const coalesce=['draft','own-draft'].includes(action.type)&&state.events.at(-1)?.type===action.type;
 if(state.events.length>=2000&&!coalesce)return {...rejected('本课记录已达容量上限，请保留并交由宿主处理。'),state};
 const event={...clone(action),at};const result=reduce(current.view,event);
 return result.ok?{ok:true,state:{...clone(state),events:[...clone(coalesce?state.events.slice(0,-1):state.events),event]},view:result.view}:{...result,state};
}
export function restore(raw,now=Date.now()){
 try{const state=JSON.parse(raw);const result=inspect(state,now);return result.ok?{...result,state}:{...result,raw}}catch{return {...rejected('记录无法解析；保留原文。'),raw}}
}
export function teachingFor(view){return targetOrder(view).map(target=>lesson.teaching.find(t=>t.target===target));}
export function receipt(view,now=Date.now()){
 const unseenBank=['review-a','review-b'].find(bank=>!view.exposures.some(x=>x.id.startsWith(bank+'-')));
 return {lessonId:lesson.id,phase:view.phase,dueAt:view.dueAt,due:!!view.dueAt&&now>=view.dueAt,unseenBank:unseenBank||null,
 independent: view.attempts.filter(a=>a.stage==='independent'&&!a.pending).map(a=>({id:a.id,correct:a.correct,assisted:a.hinted})),
 lastReview:view.reviewResults.at(-1)||null,openExpression:view.ownFinal?.status||'not-recorded',
 listening:'not-tested',pronunciation:'not-tested',mastery:'not-assessed',band:null};
}
export function recommendation(view,now=Date.now()){
 if(view.phase!=='waiting')return {kind:'resume',lessonId:lesson.id,phase:view.phase};
 const r=receipt(view,now);
 if(r.due&&r.unseenBank)return {kind:'review',lessonId:lesson.id,dueAt:r.dueAt};
 if(r.due&&!r.unseenBank)return {kind:'needs-new-material',lessonId:lesson.id,dueAt:r.dueAt};
 return {kind:'continue-route',lessonId:lesson.id,dueAt:r.dueAt};
}
