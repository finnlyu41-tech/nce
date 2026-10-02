import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {canShowVideo,playerUrl,videosFor,type VideoManifest,type VideoSource} from './manifest';
import {courseNotesPort,type NotesPort} from './adapter';
import {NotesController,type NotesStatus} from './controller';
import './video.css';
type Guard=()=>Promise<boolean>;
export type CourseVideoProps={courseId:string;book:VideoSource['book'];lessons:readonly number[];phase:string;manifest:VideoManifest;recordHelp:()=>Promise<boolean>;bindGuard:(guard:Guard|null)=>void;port?:NotesPort};
/** Remains mounted across phase changes; assessment renders no help or notes. */
export function CourseVideoHelp({courseId,book,lessons,phase,manifest,recordHelp,bindGuard,port}:CourseVideoProps){
 const sources=videosFor(manifest,book,lessons),[selected,setSelected]=useState(sources[0]?.id||''),[issue,setIssue]=useState('');
 const guard=useRef<Guard>(async()=>true),source=sources.find(v=>v.id===selected)||sources[0];
 const setGuard=useCallback((fn:Guard|null)=>{guard.current=fn||(async()=>true)},[]);
 const store=useMemo(()=>port||courseNotesPort(courseId),[port,courseId]);
 useEffect(()=>{bindGuard(()=>guard.current());return()=>bindGuard(null)},[bindGuard]);
 if(!source)return null;
 return <div hidden={!canShowVideo(phase)}>{canShowVideo(phase)&&<section className="course-video" aria-label="本课视频与个人笔记">
  <h3>Leo 老师讲解与我的笔记</h3>
  {sources.length>1&&<div className="course-video-segments" role="group" aria-label="选择本课讲解">{sources.map(v=><button type="button" key={v.id} data-video-id={v.id} aria-pressed={source.id===v.id} onClick={()=>void(async()=>{if(await guard.current()){setSelected(v.id);setIssue('')}else setIssue('当前笔记还没有保存，请先重试或备份。')})()}>{v.title}</button>)}</div>}
  {issue&&<p role="alert">{issue}</p>}
 </section>}
 <VideoNotePanel key={source.id} source={source} courseId={courseId} visible={canShowVideo(phase)} port={store} recordHelp={recordHelp} setGuard={setGuard}/>
 </div>;
}
function VideoNotePanel({source,courseId,visible,port,recordHelp,setGuard}:{source:VideoSource;courseId:string;visible:boolean;port:NotesPort;recordHelp:()=>Promise<boolean>;setGuard:(guard:Guard|null)=>void}){
 const [status,setStatus]=useState<NotesStatus>({text:'',ready:false,busy:false,dirty:false,error:''}),[player,setPlayer]=useState(false),[originalReady,setOriginalReady]=useState(false),[summary,setSummary]=useState(false),[mediaIssue,setMediaIssue]=useState(''),[pendingBackup,setPendingBackup]=useState<string|null>(null);
 const controller=useMemo(()=>new NotesController(port,courseId,source,setStatus),[port,courseId,source]);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null),visibleRef=useRef(visible);
 useLayoutEffect(()=>{visibleRef.current=visible},[visible]);
 useEffect(()=>{void controller.load();setGuard(()=>controller.flush());const unload=(e:BeforeUnloadEvent)=>{const s=controller.snapshot();if(s.dirty||s.busy){e.preventDefault();e.returnValue=''}},refresh=()=>void controller.refresh();window.addEventListener('beforeunload',unload);for(const name of ['focus','pageshow','english-studio-progress-restored','english-studio-progress-saved'])window.addEventListener(name,refresh);return()=>{if(timer.current)clearTimeout(timer.current);setGuard(null);controller.dispose();window.removeEventListener('beforeunload',unload);for(const name of ['focus','pageshow','english-studio-progress-restored','english-studio-progress-saved'])window.removeEventListener(name,refresh)}},[controller,setGuard]);
 useEffect(()=>{if(!visible)void Promise.resolve().then(()=>{setPlayer(false);setOriginalReady(false);setSummary(false)})},[visible]);
 useEffect(()=>{if(!player)return;const timeout=setTimeout(()=>setMediaIssue('若播放器仍未显示，请打开原视频；可以继续记笔记和学习本课。'),12000);return()=>clearTimeout(timeout)},[player]);
 const src=playerUrl(source);
 async function prepareOriginal(){
  try{if(await controller.access('open-link',recordHelp)&&visibleRef.current){setOriginalReady(true);setMediaIssue('')}else setMediaIssue('视频链接暂未就绪，请先保存笔记后重试。')}
  catch{setMediaIssue('视频链接暂未就绪，可以继续本课学习。')}
 }
 function backup(){const raw=controller.exportPending(),url=URL.createObjectURL(new Blob([raw],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`English-Studio-video-note-${source.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setPendingBackup(raw)}
 if(!visible)return null;
 return <section className="course-video course-video-note" aria-label={`${source.title} · 笔记`}>
  <p className="course-video-byline">{source.book} · 第 {source.lessons.join('、')} 课 · <a href={source.author.url} target="_blank" rel="noopener noreferrer">{source.author.name}</a></p>
  <div className="course-video-actions">{originalReady?status.ready&&!status.busy&&!status.dirty&&!status.error?<a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">打开 B站原视频 ↗</a>:<span className="course-video-muted">保存当前笔记后可继续打开原视频。</span>:<button type="button" data-prepare-original disabled={!status.ready||status.busy||!!status.error} onClick={()=>void prepareOriginal()}>查看 B站原视频链接</button>}{src&&<button type="button" disabled={!status.ready||status.busy||!!status.error} onClick={()=>{void(async()=>{try{if(await controller.access('load-player',recordHelp)&&visibleRef.current){setMediaIssue('');setPlayer(true)}}catch{setMediaIssue('播放器暂未打开，可以继续本课学习。')}})()}}>在本页播放</button>}</div>
  {src&&!player&&<p className="course-video-muted">点击播放将加载哔哩哔哩第三方服务。</p>}
  {player&&src&&<div className="course-video-player"><iframe src={src} title={source.title} allow="fullscreen" allowFullScreen sandbox="allow-scripts allow-same-origin allow-presentation" referrerPolicy="no-referrer" onError={()=>setMediaIssue('播放器加载失败，请打开原视频；笔记和课程可继续使用。')}/><button type="button" onClick={()=>setPlayer(false)}>收起播放器</button><p className="course-video-muted">播放受 B站可用性影响；未显示或不能播放时可打开原视频。</p></div>}
  {mediaIssue&&<p role="status">{mediaIssue}</p>}
  {source.summary&&<div><button type="button" disabled={!status.ready||!!status.error} onClick={()=>void(async()=>{if(await controller.access('open-summary',recordHelp))setSummary(true)})()}>查看视频要点</button>{summary&&<><h4>视频内容要点</h4><p className="course-video-summary">{source.summary.text}</p><a href={source.summary.evidence[0].url} target="_blank" rel="noopener noreferrer">内容来源 ↗</a></>}</div>}
  <label>我的学习笔记<textarea value={status.text} maxLength={12000} disabled={!status.ready} rows={6} placeholder="记下听到的要点、例句、疑问，以及下次想练的表达。" onChange={e=>{controller.edit(e.target.value);setPendingBackup(null);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>void controller.flush(),450)}}/></label>
  <div className="course-video-actions"><button type="button" disabled={!status.ready||status.busy} onClick={()=>void(status.error?controller.retry():controller.flush())}>{status.error?'重试保存笔记':'保存笔记'}</button><span role="status">{status.error?'未保存，文本仍在本页':status.busy?'正在保存…':!status.ready?'正在读取笔记…':status.dirty?'有未保存的笔记':'笔记已保存'}</span></div>
  {status.error&&<div role="alert"><p>{status.error}</p><button type="button" onClick={backup}>下载未保存笔记</button><button type="button" disabled={!pendingBackup||status.busy} onClick={()=>void controller.reloadAfterBackup(pendingBackup!).catch(()=>setPendingBackup(null))}>已备份，读取最新笔记</button></div>}
  <p className="course-video-muted">笔记保存在当前学习记录中，可随整站进度保存和恢复。观看视频不会标记测验通过。</p>
 </section>;
}
