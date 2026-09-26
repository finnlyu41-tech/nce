'use client';
import {useState} from 'react';
import {WordText} from './word-lookup';
export function BilingualText({text,translation,divider='\n\n'}:{text:string;translation?:string[];divider?:string}){
 const [show,setShow]=useState(true);
 return <div className="bilingual-copy">{translation&&<button className="text-btn" onClick={()=>setShow(!show)}>{show?'隐藏中文参考':'显示中文参考'}</button>}{text.split(divider).map((paragraph,i)=><div key={i}><p className="english-copy"><WordText text={paragraph}/></p>{show&&translation?.[i]&&<p className="line-translation">{translation[i]}</p>}</div>)}</div>;
}
