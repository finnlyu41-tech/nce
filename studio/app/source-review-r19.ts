import type {NceBookId} from './model';
import type {Page,PageIndex} from './lesson-context';
import sourceNotes from './data/source-review-r19.json';
import {withR19TailPages,r19TailPageNotes} from './source-review-r19-tail';
import supplementalPages from './data/source-review-r19-pages.json';

type SourceNote={sourceWordId:string;kind:'interpretation'|'identity';book:NceBookId;lesson:number;word:string;sourceBookSha256:string;pdfPage:number;imageSha256:string;printedEntryId:string;printedPartOfSpeech:string|null;printedGloss:string|null;target:string;boundary:string;text:string};
type SupplementalPage={book:NceBookId;lesson:number;sourceBookSha256:string;pdfPage:number;imageSha256:string;src:string;anchorPage:Page;text:string};
export const reviewedR19SourceNotes=sourceNotes as SourceNote[];
export const reviewedR19SupplementalPages=supplementalPages as SupplementalPage[];
const samePage=(a:Page,b:Page)=>a.page===b.page&&a.sha256===b.sha256&&a.src===b.src;
const mismatch=()=>new Error('补充原书页与当前教材版本不一致，请重新加载教材。');

// Append exact reviewed exercise pages to the display projection only. The
// original bundle, vocabulary pages, headwords and all saved State stay intact.
export function withR19SupplementalPages(index:PageIndex):PageIndex{
 let lessons=index.lessons,changed=false;
 for(const r of reviewedR19SupplementalPages){
  const id=r.book+'-'+r.lesson,entry=lessons?.[id];
  if(index.version!==1||index.sources?.[r.book]!==r.sourceBookSha256||!Array.isArray(entry?.pages)||entry.pages.filter(p=>p.page===r.anchorPage.page).length!==1||!entry.pages.some(p=>samePage(p,r.anchorPage))||!Array.isArray(entry.vocabulary?.pages)||entry.vocabulary.pages.includes(r.pdfPage))throw mismatch();
  const wanted={page:r.pdfPage,sha256:r.imageSha256,src:r.src};
  const matches=entry.pages.filter(p=>p.page===r.pdfPage);
  if(matches.length>1||matches.length===1&&!samePage(matches[0],wanted)||Object.entries(lessons).some(([other,l])=>other!==id&&other.startsWith(r.book+'-')&&l.pages.some(p=>p.page===r.pdfPage)))throw mismatch();
  if(matches.length)continue;
  if(!changed){lessons={...lessons};changed=true;}
  lessons[id]={...entry,pages:[...entry.pages,wanted]};
 }
 return withR19TailPages(changed?{...index,lessons}:index);
}

// Explanations are scoped to an edition, original full page and unique literal
// catalog head. This deliberately does not feed lookup/enrollment definitions.
export function r19SourcePageNotes(index:PageIndex,book:NceBookId,lesson:number,page:Page):string|undefined{
 const entry=index.lessons?.[book+'-'+lesson];
 if(index.version!==1||!entry?.pages.some(p=>samePage(p,page))||entry.pages.filter(p=>p.page===page.page).length!==1||Object.entries(index.lessons).some(([id,l])=>id!==book+'-'+lesson&&id.startsWith(book+'-')&&l.pages.some(p=>p.page===page.page)))return;
 const words=entry.vocabulary?.words;
 const notes=reviewedR19SourceNotes.filter(r=>r.book===book&&r.lesson===lesson&&index.sources?.[book]===r.sourceBookSha256&&page.page===r.pdfPage&&page.sha256===r.imageSha256&&page.src==='/lesson-pages/'+r.imageSha256+'.jpg'&&entry.vocabulary?.pages.includes(page.page)&&Array.isArray(words)&&words.filter(w=>w.word===r.word).length===1&&words.filter(w=>w.word.trim().toLowerCase().replace(/’/g,"'")===r.word.trim().toLowerCase().replace(/’/g,"'")).length===1).map(r=>r.text);
 const extra=reviewedR19SupplementalPages.find(r=>r.book===book&&r.lesson===lesson&&index.sources?.[book]===r.sourceBookSha256&&page.page===r.pdfPage&&page.sha256===r.imageSha256&&page.src===r.src&&entry.pages.filter(p=>p.page===r.anchorPage.page).length===1&&entry.pages.some(p=>samePage(p,r.anchorPage))&&!entry.vocabulary?.pages.includes(r.pdfPage));
 if(extra)notes.push(extra.text);
 const tail=r19TailPageNotes(index,book,lesson,page);if(tail)notes.push(tail);
 return notes.length?notes.join('\n'):undefined;
}
