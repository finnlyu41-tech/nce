import {bookCounts,type NceBookId} from './model';
import pageMapping from './data/nce-pages.json';
import type {Page,PageIndex} from './lesson-context';
import type {DictionaryEntry} from './language';
import {vocabularySourceCorrections} from './data/vocabulary-source-corrections';
import {withReviewedSourceAssociations} from './source-review-batch1';

export type VocabularySource={book:NceBookId;lesson:number;title:string;pages:Page[]};
export type VocabularyLesson=VocabularySource&{key:string;words:{word:string;forms:string[]}[]};
export type VocabularyTerm={key:string;word:string;sources:VocabularySource[]};
export type VocabularyCatalog={lessons:VocabularyLesson[];terms:VocabularyTerm[];entries:number};
export const vocabularyKey=(word:string)=>word.trim().toLowerCase().replace(/’/g,"'");
const searchable=(text:string)=>vocabularyKey(text).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
export const vocabularyLetter=(word:string)=>searchable(word).match(/[a-z]/)?.[0].toUpperCase()||'';

// The existing, source-bound page bundle is the only textbook word-list input.
// An empty list is a recorded textbook state, not missing data or a paired list.
export function buildVocabularyCatalog(index:PageIndex):VocabularyCatalog{
 index=withReviewedSourceAssociations(index);
 const lessons:VocabularyLesson[]=[],terms=new Map<string,VocabularyTerm>();
 let entries=0;
 for(const [book,count] of Object.entries(bookCounts) as [NceBookId,number][]){
  if(index.version!==1||index.sources?.[book]!==pageMapping[book].sourceSha256)throw Error('教材版本与词汇索引不一致，请重新加载。');
  for(let lesson=1;lesson<=count;lesson++){
   const key=`${book}-${lesson}`,entry=index.lessons?.[key],vocabulary=entry?.vocabulary;
   if(!entry||typeof entry.title!=='string'||!Array.isArray(entry.pages)||!vocabulary||!Array.isArray(vocabulary.words)||vocabulary.words.length>100||!Array.isArray(vocabulary.pages)||!vocabulary.pages.length)throw Error('教材词表资料不完整，请重新加载。');
   const pages=entry.pages.filter(p=>vocabulary.pages.includes(p.page));
   if(pages.length!==vocabulary.pages.length||!pages.every(p=>Number.isInteger(p.page)&&p.page>0&&p.page<=pageMapping[book].pageCount&&/^[a-f0-9]{64}$/.test(p.sha256)&&p.src===`/lesson-pages/${p.sha256}.jpg`))throw Error('词表的原书页码需要核对。');
   const source:VocabularySource={book,lesson,title:entry.title,pages},seen=new Set<string>();
   for(const item of vocabulary.words){
    if(typeof item.word!=='string'||!item.word.trim()||item.word.length>100||!Array.isArray(item.forms)||!item.forms.every(f=>typeof f==='string'))throw Error('词表内容需要核对。');
    const wordKey=vocabularyKey(item.word);
    if(seen.has(wordKey))throw Error('本课词表有重复项，需要核对。');
    seen.add(wordKey);
   }
   const corrections=vocabularySourceCorrections.filter(c=>c.book===book&&c.lesson===lesson);
   // Keep the source gate when the duplicate has already been removed.
   for(const correction of corrections){
    if(!pages.some(page=>page.page===correction.sourcePDFPage&&page.sha256===correction.sourcePageSha256)||!vocabulary.words.some(word=>vocabularyKey(word.word)===vocabularyKey(correction.canonicalHeadword)))throw Error('原书词头修订与当前词表不一致，请重新加载教材词表。');
   }
   const words=vocabulary.words.filter(item=>!corrections.some(c=>vocabularyKey(c.indexWord)===vocabularyKey(item.word)));
   for(const item of words){
    const wordKey=vocabularyKey(item.word);entries++;
    const term=terms.get(wordKey);
    if(term)term.sources.push(source);else terms.set(wordKey,{key:wordKey,word:item.word,sources:[source]});
   }
   lessons.push({...source,key,words});
  }
 }
 return {lessons,entries,terms:[...terms.values()].sort((a,b)=>a.word.localeCompare(b.word,'en',{sensitivity:'base'})||a.key.localeCompare(b.key))};
}

export function searchVocabulary(terms:VocabularyTerm[],{book,query='',letter='',dictionary={}}:{book?:NceBookId;query?:string;letter?:string;dictionary?:Record<string,DictionaryEntry>}){
 const tokens=searchable(query).split(' ').filter(Boolean);
 return terms.flatMap(term=>{
  const sources=book?term.sources.filter(s=>s.book===book):term.sources;
  if(!sources.length||letter&&vocabularyLetter(term.word)!==letter.toUpperCase())return [];
  const text=searchable(`${term.word} ${dictionary[term.key]?.meaning||''}`);
  return tokens.every(token=>text.includes(token))?[{...term,sources}]:[];
 });
}

export function vocabularyPage<T>(items:T[],requested=1,size=50){
 const pages=Math.max(1,Math.ceil(items.length/size)),page=Math.min(pages,Math.max(1,Number.isSafeInteger(requested)?requested:1));
 return {page,pages,items:items.slice((page-1)*size,page*size)};
}
