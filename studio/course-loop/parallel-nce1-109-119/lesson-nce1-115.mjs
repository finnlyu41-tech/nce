import {author,metadata} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(115,'47827536e71d3384ac4f53d949f441c1530cf9879902a5bc41780cf3d3f0f509','区分人、物和范围','从记录判断问的是人还是物、是否存在、以及是否涵盖所有人；使用复合不定代词并保持单数一致。',['第59–60课some/any与肯否定；第67–68课一般过去时；there is与现在进行时。新词由题内解释，所有场景为虚构。'],[
 {target:'person-thing',title:'问题先分人和物',explanation:'anyone/anybody指人，anything指事物。Is there anyone…?问有没有人；Is there anything…?问有没有物。课文的Can you see anything?与116课的两类there疑问都是未知信息询问；any并非所有问句唯一可能的选择。',example:'Is there anyone in the office? / Is there anything in the bag?',meaning:'办公室有人吗？/包里有东西吗？',check:'看信息缺口是人还是物；there疑问用Is there，句末问号。'},
 {target:'existence-scope',title:'存在一个与一个也没有',explanation:'someone/somebody是有个人但不指名；something是有东西。no one/nobody与nothing本身表达零，不再加not。there is not anyone/anything也能表达零；no one分写，nothing连写。',example:'There is someone in the hall. / There is nothing in the drawer.',meaning:'大厅有个人。/抽屉里什么也没有。',check:'证据是否为零？人用someone/no one，物用something/nothing；不要双重否定。'},
 {target:'everyone-agreement',title:'所有人也配单数动词',explanation:'everyone/everybody表示情境范围内的每个人，指人，作主语用is或动词第三人称单数。everything表示所有事物。116课C把They are all…改写为Everyone is…，必须核对是否真的每个人都如此。Not everyone/not everybody表示并非每个人，不等于no one/nobody（一个也没有）；这是把范围语义与既有否定结构结合的迁移扩展，并非115课录音原句。',example:'Everyone is drawing. / Everybody wants a ticket.',meaning:'每个人都在画画。/每个人都想要一张票。',check:'先核对是否所有人；not everybody是部分不满足，不是无人；everyone/everybody配单数。'}
],[[37.8,45.78,'课文：询问可见事物与零回答'],[64.91,77.87,'课文：something与none的数量区别；配合116课'],[49.22,61.36,'课文：everyone与everybody的单数形式']], '为虚构的展览写一条未知人员问题、一条物品存在或零存在的记录，以及一条确实涵盖全组人的陈述。先列证据，不能把部分人说成所有人。');
const rows=[
 ['虚构动画社：你看不到接待室内部，想知道是否有人。桌椅是否在内不是你的问题。','用Is there开头询问接待室（reception room）有没有人。','Is there anyone in the reception room?',[[ 'Is there anything in the reception room?','anything问物品，信息缺口是人。'],['Are there anyone in the reception room?','anyone在本句按单数处理。'],['There is anyone in the reception room?','题目要求Is there疑问语序。'],['Is there anyone in the kitchen?','问错房间。']],'人员情况未知，所以询问anyone，而不是询问物品。'],
 ['虚构纸偶工坊的抽屉已经逐格检查：没有纸、笔或任何别的物品；走廊里倒是有人。','只报告抽屉（drawer）里的物品，用There is开头。','There is nothing in the drawer.',[['There is no one in the drawer.','no one指人，检查对象是物品。'],['There is something in the drawer.','把零物品变成有物品。'],['There is not nothing in the drawer.','双重否定无法表达本题的零。'],['There is nothing in the hall.','位置变成走廊。']],'零物品用nothing，走廊人员不属于抽屉记录。'],
 ['虚构演讲组共有四名成员，观察卡确认四人此刻全在练习；桌上的四张海报没有人移动。','用Everyone开头，practise（练习）描述组员当前动作。','Everyone is practising.',[['Everyone are practising.','everyone配单数is。'],['Everything is practising.','练习者是人。'],['Everyone is sleeping.','动作与卡片不符。'],['Everyone practises.','本题要求描述当前正在练习，而非习惯。']],'所有四名成员都被覆盖，Everyone is practising保留人和当前过程。'],
 ['虚构摄影棚：你想确认密封袋里是否有物品，人数已经清楚；袋子尚未打开。','用Is there开头问袋子（bag）里有没有东西。','Is there anything in the bag?', [['Is there anyone in the bag?','anyone问人。'],['Are there anything in the bag?','anything需单数is。'],['There is anything in the bag?','缺少疑问倒装。'],['Is there anything in the box?','容器不是箱子。']],'袋内物品未知，用anything询问。'],
 ['虚构舞台排练：门边有一位未辨认身份的人；储物箱为空。你只汇报门边的发现。','用There is开头说明门边（by the door）的发现，不写姓名。','There is someone by the door.',[['There is something by the door.','证据是人，不是东西。'],['There is no one by the door.','将有人反转成没人。'],['There are someone by the door.','someone配单数is。'],['There is someone in the box.','把人放到了空箱子里。']],'有一人而不指名用someone，位置不能被另一条记录干扰。'],
 ['虚构纸艺班：名单上三名学生都说自己想要蓝纸；盒子里每张纸都是白色。','用Everybody、want、blue paper写学生共同的愿望。','Everybody wants blue paper.',[['Everybody want blue paper.','everybody用第三人称单数wants。'],['Everything wants blue paper.','愿望属于学生。'],['Everybody wants white paper.','把实际纸色误当愿望。'],['Nobody wants blue paper.','反转全体学生的愿望。']],'everybody指全部学生，wants保持单数一致。'],
 ['虚构机器人展示的联络单：舞台上是否有人尚未回报；道具是否在台上已确认。你负责补齐人员栏。','向同伴用Is there问舞台（on the stage）的缺失信息，不问道具。','Is there anyone on the stage?', [['Is there anything on the stage?','道具栏已知，缺的是人员栏。'],['Are there anyone on the stage?','anyone配is。'],['Is there someone in the office?','位置不是办公室。'],['There is nobody on the stage.','尚未知晓，不能自行宣布没人。']],'选择人员信息缺口并保留问句，不把已知道具记录再问一遍。'],
 ['虚构棋社搬迁的两张记录：A房间只有棋盘和椅子，全部角落已检查无人员；B房间有一名管理员。你要给搬运员汇报A房间的人员情况。','用There is开头，只写room A的人员记录。','There is no one in room A.',[['There is nothing in room A.','A有棋盘和椅子；问题是人员。'],['There is someone in room A.','管理员在B，A无人。'],['There is not no one in room A.','双重否定反转零人员意思。'],['There is no one in room B.','B有管理员。']],'A有物却无人，no one不能被nothing替换。'],
 ['虚构模型队：观察员分别记录Ari在画画、Bo在画画、Cy在画画；另有一台机器正在打印。你的句子概括三名队员，不概括机器。','用Everyone、draw概括此刻队员活动。','Everyone is drawing.',[['Everyone are drawing.','everyone按单数配is。'],['Everything is drawing.','不能把队员变成所有东西。'],['Everyone is printing.','打印的是机器。'],['Nobody is drawing.','三个人都在画画。']],'逐人记录足以支持Everyone；当前动作是drawing。'],
 ['虚构露天影院的补查单：设备箱重量发生变化，但内容未知；所有演员已签到。你需要问箱中内容。','用Is there开头问设备箱（equipment box）里有没有东西。','Is there anything in the equipment box?', [['Is there anyone in the equipment box?','需要物品信息而非人。'],['Are there anything in the equipment box?','anything配is。'],['There is something in the equipment box.','内容未知，不能把重量变化当确证。'],['Is there anything on the stage?','位置改变。']],'询问未知内容，用anything；签到并未提供箱内内容。'],
 ['虚构书签制作站：透明盒内有一个尚看不清种类的小物件；操作台后无人。','用There is开头，报告盒子（box）内发现，不猜物品名称。','There is something in the box.',[['There is someone in the box.','盒内发现是物，不是人。'],['There is nothing in the box.','已经看见小物件。'],['There are something in the box.','something配is。'],['There is something behind the table.','把位置换成无人操作台后。']],'有未指名物件用something；不能与无人记录混淆。'],
 ['虚构剧本组：三位成员都在读剧本，没有遗漏；道具已全部存放好。','用Everybody、read the script概括正在进行的人员动作。','Everybody is reading the script.',[['Everybody are reading the script.','everybody配单数is。'],['Everything is reading the script.','代词应指人。'],['Everybody is putting away the props.','存放的是另一条已结束的事项。'],['Nobody is reading the script.','全组都在读。']],'所有人当前读剧本，不是道具的状态。'],
 ['虚构天文台参观表：望远镜房人员情况未知，望远镜数量已核对。带队人需要确定是否可以联系房内的人。','用Is there询问望远镜房（telescope room）尚缺的事实。','Is there anyone in the telescope room?', [['Is there anything in the telescope room?','器材情况已知，缺人员。'],['Are there anyone in the telescope room?','anyone配is。'],['There is no one in the telescope room.','没有证据宣布无人。'],['Is there anyone in the garden?','地点不符。']],'联络需求指向人，用anyone询问房内人员。'],
 ['虚构录音馆：检查员完整检查了托盘，盘上无物；隔壁有工程师，柜中有话筒。报告只涉及托盘内容。','用There is开头汇报托盘（tray）。','There is nothing on the tray.',[['There is no one on the tray.','检查的是物品。'],['There is something on the tray.','话筒在柜里，盘上为空。'],['There is not nothing on the tray.','双重否定不表达零。'],['There is nothing in the cupboard.','柜中有话筒。']],'不从别处有物推成托盘有物；盘上零物品用nothing。'],
 ['虚构售票志愿队：五位志愿者各自表示想要休息，来访观众想要地图。只概括志愿队。','用Everyone、want a break写志愿者共同愿望。','Everyone wants a break.',[['Everyone want a break.','everyone用wants。'],['Everything wants a break.','愿望属于人。'],['Everyone wants a map.','地图是观众的愿望。'],['No one wants a break.','反转五人的记录。']],'限定范围是五位志愿者；每人都想休息。'],
 ['虚构布景仓库：全部工人已经离开并确认位置；带班人却不知道柜子里是否放有物品，需要补填物品栏。','用Is there问柜子（cupboard）内的缺失事实。','Is there anything in the cupboard?', [['Is there anyone in the cupboard?','缺失栏是物品。'],['Are there anything in the cupboard?','anything配is。'],['There is nothing in the cupboard.','内容未知不能直接判零。'],['Is there anything in the corridor?','地点不是走廊。']],'人员记录完整，真正的信息缺口是柜中物品。'],
 ['虚构动画片场：监控确认甲大厅里有一位不知姓名的访客；乙大厅全程无人，甲大厅的桌子为空。你给接待员汇报甲大厅人员。','用There is开头，地点写hall A，不猜访客身份。','There is someone in hall A.',[['There is something in hall A.','需要汇报人。'],['There is no one in hall A.','甲厅确有访客。'],['There are someone in hall A.','someone配is。'],['There is someone in hall B.','访客不是在乙厅。']],'人员和位置都要从混合记录中选择。'],
 ['虚构合唱小组只包括Dee、Eli、Fae：Dee与Eli正在等车，Fae正在唱歌；另一个小组的五人全部在等车。只概括这个三人合唱组是否全体都在等车。','用everybody与wait for the bus写这个三人组是否全体都在等车的判断；若属部分否定，把not放句首明确范围，不用可能有歧义的后置not，也不要逐人列名单。','Not everybody is waiting for the bus.',[['Everybody is waiting for the bus.','Fae唱歌，这个组三人并非全在等车。'],['Nobody is waiting for the bus.','Dee与Eli在等车，不能说无人。'],['Not everybody are waiting for the bus.','everybody仍配单数is。'],['Not everybody is singing.','题目所需范围判断关于等车而非唱歌。']],'有两人等待、一人未等待，所以并非人人等车；另一组全体等待不能借给本组。']
];
data.scope+='本组Everyone/Everybody与指人词-one/-body可按同义互换；询问未知存在时也接受自然的some复合词问法。BrE practising与AmE practicing同义。';
data.contentStatus='authored-blind-reviewed';
const questions=author(data,rows).questions;
const alternatives=[
 ['Is there anybody in the reception room?'],
 ['There is not anything in the drawer.',"There isn't anything in the drawer."],
 ['Everybody is practising.',"Everybody's practising."],[],
 ['There is somebody by the door.',"There's somebody by the door."],
 ['Everyone wants blue paper.'],
 ['Is there anybody on the stage?'],
 ['There is nobody in room A.',"There's nobody in room A.",'There is not anyone in room A.',"There isn't anyone in room A.",'There is not anybody in room A.',"There isn't anybody in room A."],
 ['Everybody is drawing.',"Everybody's drawing."],[],[],
 ['Everyone is reading the script.',"Everyone's reading the script."],
 ['Is there anybody in the telescope room?'],
 ['There is not anything on the tray.',"There isn't anything on the tray."],
 ['Everybody wants a break.'],[],
 ['There is somebody in hall A.',"There's somebody in hall A."],
 ['Not everyone is waiting for the bus.',"Not everybody's waiting for the bus.","Not everyone's waiting for the bus."]
];
for(let i=0;i<questions.length;i++){
 questions[i].accepted.push(...alternatives[i]);
 if(questions[i].target==='person-thing'){
  const a=questions[i].accepted[0];
  questions[i].accepted.push(...(a.includes('anyone')?[a.replace('anyone','someone'),a.replace('anyone','somebody')]:[a.replace('anything','something')]));
 }
 if(i===2)questions[i].accepted.push('Everyone is practicing.',"Everyone's practicing.",'Everybody is practicing.',"Everybody's practicing.");
 // Finite surface alternatives for this authored bank, bound by the shared contract.
 questions[i].accepted.push(...questions[i].accepted.filter(s=>s.startsWith('There is ')).map(s=>s.replace('There is ',"There's ")),...questions[i].accepted.filter(s=>/^(Everyone|Everybody) is /.test(s)).map(s=>s.replace(' is ',"'s ")));
}
export const {lesson,byId,questionsFor,matches}=bindContent(data,questions);
export {questions};
