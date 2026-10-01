import React, {useContext, useEffect, useState} from 'react';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import type {LessonLanguage} from '../app/language';
import {splitLesson} from '../app/lesson-structure';
import {SentenceIllustration} from '../app/sentence-illustration-ui';
import {sentenceAtTime, sentenceEnd} from '../app/sentence-illustration';
import {ClipButton, PlayerContext} from './media';
import './lesson-reader.css';

export function LessonReader({language}:{language:LessonLanguage}) {
  // The picture map uses every source sentence, including repeated exchanges.
  // Quiz excerpts are sampled and cannot supply these indices or row counts.
  const rows=splitLesson(language.rows,language.book,true).body;
  const player=useContext(PlayerContext),[line,setLine]=useState(0),[showText,setShowText]=useState(false);
  useEffect(()=>{
    const position=player.position;
    if(!position||position.clip.book!==language.book||position.clip.lesson!==language.lesson)return;
    const current=sentenceAtTime(rows,position.time);
    if(current>=0)setLine(current);
  },[player.position,language]);
  const row=rows[line];
  if(!row)return null;
  const clip=(index:number)=>({book:language.book,lesson:language.lesson,start:rows[index].time!,end:sentenceEnd(rows,index)??99999});
  const select=(index:number)=>{player.stop();setLine(index)};
  return <div className="map-lesson-reader">
    <SentenceIllustration book={language.book} lesson={language.lesson} line={line} rowCount={rows.length} sourceSha256={language.sourceSha256}/>
    <div className="lesson-reader-controls">
      <ClipButton clip={{...clip(0),end:99999}} label="听完整课文"/>
      <div className="lesson-reader-paging" aria-label="选择课文句子">
        <button type="button" aria-label="上一句" disabled={line===0} onClick={()=>select(line-1)}><ChevronLeft size={18}/></button>
        <span>第 {line+1} / {rows.length} 句</span>
        <button type="button" aria-label="下一句" disabled={line===rows.length-1} onClick={()=>select(line+1)}><ChevronRight size={18}/></button>
      </div>
    </div>
    <button type="button" className="text-button" aria-expanded={showText} onClick={()=>setShowText(!showText)}>{showText?'收起课文与中文':'需要帮助？逐句听与看中文'}</button>
    {showText&&<div className="lesson-reader-help">
      <article aria-label={`课文第 ${line+1} 句`}>
        <p lang="en">{row.en}</p><p>{row.zh}</p>
        <ClipButton clip={clip(line)} label="重听这一句"/>
      </article>
      <details><summary>查看完整课文</summary><ol className="lesson-reader-transcript">{rows.map((item,i)=><li key={i}><button type="button" aria-current={i===line?'true':undefined} onClick={()=>select(i)}><span lang="en">{item.en}</span><span>{item.zh}</span></button></li>)}</ol></details>
    </div>}
  </div>;
}
