import type {NceBookId} from './model';
import type {Page,PageIndex} from './lesson-context';
import scopedNotes from './data/source-review-r19-tail.json';
import relatedPages from './data/source-review-r19-tail-pages.json';

type ScopedNote={sourceWordId:string;book:NceBookId;lesson:number;word:string;sourceBookSha256:string;pdfPage:number;imageSha256:string;printedEntryId:string;literalCompleteVerified:boolean;fullInterpretationConfirmed:false;text:string};
type RelatedPage={book:NceBookId;lesson:number;sourceBookSha256:string;pdfPage:number;imageSha256:string;src:string;contextPages:Page[];printedLesson:number;contentAssociationLesson:number;publisherErratumVerified:false;text:string};
export const reviewedR19TailNotes=scopedNotes as ScopedNote[];
export const reviewedR19TailPages=relatedPages as RelatedPage[];
const same=(a:Page,b:Page)=>a.page===b.page&&a.sha256===b.sha256&&a.src===b.src;
const key=(word:string)=>word.trim().toLowerCase().replace(/’/g,"'");
const contextMatches=(entry:PageIndex['lessons'][string],pages:Page[])=>pages.every(expected=>entry.pages.filter(p=>p.page===expected.page).length===1&&entry.pages.some(p=>same(p,expected)));
const belongs=(index:PageIndex,book:NceBookId,lesson:number,page:Page)=>{
 const id=book+'-'+lesson,entry=index.lessons?.[id];
 return index.version===1&&Array.isArray(entry?.pages)&&entry.pages.filter(p=>p.page===page.page).length===1&&entry.pages.some(p=>same(p,page))&&!Object.entries(index.lessons).some(([other,l])=>other!==id&&other.startsWith(book+'-')&&l.pages.some(p=>p.page===page.page));
};

// Content-based navigation, explicitly retaining printed Lesson 80. No
// publisher correction or original literal recovery is implied by this link.
export function withR19TailPages(index:PageIndex):PageIndex{
 let lessons=index.lessons,changed=false;
 for(const r of reviewedR19TailPages){
  const id=r.book+'-'+r.lesson,entry=lessons?.[id],wanted={page:r.pdfPage,sha256:r.imageSha256,src:r.src};
  if(index.version!==1||index.sources?.[r.book]!==r.sourceBookSha256||!Array.isArray(entry?.pages)||!contextMatches(entry,r.contextPages)||!Array.isArray(entry.vocabulary?.pages)||entry.vocabulary.pages.includes(r.pdfPage))throw Error('配套练习原页与当前教材版本不一致，请重新加载教材。');
  const matches=entry.pages.filter(p=>p.page===r.pdfPage);
  if(matches.length>1||matches.length===1&&!same(matches[0],wanted)||Object.entries(lessons).some(([other,l])=>other!==id&&other.startsWith(r.book+'-')&&l.pages.some(p=>p.page===r.pdfPage)))throw Error('配套练习原页归属不一致，请重新加载教材。');
  if(matches.length)continue;
  if(!changed){lessons={...lessons};changed=true;}
  lessons[id]={...entry,pages:[...entry.pages,wanted]};
 }
 return changed?{...index,lessons}:index;
}

// Display only confirmed local context and explicit remaining uncertainty.
// These six IDs remain held; this path never supplies a dictionary/card meaning.
export function r19TailPageNotes(index:PageIndex,book:NceBookId,lesson:number,page:Page):string|undefined{
 if(!belongs(index,book,lesson,page))return;
 const entry=index.lessons[book+'-'+lesson],words=entry.vocabulary?.words;
 const notes=reviewedR19TailNotes.filter(r=>r.book===book&&r.lesson===lesson&&index.sources?.[book]===r.sourceBookSha256&&page.page===r.pdfPage&&page.sha256===r.imageSha256&&page.src==='/lesson-pages/'+r.imageSha256+'.jpg'&&entry.vocabulary?.pages.includes(page.page)&&Array.isArray(words)&&words.every(w=>typeof w.word==='string')&&words.filter(w=>w.word===r.word).length===1&&words.filter(w=>key(w.word)===key(r.word)).length===1).map(r=>'本课范围说明（完整条目仍待核）：'+r.text);
 const extra=reviewedR19TailPages.find(r=>r.book===book&&r.lesson===lesson&&index.sources?.[book]===r.sourceBookSha256&&page.page===r.pdfPage&&page.sha256===r.imageSha256&&page.src===r.src&&contextMatches(entry,r.contextPages)&&!entry.vocabulary?.pages.includes(r.pdfPage));
 if(extra)notes.push(extra.text);
 return notes.length?notes.join('\n'):undefined;
}
