import type {SampleLesson, SampleMaterial} from '../../sample-sequence';

/** Original fictional general-interest passages for local sentence-completion practice. */
function material(value: Omit<SampleMaterial, 'instruction' | 'checklist' | 'seconds'>): SampleMaterial {
  return {
    ...value,
    instruction: 'Complete each sentence with at most two words copied from the passage.',
    seconds: 180,
    checklist: [
      '每空都能指出同一对象、动作或关系的原文依据。',
      '答案逐字取自原文，最多两词；核对单复数和题干已有的冠词。',
      '把答案放回完整句子，再核对意思与语法；本课没有数字或计量单位答案。',
    ],
  };
}

export const academicSentenceLesson: SampleLesson = {
  id: 'reading-sentence-completion', skill: 'reading',
  title: 'Academic · 从原文补全句子',
  goal: '识别句子的同义改写，从一般兴趣短文中取出合乎词数与语法的答案。',
  explanation: [
    '先读填空指令，再看每个完整句子需要补什么。这里每空最多两词，必须取自原文；意思相近的自拟词不能替代原词。',
    'Academic 句子填空按原文信息顺序出题。先定位题干改写对应的句子，核对对象、动作和条件，再从上一题证据后继续找。',
    '读空格前后，检查所需名词、单复数和已有冠词。把所取词语放回句子；若一个修饰语并非必要，仍需确认缩短后保留原意和语法。',
    '示范讲解定位与回填步骤，引导只保留方法。先留下原答，再依据原文订正；提示后的表现与独立、限时及两轮新材料的表现分别看。',
  ],
  boundary: '本站原创、虚构的约 110–170 英文词一般兴趣短文，每份三个句子空。180 秒是局部训练建议；不是正式阅读全卷，篇幅与难度未经专家标定。原答订正和新材料表现不换算 IELTS Band，仍需专家与学习者核验。',
  model: material({
    id: 'ielts-r09-a-model', title: '示范 · 为野花种子入库做准备',
    context: `In a small study of preparing wildflower seeds for storage, researchers brought each sample from the field in a paper envelope. A plastic box was used only for equipment, because mixing samples in that box would have made their origins uncertain. At the laboratory, each envelope received a label showing the collection site. For drying, the team spread seeds on shallow trays in shade. They avoided sunlight: it warmed some trays more than others and made comparisons less reliable. Once the seeds were dry, they passed them through mesh to remove loose pieces of leaf. A brush cleaned the trays afterwards, but was not used to separate the seeds. The experiment focused on preparing samples consistently; it did not compare how well the plants later grew.`,
    questions: [
      {id: 'ielts-r09-a-model-q1', prompt: 'Each seed sample was transported from the field in a _____.', accepted: ['paper envelope', 'envelope'], why: '原文“brought each sample from the field in a paper envelope”对应 transported from the field，问的是样本运输容器。paper envelope 为两词单数名词短语；envelope 一词也明确指同一容器，题干已有 a，不重复冠词。plastic box 装的是 equipment，不能填入。'},
      {id: 'ielts-r09-a-model-q2', prompt: 'During drying, the trays of seeds were kept in _____.', accepted: ['shade'], why: '原文“For drying, the team spread seeds on shallow trays in shade.”对应 during drying 和 were kept，定位干燥时的放置环境。shade 为一词不可数名词，放在已有 in 后成立。sunlight 虽相邻出现，却是团队主动避开的环境；不能改填自拟的 shelter。'},
      {id: 'ielts-r09-a-model-q3', prompt: 'Loose leaf material was separated from the dry seeds using _____.', accepted: ['mesh'], why: '原文“they passed them through mesh to remove loose pieces of leaf”对应 separated 和 loose leaf material，mesh 是用于分离的材料。一词不可数名词可接在 using 后，不加 a 或自行改复数。brush 只在之后清洁托盘，不负责分离种子。'},
    ],
    hint: '分别核对运输、干燥与分离动作；同段出现的另一种器具可能承担不同用途。',
    model: '1. paper envelope（也可 envelope） / 2. shade / 3. mesh',
    modelNotes: [
      '先读 at most two words：每空允许一词或两词，但词语必须在原文出现。观察 a、in、using 后的槽位，预测需要名词或名词短语。',
      '第 1 题把 transported 对回 brought，再核对 sample；取 paper envelope，而不是只凭容器词选择 equipment 使用的 plastic box。envelope 也保留了所问容器。',
      '第 2 题用 during drying 对回 For drying，连读 They avoided sunlight，确认填的是实际位置 shade，而不是被排除的环境。',
      '第 3 题把 separated 对回 remove loose pieces of leaf，取 mesh；之后的 brush 属于清洁托盘。最后回填三句，检查冠词、单复数和词数，并保留订正原因。',
    ],
  }),
  guided: material({
    id: 'ielts-r09-a-guided', title: '带着做 · 折叠地图的设计',
    context: `In an exhibition about journeys, a folding map shows how an ordinary object can respond to practical problems. Its maker added a reinforced backing because repeated folding had torn earlier paper maps along the creases. Metal cases protected maps during transport, but they did not prevent damage at the folds. Routes on the map were distinguished by colours, while small symbols marked camps and water sources. This allowed a traveller to follow a route without confusing it with places to stop. A compass, carried separately, helped the traveller orient the map before setting off. A ruler was useful when estimating distance, but could not show which way the traveller was facing. The exhibit therefore presents the map as part of a small set of tools, each with a different purpose.`,
    questions: [
      {id: 'ielts-r09-a-guided-q1', prompt: 'To protect its creases, the displayed map was fitted with a _____.', accepted: ['reinforced backing', 'backing'], why: '原文“Its maker added a reinforced backing because repeated folding had torn earlier paper maps along the creases.”将 added 改写为 was fitted with，目的仍是保护折痕。reinforced backing 两词或 backing 一词均为单数名词，题干已有 a。metal cases 用于运输保护，原文明说不能防止折痕损伤。'},
      {id: 'ielts-r09-a-guided-q2', prompt: 'Travellers could tell the routes apart by their _____.', accepted: ['colours'], why: '原文“Routes on the map were distinguished by colours”对应 tell the routes apart，回答区分路线的方式。colours 是原文一词复数，接在 their 后保留原词形；不能自行改成单数 colour。symbols 标记营地和水源，作用不同。'},
      {id: 'ielts-r09-a-guided-q3', prompt: 'The traveller used a _____ to position the map correctly before beginning a journey.', accepted: ['compass'], why: '原文“A compass, carried separately, helped the traveller orient the map before setting off.”中 orient 对应 position the map correctly，setting off 对应 beginning a journey。compass 为一词单数名词，接题干已有 a。ruler 用于估算距离，不能确定朝向，也不能用自拟同义词 direction 替代器具名。'},
    ],
    hint: '用题干的目的和动作找对应原句，再核对每种工具的用途；回填时注意空格前的冠词。',
  }),
  independent: material({
    id: 'ielts-r09-a-independent', title: '自己试 · 记录城市中的气味',
    context: `A sensory map of a fictional district recorded experiences that a conventional street plan would miss. Reports came from pedestrians rather than cyclists, because the project wanted accounts from people moving slowly enough to notice brief smells. A powerful but pleasant scent in the main square was traced to a bakery. The food market stood farther away and was not the source of that particular report. Each account also noted the weather when the smell was noticed. The organisers stored comments on the observer's mood elsewhere, since these described a personal response rather than the weather. The finished map used short written descriptions; it contained no sound recordings. Its purpose was to show where particular experiences occurred, not to classify every smell in the whole city as pleasant or unpleasant.`,
    questions: [
      {id: 'ielts-r09-a-independent-q1', prompt: 'The map used reports from _____ rather than people travelling by bicycle.', accepted: ['pedestrians'], why: '原文“Reports came from pedestrians rather than cyclists”对应 used reports from，people travelling by bicycle 是 cyclists 的改写。pedestrians 为一词复数名词，保留原文词形；不能改成不在文中的 walkers。cyclists 是明确未采用的另一组人。'},
      {id: 'ielts-r09-a-independent-q2', prompt: 'The pleasant smell reported in the main square came from a _____.', accepted: ['bakery'], why: '原文“A powerful but pleasant scent in the main square was traced to a bakery.”中 scent 对应 smell，was traced to 对应 came from。bakery 为一词单数名词，题干已有 a。food market 在附近被提及，但原文明说不是该条报告的来源，不能凭食物常识选择它。'},
      {id: 'ielts-r09-a-independent-q3', prompt: 'Each report included details of the _____ at the time the smell was detected.', accepted: ['weather'], why: '原文“Each account also noted the weather when the smell was noticed.”对应 report included details 和 detected。weather 为一词不可数名词，题干已有 the；不改写成未出现的 climate。mood 的评论被 stored ... elsewhere，属于个人反应而非这项现场环境记录。'},
    ],
    hint: '核对报告者、具体来源和记录项目；不要把邻近地点或单独保存的评论归入同一条记录。',
  }),
  timed: material({
    id: 'ielts-r09-a-timed', title: '训练用限时 · 旅行日记与回忆录',
    context: `An exhibition on travel writing compares a daily journal with a memoir written much later. To reconstruct a river crossing, a historian relied on the daily journal, which described where the traveller waited and what could be seen from the boat. A letter from the same journey discussed family news and gave no account of the crossing. The journal also showed revisions in its margins. These changes could reveal uncertainty, whereas the decoration on the cover said little about how the account developed. The later memoir was composed from memory rather than from notes made each day. It offered a smoother story, but that did not make every detail more reliable. Comparing the documents allowed readers to see how the time and purpose of writing affected the account.`,
    questions: [
      {id: 'ielts-r09-a-timed-q1', prompt: 'The historian reconstructed the river crossing mainly using a _____.', accepted: ['daily journal', 'journal'], why: '原文“To reconstruct a river crossing, a historian relied on the daily journal”对应 reconstructed 和 mainly using。daily journal 两词或 journal 一词均指同一份资料，回填时接在题干已有 a 后。letter 只写家庭消息且没有过河记述；memoir 是较晚写成的另一种文本，不能因同属旅行资料就填它。'},
      {id: 'ielts-r09-a-timed-q2', prompt: 'Revisions to the journal appeared in its _____.', accepted: ['margins'], why: '原文“The journal also showed revisions in its margins.”对应 revisions appeared，直接定位修改的位置。margins 是一词复数名词，保留原文形式并接在 its 后；不是单数 margin。cover 的装饰不能说明叙述如何发展，也不是修改出现的位置。'},
      {id: 'ielts-r09-a-timed-q3', prompt: 'The memoir was written from _____ instead of notes recorded each day.', accepted: ['memory'], why: '原文“The later memoir was composed from memory rather than from notes made each day.”中 composed 对应 written，rather than 对应 instead of。memory 为一词不可数用法，放在 from 后成立。notes made each day 是对照中被排除的来源；不能填不在文中的 recollection。'},
    ],
    hint: '先区分几份文本的写作时间与用途；核对空格所问的是来源、位置还是写作依据。',
  }),
  reviews: [
    material({
      id: 'ielts-r09-a-review-a', title: '隔天新题 · 长椅排列与交谈',
      context: `A small observation project examined how the arrangement of public benches affected brief conversations. In one square, benches formed a semicircle, allowing people to face one another without turning their bodies. A nearby square had a straight row of benches, where most people looked towards the road. During the visits, observers sometimes noted bags on empty seats. They counted bags separately from people so that an apparently full bench would not automatically be treated as a gathering. The comparison also had a limitation: the semicircle received more shade during the observation period. A preference for cooler seating might therefore explain part of the difference in use. The report proposed further visits under similar conditions before drawing a firm conclusion about the influence of bench arrangement.`,
      questions: [
        {id: 'ielts-r09-a-review-a-q1', prompt: 'In the first square, people could face each other because the benches formed a _____.', accepted: ['semicircle'], why: '原文“benches formed a semicircle, allowing people to face one another”对应 people could face each other，问第一处长椅的排列形状。semicircle 为一词单数名词，接在题干已有 a 后。straight row 属于 nearby square，不能把相邻场地的形状换进来。'},
        {id: 'ielts-r09-a-review-a-q2', prompt: 'The observers counted _____ occupying seats separately from people.', accepted: ['bags'], why: '原文“They counted bags separately from people”直接写明被单独计数的物件，对应题干 counted ... separately；前句说明这些物件占了空座位。bags 为一词复数名词，可作 counted 的宾语，不能自行改单数 bag。empty seats 是被占的位置，gathering 是可能误判的群聚，都不是单独计数的物件。'},
        {id: 'ielts-r09-a-review-a-q3', prompt: 'One limitation of the comparison was the greater amount of _____ around the curved arrangement.', accepted: ['shade'], why: '原文“the semicircle received more shade during the observation period”对应 greater amount 和 curved arrangement；这里讨论两场地条件不同。shade 为一词不可数名词，适合 amount of 后的槽位。conversations 是研究对象而非这项环境差异；自拟的 shelter 虽近义却不是原文用词。'},
      ],
      hint: '区分两个场地，再辨认观察对象、计数对象与比较的限制；为每空核对完整的前后句。',
    }),
    material({
      id: 'ielts-r09-a-review-b', title: '下一轮新题 · 地名留下的记忆',
      context: `Place names can preserve details that are no longer obvious in a landscape. In a fictional mountain region, a ridge was named after the local birds that once nested there. The river below was associated with fish, but that was the origin of a different name. After the birds disappeared, the older explanation survived in songs that families shared. School textbooks listed the ridge on maps without explaining its name. Later, migration carried the name into another valley, where people used it for a new settlement even though the original nesting ground was far away. The same name therefore appeared in two places for different immediate reasons. A researcher who considered only current conditions would miss the connection between their separate histories.`,
      questions: [
        {id: 'ielts-r09-a-review-b-q1', prompt: 'The ridge took its name from the _____ that once nested there.', accepted: ['local birds', 'birds'], why: '原文“a ridge was named after the local birds that once nested there”对应 took its name from，所问对象是山脊。local birds 两词或 birds 一词均保留该鸟群的含义，题干已有 the，且 that once nested there 已限定对象。fish 与下方河流的另一个地名有关，不能混用。'},
        {id: 'ielts-r09-a-review-b-q2', prompt: 'Families shared _____ in which the old explanation of the ridge name survived.', accepted: ['songs'], why: '原文“the older explanation survived in songs that families shared”对应题干 shared 和 survived，songs 是家庭成员分享、保存这段解释的作品。songs 为一词复数名词，可作 shared 的宾语；不能改写成不在文中的 stories 来作答。School textbooks 只列地图上的山脊而未解释名称，因此不是保存旧解释的媒介。'},
        {id: 'ielts-r09-a-review-b-q3', prompt: 'The name reached another valley through _____.', accepted: ['migration'], why: '原文“Later, migration carried the name into another valley”对应 reached ... through，问名称传播的过程。migration 为一词名词，放在 through 后成立。songs 保存的是旧解释，原文没有说它们把名称带到另一河谷；不能写未出现的 relocation 替代原词。'},
      ],
      hint: '为每个名称标出对应地点；区分名称最初指什么、解释保存在哪里和后来如何传播。',
    }),
  ],
};
