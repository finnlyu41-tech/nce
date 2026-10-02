import type {SampleLesson, SampleMaterial, SampleQuestion} from '../../sample-sequence';

/**
 * Original fictional matching materials; no official question text is reproduced.
 * Format: IELTS Listening question type 2, shared options and letter answers;
 * questions follow the order of the information in the recording.
 * https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening
 * Reuse depends on the task instructions: British Council strategy, printed page 6, step f.
 * https://takeielts.britishcouncil.org/sites/default/files/2026-06/listening_part_3_matching-classifying_questions_.pdf
 * 180 seconds is a local practice budget. Synthetic audio still needs human listening review.
 */
const abcd = ['A', 'B', 'C', 'D'];
const abcde = ['A', 'B', 'C', 'D', 'E'];
const match = (id: string, prompt: string, letter: string, why: string, options: string[]): SampleQuestion => ({
  id, prompt, options: [...options], accepted: [letter], why,
});
const checklist = [
  '先核对本组字母范围和复用要求，每题只选一个字母。',
  '把证据归到当前题名，分清谁在说、信息属于谁或什么项目。',
  '听完限定、否定或改口后的确认；原文未给出的关系不凭常识补。',
  '订正时保留原答，指出短证据，并说明一个误选项为何被排除。',
];
const material = (data: Omit<SampleMaterial, 'checklist' | 'seconds'>): SampleMaterial => ({
  ...data, checklist: [...checklist], seconds: 180,
});

const model = material({
  id: 'ielts-l03-model',
  title: '示范 · Open-day volunteers',
  instruction: 'What responsibility is assigned to each volunteer? Choose the correct letter, A–D, for questions 1–3. Write ONE letter for each question. You may use any letter more than once.',
  context: [
    'What responsibility is assigned to each volunteer?',
    'Write ONE letter, A–D, for each item. You may use any letter more than once.',
    'OPEN-DAY RESPONSIBILITIES',
    'A  Greeting guests',
    'B  Checking equipment',
    'C  Leading tours',
    'D  Serving refreshments',
  ].join('\n'),
  script: "We need to confirm the volunteers' jobs for Saturday's open day. Nora, your cousin will take visitors around the building, so you do not need to lead a tour. Your job is to stand by the entrance and welcome people as they arrive. Ben, you served tea last year, but the kitchen team will handle refreshments this time. Please test the microphones and speakers before we open; checking the equipment is your responsibility. Priya, I had suggested putting you with Ben. However, we have enough people checking equipment now. You will join Nora at the entrance and greet the guests. Everyone should collect a badge from the office before taking up their position.",
  questions: [
    match('nora', '1. Nora', 'A', '对 Nora 的确认是“welcome people as they arrive”，对应迎接来宾 A。C 的带领参观属于“your cousin”；“you do not need to lead a tour”明确排除 Nora 负责导览，不能把亲属的职责归给她。', abcd),
    match('ben', '2. Ben', 'B', '对 Ben 的当前安排是“checking the equipment is your responsibility”，所以选 B。“you served tea last year”是去年的工作；今年“the kitchen team will handle refreshments”，D 属于厨房团队，不能沿用旧安排。', abcd),
    match('priya', '3. Priya', 'A', 'Priya 最终被安排“join Nora at the entrance and greet the guests”，对应 A。“I had suggested putting you with Ben”只是先前提议；随后“we have enough people checking equipment now”说明不再需要她做 B。指令允许字母重复，A 可以再次使用。', abcd),
  ],
  model: '1 A · 2 B · 3 A',
  modelNotes: [
    '先读共享名单：这是把人配到职责。指令允许复用字母，不要求三个人各占不同选项。',
    '按 Nora、Ben、Priya 的出现顺序追踪。先判断职责属于本人、亲属还是另一个团队，再看确认句。',
    'Nora 的 welcome people 对应 Greeting guests；Ben 的 equipment 由 responsibility 确认；Priya 的先前提议要跟到 However 后的最终安排。',
    '写出 A、B、A 后逐题解释干扰来源：亲属的导览、去年的服务和被撤回的提议都不能当作当前职责。',
  ],
  hint: '先分清人物与职责的归属，再跟住提议、过去安排和当前确认之间的变化；按本组指令检查字母是否可复用。',
});

