import {batch05LessonBindings} from './batch-05/manifest';
import {batch04LessonBindings} from './batch-04/manifest';
import {batch03LessonBindings} from './batch-03/manifest';
import {batch02LessonBindings} from './batch-02/manifest';
import {miniTasks} from './content';
export const miniTaskManifest = Object.freeze({version:1,contentVersion:1,batch:'R12-authored-batches',coverage:`${miniTasks.length*2} explicit lesson bindings share ${miniTasks.length} paired-group tasks; partial target coverage, no mastery claim`,authoredGroups:miniTasks.map(t=>({taskId:t.id,courseId:t.courseId,groupId:t.groupId,lessons:t.lessons,skill:t.skill,track:t.track})),origin:'original standalone preparatory materials',calibration:'uncalibrated',examClaims:false,progressHost:'existing State.drafts',finiteBanks:['guided','independent','repair','delayed-a','delayed-b']});

export const lessonBindings = [
 {lesson:1,courseId:'nce1-1',taskId:'mini-n1-01',target:'从物品确认声音提取一个物品词',prerequisite:'物品词 + This is / Is this；本组CL own/waiting',sharedReason:'第2课强化第1课物品句型；同一有限任务避免重复进度',uncovered:['请求重说的口头表现','自由归属问答']},
 {lesson:2,courseId:'nce1-1',taskId:'mini-n1-01',target:'把第1课强化物品句型用于听力补格',prerequisite:'同第1课；初阶物品词已教学',sharedReason:'两课为正式配对教学组，强化句型共用一个任务',uncovered:['完整句子产出','教材练习全量覆盖']},
 {lesson:3,courseId:'nce1-3',taskId:'mini-n1-03',target:'读my/not my，依据留言认领提取物主',prerequisite:'my + 否定not my；本组CL own/waiting',sharedReason:'第4课强化第3课归属结构；共用原创失物材料',uncovered:['主动否认的口头表达','your产出']},
 {lesson:4,courseId:'nce1-3',taskId:'mini-n1-03',target:'把强化归属结构用于阅读信息提取',prerequisite:'同第3课；能辨肯定与not',sharedReason:'配对课共用归属目标；只分列目标不重复任务',uncovered:['全部操练项','否定短答产出']},
 {lesson:5,courseId:'nce1-5',taskId:'mini-n1-05',target:'用This is介绍人，再按明确代词说国籍',prerequisite:'This is / He-She is + 国籍；本组CL own/waiting',sharedReason:'第6课强化第5课介绍/国籍；共用口头介绍任务',uncovered:['口语质量/发音达标（待外评）']},
 {lesson:6,courseId:'nce1-5',taskId:'mini-n1-05',target:'把强化代词和国籍结构用于口头介绍',prerequisite:'同第5课；已明确代词与国籍，不猜测',sharedReason:'配对课强化相同结构；本地录音只记一次任务',uncovered:['教材操练全量','真人口语评价']},
 {lesson:7,courseId:'nce1-7',taskId:'mini-n1-07',target:'写职业自述与Are you询问的两句留言',prerequisite:'I am + a/an；Are you + a/an；本组CL own/waiting',sharedReason:'第8课强化第7课职业结构，共用GT起步通信',uncovered:['否定短答','完整GT Task1','Academic写作']},
 {lesson:8,courseId:'nce1-7',taskId:'mini-n1-07',target:'把强化职业句型用于短留言',prerequisite:'同第7课；职业词及a/an已教学',sharedReason:'配对职业课共享原创通信任务',uncovered:['教材操练全量','写作质量/分数（待外评）']},
 {lesson:9,courseId:'nce1-9',taskId:'mini-n1-09',target:'听明确报告的本人当前状态，补一格',prerequisite:'I am + 已教状态词；本组CL own/waiting',sharedReason:'第10课强化第9课be/状态词，共用听力任务',uncovered:['主动问How are you','第三人称状态产出']},
 {lesson:10,courseId:'nce1-9',taskId:'mini-n1-09',target:'把强化状态词用于听力信息提取',prerequisite:'同第9课；不根据语气推断',sharedReason:'配对课强化相同状态词，共用有限声音池',uncovered:['全部操练项','发音与自由对话']},
 {lesson:11,courseId:'nce1-11',taskId:'mini-n1-11',target:'读姓名所属与颜色，提取一条登记信息',prerequisite:"姓名's + 单数物品 + is + 颜色；本组CL own/waiting",sharedReason:'第12课强化第11课所属/颜色，共用登记阅读',uncovered:['Whose问句产出','主动说明物主']},
 {lesson:12,courseId:'nce1-11',taskId:'mini-n1-11',target:'把强化所属和颜色用于阅读筛选',prerequisite:'同第11课；给出明确物主与颜色',sharedReason:'配对课强化相同结构，共用一份任务快照',uncovered:['教材练习全量','口语表达']},
 ...batch02LessonBindings,
 ...batch03LessonBindings,
 ...batch04LessonBindings,
 ...batch05LessonBindings,
].map(row=>({...row,book:'NCE1',coverage:'partial-target',calibration:'uncalibrated'}));
