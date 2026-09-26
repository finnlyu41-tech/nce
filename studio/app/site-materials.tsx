'use client';
import {useEffect,useRef,useState} from 'react';
import {BookOpen,Download,FileText,Headphones,RefreshCw,Search} from 'lucide-react';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {Progress} from '@/components/ui/progress';
import {toast} from 'sonner';
import {State,NceBookId,bookCounts} from './model';
import {SiteMaterial,loadSiteMaterial,validateMaterials} from './site-material-utils';
import {saveAudio,writeState} from './offline-store';
const books=Object.keys(bookCounts) as NceBookId[];
export default function SiteMaterials({visible,state,restore,openLesson}:{visible:boolean;state:State;restore:(s:State)=>void;openLesson:(book:NceBookId,no:number)=>void}){
 const [files,setFiles]=useState<SiteMaterial[]|null>(null),[book,setBook]=useState<NceBookId>('NCE1'),[filter,setFilter]=useState('all'),[query,setQuery]=useState(''),[busy,setBusy]=useState(''),[error,setError]=useState(''),[progress,setProgress]=useState(0),[viewer,setViewer]=useState<{file:SiteMaterial;blob:Blob;url:string;text?:string}|null>(null),[lesson,setLesson]=useState(1);
 const controller=useRef<AbortController|null>(null),stateRef=useRef(state),audio=useRef<HTMLAudioElement>(null);stateRef.current=state;
 useEffect(()=>{if(!visible)audio.current?.pause()},[visible]);
 useEffect(()=>()=>{controller.current?.abort()},[]);
 useEffect(()=>()=>{if(viewer)URL.revokeObjectURL(viewer.url)},[viewer]);
 async function readIndex(){setError('');setBusy('正在读取教材目录…');try{const r=await fetch('/materials/manifest.json',{cache:'no-store',credentials:'same-origin',redirect:'error'});if(!r.ok)throw Error('暂时无法读取教材目录');const data=await r.json();if(!validateMaterials(data))throw Error('教材目录格式需要检查');setFiles(data.files)}catch(e){setError(e instanceof Error?e.message:'教材目录读取失败')}finally{setBusy('')}}
 useEffect(()=>{if(visible&&files===null&&!error&&!busy)void readIndex()},[visible,files,error,busy]);
 async function open(file:SiteMaterial){controller.current?.abort();const abort=new AbortController();controller.current=abort;setBusy('正在读取 '+file.name);setProgress(0);
  try{const blob=await loadSiteMaterial(file,abort.signal,setProgress);const text=file.type==='text/plain'?await blob.text():undefined;if(text&&text.length>500000)throw Error('文本太长，请使用按课整理的版本');setViewer({file,blob,url:URL.createObjectURL(blob),text});setLesson(file.lesson||1)}catch(e){if(!abort.signal.aborted)toast.error(e instanceof Error?e.message:'教材读取失败')}finally{if(controller.current===abort)setBusy('')}
 }
 async function useLesson(){if(!viewer||!Number.isInteger(lesson)||lesson<1||lesson>bookCounts[book])return;setBusy('正在带入本课…');try{const key=`${book}-${lesson}`,current=stateRef.current;let next={...current,nceLast:{book,lesson}};
  if(viewer.file.type.startsWith('audio/'))await saveAudio({key,name:viewer.file.name,type:viewer.file.type,blob:viewer.blob});
  else if(viewer.text!==undefined){if(viewer.text.length>50000)throw Error('每课最多 50,000 字符，请按课整理');const old=current.nce?.[key]||{title:'',text:'',notes:'',steps:[]};if(old.text&&old.text!==viewer.text)throw Error('本课已有不同文本，请先核对原文；原记录保留。');next={...next,nce:{...current.nce,[key]:{...old,title:old.title||viewer.file.name,text:viewer.text}}}}
  await writeState(next);restore(next);window.dispatchEvent(new Event('english-studio-media-updated'));openLesson(book,lesson);
 }catch(e){toast.error(e instanceof Error?e.message:'保存未完成')}finally{setBusy('')}}
 const shown=(files||[]).filter(f=>f.book===book&&(filter==='all'||filter==='pdf'&&f.type==='application/pdf'||filter==='audio'&&f.type.startsWith('audio/')||filter==='text'&&f.type==='text/plain')&&f.name.toLowerCase().includes(query.toLowerCase()));
 return <div hidden={!visible} className="cloud-library"><div className="page-heading"><div><div className="eyebrow">BOOKS & AUDIO</div><h1>打开教材，就开始学。</h1><p>原书和音频由网站直接提供，无需连接网盘或保持电脑开机。</p></div><button className="btn secondary" disabled={!!busy} onClick={readIndex}><RefreshCw size={17}/>刷新教材</button></div>
 {files?.length===0&&<div className="cloud-pending"><strong>四册教材正在等待接入</strong><p>网站阅读器已就绪，PDF 和 MP3 还没有上传到网站。现有原创课程、语法和练习可直接使用。</p></div>}
 {error&&<p className="notice" role="alert">{error}</p>}{busy&&<div className="cloud-working" role="status"><span>{busy}</span><Progress value={progress}/></div>}
 <div className="filter-bar section-space"><Tabs value={book} onValueChange={v=>{setBook(v as NceBookId);setViewer(null)}}><TabsList>{books.map((b,i)=><TabsTrigger key={b} value={b}>第 {i+1} 册</TabsTrigger>)}</TabsList></Tabs><span className="muted small">{files?.length||0} 份网站教材</span></div>
 <div className="cloud-grid"><section className="panel cloud-files"><div className="section-top"><h2>本册教材</h2><span className="muted small">{shown.length} 份</span></div><Tabs value={filter} onValueChange={setFilter}><TabsList><TabsTrigger value="all">全部</TabsTrigger><TabsTrigger value="pdf">PDF 原书</TabsTrigger><TabsTrigger value="audio">音频</TabsTrigger><TabsTrigger value="text">课文</TabsTrigger></TabsList></Tabs><label className="search"><Search size={17}/><input aria-label="搜索网站教材" value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索课号或文件名称"/></label>
 {shown.map(f=><button className={'cloud-file '+(viewer?.file.id===f.id?'selected':'')} key={f.id} disabled={!!busy} onClick={()=>open(f)}>{f.type.startsWith('audio/')?<Headphones size={20}/>:<FileText size={20}/>}<span><strong>{f.name}</strong><small>{(f.size/1024**2).toFixed(1)} MB{f.lesson?` · 课号提示 ${f.lesson}`:''}</small></span></button>)}{!shown.length&&<div className="empty"><BookOpen size={36}/><h3>{files?.length?'没有符合条件的教材':'这一册尚未接入资料'}</h3><p>接入后，在这里选课文、看原书、听录音。</p></div>}</section>
 <section className="panel cloud-reader">{viewer?<><div className="section-top"><h2>{viewer.file.name}</h2><a href={viewer.url} download={viewer.file.name} className="text-btn"><Download size={17}/>下载</a></div>{viewer.file.type==='application/pdf'?<><p className="muted small">PDF 原书阅读 · 浏览器无法预览时可下载打开。</p><iframe title="教材 PDF 阅读器" className="cloud-pdf" src={viewer.url}/></>:viewer.text!==undefined?<pre className="cloud-text">{viewer.text}</pre>:<div className="cloud-audio"><Headphones size={48}/><audio ref={audio} controls preload="metadata" src={viewer.url}/><label className="field">播放速度<Select defaultValue="1" onValueChange={v=>{if(audio.current)audio.current.playbackRate=Number(v)}}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{['0.75','1','1.25','1.5'].map(v=><SelectItem key={v} value={v}>{v}×</SelectItem>)}</SelectContent></Select></label></div>}
 {viewer.file.type!=='application/pdf'&&<div className="cloud-use"><label className="field">用于本册第几课<input type="number" min={1} max={bookCounts[book]} value={lesson} onChange={e=>setLesson(Number(e.target.value))}/></label><button className="btn secondary" disabled={!!busy||!Number.isInteger(lesson)||lesson<1||lesson>bookCounts[book]} onClick={useLesson}>带入本课练习 <BookOpen size={17}/></button><p className="muted small">请核对合并课次。音频会设为当前课音频，不会覆盖已有的不同课文。</p></div>}</>:<div className="empty cloud-reader-empty"><BookOpen size={52}/><h2>书在这里，随时翻开。</h2><p>从左侧选择一份 PDF、音频或课文。</p></div>}</section></div>
 <p className="muted small section-space">教材可跨设备在线读取；做题进度、笔记和生词仍保存在当前浏览器，可在「学习档案」导出备份。PDF 原书暂不自动识别为逐句课文。</p></div>;
}
