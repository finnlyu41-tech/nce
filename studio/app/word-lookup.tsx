'use client';
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Plus,Volume2} from 'lucide-react';
import {loadDictionary,findWord,type DictionaryEntry} from './language';
import {speak} from './speech';
import {PlaybackSpeed} from './playback-speed';
import type {Word} from './model';
import {useRoute} from './use-route';
type WordSelection={word:string;example:string;exampleTranslation?:string};
const Context=createContext<(selection:WordSelection)=>void>(()=>{});

export function WordLookupProvider({children,onAdd}:{children:ReactNode;onAdd:(word:Word)=>void}){
 const route=useRoute();
 const [selection,setSelection]=useState<WordSelection|null>(null),[entry,setEntry]=useState<DictionaryEntry>(),[loading,setLoading]=useState(false),[error,setError]=useState(''),[added,setAdded]=useState(false);const request=useRef(0);
 useEffect(()=>{request.current++;setSelection(null)},[route]);
 async function open(selection:WordSelection){
  const {word}=selection;
  const id=++request.current;setSelection(selection);setEntry(undefined);setLoading(true);setError('');setAdded(false);
  try{const data=await loadDictionary();if(request.current===id)setEntry(findWord(data,word))}catch(e){if(request.current===id)setError((e as Error).message)}finally{if(request.current===id)setLoading(false)}
 }
 return <Context.Provider value={open}>{children}<Dialog open={!!selection} onOpenChange={open=>{if(!open){request.current++;setSelection(null)}}}><DialogContent className="word-lookup"><DialogHeader><DialogTitle lang="en">{selection?.word}</DialogTitle><DialogDescription>{entry?.source==='textbook'?'教材词表释义':'词典释义'} · 结合原句选择合适的意思</DialogDescription></DialogHeader>{loading?<p role="status">正在查词…</p>:error?<><p role="alert">{error}</p><button className="btn secondary" onClick={()=>selection&&open(selection)}>重新查词</button></>:entry?<><div className="row wrap"><span className="lookup-ipa">{entry.ipa?`/${entry.ipa.replace(/^\/+|\/+$/g,'')}/`:'词典未提供此词的音标'}</span><button className="text-btn" onClick={()=>speak(entry.word)}><Volume2 size={17}/>听发音</button><PlaybackSpeed ariaLabel="查词发音语速"/></div>{entry.word.toLowerCase()!==selection?.word.toLowerCase()&&<p className="muted small">词形对应：{entry.word}</p>}<p className="lookup-meaning">{entry.meaning}</p></>:<p>词典暂未收录这个词。可在「我的词句」按原书补充释义。</p>}
  {selection?.example&&<div className="lookup-example"><p lang="en">{selection.example}</p>{selection.exampleTranslation?.trim()?<p className="lookup-translation" lang="zh-CN">{selection.exampleTranslation}</p>:<p className="lookup-translation muted small">这句暂未提供中文翻译。</p>}</div>}
  {selection&&!selection.example&&<p className="muted small">暂无对应原句，可查看原书中的用法。</p>}
  {!loading&&!error&&entry&&<><button className="btn" disabled={added} onClick={()=>{onAdd({word:selection!.word,ipa:entry.ipa,meaning:entry.meaning.slice(0,300),example:selection!.example.slice(0,1000)});setAdded(true)}}><Plus size={17}/>{added?'已加入复习':'加入我的生词'}</button><p className="muted small">{entry.source==='textbook'?'释义与音标按原书词表补充。':'ECDICT 词典 · 音标以英音为主，教材录音为美音。'}</p></>}</DialogContent></Dialog></Context.Provider>
}
export function WordText({text,example=text,exampleTranslation}:{text:string;example?:string;exampleTranslation?:string}){
 const open=useContext(Context);
 return <span className="word-text" lang="en">{text.split(/([A-Za-z]+(?:['’][A-Za-z]+)*)/g).map((part,i)=>/^[A-Za-z]/.test(part)?<button key={i} type="button" className="lookup-word" aria-label={`查词 ${part}`} onClick={()=>open({word:part,example,exampleTranslation})}>{part}</button>:part)}</span>;
}

export function WordLookupButton({word,example='',exampleTranslation,className=''}:{word:string;example?:string;exampleTranslation?:string;className?:string}){
 const open=useContext(Context);
 return <button type="button" className={'lookup-word '+className} lang="en" aria-label={`查词 ${word}`} onClick={()=>open({word,example,exampleTranslation})}>{word}</button>;
}
