'use client';
import {useEffect,useMemo,useState,type ReactNode} from 'react';
import {ArrowRight,BookOpen,Check,ChevronLeft,ChevronRight,Plus,Search,Volume2} from 'lucide-react';
import {bookCounts,type NceBookId,type State,type Word} from './model';
import {bookNames} from './study-path';
import {loadPages} from './lesson-context';
import {loadDictionary,loadLessonLanguage,type DictionaryEntry,type LanguageRow} from './language';
import {WordLookupButton} from './word-lookup';
import {vocabularyExample} from './nce-utils';
import {speak} from './speech';
import {PlaybackSpeed} from './playback-speed';
import {navigate} from './navigation';
import {useRoute} from './use-route';
import {ONLINE} from './runtime-mode';
import {mapUnitId} from './map-connection';
import {grammarPrintedPage} from './textbook-grammar';
import {buildVocabularyCatalog,searchVocabulary,vocabularyKey,vocabularyPage,type VocabularyCatalog,type VocabularySource} from './textbook-vocabulary';
import {isFlashcardEnrolled} from './flashcards';
import {VocabularyExamples} from './vocabulary-example-ui';
import {loadVocabularyContext,usageExamples,type ContextExample,type ExampleHint,type ExampleSource} from './vocabulary-usage';
import {reviewedTeachingDefinition,reviewedTeachingSources,reviewedTeachingIpa} from './vocabulary-examples';
import './textbook-vocabulary.css';

const books=Object.keys(bookCounts) as NceBookId[];

function SourceLinks({source}:{source:VocabularySource}){
 return <div className="vocabulary-source-links">{source.pages.map(page=><a key={page.page} href={page.src} target="_blank" rel="noreferrer" className="text-btn" aria-label={`${bookNames[source.book]}第 ${source.lesson} 课原书词表，第 ${grammarPrintedPage(source.book,page.page)} 页，PDF 第 ${page.page} 页`}><BookOpen size={14}/>原书 {grammarPrintedPage(source.book,page.page)} 页 · PDF {page.page}</a>)}</div>;
}

function VocabularyRow({word,number,entry,enrolled,example,exampleSource,hints=[],teachingSources=[],sources,onAdd,children,query=''}:{word:string;number?:number;entry?:DictionaryEntry;enrolled:boolean;example?:LanguageRow;exampleSource?:ExampleSource;hints?:ExampleHint[];teachingSources?:ExampleSource[];sources:Word['sources'];onAdd:(word:Word)=>void;children?:ReactNode;query?:string}){
 const [lookup,setLookup]=useState<{key:string;busy:boolean;context?:ContextExample;missing?:boolean}>({key:'',busy:false});
 const contextKey=word+':'+JSON.stringify(hints),loaded=lookup.key===contextKey?lookup:undefined;
 const context=example?{...example,source:exampleSource}:loaded?.context;
 const reviewed=reviewedTeachingDefinition(word,teachingSources),recordMeaning=reviewed||entry?.meaning||'';
 const reviewedIpa=reviewedTeachingIpa(word,teachingSources),ipa=reviewedIpa||entry?.ipa;
 const enrollmentSources:Word['sources']=reviewed?reviewedTeachingSources(word,teachingSources).map(source=>({kind:'nce',...source})):sources;
 const meanings=recordMeaning.split('\n').filter(Boolean),matched=meanings.find(line=>query.trim()&&line.toLowerCase().includes(query.trim().toLowerCase())),meaning=matched||meanings[0]||'';
 const examples=usageExamples(word,meaning,context?[context]:[],context?.source,query);
 const chosen=reviewed?usageExamples(word,reviewed).find(example=>example.origin==='original'):context||examples[0];
 async function readContext(){setLookup({key:contextKey,busy:true});try{const found=await loadVocabularyContext(word,hints);setLookup({key:contextKey,busy:false,context:found,missing:!found})}catch{setLookup({key:contextKey,busy:false,missing:true})}}
 return <article className="textbook-vocabulary-row">
  <div className="vocabulary-word-main"><div className="vocabulary-word-heading">{number!==undefined&&<span className="vocabulary-word-number">{String(number).padStart(2,'0')}</span>}<WordLookupButton className="vocabulary-headword" word={word} example={chosen?.en} exampleTranslation={chosen?.zh} exampleSource={chosen===context?context?.source:undefined} sources={enrollmentSources}/><button className="icon-btn" aria-label={'朗读 '+word} onClick={()=>speak(word)}><Volume2 size={18}/></button></div>
   {ipa&&<p className="vocabulary-ipa" lang="en" title={reviewedIpa?'原书词表音标':undefined}>/{ipa.replace(/^\/+|\/+$/g,'')}/</p>}
   <p className="vocabulary-meaning">{reviewed&&<span>已核对本课义项 · </span>}{meaning?meaning.slice(0,80)+(meaning.length>80?'…':''):'点词查义，或查看原书词表。'}</p>
   <VocabularyExamples examples={examples}/>
   {!context&&hints.length>0&&<button className="text-btn vocabulary-context-action" disabled={loaded?.busy} onClick={readContext}>{loaded?.busy?'正在读取双语原句…':loaded?.missing?'重查教材语境':'查看教材中的双语例句'}</button>}
   {loaded?.missing&&<p className="muted small">已知册课中暂未找到这个词的双语原句；请查看原书，不自动套用例句。</p>}
   {children}
  </div>
  <button className="btn secondary vocabulary-enroll" disabled={!entry} aria-label={(enrolled?'补充复习词条来源':'加入复习')+' '+word} onClick={()=>entry&&onAdd({word,ipa,meaning:recordMeaning.slice(0,300),example:chosen?.en.slice(0,1000)||'',exampleTranslation:chosen?.zh?.slice(0,1000),sources:enrollmentSources})}>{enrolled?<Check size={16}/>:<Plus size={16}/>}<span>{enrolled?'补充来源':reviewed?'加入本课义项':'加入复习'}</span></button>
 </article>;
}

