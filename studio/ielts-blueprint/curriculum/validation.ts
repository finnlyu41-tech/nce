import type {SampleLesson} from '../sample-sequence';
import {learningStages, type OfficialSource, type Requirement, type Variant} from '../types';
import type {CurriculumBinding} from './types';

export type CurriculumIssue = {path: string; message: string};
/** Structural authoring check only; truth of an answer and human/audio review remain separate. */
export function validateCurriculumContent(
  variant: Variant,
  lessons: readonly SampleLesson[],
  bindings: readonly CurriculumBinding[],
  sources: readonly OfficialSource[],
  requirements: readonly Pick<Requirement, 'id' | 'skill' | 'variants'>[],
): CurriculumIssue[] {
  const issues: CurriculumIssue[] = [];
  const fail = (path: string, message: string) => {issues.push({path, message});};
  if (variant !== 'academic' && variant !== 'general-training') return [{path: 'variant', message: 'Explicit variant required.'}];
  const lessonIds = new Set<string>(), materialIds = new Set<string>();
  for (const lesson of lessons) {
    const prefix = `lessons.${lesson.id}`;
    if (!/^[a-z][a-z0-9-]*$/.test(lesson.id) || lessonIds.has(lesson.id)) fail(prefix, 'Invalid or duplicate lesson ID.');
    lessonIds.add(lesson.id);
    if (!lesson.title.trim() || !lesson.goal.trim() || !lesson.boundary.trim() || lesson.explanation.length < 3 || lesson.explanation.some(item => !item.trim())) fail(prefix, 'Explanation, goal and limits must be concrete.');
    if (!lesson.model.model?.trim() || (lesson.model.modelNotes?.length || 0) < 2) fail(`${prefix}.model`, 'An annotated teaching model is required.');
    if (lesson.reviews.length !== 2) fail(`${prefix}.reviews`, 'The existing six-material contract requires two review materials.');
    const materials = [lesson.model, lesson.guided, lesson.independent, lesson.timed, ...lesson.reviews];
    const stimuli = new Set<string>();
    for (const material of materials) {
      const path = `${prefix}.${material.id}`;
      if (!/^[a-z][a-z0-9-]*$/.test(material.id) || materialIds.has(material.id)) fail(path, 'Invalid or duplicate material ID.');
      materialIds.add(material.id);
      if (!material.title.trim() || !material.instruction.trim() || !material.hint.trim() || material.checklist.length < 2 || material.checklist.some(item => !item.trim())) fail(path, 'Instruction, method hint and feedback checklist are required.');
      if (!Number.isSafeInteger(material.seconds) || material.seconds <= 0) fail(path, 'Positive local training time required.');
      if (!material.context?.trim() || (lesson.skill === 'listening' && !material.script?.trim())) fail(path, 'Visible form/passage and corresponding listening script required.');
      const stimulus = lesson.skill === 'listening' ? material.script || '' : material.context || '';
      if (stimuli.has(stimulus)) fail(path, 'Repeated stimulus cannot be a fresh stage material.');
      stimuli.add(stimulus);
      if (!material.questions?.length) fail(path, 'This objective micro-course must include questions.');
      const questionIds = new Set<string>();
      for (const question of material.questions || []) {
        const questionPath = `${path}.${question.id}`;
        if (!question.id.trim() || questionIds.has(question.id)) fail(questionPath, 'Question IDs must be distinct within their material.');
        questionIds.add(question.id);
        if (!question.prompt.trim() || !question.why.trim() || !question.accepted.length || question.accepted.some(answer => !answer.trim())) fail(questionPath, 'Prompt, accepted answer and specific rationale required.');
        if (question.options && question.accepted.some(answer => !question.options!.includes(answer))) fail(questionPath, 'Accepted answers must match rendered options.');
        if (lesson.skill === 'reading' && (!question.options || question.options.join('|') !== 'YES|NO|NOT GIVEN' || question.accepted.length !== 1)) fail(questionPath, 'Writer views need explicit YES/NO/NOT GIVEN options and one supported answer.');
      }
    }
  }
  const sourceIds = new Set(sources.map(source => source.id)), bindingIds = new Set<string>();
  for (const item of bindings) {
    if (bindingIds.has(item.id)) fail(`bindings.${item.id}`, 'Duplicate coverage binding.');
    bindingIds.add(item.id);
    if (!item.variants.includes(variant)) continue;
    const path = `bindings.${item.id}`, lesson = lessons.find(candidate => candidate.id === item.lessonId);
    if (!lesson) {fail(path, 'No course for this binding and variant.'); continue;}
    if (!item.sourceIds.length || new Set(item.sourceIds).size !== item.sourceIds.length || item.sourceIds.some(id => !sourceIds.has(id)) || !item.sourceLocator.trim()) fail(path, 'Official source IDs and rule locator must resolve.');
    if (!item.requirementIds.length || item.requirementIds.some(id => !requirements.some(requirement => requirement.id === id && requirement.variants.includes(variant) && requirement.skill === lesson.skill))) fail(path, 'Requirement ID, variant and skill must match.');
    if (item.rights !== 'original-fictional' || item.integrationStatus !== 'pending-owner-integration' || item.contentStatus !== 'authored-not-expert-reviewed' || !item.coverageBoundary.trim()) fail(path, 'Rights and unverified integration/review limits must stay explicit.');
    if (item.delivery !== (lesson.skill === 'listening' ? 'device-tts' : 'text')) fail(path, 'Delivery must match the authored course.');
    if (!item.content.path.startsWith('ielts-blueprint/curriculum/') || !item.content.symbol.trim()) fail(path, 'Concrete content code reference required.');
    const expected: Record<string, string[]> = {
      explain: [], model: [lesson.model.id], guided: [lesson.guided.id], independent: [lesson.independent.id], timed: [lesson.timed.id],
      feedback: [lesson.independent.id, lesson.timed.id], review: lesson.reviews.map(material => material.id),
    };
    if (Object.keys(item.stages).length !== learningStages.length) fail(path, 'All seven stage bindings required.');
    for (const stage of learningStages) {
      const value = item.stages[stage];
      if (!value || !value.activity.trim() || !value.expectedEvidence.trim() || value.materialIds.join('|') !== expected[stage].join('|')) fail(`${path}.${stage}`, 'Stage must point to the actual material, activity and expected evidence.');
    }
  }
  for (const lesson of lessons) if (!bindings.some(item => item.lessonId === lesson.id && item.variants.includes(variant))) fail(`lessons.${lesson.id}`, 'Each course needs a traceable official requirement binding.');
  return issues;
}
