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
    questions: [{id: task.id, prompt: `${task.prompt} ${entryInstruction}`, accepted: answers, why: `${model ? `${(material.modelNotes || []).join('\n')}\n` : ''}参考答案：${answers[0]}。逐项对照依据，恰好选择${task.selectionCount}项；本站按完整答案组核对。\n${explanation}`}],
    hint: material.hint, checklist: [...material.checklist], seconds: material.seconds,
    ...(model ? {model: answers[0], modelNotes: [...(material.modelNotes || [])]} : {}),
  };
}

/** Preserves raw learner strings and all existing exposure/timing/review rules; no new grader/state. */
export function projectMultiSelectLesson(lesson: MultiSelectLesson): SampleLesson {
  return {
    id: lesson.id, skill: lesson.skill, title: lesson.title, goal: lesson.goal,
    explanation: [...lesson.explanation, '在一个输入框中填写所有选中的字母，用空格隔开，顺序不限。每组必须恰好选出题干要求的不同字母；少选、多选、重复或填写范围外的字母，整组都会记为未匹配。你的首答会保留。', '本课每组从5或6个选项中选2或3项；实际考试的数量以题干为准。任意顺序输入和整组核对是本站练习规则，不能据此推断正式考试的填写或计分方式。'],
    boundary: `${lesson.boundary} 本站按完整答案组核对，全部选择正确且符合输入要求时，才显示整组匹配。选对部分选项也会保留你的首答；本站不计算正式考试逐答案位置或部分得分，也不据此估算 Band。首答和订正分别保留。`,
    model: projectMaterial(lesson.model, lesson.skill === 'listening', true),
    guided: projectMaterial(lesson.guided, lesson.skill === 'listening'),
    independent: projectMaterial(lesson.independent, lesson.skill === 'listening'),
    timed: projectMaterial(lesson.timed, lesson.skill === 'listening'),
    reviews: lesson.reviews.map(material => projectMaterial(material, lesson.skill === 'listening')),
  };
}
