import {placementHostTasks} from '../placement/entry-access';
import {registeredStageTodayTasks} from '../stage-assessment/adapter';
import type {State} from './model';
import {routeHash} from './navigation';
import {grammarUnits} from './grammar-curriculum';
import {delayedGrammarEvidence,grammarProgressFor,grammarProgressKey,grammarProgressNeedsNewerVersion,type GrammarUnitProgress} from './grammar-curriculum-progress';
import {learningFor,nextLearning} from './learning-plan';
import {grammarEntries,grammarGuidesFor} from './textbook-grammar';
import {dueUnits,bookNames,studyUnit} from './study-path';
import {journeySnapshot,missionRoute} from './ielts-journey';
import {getFlashcardQueue} from './flashcards';
import {nodes,unitNodes,unitById} from '../map/content';
import {statusMap,due,passedQuiz,type Progress} from '../map/model';
import {speakingDue,speakingReviewAt} from '../map/speaking-model';
import {lessonPlan} from '../map/lesson-plan';
import {samplePracticeTasks} from './ielts-sample-next';
import {courseLoopBindings} from './course-loop-progress';
import {miniPracticeTasks} from '../mini-task/adapter';
import {courseLoopTask,courseDestination,courseAccessHref} from './course-loop-next';
import {chosenMainEntry,isWarmupNode} from './warmup-main-course';

export type PracticeTask={id:string;title:string;reason:string;method:string;evidence:string;href:string;returnHref:string;priority:number;at:number;kind:'repair'|'review'|'resume'|'new'|'course'};
const DAY=86_400_000;
const priority={repair:0,resume:1,shortRecall:1,review:2,legacy:3,new:4,course:5};
// Future or reversed clocks are not evidence of failure, success or overdue work.
const usableHistory=(attempts:{at:number}[],now:number)=>attempts.every((a,i)=>a.at>0&&a.at<=now&&(!i||a.at>=attempts[i-1].at));

function grammarReviewAt(progress:GrammarUnitProgress){
 let dueAt=0;
 let independent:GrammarUnitProgress['attempts']=[];
 for(const attempt of progress.attempts){
  if(!attempt.passed||!attempt.independent){dueAt=0;independent=[];continue}
  independent.push(attempt);
  const spaced=delayedGrammarEvidence({...progress,attempts:independent},attempt.at);
  const next=attempt.at+(spaced?7:1)*DAY;
  // An optional early repeat must not postpone an already scheduled check.
  dueAt=dueAt>attempt.at?Math.min(dueAt,next):next;
 }
 return dueAt;
}

/** Reads existing evidence only. Recommending or skipping never marks work complete.
 * `course` is the last fallback when present; it is omitted when the same work is
 * already a repair/resume/review. The caller may hide IDs for this session only.
 * The classic State and map Progress must have passed their existing validators.
 */
