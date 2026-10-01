'use client';
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Plus,Volume2} from 'lucide-react';
import {loadDictionary} from './language';
import {speak} from './speech';
import {PlaybackSpeed} from './playback-speed';
import {validNceKey,type Word} from './model';
import {useRoute} from './use-route';
import {VocabularyExamples} from './vocabulary-example-ui';
import {usageExamples,type ExampleSource} from './vocabulary-usage';
import {reviewedTeachingDefinition,reviewedTeachingSources,reviewedTeachingIpa,reviewedUsageDefinition} from './vocabulary-examples';
import {loadPages} from './lesson-context';
import {buildVocabularyCatalog} from './textbook-vocabulary';
import {resolveReviewedLookupEntry,type ReviewedLookupEntry} from './reviewed-word-forms';
type WordSelection={word:string;example:string;exampleTranslation?:string;exampleSource?:ExampleSource;sources?:Word['sources']};
const Context=createContext<(selection:WordSelection)=>void>(()=>{});

export function WordLookupProvider({children,onAdd}:{children:ReactNode;onAdd:(word:Word)=>void|boolean}){
 const route=useRoute();
 const [selection,setSelection]=useState<WordSelection|null>(null),[entry,setEntry]=useState<ReviewedLookupEntry>(),[loading,setLoading]=useState(false),[error,setError]=useState(''),[added,setAdded]=useState(false);const request=useRef(0);
 useEffect(()=>{request.current++;setSelection(null)},[route]);
 function teachingSourcesFor(selected:WordSelection){
  const sources=selected.sources?.flatMap(source=>source.kind==='nce'?[{book:source.book,lesson:source.lesson}]:[])||[];
  return sources.length?sources:route.book&&route.lesson&&validNceKey(`${route.book}-${route.lesson}`)?[{book:route.book,lesson:route.lesson}]:[];
 }
 async function open(selection:WordSelection){
  const {word}=selection;
  const id=++request.current;setSelection(selection);setEntry(undefined);setLoading(true);setError('');setAdded(false);
  try{const data=await loadDictionary();const found=await resolveReviewedLookupEntry(word,teachingSourcesFor(selection),data,async()=>{const index=await loadPages();try{return buildVocabularyCatalog(index)}catch{return buildVocabularyCatalog(await loadPages(true))}});if(request.current===id)setEntry(found)}catch(e){if(request.current===id)setError((e as Error).message)}finally{if(request.current===id)setLoading(false)}
 }
 const teachingSources=selection?teachingSourcesFor(selection):[];
 const targetWord=selection?(entry?.reviewedHeadword||selection.word):'';
 const reviewed=selection?reviewedTeachingDefinition(targetWord,teachingSources):'';
 const reviewedIpa=selection?reviewedTeachingIpa(targetWord,teachingSources):undefined;
 const exampleWord=selection?(reviewed?targetWord:entry?.word||selection.word):'';
 const ipa=reviewedIpa||(reviewed?entry?.headwordIpa:undefined)||entry?.ipa;
 const otherReviewed=selection?reviewedUsageDefinition(exampleWord,teachingSources):'';
 const savedExample=selection?.example?[{en:selection.example,zh:selection.exampleTranslation}]:[];
 const examples=selection?usageExamples(exampleWord,[reviewed,otherReviewed,entry?.meaning||''].filter(Boolean).join('\n'),savedExample,selection.exampleSource):[];
 const enrollmentExample=selection?usageExamples(exampleWord,reviewed||entry?.meaning||'',reviewed?[]:savedExample,reviewed?undefined:selection.exampleSource)[0]:undefined;
 return <Context.Provider value={open}>{children}<Dialog open={!!selection} onOpenChange={open=>{if(!open){request.current++;setSelection(null)}}}><DialogContent className="word-lookup"><DialogHeader><DialogTitle lang="en">{selection?.word}</DialogTitle><DialogDescription>{entry?.source==='textbook'?'教材词表释义':'词典释义'} · 结合原句选择合适的意思</DialogDescription></DialogHeader>{loading?<p role="status">正在查词…</p>:error?<><p role="alert">{error}</p><button className="btn secondary" onClick={()=>selection&&open(selection)}>重新查词</button></>:entry?<><div className="row wrap"><span className="lookup-ipa">{ipa?`/${ipa.replace(/^\/+|\/+$/g,'')}/`:'词典未提供此词的音标'}</span><button className="text-btn" onClick={()=>speak(reviewed?targetWord:selection?.word||entry.word)}><Volume2 size={17}/>听发音</button><PlaybackSpeed ariaLabel="查词发音语速"/></div>{exampleWord.toLowerCase()!==selection?.word.toLowerCase()&&<p className="muted small">词形对应：{exampleWord}</p>}<p className="lookup-meaning">{entry.meaning}</p></>:<p>词典暂未收录这个词。可在「我的词句」按原书补充释义。</p>}
  {reviewed&&<p className="lookup-meaning"><strong>已核对关联词表义项</strong><br/>{reviewed}</p>}
  <VocabularyExamples examples={examples}/>
  {selection&&!examples.length&&!loading&&<p className="muted small">这个词义暂缺双语例句，可回到教材词表查看原句；不自动套用其他义项。</p>}
  {!loading&&!error&&entry&&<><button className="btn" disabled={added} onClick={()=>{const sources:Word['sources']=selection!.sources?.length?selection!.sources:route.book&&route.lesson&&validNceKey(`${route.book}-${route.lesson}`)?[{kind:'nce',book:route.book,lesson:route.lesson}]:undefined;const result=onAdd({word:reviewed?targetWord:selection!.word,ipa:ipa||'',meaning:(reviewed||entry.meaning).slice(0,300),example:(enrollmentExample?.en||'').slice(0,1000),exampleTranslation:enrollmentExample?.zh?.slice(0,1000),sources:reviewed?reviewedTeachingSources(targetWord,teachingSources).map(source=>({kind:'nce',...source})):sources});if(result!==false)setAdded(true)}}><Plus size={17}/>{added?'已加入复习':reviewed?'加入本课义项':'加入我的生词'}</button><p className="muted small">{reviewedIpa?'音标按关联原书词表核对。':entry.source==='textbook'?'释义与音标按原书词表补充。':'ECDICT 词典 · 音标以英音为主，教材录音为美音。'}</p></>}</DialogContent></Dialog></Context.Provider>
}
export function WordText({text,example=text,exampleTranslation,sources}:{text:string;example?:string;exampleTranslation?:string;sources?:Word['sources']}){
 const open=useContext(Context);
 return <span className="word-text" lang="en">{text.split(/([A-Za-z]+(?:['’][A-Za-z]+)*)/g).map((part,i)=>/^[A-Za-z]/.test(part)?<button key={i} type="button" className="lookup-word" aria-label={`查词 ${part}`} onClick={()=>open({word:part,example,exampleTranslation,sources})}>{part}</button>:part)}</span>;
}

export function WordLookupButton({word,example='',exampleTranslation,exampleSource,sources,className=''}:{word:string;example?:string;exampleTranslation?:string;exampleSource?:ExampleSource;sources?:Word['sources'];className?:string}){
 const open=useContext(Context);
 return <button type="button" className={'lookup-word '+className} lang="en" aria-label={`查词 ${word}`} onClick={()=>open({word,example,exampleTranslation,sources,...(exampleSource?{exampleSource}:{})})}>{word}</button>;
}
