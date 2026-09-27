export type MockResult={id:string;date:string;paper:string;kind:'academic'|'general';scores:string[];unseen:boolean;timed:boolean;reviewer:string;feedback:string};
export function overallBand(scores:number[]){return scores.length===4&&scores.every(x=>Number.isFinite(x)&&x>=0&&x<=9)?Math.round(scores.reduce((a,b)=>a+b,0)/4*2)/2:null;}
export function validMock(r:MockResult){return /^\d{4}-\d{2}-\d{2}$/.test(r.date)&&!Number.isNaN(Date.parse(r.date))&&new Date(r.date).toISOString().slice(0,10)===r.date&&!!r.paper.trim()&&r.scores.length===4&&r.scores.every(x=>x.trim()!==''&&Number.isFinite(Number(x))&&Number(x)>=0&&Number(x)<=9&&Number(x)*2%1===0);}
export function meetsTarget(r:MockResult,minBand:number){return validMock(r)&&r.unseen&&r.timed&&!!r.reviewer.trim()&&!!r.feedback.trim()&&(overallBand(r.scores.map(Number))||0)>=6.5&&r.scores.every(s=>Number(s)>=minBand);}
export function readMocks(raw?:string):{minimum:string;results:MockResult[]}{
 try{const d=JSON.parse(raw||'{}');return {minimum:['0','5.5','6','6.5','7'].includes(d.minimum)?d.minimum:'6',results:Array.isArray(d.results)?d.results.slice(0,20).filter((r:any)=>r&&typeof r.id==='string'&&typeof r.date==='string'&&typeof r.paper==='string'&&['academic','general'].includes(r.kind)&&Array.isArray(r.scores)&&r.scores.length===4&&r.scores.every((s:any)=>typeof s==='string')&&typeof r.reviewer==='string'&&typeof r.feedback==='string').map((r:MockResult)=>({...r,unseen:r.unseen===true,timed:r.timed===true})):[]}}catch{return {minimum:'6',results:[]}}
}
export function readiness(results:MockResult[],minimum:number){
 const latest=[...results].sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id)).slice(0,2);
 return latest.length===2&&latest[0].kind===latest[1].kind&&latest[0].paper.trim().toLowerCase()!==latest[1].paper.trim().toLowerCase()&&latest.every(r=>meetsTarget(r,minimum));
}
