import type {NceBookId} from './model';
import {loadLessonLanguage,type LanguageRow} from './language';
import {vocabularyExample} from './nce-utils';
import {examplesForMeaning,type UsageExample} from './vocabulary-examples';
import {ieltsFlashcardExamples} from './ielts-flashcard-examples';

export type ExampleSource={book:NceBookId;lesson:number};
export type ExampleHint=ExampleSource&{forms?:string[]};
export type ContextExample=LanguageRow&{source:ExampleSource};
export type DisplayExample={en:string;zh?:string;sense?:string;partOfSpeech?:string;teachingSources?:ExampleSource[];collocation?:{en:string;zh:string};origin:'original'|'textbook'|'saved';source?:ExampleSource};
const key=(text:string)=>text.normalize('NFKC').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ');

// Meaning-bound originals are a display layer. Reading this function never
// enrolls a card, edits an imported note or changes an existing schedule.
export function usageExamples(word:string,meaning:string,saved:{en:string;zh?:string}[]=[],source?:ExampleSource,query=''):DisplayExample[]{
 const originals:DisplayExample[]=examplesForMeaning(word,meaning,query).map((example:UsageExample)=>({...example,origin:'original'}));
 for(const example of ieltsFlashcardExamples){
  const sense=example.meaning.split('；')[0],chinese=sense.replace(/^[a-z.\s]+/i,'');
  if(key(example.word)!==key(word)||!chinese||!meaning.includes(chinese))continue;
  const phrase=example.meaning.split('常用搭配：')[1]||'',match=phrase.match(/^(.*?)（(.*?)）$/);
  originals.push({en:example.example,zh:example.exampleTranslation,sense,origin:'original',collocation:match?{en:match[1],zh:match[2]}:undefined});
 }
 const result:DisplayExample[]=[],seen=new Set<string>();
 for(const example of saved){
  if(!example.en.trim())continue;
  const known=originals.find(item=>key(item.en)===key(example.en));
  const item:DisplayExample=source?{...example,origin:'textbook',source}:known?{...known,zh:example.zh?.trim()?example.zh:known.zh}:{...example,origin:'saved'};
  const identity=key(item.en);if(seen.has(identity))continue;seen.add(identity);result.push(item);
 }
 for(const example of originals){const identity=key(example.en);if(!seen.has(identity)){seen.add(identity);result.push(example)}}
 return result;
}

// Only the requested word's known lessons are read, on an explicit click.
// A lexical match is labelled as textbook context, never as proof of every
// dictionary sense. Paired exercises identify the actual audio-text lesson.
export async function loadVocabularyContext(word:string,hints:ExampleHint[]):Promise<ContextExample|undefined>{
 const seen=new Set<string>();
 for(const hint of hints){
  const lesson=hint.book==='NCE1'&&hint.lesson%2===0?hint.lesson-1:hint.lesson;
  const identity=hint.book+'-'+lesson;if(seen.has(identity))continue;seen.add(identity);
  const language=await loadLessonLanguage(hint.book,lesson);
  const row=vocabularyExample(language?.rows||[],word,hint.forms);
  if(row?.en.trim()&&row.zh.trim())return {...row,source:{book:hint.book,lesson}};
 }
}