export function TextbookVocabularyBrowser({state,currentCourse,onAdd}:{state:State;currentCourse?:{book:NceBookId;lesson:number};onAdd:(word:Word)=>void}){
 const route=useRoute(),mode=route.tab==='index'?'index':'book',last=currentCourse||state.nceLast||{book:'NCE1' as const,lesson:1};
 const book=route.book||last.book,lesson=route.lesson||(book===last.book?last.lesson:1),query=route.query||'';
 const [catalog,setCatalog]=useState<VocabularyCatalog|null>(null),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 const [dictionary,setDictionary]=useState<Record<string,DictionaryEntry>>({}),[dictionaryError,setDictionaryError]=useState(false),[dictionaryLoading,setDictionaryLoading]=useState(true),[dictionaryAttempt,setDictionaryAttempt]=useState(0);
 const [exampleSource,setExampleSource]=useState<{key:string;rows:LanguageRow[]}|null>(null);
 useEffect(()=>{let active=true;if(!ONLINE)return;setError('');void loadPages(attempt>0).then(buildVocabularyCatalog).then(data=>{if(active)setCatalog(data)}).catch(e=>{if(active)setError(e instanceof Error&&e.message?e.message:'教材词表暂时未能加载，请重试。')});return()=>{active=false}},[attempt]);
 useEffect(()=>{let active=true;if(!ONLINE)return;setDictionaryLoading(true);setDictionaryError(false);void loadDictionary().then(data=>{if(active)setDictionary(data)}).catch(()=>{if(active)setDictionaryError(true)}).finally(()=>{if(active)setDictionaryLoading(false)});return()=>{active=false}},[dictionaryAttempt]);
 useEffect(()=>{let active=true;if(ONLINE&&mode==='book')void loadLessonLanguage(book,book==='NCE1'&&lesson%2===0?lesson-1:lesson).then(data=>{if(active)setExampleSource({key:`${book}-${lesson}`,rows:data?.rows||[]})});return()=>{active=false}},[book,lesson,mode]);
 const entry=catalog?.lessons.find(row=>row.book===book&&row.lesson===lesson);
 const allSources=useMemo(()=>new Map((catalog?.terms||[]).map(term=>[term.key,term.sources.map(source=>({kind:'nce' as const,book:source.book,lesson:source.lesson}))])),[catalog]);
 const allHints=useMemo(()=>{const lessonMap=new Map((catalog?.lessons||[]).map(row=>[row.key,row]));return new Map((catalog?.terms||[]).map(term=>[term.key,term.sources.map(source=>({book:source.book,lesson:source.lesson,forms:lessonMap.get(source.book+'-'+source.lesson)?.words.find(item=>vocabularyKey(item.word)===term.key)?.forms||[]}))]))},[catalog]);
 const results=useMemo(()=>searchVocabulary(catalog?.terms||[],{book:route.book,query,letter:route.letter,dictionary}),[catalog,route.book,query,route.letter,dictionary]);
 const paged=vocabularyPage(results,route.page),enrolled=(word:string,sources:ExampleSource[]=[])=>{const entry=dictionary[vocabularyKey(word)];return !!entry&&isFlashcardEnrolled(state,{word,meaning:(reviewedTeachingDefinition(word,sources)||entry.meaning).slice(0,300),example:''})};
 const selectLesson=(book:NceBookId,lesson:number)=>navigate({view:'words',book,lesson,tab:'book'},{keepScroll:true});
 if(!ONLINE)return <section className="panel"><h2>教材词表在在线版提供</h2><p className="muted">本地版未附四册原书词表。已有个人生词仍可在「我的复习」中使用。</p><button className="btn secondary" onClick={()=>navigate({view:'words',tab:'review'})}>打开我的复习<ArrowRight size={16}/></button></section>;
 if(error)return <section className="panel" role="alert"><p>{error}</p><button className="btn secondary" onClick={()=>setAttempt(attempt+1)}>重新加载教材词表</button></section>;
 if(!catalog)return <section className="panel" role="status">正在读取四册教材词表…</section>;
 const bookLessons=catalog.lessons.filter(row=>row.book===book),bookEntries=bookLessons.reduce((n,row)=>n+row.words.length,0);
 return <section className="textbook-vocabulary" aria-label={mode==='book'?'按课学习教材词汇':'教材单词索引'}>
  {mode==='book'?<>
   <div className="vocabulary-selectors"><label>教材<select aria-label="选择词汇教材" value={book} onChange={e=>selectLesson(e.target.value as NceBookId,1)}>{books.map(b=><option value={b} key={b}>{bookNames[b]}</option>)}</select></label><label className="vocabulary-lesson-select">课次<select aria-label="选择词汇课次" value={lesson} onChange={e=>selectLesson(book,Number(e.target.value))}>{bookLessons.map(row=><option key={row.key} value={row.lesson}>第 {row.lesson} 课{row.title?` · ${row.title}`:''} · {row.words.length?`${row.words.length} 词条`:'未单列新词'}</option>)}</select></label></div>
   <p className="small muted vocabulary-scope">本册 {bookLessons.length} 课 · {bookEntries.toLocaleString()} 个课次词条（同词跨课重复计数）</p>
  </>:<>
   <div className="vocabulary-index-tools"><label className="search"><Search size={18}/><input type="search" aria-label="搜索教材单词或中文释义" placeholder="英文单词、短语或中文意思" value={query} onChange={e=>navigate({...route,view:'words',tab:'index',query:e.target.value,page:undefined},{replace:true,keepScroll:true})}/></label><label className="vocabulary-index-book">检索范围<select aria-label="筛选索引册数" value={route.book||''} onChange={e=>navigate({...route,book:e.target.value as NceBookId||undefined,lesson:undefined,page:undefined},{keepScroll:true})}><option value="">全部四册</option>{books.map(b=><option key={b} value={b}>{bookNames[b]}</option>)}</select></label><label className="vocabulary-letter-select">首字母<select aria-label="筛选单词首字母" value={route.letter||''} onChange={e=>navigate({...route,tab:'index',letter:e.target.value||undefined,page:undefined},{keepScroll:true})}><option value="">全部</option>{[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(letter=><option key={letter} value={letter}>{letter}</option>)}</select></label></div>
   <nav className="vocabulary-alphabet" aria-label="单词首字母索引">{['',...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(letter=><button key={letter} className={(route.letter||'')===letter?'active':''} aria-pressed={(route.letter||'')===letter} aria-label={letter?`首字母 ${letter}`:'全部首字母'} onClick={()=>navigate({...route,tab:'index',letter:letter||undefined,page:undefined},{keepScroll:true})}>{letter||'全部'}</button>)}</nav>
   <p className="small muted vocabulary-scope">四册 {catalog.entries.toLocaleString()} 个课次词条，合并同词为 {catalog.terms.length.toLocaleString()} 项。中文按词典释义检索，教材原义见原书。</p>
  </>}
  {dictionaryLoading&&<p role="status" className="small muted">正在加载音标与中文释义…</p>}
  {dictionaryError&&<p role="alert" className="notice">词典未能加载，教材词表和原书仍可查看。中文检索暂不可用。<button className="text-btn" onClick={()=>setDictionaryAttempt(dictionaryAttempt+1)}>重试词典</button></p>}
  
  {mode==='book'&&entry?<section className="panel vocabulary-lesson-panel">
   <div className="vocabulary-section-heading"><div><h2>第 {lesson} 课{entry.title?` · ${entry.title}`:''}</h2><p className="muted small">{entry.words.length} 个生词与短语 · 保留原书顺序</p></div><button className="text-btn" onClick={()=>{const id=mapUnitId(book,lesson);if(id)location.href=`/map/#/learn/${id}`;else navigate({view:'nce',book,lesson,tab:'words'})}}>回到本课<ArrowRight size={16}/></button></div>
   <div className="vocabulary-source-bar"><SourceLinks source={entry}/><PlaybackSpeed ariaLabel="教材词汇发音语速"/></div>
   <p className="vocabulary-definition-note">词典简释 · 点词看完整释义，教材原义见原书。</p>
   {entry.words.length?<div className="textbook-vocabulary-list">{entry.words.map(({word,forms},i)=><VocabularyRow key={word} word={word} number={i+1} entry={dictionary[vocabularyKey(word)]} enrolled={enrolled(word,[{book,lesson}])} teachingSources={[{book,lesson}]} sources={allSources.get(vocabularyKey(word))} onAdd={onAdd} hints={allHints.get(vocabularyKey(word))} exampleSource={{book,lesson:book==='NCE1'&&lesson%2===0?lesson-1:lesson}} example={vocabularyExample(exampleSource?.key===entry.key?exampleSource.rows:[],word,forms)}/>)}</div>:<div className="empty"><h3>本课原书没有单列新词</h3><p>可回顾配套听读课的词汇，再进入本课练习。</p>{book==='NCE1'&&lesson%2===0&&<button className="btn secondary" onClick={()=>selectLesson(book,lesson-1)}>复习第 {lesson-1} 课词表<ArrowRight size={16}/></button>}</div>}
   <p className="small muted vocabulary-dictionary-note">词表来自本课 New words and expressions（生词和短语）。</p><div className="vocabulary-pagination"><button className="btn secondary" disabled={lesson===1} onClick={()=>selectLesson(book,lesson-1)}><ChevronLeft size={16}/>上一课</button><span>{lesson} / {bookCounts[book]}</span><button className="btn secondary" disabled={lesson===bookCounts[book]} onClick={()=>selectLesson(book,lesson+1)}>下一课<ChevronRight size={16}/></button></div>
  </section>:mode==='index'&&<>
   <div className="vocabulary-section-heading" id="vocabulary-results"><h2>单词索引</h2><PlaybackSpeed ariaLabel="教材词汇发音语速"/><span className="small muted" role="status">{results.length.toLocaleString()} 个词条{results.length?` · 第 ${paged.page} / ${paged.pages} 页`:''}</span></div>
   {results.length?<section className="panel vocabulary-index-panel"><div className="textbook-vocabulary-list">{paged.items.map(term=><VocabularyRow key={term.key} word={term.word} query={query} entry={dictionary[term.key]} enrolled={enrolled(term.word,term.sources)} teachingSources={term.sources} sources={allSources.get(term.key)} hints={allHints.get(term.key)} onAdd={onAdd}><div className="vocabulary-occurrences">{term.sources.map(source=><div className="vocabulary-occurrence" key={`${source.book}-${source.lesson}`}><button className="text-btn" onClick={()=>selectLesson(source.book,source.lesson)}>{bookNames[source.book]} · 第 {source.lesson} 课<ChevronRight size={14}/></button><SourceLinks source={source}/></div>)}</div></VocabularyRow>)}</div><div className="vocabulary-pagination"><button className="btn secondary" disabled={paged.page===1} onClick={()=>navigate({...route,page:paged.page-1},{scrollTarget:'vocabulary-results'})}><ChevronLeft size={16}/>上一页</button><label>页码<select aria-label="单词索引页码" value={paged.page} onChange={e=>navigate({...route,page:Number(e.target.value)},{scrollTarget:'vocabulary-results'})}>{Array.from({length:paged.pages},(_,i)=><option key={i+1} value={i+1}>{i+1} / {paged.pages}</option>)}</select></label><button className="btn secondary" disabled={paged.page===paged.pages} onClick={()=>navigate({...route,page:paged.page+1},{scrollTarget:'vocabulary-results'})}>下一页<ChevronRight size={16}/></button></div></section>:<section className="panel empty"><h3>没有匹配的教材词条</h3><p>试试其他英文或中文，或清除册数与首字母条件。</p><button className="btn secondary" onClick={()=>navigate({view:'words',tab:'index'})}>清除检索条件</button></section>}
  </>}
 </section>;
}
