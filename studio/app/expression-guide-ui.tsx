'use client';
import {useEffect,useState} from 'react';
import {useMovingSelection} from '@/lib/use-moving-selection';
import {ArrowRight,Volume2,Check} from 'lucide-react';
import {type State,type NceBookId,wordCount} from './model';
import type {LanguageRow} from './language';
import {completeGuideStep,guideFor,readGuide,sentenceFor,transferCheck,type GuideDraft} from './expression-guide';
import {expressionFeedback} from './expression-feedback';
import {ExpressionFeedback} from './expression-feedback-ui';
import {ExpressionAudio} from './expression-audio';
import {WordText} from './word-lookup';
import {Recorder,speak} from './learning';
import {PlaybackSpeed} from './playback-speed';
import {navigate} from './navigation';
import {useRoute} from './use-route';
import {queueExpressionReview} from './study-path';

const repairs=[
 ['meaning','不知道说什么','先想清“谁、做什么、一个细节”，再只说第一句。'],
 ['pause','一句话反复停顿','把一句分成两小段，每段慢读两遍，再连起来；熟悉后恢复自然语速。'],
 ['tense','时态前后不一致','留意时间词。过去的经历检查 was / went / did；现在的习惯检查一般现在时。'],
 ['words','词语或搭配不确定','回到原句查这个词，把短语作为一个整体，再换一个内容造句。'],
 ['sound','一个词听不清或读不清','点词看音标，听原声，再录一次，只比较这个词。'],
];
const names=['听懂一句','拆开搭句','自己表达','反馈与重练','换情境检验'];
const practiced=['听了一句，并尝试说出它的意思','用这个句型，换了自己的内容','试着说了自己的情境','关注一处想改的地方，又说了一遍','脱离句架，尝试了一个新情境'];
export function GuidedExpression({book,lesson,rows,state,update,listen,sourceSha256}:{book:NceBookId;lesson:number;rows:LanguageRow[];state:State;update:(fn:(s:State)=>State)=>void;listen:()=>void;sourceSha256?:string}){
 const stepsRef=useMovingSelection<HTMLElement>('[aria-current="step"]');
 const route=useRoute(),key=`expression-${book}-${lesson}`,draft=readGuide(state.drafts[key]);
 const {frame,source,level,excerpt,prompts,goal}=guideFor(rows,book),step=route.step??draft.step;
 const [finished,setFinished]=useState<number|null>(null),[recordOpen,setRecordOpen]=useState(false);
 const done=finished===step;
 useEffect(()=>setFinished(null),[step]);
 const patch=(change:Partial<GuideDraft>)=>update(s=>{
  const changedContent=['meaning','keywords','selected','answer','retry'].some(field=>field in change);
  return {...s,drafts:{...s.drafts,[key]:JSON.stringify({...readGuide(s.drafts[key]),...(changedContent?{checkpointAt:0,checkChoice:'',checkMarked:false,checkedTransfer:'',saved:false}:{}),...change})}};
 });
 function focusTask(){requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById('expression-stage-title')?.focus({preventScroll:true})))}
 function go(next:number){
  window.speechSynthesis?.cancel();
  setFinished(null);
  if(next===step)return;
  if(route.step===undefined)navigate({...route,step},{replace:true,keepScroll:true});
  patch({step:next});
  navigate({view:'nce',book,lesson,tab:'notes',step:next},{keepScroll:true,scrollTarget:'expression-task'});
  focusTask();
 }
 const sentence=sentenceFor(frame,draft.selected),translation=sentenceFor(frame,draft.selected,true);
 const context={source:excerpt.en,extend:book!=='NCE1',target:frame.id},challenge=transferCheck(frame,lesson,draft.checkRound);
 const startCheck=()=>patch({checkRound:draft.checkRound+1,checkChoice:'',checkMarked:false,previousTransfer:draft.transfer||draft.previousTransfer,transfer:'',checkedTransfer:'',checkpointAt:0,checkpointCorrect:false,saved:false});
 function finish(){
  window.speechSynthesis?.cancel();
  if(route.step===undefined)navigate({...route,step},{replace:true,keepScroll:true});
  const now=Date.now(),form=frame.form.replace(/\{(\d+)\}/g,(_,i)=>`（${frame.slots[Number(i)].label}）`);
  update(s=>{
   const current=readGuide(s.drafts[key]),next=completeGuideStep(current,step,now);
   // Only an actual checked written answer creates written-check evidence.
   if(step===4&&!current.checkpointAt&&current.checkMarked&&wordCount(current.transfer)>=3&&current.checkedTransfer===current.transfer){
    Object.assign(next,{saved:true,category:frame.name,form,source:excerpt.en,checkpointAt:now,checkpointCorrect:current.checkChoice===challenge.answer&&expressionFeedback(current.transfer,context).length===0});
   }
   return queueExpressionReview({...s,days:[...new Set([...s.days,new Date(now).toLocaleDateString('en-CA')])],drafts:{...s.drafts,[key]:JSON.stringify(next)}},book,lesson,now);
  });
  setFinished(step);
  navigate({view:'nce',book,lesson,tab:'notes',step},{replace:true,keepScroll:true,scrollTarget:'expression-task'});
  focusTask();
 }
 if(!source)return <section className="panel"><h3>先打开本课教材</h3><p>本课原句载入后，这里会生成表达步骤。你已经写的内容会保留。</p><button className="btn" onClick={listen}>打开教材听读</button></section>;
 return <section className="panel guided-expression" id="expression-task">
  <div className="section-top"><div><span className="eyebrow">第 {lesson} 课 · {frame.name}</span><h2 id="expression-stage-title" tabIndex={-1}>{done?'这一小步，练过了':names[step]}</h2></div><span className="pill">{done?'已记录练习':'约 3 分钟'}</span></div>
  {done?<div className="guide-complete" role="status"><Check size={26}/><p>{practiced[step]}。</p><p className="small muted">{step<4?'下次从下一小步继续，草稿也会保留。':'已安排明天回顾，换一个情境再试。'}</p><div className="row wrap"><button className="btn" onClick={()=>navigate({view:'today'})}>今天到这里</button>{step<4?<button className="btn secondary" onClick={()=>go(step+1)}>再练一小步 <ArrowRight size={16}/></button>:<button className="text-btn" onClick={()=>navigate({view:'nce',book,lesson,tab:'practice'})}>继续本课练习 <ArrowRight size={16}/></button>}</div></div>:<>
   <p className="guide-goal">{goal}。做完这一小步就可以休息。</p>
   <details className="guide-outline"><summary>查看全部步骤 · {step+1} / 5</summary>
    <nav ref={stepsRef} className="guide-steps" aria-label="表达练习步骤">{names.map((name,i)=><button key={name} className={i===step?'active':''} onClick={()=>go(i)} aria-current={i===step?'step':undefined}>{i+1}<span>{name}</span></button>)}</nav>
    <label className="guide-mobile-jump">切换步骤<select aria-label="切换表达步骤" value={step} onChange={e=>go(Number(e.target.value))}>{names.map((name,i)=><option value={i} key={name}>{i+1} / 5 · {name}</option>)}</select></label>
   </details>
  </>}
  <div hidden={done}>
   {step===0&&<div className="guide-stage">
    <p>听一句，再用中文说说它在讲什么。</p>
    <ExpressionAudio key={`${sourceSha256}-${excerpt.en}`} book={book} lesson={lesson} sourceSha256={sourceSha256} text={excerpt.en} start={excerpt.startTime} end={excerpt.endTime} stopSignal={step+(done?10:0)}/>
    <details className="practice-reference"><summary>没听清？看原句和中文</summary><blockquote><WordText text={excerpt.en} exampleTranslation={excerpt.zh}/><p className="line-translation">{excerpt.zh}</p></blockquote></details>
    <details className="guide-optional" key="meaning" open={!!draft.meaning}><summary>想记下来？写一句（可选）</summary><label className="field">这句话在说谁、什么事？<textarea rows={2} maxLength={1000} value={draft.meaning} onChange={e=>patch({meaning:e.target.value})} placeholder="用中文记下自己听懂的意思"/></label></details>
   </div>}
   {step===1&&<div className="guide-stage">
    <p>换一个选项，再把句子说出来。</p>
    <details className="practice-reference"><summary>回看本课原句</summary><blockquote><WordText text={excerpt.en} exampleTranslation={excerpt.zh}/><p className="line-translation">{excerpt.zh}</p></blockquote></details>
    <div className="guide-slots">{frame.slots.map((slot,i)=><label className="field" key={slot.label}>{slot.label}<select value={draft.selected[i]||0} onChange={e=>{const selected=[...draft.selected];selected[i]=Number(e.target.value);patch({selected})}}>{slot.options.map((o,n)=><option key={o.en} value={n}>{o.en} · {o.zh}</option>)}</select></label>)}</div>
    <blockquote><WordText text={sentence} exampleTranslation={translation}/><p className="line-translation">{translation}</p></blockquote>
    <div className="row wrap"><button className="text-btn" onClick={()=>speak(sentence)}><Volume2 size={17}/>听替换示范</button><PlaybackSpeed ariaLabel="搭句示范语速"/></div>
    <p className="small muted">{frame.tip} 示范由本站编写。</p>
    {level!=='sentence'&&<details className="practice-reference"><summary>不知道怎样展开？</summary><ol className="guide-prompts">{prompts.map(p=><li key={p}>{p}</li>)}</ol></details>}
    <details className="guide-optional" key="keywords" open={!!draft.keywords}><summary>记几个自己的关键词（可选）</summary><label className="field">我的关键词<textarea rows={3} maxLength={1000} value={draft.keywords} onChange={e=>patch({keywords:e.target.value})} placeholder={frame.slots.map(s=>s.label+'：').join('\n')+'\n自己的一个细节：'}/></label></details>
   </div>}
   {step===2&&<div className="guide-stage">
    <h3>{level==='sentence'?'说两句自己的话':'讲一个自己的情境'}</h3><p>{frame.transfer}</p>
    <details className="practice-reference"><summary>卡住时看一点提示</summary><blockquote><WordText text={sentence} exampleTranslation={translation}/><p className="line-translation">{translation}</p></blockquote>{draft.keywords&&<p className="guide-keywords">我的关键词：{draft.keywords}</p>}</details>
    <details className="guide-optional" key="answer" open={!!draft.answer}><summary>写下来，下一步检查文字（可选）</summary><label className="field">记下你刚才说的内容<textarea rows={4} maxLength={5000} value={draft.answer} onChange={e=>patch({answer:e.target.value,checkedAnswer:''})} placeholder="记录自己实际说过的话，允许出错"/></label></details>
   </div>}
   {step===3&&<div className="guide-stage">
    <h3>只改一处，再说一遍</h3>
    {draft.answer.trim()?<><details className="previous-expression"><summary>查看第一版</summary><p lang="en">{draft.answer}</p><button className="text-btn" onClick={()=>go(2)}>回去修改第一版</button></details><ExpressionFeedback text={draft.answer} context={context}/></>:<p>回想刚才哪一处最不顺，把那一句放慢，再说一次。也可以录下来听听。</p>}
    <details className="extra-repair"><summary>需要一点重练建议？</summary><label className="field">这一遍关注什么？<select value={draft.repair} onChange={e=>patch({repair:e.target.value})}><option value="">选择一处就好</option>{repairs.map(([id,title])=><option key={id} value={id}>{title}</option>)}<option value="transfer">换个内容再试</option></select></label><p>{repairs.find(([id])=>id===draft.repair)?.[2]||frame.transfer}</p></details>
    <details className="guide-optional" key="retry" open={!!draft.retry}><summary>写下修改版，检查并比较（可选）</summary><label className="field">改过后的版本<textarea rows={4} maxLength={5000} value={draft.retry} onChange={e=>patch({retry:e.target.value,checkedRetry:''})} placeholder="保留意思，只修正刚才的一两处"/></label><button className="btn secondary" disabled={wordCount(draft.retry)<3} onClick={()=>patch({checkedRetry:draft.retry})}>检查修改版并比较</button>{draft.checkedRetry===draft.retry&&draft.retry.trim()&&<ExpressionFeedback text={draft.retry} before={draft.answer} context={context}/>}</details>
   </div>}
   {(step===2||step===3)&&<details className="expression-recorder guide-optional" key="expression-recorder" onToggle={e=>setRecordOpen(e.currentTarget.open)}><summary>录一遍，回听比较（可选）</summary><Recorder stopSignal={step+(done?10:0)+(recordOpen?0:100)}/><p className="small muted">这两步之间保留最近两遍录音；离开本轮练习或刷新后清除。</p></details>}
   {step===4&&<div className="guide-stage">
    <h3>不看句架，换个情境说一句</h3><p>{challenge.transfer}</p>
    <details className="guide-optional" key="transfer" open={!!(draft.transfer||draft.checkChoice||draft.checkpointAt)}><summary>加一道文字小检验（可选）</summary>
     {draft.checkpointAt>0?<div className="checkpoint-saved"><p>上次检验：{new Date(draft.checkpointAt).toLocaleDateString('zh-CN')}。{draft.checkpointCorrect?'选择题答对，文字检查未发现所列问题。':'还有需要回顾的地方。'}</p><button className="btn secondary" onClick={startCheck}>开始新一轮文字检验</button></div>:<>
      <p>按中文意思，选出合适的形式。</p><p className="check-translation">{challenge.translation}</p><p className="check-prompt" lang="en">{challenge.prompt}</p>
      <fieldset className="transfer-options"><legend>选择空缺处的表达</legend>{challenge.options.map(option=><label key={option}><input type="radio" name={`transfer-${book}-${lesson}`} value={option} checked={draft.checkChoice===option} disabled={draft.checkMarked} onChange={()=>patch({checkChoice:option,saved:false})}/><span lang="en">{option}</span></label>)}</fieldset>
      {!draft.checkMarked?<button className="btn secondary" disabled={!draft.checkChoice} onClick={()=>patch({checkMarked:true,saved:false})}>检查这个选择</button>:<div role="status" className={'feedback '+(draft.checkChoice===challenge.answer?'good':'bad')}><strong>{draft.checkChoice===challenge.answer?'这个选择正确':'这一处用 '+challenge.answer}</strong><p>{challenge.explanation}</p><button className="text-btn" onClick={startCheck}>换一道再试</button></div>}
      <label className="field">这次脱离句架的表达<textarea rows={3} maxLength={5000} value={draft.transfer} onChange={e=>patch({transfer:e.target.value,checkedTransfer:'',saved:false})} placeholder="先自己说，需要文字检查时记在这里"/></label>
      <button className="btn secondary" disabled={wordCount(draft.transfer)<3} onClick={()=>patch({checkedTransfer:draft.transfer,saved:false})}>检查这次表达</button>
      {draft.checkedTransfer===draft.transfer&&draft.transfer.trim()&&<ExpressionFeedback text={draft.transfer} context={context}/>}
     </>}
     {draft.previousTransfer&&<details><summary>上一次在这个用途下的表达</summary><p lang="en">{draft.previousTransfer}</p></details>}
     <p className="small muted">检验和已有表达卡片会随本次练习保存。</p><button className="text-btn" onClick={()=>navigate({view:'progress'})}>查看我的表达框架 <ArrowRight size={15}/></button>
    </details>
   </div>}
  </div>
  {!done&&<><div className="row spread guide-footer"><button className="text-btn" onClick={()=>navigate({view:'today'})}>先休息</button><button className="btn" onClick={finish}><Check size={17}/>这一步练过了</button></div><p className="small muted guide-save-note">开口练就可以；文字可选，填写后自动保存。</p></>}
 </section>;
}

