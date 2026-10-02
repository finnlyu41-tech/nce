'use client';
import {useEffect,useMemo,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {ArrowRight,BookOpen,Check,Plus,RotateCcw,Volume2} from 'lucide-react';
import type {State,Word} from './model';
import type {FlashcardRating,FlashcardSource,FlashcardToken} from './flashcard-types';
import {addReverseCard,enrollFlashcard,flashcardSummary,getFlashcardQueue,isFlashcardEnrolled,previewFlashcard,rateFlashcard,revealFlashcard,selectFlashcard,undoFlashcardReview} from './flashcards';
import {ieltsFlashcardExamples,ieltsFlashcardDescription} from './ielts-flashcard-examples';
import {speak} from './speech';
import {PlaybackSpeed} from './playback-speed';
import fsrsAttribution from './data/fsrs-attribution.json';
import {VocabularyExamples} from './vocabulary-example-ui';
import {usageExamples} from './vocabulary-usage';
import './flashcard.css';

const grades:{rating:FlashcardRating;label:string;help:string}[]=[
 {rating:'again',label:'Again · 没想起',help:'答错或未想起'},
 {rating:'hard',label:'Hard · 有点难',help:'答对，但很费力'},
 {rating:'good',label:'Good · 想起了',help:'正常想起'},
 {rating:'easy',label:'Easy · 很轻松',help:'很快、很有把握'},
];
const filterNames={all:'全部词卡',nce:'新概念',ielts:'雅思主题'} as const;
type Filter=keyof typeof filterNames;
const sourceLabel=(source:FlashcardSource)=>{
 if(source.kind==='nce')return '新概念'+({'NCE1':'一','NCE2':'二','NCE3':'三','NCE4':'四'}[source.book])+'册 · '+source.lesson+'课';
 if(source.kind==='ielts')return '雅思 · '+source.topic+' · '+({speaking:'口语',writing:'写作',reading:'阅读',listening:'听力'}[source.use]);
 return source.kind==='personal'?'个人生词':'备用素材'+(source.lesson?' · '+source.lesson+'课':'');
};
function Sources({sources}:{sources:FlashcardSource[]}){
 return <div className="flashcard-sources">{sources.map((s,i)=>s.kind==='nce'
  ?<a className="pill" key={i} href={'#/words/'+s.book+'/'+s.lesson+'?tab=book'}><BookOpen size={12}/>{sourceLabel(s)}</a>
  :<span className="pill" key={i}>{sourceLabel(s)}</span>)}</div>;
}
function nextTime(due:number,now:number){
 const minutes=Math.max(1,Math.ceil((due-now)/60000));
 if(minutes<60)return minutes+' 分钟后';
 if(minutes<1440)return Math.ceil(minutes/60)+' 小时后';
 return new Date(due).toLocaleString('zh-CN',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
}
const errorMessage=(e:unknown)=>e instanceof Error?e.message:'操作未完成，请重试。';

export function FlashcardReview({state,update,ready,onAdd,onSelectWords}:{state:State;update:Dispatch<SetStateAction<State>>;ready:boolean;onAdd:(word:Word)=>void|boolean;onSelectWords:()=>void}){
 const [clock,setClock]=useState(()=>Date.now()),[filter,setFilter]=useState<Filter>('all'),[query,setQuery]=useState(''),[error,setError]=useState(''),[receipt,setReceipt]=useState(''),[definitionEntry,setDefinitionEntry]=useState({key:'',value:''});
 const lastScored=useRef('');
 const answerFocus=useRef<HTMLParagraphElement>(null),focusAfterReveal=useRef(false);
 useEffect(()=>{const tick=()=>setClock(Date.now());const timer=setInterval(tick,15000);window.addEventListener('focus',tick);document.addEventListener('visibilitychange',tick);return()=>{clearInterval(timer);window.removeEventListener('focus',tick);document.removeEventListener('visibilitychange',tick)}},[]);
 useEffect(()=>{setClock(Date.now())},[state.flashcards?.cards]);
 const queue=useMemo(()=>ready?getFlashcardQueue(state,clock,filter):[],[state,clock,filter,ready]);
 const session=state.flashcards?.session;
 const current=queue.find(item=>item.card.id===session?.cardId&&item.card.revision===session?.revision)||queue[0];
 const token=current?{cardId:current.card.id,revision:current.card.revision}:undefined;
 const tokenKey=token?token.cardId+':'+token.revision:'';
 const flipped=!!(token&&session?.cardId===token.cardId&&session?.revision===token.revision&&session.revealed);
 useEffect(()=>{if(flipped&&focusAfterReveal.current){
  focusAfterReveal.current=false;const answer=answerFocus.current;answer?.focus({preventScroll:true});
  const ratings=answer?.closest('.flashcard')?.querySelector('.flashcard-ratings')?.getBoundingClientRect();
  if(ratings&&(ratings.bottom>innerHeight||ratings.top<0))answer?.closest('.flash-content')?.scrollIntoView({block:'start',behavior:'instant'});
 }},[flipped,tokenKey]);
 const summary=flashcardSummary(state,clock);
 const definition=definitionEntry.key===tokenKey?definitionEntry.value:'';
 const notes=useMemo(()=>Object.values(state.flashcards?.notes||{}).filter(note=>(filter==='all'||note.sources.some(s=>s.kind===filter))&&(note.word+' '+note.meaning).toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>a.word.localeCompare(b.word,'en')),[state.flashcards?.notes,filter,query]);
 let preview:{rating:FlashcardRating;due:number}[]=[];
 let previewError='';
 if(flipped&&current&&!current.note.incomplete){try{preview=previewFlashcard(current.card,clock)}catch(e){previewError=errorMessage(e)}}
 function apply(operation:(s:State)=>State){
  try{operation(state);update(s=>operation(s));setError('');return true}catch(e){setError(errorMessage(e));return false}
 }
 function reveal(expected:FlashcardToken){
  lastScored.current='';
  focusAfterReveal.current=apply(s=>revealFlashcard(selectFlashcard(s,expected.cardId),expected));
 }
 function onRate(rating:FlashcardRating,now:number){
  if(!token||lastScored.current===tokenKey)return;
  try{
   const next=rateFlashcard(state,token,rating,now);
   if(next===state)return;
   lastScored.current=tokenKey;
   update(s=>rateFlashcard(s,token,rating,now));
   const scheduled=next.flashcards!.cards[token.cardId];
   setReceipt(current!.note.word+' · '+grades.find(g=>g.rating===rating)!.label+'，下次 '+nextTime(scheduled.due,now)+'。');
   setClock(now);setError('');
  }catch(e){setError(errorMessage(e))}
 }
 function undo(){
  if(apply(undoFlashcardReview)){lastScored.current='';setReceipt('已撤销最后一次评分，恢复评分前的复习时间。');setClock(Date.now())}
 }
 function addExamples(){
  if(apply(s=>ieltsFlashcardExamples.reduce((next,word)=>enrollFlashcard(next,word,word.sources),s)))setReceipt('已加入本站原创雅思主题词卡；已有同词同义只补充来源与例句。');
 }
 if(!ready)return <p role="status" className="notice">正在读取词卡和复习时间…</p>;
 return <section className="flashcard-studio" aria-label="间隔复习闪卡">
  <div className="flashcard-overview"><div><h2>词卡 · 先回想，再核对</h2><p className="muted small">到期复习 {summary.review+summary.learning} 张 · 首次回想 {summary.new} 张 · 共 {summary.total} 张</p></div><label>选择来源<select aria-label="闪卡来源筛选" value={filter} onChange={e=>{setFilter(e.target.value as Filter);setError('')}}>{Object.entries(filterNames).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></div>
  {receipt&&<div className="flashcard-receipt" role="status"><span>{receipt}</span>{state.flashcards?.undo&&<button className="text-btn" onClick={undo}><RotateCcw size={15}/>撤销上次评分</button>}</div>}
  {!receipt&&state.flashcards?.undo&&<button className="text-btn flashcard-undo" onClick={undo}><RotateCcw size={15}/>撤销上次评分</button>}
  {error&&<p role="alert" className="notice">{error}</p>}
  <section className="panel flashcard">
   {current?<div key={tokenKey}>
    <div className="section-top"><span className="pill">{current.note.incomplete?'待补全':current.phase==='new'?'首次回想':current.phase==='learning'?'短时巩固':'到期复习'} · 本轮剩余 {queue.length} 张</span>{current.card.direction==='recognition'&&<button className="icon-btn" aria-label="朗读当前单词" onClick={()=>speak(current.note.word)}><Volume2 size={19}/></button>}</div>
    <p className="muted small">{current.card.direction==='recognition'?'看英文，回想意思':'看意思，回想英文'}</p>
    <div className="flash-content" aria-live="polite">
     <h2 lang={current.card.direction==='recognition'?'en':'zh-CN'}>{current.card.direction==='recognition'?current.note.word:current.note.meaning}</h2>
     {!flipped?<p className="muted">先试着回想，再翻开答案。</p>:<>
      <p ref={answerFocus} tabIndex={-1} className="meaning" lang={current.card.direction==='recognition'?'zh-CN':'en'}>{current.card.direction==='recognition'?current.note.meaning:current.note.word}</p>
      {current.note.ipa&&<p className="ipa" lang="en">{current.note.ipa}</p>}
      <details className="flashcard-examples"><summary>例句与来源</summary>
       <VocabularyExamples examples={usageExamples(current.note.word,current.note.meaning,current.note.examples)}/>
       <Sources sources={current.note.sources}/>
      </details>
      {current.card.direction==='production'&&<button className="text-btn" onClick={()=>speak(current.note.word)}><Volume2 size={16}/>听英文</button>}
     </>}
    </div>
    {current.note.incomplete?<div className="flashcard-incomplete"><p>旧词卡没有可读取的释义，原复习时间仍保留。补充意思后才能评分。</p><label>补充释义<input value={definition} maxLength={300} onChange={e=>setDefinitionEntry({key:tokenKey,value:e.target.value})} placeholder="输入这个词的意思"/></label><button className="btn" disabled={!definition.trim()} onClick={()=>{if(onAdd({word:current.note.word,meaning:definition.trim(),example:'',sources:current.note.sources})!==false)setDefinitionEntry({key:'',value:''})}}>保存释义</button></div>
     :!flipped?<button className="btn full" onClick={()=>token&&reveal(token)}>翻开答案</button>
     :<>{previewError?<p role="alert" className="notice">{previewError}</p>:<div className="flashcard-ratings">{grades.map(grade=><button key={grade.rating} className={'btn '+(grade.rating==='good'?'':'secondary')} onClick={()=>onRate(grade.rating,Date.now())} title={grade.help}><strong>{grade.label}</strong><span>{nextTime(preview.find(p=>p.rating===grade.rating)!.due,clock)}</span></button>)}</div>}<p className="muted small flashcard-grade-help">没想起或答错选 Again；答对但费力选 Hard。评分会安排下次回想。</p></>}
    {queue.length>1&&<button className="text-btn flashcard-skip" onClick={()=>apply(s=>selectFlashcard(s,queue.find(item=>item.card.id!==current.card.id)!.card.id))}>先看另一张</button>}
    <details className="flashcard-options"><summary>发音语速与复习说明</summary><PlaybackSpeed ariaLabel="闪卡发音语速"/><p className="muted small">本机 FSRS 间隔复习，目标记忆率 90%。新概念册课和雅思主题共用同义词条；反馈是自评，不改变课程通关或 IELTS 成绩。到期时间按实际时刻保存，显示为设备当地时间。</p><details><summary>调度程序开源许可</summary><p>ts-fsrs 5.4.2 · Open Spaced Repetition · MIT</p><pre className="flashcard-license">{fsrsAttribution.license}</pre></details></details>
   </div>:<div className="empty"><Check size={34}/><h2>{summary.total?'当前来源暂无到期词卡':'从需要记住的词开始'}</h2><p>{summary.total?'短时巩固和到期复习会在时间到达后出现。也可到词表加入新词。':'在教材词表点「加入复习」，或展开下方原创雅思词卡。'}</p><button className="btn" onClick={onSelectWords}>到教材词表选词<ArrowRight size={16}/></button>{Object.values(state.flashcards?.cards||{}).some(c=>c.due>clock)&&<p className="muted small">下一次复习：{new Date(Math.min(...Object.values(state.flashcards!.cards).filter(c=>c.due>clock).map(c=>c.due))).toLocaleString('zh-CN')}</p>}</div>}
  </section>
  <details className="panel section-space flashcard-library"><summary>我的词条 · {Object.keys(state.flashcards?.notes||{}).length} 个义项</summary><label className="flashcard-search">查找词条<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="英文或中文意思"/></label><div className="flashcard-note-list">{notes.slice(0,50).map(note=><article key={note.id}><div><strong lang="en">{note.word}</strong><p>{note.meaning||'释义待补全'}</p><Sources sources={note.sources}/></div>{!note.incomplete&&!Object.values(state.flashcards?.cards||{}).some(card=>card.noteId===note.id&&card.direction==='production')?<button className="btn secondary small" onClick={()=>apply(s=>addReverseCard(s,note.id))}><Plus size={14}/>加中文→英文卡</button>:<span className="muted small">{note.incomplete?'待补全':'两种方向分别复习'}</span>}</article>)}</div>{!notes.length&&<p className="muted">没有匹配的词条。</p>}{notes.length>50&&<p className="muted small">显示前 50 个结果，请输入关键词继续查找。</p>}</details>
  <details className="panel section-space flashcard-originals"><summary>雅思主题词卡 · 本站原创 {ieltsFlashcardExamples.length} 个</summary><p className="muted small">{ieltsFlashcardDescription}</p><button className="btn secondary" onClick={addExamples}><Plus size={16}/>加入这组主题词卡</button><div className="flashcard-note-list">{ieltsFlashcardExamples.map(word=><article key={word.word+':'+word.meaning}><div><strong lang="en">{word.word}</strong><p>{word.meaning}</p>{(!current||flipped)&&<VocabularyExamples examples={usageExamples(word.word,word.meaning,[{en:word.example,zh:word.exampleTranslation}])}/>}<Sources sources={word.sources||[]}/></div><button className="btn secondary small" onClick={()=>onAdd(word)}>{isFlashcardEnrolled(state,word)?'补充来源 / 例句':'加入复习'}</button></article>)}</div></details>
 </section>;
}