const guided = material({
  id: 'ielts-l03-guided',
  title: '带着做 · Theatre deliveries',
  instruction: 'How will each item be transported? Choose the correct letter, A–E, for questions 1–3. Write ONE letter for each question. You may use any letter more than once.',
  context: [
    'How will each item be transported?',
    'Write ONE letter, A–E, for each item. You may use any letter more than once.',
    'TRANSPORT ARRANGEMENTS',
    'A  Bicycle courier',
    'B  Van collection',
    'C  Train freight',
    'D  Customer collection',
    'E  Postal delivery',
  ].join('\n'),
  script: 'Let me explain how the theatre supplies will reach their destinations tomorrow. The poster boxes are light enough for a bicycle courier, but there are too many for one bicycle. We have booked a van to collect all those boxes from the studio. For the costume cases, the railway company offered space on a freight service. However, the customer needs them before noon and will pick them up herself, so leave the cases at reception. Finally, the lighting stands cannot go through the post because of their length. Our driver will collect them in the same van as the posters. Please attach the destination labels tonight, and keep all three consignments dry.',
  questions: [
    match('poster-boxes', '1. Poster boxes', 'B', 'Poster boxes 的确定安排是“booked a van to collect all those boxes”，对应 B。A 虽在“light enough for a bicycle courier”中出现，但随后“too many for one bicycle”排除了自行车运输；不能只听见 courier 就选。', abcde),
    match('costume-cases', '2. Costume cases', 'D', 'Costume cases 最终由“the customer”安排“pick them up herself”，明确是客户自行取件 D。C 的“offered space on a freight service”只是铁路公司的提议；However 后的取件决定才是本次实际安排。', abcde),
    match('lighting-stands', '3. Lighting stands', 'B', 'Lighting stands 的确认是“collect them in the same van as the posters”，对应 B。“cannot go through the post because of their length”明确排除 E。这里的 them 指当前的灯架；指令允许 B 与第 1 题复用。', abcde),
  ],
  hint: '每听到一个项目名，就跟住它的运输安排；把可行性、别人提出的方案和已经确定的做法分开。',
});

const independent = material({
  id: 'ielts-l03-independent',
  title: '自己试 · Museum displays',
  instruction: 'How will each invention be presented? Choose the correct letter, A–E, for questions 1–3. Write ONE letter for each question. You may use each letter once only.',
  context: [
    'How will each invention be presented?',
    'Write ONE letter, A–E, for each item. You may use each letter once only.',
    'DISPLAY METHODS',
    'A  Recorded interview',
    'B  Photo sequence',
    'C  Working model',
    'D  Written timeline',
    'E  Live demonstration',
  ].join('\n'),
  script: 'The museum team has agreed how to present the three inventions in our new display. For the weather station, we have photographs of every version, but visitors need to follow the dates of the changes. We will show those stages on a written timeline instead. The harbour lights will be explained through an audio interview with a retired keeper. His recorded memories are already edited; he will not be at the museum to give a demonstration. For the orchard machine, the original mechanism is too large to move. A small model that actually works will show how it sorts the fruit. We considered adding more photographs, but the model will be the main feature.',
  questions: [
    match('weather-station', '1. Weather station', 'D', 'Weather station 将“show those stages on a written timeline instead”，所以选 D。B 的照片虽然已有，“photographs of every version”后却转向让访客跟随日期，并用 instead 确认时间线；有照片不等于选定照片序列。', abcde),
    match('harbour-lights', '2. Harbour lights', 'A', 'Harbour lights 通过“an audio interview with a retired keeper”呈现，且“His recorded memories are already edited”，支持已录好的访谈 A。“he will not be at the museum to give a demonstration”排除 E 的现场演示，不能把受访者当作现场讲解员。', abcde),
    match('orchard-machine', '3. Orchard machine', 'C', 'Orchard machine 的展示用“A small model that actually works”，所以是可运作模型 C。B 的“adding more photographs”仅被考虑，随后“the model will be the main feature”确认最终主要展示方式。不能从原装置太大推断一个未说明的方案。', abcde),
  ],
  hint: '先读清展示方式之间的区别，听到每件展品后判断哪些内容只是已有素材或考虑中的方案，哪些是确认的展示方式。',
});

