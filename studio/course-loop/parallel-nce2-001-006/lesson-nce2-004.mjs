import {metadata,content} from './authoring.mjs';
const data=metadata(4,'561741b3b5cbd7dc4189f5778bdd685e999ef73783e5fcb74dfe042c11fd925e','完成、经历与持续到现在','根据现在的结果、旅行是否返回和持续记录表达现在完成时；区分所给选项识别与有限构句。',['能用have/has + 过去分词；认识receive/received、finish/finished、be/been、go/gone和live/lived。'],[
 {target:'present-result',title:'完成结果与尚未完成',explanation:'刚完成用have/has just + 过去分词；已完成可用already；预期动作还没完成用have/has not + 过去分词 + yet。仍在做不能当成已完成。原页65–66把正在发生与刚完成、still与not yet对照；任务中的理由必须来自记录。',example:'The team has not finished the report yet because one section is missing.',meaning:'还有一节缺失，所以团队还没有完成报告。',check:'先判断完成/未完成，再核对have/has、过去分词和just/already/not yet；理由不能倒置。'},
 {target:'experience-location',title:'经历与去向要有返回证据',explanation:'ever/never询问或否定截至现在的经历。has been to可报告去过且已返回；肯定has gone to通常报告去了而尚未返回；never gone abroad是否定出国经历，不能套用肯定去向的未返回解释。原文的has been there for…是持续在某处，不可一看到been就断言回来了；原页67对gone与never been before做经历比较。此处返回/仍外地的两义比较为依据原文而写的文字教学。',example:'Mina has been to Rome, but she is back at home now.',meaning:'米娜去过罗马，现在已回家。',check:'先核对是否去过与是否回来；been there for与been to不是同一条位置证据。'},
 {target:'continuing-duration',title:'for时长与since起点',explanation:'从过去持续到现在用have/has + 过去分词。for后接一段时长；since后接起点。原页64–65的for six months和67的since January提供依据。只知起点不能杜撰时长，只知时长不能杜撰日期。',example:'We have lived here since May.',meaning:'我们从五月起一直住在这里，现在仍住在这里。',check:'确认现在仍持续；for + 时长，since + 起点，不能把已结束记录说成仍持续。'}
],[[15.95,20.73,'LRC原行：just received；already/not yet见原页65–66文字'],[53.81,57.13,'LRC原行：never been abroad before；返回/gone比较为文字派生'],[23.12,26.5,'LRC原行：been there for six months；since见原页67文字']], '写一份本人或明确虚构的近况：一件刚完成或尚未完成的事、一段旅行经历（写清已返回或尚未返回）、一项仍持续的状态及起点/时长；让伙伴核对每条记录的事实和时间。');
const rows=[
 ['文件上传日志：全部文件刚刚上传成功，现在可以关闭窗口。','用We、just、upload、all the files写完成情况。','We have just uploaded all the files.',[['We have not uploaded all the files yet.','日志已全部成功，否定反转结果。'],['We are uploading all the files.','日志是已结束上传，不是正在上传。'],['We has just uploaded all the files.','We对应have。'],['We have just upload all the files.','have后需过去分词uploaded。']],'完成日志支持just完成式。',['We have just uploaded all the files.',"We've just uploaded all the files."]],
 ['Lena去过Madrid，已乘返程车回家；现在与你在家交谈。','用Lena、be to、Madrid写一句已经去过的经历，不加日期。','Lena has been to Madrid.',[['Lena has gone to Madrid.','gone报告尚未返回，与在家冲突。'],['Lena has never been to Madrid.','她实际去过。'],['Lena have been to Madrid.','单个人用has。'],['Lena has been in Madrid for a year.','记录没有在当地持续一年。']],'返回证据让been to适用。',['Lena has been to Madrid.']],
 ['我们从三月入住这间公寓，到现在一直住着；没有搬走。','用We、live here、since、March写一句持续状态。','We have lived here since March.',[['We have lived here for March.','March是起点，不是时长。'],['We lived here in March.','只报告三月往事，漏掉持续至今。'],['We have lived here since three months.','three months是时长而非起点。'],['We have left this flat.','记录说仍住在这里。']],'since把三月起点连接到现在。',['We have lived here since March.',"We've lived here since March.",'Since March, we have lived here.']],
 ['厨房计时器已响；Noah刚刚把面包烤好，现在面包在架上冷却。','用Noah、just、bake、the bread写完成情况。','Noah has just baked the bread.',[['Noah is baking the bread.','面包已出炉，不能继续报告正在烤。'],['Noah has not baked the bread yet.','面包已烤好。'],['Noah have just baked the bread.','Noah用has。'],['Noah has just bake the bread.','完成式需要baked。']],'看现在出炉结果，选择just完成式。',['Noah has just baked the bread.']],
 ['志愿者需要知道对方是否有到过Oslo的经历，答案未知；当面用you问。','用ever、be to、Oslo写一个经历问题。','Have you ever been to Oslo?',[['Have you never been to Oslo?','never问句带否定预设，题目要求中性ever经历问题。'],['Has you ever been to Oslo?','you对应Have。'],['Have you ever gone to Oslo?','任务问访问经历，要求been to；gone不能提供返回经历比较。'],['You have been to Oslo.','未知经历不能直接断言。']],'ever经历问题不预先替别人作答。',['Have you ever been to Oslo?']],
 ['Arun已在这所学校学习两年，现在仍是该校学生；入学月份未给。','用Arun、study at this school、for、two years写持续记录。','Arun has studied at this school for two years.',[['Arun has studied at this school since two years.','since后不是时长。'],['Arun studied at this school two years ago.','变成两年前某次经历，遗漏仍在学。'],['Arun has studied at this school since May.','没有五月这一事实。'],['Arun have studied at this school for two years.','Arun是单数，需has。']],'只知两年就用for，不猜起点。',['Arun has studied at this school for two years.','For two years, Arun has studied at this school.']],
 ['项目交接记录：表格已提交，但报告还缺最后一页。接手人要判断报告能否归档；不要把表格完成当成报告完成。','以We开头，从finish/not finish、the report/the form、already/yet选与记录相符的项目，用because one page is missing连接证据，写一句。','We have not finished the report yet because one page is missing.',[['We have finished the report already because one page is missing.','缺页支持尚未完成，不支持已完成。'],['We have not finished the form yet because one page is missing.','报告和已提交的表格不能混淆。'],['We has not finished the report yet because one page is missing.','We用have。'],['We have not finish the report yet because one page is missing.','完成式需要finished。']],'需选对未完成对象，并把缺页作为证据。',['We have not finished the report yet because one page is missing.',"We haven't finished the report yet because one page is missing."]],
 ['出差看板：Mila周一去了Lyon；刚发来消息“我还在Lyon，明天才回”；她现在不在办公室。','选择符合去向及当前位置证据的一整句。','Mila has gone to Lyon and is still there.',[['Mila has been to Lyon and is back in the office.','已返回与明天才回冲突。'],['Mila has never been to Lyon.','去过且仍在那里。'],['Mila has gone to Lyon and is back in the office.','gone与此处已回办公室的组合违背记录。'],['Mila is going to Lyon tomorrow.','把已发生的外出改成未来计划。']],'这是所给选项的理解识别：现在仍在当地支持gone。',['Mila has gone to Lyon and is still there.'],{options:['Mila has been to Lyon and is back in the office.','Mila has gone to Lyon and is still there.','Mila has never been to Lyon.','Mila is going to Lyon tomorrow.']}],
 ['会员档案写“joined in April”，今天仍有效；没有给今天日期，不能算出几个月。客服需确认持续有效的起点。','用Her membership作主语，从be active/end、for/since、April/six months选符合档案且未杜撰的信息，写一句。','Her membership has been active since April.',[['Her membership has been active for April.','April为起点。'],['Her membership has been active for six months.','没有足够日期算出六个月。'],['Her membership was active in April.','只说当时有效，漏掉今天仍有效。'],['Her membership has ended.','与今天有效冲突。']],'从加入记录提取起点而不编造时长。',['Her membership has been active since April.','Since April, her membership has been active.']],
 ['打印任务出现两个记录：海报已完成；票券任务还在打印，队列未清。你向入口管理员报告票券不能交付的原因。','用The printer作主语，从finish/not finish、the tickets/the poster、already/yet选正确的状态报告，用because the queue is not empty连接证据。','The printer has not finished the tickets yet because the queue is not empty.',[['The printer has already finished the tickets because the queue is not empty.','队列未清不支持完成。'],['The printer has not finished the poster yet because the queue is not empty.','换成已经完成的海报。'],['The printer have not finished the tickets yet because the queue is not empty.','The printer用has。'],['The printer has not finished the tickets yet because the queue is empty.','证据反转为队列已清。']],'修补要读取新的任务和队列，不照抄报告缺页。',['The printer has not finished the tickets yet because the queue is not empty.',"The printer hasn't finished the tickets yet because the queue is not empty.","The printer hasn't finished the tickets yet because the queue isn't empty."]],
 ['Nora的旅行凭证包括去Dublin的票和回程票；她已经回家。同行的Omar仍在Dublin。你只报告Nora，不能套用同行者去向。','用Nora作首分句主语、she作第二分句主语；从be to/go to、Dublin、be back home now/be still there选相符信息，用but连接一句。','Nora has been to Dublin, but she is back home now.',[['Nora has gone to Dublin, but she is still there.','把同行者的位置安在Nora身上。'],['Nora has never been to Dublin, but she is back home now.','两张旅票支持去过。'],['Omar has been to Dublin, but he is back home now.','换人且Omar没返回。'],['Nora have been to Dublin, but she is back home now.','Nora需has。']],'用回程和当前位置证据修补been/gone。',['Nora has been to Dublin, but she is back home now.',"Nora has been to Dublin, but she's back home now."]],
 ['旧任职已结束；新的值班记录显示Ezra从星期一开始负责此门岗，今天仍值班。只报告当前持续的值班。','用Ezra作主语，从be on duty here/go home、for/since、Monday/five years选当前持续记录中的信息，写一句。','Ezra has been on duty here since Monday.',[['Ezra has been on duty here for Monday.','Monday是起点。'],['Ezra was on duty here on Monday.','只说星期一，漏掉持续到今天。'],['Ezra has been on duty here for five years.','旧任职的时长不能转入新值班。'],['Ezra has gone home.','今天仍值班。']],'当前持续记录须与已结束旧任职分开。',['Ezra has been on duty here since Monday.','Since Monday, Ezra has been on duty here.']],
 ['展览开放前检查：墙上的作品都已挂好，不需要再挂；只是门还没打开。管理员问是否还要挂画。','用We作主语，从hang/open、all the pictures/the door、already/yet选已核验项目，再从need to hang them/not need to hang them选下一步，用so连接一句。','We have already hung all the pictures, so we do not need to hang them.',[['We have not hung all the pictures yet, so we need to hang them.','作品全已挂好。'],['We have already opened the door, so we do not need to open it.','门还没开；不能替换任务。'],['We have already hang all the pictures, so we do not need to hang them.','hang过去分词是hung。'],['We have already hung all the pictures, so we need to hang them.','在所给检查记录下结论反转。']],'先读完成清单，再推导无需重复的操作。',['We have already hung all the pictures, so we do not need to hang them.',"We've already hung all the pictures, so we don't need to hang them.",'We have hung all the pictures already, so we do not need to hang them.']],
 ['家族旅行表：Tess从未访问任何外国；下一次出国是计划，还未发生。','以Tess开头，从never/already、be abroad/go abroad、before选可由旅行表支持的截至现在经历，写一句。','Tess has never been abroad before.',[['Tess has already been abroad.','未来计划不算实际经历。'],['Tess has gone abroad.','她尚未出发。'],['Tess has never gone home before.','改成回家的经历。'],['Tess have never been abroad before.','单数Tess需has。']],'延迟题需区分已发生经历与未来计划。',['Tess has never been abroad before.',"Tess hasn't been abroad before."]],
 ['寄养猫的交接记录：这只猫在我们家连续住了三周，今天仍在这里；寄养结束日尚未知。','用The cat、stay with us，从for/since、three weeks/three days选符合交接记录的当前持续表达，写一句。','The cat has stayed with us for three weeks.',[['The cat has stayed with us since three weeks.','since不能接时长。'],['The cat stayed with us three weeks ago.','把连续寄养变成三周前的事件。'],['The cat has stayed with us for three days.','时长不符。'],['The cat has left us.','现在仍在我们家。']],'连续三周且今天仍在是持续证据。',['The cat has stayed with us for three weeks.','For three weeks, the cat has stayed with us.']],
 ['维修状态：所有灯刚刚测完，都能亮；电工可以停止测试。墙面油漆尚未完成，与灯的测试无关。','首分句用The electrician，从just/already/yet、test/paint、all the lights/all the walls选刚完成项目；第二分句用the testing，从be complete/be incomplete选状态，以so连接一句。','The electrician has just tested all the lights, so the testing is complete.',[['The electrician has not tested all the lights yet, so the testing is incomplete.','所有灯测试已结束。'],['The electrician is testing all the lights, so the testing is complete.','仍在测试与全部刚测完的状态不符。'],['The electrician has just painted all the walls, so the painting is complete.','墙面油漆还没完成。'],['The electrician has just test all the lights, so the testing is complete.','需过去分词tested。']],'从测试日志归纳完成结论；不把别的未完项目混入。',['The electrician has just tested all the lights, so the testing is complete.']],
 ['团队定位板：Kai已从Bern旅行回来，现在在本地开会；Sol去Bern后尚未回来。要给来电者报告Sol当前去向。','选择能说明Sol去了并仍未返回的一整句。','Sol has gone to Bern and has not returned yet.',[['Sol has been to Bern and is back here now.','这是Kai的返回状态，不是Sol。'],['Kai has gone to Bern and has not returned yet.','换成已回来的Kai。'],['Sol has never been to Bern.','Sol实际去了Bern。'],['Sol will go to Bern next week.','将已外出说成未来出发。']],'识别题需要同时核对人物和未返回证据。',['Sol has gone to Bern and has not returned yet.'],{options:['Sol has been to Bern and is back here now.','Sol will go to Bern next week.','Sol has gone to Bern and has not returned yet.','Sol has never been to Bern.']}],
 ['服务看板：网络从星期五恢复后一直正常，到现在没有中断；之前停机不计入正常期。','用The connection作主语，从be stable/fail again、for/since、Friday/last year选看板支持的当前连续记录，写一句。','The connection has been stable since Friday.',[['The connection has been stable for Friday.','Friday是恢复起点。'],['The connection was stable on Friday.','遗漏恢复后持续至今。'],['The connection has been stable since last year.','把之前停机时期错误纳入。'],['The connection has failed again.','记录说没有中断。']],'从恢复点切出当前连续状态。',['The connection has been stable since Friday.','Since Friday, the connection has been stable.']]
];

