'use client';
import {ArrowRight,BookOpen,Volume2} from 'lucide-react';
import type {LanguageRow} from './language';
import type {NceBookId,State} from './model';
import {guideFor,readGuide,sentenceFor,transferCheck} from './expression-guide';
import {WordText} from './word-lookup';
import {speak} from './speech';
import {PlaybackSpeed} from './playback-speed';
import {navigate} from './navigation';
import {grammarEntryFor,grammarPrintedPage} from './textbook-grammar';
import './lesson-explainer.css';

type Props={book:NceBookId;lesson:number;rows:LanguageRow[];state:State;update:(fn:(s:State)=>State)=>void;onListen?:(first:number,last:number)=>void};
export function LessonExplainer({book,lesson,rows,state,update,onListen}:Props){
 const {frame,source,excerpt,goal}=guideFor(rows,book);
 if(!source)return null;
 const key=`expression-${book}-${lesson}`,draft=readGuide(state.drafts[key]),matched=frame.match.test(source.en);
 const challenge=transferCheck(frame,lesson,draft.checkRound),example=sentenceFor(frame,[]),translation=sentenceFor(frame,[],true);
 const topic=grammarEntryFor(book,lesson),first=rows.indexOf(source);
 let last=first;while(last+1<rows.length&&last-first<4&&!/[.!?]["'”’]?\s*$/.test(rows[last].en))last++;
 function patch(change:Partial<ReturnType<typeof readGuide>>){update(s=>({...s,drafts:{...s.drafts,[key]:JSON.stringify({...readGuide(s.drafts[key]),...change})}}))}
 return <section className="lesson-explainer" aria-label="本课讲解与练习">
  <div className="section-top"><div><span className="eyebrow">理解，再用出来</span><h2>从课文里学一句</h2></div>{onListen&&<button className="text-btn" onClick={()=>onListen(first,last)}><Volume2 size={17}/>回听这句</button>}</div>
  <div className="lesson-meaning"><span className="small muted">本课原句</span><p lang="en" className="explainer-example"><WordText text={excerpt.en} exampleTranslation={excerpt.zh}/></p>{excerpt.zh&&<p>{excerpt.zh}</p>}</div>
  {matched&&<><div className="lesson-teaching"><h3>{frame.name}</h3><p>{frame.tip}</p><span className="small muted">换个情境</span><p lang="en" className="explainer-example"><WordText text={example} exampleTranslation={translation}/></p><p className="muted">{translation}</p><div className="row wrap"><button className="text-btn" onClick={()=>speak(example)}><Volume2 size={16}/>听示范</button><PlaybackSpeed ariaLabel="句型示范语速"/></div></div>
   <fieldset className="lesson-quick-check"><legend>马上试一句</legend><p>{challenge.translation}</p><p lang="en" className="explainer-example">{challenge.prompt}</p><div className="explainer-options">{challenge.options.map(option=><label key={option}><input type="radio" name={`quick-${key}`} value={option} checked={draft.checkChoice===option} onChange={()=>patch({checkChoice:option,checkMarked:false,checkpointAt:0,saved:false})}/><span>{option}</span></label>)}</div><button className="btn secondary" disabled={!draft.checkChoice} onClick={()=>patch({checkMarked:true})}>看看为什么</button>{draft.checkMarked&&<div className="feedback" role="status"><strong>{draft.checkChoice===challenge.answer?'这个形式用对了':`这里用 ${challenge.answer}`}</strong><p>{challenge.explanation}</p><p lang="en">{challenge.prompt.replace('____',challenge.answer)}</p></div>}</fieldset>
  </>}
  <div className="lesson-explainer-next"><p>{matched?goal:'把原句中的人物、地点或细节换成自己的内容，再说一次。'}</p><button className="btn" onClick={()=>navigate({view:'nce',book,lesson,tab:'notes',step:0})}>换成自己的话<ArrowRight size={17}/></button></div>
  {topic&&<div className="lesson-topic-reference"><div><BookOpen size={17}/><span>本课知识点：{topic.title}</span></div><button className="text-btn" onClick={()=>navigate({view:'grammar',book,lesson:topic.lesson})}>进入本课语法<ArrowRight size={15}/></button><small className="muted">对应教材第 {grammarPrintedPage(book,topic.sections[0].page)} 页</small></div>}
 </section>;
}
