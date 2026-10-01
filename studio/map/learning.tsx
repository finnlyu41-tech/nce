import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronLeft, Lightbulb, Lock, RotateCcw, X, Flag, BookOpen, ExternalLink } from 'lucide-react';
import { nodes, unitNodes, unitById, originalSite, nodeById, questionsFor, courseUrl, resources, type MapNode } from './content';
import {stable, nextReviewAt, unlockNode, startNode, learningLabel, manuallyUnlocked, isReady, changeStudyStep, restartQuiz} from './model';
import {AudioSpace, StopAudio, Recorder} from './media';
import {StarterTeaching, UnitTeaching, CourseRoom, QuestionAnswer} from './course';
import {lessonPlan, questionSkills} from './lesson-plan';
import {SpeakingPractice} from './speaking';
import { updateDraft, emptyRecord, statusMap, grade, passedQuiz, submitQuiz, criteriaFor, evidenceErrors, mockErrors, overallBand, officialReached, today, type Progress, type NodeRecord, type Evidence, type Mock } from './model';
export type Save = (change: (s: Progress) => Progress) => boolean;
const blankEvidence = (): Evidence => ({ date: today(), material: '', work: '', reviewer: '', feedback: '', criteria: [false, false, false, false], unseen: false, timed: false, correct: '', total: '', dimensions:['','','',''], revision:'' });
function Link({ href, children }: {
    href: string;
    children: React.ReactNode;
}) { return <a href={href} target="_blank" rel="noreferrer">{children}<ArrowUpRight size={14}/></a>; }
function Errors({ errors }: {
    errors: string[];
}) { return errors.length ? <div className="form-errors" role="alert"><strong>还需要完成</strong><ul>{errors.map(e => <li key={e}>{e}</li>)}</ul></div> : null; }
export function LearningRoom({node,state,save,close,select,speaking}:{node:MapNode;state:Progress;save:Save;close:()=>void;select:(id:string)=>void;speaking?:'practice'|'review'}) {
    const title=useRef<HTMLHeadingElement>(null);
    const record=state.records[node.id]||emptyRecord(),statuses=statusMap(state),locked=statuses[node.id]==='locked';
    const unit=node.kind==='unit',quiz=['unit','starter','lesson','checkpoint'].includes(node.kind);
    const step=record.phase==='challenge'?3:record.studyStep||0;
    const questions=questionsFor(node,record.round),index=Math.min(record.questionIndex||0,Math.max(0,questions.length-1));
    useEffect(()=>{if(!locked)save(s=>startNode(s,node.id))},[node.id,locked]);
    useEffect(()=>{if(speaking&&!locked&&record.phase==='challenge')save(s=>changeStudyStep(s,node.id,0))},[node.id,speaking,locked]);
    useEffect(()=>{window.scrollTo({top:0});(document.getElementById(`question-${index}`)||title.current)?.focus({preventScroll:true})},[node.id,step,index,speaking]);
    const changeStep=(next:number)=>save(s=>next===3&&s.records[node.id]?.phase==='learn'&&s.records[node.id]?.attempts.at(-1)?.round===s.records[node.id]?.round?restartQuiz(s,node.id):changeStudyStep(s,node.id,next));
    return <main className="focus-page"><header className="focus-header"><button className="back-button" onClick={close}><ChevronLeft size={17}/>学习</button><a className="focus-brand" href="#/courses">句句有进步<span>找课</span></a><span className="focus-saved">进度自动保留</span></header><AudioSpace controls={false}><div className="focus-content"><div className="focus-course-heading"><p>{node.subtitle}{unit&&speaking!=='review'&&<> · <span lang="en">{node.title}</span></>}</p><h1 ref={title} tabIndex={-1}>{unit?lessonPlan(unitById(node.id)!).goal:node.title}</h1><span>{manuallyUnlocked(node,state)?'手动解锁 · ':''}{learningLabel(node,state)}</span></div>
    {locked?<section className="locked-room"><Lock size={28}/><h2>这一课还没有开放</h2><p>可以直接开始，也可以按地图顺序学习。解锁不会标记已完成。</p><button className="primary" onClick={()=>save(s=>unlockNode(s,node.id))}>直接解锁并学习<ArrowRight size={17}/></button></section>:speaking&&unit?<SpeakingPractice key={`${node.id}-${speaking}`} unit={unitById(node.id)!} state={state} save={save} review={speaking==='review'} close={()=>select(node.id)}/>:quiz?<>
      <nav className="focus-steps" aria-label="本课学习步骤">{(unit?[[0,'听懂'],[1,'看懂'],[2,'自己用'],[3,'检验']]:[[0,'听与跟练'],[3,'自己试']]).map(([value,label],i)=><button key={value} aria-current={step===value?'step':undefined} onClick={()=>changeStep(Number(value))}><span>{i+1}</span>{label}</button>)}</nav><StopAudio key={`${step}-${index}`}/>
      {step===3?<FocusedQuiz node={node} state={state} save={save} select={select} close={close}/>:unit?<UnitTeaching key={node.id} unit={unitById(node.id)!} state={state} save={save} step={step} next={()=>changeStep(step+1)}/>:<StarterTeaching node={node} state={state} save={save} ready={()=>changeStep(3)}/>}
    </>:node.kind==='course'?<CourseRoom node={node} state={state} save={save} select={select}/>:node.kind==='task'||node.kind==='mock'?<EvidenceForm key={node.id} node={node} state={state} save={save} close={close}/>:<FinishForm state={state} save={save}/>}
    {node.parent&&<div className="focus-chapter-link"><button className="text-button" onClick={()=>select(node.parent!)}>查看本章课次</button></div>}
    </div></AudioSpace></main>;
}
function FocusedQuiz({node,state,save,select,close}:{node:MapNode;state:Progress;save:Save;select:(id:string)=>void;close:()=>void}){
  const record=state.records[node.id]||emptyRecord(),questions=questionsFor(node,record.round),last=record.attempts.at(-1),checked=!!last&&last.round===record.round;
  const index=Math.min(record.questionIndex||0,questions.length-1),q=questions[index];
  const receiptTitle=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{if(checked){window.scrollTo({top:0});receiptTitle.current?.focus({preventScroll:true})}},[checked]);
  const patch=(change:Partial<NodeRecord>)=>save(s=>({...s,records:{...s.records,[node.id]:{...(s.records[node.id]||emptyRecord()),...change}}}));
  const complete=(i:number)=>!!record.answers[i]?.trim()&&(!questions[i].clip||!!record.heard?.includes(i));
  if(checked){
    const pass=passedQuiz(node,last),result=grade(node,last.answers,last.round),statuses=statusMap(state);
    const next=[...nodes,...unitNodes].find(n=>n.requires.includes(node.id)&&statuses[n.id]==='available');
    const skills=questionSkills(questions,result),repair=skills.find(s=>s.correct<s.total);
    const reviewed=stable(node,state),reviewAt=reviewed?last.at+(record.attempts.filter(p=>passedQuiz(node,p)).length>=4?21:7)*24*60*60*1000:nextReviewAt(node,state);
    const goRepair=()=>save(s=>changeStudyStep(s,node.id,node.kind==='unit'?(repair?.step||0):0));
    return <section className={`quiz-receipt focus-receipt ${pass?'success':''}`}>
      {pass?<CheckCircle2 size={32}/>:<Lightbulb size={32}/>}
      <h2 ref={receiptTitle} tabIndex={-1}>{pass?node.kind==='unit'?(reviewed?'隔日巩固通过':'这一组，初次通过'):'这一站，通过了':last.assisted?'跟练完成，再独立试一次':'先补好这一处'}</h2>
      <p>{last.assisted?'本轮借助过帮助，结果记为跟练。':pass?'本轮独立检验已保存。':'这轮还有未匹配的答案，先处理一处再继续。'}</p>
      <ul className="skill-receipt" aria-label="本轮具体表现">{skills.map(skill=><li key={skill.id}><span>{node.id==='letters'?'字母辨认':skill.label}</span><strong>{skill.correct} / {skill.total} 匹配</strong></li>)}</ul>
      {repair&&<div className="repair-next"><strong>下一步：{node.id==='letters'?'再认一组大小写字母':repair.label}</strong><p>{node.id==='letters'?'回看字母形状，再换一组配对试试。':repair.repair}</p></div>}
      {pass&&node.kind==='unit'&&reviewAt&&<p className="review-schedule">下次回想：{new Date(reviewAt).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})} 起，换一组题检验{reviewed?'记忆是否保持':'隔日是否还记得'}。</p>}
      {node.kind==='unit'&&<p className="footnote">自己的表达{record.draft?.note?'已保留，准确性待核对':'可以回到“自己用”补练'}；听读与组句结果不能判断口语是否达标。</p>}
      <details className="answer-review"><summary>查看本轮答案与解释</summary>{questions.map((item,i)=><article key={i}><strong>{i+1}. {item.prompt}</strong><p>{last.answers[i]||'未作答'}</p><p>{result[i]?'✓ 已匹配':'与参考未匹配'} · {item.explanation}</p></article>)}</details>
      {repair?<button className="primary full" onClick={goRepair}>先修补：{node.id==='letters'?'认字母':repair.label}<ArrowRight size={17}/></button>:pass&&next?<button className="primary full" onClick={()=>select(next.id)}>继续下一{next.kind==='unit'?'课':'站'}<ArrowRight size={17}/></button>:<button className="primary full" onClick={()=>save(s=>restartQuiz(s,node.id))}>{pass?'换题巩固':'收起提示，重新独立检验'}<ArrowRight size={17}/></button>}
      {(repair||pass&&next)&&<button className="text-button" onClick={()=>save(s=>restartQuiz(s,node.id))}>{repair?'已修补，换题再试':'再练本课'}</button>}
      <button className="text-button" onClick={close}>回到学习</button>
    </section>;
  }
  return <section className="focus-quiz" aria-label="独立检验"><div className="quiz-position"><span>第 {index+1} / {questions.length} 题</span><span>{record.assisted?'本轮跟练':'独立检验'}</span></div><div className="quiz-meter"><span style={{width:`${(index+1)/questions.length*100}%`}}/></div><form onSubmit={e=>{e.preventDefault();if(index<questions.length-1){if(complete(index))patch({questionIndex:index+1});return}const missing=questions.findIndex((_,i)=>!complete(i));if(missing>=0){patch({questionIndex:missing});return}save(s=>submitQuiz(s,node.id))}}><div className="question" key={`${record.round}-${index}`}><h2 tabIndex={-1} id={`question-${index}`}>{q.prompt}</h2><QuestionAnswer q={q} index={index} round={record.round} value={record.answers[index]||''} disabled={false} set={value=>{const answers=[...record.answers];answers[index]=value;patch({answers})}} heard={()=>patch({heard:[...new Set([...(record.heard||[]),index])]})}/>{q.clip&&<p className="footnote">{record.heard?.includes(index)?'原声已播放完成，可以重听。':'先完整听完原声，再作答。'}</p>}{record.assisted&&<p className="hint">{q.explanation}</p>}</div><div className="quiz-actions"><button type="button" className="text-button" disabled={index===0} onClick={()=>patch({questionIndex:index-1})}>上一题</button><button type="submit" className="primary" disabled={!complete(index)}>{index===questions.length-1?'提交本轮检验':'下一题'}<ArrowRight size={17}/></button></div><button type="button" className="hint-button" onClick={()=>patch({assisted:true})}>{record.assisted?'已看提示，本轮记为跟练':'需要提示'}</button></form></section>;
}

