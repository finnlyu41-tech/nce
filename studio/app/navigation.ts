import {bookCounts, type NceBookId} from './model';
import {sampleTarget} from './ielts-sample-target';
import {parseMiniTaskRoute} from '../mini-task/route';
import {parseStageRoute,stageHash} from '../stage-assessment/route';

export type StudioRoute={view:string;miniTaskId?:string;book?:NceBookId;lesson?:number;tab?:string;step?:number;task?:string;filter?:string;query?:string;file?:string;category?:string;letter?:string;page?:number;node?:string;mission?:string;unit?:string;check?:true;mode?:'recall'|'dictation';goal?:string;practice?:'model'|'independent'|'transfer'|'review'};
const roadmapNodes=['baseline','starter','foundation','bridge','listening','reading','writing','speaking','mock','finish'];
const views=['placement','roadmap','nce','today','library','review','courses','words','grammar','ielts','progress','lesson','quiz','materials','cloud'];
const tabs:Record<string,string[]>={words:['book','index','review'],nce:['materials','listen','words','notes','practice','grammar'],lesson:['listen','words','grammar','practice'],ielts:['overview','course','listening','reading','speaking','writing'],grammar:['path','book','topic','practice']};
export function parseRoute(hash:string):StudioRoute{
 const mini=parseMiniTaskRoute(hash);if(mini)return {view:mini.view,miniTaskId:mini.taskId};
 const stage=parseStageRoute(hash);if(stage)return stage;
 const [path,query='']=hash.replace(/^#\/?/,'').split('?'),parts=path.split('/');
 const view=views.includes(parts[0])?parts[0]:'today',route:StudioRoute={view},params=new URLSearchParams(query);
 if((view==='nce'||view==='cloud'||view==='grammar'||view==='words'||view==='roadmap')&&Object.hasOwn(bookCounts,parts[1])){
  route.book=parts[1] as NceBookId;const lesson=Number(parts[2]);
  if(Number.isInteger(lesson)&&lesson>0&&lesson<=bookCounts[route.book])route.lesson=lesson;
 }
 if(view==='lesson'){const lesson=Number(parts[1]);route.lesson=Number.isInteger(lesson)&&lesson>0&&lesson<=36?lesson:1}
 const tab=params.get('tab');if(tab&&tabs[view]?.includes(tab))route.tab=tab;
 const node=params.get('node');if(view==='roadmap'&&node&&roadmapNodes.includes(node))route.node=node;
 const mission=params.get('mission');if(view==='roadmap'&&mission&&/^[a-z][a-z0-9-]{1,60}$/.test(mission)&&!['constructor','prototype'].includes(mission))route.mission=mission;
 const unit=params.get('unit');if(view==='grammar'&&unit&&/^[a-z][a-z-]{1,60}$/.test(unit)&&!['constructor','prototype'].includes(unit))route.unit=unit;
 if(view==='grammar'&&tab==='path'&&route.unit&&params.get('check')==='1')route.check=true;
 const goal=params.get('goal'),practice=params.get('practice');
 if((view==='nce'&&route.lesson&&(tab==='practice'||tab==='grammar'))||view==='grammar'&&route.lesson&&tab==='practice'||view==='roadmap'){
  if(goal&&/^[a-z-]{1,60}$/.test(goal)&&!['constructor','prototype'].includes(goal))route.goal=goal;
  if((view==='nce'||view==='grammar')&&tab==='practice'&&practice&&['model','independent','transfer','review'].includes(practice))route.practice=practice as StudioRoute['practice'];
 }
 const mode=params.get('mode');if(view==='nce'&&route.lesson&&tab==='listen'&&(mode==='recall'||mode==='dictation'))route.mode=mode;
 const step=params.get('step');if(view==='nce'&&route.lesson&&tab==='notes'&&step!==null&&/^[0-4]$/.test(step))route.step=Number(step);
 const task=params.get('task');if(task&&/^(ielts-[ws][1-9]\d?|bank-[123]-[1-9]\d?-[0-5]|mistakes|diagnostic|text-\d{10,16})$/.test(task))route.task=task;
 if(view==='ielts'&&tab==='course'&&task&&sampleTarget(task))route.task=task;
 const filter=params.get('filter');if(filter&&['all','done','active'].includes(filter))route.filter=filter;
 const search=params.get('q');if(search)route.query=search.slice(0,120);
 const file=params.get('file');if(view==='cloud'&&file&&/^[A-Za-z0-9_-]{1,100}$/.test(file))route.file=file;
 const category=params.get('category');if((view==='grammar'||view==='roadmap')&&category&&/^[a-z-]{1,32}$/.test(category))route.category=category;
 const letter=params.get('letter');if(view==='words'&&tab==='index'&&letter&&/^[A-Z]$/.test(letter))route.letter=letter;
 const page=params.get('page');if((view==='grammar'||view==='words'&&tab==='index')&&page&&/^\d{1,4}$/.test(page)&&Number(page)>0)route.page=Number(page);
 return route;
}
export function routeHash(route:StudioRoute){
 if(route.view==='stage-assessment')return stageHash;
 if(route.view==='mini-task'){const hash='#/mini-task/'+encodeURIComponent(route.miniTaskId||'');return parseMiniTaskRoute(hash)?hash:'#/today'}
 let path='#/'+route.view;if(route.book)path+='/'+route.book;if(route.lesson)path+='/'+route.lesson;
 const params=new URLSearchParams();for(const [key,value] of Object.entries({tab:route.tab,task:route.task,filter:route.filter,q:route.query,file:route.file,category:route.category,letter:route.view==='words'&&route.tab==='index'?route.letter:undefined}))if(value)params.set(key,value);
 if(route.view==='roadmap'&&route.mission&&/^[a-z][a-z0-9-]{1,60}$/.test(route.mission)&&!['constructor','prototype'].includes(route.mission))params.set('mission',route.mission);
 if(route.view==='roadmap'&&route.node&&roadmapNodes.includes(route.node))params.set('node',route.node);
 if(route.view==='nce'&&route.lesson&&route.tab==='notes'&&Number.isInteger(route.step)&&route.step!>=0&&route.step!<=4)params.set('step',String(route.step));
 if((route.view==='grammar'||route.view==='words'&&route.tab==='index')&&Number.isInteger(route.page)&&route.page!>0&&route.page!<=9999)params.set('page',String(route.page));
 if(route.view==='nce'&&route.lesson&&route.tab==='listen'&&(route.mode==='recall'||route.mode==='dictation'))params.set('mode',route.mode);
 if((route.view==='nce'&&route.lesson&&(route.tab==='practice'||route.tab==='grammar'))||route.view==='grammar'&&route.lesson&&route.tab==='practice'||route.view==='roadmap'){
  if(route.goal&&/^[a-z-]{1,60}$/.test(route.goal)&&!['constructor','prototype'].includes(route.goal))params.set('goal',route.goal);
  if((route.view==='nce'||route.view==='grammar')&&route.tab==='practice'&&route.practice&&['model','independent','transfer','review'].includes(route.practice))params.set('practice',route.practice);
 }
 if(route.view==='grammar'&&route.unit&&/^[a-z][a-z-]{1,60}$/.test(route.unit)&&!['constructor','prototype'].includes(route.unit))params.set('unit',route.unit);
 if(route.view==='grammar'&&route.tab==='path'&&params.has('unit')&&route.check)params.set('check','1');
 return path+(params.size?'?'+params:'');
}
export function navigate(route:StudioRoute,{replace=false,keepScroll=false,scrollTarget}:{replace?:boolean;keepScroll?:boolean;scrollTarget?:string}={}){
 const hash=routeHash(route);
 if(location.hash===hash){
  if(scrollTarget)window.dispatchEvent(new CustomEvent('studio:navigation',{detail:{keepScroll:true,scrollTarget}}));
  return;
 }
 history.replaceState({...history.state,studioScroll:window.scrollY},'');
 history[replace?'replaceState':'pushState']({studioScroll:keepScroll?window.scrollY:0},'',hash);
 window.speechSynthesis?.cancel();window.dispatchEvent(new CustomEvent('studio:navigation',{detail:{keepScroll,scrollTarget}}));
}
