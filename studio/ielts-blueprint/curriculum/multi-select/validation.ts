import type {MultiSelectLesson} from './types';
import {completeSetAnswers, projectMultiSelectLesson} from './projection';

export type MultiSelectIssue = {path: string; message: string};
/** Native data and faithful projection checks; option semantics require separate source review. */
export function validateMultiSelectLesson(lesson: MultiSelectLesson): MultiSelectIssue[] {
  const issues: MultiSelectIssue[] = [], materialIds = new Set<string>(), stimuli = new Set<string>();
  const fail = (path: string, message: string) => {issues.push({path, message});};
  if (!/^[a-z][a-z0-9-]*$/.test(lesson.id) || !lesson.title.trim() || !lesson.goal.trim() || !lesson.boundary.trim() || lesson.explanation.length < 3) fail(lesson.id, 'Stable course ID, goal, explanation and boundary required.');
  if (!lesson.variants.length || lesson.variants.some(variant => !['academic', 'general-training'].includes(variant)) || new Set(lesson.variants).size !== lesson.variants.length) fail(lesson.id, 'Explicit valid variants required.');
  if (lesson.reviews.length !== 2 || (lesson.model.modelNotes?.length || 0) < 2) fail(lesson.id, 'Annotated model and exactly two review materials required.');
  for (const material of [lesson.model, lesson.guided, lesson.independent, lesson.timed, ...lesson.reviews]) {
    const path = `${lesson.id}.${material.id}`, task = material.task;
    if (!/^[a-z][a-z0-9-]*$/.test(material.id) || materialIds.has(material.id)) fail(path, 'Stable distinct material IDs required.');
    materialIds.add(material.id);
    if (!material.stimulus.trim() || stimuli.has(material.stimulus)) fail(path, 'Each stage needs a distinct original stimulus.');
    stimuli.add(material.stimulus);
    if (!material.title.trim() || !material.hint.trim() || material.checklist.length < 2 || !Number.isSafeInteger(material.seconds) || material.seconds <= 0) fail(path, 'Task, method hint, checklist and local time required.');
    if (task.id !== `${material.id}-selection` || !task.prompt.trim() || !task.prompt.includes(task.selectionCount === 2 ? 'TWO' : 'THREE')) fail(path, 'Task ID and explicit number to choose must match.');
    if ((task.selectionCount !== 2 && task.selectionCount !== 3) || task.options.length !== (task.selectionCount === 2 ? 5 : 6)) fail(path, 'This finite batch uses two from five or three from six.');
    const optionIds = task.options.map(option => option.id);
    if (optionIds.some((id, index) => id !== String.fromCharCode(65 + index))) fail(path, 'Visible options require unique consecutive letter IDs.');
    for (const option of task.options) {
      if (!option.text.trim() || !option.reason.trim() || !['supported', 'contradicted', 'not-stated', 'different-target'].includes(option.judgment)) fail(`${path}.${option.id}`, 'Every option needs text, evidence judgment and a specific rationale.');
      if (option.quotes.some(quote => !quote.trim() || !material.stimulus.includes(quote))) fail(`${path}.${option.id}`, 'Evidence must quote the actual original stimulus, not the option text.');
      if (option.judgment !== 'not-stated' && !option.quotes.length) fail(`${path}.${option.id}`, 'Supported, opposing or different-target judgments need source evidence.');
    }
    const supported = task.options.filter(option => option.judgment === 'supported').map(option => option.id).sort();
    if (supported.length !== task.selectionCount || supported.join('|') !== [...task.correctOptionIds].sort().join('|')) fail(path, 'The key must be exactly all and only the supported options.');
    try {completeSetAnswers(task);} catch {fail(path, 'The complete answer cannot be represented as a distinct two/three-letter set.');}
  }
  if (issues.length) return issues;
  const projected = projectMultiSelectLesson(lesson);
  const native = [lesson.model, lesson.guided, lesson.independent, lesson.timed, ...lesson.reviews];
  const materialList = [projected.model, projected.guided, projected.independent, projected.timed, ...projected.reviews];
  for (const [index, material] of materialList.entries()) {
    const task = native[index].task, question = material.questions?.[0];
    if (material.questions?.length !== 1 || question?.options !== undefined || question?.id !== task.id) fail(material.id, 'One complete-group text input, never a single-select or separate per-letter OR inputs.');
    if (question?.accepted.join('|') !== completeSetAnswers(task).join('|') || task.options.some(option => !material.context?.includes(`${option.id}. ${option.text}`))) fail(material.id, 'Projection must expose every option and require the full set in every accepted string.');
    if (lesson.skill === 'listening' ? material.script !== native[index].stimulus || material.context?.includes(native[index].stimulus) : material.script !== undefined || !material.context?.startsWith(native[index].stimulus)) fail(material.id, 'Listening transcript hidden in context; reading passage visible.');
    if (index && (material.model !== undefined || material.modelNotes !== undefined)) fail(material.id, 'Practice stages must not contain a displayed model answer.');
  }
  return issues;
}
