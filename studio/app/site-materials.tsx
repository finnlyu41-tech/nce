'use client';
import {useEffect,useRef,useState} from 'react';
import {BookOpen,Download,FileText,Headphones,RefreshCw,Search,Volume2,Mic,ChevronLeft,ChevronRight} from 'lucide-react';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {Progress} from '@/components/ui/progress';
import {toast} from 'sonner';
import {State,NceBookId,bookCounts} from './model';
import {SiteMaterial,MaterialManifest,loadSiteMaterial,pairedMaterials,readMaterialManifest,materialLessonPage} from './site-material-utils';
import {readAudio,saveCollection} from './offline-store';
import {WordText} from './word-lookup';
import {loadLessonLanguage,rowsToText,translatedRows} from './language';
import {Recorder} from './learning';
import {normal} from './model';
import {parseLessonText} from './nce-utils';
import {navigate} from './navigation';
import {PlaybackSpeed,usePlaybackRate} from './playback-speed';
import {useRoute} from './use-route';
import {splitLesson} from './lesson-structure';
import {LessonQuestion,LessonPages} from './lesson-context';
import {SentenceIllustration} from './sentence-illustration-ui';
import {sentenceAtTime,sentenceEnd} from './sentence-illustration';
const books=Object.keys(bookCounts) as NceBookId[];
const accentLabel=(file:SiteMaterial)=>file.accent==='us'?'美音':file.accent==='uk'?'英音':'版本未标注';
type Loaded={file:SiteMaterial;blob:Blob;url:string;text?:string};
type Target={book:NceBookId;lesson:number};
type Props={visible:boolean;state:State;restore:(s:State)=>void;openLesson:(book:NceBookId,no:number)=>void;startAt?:Target|null;embedded?:boolean;practiceMode?:boolean;pdfOnly?:boolean;viewPdf?:()=>void};
export default function SiteMaterials({visible,state,restore,openLesson,startAt,embedded=false,practiceMode=false,pdfOnly=false,viewPdf}:Props){
 const route=useRoute();
 const [manifest,setManifest]=useState<MaterialManifest|null>(null),[book,setBook]=useState<NceBookId>('NCE1'),[filter,setFilter]=useState('all'),[accent,setAccent]=useState('all'),[query,setQuery]=useState('');
 const rate=usePlaybackRate();
 const [busy,setBusy]=useState(''),[error,setError]=useState(''),[progress,setProgress]=useState(0),[loaded,setLoaded]=useState<Loaded[]>([]),[selected,setSelected]=useState(''),[lesson,setLesson]=useState(1),[replace,setReplace]=useState(false),[active,setActive]=useState(-1),[hideText,setHideText]=useState(false),[targetNote,setTargetNote]=useState('');
 const [showTranslation,setShowTranslation]=useState(false),[dictationLine,setDictationLine]=useState(0),[dictationAnswer,setDictationAnswer]=useState(''),[dictationChecked,setDictationChecked]=useState(false);
 const [practiceKind,setPracticeKind]=useState<'shadow'|'dictation'>('shadow'),[sceneLine,setSceneLine]=useState(0);
 const seekTarget=useRef<number|null>(null),currentLine=useRef(0),stoppedLine=useRef<number|null>(null);
 const practicePanel=useRef<HTMLDivElement>(null);
 const [pageOnly,setPageOnly]=useState<Target|null>(null);
 const [pdfLesson,setPdfLesson]=useState<number|undefined>();
 const controller=useRef<AbortController|null>(null),indexController=useRef<AbortController|null>(null),stateRef=useRef(state),audio=useRef<HTMLAudioElement>(null),readerPanel=useRef<HTMLElement>(null),endAt=useRef<number|null>(null),pendingTarget=useRef<Target|null>(null);
 stateRef.current=state;
 const files=manifest?.files||[],primary=loaded.find(x=>x.file.id===selected)||loaded[0],recording=loaded.find(x=>x.file.type.startsWith('audio/')),transcript=loaded.find(x=>x.text!==undefined),allRows=parseLessonText(transcript?.text||''),structure=splitLesson(allRows,primary?.file.book,true),rows=structure.body;
 useEffect(()=>{if(!visible){audio.current?.pause();controller.current?.abort()}},[visible]);
 useEffect(()=>()=>{controller.current?.abort();indexController.current?.abort()},[]);
 useEffect(()=>()=>{loaded.forEach(x=>URL.revokeObjectURL(x.url))},[loaded]);
 useEffect(()=>{if(audio.current)audio.current.playbackRate=Number(rate)},[rate,recording?.url]);
 async function readIndex(){
  indexController.current?.abort();const abort=new AbortController();indexController.current=abort;
  setError('');setBusy('正在读取教材目录…');
  try{const data=await readMaterialManifest(abort.signal);if(!abort.signal.aborted)setManifest(data)}
  catch(e){if(!abort.signal.aborted)setError(e instanceof Error?e.message:'教材目录读取失败')}
  finally{if(indexController.current===abort)setBusy('')}
 }
 useEffect(()=>{if(visible&&!manifest&&!error&&!busy)void readIndex()},[visible,manifest,error,busy]);
 useEffect(()=>{if(visible&&startAt&&(embedded||!route.file)){pendingTarget.current=startAt;setBook(startAt.book);setQuery('');setFilter('all');setAccent('all')}},[visible,startAt,embedded,route.file]);
 useEffect(()=>{if(visible&&!embedded&&route.book)setBook(route.book)},[visible,embedded,route.book]);
 useEffect(()=>{if(visible&&!embedded&&route.file&&manifest&&!busy&&selected!==route.file){const file=files.find(f=>f.id===route.file);if(file)void open(file)}},[visible,embedded,route.file,manifest,busy,selected]);
 const choose=(file:SiteMaterial)=>embedded?void open(file):navigate({view:'cloud',book:file.book,lesson:file.lesson||undefined,file:file.id},{keepScroll:true});
 useEffect(()=>{
  if(!visible||!manifest||busy)return;
  const target=pendingTarget.current;if(!target)return;pendingTarget.current=null;
  const match=files.find(f=>f.book===target.book&&f.lesson===target.lesson&&f.type==='text/plain');
  if(pdfOnly&&embedded){setLoaded([]);setPageOnly(target);return}
  if(pdfOnly){const pdf=files.find(f=>f.book===target.book&&f.type==='application/pdf');if(pdf)void open(pdf,target.lesson);return}
  if(match){setTargetNote('');void open(match)}else{
   setTargetNote(target.book==='NCE1'&&target.lesson%2===0?`第 ${target.lesson} 课是句型与练习课，下方可阅读原书内容。当前资料包没有这课的独立录音与字幕。`:`第 ${target.lesson} 课没有独立配对的字幕与录音，请查看本册原书中的本课内容。`);
   if(embedded){setLoaded([]);setPageOnly(target)}else{const pdf=files.find(f=>f.book===target.book&&f.type==='application/pdf');if(pdf)void open(pdf,target.lesson);}
  }
 },[visible,manifest,busy,book]);
 async function open(file:SiteMaterial,forLesson?:number){
  controller.current?.abort();audio.current?.pause();endAt.current=null;
  const abort=new AbortController();controller.current=abort;
  setPageOnly(null);setSceneLine(0);currentLine.current=0;seekTarget.current=null;stoppedLine.current=null;setDictationLine(0);setDictationAnswer('');setDictationChecked(false);
  setBusy('正在读取 '+(file.title||file.name));setError('');setProgress(0);setReplace(false);setActive(-1);
  const results:Loaded[]=[];
  try{
   const group=pairedMaterials(files,file),total=group.reduce((n,f)=>n+f.size,0);let done=0;
   for(const member of group){
    const blob=await loadSiteMaterial(member,abort.signal,value=>setProgress((done+member.size*value/100)/total*100));done+=member.size;
    let text=member.type==='text/plain'?await blob.text():undefined;
    if(text!==undefined){const language=await loadLessonLanguage(member.book,member.lesson);if(language?.sourceSha256===member.sha256)text=rowsToText(translatedRows(text,language))}
    if(text!==undefined&&text.length>50000)throw Error('课文超过工作区大小限制');
    results.push({file:member,blob,url:URL.createObjectURL(blob),text});
   }
   if(abort.signal.aborted)throw new DOMException('Aborted','AbortError');
   setLoaded(results);setSelected(file.id);setBook(file.book);setLesson(file.lesson||forLesson||1);setPdfLesson(file.type==='application/pdf'?forLesson:undefined);setHideText(practiceMode&&practiceKind==='dictation');setShowTranslation(false);
   if(!embedded)requestAnimationFrame(()=>readerPanel.current?.scrollIntoView({behavior:'smooth',block:'start'}));
  }catch(e){results.forEach(x=>URL.revokeObjectURL(x.url));if(!abort.signal.aborted)setError(e instanceof Error?e.message:'教材读取失败')}
  finally{if(controller.current===abort)setBusy('')}
 }
 function followLine(index:number){
  if(!rows.length||index>=rows.length){setActive(-1);return;}
  setActive(index);index=Math.max(0,index);setSceneLine(index);
  if(practiceMode&&currentLine.current!==index){
   setDictationLine(index);setDictationAnswer('');setDictationChecked(false);setShowTranslation(false);
   if(practiceKind==='dictation')setHideText(true);
  }
  currentLine.current=index;
 }
 function timeUpdate(){
  const p=audio.current;if(!p)return;
  if(p.paused&&stoppedLine.current!==null)return;
  if(endAt.current!==null&&p.currentTime>=endAt.current){stoppedLine.current=currentLine.current;p.pause();endAt.current=null;return;}
  followLine(sentenceAtTime(rows,p.currentTime));
 }
 function seek(time:number){stoppedLine.current=null;seekTarget.current=time;if(audio.current)audio.current.currentTime=time;}
 function seeking(){
  const time=audio.current?.currentTime;
  if(time===undefined)return;
  if(seekTarget.current===null||Math.abs(time-seekTarget.current)>.1){endAt.current=null;stoppedLine.current=null;}
  seekTarget.current=null;
 }
 function playLine(index:number){
  const p=audio.current,time=rows[index]?.time;if(!p||time===undefined)return;
  endAt.current=sentenceEnd(rows,index);seek(time);p.playbackRate=Number(rate);followLine(index);
  void p.play().catch(()=>setError('浏览器未能播放音频，请再次点击播放'));
 }
 function selectLine(index:number){
  audio.current?.pause();endAt.current=null;if(rows[index]?.time!==undefined)seek(rows[index].time!);followLine(index);
 }
 function changePractice(kind:'shadow'|'dictation'){
  audio.current?.pause();endAt.current=null;setPracticeKind(kind);setHideText(kind==='dictation');setShowTranslation(false);setDictationAnswer('');setDictationChecked(false);
 }
 async function useLesson(){
  if(!primary||primary.file.type==='application/pdf'||!Number.isInteger(lesson)||lesson<1||lesson>bookCounts[primary.file.book])return;
  setBusy('正在保存本课文本与音频…');
  try{
   const key=`${primary.file.book}-${lesson}`,existing=await readAudio(key),current=stateRef.current;
   const old=current.nce?.[key]||{title:'',text:'',notes:'',steps:[]};
   const audioChanged=existing&&recording&&(existing.name!==recording.file.name||existing.blob.size!==recording.blob.size||
     await digest(existing.blob)!==recording.file.sha256);
   if(!replace&&((transcript&&old.text&&JSON.stringify(parseLessonText(old.text).map(r=>[r.en,r.time]))!==JSON.stringify(parseLessonText(transcript.text||'').map(r=>[r.en,r.time])))||audioChanged))throw Error('本课已有不同资料。请核对后勾选替换；原笔记和进度会保留。');
   if(current!==stateRef.current)throw Error('学习记录刚发生变化，请重试保存。');
   const next:State={...current,nceLast:{book:primary.file.book,lesson},nce:{...current.nce,[key]:{...old,title:old.title||(primary.file.title||primary.file.name).slice(0,120),text:transcript?.text??old.text}}};
   await saveCollection(next,recording?[{key,name:recording.file.name,type:recording.file.type,blob:recording.blob}]:[]);
   restore(next);window.dispatchEvent(new Event('english-studio-media-updated'));audio.current?.pause();
   openLesson(primary.file.book,lesson);
  }catch(e){setError(e instanceof Error?e.message:'保存未完成')}
  finally{setBusy('')}
 }
 const own=files.filter(f=>f.book===book),pdf=own.find(f=>f.type==='application/pdf'),texts=own.filter(f=>f.type==='text/plain');
 const shown=own.filter(f=>(accent==='all'||f.type==='application/pdf'||f.accent===accent)&&
  (filter==='all'||filter==='pdf'&&f.type==='application/pdf'||filter==='audio'&&f.type.startsWith('audio/')||filter==='text'&&f.type==='text/plain')&&
  `${f.lesson} ${f.title||''} ${f.name}`.toLowerCase().includes(query.toLowerCase())&&
  (filter!=='all'||f.type!=='text/plain'||!f.pairId||!own.some(a=>a.pairId===f.pairId&&a.type.startsWith('audio/'))));
 const lessonFiles=texts.filter(f=>f.accent===primary?.file.accent).sort((a,b)=>a.lesson-b.lesson),position=lessonFiles.findIndex(f=>f.pairId===primary?.file.pairId);
 const pdfPage=primary&&pdfLesson?materialLessonPage(primary.file,pdfLesson):undefined;
 const readerUrl=primary?primary.url+(pdfPage?`#page=${pdfPage}`:''):'';
 return <div hidden={!visible} className={'cloud-library'+(embedded?' embedded-materials':'')}>
  {!embedded&&<>
  <div className="page-heading"><div><div className="eyebrow">BOOKS & AUDIO</div><h1>整册资料与下载</h1><p>这里按原文件列出 PDF、音轨和字幕。逐课学习请从「新概念 · 四册」课程目录进入。</p></div><button className="btn secondary" disabled={!!busy} onClick={readIndex}><RefreshCw size={17}/>刷新教材</button></div>
  {manifest?.files.length===0&&<div className="cloud-pending"><strong>四册教材正在等待接入</strong><p>当前网站教材目录为空；原创课程、语法和练习仍可直接使用。</p></div>}
  {manifest?.notices?.map(n=><p className="notice" key={n}>{n}</p>)}
  {book==='NCE1'&&texts.length>0&&<p className="notice">第一册有 72 组美音听读资料。文件名含奇偶课号，字幕仅标注奇数课；偶数课的词汇与练习请对照 PDF。</p>}
  </>}
  {targetNote&&<p className="notice">{targetNote}</p>}
  {error&&<div className="notice" role="alert"><p>{error}</p><button className="text-btn" disabled={!!busy} onClick={()=>{if(startAt)pendingTarget.current=startAt;void readIndex()}}>重新读取教材</button></div>}
  {busy&&<div className="cloud-working" role="status"><span>{busy}</span><Progress value={progress}/></div>}
  {!embedded&&<div className="filter-bar section-space"><Tabs value={book} onValueChange={v=>{controller.current?.abort();audio.current?.pause();setBook(v as NceBookId);setLoaded([]);setSelected('');setQuery('');setTargetNote('');navigate({view:'cloud',book:v as NceBookId},{keepScroll:true})}}><TabsList>{books.map((b,i)=><TabsTrigger key={b} value={b}>第 {i+1} 册</TabsTrigger>)}</TabsList></Tabs><span className="muted small">本册 {own.filter(f=>f.type==='application/pdf').length} 份 PDF · {own.filter(f=>f.type.startsWith('audio/')).length} 音轨 · {texts.length} 字幕</span></div>}
  {pageOnly?<section className="panel"><LessonPages book={pageOnly.book} lesson={pageOnly.lesson}/><p className="small muted">先显示本课前两页，点图可放大。更多原书习题可打开完整 PDF。</p><button className="btn secondary" onClick={()=>{const pdf=files.find(f=>f.book===pageOnly.book&&f.type==='application/pdf');if(pdf)void open(pdf,pageOnly.lesson)}}>打开完整原书 PDF（文件较大）</button></section>:<div className={embedded?'site-lesson-reader':'cloud-grid'}>{!embedded&&<section className="panel cloud-files"><div className="section-top"><h2>本册教材</h2><span className="muted small">{shown.length} 项</span></div>
   <Tabs value={filter} onValueChange={setFilter}><TabsList><TabsTrigger value="all">听读配对</TabsTrigger><TabsTrigger value="pdf">PDF 原书</TabsTrigger><TabsTrigger value="audio">音频</TabsTrigger><TabsTrigger value="text">课文</TabsTrigger></TabsList></Tabs>
   <label className="search"><Search size={17}/><input aria-label="搜索网站教材" value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索课号或标题"/></label>
   <label className="field cloud-accent">录音版本<select aria-label="录音版本" value={accent} onChange={e=>setAccent(e.target.value)}><option value="all">全部版本</option><option value="us">美音</option><option value="uk">英音</option></select></label>
   {shown.map(f=><button className={'cloud-file '+(loaded.some(x=>x.file.id===f.id)?'selected':'')} key={f.id} disabled={!!busy} onClick={()=>{setTargetNote('');choose(f)}}>{f.type.startsWith('audio/')?<Headphones size={20}/>:<FileText size={20}/>}<span><strong>{f.title?`${f.lesson?`第 ${f.lesson} 课 · `:''}${f.title}`:f.name}</strong><small>{f.type==='application/pdf'?`${f.pages||'—'} 页 · ${f.textStatus==='scan'?'扫描本':'PDF'}`:`${accentLabel(f)} · ${f.pairId&&pairedMaterials(files,f).length===2?'音频 + LRC':'单份资料'}`} · {(f.size/1024**2).toFixed(1)} MiB</small></span></button>)}
   {!shown.length&&<div className="empty"><BookOpen size={36}/><h3>没有符合条件的教材</h3><p>试试其他课号或录音版本。</p></div>}
  </section>}
  <section ref={readerPanel} className={'panel cloud-reader'+(!hideText?' illustrated-reader':'')}>{primary?<>
   <div className="section-top"><div><h2>{practiceMode&&hideText?`第 ${primary.file.lesson} 课 · 听写与跟读`:structure.title?.en||primary.file.title||primary.file.name}</h2>{!hideText&&showTranslation&&structure.title?.zh&&<p className="line-translation">{structure.title.zh}</p>}</div><a href={primary.url} download={primary.file.name} className="text-btn"><Download size={17}/>下载原文件</a></div>
   {primary.file.type==='application/pdf'?<>{pdfPage&&<p className="notice">第 {pdfLesson} 课 · 已定位到 PDF 第 {pdfPage} 页。可对照原书完成本课句型与练习。</p>}<p className="muted small">{primary.file.pages} 页 · {embedded?'可翻页、放大和下载；如阅读器未显示，请在新窗口打开。':primary.file.textStatus==='scan'?'扫描本，没有可提取正文；逐句听读采用配套 LRC。':'原书 PDF，未自动按课抽取。'}</p><a className="text-btn" href={readerUrl} target="_blank" rel="noreferrer">在新窗口阅读 PDF</a><iframe title="教材 PDF 阅读器" className="cloud-pdf" src={readerUrl}/></>:<>
    <p className="muted small">{accentLabel(primary.file)} · 第 {primary.file.lesson||'未核定'} 课 · 配套音频与字幕</p>
    {!embedded&&primary.file.lessonNote&&<p className="notice">{primary.file.lessonNote}</p>}
    {!practiceMode&&<LessonQuestion lesson={structure} answer={state.drafts[`listen-answer-${primary.file.book}-${primary.file.lesson}`]||''} onChange={value=>{const current=stateRef.current;restore({...current,drafts:{...current.drafts,[`listen-answer-${primary.file.book}-${primary.file.lesson}`]:value}})}}/>}
    {recording&&<div className="cloud-player"><audio ref={audio} controls preload="metadata" src={recording.url} aria-label="网站课文音频" onTimeUpdate={timeUpdate} onPlay={()=>{stoppedLine.current=null}} onSeeking={seeking} onSeeked={timeUpdate} onEnded={()=>{endAt.current=null;setActive(-1)}} onError={()=>setError('音频不能解码，请下载原文件核对')} onLoadedMetadata={()=>{if(audio.current)audio.current.playbackRate=Number(rate)}}/><div className="row wrap"><PlaybackSpeed ariaLabel="网站音频播放速度"/><button className="text-btn" onClick={()=>{endAt.current=null;if(audio.current){seek(rows[0]?.time||0);followLine(0);void audio.current.play().catch(()=>setError('请再次点击播放'))}}}>从正文开始播放</button>{transcript&&<button className="text-btn" aria-expanded={!hideText} onClick={()=>{setHideText(!hideText);setShowTranslation(false)}}>{hideText?'需要时看原文与原书图片':'收起原文与原书图片'}</button>}</div></div>}
    {practiceMode&&<div className="practice-kind" aria-label="选择练习方式"><button aria-pressed={practiceKind==='shadow'} onClick={()=>changePractice('shadow')}>看图跟读</button><button aria-pressed={practiceKind==='dictation'} onClick={()=>changePractice('dictation')}>听写</button></div>}
    {practiceMode&&rows.length>0&&<label className="field record-line-select">{practiceKind==='shadow'?'选择跟读句':'选择听写句'}<select aria-label="选择练习句" value={dictationLine} onChange={e=>selectLine(Number(e.target.value))}>{rows.map((row,i)=><option key={i} value={i}>{practiceKind==='shadow'?`${i+1}. ${row.en.slice(0,80)}`:`第 ${i+1} 句`}</option>)}</select></label>}
    {!hideText&&rows[sceneLine]&&<div ref={practicePanel} className="reading-scene"><SentenceIllustration book={primary.file.book} lesson={primary.file.lesson} line={sceneLine} rowCount={rows.length} sourceSha256={transcript?.file.sha256}/><div className="reading-current" lang="en"><WordText text={rows[sceneLine].en} exampleTranslation={rows[sceneLine].zh}/>{showTranslation&&rows[sceneLine].zh&&<p className="line-translation">{rows[sceneLine].zh}</p>}</div><div className="row spread"><span className="small muted">第 {sceneLine+1} / {rows.length} 句</span><button className="text-btn" aria-expanded={showTranslation} onClick={()=>setShowTranslation(!showTranslation)}>{showTranslation?'隐藏本句中文':'查看本句中文'}</button></div>{!practiceMode&&<div className="row spread"><button className="text-btn" disabled={sceneLine===0} onClick={()=>selectLine(sceneLine-1)}>上一句</button><button className="btn secondary" onClick={()=>playLine(sceneLine)}><Volume2 size={17}/>重听本句</button><button className="text-btn" disabled={sceneLine===rows.length-1} onClick={()=>selectLine(sceneLine+1)}>下一句</button></div>}</div>}
    {practiceMode&&rows.length>0&&<section className={'lesson-dictation reading-scene '+(practiceKind==='shadow'&&!hideText?'picture-shadow':'')}>{practiceKind==='dictation'&&<><h3>逐句听写</h3><p className="muted small">先听一句，再输入你听到的内容。核对后会显示原句和中文。</p><div className="row spread"><span>第 {dictationLine+1} / {rows.length} 句</span><button className="btn secondary" onClick={()=>playLine(dictationLine)}><Volume2 size={17}/>听这一句</button></div><PlaybackSpeed label="练习语速" ariaLabel="在线听写语速"/></>}{practiceKind==='dictation'&&<><label className="field">听写答案<textarea value={dictationAnswer} onChange={e=>{setDictationAnswer(e.target.value);setDictationChecked(false);setHideText(true);setShowTranslation(false)}}/></label><button className="btn" disabled={!dictationAnswer.trim()} onClick={()=>setDictationChecked(true)}>核对答案</button>{dictationChecked&&<div className="feedback"><strong>{normal(dictationAnswer)===normal(rows[dictationLine].en)?'完全正确':'对照原句，再听一次'}</strong><p>{rows[dictationLine].en}</p><p>{rows[dictationLine].zh}</p></div>}</>}<div className="row spread"><button className="text-btn" disabled={dictationLine===0} onClick={()=>selectLine(dictationLine-1)}>上一句</button>{practiceKind==='shadow'&&<button className="btn secondary" onClick={()=>playLine(dictationLine)}><Volume2 size={17}/>听这一句</button>}<button className="text-btn" disabled={dictationLine===rows.length-1} onClick={()=>selectLine(dictationLine+1)}>下一句</button></div>{practiceKind==='shadow'&&<Recorder key={`${primary.file.id}-${dictationLine}`} referenceText={rows[dictationLine].en} hideReference={hideText} onListen={()=>playLine(dictationLine)} onBeforeRecord={()=>{audio.current?.pause();endAt.current=null;setActive(-1)}}/>}</section>}
    {transcript&&<details className="reading-transcript"><summary>{hideText?'选择句子听音':'展开完整课文，逐句点读'}</summary><h3 className="lesson-body-title">{hideText?'先听，再试着写下来':'课文正文'}</h3><div className="transcript-tools"><span className="muted small">{hideText?'原文、中文和原书图片已收起，点喇叭听整句。':'点单词查音标和词义 · 点喇叭听整句'}</span>{!hideText&&<button className="text-btn" aria-expanded={showTranslation} onClick={()=>setShowTranslation(!showTranslation)}>{showTranslation?'隐藏中文':'需要时看中文'}</button>}</div><div className="site-transcript">{rows.map((row,i)=><div key={i} className={'site-line '+(active===i?'active':'')}><span className="site-time">{row.time===undefined?'—':`${Math.floor(row.time/60)}:${String(Math.floor(row.time%60)).padStart(2,'0')}`}</span><div>{hideText?`第 ${i+1} 句（点击听音）`: <WordText text={row.en} exampleTranslation={row.zh}/>} {!hideText&&showTranslation&&row.zh&&<p className="line-translation">{row.zh}</p>}</div><div className="line-actions"><button className="icon-btn line-play" disabled={!recording||row.time===undefined} onClick={()=>playLine(i)} aria-label={`播放第 ${i+1} 句`}><Volume2 size={18}/></button>{practiceMode&&<button className="icon-btn" aria-label={`跟读第 ${i+1} 句`} onClick={()=>{selectLine(i);changePractice('shadow');requestAnimationFrame(()=>practicePanel.current?.scrollIntoView({behavior:'smooth',block:'start'}))}}><Mic size={18}/></button>}</div></div>)}</div></details>}
    <p className="muted small">中文为学习参考，来自原项目中英字幕；已核对分句对应，仍可对照原书确认。</p>
    <div className="row wrap">{!embedded&&<><button className="btn secondary" disabled={!!busy||position<=0} onClick={()=>choose(lessonFiles[position-1])}><ChevronLeft size={16}/>上一篇</button><button className="btn secondary" disabled={!!busy||position<0||position>=lessonFiles.length-1} onClick={()=>choose(lessonFiles[position+1])}>下一篇<ChevronRight size={16}/></button></>}{pdf&&<button className="text-btn" disabled={!!busy} onClick={()=>viewPdf?viewPdf():embedded?void open(pdf,primary.file.lesson):choose(pdf)}>查看本课原书与练习</button>}</div>
    <details className="lesson-offline"><summary>保存资料供离线使用</summary><div className="cloud-use">{!embedded&&<label className="field">保存到第几课<input aria-label="保存教材的课号" type="number" min={1} max={bookCounts[primary.file.book]} value={lesson} onChange={e=>setLesson(Number(e.target.value))}/></label>}<button className="btn" disabled={!!busy||!Number.isInteger(lesson)||lesson<1||lesson>bookCounts[primary.file.book]} onClick={useLesson}>保存并进入本课练习 <BookOpen size={17}/></button><label className="cloud-replace"><input type="checkbox" checked={replace} onChange={e=>setReplace(e.target.checked)}/>替换本课已有文本和音频（保留笔记与进度）</label><p className="muted small">配对资料一起保存到当前浏览器。可继续逐句听写、整理词句、复述和语法补强；保存后断网也可用。</p></div></details>
   </>}
  </>:<div className="empty cloud-reader-empty"><BookOpen size={52}/><h2>书在这里，随时翻开。</h2><p>选择 PDF 看原书，或选择一课同步听读。</p></div>}</section></div>}
  {!embedded&&<p className="muted small section-space">网站教材可跨设备读取；进度、笔记和生词保存在当前浏览器，暂不自动跨设备同步。</p>}
 </div>;
}
async function digest(blob:Blob){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())),x=>x.toString(16).padStart(2,'0')).join('')}
