import type {SampleLesson, SampleMaterial, SampleQuestion} from '../../sample-sequence';

/**
 * Original fictional single-voice materials, with three independent choices per question.
 * Format reference: IELTS Listening question type 1, one answer from three choices;
 * questions follow the information order in the recording.
 * https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening
 * No official questions or scripts are reproduced. 90–110 words is an authoring
 * target, not a verified speech duration. 180 seconds is a local practice budget.
 * Device speech and playback completeness still require human listening review.
 */
type ChoiceTask = {question: SampleQuestion; texts: [string, string, string]};
type AuthoredMaterial = Omit<SampleMaterial, 'instruction' | 'context' | 'questions' | 'checklist' | 'seconds'> & {
  sheetTitle: string;
  tasks: ChoiceTask[];
};
const letters = ['A', 'B', 'C'];
const instruction = 'Choose ONE answer, A, B or C, for each question. Select the correct letter.';
const choice = (id: string, prompt: string, texts: [string, string, string], answer: 'A' | 'B' | 'C', why: string): ChoiceTask => ({
  question: {id, prompt, options: [...letters], accepted: [answer], why}, texts,
});
const checklist = [
  '读完整题干及本题三个选项，核对问题问的是对象、原因、决定还是条件。',
  '每题独立选一个字母；依据完整关系，不凭一个相同词判断。',
  '把改后的决定、触发条件和信息归属听完整；未说明的内容不靠常识补。',
  '订正时保留原答，引用正向证据，并分别说明两个误选项的问题。',
];
const material = ({sheetTitle, tasks, ...body}: AuthoredMaterial): SampleMaterial => ({
  ...body,
  instruction,
  context: [sheetTitle, instruction, ...tasks.flatMap(task => [
    task.question.prompt,
    ...task.texts.map((text, index) => `${letters[index]}. ${text}`),
  ])].join('\n'),
  questions: tasks.map(task => task.question),
  checklist: [...checklist],
  seconds: 180,
});

const model = material({
  id: 'ielts-l01-model',
  title: '示范 · Board-game evening',
  sheetTitle: 'BOARD-GAME EVENING',
  script: 'Before the board game evening, here are a few arrangements. We first planned to use the upstairs lounge, but the tables there are too small. We will play in the dining room instead. New players should watch a practice round before joining a game; reading the rule cards is optional. If a game is still running when the kitchen closes, players may finish it, but they cannot begin another round. The prizes on the stage are for tournament winners, while the small badges at the door are for everyone attending. Please leave bags under the tables so the walkway stays clear.',
  tasks: [
    choice('play-room', '1. Where will the games take place?', [
      'In the upstairs lounge.',
      'In the dining room.',
      'On the stage.',
    ], 'B', '“We will play in the dining room instead”明确改后的活动地点，选 B。A 的“first planned to use the upstairs lounge”是原方案，随后因桌子太小而改动。C 的 stage 出现在“The prizes on the stage are for tournament winners”，是奖品所在位置，没有被说明为游戏地点。'),
    choice('new-player-step', '2. What should new players do before joining a game?', [
      'Read the rule cards as a requirement.',
      'Enter the tournament first.',
      'Watch a practice round.',
    ], 'C', '“New players should watch a practice round before joining a game”同时确认新玩家、观看练习轮和先后次序，选 C。A 把“reading the rule cards is optional”改成了必做要求。B 未获支持；录音只把奖品归给“tournament winners”，没有要求新玩家先参加锦标赛。'),
    choice('closing-condition', '3. What may players do if a game is still running when the kitchen closes?', [
      'Finish the game already in progress.',
      'Begin one more round.',
      'Receive a tournament prize automatically.',
    ], 'A', '“If a game is still running when the kitchen closes, players may finish it”给出完整条件与允许的动作，选 A。B 被“they cannot begin another round”明确排除。C 把关闭时间与领奖混在一起；奖品是“for tournament winners”，录音未说正在玩的人会自动获奖。'),
  ],
  model: '1 B · 2 C · 3 A',
  modelNotes: [
    '第一步：读完整题干与各自的三个选项。第 1 题问游戏地点，第 2 题问新玩家先做什么，第 3 题有关闭时仍在玩的条件。',
    '第二步：沿题序追踪完整信息。地点要跟到 instead 后，新玩家的安排要分清 should 与 optional，最后一题要把 if 条件和动作连起来。',
    '第三步：先用正向证据确认 B、C、A：dining room、watch a practice round、may finish it 都回答了对应整题。',
    '第四步：分别解释两个错误选项。旧地点、奖品位置、可选阅读和锦标赛对象都不能挪用；再对照原答说明误听了哪项关系。',
  ],
  hint: '先找每题的核心对象，继续听完修正和条件，再逐项核对信息属于谁或什么安排。',
});

