import type {State} from '../app/model';
import type {PracticeTask} from '../app/today-practice';
import {placementKey,readPlacement,placementTransition,placementRecommendation,type PlacementAction} from './model';
export const placementHref='/#/placement';
/** One State.drafts entry; host's existing guarded autosave performs persistence. */
export function applyPlacement(state:State,expectedRaw:string|undefined,action:PlacementAction,now=Date.now()):State{
 if(state.drafts[placementKey]!==expectedRaw)return state;
 const next=placementTransition(expectedRaw,action,now);
 if(next.status==='blocked'||next.raw===null)return state;
 return {...state,drafts:{...state.drafts,[placementKey]:next.raw}};
}
/** A chosen trial is optional and never changes the existing course continuation. */
export function placementTrial(state:State,now=Date.now()){
 const read=readPlacement(state.drafts[placementKey],now);if(read.status==='blocked')return null;
 const result=placementRecommendation(read.view);
 return result.complete&&read.view.run?.chosen===result.entry.id?result.entry:null;
}
export function placementTasks(state:State,now=Date.now(),online=true):PracticeTask[]{
 const read=readPlacement(state.drafts[placementKey],now);if(read.status==='blocked'||!read.view.run)return [];
 const run=read.view.run,href=(online?'/':'')+'#/placement';
 const result=placementRecommendation(read.view);
 if(run.phase!=='complete')return [{id:'placement:resume',title:'继续这次短诊断',reason:'保留已见题、帮助、首答和未提交输入。',method:'继续已保存的一题，遇到困难可暂停或跳过。',evidence:result.limits,href,returnHref:(online?'/':'')+'#/today',priority:1,at:read.view.lastAt,kind:'resume'}];
 // No completion flag is invented for a repair. Existing courses own its evidence.
 // Keep repairs in the result view; only an explicitly chosen trial enters Today.
 const trial=placementTrial(state,now);
 return trial?[{id:'placement:trial',title:trial.label,reason:'你选择了本轮建议的试学起点；原路线仍可继续。',method:'试一小步，遇到困难回到诊断中的具体修补建议。',evidence:result.limits,href:online?trial.href:trial.href.replace(/^\//,''),returnHref:href,priority:5,at:read.view.lastAt,kind:'course'}]:[];
}
