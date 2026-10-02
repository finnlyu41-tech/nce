import type {SampleLesson, SampleMaterial, SampleQuestion} from '../../sample-sequence';

/**
 * Original fictional, single-voice sentence-completion materials.
 * Official format reference: Listening question type 5, completing sentences
 * about information in the recording within the stated word limit.
 * https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening
 * The source-word/no-form-change rule and two-word limit below are explicit
 * instructions for these original tasks, not additional universal IELTS rules.
 * 180 seconds is a local practice budget; synthetic audio is not human-reviewed.
 */
const instruction = 'Complete the sentences. Write NO MORE THAN TWO WORDS for each answer. Use words taken directly from the recording without changing their form.';
const sentence = (id: string, prompt: string, accepted: string[], why: string): SampleQuestion => ({
  id, prompt, accepted, why,
});
const taskContext = (title: string): string => [title, instruction].join('\n');
const checklist = [
  '先读整句，预测空格词性，留意已印出的冠词、修饰语和单复数。',
  '核对完整的原因、用途、条件或归属，不把邻近信息填到另一个关系中。',
  '本组每空最多两个词，保留录音原词的词形；把答案放回句子检查。',
  '订正时保留原答，引用证据说明整句为何成立，并解释附近干扰信息属于什么。',
];
const material = (data: Omit<SampleMaterial, 'instruction' | 'checklist' | 'seconds'>): SampleMaterial => ({
  ...data, instruction, checklist: [...checklist], seconds: 180,
});

const model = material({
  id: 'ielts-l12-model',
  title: '示范 · Pottery workshop',
  context: taskContext('POTTERY WORKSHOP — REASONS AND HANDLING'),
  script: 'Welcome to our pottery workshop. Today we are making small bowls, and I will explain why we prepare the materials in this order. Begin with soft clay because it bends easily when you press the sides; dry sand is for a later decoration activity and cannot hold a bowl shape. Place the finished bowls on wooden boards so they can be moved without touching the wet edges. The metal trays by the sink are for washed tools, not for carrying your work. If a bowl has a crack, leave it on the repair table rather than adding more paint. Finally, keep the unused clay in sealed boxes to prevent it from drying out. The display shelf is for finished pieces that have already dried. Please ask before entering the room.',
  questions: [
    sentence('starting-material', '1. Learners begin with _____ because it bends easily when they press the sides.', ['soft clay', 'clay'], '“Begin with soft clay because it bends easily when you press the sides”同时说明起始材料和易弯曲的原因，soft clay 或 clay 放回句子均成立。“dry sand is for a later decoration activity”且“cannot hold a bowl shape”，沙子属于后续装饰，不能替代这里的材料。',),
    sentence('moving-support', '2. Finished bowls are placed on _____ so they can be moved without touching the wet edges.', ['wooden boards', 'boards'], '“Place the finished bowls on wooden boards so they can be moved without touching the wet edges”支持承托物及移动时不碰湿边的用途，wooden boards 或 boards 都是原文词。“The metal trays by the sink are for washed tools”把托盘归给洗好的工具，后接“not for carrying your work”排除误填 metal trays。',),
    sentence('storage', '3. Unused clay is kept in _____ to prevent it from drying out.', ['sealed boxes', 'boxes'], '“keep the unused clay in sealed boxes to prevent it from drying out”明确储存对象、容器和目的，sealed boxes 或 boxes 均能完成该句。“The display shelf is for finished pieces that have already dried”说明展示架放的是已干成品，不是这里尚未使用的黏土。',),
  ],
  model: '1 soft clay / clay · 2 wooden boards / boards · 3 sealed boxes / boxes',
  modelNotes: [
    '先读三个完整句子。with 和 on 后面需要材料或承托物；第 3 句的 in 后面需要储存容器，不能只搜相同名词。',
    '第 1 句把材料与 because 后的性质一起定位；第 2 句把 bowls、boards 和移动目的连起来；第 3 句核对 unused 与防止变干。',
    '写录音中的词并放回整句。本组接受保留中心名词的 clay、boards、boxes，也接受对应的两词原文形式；不要添加第三个词或改成别的词形。',
    '对照原答解释干扰来源：沙子用于后续装饰，托盘用于工具，展示架用于已干成品。答词附近出现了这些物品，不代表它们满足题句的关系。',
  ],
  hint: '先看空格两侧的语法，再把句中的对象、原因或用途与同一段证据连起来；检查字数和词形。',
});

