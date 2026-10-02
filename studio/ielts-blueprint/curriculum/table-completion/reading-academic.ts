import type {SampleLesson, SampleMaterial, SampleQuestion} from '../../sample-sequence';

/** Original fictional general-interest articles; their tables are separate structured stimuli. */
const instruction = 'Complete the table below. Choose NO MORE THAN TWO WORDS from the text for each answer.';

function question(id: string, prompt: string, answer: string, why: string): SampleQuestion {
  return {id, prompt, accepted: [answer], why};
}

function material(value: Omit<SampleMaterial, 'instruction' | 'checklist' | 'seconds'>): SampleMaterial {
  return {
    ...value, instruction, seconds: 180,
    checklist: [
      '先核对行标签和栏目，找到同一对象的对应关系。',
      '答案逐字取自文章，每空最多两词，不用自造同义词替换。',
      '把答案放回原表格，核对已给前后词、单复数与词数，不重复格内已有词。',
    ],
  };
}

export const academicTableCompletionLesson: SampleLesson = {
  id: 'reading-table-completion', skill: 'reading', title: 'Academic · 按行列补全表格',
  goal: '依据表格的对象与栏目定位文章关系，取出符合词数和格内语法的来源词。',
  explanation: [
    '这课练 Academic Reading 的取词式表格填空。先读表格的栏目和行标签，分清每格问用途、特征还是使用方式，再回文章找同一对象。',
    '本组每空最多两词，必须取自文章。空格前后已经给出的词不重复抄写；把所取词语填回整格，核对关系、词形和语法。',
    '文章叙述与表格排列可以不同，不能靠相邻答案或题号猜位置。先锁定行中的对象，再按栏目逐格核对；本组不需要填写数字。',
    '示范提供四步讲解，引导只保留方法。留下原答与提示情况，再依据文章订正；独立、限时和两轮新材料分别检查看表与取词的表现。',
  ],
  boundary: '本站原创、虚构的一般兴趣文章，每份约 180–240 英文词，配三行表格和三个填空。180 秒是局部练习预算，不是考场单篇时限；篇幅、难度与练习效果未经专家标定，不代表完整 Academic 阅读覆盖，也不换算 IELTS Band。',
  model: material({
    id: 'ielts-r12-a-model', title: '示范 · 潮池观察的辅助器具',
    context: `A fictional coastal study compared observations of small tidal pools. Researchers needed simple aids that could be carried between sites without disturbing the pool floor. The equipment served different purposes, so using the right object mattered as much as making careful notes.

A marker hoop showed which area was being observed on each visit. It was made from bamboo, which the makers bent into a continuous ring. The hoop remained above the surface and did not scrape the bottom. Its purpose was to mark the same observation area, rather than to hold anything collected from the pool.

A sample paddle had a broad, shallow tip. Researchers used it to lift silt from the pool floor into a separate container. They did not use the marker hoop for this task. The amount lifted was kept small, since the project was intended to examine the pool without clearing a patch of its bottom.

The remaining aid was a viewing hood, open at the bottom. By screening the observer's view, it reduced glare on the water and made the pool easier to examine. It did not scoop from the floor or set the observation boundary. The team recorded which aid had been used, so later readers could distinguish a change in the pool from a difference in the way it was observed.`,
    questions: [
      question('ielts-r12-a-model-q1', "1. Row 'Viewing hood', column 'Purpose': reduces _____ on the water.", 'glare', '原文“it reduced glare on the water”说明 Viewing hood 行的 Purpose，即观察时减少什么。glare 是一词不可数名词，接在格内已有 reduces 后；不重复 on the water。silt 是另一行 Sample paddle 采集的材料；自拟 reflection 不在文章中，不能替换来源词。'),
      question('ielts-r12-a-model-q2', "2. Row 'Marker hoop', column 'Design detail': made from _____.", 'bamboo', '原文“It was made from bamboo”中的 It 回指 marker hoop，正对应该行 Design detail 的材料。bamboo 是一词材料名词，格内已有 made from，不再抄 from。Sample paddle 的 broad, shallow tip 是形状信息，不是这一行器具的制作材料。'),
      question('ielts-r12-a-model-q3', "3. Row 'Sample paddle', column 'Purpose': collects _____ from the pool floor.", 'silt', '原文“Researchers used it to lift silt from the pool floor”回指 Sample paddle，将 lift 改写为 collects，仍问采集对象。silt 是一词不可数名词，放在已有 collects 与 from the pool floor 之间成立。glare 属于 Viewing hood 减少的现象；不能写未出现的 sediment 替代原词。'),
    ],
    hint: '先核对行中的对象，再用栏目判断所问关系；把所取词语放回格内检查已给前后词。',
    model: '1. glare / 2. bamboo / 3. silt',
    modelNotes: [
      '第 1 步：读最多两词且取自文章的指令。先看行与栏目，再读空格前后；三个空分别问用途或制作特征，不是把器具名称再填一次。',
      '第 2 步：第 1 空定位 Viewing hood，再找其用途 reduced glare on the water。取 glare；格内已给 reduces 和 on the water，不重复抄写。',
      '第 3 步：第 2 空核对 Marker hoop 的 made from，取 bamboo；第 3 空核对 Sample paddle 的 lift ... from the pool floor，取 silt。每项都回到自己的行，不把邻近器具的信息移过来。',
      '第 4 步：按表格题号回填三格，核对用途、材料及语法，确认各一词且来自文章。文章次序与表格不同不影响定位；保留原答与每处订正的依据。',
    ],
  }),
  guided: material({
    id: 'ielts-r12-a-guided', title: '带着做 · 展示植物染色过程',
    context: `A fictional craft exhibition showed how plant dyes were tested before being used in larger pieces of work. The display separated the preparation of liquid, the drying of a sample and the recording of its final appearance. Visitors could therefore follow the process without treating every object as a finished artwork.

The drying frame stood beside an open window. It held samples of linen, allowing air to reach the exposed surfaces after they had been dipped. The frame did not contain liquid dye, and its position was chosen for drying rather than for protecting a permanent colour record. Staff noted when a sample had been removed, so visitors could compare stages of the process.

A reference card showed colour after drying. It was kept in shade to avoid strong light changing the appearance that staff wanted to record. The card was not placed on the drying frame, since it served as a record for later comparison rather than as a sample still being prepared.

The demonstration bowl held small batches of liquid dye. Its wooden interior was lined with wax to stop liquid entering the wood. The lining was part of the container, not a substance added to the dye. Visitors could watch a sample being dipped, then follow its movement to the frame and its eventual entry on a card.`,
    questions: [
      question('ielts-r12-a-guided-q1', "1. Row 'Demonstration bowl', column 'Practical detail': lined with _____.", 'wax', '原文“Its wooden interior was lined with wax”对应 Demonstration bowl 行的 Practical detail，问容器内衬。wax 是一词材料名词，格内已有 lined with，不重复介词。linen 属于 Drying frame 上的样品，不是碗的内衬；不能自造 waterproof coating 代替来源词。'),
      question('ielts-r12-a-guided-q2', "2. Row 'Drying frame', column 'Role': holds samples made from _____.", 'linen', '原文“It held samples of linen”中的 It 回指 Drying frame；该行 Role 的 samples made from 明确询问样品材料。linen 是一词材料名词，接在格内已有 made from 后；抄 of linen 会在 from 后多出介词 of，无法补全材料关系。wax 是另一行碗的内衬，不是架上样品。'),
      question('ielts-r12-a-guided-q3', "3. Row 'Reference card', column 'Practical detail': kept in _____.", 'shade', '原文“It was kept in shade”回指 Reference card，说明保存记录的位置条件。shade 是一词不可数名词，格内已有 kept in。open window 是 Drying frame 的位置且有两词，词数合法也不等于对象正确；不能改写成文章未用的 shelter。'),
    ],
    hint: '分清各对象所处阶段，再核对栏目；同一篇文章中的位置、材料和用途不能互换。',
  }),
  independent: material({
    id: 'ielts-r12-a-independent', title: '自己试 · 记录石刻而不搬动原石',
    context: `A fictional research group documented an inscription on a stone that could not be moved safely. Its members wanted a record that showed uncertain marks as well as clear characters. They used several aids because no single view supplied all the information needed for later study.

A mirror stand directed light from the side. This revealed shallow grooves that were difficult to see under even illumination. The stand did not touch the stone, and researchers adjusted it while checking that a bright edge was a real mark rather than an effect of the lighting. A separate photograph recorded the arrangement of the equipment.

Comparison prints showed the inscription under contrasting light. The prints were laid in pairs, so a reader could compare matching areas without turning between pages. The group kept the viewpoint unchanged between the images. Differences in the prints could then be examined without immediately assuming that the stone itself had changed.

A tracing sheet recorded the outline of visible characters. It was applied only to a dry surface, since moisture could move the sheet and spoil the alignment. Researchers left uncertain shapes incomplete instead of supplying lines from expectation. The resulting record could be studied alongside the prints, preserving the distinction between a directly visible feature and a proposed reading of it.`,
    questions: [
      question('ielts-r12-a-independent-q1', "1. Row 'Mirror stand', column 'Information recorded': grooves are _____ in depth.", 'shallow', '原文“This revealed shallow grooves”承接 Mirror stand 的侧向照明，定位该行 Information recorded 的凹槽深浅。shallow 是一词形容词，在格内已有 grooves are 与 in depth 之间作谓语中的表语，说明深浅。dry 描述 Tracing sheet 所用表面的条件，不是这一行凹槽的深浅。'),
      question('ielts-r12-a-independent-q2', "2. Row 'Tracing sheet', column 'Use condition': applied only to a _____ surface.", 'dry', '原文“It was applied only to a dry surface”中的 It 回指 Tracing sheet，完整保留该行 Use condition 的 only 条件。dry 是一词形容词，格内已有 a 和 surface，不能抄 a dry 或 dry surface。Mirror stand 的侧向照明是另一种器具的使用方式，不是表面状态。'),
      question('ielts-r12-a-independent-q3', "3. Row 'Comparison prints', column 'Use condition': the prints were laid _____.", 'in pairs', '原文“The prints were laid in pairs”直接给出 Comparison prints 行的 Use condition。in pairs 为两词完整介词短语，接 laid 后说明摆放方式；只填 in 缺宾语，只填 pairs 缺介词，均不能补全该句。不能改为文章未出现的 side by side，它也超过本组两词限制。'),
    ],
    hint: '先找同一行对象，再核对所问是记录内容还是使用条件；注意空格需要完整词组还是单个修饰词。',
  }),
  timed: material({
    id: 'ielts-r12-a-timed', title: '训练用限时 · 一个影戏展示装置',
    context: `A fictional museum built a small shadow theatre to explain how a moving outline can suggest a character. The display used a simple figure and several supporting parts. Staff wanted visitors to understand the work of each part rather than assume that all movement came from the lamp.

The screen panel softened the light from the lamp before it reached the audience. It stood between lamp and audience, keeping the visible outline separate from the mechanism behind it. The panel did not guide the figure or determine its shape. Staff retained the same lamp during demonstrations so that the explanation of the moving outline would focus on the mechanism rather than a changed setting.

A support rail guided the movement of the figure along the display. It was rubbed with soap to reduce catching as the support moved. The treatment was applied to the rail, not to the screen or the figure. Visitors could watch the mechanism from the side after seeing the shadow from the front.

The cut figure was made from leather and produced the moving silhouette. A joint allowed its position to change without replacing the whole outline. The material remained firm enough for repeated demonstrations while allowing the makers to cut the shape they wanted. By comparing the visible image with the parts behind it, visitors could connect the character's apparent actions with the construction of the device.`,
    questions: [
      question('ielts-r12-a-timed-q1', "1. Row 'Cut figure', column 'Construction or treatment': cut from _____.", 'leather', '原文“The cut figure was made from leather”对应 Cut figure 行的 Construction or treatment；表格用 cut from 表达制作材料。leather 是一词材料名词，格内已有 cut from。soap 是 Support rail 的处理物，不能跨行移作人物材料；不填文章未用的 hide。'),
      question('ielts-r12-a-timed-q2', "2. Row 'Screen panel', column 'Role': softens the _____ from the lamp.", 'light', '原文“The screen panel softened the light from the lamp”正对应 Screen panel 行的 Role。light 是一词不可数名词，表格已给 the 和 from the lamp，不能重复抄 the light。movement 是 Support rail 引导的对象，silhouette 是 Cut figure 产生的形象，都不符合这一行柔化来自灯的什么。'),
      question('ielts-r12-a-timed-q3', "3. Row 'Support rail', column 'Construction or treatment': rubbed with _____.", 'soap', '原文“It was rubbed with soap”中的 It 回指 Support rail，说明该行 Construction or treatment 的处理方式。soap 是一词材料名词，接格内已有 rubbed with 后。leather 是另一行人物材料；自造 lubricant 虽可概括用途，却不是文章来源词。'),
    ],
    hint: '按对象和栏目区分作用与制作处理；核对代词回指，再检查格内已有的介词与冠词。',
  }),
  reviews: [
    material({
      id: 'ielts-r12-a-review-a', title: '隔天新题 · 准备一份鸟鸣录音展品',
      context: `A fictional archive prepared a recording of bird calls for a small exhibition. Staff distinguished the original record from the version visitors would hear and from the written information used to retrieve it. Each object had a different job within the same collection.

The listening copy was adjusted to make the pauses between calls easier to follow. Background noise was reduced, but the sequence was retained so that visitors could hear how separate calls related. Staff stated that this was a prepared version, since a clearer listening experience should not be mistaken for an untouched original recording.

The field reel preserved that original. It was wrapped in felt inside its protective container, reducing contact with the hard interior when the reel was moved. Staff did not use the listening copy as a replacement for this record. They retained it so that later work could return to material before the exhibition adjustments.

An index card described where the recording had been made and how the objects were linked. It was written in pencil, allowing a mistaken description to be corrected without replacing the entire card. Changes were noted separately so that earlier descriptions remained traceable. The card helped a reader find the reel and its listening version without confusing a storage object with a public presentation.`,
      questions: [
        question('ielts-r12-a-review-a-q1', "1. Row 'Field reel', column 'Storage or format': wrapped in _____.", 'felt', '原文“It was wrapped in felt inside its protective container”回指 Field reel，正对应 Storage or format。felt 是一词材料名词，接在格内已有 wrapped in 后。pencil 属于 Index card 的书写材料，不是原始卷轴的包裹物；不能改写为未出现的 fabric。'),
        question('ielts-r12-a-review-a-q2', "2. Row 'Listening copy', column 'Purpose': clarifies the _____ between calls.", 'pauses', '原文“make the pauses between calls easier to follow”描述 Listening copy 的调整目的，对应 clarifies。pauses 是一词复数名词，格内已有 the 和 between calls，不能改为单数或填不在文中的 gaps。Field reel 保留未调整原始资料，而不是用来实现这一公开聆听效果。'),
        question('ielts-r12-a-review-a-q3', "3. Row 'Index card', column 'Storage or format': written in _____.", 'pencil', '原文“It was written in pencil”中的 It 回指 Index card，定位该行 Storage or format 的书写方式。pencil 是一词名词，written in pencil 的格内结构完整。felt 是 Field reel 的包装材料；不能用自拟 graphite 替换文章明确给出的书写词。'),
      ],
      hint: '区分同一项目中不同对象的职责；逐格核对来源句，并保留文章所用的名词形式。',
    }),
    material({
      id: 'ielts-r12-a-review-b', title: '下一轮新题 · 石料标本进入巡展之前',
      context: `A fictional travelling exhibition used small rock samples to show differences in surface appearance. Before the samples entered the cases, staff prepared them through a short sequence of handling stages. The aim was to make comparisons clear while preserving the visible features visitors were meant to examine.

On the sorting mat, staff separated pieces according to their surface appearance. The samples were grouped by hand, allowing workers to inspect each piece rather than rely on a device that treated every shape alike. Colour was described afterwards, but it was not the criterion used at this stage. Uncertain pieces remained separate until someone checked them again.

The receiving tray came earlier in the process. Gentle brushing there removed dust carried with the samples. Staff did not polish the surfaces, since polishing could obscure features that the exhibition intended to show. Work on the tray was completed before samples entered the area where their surfaces would be compared and described.

A separate display sleeve protected each prepared sample during transport. The sleeve prevented scratches when pieces might otherwise touch inside a case. It did not clean a sample or assign it to a group. Staff checked the sleeves before packing, keeping the handling stages distinct so that an apparent difference between rocks would not simply result from how staff had cleaned, sorted or packed them.`,
      questions: [
        question('ielts-r12-a-review-b-q1', "1. Row 'Receiving tray', column 'Main task': removes _____ carried with samples.", 'dust', '原文“Gentle brushing there removed dust carried with the samples”中的 there 回指 Receiving tray，定位 Main task 的清除对象。dust 是一词不可数名词，格内已有 removes 和 carried with samples。scratches 是 Display sleeve 要防止的损伤；不能自造 dirt 代替文章来源词。'),
        question('ielts-r12-a-review-b-q2', "2. Row 'Sorting mat', column 'Handling method': the samples were grouped _____.", 'by hand', '原文“The samples were grouped by hand”说明 Sorting mat 行的 Handling method。by hand 是两词完整介词短语，补在 were grouped 后；只填 by 缺宾语，只填 hand 不能构成该句的处理方式。Receiving tray 的 gentle brushing 属于另一阶段，不是分组方法；不能改填未出现的 manually。'),
        question('ielts-r12-a-review-b-q3', "3. Row 'Display sleeve', column 'Main task': prevents _____ during transport.", 'scratches', '原文“The sleeve prevented scratches when pieces might otherwise touch inside a case.”说明 Display sleeve 的 Main task 与运输时接触的关系。scratches 是一词复数名词，保持原文形式放在 prevents 后。dust 在 Receiving tray 清除；不能写不在文中的 damage 把明确损伤名称泛化。'),
      ],
      hint: '先辨认每行对应的阶段，再核对所问是任务还是处理方式；回填时检查短语是否完整。',
    }),
  ],
};
