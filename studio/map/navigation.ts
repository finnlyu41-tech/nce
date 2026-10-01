import {nodeById, nodes, unitNodes, unitById, type MapNode} from './content';
import {lessonPlan} from './lesson-plan';

export const catalogueGroups = [
  {id:'all',title:'全部课程',caption:'',description:''},
  {id:'starter',title:'零基础起步',caption:'从这里开始',description:'先听、认形、模仿，准备好再进入课文。'},
  {id:'NCE1',title:'新概念第一册',caption:'日常表达',description:'从认识人和物开始，72 组课文与配套练习。'},
  {id:'NCE2',title:'新概念第二册',caption:'连成自己的话',description:'96 课，逐步练习叙述、理解与表达。'},
  {id:'ielts',title:'雅思训练与模考',caption:'走向 IELTS 6.5',description:'听读写说专项、完整模考和正式成绩记录。'},
  {id:'extra',title:'补充选读',caption:'按需要补强',description:'新概念第三、四册的原有课程与笔记。'},
] as const;
export type CatalogueGroup=typeof catalogueGroups[number]['id'];
export type LearningRoute={id:string;learn:boolean;catalogue?:CatalogueGroup;home?:true;query?:string;speaking?:'practice'|'review';review?:true};
export function parseLearningRoute(hash:string,fallback='first'):LearningRoute {
  const [path,params='']=hash.split('?');
  const course=path.match(/^#\/courses(?:\/([A-Za-z0-9]+))?$/);
  if(course) return {id:nodeById(fallback)?fallback:'first',learn:false,catalogue:catalogueGroups.some(g=>g.id===course[1])?course[1] as CatalogueGroup:'all',query:new URLSearchParams(params).get('q')?.slice(0,120)||''};
  const match=path.match(/^#\/(map|learn)\/([a-z0-9-]+)$/);
  const route:LearningRoute={id:match&&nodeById(match[2])?match[2]:nodeById(fallback)?fallback:'first',learn:!!match&&!!nodeById(match[2])&&match[1]==='learn'};
  if(['','#','#/','#/today'].includes(path))route.home=true;
  const speaking=new URLSearchParams(params).get('speaking');
  if(route.learn&&nodeById(route.id)?.kind==='unit'&&(speaking==='practice'||speaking==='review'))route.speaking=speaking;
  if(route.learn&&!speaking&&new URLSearchParams(params).get('review')==='1')route.review=true;
  return route;
}
export function catalogueHash(group:CatalogueGroup='all',query='') {
  return `#/courses${group==='all'?'':`/${group}`}${query?`?q=${encodeURIComponent(query.slice(0,120))}`:''}`;
}
export function catalogueTitle(node:MapNode) {
  return node.kind==='unit'?lessonPlan(unitById(node.id)!).goal:node.title;
}
export function catalogueItems(group:CatalogueGroup,query:string):MapNode[] {
  const scope=group==='extra'?[]:[...nodes.filter(n=>n.kind!=='course'),...unitNodes].filter(n=>group==='all'||group==='starter'&&n.stage==='starter'||group==='NCE1'&&n.stage==='foundation'||group==='NCE2'&&n.stage==='bridge'||group==='ielts'&&['skills','summit'].includes(n.stage));
  const term=query.trim().toLocaleLowerCase();
  if(!term) return scope;
  const lesson=term.match(/^(?:第\s*)?(\d+)(?:\s*课)?$/);
  return scope.filter(n=>{const unit=unitById(n.id);return lesson?!!unit&&Number(lesson[1])>=unit.lesson&&Number(lesson[1])<=unit.lastLesson:`${catalogueTitle(n)} ${n.title} ${n.subtitle}`.toLocaleLowerCase().includes(term)});
}
