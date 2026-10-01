'use client';
import {mapUnitId} from './map-connection';
import {useEffect,useState} from 'react';
import {ArrowRight,ArrowLeft,BookOpen,ChevronDown,ChevronLeft,ChevronRight,Search} from 'lucide-react';
import {useRoute} from './use-route';
import {navigate} from './navigation';
import type {NceBookId} from './model';
import {ONLINE} from './runtime-mode';
import {readJsonResource} from './network';
import {loadSiteMaterial,readMaterialManifest} from './site-material-utils';
import {grammarBooks,grammarCategories,grammarEntries,grammarEntryFor,grammarLessonLabel,grammarPrintedPage,grammarSourceHash,grammarUnitLabel,searchGrammar,type GrammarEntry} from './textbook-grammar';
import {GrammarExplanation} from './grammar-explanation-ui';
import './textbook-grammar.css';

type PageIndex={version:number;sources:Record<NceBookId,string>;pages:Record<string,{src:string;sha256:string}>};
let pageRequest:Promise<PageIndex>|undefined;
function loadIndex(){
 if(!pageRequest)pageRequest=readJsonResource<PageIndex>('/grammar/index.json').then(data=>{
  if(data.version!==1||!data.sources||!data.pages||!grammarBooks.every(b=>data.sources[b.id]===grammarSourceHash(b.id))||!Object.values(data.pages).every(p=>/^[a-f0-9]{64}$/.test(p.sha256)&&[`/grammar/${p.sha256}.jpg`,`/lesson-pages/${p.sha256}.jpg`].includes(p.src)))throw Error('原书版本与索引不一致');
  return data;
 }).catch(e=>{pageRequest=undefined;throw e});
 return pageRequest;
}
function OriginalGrammar({entry}:{entry:GrammarEntry}){
 const route=useRoute(),[index,setIndex]=useState<PageIndex|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0),[pdf,setPdf]=useState(''),[busy,setBusy]=useState(false),[pdfRequest,setPdfRequest]=useState(0);
 const page=route.page&&entry.pages.includes(route.page)?route.page:entry.sections[0].page;
 const setPage=(page:number)=>navigate({...route,page},{replace:true,keepScroll:true});
 useEffect(()=>{let active=true;if(ONLINE)loadIndex().then(d=>{if(active){setIndex(d);setError('')}}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[retry]);
 useEffect(()=>{const controller=new AbortController();let url='';if(pdfRequest){setBusy(true);void(async()=>{
  try{const manifest=await readMaterialManifest(controller.signal);const file=manifest.files.find(f=>f.book===entry.book&&f.type==='application/pdf');if(!file||file.sha256!==grammarSourceHash(entry.book))throw Error('原书版本与索引不一致');const blob=await loadSiteMaterial(file,controller.signal);url=URL.createObjectURL(blob);if(!controller.signal.aborted)setPdf(url)}catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'原书暂时无法加载')}finally{if(!controller.signal.aborted)setBusy(false)}
 })()}return()=>{controller.abort();if(url)URL.revokeObjectURL(url)}},[pdfRequest,entry.book]);
 // Keep the PDF URL alive for the lifetime of the viewer; it contains no learner data.
 const asset=index?.pages[`${entry.book}-${page}`],position=entry.pages.indexOf(page);
 return <div className="textbook-source">
  <div className="textbook-source-heading"><h4>教材原文</h4><span>原书第 {grammarPrintedPage(entry.book,page)} 页 · PDF 第 {page} 页</span></div>
  <div className="textbook-section-links" aria-label="原书栏目">{entry.sections.map((s,i)=><button key={`${s.section}-${s.page}-${i}`} className={page===s.page?'active':''} onClick={()=>{setPage(s.page);setError('')}}>{s.section}</button>)}</div>
  {ONLINE?<>
   {error&&<p role="alert">{error} <button className="text-btn" onClick={()=>{setError('');setRetry(retry+1)}}>重新加载</button></p>}
   {asset?<a className="textbook-page-link" href={asset.src} target="_blank" rel="noreferrer"><img key={`${asset.src}-${retry}`} src={asset.src} alt={`${grammarBooks.find(b=>b.id===entry.book)?.name}，${grammarLessonLabel(entry)}，原书第 ${grammarPrintedPage(entry.book,page)} 页，PDF 第 ${page} 页`} onError={()=>setError('原书图片未能加载，请重试或打开完整 PDF')} onLoad={()=>setError('')}/><span>点图放大查看原文</span></a>:!error&&<p role="status">正在加载对应原书页…</p>}
   <div className="textbook-page-controls"><button className="btn secondary" aria-label="上一页语法原文" disabled={position<=0} onClick={()=>{setPage(entry.pages[position-1]);setError('')}}><ChevronLeft size={16}/>上一页</button><label>原书页<select aria-label="选择语法原文页码" value={page} onChange={e=>{setPage(Number(e.target.value));setError('')}}>{entry.pages.map(p=><option key={p} value={p}>{grammarPrintedPage(entry.book,p)}（PDF {p}）</option>)}</select></label><button className="btn secondary" aria-label="下一页语法原文" disabled={position===entry.pages.length-1} onClick={()=>{setPage(entry.pages[position+1]);setError('')}}>下一页<ChevronRight size={16}/></button></div>
   <div className="row wrap"><button className="text-btn" onClick={()=>{const id=ONLINE&&mapUnitId(entry.book,entry.lesson);if(id)location.href=`/map/#/learn/${id}`;else navigate({view:'nce',book:entry.book,lesson:entry.lesson,tab:'materials'})}}>返回第 {entry.lesson} 课学习<ArrowRight size={15}/></button><button className="text-btn" onClick={()=>navigate({view:'nce',book:entry.book,lesson:entry.lastLesson,tab:entry.book==='NCE1'?'materials':'practice'})}>进入本课原书练习<ArrowRight size={15}/></button></div>
   <p className="small muted">索引列出本课语法栏目所在页。需看上下文或整册时，打开完整原书。</p>
   {pdf?<a className="text-btn" href={`${pdf}#page=${page}`} target="_blank" rel="noreferrer">打开完整 PDF · 第 {page} 页</a>:<button className="text-btn" disabled={busy} onClick={()=>setPdfRequest(pdfRequest+1)}>{busy?'正在校验整册 PDF…':'加载完整原书 PDF'}</button>}
  </>:<p className="notice">本地版未附原书图片，请按以上册数、课号和页码查阅自己的教材。索引与检索可离线使用。</p>}
  {!!entry.references.length&&<div className="textbook-crossrefs"><strong>原书指向的复习课次</strong><p className="small muted">IKS 是原书对第二册关键句型的引用。</p>{entry.references.map(r=><button className="text-btn" key={`${r.book}-${r.lesson}`} onClick={()=>navigate({view:'grammar',book:r.book,lesson:r.lesson,tab:route.tab,page:grammarEntryFor(r.book,r.lesson)?.sections[0].page})}>第二册第 {r.lesson} 课<ArrowRight size={14}/></button>)}</div>}
 </div>;
}


