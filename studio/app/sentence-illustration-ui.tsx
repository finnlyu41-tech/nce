'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import type {NceBookId} from './model';
import {ONLINE} from './runtime-mode';
import {illustrationPanel,lessonIllustration,type Illustration} from './sentence-illustration';
import './sentence-illustration.css';

type ReadingProps={book:NceBookId;lesson:number;line:number;rowCount:number;sourceSha256?:string;activeLine:number;showIllustration:boolean;children:ReactNode};

export function ReadingLayout({activeLine,showIllustration,children,...picture}:ReadingProps){
 const root=useRef<HTMLDivElement>(null),image=useRef<HTMLElement>(null);
 const illustrated=showIllustration&&ONLINE&&!!lessonIllustration(picture.book,picture.lesson,picture.sourceSha256,picture.rowCount);
 useEffect(()=>{
  const element=root.current,panel=image.current;if(!element)return;
  const measure=()=>element.style.setProperty('--reading-picture-height',`${panel?.getBoundingClientRect().height||0}px`);
  measure();const observer=new ResizeObserver(measure);if(panel)observer.observe(panel);
  return()=>observer.disconnect();
 },[illustrated]);
 useEffect(()=>{
  if(activeLine<0)return;
  const frame=requestAnimationFrame(()=>{
   const row=root.current?.querySelector<HTMLElement>(`[data-reading-line="${activeLine}"]`);
   if(!row)return;
   const rect=row.getBoundingClientRect(),top=parseFloat(getComputedStyle(row).scrollMarginTop)||16;
   if(!rect.height)return;
   const bottom=window.innerHeight-(window.matchMedia('(max-width:767px)').matches?80:20);
   if(rect.top<top||rect.bottom>bottom)row.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
  });
  return()=>cancelAnimationFrame(frame);
 },[activeLine,showIllustration]);
 return <div ref={root} className={'reading-layout'+(illustrated?' has-illustration':'')}>
  {illustrated&&<aside ref={image} className="reading-picture" aria-label="当前句漫画"><SentenceIllustration {...picture}/></aside>}
  <div className="reading-content">{children}</div>
 </div>;
}

export function SentenceIllustration({book,lesson,line,rowCount,sourceSha256}:{book:NceBookId;lesson:number;line:number;rowCount:number;sourceSha256?:string}){
 if(!ONLINE)return null;
 const entry=lessonIllustration(book,lesson,sourceSha256,rowCount);
 if(!entry)return null;
 return <IllustrationView key={entry.pageSha256} entry={entry} lesson={lesson} line={line}/>;
}

function IllustrationView({entry,lesson,line}:{entry:Illustration;lesson:number;line:number}){
 const [failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
 const panel=illustrationPanel(entry,line);
 if(!panel)return null;
 const [x,y,width,height]=panel.box,ratio=width*entry.size[0]/(height*entry.size[1]);
 const src=`/lesson-pages/${entry.pageSha256}.jpg`;
 return <figure className="sentence-illustration" data-panel={panel.index+1} data-sentence={line+1}>
  <figcaption><strong>{entry.mode==='panels'?'随句漫画':'本课插图'}</strong><span>{entry.mode==='panels'?`第 ${panel.index+1} / ${entry.boxes.length} 幅`:'整课共用一张插图'}</span></figcaption>
  {failed?<div className="illustration-error" role="status"><p>图片暂时未能加载，仍可继续听读。</p><button className="text-btn" onClick={()=>{setFailed(false);setAttempt(n=>n+1)}}>重试图片</button></div>:<a href={src} target="_blank" rel="noreferrer" aria-label="打开当前漫画所在原书页" style={{aspectRatio:ratio,maxWidth:`min(560px, calc(var(--illustration-height, 250px) * ${ratio}))`}}>
   <img key={attempt} src={src} alt={`第 ${lesson} 课，${entry.mode==='panels'?`第 ${panel.index+1} 幅教材漫画`:'教材插图'}`} style={{width:`${100/width}%`,height:`${100/height}%`,left:`${-100*x/width}%`,top:`${-100*y/height}%`}} onError={()=>setFailed(true)}/>
  </a>}
 </figure>;
}
