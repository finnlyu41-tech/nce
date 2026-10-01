import {guidesFor, firstChapterFocus, type Unit, type MapQuestion} from './curriculum';
import {transferPrompts} from '../app/learning-transfer';

// Small, original tasks for the first chapter; later lessons reuse the existing teaching map.
const beginnings:Record<number,{goal:string;recall:string;answer:string;own:string}>={
  1:{goal:'礼貌地询问物品是不是对方的',recall:'pen 是“笔”。问：这是你的笔吗？',answer:'Is this your pen?',own:'选一件身边的物品，问是不是对方的。先说一句就够了。'},
  3:{goal:'说明一件物品是不是自己的',recall:'bag 是“包”。说：这不是我的包。',answer:'This is not my bag.',own:'选一件物品，说明它是不是你的。'},
  5:{goal:'介绍一位朋友',recall:'介绍一位叫 Anna 的朋友：这是 Anna。',answer:'This is Anna.',own:'把名字换成一位你认识的人，介绍给对方。'},
  7:{goal:'说出自己的身份或职业',recall:'teacher 是“老师”。说：我是一名老师。',answer:'I am a teacher.',own:'介绍自己的身份。student 是学生，teacher 是老师；也可以先记下中文职业名。'},
  9:{goal:'问候别人并回答近况',recall:'用 fine（很好）回答：How are you?',answer:'I am fine.',own:'想象遇见朋友，问候对方，再回答一次问候。'},
  11:{goal:'问清楚一件物品是谁的',recall:'book 是“书”。问：这是谁的书？',answer:'Whose book is this?',own:'选一件身边的物品，问是谁的，再用 my 或 your 回答。'},
  13:{goal:'询问和描述物品的颜色',recall:'red 是“红色”。说：它是红色的。',answer:'It is red.',own:'看看身边物品的颜色，选一样用 It is… 描述。'},
  15:{goal:'用 they 介绍几个人',recall:'teachers 是“老师们”。说：他们是老师。',answer:'They are teachers.',own:'想象一群同学或朋友，用 They are… 介绍他们。'},
  17:{goal:'介绍几个人的职业',recall:'students 是“学生们”。说：他们是学生。',answer:'They are students.',own:'介绍你认识的两个人的职业，检查 are 后的职业名词是否需要复数。'},
  19:{goal:'说出自己和同伴的状态',recall:'thirsty 是“口渴的”。说：我们口渴了。',answer:'We are thirsty.',own:'用 We are… 说你和同伴现在的状态，例如 tired 或 thirsty。'},
  21:{goal:'礼貌地请别人递一件物品',recall:'bag 是“包”。说：请给我一个包。',answer:'Give me a bag, please.',own:'请别人递给你一件真正需要的东西，记得加 please。'},
  23:{goal:'请别人递来几件物品',recall:'pens 是“笔”的复数。说：请给我一些笔。',answer:'Give me some pens, please.',own:'想象需要几件物品，用 Give me some… 表达请求。'},
};
const firstAnswer=(value:string)=>value.split(/\s+\/\s+/)[0];
const capabilities:Record<string,string>={
  'be-question':'询问一件事是不是这样','pronouns':'用代词说清谁在帮助谁','be':'介绍一个人的身份与状态',
  'possession':'问清并说明物品属于谁','adjectives':'描述物品的颜色、大小与新旧','articles':'让对方知道你指的是哪件物品',
  'double-object':'说清把什么东西交给谁','place':'告诉别人位置与方向','obligation':'说明必须做和不允许做的事',
  'present-continuous':'描述此刻正在做的事','going-to':'说出已经决定的计划','there-be':'介绍一个地方有什么',
  'can':'说明自己会做什么并询问对方','present-simple':'描述日常习惯并提问','origin':'介绍和询问一个人的来源',
  'present-contrast':'区分平常习惯与眼前正在做的事','countable':'说清物品数量和食物份量','imperative':'给出清楚的指令与提醒',
  'time-prepositions':'说清活动的日期和时间','past-be':'描述过去的地点与状态','past-simple':'讲述已经发生的一件事',
  'have':'表达一次用餐、休息或工作安排','present-perfect':'说明已完成的事与现在的关系','already-yet':'汇报已经做和还没做的事',
  'will':'作出临时决定或承诺','had-better':'根据眼前情况给出建议','object-clause':'转述消息并表达自己的判断',
  'degree':'说明程度是否足够或过头','object-to':'说清希望别人帮忙做什么','comparison':'比较两种选择并说明差别',
  'quantity':'比较数量与花费','none':'表达一组东西已经一个也没有','indefinite':'描述尚未确定的人或物',
  'past-continuous':'描述过去某刻正在发生的事','past-perfect':'分清两件过去事情的先后','relative':'用特征说明你指的是哪一个',
  'relative-omission':'简洁地介绍一件有来历的物品','deduction-now':'根据迹象推测现在的情况','deduction-past':'根据结果推测过去发生的事',
  'may':'表达可能发生的几种情况','reported':'从自己的视角转述别人的话','condition-real':'说明条件成立后会怎样',
  'indirect-question':'礼貌地询问地点或信息','passive':'说明物品怎样被制作或处理','passive-forms':'说明工作已被怎样处理与后续安排',
  'word-order':'按清楚的顺序说明谁做了什么','past-or-perfect':'讲述经历并补充发生时间','future-continuous':'描述未来某刻将正在做的事',
  'gerund':'谈论喜欢的活动并表达感谢','verb-prepositions':'说清在等待、依靠或担心什么','complex-sentences':'把原因、转折和结果连接起来',
  'used-to':'比较过去习惯与现在生活','future-perfect':'说明到某个期限前将完成什么','condition-unreal':'假设一种情况并说明可能结果',
  'past-ability':'区分过去会做和实际做成的事','verb-patterns':'说清计划、决定与喜欢的活动','perfect-continuous':'描述一直持续到现在的活动',
  'reporting-passive':'转述关于一件事的报道','time-clause':'用时间关系连接两件事','past-perfect-continuous':'描述过去某刻之前持续的活动',
  'reported-commands':'转述别人的要求与建议','condition-past':'回顾如果当时不同会有什么结果','causative':'说明请别人处理的一件事',
  'nonfinite-passive':'简洁表达事情被处理的先后','need-doing':'说明什么东西需要被处理','verb-review':'按时间与意思选择合适的动词形式',
};
export function lessonPlan(unit:Unit){
  const guide=guidesFor(unit)[0],focus=unit.book==='NCE1'?firstChapterFocus[unit.lesson]:undefined;
  const beginning=unit.book==='NCE1'?beginnings[unit.lesson]:undefined;
  const example=guide.examples[0],recall=guide.examples[1];
  const guidedAnswer=focus?.answer||example.en;
  const own=beginning?.own||transferPrompts[guide.id];
  return {
    goal:beginning?.goal||capabilities[guide.id]||own.replace(/[。！]$/,''),
    sample:focus?{en:focus.en,zh:focus.zh}:example,
    pattern:focus?.idea||guide.pattern,
    guided:{id:'guided-expression',type:'input',mode:'order',prompt:focus?.prompt||`跟着示范，用英文说：${example.zh}`,answer:guidedAnswer,options:guidedAnswer.split(/\s+/),explanation:focus?.idea||example.note} as MapQuestion,
    recall:{prompt:beginning?.recall||(recall?`收起示范，用英文说：${recall.zh}`:guide.practice.prompt),answer:beginning?.answer||firstAnswer(recall?.en||guide.practice.answer)},
    own,
    check:focus?'是否说清了人或物？问句与回答能对应吗？':guide.pitfall,
  };
}

export function questionSkills(questions:MapQuestion[],results:boolean[]){
  const groups=[
    {id:'listen',label:'听懂原声',step:0,repair:'回听没听清的原句，再对照中文确认意思。'},
    {id:'read',label:'理解句意',step:1,repair:'回到讲解，先弄清这句话在什么情况下使用。'},
    {id:'order',label:'组成句子',step:2,repair:'回到“自己用”，跟着词块组一句，再收起提示。'},
    {id:'grammar',label:'运用句型',step:1,repair:'对照本课句型，检查动词形式与句子结构。'},
  ];
  return groups.map(group=>{
    const indexes=questions.flatMap((q,i)=>(q.mode==='listen'?'listen':q.mode==='order'?'order':q.type==='input'?'grammar':'read')===group.id?[i]:[]);
    return {...group,total:indexes.length,correct:indexes.filter(i=>results[i]).length};
  }).filter(group=>group.total);
}
