'use client';
import {useEffect, useRef, useState} from 'react';
import {Recorder} from '../app/recording-feedback';
import type {LearningStage, Variant} from './types';
import {sampleLessonsFor, sampleMaterials, sampleSequence, type SampleMaterial} from './sample-sequence';
import {activeSampleDraft, activeSampleMaterial, emptySampleState, sampleLessonReceipt, sampleSession, sampleWordCount, selectedSampleLesson, transitionSample, type SampleAction, type SampleState} from './sample-sequence-model';

export type SampleSequenceProps = {value?: SampleState; initialValue?: SampleState; onChange?: (state: SampleState) => void; guidedFlow?: boolean; persistenceNote?: string};
const stageNames: Record<LearningStage, string> = {explain: '理解方法', model: '看一个示范', guided: '跟着试', independent: '撤提示 · 新题', timed: '训练用限时', feedback: '反馈与订正', review: '延迟 · 新题复验'};
const stages = Object.keys(stageNames) as LearningStage[];
const delayedNames = {'not-scheduled': '订正后安排复验', 'not-due': '尚未到 24 小时', 'awaiting-new-task': '可以用新题复验', 'needs-repair': '新题仍有错误，先修这一处', assisted: '这次有提示、重播或材料已见过，保留为练习', 'awaiting-human-review': '新题作品已保留，等待人工／音频核验', 'local-target-observed': '观察到这两道局部目标的隔日独立表现'};
const recordTime = (at: number) => <time dateTime={new Date(at).toISOString()}>{new Date(at).toLocaleString('zh-CN', {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false})}</time>;