export function todayPractice(state:State,map:Progress,now=Date.now(),online=true):PracticeTask[]{
 const tasks:PracticeTask[]=[...samplePracticeTasks(state,now,online),...placementHostTasks(state,map,now,online)];
 const to=(route:Parameters<typeof routeHash>[0])=>(online?'/':'')+routeHash(route);
 const add=(task:Omit<PracticeTask,'returnHref'>)=>{if(!tasks.some(t=>t.id===task.id))tasks.push({...task,returnHref:to({view:'today'})})};
 const status=online?statusMap(map,now):{};
 const loopOwns=new Set(courseLoopBindings.filter(course=>state.drafts[course.key]!==undefined).map(course=>course.id));
 const chosen=chosenMainEntry(state,now);
 if(chosen?.node&&loopOwns.has(chosen.node.id as Parameters<typeof loopOwns.has>[0])){
  const trial=tasks.findIndex(task=>task.id==='placement:trial');if(trial>=0)tasks.splice(trial,1);
 }
 const mainSelected=!!chosenMainEntry(state,now)||loopOwns.size>0||!!map.lastNode&&!isWarmupNode(map.lastNode)&&!!unitById(map.lastNode);
 if(online)for(const course of courseLoopBindings){
  const loopTask=courseLoopTask(state,now,course.id);if(!loopTask)continue;
  add({id:'course-loop:'+course.id,title:course.id==='nce1-1'?'第 1–2 课 · 问清物品归属':course.lesson.title,reason:loopTask.reason,method:loopTask.kind==='review'?'收起教材，独立回答新情境。':'保留已保存的首答与订正，接着本题继续。',evidence:'记录原答、帮助和订正；听力、发音与自由表达另行核对。',href:courseAccessHref(course.id,map,now),priority:loopTask.kind==='review'?priority.review:priority.resume,at:loopTask.at,kind:loopTask.kind});
 }
 if(online)for(const node of [...nodes.filter(n=>n.kind!=='course'),...unitNodes]){
  if(mainSelected&&isWarmupNode(node.id))continue;
  const record=map.records[node.id],last=record?.attempts.at(-1);
  if(status[node.id]==='locked')continue;
  const unit=unitById(node.id),title=unit?lessonPlan(unit).goal:node.title;
  const validTime=usableHistory(record?.attempts||[],now)&&(!record?.startedAt||record.startedAt<=now);
  const quizNode=['lesson','checkpoint','starter','unit'].includes(node.kind);
  const resume=validTime&&quizNode&&record?.phase==='challenge'&&(last?.round!==record.round||last?.bank!==record.bank);
  const repair=validTime&&quizNode&&!!last&&!passedQuiz(node,last,now);
  const review=validTime&&quizNode&&due(node,map,now);
  // CL replaces the map comprehension check, not independent speech correction.
  if(!loopOwns.has(node.id as Parameters<typeof loopOwns.has>[0])&&(resume||repair||review))add({id:'map:'+node.id,title,
   reason:resume?'上次独立练习还没有结束，接着已保存的一题。':repair?'上轮还需要帮助或有题未通过，先补这一处。':'已到回想时间，先检验学过的内容。',
   method:resume?'保留当前题目、答案与提示记录，继续这一轮。':repair?'从上次结果找到薄弱项，补练后换题。':'收起课文，换一组题独立回想。',
   evidence:'记录本轮作答与提示；通过后仍按间隔安排检验。',href:`/map/#/learn/${node.id}${!resume&&!repair?'?review=1':''}`,
   priority:resume?priority.resume:repair?priority.repair:priority.review,at:last?.at||record?.startedAt||now,kind:resume?'resume':repair?'repair':'review'});
  if(unit&&record?.speaking?.source===unit.sourceSha256&&speakingDue(record.speaking,now))add({id:'speaking:'+node.id,title:'重说一句 · '+title,
   reason:'上次发音反馈有具体问题，已间隔至少一天。',method:'先不看原句录一遍，再对照原声与以前的录音。',
   evidence:'保存本次录音；录过不等于发音已经正确。',href:`/map/#/learn/${node.id}?speaking=review`,priority:priority.review,at:speakingReviewAt(record.speaking)!,kind:'review'});
 }
 for(const unit of grammarUnits){
  if(grammarProgressNeedsNewerVersion(state.drafts[grammarProgressKey(unit.id)]))continue;
  const progress=grammarProgressFor(state,unit),last=progress.attempts.at(-1);
  if(!usableHistory(progress.attempts,now)||progress.seenAt>now)continue;
  const repair=!!last&&(!last.passed||!last.independent),dueAt=grammarReviewAt(progress);
  if(progress.inRound||repair||dueAt>0&&dueAt<=now)add({id:'grammar:'+unit.id,title:unit.title,
   reason:progress.inRound?'上次三步练习还没有结束，接着未完成的一题。':repair?'上轮与参考不同或用过提示，再换一组核对。':'已到复习时间，回想这个用法；是否未见材料按完整展示历史核对。',
   method:'一次一题：识别、改错、限定情境造句。',evidence:'无提示与使用帮助分别记录；复用材料只算复习，材料用尽可继续学习其他单元，自由表达仍待核对。',href:to({view:'grammar',tab:'path',unit:unit.id})+'&check=1',
   priority:progress.inRound?priority.resume:repair?priority.repair:priority.review,at:progress.inRound||repair?last?.at||progress.seenAt||now:dueAt,kind:progress.inRound?'resume':repair?'repair':'review'});
 }
 const loopLessonKeys=new Set(courseLoopBindings.filter(course=>loopOwns.has(course.id)).map(course=>`${course.lesson.book}-${course.lesson.lessons[0]}`));
 const activeGoals=new Set<string>(),activeLessons=new Set<string>(loopLessonKeys);
 for(const entry of grammarEntries){
  if(loopLessonKeys.has(studyUnit(entry.book,entry.lesson).key))continue;
  const record=learningFor(state,entry.book,entry.lesson);
  for(const guide of grammarGuidesFor(entry)){
   const goal=record.goals[guide.id];if(!goal||!usableHistory(goal.attempts,now))continue;
   const last=goal.attempts.at(-1),selected=record.goal===guide.id;
   const pendingAnswer=!!goal.answer.trim()&&goal.checked!==goal.answer;
   const resume=selected&&(record.phase==='transfer'?!!goal.transfer.trim()&&goal.checkedTransfer!==goal.transfer:
    (record.phase==='independent'||record.phase==='review')&&(pendingAnswer||!goal.checked&&(goal.worked||!!last)));
   const repair=!!last&&(!last.matched||last.hinted),review=goal.dueAt>0&&goal.dueAt<=now;
   if(!resume&&!repair&&!review)continue;
   const key=studyUnit(entry.book,entry.lesson).key;activeGoals.add(`${key}:${guide.id}`);activeLessons.add(key);
   add({id:`goal:${entry.id}:${guide.id}`,title:guide.title,
    reason:resume?'上次这段表达还没有核对，接着自己的内容继续。':repair?'上轮与参考不同或用过帮助，先核对这一处。':`${bookNames[entry.book]}第 ${entry.lesson} 课的用法已到回想时间。`,
    method:resume&&record.phase==='transfer'?'保留自己的表达，补齐后再核对。':repair?'先查看上一轮差异，再换一句独立尝试。':'先独立表达一句，再换成自己的情况。',
    evidence:'参考核对与自己的表达分开保存；自由表达仍待核对。',href:to({view:'grammar',book:entry.book,lesson:entry.lesson,tab:'practice',goal:guide.id,practice:resume?record.phase:repair?'independent':'review'}),
    priority:resume?priority.resume:repair?priority.repair:priority.review,at:resume||repair?last?.at||now:goal.dueAt,kind:resume?'resume':repair?'repair':'review'});
  }
 }
 // The existing queue already handles legacy migration without mutating State.
 // Do not append state.cards again or sort new cards ahead of short recalls.
 const cards=getFlashcardQueue(state,now),shortCards=cards.filter(c=>c.phase==='learning'),reviewCards=cards.filter(c=>c.phase!=='new');
 const currentCard=cards.find(item=>item.card.id===state.flashcards?.session?.cardId&&item.card.revision===state.flashcards?.session?.revision),revealed=!!currentCard&&state.flashcards?.session?.revealed;
 if(cards.length)add({id:'words',title:revealed?'继续上次的词卡':shortCards.length?'再回想刚学过的词':reviewCards.length?'回想今天到期的词':'回想新加入的词',
  reason:revealed?'上次已翻开答案，还没有记录回想结果。':shortCards.length?`${shortCards.length} 张刚学过的词卡到了短时回想时间。`:reviewCards.length?`${reviewCards.length} 张词卡已到期。`:`${cards.length} 张词卡还没试过独立回想。`,
  method:revealed?'按刚才的实际回想难度评分，再继续下一张。':'先回想，再翻面；按实际难度安排下次复习。',evidence:'保存每次评分和下次时间，不折算为课程通过。',href:to({view:'words',tab:'review'}),
  priority:revealed?priority.resume:shortCards.length?priority.shortRecall:reviewCards.length?priority.review:priority.new,at:currentCard?.card.due||cards[0].card.due,kind:revealed?'resume':reviewCards.length?'review':'new'});
 for(const unit of dueUnits(state,now).filter(u=>!activeLessons.has(u.key))){
  const review=state.nce![unit.key].review!;if(review.checkedAt>now)continue;
  add({id:'legacy:'+unit.key,title:`${bookNames[unit.book]} · ${unit.label}`,reason:'以前保存的整课自查到期了。',method:'回到原有记录核对听懂、理解和表达。',
   evidence:'保留自查记录，不把勾选当独立检验。',href:to({view:'nce',book:unit.book,lesson:unit.first,tab:'notes'}),priority:priority.legacy,at:review.dueAt,kind:'review'});
 }
 for(const mission of journeySnapshot(state,now).missions){
  const record=mission.evidence.record,last=record.attempts.at(-1);
  if(!usableHistory(record.attempts,now)||[record.startedAt,record.practicedAt,record.savedAt].some(at=>at>now))continue;
  const resume=mission.mini?record.phase==='guided'&&!!record.startedAt||record.phase==='recall'&&(!!record.answer.trim()&&record.checked!==record.answer||record.round>(last?.round??-1)&&!!record.startedAt):
   !mission.evidence.done&&!!(record.artifact.trim()||record.reflection.trim());
  const repair=!!mission.mini&&!!last&&(!last.matched||last.hinted);
  const review=!!mission.mini&&mission.evidence.due;
  if(resume||repair||review)add({id:'journey:'+mission.id,title:mission.title,
   reason:resume?'原来那一步还没有结束，继续已保存的内容。':repair?'原来小步的最后一题还需要核对，先修这一处。':'以前练过的小步到了回想时间。',
   method:resume?'回到原来的问题或草稿接着练。':repair?'先核对具体差异，再换题检验。':'回到原来的练习，换题核对。',
   evidence:'沿用原记录，不把自录、得分或勾选当成新的掌握证明。',href:to(missionRoute(mission)),priority:resume?priority.resume:repair?priority.repair:priority.legacy,
   at:resume||repair?last?.at||record.startedAt||now:record.dueAt,kind:resume?'resume':repair?'repair':'review'});
 }
 for(const task of miniPracticeTasks(state,now,online))add(task);
 for(const task of registeredStageTodayTasks(state,now,target=>to({view:'stage-assessment',task:target}),to({view:'today'})))add(task);
 tasks.sort((a,b)=>a.priority-b.priority||a.at-b.at||a.id.localeCompare(b.id));
 if(online){
  const destination=courseDestination(state,map,now),current=destination.node,unit=unitById(current.id);
  if(!tasks.some(t=>t.id==='placement:trial'||t.id==='map:'+current.id||t.id==='course-loop:'+current.id||t.href===destination.href))add({id:'course:'+current.id,title:unit?lessonPlan(unit).goal:current.title,
   reason:destination.needsAccess?'继续会开放本课访问并直接进入学习；开放访问不代表完成或达标。':'从已保存的位置继续，一次完成一个小目标。',method:'听懂、看懂、自己用，再独立检验。',evidence:'开放访问、跟练、独立通过和延迟巩固分别记录。',
   href:destination.href,priority:priority.course,at:now,kind:'course'});
 }else{
  const current=nextLearning(state,now),unit=studyUnit(current.book,current.lesson);
  if(!activeGoals.has(`${unit.key}:${current.goal}`))add({id:'course:'+unit.key,title:`继续${bookNames[current.book]} · ${unit.label}`,
   reason:'从已保存的教材位置继续，一次完成一个小目标。',method:'听懂、看懂、自己用，再独立检验。',evidence:'跟练、独立核对与自己的表达分别记录。',
   href:to({view:'nce',...current}),priority:priority.course,at:now,kind:'course'});
 }
 if(online&&!tasks.some(task=>task.id==='placement:resume'))add({id:'placement:offer',title:'已有基础？做个短诊断',reason:'最多6题，给一个保守试学起点；原路线和完成记录保留。',method:'从短句开始，遇到困难可跳过或暂停。',evidence:'听说与自由写作仍待独立核对，不提供 IELTS band。',href:'/#/placement',priority:6,at:now,kind:'course'});
 return tasks;
}
