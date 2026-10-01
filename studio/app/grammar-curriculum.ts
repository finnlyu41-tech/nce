import core from './data/grammar-curriculum/core-units.json';
import extensions from './data/grammar-curriculum/extension-units.json';
import timeline from './data/grammar-curriculum/depth-b1/timeline.json';
import passive from './data/grammar-curriculum/depth-b1/passive.json';
import reported from './data/grammar-curriculum/depth-b1/reported.json';
import complements from './data/grammar-curriculum/depth-b1/complements.json';
import negative from './data/grammar-curriculum/depth-b1/negative.json';
import {grammarClauseUnits} from './grammar-curriculum-clauses';
import {grammarEntries,grammarGuides,grammarGuidesFor,type GrammarEntry} from './textbook-grammar';
import type {NceBookId} from './model';
import type {GrammarUnit,GrammarStage,GrammarPurpose,GrammarStageId} from './grammar-curriculum-types';

export const grammarCurriculumVersion=1;
export const grammarUnits=[...core,...extensions,timeline,passive,reported,complements,negative,...grammarClauseUnits].sort((a,b)=>a.order-b.order) as GrammarUnit[];
export const grammarPurposes:GrammarPurpose[]=[
 {id:'describe',title:'介绍与描述',context:'身份、状态、环境和日常生活',ieltsUse:'口语介绍熟悉的人和地点；写作描述对象或现象'},
 {id:'ask',title:'询问信息',context:'问清事实、时间、地点和能力',ieltsUse:'口语交流与澄清信息'},
 {id:'story',title:'叙述经历',context:'事件发生的时间、先后与背景',ieltsUse:'口语讲述经历；阅读辨认事件关系'},
 {id:'progress',title:'说明进展',context:'常态、临时变化、已完成的事',ieltsUse:'口语汇报进展；写作区分变化与当前状态'},
 {id:'compare',title:'比较与选择',context:'数量、程度、优缺点与选择',ieltsUse:'写作比较数据；口语解释选择'},
 {id:'advise',title:'建议与规则',context:'建议、必须、不必和不允许',ieltsUse:'口语提出建议；写作讨论措施与责任'},
 {id:'plan',title:'计划与条件',context:'打算、安排、假设和备用方案',ieltsUse:'口语谈计划；写作说明条件和可能结果'},
 {id:'reason',title:'原因与转折',context:'支持观点、解释原因和承认另一面',ieltsUse:'写作组织论证；阅读识别逻辑关系'},
];
const foundation=['be','be-question','pronouns','articles','possession','adjectives','countable','double-object','place','imperative','there-be','some-any','origin','word-order','have','time-prepositions','indefinite','none','negative-scope','distance'];
const time=['present-simple','present-continuous','present-contrast','past-be','past-simple','past-continuous','present-perfect','past-or-perfect','already-yet','past-perfect','going-to','will','future-choice','future-continuous','future-perfect','perfect-continuous','past-perfect-continuous','used-to','ago-before','always-continuous','future-be','future-perfect-continuous','verb-review'];
const meaning=['can','obligation','had-better','should','may','deduction-now','deduction-past','past-ability','could-have','need-doing','comparison','quantity','degree','adverbs','same-different','double-comparison','verb-prepositions','phrasal-verbs','be-used-to','except','complex-sentences','reason','concession','condition-real','purpose','so-such','time-clause'];
const classified=new Set([...foundation,...time,...meaning]);
export const grammarStages:GrammarStage[]=[
 {id:'foundation',title:'1 · 句子与基本信息',description:'先说清谁、做什么、是什么；再问清楚和说明数量。',guideIds:foundation},
 {id:'time',title:'2 · 时间与动作关系',description:'区分常态、当前活动、过去事件、完成与先后。',guideIds:time},
 {id:'meaning',title:'3 · 选择、语气与逻辑',description:'比较、建议、推测，再用原因、转折和条件连接意思。',guideIds:meaning},
 {id:'extension',title:'4 · 长句与表达变换',description:'被动、从句、非谓语与改写；先还原主干，再增加信息。',guideIds:Object.keys(grammarGuides).filter(id=>!classified.has(id))},
];

