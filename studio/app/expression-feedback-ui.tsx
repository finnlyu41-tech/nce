'use client';
import {expressionFeedback,compareExpression,type ExpressionContext} from './expression-feedback';

export function ExpressionFeedback({text,before,context={}}:{text:string;before?:string;context?:ExpressionContext}){
 const issues=expressionFeedback(text,context),comparison=before?compareExpression(before,text,context):null;
 return <section className="expression-feedback" aria-label="这版表达的文字检查" aria-live="polite">
  <h4>{issues.length?'这一遍先看这'+(issues.length===1?'一处':'两处'):'未发现这些常见问题'}</h4>
  {comparison&&<p className="comparison-note">{!comparison.changed?'这一版与上一版的用词相同。若意思已经清楚，下一步换个情境检验。':comparison.resolved.length?`这次已避开：${comparison.resolved.map(i=>i.title).join('；')}。`:'你已改写这一版，接着检查意思是否保持清楚。'}</p>}
  {issues.map(issue=><article key={issue.id}>
   <strong>{issue.title}</strong><p className="issue-evidence" lang="en">你写的：<q>{issue.evidence||'还没有完整的英文句子'}</q></p>
   <p>{issue.action}</p>{issue.example&&<p>这一小段可以改为：<b lang="en">{issue.example}</b></p>}
  </article>)}
  {!issues.length&&<p>再读给自己听：别人能知道你在说谁、发生了什么吗？需要时补一个具体细节。</p>}
  <p className="small muted">只检查写下来的内容和少量常见错误；未检出不代表全部正确，也不判断发音或雅思分数。</p>
 </section>;
}
