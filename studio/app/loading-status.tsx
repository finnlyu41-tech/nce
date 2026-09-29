'use client';
import {useEffect,useState} from 'react';
import './loading-status.css';

export function LoadingStatus({message,progress,onCancel}:{message:string;progress?:number|null;onCancel?:()=>void}){
 const [slow,setSlow]=useState(false);
 useEffect(()=>{setSlow(false);const timer=setTimeout(()=>setSlow(true),8000);return()=>clearTimeout(timer)},[message]);
 const percent=progress==null?null:Math.min(100,Math.max(0,Math.floor(progress)));
 return <div className="loading-status">
  <div className="row spread"><span role="status"><span className="loading-spinner" aria-hidden="true"/>{message}</span>{percent!==null&&<span className="loading-percent">{percent}%</span>}</div>
  {percent!==null&&<progress aria-label="教材下载进度" max={100} value={percent}/>}
  {slow&&<p role="status">{onCancel?'加载比平时慢，可以继续等待，或取消后重试。':'处理比平时慢，请保持页面打开，完成后会更新状态。'}</p>}
  {onCancel&&<button className="text-btn" onClick={onCancel}>取消加载</button>}
 </div>;
}
