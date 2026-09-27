'use client';
import {useEffect,useState} from 'react';
import {Volume2,ChevronLeft,ChevronRight} from 'lucide-react';
import type {NceBookId} from './model';
import type {splitLesson} from './lesson-structure';
import {WordText,WordLookupButton} from './word-lookup';
import {parseLessonText,vocabularyExample} from './nce-utils';
import {navigate} from './navigation';
import {speak} from './speech';
import {PlaybackSpeed} from './playback-speed';
import {ONLINE} from './runtime-mode';

export function LessonQuestion({lesson,answer,onChange}:{lesson:ReturnType<typeof splitLesson>;answer:string;onChange:(s:string)=>void}){
 if(!lesson.question.length)return null;
 return <section className="lesson-question"><span className="eyebrow">听前只带一个问题</span><h3>先找答案，再逐句读</h3>{lesson.question.map((r,i)=><p lang="en" key={i}><WordText text={r.en} exampleTranslation={r.zh}/></p>)}<details className="practice-reference" key={lesson.question.map(r=>r.en).join()}><summary>需要时看问题中文</summary>{lesson.question.map((r,i)=><p className="line-translation" key={i}>{r.zh}</p>)}</details><div className="row wrap"><button className="text-btn" onClick={()=>speak(lesson.question.map(r=>r.en).join(' '))}><Volume2 size={16}/>听问题</button><PlaybackSpeed ariaLabel="听前问题语速"/></div><label className="field">我听到的答案（先写中文也可以）<input maxLength={1000} value={answer} onChange={e=>onChange(e.target.value)} placeholder="先听正文，写几个关键词；读完再修正"/></label>{!!lesson.instruction.length&&<details><summary>录音中的开场指令</summary>{lesson.instruction.map((r,i)=><p key={i}>{r.en}<br/><span className="muted">{r.zh}</span></p>)}</details>}</section>;
}

type Page={page:number;src:string;sha256:string};
type Vocabulary={pages:number[];words:{word:string;forms:string[]}[]};
type PageIndex={version:number;lessons:Record<string,{title:string;pages:Page[];vocabulary?:Vocabulary}>};
let cached:Promise<PageIndex>|undefined;
function loadPages(){
 if(!cached)cached=fetch('/lesson-pages/index.json').then(async r=>{if(!r.ok)throw Error();const d=await r.json() as PageIndex;if(d.version!==1||!d.lessons)throw Error();return d as PageIndex}).catch(e=>{cached=undefined;throw e});
 return cached;
}
export function LessonPages({book,lesson}:{book:NceBookId;lesson:number}){
 const [index,setIndex]=useState<PageIndex|null>(null),[position,setPosition]=useState(0),[error,setError]=useState(false);
 useEffect(()=>{let alive=true;setPosition(0);setError(false);if(ONLINE)loadPages().then(d=>{if(alive)setIndex(d)}).catch(()=>{if(alive)setError(true)});return()=>{alive=false}},[book,lesson]);
 if(!ONLINE)return null;
 const match=index?.lessons[`${book}-${lesson}`],page=match?.pages[position];
 return <section className="lesson-page-picture" aria-label="对应原书图片"><div className="section-top"><strong>第 {lesson} 课 · 原书图片</strong><span className="muted small">{page?`PDF 第 ${page.page} 页`:error?'暂时未能加载':'正在读取…'}</span></div>{page?<><a href={page.src} target="_blank" rel="noreferrer" aria-label="打开原书图片放大查看"><img src={page.src} alt={`第 ${lesson} 课 ${match?.title||''}，原书 PDF 第 ${page.page} 页`} loading="lazy" onLoad={()=>setError(false)} onError={()=>setError(true)}/></a>{error&&<p role="status">图片加载失败，请刷新重试或打开整册原书。</p>}<div className="row spread"><button className="icon-btn" aria-label="上一张原书图片" disabled={position===0} onClick={()=>setPosition(position-1)}><ChevronLeft size={18}/></button><span className="small muted">点图放大 · {position+1} / {match!.pages.length}</span><button className="icon-btn" aria-label="下一张原书图片" disabled={position===match!.pages.length-1} onClick={()=>setPosition(position+1)}><ChevronRight size={18}/></button></div></>:error?<p className="small muted">可以在配套练习中打开整册原书。</p>:null}</section>;
}

export function TextbookVocabulary({book,lesson,text}:{book:NceBookId;lesson:number;text:string}){
 const [index,setIndex]=useState<PageIndex|null>(null),[error,setError]=useState(false),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let alive=true;setIndex(null);setError(false);if(ONLINE)loadPages().then(data=>{if(alive)setIndex(data)}).catch(()=>{if(alive)setError(true)});return()=>{alive=false}},[book,lesson,attempt]);
 const entry=index?.lessons[`${book}-${lesson}`],vocabulary=entry?.vocabulary,rows=parseLessonText(text);
 if(!ONLINE)return <p className="muted small">本地版未包含原书词表，可在课文里点词查释义。</p>;
 if(error)return <p role="alert">原书词表暂时未能加载。<button className="text-btn" onClick={()=>setAttempt(attempt+1)}>重新加载词表</button></p>;
 if(!index)return <p role="status">正在读取本课原书词表…</p>;
 if(!vocabulary)return <p className="muted small">本课原书词表暂未提供，可从教材听读中查看原书。</p>;
 return <section className="source-word-picker" aria-label="本课教材词表"><div className="section-top"><strong>原书生词与短语</strong><span className="muted small">{vocabulary.words.length} 个词条</span></div>{vocabulary.words.length?<><p className="muted small">按本课 New words and expressions 列出。点词看释义、原句和中文，选需要的加入生词本。</p><div className="row wrap">{vocabulary.words.map(({word,forms})=>{const example=vocabularyExample(rows,word,forms);return <span className="pill" key={word}><WordLookupButton word={word} example={example?.en} exampleTranslation={example?.zh}/></span>})}</div></>:<p className="muted small">本课原书没有单列新词。{book==='NCE1'&&lesson%2===0&&<button className="text-btn" onClick={()=>navigate({view:'nce',book,lesson:lesson-1,tab:'words'})}>复习第 {lesson-1} 课词表</button>}</p>}<div className="row wrap textbook-vocabulary-source">{entry?.pages.filter(page=>vocabulary.pages.includes(page.page)).map(page=><a className="text-btn small" href={page.src} target="_blank" rel="noreferrer" key={page.page}>查看原书词表 · PDF 第 {page.page} 页</a>)}</div></section>;
}
