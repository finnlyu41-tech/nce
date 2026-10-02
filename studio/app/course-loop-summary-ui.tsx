/* eslint-disable @next/next/no-html-link-for-pages -- Links connect the existing static map and workspace. */
import type {State} from './model';
import type {Progress} from '../map/model';
import {courseLoopSummary} from './course-loop-summary';
import {courseAccessHref} from './course-loop-next';
import './course-loop.css';
type Props={state:State;map?:Progress;ready?:boolean;error?:string;mapError?:string};
export function CourseLoopHeadingSummary({state,map,ready=true,error,mapError}:Props){
 const summary=courseLoopSummary(state,mapError?undefined:map);
 return <div className="course-loop-heading-summary" role="status">
  <strong>{!ready?'正在读取本轮训练记录…':error?'本轮训练记录暂时未能读取':summary.status==='ready'?summary.label:summary.status==='blocked'?'本课记录需要核对':'本轮训练尚未开始'}</strong>
  {ready&&!error&&summary.status==='ready'&&<span>{summary.currentHelp?'当前使用帮助':summary.helped?`${summary.helped} 次作答使用帮助，原答已保留`:'原答与帮助记录分别保留'}</span>}
  <span>{summary.mapLabel}</span>
 </div>;
}
export function CourseLoopRecords({state,map,error,mapError}:Props){
 const summary=courseLoopSummary(state,mapError?undefined:map);
 if(summary.status==='none')return null;
 return <section className="panel course-loop-records-summary" aria-label="第 1–2 课连续练习记录"><h2>第 1–2 课连续练习</h2>
  {summary.status==='blocked'?<p role="status">{summary.message}</p>:<>
   <p role="status"><strong>{summary.label}</strong>{summary.currentHelp&&' · 当前使用帮助'}</p>
   <p>原始作答 {summary.attempts} 次 · 其中 {summary.helped} 次使用帮助 · 已保留 {summary.corrections} 条订正。</p>
   <p>本轮独立题 {summary.independent} 次作答，{summary.independentMatched} 次与本题参考匹配；不同材料的复验已记录 {summary.reviewResults} 轮。</p>
   {summary.sourceAccess>0&&<p>已记录 {summary.sourceAccess} 次教材帮助访问；提示与独立作答分别保留。</p>}
   {summary.dueAt&&<p>{summary.phase==='review-a'||summary.phase==='review-b'?'本轮到期时间：':'下一次回想：'}{new Date(summary.dueAt).toLocaleString('zh-CN')}。{summary.phase==='review-a'||summary.phase==='review-b'?'本次复验已开始，接着未提交题继续。':summary.nextKind==='review'?'已到期，可以回到本课换新题。':summary.nextKind==='needs-new-material'?'本课两组新题已用完，需要补充材料。':'到期前可以继续后续课次。'}</p>}
   <p>自己的表达：{summary.ownStatus==='awaiting-human-review'?'待人工核对':'尚未提交人工核对'}。</p>
  </>}
  <p>{summary.mapLabel}。连续练习的本轮记录、地图检验和词卡复习分别保存；本轮完成不代表整课已经掌握。</p>
  {(error||mapError)&&<p role="status">{error||mapError}</p>}
  <a className="text-btn" href={map&&!mapError?courseAccessHref('nce1-1',map):'/map/#/learn/nce1-1'}>回到本课记录</a>
 </section>;
}