/** Standalone teaching sample. Host owns persistence; no localStorage or app progress writes. */
export function IELTSSampleSequence({value, initialValue, onChange, guidedFlow = false, persistenceNote}: SampleSequenceProps) {
  const [internal, setInternal] = useState<SampleState>(() => initialValue || emptySampleState());
  const state = value || internal, latest = useRef(state); latest.current = state;
  const [issue, setIssue] = useState(''), [now, setNow] = useState(Date.now());
  const playing = useRef<{id: string; promptId: string; watchdog: ReturnType<typeof setTimeout>} | null>(null);
  const lesson = selectedSampleLesson(state), session = sampleSession(state), material = activeSampleMaterial(state), draft = activeSampleDraft(state);
  const receipt = sampleLessonReceipt(state, now), lastPlayback = draft?.playbacks.at(-1), busy = lastPlayback?.status === 'requested' || lastPlayback?.status === 'playing';
  const lessons = state.variant ? sampleLessonsFor(state.variant) : [], nextLesson = lessons[lessons.findIndex(item => item.id === state.lessonId) + 1];
  const waitingForClock = session.stage === 'timed' && !draft?.startedAt;
  const canSubmit = !!draft && !draft.submittedAt && !waitingForClock;
  const dispatch = (action: SampleAction) => {
    const result = transitionSample(latest.current, action, Date.now());
    setIssue(result.issue || '');
    if (result.state !== latest.current) {latest.current = result.state; if (!value) setInternal(result.state); onChange?.(result.state);}
    setNow(Date.now()); return result;
  };
  const stopAudio = (reason = '主动停止或切换步骤，未完整听完。') => {
    const active = playing.current;
    if (active) {clearTimeout(active.watchdog); dispatch({type: 'audio-fail', playbackId: active.id, promptId: active.promptId, reason}); playing.current = null;}
    window.speechSynthesis?.cancel();
  };
  const navigate = (action: SampleAction) => {stopAudio(); dispatch(action);};
  useEffect(() => {const interval = setInterval(() => setNow(Date.now()), 1000); return () => {clearInterval(interval); if (playing.current) clearTimeout(playing.current.watchdog); playing.current = null; window.speechSynthesis?.cancel();};}, []);
  function playAudio() {
    if (!material?.script || busy || draft?.submittedAt || waitingForClock) return;
    const promptId = material.id, id = `${promptId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    if (dispatch({type: 'audio-request', playbackId: id, promptId}).issue) return;
    const fail = (reason: string) => {
      if (playing.current?.id === id) {clearTimeout(playing.current.watchdog); playing.current = null;}
      dispatch({type: 'audio-fail', playbackId: id, promptId, reason});
    };
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {fail('这个浏览器没有可用的合成语音。'); return;}
    try {
      const utterance = new SpeechSynthesisUtterance(material.script);
      utterance.lang = 'en-GB'; utterance.rate = 0.9;
      const voice = window.speechSynthesis.getVoices().find(v => v.lang === 'en-GB') || window.speechSynthesis.getVoices().find(v => v.lang.startsWith('en'));
      if (voice) utterance.voice = voice;
      const watchdog = setTimeout(() => {fail('播放未正常开始或结束，请检查声音后重试。'); window.speechSynthesis.cancel();}, 60000);
      playing.current = {id, promptId, watchdog};
      utterance.onstart = () => {if (playing.current?.id === id) dispatch({type: 'audio-start', playbackId: id, promptId});};
      utterance.onend = () => {if (playing.current?.id === id) {clearTimeout(watchdog); playing.current = null; dispatch({type: 'audio-end', playbackId: id, promptId});}};
      utterance.onerror = event => {if (playing.current?.id === id) fail(`合成语音播放失败：${event.error}`);};
      window.speechSynthesis.speak(utterance);
    } catch {fail('无法播放合成语音，请检查设备。');}
  }
  const context = (m: SampleMaterial, showScript = false) => <>
    {m.context && <blockquote className="sample-context" lang="en">{m.context}</blockquote>}
    {m.script && showScript && <blockquote className="sample-context" lang="en">{m.script}</blockquote>}
  </>;
  const audio = material?.script && <div className="sample-audio">
    <p>设备合成英语 · 声音质量未人工核验。播放完成后，请确认自己实际听到了声音。</p>
    <div className="sample-row"><button type="button" disabled={busy || !!draft?.submittedAt || waitingForClock} onClick={playAudio}>{draft?.playbacks.length ? '再次播放（保留重播记录）' : '播放这段音频'}</button>{busy && <button type="button" onClick={() => stopAudio()}>停止播放</button>}</div>
    <p role="status">{busy ? '正在请求／播放…' : lastPlayback?.status === 'failed' ? `未记为听过：${lastPlayback.failure}` : lastPlayback?.audible ? '已确认实际听到声音。' : lastPlayback?.status === 'ended' ? '播放已结束，等待你的声音确认。' : '还没有播放记录。'} 共 {draft?.playbacks.length || 0} 次播放请求。</p>
    {lastPlayback?.status === 'ended' && !draft?.submittedAt && <div className="sample-row"><button type="button" disabled={lastPlayback.audible} onClick={() => dispatch({type: 'audio-confirm', playbackId: lastPlayback.id, promptId: material.id})}>我实际听到了声音</button><button type="button" onClick={() => dispatch({type: 'audio-fail', playbackId: lastPlayback.id, promptId: material.id, reason: '学习者报告没有声音。'})}>没有声音</button></div>}
  </div>;
  function answers(m: SampleMaterial, correction = false) {
    return m.questions?.map(q => <label className="sample-field" key={q.id}>{q.prompt}
      {q.options ? <select value={(correction ? session.correctionAnswers : draft?.answers)?.[q.id] || ''} onChange={event => dispatch({type: correction ? 'correction-answer' : 'answer', questionId: q.id, value: event.target.value})}><option value="">请选择</option>{q.options.map(option => <option key={option}>{option}</option>)}</select> : <input value={(correction ? session.correctionAnswers : draft?.answers)?.[q.id] || ''} autoComplete="off" autoCapitalize="off" maxLength={500} onChange={event => dispatch({type: correction ? 'correction-answer' : 'answer', questionId: q.id, value: event.target.value})}/>}
    </label>);
  }
  return <section className="ielts-sample-sequence" aria-label="四课雅思式学习样例">
    <style>{`.ielts-sample-sequence{max-width:900px;margin:auto;color:#203b4b;line-height:1.6;padding:20px;font-family:system-ui,sans-serif}.ielts-sample-sequence button,.ielts-sample-sequence input,.ielts-sample-sequence textarea,.ielts-sample-sequence select{font:inherit}.ielts-sample-sequence button{min-height:44px;border:1px solid #bdd4cc;background:#edf5f1;border-radius:9px;padding:9px 14px;cursor:pointer}.ielts-sample-sequence button:disabled{opacity:.5;cursor:default}.ielts-sample-sequence button:focus-visible{outline:3px solid #286954}.sample-row{display:flex;gap:10px;flex-wrap:wrap}.sample-lessons{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:18px 0}.sample-lessons [aria-current=page]{border:2px solid #286954}.sample-stage{padding:20px;border:1px solid #d9e2e5;border-radius:14px;margin:16px 0;background:white}.sample-steps{display:flex;gap:8px;flex-wrap:wrap;list-style:none;padding:0;font-size:13px}.sample-steps [aria-current=step]{font-weight:700;color:#286954}.sample-field{display:block;margin:14px 0}.sample-field input,.sample-field select,.sample-field textarea{font-size:16px;display:block;width:100%;box-sizing:border-box;padding:10px;border:1px solid #adbfc3;border-radius:8px;margin-top:6px;background:white}.sample-context{white-space:pre-wrap;margin:16px 0;padding:14px;border-left:4px solid #86aa9f;background:#f3f7f5}.ielts-sample-sequence summary{min-height:44px;display:flex;align-items:center;cursor:pointer;gap:8px}.ielts-sample-sequence summary::before{content:"＋"}.ielts-sample-sequence details[open]>summary::before{content:"−"}.sample-note{font-size:14px;color:#586e79}.sample-feedback{padding:14px;background:#f3f7f5;border-radius:10px;margin:12px 0}.sample-error{color:#852f24;background:#fff0ed;padding:12px;border-radius:9px}@media(max-width:600px){.sample-lessons{grid-template-columns:1fr 1fr}.ielts-sample-sequence{padding:12px}.sample-stage{padding:14px}}`}</style>
    <h2>{sampleSequence.title}</h2><p>{sampleSequence.notice}</p>
    {!guidedFlow || !state.variant ? <><div className="sample-row" aria-label="先选择考试类别">{(['academic', 'general-training'] as Variant[]).map(variant => <button type="button" key={variant} aria-pressed={state.variant === variant} onClick={() => navigate({type: 'select-variant', variant})}>{variant === 'academic' ? 'Academic' : 'General Training'}</button>)}</div>
    <p className="sample-note">听、说共用方法。阅读示例为共同的信息判断训练；写作分别练数据比较或信件请求。类别切换会保留各自学习记录。</p></> : <details><summary>调整考试类别</summary><div className="sample-row" aria-label="先选择考试类别">{(['academic', 'general-training'] as Variant[]).map(variant => <button type="button" key={variant} aria-pressed={state.variant === variant} onClick={() => navigate({type: 'select-variant', variant})}>{variant === 'academic' ? 'Academic' : 'General Training'}</button>)}</div>
    <p className="sample-note">听、说共用方法。阅读示例为共同的信息判断训练；写作分别练数据比较或信件请求。类别切换会保留各自学习记录。</p></details>}
    {!state.variant ? <p role="status">先选择类别，再从第一课开始。</p> : <>
      {guidedFlow ? <details><summary>查看四课目录</summary><nav className="sample-lessons" aria-label="四课学习次序">{sampleLessonsFor(state.variant).map(item => <button key={item.id} aria-current={state.lessonId === item.id ? 'page' : undefined} onClick={() => navigate({type: 'open-lesson', lessonId: item.id})}>{item.title}</button>)}</nav></details> : <nav className="sample-lessons" aria-label="四课学习次序">{sampleLessonsFor(state.variant).map(item => <button key={item.id} aria-current={state.lessonId === item.id ? 'page' : undefined} onClick={() => navigate({type: 'open-lesson', lessonId: item.id})}>{item.title}</button>)}</nav>}
      {guidedFlow ? <><p className="sample-note">第 {stages.indexOf(session.stage) + 1} / {stages.length} 步 · {stageNames[session.stage]}</p><details><summary>查看本课过程</summary><ol className="sample-steps" aria-label="本课教学步骤">{stages.map((stage, index) => <li key={stage} aria-current={session.stage === stage ? 'step' : undefined}>{index + 1}. {stageNames[stage]}</li>)}</ol></details></> : <ol className="sample-steps" aria-label="本课教学步骤">{stages.map((stage, index) => <li key={stage} aria-current={session.stage === stage ? 'step' : undefined}>{index + 1}. {stageNames[stage]}</li>)}</ol>}
      {lesson && <article className="sample-stage"><h3>{lesson.title}</h3><p>{lesson.goal}</p><p className="sample-note">{lesson.boundary}</p>
        {session.stage === 'explain' && <><h4>先理解这一件事</h4>{lesson.explanation.map(text => <p key={text}>{text}</p>)}<button onClick={() => navigate({type: 'next'})}>看一个完整小示范</button></>}
        {session.stage === 'model' && material && <><h4>{material.title}</h4><p>{material.instruction}</p>
          {material.questions && <ol aria-label="示范题目">{material.questions.map(q => <li key={q.id} id={`${material.id}-${q.id}`}>{q.prompt}</li>)}</ol>}
          {context(material, true)}{audio}
          {material.questions ? <><h5>答案与依据</h5><ol aria-label="示范答案与依据">{material.questions.map(q => <li key={q.id} aria-describedby={`${material.id}-${q.id}`}><strong lang="en">{q.accepted[0]}</strong>：{q.why}</li>)}</ol></> : <><blockquote className="sample-context" lang="en">{material.model}</blockquote>{material.modelNotes?.map(note => <p key={note}>{note}</p>)}</>}
          <button onClick={() => navigate({type: 'next'})}>带着方法试一次</button></>}
        {['guided', 'independent', 'timed', 'review'].includes(session.stage) && material && <>
          <h4>{material.title}</h4>
          {waitingForClock ? <><p>开始后再显示这份新材料。建议 {material.seconds} 秒，是本站小任务训练时长。</p><button onClick={() => dispatch({type: 'start-timed'})}>开始训练计时</button></> : <>
            {session.stage === 'timed' && <p role="timer">{Math.max(0, Math.ceil((material.seconds * 1000 - (now - (draft?.startedAt || now))) / 1000))} 秒剩余 · 超时仍保留作品，并标明超时。</p>}
            <p>{material.instruction}</p>{context(material)}{audio}
            {session.stage === 'guided' ? <p className="sample-feedback">{material.hint}</p> : <><button type="button" onClick={() => dispatch({type: 'hint'})}>需要一个提示（本次记为借助提示）</button>{draft?.hinted && <div className="sample-feedback"><p>{material.hint}</p>{material.script && context(material, true)}</div>}<label className="sample-field"><input type="checkbox" style={{display: 'inline', width: 'auto', marginRight: 8}} checked={draft?.unseenConfirmed || false} onChange={event => dispatch({type: 'confirm-unseen', value: event.target.checked})}/>我此前没有接触过这份小材料</label></>}
            {material.questions ? answers(material) : <><label className="sample-field">留下你实际表达的文本／短段落<textarea rows={5} maxLength={4000} value={draft?.response || ''} onChange={event => dispatch({type: 'response', value: event.target.value})}/></label><p className="sample-note">{sampleWordCount(draft?.response || '')} 个词或数字（常见缩写算 1 项），计数仅作参考。原稿待人工核对，不评定质量或 Band。{lesson.skill === 'speaking' && '若文本与录音不同，以真实录音交给评阅者核验。'}</p></>}
            <button disabled={!canSubmit} onClick={() => {stopAudio(); dispatch({type: 'submit'});}}>记录原始作答</button>
            {!!draft?.submittedAt && <div className="sample-feedback" role="status"><p>这次作答已记录。{material.questions ? '原始答案保留，用于与反馈比较。' : '文本作品尚未人工评阅。'}</p>
              {session.stage === 'guided' && material.questions?.map(q => <p key={q.id}>{q.prompt} → {q.accepted[0]}。{q.why}</p>)}
              {session.stage === 'review' && <><p>{delayedNames[receipt.delayed]}</p>{material.questions?.map(q => <p key={q.id}>{q.prompt} → {q.accepted[0]}。{q.why}</p>)}</>}
            </div>}
            {session.stage !== 'review' && <button disabled={!draft?.submittedAt} style={{marginTop: 12}} onClick={() => navigate({type: 'next'})}>{session.stage === 'guided' ? '撤掉提示，换新题' : session.stage === 'independent' ? '再换一份新材料，练计时' : '查看反馈，订正一处'}</button>}
          </>}
        </>}
        {session.stage === 'feedback' && <><h4>对照原始作答，修一个问题</h4>{session.attempts.filter(a => a.stage === 'independent' || a.stage === 'timed').map((attempt, index) => {
          const source = attempt.stage === 'independent' ? lesson.independent : lesson.timed;
          return <section className="sample-feedback" key={`${attempt.at}-${index}`}><h5>{source.title}</h5><p>记录时间：{new Date(attempt.at).toLocaleString()} · {attempt.hinted ? '用过提示' : '未用提示'} · {attempt.fresh ? '本地首次材料，学习者确认未见过' : '没有新材料证据'}{lesson.skill === 'listening' && ` · ${attempt.playbackCount} 次播放请求`}{attempt.withinTrainingTime !== null && ` · ${attempt.withinTrainingTime ? '建议时间内提交' : '超出建议时间'}`}</p>
            {source.questions ? source.questions.map(q => <p key={q.id}>原答：{attempt.answers[q.id] || '空白'}；参考：{q.accepted[0]}。{q.why}</p>) : <><blockquote lang="en">{attempt.response}</blockquote><p>只有文本和自查；四维评分及人工核验尚未完成。{lesson.skill === 'speaking' && '真实声音、发音及互动评价仍待音频核验。'}</p></>}
            {source.script && context(source, true)}
          </section>;
        })}<ul>{lesson.timed.checklist.map(check => <li key={check}>{check}</li>)}</ul>
          {lesson.timed.questions ? answers(lesson.timed, true) : <><p className="sample-note">{lesson.timed.instruction}</p><label className="sample-field">修改后的短段落<textarea rows={5} maxLength={4000} value={session.correctionResponse} onChange={event => dispatch({type: 'correction-response', value: event.target.value})}/></label><p className="sample-note">{sampleWordCount(session.correctionResponse)} 个词或数字（常见缩写算 1 项），计数仅作参考。订正原稿待人工核对，不评定质量或 Band。</p></>}
          <label className="sample-field">具体修了什么，或仍需要谁核验？<textarea rows={2} maxLength={4000} value={session.correctionNote} onChange={event => dispatch({type: 'correction-note', value: event.target.value})} placeholder="例如：把到达时间误写为开始时间；下次继续听 starts 后的信息。"/></label><button onClick={() => dispatch({type: 'save-correction'})}>保留订正，安排隔天新题</button>
        </>}
        {guidedFlow && nextLesson && session.stage === 'review' && (!material || !!draft?.submittedAt) && (now < receipt.reviewDueAt || !receipt.freshReviewAvailable) && <p><button onClick={() => navigate({type: 'open-lesson', lessonId: nextLesson.id})}>继续下一课 · {nextLesson.title}</button></p>}
        {session.stage === 'review' && !material && <><h4>留下间隔，再换新材料</h4><p>{delayedNames[receipt.delayed]}。最早复验时间：{receipt.reviewDueAt ? new Date(receipt.reviewDueAt).toLocaleString() : '完成订正后确定'}。</p>{(!guidedFlow || !!receipt.reviewDueAt && now >= receipt.reviewDueAt && receipt.freshReviewAvailable) && <button disabled={!receipt.reviewDueAt || now < receipt.reviewDueAt || !receipt.freshReviewAvailable} onClick={() => navigate({type: 'start-review'})}>打开一份没接触过的复验题</button>}</>}
        {session.stage === 'review' && !!draft?.submittedAt && (!guidedFlow || now >= receipt.reviewDueAt && receipt.freshReviewAvailable) && <p><button disabled={now < receipt.reviewDueAt || !receipt.freshReviewAvailable} onClick={() => navigate({type: 'start-review'})}>至少再隔 24 小时，换下一份材料</button></p>}
        {session.stage === 'review' && !receipt.freshReviewAvailable && <p className="sample-note">本课两份复验新题已接触过；继续复验需提供不同材料。原题重复可以学习，但不能增加新题保持证据。</p>}
        {lesson.skill === 'speaking' && !['explain', 'model'].includes(session.stage) && <section key={`${state.variant}-${lesson.id}`}><Recorder hideReference stopSignal={stages.indexOf(session.stage)} retentionLabel="录音在本课步骤间保留；切换课程、类别或刷新后清除"/><p className="sample-note">可在本课各步骤回听最近两遍。本样例不传入评分参考、不调用评分服务；发音、流利度及互动仍待音频与人工评价。录音不写入本组件的文本状态。</p></section>}
      </article>}
      <details aria-label="作答与订正记录"><summary>回看自己的作答与订正 · {receipt.practiceCount} 次作答</summary>
        <p className="sample-note">{delayedNames[receipt.delayed]}。这里只回看已保存的内容，复验时间保持不变；开放作品仍待人工核对，不换算雅思分数。</p>
        {!session.attempts.length && <p>还没有已保存的作答。</p>}
        {session.attempts.map((attempt, index) => {
          const source = lesson && sampleMaterials(lesson).find(item => item.id === attempt.promptId);
          return <section className="sample-feedback" key={`${attempt.promptId}-${attempt.at}-${index}`} aria-label={`第 ${index + 1} 次作答记录`}>
            <h4>{index + 1}. {stageNames[attempt.stage]} · {source?.title || '历史题目'}</h4>
            <p className="sample-note">作答时间：{recordTime(attempt.at)} · {attempt.hinted ? '曾用提示' : '未用提示'} · {attempt.fresh ? '当时确认为未见过的材料' : '没有新材料证据'}{lesson?.skill === 'listening' && ` · ${attempt.playbackCount} 次播放请求，${attempt.playbackFailures} 次失败`}{attempt.elapsedMs !== null && ` · 训练用时 ${Math.ceil(attempt.elapsedMs / 1000)} 秒`}</p>
            {source?.questions ? <ol aria-label="原题与自己的作答">{source.questions.map(q => <li key={q.id}><p>{q.prompt}</p><p>我的原答：<span lang="en">{attempt.answers[q.id] || '未填写'}</span></p></li>)}</ol> : <>{source && <p>原题要求：{source.instruction}</p>}<p>我的原稿：</p><blockquote className="sample-context" lang="en">{attempt.response || '未填写'}</blockquote></>}
          </section>;
        })}
        {lesson && (session.correctedAt || Object.keys(session.correctionAnswers).length || session.correctionResponse || session.correctionNote) ? <section className="sample-feedback" aria-label="自己的订正">
          <h4>我的订正 · {lesson.timed.title}</h4><p className="sample-note">{session.correctedAt ? <>保存时间：{recordTime(session.correctedAt)}</> : '订正草稿 · 尚未保存'}</p>
          {lesson.timed.questions ? <ol aria-label="原题与自己的订正">{lesson.timed.questions.map(q => <li key={q.id}><p>{q.prompt}</p><p>我的订正：<span lang="en">{session.correctionAnswers[q.id] || '未填写'}</span></p></li>)}</ol> : <><p>原题要求：{lesson.timed.instruction}</p><blockquote className="sample-context" lang="en">{session.correctionResponse || '尚未留下订正文稿'}</blockquote></>}
          {session.correctionNote && <p>我的修正说明：{session.correctionNote}</p>}
        </section> : null}
      </details>
    </>}
    {issue && <p className="sample-error" role="alert">{issue}</p>}
    <details><summary>保存方式与练习说明</summary><p className="sample-note">这是本站原创的小练习，教学效果尚未经过专家与学习者实测。{persistenceNote || '这个独立预览仅临时保留文字记录，关闭或刷新后可能丢失。'}</p></details>
  </section>;
}
export default IELTSSampleSequence;
