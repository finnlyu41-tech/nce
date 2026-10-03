import {useState} from 'react';
import {courseLoopFor,type LoopAttempt,type LoopView} from './course-loop-progress';
import './course-loop-learning-ui.css';

export function CourseAnswerFeedback({attempt,view,courseId}:{attempt:LoopAttempt;view:LoopView;courseId:string}){
 const question=courseLoopFor(courseId).byId.get(attempt.id),correction=view.corrections[attempt.id];
 const needsPractice=!attempt.correct||attempt.hinted;
 return <div className={`course-answer-feedback ${needsPractice?'needs-practice':'matched'}`}>
  <p className="course-answer-result">{attempt.correct?(attempt.hinted?'借助提示完成':'这题答对了'):'这题需要订正'}</p>
  {needsPractice&&<p>{question?.context}</p>}
  <p className="course-loop-original"><span>你的回答</span><span lang="en">{attempt.answer||'暂时不会'}</span></p>
  {needsPractice&&<><p className="course-answer-reference"><span>参考说法</span><span lang="en">{question?.accepted[0]}</span></p><p>{question?.why}</p></>}
  {correction&&<div className="course-answer-correction"><p><span>已保存订正</span> <span lang="en">{correction.answer}</span></p><p>{correction.note}</p></div>}
 </div>;
}

export function CourseAnswerHistory({view,courseId}:{view:LoopView;courseId:string}){
 const [open,setOpen]=useState(false);
 return <section className="course-answer-history">
  <button type="button" aria-expanded={open} onClick={()=>setOpen(value=>!value)}>{open?'收起本课作答':'查看本课作答与订正'}</button>
  {open&&<div><p className="course-loop-note">本课作答与词卡复习分别保存。</p>{view.attempts.map((attempt,index)=><CourseAnswerFeedback key={`${attempt.id}-${index}`} attempt={attempt} view={view} courseId={courseId}/>)}</div>}
 </section>;
}
