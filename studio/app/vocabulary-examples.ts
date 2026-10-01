export type UsageExample={
 id:string;
 word:string;
 sense:string;
 matches:string[];
 en:string;
 zh:string;
 collocation:{en:string;zh:string};
 origin:'original';
};

// Original examples for this site. These are usage aids, not textbook quotations
// or official exam material. Each item belongs to the stated sense of its word.
export const originalVocabularyExamples:UsageExample[]=[
 {id:'excuse-politeness',word:'excuse',sense:'礼貌地请原谅；打扰一下',matches:['原谅','宽恕','请原谅'],
  en:'Excuse me, could I get past?',zh:'不好意思，我能从这里过去吗？',
  collocation:{en:'excuse me',zh:'不好意思；打扰一下'},origin:'original'},
 {id:'excuse-pretext',word:'excuse',sense:'借口；托辞',matches:['借口','托辞'],
  en:'He made a weak excuse for missing the meeting.',zh:'他为缺席会议找了一个站不住脚的借口。',
  collocation:{en:'make an excuse',zh:'找借口'},origin:'original'},
 {id:'handbag-bag',word:'handbag',sense:'手提包',matches:['手提包','手袋'],
  en:'She carries a small handbag because she only needs her phone and keys.',zh:'她只带手机和钥匙，所以拎着一个小手提包。',
  collocation:{en:'carry a handbag',zh:'拎手提包'},origin:'original'},
 {id:'pardon-politeness',word:'pardon',sense:'请求原谅；礼貌地打断',matches:['原谅','宽恕'],
  en:'Pardon me for interrupting, but the last bus leaves in ten minutes.',zh:'抱歉打断一下，不过末班公交十分钟后就开了。',
  collocation:{en:'pardon me for interrupting',zh:'抱歉打断一下'},origin:'original'},
 {id:'pen-writing',word:'pen',sense:'钢笔；书写用的笔',matches:['钢笔','笔'],
  en:'I borrowed a pen from the receptionist to sign the form.',zh:'我向前台借了一支笔签这张表格。',
  collocation:{en:'borrow a pen',zh:'借一支笔'},origin:'original'},
 {id:'pencil-writing',word:'pencil',sense:'铅笔',matches:['铅笔'],
  en:'Draw the outline with a pencil so you can change it later.',zh:'用铅笔画轮廓，这样之后就能修改。',
  collocation:{en:'with a pencil',zh:'用铅笔'},origin:'original'},
 {id:'coat-clothing',word:'coat',sense:'外套',matches:['外套','大衣'],
  en:'Please hang up your coat on the hook by the door.',zh:'请把外套挂在门边的挂钩上。',
  collocation:{en:'hang up a coat',zh:'挂起外套'},origin:'original'},
 {id:'dress-clothing',word:'dress',sense:'连衣裙（服装）',matches:['连衣裙','女装','服装'],
  en:"She wore a blue dress to her sister's graduation.",zh:'她穿了一件蓝色连衣裙去参加妹妹的毕业典礼。',
  collocation:{en:'wear a dress',zh:'穿连衣裙'},origin:'original'},
 {id:'skirt-clothing',word:'skirt',sense:'裙子；半身裙',matches:['裙子','半身裙','裙'],
  en:'She chose a long skirt for the outdoor concert.',zh:'她选了一条长裙去参加户外音乐会。',
  collocation:{en:'a long skirt',zh:'一条长裙'},origin:'original'},
 {id:'shirt-clothing',word:'shirt',sense:'衬衫',matches:['衬衫'],
  en:'I ironed my shirt before the interview.',zh:'面试前，我熨好了衬衫。',
  collocation:{en:'iron a shirt',zh:'熨衬衫'},origin:'original'},
 {id:'car-vehicle',word:'car',sense:'汽车',matches:['汽车','轿车','车'],
  en:'We travelled by car because the last bus had already left.',zh:'末班公交已经开走了，所以我们开车去。',
  collocation:{en:'travel by car',zh:'乘汽车出行'},origin:'original'},
 {id:'house-home',word:'house',sense:'房子；住宅',matches:['房子','住宅','房屋'],
  en:'They moved into a small house near the station.',zh:'他们搬进了车站附近的一栋小房子。',
  collocation:{en:'move into a house',zh:'搬进一栋房子'},origin:'original'},
 {id:'umbrella-rain',word:'umbrella',sense:'雨伞',matches:['雨伞','伞'],
  en:'I opened my umbrella as soon as the rain started.',zh:'雨一下起来，我就撑开了伞。',
  collocation:{en:'open an umbrella',zh:'撑开雨伞'},origin:'original'},
 {id:'cloakroom-storage',word:'cloakroom',sense:'寄物间；衣帽间',matches:['寄物间','衣帽间'],
  en:'You can leave your coat in the cloakroom while you visit the gallery.',zh:'参观画廊时，你可以把外套寄存在寄物间。',
  collocation:{en:'in the cloakroom',zh:'在寄物间里'},origin:'original'},
 {id:'ticket-travel',word:'ticket',sense:'车票',matches:['车票','票'],
  en:'We bought our train tickets online the night before the trip.',zh:'我们在出发前一晚从网上买好了火车票。',
  collocation:{en:'a train ticket',zh:'一张火车票'},origin:'original'},
 {id:'number-identifier',word:'number',sense:'号码；编号',matches:['号码','编号'],
  en:'Write your phone number at the top of the form.',zh:'把你的电话号码写在表格顶部。',
  collocation:{en:'phone number',zh:'电话号码'},origin:'original'},
 {id:'school-place',word:'school',sense:'学校',matches:['学校'],
  en:'The children walk to school together every morning.',zh:'孩子们每天早上一起步行去学校。',
  collocation:{en:'walk to school',zh:'步行上学'},origin:'original'},
 {id:'teacher-person',word:'teacher',sense:'教师；老师',matches:['教师','老师'],
  en:'Our maths teacher explains each step before we try the problem ourselves.',zh:'数学老师会先讲解每一步，然后让我们自己尝试解题。',
  collocation:{en:'maths teacher',zh:'数学老师'},origin:'original'},
 {id:'son-child',word:'son',sense:'儿子',matches:['儿子'],
  en:'Their young son asks a new question every few minutes.',zh:'他们年幼的儿子每隔几分钟就会问一个新问题。',
  collocation:{en:'young son',zh:'年幼的儿子'},origin:'original'},
 {id:'daughter-child',word:'daughter',sense:'女儿',matches:['女儿'],
  en:'My eldest daughter is choosing a course for next year.',zh:'我的大女儿正在选择明年要上的课程。',
  collocation:{en:'eldest daughter',zh:'大女儿'},origin:'original'},
 {id:'family-people',word:'family',sense:'家庭；家人',matches:['家庭','家人'],
  en:"We have a family meal every Sunday to catch up on everyone's news.",zh:'我们每个星期天都会全家聚餐，聊聊各自的近况。',
  collocation:{en:'a family meal',zh:'家庭聚餐'},origin:'original'},
 {id:'student-learner',word:'student',sense:'学生',matches:['学生'],
  en:'As a university student, I divide my time between lectures and part-time work.',zh:'作为一名大学生，我既要上课，也要做兼职。',
  collocation:{en:'university student',zh:'大学生'},origin:'original'},
 {id:'engineer-profession',word:'engineer',sense:'工程师',matches:['工程师'],
  en:'A civil engineer checked the bridge before it reopened.',zh:'桥梁重新开放前，一位土木工程师进行了检查。',
  collocation:{en:'civil engineer',zh:'土木工程师'},origin:'original'},
 {id:'nurse-profession',word:'nurse',sense:'护士',matches:['护士'],
  en:'A registered nurse showed us how to change the bandage.',zh:'一位注册护士向我们示范了如何更换绷带。',
  collocation:{en:'a registered nurse',zh:'一位注册护士'},origin:'original'},
 {id:'busy-occupied',word:'busy',sense:'忙碌；没空',matches:['忙碌','没空','忙'],
  en:"I'm busy with a report this morning, but I can call you after lunch.",zh:'今天上午我忙着写报告，不过午饭后可以给你打电话。',
  collocation:{en:'busy with a report',zh:'忙着写报告'},origin:'original'},
 {id:'job-position',word:'job',sense:'工作；职业',matches:['工作','职业','职位'],
  en:'She applied for a job at the local library.',zh:'她申请了当地图书馆的一个工作岗位。',
  collocation:{en:'apply for a job',zh:'申请工作'},origin:'original'},
 {id:'name-person',word:'name',sense:'姓名；名字',matches:['姓名','名字'],
  en:'I gave the hotel my full name when I made the reservation.',zh:'预订时，我向酒店报了全名。',
  collocation:{en:'full name',zh:'全名'},origin:'original'},
 {id:'bank-finance',word:'bank',sense:'银行',matches:['银行'],
  en:'I opened a bank account when I started my first job.',zh:'开始第一份工作时，我开了一个银行账户。',
  collocation:{en:'open a bank account',zh:'开一个银行账户'},origin:'original'},
 {id:'bank-riverside',word:'bank',sense:'河岸；堤岸',matches:['河岸','堤岸','岸边','堤','岸'],
  en:'We sat on the river bank and watched the ducks swim past.',zh:'我们坐在河岸上，看着鸭子从身边游过。',
  collocation:{en:'the river bank',zh:'河岸'},origin:'original'},
 {id:'light-illumination',word:'light',sense:'灯光；光线',matches:['灯光','光亮','光线','照明','光','灯'],
  en:'The soft light from the desk lamp made the room feel cosy.',zh:'台灯柔和的光线让房间显得很温馨。',
  collocation:{en:'soft light',zh:'柔和的光线'},origin:'original'},
 {id:'light-weight',word:'light',sense:'轻便；重量轻',matches:['轻便','轻巧','轻的','重量轻','轻'],
  en:'This light jacket fits easily into my backpack.',zh:'这件轻便的夹克很容易放进我的背包里。',
  collocation:{en:'a light jacket',zh:'一件轻便的夹克'},origin:'original'},
 {id:'watch-timepiece',word:'watch',sense:'手表',matches:['手表','腕表'],
  en:'I checked my watch and realised I was ten minutes early.',zh:'我看了一下手表，发现自己早到了十分钟。',
  collocation:{en:'check my watch',zh:'看一下我的手表'},origin:'original'},
 {id:'watch-observe',word:'watch',sense:'观看；注视',matches:['观看','注视','看'],
  en:"We watched a match at a friend's house on Saturday.",zh:'周六，我们在朋友家看了一场比赛。',
  collocation:{en:'watch a match',zh:'观看比赛'},origin:'original'},
 {id:'book-publication',word:'book',sense:'书；书籍',matches:['书籍','书'],
  en:'I borrowed a book about birds from the library.',zh:'我从图书馆借了一本关于鸟类的书。',
  collocation:{en:'borrow a book',zh:'借一本书'},origin:'original'},
 {id:'book-reserve',word:'book',sense:'预订；预约',matches:['预订','预定','预约'],
  en:"Let's book a table for six before the restaurant gets busy.",zh:'趁餐厅还没忙起来，我们先预订一张六人桌吧。',
  collocation:{en:'book a table',zh:'预订餐桌'},origin:'original'},
 {id:'match-competition',word:'match',sense:'比赛',matches:['比赛','竞赛'],
  en:'The football match was delayed because the pitch was too wet.',zh:'球场太湿，足球比赛推迟了。',
  collocation:{en:'a football match',zh:'一场足球比赛'},origin:'original'},
 {id:'match-fire',word:'match',sense:'火柴',matches:['火柴'],
  en:'He struck a match to light the candle.',zh:'他划了一根火柴点燃蜡烛。',
  collocation:{en:'strike a match',zh:'划火柴'},origin:'original'},
 {id:'park-place',word:'park',sense:'公园',matches:['公园'],
  en:'We met in the park for a picnic after work.',zh:'下班后，我们在公园见面，一起野餐。',
  collocation:{en:'in the park',zh:'在公园里'},origin:'original'},
 {id:'park-vehicle',word:'park',sense:'停车',matches:['停车','停放车辆','停放汽车'],
  en:'Please park your car behind the café so the gate stays clear.',zh:'请把车停在咖啡馆后面，以免挡住大门。',
  collocation:{en:'park a car',zh:'停车'},origin:'original'},
];

