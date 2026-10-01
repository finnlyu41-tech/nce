import type {MultiSelectLesson, MultiSelectMaterial} from './types';

/** Original fictional general-interest passages. No official questions or difficulty claims. */
function material(value: Omit<MultiSelectMaterial, 'seconds' | 'checklist'>): MultiSelectMaterial {
  return {
    ...value, seconds: 180,
    checklist: ['核对题目要求的选择数量与共同焦点。', '每个选项都核对对象、范围、条件和原文依据。', '找到一个正项后继续核完全部选项，再提交完整字母组。'],
  };
}

export const academicMultiSelectLesson: MultiSelectLesson = {
  id: 'reading-multiple-answers', skill: 'reading', variants: ['academic'],
  title: 'Academic · 核对完整多选组',
  goal: '围绕一个问题逐项核验五至六个选项，找齐要求数量的支持项。',
  explanation: [
    '先读 Choose TWO 或 Choose THREE，再确认问题问的是哪项计划、行动、结果或建议。多选组需要全部所选字母，看到一个符合的选项还没有完成。',
    '同义改写可以成立，但每个选项的主体、目的、范围与条件都要一致。部分词语相同，不代表整个选项受支持。',
    '被引用者的提议、另一个项目的作用或尚未说明的安排，不能直接当作题目指定对象的答案。先给所有选项找依据，再检查完整选择数量。',
    '示范显示完整组与依据；引导保留核对方法。独立、限时和两次延迟练习换主题、论述和选项，不靠固定字母位置答题。',
  ],
  boundary: '本站原创、虚构的 100–160 英文词一般兴趣短文，每份仅一个五至六选项的多选组，训练选择两个或三个答案。180 秒是局部建议，不是正式 60 分钟／40 题阅读全卷；篇幅和难度未经专家标定。站内核对完整字母组，不模拟正式卷逐字母计分，不换算 IELTS Band；内容仍待专家与学习者核验。',
  model: material({
    id: 'ielts-r02-a-model', title: '示范 · 海岸鸟类观察记录',
    stimulus: 'A volunteer coastal bird survey has produced records that are difficult to compare. Some observers move between several locations, while others remain in one place. I recommend three changes to the recording method. Observers should return to the same mapped points on each visit. They should also count for the same length of time, rather than stop when they have seen enough birds. Each entry should include the weather at the time of observation. A count made in light rain can still be useful if the conditions are recorded. A visitor officer recommends colourful signs along the walking route to make it more welcoming. Those signs might improve the visitor experience, but they are not a change to the survey recording method.',
    task: {
      id: 'ielts-r02-a-model-selection', selectionCount: 3,
      prompt: 'Choose THREE letters, A-F.\nWhich THREE changes does the writer recommend to make the bird survey records easier to compare?',
      options: [
        {id: 'A', text: 'Returning to the same mapped observation points.', judgment: 'supported', quotes: ['Observers should return to the same mapped points on each visit.'], reason: '每次回到相同标定地点，与同一观察点的改写一致。'},
        {id: 'B', text: 'Removing every count made during rainy weather.', judgment: 'contradicted', quotes: ['A count made in light rain can still be useful if the conditions are recorded.'], reason: '有条件保留小雨记录，与删除所有雨天记录相反；不能把雨天范围全部扩大。'},
        {id: 'C', text: 'Having two volunteers check each other\'s counts.', judgment: 'not-stated', quotes: [], reason: '文中没有说明每次应有两名志愿者或相互核对；谈观察者不等于安排双人复核。'},
        {id: 'D', text: 'Keeping the duration of each count consistent.', judgment: 'supported', quotes: ['They should also count for the same length of time'], reason: 'duration consistent 对应 same length of time，是计数时长一致的近义表达。'},
        {id: 'E', text: 'Adding colourful signs beside the walking route.', judgment: 'different-target', quotes: ['A visitor officer recommends colourful signs along the walking route to make it more welcoming.', 'they are not a change to the survey recording method.'], reason: '标牌是访客工作人员改善游览体验的建议，不是作者为比较调查记录提出的记录方法。'},
        {id: 'F', text: 'Noting weather conditions when the observation is made.', judgment: 'supported', quotes: ['Each entry should include the weather at the time of observation.'], reason: '观察时记录天气，与选项的 noting weather conditions 一致。'},
      ], correctOptionIds: ['A', 'D', 'F'],
    },
    hint: '先确认问题要求改进什么，再分别比较地点、时间、记录内容与其他建议的目的。',
    modelNotes: ['完整组为 A、D、F：同一观察点、同一计数时长、记录当时天气，各有不同原句支持。', 'B 把所有雨天记录一概删除，忽略小雨记录可在注明条件后使用。C 所说双人核对没有对应安排。', 'E 的词确实出现在文中，但属于访客体验建议。找到 A 后仍需核完 B–F，完整组不能只写一个字母。'],
  }),
  guided: material({
    id: 'ielts-r02-a-guided', title: '带着做 · 校园花坛节水试行',
    stimulus: 'University gardeners tried a different watering routine on a group of flower beds. Previously, staff watered them on fixed days, even when the soil was still damp. During the trial, they checked moisture below the surface and watered only when that check showed a need. They also directed water close to the roots instead of spraying it widely over the leaves and path. Watering was still permitted on hot days when the soil needed it; the trial did not impose a complete ban in hot weather. Nearby, a student chemistry team tested whether water from an outdoor outlet was safe to drink. That was a separate project, rather than one of the gardeners\' measures to reduce water use in the trial beds.',
    task: {
      id: 'ielts-r02-a-guided-selection', selectionCount: 2,
      prompt: 'Choose TWO letters, A-E.\nWhich TWO measures did the gardeners use to reduce water use in the trial flower beds?',
      options: [
        {id: 'A', text: 'Testing whether the outdoor water was suitable for drinking.', judgment: 'different-target', quotes: ['a student chemistry team tested whether water from an outdoor outlet was safe to drink.', 'That was a separate project'], reason: '饮水安全检查属于学生化学项目，问题问园丁在试行花坛采取的节水措施。'},
        {id: 'B', text: 'Applying water near the roots rather than over a broad area.', judgment: 'supported', quotes: ['They also directed water close to the roots instead of spraying it widely over the leaves and path.'], reason: 'near the roots 与 close to the roots 对应；rather than a broad area 保留了定点浇水的对比。'},
        {id: 'C', text: 'Stopping all watering whenever the weather was hot.', judgment: 'contradicted', quotes: ['Watering was still permitted on hot days when the soil needed it'], reason: '热天土壤需要时仍可浇水，与所有热天都停水相反；when 的条件不能删掉。'},
        {id: 'D', text: 'Collecting rainwater in underground storage tanks.', judgment: 'not-stated', quotes: [], reason: '原文描述浇水判断与施水方式，没有说明雨水收集、储水罐或地下设施。'},
        {id: 'E', text: 'Using soil moisture to decide when watering was necessary.', judgment: 'supported', quotes: ['they checked moisture below the surface and watered only when that check showed a need.'], reason: '通过土壤湿度决定是否需要浇水，而不是继续固定日期日程。'},
      ], correctOptionIds: ['B', 'E'],
    },
    hint: '给每个行动标出执行者和用途，再核对范围词与条件；不要只看 water 等相同词。',
  }),
  independent: material({
    id: 'ielts-r02-a-independent', title: '自己试 · 档案目录的变化',
    stimulus: 'A local archive has replaced its numerical document list with a digital catalogue that can be searched by subject. Readers no longer need to know a document number before discovering material about a particular topic. The catalogue also flags documents with missing pages, so that gaps are visible before someone requests the original. It does not provide images of every document: many originals still have to be examined in the reading room. A separate image viewer lets readers enlarge the handwriting on a small selection of scanned pages. That viewer serves a different function from the catalogue. Staff revised the descriptions carefully during the change, checking subject labels and page counts against the original documents.',
    task: {
      id: 'ielts-r02-a-independent-selection', selectionCount: 2,
      prompt: 'Choose TWO letters, A-E.\nWhich TWO benefits of the new digital catalogue does the writer identify?',
      options: [
        {id: 'A', text: 'Helping readers find relevant documents without knowing their numbers.', judgment: 'supported', quotes: ['Readers no longer need to know a document number before discovering material about a particular topic.'], reason: '按主题发现材料，不必先知道编号；relevant documents 是 about a particular topic 的改写。'},
        {id: 'B', text: 'Allowing every original document to be studied online.', judgment: 'contradicted', quotes: ['It does not provide images of every document: many originals still have to be examined in the reading room.'], reason: '仍需到阅览室查看许多原件，不能把数字目录扩大成全部原件可在线研究。'},
        {id: 'C', text: 'Making readers aware of incomplete documents before they request them.', judgment: 'supported', quotes: ['The catalogue also flags documents with missing pages, so that gaps are visible before someone requests the original.'], reason: 'incomplete documents 对应 missing pages，选项保留了申请原件之前这一时间条件。'},
        {id: 'D', text: 'Providing enlarged views of handwritten text.', judgment: 'different-target', quotes: ['A separate image viewer lets readers enlarge the handwriting on a small selection of scanned pages.', 'That viewer serves a different function from the catalogue.'], reason: '放大手写字迹属于另一个图像查看器，不是题目问的新目录的功能。'},
        {id: 'E', text: 'Reducing the staff time needed to sort documents.', judgment: 'not-stated', quotes: [], reason: '文中说明了修改目录描述，但未评价整理文档是否省时；不能把改用数字目录直接当作减少工时。'},
      ], correctOptionIds: ['A', 'C'],
    },
    hint: '先明确各项功能属于哪个工具，再核对 every、before 等范围与时间关系。',
  }),
  timed: material({
    id: 'ielts-r02-a-timed', title: '训练用限时 · 屋顶种植区设计',
    stimulus: 'A design team is preparing a rooftop growing area for an education centre. Its plan uses lightweight planting beds with shallow soil, rather than filling the roof with deep, heavy containers. The team will leave a clear route so that maintenance workers can reach the beds without crossing planted areas. Permeable wind screens will protect the exposed edges while allowing some air to pass through. The plan does not open the whole roof to visitors; access will be limited to supervised activities in the growing area. A restaurant on the floor below has a separate proposal for outdoor customer seating on a lower terrace. The growing-area team also wants the space to support practical lessons in which pupils handle plants and discuss how a roof changes their surroundings.',
    task: {
      id: 'ielts-r02-a-timed-selection', selectionCount: 3,
      prompt: 'Choose THREE letters, A-F.\nWhich THREE features does the design team plan for the rooftop growing area?',
      options: [
        {id: 'A', text: 'Making every part of the roof freely accessible to visitors.', judgment: 'contradicted', quotes: ['The plan does not open the whole roof to visitors; access will be limited to supervised activities in the growing area.'], reason: '限定活动与指定区域，不是所有屋顶都可自由进入；freely 和 every 扩大了范围。'},
        {id: 'B', text: 'Providing an unobstructed route for maintenance staff.', judgment: 'supported', quotes: ['The team will leave a clear route so that maintenance workers can reach the beds without crossing planted areas.'], reason: 'unobstructed route 对应 clear route，maintenance staff 对应 maintenance workers。'},
        {id: 'C', text: 'Using lightweight beds with a shallow layer of soil.', judgment: 'supported', quotes: ['Its plan uses lightweight planting beds with shallow soil'], reason: '轻型种植床与浅土层都有原文支持；浅土层不自行扩大成所有容器的外部高度都相同。'},
        {id: 'D', text: 'Adding outdoor seating for restaurant customers.', judgment: 'different-target', quotes: ['A restaurant on the floor below has a separate proposal for outdoor customer seating on a lower terrace.'], reason: '餐厅顾客座位属于楼下较低露台的另一个提案，不是屋顶种植区团队的计划。'},
        {id: 'E', text: 'Using edge screens that reduce wind exposure without stopping all airflow.', judgment: 'supported', quotes: ['Permeable wind screens will protect the exposed edges while allowing some air to pass through.'], reason: '挡风但仍允许部分空气流过，保留 permeable 的条件；不是完全密封。'},
        {id: 'F', text: 'Installing automatic sensors to measure soil moisture.', judgment: 'not-stated', quotes: [], reason: '文章未说明土壤监测设备，更未说明会安装自动湿度传感器；讨论教学用途不能推出设备清单。'},
      ], correctOptionIds: ['B', 'C', 'E'],
    },
    hint: '核对计划主体、所在区域和设计条件，读完全部选项后再检查选择数量。',
  }),
  reviews: [
    material({
      id: 'ielts-r02-a-review-a', title: '隔天新题 · 翻译一首诗',
      stimulus: 'When I translate a poem about a night journey, I begin by identifying its central image. That image should remain recognisable even if the order of words changes in the new language. I would not preserve a rhyme when doing so distorted the meaning. A version can sound neat yet describe a different experience from the original. After drafting, I read the translation aloud to test how its rhythm carries the movement of the journey. This is not a demand for identical sounds in both languages. A publisher has requested a simplified version for young children, but that is a separate commission. The present translation is intended for adult readers interested in the poem\'s imagery and movement.',
      task: {
        id: 'ielts-r02-a-review-a-selection', selectionCount: 2,
        prompt: 'Choose TWO letters, A-E.\nWhich TWO practices does the writer describe for the translation presented?',
        options: [
          {id: 'A', text: 'Preserving every original rhyme even when the meaning changes.', judgment: 'contradicted', quotes: ['I would not preserve a rhyme when doing so distorted the meaning.'], reason: '作者明确拒绝为保韵改变意思；even when 删除了作者的限制。'},
          {id: 'B', text: 'Retaining the main image while allowing changes in word order.', judgment: 'supported', quotes: ['That image should remain recognisable even if the order of words changes in the new language.'], reason: 'main image 对应 central image；改变语序但保留可识别意象，条件一致。'},
          {id: 'C', text: 'Adding an explanatory footnote to every cultural reference.', judgment: 'not-stated', quotes: [], reason: '原文没有说明文化参照的注释方式，也未要求每处都增加脚注。'},
          {id: 'D', text: 'Speaking the draft aloud to examine its rhythm.', judgment: 'supported', quotes: ['After drafting, I read the translation aloud to test how its rhythm carries the movement of the journey.'], reason: '读出草稿检查节奏，与选项的 speaking aloud 和 examine rhythm 是同义表达。'},
          {id: 'E', text: 'Using simplified language specifically for young children.', judgment: 'different-target', quotes: ['A publisher has requested a simplified version for young children, but that is a separate commission.', 'The present translation is intended for adult readers'], reason: '儿童简化版是出版社另一个委托，不是本题指定的成人读者译本。'},
        ], correctOptionIds: ['B', 'D'],
      },
      hint: '先界定本题指定的译本，再逐项比较做法、条件和受众；同义表达也要保留限制。',
    }),
    material({
      id: 'ielts-r02-a-review-b', title: '下一轮新题 · 食物记忆展览',
      stimulus: 'A small exhibition collected residents\' memories of meals eaten with their families. Before display, the team invited contributors to check the written accounts and correct wording that misrepresented what they had said. Different versions of a dish were kept side by side, rather than replaced with one supposedly correct recipe. Some recipes needed changes for public demonstrations using the available kitchen. The team clearly labelled these adapted versions so visitors would not mistake them for the contributors\' original accounts. An events manager proposed cooking workshops to attract more paying visitors; that proposal concerned ticket income rather than the handling of personal memories. The exhibition aimed to present varied experiences honestly, not turn every family account into an approved recipe.',
      task: {
        id: 'ielts-r02-a-review-b-selection', selectionCount: 2,
        prompt: 'Choose TWO letters, A-E.\nWhich TWO steps did the exhibition team take to avoid misrepresenting contributors\' food memories?',
        options: [
          {id: 'A', text: 'Removing accounts that differed from a single accepted recipe.', judgment: 'contradicted', quotes: ['Different versions of a dish were kept side by side, rather than replaced with one supposedly correct recipe.'], reason: '保留并列的不同版本，与删除不符合单一认可食谱的记忆相反。'},
          {id: 'B', text: 'Organising cooking workshops to increase ticket income.', judgment: 'different-target', quotes: ['An events manager proposed cooking workshops to attract more paying visitors; that proposal concerned ticket income rather than the handling of personal memories.'], reason: '这是活动经理为增加票款提出的建议，不是展览团队为避免歪曲个人记忆已采取的措施。'},
          {id: 'C', text: 'Letting contributors check how their own accounts had been written.', judgment: 'supported', quotes: ['the team invited contributors to check the written accounts and correct wording that misrepresented what they had said.'], reason: '让提供者核查记录并修正失真文字，与选项一致；不是由团队替他们认定经历。'},
          {id: 'D', text: 'Having an external historian verify every date in the collection.', judgment: 'not-stated', quotes: [], reason: '原文说明提供者检查自己的记忆记录，没有指定外部历史学家或逐一核实全部日期。'},
          {id: 'E', text: 'Clearly identifying recipes altered for public demonstrations.', judgment: 'supported', quotes: ['The team clearly labelled these adapted versions so visitors would not mistake them for the contributors\' original accounts.'], reason: '明确标注示范用改编，避免被当作提供者原始记忆；altered 对应 adapted。'},
        ], correctOptionIds: ['C', 'E'],
      },
      hint: '区分记录个人记忆的措施与其他活动目的，再核对人物、阶段和完整选项意思。',
    }),
  ],
};
