'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight,Volume2} from 'lucide-react';
import type {LanguageRow} from './language';
import {chineseRecallPrompts,type RecallPrompt} from './chinese-recall';
import {Recorder} from './recording-feedback';
import {PlaybackSpeed} from './playback-speed';
import {WordText} from './word-lookup';
import './chinese-recall.css';

type Props={rows:LanguageRow[];onListen:(first:number,last:number)=>void;onStop:()=>void;canListen?:boolean;audioLabel?:string};

export function ChineseRecall({rows,onListen,onStop,canListen=true,audioLabel='听原声'}:Props){
 const prompts=useMemo(()=>chineseRecallPrompts(rows),[rows]);
 const [position,setPosition]=useState(0);
 const index=Math.min(position,Math.max(0,prompts.length-1)),prompt=prompts[index];
 if(!prompt)return <p className="notice">本课暂时没有可用的句子。</p>;
 function select(next:number){onStop();setPosition(next)}
 return <section className="chinese-recall" aria-label="看中文说英文练习">
  <h3>看中文，说英文</h3>
  <p className="muted small">先看中文，自己说出英文，再展开参考核对。可以先从简短的一句开始。</p>
  <label className="field record-line-select">选择中文提示<select aria-label="选择中文提示" value={index} onChange={e=>select(Number(e.target.value))}>{prompts.map((p,i)=><option key={i} value={i}>第 {i+1} 句 · {p.zh?p.zh.slice(0,45):'暂缺中文提示'}</option>)}</select></label>
  <RecallSentence key={`${index}:${prompt.en}:${prompt.zh}`} prompt={prompt} canListen={canListen} audioLabel={audioLabel} onStop={onStop} onListen={()=>onListen(prompt.first,prompt.last)}/>
  <div className="recall-navigation"><button className="btn secondary" disabled={index===0} onClick={()=>select(index-1)}><ChevronLeft size={17}/>上一句</button><span className="muted small">{index+1} / {prompts.length}</span><button className="btn secondary" disabled={index===prompts.length-1} onClick={()=>select(index+1)}>下一句<ChevronRight size={17}/></button></div>
 </section>;
}

function RecallSentence({prompt,onListen,onStop,canListen,audioLabel}:{prompt:RecallPrompt;onListen:()=>void;onStop:()=>void;canListen:boolean;audioLabel:string}){
 const [revealed,setRevealed]=useState(false),[stopSignal,setStopSignal]=useState(0);
 const panel=useRef<HTMLDivElement>(null);
 function stop(){onStop();setStopSignal(n=>n+1);panel.current?.querySelectorAll('audio').forEach(audio=>audio.pause())}
 useEffect(()=>()=>onStop(),[]);
 if(!prompt.zh)return <p className="notice" role="status">这一句暂缺完整的中文提示。请换一句，或回到教材听读；这里不会用英文代替提示。</p>;
 return <div ref={panel}>
  <div className="recall-prompt"><span className="small muted">用英文说出这个意思</span><p lang="zh-CN">{prompt.zh}</p></div>
  <Recorder onBeforeRecord={onStop} stopSignal={stopSignal} retentionLabel="每句保留最近两遍；换句、离开或刷新后清除"/>
  <button className="btn recall-reveal" aria-expanded={revealed} onClick={()=>{stop();setRevealed(!revealed)}}>{revealed?'收起英文，再说一次':'说好了 / 需要提示，展开英文'}</button>
  {revealed&&<div className="recall-reference" aria-label="本句英文参考">
   <strong>课文中的说法</strong><p lang="en"><WordText text={prompt.en}/></p>
   <div className="row wrap"><button className="btn secondary" disabled={!canListen} onClick={()=>{stop();onListen()}}><Volume2 size={17}/>{audioLabel}</button><PlaybackSpeed label="参考语速" ariaLabel="看中文说英文参考语速"/></div>
   {!canListen&&<p className="muted small">这句没有可定位的原声音频。</p>}
   <p className="muted small">对照意思和表达，再回听自己的录音。不同于原句的说法也可能正确。</p>
  </div>}
 </div>;
}