const timed = material({
  id: 'ielts-l03-timed',
  title: '训练用限时 · Guest-house feedback',
  instruction: 'Which problem still needs action at each guest house? Choose the correct letter, A–E, for questions 1–3. Write ONE letter for each question. You may use any letter more than once.',
  context: [
    'Which problem still needs action at each guest house?',
    'Write ONE letter, A–E, for each item. You may use any letter more than once.',
    'PROBLEMS',
    'A  Noise at night',
    'B  Poor room lighting',
    'C  Slow internet',
    'D  Unclear arrival instructions',
    'E  Missing kitchen equipment',
  ].join('\n'),
  script: 'I have summarised the comments about our three guest houses. At Willow House, one visitor initially reported that the wireless connection was slow. That was fixed during the stay. The complaint still needing action is that the shared kitchen has no pans, although plates are provided. At Cedar Lodge, the rooms are bright, but guests cannot sleep because delivery trucks stop outside after midnight. Adding lamps would not solve that problem. Bay Rooms has a complete kitchen and a quiet location. Its visitors kept phoning because the reservation email did not explain how to collect the keys. We need clearer instructions in that message before the next group arrives.',
  questions: [
    match('willow-house', '1. Willow House', 'E', 'Willow House 仍待解决的是“the shared kitchen has no pans”，对应缺少厨房器具 E。C 的“wireless connection was slow”是最初的投诉，随后“That was fixed during the stay”说明已解决；题目问仍需处理的问题。', abcde),
    match('cedar-lodge', '2. Cedar Lodge', 'A', 'Cedar Lodge 的客人“cannot sleep because delivery trucks stop outside after midnight”，对应夜间噪声 A。B 被“the rooms are bright”及“Adding lamps would not solve that problem”排除；不能因听到 lamps 就误判照明不足。', abcde),
    match('bay-rooms', '3. Bay Rooms', 'D', 'Bay Rooms 的“reservation email did not explain how to collect the keys”导致访客反复打电话，属于到店指引不清 D。E 被“a complete kitchen”排除，A 被“a quiet location”排除；不能把前两家住宿的问题搬到这里。', abcde),
  ],
  hint: '按住宿名称跟踪反馈，区分已经处理的情况与仍需行动的问题；把原因和建议的措施一起核对。',
});

const reviewA = material({
  id: 'ielts-l03-review-a',
  title: '隔天新题 · Research support',
  instruction: 'Which support service does the tutor recommend to each student? Choose the correct letter, A–E, for questions 1–3. Write ONE letter for each question. You may use any letter more than once.',
  context: [
    'Which support service does the tutor recommend to each student?',
    'Write ONE letter, A–E, for each item. You may use any letter more than once.',
    'SUPPORT SERVICES',
    'A  Library reference desk',
    'B  Statistics drop-in',
    'C  Writing workshop',
    'D  Equipment loan desk',
    'E  Careers adviser',
  ].join('\n'),
  script: "Here is the next step I recommend for each of you before Friday's project meeting. Salma, you have already found enough background reading, so another visit to the library reference desk is unnecessary. You are unsure how to compare your survey results; take the figures to the statistics drop-in. Leo, your calculations are sound. The difficulty is explaining the findings in a clear paragraph, so book the writing workshop rather than asking for help with the numbers. Mina, your recorder is working, and you do not need replacement equipment. You need to decide whether the difference between your two groups is meaningful. The statistics drop-in can help you make that judgment.",
  questions: [
    match('salma', '1. Salma', 'B', '导师对 Salma 的建议是“take the figures to the statistics drop-in”，所以选 B。A 虽被提到，但“already found enough background reading”说明已有足够背景文献，另访参考咨询台被明确说成“unnecessary”。', abcde),
    match('leo', '2. Leo', 'C', 'Leo 需要“explaining the findings in a clear paragraph”，导师明确让他“book the writing workshop”，对应 C。“your calculations are sound”排除把数值计算当作当前困难；“rather than asking for help with the numbers”也排除了 B 作为本次建议。', abcde),
    match('mina', '3. Mina', 'B', 'Mina 要判断两组差异是否有意义，导师确认“The statistics drop-in can help you make that judgment”，对应 B。D 被“your recorder is working”及“you do not need replacement equipment”排除。E 未有建议依据，不能从项目会议推测职业咨询；指令允许 B 复用。', abcde),
  ],
  hint: '把每位学生当前的困难与导师建议对应起来，区分已经具备的条件和下一步需要的帮助；没有建议依据的服务不猜。',
});

