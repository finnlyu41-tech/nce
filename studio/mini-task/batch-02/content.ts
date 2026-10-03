import type {Bank,MiniItem,MiniTask} from '../content';
const banks:Bank[]=['guided','independent','repair','delayed-a','delayed-b'];
const make=(base:Omit<MiniTask,'items'|'calibration'|'level'>,rows:Omit<MiniItem,'id'|'bank'>[]):MiniTask=>({...base,level:'NCE1 第13–24课已教微技能；难度未校准',calibration:'uncalibrated',items:rows.map((row,i)=>({...row,id:`${base.id}:${banks[i]}`,bank:banks[i]}))});
// Original materials for extracting facts and conveying meaning, not grammar scores.
export const batch02Tasks:readonly MiniTask[]=[
 make({id:'mini-n1-13',courseId:'nce1-13',groupId:'NCE1-13',lessons:[13,14],skill:'listening',track:'common',title:'听物主与颜色，补登记信息',teaching:'先看登记表要求的物主和物品，再听对应颜色；不要填另一个人的颜色或问句中的猜测。same colour=相同颜色；grey/gray=灰色。第14课也出现两种颜色，本题会明说词数。声音是本机合成，真人听感未验；完整播放只记材料接触，文字稿记帮助。'},[
  {material:'Ava: My coat is white. Ben: My coat is black.',prompt:'登记 Ben 的 coat（外套）颜色：____。只写一个英文颜色词。',hint:'两个人都说 my coat；听 Ben 那一条，不填 Ava 的颜色。',reference:'black',accepted:['black'],audio:new URL('./audio/mini-n1-13-guided.wav',import.meta.url).href},
  {material:'Mia: Her dress is yellow. Her hat is the same colour.',prompt:'这里 her 明确指同一位朋友。登记她的 hat（帽子）颜色：____。只写一个英文颜色词。',hint:'帽子与裙子是 same colour，回想已说的裙子颜色。',reference:'yellow',accepted:['yellow'],audio:new URL('./audio/mini-n1-13-independent.wav',import.meta.url).href},
  {material:'Leo: His shirt is white. His tie is the same colour.',prompt:'这里 his 明确指同一位朋友。登记他的 tie（领带）颜色：____。只写一个英文颜色词。',hint:'先听shirt（衬衫）的颜色，再把same colour关联到领带；两件物品颜色相同。',reference:'white',accepted:['white'],audio:new URL('./audio/mini-n1-13-repair.wav',import.meta.url).href},
  {material:'Nora: Is your umbrella red? Sam: No. My umbrella is blue.',prompt:'登记 Sam 的 umbrella（伞）最后确认的颜色：____。只写一个英文颜色词。',hint:'先听 No，再听本人确认；提问中猜的颜色不能当结论。',reference:'blue',accepted:['blue'],audio:new URL('./audio/mini-n1-13-delayed-a.wav',import.meta.url).href},
  {material:'Tia: My hat is grey and black. Jo: My coat is green.',prompt:'登记 Tia 的 hat 两种颜色：____。按说出的顺序写“颜色 and 颜色”，共3个英文词；grey/gray均可。',hint:'只取 Tia 的帽子，两种颜色都要保留，不取 Jo 的 coat。',reference:'grey and black',accepted:['grey and black','gray and black'],audio:new URL('./audio/mini-n1-13-delayed-b.wav',import.meta.url).href},
 ]),
 make({id:'mini-n1-15',courseId:'nce1-15',groupId:'NCE1-15',lessons:[15,16],skill:'reading',track:'common',title:'读两人旅客留言，筛选一条事实',teaching:'这些是原创旅客留言，标头给出两位共同说话者。We/Our指该标头的一组人；not是否定。先按问题找那一组，再取事实，别把邻组或否定中的信息记过去。tourists=游客；cases=箱子；passports=护照；Norwegian=挪威的；Swedish=瑞典的。阅读提取不评自由口语或完整雅思阅读能力。'},[
  {material:'Ava and Ben: We are tourists. Our cases are brown.\nMia and Leo: Our cases are green.',prompt:'哪一组的 cases（箱子）是 brown？照抄该组标头，写“名字 and 名字”，共3个英文词。',hint:'先找到 brown 的留言，Our指同一标头下的两个人。',reference:'Ava and Ben',accepted:['Ava and Ben']},
  {material:'Nora and Sam: We are not Swedish. We are Norwegian.\nTia and Jo: We are Swedish.',prompt:'Nora 和 Sam 实际说明的国籍是 ____。照抄一个英文国籍词；不要填被否认的国籍。',hint:'区分 not 后的否认与随后肯定说明，不取另一组。',reference:'Norwegian',accepted:['Norwegian']},
  {material:'Ken and Kim: These are not our cases. Our cases are blue.\nDan and Eva: Our cases are red.',prompt:'Ken 和 Kim 自己的 cases 颜色是 ____。只写一个英文颜色词。',hint:'These are not our cases 否认眼前那些；随后 Our cases 才确认自己的一组。',reference:'blue',accepted:['blue']},
  {material:'Amy and Max: We are not teachers. We are tourists.\nIvy and Tom: We are teachers.',prompt:'Amy 和 Max 在留言里确认的身份是 ____。照抄一个英文词，保留多人词尾。',hint:'not teachers是否认；找他们之后确认的复数身份词。',reference:'tourists',accepted:['tourists']},
  {material:'Rae and Kai: Our passports are green. Our tickets are yellow.\nMay and Joe: Our passports are blue.',prompt:'Rae 和 Kai 的哪种物品是 yellow？照抄一个英文复数物品词。',hint:'同一组也有两种物品，按颜色选物品，不把护照或邻组颜色混入。',reference:'tickets',accepted:['tickets']},
 ]),
 make({id:'mini-n1-17',courseId:'nce1-17',groupId:'NCE1-17',lessons:[17,18],skill:'speaking',track:'common',title:'口头向来访者介绍两位同事',teaching:'这是原创工作场景信息传达。照明确事实介绍两位同事、说明两人的共同职业，再说明或否认状态。They are + 复数职业，不用a/an；否定要保留not。只选本机录音在本页回放，不上传、不持久保存声音；仅保留元数据，刷新需重新选择。文字备选不记口语独立证据；内容与口语质量待人工。'},[
  {material:'来访者面前是两位同事 Ava 和 Ben。他们共同的职业是 teachers（教师），现在 busy（忙）。',prompt:'口头说3句：用名字介绍这两人，说明共同职业，再说明当前状态。',hint:'This is Ava and this is Ben. They are teachers. They are busy.',reference:'This is Ava and this is Ben. They are teachers. They are busy.',accepted:[]},
  {material:'两位同事 Mia 和 Leo 现在在你身边。两人共同的职业是 engineers（工程师），他们现在并不 busy。',prompt:'口头说3句：介绍两人，说明职业，纠正“他们现在很忙”的说法。不编造原因。',hint:'介绍名字后，They are + 复数职业；最后用 are not/aren’t busy。',reference:"This is Mia and this is Leo. They are engineers. They aren't busy.",accepted:[]},
  {material:'两位同事 Nora 和 Sam 刚来到来访者面前。他们共同的职业是 keyboard operators（键盘操作员），两人现在并不 tired（累）。',prompt:'换两位同事，口头介绍名字和职业，再纠正“他们现在很累”的说法，共3句。',hint:'职业有两个词；两个人用 operators，最后用 are not/aren’t tired 保留否定。',reference:"This is Nora and this is Sam. They are keyboard operators. They aren't tired.",accepted:[]},
  {material:'两位同事 Tia 和 Jo 在你身边。他们共同的职业是 sales reps（销售代表），两人现在并不 tired。',prompt:'口头介绍名字和共同职业，再说明两人“不累”，共3句。不把否定改成肯定。',hint:'sales reps是复数职业；最后一句需保留 not 或 aren’t。',reference:"This is Tia and this is Jo. They are sales reps. They aren't tired.",accepted:[]},
  {material:'两位同事 Ken 和 Kim 已来到来访者面前。他们共同的职业是 mechanics（机械师），两人现在 busy。',prompt:'口头介绍两位同事，说明共同职业和当前状态，共3句。自然等义表达可留待人工核对。',hint:'只说题设的名字、共同职业与状态；不根据名字猜性别。',reference:'This is Ken and this is Kim. They are mechanics. They are busy.',accepted:[]},
 ]),
];
