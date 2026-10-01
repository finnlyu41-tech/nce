import {steps, forms, byId} from './content.mjs';
import {storageKey, initialState, restart, goTo, useHint, showQuestion, showRules, submit, independentQuestion, advanceIndependent, correctionTarget, nextFresh, writeDraft, saveDraft, evidence, finishDemo} from './model.mjs';
import {showReviewRules} from './review-model.mjs';
import {createDemoStore} from './demo-store.mjs';
import {createReviewController} from './review-controller.mjs';
const browserPort=name=>{try{return name==='storage'?globalThis.localStorage:globalThis.navigator?.locks;}catch{return undefined;}};
export function startYesterdayDemo(options={}) {
const now=options.now || Date.now,storage=Object.hasOwn(options,'storage')?options.storage:browserPort('storage'),locks=Object.hasOwn(options,'locks')?options.locks:browserPort('locks');
const $ = id => document.getElementById(id);
const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const demoStore=createDemoStore({storage,locks,now}),loaded=demoStore.read();
let state=loaded.ok&&loaded.state?loaded.state:initialState(now()),selected=null,controller=null;
let lastDemoRaw=loaded.ok?loaded.raw:null,lastRequested=null,lastConfirmed=loaded.ok&&loaded.state?JSON.stringify(state):null;
let saveQueue=Promise.resolve(),pending=0,saveProblem=loaded.ok?null:loaded,blocked=!loaded.ok,disposed=false;
function storageNote() {
  const note=saveProblem?.status==='tab-conflict'?'另一个标签更新了体验记录。本页输入保留，尚未覆盖保存；请保留草稿后重新打开。':saveProblem?.status==='invalid-data'?'已有体验记录无法安全读取，原数据保留；本页改动尚未保存。':saveProblem?.status==='invalid-clock'?'设备时间异常，暂时停止保存；本页输入保留。':saveProblem?.status==='locks-unavailable'?'当前浏览器不支持可靠的跨标签保存；本页输入保留，离开可能丢失。':saveProblem?'保存未能确认；输入仍在本页，请重试，成功前不要关闭页面。':pending?'正在保存本页记录…':'体验和复习记录仅保存在当前浏览器。';
  $('storage-note').innerHTML=esc(note)+(saveProblem&&!blocked?' <button class="hint-toggle" data-action="retry-demo">重试保存</button>':'');
}
function persist(force=false) {
  const captured=JSON.stringify(state);
  if(blocked || (captured===lastRequested && (!force || pending)) || (!saveProblem && captured===lastConfirmed)) return saveQueue;
  lastRequested=captured;pending++;storageNote();
  saveQueue=saveQueue.then(async()=> {
    if(blocked) return;
    let result=await demoStore.save(JSON.parse(captured),lastDemoRaw);
    if(!result.ok && result.status==='storage-error') {const check=demoStore.read();if(check.ok && check.raw===captured) result={ok:true,status:'saved',raw:captured};}
    if(result.ok) {lastDemoRaw=result.raw;lastConfirmed=captured;saveProblem=null;}
    else {saveProblem=result;if(['tab-conflict','invalid-data','invalid-clock'].includes(result.status))blocked=true;}
  }).finally(()=> {pending--;storageNote();if(!pending && !disposed) {controller?.onDemoSaved();if(state.step===4)render();}});
  return saveQueue;
}
function isSaved() {return !blocked && !saveProblem && !pending && lastConfirmed===JSON.stringify(state);}
function change(next, focus = false) {state=next;selected=null;render();if(focus){$('screen').focus({preventScroll:true});window.scrollTo(0,0);}}
function primary(label, action, disabled = false) {return `<button class="primary" data-action="${action}" ${disabled ? 'disabled' : ''}>${label}</button>`;}
function card(content, tight = false) {return `<section class="card${tight ? ' card-tight' : ''}">${content}</section>`;}
function stepHeading(kicker, title, lead = '') {return `<p class="kicker"><span>${kicker}</span><span class="badge">${state.step+1} / 5</span></p><h2>${title}</h2>${lead ? `<p class="lead">${lead}</p>` : ''}`;}
function seeRules(target=null) {state=showRules(state,target);const reviewSession=showReviewRules(state.reviewSession,target);if(reviewSession!==state.reviewSession)state={...state,reviewSession};}
function questionView(q, heading) {
  const attempt = state.attempts.find(a => a.id === q.id);
  const hinted = state.hints.includes(q.id);
  const choices = q.options.map((option, i) => {
    const classes = ['choice'];
    if (attempt) {if (i === q.correct) classes.push('correct'); if (i === attempt.choice && !attempt.correct) classes.push('wrong');}
    else if (i === selected) classes.push('selected');
    return `<button class="${classes.join(' ')}" data-choice="${i}" ${attempt ? 'disabled' : ''} aria-pressed="${attempt ? i === attempt.choice : i === selected}"><span class="letter" aria-hidden="true">${'ABC'[i]}</span><span>${esc(option)}</span></button>`;
  }).join('');
  const repeatedError = attempt && !attempt.correct && state.attempts.filter(a => !a.correct && byId.get(a.id).target === q.target).length > 1;
  const reason = repeatedError ? q.hint : q.explanation;
  if(attempt)seeRules(q.target);
  const feedback = attempt ? `<div class="result${attempt.correct ? '' : ' needs'}" role="status"><strong>${attempt.correct ? '这道题答对了' : '看看这个小区别'}</strong>${esc(reason)}${attempt.hinted ? '<span class="hint-used">本题使用过提示，记录为有帮助的回答。</span>' : ''}</div>` : `${hinted ? `<p class="hint">已用提示 · ${esc(q.hint)}</p>` : '<button class="hint-toggle" data-action="hint">给我一点提示（会记录）</button>'}`;
  const repeat = state.previousSeenQuestionIds.includes(q.id);
  return card(`${repeat ? stepHeading('同题重做 · 不计新题证据','再练一次这个小对比') : heading}${repeat ? '<p class="notice">这道题已经看过，可以重做练习，不会重新计为独立新题。</p>' : ''}<div class="dialogue" lang="en">${esc(q.scene)}</div><p class="prompt">${q.prompt}</p><div class="choices" role="group" aria-label="答案选项">${choices}</div>${feedback}`);
}
function currentQuestion() {return state.step === 0 ? byId.get('first-noah') : state.step === 2 ? independentQuestion(state) : state.step === 3 && state.correction.phase === 'challenge' ? byId.get(state.correction.currentId) : null;}
function render() {
  const reviewView=controller?.render();
  if(!reviewView){const q=currentQuestion();if(q)state=showQuestion(state,q.id);if(state.step===1)seeRules();}
  $('progress').innerHTML = steps.map((_,i) => `<span class="${i <= state.step ? 'active' : ''}"></span>`).join('');
  $('current-step').textContent=reviewView?'到期复习 · 3 个情境':`${state.step+1} / 5 · ${steps[state.step]}`;
  $('steps').innerHTML = steps.map((label,i) => `<button class="step${i < state.step ? ' visited' : ''}" data-step="${i}" ${i === state.step ? 'aria-current="step"' : ''}>${label}</button>`).join('');
  let html = '', actions = '';
  if(reviewView) {html=reviewView.html;actions=reviewView.actions;}
  else if (state.step === 0) {
    const q = byId.get('first-noah'), attempt = state.attempts.find(a => a.id === q.id);
    html = questionView(q, stepHeading('先试一题', '你会怎样说昨天？', '先凭自己的想法选，不会也没关系。'));
    actions = attempt ? primary('学一个小规律 →', 'learn') : primary('确认我的回答', 'submit', selected === null);
  } else if (state.step === 1) {
    html = card(`${stepHeading('学一点 · 看三个对比', '过去只标记一次', '说昨天的经历时，注意 go 的变化。')}${Object.entries(forms).map(([key,f]) => `<div class="form"><span class="form-label">${f.name}</span><p class="form-example" lang="en">${key === 'affirmative' ? 'I <strong>went</strong> to the park.' : key === 'negative' ? 'I <strong>didn’t go</strong> to the park.' : '<strong>Did</strong> you <strong>go</strong> to the park?'}</p><p class="form-note">${f.note}</p></div>`).join('')}<p class="key-note">记住：went ／ didn’t go ／ Did…go?<br>现在换人物、换地点，试着自己用。</p>`);
    actions = primary('撤掉讲解，试两道新题 →', 'independent');
  } else if (state.step === 2) {
    const q = independentQuestion(state), attempt = state.attempts.find(a => a.id === q.id);
    html = questionView(q, stepHeading(`独立新题 · ${state.independentCursor+1} / 2`, state.independentCursor ? '把它变成一个问题' : '说昨天没有做的事', '先独立回答。需要时可以用提示，会留下标记。'));
    actions = attempt ? primary(state.independentCursor ? '看反馈，换一个情境 →' : '下一道新题 →', 'next-independent') : primary('确认我的回答', 'submit', selected === null);
  } else if (state.step === 3) {
    const phase = state.correction.phase;
    if (phase === 'intro') {
      const target = correctionTarget(state), wrong = state.attempts.find(a => !a.correct && byId.get(a.id).target === target), q = wrong ? byId.get(wrong.id) : null;
      seeRules(target);
      html = card(`${stepHeading('纠错换题', wrong ? '看原因，再换题试' : '答对之后，也换题试', wrong ? '订正后用不同情境检验，不靠记住原题。' : '再给一个新情境，看看能不能自己用。')}${q ? `<p class="answer-line">你选了：<span lang="en">${esc(q.options[wrong.choice])}</span></p>` : ''}<div class="form"><span class="form-label">${forms[target].name}</span><p class="form-example" lang="en">${esc(forms[target].example)}</p><p class="form-note">${forms[target].note}</p></div><p class="small">本次只检查选择和句子结构，还不能说明自由表达已经掌握。</p>`);
      actions = primary('换一个新情境再试 →', 'fresh');
    } else if (phase === 'challenge') {
      const q = byId.get(state.correction.currentId), attempt = state.attempts.find(a => a.id === q.id);
      html = questionView(q, stepHeading('订正后的新题', '把规律带到新情境', '人物和情境已换。先试着不看提示回答。'));
      if (attempt && !attempt.correct) {
        const more = nextFresh(state).correction.phase !== 'exhausted';
        actions = primary(more ? '记住原因，换题再试 →' : '新题已用完，记一句我的昨天 →', more ? 'fresh' : 'draft');
      } else actions = attempt ? primary('写一句我的昨天 →', 'draft') : primary('确认我的回答', 'submit', selected === null);
    } else if (phase === 'exhausted') {
      html = card(`${stepHeading('这组小样例的边界', '本次新题已用完', '重复原题不能再次当作新题证据。')}<p class="notice">${forms[state.correction.target || 'affirmative'].short} 你可以返回「学一点」看对比，或先记录一段自己的表达。</p>`);
      actions = primary('记录一句我的昨天 →', 'draft');
    } else {
      html = card(`${stepHeading('记录自己的表达 · 可选', '轮到你的昨天', '用 1–2 句写一件昨天做了、或没做的事。')}<label class="draft-label" for="draft">我的小草稿</label><textarea id="draft" maxlength="1200" lang="en" placeholder="写你的真实经历，句子短一点也可以。">${esc(state.draft)}</textarea><p class="pending">只保存和自查，未评分，待核对。</p><p class="small">自查：肯定句用了过去式吗？<br>didn’t 或 Did 后用了原形吗？</p>`);
      actions = primary('保存草稿，看看复习安排 →', 'finish');
    }
  } else {
    const result = evidence(state), enough = result.newAttempts.length > 0;
    const first = result.first ? `${result.first.repeated ? '起步题（同题重做）' : '首答'}：${result.first.correct ? '答对' : '需要订正'}${result.first.hinted ? '，用过提示' : '，未用提示'}。` : '首答：尚未记录。';
    html = card(`${stepHeading('本次记录 · 不代表掌握', enough ? '先有证据，再继续练' : '先看安排，也可以回去试', '把做过的事与还没验证的事分开看。')}<p class="section-label">这次具体检验了什么</p><ul class="evidence"><li><span class="mark">·</span>${first}</li><li><span class="mark">·</span>不同情境首答 ${result.newAttempts.length} 题；无提示答对 ${result.unassisted.length} 题。${result.repeatedCount ? `同题重做 ${result.repeatedCount} 题，未计入新题。` : ''}</li><li><span class="mark">·</span>已回答题中，${result.hintedCount} 题用过提示。${result.correctedTargets.length ? `换题后无提示答对：${result.correctedTargets.map(t => forms[t].name).join('、')}。` : '订正后的无提示新题结果仍待验证。'}</li></ul>${!enough ? '<p class="skip-note">没有可计入的独立新题证据。可以展开「回看 / 跳过」返回，进入页面或同题重做都不算新题完成。</p>' : ''}<p class="section-label">仍待验证</p><p class="small">${state.draft.trim() ? (isSaved()?'开放草稿：已保存，待核对。':'开放草稿：在本页，保存尚未确认，待核对。') : '开放表达：尚未记录。'}<br>${controller?.evidenceNote() || '听力、真实口语、长期保持：尚未检验。'}</p>${state.draft.trim() ? `<details class="draft-preview"><summary>查看我的草稿（待核对）</summary><p class="finished-draft" lang="en">${esc(state.draft)}</p></details>` : ''}${controller?.planPanel() || '<p class="small">正在读取复习安排…</p>'}<p class="small">课文、原音频、漫画和已有学习进度继续保留在学习地图中。</p>`, true);
    actions = (controller?.finalActions() || '<a class="primary primary-link" href="/map/">返回学习地图</a>') + '<details class="restart-menu"><summary>其他操作</summary><button class="secondary" data-action="restart">重新体验这组小样例</button></details>';
  }
  $('screen').innerHTML = html;
  $('actions').innerHTML = actions;
  storageNote();
  if(JSON.stringify(state)!==lastRequested)void persist();
}
const click=async event => {
  const button = event.target.closest('button'); if (!button || button.disabled) return;
  if(await controller.handle(button)) return;
  if (button.dataset.step !== undefined) {controller.leave();const draft = $('draft'); const next = draft ? saveDraft(state,draft.value) : state; document.querySelector('.revisit').open = false; change(goTo(next, Number(button.dataset.step)), true); return;}
  if (button.dataset.choice !== undefined) {selected = Number(button.dataset.choice); render(); return;}
  const action = button.dataset.action;
  if(action==='retry-demo'){await persist(true);await controller.refresh();}
  else if (action === 'submit') {const q = currentQuestion(); if (q && selected !== null) change(submit(state, q.id, selected,now()));}
  else if (action === 'hint') {const q = currentQuestion(); if (q) change(useHint(state,q.id));}
  else if (action === 'learn') change(goTo(state,1),true);
  else if (action === 'independent') change(goTo(state,2),true);
  else if (action === 'next-independent') change(advanceIndependent(state),true);
  else if (action === 'fresh') change(nextFresh(state),true);
  else if (action === 'draft') change(writeDraft(state),true);
  else if (action === 'finish') change(finishDemo(state,$('draft').value,now()),true);
  else if (action === 'restart') {controller.leave();change(restart(state,now()),true);}
};
const input=event=>{if(event.target.id==='draft'){state=saveDraft(state,event.target.value);void persist();}};
const external=event=>{if(event.key===storageKey && event.newValue!==lastDemoRaw){blocked=true;saveProblem={status:'tab-conflict'};storageNote();if(state.step===4)render();}};
controller=createReviewController({getState:()=>state,replaceState:next=>{state=next;},change,render,isSaved,isSaving:()=>pending>0,persist:()=>persist(true)},{storage,locks,now});
document.addEventListener('click',click);document.addEventListener('input',input);window.addEventListener('storage',external);
render();const ready=Promise.resolve(saveQueue).then(()=>controller.init());
return {ready,refresh:()=>controller.refresh(),dispose(){disposed=true;controller.dispose();document.removeEventListener('click',click);document.removeEventListener('input',input);window.removeEventListener('storage',external);}};
}
