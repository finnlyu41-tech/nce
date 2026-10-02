import type {State} from './model';
import {courseLoopKey,parseCourseLoop,loopModel} from './course-loop-progress';
import {achieved,type Progress} from '../map/model';
import {nodeById} from '../map/content';

/** Derive facts from saved records. Rendering never creates exposure, answers,
 * map passes, a review result, or a word-card grade. */
export function courseLoopSummary(state:State,map?:Progress,now=Date.now()){
 const raw=state.drafts[courseLoopKey];
 const mapLabel=map?(achieved(nodeById('nce1-1')!,map,now)?'地图检验：已有达标记录':'地图检验：尚未达标'):'地图检验：记录暂未读取';
 if(raw===undefined)return {status:'none' as const,mapLabel};
 const parsed=parseCourseLoop(raw,now);
 if(!parsed.ok)return {status:'blocked' as const,mapLabel,message:parsed.message};
 const view=parsed.view,next=loopModel.recommendation(view,now);
 const label=view.phase==='waiting'?'本轮训练已完成 · 待复验':view.phase==='review-feedback'?'本次复验已记录':view.phase==='review-a'||view.phase==='review-b'?'到期复验进行中':'本轮训练进行中';
 const independent=view.attempts.filter(attempt=>attempt.stage==='independent');
 return {status:'ready' as const,mapLabel,label,phase:view.phase,currentHelp:view.hinted||view.phase==='guided',
  attempts:view.attempts.length,helped:view.attempts.filter(attempt=>attempt.hinted).length,
  independent:independent.length,independentMatched:independent.filter(attempt=>attempt.correct).length,
  sourceAccess:parsed.state.events.filter(event=>event.type==='source').length,corrections:Object.keys(view.corrections).length,
  reviewResults:view.reviewResults.length,dueAt:view.dueAt,nextKind:next.kind,ownStatus:view.ownFinal?.status};
}
