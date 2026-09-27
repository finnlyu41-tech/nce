import data from './data/textbook-grammar.json';
import pageMapping from './data/nce-pages.json';
import type {NceBookId} from './model';

export type GrammarEntry={id:string;book:NceBookId;lesson:number;lastLesson:number;unit:number|null;title:string;category:string;terms:string;sections:{section:string;page:number}[];pages:number[];references:{book:NceBookId;lesson:number}[]};
export const grammarEntries=data.entries as GrammarEntry[];
export const grammarCategories=data.categories;
export const grammarBooks=[{id:'NCE1',name:'第一册',description:'72 组：课文 → 配套句型与书面练习'},{id:'NCE2',name:'第二册',description:'4 个单元：关键句型 → 难点 → 复习'},{id:'NCE3',name:'第三册',description:'3 个单元：关键句型 → 综合难点 → 句式改写'},{id:'NCE4',name:'第四册',description:'6 个单元：句子结构与关键句型的综合运用'}] as const;
export function grammarEntryFor(book:NceBookId,lesson:number){return grammarEntries.find(e=>e.book===book&&lesson>=e.lesson&&lesson<=e.lastLesson)}
export function grammarLessonLabel(entry:GrammarEntry){return `第 ${entry.lesson}${entry.lastLesson!==entry.lesson?'–'+entry.lastLesson:''} 课`}
export function grammarUnitLabel(entry:GrammarEntry){
 if(entry.book==='NCE1')return '课文与配套句型';
 const size=entry.book==='NCE2'?24:entry.book==='NCE3'?20:8;
 return `Unit ${entry.unit} · 第 ${(entry.unit!-1)*size+1}–${entry.unit!*size} 课`;
}
export function grammarPrintedPage(book:NceBookId,page:number){return page-({NCE1:4,NCE2:40,NCE3:26,NCE4:29}[book])}
export function grammarSourceHash(book:NceBookId){return pageMapping[book].sourceSha256}
export function searchGrammar({book,query='',category}:{book?:NceBookId;query?:string;category?:string}){
 const terms=query.toLowerCase().trim().replace(/[第课册]/g,' ').split(/\s+/).filter(Boolean);
 return grammarEntries.filter(e=>(!book||e.book===book)&&(!category||e.category===category)&&terms.every(term=>{
  if(/^\d+$/.test(term))return Number(term)>=e.lesson&&Number(term)<=e.lastLesson;
  return `${e.title} ${e.terms} ${e.id} ${e.sections.map(s=>s.section).join(' ')} ${grammarCategories.find(c=>c.id===e.category)?.title}`.toLowerCase().includes(term);
 }));
}
