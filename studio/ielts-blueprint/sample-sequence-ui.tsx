'use client';
import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Recorder} from '../app/recording-feedback';
import type {LearningStage, Variant} from './types';
import {sampleLessonsFor, sampleMaterials, sampleSequence, type SampleMaterial} from './sample-sequence';
import {batch02NativeLessonsFor} from './curriculum/batch-02';
import {SampleMultiSelectInput} from './sample-multi-select-ui';
import {tableCompletionStimulusFor} from './curriculum/table-completion';
import {TableStimulusView,type TableStimulusViewProps} from './structured-table/table-stimulus';
import {GTTableOptionsView} from './gt-table-options-ui';
import {gtTableOptionsStimulusFor,gtTableOptionFeedback} from './curriculum/gt-table-options';
import type {GTTableContextMaterial} from '../app/ielts-gt-table-context';
import {adaptTableAnswerAction} from './structured-table/projection';
import type {TableContextMaterial} from '../app/ielts-table-context';
import {activeSampleDraft, activeSampleMaterial, emptySampleState, sampleLessonReceipt, sampleSession, sampleWordCount, selectedSampleLesson, transitionSample, type SampleAction, type SampleState} from './sample-sequence-model';

function TaskTable({options,...props}:TableStimulusViewProps & {options?:readonly {letter:string;text:string}[]}){return options?<GTTableOptionsView {...props} options={options}/>:<TableStimulusView {...props}/>;}

export type SampleSequenceProps = {value?: SampleState; initialValue?: SampleState; onChange?: (state: SampleState) => void; guidedFlow?: boolean; persistenceNote?: string; tableContexts?: Record<string,TableContextMaterial>; gtTableContexts?:Record<string,GTTableContextMaterial>};
const stageNames: Record<LearningStage, string> = {explain: '理解方法', model: '看一个示范', guided: '跟着试', independent: '撤提示 · 新题', timed: '训练用限时', feedback: '反馈与订正', review: '延迟 · 新题复验'};
const stages = Object.keys(stageNames) as LearningStage[];
const delayedNames = {'not-scheduled': '订正后安排复验', 'not-due': '尚未到 24 小时', 'awaiting-new-task': '可以用新题复验', 'needs-repair': '新题仍有错误，先修这一处', assisted: '这次有提示、重播或材料已见过，保留为练习', 'awaiting-human-review': '新题作品已保留，等待人工／音频核验', 'local-target-observed': '观察到本课局部目标的隔日独立表现'};
const recordTime = (at: number) => <time dateTime={new Date(at).toISOString()}>{new Date(at).toLocaleString('zh-CN', {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false})}</time>;

