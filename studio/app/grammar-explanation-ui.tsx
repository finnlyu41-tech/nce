'use client';
import {useEffect,useRef,useState} from 'react';
import {Square,Volume2} from 'lucide-react';
import {WordText} from './word-lookup';
import {PlaybackSpeed} from './playback-speed';
import {speak} from './speech';
import {grammarGuidesFor,grammarGuideSources,type GrammarEntry,type GrammarGuide} from './textbook-grammar';

function GrammarAudio({text,label}:{text:string;label:string}){
 const [playing,setPlaying]=useState(false),active=useRef(false);
 useEffect(()=>()=>{if(active.current)window.speechSynthesis?.cancel()},[]);
 function toggle(){
  if(active.current){window.speechSynthesis?.cancel();active.current=false;setPlaying(false);return}
  active.current=true;setPlaying(true);speak(text,()=>{active.current=false;setPlaying(false)});
 }
 return <button type="button" className="icon-btn" aria-label={`${playing?'停止':'朗读'}${label}`} onClick={toggle}>{playing?<Square size={16}/>:<Volume2 size={17}/>}</button>;
}

function GrammarConcept({guide}:{guide:GrammarGuide}){
 const [answerOpen,setAnswerOpen]=useState(false);
 return <div className="grammar-concept">
  <h4>{guide.title}</h4>
  <p className="grammar-idea">{guide.idea}</p>
  <div className="grammar-pattern"><span>核心句型</span><p>{guide.pattern}</p></div>
  <div className="grammar-reason"><h5>怎么理解</h5>{guide.explain.map(text=><p key={text}>{text}</p>)}</div>
  <section className="grammar-examples" aria-label="讲解例句"><div className="grammar-subheading"><h5>看两个例子</h5><PlaybackSpeed ariaLabel="语法例句语速"/></div><ol>{guide.examples.map((example,i)=><li key={example.en}><div className="grammar-example-line"><p><WordText text={example.en} exampleTranslation={example.zh}/></p><GrammarAudio text={example.en} label={`例句 ${i+1}`}/></div><p className="grammar-translation">{example.zh}</p><p className="grammar-example-note">{example.note}</p></li>)}</ol></section>
  <aside className="grammar-pitfall"><h5>容易混淆的地方</h5><p>{guide.pitfall}</p></aside>
  <section className="grammar-try" aria-label="本知识点随手练习"><h5>试一下</h5><p>{guide.practice.prompt}</p><button className="btn secondary" aria-expanded={answerOpen} onClick={()=>setAnswerOpen(!answerOpen)}>{answerOpen?'收起参考表达':'查看参考表达'}</button>{answerOpen?<div className="grammar-answer"><div className="grammar-example-line"><p><WordText text={guide.practice.answer}/></p><GrammarAudio text={guide.practice.answer} label="参考表达"/></div><p>{guide.practice.explanation}</p><p className="small muted">这是参考表达；说法可以不同，先核对意思和结构。</p></div>:<p className="small muted">先自己想一想或说一遍，再展开核对。</p>}</section>
  {!!guide.sources.length&&<details className="grammar-usage-sources"><summary>用法参考</summary>{guide.sources.map(id=><a key={id} href={grammarGuideSources[id].url} target="_blank" rel="noreferrer">{grammarGuideSources[id].label}</a>)}</details>}
 </div>;
}

export function GrammarExplanation({entry,onPractice,initialGoal}:{entry:GrammarEntry;onPractice?:(id:string)=>void;initialGoal?:string}){
 const guides=grammarGuidesFor(entry),[active,setActive]=useState(initialGoal||guides[0]?.id);
 const current=guides.find(g=>g.id===active)||guides[0];
 return <section className="grammar-explanation" aria-label="本课讲解"><div className="grammar-explanation-heading"><span>本站讲解</span><span>{guides.length===1?'一个要点，讲明白再用':`本课 ${guides.length} 个要点`}</span></div>{guides.length>1&&<nav className="grammar-concept-tabs" aria-label="选择本课讲解要点">{guides.map((g,i)=><button key={g.id} aria-pressed={current?.id===g.id} className={current?.id===g.id?'active':''} onClick={()=>setActive(g.id)}><span>{i+1}</span>{g.title}</button>)}</nav>}{current&&<GrammarConcept key={current.id} guide={current}/>}{current&&onPractice&&<button className="btn section-space" onClick={()=>onPractice(current.id)}>带着这个用法练一遍</button>}</section>;
}