function GrammarLesson({entry}:{entry:GrammarEntry}){
 const route=useRoute(),[sourceOpen,setSourceOpen]=useState(!!route.page);
 useEffect(()=>{if(route.page)setSourceOpen(true)},[route.page]);
 return <><GrammarExplanation entry={entry}/><div className="grammar-reference"><button className="grammar-reference-toggle" aria-expanded={sourceOpen} aria-controls={`original-${entry.id}`} onClick={()=>setSourceOpen(!sourceOpen)}><BookOpen size={18}/><span><strong>{sourceOpen?'收起原书参考':'查看原书参考'}</strong><small>{entry.sections[0].section} · 原书第 {grammarPrintedPage(entry.book,entry.sections[0].page)} 页起</small></span><ChevronDown size={17}/></button>{sourceOpen&&<div id={`original-${entry.id}`}><OriginalGrammar entry={entry}/></div>}</div></>;
}

export function TextbookGrammar(){
 const route=useRoute(),book=route.book||'NCE1',query=route.query||'',mode=route.tab==='topic'?'topic':'book';
 const category=grammarCategories.some(c=>c.id===route.category)?route.category:undefined;
 const entries=searchGrammar({book,query,category}),current=route.lesson?grammarEntryFor(book,route.lesson):undefined;
 const selected=current&&entries.some(e=>e.id===current.id)?current:undefined;
 const [browseOpen,setBrowseOpen]=useState(false);
 useEffect(()=>setBrowseOpen(false),[selected?.id]);
 const shown=selected?[selected]:entries;
 const groups=Array.from(new Set(shown.map(e=>mode==='topic'?e.category:grammarUnitLabel(e))));
 const open=(entry:GrammarEntry)=>navigate({...route,view:'grammar',book,lesson:selected?.id===entry.id?undefined:entry.lesson,page:undefined},{keepScroll:true});
 const bookInfo=grammarBooks.find(b=>b.id===book)!;
 return <section className="textbook-grammar">
  <div className="page-heading"><div><div className="eyebrow">NEW CONCEPT ENGLISH · GRAMMAR EXPLAINED</div><h1>句型语法</h1><p>按教材进度，把用法和句型讲清楚；读懂例句，再试着自己说。</p></div></div>
  {selected&&<button className="text-btn textbook-index-back" onClick={()=>navigate({...route,lesson:undefined,page:undefined})}><ArrowLeft size={16}/>返回{query||category?'检索结果':'本册目录'}（{entries.length} 组）</button>}
  {selected&&<button className="text-btn grammar-browse-toggle" aria-expanded={browseOpen} aria-controls="grammar-browse" onClick={()=>setBrowseOpen(!browseOpen)}>{bookInfo.name} · {browseOpen?'收起目录与检索':'切换课次或检索'}<ChevronDown size={16}/></button>}
  <div id="grammar-browse" hidden={!!selected&&!browseOpen}>
  <nav className="textbook-book-tabs" aria-label="选择语法教材册数">{grammarBooks.map(b=><button key={b.id} aria-current={b.id===book?'page':undefined} className={b.id===book?'active':''} onClick={()=>navigate({view:'grammar',book:b.id,tab:mode,query,category})}>{b.name}<span>{grammarEntries.filter(e=>e.book===b.id).length} 组</span></button>)}</nav>
  <p className="textbook-book-description">{bookInfo.description}</p>
  <div className="textbook-tools"><label className="search"><Search size={18}/><input aria-label="搜索教材语法与句型" value={query} placeholder="搜索课号、时态、句型或英文，例如 60 / 被动 / have" onChange={e=>navigate({...route,view:'grammar',book,query:e.target.value,lesson:undefined,page:undefined},{replace:true,keepScroll:true})}/></label><label className="textbook-category-label">语法主题<select aria-label="筛选语法主题" value={category||''} onChange={e=>navigate({...route,view:'grammar',book,category:e.target.value||undefined,lesson:undefined,page:undefined},{keepScroll:true})}><option value="">全部主题</option>{grammarCategories.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label></div>
  <div className="textbook-browse-controls"><div className="nce-filters" aria-label="索引排列方式">{[['book','按教材目录'],['topic','按语法主题']].map(([id,label])=><button key={id} className={mode===id?'active':''} aria-pressed={mode===id} onClick={()=>navigate({...route,view:'grammar',book,tab:id},{keepScroll:true})}>{label}</button>)}</div><span role="status" className="small muted">{entries.length} 组讲解</span></div>
  <p className="small muted textbook-index-note">先看本站讲解、例句和易错点。原书放在每课讲解下方，需要时展开查阅。</p>

  </div>
  {!entries.length?<div className="panel empty"><p>本册没有匹配的条目。可换关键词、课号或册数。</p><button className="btn secondary" onClick={()=>navigate({view:'grammar',book,tab:mode})}>清除检索条件</button></div>:groups.map(group=><section className="textbook-group" key={group}><h2>{mode==='topic'?grammarCategories.find(c=>c.id===group)?.title:group}</h2><div className="textbook-entry-list">{shown.filter(e=>(mode==='topic'?e.category:grammarUnitLabel(e))===group).map(entry=><article key={entry.id} className={'textbook-entry '+(selected?.id===entry.id?'expanded':'')}><h3><button aria-expanded={selected?.id===entry.id} aria-controls={`source-${entry.id}`} onClick={()=>open(entry)}><span className="textbook-lesson-number">{grammarLessonLabel(entry)}</span><span className="textbook-entry-name"><strong>{entry.title}</strong><small>{entry.sections[0].section} · 原书 p.{grammarPrintedPage(book,entry.sections[0].page)}</small></span><ChevronDown size={18}/></button></h3>{selected?.id===entry.id&&<div id={`source-${entry.id}`}><GrammarLesson key={entry.id} entry={entry}/></div>}</article>)}</div></section>)}
 </section>;
}

export function LessonGrammarLinks({book,lesson}:{book:NceBookId;lesson?:number}){
 const entry=lesson?grammarEntryFor(book,lesson):undefined;
 return <section className="panel textbook-lesson-links"><div className="section-top"><h2>{lesson?'本课语法与句型':'本册语法与句型'}</h2><BookOpen size={20}/></div>{entry?<><p>{entry.title}</p><p className="small muted">{grammarLessonLabel(entry)} · {entry.sections[0].section} · 原书第 {grammarPrintedPage(book,entry.sections[0].page)} 页（PDF 第 {entry.sections[0].page} 页）</p><button className="btn secondary" onClick={()=>navigate({view:'grammar',book,lesson:entry.lesson})}>学习本课讲解<ArrowRight size={16}/></button></>:<p className="muted">按教材单元和课次学习讲解，也可用中文语法名、英文句型和例句检索。</p>}<button className="text-btn" onClick={()=>navigate({view:'grammar',book})}>打开本册层次目录<ArrowRight size={15}/></button></section>;
}
