'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Search} from 'lucide-react';
import type {NceBookId,State} from './model';
import type {GrammarStageId,GrammarUnit} from './grammar-curriculum-types';
import {grammarUnits,grammarStages,grammarPurposes,grammarPrerequisites,lessonsForGrammarUnit,lessonsForGrammarGuide,searchGrammarUnits,searchGrammarConcepts,grammarPracticeLink,guideBelongsToEntry} from './grammar-curriculum';
import {grammarProgressFor,grammarProgressKey,grammarProgressNeedsNewerVersion,updateGrammarProgress,markGrammarSeen,beginGrammarRound,setGrammarAnswer,showGrammarHint,revisitGrammarTheory,checkGrammarResponse,finishGrammarRound,grammarRoundQuestions,grammarProgressStatus,emptyGrammarResponse,type GrammarUnitProgress} from './grammar-curriculum-progress';
import {GrammarExplanation} from './grammar-explanation-ui';
import {grammarGuides,grammarLessonLabel} from './textbook-grammar';
import './grammar-curriculum.css';

export type GrammarCurriculumProps={
 state:State;update:(change:(state:State)=>State)=>void;
 onOpenLesson?:(book:NceBookId,lesson:number)=>void;
 onPracticeGuide?:(book:NceBookId,lesson:number,guideId:string,task?:{unitId:string;prompt:string;criteria:string[]})=>void;
 selectedUnit?:string;onSelectUnit?:(id:string)=>void;
};
const bookNames:Record<NceBookId,string>={NCE1:'第一册',NCE2:'第二册',NCE3:'第三册',NCE4:'第四册'};
const kindNames={recognise:'识别意思与结构',repair:'修正一个错误',produce:'在限定情境中造句'};

