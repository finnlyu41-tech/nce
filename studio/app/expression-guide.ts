import type {LanguageRow} from './language';
import type {NceBookId} from './model';
export type Option={en:string;zh:string};
export type Frame={id:string;name:string;match:RegExp;form:string;zh:string;slots:{label:string;options:Option[]}[];tip:string;transfer:string};
const choices=(label:string,items:string[])=>({label,options:items.map(s=>{const [en,zh]=s.split('|');return {en,zh}})});
export const frames:Frame[]=[
 {id:'ownership',name:'物品与归属',match:/\b(?:your|my|his|her) (?:handbag|bag|coat|umbrella|pen|book|car|shirt|dress)\b/i,form:'Is this your {0}? Yes, it is. This is my {0}.',zh:'这是你的{0}吗？是的。这是我的{0}。',slots:[choices('换一种物品',['bag|包','book|书','pen|钢笔'])],tip:'先问 Is this your…? 回答时把 your 换成 my。物品先用单数。',transfer:'拿起身边另一件东西，重新问答；这次不看屏幕。'},
 {id:'request',name:'提出请求',match:/\b(?:please|could you|can you|would you)\b/i,form:'Could you {0}, please? Thank you.',zh:'请你{0}好吗？谢谢。',slots:[choices('请对方做什么',['open the window|打开窗户','help me|帮我','say that again|再说一遍'])],tip:'Could you 后面直接接动作原形；把整个请求作为一组读。',transfer:'想一个今天会用到的请求，把动作换成自己的。'},
 {id:'place',name:'地点与环境',match:/\b(?:there is|there are|where|in the room)\b/i,form:'There is a {0} near my home. I go there {1}.',zh:'我家附近有一个{0}。我{1}去那里。',slots:[choices('家附近的地方',['park|公园','shop|商店','library|图书馆']),choices('多久去一次',['every week|每周','on Sundays|星期日','twice a month|一个月两次'])],tip:'There is 后面用单数。先说地点，再补一个去那里的频率。',transfer:'换一个真实的地方，补充你在那里做什么。'},
 {id:'identity',name:'身份与现状',match:/\b(?:am|are you|is he|is she|name|nationality|job)\b/i,form:'I am {0}. I {1}.',zh:'我是{0}。我{1}。',slots:[choices('你的身份',['a student|一名学生','a teacher|一名教师','an engineer|一名工程师']),choices('补一个生活细节',['study English every day|每天学英语','work in a small team|在一个小团队工作','enjoy reading|喜欢阅读'])],tip:'职业前通常有 a / an。先说身份，再补一个真实细节。',transfer:'不用示范中的职业，说出自己的身份和一件日常的事。'},
 {id:'feeling',name:'状态与感受',match:/\b(?:tired|thirsty|hungry|happy|ill|feel|cold|hot)\b/i,form:'I feel {0} today. I need {1}.',zh:'我今天感到{0}。我需要{1}。',slots:[choices('现在的状态',['tired|累','hungry|饿','thirsty|渴']),choices('你需要什么',['some rest|休息一下','some food|一些食物','some water|一些水'])],tip:'两句意思要配得上：渴了通常需要水。先说状态，再说需要。',transfer:'换成你今天的实际状态；原因可以先用中文想。'},
 {id:'ability',name:'能力与进步',match:/\b(?:can|cannot|can't|could)\b/i,form:'I can {0}, but I cannot {1} yet.',zh:'我会{0}，但还不会{1}。',slots:[choices('已经会做的事',['swim|游泳','cook|做饭','ride a bike|骑自行车']),choices('还在学习的事',['drive a car|开车','play the piano|弹钢琴','speak French|说法语'])],tip:'can / cannot 后用动作原形，yet 表示“还”。',transfer:'说一个你能做的事，再说一个你正在学的事。'},
 {id:'future',name:'计划与愿望',match:/\b(?:going to|will|shall|tomorrow)\b/i,form:'Tomorrow, I am going to {0}. I will go with {1}.',zh:'明天我打算{0}。我会和{1}一起去。',slots:[choices('打算做什么',['visit a museum|参观博物馆','go to the park|去公园','go shopping|购物']),choices('和谁一起',['a friend|一个朋友','my family|家人','my sister|姐姐或妹妹'])],tip:'am going to 后接动作原形；先计划，再补同行的人。',transfer:'把明天换成下周，讲一个不同的真实计划。'},
 {id:'past',name:'过去的经历',match:/\b(?:was|were|went|did|had|yesterday|ago)\b/i,form:'Last weekend, I {0}. I felt {1}.',zh:'上周末我{0}。我感到{1}。',slots:[choices('发生了什么',['visited a friend|拜访了一个朋友','went to a park|去了公园','cooked dinner|做了晚饭']),choices('你的感受',['happy|开心','relaxed|放松','tired|疲惫'])],tip:'过去的事使用过去式：go → went，feel → felt。先后两句时态一致。',transfer:'换成昨天的一件事，再补充当时和谁在一起。'},
 {id:'preference',name:'喜好与原因',match:/\b(?:like|love|enjoy|prefer|want)\b/i,form:'I enjoy {0} because {1}.',zh:'我喜欢{0}，因为{1}。',slots:[choices('喜欢的活动',['reading|阅读','swimming|游泳','cooking|做饭']),choices('一个原因',['it helps me relax|它帮助我放松','I can learn something new|我能学到新东西','it is fun|它很有趣'])],tip:'enjoy 后面的动作使用 -ing。because 后面写完整的原因。',transfer:'换一个活动，给出自己的原因，不照抄示范。'},
 {id:'habit',name:'日常与频率',match:/\b(?:usually|often|every|always|sometimes|do you)\b/i,form:'I usually {0} {1}.',zh:'我通常{1}{0}。',slots:[choices('经常做什么',['read a book|读书','go for a walk|散步','listen to music|听音乐']),choices('什么时候',['after dinner|晚饭后','in the morning|早上','before bed|睡觉前'])],tip:'usually 通常放在动作前；频率和时间让回答更具体。',transfer:'加第二句：为什么这样做？可以用 It helps me relax. 起步。'},
];
export const sentenceFor=(frame:Frame,selected:number[],chinese=false)=>(chinese?frame.zh:frame.form).replace(/\{(\d+)\}/g,(_,i)=>{const options=frame.slots[Number(i)].options;return options[selected[Number(i)]||0]?.[chinese?'zh':'en']||options[0][chinese?'zh':'en']});
export function guideFor(rows:LanguageRow[],book:NceBookId){
 const source=rows.find(r=>frames.some(f=>f.match.test(r.en))&&r.en.length>12)||rows.find(r=>r.en.length>12)||rows[0];
 const frame=frames.find(f=>f.match.test(source?.en||''))||frames[3];
 return {source,frame,level:book==='NCE1'?'sentence':book==='NCE2'?'story':'opinion'};
}
export type GuideDraft={step:number;selected:number[];meaning:string;keywords:string;answer:string;repair:string;retry:string;saved:boolean;category:string};
export function readGuide(raw?:string):GuideDraft{
 let d:any={};try{d=JSON.parse(raw||'{}')||{}}catch{}
 const text=(key:string)=>typeof d[key]==='string'?d[key].slice(0,5000):'';
 return {step:Number.isInteger(d.step)?Math.max(0,Math.min(4,d.step)):0,selected:Array.isArray(d.selected)?d.selected.slice(0,4).map((x:any)=>Number.isInteger(x)&&x>=0&&x<3?x:0):[],meaning:text('meaning'),keywords:text('keywords'),answer:text('answer'),repair:text('repair'),retry:text('retry'),saved:d.saved===true,category:text('category')};
}
