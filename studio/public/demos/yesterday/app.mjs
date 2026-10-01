import {steps, forms, byId} from './content.mjs';
import {storageKey, initialState, restart, restoreState, goTo, useHint, showQuestion, showRules, submit, independentQuestion, advanceIndependent, correctionTarget, nextFresh, writeDraft, saveDraft, evidence, reviewDates} from './model.mjs';
const $ = id => document.getElementById(id);
const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let state = initialState(), selected = null, storageAvailable = true;
try {const raw = localStorage.getItem(storageKey); if (raw) state = restoreState(JSON.parse(raw));} catch {storageAvailable = false;}
function persist() {try {localStorage.setItem(storageKey, JSON.stringify(state));} catch {storageAvailable = false;}}
function change(next, focus = false) {state = next; selected = null; persist(); render(); if (focus) {$('screen').focus({preventScroll:true}); window.scrollTo(0,0);}}
function primary(label, action, disabled = false) {return `<button class="primary" data-action="${action}" ${disabled ? 'disabled' : ''}>${label}</button>`;}
function card(content, tight = false) {return `<section class="card${tight ? ' card-tight' : ''}">${content}</section>`;}
function stepHeading(kicker, title, lead = '') {return `<p class="kicker"><span>${kicker}</span><span class="badge">${state.step+1} / 5</span></p><h2>${title}</h2>${lead ? `<p class="lead">${lead}</p>` : ''}`;}
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
  if (attempt) state = showRules(state,q.target);
  const feedback = attempt ? `<div class="result${attempt.correct ? '' : ' needs'}" role="status"><strong>${attempt.correct ? '这道题答对了' : '看看这个小区别'}</strong>${esc(reason)}${attempt.hinted ? '<span class="hint-used">本题使用过提示，记录为有帮助的回答。</span>' : ''}</div>` : `${hinted ? `<p class="hint">已用提示 · ${esc(q.hint)}</p>` : '<button class="hint-toggle" data-action="hint">给我一点提示（会记录）</button>'}`;
  const repeat = state.previousSeenQuestionIds.includes(q.id);
  return card(`${repeat ? stepHeading('同题重做 · 不计新题证据','再练一次这个小对比') : heading}${repeat ? '<p class="notice">这道题已经看过，可以重做练习，不会重新计为独立新题。</p>' : ''}<div class="dialogue" lang="en">${esc(q.scene)}</div><p class="prompt">${q.prompt}</p><div class="choices" role="group" aria-label="答案选项">${choices}</div>${feedback}`);
}
function currentQuestion() {return state.step === 0 ? byId.get('first-noah') : state.step === 2 ? independentQuestion(state) : state.step === 3 && state.correction.phase === 'challenge' ? byId.get(state.correction.currentId) : null;}
function render() {
  const q = currentQuestion(); if (q) state = showQuestion(state,q.id);
  if (state.step === 1) state = showRules(state);
  $('progress').innerHTML = steps.map((_,i) => `<span class="${i <= state.step ? 'active' : ''}"></span>`).join('');
  $('current-step').textContent = `${state.step+1} / 5 · ${steps[state.step]}`;
  $('steps').innerHTML = steps.map((label,i) => `<button class="step${i < state.step ? ' visited' : ''}" data-step="${i}" ${i === state.step ? 'aria-current="step"' : ''}>${label}</button>`).join('');
  let html = '', actions = '';
  if (state.step === 0) {
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
      state = showRules(state,target);
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
    const result = evidence(state), dates = reviewDates(new Date(state.createdAt)), enough = result.newAttempts.length > 0;
    const first = result.first ? `${result.first.repeated ? '起步题（同题重做）' : '首答'}：${result.first.correct ? '答对' : '需要订正'}${result.first.hinted ? '，用过提示' : '，未用提示'}。` : '首答：尚未记录。';
    html = card(`${stepHeading('本次记录 · 不代表掌握', enough ? '先有证据，再继续练' : '先看安排，也可以回去试', '把做过的事与还没验证的事分开看。')}<p class="section-label">这次具体检验了什么</p><ul class="evidence"><li><span class="mark">·</span>${first}</li><li><span class="mark">·</span>不同情境首答 ${result.newAttempts.length} 题；无提示答对 ${result.unassisted.length} 题。${result.repeatedCount ? `同题重做 ${result.repeatedCount} 题，未计入新题。` : ''}</li><li><span class="mark">·</span>已回答题中，${result.hintedCount} 题用过提示。${result.correctedTargets.length ? `换题后无提示答对：${result.correctedTargets.map(t => forms[t].name).join('、')}。` : '订正后的无提示新题结果仍待验证。'}</li></ul>${!enough ? '<p class="skip-note">没有可计入的独立新题证据。可以展开「回看 / 跳过」返回，进入页面或同题重做都不算新题完成。</p>' : ''}<p class="section-label">仍待验证</p><p class="small">${state.draft.trim() ? '开放草稿：已保存，待核对。' : '开放表达：尚未记录。'}<br>听力、真实口语、次日和一周后的新题：尚未检验。</p>${state.draft.trim() ? `<details class="draft-preview"><summary>查看我的草稿（待核对）</summary><p class="finished-draft" lang="en">${esc(state.draft)}</p></details>` : ''}<p class="section-label">接下来 · 都还没做</p><div class="review"><span class="review-day">次日</span><div class="review-body"><strong>${dates.tomorrow} · 建议 2 分钟</strong>先不看规则，用新人物、新地点再造肯定 / 否定 / 问句。</div></div><div class="review"><span class="review-day">一周</span><div class="review-body"><strong>${dates.nextWeek} · 建议 3 分钟</strong>换一个真实经历，独立写 2–3 句，再找人核对。</div></div><p class="review-status">${state.planSaved ? '建议已记下；未来复习尚未进行。' : '这是复习建议，不会自动提醒，也不算已完成。'}</p>`, true);
    actions = primary(state.planSaved ? '复制明天的练习建议' : '记下明天的 2 分钟练习', state.planSaved ? 'copy' : 'save-plan') + '<details class="restart-menu"><summary>其他操作</summary><button class="secondary" data-action="restart">重新体验这组小样例</button></details>';
  }
  $('screen').innerHTML = html;
  $('actions').innerHTML = actions;
  $('storage-note').textContent = storageAvailable ? '体验记录只保存在这台浏览器。' : '当前浏览器无法保存；离开后记录可能丢失。';
  persist();
}
function recordText() {
  const e = evidence(state), dates = reviewDates(new Date(state.createdAt));
  return `讲述昨天的经历 · 小体验记录\n不同情境首答：${e.newAttempts.length}题，无提示答对：${e.unassisted.length}题。\n提示：已回答题中${e.hintedCount}题。\n开放草稿：${state.draft.trim() || '未记录'}\n开放表达待核对；听力、真实口语、长期保持未检验；不提供Band或掌握判定。\n${dates.tomorrow}建议2分钟：新情境造肯定/否定/问句。\n${dates.nextWeek}建议3分钟：新的真实经历写2–3句并核对。\n两次未来复习均尚未进行。`;
}
document.addEventListener('click', async event => {
  const button = event.target.closest('button'); if (!button || button.disabled) return;
  if (button.dataset.step !== undefined) {const draft = $('draft'); const next = draft ? saveDraft(state,draft.value) : state; document.querySelector('.revisit').open = false; change(goTo(next, Number(button.dataset.step)), true); return;}
  if (button.dataset.choice !== undefined) {selected = Number(button.dataset.choice); render(); return;}
  const action = button.dataset.action;
  if (action === 'submit') {const q = currentQuestion(); if (q && selected !== null) change(submit(state, q.id, selected));}
  else if (action === 'hint') {const q = currentQuestion(); if (q) change(useHint(state,q.id));}
  else if (action === 'learn') change(goTo(state,1),true);
  else if (action === 'independent') change(goTo(state,2),true);
  else if (action === 'next-independent') change(advanceIndependent(state),true);
  else if (action === 'fresh') change(nextFresh(state),true);
  else if (action === 'draft') change(writeDraft(state),true);
  else if (action === 'finish') change(goTo(saveDraft(state,$('draft').value),4),true);
  else if (action === 'save-plan') change({...state,planSaved:true});
  else if (action === 'restart') change(restart(state),true);
  else if (action === 'copy') {try {await navigator.clipboard.writeText(recordText()); $('storage-note').textContent = '学习记录已复制，未来复习仍未进行。';} catch {$('storage-note').textContent = '当前浏览器不能复制，可以查看上面的记录。';}}
});
document.addEventListener('input', event => {if (event.target.id === 'draft') {state = saveDraft(state,event.target.value); persist();}});
render();
