// Original, deliberately small material set. No exam-bank text or audio.
export const steps = ['先试', '学一点', '独立新题', '纠错换题', '复习安排'];
export const forms = {
  affirmative: {name: '肯定句', example: 'I went to the park.', note: '描述过去：go 变成 went。', short: '肯定句用 went；不用 did went。'},
  negative: {name: '否定句', example: "I didn’t go to the park.", note: 'didn’t 已表示过去，后面用原形 go。', short: 'didn’t 后用原形 go，不用 went。'},
  question: {name: '问句', example: 'Did you go to the park?', note: 'Did 已表示过去，后面仍用 go。', short: 'Did 后用原形 go，不用 went。'},
};
function question(id, kind, target, scene, prompt, options, correct, explanation) {
  return {id, kind, target, scene, prompt, options, correct, explanation, hint: forms[target].short};
}
export const questions = [
  question('first-noah', 'diagnostic', 'affirmative', 'Mia: What did you do yesterday?\nNoah: I ___ to the park.', '替 Noah 选一个回答。', ['went', 'go', 'did went'], 0, 'yesterday 指昨天。肯定句中，go 的过去式是 went：I went to the park.'),
  question('new-omar', 'independent', 'negative', 'Lena: Did you go to the museum yesterday?\nOmar: No, I ___ there. I went to the beach.', '这是新的情境。Omar 应该怎么说？', ["didn’t went", "didn’t go", "don’t went"], 1, 'Omar 说昨天没有去。didn’t 已表达过去，后面用 go：I didn’t go there.'),
  question('new-may', 'independent', 'question', 'May went to the lake yesterday.\n你想问她：「你昨天去湖边了吗？」', '选一个问句。', ['Did you went to the lake yesterday?', 'Do you went to the lake yesterday?', 'Did you go to the lake yesterday?'], 2, '问昨天的经历，用 Did 开头；后面的动词回到原形 go。'),
  question('fresh-jun', 'followup', 'affirmative', 'Jun: I stayed home on Monday.\nYesterday, I ___ to the station to meet my sister.', '换了人物和地点，再选一次。', ['go', 'went', 'did went'], 1, '肯定句直接用过去式 went。这里不用 did went。'),
  question('fresh-tara', 'followup', 'affirmative', 'Tara: Yesterday was sunny.\nI ___ to the garden after lunch.', '再换一个情境：选正确的过去式。', ['did went', 'go', 'went'], 2, '昨天已经发生的事，肯定句用 went。'),
  question('fresh-rose', 'followup', 'negative', 'Rose: Did you go to the library yesterday?\nKim: No. I ___ there. I read at home.', '换了人物和地点，再选一次。', ["didn’t go", "didn’t went", "wasn’t go"], 0, '否定句：didn’t + go。过去已经由 didn’t 表达，go 不再变形。'),
  question('fresh-eli', 'followup', 'negative', 'Eli: I planned to visit the café yesterday.\nBut I ___ there because it was closed.', '再换一个情境：说昨天没有去。', ["don’t go", "didn’t went", "didn’t go"], 2, 'didn’t 已表达过去，后面的 go 保持原形。'),
  question('fresh-ana', 'followup', 'question', 'Ana went to the pool yesterday.\n你想向她确认这件事。', '换了人物和地点，再问一次。', ['Did you go to the pool yesterday?', 'Did you went to the pool yesterday?', 'Were you go to the pool yesterday?'], 0, '问句是 Did you go…? Did 表示过去，go 保持原形。'),
  question('fresh-leo', 'followup', 'question', 'Leo may have gone to the bookshop yesterday.\n你想问清楚他有没有去。', '再换一个情境：选正确的问句。', ['Do you went to the bookshop yesterday?', 'Did you go to the bookshop yesterday?', 'Did you went to the bookshop yesterday?'], 1, '问过去的经历：Did + 主语 + go。'),
];
export const byId = new Map(questions.map(q => [q.id, q]));
export const independentIds = ['new-omar', 'new-may'];
