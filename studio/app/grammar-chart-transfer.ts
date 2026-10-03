import data from './data/grammar-curriculum/transfer/comparisons-chart.json';
import type {State} from './model';

export type ChartExercise={id:string;kind:string;tableId:string;prompt:string;options?:string[];answer:string;accepted:string[];explanation:string;hints:string[];nearErrors:{value:string;feedback:string}[]};
export const grammarChartTransfer=data as Omit<typeof data,'exercises'> & {exercises:ChartExercise[]};
export const grammarChartTransferKey='grammar-chart-transfer-comparisons-v1';
export type ChartResponse={value:string;checked:string|null;firstChecked:string|null;hintLevel:number;referenceViewed:boolean;firstAssisted:boolean};
export type ChartDraft={version:1;position:number;responses:Record<string,ChartResponse>;paragraph:string;checkedParagraph:string|null};
export const emptyChartResponse=():ChartResponse=>({value:'',checked:null,firstChecked:null,hintLevel:0,referenceViewed:false,firstAssisted:false});
export const emptyChartDraft=():ChartDraft=>({version:1,position:0,responses:{},paragraph:'',checkedParagraph:null});
export function chartDraftNeedsNewerVersion(raw?:string){try{return JSON.parse(raw||'{}')?.version>1}catch{return false}}
export function readChartDraft(raw?:string):ChartDraft{
 const clean=emptyChartDraft();
 try{
  const value=JSON.parse(raw||'{}');if(value?.version!==1)return clean;
  clean.position=Number.isInteger(value.position)?Math.max(0,Math.min(3,value.position)):0;
  for(const q of data.exercises){
   const r=value.responses?.[q.id];if(!r||typeof r.value!=='string')continue;
   clean.responses[q.id]={value:r.value.slice(0,1000),checked:typeof r.checked==='string'?r.checked.slice(0,1000):null,firstChecked:typeof r.firstChecked==='string'?r.firstChecked.slice(0,1000):null,hintLevel:Number.isInteger(r.hintLevel)?Math.max(0,Math.min(2,r.hintLevel)):0,referenceViewed:r.referenceViewed===true,firstAssisted:r.firstAssisted===true};
  }
  clean.paragraph=typeof value.paragraph==='string'?value.paragraph.slice(0,4000):'';
  clean.checkedParagraph=typeof value.checkedParagraph==='string'?value.checkedParagraph.slice(0,4000):null;
 }catch{/* An optional malformed draft never blocks the lesson or unrelated records. */}
 return clean;
}
export function updateChartDraft(state:State,change:(p:ChartDraft)=>ChartDraft):State{
 const raw=state.drafts[grammarChartTransferKey];if(chartDraftNeedsNewerVersion(raw))return state;
 const next=readChartDraft(JSON.stringify(change(readChartDraft(raw))));
 return {...state,drafts:{...state.drafts,[grammarChartTransferKey]:JSON.stringify(next)}};
}
const normal=(value:string)=>value.normalize('NFKC').replace(/[’‘]/g,"'").replace(/(\d)\s+%/g,'$1%').trim().replace(/[.。]$/,'').replace(/\s+/g,' ').toLowerCase();
export function chartAnswerFeedback(q:ChartExercise,value:string):{kind:'reference'|'error'|'manual';text:string}{
 const actual=normal(value);
 if([q.answer,...q.accepted].some(reference=>normal(reference)===actual))return {kind:'reference',text:'与本站的一种有限参考相符；可继续用数据核对表达关系。'};
 const near=q.nearErrors.find(error=>normal(error.value)===actual);
 if(near)return {kind:'error',text:near.feedback};
 if(q.options)return {kind:'error',text:'所选表达不符合表格的水平、百分点差或相对增幅；请对照两个分母核对。'};
 return {kind:'manual',text:'这次表达尚未自动核对。有限参考未覆盖全部自然写法；保留原答，请按数据、意思和本题要求自行核对或请老师反馈。'};
}
export function setChartAnswer(p:ChartDraft,id:string,value:string):ChartDraft{
 if(!data.exercises.some(q=>q.id===id))return p;
 return {...p,responses:{...p.responses,[id]:{...(p.responses[id]||emptyChartResponse()),value:value.slice(0,1000),checked:null}}};
}
export function checkChartAnswer(p:ChartDraft,id:string):ChartDraft{
 const r=p.responses[id];if(!data.exercises.some(q=>q.id===id)||!r?.value.trim())return p;
 return {...p,responses:{...p.responses,[id]:{...r,checked:r.value,firstChecked:r.firstChecked??r.value,firstAssisted:r.firstChecked===null?!!r.hintLevel||r.referenceViewed:r.firstAssisted}}};
}
export function showChartHelp(p:ChartDraft,id:string,reference=false):ChartDraft{
 if(!data.exercises.some(q=>q.id===id))return p;
 const r=p.responses[id]||emptyChartResponse();
 return {...p,responses:{...p.responses,[id]:reference?{...r,referenceViewed:true}:{...r,hintLevel:Math.min(2,r.hintLevel+1)}}};
}
export function saveChartParagraph(p:ChartDraft,value:string):ChartDraft{return {...p,paragraph:value.slice(0,4000),checkedParagraph:null}}
export function checkChartParagraph(p:ChartDraft):ChartDraft{return p.paragraph.trim()?{...p,checkedParagraph:p.paragraph}:p}

export function moveChartStep(p:ChartDraft,position:number):ChartDraft{
 if(!Number.isInteger(position)||position<0||position>3)return p;
 if(position>p.position&&p.position<3&&!p.responses[data.exercises[p.position].id]?.checked)return p;
 return {...p,position};
}
