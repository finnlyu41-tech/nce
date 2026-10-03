/* eslint-disable @next/next/no-html-link-for-pages -- Links connect the existing static map and workspace. */
import type {State} from './model';
import type {Progress} from '../map/model';
import {courseLoopFor,courseLoopBindings} from './course-loop-progress';
import {courseLoopSummary} from './course-loop-summary';
import {courseAccessHref} from './course-loop-next';
import './course-loop.css';
type Props={state:State;map?:Progress;ready?:boolean;error?:string;mapError?:string;courseId?:string};
export function CourseLoopHeadingSummary({state,map,ready=true,error,mapError,courseId='nce1-1'}:Props){
 const summary=courseLoopSummary(state,mapError?undefined:map,Date.now(),courseId);
 if(ready&&!error&&!mapError&&summary.status!=='blocked')return null;
 return <div className="course-loop-heading-summary" role="status">
  <strong>{!ready?'正在读取课程进度…':error?'课程进度暂时未能读取':summary.status==='blocked'?'本课记录需要核对':'路线进度暂时未能读取'}</strong>
 </div>;
}
export function CourseLoopRecords(props:Props){
 return props.courseId?<SingleCourseRecords {...props}/>:<>{courseLoopBindings.map(course=><SingleCourseRecords key={course.id} {...props} courseId={course.id}/>)}</>;
}
function SingleCourseRecords({state,map,error,mapError,courseId='nce1-1'}:Props){
 const {lesson}=courseLoopFor(courseId),range=`第 ${lesson.lessons[0]}–${lesson.lessons[1]} 课连续练习`;
 const summary=courseLoopSummary(state,mapError?undefined:map,Date.now(),courseId);
 if(summary.status==='none')return null;
 return <section className="panel course-loop-records-summary" data-course={courseId} aria-label={range+'记录'}><h2>{range}</h2>
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
  <a className="text-btn" href={map&&!mapError?courseAccessHref(courseId,map):`/map/#/learn/${courseId}`}>回到本课记录</a>
 </section>;
}
