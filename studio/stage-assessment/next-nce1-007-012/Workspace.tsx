import {useEffect,useMemo,useState} from 'react';
import type {LearnerPort} from '../adapter';
import type {Attempt,ReadStage,Skill} from '../types';
import {practiceListeningAudio} from './audio-assets';
import {WorkspaceController,type WorkspaceStatus} from './workspace-controller';
import {workspaceDraft,type WorkspaceNote} from './workspace-notes';
import './workspace.css';
type Bind=(key:string,guard:(()=>Promise<boolean>)|null)=>void;
type Common={port:LearnerPort;bind:Bind;onConfirmed:(read:ReadStage)=>void;flush:()=>Promise<boolean>};
const tasks:{skill:Skill;title:string;prompt:string;material?:string}[]=[
 {skill:'listening',title:'听：先听新对话，再记关键事实',prompt:'只听合成练习声音：Mara承认是教师吗？她当前从事什么职业？她此刻怎样？黄色外套是谁的？黑色外套的物主已确认吗？先写听到的事实，不猜声音之外的信息。'},
 {skill:'reading',title:'读：为新同伴核对信息',material:"Juno's note: I am a student. I am not a nurse. I am tired.\nAt the desk: This is Lani's umbrella. Lani's umbrella is brown. The white umbrella is not Juno's. Its owner is not known.",prompt:'为接待同伴写出Juno的职业、明确否定的职业和当前状态；指出棕色雨伞的物主，以及白色雨伞仍缺什么事实。允许中文简答。'},
 {skill:'speaking',title:'说：真的问一个人，再按新事实回应',prompt:'虚构你的当前职业是engineer，不是teacher，此刻busy；桌上远处的coat物主未知。与伙伴实际核实职业、问候状态、询问物主；得到虚构答复“这是Sumi的，green”后再说明。留下自己实际说出的摘录和没说清的地方。文字不作为发音或互动得分；没人听时标记“待实际听评”。'},
 {skill:'writing',title:'写：留下可让他人采取行动的便签',prompt:'虚构Elin当前是nurse而不是student，此刻well；近处的red coat已确认属于Vani，不是你的；远处的white coat物主未知。给新同伴写4–5句自然英文便签，把职业、肯否、状态、已知归属及需要询问的事实写清。无句首模板，未匹配表达交人工阅读核对。'},
];
function download(raw:string){const url=URL.createObjectURL(new Blob([raw],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='stage-007-012-unconfirmed-workspace.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function DraftEditor({port,bind,onConfirmed,initial,label,practiceSkill}:{initial:WorkspaceNote;label:string;practiceSkill?:Skill}&Common){
 const initialJSON=JSON.stringify(initial),seed=useMemo(()=>JSON.parse(initialJSON) as WorkspaceNote,[initialJSON]);
 const [status,setStatus]=useState<WorkspaceStatus>({ready:false,busy:false,dirty:false,error:'',value:initial});
 const key=initial.slot+':'+(initial.attemptId||'');
 const controller=useMemo(()=>new WorkspaceController(port,seed,setStatus,()=>{},practiceSkill),[port,seed,practiceSkill]);
 useEffect(()=>{controller.setConfirmed(onConfirmed)},[controller,onConfirmed]);
 useEffect(()=>{void controller.load();bind(key,()=>controller.flush());const refresh=()=>void controller.refresh();for(const name of ['focus','pageshow','english-studio-progress-restored','english-studio-progress-saved'])window.addEventListener(name,refresh);return()=>{bind(key,null);controller.dispose();for(const name of ['focus','pageshow','english-studio-progress-restored','english-studio-progress-saved'])window.removeEventListener(name,refresh);};},[controller,key,bind]);
 useEffect(()=>{if(!status.dirty||status.busy||status.error)return;const timer=setTimeout(()=>void controller.flush(),450);return()=>clearTimeout(timer);},[controller,status.value,status.dirty,status.busy,status.error]);
 useEffect(()=>{const leave=(e:BeforeUnloadEvent)=>{if(status.dirty||status.busy||status.error){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',leave);return()=>window.removeEventListener('beforeunload',leave);},[status.dirty,status.busy,status.error]);
 const edit=(index:number,text:string)=>{const answers=[...status.value.answers];answers[index]=text;controller.edit(answers);};
 return <div className="stage-workspace-draft" data-stage-draft={initial.slot}>
  {status.value.answers.map((value,i)=><label key={i}>{status.value.answers.length>1?`${label} ${i+1}`:label}<textarea aria-label={status.value.answers.length>1?`${label} ${i+1}`:label} rows={3} maxLength={status.value.answers.length>1?400:1800} disabled={!status.ready} value={value} onChange={e=>edit(i,e.target.value)}/></label>)}
  {initial.slot==='correction'&&<label>订正理由<input aria-label="新阶段订正理由" maxLength={600} disabled={!status.ready} value={status.value.note} onChange={e=>controller.edit(status.value.answers,e.target.value)}/></label>}
  <p role="status">{status.busy?'正在确认当前稿…':status.dirty?'当前输入尚未确认保存。':status.ready?'当前稿已确认保存，可刷新续写。':'正在读取当前稿…'}</p>
  {status.error&&<p className="stage-error" role="alert">{status.error}</p>}
  <div className="stage-toolbar"><button disabled={!status.ready||status.busy} onClick={()=>void (status.error?controller.retry():controller.flush())}>{status.error?'重试保存当前稿':'保存当前稿'}</button>{(status.error||status.dirty)&&<button onClick={()=>download(controller.exportPending())}>下载未确认当前稿</button>}</div>
 </div>;
}
export function StageLearningWorkspace(props:Common){return <section className="stage-learning-workspace" data-stage-learning><h2>第7–12课：实际练习与当前稿</h2><p>以下是新情境学习任务，帮助可以使用。保存稿件和完成声明都不证明独立四技能掌握；练习会如实更新本科技能的练习时间。不要填写真实身份信息。</p>{tasks.map(t=><details key={t.skill}><summary>{t.title}</summary>{t.skill==='listening'&&<><audio controls preload="none" src={practiceListeningAudio} aria-label="第7–12课离线合成听力练习"/><p>已安装声音离线合成；不是人声施测或真人实际听见证明。</p></>}{t.material&&<pre>{t.material}</pre>}<p>{t.prompt}</p><DraftEditor {...props} initial={{version:1,slot:t.skill,answers:[''],note:''}} label={`${t.title.slice(0,1)}学习当前稿`}/></details>)}</section>;}
export function StageCorrectionWorkspace({attempt,port,bind,onConfirmed,flush}:{attempt:Attempt}&Common){
 const [issue,setIssue]=useState(''),[busy,setBusy]=useState(false);
 async function commit(){setBusy(true);setIssue('');try{
  if(!await flush())throw Error('当前稿尚未确认保存，请先重试，原输入保留。');
  const read=await port.load();if(read.status!=='ready')throw Error('原阶段证据暂不能读取，输入保留。');
  const current=workspaceDraft(read,'correction',attempt.id);
  if(!current?.note.trim()||current.answers.every(a=>!a.trim()))throw Error('先确认保存订正稿和理由，再另存修订。');
  onConfirmed(await port.learner({type:'revise',id:attempt.id,answers:current.answers,note:current.note}));
 }catch(e){setIssue(e instanceof Error?e.message:String(e));}finally{setBusy(false);}}
 return <section data-stage-correction><h2>订正与新稿续写</h2><p>原失败和首答保持不变。先把下面的当前稿确认保存，再另存修订；订正不是未见复测或人工通过。</p><pre>{JSON.stringify(attempt.first)}</pre><DraftEditor port={port} bind={bind} onConfirmed={onConfirmed} flush={flush} practiceSkill={attempt.skill} initial={{version:1,slot:'correction',attemptId:attempt.id,answers:Array(attempt.first?.length||1).fill(''),note:''}} label="新阶段订正稿"/><button disabled={busy} onClick={()=>void commit()}>另存已确认订正，不覆盖首答</button>{issue&&<p className="stage-error" role="alert">{issue}</p>}</section>;
}
