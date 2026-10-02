import {author,metadata} from '../parallel-nce1-049-059/authoring.mjs';
import {bindContent} from '../parallel-nce1-025-035/content-contract.mjs';
const data=metadata(63,'805f3cae023f2b7b4773ffb028d5e5ff7b23f6a04dca55845ce3981a4634e01b','直接制止与转述禁令','用否定祈使句直接制止，用must not转述禁止，并区分普通动词第三人称与情态动词原形。',['第61–62课must加原形；第49–60课第三人称-s、does not和can。所有规则为题中虚构规定。'],[
 {target:'negative-command',title:'直接对人说别做',explanation:'Do not/Don’t + 动词原形，是向在场的人发出否定指令。题目若规定直接指令，不另加You或改成第三人称陈述。',example:'Do not open that box.',meaning:'别打开那个盒子。',check:'Do not后用原形，保留指定that/this和动作。'},
 {target:'must-prohibition',title:'禁止不等于没有必要',explanation:'主语 + must not/mustn’t + 原形，表示题中禁止做的动作；must不随人称改变。need not表示没必要，不表示禁止，不能替代。',example:'Visitors must not use this lift.',meaning:'访客不得使用这部电梯。',check:'保留must not的禁止含义，可缩写；后面不加to或第三人称-s。'},
 {target:'person-modal-contrast',title:'换成第三人称时先分结构',explanation:'普通动词he/she用-s，否定用does not加原形；can/must后都用原形，否定仍为cannot/must not。改变人称不应把许可改成习惯，或把习惯改成禁止。',example:'She often walks here. She can sit here.',meaning:'她常在这里散步。她可以在这里坐下。',check:'普通动词看人称；情态动词后保持原形和原有肯否。'}
],[[31.35,34.17,'听祈使句；否定形式参考配套64课练习'],[37.09,42.6,'听must not表达禁止'],[72.84,83.49,'听can许可与must要求对照']], '为虚构活动写一条直接否定指令和一条第三人称禁令；再介绍一位伙伴的习惯或许可。伙伴应核对禁止、许可、习惯有没有混淆。');
const rows=[
 ['拼图比赛中，裁判直接提醒选手别移动这张卡。move this card表示移动这张卡。','不用主语，用Do not和move this card写直接指令。','Do not move this card.',[['Does not move this card.','祈使句用Do not。'],['Do not moves this card.','原形move。'],['Move this card.','丢失否定。'],['Do not move that card.','对象指示改变。']],'直接制止用Do not加原形。'],
 ['虚构演出规定：一位演员Leo不得关掉这盏灯。turn off this lamp表示关掉这盏灯。','以Leo开头，用must not和turn off this lamp写一句。','Leo must not turn off this lamp.',[['Leo must not turns off this lamp.','原形turn。'],['Leo need not turn off this lamp.','没必要不等于禁止。'],['Leo must turn off this lamp.','肯否反转。'],['Leo must not to turn off this lamp.','不加to。']],'保留禁令强度。'],
 ['同伴原话是I often paint here；转述一名女孩的习惯，用she。','用She、often、paint here写一句。','She often paints here.',[['She often paint here.','普通动词需-s。'],['She must paint here.','习惯变为要求。'],['She often paints there.','地点改变。'],['She is often paint here.','多出be。']],'普通动词与情态动词分开。'],
 ['读书活动中，你直接叫对方别合上这本书。close this book表示合上这本书。','不用主语，用Do not和close this book写一句。','Do not close this book.',[['Do not closes this book.','原形close。'],['Does not close this book.','祈使用Do。'],['Do close this book.','否定丢失。'],['Do not open this book.','动作不同。']],'保留动作close。'],
 ['展览明确禁止游客碰这些模型，touch these models表示碰这些模型。','用Visitors、must not、touch these models写一句。','Visitors must not touch these models.',[['Visitors must not touches these models.','原形touch。'],['Visitors do not touch these models.','未表达禁止。'],['Visitors need not touch these models.','没必要不是禁止。'],['Visitors must touch these models.','禁令反转。']],'Visitors复数也用must。'],
 ['一名男孩的许可卡写I can use this desk；你用he转述。','用He、can、use this desk写一句。','He can use this desk.',[['He can uses this desk.','can后原形。'],['He cans use this desk.','can不加-s。'],['He must use this desk.','许可变要求。'],['He cannot use this desk.','许可变禁止。']],'保持许可和原形。'],
 ['舞蹈排练需保持地板上的胶带位置，你直接提醒搭档别拿掉这条胶带。remove this tape表示拿掉这条胶带。','不用主语，以Do not或Don’t开头写remove this tape指令。','Do not remove this tape.',[['Do not removes this tape.','原形remove。'],['You must remove this tape.','禁令反转且不是直接Do not。'],['Do not remove that tape.','对象改变。'],['Do remove this tape.','未否定。']],'新对象的直接指令不需主语。'],
 ['封闭摄影棚的规则：我们不得打开侧门。open the side door表示打开侧门。','用We、must not、open the side door写一句。','We must not open the side door.',[['We must opens the side door.','肯否和原形都错。'],['We need not open the side door.','没必要不表示禁止。'],['We must not to open the side door.','不加to。'],['We must not open the front door.','门改了。']],'禁令和地点均需保存。'],
 ['剪贴活动里女孩原话I do not use glue；用she报告她的习惯。glue表示胶水。','用She、not、use glue，写普通动词否定句。','She does not use glue.',[['She do not use glue.','she需does。'],['She does not uses glue.','does后原形。'],['She must not use glue.','习惯变禁令。'],['She does use glue.','否定丢失。']],'第三人称普通动词否定需does not。'],
 ['上一轮误把否定当肯定。新博物馆任务里直接叫人别写在这张照片上。write on this photo表示在这张照片上写字。','不用主语，用Do not和write on this photo写一句。','Do not write on this photo.',[['Do write on this photo.','否定遗漏。'],['Do not writes on this photo.','原形write。'],['Does not write on this photo.','祈使句不用Does。'],['Do not write on that photo.','指定对象改变。']],'Do not不能漏not。'],
 ['新档案室明令：Ada不得借出这把钥匙。lend this key表示借出这把钥匙。','以Ada开头，用must not、lend this key写一句。','Ada must not lend this key.',[['Ada must not lends this key.','原形lend。'],['Ada must not to lend this key.','不加to。'],['Ada need not lend this key.','没必要并非禁止。'],['Ada must lend this key.','反转禁令。']],'单个人不改变情态动词结构。'],
 ['新人介绍原话I cannot carry this box；你用he转述能力限制。carry this box表示搬这个箱子。','用He、cannot、carry this box写一句。','He cannot carry this box.',[['He cannot carries this box.','cannot后原形。'],['He does not carry this box.','没搬与不能搬不同。'],['He can carry this box.','能力反转。'],['He cannot carry that box.','对象改变。']],'能力限制保留can否定。'],
 ['音效录制开始，你直接提醒对方别关掉这个录音机。turn off this recorder表示关掉这个录音机。','不用主语，用Do not和turn off this recorder写一句。','Do not turn off this recorder.',[['Do not turns off this recorder.','原形turn。'],['Does not turn off this recorder.','直接指令用Do。'],['Do not turn on this recorder.','动作相反。'],['Turn off this recorder.','否定遗漏。']],'on和off改变动作，不能混淆。'],
 ['公园游戏规则：他们不得越过这条线。cross this line表示越过这条线。','用They、must not、cross this line写一句。','They must not cross this line.',[['They must not crosses this line.','原形cross。'],['They need not cross this line.','没必要不是禁止。'],['They must cross this line.','反转规则。'],['They must not cross that line.','对象指示改变。']],'保持规则事实。'],
 ['摄影师原话I always clean the lens；你用she介绍她的日常习惯。clean the lens表示清洁镜头。','用She、always、clean the lens写一句。','She always cleans the lens.',[['She always clean the lens.','第三人称需cleans。'],['She can clean the lens.','习惯变能力。'],['She must clean the lens.','习惯变要求。'],['She always cleans the lamp.','对象改变。']],'一般现在时习惯需-s。'],
 ['静物写生开始，你直接提醒朋友别移动那个椅子。move that chair表示移动那个椅子。','不用主语，用Do not和move that chair写一句。','Do not move that chair.',[['Do not moves that chair.','原形move。'],['Does not move that chair.','祈使Do not。'],['Do move that chair.','没有否定。'],['Do not move this chair.','对象改变。']],'that与否定均不可漏。'],
 ['虚构短剧的合同规定：男主角不得离开房间。leave the room表示离开房间；用he转述。','用He、must not、leave the room写一句。','He must not leave the room.',[['He must not leaves the room.','原形leave。'],['He need not leave the room.','不是禁止。'],['He must leave the room.','反转禁令。'],['He must not to leave the room.','不加to。']],'题目给的禁止不因人称改变。'],
 ['一名男志愿者原话I do not collect tickets；你用he介绍其习惯。collect tickets表示收票。','用He、not、collect tickets写普通动词否定句。','He does not collect tickets.',[['He do not collect tickets.','he需does。'],['He does not collects tickets.','does后原形。'],['He must not collect tickets.','变成禁令。'],['He does collect tickets.','否定丢失。']],'不做的习惯不自动等于禁止。']
];
data.scope+=' Do not、must not和cannot等题内指定词组均允许标准缩写，不要求逐字保留完整形式。';
data.contentStatus='authored-blind-reviewed';
const content=author(data,rows);
for(const q of content.questions)for(const a of [...q.accepted]){
 if(a.startsWith('Do not '))q.accepted.push(a.replace('Do not ',"Don't "));
 if(a.includes('must not '))q.accepted.push(a.replace('must not ',"mustn't "));
 if(a.includes('cannot '))q.accepted.push(a.replace('cannot ','can not '));
 if(a.includes(' often '))q.accepted.push(a.replace(' often ',' ').replace(/\.$/,' often.'),a.replace('She often ','Often, she '),a.replace('She often ','Often she '));
}
export const {lesson,questions,byId,questionsFor,matches}=bindContent(data,content.questions);