function GrammarUnitLesson({unit,props,select,preferredBook}:{unit:GrammarUnit;props:GrammarCurriculumProps;select:(id:string)=>void;preferredBook?:NceBookId}){
 const progress=grammarProgressFor(props.state,unit),[mode,setMode]=useState<'learn'|'practice'>(progress.inRound?'practice':'learn'),[position,setPosition]=useState(()=>progress.inRound?Math.max(0,grammarRoundQuestions(unit,progress.round).findIndex(q=>!progress.responses[q.id]?.checkedValue)):0);
 const heading=useRef<HTMLHeadingElement>(null),questions=grammarRoundQuestions(unit,progress.round),q=questions[position];
 const needsNewerVersion=grammarProgressNeedsNewerVersion(props.state.drafts[grammarProgressKey(unit.id)]);
 const response=progress.responses[q.id]||emptyGrammarResponse(),last=progress.attempts.at(-1),submitted=!progress.inRound&&last?.round===progress.round;
 const [references,setReferences]=useState<string[]>([]),[lessonsOpen,setLessonsOpen]=useState(false);
 const patch=(change:(p:GrammarUnitProgress)=>GrammarUnitProgress)=>props.update(state=>updateGrammarProgress(state,unit.id,change));
 useEffect(()=>{heading.current?.focus({preventScroll:true});if(mode==='practice')heading.current?.scrollIntoView({block:'start'})},[mode,position,submitted]);
 function begin(){patch(beginGrammarRound);setReferences([]);setPosition(0);setMode('practice')}
 function openTheory(){patch(revisitGrammarTheory);setMode('learn')}
 function saveAnswer(){
  patch(p=>{
   const checked=checkGrammarResponse(p,unit,q.id);
   return position===questions.length-1?finishGrammarRound(checked,unit):checked;
  });
  if(position<questions.length-1)setPosition(position+1);
 }
 const links=lessonsForGrammarUnit(unit);
 return <article className="grammar-unit-detail">
  <div className="grammar-unit-heading"><div><span className="eyebrow">单元 {unit.order}</span><h1 ref={heading} tabIndex={-1}>{unit.title}</h1></div><span className="grammar-status">{grammarProgressStatus(progress)}</span></div>
  <p className="grammar-unit-goal">学会后能做：{unit.goal}</p>
  {needsNewerVersion&&<p role="status" className="notice">这个单元的进度来自较新的版本。讲解仍可阅读，请使用较新版本继续练习；原记录已保留。</p>}
  {mode==='learn'&&<div className="grammar-exercise-start"><div><p>三题：识别、改错、造句。提示或回看讲解会记为跟练。</p></div><button className="btn" disabled={needsNewerVersion} onClick={begin}>{progress.inRound?'继续练习':progress.attempts.length?'再练一组':'开始练习'}<ArrowRight size={16}/></button></div>}
  {mode==='learn'&&<><div className="grammar-unit-prerequisites"><strong>建议先学</strong>{grammarPrerequisites(unit).length?grammarPrerequisites(unit).map(previous=><button key={previous.id} className="text-btn" onClick={()=>select(previous.id)}>{previous.title}<ArrowRight size={14}/></button>):<span>从这一个开始；先会辨认句子的主语。</span>}</div>
  <div className="grammar-unit-purposes">{unit.purposeIds.map(id=>{const p=grammarPurposes.find(p=>p.id===id)!;return <span key={id}>{p.title} · {p.context}</span>})}</div></>}
  {mode==='learn'?<>
   <section className="grammar-unit-explanation"><h3>先弄懂意思</h3>{unit.explanation.map(text=><p key={text}>{text}</p>)}</section>
   <section><h3>形式、意义与使用条件</h3><div className="grammar-form-list">{unit.forms.map(form=><div key={form.form}><strong>{form.form}</strong><p>{form.meaning}</p><p className="small muted">什么时候用：{form.useWhen}</p></div>)}</div></section>
   <section><h3>换一种表达，意思变在哪</h3><div className="grammar-contrast-list">{unit.contrasts.map(c=><div key={c.label}><h4>{c.label}</h4><div className="grammar-contrast-pair"><div><p lang="en">{c.a.en}</p><p>{c.a.zh}</p></div><div><p lang="en">{c.b.en}</p><p>{c.b.zh}</p></div></div><p className="grammar-contrast-why">{c.why}</p></div>)}</div></section>
   <section><h3>常见错误：先看哪里变了</h3><ul className="grammar-mistake-list">{unit.mistakes.map(m=><li key={m.wrong}><p><span>错例：</span><span lang="en">{m.wrong}</span></p><p><span>改为：</span><strong lang="en">{m.correct}</strong></p><p>{m.why}</p></li>)}</ul></section>
  </>:submitted?<section className="grammar-round-result" aria-label="本轮练习结果">
   <h3>{grammarProgressStatus(progress)}</h3><p>本轮三题已完成。识别题核对指定选项；改错和造句只核对本站参考表达，其他合理写法需进一步核对。</p>
   <ol>{questions.map(question=>{const answer=progress.responses[question.id],open=references.includes(question.id);return <li key={question.id}><strong>{kindNames[question.kind]} · {answer?.matched?'与参考一致':'与参考不同，待核对'}</strong><p>{question.prompt}</p><p>你的回答：<span lang="en">{answer?.checkedValue}</span></p><button className="btn secondary" aria-expanded={open} aria-controls={`grammar-reference-${question.id}`} onClick={()=>setReferences(ids=>open?ids.filter(id=>id!==question.id):[...ids,question.id])}>{open?'收起参考与解释':'查看参考与解释'}</button>{open&&<div id={`grammar-reference-${question.id}`} className="grammar-result-reference"><p lang="en">{question.answer}</p><p>{question.explanation}</p>{!!question.accepted?.length&&<p className="small">也接受：{question.accepted.join(' / ')}</p>}</div>}</li>})}</ol>
   <p className="small muted">首次通过只证明这一组题的表现。至少相隔 24 小时，换另一组题且无提示通过，才显示“延迟异题检验通过”；自由表达仍需核对。</p>
   <div className="row wrap"><button className="btn" onClick={begin}>换一组题重做<ArrowRight size={16}/></button><button className="btn secondary" onClick={openTheory}>回看讲解</button></div>
  </section>:<section className="grammar-progressive-practice" aria-label="三步语法练习">
   <div className="grammar-question-position"><span>第 {position+1} / 3 题 · {kindNames[q.kind]}</span><span>{progress.assisted?'本轮使用过帮助':'本轮尚未使用帮助'}</span></div>
   <h3>{q.prompt}</h3>
   {q.options?<fieldset className="grammar-question-options"><legend className="sr-only">选择你的答案</legend>{q.options.map(option=><label key={option}><input type="radio" name={`grammar-${q.id}`} checked={response.value===option} onChange={()=>patch(p=>setGrammarAnswer(p,unit,q.id,option))}/><span lang="en">{option}</span></label>)}</fieldset>:<label className="field">我的英文<textarea rows={3} maxLength={1000} spellCheck={false} value={response.value} onChange={e=>patch(p=>setGrammarAnswer(p,unit,q.id,e.target.value))} placeholder="先自己说一遍，再写下来"/></label>}
   {!!response.hintLevel&&<aside className="grammar-gradual-hint" role="status"><strong>提示 {response.hintLevel} / 2</strong>{q.hints.slice(0,response.hintLevel).map(hint=><p key={hint}>{hint}</p>)}</aside>}
   <div className="row wrap"><button className="btn" disabled={!response.value.trim()} onClick={saveAnswer}>{position===2?'提交本轮，核对三题':'记录这一题，下一步'}<ArrowRight size={16}/></button><button className="btn secondary" disabled={response.hintLevel>=2} onClick={()=>patch(p=>showGrammarHint(p,unit,q.id))}>{response.hintLevel?'再给一点帮助':'先给一点提示'}</button></div>
   <div className="grammar-question-back"><button className="text-btn" onClick={openTheory}>回看讲解（本轮记为跟练）</button>{position>0&&<button className="text-btn" onClick={()=>setPosition(position-1)}>← 修改上一题</button>}</div>
   <p className="small muted">提交整轮前先保留自己的答案。中途离开或刷新可继续；任何提示都会随本轮保存。</p>
  </section>}
  {(mode==='learn'||submitted)&&<><section className="grammar-transfer-task"><h3>再用到自己的情况</h3><p>{unit.transfer.prompt}</p><ul>{unit.transfer.criteria.map(c=><li key={c}>{c}</li>)}</ul><p className="small muted">选择一个知识点，先跟着示范练，再换成自己的情境。开放表达需要自行核对或请老师反馈。</p>
   {props.onPracticeGuide?<div className="grammar-transfer-links">{unit.guideIds.map(id=>{const link=grammarPracticeLink(unit,id,preferredBook);return link&&<button className="btn secondary" key={id} onClick={()=>{patch(revisitGrammarTheory);props.onPracticeGuide?.(link.book,link.lesson,id,{unitId:unit.id,...unit.transfer})}}>{grammarGuides[id].title}<ArrowRight size={15}/></button>})}</div>:<p className="small muted">可结合下方相关课文练习。</p>}
  </section>
  <section className="grammar-linked-lessons"><button className="btn secondary" aria-expanded={lessonsOpen} aria-controls={`grammar-lessons-${unit.id}`} onClick={()=>setLessonsOpen(!lessonsOpen)}>{lessonsOpen?'收起相关课文':'查看相关课文'}</button><p>可结合以下课文复习。本页讲解与例句由本站编写。</p>{lessonsOpen&&<div id={`grammar-lessons-${unit.id}`}>{links.map(link=><button key={`${link.book}-${link.lesson}`} disabled={!props.onOpenLesson} className="text-btn" onClick={()=>{patch(revisitGrammarTheory);props.onOpenLesson?.(link.book,link.lesson)}}>{bookNames[link.book]} · 第 {link.lesson}{link.lastLesson!==link.lesson?`–${link.lastLesson}`:''} 课<span>{link.guideIds.map(id=>grammarGuides[id].title).join('；')}</span></button>)}</div>}</section>
  <section className="grammar-ielts-use"><h3>这些表达能用在哪里</h3>{unit.purposeIds.map(id=>{const p=grammarPurposes.find(p=>p.id===id)!;return <p key={id}><strong>{p.title}：</strong>{p.ieltsUse}。</p>})}<p className="small muted">用途是本站练习建议；不是 IELTS 官方考纲、题目保证或成绩预测。</p></section></>}
 </article>;
}