const reviewB = material({
  id: 'ielts-l03-review-b',
  title: '下一轮新题 · Salvaged materials',
  instruction: 'What will each salvaged material be used to make? Choose the correct letter, A–D, for questions 1–3. Write ONE letter for each question. You may use each letter once only.',
  context: [
    'What will each salvaged material be used to make?',
    'Write ONE letter, A–D, for each item. You may use each letter once only.',
    'NEW USES',
    'A  Acoustic panels',
    'B  Seating',
    'C  Plant containers',
    'D  Display shelves',
  ].join('\n'),
  script: 'The workshop has decided on new uses for the salvaged materials, and I will describe them in the order they arrive. The short beams looked suitable for display shelves, but they are too thick for our wall brackets. We will join them to make benches for the courtyard. The copper pipes will not form frames for those benches. Instead, we will close one end of each wide pipe, stand it upright and fill it with soil for small plants. Finally, the slate tiles were tested as sound barriers, but they did not reduce the noise. We will fit them onto the existing shelf frames to hold the pottery display.',
  questions: [
    match('short-beams', '1. Short beams', 'B', 'Short beams 最终会“join them to make benches for the courtyard”，长凳属于座位 B。D 的展示架只是最初觉得合适的用途；“too thick for our wall brackets”说明不能用于这里的墙架，不能停在第一句作答。', abcd),
    match('copper-pipes', '2. Copper pipes', 'C', 'Copper pipes 会封住一端、竖起并“fill it with soil for small plants”，这些用途共同支持花盆容器 C。“will not form frames for those benches”明确排除 B；前一题的长凳不能误归到铜管。', abcd),
    match('slate-tiles', '3. Slate tiles', 'D', 'Slate tiles 将“fit them onto the existing shelf frames to hold the pottery display”，所以对应展示架 D。A 的隔音用途虽经过测试，但“they did not reduce the noise”排除其作为选定用途； tested 不等于最终采用。', abcd),
  ],
  hint: '听到每种材料后跟到用途的最终决定；先前设想、测试结果和采用方案要分清，并按本组指令检查字母使用次数。',
});

export const listeningMatchingLesson: SampleLesson = {
  id: 'listening-matching',
  skill: 'listening',
  title: 'Listening · 共享名单配对',
  goal: '听清信息归属与最终确认，从共享名单中选出每项对应的字母。',
  explanation: [
    '先读共享名单，分清要把人、物或地点配到哪种关系，再看题名。题号顺着录音信息出现的顺序。',
    '每题只选一个字母；能否复用按本组指令判断，不把所有配对都当成一一对应。',
    '跟住信息属于谁或哪个项目。把同义表达、否定、提议和最后决定一起核对，听见一个选项词还不能确定答案。',
    '先看示范和教练步骤；引导保留方法提示，独立与限时换新材料，先提交原答。订正时对照原答指出证据归属和误选理由。',
    '复习用两份新材料回想方法；查看提示、原文或重播后的作答，要连同辅助条件判断。只记字母或重做原题不能说明会做新题。',
  ],
  boundary: '六份虚构原创单人说明，每份三题，练共享名单配对，尚不足以验证多人对话中的换人辨认。语音由设备合成，声音尚待人工核验；播放后请确认实际听到。每份180秒为本站练习建议，不是正式考试单题时限。不能代替完整听力或换算 Band。',
  model,
  guided,
  independent,
  timed,
  reviews: [reviewA, reviewB],
};