export function ExpressionCollection({drafts}:{drafts:Record<string,string>}){
 const [category,setCategory]=useState('全部');
 const cards=Object.entries(drafts).filter(([key])=>/^expression-NCE[1-4]-\d+$/.test(key)).map(([key,value])=>({key,...readGuide(value)})).filter(d=>(d.saved||!!d.category)&&d.retry.trim());
 const groups=[...new Set(cards.map(c=>c.category||'其他'))];
 return <section className="panel section-space"><div className="section-top"><div><h2>我的表达框架</h2><p className="muted small">想表达什么 → 怎样组织 → 自己的例子 → 换情境再用。</p></div><span className="pill">{cards.length} 张卡片</span></div><label className="field">按表达用途查看<select value={category} onChange={e=>setCategory(e.target.value)}>{['全部',...groups].map(g=><option key={g}>{g}</option>)}</select></label>{cards.length===0?<p>在每课“表达练习”中完成修改与换情境检验，这里就会积累可复用的句型和自己的例子。</p>:<div className="knowledge-grid">{cards.filter(c=>category==='全部'||c.category===category).map(c=>{const [,book,no]=c.key.split('-');return <article key={c.key}><span className="pill">{c.category}</span>{c.form&&<p className="framework-form">{c.form}</p>}<p lang="en"><WordText text={c.retry}/></p>{c.transfer&&<details><summary>换情境时，我这样用</summary><p lang="en">{c.transfer}</p></details>}<p className="small muted">{c.checkpointAt?(c.checkpointCorrect?'小检验已有记录，下次脱离提示再用一次。':'本次仍有待练的地方，下一次先回顾。'):'这轮尚未完成换情境检验，已有内容已保留。'}</p><button className="text-btn" onClick={()=>navigate({view:'nce',book:book as NceBookId,lesson:Number(no),tab:'notes',step:4})}>用这个方法，再练一个情境 <ArrowRight size={15}/></button></article>})}</div>}</section>;
}
