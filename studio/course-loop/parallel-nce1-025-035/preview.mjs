import {createCourseLoopModel} from '../model.mjs';
let content,lesson,byId,model,state,at=Date.now();
const root=document.querySelector('#root'),error=document.querySelector('#error'),media=document.querySelector('#media'),select=document.querySelector('#course');
let generation=0;
async function choose(){generation++;content=await import('./lesson-nce1-'+select.value.padStart(3,'0')+'.mjs');({lesson,byId}=content);model=createCourseLoopModel(content);at=Date.now();state=model.initialState(at);document.querySelector('#title').textContent=lesson.title;document.querySelector('#goal').textContent=lesson.goal;error.textContent='';media.replaceChildren();render()}
select.value=new URLSearchParams(location.search).get('course')||'25';select.onchange=choose;
const el=(tag,text,parent=root)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;parent.append(n);return n};
function button(label,fn,parent=root,primary=false){const n=el('button',label,parent);n.type='button';if(primary)n.className='primary';n.onclick=fn;return n}
function send(action,paint=true){const r=model.transition(state,action,++at);if(!r.ok){error.textContent=r.message;return false}state=r.state;error.textContent='';if(paint)render();return true}
function render(){
 const v=model.inspect(state,at).view,q=model.currentQuestion(v),r=model.receipt(v,at);root.replaceChildren();root.dataset.phase=v.phase;
 const phaseLabels={diagnostic:'1 · 先尝试',learn:'2 · 针对性学习',guided:'2 · 跟着试',independent:'3 · 撤掉提示，换情境',feedback:'4 · 对照首答，订正',repair:'4 · 换题重试',own:'4 · 用在自己身上',waiting:'5 · 延迟复习安排','review-a':'5 · 到期的新题 A','review-b':'5 · 到期的新题 B','review-feedback':'5 · 本次复习反馈'};
 el('p',phaseLabels[v.phase]);
 const card=el('section');card.className='card';if(q)card.dataset.question=q.id;
 if(q){
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
  for(const t of model.teachingFor(v)){el('h2',t.title,card);el('p',t.explanation,card);el('p',`${t.example} — ${t.meaning}`,card)}
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
  const next=model.recommendation(v,at);if(v.reviewResults.length>=2)el('p','两组新题已用完，需要补充材料。不会把同题当成新的迁移。',card);else if(next.kind==='review')button('开始到期的新题',()=>send({type:'review'}),card,true);else if(next.kind==='needs-new-material')el('p','两组新题已用完，需要补充材料。不会把同题当成新的迁移。',card);else {el('p','当前未到期。此页可用演示时间查看到期题，不能当作真实间隔记录。',card);button('用演示时间进入到期练习',()=>{at=v.dueAt;send({type:'review'})},card)}
  el('p',`开放表达：${r.openExpression==='awaiting-human-review'?'待人工核对':'未记录'}。听力与发音未测；不产生掌握或分数判定。`,card);
 }
 if(!q&&v.attempts.length){const history=el('details');el('summary','回看本页原答与订正',history);for(const a of v.attempts){const task=byId.get(a.id);el('p',`${task.context} 原答：${a.answer}；${a.correct?'本题匹配':'本题需修补'}；${a.hinted?'有帮助':'未用帮助'}；${a.fresh?'本记录首次曝光':'同题重试'}。`,history);const c=v.corrections[a.id];if(c)el('p',`订正：${c.answer}；原因：${c.note}`,history)}}
 renderSources();
 el('p',lesson.scope).className='note';
}
// Render happens after explicit course selection.
setInterval(()=>{if(model.inspect(state,at).view.phase==='waiting')render()},30000);

function renderSources(){
 media.replaceChildren();el('h2','本组教材',media);
 const info=el('p',`NCE1 第${lesson.lessons.join('–')}课 · 原课文、原声与教材插图`,media);
 for(const kind of ['text','audio','comic'])button({text:'看原课文',audio:'听原声片段',comic:'看本课漫画'}[kind],async()=>{
  const ticket=generation;if(!send({type:'source',source:kind}))return;
  const panel=el('div',undefined,media);
  try{
   if(kind==='text'){const data=await(await fetch(lesson.source.languagePath)).json();if(ticket!==generation)return;for(const row of data.rows.slice(4))el('p',row.en+' — '+row.zh,panel)}
   if(kind==='comic'){const img=el('img',undefined,panel);img.alt=`第${lesson.lessons[0]}课教材原页`;img.src=`/preview-source/comic/${lesson.lessons[0]}`}
   if(kind==='audio'){for(const clip of lesson.source.clips){el('p',clip.label,panel);const audio=el('audio',undefined,panel);audio.controls=true;audio.preload='metadata';audio.src=`/preview-source/audio/${lesson.lessons[0]}`;audio.onloadedmetadata=()=>{audio.currentTime=clip.start};audio.ontimeupdate=()=>{if(audio.currentTime>=clip.end)audio.pause()}}}
  }catch{el('p','教材资源暂未加载，可继续试练。',panel)}
 },media);
}
await choose();
