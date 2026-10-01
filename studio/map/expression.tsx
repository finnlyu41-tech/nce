import React, {useEffect, useRef, useState} from 'react';
import {ArrowRight} from 'lucide-react';
import {type Unit} from './curriculum';
import {lessonPlan} from './lesson-plan';
import {emptyPractice, emptyRecord, normalize, type Progress, type ExpressionPractice} from './model';
import {QuestionAnswer} from './course';
import {Recorder} from './media';
import type {Save} from './learning';

export function GuidedExpression({unit,state,save,next}:{unit:Unit;state:Progress;save:Save;next:()=>void}){
  const plan=lessonPlan(unit),record=state.records[unit.id],practice=record?.practice||emptyPractice();
  const [recording,setRecording]=useState(false),[guidedChecked,setGuidedChecked]=useState(false);
  const heading=useRef<HTMLHeadingElement>(null);
  const patch=(change:Partial<ExpressionPractice>)=>save(s=>({...s,records:{...s.records,[unit.id]:{...(s.records[unit.id]||emptyRecord()),practice:{...(s.records[unit.id]?.practice||emptyPractice()),...change}}}}));
  useEffect(()=>{heading.current?.focus({preventScroll:true});window.scrollTo({top:0});setRecording(false)},[practice.step]);
  const move=(step:number)=>patch({step,hinted:practice.hinted||step===0&&!!practice.recall});
  const matched=normalize(practice.recall)===normalize(plan.recall.answer);
  return <div className="expression-practice"><div className="quiz-position"><span>表达练习 {practice.step+1} / 3</span><span>{['有示范','少一点帮助','自己的情境'][practice.step]}</span></div>
    <h2 ref={heading} tabIndex={-1}>{['跟着换一句','收起示范，再说一句','用在自己身上'][practice.step]}</h2>
    {practice.step===0?<><div className="bilingual-example"><strong lang="en">{plan.sample.en}</strong><p>{plan.sample.zh}</p></div><p>{plan.guided.prompt}</p><QuestionAnswer q={plan.guided} index={0} round={0} value={practice.guided} disabled={false} set={guided=>{setGuidedChecked(false);patch({guided})}} heard={()=>{}}/>{guidedChecked&&<p className="practice-feedback" role="status">{normalize(practice.guided)===normalize(plan.guided.answer)?'和示范句型一致。接下来收起词块，试着回想。':`先对照一下语序：${plan.guided.answer}`}</p>}<div className="quiz-actions"><button className="text-button" onClick={()=>move(1)}>已经会了，直接试</button><button className="primary" disabled={!practice.guided.trim()} onClick={()=>guidedChecked?move(1):setGuidedChecked(true)}>{guidedChecked?'收起示范，继续':'核对这一句'}<ArrowRight size={17}/></button></div></>:practice.step===1?<><p>{plan.recall.prompt}</p><label className="form-field">先说一遍，能写的话再写下来<textarea rows={2} maxLength={1000} value={practice.recall} onChange={e=>patch({recall:e.target.value,checked:false})} placeholder="先自己回想，不急着看答案。"/></label>{practice.hinted&&<aside className="expression-hint"><p>{plan.pattern}</p><p lang="en">参考：{plan.recall.answer}</p><small>本步记为借助提示；独立检验会另外出题。</small></aside>}{practice.checked&&<p className="practice-feedback" role="status">{matched?`${practice.hinted?'借助提示，':'这次回想'}与参考表达一致。`:'与参考写法不同，也可能有其他正确表达。先核对是否说出了题目全部意思。'}</p>}<div className="quiz-actions"><button className="text-button" onClick={()=>patch({hinted:true})}>{practice.hinted?'已显示帮助':'还不会写？先说，再看示范'}</button><button className="primary" onClick={()=>practice.checked||practice.hinted?move(2):patch({checked:true})} disabled={!practice.recall.trim()&&!practice.hinted}>{practice.checked||practice.hinted?'换成自己的情况':'核对我的表达'}<ArrowRight size={17}/></button></div>{practice.checked&&!matched&&!practice.hinted&&<button className="text-button" onClick={()=>patch({hinted:true})}>对照参考表达</button>}</>:<><p>{plan.own}</p><label className="form-field">我的表达<textarea rows={4} maxLength={10000} value={String(record?.draft?.note||'')} onChange={e=>save(s=>({...s,records:{...s.records,[unit.id]:{...(s.records[unit.id]||emptyRecord()),draft:{...s.records[unit.id]?.draft,note:e.target.value}}}}))} placeholder="先留下一句。暂时不会的词可以用中文记下。"/></label><details className="expression-selfcheck"><summary>说完后，核对这一处</summary><p>{plan.check}</p><p>意思是否与自己的情况一致？请老师或伙伴听读，指出一处需要修改的地方。</p></details><button className="text-button" onClick={()=>setRecording(!recording)}>{recording?'收起录音':'录下自己的表达（可选）'}</button>{recording&&<Recorder id={unit.id}/>}<p className="footnote">{record?.draft?.note?'草稿已保留 · 表达准确性待核对。':'可以先口头练习，草稿会自动保留。'} 下面的检验单独记录听读与组句表现。</p><div className="focus-next"><button className="primary" onClick={next}>收起资料，开始检验<ArrowRight size={17}/></button></div></>}
    {practice.step>0&&<button className="text-button expression-back" onClick={()=>move(practice.step-1)}>← 回到上一步表达练习</button>}
  </div>;
}
