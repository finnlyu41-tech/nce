import {bookCounts, type NceBookId} from './model';

export type StudioRoute={view:string;book?:NceBookId;lesson?:number;tab?:string;step?:number;task?:string;filter?:string;query?:string;file?:string;category?:string;page?:number;mode?:'recall'};
const views=['nce','today','courses','words','grammar','ielts','progress','lesson','quiz','materials','cloud'];
const tabs:Record<string,string[]>={nce:['materials','listen','words','notes','practice','grammar'],lesson:['listen','words','grammar','practice'],ielts:['overview','listening','reading','speaking','writing'],grammar:['book','topic']};
export function parseRoute(hash:string):StudioRoute{
 const [path,query='']=hash.replace(/^#\/?/,'').split('?'),parts=path.split('/');
 const view=views.includes(parts[0])?parts[0]:'today',route:StudioRoute={view},params=new URLSearchParams(query);
 if((view==='nce'||view==='cloud'||view==='grammar')&&Object.hasOwn(bookCounts,parts[1])){
  route.book=parts[1] as NceBookId;const lesson=Number(parts[2]);
  if(Number.isInteger(lesson)&&lesson>0&&lesson<=bookCounts[route.book])route.lesson=lesson;
 }
 if(view==='lesson'){const lesson=Number(parts[1]);route.lesson=Number.isInteger(lesson)&&lesson>0&&lesson<=36?lesson:1}
 const tab=params.get('tab');if(tab&&tabs[view]?.includes(tab))route.tab=tab;
 if(view==='nce'&&route.lesson&&tab==='listen'&&params.get('mode')==='recall')route.mode='recall';
 const step=params.get('step');if(view==='nce'&&route.lesson&&tab==='notes'&&step!==null&&/^[0-4]$/.test(step))route.step=Number(step);
 const task=params.get('task');if(task&&/^(ielts-[ws][1-9]\d?|bank-[123]-[1-9]\d?-[0-5]|mistakes|diagnostic|text-\d{10,16})$/.test(task))route.task=task;
 const filter=params.get('filter');if(filter&&['all','done','active'].includes(filter))route.filter=filter;
 const search=params.get('q');if(search)route.query=search.slice(0,120);
 const file=params.get('file');if(view==='cloud'&&file&&/^[A-Za-z0-9_-]{1,100}$/.test(file))route.file=file;
 const category=params.get('category');if(view==='grammar'&&category&&/^[a-z-]{1,32}$/.test(category))route.category=category;
 const page=params.get('page');if(view==='grammar'&&page&&/^\d{1,4}$/.test(page)&&Number(page)>0)route.page=Number(page);
 return route;
}
export function routeHash(route:StudioRoute){
 let path='#/'+route.view;if(route.book)path+='/'+route.book;if(route.lesson)path+='/'+route.lesson;
 const params=new URLSearchParams();for(const [key,value] of Object.entries({tab:route.tab,task:route.task,filter:route.filter,q:route.query,file:route.file,category:route.category}))if(value)params.set(key,value);
 if(route.view==='nce'&&route.lesson&&route.tab==='notes'&&Number.isInteger(route.step)&&route.step!>=0&&route.step!<=4)params.set('step',String(route.step));
 if(route.view==='grammar'&&Number.isInteger(route.page)&&route.page!>0&&route.page!<=9999)params.set('page',String(route.page));
 if(route.view==='nce'&&route.lesson&&route.tab==='listen'&&route.mode==='recall')params.set('mode','recall');
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
