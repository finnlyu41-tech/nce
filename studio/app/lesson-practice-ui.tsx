'use client';
import {useEffect,useMemo,useState} from 'react';
import {ArrowRight,Check,Headphones} from 'lucide-react';
import {type LanguageRow} from './language';
import {type State} from './model';
import {lessonRecall,recallAnswer} from './lesson-practice';

export function LessonPractice({rows,lessonKey,label,state,update,listen,notes}:{rows:LanguageRow[];lessonKey:string;label:string;state:State;update:(fn:(s:State)=>State)=>void;listen:()=>void;notes:()=>void}){
 const items=useMemo(()=>lessonRecall(rows,lessonKey),[rows,lessonKey]);
 const draftKey=`nce-recall-${lessonKey}`;
 const [answers,setAnswers]=useState<Record<string,string>>({}),[checked,setChecked]=useState(false);
 useEffect(()=>{
  try{const data=JSON.parse(state.drafts[draftKey]||'{}');if(data&&typeof data==='object'&&!Array.isArray(data))setAnswers(Object.fromEntries(items.map(item=>[item.id,typeof data[item.id]==='string'?data[item.id]:''])))}catch{setAnswers({})}
  setChecked(false);
 },[draftKey,state.drafts[draftKey],items]);
 function edit(id:string,value:string){const next={...answers,[id]:value};setAnswers(next);setChecked(false);update(s=>({...s,drafts:{...s.drafts,[draftKey]:JSON.stringify(next)}}))}
 return <section className="panel lesson-recall"><div className="section-top"><div><span className="eyebrow">{label} · 课文回顾</span><h2>本课句子填空</h2></div><button className="text-btn" onClick={listen}><Headphones size={17}/>回听原声</button></div>
 <p className="muted small">回想本课原句，补全空格。原书习题可在下方打开。</p>
 {items.length?<><form onSubmit={event=>{event.preventDefault();setChecked(true)}}><div className="recall-list">{items.map((item,i)=><div className="recall-question" key={item.id}><label htmlFor={`recall-${item.id}`}><span className="number-tag">{i+1}</span><span lang="en">{item.prompt}</span></label>{item.translation&&<p className="muted small">{item.translation}</p>}<input id={`recall-${item.id}`} aria-label={`第 ${i+1} 题填空`} autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={80} placeholder="填入原句中的单词" value={answers[item.id]||''} onChange={event=>edit(item.id,event.target.value)}/>{checked&&<div className={'recall-feedback '+(recallAnswer(answers[item.id]||'')===recallAnswer(item.answer)?'correct':'')}><strong>{recallAnswer(answers[item.id]||'')===recallAnswer(item.answer)?<><Check size={16}/>与原句一致</>:`原句用的是：${item.answer}`}</strong><p lang="en">{item.original}</p></div>}</div>)}</div><button className="btn" type="submit" disabled={!items.every(item=>answers[item.id]?.trim())}>核对本课原句</button></form><p className="muted small">填空内容自动保存；这里核对原句，不判定其他表达是否正确。</p></>:<p className="notice">本课文本暂未就绪，可先打开下方原书完成练习，或返回听读后重试。</p>}
 <div className="recall-expression"><strong>再说 2–3 句自己的话</strong><p className="muted small">选上面一句，换成人物、物品、时间或自己的经历。卡住时先看提示，再合上提示说一次。</p><button className="text-btn" onClick={notes}>记录表达与卡点<ArrowRight size={16}/></button></div></section>
}