const normalizeWord=(word:string)=>word.normalize('NFKC').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
const normalizeText=(text:string)=>text.normalize('NFKC').trim();
const meaningTokens=(meaning:string)=>normalizeText(meaning).split(/[,，;；/、\n]+/).map(token=>token.trim().replace(/^(?:(?:\[[^\]\n]{1,24}\]|(?:n|vt|vi|v|adj|a|adv|ad|prep|pron|num|conj|int|interj|aux)\.)\s*)+/i,'').replace(/[。.]$/,'').trim()).filter(Boolean);

export function examplesForMeaning(word:string,meaning:string,query=''):UsageExample[]{
 const headword=normalizeWord(word),tokens=meaningTokens(meaning);
 if(!headword||!tokens.length)return [];
 const candidates=originalVocabularyExamples.filter(example=>normalizeWord(example.word)===headword&&example.matches.some(cue=>{
  const term=normalizeText(cue);
  // One-character cues are whole tokens: 轻 is not 轻浮, 书 is not 书法,
  // and 看 is not 看守. The action 停车 must also not match a place 停车处.
  return [...term].length===1||term==='停车'?tokens.includes(term):tokens.some(token=>token.includes(term));
 }));
 const search=normalizeText(query);
 if((search.match(/[\u3400-\u9fff]/g)||[]).length<2)return candidates;
 const focused=candidates.filter(example=>[example.sense,...example.matches,example.zh,example.collocation.zh].some(text=>normalizeText(text).includes(search)));
 return focused.length?focused:candidates;
}