const guided = material({
  id: 'ielts-l12-guided',
  title: '带着做 · Roof garden',
  context: taskContext('ROOF GARDEN — PURPOSES AND CONDITIONS'),
  script: 'I am going to explain how we care for the roof garden during the school holiday. Use rainwater for the herb beds because it is stored beside them and saves us carrying buckets upstairs. The tap water in the shed is reserved for cleaning tools, so leave that supply alone while watering. When the soil feels damp, delay watering until the surface begins to dry. To stop visitors walking across newly planted areas, place bright ropes around the beds. The paper signs describe the herbs, but they are not the boundary markers. If strong wind is forecast, move the small pots into the greenhouse to protect the young stems. The shaded balcony is useful during hot weather, but it does not block strong wind. Check the noticeboard before leaving.',
  questions: [
    sentence('water-supply', '1. Volunteers water the herb beds with _____ because the supply is stored beside them.', ['rainwater', 'water'], '“Use rainwater for the herb beds because it is stored beside them”把供水对象和就近储存的原因连在一起，rainwater 为明确水源，也接受 water 作为该雨水的宽泛称呼；这不等于选择 tap water。“The tap water in the shed is reserved for cleaning tools”把自来水归给清洁工具，不能因同是水而填 tap water。',),
    sentence('boundary', '2. _____ are placed around the beds to stop visitors walking across newly planted areas.', ['bright ropes', 'ropes', 'boundary markers'], '“To stop visitors walking across newly planted areas, place bright ropes around the beds”直接支持所放物品和阻止穿越的用途，bright ropes、ropes 或 boundary markers 均可完成复数句；后一形式回指实际用于围床的绳索。“The paper signs describe the herbs”说明标牌介绍植物；“they are not the boundary markers”排除将标牌当作此处边界。',),
    sentence('wind-shelter', '3. When strong wind is forecast, the small pots are moved into the _____ to protect the young stems.', ['greenhouse'], '“If strong wind is forecast, move the small pots into the greenhouse to protect the young stems”同时给出触发条件、地点和目的。句中已有 the，填 greenhouse。“The shaded balcony is useful during hot weather”说的是热天，且“does not block strong wind”，不能把这一用途挪到强风条件中。',),
  ],
  hint: '先用空格前后的词预测答案形式，再按顺序核对每句的对象和关系；原因与触发条件不要混在一起。',
});

const independent = material({
  id: 'ielts-l12-independent',
  title: '自己试 · Sky observation',
  context: taskContext('SKY OBSERVATION — MATERIALS, PURPOSES AND CONDITIONS'),
  script: 'Before the evening observation session, I want to explain three arrangements. We will begin our sky drawings with pencils because their marks can be erased when a cloud hides a star. The coloured pens are for adding captions after the drawings are complete. To keep the viewing area dark, switch off the outside lamps before opening the telescope cases. Torches may be used on the path, but keep their beams away from the observers. If low cloud covers the whole sky, the group will meet in the library to compare photographs instead of using the instruments. The hall remains our place for packing equipment. Light rain alone does not decide the location; the tutor will check the cloud cover first. Please carry the cases carefully and leave the entrance clear for people who arrive later.',
  questions: [
    sentence('erasable-tool', '1. The sky drawings are begun with _____ because their marks can be erased.', ['pencils'], '“begin our sky drawings with pencils because their marks can be erased”同时支持工具和可擦除的原因，答案是 pencils。“The coloured pens are for adding captions after the drawings are complete”归于完成后的题注，不能把 coloured pens 填进开始绘图的关系。',),
    sentence('darkness', '2. Before the telescope cases are opened, the _____ are switched off to keep the viewing area dark.', ['outside lamps', 'lamps'], '“To keep the viewing area dark, switch off the outside lamps before opening the telescope cases”支持先后次序、被关闭物品及保持黑暗的目的，outside lamps 或 lamps 均可填。“Torches may be used on the path”说明手电可在路上使用，后文限制光束方向，并没有将它们归为这里要关闭的物品。',),
    sentence('cloud-plan', '3. If low cloud covers the whole sky, the group will meet in the _____ to compare photographs.', ['library'], '“If low cloud covers the whole sky, the group will meet in the library to compare photographs”给出完整条件、地点和活动，句中已有 the，填 library。“The hall remains our place for packing equipment”把大厅归于打包装备；“Light rain alone does not decide the location”也不能改写成只要小雨就启用此安排。',),
  ],
  hint: '读完条件和目的再决定答案；把已印出的冠词留在句中，避免把另一项活动的物品或地点填进来。',
});

