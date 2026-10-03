// Book-two metadata and task data only. Assessment remains the existing binder
// and the single production createCourseLoopModel; no new matcher/state model.
import {author} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
export function metadata(n,hash,title,goal,prerequisites,teaching,clips,own){
 return {id:`nce2-${n}`,version:1,book:'NCE2',lessons:[n],title:`第二册第${n}课 · ${title}`,goal,prerequisites,
  scope:'按题目情境、指代和词汇作答；这些是有限受控表达或明确标出的选择识别任务。大小写、空白、直弯撇号可变；陈述句可有一个英文句号或省略，直接问句保留一个问号；选择题只选所给完整选项。不匹配不代表其他自然英语错误。开放表达待人工核对。',
  source:{groupId:`NCE2-${n}`,route:`/#/nce/NCE2/${n}?tab=listen`,mapRoute:`/map/#/learn/nce2-${n}`,languagePath:`/language/NCE2/${n}.json`,languageSha256:hash,sourceSha256:hash,comicKey:`NCE2-${n}`,clips:teaching.map((t,i)=>({target:t.target,label:clips[i][2],start:clips[i][0],end:clips[i][1]}))},
  teaching:teaching.map(t=>({...t,source:t.target})),own:{id:`own-nce2-${n}`,prompt:own+' 使用真实信息或明确标注的虚构记录，保留首答与订正，未知事实先确认。',checks:teaching.map(t=>t.check),status:'awaiting-human-review',reviewerPrompt:'请伙伴或老师读/听原表达，核对意思、证据、时间、指代和自然表达；有限文字匹配不证明听力、口语或自主迁移。'},
  intervals:{first:86400000,repair:86400000,subsequent:604800000},rights:'original-authored',contentStatus:'authored-pending-independent-blind-review'};
}
// Rows retain the existing author API [context,prompt,key,nearMisses,why].
// Optional row[5] is a reviewed finite answer list; row[6] a choice override.
export function content(data,rows){
 const drafted=author(data,rows);
 const tasks=drafted.questions.map((q,i)=>{
  const choice=rows[i][6],id=`${q.stage}-nce2-${String(data.lessons[0]).padStart(3,'0')}-${q.target}`;
  return {...q,id,accepted:[...new Set(rows[i][5]||q.accepted)],...(choice?{kind:'choice',form:'choice',options:choice.options,prompt:rows[i][1]+' 只选所给完整选项，不改写。',criterion:'按情境选择所给的一整句。'}:{})};
 });
 return bindContent(data,tasks);
}
