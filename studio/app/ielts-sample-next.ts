import type {State} from './model';
import type {PracticeTask} from './today-practice';
import {routeHash} from './navigation';
import {readSampleProgress,sampleProgressKey} from './ielts-sample-progress';
import {activeSampleDraft,sampleLessonReceipt} from '../ielts-blueprint/sample-sequence-model';
import {sampleLessonById} from '../ielts-blueprint/sample-sequence';
import type {Variant} from '../ielts-blueprint/types';

export function sampleTarget(task?:string){
 const match=task?.match(/^sample-(academic|general-training)-(listening|reading|speaking|writing)$/);
 return match?{variant:match[1] as Variant,lessonId:'hub-'+match[2]}:undefined;
}

/** Read only: the existing sample record owns its attempts and review times. */
export function samplePracticeTasks(state:State,now:number,online:boolean):PracticeTask[]{
 const read=readSampleProgress(state.drafts[sampleProgressKey],now);
 if(read.status==='blocked')throw Error(read.reason);
 const tasks:PracticeTask[]=[],prefix=online?'/':'';
 for(const [key,session] of Object.entries(read.value.sessions)){
  const [variant,lessonId]=key.split(':') as [Variant,string],lesson=sampleLessonById(variant,lessonId)!;
  const selected={...read.value,variant,lessonId},receipt=sampleLessonReceipt(selected,now),draft=activeSampleDraft(selected);
  const resume=session.stage!=='review'||!!draft&&!draft.submittedAt;
  const review=!resume&&receipt.reviewDueAt>0&&receipt.reviewDueAt<=now&&receipt.freshReviewAvailable;
  if(!resume&&!review)continue;
  const repair=session.stage==='feedback'&&session.attempts.at(-1)?.matched===false;
  tasks.push({id:'sample:'+key,title:lesson.title,
   reason:repair?'小循环的上一份作答有误，先完成这一处订正。':resume?'四课小循环还没做完，接着已保存的位置。':'小循环已到隔日复验时间，有不同的新材料可用。',
   method:review?'回到这一课，用未接触过的材料独立尝试。':'保留原始答案、帮助和播放记录，一次完成当前一步。',
   evidence:'短练习与口写待核对作品分别保留，不换算为雅思分数。',
   href:prefix+routeHash({view:'ielts',tab:'course',task:`sample-${variant}-${lesson.skill}`}),returnHref:prefix+routeHash({view:'today'}),
   priority:repair?0:resume?1:2,at:review?receipt.reviewDueAt:session.attempts.at(-1)?.at||Math.min(...Object.values(session.drafts).map(d=>d.openedAt),now),kind:repair?'repair':resume?'resume':'review'});
 }
 return tasks;
}
