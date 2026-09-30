import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronLeft, Lightbulb, Lock, RotateCcw, X, Flag, BookOpen, ExternalLink } from 'lucide-react';
import { nodes, unitNodes, unitById, nodeById, questionsFor, courseUrl, resources, type MapNode } from './content';
import {stable, nextReviewAt, unlockNode, startNode, learningLabel, manuallyUnlocked, isReady} from './model';
import {AudioSpace, StopAudio, Recorder} from './media';
import {StarterTeaching, UnitTeaching, CourseRoom, QuestionAnswer} from './course';
import { updateDraft, emptyRecord, statusMap, grade, passedQuiz, submitQuiz, criteriaFor, evidenceErrors, mockErrors, overallBand, officialReached, today, type Progress, type NodeRecord, type Evidence, type Mock } from './model';
export type Save = (change: (s: Progress) => Progress) => void;
const blankEvidence = (): Evidence => ({ date: today(), material: '', work: '', reviewer: '', feedback: '', criteria: [false, false, false, false], unseen: false, timed: false, correct: '', total: '', dimensions:['','','',''], revision:'' });
function Link({ href, children }: {
    href: string;
    children: React.ReactNode;
}) { return <a href={href} target="_blank" rel="noreferrer">{children}<ArrowUpRight size={14}/></a>; }
function Errors({ errors }: {
    errors: string[];
}) { return errors.length ? <div className="form-errors" role="alert"><strong>还需要完成</strong><ul>{errors.map(e => <li key={e}>{e}</li>)}</ul></div> : null; }
export function LearningRoom({ node, state, save, close, select }: {
    node: MapNode;
    state: Progress;
    save: Save;
    close: () => void;
    select: (id: string) => void;
}) {
    const dialog = useRef<HTMLDialogElement>(null);
    const [choice, setChoice] = useState('');
    const record = state.records[node.id] || emptyRecord();
    const statuses = statusMap(state);
    const locked = statuses[node.id] === 'locked';
    useEffect(()=>{if(!locked)save(s=>startNode(s,node.id));},[node.id,locked]);
    useEffect(() => { const el = dialog.current; el?.showModal(); return () => el?.close(); }, []);
    const patch = (change: Partial<NodeRecord>) => save(s => ({ ...s, records: { ...s.records, [node.id]: { ...(s.records[node.id] || emptyRecord()), ...change } } }));
    const questions = questionsFor(node, record.round);
    const last = record.attempts.at(-1);
    const checked = !!last && last.round === record.round;
    const pass = checked && passedQuiz(node, last!);
    const result = checked ? grade(node, last!.answers, last!.round) : [];
    const mini = node.mission?.mini;
    const next = [...nodes,...unitNodes].filter(n => n.requires.includes(node.id) && statuses[n.id] === 'available');
    function start() { requestAnimationFrame(()=>dialog.current?.scrollTo({top:0})); patch({ phase: 'challenge', ...(checked ? { round: record.round + 1, answers: [], heard: [], assisted: false } : {}) }); }
    return <dialog ref={dialog} className="learning-dialog" onCancel={e => { e.preventDefault(); close(); }} aria-labelledby="lesson-title"><AudioSpace controls={!locked&&['starter','unit','lesson'].includes(node.kind)}>
  <header className="room-header"><button onClick={close} className="back-button"><ChevronLeft size={16}/>回到地图</button><span>句句有进步 · 学习空间</span><button className="icon-button" aria-label="关闭学习内容" onClick={close}><X size={20}/></button></header>
  <div className="room-content"><div className="eyebrow">{node.kind === 'checkpoint' ? 'CHECKPOINT' : node.kind === 'mock' ? 'FULL PRACTICE' : node.kind === 'finish' ? 'THE SUMMIT' : 'ONE STEP AT A TIME'}</div><h1 id="lesson-title">{node.title}</h1><p className="room-goal">{node.subtitle}</p><div className="room-status">{manuallyUnlocked(node,state)?<span className="manual-note">手动解锁</span>:null}<span>{learningLabel(node,state)}</span>{node.parent&&<button className="text-button" onClick={()=>select(node.parent!)}>返回本章目录</button>}{(node.kind==='unit'||node.kind==='course')&&<a className="text-button" href={courseUrl(node)}>本课教材与练习<ArrowRight size={14}/></a>}</div>
   {locked ? <div className="locked-room"><Lock size={28}/><h2>这一站尚未解锁</h2><button className="primary full" onClick={()=>save(s=>unlockNode(s,node.id))}>直接解锁并学习<ArrowRight size={17}/></button><p>解锁不会增加已完成数量。也可以先按推荐路线学习：</p>{(node.parent && statuses[node.parent]==='locked' ? [node.parent] : node.requires).filter(id => statuses[id] !== 'passed').map(id => <button key={id} className="secondary" onClick={() => select(id)}>{nodeById(id)!.title}<ArrowRight size={16}/></button>)}</div> :
            node.kind === 'course' ? <CourseRoom node={node} state={state} save={save} select={select}/> : ['lesson','checkpoint','starter','unit'].includes(node.kind) ? <>
    <div className="lesson-tabs"><button className={record.phase === 'learn' ? 'active' : ''} onClick={() => patch({ phase: 'learn', ...(record.phase === 'challenge' && !checked ? { assisted: true } : {}) })}>01 理解与跟练</button><button className={record.phase === 'challenge' ? 'active' : ''} onClick={() => patch({ phase: 'challenge' })}>02 独立检验</button></div>
    {record.phase === 'learn' ? <><StopAudio key={record.phase}/>
     {node.kind==='starter' ? <StarterTeaching node={node}/> : node.kind==='unit' ? <UnitTeaching unit={unitById(node.id)!} state={state} save={save}/> : mini ? <><div className="example-card"><span className="mini-label">看一个例子</span><p lang="en">{mini.en}</p><p className="translation">{mini.zh}</p></div><div className="teaching-note"><Lightbulb size={21}/><p>{mini.tip}</p></div>
      <div className="practice-block"><span className="mini-label">先试一下 · 可以看示范</span><h3>{mini.prompt}</h3><div className="choices">{mini.options.map(o => <button key={o} onClick={() => setChoice(o)} className={choice === o ? 'picked' : ''}>{o}{choice === o && o === mini.answer && <Check size={16}/>}</button>)}</div>{choice && <div className={`practice-feedback ${choice === mini.answer ? 'correct' : ''}`} role="status">{choice === mini.answer ? '这次选对了。' : '看看句子中的变化。'} {mini.why}</div>}</div>
      <div className="support-links"><a href={courseUrl(node)}><BookOpen size={16}/>打开课文、原声与讲解<ArrowRight size={14}/></a></div>
     </> : <div className="checkpoint-intro"><Flag size={30}/><h2>把这段路连接起来</h2><p>完成 {questions.length} 道混合题，检查能否独立提取刚学过的用法。全部答对后，下一段路线自动点亮。</p><div className="topic-tags">{node.members?.map(id => <span key={id}>{nodeById(id)!.title}</span>)}</div><p className="muted">需要补漏时，可从地图回到任意已解锁节点复习。</p></div>}
     <button className="primary full" onClick={start}>收起示范，开始独立检验<ArrowRight size={17}/></button><p className="footnote">本节点只验证题目对应的知识点；完整听说读写能力在后续实践中检验。</p>
    </> : <><StopAudio key={record.phase}/>
     <div className="quiz-intro"><span>{questions.length} 道题 · 本轮全部答对即可过关</span><span>检验 {record.round + 1}</span></div>
     <form onSubmit={e => { e.preventDefault(); if (!checked)
                    save(s => submitQuiz(s, node.id)); }}><div className="question-list">{questions.map((q, i) => <div className={`question ${checked ? (result[i] ? 'correct-answer' : 'wrong-answer') : ''}`} key={`${record.round}-${i}`}><label htmlFor={`answer-${i}`}><span>{String(i + 1).padStart(2, '0')}</span>{q.prompt}</label><QuestionAnswer q={q} index={i} round={record.round} value={record.answers[i]||''} disabled={checked} set={value=>{const answers=[...record.answers];answers[i]=value;patch({answers})}} heard={()=>{if(!checked)patch({heard:[...new Set([...(record.heard||[]),i])]})}}/>{q.clip&&!checked&&<small>{record.heard?.includes(i)?'✓ 原声已完整播放，可重听':'请先完整听完这一句，再作答。'}</small>}{checked && <p className="answer-feedback">{result[i] ? '✓ 已匹配' : '再看一下'} · {q.explanation}</p>}{record.assisted && !checked && <p className="hint">{q.explanation}</p>}</div>)}</div>
      {!checked && <><button className="primary full" type="submit" disabled={questions.some((q,i)=>!record.answers[i]?.trim() || q.clip&&!record.heard?.includes(i))}>核验本轮答案<Check size={17}/></button><button className="hint-button" type="button" onClick={() => patch({ assisted: true })}><Lightbulb size={15}/>{record.assisted ? '本轮有提示：仅记为跟练' : '需要提示？这一轮会记为跟练'}</button></>}
     </form>
     {checked && <div className={`quiz-receipt ${pass ? 'success' : ''}`} role="status">{pass ? <><CheckCircle2 size={29}/><h2>{node.kind==='unit' ? stable(node,state)?'这一组，隔日巩固通过。':'这一组，初次通过。':'这一站，通过了。'}</h2><p>独立完成 {questions.length} 道题。{next.length ? `${next.length === 1 ? '下一站已解锁' : '听说读写分支已解锁'}。` : '这次巩固已记录。'} {node.kind==='unit'&&!stable(node,state)?`隔日检验最早从 ${new Date(nextReviewAt(node,state)!).toLocaleString('zh-CN')} 开始。`: '隔天再回来回想一次。'}</p>{node.parent&&<button className="secondary full" onClick={()=>select(node.parent!)}>返回本章 · 查看复习和作品</button>}{next.map(n => <button key={n.id} className="primary full" onClick={() => select(n.id)}>继续：{n.title}<ArrowRight size={16}/></button>)}<button className="secondary full" onClick={close}>回到地图，看刚点亮的路线</button></> : <><Lightbulb size={28}/><h2>{last!.assisted ? '跟练完成，再独立试一次' : '把这一处补好，再出发'}</h2><p>本轮 {result.filter(Boolean).length} / {questions.length} 题匹配。{last!.assisted ? '使用提示的练习不解锁节点。' : '看看题目下的解释，再换一组题。'}</p></>}
      <button className="text-button" onClick={start}><RotateCcw size={15}/>{pass ? '换题巩固' : '换一组题，重新检验'}</button>
     </div>}
    </>}
   </> : node.kind === 'task' || node.kind === 'mock' ? <EvidenceForm key={node.id} node={node} state={state} save={save} close={close}/> : <FinishForm state={state} save={save}/>}
  </div>
 </AudioSpace></dialog>;
}
function EvidenceForm({ node, state, save, close }: {
    node: MapNode;
    state: Progress;
    save: Save;
    close: () => void;
}) {
    const record = state.records[node.id] || emptyRecord();
    const isMock = node.kind === 'mock';
    const base = { ...blankEvidence(), scores: ['', '', '', ''], kind: 'academic' as const, reference: '', ...(isMock ? record.mock : record.evidence), ...record.draft } as Mock;
    const [errors, setErrors] = useState<string[]>([]);
    const [saved, setSaved] = useState(false);
    const change = (key: string, value: string | boolean | boolean[] | string[]) => { setSaved(false); save(s=>updateDraft(s,node.id,{[key]:value},base)); };
    const task = node.mission?.assignment;
    const links = task?.resources?.length ? task.resources : node.lane === 'reading' ? ['reading', 'samples'] : node.lane === 'speaking' ? ['speakingTasks', 'speaking'] : ['practice', 'scoring'];
    function submit(e: React.FormEvent) {
        e.preventDefault();
        let problems = isMock ? mockErrors(base, state.minimum) : evidenceErrors(node, base);
        if (node.id === 'mock-two') {
            const first = state.records['mock-one']?.mock;
            if (first && (base.date <= first.date || base.material.trim().toLowerCase() === first.material.trim().toLowerCase()))
                problems = [...problems, '第二套必须是不同的新试卷，且完成日期晚于第一套。'];
        }
        save(s => ({ ...s, records: { ...s.records, [node.id]: { ...(s.records[node.id] || emptyRecord()), ...(isMock ? { mock: base } : { evidence: base }), draft: undefined } } }));
        setErrors(problems);
        setSaved(!problems.length);
    }
    const field = (key: keyof Evidence | 'reference', label: string, placeholder: string, large = false) => <label className="form-field">{label}{large ? <textarea rows={3} required maxLength={10000} value={String(base[key])} placeholder={placeholder} onChange={e => change(key, e.target.value)}/> : <input required maxLength={500} value={String(base[key])} placeholder={placeholder} onChange={e => change(key, e.target.value)}/>}</label>;
    return <><div className="assignment-brief"><span className="mini-label">这一站怎么练</span><p>{isMock ? '选择合法取得、没做过的一套完整 Academic 试卷，独立限时完成听、读、写、说。听读按该卷答案和换分说明核对；口写交给熟悉 IELTS 标准的评阅者。' : task?.work}</p><p className="goal-line"><Flag size={16}/>{isMock ? '本站终点门槛：两套不同的新卷，在不同日期完成，总分都至少 6.5，并满足确认后的单项要求。' : task?.check}</p><div className="resource-links">{links.map(id => resources[id] && <Link key={id} href={resources[id].url}>{resources[id].title}</Link>)}{task?.course && <a href={courseUrl(node)}>打开对应练习<ArrowRight size={14}/></a>}</div></div>
  <h2 className="form-heading">{isMock ? '留下完整结果' : '记录实践与评阅'}</h2><p className="muted">材料与评阅由你填写；本站检查记录是否满足门槛，不独立核验评阅真伪。</p>
  <form onSubmit={submit} className="evidence-form"><label className="form-field">完成日期<input type="date" required max={today()} value={base.date} onChange={e => change('date', e.target.value)}/></label>
   {field('material', isMock ? '试卷名称与编号' : '材料与题目编号', isMock ? '例如：所用 Academic 试卷及 Test 编号' : '写明来源、篇目或题号')}
   {field('work', node.lane==='writing'?'保留实际英文原稿':'你的作答与作品', node.lane==='writing'?'粘贴独立限时完成的原稿；两篇任务注明 Task 1 和 Task 2。':'写下答案，或录音文件名和具体内容摘要。', true)}
   {node.lane==='speaking'&&<Recorder id={node.id}/>}
   {!isMock && ['listening', 'reading'].includes(node.lane || '') && <><div className="form-pair">{field('correct', '正确题数', '例如 6')}{field('total', '总题数', '至少 8，完整卷为 40')}</div><p className="footnote">本站练习解锁线为 75%，用于安排进阶；不直接换算 IELTS 分数。</p></>}
   {isMock && <><ScoreFields scores={base.scores} set={scores => change('scores', scores)}/>{field('reference', '听读换分依据', '试卷所附换分表或评阅来源')}<label className="form-field">接收机构的单项要求<select value={state.minimum} onChange={e => save(s => ({ ...s, minimum: e.target.value }))}><option value="unconfirmed">尚未确认（暂不解锁终点）</option><option value="0">已确认：无单项要求</option><option value="5.5">每项至少 5.5</option><option value="6">每项至少 6.0</option><option value="6.5">每项至少 6.5</option><option value="7">每项至少 7.0</option></select></label></>}
   {(isMock || ['writing', 'speaking'].includes(node.lane || '')) && field('reviewer', '口语 / 写作评阅者', '评阅者或机构名称，不填自评')}
   {!isMock&&['writing','speaking'].includes(node.lane||'')&&<div className="rubric-feedback">{criteriaFor(node).map((criterion,i)=><label className="form-field" key={criterion}>{criterion}<textarea required rows={2} maxLength={2000} value={base.dimensions?.[i]||''} placeholder="记录具体例子、问题和修改办法" onChange={e=>{const dimensions=[...(base.dimensions||['','','',''])];dimensions[i]=e.target.value;change('dimensions',dimensions)}}/></label>)}</div>}
   {field('feedback', '具体反馈与修订', '指出一个具体问题、评阅意见和你如何修改。口写请覆盖四项评分标准。', true)}
   {!isMock && <fieldset className="criteria"><legend>达标条件</legend>{criteriaFor(node).map((c, i) => <label key={c}><input type="checkbox" checked={base.criteria[i] || false} onChange={e => { const checked = [...base.criteria]; checked[i] = e.target.checked; change('criteria', checked); }}/>{c}</label>)}</fieldset>}
   <label className="checkbox-row"><input type="checkbox" checked={base.unseen} onChange={e => change('unseen', e.target.checked)}/>这次检验使用没做过的新材料，独立完成。</label><label className="checkbox-row"><input type="checkbox" checked={base.timed} onChange={e => change('timed', e.target.checked)}/>已按对应任务的考试时限完成。</label>
   {!isMock&&field('revision','换题复验','写明另一组新题编号、完成结果、同类错误是否改善。',true)}
   <Errors errors={errors}/>{saved && <div className="saved-message" role="status"><CheckCircle2 size={22}/><span>记录符合这一站的门槛，后续节点已点亮。</span><button type="button" onClick={close}>返回地图<ArrowRight size={14}/></button></div>}
   <button className="primary full" type="submit">保存结果，核验解锁条件<ArrowRight size={16}/></button><p className="footnote">未达标的结果也会保留，方便修补后重新检验。已有记录修改后会重新判断后续解锁状态。</p>
  </form>
 </>;
}
function ScoreFields({ scores, set }: {
    scores: string[];
    set: (s: string[]) => void;
}) { return <div className="scores">{['听力', '阅读', '写作', '口语'].map((label, i) => <label className="form-field" key={label}>{label}<input type="number" inputMode="decimal" min="0" max="9" step="0.5" required value={scores[i] || ''} onChange={e => { const next = [...scores]; next[i] = e.target.value; set(next); }}/></label>)}<div className="overall">总分 <strong>{scores.every(s => s.trim()) ? overallBand(scores.map(Number))?.toFixed(1) || '—' : '—'}</strong></div></div>; }
function FinishForm({ state, save }: {
    state: Progress;
    save: Save;
}) {
    const [form, setForm] = useState(state.official || { date: today(), reference: '', scores: ['', '', '', ''] });
    const [error, setError] = useState('');
    const reached = officialReached(state),ready=isReady(state);
    return <><div className="finish-banner"><Flag size={36}/><h2>{reached ? '你记录了 6.5 达标成绩。' : ready ? '你的模考准备度已达标。' : '终点已开放，学习目标尚未完成。'}</h2><p>{reached ? '正式成绩和接收机构要求是最终依据。成绩单信息仅保存在当前浏览器。' : ready ? '两套完整新卷均达到目标。保留四项状态，参加正式考试后，再记录你的终点。' : '手动解锁只让你查看终点要求；还没有两套有效模考达标记录。'}</p></div><details className="finish-record" open={!reached}><summary>记录正式 IELTS 成绩</summary><p className="muted">填成绩单上的分数；无需上传成绩单或填写完整证件编号。</p><form onSubmit={e => { e.preventDefault(); const next = { ...state, official: form }; if (!officialReached(next)) {
        setError('请核对日期、成绩来源及四项分数：总分需至少 6.5，并达到已确认的单项要求。');
        return;
    } save(s => ({ ...s, official: form })); setError(''); }}><label className="form-field">考试日期<input type="date" required max={today()} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}/></label><label className="form-field">成绩来源备注<input required maxLength={500} value={form.reference} placeholder="例如：Academic 正式成绩，已核对" onChange={e => setForm({ ...form, reference: e.target.value })}/></label><label className="form-field">接收机构单项要求<select value={state.minimum} onChange={e=>save(s=>({...s,minimum:e.target.value}))}>{[['unconfirmed','尚未确认'],['0','明确没有单项要求'],['5.5','各项至少 5.5'],['6','各项至少 6.0'],['6.5','各项至少 6.5'],['7','各项至少 7.0']].map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label><ScoreFields scores={form.scores} set={scores => setForm({ ...form, scores })}/>{error && <p role="alert" className="form-errors">{error}</p>}<button className="primary full">保存正式成绩<Check size={17}/></button></form></details><p className="footnote"><Link href={resources.scoring.url}>IELTS 官方评分说明</Link> · 总分按四项平均取整至整分或半分；节点数不代表成绩。</p></>;
}
