import type {SampleLesson, SampleMaterial} from '../../sample-sequence';
import type {MultiSelectLesson, MultiSelectMaterial, MultiSelectTask} from './types';

const entryInstruction = 'Enter all selected letters in this one field, separated by spaces. Any order is accepted. This site checks the complete group together.';

/** Finite authoring adapter: OR between complete permutations, AND within each complete answer. */
export function completeSetAnswers(task: MultiSelectTask): string[] {
  if ((task.selectionCount !== 2 && task.selectionCount !== 3) || task.correctOptionIds.length !== task.selectionCount || new Set(task.correctOptionIds).size !== task.selectionCount || task.correctOptionIds.some(id => !/^[A-Z]$/.test(id) || !task.options.some(option => option.id === id))) throw new Error('A complete, distinct two/three-letter answer set is required.');
  const permutations = (ids: string[]): string[][] => ids.length === 1 ? [ids] : ids.flatMap((id, index) => permutations(ids.filter((_, position) => position !== index)).map(rest => [id, ...rest]));
  return permutations([...task.correctOptionIds].sort()).map(ids => ids.join(' '));
}

/** Input diagnostics only; the existing engine still retains a wrong/incomplete original answer. */
export function inspectMultiSelectEntry(task: MultiSelectTask, raw: string): {issue?: 'format' | 'unknown-letter' | 'duplicate' | 'selection-count'; selected: string[]; matches: boolean} {
  const normalized = raw.trim().replace(/\s+/g, ' ').toUpperCase();
  if (!/^[A-Z](?: [A-Z])*$/.test(normalized)) return {issue: 'format', selected: [], matches: false};
  const selected = normalized.split(' ');
  if (selected.some(id => !task.options.some(option => option.id === id))) return {issue: 'unknown-letter', selected, matches: false};
  if (new Set(selected).size !== selected.length) return {issue: 'duplicate', selected, matches: false};
  if (selected.length !== task.selectionCount) return {issue: 'selection-count', selected, matches: false};
  return {selected, matches: completeSetAnswers(task).some(answer => answer === normalized)};
}

function projectMaterial(material: MultiSelectMaterial, listening: boolean, model = false): SampleMaterial {
  const task = material.task, answers = completeSetAnswers(task);
  const options = task.options.map(option => `${option.id}. ${option.text}`).join('\n');
  const explanation = task.options.map(option => `${option.id}：${option.reason}${option.quotes.length ? ` 原材料：${option.quotes.map(quote => `“${quote}”`).join('；')}` : ''}`).join('\n');
  return {
    id: material.id, title: material.title, instruction: `${task.prompt} ${entryInstruction}`,
    context: `${listening ? '' : `${material.stimulus}\n\n`}${task.prompt}\n${options}`,
    ...(listening ? {script: material.stimulus} : {}),
    // options intentionally absent: SampleQuestion.options currently renders a single-select.
    questions: [{id: task.id, prompt: `${task.prompt} ${entryInstruction}`, accepted: answers, why: `${model ? `${(material.modelNotes || []).join('\n')}\n` : ''}完整参考集合：${answers[0]}。每个选项分别核验，恰好选择${task.selectionCount}项；只匹配完整组，不按官方逐答案计分。\n${explanation}`}],
    hint: material.hint, checklist: [...material.checklist], seconds: material.seconds,
    ...(model ? {model: answers[0], modelNotes: [...(material.modelNotes || [])]} : {}),
  };
}

/** Preserves raw learner strings and all existing exposure/timing/review rules; no new grader/state. */
export function projectMultiSelectLesson(lesson: MultiSelectLesson): SampleLesson {
  return {
    id: lesson.id, skill: lesson.skill, title: lesson.title, goal: lesson.goal,
    explanation: [...lesson.explanation, '本站把全部选中字母写在同一输入框，以空格分开。每个参考字符串都包含完整正确集合；不是从正确字母中任选一个。任意顺序可填写，少选、多选、重复或未列出的字母不会匹配，原答仍保留。', '本批原创练习每组选择2或3项，选项列表有5或6项；这不是官方题目固定数量，实际考试须重新读本题指令。GT本批接受任意顺序是原创练习规则，不声称本轮已核实全部官方GT多选答案表。'],
    boundary: `${lesson.boundary} 本站使用完整字母组文本输入，尚无原生复选框或官方逐答案槽计分。现有correct/total按完整组核对，不计算部分答案的官方分数；输入错误也保留原答，不静默抽取或去重。`,
    model: projectMaterial(lesson.model, lesson.skill === 'listening', true),
    guided: projectMaterial(lesson.guided, lesson.skill === 'listening'),
    independent: projectMaterial(lesson.independent, lesson.skill === 'listening'),
    timed: projectMaterial(lesson.timed, lesson.skill === 'listening'),
    reviews: lesson.reviews.map(material => projectMaterial(material, lesson.skill === 'listening')),
  };
}
