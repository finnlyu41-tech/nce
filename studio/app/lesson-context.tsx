'use client';
import {useEffect,useState} from 'react';
import {Volume2,ChevronLeft,ChevronRight} from 'lucide-react';
import type {NceBookId} from './model';
import type {splitLesson} from './lesson-structure';
import {WordText} from './word-lookup';
import {speak} from './speech';
import {PlaybackSpeed} from './playback-speed';
import {ONLINE} from './runtime-mode';

export function LessonQuestion({lesson,answer,onChange}:{lesson:ReturnType<typeof splitLesson>;answer:string;onChange:(s:string)=>void}){
 if(!lesson.question.length)return null;
 return <section className="lesson-question"><span className="eyebrow">听前只带一个问题</span><h3>先找答案，再逐句读</h3>{lesson.question.map((r,i)=><div key={i}><p lang="en"><WordText text={r.en}/></p><p className="line-translation">{r.zh}</p></div>)}<div className="row wrap"><button className="text-btn" onClick={()=>speak(lesson.question.map(r=>r.en).join(' '))}><Volume2 size={16}/>听问题</button><PlaybackSpeed ariaLabel="听前问题语速"/></div><label className="field">我听到的答案（先写中文也可以）<input maxLength={1000} value={answer} onChange={e=>onChange(e.target.value)} placeholder="先听正文，写几个关键词；读完再修正"/></label>{!!lesson.instruction.length&&<details><summary>录音中的开场指令</summary>{lesson.instruction.map((r,i)=><p key={i}>{r.en}<br/><span className="muted">{r.zh}</span></p>)}</details>}</section>;
}

type Page={page:number;src:string;sha256:string};
type PageIndex={version:number;lessons:Record<string,{title:string;pages:Page[]}>};
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
