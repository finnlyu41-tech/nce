'use client';
import {useEffect,useState} from 'react';
import {useMovingSelection} from '@/lib/use-moving-selection';
import {ArrowRight,ArrowLeft,Volume2,Check} from 'lucide-react';
import {toast} from 'sonner';
import {type State,type NceBookId,wordCount} from './model';
import type {LanguageRow} from './language';
import {guideFor,readGuide,sentenceFor,transferCheck,type GuideDraft} from './expression-guide';
import {expressionFeedback} from './expression-feedback';
import {ExpressionFeedback} from './expression-feedback-ui';
import {WordText} from './word-lookup';
import {Recorder,speak} from './learning';
import {PlaybackSpeed} from './playback-speed';
import {navigate} from './navigation';
import {useRoute} from './use-route';
import {queueExpressionReview} from './study-path';

const repairs=[
 ['meaning','不知道说什么','先用中文写“谁、做什么、一个细节”，再只说第一句。'],
 ['pause','一句话反复停顿','把一句分成两小段，每段慢读两遍，再连起来；熟悉后恢复自然语速。'],
 ['tense','时态前后不一致','圈出时间词。过去的经历检查 was / went / did；现在的习惯检查一般现在时。'],
 ['words','词语或搭配不确定','回到原句查这个词，把短语作为一个整体，再换一个内容造句。'],
 ['sound','一个词听不清或读不清','点词看音标，听原声，再录一次，只比较这个词。'],
];
const names=['听懂一句','拆开搭句','自己表达','反馈与重练','换情境检验'];
export function GuidedExpression({book,lesson,rows,state,update,listen}:{book:NceBookId;lesson:number;rows:LanguageRow[];state:State;update:(fn:(s:State)=>State)=>void;listen:()=>void}){
 const stepsRef=useMovingSelection<HTMLElement>('[aria-current="step"]');
 const route=useRoute(),key=`expression-${book}-${lesson}`,draft=readGuide(state.drafts[key]);
 const {frame,source,level,excerpt,prompts,goal}=guideFor(rows,book),step=route.step??draft.step;
 const [hint,setHint]=useState<'full'|'keywords'|'none'>('none');
 useEffect(()=>setHint('none'),[step]);
 const patch=(change:Partial<GuideDraft>)=>update(s=>{
  const changedContent=['meaning','keywords','selected','answer','retry'].some(field=>field in change);
  return {...s,drafts:{...s.drafts,[key]:JSON.stringify({...readGuide(s.drafts[key]),...(changedContent?{checkpointAt:0,checkChoice:'',checkMarked:false,checkedTransfer:'',saved:false}:{}),...change})}};
 });
 function go(next:number,change:Partial<GuideDraft>={}){
  if(next===step)return;
  // Give the previous history entry its own step before changing the draft.
  if(route.step===undefined)navigate({...route,step},{replace:true,keepScroll:true});
  patch({...change,step:next});
  navigate({view:'nce',book,lesson,tab:'notes',step:next},{keepScroll:true,scrollTarget:'expression-task'});
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   document.getElementById('expression-stage-title')?.focus({preventScroll:true});
  }));
 }
 const sentence=sentenceFor(frame,draft.selected),translation=sentenceFor(frame,draft.selected,true);
 const context={source:excerpt.en,extend:book!=='NCE1',target:frame.id},challenge=transferCheck(frame,lesson,draft.checkRound);
 const canSave=!!draft.meaning.trim()&&!!draft.keywords.trim()&&wordCount(draft.answer)>=3&&wordCount(draft.retry)>=3&&draft.checkedRetry===draft.retry&&draft.checkMarked&&wordCount(draft.transfer)>=3&&draft.checkedTransfer===draft.transfer;
 const sessionSaved=draft.saved&&draft.checkpointAt>0;
 const ready=[!!draft.meaning.trim(),!!draft.keywords.trim(),wordCount(draft.answer)>=3,wordCount(draft.retry)>=3&&draft.checkedRetry===draft.retry,canSave][step];
 const next=()=>{
  if(step===2){go(3,{checkedAnswer:draft.answer,retry:draft.retry||draft.answer,checkedRetry:'',saved:false});return;}
  go(step+1);
 };
 const startCheck=()=>patch({checkRound:draft.checkRound+1,checkChoice:'',checkMarked:false,previousTransfer:draft.transfer||draft.previousTransfer,transfer:'',checkedTransfer:'',checkpointAt:0,checkpointCorrect:false,saved:false});
 function save(){
  const now=Date.now(),form=frame.form.replace(/\{(\d+)\}/g,(_,i)=>`（${frame.slots[Number(i)].label}）`);
  update(s=>queueExpressionReview({...s,drafts:{...s.drafts,[key]:JSON.stringify({...readGuide(s.drafts[key]),saved:true,category:frame.name,form,source:excerpt.en,checkpointAt:now,checkpointCorrect:draft.checkChoice===challenge.answer&&expressionFeedback(draft.transfer,context).length===0,step:4})}},book,lesson,now));
  toast.success('已保存检验与表达卡片，明天从今日学习继续');
 }
 if(!source)return <section className="panel"><h3>先打开本课教材</h3><p>本课原句载入后，这里会生成表达步骤。你已经写的内容会保留。</p><button className="btn" onClick={listen}>打开教材听读</button></section>;
 return <section className="panel guided-expression" id="expression-task">
  <div className="section-top"><div><span className="eyebrow">第 {lesson} 课 · {frame.name}</span><h2 id="expression-stage-title" tabIndex={-1}>{names[step]}</h2></div><span className="pill">{step+1} / 5</span></div>
  <p className="guide-goal">今天练成：{goal}。</p>
  <nav ref={stepsRef} className="guide-steps" aria-label="表达练习步骤">{names.map((name,i)=><button key={name} className={i===step?'active':''} onClick={()=>go(i)} aria-current={i===step?'step':undefined}>{i+1}<span>{name}</span></button>)}</nav>
  <label className="guide-mobile-jump">当前步骤<select aria-label="切换表达步骤" value={step} onChange={e=>go(Number(e.target.value))}>{names.map((name,i)=><option value={i} key={name}>{i+1} / 5 · {name}</option>)}</select></label>
  {step===0&&<div className="guide-stage">
   <p>先听这一句，写下你理解的意思；卡住时再打开参考。</p>
   <details className="practice-reference"><summary>听后看原句与中文参考</summary><blockquote><WordText text={excerpt.en} exampleTranslation={excerpt.zh}/><p className="line-translation">{excerpt.zh}</p></blockquote></details>
   <div className="row wrap"><button className="text-btn" onClick={listen}>回到课文听原声</button><button className="text-btn" onClick={()=>speak(excerpt.en)}><Volume2 size={17}/>慢读这句</button><PlaybackSpeed ariaLabel="表达示范语速"/></div>
   <label className="field">这句话在说谁、什么事？<textarea rows={2} maxLength={1000} value={draft.meaning} onChange={e=>patch({meaning:e.target.value,saved:false})} placeholder="先用中文说清自己听懂的意思；需要时展开参考、点词查意思"/></label>
  </div>}
  {step===1&&<div className="guide-stage">
   <h3>从本课原句，借一个表达方法</h3><blockquote><WordText text={excerpt.en} exampleTranslation={excerpt.zh}/><p className="line-translation">{excerpt.zh}</p></blockquote>
   <p className="note">{frame.tip}</p>
   <p className="small muted">下面换成日常情境练同一种用途，示范由本站编写。先换一个选项，再试着自己说。</p>
   <div className="guide-slots">{frame.slots.map((slot,i)=><label className="field" key={slot.label}>{slot.label}<select value={draft.selected[i]||0} onChange={e=>{const selected=[...draft.selected];selected[i]=Number(e.target.value);patch({selected,saved:false})}}>{slot.options.map((o,n)=><option key={o.en} value={n}>{o.en} · {o.zh}</option>)}</select></label>)}</div>
   <blockquote><WordText text={sentence} exampleTranslation={translation}/><p className="line-translation">{translation}</p></blockquote>
   <div className="row wrap"><button className="text-btn" onClick={()=>speak(sentence)}><Volume2 size={17}/>听替换示范</button><PlaybackSpeed ariaLabel="搭句示范语速"/></div>
   {level!=='sentence'&&<ol className="guide-prompts">{prompts.map(p=><li key={p}>{p}</li>)}</ol>}
   <label className="field">换成自己的内容，先写关键词<textarea rows={3} maxLength={1000} value={draft.keywords} onChange={e=>patch({keywords:e.target.value,saved:false})} placeholder={frame.slots.map(s=>s.label+'：').join('\n')+'\n自己的一个细节：'}/></label>
  </div>}
  {step===2&&<div className="guide-stage">
   <h3>{level==='sentence'?'先说两句，再补一个细节':'用这个方法，讲自己的一个情境'}</h3>
   <div className="guide-hints" role="group" aria-label="表达提示程度">{(['full','keywords','none'] as const).map((value,i)=><button className={'btn '+(hint===value?'':'secondary')} key={value} onClick={()=>setHint(value)}>{['看句架','只看关键词','关掉提示'][i]}</button>)}</div>
   {hint==='full'&&<blockquote><WordText text={sentence} exampleTranslation={translation}/><details><summary>看句架的中文意思</summary><p className="line-translation">{translation}</p></details></blockquote>}
   {hint!=='none'&&<p className="guide-keywords">我的关键词：{draft.keywords||'先到上一步写几个关键词'}</p>}
   <p>{frame.transfer}</p>
   <label className="field">记下你刚才说的内容<textarea rows={4} maxLength={5000} value={draft.answer} onChange={e=>patch({answer:e.target.value,checkedAnswer:'',saved:false})} placeholder="尽量记录自己实际说过的话，允许出错；下一步会检查这一版"/></label>
  </div>}
  {step===3&&<div className="guide-stage">
   <h3>先改一处，再用自己的话说一遍</h3>
   {draft.answer.trim()?<><details className="previous-expression"><summary>查看第一版</summary><p lang="en">{draft.answer}</p><button className="text-btn" onClick={()=>go(2)}>回去修改第一版</button></details><ExpressionFeedback text={draft.answer} context={context}/></>:<p className="notice">先到“自己表达”写下第一版，再来检查。<button className="text-btn" onClick={()=>go(2)}>写第一版</button></p>}
   <details className="extra-repair"><summary>回听后，我还想改停顿、发音或意思</summary><label className="field">这一轮再关注什么？<select value={draft.repair} onChange={e=>patch({repair:e.target.value,saved:false})}><option value="">暂不追加问题</option>{repairs.map(([id,title])=><option key={id} value={id}>{title}</option>)}<option value="transfer">换个内容再试</option></select></label><p>{repairs.find(([id])=>id===draft.repair)?.[2]||frame.transfer}</p></details>
   <label className="field">改过后的版本<textarea rows={4} maxLength={5000} value={draft.retry} onChange={e=>patch({retry:e.target.value,checkedRetry:'',saved:false})} placeholder="保留要表达的意思，修正刚才的一两处；再录一次比较"/></label>
   <button className="btn secondary" disabled={wordCount(draft.retry)<3} onClick={()=>patch({checkedRetry:draft.retry,saved:false})}>检查修改版并比较</button>
   {draft.checkedRetry===draft.retry&&draft.retry.trim()&&<ExpressionFeedback text={draft.retry} before={draft.answer} context={context}/>}
  </div>}
  {/* One recorder survives first answer -> feedback -> retry, preserving the two takes. */}
  {(step===2||step===3)&&<div className="expression-recorder" key="expression-recorder"><Recorder stopSignal={step}/><p className="small muted">在“自己表达”和“反馈与重练”之间切换会保留最近两遍，方便回听比较；离开这轮录音练习后清除。</p></div>}
  {step===4&&<div className="guide-stage">
   <h3>不看句架，换一个情境试试</h3>
   {draft.checkpointAt>0?<div className="checkpoint-saved"><p>上次检验：{new Date(draft.checkpointAt).toLocaleDateString('zh-CN')}。{draft.checkpointCorrect?'选择题答对，文字检查未发现所列问题。':'还有需要回顾的地方。'}</p><p>这是一次练习记录，下一次换情境继续检查。</p><button className="btn" onClick={startCheck}>开始新一轮换情境检验</button></div>:<>
    <p>① 按中文意思选出合适的形式，再自己说一句。</p>
    <p className="check-translation">{challenge.translation}</p><p className="check-prompt" lang="en">{challenge.prompt}</p>
    <fieldset className="transfer-options"><legend>选择空缺处的表达</legend>{challenge.options.map(option=><label key={option}><input type="radio" name={`transfer-${book}-${lesson}`} value={option} checked={draft.checkChoice===option} disabled={draft.checkMarked} onChange={()=>patch({checkChoice:option,saved:false})}/><span lang="en">{option}</span></label>)}</fieldset>
    {!draft.checkMarked?<button className="btn secondary" disabled={!draft.checkChoice} onClick={()=>patch({checkMarked:true,saved:false})}>检查这个选择</button>:<div role="status" className={'feedback '+(draft.checkChoice===challenge.answer?'good':'bad')}><strong>{draft.checkChoice===challenge.answer?'这个选择正确':'这一处用 '+challenge.answer}</strong><p>{challenge.explanation}</p><button className="text-btn" onClick={startCheck}>换一道再试</button></div>}
    <p>② {challenge.transfer}</p>
    <label className="field">这次脱离句架的表达<textarea rows={3} maxLength={5000} value={draft.transfer} onChange={e=>patch({transfer:e.target.value,checkedTransfer:'',saved:false})} placeholder="先自己说，再写下刚才的英语；尽量换一种内容"/></label>
    <button className="btn secondary" disabled={wordCount(draft.transfer)<3} onClick={()=>patch({checkedTransfer:draft.transfer,saved:false})}>检查这次表达</button>
    {draft.checkedTransfer===draft.transfer&&draft.transfer.trim()&&<ExpressionFeedback text={draft.transfer} context={context}/>}
   </>}
   {draft.previousTransfer&&<details><summary>上一次在这个用途下的表达</summary><p lang="en">{draft.previousTransfer}</p></details>}
   <button className="btn full checkpoint-save" disabled={!canSave||sessionSaved} onClick={save}>{sessionSaved?<Check size={17}/>:<ArrowRight size={17}/>} {sessionSaved?'已保存，明天继续检验':'保存卡片，安排明天复习'}</button>
   {!canSave&&!sessionSaved&&<p className="small muted">保留前面的理解、关键词、第一版和已检查的修改版，并完成上面的两项检验后即可保存。有问题也会留下记录，明天针对它重练。<button className="text-btn" onClick={()=>go(3)}>回到修改版检查</button></p>}
   <button className="text-btn" onClick={()=>navigate({view:'progress'})}>查看我的表达框架 <ArrowRight size={15}/></button>
  </div>}
  <div className="row spread guide-footer"><button className="btn secondary" disabled={step===0} onClick={()=>go(step-1)}><ArrowLeft size={16}/>上一步</button><span className="small muted">{step+1} / 5</span>{step<4?<button className="btn" disabled={!ready} onClick={next}>{step===2?'检查这一版':step===3?'换情境检验':'下一小步'}<ArrowRight size={16}/></button>:<button className="btn secondary" onClick={()=>navigate({view:'today'})}>回到今日学习</button>}</div>
  <p className="small muted guide-save-note">文字自动保存在当前浏览器。</p>
 </section>;
}

