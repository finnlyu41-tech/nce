'use client';
import {useState} from 'react';
import type {State} from './model';
import {grammarChartTransfer as lesson,grammarChartTransferKey,emptyChartResponse,readChartDraft,chartDraftNeedsNewerVersion,updateChartDraft,setChartAnswer,checkChartAnswer,showChartHelp,chartAnswerFeedback,saveChartParagraph,checkChartParagraph,moveChartStep,type ChartDraft} from './grammar-chart-transfer';
import './grammar-chart-transfer.css';

export function GrammarChartTransfer({unitId,state,update}:{unitId:string;state:State;update:(change:(s:State)=>State)=>void}){
 const [references,setReferences]=useState<string[]>([]),[paragraphReference,setParagraphReference]=useState(false);
 if(unitId!==lesson.unitId)return null;
 const raw=state.drafts[grammarChartTransferKey],draft=readChartDraft(raw),locked=chartDraftNeedsNewerVersion(raw);
 const patch=(change:(p:ChartDraft)=>ChartDraft)=>update(s=>updateChartDraft(s,change));
 function table(id:string){const t=lesson.tables.find(t=>t.id===id)!;return <figure className="grammar-chart-table"><figcaption>{t.title}</figcaption><table><thead><tr>{(id==='independent'?['年份','Cars（汽车）','Bicycles（自行车）','Other（其他）']:id==='change'?['年份','乘公交的占比']:['主要方式','占比']).map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{t.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=>j===0?<th scope="row" key={j}>{cell}</th>:<td key={j}>{cell.replace(/^(Cars|Bicycles|Other) /,'')}</td>)}</tr>)}</tbody></table></figure>}
 return <section id="grammar-chart-transfer-comparisons" className="grammar-chart-transfer" aria-label="图表比较应用">
  <h3>{lesson.title}</h3><p className="small muted">{lesson.scope}</p><p>{lesson.dataNote}</p>
  {locked&&<p role="status">这份图表草稿来自较新版本。讲解可阅读，原草稿保留，请用较新版本继续作答。</p>}
  <details><summary>先看表达与数据的关系</summary>{lesson.lesson.map(item=><div key={item.heading}><h4>{item.heading}</h4><p>{item.text}</p></div>)}{lesson.contrasts.map(item=><div key={item.a}><p lang="en">{item.a}</p><p lang="en">{item.b}</p><p>{item.why}</p></div>)}</details>
  <p className="small muted">三项小检验：理解变化量 → 修正关系词 → 从新表格自主选择比较。一次完成一项。提示和首次核对回答会保存；开放表达保留为待人工核对。</p>
  {draft.position<3&&<p>图表小检验 {draft.position+1} / 3</p>}
  {lesson.exercises.map((q,index)=>{if(index!==draft.position)return null;const r=draft.responses[q.id]||emptyChartResponse(),checked=r.checked,feedback=checked!==null&&checked!==undefined?chartAnswerFeedback(q,checked):null,open=references.includes(q.id);return <article key={q.id} className="grammar-chart-exercise" aria-label={`图表练习 ${index+1}`}>
   <h4>{index+1} · {['理解变化量','修正起点与终点','换表格后比较'][index]}</h4>{table(q.tableId)}<p>{q.prompt}</p>{q.id==='compare'&&<p className="small muted">Trams 指有轨电车。本题核对只覆盖有限参考，其他合理表达会保留为待核对。</p>}
   {q.options?<fieldset disabled={locked}><legend>选择图表练习 {index+1} 的答案</legend>{q.options.map(option=><label key={option}><input type="radio" name={`chart-${q.id}`} checked={r?.value===option} onChange={()=>patch(p=>setChartAnswer(p,q.id,option))}/><span lang="en">{option}</span></label>)}</fieldset>:<label className="field">图表练习 {index+1} 的英文<textarea rows={3} maxLength={1000} disabled={locked} value={r?.value||''} onChange={e=>patch(p=>setChartAnswer(p,q.id,e.target.value))}/></label>}
   {!!r?.hintLevel&&<aside role="status">{q.hints.slice(0,r.hintLevel).map(h=><p key={h}>{h}</p>)}</aside>}
   <div className="row wrap"><button className={feedback&&feedback.kind!=='error'?'btn secondary':'btn'} disabled={locked||!r?.value.trim()} onClick={()=>patch(p=>checkChartAnswer(p,q.id))}>核对图表练习 {index+1}</button><button className="btn secondary" disabled={locked||r?.hintLevel===2} onClick={()=>patch(p=>showChartHelp(p,q.id))}>提示图表练习 {index+1}</button></div>
   {feedback&&<div className="grammar-chart-feedback" role="status"><strong>{feedback.kind==='reference'?'有限参考一致':feedback.kind==='error'?'数据或关系有误，需修正':'保留原答 · 待人工核对'}</strong><p>{feedback.text}</p><p>本次核对：<span lang="en">{checked}</span></p><p className="small muted">{r.hintLevel||r.referenceViewed?'本项使用过帮助。':'本项尚未使用提示或参考。'} 首次核对回答已保留。</p>
    {r.firstChecked!==checked&&<p>首次核对：<span lang="en">{r.firstChecked}</span>{r.firstAssisted?'（当时使用过帮助）':''}</p>}
    <button className="btn secondary" aria-expanded={open} aria-controls={`chart-reference-${q.id}`} onClick={()=>{if(!open)patch(p=>showChartHelp(p,q.id,true));setReferences(ids=>open?ids.filter(id=>id!==q.id):[...ids,q.id])}}>查看图表练习 {index+1} 的参考</button>{open&&<div id={`chart-reference-${q.id}`}><p lang="en">{q.answer}</p><p>{q.explanation}</p>{!!q.accepted.length&&<details><summary>有限参考中的其他写法</summary><ul>{q.accepted.map(answer=><li key={answer} lang="en">{answer}</li>)}</ul></details>}</div>}
    <button className={feedback.kind==='error'?'btn secondary':'btn'} disabled={locked} onClick={()=>patch(p=>moveChartStep(p,index+1))}>{feedback.kind==='error'?(index===2?'稍后核对，继续写段落':'稍后修正，继续下一项'):(index===2?'换表格，写自己的段落':'继续图表下一项')}</button>
   </div>}
   {index>0&&<button className="text-btn" disabled={locked} onClick={()=>patch(p=>moveChartStep(p,index-1))}>返回图表上一项</button>}
  </article>})}
  {draft.position===3&&<article className="grammar-chart-exercise" aria-label="独立图表段落"><h4>再换一张表：自己选择概览与支持信息</h4>{table(lesson.independent.tableId)}<p>{lesson.independent.prompt}</p><label className="field">我的图表段落<textarea rows={5} maxLength={4000} disabled={locked} value={draft.paragraph} onChange={e=>{patch(p=>saveChartParagraph(p,e.target.value));setParagraphReference(false)}}/></label><button className={draft.checkedParagraph===null?'btn':'btn secondary'} disabled={locked||!draft.paragraph.trim()} onClick={()=>patch(checkChartParagraph)}>保存段落，进入自查</button>
   {draft.checkedParagraph!==null&&<div role="status"><strong>段落已记入当前页面 · 开放表达待人工核对</strong><p>自查数据和表达，不自动给这段文字打分。</p><ul>{lesson.independent.criteria.map(c=><li key={c}>{c}</li>)}</ul><button className="btn secondary" aria-expanded={paragraphReference} onClick={()=>setParagraphReference(!paragraphReference)}>对照一种段落写法</button>{paragraphReference&&<><p lang="en">{lesson.independent.reference}</p><p className="small muted">{lesson.independent.referenceNote}</p></>}</div>}
   <button className="text-btn" disabled={locked} onClick={()=>patch(p=>moveChartStep(p,2))}>返回图表比较</button>
  </article>}
 </section>;
}
