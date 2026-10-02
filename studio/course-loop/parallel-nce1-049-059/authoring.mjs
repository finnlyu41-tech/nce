// Authored task data only; assessment and event history use ../model.mjs.
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
export const stages=['diagnostic','guided','independent','repair','review-a','review-b'];
const contractions=[['does not',"doesn't"],['do not',"don't"],['is not',"isn't"],['are not',"aren't"],['cannot',"can't"],['He is',"He's"],['She is',"She's"],['It is',"It's"],['They are',"They're"],['We are',"We're"],['I am',"I'm"],['What is',"What's"],['What are',"What're"]];
export function variants(answer){
 let values=[answer];
 for(const [a,b] of contractions)for(const s of [...values])if(s.includes(a)&&!/[A-Za-z']/u.test(s.slice(s.indexOf(a)+a.length,s.indexOf(a)+a.length+1)))values.push(s.replace(a,b));
 const lowerStart=s=>s.replace(/^(The|He|She|They|We|It|What|Do|Does)\b/,m=>m.toLowerCase()).replace(/^(He's|She's|They're|We're|It's|What's|What're)/,m=>m.toLowerCase());
 for(const s of [...values]){
  const m=s.match(/^(.*) (at night|at noon|in the morning|in the afternoon|in the evening|every day)([.?])$/);
  if(m&&!s.includes(' but '))values.push(m[2][0].toUpperCase()+m[2].slice(1)+', '+lowerStart(m[1])+m[3]);
  if(s.endsWith(' now.')||s.endsWith(' now?')){const end=s.at(-1),base=s.slice(0,-5);values.push('Now, '+lowerStart(base)+end);
   if(end==='?')values.push(base.replace(/ doing$/,' now doing')+end);
   else {const mid=base.replace(/\b(am|is|are)( not)? /,'$1$2 now ').replace(/\b(isn't|aren't) /,'$1 now ').replace(/^(I'm|He's|She's|They're|We're) (not )?/,'$1 $2now ');if(mid!==base)values.push(mid+end);}
  }
 }
 values.push(...values.filter(s=>s.includes(',')).map(s=>s.replaceAll(',','')));return [...new Set(values)];
}
export function author(lesson,rows){
 const questions=rows.map((r,i)=>{
  const [context,prompt,answer,bads,why]=r,stage=stages[Math.floor(i/3)],teaching=lesson.teaching[i%3],form=answer.endsWith('?')?'question':'statement';
  const boundary=form==='question'?'句末用一个英文问号。':'可省略句末标点或用一个英文句号。';
  return {id:`${stage}-n${lesson.lessons[0]}-${teaching.target}`,stage,target:teaching.target,kind:'input',form,context:(stage==='repair'?'保留上一轮首答和订正。下面是另一情境：':'')+context,prompt:prompt+' 只写题目指定的句子或补入部分，不添加其他信息。'+boundary+(stage==='guided'?' 提示：'+teaching.check:''),accepted:variants(answer),counterexamples:bads.map(([answer,reason])=>({answer,reason})),criterion:prompt+' '+boundary,why,novelty:context};
 });
 return {lesson,questions,...bindContent(lesson,questions)};
}
export function metadata(n,hash,title,goal,prerequisites,teaching,clips,own){return {
 id:`nce1-${n}`,version:1,book:'NCE1',lessons:[n,n+1],title:`第${n}–${n+1}课 · ${title}`,goal,prerequisites,
 scope:'题目规定了情境、主语和词汇；本组匹配这些限定输出。大小写、空白、直弯缩写撇号可变化，陈述句末句号可省略，问句须保留一个问号。限定题未匹配不代表其他自然英文错误。自由表达由伙伴核对。',
 source:{groupId:`NCE1-${n}`,route:`/#/nce/NCE1/${n}?tab=listen`,mapRoute:`/map/#/learn/nce1-${n}`,languagePath:`/language/NCE1/${n}.json`,languageSha256:hash,sourceSha256:hash,comicKey:`NCE1-${n}`,clips:teaching.map((t,i)=>({target:t.target,label:clips[i][2],start:clips[i][0],end:clips[i][1]}))},
 teaching:teaching.map(t=>({...t,source:t.target})),own:{id:`own-n${n}`,prompt:own+' 请保留初答和订正；使用真实信息或明确标注的虚构情境，不知道的事实先确认。',checks:teaching.map(t=>t.check),status:'awaiting-human-review',reviewerPrompt:'请伙伴或老师实际听/读并核对意思、主语、时间与自然表达；本组文字匹配不证明听力或发音通过。'},
 intervals:{first:86400000,repair:86400000,subsequent:604800000},rights:'original-authored',contentStatus:'authored-pending-independent-blind-review'
}}