const guided = material({
  id: 'ielts-l01-guided',
  title: '带着做 · Cinema preview',
  sheetTitle: 'CINEMA PREVIEW',
  script: 'I am introducing our cinema preview programme. We intended to show a comedy first, but the director has sent a new documentary, and that will open the evening. The comedy will follow it. Viewers may write comments afterwards; anyone who wants their comments sent to the director must put them in the blue box. The white box is for lost property reports. The upstairs seats are reserved for camera operators because they need an uninterrupted view of the audience. Guests can use the remaining seats downstairs. Please silence phones, and keep the central aisle clear throughout both films.',
  tasks: [
    choice('first-film', '1. What will open the evening?', [
      'The comedy originally planned as the first film.',
      'Both films shown at the same time.',
      'The new documentary.',
    ], 'C', '“the director has sent a new documentary, and that will open the evening”确认开场片为新纪录片，选 C。A 是“intended to show a comedy first”的旧安排，现已调整。B 被“The comedy will follow it”排除，follow 表示先后播放，并非两片同时放映。'),
    choice('director-comments', '2. What should viewers do if they want their comments sent to the director?', [
      'Put them in the white box.',
      'Put them in the blue box.',
      'Hand them to a camera operator.',
    ], 'B', '“anyone who wants their comments sent to the director must put them in the blue box”把发送给导演的条件与蓝箱连接，选 B。A 的“The white box is for lost property reports”属于遗失物报告。C 未被说明；camera operators 的安排是楼上座位，不是接收评论，不能替他们添加职责。'),
    choice('upstairs-purpose', '3. Why are the upstairs seats reserved?', [
      'They give guests greater comfort.',
      'They give camera operators a clear view of the audience.',
      'They provide a private seat for the director.',
    ], 'B', '“reserved for camera operators because they need an uninterrupted view of the audience”同时给出使用者与原因，选 B。A 错归给宾客，录音仅说“Guests can use the remaining seats downstairs”，并未提出舒适原因。C 的导演私人座位没有被提到，不能从导演寄来影片推断这一安排。'),
  ],
  hint: '先分清问题在问顺序、条件还是原因；将每项的对象与依据同时核对，别只匹配出现过的名词。',
});

const independent = material({
  id: 'ielts-l01-independent',
  title: '自己试 · Bakery tasting',
  sheetTitle: 'BAKERY TASTING',
  script: 'Today I am explaining the bakery tasting session. We considered selling tickets, but the owner wants feedback rather than income, so entry will be free. Visitors will receive small slices of each bread. The large loaves on the counter are for display and cannot be taken as samples. If visitors have already tasted a bread, they may record a rating; before tasting, they should read its name instead. Staff will collect the forms at the exit. The children from the nearby school are helping arrange tables, not judging the breads.',
  tasks: [
    choice('free-entry-reason', '1. Why will entry be free?', [
      'The owner wants feedback rather than income.',
      'The owner needs to dispose of unsold bread.',
      'The nearby school is paying for the visitors.',
    ], 'A', '“the owner wants feedback rather than income, so entry will be free”直接给出免费的原因，选 A。B 的处理未售面包没有被说明。C 未获支持；“The children from the nearby school are helping arrange tables”说的是布置工作，不是学校承担入场费用。'),
    choice('counter-loaves', '2. What are the large loaves on the counter used for?', [
      'Displaying the breads.',
      'Providing lunch for the schoolchildren.',
      'Providing samples for visitors.',
    ], 'A', '“The large loaves on the counter are for display”正向说明大面包的用途，选 A。B 的儿童午餐未被提到，儿童布置桌子不能推出供餐安排。C 被“cannot be taken as samples”排除；访客收到的是“small slices of each bread”，不能把切片的用途挪给整只大面包。'),
    choice('rating-condition', '3. When may visitors record a rating for a bread?', [
      'When the schoolchildren have judged it.',
      'Before tasting it, once they have read its name.',
      'After they have tasted it.',
    ], 'C', '“If visitors have already tasted a bread, they may record a rating”确认评分的前提是已经品尝，选 C。A 被儿童“helping arrange tables, not judging the breads”的角色区分排除。B 把品尝前的阅读与评分混同；“before tasting, they should read its name instead”说明此时做的是阅读名称。'),
  ],
  hint: '每题先找完整的正向依据，再判断其他项是旧提议、属于别的对象，还是没有被说明。',
});

