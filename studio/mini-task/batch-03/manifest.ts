import {batch03Tasks} from './content';
const goals:Record<number,{target:string;prerequisite:string;uncovered:string[]}>= {
 25:{target:'听单件物品的直接位置，区分该物品、容器与邻物；受控语义选择',prerequisite:'第25课There is/单件位置+第26课Where is it；真实CL own/waiting或后续复习',uncovered:['主动a/an/the介绍','完整Where问答产出','真人听感与难度校准']},
 27:{target:'读复数组领物信息，把类别/性质与正确组或容器对应；受控语义选择',prerequisite:'第27课There are/物品组位置+第28课Where are they；真实CL own/waiting或后续复习',uncovered:['主动复数存在和位置问句','完整复数位置构句','完整IELTS阅读题型']},
 29:{target:'口头交接明确任务规则，保留动作对象、顺序和不同执行者；开放人工核对',prerequisite:'第29课must问任务/动作指令+第30课物品动作；真实CL own/waiting或后续复习',uncovered:['主动What must…do询问','自由追问与即时协商','口语内容/质量待人工']},
 31:{target:'写当前观察短讯，区分旧便签/未知动作，保留主体与动作路线；开放人工核对',prerequisite:'第31课单人/动物当前动作+第32课动作观察；真实CL own/waiting或后续复习',uncovered:['实时口语动作问答','自由GT写作质量/完整Task1','Academic写作未包含']},
 33:{target:'听多人当前活动，提取指定活动对应组、物品或路线；受控事实提取',prerequisite:'第33课复数当前活动+第34课多人动作；真实CL own/waiting或后续复习',uncovered:['主动What are they doing询问','独立复数动作构句','真人听感与完整听力能力']},
 35:{target:'读来访留言，区分静态内部/相对位置与进入/走出/沿行/横穿；受控语义选择',prerequisite:'第35课位置与移动+第36课Where/方向；真实CL own/waiting或后续复习',uncovered:['主动Where位置问句','完整空间/移动表达产出','实际导航与完整IELTS地图题']},
};
export const batch03LessonBindings=batch03Tasks.flatMap(t=>t.lessons.map(lesson=>({book:'NCE1',lesson,courseId:t.courseId,taskId:t.id,...goals[t.lessons[0]],sharedReason:lesson===t.lessons[0]?'正式奇偶配对组共享一个有限任务；单一已有快照，不重复进度':'偶数课强化同组目标；显式分列绑定，仍共享任务身份',coverage:'partial-target',calibration:'uncalibrated'})));
export const batch03Manifest={batch:'R12-mini-batch-03',contentVersion:1,publishedBase:'7b7c1283d12f0c6d784478cda8353080598f6980',unpublishedCandidateDependency:'06be41a9e3faf24c398abdea95ee8a2aa36438bd',authoredCourses:batch03Tasks.map(t=>t.courseId),skillRotation:batch03Tasks.map(t=>t.skill),lessonBindings:batch03LessonBindings,closedMode:'controlled semantic fact selections, not full skill evaluation',openMode:'awaiting human review, no automatic quality/Band',firstTrial:'hinted first answer retained→feedback→new independent material→repair→finite delayedA/B',finiteItemsPerTask:5,progress:'unchanged existing State.drafts/host/CAS/Today priority',humanAcousticAudit:false,difficultyCalibrated:false,naturalDelayVerified:false};
