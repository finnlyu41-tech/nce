import type {SampleLesson} from '../../sample-sequence';
import {learningStages, type OfficialSource, type Requirement, type Variant} from '../../types';
import type {CurriculumBinding} from '../types';

export type Batch03Issue = {path: string; message: string};
const normal = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();

/** Finite authoring checks for this batch, not a grader, exposure rule or learner-input sanitizer. */
export function validateBatch03Content(variant: Variant, lessons: readonly SampleLesson[], bindings: readonly CurriculumBinding[], sources: readonly OfficialSource[], requirements: readonly Requirement[]): Batch03Issue[] {
  const issues: Batch03Issue[] = [], fail = (path: string, message: string) => issues.push({path, message});
  if (variant !== 'academic' && variant !== 'general-training') return [{path: 'variant', message: 'Choose a supported exam category.'}];
  const seenIds = new Set<string>(), stimuli = new Set<string>(), sourceIds = new Set(sources.map(source => source.id));
  for (const lesson of lessons) {
    const path = `lessons.${lesson.id}`, matching = lesson.id === 'listening-matching';
    if (!matching && lesson.id !== 'reading-sentence-completion' || lesson.skill !== (matching ? 'listening' : 'reading')) fail(path, 'Only matching and source-word sentence completion are supported by this batch.');
    if (!lesson.title.trim() || !lesson.goal.trim() || lesson.explanation.length < 3 || !lesson.boundary.trim()) fail(path, 'Readable methods, goal and limited-practice scope are required.');
    const materials = [lesson.model, lesson.guided, lesson.independent, lesson.timed, ...lesson.reviews];
    if (materials.length !== 6 || lesson.reviews.length !== 2) fail(path, 'Exactly six materials including two distinct delayed reviews are required.');
    for (const [index, material] of materials.entries()) {
      const at = `${path}.${material.id}`, stimulus = matching ? material.script : material.context;
      if (!material.id.trim() || seenIds.has(material.id)) fail(at, 'Each stage needs a unique material ID.');
      seenIds.add(material.id);
      if (!stimulus?.trim() || stimuli.has(stimulus)) fail(at, 'Each stage needs a distinct original stimulus.');
      if (stimulus) stimuli.add(stimulus);
      if (!material.instruction.trim() || !material.hint.trim() || !material.checklist.length || material.seconds !== 180) fail(at, 'Instructions, neutral method hint, checklist and local training budget are required.');
      if (!index ? !material.model || !material.modelNotes?.length : material.model !== undefined || material.modelNotes !== undefined) fail(at, 'Only the teaching model may include visible model answers and coach notes.');
      if (!material.questions || material.questions.length !== 3 || new Set(material.questions.map(question => question.id)).size !== 3) fail(at, 'Three distinct numbered items are required.');
      const letters = material.questions?.[0]?.options;
      if (matching && (!letters || letters.length < 4 || letters.length > 5 || new Set(letters).size !== letters.length || letters.some(letter => !/^[A-E]$/.test(letter)) || !material.context?.trim())) fail(at, 'Matching needs a visible common four/five-letter option list.');
      if (matching && letters?.some(letter => !new RegExp(`(^|\\n)${letter}[.)]?\\s+[^\\n]+`).test(material.context || ''))) fail(at, 'Every matching letter must have a visible shared option label.');
      for (const question of material.questions || []) {
        if (!question.prompt.trim() || !question.why.trim() || !question.accepted.length || new Set(question.accepted.map(normal)).size !== question.accepted.length) fail(at, 'Each item needs a prompt, nonduplicate accepted forms and source explanation.');
        if (matching) {
          if (question.options?.join('|') !== letters?.join('|') || question.accepted.length !== 1 || !letters?.includes(question.accepted[0])) fail(at, 'Every matching item selects one letter from the same full list, not a complete multi-answer group.');
        } else {
          if (question.options !== undefined || material.script !== undefined || !question.prompt.includes('_____')) fail(at, 'Sentence completion requires a genuine sentence gap and text input.');
          for (const answer of question.accepted) if (!/^[A-Za-z]+(?: [A-Za-z]+)?$/.test(answer) || !new RegExp(`(^|[^a-z])${normal(answer)}($|[^a-z])`).test(normal(material.context || ''))) fail(at, 'This finite batch accepts only one/two-word ordinary source phrases, without word-form changes.');
        }
        if (!/[“][^”]+[”]/.test(question.why)) fail(at, 'Feedback must quote its authored source, rather than merely reveal the key.');
      }
    }
    const item = bindings.find(binding => binding.lessonId === lesson.id && binding.variants.includes(variant));
    if (!item) {fail(path, 'A variant-specific official requirement binding is required.'); continue;}
    if (!item.sourceIds.length || item.sourceIds.some(id => !sourceIds.has(id)) || !item.sourceLocator.trim()) fail(path, 'Official source references must resolve.');
    if (!item.requirementIds.length || item.requirementIds.some(id => !requirements.some(requirement => requirement.id === id && requirement.variants.includes(variant) && requirement.skill === lesson.skill))) fail(path, 'Requirement skill and category must match.');
    if (item.rights !== 'original-fictional' || item.contentStatus !== 'authored-not-expert-reviewed' || item.integrationStatus !== 'pending-owner-integration' || !item.coverageBoundary.trim()) fail(path, 'Author provenance and pending integration must remain explicit.');
    if (item.delivery !== (matching ? 'device-tts' : 'text') || !item.content.path.startsWith('ielts-blueprint/curriculum/batch-03/') || !item.content.symbol.trim()) fail(path, 'Concrete source ownership and delivery must match.');
    const expected = {explain: [], model: [lesson.model.id], guided: [lesson.guided.id], independent: [lesson.independent.id], timed: [lesson.timed.id], feedback: [lesson.independent.id, lesson.timed.id], review: lesson.reviews.map(material => material.id)};
    if (Object.keys(item.stages).length !== learningStages.length) fail(path, 'All seven stage bindings are required.');
    for (const stage of learningStages) if (!item.stages[stage]?.activity.trim() || !item.stages[stage]?.expectedEvidence.trim() || item.stages[stage]?.materialIds.join('|') !== expected[stage].join('|')) fail(`${path}.${stage}`, 'Stage references must point to the actual material and evidence.');
  }
  return issues;
}