const timed = material({
  id: 'ielts-l01-timed',
  title: '训练用限时 · Magazine cover competition',
  sheetTitle: 'MAGAZINE COVER COMPETITION',
  script: 'Here is an update on the magazine cover competition. We originally asked for landscapes, but the editor now wants pictures of people using local places. Empty buildings will not meet that theme. Entrants may send two pictures, although the judges will select just one for the cover. If a photograph includes a recognisable person, permission from that person must accompany the entry. Permission from the building owner is relevant to access, not to the person appearing in the image. Selected entrants will receive a printed copy of the magazine. The cash payment mentioned on the previous poster has been replaced by that copy.',
  tasks: [
    choice('current-theme', '1. What is the current theme for the cover pictures?', [
      'Landscapes without people.',
      'People using local places.',
      'Empty buildings.',
    ], 'B', '“the editor now wants pictures of people using local places”确认当前主题，选 B。A 的 landscapes 是“originally asked for”的旧要求，不能忽略 now 后的更新。C 被“Empty buildings will not meet that theme”明确排除；本题问当前主题，不问哪些景物曾被提及。'),
    choice('person-permission', '2. When must permission from a person accompany an entry?', [
      'When that person can be recognised in a photograph.',
      'Whenever a building is visible in a photograph.',
      'After the judges have selected the cover image.',
    ], 'A', '“If a photograph includes a recognisable person, permission from that person must accompany the entry”给出人物可辨认的条件和提交时的要求，选 A。B 混淆许可对象；“Permission from the building owner is relevant to access”说的是建筑进入权，不是画中人物。C 将时间延后到评选之后，但 accompany the entry 要求许可随参赛材料提交。'),
    choice('selected-reward', '3. What will selected entrants receive?', [
      'A cash payment.',
      'An invitation to meet the editor.',
      'A printed copy of the magazine.',
    ], 'C', '“Selected entrants will receive a printed copy of the magazine”正向确认所获物品，选 C。A 曾在旧海报出现，但“has been replaced by that copy”说明现金已被替换。B 的会见编辑邀请没有被提到，不能从编辑选择主题推断这一奖励。'),
  ],
  hint: '保留完整首答后再订正；留意当前决定与旧安排，并把许可或奖励的对象、条件和时间连起来。',
});

const reviewA = material({
  id: 'ielts-l01-review-a',
  title: '隔天新题 · Debate showcase',
  sheetTitle: 'STUDENT DEBATE SHOWCASE',
  script: 'Let me outline the student debate showcase. We planned to ask the audience to vote for a winner, but the aim is to practise presenting opposing views, so there will be no winner vote. Each pair will discuss the same question from different positions. If an argument uses a statistic, the speaker should explain where it came from; a personal example does not need a published source. The cards on the chairs list the discussion topics. The green cards at the desk are for audience comments, which help us plan the next showcase. Please hand those comments in before leaving.',
  tasks: [
    choice('showcase-aim', '1. What is the main aim of the showcase?', [
      'To choose the best debater through an audience vote.',
      'To test the accuracy of every statistic.',
      'To practise presenting opposing views.',
    ], 'C', '“the aim is to practise presenting opposing views”直接支持总目标，选 C。A 是原本考虑的投票，现已改为“there will be no winner vote”。B 把使用统计数字时说明来源的局部要求扩大成整体准确性测试，录音未把它列为展示目标。'),
    choice('statistic-explanation', '2. What should a speaker explain when an argument uses a statistic?', [
      'Why the audience should vote for a winner.',
      'Where the statistic came from.',
      'How the comment cards were printed.',
    ], 'B', '“If an argument uses a statistic, the speaker should explain where it came from”把使用统计数字的条件与来源说明连接，选 B。A 与“there will be no winner vote”冲突，不能变成这一条件下的解释任务。C 的印刷方法未被说明；评论卡只被描述为收集反馈来规划下次活动。'),
    choice('green-card-purpose', '3. What are the green cards at the desk used for?', [
      'Collecting comments to help plan a later showcase.',
      'Listing the topics for the current discussions.',
      'Recording votes for the winning speaker.',
    ], 'A', '“The green cards at the desk are for audience comments, which help us plan the next showcase”说明物品、用途和面向下一次活动的目的，选 A。B 属于“The cards on the chairs list the discussion topics”，不是桌上的绿卡。C 被取消的“winner vote”排除，不能将旧计划当成绿卡的当前用途。'),
  ],
  hint: '换材料后仍先判断题目是在问整体目的还是局部安排；把不同物品的用途分开，再检查修改与条件。',
});

