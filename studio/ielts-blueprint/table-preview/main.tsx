import {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import type {SampleMaterial} from '../sample-sequence';
import {sampleMaterials} from '../sample-sequence';
import {
  activeSampleDraft, activeSampleMaterial, sampleLessonReceipt, sampleSession, transitionSample,
  type SampleAction, type SampleState,
} from '../sample-sequence-model';
import {learningStages, type LearningStage} from '../types';
import {
  readSampleProgress, serializeSampleProgress, type SampleProgressRead,
} from '../../app/ielts-sample-progress';
import {academicTableCompletionLesson} from '../curriculum/table-completion/reading-academic';
import {academicTableStimuli} from '../curriculum/table-completion/stimuli';
import {TableStimulusView} from '../structured-table/table-stimulus';
import {adaptTableAnswerAction, projectTableStimulus, TABLE_ANSWER_MAX_LENGTH} from '../structured-table/projection';
import type {TableStimulus} from '../structured-table/types';

export const TABLE_PREVIEW_STORAGE_KEY = 'ielts-table-preview:v1';
export const TABLE_PREVIEW_LESSON_ID = 'reading-table-completion';
type Snapshot = {read: SampleProgressRead; storageError: string};
type PendingAnswers = Record<string, string>;
type TableRole = 'model' | 'draft' | 'original' | 'correction' | 'history-original' | 'history-correction';
type Inspection = {
  storageKey: string; raw: string | undefined; status: SampleProgressRead['status'] | 'unavailable';
  value?: SampleState; stage?: LearningStage; materialId?: string; questionIds: string[]; reason?: string;
};
declare global {interface Window {__ieltsTablePreviewInspect?: () => Inspection;}}

const stageNames: Record<LearningStage, string> = {
  explain: '解释', model: '示范', guided: '引导', independent: '独立', timed: '限时', feedback: '反馈', review: '复验',
};
const delayedNames = {
  'not-scheduled': '完成订正后安排新题复验',
  'not-due': '尚未到复验时间',
  'awaiting-new-task': '已到时间，等待打开新材料',
  'needs-repair': '这次新题仍有需要订正的地方',
  assisted: '这次作答有提示、重复或其他辅助条件',
  'awaiting-human-review': '仍待人工核验',
  'local-target-observed': '这次新题符合本组局部目标，长期保持尚未验证',
};
const recordTime = (at: number) => new Date(at).toLocaleString();
const pendingKey = (materialId: string, type: string, questionId = '') => `${materialId}:${type}:${questionId}`;

export function readTablePreviewSnapshot(now = Date.now()): Snapshot {
  try {
    const raw = window.localStorage.getItem(TABLE_PREVIEW_STORAGE_KEY) ?? undefined;
    return {read: readSampleProgress(raw, now), storageError: ''};
  } catch {
    return {read: readSampleProgress(undefined, now), storageError: '无法读取本机预览记录。当前只读，没有清空或创建记录；请检查浏览器存储设置后重新读取。'};
  }
}

function inspectTablePreview(): Inspection {
  const snapshot = readTablePreviewSnapshot();
  if (snapshot.storageError) return {storageKey: TABLE_PREVIEW_STORAGE_KEY, raw: undefined, status: 'unavailable', questionIds: [], reason: snapshot.storageError};
  const read = snapshot.read;
  if (read.status === 'blocked') return {storageKey: TABLE_PREVIEW_STORAGE_KEY, raw: read.raw, status: read.status, questionIds: [], reason: read.reason};
  const isTable = read.value.variant === 'academic' && read.value.lessonId === TABLE_PREVIEW_LESSON_ID;
  const session = sampleSession(read.value);
  const material = isTable ? activeSampleMaterial(read.value) || (session.stage === 'feedback' ? academicTableCompletionLesson.timed : undefined) : undefined;
  return {
    storageKey: TABLE_PREVIEW_STORAGE_KEY, raw: read.raw, status: read.status, value: read.value,
    stage: isTable ? session.stage : undefined, materialId: material?.id,
    questionIds: material?.questions?.map(question => question.id) || [],
  };
}

function ReferenceAnswers({material, model = false}: {material: SampleMaterial; model?: boolean}) {
  return <section className="reference-answers" aria-label={model ? '示范模型答案与依据' : '提交后开放的答案与依据'}>
    <h3>答案与依据</h3>
    <ol>{material.questions?.map(question => <li key={question.id}>
      <p>{question.prompt}</p><p><strong lang="en">{question.accepted.join(' / ')}</strong> · {question.why}</p>
    </li>)}</ol>
  </section>;
}

export function TablePreviewApp() {
  const [snapshot, setSnapshot] = useState<Snapshot>(() => readTablePreviewSnapshot());
  const [issue, setIssue] = useState('');
  const [readNotice, setReadNotice] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [pendingAnswers, setPendingAnswers] = useState<PendingAnswers>({});
  const pendingRef = useRef<PendingAnswers>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const focusContext = useRef('');
  const read = snapshot.read;
  const value = read.status === 'blocked' ? undefined : read.value;
  const writable = read.status !== 'blocked' && !snapshot.storageError;
  const inTable = value?.variant === 'academic' && value.lessonId === TABLE_PREVIEW_LESSON_ID;
  const session = value ? sampleSession(value) : undefined;
  const material = value && inTable ? activeSampleMaterial(value) : undefined;
  const draft = value && inTable ? activeSampleDraft(value) : undefined;
  const receipt = value && inTable ? sampleLessonReceipt(value, now) : undefined;
  const stage = inTable ? session?.stage : undefined;
  const currentContext = `${value?.variant || ''}:${value?.lessonId || ''}:${stage || ''}:${material?.id || ''}`;
  const hasPending = Object.keys(pendingAnswers).length > 0;
  const waitingForClock = stage === 'timed' && !draft?.startedAt;

  function updatePending(next: PendingAnswers) {pendingRef.current = next; setPendingAnswers(next);}
  function keepPending(key: string, raw: string) {updatePending({...pendingRef.current, [key]: raw});}
  function removePending(key: string) {const next = {...pendingRef.current}; delete next[key]; updatePending(next);}
  function reload() {
    const fresh = readTablePreviewSnapshot();
    setSnapshot(fresh); setIssue('');
    setReadNotice(fresh.storageError || fresh.read.status === 'blocked' ? '' : fresh.read.status === 'empty'
      ? '此预览暂无已保存记录，尚未替你选择考试类别。'
      : '已重新读取有效的预览记录；此前原文没有被自动清空，当前学习位置以已保存内容为准。');
  }

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    const onStorage = (event: StorageEvent) => {if (event.key === TABLE_PREVIEW_STORAGE_KEY || event.key === null) reload();};
    window.addEventListener('storage', onStorage);
    window.__ieltsTablePreviewInspect = inspectTablePreview;
    return () => {window.clearInterval(timer); window.removeEventListener('storage', onStorage); delete window.__ieltsTablePreviewInspect;};
  }, []);
  useEffect(() => {
    if (focusContext.current !== currentContext) {
      if (Object.keys(pendingRef.current).length) {
        updatePending({});
        setIssue('练习位置已变化，上一位置的临时输入没有写入记录；已保存的原答仍保留。');
      }
      focusContext.current = currentContext;
      heading.current?.focus();
    }
  }, [currentContext]);
  useEffect(() => {if (read.status === 'blocked') updatePending({});}, [read.status]);

  function commit(action: SampleAction): boolean {
    if (Object.keys(pendingRef.current).length && !['answer', 'correction-answer', 'correction-note'].includes(action.type)) {
      setIssue('还有本页未保存的输入。请缩短或重试保存后再继续，原答没有被覆盖。');
      return false;
    }
    const at = Date.now();
    const fresh = readTablePreviewSnapshot(at);
    if (fresh.storageError || fresh.read.status === 'blocked') {
      setSnapshot(fresh);
      setIssue('当前记录只读，本次操作没有保存。原始记录保持不变。');
      return false;
    }
    if (action.type !== 'select-variant' && action.type !== 'open-lesson') {
      const latestMaterial = activeSampleMaterial(fresh.read.value);
      const latestContext = `${fresh.read.value.variant || ''}:${fresh.read.value.lessonId}:${sampleSession(fresh.read.value).stage}:${latestMaterial?.id || ''}`;
      if (latestContext !== currentContext) {
        setSnapshot(fresh);
        setIssue('练习位置刚发生变化，本次没有保存。请核对当前材料后再操作。');
        return false;
      }
    }
    const next = transitionSample(fresh.read.value, action, at);
    if (next.issue) {setSnapshot(fresh); setIssue(next.issue); return false;}
    try {
      const raw = serializeSampleProgress(next.state, at);
      const checked = readSampleProgress(raw, at);
      if (checked.status !== 'ready') throw new Error('这次修改未通过进度检查，未保存。');
      if ((window.localStorage.getItem(TABLE_PREVIEW_STORAGE_KEY) ?? undefined) !== fresh.read.raw) {
        setSnapshot(readTablePreviewSnapshot());
        setIssue('记录在操作期间被更新，本次没有覆盖它。请重新核对当前内容。');
        return false;
      }
      window.localStorage.setItem(TABLE_PREVIEW_STORAGE_KEY, raw);
      const confirmed = readTablePreviewSnapshot();
      if (confirmed.storageError || confirmed.read.status !== 'ready' || confirmed.read.raw !== raw) {
        setSnapshot(confirmed);
        setIssue('保存结果未能确认，请重新读取。不会将这次操作显示为保存成功。');
        return false;
      }
      setSnapshot(confirmed); setIssue(''); setReadNotice(''); setNow(Date.now());
      return true;
    } catch (error) {
      setSnapshot({...fresh, storageError: '这次修改保存失败，之前的记录仍保留。临时输入没有记为已保存；请检查存储后重新读取。'});
      setIssue(error instanceof Error ? `未保存：${error.message}` : '这次修改未保存。');
      return false;
    }
  }

  function answer(source: SampleMaterial, type: 'answer' | 'correction-answer', questionId: string, raw: string) {
    const stimulus = academicTableStimuli.find(item => item.id === source.id);
    const key = pendingKey(source.id, type, questionId);
    if (!stimulus || !writable) {keepPending(key, raw); setIssue('当前表格只读，这次输入没有保存。'); return;}
    const adapted = adaptTableAnswerAction(stimulus, {type, questionId, value: raw});
    if (!adapted.ok) {
      keepPending(key, raw);
      setIssue(raw.length > TABLE_ANSWER_MAX_LENGTH
        ? `此格输入超过 ${TABLE_ANSWER_MAX_LENGTH} 字符，完整内容暂留本页但未保存。请缩短后重试；已保存原答未被覆盖。`
        : '这次输入未通过当前表格检查，完整内容暂留本页但未保存。请核对题号与输入后重试。');
      return;
    }
    if (commit(adapted.action)) removePending(key); else keepPending(key, raw);
  }

  function correctionNote(raw: string) {
    const key = pendingKey(academicTableCompletionLesson.timed.id, 'correction-note');
    if (raw.length > 4000) {keepPending(key, raw); setIssue('修正说明超过4000字符，完整内容暂留本页但未保存。请缩短后重试。'); return;}
    if (commit({type: 'correction-note', value: raw})) removePending(key); else keepPending(key, raw);
  }

  function answersWithPending(source: SampleMaterial, answers: Record<string, string>, type: 'answer' | 'correction-answer') {
    const merged = {...answers};
    for (const question of source.questions || []) {
      const key = pendingKey(source.id, type, question.id);
      if (Object.hasOwn(pendingAnswers, key)) merged[question.id] = pendingAnswers[key];
    }
    return merged;
  }

  function table(source: SampleMaterial, answers: Record<string, string>, role: TableRole, suffix = '', editable = false) {
    const stimulus: TableStimulus | undefined = academicTableStimuli.find(item => item.id === source.id);
    if (!stimulus || !projectTableStimulus(stimulus).ok) return <p role="alert">这份材料的表格暂不可用；现有记录保持不变。</p>;
    const actionType = role === 'correction' ? 'correction-answer' : 'answer';
    const shownAnswers = editable ? answersWithPending(source, answers, actionType) : answers;
    return <div className="table-surface" data-material-id={source.id} data-table-role={role}>
      <TableStimulusView
        stimulus={stimulus}
        answers={shownAnswers}
        readOnly={!editable || !writable}
        onAnswer={editable && writable ? (questionId, raw) => answer(source, actionType, questionId, raw) : undefined}
        idPrefix={`table-preview-${role}-${source.id}${suffix}`}
      />
    </div>;
  }

  function passage(source: SampleMaterial) {
    return <section className="passage" aria-label="完整英文文章" data-material-id={source.id}>
      <h3>阅读材料</h3><div lang="en" className="article-text">{source.context}</div>
    </section>;
  }

  const firstSavedAttempt = material ? session?.attempts.find(attempt => attempt.materialId === material.id) : undefined;
  const timedAttempt = session?.attempts.some(attempt => attempt.stage === 'timed' && attempt.promptId === academicTableCompletionLesson.timed.id);
  const canSubmit = writable && !hasPending && !!material && !waitingForClock && !draft?.submittedAt
    && !!material.questions?.every(question => draft?.answers[question.id]?.trim());
  const nextLabel = stage === 'guided' ? '撤掉提示，换新题' : stage === 'independent' ? '再换一份新材料，练计时' : '查看反馈，订正一处';

  return <main className="table-preview" data-preview-key={TABLE_PREVIEW_STORAGE_KEY} data-read-status={snapshot.storageError ? 'unavailable' : read.status}>
    <style>{`
      *{box-sizing:border-box}html,body,#root{margin:0;min-width:0}body{background:#f4f7f6;color:#183b37;font-family:system-ui,sans-serif;line-height:1.6}
      .table-preview{max-width:1120px;margin:auto;padding:clamp(12px,3vw,28px);min-width:0;overflow-wrap:anywhere}
      .table-preview h1{font-size:clamp(24px,4vw,34px);line-height:1.25}.table-preview h2{font-size:24px}.table-preview h3{font-size:18px}
      .table-preview button,.table-preview input,.table-preview textarea{font:inherit}.table-preview button{min-height:44px;max-width:100%;padding:10px 15px;border:1px solid #9ab6ac;border-radius:9px;background:#eff7f3;color:#183b37;cursor:pointer;white-space:normal;text-align:left}
      .table-preview button:disabled{opacity:.55;cursor:default}.table-preview :focus-visible{outline:3px solid #307263;outline-offset:3px}
      .preview-banner,.preview-panel,.preview-history{padding:clamp(12px,2.5vw,22px);border:1px solid #ccddd7;border-radius:14px;background:white;margin:16px 0;min-width:0}
      .preview-banner{background:#eaf3ee}.preview-note{font-size:14px;color:#476b63}.preview-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.preview-steps{display:flex;gap:8px 18px;flex-wrap:wrap;padding-left:22px;font-size:14px}.preview-steps [aria-current=step]{font-weight:700}
      .passage,.reference-answers,.preview-record{margin:18px 0;min-width:0}.article-text{white-space:pre-wrap;overflow-wrap:anywhere;padding:16px;background:#f4f7f6;border-left:4px solid #93b6a6}
      .table-surface{max-width:100%;min-width:0;overflow-x:auto;margin:18px 0}.table-preview textarea{display:block;width:100%;min-width:0;border:1px solid #9ab6ac;border-radius:8px;padding:10px;background:white}.preview-checkbox{display:flex;gap:10px;align-items:flex-start;margin:16px 0}.preview-checkbox input{flex:0 0 auto;margin-top:7px}
      .preview-alert{padding:12px;background:#fff0e9;border:1px solid #d4a391;border-radius:9px;color:#763d2f}.preview-raw{white-space:pre-wrap;overflow-wrap:anywhere;max-width:100%;font-size:12px}.preview-timer{font-variant-numeric:tabular-nums}.reference-answers li{margin:12px 0}
      @media(max-width:420px){.table-preview h2{font-size:21px}.preview-row>button{width:100%}.preview-steps{gap:5px 12px}.article-text{padding:12px}}
    `}</style>
    <header><p className="preview-note">Academic · 真实表格单链原型</p><h1>读文章，填写表格，再保留订正</h1></header>
    <aside className="preview-banner" aria-label="独立预览边界">
      <p><strong>独立预览，尚未接入正式学习页面。</strong>这里只提供一条 Academic 表格学习链，文字记录仅保存在本机此预览中。</p>
      <p className="preview-note">按文章证据核对本组答案；没有语音播放，也不评定 IELTS 分数。多页面同时写入的安全性尚未完整验证，此预览不提供正式同步保证。</p>
    </aside>
    {read.status === 'blocked' ? <section className="preview-panel" role="alert" data-blocked="true">
      <h2>这段记录目前只读</h2><p>{read.reason}</p><p>未知、较新版本或无效记录保留原文，没有自动清空，也不会覆盖为新记录。请在支持该记录的版本打开；此页可以重新读取。</p>
      <details><summary>查看保留的原始记录</summary><pre className="preview-raw">{read.raw}</pre></details>
    </section> : <>
      {snapshot.storageError && <section className="preview-panel preview-alert" role="alert"><h2>保存尚未成功</h2><p>{snapshot.storageError}</p></section>}
      <section className="preview-panel" aria-label="明确选择考试类别">
        <h2>先选择考试类别</h2><div className="preview-row">
          <button aria-pressed={value?.variant === 'academic'} disabled={!writable || hasPending} onClick={() => commit({type: 'select-variant', variant: 'academic'})}>Academic</button>
          <button disabled>General Training（本预览未提供）</button>
        </div>
        {!value?.variant && <p role="status">尚未选择类别；选择 Academic 后才能打开这条练习链。</p>}
        {value?.variant === 'general-training' && <p role="status">已保存的是 General Training 位置。本预览没有该类别的表格材料；原记录保留，请明确选择 Academic。</p>}
        {value?.variant === 'academic' && !inTable && <p><button disabled={!writable || hasPending} onClick={() => commit({type: 'open-lesson', lessonId: TABLE_PREVIEW_LESSON_ID})}>打开表格练习</button></p>}
      </section>
      {inTable && session && value && receipt && <>
        <ol className="preview-steps" aria-label="七阶段学习链">{learningStages.map(item => <li key={item} aria-current={stage === item ? 'step' : undefined}>{stageNames[item]}</li>)}</ol>
        <article className="preview-panel" data-stage={stage} data-material-id={material?.id || (stage === 'feedback' ? academicTableCompletionLesson.timed.id : undefined)}>
          <h2 ref={heading} tabIndex={-1}>{stageNames[session.stage]} · {academicTableCompletionLesson.title}</h2>
          <p>{academicTableCompletionLesson.goal}</p>
          <p className="preview-note">{academicTableCompletionLesson.boundary}</p>
          {stage === 'explain' && <>
            {academicTableCompletionLesson.explanation.map(text => <p key={text}>{text}</p>)}
            <button disabled={!writable || hasPending} onClick={() => commit({type: 'next'})}>看一个完整小示范</button>
          </>}
          {stage === 'model' && material && <>
            <h3>{material.title}</h3><p>{material.instruction}</p>
            <p className="preview-note">这是示范模型及依据，不是你的首答；示范不会生成学员作答记录。</p>
            {passage(material)}
            {table(material, Object.fromEntries((material.questions || []).map(question => [question.id, question.accepted[0]])), 'model')}
            {material.model && <p lang="en">{material.model}</p>}
            {material.modelNotes && <section aria-label="示范教练步骤"><h3>教练步骤</h3><ol>{material.modelNotes.map(note => <li key={note}>{note}</li>)}</ol></section>}
            <ReferenceAnswers material={material} model/>
            <button disabled={!writable || hasPending} onClick={() => commit({type: 'next'})}>带着方法试一次</button>
          </>}
          {['guided', 'independent', 'timed', 'review'].includes(stage || '') && material && <>
            <h3>{material.title}</h3>
            {waitingForClock ? <>
              <p>主动开始计时后才显示这份新文章和表格。{material.seconds}秒是本地练习预算。</p>
              <button disabled={!writable || hasPending} onClick={() => commit({type: 'start-timed'})}>开始训练计时</button>
            </> : <>
              {stage === 'timed' && <p className="preview-timer" role="timer">{Math.max(0, Math.ceil((material.seconds * 1000 - (now - (draft?.startedAt || now))) / 1000))}秒剩余 · 超时仍保留首答，并如实标明用时。</p>}
              <p>{material.instruction}</p>{passage(material)}
              {stage === 'guided' ? <p className="preview-note">引导提示：{material.hint}</p> : <>
                <button disabled={!writable || hasPending || !!draft?.submittedAt} onClick={() => commit({type: 'hint'})}>需要一个提示（本次记为借助提示）</button>
                {draft?.hinted && <p className="preview-note">{material.hint}</p>}
                <label className="preview-checkbox"><input type="checkbox" checked={draft?.unseenConfirmed || false} disabled={!writable || hasPending || !!draft?.submittedAt} onChange={event => commit({type: 'confirm-unseen', value: event.target.checked})}/>我此前没有接触过这份材料</label>
              </>}
              <h3>{draft?.submittedAt ? '已记录的原始作答' : '当前作答草稿'}</h3>
              {draft?.submittedAt
                ? firstSavedAttempt ? table(material, firstSavedAttempt.answers, 'original')
                  : <p role="alert">未找到本材料已保存的首答，此处保持只读；请重新读取记录。</p>
                : table(material, draft?.answers || {}, 'draft', '', true)}
              <button disabled={!canSubmit} onClick={() => commit({type: 'submit'})}>记录原始作答</button>
              {!!draft?.submittedAt && <section className="preview-record" role="status">
                <p>这次首答已记录，只读原答保持不变；反馈中的订正会单独保存。</p>
                {stage === 'guided' && <ReferenceAnswers material={material}/>}
                {stage === 'review' && <><p>{delayedNames[receipt.delayed]}</p><ReferenceAnswers material={material}/></>}
              </section>}
              {stage !== 'review' && <p><button disabled={!writable || hasPending || !draft?.submittedAt} onClick={() => commit({type: 'next'})}>{nextLabel}</button></p>}
              {stage === 'review' && !!draft?.submittedAt && <p><button disabled={!writable || hasPending || now < receipt.reviewDueAt || !receipt.freshReviewAvailable} onClick={() => commit({type: 'start-review'})}>至少再隔24小时，换下一份材料</button></p>}
            </>}
          </>}
          {stage === 'feedback' && timedAttempt && <>
            <h3>对照原答与证据，保留订正</h3>
            {session.attempts.filter(attempt => attempt.stage === 'independent' || attempt.stage === 'timed').map((attempt, index) => {
              const source = sampleMaterials(academicTableCompletionLesson).find(item => item.id === attempt.materialId);
              if (!source) return null;
              return <section className="preview-record" key={`${attempt.materialId}-${attempt.at}-${index}`}>
                <h3>{source.title} · 原始作答</h3>
                <p className="preview-note">{recordTime(attempt.at)} · {attempt.hinted ? '使用过提示' : '未使用提示'} · {attempt.fresh ? '当时确认未见过材料' : '没有未见材料证据'}{attempt.elapsedMs !== null && ` · 用时${Math.ceil(attempt.elapsedMs / 1000)}秒`}</p>
                <p>本组答案匹配：{attempt.correct} / {attempt.total}，不换算分数。</p>
                {passage(source)}{table(source, attempt.answers, 'original', `-${index}`)}<ReferenceAnswers material={source}/>
              </section>;
            })}
            <h3>订正这份限时材料</h3><p>{academicTableCompletionLesson.timed.instruction}</p>
            {table(academicTableCompletionLesson.timed, session.correctionAnswers, 'correction', '', true)}
            <ul>{academicTableCompletionLesson.timed.checklist.map(check => <li key={check}>{check}</li>)}</ul>
            <label>具体修了什么，或仍需要核验什么？（至少8字）
              <textarea rows={3} value={pendingAnswers[pendingKey(academicTableCompletionLesson.timed.id, 'correction-note')] ?? session.correctionNote} disabled={!writable} onChange={event => correctionNote(event.target.value)}/>
            </label>
            <p><button disabled={!writable || hasPending} onClick={() => commit({type: 'save-correction'})}>保留订正，安排隔天新题</button></p>
          </>}
          {stage === 'review' && !material && <>
            <h3>留下真实间隔，再打开新表格</h3><p>{delayedNames[receipt.delayed]}。</p>
            <p>最早复验时间：{receipt.reviewDueAt ? recordTime(receipt.reviewDueAt) : '完成订正后确定'}。复验时仍须实际作答；等待或点按钮都不是掌握证据。</p>
            <button disabled={!writable || hasPending || !receipt.reviewDueAt || now < receipt.reviewDueAt || !receipt.freshReviewAvailable} onClick={() => commit({type: 'start-review'})}>打开一份没接触过的复验题</button>
          </>}
          {stage === 'review' && !receipt.freshReviewAvailable && <p className="preview-note">本课两份新复验材料已接触过。继续复验需要新的材料，重复原题不能增加新题保持证据。</p>}
        </article>
        <section className="preview-history" aria-label="保留的原答与订正">
          <button aria-expanded={historyOpen} aria-controls="table-preview-history" onClick={() => setHistoryOpen(!historyOpen)}>{historyOpen ? '收起作答与订正' : '查看作答与订正'} · {receipt.practiceCount}次作答</button>
          <div id="table-preview-history" hidden={!historyOpen}>
            <p className="preview-note">这里只回看已保存的原答与订正，复验时间保持不变；不评定 IELTS 分数。</p>
            {!session.attempts.length && <p>尚无已保存首答。</p>}
            {session.attempts.map((attempt, index) => {
              const source = sampleMaterials(academicTableCompletionLesson).find(item => item.id === attempt.materialId);
              if (!source) return null;
              return <section className="preview-record" key={`${attempt.materialId}-${attempt.at}-${index}`}>
                <h3>{index + 1}. {stageNames[attempt.stage]} · 我的原答</h3><p className="preview-note">{source.title} · {recordTime(attempt.at)}</p>
                {passage(source)}{table(source, attempt.answers, 'history-original', `-${index}`)}
              </section>;
            })}
            {timedAttempt && (session.correctedAt || Object.keys(session.correctionAnswers).length || session.correctionNote) ? <section className="preview-record">
              <h3>我的订正 · {session.correctedAt ? '已保存' : '草稿'}</h3>
              {passage(academicTableCompletionLesson.timed)}{table(academicTableCompletionLesson.timed, session.correctionAnswers, 'history-correction')}
              {session.correctionNote && <p>修正说明：{session.correctionNote}</p>}
            </section> : null}
          </div>
        </section>
      </>}
    </>}
    {hasPending && <p className="preview-alert" role="alert" data-unsaved-input="true">有完整输入暂留本页，尚未写入记录；请缩短或重试后再提交、切换或进入下一步。</p>}
    {issue && <p className="preview-alert" role="alert">{issue}</p>}
    {readNotice && <p className="preview-note" role="status" data-read-notice="true">{readNotice}</p>}
    <footer className="preview-note"><p>本地记录键：{TABLE_PREVIEW_STORAGE_KEY}。本页不会写入正式学习进度，也不会自动清空未知记录。</p><button onClick={reload}>重新读取已保存记录</button></footer>
  </main>;
}

const root = document.getElementById('root');
if (root) createRoot(root).render(<TablePreviewApp/>);
