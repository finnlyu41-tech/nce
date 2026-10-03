import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import type {LearnerPort} from './adapter';
import {forms as firstForms,speakingActions as firstSpeakingActions,vocabulary as firstVocabulary} from './learner-pack';
import {nextForms,nextSpeakingActions,nextVocabulary,nextWritingInstruction} from './next-nce1-007-012/learner-pack';
import {StageLearningWorkspace,StageCorrectionWorkspace} from './next-nce1-007-012/Workspace';
import {StageListeningAudio} from './next-nce1-007-012/ListeningAudio';
import {firstStageDefinition,type StageDefinition} from './protocol';
import {createStageModel} from './model';
import {skills,phases,labels,phaseLabels,type Skill,type Phase,type Command,type Pack} from './types';
import type {readRecord} from './model';
import './stage-assessment.css';
type Read=ReturnType<typeof readRecord>;
const localTime=(at:number)=>new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',dateStyle:'medium',timeStyle:'medium'}).format(at)+'（Asia/Shanghai）';
const stateLabel={pending:'待验/待人工',invalid:'无效条件',insufficient:'证据不足',failed:'需修补',provisional:'单人暂评',candidate:'产品候选门槛达标'};
/** A learner page receives no reviewer port and no answer keys. */
export function StageAssessment({port,onReturn,onLeaveGuard,definition=firstStageDefinition}:{definition?:StageDefinition;port:LearnerPort;onReturn?:()=>void;onLeaveGuard?:(guard:(()=>Promise<boolean>)|null)=>void}){
 const {openReason,result,skillResults}=useMemo(()=>createStageModel(definition),[definition]);
 const nextStage=definition.scope==='NCE1-7-12',forms=nextStage?nextForms:firstForms,speakingActions=nextStage?nextSpeakingActions:firstSpeakingActions,vocabulary=nextStage?nextVocabulary:firstVocabulary;
 const workspaceGuards=useRef(new Map<string,()=>Promise<boolean>>());
 const bindWorkspace=useCallback((key:string,guard:(()=>Promise<boolean>)|null)=>{if(guard)workspaceGuards.current.set(key,guard);else workspaceGuards.current.delete(key);},[]);
 const flushWorkspace=useCallback(async()=>{for(const guard of workspaceGuards.current.values())if(!await guard())return false;return true;},[]);
 const [read,setRead]=useState<Read>({status:'empty'}),[now,setNow]=useState(Date.now()),[busy,setBusy]=useState(false),[error,setError]=useState(''),[skill,setSkill]=useState<Skill>('listening'),[phase,setPhase]=useState<Phase>('T0'),[unseen,setUnseen]=useState(false),[answers,setAnswers]=useState<string[]>([]),[revision,setRevision]=useState(''),[note,setNote]=useState('');
 const alive=useRef(true),current=useRef<string|undefined>(undefined),answersRef=useRef<string[]>([]),dirty=useRef(false),saving=useRef<Promise<unknown>>(Promise.resolve()),saveError=useRef(false);
 const repairInput=useRef({revision:'',note:''});repairInput.current={revision,note};
 const inflight=useRef(new Set<Promise<unknown>>()),operationFailed=useRef(false),flushRef=useRef<()=>Promise<boolean>>(async()=>false);
 const active=read.status==='ready'?read.view.attempts.find(a=>!a.submittedAt&&!a.interruption):undefined;
 async function refresh(){try{const value=await port.load();if(alive.current)setRead(value);}catch(e){if(alive.current)setError(String(e));}}
 useEffect(()=>{alive.current=true;void refresh();const timer=setInterval(()=>setNow(Date.now()),500);return ()=>{alive.current=false;clearInterval(timer);};},[port]);
 useEffect(()=>{
  if(active?.id!==current.current){current.current=active?.id;answersRef.current=active?.answers||[];setAnswers([...answersRef.current]);dirty.current=false;setUnseen(false);}
 },[active?.id]);
 useEffect(()=>{
  const guard=(e:BeforeUnloadEvent)=>{if(dirty.current||repairInput.current.revision||repairInput.current.note||busy||saveError.current||operationFailed.current){e.preventDefault();e.returnValue='';}};
  window.addEventListener('beforeunload',guard);return ()=>window.removeEventListener('beforeunload',guard);
 },[busy]);
 async function send(c:Exclude<Command,{type:'review'}|{type:'delivery'}|{type:'restore'}>){
  if(c.type==='open'&&!await flushWorkspace()){setError('当前学习稿尚未确认保存，请先重试或下载当前输入。');return false;}
  setBusy(true);setError('');const operation=port.learner(c);inflight.current.add(operation);
  try{const value=await operation;operationFailed.current=false;if(alive.current)setRead(value);return true;}catch(e){operationFailed.current=true;if(alive.current)setError(e instanceof Error?e.message:String(e));return false;}finally{inflight.current.delete(operation);if(alive.current)setBusy(inflight.current.size>0);}
 }
 function edit(i:number,value:string){const next=[...answersRef.current];next[i]=value;answersRef.current=next;setAnswers(next);dirty.current=true;saveError.current=false;}
 async function flush(){
  if(!active||!dirty.current)return !saveError.current;
  const id=active.id,copy=[...answersRef.current];
  saving.current=saving.current.then(async()=>{
   if(await send({type:'draft',id,answers:copy})){if(JSON.stringify(answersRef.current)===JSON.stringify(copy))dirty.current=false;saveError.current=false;}else saveError.current=true;
  });await saving.current;return !saveError.current;
 }
 flushRef.current=async()=>{await saving.current;const saved=await flush();await Promise.allSettled([...inflight.current]);return await flushWorkspace()&&saved&&!dirty.current&&!repairInput.current.revision&&!repairInput.current.note&&!saveError.current&&!operationFailed.current;};
 useEffect(()=>{onLeaveGuard?.(()=>flushRef.current());return()=>onLeaveGuard?.(null);},[onLeaveGuard]);
 useEffect(()=>{if(!active||!dirty.current||now>=active.deadline)return;const timer=setTimeout(()=>{void flush();},350);return ()=>clearTimeout(timer);},[answers,active?.id,now>= (active?.deadline||Infinity)]);
 // Freeze only persisted answers at deadline. A failed/late write cannot be counted.
 useEffect(()=>{if(!active||now<active.deadline||busy)return;if(dirty.current){setError('限时已结束；未确认保存的输入仍可下载，不能覆盖限时首答。');return;}void send({type:'submit',id:active.id});},[active?.id,now>= (active?.deadline||Infinity),busy]);
 async function submit(){
  if(active&&Date.now()>=active.deadline){
   if(dirty.current)download(JSON.stringify({attemptId:active.id,pendingInput:answersRef.current,at:Date.now(),counted:false}),'unconfirmed-stage-input.json');
   await send({type:'submit',id:active.id});return;
  }
  if(await flush())await send({type:'submit',id:active!.id});
 }
 async function interrupt(){
  if(!active)return;
  if(dirty.current)download(JSON.stringify({attemptId:active.id,pendingInput:answersRef.current,at:Date.now(),counted:false}),'unconfirmed-stage-input.json');
  await send({type:'interrupt',id:active.id,reason:'本次设备/施测或离场中断；不计零分与通过。'});
 }
 function download(text:string,name:string){const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),0);}
 async function exportData(){download(await port.exportEvidence(),'nce1-stage-evidence.json');}
 async function restore(file:File){setBusy(true);setError('');const operation=file.text().then(text=>port.restoreEvidence(text));inflight.current.add(operation);try{setRead(await operation);operationFailed.current=false;}catch(e){operationFailed.current=true;setError(e instanceof Error?e.message:String(e));}finally{inflight.current.delete(operation);setBusy(false);}}
 const view=read.status==='ready'?read.view:undefined;
 const reason=view?openReason(view,skill,phase,now):null;
 const ended=view?.attempts.filter(a=>a.submittedAt).at(-1);
 return <main className="stage-assessment">
  <header><p className="stage-eyebrow">NCE1 · {definition.label} · 阶段候选</p><h1>{definition.title}</h1><p>四科分别观察，先保留原答，再修补。此页只覆盖当前阶段的有限目标，熟悉短句不证明独立四技能掌握。</p><p className="stage-muted">{definition.targets.join(' · ')}</p></header>
  <aside className="stage-boundary">这是待真人试测的产品候选。听读≥5/6且关键归属/肯否不反转；口写≥6/8、无零维度且目的全部完成。没有合格人工外评，显示待人工。短任务不换算 IELTS Band，不证明材料等值或学习收益。</aside>
  <div className="stage-toolbar"><button onClick={()=>void exportData()} disabled={busy}>下载原始证据</button><label className="stage-file">恢复证据<input type="file" accept="application/json,.json" disabled={busy||!!active||dirty.current} onChange={e=>{const f=e.target.files?.[0];if(f)void restore(f);e.target.value='';}}/></label><button onClick={()=>void refresh()} disabled={busy||dirty.current}>重新读取</button>{onReturn&&<button disabled={busy} onClick={onReturn}>返回</button>}</div>
  {error&&<p role="alert" className="stage-error">{error}</p>}
  {read.status==='blocked'?<section role="alert"><h2>证据暂不能读取</h2><p>{read.reason}</p><p>先下载原始记录供核对；本页不会重置或初始化覆盖。</p></section>:<>
  {!active&&nextStage&&<StageLearningWorkspace port={port} bind={bindWorkspace} flush={flushWorkspace} onConfirmed={setRead}/>}
  {!active&&<section><h2>本次条件</h2><p>已学过、已看过题包或已有相关学习记录，就没有真实学习前基线。不要填写真实姓名或经历。</p><div className="stage-toolbar"><button disabled={busy} onClick={()=>void send({type:'prior-learning'})}>已学过 / 放弃基线观察</button><button disabled={busy} onClick={()=>void send({type:'learning',skills:[...skills],kind:'complete',note:`学习者在当前时间声明完成${definition.label}相关学习；不是工程验证、四技能掌握或收益证据。`})}>现在记录学习完成声明</button></div>
   <details><summary>我提前见过某卷题包</summary><p>会消耗该卷全部科目的未见资格；不能撤回。</p>{(['A','B','C','D','E','F'] as Pack[]).map(p=><button key={p} disabled={busy} onClick={()=>void send({type:'expose',pack:p})}>我见过 {p} 卷</button>)}</details>
   <div className="stage-select"><label>科目<select value={skill} disabled={busy} onChange={e=>setSkill(e.target.value as Skill)}>{skills.map(s=><option key={s} value={s}>{labels[s]}</option>)}</select></label><label>观察点<select value={phase} disabled={busy} onChange={e=>setPhase(e.target.value as Phase)}>{phases.map(p=><option key={p} value={p}>{phaseLabels[p]}</option>)}</select></label></div>
   <div className="stage-toolbar"><button disabled={busy} onClick={()=>void send({type:'learning',skills:[skill],kind:'practice',note:'现在进行相关专项练习，真实延迟从本次重算。'})}>现在记录本科专项练习</button><button disabled={busy} onClick={()=>void send({type:'learning',skills:[skill],kind:'repair',note:'现在完成本科短讲解、带练及撤提示修补；不替换首测。'})}>现在记录本科修补</button><button disabled={busy} onClick={()=>void send({type:'learning',skills:[skill],kind:'unknown',note:'不能确定最后相关练习时间。'})}>最近练习时间未知</button><button disabled={busy} onClick={()=>void send({type:'learning',skills:[skill],kind:'interval-start',note:'从现在开始新的可观察间隔；不是过去无练习证明。'})}>从现在建立观察间隔</button></div>
   <label className="stage-check"><input type="checkbox" checked={unseen} disabled={busy} onChange={e=>setUnseen(e.target.checked)}/>我确认本次分配的卷尚未见过，教材、笔记、翻译器和AI已关闭</label><p className="stage-muted">开始即记录题目曝光。听力须由验收员另行掌握脚本并正常朗读；口语须现场互动。没有验收员时可准备条件，结果仍待人工。</p>{reason&&<p role="status">{reason}</p>}<button className="stage-primary" disabled={busy||!unseen||!!reason} onClick={()=>void send({type:'open',skill,phase,unseen})}>开始{labels[skill]} · {phaseLabels[phase]}</button>
  </section>}
  {active&&<section aria-labelledby="stage-current"><div className="stage-current-heading"><h2 id="stage-current">{labels[active.skill]} · {phaseLabels[active.phase]} · {active.pack}卷</h2><span role="timer" aria-label="剩余时间">{Math.max(0,Math.ceil((active.deadline-now)/1000))} 秒</span></div><p className="stage-muted">开始：{localTime(active.openedAt)}。刷新不会重置计时；到时冻结已确认保存的首答。</p><p className="stage-vocabulary">{vocabulary}</p>
   {active.skill==='listening'&&nextStage&&<StageListeningAudio key={active.id} pack={active.pack} beforeUse={()=>send({type:'help',id:active.id,help:'reference'})}/>}
   {active.skill==='reading'&&forms[active.pack].reading.passages.map(p=><p className="stage-passage" key={p}>{p}</p>)}
   {(active.skill==='reading'||active.skill==='listening')?(active.skill==='reading'?forms[active.pack].reading.questions:forms[active.pack].listening).map((q,i)=><label className="stage-answer" key={i}><span>{i+1}. {q}</span><input value={answers[i]||''} disabled={busy||now>=active.deadline} onChange={e=>edit(i,e.target.value)} onBlur={()=>void flush()} placeholder="可以中文简答、写名字或指认后由验收员记下"/></label>):<><p className="stage-passage">{forms[active.pack][active.skill]}</p>{active.skill==='speaking'?<><ol>{speakingActions.map(a=><li key={a}>{a}</li>)}</ol><p>现场说给评阅者听。下面仅是可选的原始表达/中性观察摘录，转写不作为发音分。</p></>:<p>{nextStage?nextWritingInstruction:'给面前同伴写4–5句英文便签，介绍人物和国籍，澄清不是自己的物品，并说明另一件物品归属。无英文句首模板。'}</p>}<textarea aria-label={active.skill==='speaking'?'口语原始摘录（可选）':'写作首答'} rows={6} value={answers[0]||''} disabled={busy||now>=active.deadline} onChange={e=>edit(0,e.target.value)} onBlur={()=>void flush()}/></>}
   <details><summary>如实记录帮助</summary><p>英文提示、参考材料、答案或翻译帮助会使本次失去独立资格。</p><div className="stage-toolbar">{(['english-prompt','reference','answer-seen','translator','neutral-repeat'] as const).map((h,i)=><button key={h} disabled={busy} onClick={()=>void send({type:'help',id:active.id,help:h})}>{['英文提示','看了参考','看了答案','翻译/AI帮助','一次中性重说'][i]}</button>)}</div><p>已记录：{active.help.join('、')||'无帮助记录'}。</p></details>
   <p role="status">{busy?'正在确认保存…':dirty.current?'输入待保存；未确认前不计结果。':'当前输入已确认保存。'}</p>
   <div className="stage-toolbar"><button disabled={busy||now>=active.deadline} onPointerDown={e=>e.preventDefault()} onClick={()=>void flush()}>保存首答草稿</button><button className="stage-primary" disabled={busy} onPointerDown={e=>e.preventDefault()} onClick={()=>void submit()}>锁定已保存首答，待外评</button><button disabled={busy} onPointerDown={e=>e.preventDefault()} onClick={()=>void interrupt()}>记录中断，保留已保存原答</button>{dirty.current&&<button onClick={()=>download(JSON.stringify({attemptId:active.id,pendingInput:answersRef.current,at:Date.now(),counted:false}),'unconfirmed-stage-input.json')}>下载未确认输入</button>}</div>
  </section>}
  {view&&<section><h2>四科原始观察</h2><p>分开判断，不取平均。单人暂评和候选门槛都不代表已完成真人学习验收。</p><div className="stage-results">{skills.map(s=><article key={s}><h3>{labels[s]}</h3>{skillResults(view,s,now).map(r=><div key={r.phase}><strong>{r.phase} · {stateLabel[r.result.status]} {r.result.score!==undefined?`${r.result.score}/${r.result.max}`:''}</strong><p>{r.result.reason}</p>{r.restoredTimeUnverified&&<p className="stage-muted">已存原答、草稿、原时间与原结果保持；导入记录的自然间隔资格待人工核验。</p>}{r.interval&&<p className="stage-muted">实际经过 {Math.max(0,r.interval.hours).toFixed(1)} 小时；{r.interval.dueAt?'最早 '+localTime(r.interval.dueAt):'间隔证据未建立'}。</p>}</div>)}</article>)}</div><p className="stage-muted">单个案例、候选题包与有限目标不能关闭全局R06。真实≥7天只称该间隔下的观察。</p></section>}
  {view&&<section><h2>首答、失败与修订</h2>{view.attempts.map(a=><details key={a.id}><summary>{labels[a.skill]} {a.phase} {a.pack} · {stateLabel[result(a).status]} · {localTime(a.openedAt)}</summary><p>{result(a).reason}</p><p>已见确认：{a.unseen?'本人确认未见':'已见/不确认'}；帮助：{a.help.join('、')||'无'}；实际用时：{a.submittedAt?((a.submittedAt-a.openedAt)/1000).toFixed(1)+'秒':'仍在作答'}。</p><pre>{JSON.stringify({first:a.first??null,delivery:a.delivery??null,interruption:a.interruption??null,reviews:a.reviews,revisions:a.revisions},null,2)}</pre></details>)}</section>}
  {ended&&!active&&nextStage&&<StageCorrectionWorkspace key={ended.id} attempt={ended} port={port} bind={bindWorkspace} flush={flushWorkspace} onConfirmed={setRead}/>}
  {ended&&!active&&!nextStage&&<section><h2>另存订正，不覆盖首答</h2>{(revision||note)&&<p role="status">订正尚未保存；离开会暂停，先另存或下载当前输入。</p>}<p>针对最近一份{labels[ended.skill]}作答保留修订。订正不是未见复测。</p><textarea aria-label="订正内容" rows={4} value={revision} onChange={e=>setRevision(e.target.value)}/><label>修订说明<input value={note} onChange={e=>setNote(e.target.value)} maxLength={4000}/></label><button disabled={busy||!note.trim()} onClick={()=>{const a=ended.first!.map((_,i)=>i===0?revision:'');void send({type:'revise',id:ended.id,answers:a,note}).then(ok=>{if(ok){setRevision('');setNote('');}});}}>另存本次修订</button>{(revision||note)&&<button onClick={()=>download(JSON.stringify({attemptId:ended.id,revision,note,at:Date.now(),counted:false}),'unconfirmed-stage-revision.json')}>下载未确认订正</button>}</section>}
  </>}
 </main>;
}
