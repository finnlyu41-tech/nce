import {bookCounts,type NceBookId} from './model';
import {parseLessonText} from './nce-utils';
import originalLessons from './data/lessons.json';
import {ONLINE} from './runtime-mode';

export type LanguageRow={en:string;zh:string;time?:number};
export type LessonLanguage={version:1;book:NceBookId;lesson:number;sourceSha256:string;rows:LanguageRow[]};
export type DictionaryEntry={word:string;ipa:string;meaning:string};
const lessons=new Map<string,Promise<LessonLanguage|null>>();
export const normalizeEnglish=(text:string)=>text.toLowerCase().replace(/[^a-z0-9]/g,'');
export async function loadLessonLanguage(book:NceBookId,lesson:number){
 if(!ONLINE||!Object.hasOwn(bookCounts,book)||!Number.isInteger(lesson)||lesson<1||lesson>bookCounts[book]||(book==='NCE1'&&lesson%2===0))return null;
 const key=`${book}/${lesson}`;
 if(!lessons.has(key))lessons.set(key,(async()=>{
  try{const response=await fetch(`/language/${key}.json`);if(!response.ok)throw Error();const data=await response.json() as LessonLanguage;
   if(data.version!==1||data.book!==book||data.lesson!==lesson||!/^[a-f0-9]{64}$/.test(data.sourceSha256)||!Array.isArray(data.rows)||data.rows.length>1000||!data.rows.every((r:LanguageRow)=>typeof r.en==='string'&&r.en.length<=3000&&typeof r.zh==='string'&&r.zh.length<=3000&&Number.isFinite(r.time)))throw Error();
   return data as LessonLanguage;
  }catch{lessons.delete(key);return null}
 })());
 return lessons.get(key)!;
}
export function translatedRows(text:string,language:LessonLanguage|null){
 const map=new Map(language?.rows.map(r=>[normalizeEnglish(r.en),r.zh]));
 const timed=new Map(language?.rows.map(r=>[`${r.time}:${normalizeEnglish(r.en)}`,r.zh]));
 return parseLessonText(text).map(r=>({...r,zh:r.zh||timed.get(`${r.time}:${normalizeEnglish(r.en)}`)||map.get(normalizeEnglish(r.en))||''}));
}
export function rowsToText(rows:LanguageRow[]){return rows.map(r=>`${r.time===undefined?'':`[${String(Math.floor(r.time/60)).padStart(2,'0')}:${(r.time%60).toFixed(3).padStart(6,'0')}]`}${r.en}${r.zh?' | '+r.zh:''}`).join('\n')}
let dictionary:Promise<Record<string,DictionaryEntry>>|undefined;
export async function loadDictionary(){
 if(!ONLINE)return Object.fromEntries(originalLessons.flatMap(l=>l.vocab).map(w=>[w.word.toLowerCase(),{word:w.word,ipa:w.ipa||'',meaning:w.meaning}]));
 if(!dictionary)dictionary=(async()=>{
  try{const response=await fetch('/language/dictionary.json');if(!response.ok)throw Error();const data=await response.json() as {version:number;words:Record<string,DictionaryEntry>};if(data.version!==1||!data.words||typeof data.words!=='object'||Object.keys(data.words).length>20000||!Object.values(data.words).every(w=>typeof w.word==='string'&&typeof w.meaning==='string'&&typeof w.ipa==='string'))throw Error();return data.words as Record<string,DictionaryEntry>}
  catch{dictionary=undefined;throw Error('词典暂时未加载成功，请重试。')}
 })();
 return dictionary;
}
export function findWord(dictionary:Record<string,DictionaryEntry>,word:string){
 const key=word.toLowerCase().replace(/’/g,"'");
 if(Object.hasOwn(dictionary,key))return dictionary[key];
 if(key.endsWith("'s")&&Object.hasOwn(dictionary,key.slice(0,-2)))return {...dictionary[key.slice(0,-2)],word:key.slice(0,-2)};
 return undefined;
}
