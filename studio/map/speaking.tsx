import React, {useContext, useEffect, useRef, useState} from 'react';
import {Recorder, type SavedTake} from '../app/recording-feedback';
import type {Unit} from './curriculum';
import {PlayerContext, StopAudio} from './media';
import {emptyRecord, type Progress} from './model';
import {emptySpeaking, recordedSpeaking, assessedSpeaking, speakingDue, speakingReviewAt, type SpeakingRecord} from './speaking-model';
import {readSpeechAudio, writeSpeechAudio} from './speech-recordings';
import type {Save} from './learning';

export function SpeakingPractice({unit,state,save,review,close,onLeaveGuard}:{unit:Unit;state:Progress;save:Save;review:boolean;close:()=>void;onLeaveGuard?:(guard:(()=>Promise<boolean>)|null)=>void}) {
  const record=state.records[unit.id]?.speaking||emptySpeaking(unit),row=unit.rows[record.row];
  const player=useContext(PlayerContext),latest=useRef(record),revision=useRef<string|undefined>(undefined);
  const pendingHint=useRef<{at:number}|null>(null),hintWriting=useRef(false);
  const [hintPending,setHintPending]=useState(false),[hintSaving,setHintSaving]=useState(false),[hintError,setHintError]=useState('');
  const pendingChange=useRef<{id:string;event:'recorded'|'assessed';next:SpeakingRecord}|null>(null);
  const [initial,setInitial]=useState<SavedTake[]|null>(null),[status,setStatus]=useState(''),[error,setError]=useState('');
  const [conceal,setConceal]=useState(review),help=useRef(!review),hidden=useRef(conceal);
  latest.current=record;hidden.current=conceal;
  useEffect(()=>{let alive=true;readSpeechAudio(unit.id).then(audio=>{
    if(!alive)return;revision.current=audio?.revision;
    const takes=record.takes.flatMap(t=>audio?.takes.find(a=>a.id===t.id)||[]);
    setInitial(takes);
    if(takes.length<record.takes.length)setStatus('文字反馈已保留，部分录音不在此浏览器。可以重新录一遍；进度备份不包含音频。');
  }).catch(e=>{if(alive){setInitial([]);setError(e.message)}});return()=>{alive=false;player.stop()}},[unit.id]);
  useEffect(()=>{if(!review&&speakingReviewAt(record)!==undefined)reveal()},[unit.id,review]);
  useEffect(()=>{
    if(!hintPending)return;
    const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue=''};
    window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);
  },[hintPending]);
  async function patch(next:SpeakingRecord){
    latest.current=next;
    return await save(s=>{
      const current=s.records[unit.id]||emptyRecord();
      // A take saved while a hint write is pending must retain that same help event.
      const hintAt=Math.max(next.hintAt||0,current.speaking?.hintAt||0,pendingHint.current?.at||0);
      return {...s,records:{...s.records,[unit.id]:{...current,speaking:hintAt?{...next,hintAt}:next}}};
    });
  }
  function canLeave(){
    if(pendingHint.current){setHintError('看过提示的记录尚未确认保存，请先重试保存提示记录。');return false;}
    if(!pendingChange.current)return true;
    setError('本次录音与反馈尚未确认保存。请先下载录音，再重试保存。');return false;
  }
  useEffect(()=>{onLeaveGuard?.(async()=>canLeave());return()=>onLeaveGuard?.(null)},[onLeaveGuard]);
  function reveal(){
    help.current=true;setConceal(false);
    pendingHint.current??={at:Date.now()};setHintPending(true);void saveHint();
  }
  async function saveHint(){
    const pending=pendingHint.current;if(!pending||hintWriting.current)return;
    hintWriting.current=true;setHintSaving(true);setHintError('');
    try{
      const committed=await save(s=>{
        const current=s.records[unit.id]||emptyRecord(),speaking=current.speaking||latest.current;
        return {...s,records:{...s.records,[unit.id]:{...current,speaking:{...speaking,hintAt:Math.max(speaking.hintAt||0,pending.at)}}}};
      });
      if(!committed)throw Error('看过提示的记录未保存成功，请重试保存提示记录。');
      pendingHint.current=null;setHintPending(false);
    }catch(e){setHintError(e instanceof Error?e.message:'提示记录保存失败，请重试。')}
    finally{hintWriting.current=false;setHintSaving(false)}
  }
  async function changed(takes:SavedTake[],event:'recorded'|'assessed'){
    setError('');setStatus('正在保存本句录音与反馈…');
    const pending=pendingChange.current;
    let next=pending?.id===takes[0].id&&pending.event===event?pending.next:latest.current;
    if(pending?.id!==takes[0].id||pending.event!==event){
      if(event==='recorded'){
        next=recordedSpeaking(next,takes[0].id,review,help.current||!hidden.current);
        setConceal(false);
      }else if(takes[0].result)next=assessedSpeaking(next,takes[0].result,takes[1]?.result);
      pendingChange.current={id:takes[0].id,event,next};
    }
    try{
      revision.current=await writeSpeechAudio(unit.id,revision.current,takes);
      if(!await patch(next))throw Error('音频已存入本机，但学习记录未保存成功。请先下载录音并导出进度，再重试保存。');
      pendingChange.current=null;
      setStatus(event==='assessed'?'本句问题与重读比较已保存在本机。':next.recalledAt===next.takes[0]?.at?'已记录无提示重说；发音是否改善仍需回听或主动提交评估。':'已保存本次录音。回听后可以主动提交评估，再练一处。');
    }catch(e){setStatus('');throw e;}
  }
  const date=speakingReviewAt(record),due=speakingDue(record);
  return <section className="speaking-practice" aria-label={review?'错句重说':'逐句跟读'}>
    <StopAudio/>
    <button className="text-button" onClick={()=>{if(canLeave())close()}}>← 回到本课</button>
    <span className="mini-label">{review?'次日回想 · 先说，再对照':'跟读一句 · 每次修一处'}</span>
    <h2>{conceal?'先自己说一遍':'把这一句读清楚'}</h2>
    {conceal?<><p>用英文说：{row.zh}</p><p className="footnote">原句、以前的反馈和录音暂时收起。先录一遍，再打开对照。</p>{!due&&<p className="footnote">{date?`本次只是提前练习，${new Date(date).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})} 起再做无提示回想。`:'本次只记重说练习，不代表发音已掌握。'}</p>}</>:<p>听原声，录下这一句。需要自动反馈时，确认发送后再提交；自由表达不按原句逐字评分。</p>}
    {initial===null?<p role="status">正在读取本句录音…</p>:<Recorder referenceText={row.en} initialTakes={initial} onTakesChange={changed} conceal={conceal} downloadPrefix={`wayfinder-${unit.id}`} retentionLabel="本机保留最近两遍；音频需单独下载备份" onBeforeRecord={()=>player.stop()} onListen={()=>player.play({book:unit.book,lesson:unit.lesson,start:row.start,end:row.end})}/>}
    {conceal&&<button className="text-button" onClick={()=>reveal()}>还想不起，先看原句</button>}
    {!conceal&&record.correction&&<details className="speaking-correction"><summary>这句要修的地方与下次复习</summary>{record.correction.issues.map((issue,i)=><article key={i}><strong>{issue.title}</strong><p>{issue.action}</p>{issue.phoneme&&<small>重点音：/{issue.phoneme}/；以实际回听为准。</small>}</article>)}{!!record.comparison.length&&<ul>{record.comparison.map((line,i)=><li key={i}>{line}</li>)}</ul>}<p>{date?`下次无提示重说：${new Date(date).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})} 起，在「复习」里继续。`:'已记录一次隔日无提示重说；这不等于发音已正确，也不增加课程完成数量。'}</p></details>}
    {hintPending&&<div className="speaking-hint-pending"><p role="status">看过提示的记录尚未确认保存，请重试，避免被算作无提示回想。</p><button className="btn secondary" disabled={hintSaving} onClick={()=>void saveHint()}>{hintSaving?'正在保存提示记录…':'重试保存提示记录'}</button></div>}
    {hintError&&<p role="alert" className="record-error">{hintError}</p>}
    {status&&<p className="speaking-save" role="status">{status}</p>}{error&&<p role="alert" className="record-error">{error}</p>}
    <p className="footnote">录音与反馈默认保存在本机；只有勾选同意并点击「提交评估」才发送本句英文和录音。评分不是雅思分数。</p>
  </section>;
}