export function GrammarCurriculum(props:GrammarCurriculumProps){
 const [query,setQuery]=useState(''),[stage,setStage]=useState<GrammarStageId|''>(''),[purpose,setPurpose]=useState(''),[book,setBook]=useState<NceBookId|''>(''),[selected,setSelected]=useState(props.selectedUnit||''),[concept,setConcept]=useState('');
 const [view,setView]=useState<'units'|'concepts'>('units');
 const heading=useRef<HTMLHeadingElement>(null),indexEntry=useRef<HTMLButtonElement>(null);
 const conceptButtons=useRef(new Map<string,HTMLButtonElement>()),unitButtons=useRef(new Map<string,HTMLButtonElement>());
 const catalogPosition=useRef({top:0,id:''}),indexPosition=useRef({top:0,id:''});
 const navigation=useRef<{kind:'heading'|'catalog'|'index'}|null>(null);
 useEffect(()=>{if(props.selectedUnit!==undefined)setSelected(props.selectedUnit)},[props.selectedUnit]);
 useEffect(()=>{
  if(!navigation.current)return;
  const frame=requestAnimationFrame(()=>{
   const next=navigation.current;navigation.current=null;
   if(next?.kind==='index'){
    window.scrollTo({top:indexPosition.current.top,behavior:'instant'});
    (conceptButtons.current.get(indexPosition.current.id)||heading.current)?.focus({preventScroll:true});
   }else if(next?.kind==='catalog'){
    window.scrollTo({top:catalogPosition.current.top,behavior:'instant'});
    (unitButtons.current.get(catalogPosition.current.id)||indexEntry.current||heading.current)?.focus({preventScroll:true});
   }else if(next){heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView({block:'start',behavior:'instant'})}
  });
  return()=>cancelAnimationFrame(frame);
 },[selected,concept,view]);
 const units=searchGrammarUnits({query,stageId:stage||undefined,purposeId:purpose||undefined,book:book||undefined});
 const active=grammarUnits.find(unit=>unit.id===selected),conceptEntry=concept?lessonsForGrammarGuide(concept).find(e=>!book||e.book===book):undefined;
 const concepts=searchGrammarConcepts(query,stage||undefined).filter(c=>(!purpose||grammarUnits.some(u=>u.guideIds.includes(c.id)&&u.purposeIds.includes(purpose)))&&(!book||lessonsForGrammarGuide(c.id).some(e=>e.book===book)));
 function leaveCurrent(){if(active)props.update(state=>updateGrammarProgress(state,active.id,revisitGrammarTheory))}
 function select(id:string){if(!active)catalogPosition.current={top:window.scrollY,id};leaveCurrent();setSelected(id);setConcept('');props.update(state=>updateGrammarProgress(state,id,markGrammarSeen));props.onSelectUnit?.(id)}
 function openIndex(){catalogPosition.current={top:window.scrollY,id:''};navigation.current={kind:'heading'};setView('concepts')}
 function openConcept(id:string){indexPosition.current={top:window.scrollY,id};navigation.current={kind:'heading'};setConcept(id)}
 const filters=<div className="grammar-curriculum-filters"><label className="grammar-curriculum-search"><Search size={17}/><input aria-label="搜索语法主线" value={query} onChange={e=>setQuery(e.target.value)} placeholder="用法、表达用途、英文例句或 NCE1 第57课"/></label><label>学习阶段<select aria-label="筛选学习阶段" value={stage} onChange={e=>setStage(e.target.value as GrammarStageId|'')}><option value="">全部阶段</option>{grammarStages.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></label><label>表达用途<select aria-label="筛选表达用途" value={purpose} onChange={e=>setPurpose(e.target.value)}><option value="">全部用途</option>{grammarPurposes.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label><label>关联教材<select aria-label="筛选关联教材" value={book} onChange={e=>setBook(e.target.value as NceBookId|'')}><option value="">四册全部</option>{Object.entries(bookNames).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label></div>;
 const clearFilters=()=>{setQuery('');setStage('');setPurpose('');setBook('')};
 return <section className="grammar-curriculum" aria-label="语法知识主线与表达用途">
  {active?<><button className="text-btn grammar-curriculum-back" onClick={()=>{navigation.current={kind:'catalog'};leaveCurrent();setSelected('');props.onSelectUnit?.('')}}><ArrowLeft size={16}/>返回主线与筛选结果</button><GrammarUnitLesson key={active.id} unit={active} props={props} select={select} preferredBook={book||undefined}/></>:conceptEntry?<>
   <button className="text-btn grammar-curriculum-back" onClick={()=>{navigation.current={kind:'index'};setConcept('')}}><ArrowLeft size={16}/>返回知识点索引</button>
   <div className="grammar-existing-detail"><header className="grammar-curriculum-heading"><span className="eyebrow">语法知识点</span><h1 ref={heading} tabIndex={-1}>{grammarGuides[concept].title}</h1></header><p className="small muted">相关课文：{bookNames[conceptEntry.book]} · {grammarLessonLabel(conceptEntry)}</p><GrammarExplanation key={concept} entry={conceptEntry} initialGoal={concept} onPractice={props.onPracticeGuide?(id=>{if(guideBelongsToEntry(conceptEntry,id))props.onPracticeGuide?.(conceptEntry.book,conceptEntry.lesson,id)}):undefined}/></div>
  </>:view==='concepts'?<>
   <button className="text-btn grammar-curriculum-back" onClick={()=>{navigation.current={kind:'catalog'};setView('units')}}><ArrowLeft size={16}/>返回语法主线</button>
   <header className="grammar-curriculum-heading"><h1 ref={heading} tabIndex={-1}>语法知识点索引</h1><p>按知识点查阅讲解与例句；需要练习时，可进入对应语法单元。</p></header>
   {filters}<p role="status" className="grammar-curriculum-count">找到 {concepts.length} 个知识点</p>
   <div className="grammar-concept-index">{concepts.map(c=><button key={c.id} ref={node=>{if(node)conceptButtons.current.set(c.id,node);else conceptButtons.current.delete(c.id)}} onClick={()=>openConcept(c.id)}><strong>{c.guide.title}</strong><small>{c.stage.title}</small><ArrowRight size={16}/></button>)}</div>
   {!concepts.length&&<div className="panel empty"><p>没有匹配的知识点。</p><button className="btn secondary" onClick={clearFilters}>清除筛选</button></div>}
  </>:<>
   <header className="grammar-curriculum-heading"><span className="eyebrow">从句子骨架到自己的表达</span><h1 ref={heading} tabIndex={-1}>语法主线</h1><p>先看想完成什么表达，再找需要的用法。</p><button ref={indexEntry} className="btn secondary grammar-index-entry" onClick={openIndex}><BookOpen size={17}/>查阅语法知识点<ArrowRight size={16}/></button></header>
   {filters}<p role="status" className="grammar-curriculum-count">找到 {units.length} 个语法单元</p>
   {!units.length&&<div className="panel empty"><p>没有同时匹配这些条件的语法单元。</p><button className="btn secondary" onClick={clearFilters}>清除筛选</button></div>}
   {grammarStages.filter(s=>!stage||s.id===stage).map(s=>{const members=units.filter(unit=>unit.stageId===s.id);return members.length?<section className="grammar-curriculum-stage" key={s.id}><h2>{s.title}</h2><p>{s.description}</p><ol>{members.map(unit=><li key={unit.id}><button ref={node=>{if(node)unitButtons.current.set(unit.id,node);else unitButtons.current.delete(unit.id)}} onClick={()=>select(unit.id)}><span className="grammar-unit-order">{unit.order}</span><span><strong>{unit.title}</strong><small>{unit.goal}</small><small>先修：{grammarPrerequisites(unit).map(u=>u.title.split('：')[0]).join('、')||'从这里开始'} · {grammarProgressStatus(grammarProgressFor(props.state,unit))}</small></span><ArrowRight size={17}/></button></li>)}</ol></section>:null})}
  </>}
 </section>;
}