function EvidenceForm({ node, state, save, close }: {
    node: MapNode;
    state: Progress;
    save: Save;
    close: () => void;
}) {
    const record = state.records[node.id] || emptyRecord();
    const [editing,setEditing]=useState(!!record.draft||!!record.evidence||!!record.mock);
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
    return <>{!editing?<><div className="assignment-brief"><span className="mini-label">这一站怎么练</span><p>{isMock ? '选择合法取得、没做过的一套完整 Academic 试卷，独立限时完成听、读、写、说。听读按该卷答案和换分说明核对；口写交给熟悉 IELTS 标准的评阅者。' : task?.work}</p><p className="goal-line"><Flag size={16}/>{isMock ? '本站终点门槛：两套不同的新卷，在不同日期完成，总分都至少 6.5，并满足确认后的单项要求。' : task?.check}</p><div className="resource-links">{links.map(id => resources[id] && <Link key={id} href={resources[id].url}>{resources[id].title}</Link>)}{task?.course && <a href={courseUrl(node)}>打开对应练习<ArrowRight size={14}/></a>}</div></div>
  <button className="primary full" onClick={()=>setEditing(true)}>记录本次练习结果<ArrowRight size={17}/></button></>:<><button className="text-button" onClick={()=>setEditing(false)}>← 查看练习要求</button><h2 className="form-heading">{isMock ? '留下完整结果' : '记录实践与评阅'}</h2><p className="muted">材料与评阅由你填写；本站检查记录是否满足门槛，不独立核验评阅真伪。</p>
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
  </form></>}
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
