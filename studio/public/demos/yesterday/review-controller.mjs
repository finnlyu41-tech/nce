import {createReviewStore,emptySnapshot,getDueTasks,STORAGE_KEY,PLAN_ID} from './review-adapter.mjs';
import {completedDemo} from './model.mjs';
import {reviewSets} from './review-content.mjs';
import {beginReview,currentReviewQuestion,showReviewQuestion,hintReview,answerReview,advanceReview,reviewOutcome} from './review-model.mjs';
const $=id=>document.getElementById(id);
const esc=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const date=at=>new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}).format(new Date(at));
const primary=(label,action,disabled=false)=>`<button class="primary" data-action="${action}" ${disabled?'disabled':''}>${label}</button>`;
const mapLink='<a class="primary primary-link" href="/map/">返回学习地图</a>';
const messages={
  'locks-unavailable':'当前浏览器无法可靠地跨标签保存。输入仍在本页；请使用支持安全保存的浏览器。',
  'storage-error':'保存未能确认，当前输入仍在本页。请重试，成功前不要关闭页面。',
  'storage-unavailable':'当前浏览器无法保存。输入仍在本页，复习安排尚未保存。',
  'invalid-data':'已有复习数据无法安全读取，原数据已保留；没有覆盖或重置。',
  'invalid-clock':'设备时间异常，暂时停止排期，已有记录保留。',
  'result-conflict':'另一个标签已经提交了这次复习。网站保留第一份结果和排期，本页答案没有覆盖它。',
  'stale-task':'这次复习已更新，请使用当前到期入口。',
  'not-due':'还没到这次复习的时间。',
  'invalid-input':'练习时间或任务不匹配，未写入结果；本页答案保留。',
};
export function createReviewController(host,{storage,locks,now=Date.now}={}) {
  const store=createReviewStore({storage,locks,now});
  let snapshot=emptySnapshot(),problem=null,mode=false,selected=null,busy=false,refreshing=null,refreshRequested=false,receipt=null,disposed=false;
  const due=()=>getDueTasks(snapshot,now());
  const session=()=>host.getState().reviewSession;
  const canonical=()=>snapshot.plan?.receipts.find(r=>r.taskId===session()?.taskId) || null;
  const explain=result=>messages[result?.status] || '保存暂未完成，当前输入保留。';
  function accept(result) {
    if(result.snapshot) snapshot=result.snapshot;
    problem=result.ok?null:result;
    receipt=canonical();
  }
  function reminder() {
    if(disposed) return;
    const target=$('review-reminder');
    if(!target) return;
    let tasks=[];try {tasks=due();} catch {problem={status:'invalid-clock'};}
    target.innerHTML=tasks.length ? `<div class="due-notice"><span><strong>有一项到期复习</strong><br>讲述昨天的经历 · 约 2 分钟</span><button data-action="review-open">继续练习 →</button></div>` : '';
  }
  async function refresh() {
    refreshRequested=true;
    if(refreshing) return refreshing;
    refreshing=(async()=> {
      do {
      refreshRequested=false;
      accept(await store.read());
      if(!problem && host.isSaved()) {
        const completion=completedDemo(host.getState(),now());
        if(completion) accept(await store.ensurePlan(completion));
      }
      reminder();
      if(mode || host.getState().step===4) host.render();
      } while(refreshRequested);
    })().finally(()=>{refreshing=null;if(refreshRequested&&!disposed)void refresh();});
    return refreshing;
  }
  function planPanel() {
    if(problem) return `<p class="section-label">复习安排尚未确认</p><p class="notice" role="status">${esc(explain(problem))}</p><button class="hint-toggle" data-action="review-retry-plan">重试保存 / 读取</button>`;
    if(!host.isSaved()) return `<p class="section-label">复习安排尚未保存</p><p class="small">本次作答和草稿仍在本页。先保存记录，再自动安排复习；保存失败时可在下方重试。</p>`;
    if(!snapshot.plan) return `<p class="section-label">网站内自动复习</p><p class="small">完成两道独立题并保存后，会自动安排约 24 小时后的复习。只浏览页面或写草稿不会生成计划。</p>`;
    return `<p class="section-label">复习安排已自动保存</p><div class="review"><span class="review-day">${snapshot.plan.dueAt<=now()?'到期':'下次'}</span><div class="review-body"><strong>${esc(date(snapshot.plan.dueAt))} · 约 2 分钟</strong>先独立回答三个情境题；本次都答对且未用提示，七天后再练，否则一天后再练。</div></div><p class="review-status">重新打开本网站时，会恢复计划并显示到期入口。网站打开期间会更新提醒；关闭网站后不会发通知。此间隔是体验安排，不是雅思评分规则。</p>`;
  }
  function evidenceNote(){return snapshot.plan?.receipts.length?`已完成 ${snapshot.plan.receipts.length} 次到期选择题复习；听力、真实口语、开放表达和长期迁移仍待核验。`:'听力、真实口语、次日和一周后的练习：尚未检验。';}
  function finalActions() {if(!host.isSaved() || (problem&&!snapshot.plan))return primary('重试保存记录和复习安排','review-retry-plan',host.isSaving?.());return snapshot.plan?.dueAt<=now()?primary('开始到期的 2 分钟复习 →','review-open'):mapLink;}
  function render() {
    if(!mode) return null;
    const s=session();
    if(!s) {mode=false;return null;}
    const outcome=reviewOutcome(s);
    if(outcome) {
      const actual=receipt || canonical();
      const status=actual ? `${actual.outcome==='passed'?'已按本次通过结果':'已按需要再练结果'}安排：${date(actual.nextDueAt)}。` : busy?'正在保存复习结果和下一次安排…':problem?explain(problem):'结果尚未保存，请重试。';
      return {html:`<section class="card card-tight"><p class="kicker"><span>到期复习 · 已作答 3 / 3</span><span class="badge">约 2 分钟</span></p><h2>${outcome==='passed'?'这次三题都答对了':'再留一次短练习'}</h2><p class="lead">${outcome==='passed'?'三题均未用提示。':'有错题或用过提示，明天再给一次练习。'}这只是本次选择题记录。</p><ul class="evidence">${s.attempts.map((a,i)=>`<li><span class="mark">·</span>${i+1}. ${reviewSets[s.setIndex][i].target==='affirmative'?'肯定句':reviewSets[s.setIndex][i].target==='negative'?'否定句':'问句'}：${a.correct?'答对':'需要再练'}${a.hinted?'，用过提示':''}${a.repeated?'，同题复做':''}。</li>`).join('')}</ul><p class="notice">${s.repeatedIds.length?'这组题已有曝光，同题复做不算新的迁移证据。':'这是新的原创情境题。'}开放表达、听力、真实口语和长期保持仍待核验；不推断掌握或 Band。</p><p class="section-label">${actual?'结果与排期已自动保存':'保存状态'}</p><p class="small" role="status">${esc(status)}</p>${problem?.status==='result-conflict'||(actual&&actual.outcome!==outcome)?`<p class="notice">${esc(messages['result-conflict'])}</p>`:''}<p class="small">课文、原音频、漫画和已有学习进度继续保留在学习地图中。</p></section>`,actions:actual?mapLink:primary(busy?'正在保存…':'重试保存复习结果','review-save',busy)};
    }
    const shown=showReviewQuestion(s);
    if(shown!==s) host.replaceState({...host.getState(),reviewSession:shown,reviewSeenIds:[...new Set([...host.getState().reviewSeenIds,...shown.seenIds])]});
    const q=currentReviewQuestion(shown),answer=shown.attempts.find(a=>a.id===q.id),hinted=shown.hints.includes(q.id),repeated=shown.repeatedIds.includes(q.id);
    return {html:`<section class="card"><p class="kicker"><span>到期复习 · ${shown.index+1} / 3</span><span class="badge">${repeated?'同题复做':'新情境'}</span></p><h2>先不看规则，再试一次</h2><p class="lead">肯定、否定、问句各一道。${repeated?'这道题看过，按同题复做记录。':'换了人物和情境。'}</p><div class="dialogue" lang="en">${esc(q.scene)}</div><p class="prompt">${q.prompt}</p><div class="choices" role="group" aria-label="复习答案选项">${q.options.map((option,i)=>`<button class="choice${answer?(i===q.correct?' correct':i===answer.choice&&!answer.correct?' wrong':''):i===selected?' selected':''}" data-review-choice="${i}" ${answer?'disabled':''} aria-pressed="${answer?i===answer.choice:i===selected}"><span class="letter" aria-hidden="true">${'ABC'[i]}</span><span>${esc(option)}</span></button>`).join('')}</div>${answer?`<div class="result${answer.correct?'':' needs'}" role="status"><strong>${answer.correct?'这道题答对了':'记住这个区别'}</strong>${esc(q.explanation)}${answer.hinted?'<span class="hint-used">使用过提示，记录为有帮助的回答。</span>':''}</div>`:hinted?`<p class="hint">已用提示 · ${esc(q.hint)}</p>`:'<button class="hint-toggle" data-action="review-hint">给我一点提示（会记录）</button>'}${problem?`<p class="notice">${esc(explain(problem))}</p>`:''}</section>`,actions:answer?primary(shown.index===2?'保存结果，安排下次复习 →':'下一道复习题 →','review-next',busy):primary('确认我的回答','review-submit',selected===null)};
  }
  async function open(taskId=null) {
    await refresh();
    if(problem) {host.render();return;}
    const task=due()[0],old=session();
    if(taskId && old?.taskId===taskId && canonical()) {mode=true;receipt=canonical();host.render();return;}
    if(!task || (taskId && task.taskId!==taskId)) {problem={status:task?'stale-task':'not-due'};host.render();return;}
    mode=true;selected=null;receipt=null;
    const url=new URL(window.location.href);url.searchParams.set('review',task.taskId);window.history.replaceState(null,'',url);
    const next=old?.taskId===task.taskId?old:beginReview(task.taskId,host.getState().reviewSeenIds,snapshot.plan.receipts.length,now());
    host.change({...host.getState(),reviewSession:next},true);
    if(reviewOutcome(next)) await saveResult();
  }
  async function saveResult() {
    if(busy || !reviewOutcome(session())) return;
    busy=true;problem=null;host.render();
    await host.persist();
    if(!host.isSaved()) {problem={status:'storage-error'};busy=false;host.render();return;}
    const s=session();
    accept(await store.recordResult({taskId:s.taskId,resultId:`${s.taskId}:result`,outcome:reviewOutcome(s),at:s.finishedAt}));
    busy=false;reminder();host.render();
  }
  async function handle(button) {
    if(button.dataset.reviewChoice!==undefined) {selected=Number(button.dataset.reviewChoice);host.render();return true;}
    const action=button.dataset.action;
    if(!action?.startsWith('review-')) return false;
    if(action==='review-open') await open();
    else if(action==='review-retry-plan') {await host.persist();await refresh();}
    else if(action==='review-hint') {host.change({...host.getState(),reviewSession:hintReview(session())});}
    else if(action==='review-submit' && selected!==null) {const choice=selected;selected=null;host.change({...host.getState(),reviewSession:answerReview(session(),choice,now())});}
    else if(action==='review-next' && !busy) {selected=null;host.change({...host.getState(),reviewSession:advanceReview(session(),now())},true);if(reviewOutcome(session())) await saveResult();}
    else if(action==='review-save') await saveResult();
    return true;
  }
  const storageEvent=event=>{if(event.key===STORAGE_KEY) void refresh();};
  const focus=()=>void refresh();
  const visibility=()=>{if(!document.hidden) void refresh();};
  window.addEventListener('storage',storageEvent);window.addEventListener('focus',focus);document.addEventListener('visibilitychange',visibility);
  const interval=window.setInterval(()=>{if(!document.hidden) void refresh();},60000);
  return {render,handle,planPanel,evidenceNote,finalActions,refresh,async init() {
    accept(await store.ready());await refresh();
    const requested=new URLSearchParams(window.location.search).get('review');
    if(requested) await open(requested);
    else if(session()?.finishedAt && !canonical() && !problem && due().some(t=>t.taskId===session().taskId)) {mode=true;host.render();await saveResult();}
  },onDemoSaved() {void refresh();},leave() {mode=false;selected=null;const url=new URL(window.location.href);url.searchParams.delete('review');window.history.replaceState(null,'',url);},dispose() {disposed=true;clearInterval(interval);window.removeEventListener('storage',storageEvent);window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',visibility);}};
}
