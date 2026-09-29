'use client';
import {ArrowRight,BookOpen,Headphones,RotateCcw,Volume2} from 'lucide-react';
import type {State,NceBookId} from './model';
import {day} from './model';
import {navigate} from './navigation';
import {useRoute} from './use-route';
import {bookNames,studyUnit,dueUnits} from './study-path';
import {grammarEntries,grammarEntryFor,grammarPrintedPage} from './textbook-grammar';
import {GrammarExplanation} from './grammar-explanation-ui';
import {ExpressionFeedback} from './expression-feedback-ui';
import {Recorder,speak} from './learning';
import {WordText} from './word-lookup';
import {transferPrompts} from './learning-transfer';
import {learningFor,lessonGoals,emptyGoal,updateLearning,updateGoal,goalStatus,goalQuestion,answerMatches,recordCheck,nextReviewRound,dueLearningGoals,learningSummary,nextLearning,type LearningPhase,type GoalRecord} from './learning-plan';
import './learning-plan.css';

type Props={book:NceBookId;lesson:number;state:State;update:(fn:(state:State)=>State)=>void};
export function LessonGoals({book,lesson,state}:Omit<Props,'update'>){
 const {goals,record}=learningSummary(state,book,lesson);
 return <details className="learning-goals"><summary><span>本课学什么</span><strong>{goals.map(g=>g.title).join(' · ')}</strong></summary><ul>{goals.map(g=><li key={g.id}><div><strong>{g.title}</strong><p>{g.idea}</p></div><span>{goalStatus(record.goals[g.id]||emptyGoal())}</span></li>)}</ul><p className="small muted">练习通过表示与本站参考表达一致；隔天换题再检验，自己的表达另行核对。</p></details>;
}
export function ListeningNext({book,lesson,state,update}:Props){
 const record=learningFor(state,book,lesson);
 return <section className="learning-next"><div><strong>合上课文，试着说清大意</strong><p className="muted small">谁在做什么？关键变化是什么？说不清的句子再听一遍。</p></div><button className="btn" onClick={()=>{update(s=>updateLearning({...s,days:[...new Set([...s.days,day()])]},book,lesson,r=>({...r,listened:true})));navigate({view:'nce',book,lesson,tab:'grammar'})}}>{record.listened?'继续学本课用法':'我已试着概括，学本课用法'}<ArrowRight size={16}/></button></section>;
}
export function LearningTeaching({book,lesson}:Pick<Props,'book'|'lesson'>){
 const entry=grammarEntryFor(book,lesson);
 if(!entry)return null;
 return <section className="panel learning-teaching"><GrammarExplanation key={entry.id} entry={entry} onPractice={goal=>navigate({view:'nce',book,lesson,tab:'practice',goal,practice:'model'})}/><div className="learning-next"><p className="small muted">本站讲解对应{studyUnit(book,lesson).label} · 原书第 {grammarPrintedPage(book,entry.sections[0].page)} 页</p></div><button className="text-btn" onClick={()=>navigate({view:'grammar',book,lesson:entry.lesson})}><BookOpen size={16}/>查原书与本册目录</button></section>;
}
export function LearningPractice({book,lesson,state,update}:Props){
 const route=useRoute(),unit=studyUnit(book,lesson),goals=lessonGoals(book,lesson),record=learningFor(state,book,lesson);
 const guide=goals.find(g=>g.id===(route.goal||record.goal))||goals[0];
 if(!guide)return <p className="notice">本课讲解暂未就绪，请先回到课文。</p>;
 const goal=record.goals[guide.id]||emptyGoal(),phase=route.practice||record.phase,variant=goal.round%3,question=goalQuestion(guide,variant);
 const checked=!!goal.answer.trim()&&goal.checked===goal.answer,matched=checked&&answerMatches(goal.answer,question.answer),due=goal.dueAt>0&&goal.dueAt<=Date.now();
 const summary=learningSummary(state,book,lesson),index=goals.indexOf(guide);
 function patch(fn:(goal:GoalRecord)=>GoalRecord){update(s=>updateGoal(s,book,lesson,guide.id,fn))}
 function move(next:LearningPhase,id=guide.id){if(id===guide.id&&next==='model'&&(phase==='independent'||phase==='review'))patch(g=>({...g,hinted:true}));update(s=>updateLearning(s,book,lesson,r=>({...r,goal:id,phase:next})));navigate({view:'nce',book,lesson,tab:'practice',goal:id,practice:next},{scrollTarget:'learning-practice'})}
 function check(){if(!goal.answer.trim()||checked)return;const at=Date.now();patch(g=>({...recordCheck(g,{at,variant,matched:answerMatches(g.answer,question.answer),hinted:g.hinted}),checked:g.answer}));update(s=>({...s,days:[...new Set([...s.days,day()])]}))}
 const phases=[['model','跟着做'],['independent','独立试'],['transfer','自己用']] as const;
 return <section className="panel learning-practice" id="learning-practice" aria-label="本课目标练习">
  <div className="section-top"><div><span className="eyebrow">本课要点 {index+1} / {goals.length}</span><h2>{guide.title}</h2></div><span className="pill">{goalStatus(goal)}</span></div>
  {goals.length>1&&<nav className="learning-goal-tabs" aria-label="选择要练的用法">{goals.map((g,i)=><button key={g.id} aria-pressed={g.id===guide.id} onClick={()=>move(record.goals[g.id]?.worked?'independent':'model',g.id)}>{i+1}. {g.title}</button>)}</nav>}
  <nav className="learning-phases" aria-label="练习步骤">{phases.map(([id,label],i)=><button key={id} aria-current={phase===id?'step':undefined} onClick={()=>move(id)}><span>{i+1}</span>{label}</button>)}{phase==='review'&&<span className="learning-review-phase">隔天检验</span>}</nav>
  {phase==='model'&&<div className="learning-stage"><h3>先理解为什么这样说</h3><p>{guide.idea}</p><div className="learning-pattern">{guide.pattern}</div><div className="learning-example"><WordText text={guide.examples[0].en} exampleTranslation={guide.examples[0].zh}/><p>{guide.examples[0].zh}</p><p className="muted">{guide.examples[0].note}</p><button className="text-btn" onClick={()=>speak(guide.examples[0].en)}><Volume2 size={17}/>听示范 · 设备朗读</button></div><p className="learning-tip">{guide.pitfall}</p><p>读一遍例句，指出哪一部分用了本课句型，再合上提示试一句。</p><button className="btn" onClick={()=>{patch(g=>({...g,worked:true}));move('independent')}}>合上示范，自己试<ArrowRight size={16}/></button></div>}
  {(phase==='independent'||phase==='review')&&<div className="learning-stage">
   {phase==='review'&&due&&goal.checked?<><h3>隔一段时间，换一句试试</h3><p>上次的答案已经保存。这次先不看句型和参考，看看还能不能自己说出来。</p><button className="btn" onClick={()=>patch(nextReviewRound)}>开始新的检验<ArrowRight size={16}/></button></>:<>
    <h3>{phase==='review'?'回想这个用法':'先不看提示，自己表达'}</h3><p className="learning-prompt">{question.prompt}</p>
    <label className="field">我的英文<textarea rows={3} maxLength={4000} autoCapitalize="sentences" spellCheck={false} value={goal.answer} onChange={e=>patch(g=>({...g,answer:e.target.value}))} placeholder="先说一遍，再写下你的表达"/></label>
    <div className="row wrap"><button className="btn" disabled={!goal.answer.trim()||checked} onClick={check}>{checked?'已核对这一版':'核对我的表达'}</button><button className="text-btn" disabled={goal.hinted} onClick={()=>patch(g=>({...g,hinted:true}))}>{goal.hinted?'本轮已使用提示':'卡住了，看句型提示'}</button></div>
    {goal.hinted&&<aside className="learning-hint"><strong>先搭句架</strong><p>{guide.pattern}</p><p>{guide.pitfall}</p><details><summary>再看参考表达</summary><p lang="en">{question.answer}</p><p>{question.explanation}</p></details><p className="small muted">本轮记为使用提示；换一道题时可重新独立尝试。</p></aside>}
    {checked&&<div className="learning-result" role="status"><strong>{matched?goal.hinted?'借助提示，与参考表达一致':'与参考表达一致':'与参考不同，先核对这一处'}</strong><p>{matched?question.explanation:'表达可能有其他正确说法。先核对是否表达了题目全部意思，再看句型和动词形式；这里不会把不同说法自动判错。'}</p>{!matched&&<ExpressionFeedback text={goal.answer} context={{minimum:2}}/>}<p className="small muted">已安排 {new Date(goal.dueAt).toLocaleDateString('zh-CN')} 换题复习。这里只核对本题，不代表已掌握整课。</p><div className="row wrap"><button className="btn" onClick={()=>move('transfer')}>换成自己的情况<ArrowRight size={16}/></button><button className="text-btn" onClick={()=>patch(nextReviewRound)}>再换一句试试</button></div></div>}
   </>}
  </div>}
  {phase==='transfer'&&<div className="learning-stage"><h3>用这个用法，说自己的事</h3><p className="learning-prompt">{transferPrompts[guide.id]}</p><p className="muted small">先说再写。按上面的任务表达，先写核心意思，再补具体细节。</p><label className="field">我的表达<textarea rows={4} maxLength={4000} value={goal.transfer} onChange={e=>patch(g=>({...g,transfer:e.target.value}))} placeholder="把课本用法换成自己的情况"/></label><details className="learning-recording"><summary>想听听自己说得怎样？录一遍（可选）</summary><Recorder/></details><button className="btn" disabled={!goal.transfer.trim()} onClick={()=>patch(g=>({...g,checkedTransfer:g.transfer}))}>检查这一版文字</button>{goal.checkedTransfer&&goal.checkedTransfer===goal.transfer&&<><ExpressionFeedback text={goal.transfer} context={{minimum:3,source:guide.examples.map(e=>e.en).join(' ')}}/><p className="learning-tip">自由表达已保存 · 待核对。可对照本课讲解，或请老师核对意思、用法和发音。</p><div className="row wrap">{index<goals.length-1?<button className="btn" onClick={()=>move('model',goals[index+1].id)}>练下一个要点<ArrowRight size={16}/></button>:<button className="btn" onClick={()=>navigate({view:'today'})}>保存这一轮，回到学习页<ArrowRight size={16}/></button>}</div></>}</div>}
  <details className="learning-help"><summary>遇到困难，回到对应的地方</summary><div className="learning-help-options">{[['听不清','回听课文原声'],['不理解','查看完整讲解'],['不会搭句','回看句架和例句'],['表达不顺','先保留一句，再补一个细节']].map(([id,label],i)=><button key={id} aria-pressed={goal.difficulty===id} onClick={()=>{patch(g=>({...g,difficulty:id}));if(i<2)navigate({view:'nce',book,lesson:unit.first,tab:i===0?'listen':'grammar'});else if(i===2)move('model')}}><strong>{id}</strong><span>{label}</span></button>)}</div>{goal.difficulty==='表达不顺'&&<p>先写“谁 + 做什么”，把时间、地点或原因一次加一个。读给自己听，先修正最影响理解的一处。</p>}</details>
  {summary.practiced&&<p className="learning-round-done">本课各要点都已尝试 · {summary.checked} / {goals.length} 个要点有独立核对记录。隔天复习会出现在「学习」和「复习」中。</p>}
 </section>;
}
export function LearningToday({state}:{state:State}){
 const next=nextLearning(state),unit=studyUnit(next.book,next.lesson),goals=lessonGoals(next.book,next.lesson),guide=goals.find(g=>g.id===next.goal)||goals[0],summary=learningSummary(state,next.book,next.lesson);
 return <section className="panel today-course learning-today"><div><span className="eyebrow">{next.review?'今天先巩固':'接着上次继续'} · 一次练一个要点</span><h2>{next.review?'隔天换一句，还能说出来吗？':next.tab==='listen'?'先听懂这一课':summary.practiced?'这一轮已留下练习记录':'把本课用法变成自己的表达'}</h2><p>{bookNames[next.book]} · {unit.label}{guide?` · ${guide.title}`:''}</p><p className="muted small">{next.review?'先回想，再看提示。检验结果会决定下一次复习时间。':next.tab==='listen'?'先听原声，说出大意；再学用法、自己练习。':summary.practiced?'今天可以休息，也可以继续下一课。到期的要点会自动排到这里。':'从已保存的位置继续；写到一半也会保留。'}</p></div><button className="btn" onClick={()=>navigate({view:'nce',book:next.book,lesson:next.lesson,tab:next.tab,goal:next.goal,practice:next.practice})}>{next.review?<RotateCcw size={17}/>:<ArrowRight size={17}/>} {next.review?'开始这次复习':'继续学习'}</button></section>;
}
export function LearningReviews({state}:{state:State}){
 const due=dueLearningGoals(state),legacy=dueUnits(state).filter(unit=>!due.some(item=>item.entry.book===unit.book&&item.entry.lesson===unit.first));
 const upcoming=grammarEntries.flatMap(entry=>{const r=learningFor(state,entry.book,entry.lesson);return Object.values(r.goals).filter(g=>g.dueAt>Date.now()).map(g=>g.dueAt)}).sort((a,b)=>a-b)[0];
 return <section className="panel learning-review-queue"><div className="section-top"><h2>本课用法 · {due.length} 个到期</h2><RotateCcw size={20}/></div><p className="muted small">先做一题回想，再处理下面的生词。第一次核对后隔天再练，后续按表现安排间隔。</p>{due.length?<ul>{due.map(({entry,guide,goal})=><li key={`${entry.id}-${guide.id}`}><div><strong>{guide.title}</strong><p className="small muted">{bookNames[entry.book]} · {studyUnit(entry.book,entry.lesson).label} · {goalStatus(goal)}</p></div><button className="btn secondary" onClick={()=>navigate({view:'nce',book:entry.book,lesson:entry.lesson,tab:'practice',goal:guide.id,practice:'review'})}>回想这一题<ArrowRight size={16}/></button></li>)}</ul>:<p>{upcoming?`本轮没有到期要点。下一次：${new Date(upcoming).toLocaleDateString('zh-CN')}。`:'还没有到期要点。完成课内独立练习后，会在这里安排复习。'}</p>}{legacy.length>0&&<details><summary>以前安排的整课自查 · {legacy.length} 组</summary>{legacy.map(unit=><button className="text-btn" key={unit.key} onClick={()=>navigate({view:'nce',book:unit.book,lesson:unit.first,tab:'notes'})}>{bookNames[unit.book]} · {unit.label}<ArrowRight size={15}/></button>)}</details>}</section>;
}
export function LearningRecords({state}:{state:State}){
 const records=grammarEntries.map(entry=>({entry,summary:learningSummary(state,entry.book,entry.lesson)})).filter(({summary})=>summary.record.listened||Object.keys(summary.record.goals).length);
 return <section className="panel learning-records"><h2>课内练习与检验 · {records.length} 组</h2><p className="muted small">记录分开显示：跟练、独立核对、不同日期换题核对、自由表达待核对。旧的完成勾选仍保留在各课。</p>{records.length?<details><summary>查看每课记录</summary>{records.map(({entry,summary})=><div className="record-row" key={entry.id}><button className="text-btn" onClick={()=>navigate({view:'nce',book:entry.book,lesson:entry.lesson,tab:'practice'})}>{bookNames[entry.book]} · {studyUnit(entry.book,entry.lesson).label}</button><span>独立 {summary.checked}/{summary.goals.length} · 间隔检验 {summary.stable}/{summary.goals.length}</span></div>)}</details>:<p>先从一课开始，练习内容会自动记录。</p>}</section>;
}