const entryGuideIds=new Map(grammarEntries.map(e=>[e.id,grammarGuidesFor(e).map(g=>g.id)]));
export function grammarUnitFor(id:string){return grammarUnits.find(unit=>unit.id===id)}
export function lessonsForGrammarUnit(unit:GrammarUnit,book?:NceBookId){
 return grammarEntries.filter(entry=>(!book||entry.book===book)&&entryGuideIds.get(entry.id)!.some(id=>unit.guideIds.includes(id)))
  .map(entry=>({book:entry.book,lesson:entry.lesson,lastLesson:entry.lastLesson,guideIds:entryGuideIds.get(entry.id)!.filter(id=>unit.guideIds.includes(id))}));
}
export function lessonsForGrammarGuide(id:string){return grammarEntries.filter(entry=>entryGuideIds.get(entry.id)!.includes(id))}
export function grammarPracticeLink(unit:GrammarUnit,guideId:string,book?:NceBookId){
 if(!unit.guideIds.includes(guideId))return undefined;
 return lessonsForGrammarUnit(unit,book).find(link=>link.guideIds.includes(guideId));
}
export function grammarPrerequisites(unit:GrammarUnit){return unit.prerequisites.flatMap(id=>{const previous=grammarUnitFor(id);return previous?[previous]:[]})}
export const grammarCoverage=()=>({
 textbookEntries:grammarEntries.length,existingGuides:Object.keys(grammarGuides).length,
 completeUnits:grammarUnits.length,deepenedGuides:new Set(grammarUnits.flatMap(unit=>unit.guideIds)).size,
});
const searchText=(unit:GrammarUnit)=>[
 unit.title,unit.goal,...unit.explanation,...unit.guideIds.map(id=>grammarGuides[id]?.title||id),
 ...unit.purposeIds.flatMap(id=>{const p=grammarPurposes.find(p=>p.id===id);return p?[p.title,p.context,p.ieltsUse]:[]}),
 ...unit.forms.flatMap(f=>[f.form,f.meaning,f.useWhen]),...unit.contrasts.flatMap(c=>[c.label,c.a.en,c.a.zh,c.b.en,c.b.zh,c.why]),
 ...unit.mistakes.flatMap(m=>[m.wrong,m.correct,m.why]),...unit.practices.map(p=>p.prompt),unit.transfer.prompt,
].join(' ').toLowerCase();
export function searchGrammarUnits({query='',stageId,purposeId,book}:{query?:string;stageId?:GrammarStageId;purposeId?:string;book?:NceBookId}={}){
 const terms=query.trim().toLowerCase().replace(/第\s*(\d+)\s*课/g,'$1').split(/\s+/).filter(Boolean);
 return grammarUnits.filter(unit=>{
  if(stageId&&unit.stageId!==stageId||purposeId&&!unit.purposeIds.includes(purposeId))return false;
  const links=lessonsForGrammarUnit(unit,book);if(book&&!links.length)return false;
  const numbers=terms.filter(t=>/^\d+$/.test(t)).map(Number),bookTerms=terms.filter(t=>/^nce[1-4]$/.test(t));
  // A book and lesson must match the same real association; separate matches would invent a link.
  if((numbers.length||bookTerms.length)&&!links.some(link=>numbers.every(no=>no>=link.lesson&&no<=link.lastLesson)&&bookTerms.every(t=>t===link.book.toLowerCase())))return false;
  const text=searchText(unit);return terms.filter(t=>!/^\d+$|^nce[1-4]$/.test(t)).every(t=>text.includes(t));
 });
}
export function searchGrammarConcepts(query='',stageId?:GrammarStageId){
 const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 return grammarStages.filter(s=>!stageId||s.id===stageId).flatMap(stage=>stage.guideIds.flatMap(id=>{
  const guide=grammarGuides[id],text=[id,guide.title,guide.idea,guide.pattern,...guide.explain].join(' ').toLowerCase();
  return terms.every(term=>text.includes(term))?[{id,stage,guide,deepened:grammarUnits.some(unit=>unit.guideIds.includes(id))}]:[];
 }));
}
export function guideBelongsToEntry(entry:GrammarEntry,id:string){return entryGuideIds.get(entry.id)?.includes(id)===true}
