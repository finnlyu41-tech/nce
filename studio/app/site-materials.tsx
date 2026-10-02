'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {BookOpen,Download,FileText,Headphones,RefreshCw,Search,Volume2,Mic,ChevronLeft,ChevronRight} from 'lucide-react';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {LoadingStatus} from './loading-status';
import {withNetworkTimeout} from './network';
import {toast} from 'sonner';
import {State,NceBookId,bookCounts} from './model';
import {SiteMaterial,MaterialManifest,loadSiteMaterial,pairedMaterials,readMaterialManifest,materialLessonPage} from './site-material-utils';
import {readAudio,type LocalAudio} from './offline-store';
import {WordText} from './word-lookup';
import {loadLessonLanguage,rowsToText,translatedRows} from './language';
import {Recorder} from './learning';
import {normal} from './model';
import {parseLessonText} from './nce-utils';
import {navigate} from './navigation';
import {PlaybackSpeed,usePlaybackRate} from './playback-speed';
import {useRoute} from './use-route';
import {splitLesson} from './lesson-structure';
import {LessonQuestion,LessonPages,TextbookVocabulary} from './lesson-context';
import {LessonExplainer} from './lesson-explainer';
import {ChineseRecall} from './chinese-recall-ui';
import {ReadingLayout} from './sentence-illustration-ui';
import {sentenceAtTime,sentenceEnd} from './sentence-illustration';
import {useReadingPosition} from './use-reading-position';
const books=Object.keys(bookCounts) as NceBookId[];
const accentLabel=(file:SiteMaterial)=>file.accent==='us'?'美音':file.accent==='uk'?'英音':'版本未标注';
type Loaded={file:SiteMaterial;blob:Blob;url:string;text?:string};
type Target={book:NceBookId;lesson:number};
type Props={visible:boolean;state:State;restore:(s:State)=>void;commitCollection:(expected:State,next:State,media:LocalAudio[])=>Promise<void>;openLesson:(book:NceBookId,no:number)=>void;startAt?:Target|null;embedded?:boolean;practiceMode?:boolean;pdfOnly?:boolean;viewPdf?:()=>void};
export default function SiteMaterials({visible,state,restore,commitCollection,openLesson,startAt,embedded=false,practiceMode=false,pdfOnly=false,viewPdf}:Props){
 const route=useRoute();
 const [manifest,setManifest]=useState<MaterialManifest|null>(null),[book,setBook]=useState<NceBookId>('NCE1'),[filter,setFilter]=useState('all'),[accent,setAccent]=useState('all'),[query,setQuery]=useState('');
 const rate=usePlaybackRate();
 const [busy,setBusy]=useState(''),[error,setError]=useState(''),[progress,setProgress]=useState<number|null>(null),[loaded,setLoaded]=useState<Loaded[]>([]),[selected,setSelected]=useState(''),[lesson,setLesson]=useState(1),[replace,setReplace]=useState(false),[active,setActive]=useState(-1),[hideText,setHideText]=useState(false),[targetNote,setTargetNote]=useState('');
 const lastRequest=useRef<{file:SiteMaterial;forLesson?:number}|null>(null);
 const [playback,setPlayback]=useState<'idle'|'waiting'|'playing'>('idle');
 const playbackRequest=useRef(0);
 const [showTranslation,setShowTranslation]=useState(false),[dictationAnswer,setDictationAnswer]=useState(''),[dictationChecked,setDictationChecked]=useState(false);
 const [recordingLine,setRecordingLine]=useState<number|null>(null);
 const practiceKind=practiceMode?route.mode||'shadow':'shadow';
 useEffect(()=>{audio.current?.pause();endAt.current=null;setActive(-1);setHideText(practiceKind!=='shadow');setShowTranslation(false)},[practiceKind]);
 const seekTarget=useRef<number|null>(null),currentLine=useRef(0),stoppedLine=useRef<number|null>(null);
 const practicePanel=useRef<HTMLDivElement>(null);
 const [pageOnly,setPageOnly]=useState<Target|null>(null);
 const [pdfLesson,setPdfLesson]=useState<number|undefined>();
 const controller=useRef<AbortController|null>(null),indexController=useRef<AbortController|null>(null),stateRef=useRef(state),audio=useRef<HTMLAudioElement>(null),readerPanel=useRef<HTMLElement>(null),endAt=useRef<number|null>(null),pendingTarget=useRef<Target|null>(null);
 stateRef.current=state;
 const files=manifest?.files||[],primary=loaded.find(x=>x.file.id===selected)||loaded[0],recording=loaded.find(x=>x.file.type.startsWith('audio/')),transcript=loaded.find(x=>x.text!==undefined);
 const structure=useMemo(()=>splitLesson(parseLessonText(transcript?.text||''),primary?.file.book,true),[transcript?.text,primary?.file.book]),rows=structure.body;
 const readingSource=transcript&&rows.length?`site:${primary?.file.book}:${primary?.file.lesson}:${transcript.file.sha256}:${recording?.file.sha256||'text'}`:undefined;
 const {line:sceneLine,setLine:setSceneLine,entry:readingEntry}=useReadingPosition(readingSource,rows.length),dictationLine=sceneLine;
 currentLine.current=sceneLine;
 useEffect(()=>{audio.current?.pause();endAt.current=null;setActive(-1);setRecordingLine(null);setDictationAnswer('');setDictationChecked(false);restoreAudioPosition()},[readingEntry,readingSource]);
 function restoreAudioPosition(){const player=audio.current,time=rows[currentLine.current]?.time;if(player&&player.readyState>=1&&time!==undefined){stoppedLine.current=currentLine.current;seekTarget.current=time;player.currentTime=time}}
 useEffect(()=>{if(!visible){audio.current?.pause();controller.current?.abort();indexController.current?.abort()}},[visible]);
 useEffect(()=>()=>{controller.current?.abort();indexController.current?.abort()},[]);
 useEffect(()=>()=>{loaded.forEach(x=>URL.revokeObjectURL(x.url))},[loaded]);
 useEffect(()=>{if(audio.current)audio.current.playbackRate=Number(rate)},[rate,recording?.url]);
 useEffect(()=>{playbackRequest.current++;setPlayback('idle')},[recording?.url]);
 useEffect(()=>{if(playback!=='waiting')return;const timer=setTimeout(()=>{playbackRequest.current++;audio.current?.pause();setPlayback('idle');setError('音频准备时间过长，请重新点击播放。')},15000);return()=>clearTimeout(timer)},[playback]);
 async function readIndex(refresh=false){
  indexController.current?.abort();const abort=new AbortController();indexController.current=abort;
  setError('');setProgress(null);setBusy('正在读取教材目录…');
  try{const data=await readMaterialManifest(abort.signal,refresh);if(!abort.signal.aborted)setManifest(data)}
  catch(e){if(!abort.signal.aborted)setError(e instanceof Error?e.message:'教材目录读取失败')}
  finally{if(indexController.current===abort)setBusy('')}
 }
 useEffect(()=>{if(visible&&!manifest&&!error&&!busy)void readIndex()},[visible,manifest,error,busy]);
 useEffect(()=>{if(visible&&startAt&&(embedded||!route.file)){controller.current?.abort();pendingTarget.current=startAt;lastRequest.current=null;setLoaded([]);setSelected('');setBook(startAt.book);setQuery('');setFilter('all');setAccent('all')}},[visible,startAt?.book,startAt?.lesson,embedded,route.file]);
 useEffect(()=>{if(visible&&!embedded&&route.book)setBook(route.book)},[visible,embedded,route.book]);
 useEffect(()=>{if(visible&&!embedded&&route.file&&manifest&&selected!==route.file){const file=files.find(f=>f.id===route.file);if(file)void open(file)}},[visible,embedded,route.file,manifest]);
 const choose=(file:SiteMaterial)=>embedded?void open(file):navigate({view:'cloud',book:file.book,lesson:file.lesson||undefined,file:file.id},{keepScroll:true});
 useEffect(()=>{
  if(!visible||!manifest||busy)return;
  const target=pendingTarget.current;if(!target)return;pendingTarget.current=null;
  const match=files.find(f=>f.book===target.book&&f.lesson===target.lesson&&f.type==='text/plain');
  if(pdfOnly&&embedded){setLoaded([]);setPageOnly(target);return}
  if(pdfOnly){const pdf=files.find(f=>f.book===target.book&&f.type==='application/pdf');if(pdf)void open(pdf,target.lesson);return}
  if(match){setTargetNote('');void open(match)}else{
   setTargetNote(target.book==='NCE1'&&target.lesson%2===0?`第 ${target.lesson} 课是句型与练习课。用配套课文练习，再换成本课词表中的内容；回听原声可进入第 ${target.lesson-1} 课。`:`第 ${target.lesson} 课没有独立配对的字幕与录音，请查看本册原书中的本课内容。`);
   if(embedded){setLoaded([]);setPageOnly(target)}else{const pdf=files.find(f=>f.book===target.book&&f.type==='application/pdf');if(pdf)void open(pdf,target.lesson);}
  }
 },[visible,manifest,busy,book,startAt?.book,startAt?.lesson]);
 function cancelLoading(){pendingTarget.current=null;controller.current?.abort();indexController.current?.abort();setBusy('');setError('已取消加载，可以重新读取教材。')}
 function retry(){const previous=lastRequest.current;if(previous){void open(previous.file,previous.forLesson)}else{if(startAt)pendingTarget.current=startAt;void readIndex(true)}}
 async function open(file:SiteMaterial,forLesson?:number){
  controller.current?.abort();audio.current?.pause();endAt.current=null;
  const abort=new AbortController();controller.current=abort;lastRequest.current={file,forLesson};
  setLoaded([]);setSelected('');
  setPageOnly(null);setRecordingLine(null);currentLine.current=0;seekTarget.current=null;stoppedLine.current=null;setDictationAnswer('');setDictationChecked(false);
  setBusy('正在读取 '+(file.title||file.name));setError('');setProgress(0);setReplace(false);setActive(-1);
  const results:Loaded[]=[];
  try{
   const group=pairedMaterials(files,file),total=group.reduce((n,f)=>n+f.size,0),downloaded=new Map<string,number>();
   // Fetch the small translation alongside the pair, not between the two files.
   const languageRequest=group.some(f=>f.type==='text/plain')?loadLessonLanguage(file.book,file.lesson):Promise.resolve(null);
   await Promise.all(group.map(async member=>{
    const blob=await loadSiteMaterial(member,abort.signal,value=>{if(abort.signal.aborted)return;downloaded.set(member.id,member.size*value/100);setProgress(Math.floor([...downloaded.values()].reduce((a,b)=>a+b,0)/total*99))});
    let text=member.type==='text/plain'?await blob.text():undefined;
    if(text!==undefined){const language=await withNetworkTimeout(()=>languageRequest,abort.signal);if(language?.sourceSha256===member.sha256)text=rowsToText(translatedRows(text,language))}
    if(text!==undefined&&text.length>50000)throw Error('课文超过工作区大小限制');
    if(abort.signal.aborted)throw new DOMException('Aborted','AbortError');
    results.push({file:member,blob,url:URL.createObjectURL(blob),text});
   }));
   if(abort.signal.aborted)throw new DOMException('Aborted','AbortError');
   setLoaded(results);setSelected(file.id);setBook(file.book);setLesson(file.lesson||forLesson||1);setPdfLesson(file.type==='application/pdf'?forLesson:undefined);setHideText(practiceMode&&practiceKind!=='shadow');setShowTranslation(false);
   if(!embedded&&!history.state?.studioReadingPosition?.source)requestAnimationFrame(()=>readerPanel.current?.scrollIntoView({behavior:'smooth',block:'start'}));
  }catch(e){const cancelled=abort.signal.aborted;abort.abort();results.forEach(x=>URL.revokeObjectURL(x.url));if(!cancelled)setError(e instanceof Error?e.message:'教材读取失败')}
  finally{if(controller.current===abort)setBusy('')}
 }
 function followLine(index:number){
  if(!rows.length||index>=rows.length){setActive(-1);return;}
  index=Math.max(0,index);if(!setSceneLine(index))return;setActive(index);if(currentLine.current!==index)setRecordingLine(null);
  if(practiceMode&&currentLine.current!==index){
   setDictationAnswer('');setDictationChecked(false);
   if(practiceKind==='dictation'){setHideText(true);setShowTranslation(false)}
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
 function playLine(index:number,last=index){
  const p=audio.current,time=rows[index]?.time;if(!p||time===undefined)return;
  endAt.current=sentenceEnd(rows,last);seek(time);p.playbackRate=Number(rate);followLine(index);
  startPlayback(p);
 }
 function startPlayback(player:HTMLAudioElement){
  const request=++playbackRequest.current;setError('');setPlayback('waiting');
  void player.play().then(()=>{if(playbackRequest.current===request)setPlayback(player.paused?'idle':'playing')}).catch(e=>{if(playbackRequest.current===request){setPlayback('idle');if(e?.name!=='AbortError')setError('浏览器未能播放音频，请再次点击播放')}});
 }
 function selectLine(index:number){
  audio.current?.pause();endAt.current=null;if(rows[index]?.time!==undefined)seek(rows[index].time!);followLine(index);
 }
 function changePractice(kind:'shadow'|'dictation'|'recall'){
  audio.current?.pause();endAt.current=null;navigate({...route,tab:'listen',mode:kind==='shadow'?undefined:kind},{keepScroll:true});setHideText(kind!=='shadow');setShowTranslation(false);setDictationAnswer('');setDictationChecked(false);
 }
 async function useLesson(){
  if(!primary||primary.file.type==='application/pdf'||!Number.isInteger(lesson)||lesson<1||lesson>bookCounts[primary.file.book])return;
  setProgress(null);setError('');setBusy('正在保存本课文本与音频…');
  try{
   const key=`${primary.file.book}-${lesson}`,existing=await readAudio(key),current=stateRef.current;
   const old=current.nce?.[key]||{title:'',text:'',notes:'',steps:[]};
   const audioChanged=existing&&recording&&(existing.name!==recording.file.name||existing.blob.size!==recording.blob.size||
     await digest(existing.blob)!==recording.file.sha256);
   if(!replace&&((transcript&&old.text&&JSON.stringify(parseLessonText(old.text).map(r=>[r.en,r.time]))!==JSON.stringify(parseLessonText(transcript.text||'').map(r=>[r.en,r.time])))||audioChanged))throw Error('本课已有不同资料。请核对后勾选替换；原笔记和进度会保留。');
   if(current!==stateRef.current)throw Error('学习记录刚发生变化，请重试保存。');
   const next:State={...current,nceLast:{book:primary.file.book,lesson},nce:{...current.nce,[key]:{...old,title:old.title||(primary.file.title||primary.file.name).slice(0,120),text:transcript?.text??old.text}}};
   await commitCollection(current,next,recording?[{key,name:recording.file.name,type:recording.file.type,blob:recording.blob}]:[]);
   window.dispatchEvent(new Event('english-studio-media-updated'));audio.current?.pause();
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
 const passage=<><h3 className="lesson-body-title">{hideText?'先听，再试着写下来':'课文正文'}</h3><p className="muted small">{hideText?'原文、中文和原书图片已收起，点喇叭听整句。':'点句子选中 · 点单词查词 · 点喇叭听原声'}</p><div className="site-transcript">{rows.map((row,i)=><div key={i}>
  <div className={'site-line '+(sceneLine===i?'active':'')} data-reading-line={i} aria-current={sceneLine===i?'true':undefined} role="group" aria-label={`课文第 ${i+1} 句`} tabIndex={0} onClick={event=>{if(!(event.target as HTMLElement).closest('button,a,input,select,textarea'))selectLine(i)}} onKeyDown={event=>{if(event.target===event.currentTarget&&(event.key==='Enter'||event.key===' ')){event.preventDefault();selectLine(i)}}}>
   <span className="site-time">{row.time===undefined?'—':`${Math.floor(row.time/60)}:${String(Math.floor(row.time%60)).padStart(2,'0')}`}</span>
   <div>{hideText?`第 ${i+1} 句（点击听音）`:<WordText text={row.en} exampleTranslation={row.zh}/>} {!hideText&&showTranslation&&row.zh&&<p className="line-translation">{row.zh}</p>}</div>
   <div className="line-actions"><button className="icon-btn line-play" disabled={!recording||row.time===undefined} onClick={()=>playLine(i)} aria-label={`播放第 ${i+1} 句`}><Volume2 size={18}/></button>{practiceMode&&<button className="icon-btn" aria-label={`跟读第 ${i+1} 句`} aria-expanded={recordingLine===i&&sceneLine===i&&!hideText&&practiceKind==='shadow'} onClick={()=>{selectLine(i);setRecordingLine(i);changePractice('shadow');requestAnimationFrame(()=>practicePanel.current?.scrollIntoView({behavior:'smooth',block:'nearest'}))}}><Mic size={18}/></button>}</div>
  </div>
  {practiceMode&&practiceKind==='shadow'&&!hideText&&recordingLine===i&&sceneLine===i&&<div ref={practicePanel} className="reading-scene reading-recorder"><div className="reading-recorder-heading"><strong>跟读第 {i+1} 句</strong><button className="text-btn" onClick={()=>setRecordingLine(null)}>收起录音</button></div><Recorder key={`${primary?.file.id}-${i}`} referenceText={row.en} onListen={()=>playLine(i)} onBeforeRecord={()=>{audio.current?.pause();endAt.current=null;setActive(-1)}}/></div>}
 </div>)}</div></>;
 return <div hidden={!visible} className={'cloud-library'+(embedded?' embedded-materials':'')}>
  {!embedded&&<>
  <div className="page-heading"><div><div className="eyebrow">BOOKS & AUDIO</div><h1>整册资料与下载</h1><p>这里按原文件列出 PDF、音轨和字幕。逐课学习请从「新概念 · 四册」课程目录进入。</p></div><button className="btn secondary" disabled={!!busy} onClick={()=>void readIndex(true)}><RefreshCw size={17}/>刷新教材</button></div>
  {manifest?.files.length===0&&<div className="cloud-pending"><strong>四册教材正在等待接入</strong><p>当前网站教材目录为空；原创课程、语法和练习仍可直接使用。</p></div>}
  {manifest?.notices?.map(n=><p className="notice" key={n}>{n}</p>)}
  {book==='NCE1'&&texts.length>0&&<p className="notice">第一册有 72 组美音听读资料。文件名含奇偶课号，字幕仅标注奇数课；偶数课在课内整理词汇、换词练句；原书作为核对资料。</p>}
  </>}
  {targetNote&&<p className="notice">{targetNote}</p>}
  {error&&<div className="notice" role="alert"><p>{error}</p><button className="text-btn" disabled={!!busy} onClick={retry}>重新读取教材</button></div>}
  {busy&&<LoadingStatus message={busy} progress={progress} onCancel={busy.startsWith('正在保存')?undefined:cancelLoading}/>}
  {!embedded&&<div className="filter-bar section-space"><Tabs value={book} onValueChange={v=>{controller.current?.abort();audio.current?.pause();setBook(v as NceBookId);setLoaded([]);setSelected('');setQuery('');setTargetNote('');navigate({view:'cloud',book:v as NceBookId},{keepScroll:true})}}><TabsList>{books.map((b,i)=><TabsTrigger key={b} value={b}>第 {i+1} 册</TabsTrigger>)}</TabsList></Tabs><span className="muted small">本册 {own.filter(f=>f.type==='application/pdf').length} 份 PDF · {own.filter(f=>f.type.startsWith('audio/')).length} 音轨 · {texts.length} 字幕</span></div>}
  {pageOnly?<section className="panel">{!pdfOnly&&pageOnly.book==='NCE1'&&pageOnly.lesson%2===0?<PairedLesson book={pageOnly.book} lesson={pageOnly.lesson} state={state} update={fn=>restore(fn(stateRef.current))}/>:<><LessonPages book={pageOnly.book} lesson={pageOnly.lesson}/><button className="text-btn" onClick={()=>{const pdf=files.find(f=>f.book===pageOnly.book&&f.type==='application/pdf');if(pdf)void open(pdf,pageOnly.lesson)}}>需要更多上下文时查阅完整原书</button></>}</section>:<div className={embedded?'site-lesson-reader':'cloud-grid'}>{!embedded&&<section className="panel cloud-files"><div className="section-top"><h2>本册教材</h2><span className="muted small">{shown.length} 项</span></div>
   <Tabs value={filter} onValueChange={setFilter}><TabsList><TabsTrigger value="all">听读配对</TabsTrigger><TabsTrigger value="pdf">PDF 原书</TabsTrigger><TabsTrigger value="audio">音频</TabsTrigger><TabsTrigger value="text">课文</TabsTrigger></TabsList></Tabs>
   <label className="search"><Search size={17}/><input aria-label="搜索网站教材" value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索课号或标题"/></label>
   <label className="field cloud-accent">录音版本<select aria-label="录音版本" value={accent} onChange={e=>setAccent(e.target.value)}><option value="all">全部版本</option><option value="us">美音</option><option value="uk">英音</option></select></label>
   {shown.map(f=><button className={'cloud-file '+(loaded.some(x=>x.file.id===f.id)?'selected':'')} key={f.id} disabled={!!busy} onClick={()=>{setTargetNote('');choose(f)}}>{f.type.startsWith('audio/')?<Headphones size={20}/>:<FileText size={20}/>}<span><strong>{f.title?`${f.lesson?`第 ${f.lesson} 课 · `:''}${f.title}`:f.name}</strong><small>{f.type==='application/pdf'?`${f.pages||'—'} 页 · ${f.textStatus==='scan'?'扫描本':'PDF'}`:`${accentLabel(f)} · ${f.pairId&&pairedMaterials(files,f).length===2?'音频 + LRC':'单份资料'}`} · {(f.size/1024**2).toFixed(1)} MiB</small></span></button>)}
   {!shown.length&&<div className="empty"><BookOpen size={36}/><h3>没有符合条件的教材</h3><p>试试其他课号或录音版本。</p></div>}
  </section>}
  <section ref={readerPanel} className={'panel cloud-reader'+(!hideText?' illustrated-reader':'')+(practiceKind==='recall'?' recall-active':'')}>{primary?<>
   <div className="section-top"><div><h2>{practiceMode&&(hideText||practiceKind==='recall')?`第 ${primary.file.lesson} 课 · 句子练习`:structure.title?.en||primary.file.title||primary.file.name}</h2>{practiceKind!=='recall'&&!hideText&&showTranslation&&structure.title?.zh&&<p className="line-translation">{structure.title.zh}</p>}</div>{practiceMode&&rows.length>0?<label className="reading-mode"><span className="sr-only">练习方式</span><select aria-label="练习方式" value={practiceKind} onChange={e=>changePractice(e.target.value as 'shadow'|'dictation'|'recall')}><option value="shadow">听读与跟读</option><option value="dictation">听写</option><option value="recall">看中文说英文</option></select></label>:!embedded&&<a href={primary.url} download={primary.file.name} className="text-btn"><Download size={17}/>下载原文件</a>}</div>
   {primary.file.type==='application/pdf'?<>{pdfPage&&<p className="notice">第 {pdfLesson} 课 · 已定位到 PDF 第 {pdfPage} 页。可核对本课的原书内容。</p>}<p className="muted small">{primary.file.pages} 页 · {embedded?'完整原书用于核对出处，可在新窗口查阅或下载。':primary.file.textStatus==='scan'?'扫描本，没有可提取正文；逐句听读采用配套 LRC。':'原书 PDF，未自动按课抽取。'}</p><a className="text-btn" href={readerUrl} target="_blank" rel="noreferrer">查阅原书 PDF</a></>:<>
    <p className="muted small">{accentLabel(primary.file)} · 第 {primary.file.lesson||'未核定'} 课</p>
    {!embedded&&primary.file.lessonNote&&<p className="notice">{primary.file.lessonNote}</p>}
    {!practiceMode&&<LessonQuestion lesson={structure} answer={state.drafts[`listen-answer-${primary.file.book}-${primary.file.lesson}`]||''} onChange={value=>{const current=stateRef.current;restore({...current,drafts:{...current.drafts,[`listen-answer-${primary.file.book}-${primary.file.lesson}`]:value}})}}/>}
    {recording&&<div className="cloud-player"><audio ref={audio} controls preload="metadata" src={recording.url} aria-label="网站课文音频" onTimeUpdate={timeUpdate} onPlay={()=>{stoppedLine.current=null}} onPlaying={()=>setPlayback('playing')} onWaiting={()=>setPlayback('waiting')} onPause={()=>setPlayback('idle')} onSeeking={seeking} onSeeked={timeUpdate} onEnded={()=>{endAt.current=null;setActive(-1)}} onError={()=>{setPlayback('idle');setError('音频不能解码，请重新读取教材')}} onLoadedMetadata={()=>{if(audio.current)audio.current.playbackRate=Number(rate);restoreAudioPosition()}}/><div className="row wrap"><PlaybackSpeed ariaLabel="网站音频播放速度"/><button className="text-btn" onClick={()=>{endAt.current=null;if(audio.current){seek(rows[0]?.time||0);followLine(0);startPlayback(audio.current)}}}>听全文</button>{transcript&&practiceKind!=='recall'&&<button className="text-btn" aria-expanded={!hideText} onClick={()=>{setHideText(!hideText);setShowTranslation(false)}}>{hideText?'显示原文':'隐藏原文'}</button>}</div>{playback!=='idle'&&<p className="small muted" role="status">{playback==='waiting'?'正在准备音频…':'正在播放'}</p>}</div>}
    {practiceKind==='recall'?<ChineseRecall rows={rows} canListen={!!recording&&rows.every(r=>r.time!==undefined)} onListen={playLine} onStop={()=>{audio.current?.pause();endAt.current=null;setActive(-1)}}/>:<>
    {practiceMode&&practiceKind==='dictation'&&rows.length>0&&<label className="field record-line-select">选择听写句<select aria-label="选择练习句" value={dictationLine} onChange={e=>selectLine(Number(e.target.value))}>{rows.map((row,i)=><option key={i} value={i}>{`第 ${i+1} 句`}</option>)}</select></label>}
    <ReadingLayout book={primary.file.book} lesson={primary.file.lesson} line={sceneLine} rowCount={rows.length} sourceSha256={transcript?.file.sha256} activeLine={hideText?-1:active} showIllustration={!hideText}>
    {!hideText&&rows[sceneLine]&&<div className="reading-scene reading-selection">
     {practiceKind==='dictation'&&<div className="reading-current" lang="en"><WordText text={rows[sceneLine].en} exampleTranslation={rows[sceneLine].zh}/></div>}
     <div className="row spread"><label className="reading-line"><span className="sr-only">选择练习句</span><select aria-label="选择练习句" value={sceneLine} onChange={e=>selectLine(Number(e.target.value))}>{rows.map((_,i)=><option key={i} value={i}>第 {i+1} / {rows.length} 句</option>)}</select></label><button className="text-btn" aria-expanded={showTranslation} onClick={()=>setShowTranslation(!showTranslation)}>{showTranslation?'隐藏中文':'需要时看中文'}</button></div>
     <div className="row spread"><button className="text-btn" disabled={sceneLine===0} onClick={()=>selectLine(sceneLine-1)}>上一句</button><button className="btn secondary" onClick={()=>playLine(sceneLine)}><Volume2 size={17}/>重听本句</button><button className="text-btn" disabled={sceneLine===rows.length-1} onClick={()=>selectLine(sceneLine+1)}>下一句</button></div>
    </div>}
    {practiceMode&&rows.length>0&&(practiceKind==='dictation'||hideText)&&<section className="lesson-dictation reading-scene">{practiceKind==='dictation'?<><h3>逐句听写</h3><p className="muted small">先听一句，再写下来。</p><label className="field">听写答案<textarea value={dictationAnswer} onChange={e=>{setDictationAnswer(e.target.value);setDictationChecked(false);setHideText(true);setShowTranslation(false)}}/></label><button className="btn" disabled={!dictationAnswer.trim()} onClick={()=>setDictationChecked(true)}>核对答案</button>{dictationChecked&&<div className="feedback"><strong>{normal(dictationAnswer)===normal(rows[dictationLine].en)?'完全正确':'对照原句，再听一次'}</strong><p>{rows[dictationLine].en}</p><p>{rows[dictationLine].zh}</p></div>}</>:<p className="muted small">第 {dictationLine+1} / {rows.length} 句 · 原文已隐藏</p>}<div className="row spread"><button className="text-btn" disabled={dictationLine===0} onClick={()=>selectLine(dictationLine-1)}>上一句</button><button className="btn secondary" onClick={()=>playLine(dictationLine)}><Volume2 size={17}/>听这一句</button><button className="text-btn" disabled={dictationLine===rows.length-1} onClick={()=>selectLine(dictationLine+1)}>下一句</button></div></section>}
    {practiceMode&&practiceKind==='shadow'&&hideText&&rows.length>0&&<div className="reading-scene reading-recorder"><Recorder key={`${primary.file.id}-${dictationLine}`} referenceText={rows[dictationLine].en} hideReference onListen={()=>playLine(dictationLine)} onBeforeRecord={()=>{audio.current?.pause();endAt.current=null;setActive(-1)}}/></div>}
    {transcript&&(practiceKind==='shadow'&&!hideText?<section className="reading-transcript" aria-label="课文全文">{passage}</section>:<details className="reading-transcript"><summary>{hideText?'选择句子听音':'阅读全文，逐句点读'}</summary>{passage}</details>)}
    </ReadingLayout>
    {!practiceMode&&!hideText&&<LessonExplainer book={primary.file.book} lesson={primary.file.lesson} rows={rows} state={state} update={fn=>restore(fn(stateRef.current))} onListen={playLine}/>}
    {practiceMode&&!hideText&&practiceKind==='shadow'&&<details className="lesson-source-reference"><summary>本课讲解与听前问题</summary><LessonQuestion lesson={structure} answer={state.drafts[`listen-answer-${primary.file.book}-${primary.file.lesson}`]||''} onChange={value=>{const current=stateRef.current;restore({...current,drafts:{...current.drafts,[`listen-answer-${primary.file.book}-${primary.file.lesson}`]:value}})}}/><LessonExplainer book={primary.file.book} lesson={primary.file.lesson} rows={rows} state={state} update={fn=>restore(fn(stateRef.current))} onListen={playLine}/></details>}
    <details className="lesson-source-reference"><summary>原书与下载</summary><p className="muted small">中文为学习参考，可对照原书确认。</p><a href={primary.url} download={primary.file.name} className="text-btn"><Download size={17}/>下载原文件</a>
    <div className="row wrap">{!embedded&&<><button className="btn secondary" disabled={!!busy||position<=0} onClick={()=>choose(lessonFiles[position-1])}><ChevronLeft size={16}/>上一篇</button><button className="btn secondary" disabled={!!busy||position<0||position>=lessonFiles.length-1} onClick={()=>choose(lessonFiles[position+1])}>下一篇<ChevronRight size={16}/></button></>}{pdf&&<button className="text-btn" disabled={!!busy} onClick={()=>viewPdf?viewPdf():embedded?void open(pdf,primary.file.lesson):choose(pdf)}>{primary.file.book==='NCE1'?'核对原书与配套练习':'核对本课原书'}</button>}</div>
    </details>
    <details className="lesson-offline"><summary>保存资料供离线使用</summary><div className="cloud-use">{!embedded&&<label className="field">保存到第几课<input aria-label="保存教材的课号" type="number" min={1} max={bookCounts[primary.file.book]} value={lesson} onChange={e=>setLesson(Number(e.target.value))}/></label>}<button className="btn" disabled={!!busy||!Number.isInteger(lesson)||lesson<1||lesson>bookCounts[primary.file.book]} onClick={useLesson}>保存并进入本课练习 <BookOpen size={17}/></button><label className="cloud-replace"><input type="checkbox" checked={replace} onChange={e=>setReplace(e.target.checked)}/>替换本课已有文本和音频（保留笔记与进度）</label><p className="muted small">配对资料一起保存到当前浏览器。可继续逐句听写、整理词句、复述和教材语法；保存后断网也可用。</p></div></details>
    </>}
   </>}
  </>:!embedded&&<div className="empty cloud-reader-empty"><BookOpen size={52}/><h2>书在这里，随时翻开。</h2><p>选择 PDF 看原书，或选择一课同步听读。</p></div>}</section></div>}
  {!embedded&&<p className="muted small section-space">网站教材可跨设备读取；进度、笔记和生词保存在当前浏览器，暂不自动跨设备同步。</p>}
 </div>;
}
async function digest(blob:Blob){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())),x=>x.toString(16).padStart(2,'0')).join('')}

function PairedLesson({book,lesson,state,update}:{book:NceBookId;lesson:number;state:State;update:(fn:(s:State)=>State)=>void}){
 const [text,setText]=useState(''),[error,setError]=useState(false),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let alive=true;setText('');setError(false);loadLessonLanguage(book,lesson-1).then(data=>{if(alive){if(data)setText(rowsToText(data.rows));else setError(true)}});return()=>{alive=false}},[book,lesson,attempt]);
 const rows=splitLesson(parseLessonText(text),book,true).body;
 return <><div className="section-top"><h2>第 {lesson} 课 · 句型练习</h2><button className="text-btn" onClick={()=>navigate({view:'nce',book,lesson:lesson-1,tab:'listen'})}><Volume2 size={17}/>回听配套课文</button></div>
 <TextbookVocabulary book={book} lesson={lesson} text={text}/>
 {error?<p role="alert">配套课文暂时未能加载。<button className="text-btn" onClick={()=>setAttempt(attempt+1)}>重新读取</button></p>:rows.length?<LessonExplainer book={book} lesson={lesson-1} rows={rows} state={state} update={update}/>:<p role="status">正在读取配套句型…</p>}
 <div className="row wrap section-space"><button className="btn secondary" onClick={()=>navigate({view:'nce',book,lesson,tab:'practice'})}>完成本组回顾练习<ChevronRight size={16}/></button></div>
 <details className="lesson-source-reference"><summary><BookOpen size={16}/>需要时核对本课原书</summary><LessonPages book={book} lesson={lesson}/></details></>;
}
