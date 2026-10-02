import type {PageIndex} from './lesson-context';
import type {DictionaryEntry} from './language';
import pageMapping from './data/nce-pages.json';
import {reviewedSF02Associations,reviewedSF02DictionaryEntries} from './data/source-review-sf02';

const key=(word:string)=>word.trim().toLowerCase().replace(/’/g,"'");
const mismatch=()=>new Error('SF02 原书来源与当前词表不一致，请重新加载教材。');

export function withReviewedSF02Associations(index:PageIndex):PageIndex{
 let lessons=index.lessons,changed=false;
 for(const repair of reviewedSF02Associations){
  const id=repair.book+'-'+repair.lesson,entry=lessons?.[id],vocabulary=entry?.vocabulary;
  if(index.version!==1||index.sources?.[repair.book]!==repair.sourceBookSha256||pageMapping[repair.book].sourceSha256!==repair.sourceBookSha256||!Array.isArray(vocabulary?.words)||!Array.isArray(vocabulary?.pages)||!entry.pages?.some(page=>page.page===repair.sourcePDFPage&&page.sha256===repair.sourcePageSha256&&page.src==='/lesson-pages/'+repair.sourcePageSha256+'.jpg')||!vocabulary.pages.includes(repair.sourcePDFPage))throw mismatch();
  const words=vocabulary.words;
  const anchorWord=repair.word==='fussy'&&words.some(item=>key(item.word)==='balcony')?'balcony':repair.anchorWord;
  const anchors=words.flatMap((item,i)=>key(item.word)===key(anchorWord)?[i]:[]);
  const matches=words.flatMap((item,i)=>key(item.word)===key(repair.word)?[i]:[]);
  if(anchors.length!==1||matches.length>1)throw mismatch();
  const position=anchors[0]+(repair.placement==='after'?1:0);
  if(matches.length){
   const match=words[matches[0]],expected=repair.placement==='after'?position:position-1;
   if(matches[0]!==expected||!Array.isArray(match.forms)||match.forms.length)throw mismatch();
   continue;
  }
  const nextWords=[...words];nextWords.splice(position,0,{word:repair.word,forms:[]});
  if(!changed){lessons={...lessons};changed=true;}
  lessons[id]={...entry,vocabulary:{...vocabulary,words:nextWords}};
 }
 return changed?{...index,lessons}:index;
}

// Append-only read projection, after the existing dictionary parser validates
// its resource. Conflicts fail explicitly rather than replacing a definition.
export function withReviewedSF02Dictionary(words:Record<string,DictionaryEntry>):Record<string,DictionaryEntry>{
 let result=words;
 for(const item of reviewedSF02DictionaryEntries){
  const evidence=reviewedSF02Associations.find(row=>row.book===item.book&&row.word===item.word);
  if(!evidence||evidence.sourceBookSha256!==pageMapping[item.book].sourceSha256||evidence.printedGloss!==item.meaning)throw mismatch();
  const entry:DictionaryEntry={word:item.word,ipa:item.ipa,meaning:item.meaning,source:item.source};
  if(Object.hasOwn(words,item.word)){
   const existing=words[item.word];
   if(existing.word!==entry.word||existing.ipa!==entry.ipa||existing.meaning!==entry.meaning||existing.source!==entry.source)throw mismatch();
   continue;
  }
  if(result===words)result={...words};
  result[item.word]=entry;
 }
 return result;
}
