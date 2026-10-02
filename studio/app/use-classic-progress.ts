import {useEffect,useState} from 'react';
import {initial,validateState,type State} from './model';
import {readState} from './offline-store';

/** Read the existing store shared by the classic workspace and course host. */
export function useClassicProgress(){
 const [state,setState]=useState<State>(initial),[ready,setReady]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let alive=true,revision=0;
  async function read(){const current=++revision;try{
   let value:unknown,dbFailed=false;try{value=await readState()}catch{dbFailed=true}
   if(value===undefined){const raw=localStorage.getItem('english-studio-v1');if(raw)value=JSON.parse(raw)}
   if(value===undefined&&dbFailed)throw Error('storage unavailable');
   if(value!==undefined&&!validateState(value))throw Error('invalid progress');
   if(alive&&current===revision){setState(value===undefined?initial:value as State);setError('')}
  }catch{if(alive&&current===revision)setError('单词与语法记录暂时无法读取；原记录保留，可以继续当前课程。')}
  finally{if(alive&&current===revision)setReady(true)}}
  const focus=()=>{void read()},storage=(e:StorageEvent)=>{if(e.key==='english-studio-v1'||e.key===null)void read()};
  const channel=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('english-studio-progress'):null;if(channel)channel.onmessage=focus;
  const tick=setInterval(focus,30000);
  void read();window.addEventListener('focus',focus);window.addEventListener('pageshow',focus);window.addEventListener('storage',storage);window.addEventListener('english-studio-progress-saved',focus);window.addEventListener('english-studio-progress-restored',focus);
  return()=>{alive=false;clearInterval(tick);channel?.close();window.removeEventListener('focus',focus);window.removeEventListener('pageshow',focus);window.removeEventListener('storage',storage);window.removeEventListener('english-studio-progress-saved',focus);window.removeEventListener('english-studio-progress-restored',focus)};
 },[]);
 return {state,ready,error};
}