const timed = material({
  id: 'ielts-l12-timed',
  title: '训练用限时 · Craft-market orders',
  context: taskContext('MARKET ORDERS — PACKING AND COLLECTION'),
  script: 'I will explain how we prepare textile orders for collection at the craft market. Wrap the dyed scarves in plain tissue to prevent colour from rubbing onto the outer bags. Newspaper is useful for padding empty boxes, but its printing may mark the cloth, so it is not used against the scarves. Orders that need a repair must go to the sewing table before they are wrapped. If a customer has paid in advance, attach a green label so the collection team knows that no payment is needed. Red labels indicate that payment is still due. Finally, store the ready parcels in the cupboard because the sales counter must remain clear for visitors. The open baskets are for fabric scraps, not completed customer orders. Check each name against the collection list before closing the parcel.',
  questions: [
    sentence('wrapping', '1. Dyed scarves are wrapped in _____ to prevent colour from rubbing onto the outer bags.', ['plain tissue', 'tissue'], '“Wrap the dyed scarves in plain tissue to prevent colour from rubbing onto the outer bags”同时支持包装材料和用途，plain tissue 或 tissue 均成立。“Newspaper is useful for padding empty boxes”说的是填充空箱，且“it is not used against the scarves”明确排除报纸贴着围巾的误读。',),
    sentence('paid-marker', '2. If a customer has paid in advance, the order receives a green _____.', ['label'], '“If a customer has paid in advance, attach a green label”支持已付款条件与绿色标记的对应，句中已给 a green，空格填单数 label，不重复修饰语。“Red labels indicate that payment is still due”属于尚待付款的另一状态，不能将其词形 labels 或付款条件挪过来。',),
    sentence('parcel-storage', '3. Ready parcels are stored in the _____ because the sales counter must remain clear for visitors.', ['cupboard'], '“store the ready parcels in the cupboard because the sales counter must remain clear for visitors”同时说明成品包裹存放处和清空柜台的原因，填 cupboard。“The open baskets are for fabric scraps, not completed customer orders”把篮子归给布料碎片，排除将 open baskets 当作成品包裹的存放处。',),
  ],
  hint: '计时中先保留完整首答，再核对每句的条件、目的和语法；空格外已有的词不要重复写入。',
});

const reviewA = material({
  id: 'ielts-l12-review-a',
  title: '隔天新题 · Pond recordings',
  context: taskContext('POND RECORDINGS — SUPPORT, CONDITIONS AND COMPARISON'),
  script: 'Before you start recording animals beside the pond, let me explain our method. Set the camera on a tripod because holding it by hand makes the picture shake. The fence is a useful landmark, but do not rest the camera on it, as people often lean against it. If walkers come close to the recording spot, raise a cloth screen to keep their movement out of the background. A screen is not needed when the path is empty. To compare visits made on different days, write the weather in the notebook alongside each recording name. The temperature reading stays on the separate sensor sheet, so do not copy that number as the description. At the end, return the camera case to the office and leave the tripod folded beside the door.',
  questions: [
    sentence('camera-support', '1. The camera is set on a _____ because holding it by hand makes the picture shake.', ['tripod'], '“Set the camera on a tripod because holding it by hand makes the picture shake”给出承托物及不用手持的原因；句中已有 a，填 tripod。“do not rest the camera on it”中的 it 指前面的 fence，且人常靠着它，不能把围栏的地标作用当成相机承托方案。',),
    sentence('movement-screen', '2. If walkers approach the recording spot, a _____ is raised to keep their movement out of the background.', ['cloth screen', 'screen', 'cloth'], '“If walkers come close to the recording spot, raise a cloth screen to keep their movement out of the background”支持条件、物品和用途，cloth screen、screen 或 cloth 都能接在 a 后；本句也接受 cloth 指该布质遮挡物，不表示任意物品都可替代。“A screen is not needed when the path is empty”排除把这一条件安排理解成每次录制都必须使用；录音未提出另一种遮挡物，不凭经验补词。',),
    sentence('comparison-record', '3. The _____ is written beside each recording name to help compare visits made on different days.', ['weather', 'description'], '“To compare visits made on different days, write the weather in the notebook alongside each recording name”支持记录项目、位置和比较目的，填 weather；也接受 description 回指这里要求写下的天气描述。“The temperature reading stays on the separate sensor sheet”说明温度读数留在另一张表，后接“do not copy that number as the description”，不能将 temperature reading 移到此空。',),
  ],
  hint: '换新情境后仍按整句找证据；尤其检查条件是否满足、代词指谁，以及记录内容属于哪个位置。',
});

