import {createCourseLoopModel} from '../model.mjs';
const id=new URL(location.href).searchParams.get('course')||'nce1-13';
if(!['nce1-13','nce1-15','nce1-17','nce1-19','nce1-21','nce1-23'].includes(id))throw Error('Unsupported preview course');
const content=await import(`./lesson-nce1-${id.slice(5).padStart(3,'0')}.mjs`);
const {lesson,byId}=content;
const {initialState,transition,inspect,currentQuestion,teachingFor,receipt,recommendation}=createCourseLoopModel(content);
document.querySelector('h1').textContent=lesson.title;
document.title=lesson.title+' · 练习预览';
let sourceKind=null,sourceData=null;
async function openSource(kind){
 if(!send({type:'source',source:kind},false))return;
 const result=await fetch(lesson.source.languagePath);if(!result.ok){error.textContent='本课教材暂时无法打开。';return;}
 sourceData=await result.json();if(sourceData.sourceSha256!==lesson.source.languageSha256){error.textContent='教材来源与本课不一致。';return;}
 sourceKind=kind;render();
}
let state=initialState();const root=document.querySelector('#root'),error=document.querySelector('#error');
const el=(tag,text,parent=root)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;parent.append(n);return n};
function button(label,fn,parent=root,primary=false){const n=el('button',label,parent);n.type='button';if(primary)n.className='primary';n.onclick=fn;return n}
function send(action,paint=true){if(['next','retry','review'].includes(action.type))sourceKind=null;const r=transition(state,action);if(!r.ok){error.textContent=r.message;return false}state=r.state;error.textContent='';if(paint)render();return true}
function render(){
 const v=inspect(state).view,q=currentQuestion(v),r=receipt(v);root.replaceChildren();
 const phaseLabels={diagnostic:'1 · 先尝试',learn:'2 · 针对性学习',guided:'2 · 跟着试',independent:'3 · 撤掉提示，换情境',feedback:'4 · 对照首答，订正',repair:'4 · 换题重试',own:'4 · 用在自己身上',waiting:'5 · 延迟复习安排','review-a':'5 · 到期的新题 A','review-b':'5 · 到期的新题 B','review-feedback':'5 · 本次复习反馈'};
 el('p',phaseLabels[v.phase]);
 const card=el('section');card.className='card';
 if(q){
  card.dataset.question=q.id;
  const a=v.attempts.find(a=>a.id===q.id&&a.exposure===v.exposures.filter(x=>x.id===q.id).length);
  el('small',`第 ${v.index+1} / 3 题`,card);el('p',q.context,card).className='context';el('h2',q.prompt,card);
  if(v.phase==='guided'||v.hinted){const t=lesson.teaching.find(t=>t.target===q.target);el('p',t.check,card);el('p',t.example,card)}
  if(q.kind==='choice'){for(const option of q.options){const b=button(option,()=>send({type:'draft',value:option}),card);b.disabled=!!a;b.setAttribute('aria-pressed',String(v.draft===option))}}
  else {const label=el('label','你的英文回答',card),input=el('input',undefined,label);input.value=v.draft;input.autocomplete='off';input.spellcheck=false;input.disabled=!!a;input.oninput=()=>send({type:'draft',value:input.value},false)}
  if(a){
   const feedback=el('p',undefined,card);feedback.className='feedback';
   feedback.textContent=['diagnostic','independent'].includes(v.phase)?'首答已留在本页。完成这三题后一起看反馈。':`${a.correct?'这次与目标句一致。':'这次需要修补。'} 参考：${q.accepted[0]} ${q.why}`;
   if(!a.correct&&['guided','repair'].includes(v.phase))button('对照后重试',()=>send({type:'retry'}),card,true);
   else button(v.index<2?'下一题':v.phase==='diagnostic'?'看针对性讲解':v.phase==='guided'?'收起示范，自己试':v.phase==='independent'?'看首答与反馈':v.phase==='repair'?'换成自己的问答':'看本次复习记录',()=>send({type:'next'}),card,true);
  }else {button('提交本题',()=>send({type:'submit'}),card,true);if(v.phase!=='guided')button('需要提示',()=>send({type:'help'}),card);button('暂时不会，先记下',()=>send({type:'not-yet'}),card)}
 }else if(v.phase==='learn'){
  el('p','先看本次最需要修补的地方，再确认其余两点。',card);
  for(const t of teachingFor(v)){el('h2',t.title,card);el('p',t.explanation,card);el('p',`${t.example} — ${t.meaning}`,card)}
  const media=el('aside',undefined,card);el('h3','本课教材',media);for(const clip of lesson.source.clips)el('p',clip.label,media);
  button('跟着换一句',()=>send({type:'next'}),card,true);
 }else if(v.phase==='feedback'){
  for(const a of v.attempts.filter(a=>a.stage==='independent')){
   const q=byId.get(a.id);el('h2',q.context,card);el('p',`你的首答：${a.answer}`,card);el('p',`${a.correct?'与本题目标一致':'需要修补'}${a.hinted?' · 使用过帮助':''}`,card);el('p',`参考：${q.accepted[0]} ${q.why}`,card);
   if(!a.correct||a.hinted){if(v.corrections[a.id])el('p',`订正：${v.corrections[a.id].answer}；原因：${v.corrections[a.id].note}`,card);else {const label=el('label','订正句子',card),answer=el('input',undefined,label),reason=el('label','哪里需要改？写一条原因。',card),note=el('input',undefined,reason);button('保留这条订正',()=>send({type:'correct',id:a.id,answer:answer.value,note:note.value}),card)}}
  }
  button('换三个情境，再试一次',()=>send({type:'next'}),card,true);
 }else if(v.phase==='own'){
  el('h2','写一段自己的问答',card);el('p',lesson.own.prompt,card);const label=el('label','自己的文字（可留待以后）',card),draft=el('textarea',undefined,label);draft.value=v.ownDraft;draft.oninput=()=>send({type:'own-draft',value:draft.value},false);
  el('p',lesson.own.reviewerPrompt,card);button('保留本次记录，安排复习',()=>send({type:'finish'}),card,true);
 }else if(v.phase==='review-feedback'){
  const last=v.reviewResults.at(-1);el('h2',last.independent?'本次新题独立完成':'本次仍需修补',card);
  for(const a of v.attempts.filter(a=>a.stage===last.bank)){const q=byId.get(a.id);el('p',`首答：${a.answer}；参考：${q.accepted[0]}。${q.why}${a.hinted?'（使用过帮助）':''}`,card)}
  el('p','这只是本次题目的记录，不代表听力、口语或长期掌握。',card);button('查看下一次安排',()=>send({type:'next'}),card,true);
 }else{
  el('h2','本次记录已留在当前页面',card);el('p',`复习时间：${new Date(v.dueAt).toLocaleString('zh-CN')}。打开页面或查看计划不算完成复习。`,card);
  const next=recommendation(v);if(next.kind==='review')button('开始到期的新题',()=>send({type:'review'}),card,true);else if(next.kind==='needs-new-material')el('p','两组新题已用完，需要补充材料。不会把同题当成新的迁移。',card);else el('p','当前未到期，到期后再练下一套新题。',card);
  el('p',`开放表达：${r.openExpression==='awaiting-human-review'?'待人工核对':'未记录'}。听力与发音未测；不产生掌握或分数判定。`,card);
 }
 if(!q&&v.attempts.length){const history=el('details');el('summary','回看本页原答与订正',history);for(const a of v.attempts){const task=byId.get(a.id);el('p',`${task.context} 原答：${a.answer}；${a.correct?'本题匹配':'本题需修补'}；${a.hinted?'有帮助':'未用帮助'}；${a.fresh?'本记录首次曝光':'同题重试'}。`,history);const c=v.corrections[a.id];if(c)el('p',`订正：${c.answer}；原因：${c.note}`,history)}}
 const media=el('aside');
 button('看本课原文',()=>openSource('text'),media);
 button('看本课漫画',()=>openSource('comic'),media);
 if(sourceKind){
  button('收起教材',()=>{sourceKind=null;render()},media);
  if(sourceKind==='text')for(const row of sourceData.rows.slice(4)){el('p',row.en,media).lang='en';el('p',row.zh,media);}
  else {const image=el('img',undefined,media);image.src='/source-comic/'+lesson.lessons[0]+'.jpg';image.alt='第'+lesson.lessons[0]+'课教材漫画';image.style.width='100%';}
 }
 el('p',lesson.scope).className='note';
}
render();
setInterval(()=>{if(inspect(state).view.phase==='waiting')render()},30000);
