import {findWord,type DictionaryEntry} from './language';
import type {NceBookId} from './model';
import {vocabularyKey,type VocabularyCatalog} from './textbook-vocabulary';
import {reviewedTeachingDefinition,reviewedTeachingIpa} from './vocabulary-examples';

type TeachingSource={book:NceBookId;lesson:number};
export type ReviewedLookupEntry=DictionaryEntry&{reviewedHeadword?:string;headwordIpa?:string};
const key=(word:string)=>vocabularyKey(word.normalize('NFKC'));
// Reviewed noun forms only. Generated source hints can also contain unrelated
// homographs (for example Polish/polishing); they cannot approve new bindings.
export const reviewedSourceWordForms=[
 {book:'NCE1' as const,lesson:14,word:'carpet',forms:['carpets',"carpet's"]},
 {book:'NCE1' as const,lesson:14,word:'case',forms:['cases',"case's"]},
 {book:'NCE1' as const,lesson:14,word:'dog',forms:['dogs',"dog's"]},
];

// The existing source index supplies lexical forms, not a new target-sense
// certification. Only a previously reviewed target in that source can bind.
export function reviewedHeadwordForForm(word:string,sources:TeachingSource[],catalog:VocabularyCatalog,dictionaryWord?:string):string|undefined{
 const surface=key(word),resolved=dictionaryWord?key(dictionaryWord):undefined,candidates=new Map<string,string>();
 for(const lesson of catalog.lessons){
  if(!sources.some(source=>source.book===lesson.book&&source.lesson===lesson.lesson))continue;
  for(const item of lesson.words){
   const headword=key(item.word);
   const approved=reviewedSourceWordForms.some(record=>record.book===lesson.book&&record.lesson===lesson.lesson&&key(record.word)===headword&&record.forms.some(form=>key(form)===surface));
   if(headword!==surface&&!approved)continue;
   if(headword!==surface&&!item.forms.some(form=>key(form)===surface)&&!(resolved!==surface&&headword===resolved))continue;
   if(reviewedTeachingDefinition(item.word,[lesson]))candidates.set(headword,item.word);
  }
 }
 return candidates.size===1?[...candidates.values()][0]:undefined;
}

export async function resolveReviewedLookupEntry(word:string,sources:TeachingSource[],dictionary:Record<string,DictionaryEntry>,loadCatalog:()=>Promise<VocabularyCatalog>):Promise<ReviewedLookupEntry|undefined>{
 const found=findWord(dictionary,word);
 // Keep the actual dictionary text, and do not accept lookup metadata from it.
 const original=found?{word:found.word,ipa:found.ipa,meaning:found.meaning,...(found.source?{source:found.source}:{})}:undefined;
 const direct=reviewedTeachingDefinition(word,sources);
 if(direct)return original||{word,ipa:reviewedTeachingIpa(word,sources)||'',meaning:direct,source:'textbook'};
 if(!reviewedSourceWordForms.some(record=>sources.some(source=>source.book===record.book&&source.lesson===record.lesson)&&record.forms.some(form=>key(form)===key(word))))return original;
 try{
  const canonical=reviewedHeadwordForForm(word,sources,await loadCatalog(),found?.word);
  if(!canonical)return original;
  const canonicalEntry=findWord(dictionary,canonical);
  return {...(original||canonicalEntry||{word:canonical,ipa:reviewedTeachingIpa(canonical,sources)||'',meaning:reviewedTeachingDefinition(canonical,sources),source:'textbook' as const}),reviewedHeadword:canonical,headwordIpa:canonicalEntry?.ipa};
 }catch{
  // A missing/invalid source index cannot certify an inflected target. A valid
  // dictionary entry remains available, and a later open can retry the index.
  return original;
 }
}
