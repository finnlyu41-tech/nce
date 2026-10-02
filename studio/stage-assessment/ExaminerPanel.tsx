import {useEffect,useState} from 'react';
import type {StageAdapter} from './adapter';
import type {Attempt,Delivery,Reviewer,Review} from './types';
import {labels} from './types';
import {result} from './model';
/** Host must authorize a qualified external reviewer before mounting. This is
 * not an authentication system; never mount on the learner page or expose its
 * adapter examiner port to learner callbacks. Keys/scripts stay in Library. */
export function ExaminerPanel({adapter,authorizedReviewer}:{adapter:StageAdapter;authorizedReviewer:Reviewer}){
 const [attempts,setAttempts]=useState<Attempt[]>([]),[selected,setSelected]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[basis,setBasis]=useState(''),[judgments,setJudgments]=useState<('correct'|'wrong'|'unfinished')[]>(Array(6).fill('unfinished')),[dimensions,setDimensions]=useState([0,0,0,0]),[purposes,setPurposes]=useState<boolean[]>([]),[heard,setHeard]=useState(false),[elicited,setElicited]=useState(false),[critical,setCritical]=useState(false),[disputed,setDisputed]=useState(false),[deliveryMode,setDeliveryMode]=useState<Delivery['mode']>('live-reader'),[once,setOnce]=useState(false),[checked,setChecked]=useState(false);
 const valid=adapter.examiner.available&&authorizedReviewer.external===true&&authorizedReviewer.qualified===true&&authorizedReviewer.calibrated===true;
 async function reload(){const read=await adapter.load();if(read.status==='blocked')throw Error(read.reason);setAttempts(read.status==='ready'?read.view.attempts:[]);}
 useEffect(()=>{void reload().catch(e=>setError(String(e)));},[adapter]);
 const a=attempts.find(x=>x.id===selected);
 useEffect(()=>{setBasis('');setJudgments(Array(6).fill('unfinished'));setDimensions([0,0,0,0]);setPurposes(Array(a?.skill==='speaking'?5:4).fill(false));setHeard(false);setElicited(false);setCritical(false);setDisputed(false);setOnce(false);setChecked(false);},[selected]);
 async function save(delivery=false){if(!a)return;setBusy(true);setError('');try{
  if(delivery)await adapter.examiner.recordDelivery(a.id,{mode:deliveryMode,heard,singlePresentation:once,humanChecked:checked,note:basis});
  else{
   const review:Review={reviewer:authorizedReviewer,targetElicited:elicited,disputed,secondReview:a.reviews.length===1,basis,...(a.skill==='reading'||a.skill==='listening'?{judgments,criticalReversed:critical}:{dimensions,purposes}),...(['speaking','listening'].includes(a.skill)?{actualHeard:heard}:{})};
   await adapter.examiner.recordReview(a.id,review);
  }
  await reload();
 }catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(false);}}
 if(!valid)return <section role="alert">当前没有真实已授权的合格校准外评者。前端角色或布尔字段不授予权限，保留待外评。</section>;
 const rubric=a?.skill==='speaking'?['流利与连贯','词汇选择','语法控制','实际听者可理解度']:['任务完成','组织衔接','词汇选择','语法控制'];
 return <section className="stage-assessment"><header><h1>首阶段 · 授权外部评阅</h1><p>使用 Library 的验收员题包与协议。这里只记录语义/人工评分证据，不显示答案、自动评分或上传音频。</p></header>{error&&<p role="alert" className="stage-error">{error}</p>}
  <button disabled={busy} onClick={()=>void reload().catch(e=>setError(String(e)))}>重新读取已保存原答</button><label>选择本次观察<select value={selected} disabled={busy} onChange={e=>setSelected(e.target.value)}><option value="">请选择</option>{attempts.map(x=><option key={x.id} value={x.id}>{labels[x.skill]} {x.phase} {x.pack} · {x.submittedAt?'已提交':'施测中'}</option>)}</select></label>
  {a&&<><h2>{labels[a.skill]} · {a.phase} · {a.pack}</h2><p>{result(a).reason}</p><pre>{JSON.stringify({first:a.first,answers:a.answers,help:a.help,unseen:a.unseen,delivery:a.delivery,interruption:a.interruption,reviews:a.reviews},null,2)}</pre>
  <label>实际观察与语义判定依据（无真实姓名或私人信息）<textarea value={basis} disabled={busy} onChange={e=>setBasis(e.target.value)} maxLength={4000}/></label>
  {(a.skill==='listening'||a.skill==='speaking')&&<label><input type="checkbox" checked={heard} disabled={busy} onChange={e=>setHeard(e.target.checked)}/>我实际听见学习者所听人声/实际口语，未用转写代替听评</label>}
  {a.skill==='listening'&&!a.submittedAt&&!a.delivery&&<><label>呈现方式<select value={deliveryMode} onChange={e=>setDeliveryMode(e.target.value as Delivery['mode'])}><option value="live-reader">现场人声朗读</option><option value="human-checked-audio">真人试听确认的固定人声</option></select></label><label><input type="checkbox" checked={once} onChange={e=>setOnce(e.target.checked)}/>三个片段各完整一次；无静音、断音或额外提示</label><label><input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)}/>固定人声材料已由真人试听确认</label><button disabled={busy||!basis.trim()} onClick={()=>void save(true)}>在提交前保存真实听力施测条件</button></>}
  {a.submittedAt&&<><label><input type="checkbox" checked={elicited} disabled={busy} onChange={e=>setElicited(e.target.checked)}/>目标确已充分引出，事实与自然等价表达按语义核对</label><label><input type="checkbox" checked={disputed} disabled={busy} onChange={e=>setDisputed(e.target.checked)}/>存在争议，需第二位独立评阅</label>
  {a.skill==='listening'||a.skill==='reading'?<><p>逐项判定，未完成与错误保留原样。可接受中文短答和自然语义等价表达。</p>{judgments.map((j,i)=><label key={i}>第{i+1}项<select disabled={busy} value={j} onChange={e=>setJudgments(x=>x.map((v,k)=>k===i?e.target.value as typeof j:v))}><option value="correct">正确</option><option value="wrong">错误</option><option value="unfinished">未完成</option></select></label>)}<label><input type="checkbox" checked={critical} disabled={busy} onChange={e=>setCritical(e.target.checked)}/>关键物主、肯定或否定事实被反转（★项，独立门槛）</label></>:<><p>2=独立清楚达到本阶段目标；1=基本可懂但形式/组织待改；0=无法完成、难辨或依赖示范。请依协议的具体四维评分尺校准。</p>{rubric.map((label,i)=><label key={label}>{label}<select disabled={busy} value={dimensions[i]} onChange={e=>setDimensions(x=>x.map((v,k)=>k===i?Number(e.target.value):v))}>{[0,1,2].map(n=><option key={n} value={n}>{n}</option>)}</select></label>)}{purposes.map((p,i)=><label key={i}><input disabled={busy} type="checkbox" checked={p} onChange={e=>setPurposes(x=>x.map((v,k)=>k===i?e.target.checked:v))}/>第{i+1}个交际动作/事实目的完整且正确</label>)}</>}
  <p>{a.reviews.length===1?'本次是第二位评阅者独立复核。宿主须提供不同的校准依据，不能重复首评身份。':'本次保存首评；临界、争议及T3通过不会自动变成双人复核。'}</p><button disabled={busy||!basis.trim()||a.reviews.length>=2} onClick={()=>void save()}>保留{a.reviews.length===1?'第二复核':'人工首评'}</button></>}
  </>}
 </section>;
}
