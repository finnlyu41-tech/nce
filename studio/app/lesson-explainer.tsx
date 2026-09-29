'use client';
import {ArrowRight,BookOpen} from 'lucide-react';
import type {LanguageRow} from './language';
import type {NceBookId,State} from './model';
import {navigate} from './navigation';
import {grammarEntryFor,grammarGuidesFor,grammarPrintedPage} from './textbook-grammar';
import './lesson-explainer.css';

type Props={book:NceBookId;lesson:number;rows:LanguageRow[];state:State;update:(fn:(s:State)=>State)=>void;onListen?:(first:number,last:number)=>void};
export function LessonExplainer({book,lesson}:Props){
 const topic=grammarEntryFor(book,lesson);if(!topic)return null;
 const guides=grammarGuidesFor(topic);
 return <section className="lesson-explainer" aria-label="本课讲解与练习"><div className="section-top"><div><span className="eyebrow">理解，再用出来</span><h2>这课学会哪些用法</h2></div><BookOpen size={20}/></div>{guides.map(guide=><div className="lesson-teaching" key={guide.id}><h3>{guide.title}</h3><p>{guide.idea}</p><p className="muted small">{guide.pattern}</p></div>)}<div className="lesson-explainer-next"><p>先看例句怎么表达，再合上提示，用在自己的情况里。</p><button className="btn" onClick={()=>navigate({view:'nce',book,lesson,tab:'grammar'})}>学本课用法<ArrowRight size={17}/></button></div><small className="muted">对应教材第 {grammarPrintedPage(book,topic.sections[0].page)} 页 · 讲解与练习由本站编写</small></section>;
}