// Root semantic review: finite natural variants independently proposed from no-key stems.
const reviewedVariants={
  "1": [
    "Lena's been to Madrid."
  ],
  "2": [
    "We've lived here since March.",
    "We have been living here since March.",
    "We've been living here since March."
  ],
  "3": [
    "Noah's just baked the bread."
  ],
  "5": [
    "Arun's studied at this school for two years.",
    "Arun has been studying at this school for two years.",
    "Arun's been studying at this school for two years."
  ],
  "6": [
    "We haven't finished the report yet because one page is missing.",
    "We've not finished the report yet because one page is missing."
  ],
  "9": [
    "The printer hasn't finished the tickets yet because the queue is not empty.",
    "The printer's not finished the tickets yet because the queue is not empty."
  ],
  "10": [
    "Nora has been to Dublin but she is back home now.",
    "Nora's been to Dublin, but she is back home now.",
    "Nora has been to Dublin, but she's back home now.",
    "Nora's been to Dublin, but she's back home now.",
    "Nora's been to Dublin but she is back home now.",
    "Nora has been to Dublin but she's back home now.",
    "Nora's been to Dublin but she's back home now."
  ],
  "11": [
    "Ezra's been on duty here since Monday."
  ],
  "12": [
    "We have already hung all the pictures so we do not need to hang them.",
    "We've already hung all the pictures, so we do not need to hang them.",
    "We have already hung all the pictures, so we don't need to hang them.",
    "We've already hung all the pictures, so we don't need to hang them.",
    "We've already hung all the pictures so we don't need to hang them."
  ],
  "13": [
    "Tess's never been abroad before.",
    "Tess has never gone abroad before.",
    "Tess's never gone abroad before."
  ],
  "14": [
    "The cat's stayed with us for three weeks.",
    "The cat has been staying with us for three weeks.",
    "The cat's been staying with us for three weeks."
  ],
  "15": [
    "The electrician has just tested all the lights so the testing is complete.",
    "The electrician's just tested all the lights, so the testing is complete.",
    "The electrician's just tested all the lights so the testing is complete."
  ],
  "17": [
    "The connection's been stable since Friday."
  ]
};
for(const [i,values] of Object.entries(reviewedVariants))rows[Number(i)][5]=[...new Set([...(rows[Number(i)][5]||[rows[Number(i)][2]]),...values])];
// Never gone is a negative experience; finished upload/bake/test never gain progressive results.
data.contentStatus='independent-blind-reviewed-bounded';
export const {lesson,questions,byId,questionsFor,matches}=content(data,rows);
