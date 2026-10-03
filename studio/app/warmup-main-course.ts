import type {State} from './model';
import {parseRoute} from './navigation';
import {mapUnitId} from './map-connection';
import {placementTrial} from '../placement/adapter';
import {nodeById,type MapNode} from '../map/content';

export const isWarmupNode=(id:string)=>['first','letters','small-exchange'].includes(id);
export function chosenMainEntry(state:State,now=Date.now()){
 const trial=placementTrial(state,now);if(!trial)return null;
 const route=parseRoute(trial.href.replace(/^\//,''));
 const id=route.view==='nce'?mapUnitId(route.book,route.lesson):undefined;
 return {node:id?nodeById(id):undefined,href:id?`/map/#/learn/${id}`:trial.href,label:`进入所选起点 · ${trial.label}`};
}
/** A destination only. Opening it must first confirm the host's access save. */
export function mainEntryAfterWarmup(state:State,current:MapNode,now=Date.now()){
 const chosen=chosenMainEntry(state,now);if(chosen&&(isWarmupNode(current.id)||chosen.node?.id===current.id))return chosen;
 const node=isWarmupNode(current.id)?nodeById('nce1-1')!:current;
 return {node,href:`/map/#/learn/${node.id}`,label:node.id==='nce1-1'?'进入第 1–2 课，开始正式学习':`继续本课 · ${node.title}`};
}
