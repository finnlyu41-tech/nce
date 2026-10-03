import {batch02Tasks} from './content';
const goals:Record<number,{target:string;prerequisite:string;uncovered:string[]}>= {
 13:{target:'听物主与颜色，从同色、否认和干扰中提取登记事实',prerequisite:'第13课颜色问答+第14课颜色/物品练习；CL真实own/waiting或后续复习位置',uncovered:['主动颜色问句口语产出','完整his/her构句评价','真人听感与自然延迟效果']},
 15:{target:'读多人旅客留言，以we/our和肯否筛选身份、国籍或复数物品',prerequisite:'第15课旅客/箱子语境+第16课多人国籍/物品；CL真实own/waiting或后续复习位置',uncovered:['a/an职业单数产出','自由国籍问答口语','完整IELTS阅读题型']},
 17:{target:'向来访者口头介绍两人、共同复数职业及肯否状态',prerequisite:'第17课员工介绍+第18课复数职业；CL真实own/waiting或后续复习位置',uncovered:['主动What are their jobs提问','指示距离完整对话','口语质量/发音待人工']},
 19:{target:'写日常短留言，保留当前状态、人物范围与单复数递物对象',prerequisite:'第19课状态交流+第20课宾格递物；CL真实own/waiting或后续复习位置',uncovered:['即时状态问答口语','完整GT书信与写作质量','Academic写作未包含']},
 21:{target:'听单件递物选择、纠正与接收者干扰，记录所选特征',prerequisite:'第21课Which one选择+第22课形容词/单件请求；CL真实own/waiting或后续复习位置',uncovered:['主动物主问答产出','独立完整Give/Which对话','真人听感与自然延迟效果']},
 23:{target:'读多件分发留言，区分接收者与ones所在组的表面位置',prerequisite:'第23课some/Which复数+第24课位置选择；CL真实own/waiting或后续复习位置',uncovered:['主动复数请求与追问产出','ones位置短语独立口写','完整IELTS阅读题型']},
};
export const batch02LessonBindings=batch02Tasks.flatMap(t=>t.lessons.map(lesson=>({book:'NCE1',lesson,courseId:t.courseId,taskId:t.id,...goals[t.lessons[0]],sharedReason:lesson===t.lessons[0]?'正式奇偶配对课共享一个有限任务身份；不会重复创建进度':'本偶数课强化同组目标；分列绑定但共用同一份任务快照',coverage:'partial-target',calibration:'uncalibrated'})));
export const batch02Manifest={batch:'R12-mini-batch-02',contentVersion:1,authoredCourses:batch02Tasks.map(t=>t.courseId),skillRotation:batch02Tasks.map(t=>t.skill),lessonBindings:batch02LessonBindings,progress:'existing State.drafts; unchanged CAS/host/leave guards',firstTrial:'有提示首答→反馈→新材料独立尝试；帮助不计独立',finiteItemsPerTask:5,bandClaims:false,humanOralWrittenReview:true,humanAcousticAudit:false,difficultyCalibrated:false};
