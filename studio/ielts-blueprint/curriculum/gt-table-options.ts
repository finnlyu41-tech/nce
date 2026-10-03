import type {Variant,OfficialSource} from '../types';
import type {SampleLesson,SampleMaterial} from '../sample-sequence';
import type {CurriculumBinding} from './types';
import type {GTTableOptionsStimulus} from './gt-table-options/types';
import authored from './gt-table-options/authored.json';

export const gtTableOptionSections=authored.sections;
const sectionFor=(id:string)=>gtTableOptionSections.find(s=>'gt-table-'+s.id===id);
export function gtTableOptionsStimulusFor(id:string):GTTableOptionsStimulus|undefined{
 const s=sectionFor(id);if(!s)return undefined;
 return {options:s.options,table:{
  version:1,kind:'table-completion',id,caption:s.sourceTitle+' — service actions',
  instruction:s.instruction+' '+s.instructionZh,rowHeaderLabel:'Service',
  columns:[{id:'condition',label:'Condition'},{id:'action',label:'Action'}],
  rows:s.rows.map((r,i)=>({id:'row-'+(i+1),label:r.service,cells:{
   condition:{kind:'text',text:r.condition},action:{kind:'blank',questionId:r.qid,questionNumber:i+1}
  }}))
 }};
}
const material=(stage:string):SampleMaterial=>{
 const s=gtTableOptionSections.find(item=>item.id===stage);if(!s)throw Error('Missing GT table material');
 return {id:'gt-table-'+stage,title:s.title,instruction:s.instruction+' '+s.instructionZh,context:s.sourceText,
  questions:s.rows.map(r=>({id:r.qid,prompt:r.service+' / '+r.condition+' → Action',accepted:[r.answer],
   options:s.options.map(o=>o.letter),why:r.explanation+' 原文：'+r.evidence})),
  hint:'按 Service 与 Condition 合起来定位，再比较 Action 的意思。原文与选项有同义改写；提到的操作可能属于另一条件。',
  checklist:['每格只选一个字母；本篇每个字母最多使用一次。','核对行标题与条件，不把另一项服务的动作移到本行。','说明具体依据；订正与首答分开保存。'],
  seconds:180,...(stage==='model'?{modelNotes:['先按行标题确定服务，再按条件找证据；只出现同一个词还不够。','原文 pay the balance 可以对应选项 clear the debt，核对整句意思。','本题选字母，不抄选项全文或原文词语。各题的复用与回答形式仍应看自己的说明。']}:{}),
 };
};
export const gtTableOptionsLesson:SampleLesson={
 id:'reading-gt-table-options',skill:'reading',title:'General Training · 选项式表格专项',
 goal:'结合行标题与条件，比较选项的完整意思，选择有依据的操作。',
 explanation:['这是 GT 场景的原创专项：日常通知与工作程序，表格每行问一个条件下应采取的操作。',
  '先读 Service、Condition、Action，再到文章中定位。选项会改写原文；不能只凭同一个词或想当然。',
  '本篇从 A–F 为每格选择一个字母，每个字母最多使用一次。这是本题明示的规则，其他题按各自说明。',
  'GT 官方说明包含表格填空；British Council 教师资料讨论列表与 completion 的共通方法。本练习的字母选项表格形式是原创教学设置，尚未核得直接 GT 官方样题。',
  '示范展示答案；引导留方法；独立及限时用新材料。限时在主动开始前隐藏，提交后保留原答，再分别订正。'],
 boundary:'六篇原创三题小表格。180 秒为本站预算；不代表正式单题时限、完整 GT 阅读或校准难度。不评 IELTS Band；实际隔日保持与专家教学评阅尚未验证。',
 model:material('model'),guided:material('guided'),independent:material('independent'),timed:material('timed'),reviews:[material('review-a'),material('review-b')],
};
export function gtTableOptionsLessonsFor(variant:Variant):SampleLesson[]{
 if(variant!=='academic'&&variant!=='general-training')throw new RangeError('Choose an exam category.');
 return variant==='general-training'?[gtTableOptionsLesson]:[];
}
export function gtTableOptionFeedback(id:string,qid:string,raw:string):string|undefined{
 const row=sectionFor(id)?.rows.find(r=>r.qid===qid);if(!row)return undefined;
 const letter=raw.trim().toUpperCase();
 if(!/^[A-F]$/.test(letter))return '本题每格只接受 A–F 中一个字母。原答保留；请核对题面再选择。';
 return (row.feedback as Record<string,string>)[letter];
}
export const gtTableOptionsSources:readonly OfficialSource[]=[
 {id:'gt-table-format-20261003',title:'IELTS General Training Reading format',url:'https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-reading',publisher:'IELTS',checkedAt:'2026-10-03',verification:'direct-open',scope:'Type 6 includes incomplete table cells; current GT page describes taking words from text. Answers may not follow text order; question count varies.',caveat:'Does not directly verify selecting-letter GT table subtype. Local authored letter selection is teaching practice, not an official sample.'},
 {id:'bc-completion-teacher-202606',title:'Reading Completion Questions — teacher resource',url:'https://takeielts.britishcouncil.org/sites/default/files/2026-06/reading_completion_questions_.pdf',publisher:'British Council',checkedAt:'2026-10-03',verification:'direct-open',scope:'Introduces Academic and GT reading and discusses summary list/source-word alternatives with common summary/note/table/flow-chart strategies.',caveat:'Indirect teaching basis, not a direct GT selecting-letter table sample. Local A–F, no reuse, three blanks and 180 seconds are printed author choices.'}
];
const l=gtTableOptionsLesson;
export const gtTableOptionsCoverage:readonly CurriculumBinding[]=[{
 id:'gt-table-options-R12-GT',lessonId:l.id,variants:['general-training'],requirementIds:['R12-GT'],
 sourceIds:['gt-table-format-20261003','bc-completion-teacher-202606'],sourceLocator:'GT Type 6 table form; BC completion teaching strategies. Letter-list table authored locally; direct GT subtype evidence remains unverified.',
 content:{path:'ielts-blueprint/curriculum/gt-table-options.ts',symbol:'gtTableOptionsLesson'},rights:'original-fictional',delivery:'text',contentStatus:'authored-not-expert-reviewed',integrationStatus:'pending-owner-integration',
 stages:{
  explain:{materialIds:[],activity:'说明行列定位、改写与本题字母规则。',expectedEvidence:'lesson.explanation；说明阅读不计作掌握。'},
  model:{materialIds:[l.model.id],activity:'真实填表与原文依据示范。',expectedEvidence:'字母、选项、服务/条件坐标和证据。'},
  guided:{materialIds:[l.guided.id],activity:'留方法，用新工作材料选择。',expectedEvidence:'原答与提示条件；提交后逐项反馈。'},
  independent:{materialIds:[l.independent.id],activity:'新材料撤提示首答。',expectedEvidence:'逐格 raw/fresh/hinted 与公开题面。'},
  timed:{materialIds:[l.timed.id],activity:'主动开始后显示新题。',expectedEvidence:'startedAt/elapsedMs；本地180秒不换Band。'},
  feedback:{materialIds:[l.independent.id,l.timed.id],activity:'显示原答与该干扰项的条件差异，另写订正。',expectedEvidence:'原attempt与独立correctionAnswers/correctionNote。'},
  review:{materialIds:l.reviews.map(m=>m.id),activity:'既有间隔安排换新材料复验。',expectedEvidence:'到期、首答、新材料与提示记录；没有实际24小时证据。'}
 },
 coverageBoundary:'局部 GT 场景列表填表教学链。直接 GT selecting-letter table 官方样题未核得；GT 原文取词表格、完整长文/混合卷/正式分数与人工效果验证仍缺，不能把注册或走完课程计为已达到Band。',
}];