const reviewB = material({
  id: 'ielts-l01-review-b',
  title: '下一轮新题 · Dance rehearsal',
  sheetTitle: 'DANCE REHEARSAL',
  script: 'Here are the plans for the dance rehearsal. We first intended to practise outside, but the street market will occupy that space, so the session has moved to the studio. The mirror wall is for checking how the group moves together, not for teaching new steps. Beginners will learn those steps from the instructor before joining the group sequence. If the floor feels slippery, tell the instructor and wait while it is cleaned; do not simply change to a faster routine. The costumes in the corner belong to the performance team. You can rehearse in your usual comfortable clothes today.',
  tasks: [
    choice('studio-reason', '1. Why has the rehearsal moved to the studio?', [
      'Cold weather is expected outside.',
      'The street market will use the outdoor space.',
      'The dancers must try on the performance costumes.',
    ], 'B', '“the street market will occupy that space, so the session has moved to the studio”确认移到室内的原因，选 B。A 的寒冷天气没有被提到。C 把角落的服装当作搬场原因；录音说服装“belong to the performance team”，并允许今天穿“usual comfortable clothes”，没有要求试穿演出服。'),
    choice('mirror-purpose', '2. What is the mirror wall used for?', [
      'Teaching beginners new steps.',
      'Checking the fit of performance costumes.',
      'Checking how the group moves together.',
    ], 'C', '“The mirror wall is for checking how the group moves together”正向支持协调观察用途，选 C。A 被“not for teaching new steps”排除；初学者从“the instructor”学习动作。B 的服装试身用途没有被说明，服装属于演出团队这一事实不能替镜墙添加用途。'),
    choice('slippery-condition', '3. What should dancers do if the floor feels slippery?', [
      'Tell the instructor and wait while the floor is cleaned.',
      'Change to a faster routine.',
      'Put on the costumes from the corner.',
    ], 'A', '“If the floor feels slippery, tell the instructor and wait while it is cleaned”完整支持触发条件、告知和等待清洁的动作，选 A。B 被“do not simply change to a faster routine”明确排除。C 没有相应指示；角落服装属于演出团队，不能把这一归属信息改成地面打滑时换装的处理办法。'),
  ],
  hint: '分别核对原因、用途和条件下的动作；题目所问关系要有正向支持，附近出现的其他安排不能直接挪用。',
});

export const listeningSingleChoiceLesson: SampleLesson = {
  id: 'listening-single-choice',
  skill: 'listening',
  title: 'Listening · 选出完整关系有依据的一项',
  goal: '听懂决定、条件和信息归属，在每题三个选项中选择唯一有依据的一项。',
  explanation: [
    '每题有独立的三个选项，选择一个字母。先读完整题干，分清问的是具体信息、原因、决定还是整体目的。',
    '沿题号顺序听信息。原提议可能后来更改；把当前决定、触发条件及信息属于谁一起核对，不能只凭相同词。',
    '逐项判断：有正向支持、与录音矛盾、属于另一个对象，或没有被说明。未提到的安排不靠个人经验补成事实。',
    '先看示范的四步和三项解释；引导保留方法提示。独立与限时换新材料，先留下原答，订正再用短引文说明正确项及两个误选项。',
    '本站按这组三题核对答案。180秒是练习预算；查看提示、原文或重播后的作答，要连同辅助条件判断。',
    '复习换两份不同情境的新题，回想比较完整关系的方法。重做旧题或只记住字母不能说明会处理新选项。',
  ],
  boundary: '六份虚构原创单人说明，每份三道单选，局部练习细节和整体理解；不覆盖多人对话中的换人辨认。语音由设备合成，尚未人工试听；设备播放速度与完整性未核验，可能中断或超时，播放后请确认实际听完整。每份180秒为本站练习预算，不是正式考试单题时限。这组不是完整听力试卷，也不换算 Band。',
  model,
  guided,
  independent,
  timed,
  reviews: [reviewA, reviewB],
};
