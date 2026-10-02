import type {NceBookId} from './model';
import type {Page,PageIndex} from './lesson-context';
import pageMapping from './data/nce-pages.json';
import {reviewedSourceAssociations,reviewedPageClarifications} from './data/source-review-batch1';
import {reviewedPrintedSourceAssociations} from './data/source-review-sf01';
import {withReviewedSF02Associations} from './source-review-sf02';
import {withR19SupplementalPages,r19SourcePageNotes} from './source-review-r19';

const key=(word:string)=>word.trim().toLowerCase().replace(/’/g,"'");
const mismatch=()=>new Error('已核对的原书来源与当前词表不一致，请重新加载教材。');

// Read-only projection: keep the raw bundle, dictionary, original lessons and
// all learning State untouched. Reusing the existing forms keeps word identity.
export function withReviewedSourceAssociations(index:PageIndex):PageIndex{
 index=withR19SupplementalPages(withReviewedSF02Associations(index));
 let lessons=index.lessons,changed=false;
 for(const repair of reviewedSourceAssociations){
  const lessonId=repair.book+'-'+repair.lesson,entry=lessons?.[lessonId];
  const vocabulary=entry?.vocabulary,existing=lessons?.[repair.existingBook+'-'+repair.existingLesson]?.vocabulary;
  if(index.version!==1||index.sources?.[repair.book]!==repair.sourceBookSha256||index.sources?.[repair.existingBook]!==pageMapping[repair.existingBook].sourceSha256||!Array.isArray(vocabulary?.words)||!Array.isArray(vocabulary?.pages)||!Array.isArray(existing?.words)||!entry.pages?.some(page=>page.page===repair.sourcePDFPage&&page.sha256===repair.sourcePageSha256&&page.src==='/lesson-pages/'+repair.sourcePageSha256+'.jpg')||!vocabulary.pages.includes(repair.sourcePDFPage))throw mismatch();
  const originals=existing.words.filter(item=>typeof item.word==='string'&&key(item.word)===key(repair.word));
  if(originals.length!==1||!Array.isArray(originals[0].forms)||!originals[0].forms.every(form=>typeof form==='string'))throw mismatch();
  const matches=vocabulary.words.filter(item=>typeof item.word==='string'&&key(item.word)===key(repair.word));
  if(matches.length>1)throw mismatch();
  if(matches.length){
   if(JSON.stringify(matches[0].forms)!==JSON.stringify(originals[0].forms))throw mismatch();
   continue;
  }
  const position=vocabulary.words.findIndex(item=>typeof item.word==='string'&&key(item.word)===key(repair.beforeWord));
  if(position<0)throw mismatch();
  const words=[...vocabulary.words];words.splice(position,0,{word:repair.word,forms:[...originals[0].forms]});
  if(!changed){lessons={...lessons};changed=true;}
  lessons[lessonId]={...entry,vocabulary:{...vocabulary,words}};
 }
 // Newly recovered printed heads have no indexed inflections to reuse. Bind
 // them to the exact edition/page/anchor and add only the literal headword.
 // The dictionary and enrollment merge still determine saved-word identity.
 for(const repair of reviewedPrintedSourceAssociations){
  const lessonId=repair.book+'-'+repair.lesson,entry=lessons?.[lessonId],vocabulary=entry?.vocabulary;
  if(index.version!==1||index.sources?.[repair.book]!==repair.sourceBookSha256||!Array.isArray(vocabulary?.words)||!Array.isArray(vocabulary?.pages)||!entry.pages?.some(page=>page.page===repair.sourcePDFPage&&page.sha256===repair.sourcePageSha256&&page.src==='/lesson-pages/'+repair.sourcePageSha256+'.jpg')||!vocabulary.pages.includes(repair.sourcePDFPage))throw mismatch();
  const matches=vocabulary.words.filter(item=>typeof item.word==='string'&&key(item.word)===key(repair.word));
  const anchors=vocabulary.words.filter(item=>typeof item.word==='string'&&key(item.word)===key(repair.anchorWord));
  if(matches.length>1||anchors.length!==1||matches.length&&(!Array.isArray(matches[0].forms)||matches[0].forms.length))throw mismatch();
  const anchor=vocabulary.words.indexOf(anchors[0]),position=anchor+(repair.placement==='after'?1:0);
  if(matches.length){
   if(vocabulary.words.indexOf(matches[0])!==(repair.placement==='after'?anchor+1:anchor-1))throw mismatch();
   continue;
  }
  const words=[...vocabulary.words];words.splice(position,0,{word:repair.word,forms:[]});
  if(!changed){lessons={...lessons};changed=true;}
  lessons[lessonId]={...entry,vocabulary:{...vocabulary,words}};
 }
 return changed?{...index,lessons}:index;
}

export function sourcePageClarification(index:PageIndex,book:NceBookId,lesson:number,page:Page):string|undefined{
 const legacy=reviewedPageClarifications.find(note=>note.book===book&&note.lesson===lesson&&index.sources?.[book]===note.sourceBookSha256&&page.page===note.sourcePDFPage&&page.sha256===note.sourcePageSha256&&page.src==='/lesson-pages/'+note.sourcePageSha256+'.jpg'&&index.lessons?.[book+'-'+lesson]?.pages.some(item=>item.page===page.page&&item.sha256===page.sha256&&item.src===page.src))?.text;
 return [legacy,r19SourcePageNotes(index,book,lesson,page)].filter(Boolean).join('\n')||undefined;
}