const reviewB = material({
  id: 'ielts-l12-review-b',
  title: '下一轮新题 · Radio-play effects',
  context: taskContext('RADIO PLAY — EFFECTS AND SCENE CONDITIONS'),
  script: 'Let me explain the sound effects for our short radio play. To suggest footsteps in snow, squeeze corn starch inside a cloth bag near the microphone. Gravel gives a sharper sound and will be used for the garden path scene instead. When the scene takes place inside a tunnel, add an echo to the recorded voice so the space sounds larger. The music remains quiet during that speech, but it does not create the sense of distance. Finally, use a wooden door to produce the closing sound at the end of the play. A metal door was tested, but its ringing suggested a factory rather than the small cottage in our story. Keep the microphone at the same distance during each test so we can compare the results fairly.',
  questions: [
    sentence('snow-effect', '1. To suggest footsteps in snow, _____ is squeezed inside a cloth bag near the microphone.', ['corn starch', 'starch'], '“To suggest footsteps in snow, squeeze corn starch inside a cloth bag near the microphone”支持材料、动作和所模拟的声音，corn starch 或 starch 均能作该句主语。“Gravel gives a sharper sound”并用于“the garden path scene instead”，碎石属于另一场景，不能因也是脚步声材料就移到雪地效果。',),
    sentence('tunnel-effect', '2. An _____ is added to the recorded voice when a scene takes place inside a tunnel.', ['echo'], '“When the scene takes place inside a tunnel, add an echo to the recorded voice so the space sounds larger”支持隧道条件与所加效果，句中已有 An，填 echo。“The music remains quiet during that speech”描述背景音乐，且“it does not create the sense of distance”，不能把 music 当作所加的空间效果。',),
    sentence('closing-effect', '3. A _____ produces the closing sound at the end of the play.', ['wooden door', 'door'], '“use a wooden door to produce the closing sound at the end of the play”支持器物和结尾用途，wooden door 或 door 都是原文且能接在 A 后。“A metal door was tested”只是曾被测试；其声音“suggested a factory rather than the small cottage”，不符合故事场景，不能把 metal door 当作选定器物。',),
  ],
  hint: '把所模拟的效果、实际使用的物品和场景条件分开；写原词后检查冠词、词数与完整句意。',
});

export const listeningSentenceLesson: SampleLesson = {
  id: 'listening-sentence-completion',
  skill: 'listening',
  title: 'Listening · 听懂关系后补全句子',
  goal: '依据录音中的原因、用途、条件和归属，用符合本组限词要求的原词补全句子。',
  explanation: [
    '先读整句，找出对象、原因、用途或条件。空格附近出现一个名词，不等于这个名词能让整句成立。',
    '用空格前后的冠词、修饰语和动词预测词性与单复数，再沿题号顺序听证据；预测只帮助定位，答案仍要来自录音。',
    '本课每空最多两个词，并要求保留录音原词的词形。填好后放回句中，检查已有词是否被重复，以及关系是否准确。',
    '先看示范的逐句解释，再用方法提示做新题；独立与限时先留下原答。本站按本组列出的合理答案形式核对，订正还要引用证据解释整句和附近干扰信息。',
    '复习换两份不同情境的新材料。查看提示、原文或重播后的答案，要连同辅助条件判断；只记住旧词或重做原题不能说明会完成新句子。',
  ],
  boundary: '六份虚构原创单人说明，每份三句填空，局部练习关系理解与限词输入；不覆盖多人音轨中的说话者辨认。语音由设备合成，尚未人工试听核验，播放后请确认实际听到。每份180秒为本站练习预算，不是正式考试单题时限。这组不是完整听力试卷，也不换算 Band。',
  model,
  guided,
  independent,
  timed,
  reviews: [reviewA, reviewB],
};