/** Standalone teaching sample. Host owns persistence; no localStorage or app progress writes. */
export function IELTSSampleSequence({value, initialValue, onChange, guidedFlow = false, persistenceNote, tableContexts, gtTableContexts}: SampleSequenceProps) {
  const [internal, setInternal] = useState<SampleState>(() => initialValue || emptySampleState());
  const state = value || internal, latest = useRef(state); latest.current = state;
  // Speech events can outlive the render that requested playback. Keep the
  // host's current CAS callback alongside the current controlled value.
  const latestOnChange = useRef(onChange);
  useLayoutEffect(() => {latestOnChange.current = onChange;}, [onChange]);
  const [issue, setIssue] = useState(''), [now, setNow] = useState(Date.now());
  const [pendingTableAnswers,setPendingTableAnswers]=useState<Record<string,string>>({});
  const pendingTableRef=useRef(pendingTableAnswers);
  useLayoutEffect(()=>{pendingTableRef.current=pendingTableAnswers;},[pendingTableAnswers]);
  // A controlled host must echo the exact raw input before we release the local
  // copy. An engine transition alone does not acknowledge host acceptance or disk.
  useLayoutEffect(()=>{
    if(!value)return;
    const kept={...pendingTableRef.current};let changed=false;
    for(const [key,raw] of Object.entries(kept)){
      const [variant,lessonId,materialId,type,questionId]=JSON.parse(key) as [Variant,string,string,'answer'|'correction-answer',string];
      const saved=value.sessions[`${variant}:${lessonId}`];
      const echoed=type==='correction-answer'?saved?.correctionAnswers[questionId]:saved?.drafts[materialId]?.answers[questionId];
      if(echoed===raw){delete kept[key];changed=true;}
    }
    if(changed){pendingTableRef.current=kept;setPendingTableAnswers(kept);}
  },[value]);
  const [categoryOpen,setCategoryOpen]=useState(false),[catalogOpen,setCatalogOpen]=useState(!guidedFlow),[historyOpen,setHistoryOpen]=useState(false),[helpOpen,setHelpOpen]=useState(false);
  const playing = useRef<{id: string; promptId: string; watchdog: ReturnType<typeof setTimeout>} | null>(null);
  const lesson = selectedSampleLesson(state), session = sampleSession(state), material = activeSampleMaterial(state), draft = activeSampleDraft(state);
  const receipt = sampleLessonReceipt(state, now), lastPlayback = draft?.playbacks.at(-1), busy = lastPlayback?.status === 'requested' || lastPlayback?.status === 'playing';
  const lessons = state.variant ? sampleLessonsFor(state.variant) : [], nextLesson = lessons[lessons.findIndex(item => item.id === state.lessonId) + 1];
  const nativeLessons=state.variant?batch02NativeLessonsFor(state.variant):[];
  const nativeLesson=nativeLessons.find(item=>item.id===lesson?.id);
  const nativeMaterial=(m:SampleMaterial)=>nativeLessons.flatMap(item=>[item.model,item.guided,item.independent,item.timed,...item.reviews]).find(item=>item.id===m.id);
  const waitingForClock = session.stage === 'timed' && !draft?.startedAt;
  const stageHeading=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{stageHeading.current?.focus({preventScroll:true});stageHeading.current?.scrollIntoView({block:'start',behavior:'instant'})},[state.variant,state.lessonId,session.stage]);
  const canSubmit = !!draft && !draft.submittedAt && !waitingForClock;
  const dispatch = (action: SampleAction) => {
    if(Object.keys(pendingTableRef.current).length&&!['answer','correction-answer'].includes(action.type)){const message='有表格输入尚未保存。请缩短或重试后继续，完整输入仍保留。';setIssue(message);return {state:latest.current,issue:message};}
    // Academic-only lessons have no GT counterpart. Choose an existing entry
    // before changing category so the host never receives an invalid selection.
    const current=latest.current;
    const base=action.type==='select-variant'&&!sampleLessonsFor(action.variant).some(item=>item.id===current.lessonId)?{...current,lessonId:sampleLessonsFor(action.variant)[0].id}:current;
    const result = transitionSample(base, action, Date.now());
    setIssue(result.issue || '');
    if (result.state !== latest.current) {latest.current = result.state; if (!value) setInternal(result.state); latestOnChange.current?.(result.state);}
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
  const gtFor=(id:string)=>gtTableContexts?.[id]||gtTableOptionsStimulusFor(id);
  const tableFor=(id:string)=>gtFor(id)?.table||tableContexts?.[id]?.table||tableCompletionStimulusFor(id);
  const context = (m: SampleMaterial, showScript = false) => {
    const native=nativeMaterial(m),text=gtTableContexts?.[m.id]?.context??tableContexts?.[m.id]?.context??(native?(m.script?undefined:native.stimulus):m.context);
    return <>{text&&<blockquote className="sample-context" lang="en">{text}</blockquote>}{m.script&&showScript&&<blockquote className="sample-context" lang="en">{m.script}</blockquote>}</>;
  };
  function historyContext(m: SampleMaterial, originalAnswers:Record<string,string>={}, instance='') {
    const native = nativeMaterial(m);
    const table=tableFor(m.id);
    return <><p>原题要求：{gtTableContexts?.[m.id]?.instruction||tableContexts?.[m.id]?.instruction||m.instruction}</p>{context(m, true)}{table&&<TaskTable options={gtFor(table.id)?.options} stimulus={table} answers={originalAnswers} readOnly idPrefix={`${m.id}-history-${instance}`}/>} {native && <ol className="sample-option-list" aria-label="完整选项">{native.task.options.map(option => <li key={option.id} lang="en">{option.id}. {option.text}</li>)}</ol>}</>;
  }
  const audio = material?.script && <div className="sample-audio">
    <p>设备合成英语 · 声音质量未人工核验。播放完成后，请确认自己实际听到了声音。</p>
    <div className="sample-row"><button type="button" disabled={busy || !!draft?.submittedAt || waitingForClock} onClick={playAudio}>{draft?.playbacks.length ? '再次播放（保留重播记录）' : '播放这段音频'}</button>{busy && <button type="button" onClick={() => stopAudio()}>停止播放</button>}</div>
    <p role="status">{busy ? '正在请求／播放…' : lastPlayback?.status === 'failed' ? `未记为听过：${lastPlayback.failure}` : lastPlayback?.audible ? '已确认实际听到声音。' : lastPlayback?.status === 'ended' ? '播放已结束，等待你的声音确认。' : '还没有播放记录。'} 共 {draft?.playbacks.length || 0} 次播放请求。</p>
    {lastPlayback?.status === 'ended' && !draft?.submittedAt && <div className="sample-row"><button type="button" disabled={lastPlayback.audible} onClick={() => dispatch({type: 'audio-confirm', playbackId: lastPlayback.id, promptId: material.id})}>我实际听到了声音</button><button type="button" onClick={() => dispatch({type: 'audio-fail', playbackId: lastPlayback.id, promptId: material.id, reason: '学习者报告没有声音。'})}>没有声音</button></div>}
  </div>;
  function answers(m: SampleMaterial, correction = false) {
    const table=tableFor(m.id);
    if(table){
      const firstSaved=draft?.submittedAt?session.attempts.find(a=>a.materialId===m.id):undefined;
      if(!correction&&draft?.submittedAt&&!firstSaved)return <p role="alert">未找到本材料已保存的首答，此处保持只读；请重新读取记录。</p>;
      const type=correction?'correction-answer':'answer',base=correction?session.correctionAnswers:(firstSaved?.answers||draft?.answers||{}),shown={...base};
      const scope={variant:state.variant,lessonId:state.lessonId};
      const answerKey=(questionId:string)=>JSON.stringify([scope.variant,scope.lessonId,m.id,type,questionId]);
      for(const q of m.questions||[]){const key=answerKey(q.id);if(Object.hasOwn(pendingTableAnswers,key))shown[q.id]=pendingTableAnswers[key];}
      return <TaskTable options={gtFor(table.id)?.options} stimulus={table} answers={shown} readOnly={!correction&&!!draft?.submittedAt} idPrefix={`${m.id}-${type}`} onAnswer={(questionId,raw)=>{
        const key=answerKey(questionId),pending={...pendingTableRef.current,[key]:raw};pendingTableRef.current=pending;setPendingTableAnswers(pending);
        const current=latest.current,currentMaterial=correction?selectedSampleLesson(current)?.timed:activeSampleMaterial(current);
        if(current.variant!==scope.variant||current.lessonId!==scope.lessonId||currentMaterial?.id!==m.id||correction&&sampleSession(current).stage!=='feedback'){
          setIssue('练习位置已更新，这次表格输入尚未交给工作区；完整输入仍保留。');return;
        }
        const adapted=adaptTableAnswerAction(table,{type,questionId,value:raw});if(!adapted.ok){setIssue('此格完整输入尚未交给工作区：'+adapted.reason);return;}
        const result=dispatch(adapted.action);if(!value&&!result.issue){const kept={...pendingTableRef.current};delete kept[key];pendingTableRef.current=kept;setPendingTableAnswers(kept);}
      }}/>;
    }
    const native=nativeMaterial(m);
    if(native)return <SampleMultiSelectInput task={native.task} rawAnswer={(correction?session.correctionAnswers:draft?.answers)?.[native.task.id]||''} onChange={raw=>dispatch({type:correction?'correction-answer':'answer',questionId:native.task.id,value:raw})}/>;
    return m.questions?.map(q => <label className="sample-field" key={q.id}>{q.prompt}
      {q.options ? <select value={(correction ? session.correctionAnswers : draft?.answers)?.[q.id] || ''} onChange={event => dispatch({type: correction ? 'correction-answer' : 'answer', questionId: q.id, value: event.target.value})}><option value="">请选择</option>{q.options.map(option => <option key={option}>{option}</option>)}</select> : <input value={(correction ? session.correctionAnswers : draft?.answers)?.[q.id] || ''} autoComplete="off" autoCapitalize="off" maxLength={500} onChange={event => dispatch({type: correction ? 'correction-answer' : 'answer', questionId: q.id, value: event.target.value})}/>}
    </label>);
  }
  function questionPrompt(m:SampleMaterial,id:string){return nativeMaterial(m)?.task.prompt||gtTableContexts?.[m.id]?.questions.find(q=>q.id===id)?.prompt||tableContexts?.[m.id]?.questions.find(q=>q.id===id)?.prompt||m.questions?.find(q=>q.id===id)?.prompt}
  function modelQuestions(m:SampleMaterial){const native=nativeMaterial(m),table=tableFor(m.id);return <>{table&&<TaskTable options={gtFor(table.id)?.options} stimulus={table} answers={Object.fromEntries((m.questions||[]).map(q=>[q.id,q.accepted[0]]))} readOnly idPrefix={`${m.id}-model`}/>}<ol aria-label="示范题目">{m.questions?.map(q=><li key={q.id} id={`${m.id}-${q.id}`}>{questionPrompt(m,q.id)}</li>)}</ol>{native&&<ol className="sample-option-list" aria-label="完整选项">{native.task.options.map(option=><li key={option.id} lang="en">{option.id}. {option.text}</li>)}</ol>}</>}
  function references(m:SampleMaterial,originalAnswers?:Record<string,string>){if(gtFor(m.id))return <ol aria-label="答案与所选选项的反馈">{m.questions?.map(q=><li key={q.id}><p>{q.prompt}</p>{originalAnswers&&<p data-gt-option-feedback={q.id}>原答 {originalAnswers[q.id]||'空白'}：{gtTableOptionFeedback(m.id,q.id,originalAnswers[q.id]||'')}</p>}<p><strong lang="en">{q.accepted[0]}</strong>：{q.why}</p></li>)}</ol>;const native=nativeMaterial(m);return native?<><p>参考字母组：<strong lang="en">{m.questions?.[0].accepted[0]}</strong>。本站按完整字母组核对，不计算正式考试的部分得分，也不换算 IELTS Band。</p><ol className="sample-option-list">{native.task.options.map(option=><li key={option.id}><strong lang="en">{option.id}. {option.text}</strong><p>{option.reason}</p>{option.quotes.map(quote=><blockquote key={quote} lang="en">{quote}</blockquote>)}</li>)}</ol></>:<ol aria-label="示范答案与依据">{m.questions?.map(q=><li key={q.id} aria-describedby={`${m.id}-${q.id}`}><strong lang="en">{q.accepted[0]}</strong>：{q.why}</li>)}</ol>}
  const categoryChoice=<><div className="sample-row" aria-label="先选择考试类别">{(['academic','general-training'] as Variant[]).map(variant=><button type="button" key={variant} aria-pressed={state.variant===variant} onClick={()=>{setCategoryOpen(false);navigate({type:'select-variant',variant})}}>{variant==='academic'?'Academic':'General Training'}</button>)}</div><p className="sample-note">两类阅读与写作分别选材；切换类别会保留各自记录。</p></>;
  return <section className="ielts-sample-sequence" aria-label="雅思小任务练习">
    <style>{`.ielts-sample-sequence{max-width:900px;margin:auto;color:#203b4b;line-height:1.6;padding:20px;font-family:system-ui,sans-serif}.ielts-sample-sequence button,.ielts-sample-sequence input,.ielts-sample-sequence textarea,.ielts-sample-sequence select{font:inherit}.ielts-sample-sequence button{min-height:44px;border:1px solid #bdd4cc;background:#edf5f1;border-radius:9px;padding:9px 14px;cursor:pointer}.ielts-sample-sequence button:disabled{opacity:.5;cursor:default}.ielts-sample-sequence button:focus-visible{outline:3px solid #286954}.sample-row{display:flex;gap:10px;flex-wrap:wrap}.sample-lessons{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:18px 0}.sample-lessons [aria-current=page]{border:2px solid #286954}.sample-stage{padding:20px;border:1px solid #d9e2e5;border-radius:14px;margin:16px 0;background:white}.sample-steps{display:flex;gap:8px;flex-wrap:wrap;list-style:none;padding:0;font-size:13px}.sample-steps [aria-current=step]{font-weight:700;color:#286954}.sample-field{display:block;margin:14px 0}.sample-field input,.sample-field select,.sample-field textarea{font-size:16px;display:block;width:100%;box-sizing:border-box;padding:10px;border:1px solid #adbfc3;border-radius:8px;margin-top:6px;background:white}.sample-context{white-space:pre-wrap;margin:16px 0;padding:14px;border-left:4px solid #86aa9f;background:#f3f7f5}.ielts-sample-sequence summary{min-height:44px;display:flex;align-items:center;cursor:pointer;gap:8px}.ielts-sample-sequence summary::before{content:"＋"}.ielts-sample-sequence details[open]>summary::before{content:"−"}.sample-note{font-size:14px;color:#586e79}.sample-feedback{padding:14px;background:#f3f7f5;border-radius:10px;margin:12px 0}.sample-error{color:#852f24;background:#fff0ed;padding:12px;border-radius:9px}.sample-multi-select{border:0;padding:0;margin:18px 0;min-width:0}.sample-selection{display:flex;align-items:start;gap:12px;padding:12px;min-height:44px;border:1px solid #d9e2e5;border-radius:9px;margin:8px 0;cursor:pointer}.sample-selection input{width:18px;height:18px;flex:0 0 18px;margin:3px 0}.sample-option-list{padding-left:25px}.sample-option-list>li{margin:14px 0}.sample-option-list blockquote{font-size:14px;margin:8px 0}.sample-category,.sample-catalog,.sample-help{margin:12px 0}.sample-stage{overflow-wrap:anywhere}.sample-multi-select legend{font-weight:600}@media(max-width:600px){.sample-lessons{grid-template-columns:1fr 1fr}.ielts-sample-sequence{padding:12px}.sample-stage{padding:14px}}`}</style>
    <h2>{sampleSequence.title}</h2><p>{sampleSequence.notice}</p>
    {!guidedFlow||!state.variant?categoryChoice:<div className="sample-category"><button aria-expanded={categoryOpen} aria-controls="sample-category-choice" onClick={()=>setCategoryOpen(!categoryOpen)}>{categoryOpen?'收起类别选择':'切换考试类别'}</button>{categoryOpen&&<div id="sample-category-choice">{categoryChoice}</div>}</div>}
    {!state.variant?<p role="status">先选择类别，再选一个学习目标。</p>:<>
      <div className="sample-catalog"><button aria-expanded={catalogOpen} aria-controls="sample-lesson-catalog" onClick={()=>setCatalogOpen(!catalogOpen)}>{catalogOpen?'收起课程目录':`查看课程目录 · ${lessons.length} 课`}</button>{catalogOpen&&<nav id="sample-lesson-catalog" className="sample-lessons" aria-label="课程学习次序">{lessons.map(item=><button key={item.id} aria-current={state.lessonId===item.id?'page':undefined} onClick={()=>{setCatalogOpen(false);navigate({type:'open-lesson',lessonId:item.id})}}>{item.title}</button>)}</nav>}</div>
      <p className="sample-note">第 {stages.indexOf(session.stage)+1} / {stages.length} 步 · {stageNames[session.stage]}</p><ol className="sample-steps" aria-label="本课教学步骤">{stages.map((stage,index)=><li key={stage} aria-current={session.stage===stage?'step':undefined}>{index+1}. {stageNames[stage]}</li>)}</ol>
      {lesson && <article className="sample-stage"><h3 ref={stageHeading} tabIndex={-1} style={{scrollMarginTop:100}}>{lesson.title}</h3><p>{lesson.goal}</p>{lesson.id.startsWith('hub-')&&<p className="sample-note">{lesson.boundary}</p>}
        {session.stage === 'explain' && <><h4>先理解这一件事</h4>{(nativeLesson?[...nativeLesson.explanation,'按题干要求点选不同字母，也可直接填写字母答案。少选、多选、重复或范围外的字母，整组记为未匹配；首答会保留。']:lesson.explanation).map(text=><p key={text}>{text}</p>)}<button onClick={() => navigate({type: 'next'})}>看一个完整小示范</button></>}
        {session.stage === 'model' && material && <><h4>{material.title}</h4>{!nativeMaterial(material)&&<p>{material.instruction}</p>}
          {material.questions&&modelQuestions(material)}
          {context(material, true)}{audio}
          {material.modelNotes&&(!material.questions||!material.id.startsWith('hub-'))&&<section className="sample-coach-notes"><h5>教练步骤</h5>{material.modelNotes.map(note=><p key={note}>{note}</p>)}</section>}{material.questions?<><h5>答案与依据</h5>{references(material)}</>:<blockquote className="sample-context" lang="en">{material.model}</blockquote>}
          <button onClick={() => navigate({type: 'next'})}>带着方法试一次</button></>}
        {['guided', 'independent', 'timed', 'review'].includes(session.stage) && material && <>
          <h4>{material.title}</h4>
          {waitingForClock ? <><p>开始后再显示这份新材料。建议 {material.seconds} 秒，是本站小任务训练时长。</p><button onClick={() => dispatch({type: 'start-timed'})}>开始训练计时</button></> : <>
            {session.stage === 'timed' && <p role="timer">{Math.max(0, Math.ceil((material.seconds * 1000 - (now - (draft?.startedAt || now))) / 1000))} 秒剩余 · 超时仍保留作品，并标明超时。</p>}
            {!nativeMaterial(material)&&<p>{material.instruction}</p>}{context(material)}{audio}
            {session.stage === 'guided' ? <p className="sample-feedback">{material.hint}</p> : <><button type="button" onClick={() => dispatch({type: 'hint'})}>需要一个提示（本次记为借助提示）</button>{draft?.hinted && <div className="sample-feedback"><p>{material.hint}</p>{material.script && context(material, true)}</div>}<label className="sample-field"><input type="checkbox" style={{display: 'inline', width: 'auto', marginRight: 8}} checked={draft?.unseenConfirmed || false} onChange={event => dispatch({type: 'confirm-unseen', value: event.target.checked})}/>我此前没有接触过这份小材料</label></>}
            {material.questions ? answers(material) : <><label className="sample-field">留下你实际表达的文本／短段落<textarea rows={5} maxLength={4000} value={draft?.response || ''} onChange={event => dispatch({type: 'response', value: event.target.value})}/></label><p className="sample-note">{sampleWordCount(draft?.response || '')} 个词或数字（常见缩写算 1 项），计数仅作参考。原稿待人工核对，不评定质量或 Band。{lesson.skill === 'speaking' && '若文本与录音不同，以真实录音交给评阅者核验。'}</p></>}
            <button disabled={!canSubmit} onClick={() => {stopAudio(); dispatch({type: 'submit'});}}>记录原始作答</button>
            {!!draft?.submittedAt && <div className="sample-feedback" role="status"><p>这次作答已记录。{material.questions ? '原始答案保留，用于与反馈比较。' : '文本作品尚未人工评阅。'}</p>
              {session.stage==='guided'&&material.questions&&(gtFor(material.id)?references(material,draft?.answers):nativeMaterial(material)?<><p>{session.attempts.at(-1)?.matched?'整组匹配':'整组未匹配'}</p>{references(material)}</>:material.questions.map(q=><p key={q.id}>{q.prompt} → {q.accepted[0]}。{q.why}</p>))}
              {session.stage === 'review' && <><p>{delayedNames[receipt.delayed]}</p>{gtFor(material.id)?references(material,draft?.answers):nativeMaterial(material)?references(material):material.questions?.map(q => <p key={q.id}>{q.prompt} → {q.accepted[0]}。{q.why}</p>)}</>}
            </div>}
            {session.stage !== 'review' && <button disabled={!draft?.submittedAt} style={{marginTop: 12}} onClick={() => navigate({type: 'next'})}>{session.stage === 'guided' ? '撤掉提示，换新题' : session.stage === 'independent' ? '再换一份新材料，练计时' : '查看反馈，订正一处'}</button>}
          </>}
        </>}
        {session.stage === 'feedback' && <><h4>对照原始作答，修一个问题</h4>{session.attempts.filter(a => a.stage === 'independent' || a.stage === 'timed').map((attempt, index) => {
          const source = attempt.stage === 'independent' ? lesson.independent : lesson.timed;
          return <section className="sample-feedback" key={`${attempt.at}-${index}`}><h5>{source.title}</h5><p>记录时间：{new Date(attempt.at).toLocaleString()} · {attempt.hinted ? '用过提示' : '未用提示'} · {attempt.fresh ? '本地首次材料，学习者确认未见过' : '没有新材料证据'}{lesson.skill === 'listening' && ` · ${attempt.playbackCount} 次播放请求`}{attempt.withinTrainingTime !== null && ` · ${attempt.withinTrainingTime ? '建议时间内提交' : '超出建议时间'}`}</p>
            {context(source,true)}{tableFor(source.id)&&<TaskTable options={gtFor(source.id)?.options} stimulus={tableFor(source.id)!} answers={attempt.answers} readOnly idPrefix={`${source.id}-original-${index}`}/>} {source.questions?<><ol>{source.questions.map(q=><li key={q.id}><p>{questionPrompt(source,q.id)}</p><p>原答：<span lang="en">{attempt.answers[q.id]||'空白'}</span></p></li>)}</ol>{nativeMaterial(source)&&<p>{attempt.matched?'整组匹配':'整组未匹配'}</p>}{references(source,attempt.answers)}</>: <><blockquote lang="en">{attempt.response}</blockquote><p>只有文本和自查；四维评分及人工核验尚未完成。{lesson.skill === 'speaking' && '真实声音、发音及互动评价仍待音频核验。'}</p></>}

          </section>;
        })}<ul>{lesson.timed.checklist.map(check => <li key={check}>{check}</li>)}</ul>
          {lesson.timed.questions ? <section className="sample-correction"><h5>订正这份限时材料</h5>{context(lesson.timed,true)}{answers(lesson.timed,true)}</section> : <><p className="sample-note">{lesson.timed.instruction}</p><label className="sample-field">修改后的短段落<textarea rows={5} maxLength={4000} value={session.correctionResponse} onChange={event => dispatch({type: 'correction-response', value: event.target.value})}/></label><p className="sample-note">{sampleWordCount(session.correctionResponse)} 个词或数字（常见缩写算 1 项），计数仅作参考。订正原稿待人工核对，不评定质量或 Band。</p></>}
          <label className="sample-field">具体修了什么，或仍需要谁核验？<textarea rows={2} maxLength={4000} value={session.correctionNote} onChange={event => dispatch({type: 'correction-note', value: event.target.value})} placeholder="例如：把到达时间误写为开始时间；下次继续听 starts 后的信息。"/></label><button onClick={() => dispatch({type: 'save-correction'})}>保留订正，安排隔天新题</button>
        </>}
        {guidedFlow && nextLesson && session.stage === 'review' && (!material || !!draft?.submittedAt) && (now < receipt.reviewDueAt || !receipt.freshReviewAvailable) && <p><button onClick={() => navigate({type: 'open-lesson', lessonId: nextLesson.id})}>继续下一课 · {nextLesson.title}</button></p>}
        {session.stage === 'review' && !material && <><h4>留下间隔，再换新材料</h4><p>{delayedNames[receipt.delayed]}。最早复验时间：{receipt.reviewDueAt ? new Date(receipt.reviewDueAt).toLocaleString() : '完成订正后确定'}。</p>{(!guidedFlow || !!receipt.reviewDueAt && now >= receipt.reviewDueAt && receipt.freshReviewAvailable) && <button disabled={!receipt.reviewDueAt || now < receipt.reviewDueAt || !receipt.freshReviewAvailable} onClick={() => navigate({type: 'start-review'})}>打开一份没接触过的复验题</button>}</>}
        {session.stage === 'review' && !!draft?.submittedAt && (!guidedFlow || now >= receipt.reviewDueAt && receipt.freshReviewAvailable) && <p><button disabled={now < receipt.reviewDueAt || !receipt.freshReviewAvailable} onClick={() => navigate({type: 'start-review'})}>至少再隔 24 小时，换下一份材料</button></p>}
        {session.stage === 'review' && !receipt.freshReviewAvailable && <p className="sample-note">本课两份复验新题已接触过；继续复验需提供不同材料。原题重复可以学习，但不能增加新题保持证据。</p>}
        {lesson.skill === 'speaking' && !['explain', 'model'].includes(session.stage) && <section key={`${state.variant}-${lesson.id}`}><Recorder hideReference stopSignal={stages.indexOf(session.stage)} retentionLabel="录音在本课步骤间保留；切换课程、类别或刷新后清除"/><p className="sample-note">可在本课各步骤回听最近两遍。录音仅供回听；发音、流利度及互动仍需人工评价。录音不包含在进度备份中。</p></section>}
      </article>}
      <section aria-label="作答与订正记录"><button aria-expanded={historyOpen} aria-controls="sample-answer-history" onClick={()=>setHistoryOpen(!historyOpen)}>{historyOpen?'收起作答与订正':'查看作答与订正'} · {receipt.practiceCount} 次作答</button><div id="sample-answer-history" hidden={!historyOpen}>
        <p className="sample-note">{delayedNames[receipt.delayed]}。这里只回看已保存的内容，复验时间保持不变；开放作品仍待人工核对，不换算雅思分数。</p>
        {!session.attempts.length && <p>还没有已保存的作答。</p>}
        {session.attempts.map((attempt, index) => {
          const source = lesson && sampleMaterials(lesson).find(item => item.id === attempt.promptId);
          return <section className="sample-feedback" key={`${attempt.promptId}-${attempt.at}-${index}`} aria-label={`第 ${index + 1} 次作答记录`}>
            <h4>{index + 1}. {stageNames[attempt.stage]} · {source?.title || '历史题目'}</h4>
            <p className="sample-note">作答时间：{recordTime(attempt.at)} · {attempt.hinted ? '曾用提示' : '未用提示'} · {attempt.fresh ? '当时确认为未见过的材料' : '没有新材料证据'}{lesson?.skill === 'listening' && ` · ${attempt.playbackCount} 次播放请求，${attempt.playbackFailures} 次失败`}{attempt.elapsedMs !== null && ` · 训练用时 ${Math.ceil(attempt.elapsedMs / 1000)} 秒`}</p>
            {source && historyContext(source,attempt.answers,`${attempt.at}-${index}`)}
            {source?.questions ? <ol aria-label="原题与自己的作答">{source.questions.map(q => <li key={q.id}><p>{questionPrompt(source,q.id)}</p><p>我的原答：<span lang="en">{attempt.answers[q.id] || '未填写'}</span></p></li>)}</ol> : <><p>我的原稿：</p><blockquote className="sample-context" lang="en">{attempt.response || '未填写'}</blockquote></>}
          </section>;
        })}
        {lesson && session.attempts.some(attempt => attempt.stage === 'timed' && attempt.promptId === lesson.timed.id) && (session.correctedAt || Object.keys(session.correctionAnswers).length || session.correctionResponse || session.correctionNote) ? <section className="sample-feedback" aria-label="自己的订正">
          <h4>我的订正 · {lesson.timed.title}</h4><p className="sample-note">{session.correctedAt ? <>保存时间：{recordTime(session.correctedAt)}</> : '订正草稿 · 尚未保存'}</p>
          {historyContext(lesson.timed,session.correctionAnswers,'correction')}
          {lesson.timed.questions ? <ol aria-label="原题与自己的订正">{lesson.timed.questions.map(q => <li key={q.id}><p>{questionPrompt(lesson.timed,q.id)}</p><p>我的订正：<span lang="en">{session.correctionAnswers[q.id] || '未填写'}</span></p></li>)}</ol> : <blockquote className="sample-context" lang="en">{session.correctionResponse || '尚未留下订正文稿'}</blockquote>}
          {session.correctionNote && <p>我的修正说明：{session.correctionNote}</p>}
        </section> : null}
      </div></section>
    </>}
    {issue && <p className="sample-error" role="alert">{issue}</p>}
    <div className="sample-help"><button aria-expanded={helpOpen} aria-controls="sample-save-help" onClick={()=>setHelpOpen(!helpOpen)}>{helpOpen?'收起保存与练习说明':'查看保存与练习说明'}</button><p id="sample-save-help" hidden={!helpOpen} className="sample-note">这是本站原创的小练习，教学效果尚未经过专家与学习者实测。{persistenceNote || '这个独立预览仅临时保留文字记录，关闭或刷新后可能丢失。'}{lesson&&!lesson.id.startsWith('hub-')&&<><br/>本课练习范围：{nativeLesson?.boundary||lesson.boundary}</>}</p></div>
  </section>;
}
export default IELTSSampleSequence;