export function ExpressionCollection({drafts}:{drafts:Record<string,string>}){
 const [category,setCategory]=useState('全部');
 const cards=Object.entries(drafts).filter(([key])=>/^expression-NCE[1-4]-\d+$/.test(key)).map(([key,value])=>({key,...readGuide(value)})).filter(d=>(d.saved||!!d.category)&&d.retry.trim());
 const groups=[...new Set(cards.map(c=>c.category||'其他'))];
 return <section className="panel section-space"><div className="section-top"><div><h2>我的表达框架</h2><p className="muted small">想表达什么 → 怎样组织 → 自己的例子 → 换情境再用。</p></div><span className="pill">{cards.length} 张卡片</span></div><label className="field">按表达用途查看<select value={category} onChange={e=>setCategory(e.target.value)}>{['全部',...groups].map(g=><option key={g}>{g}</option>)}</select></label>{cards.length===0?<p>在每课“表达练习”中完成修改与换情境检验，这里就会积累可复用的句型和自己的例子。</p>:<div className="knowledge-grid">{cards.filter(c=>category==='全部'||c.category===category).map(c=>{const [,book,no]=c.key.split('-');return <article key={c.key}><span className="pill">{c.category}</span>{c.form&&<p className="framework-form">{c.form}</p>}<p lang="en"><WordText text={c.retry}/></p>{c.transfer&&<details><summary>换情境时，我这样用</summary><p lang="en">{c.transfer}</p></details>}<p className="small muted">{c.checkpointAt?(c.checkpointCorrect?'小检验已有记录，下次脱离提示再用一次。':'本次仍有待练的地方，下一次先回顾。'):'这轮尚未完成换情境检验，已有内容已保留。'}</p><button className="text-btn" onClick={()=>navigate({view:'nce',book:book as NceBookId,lesson:Number(no),tab:'notes',step:4})}>用这个方法，再练一个情境 <ArrowRight size={15}/></button></article>})}</div>}</section>;
}
