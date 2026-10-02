import type {SampleLesson} from '../../sample-sequence';
import type {TableStimulus} from '../../structured-table/types';
import {validateTableStimulus} from '../../structured-table/validation';
import {projectTableStimulus} from '../../structured-table/projection';

/** Finite authoring checks, not an automatic assessment of meaning or IELTS difficulty. */
export function validateTableCompletionContent(lesson: SampleLesson, stimuli: readonly TableStimulus[]): string[] {
  const issues: string[] = [];
  const add = (ok: unknown, text: string) => {if (!ok) issues.push(text);};
  add(lesson.id === 'reading-table-completion' && lesson.skill === 'reading', 'Only the selected Academic Reading table chain is supported.');
  const materials = [lesson.model, lesson.guided, lesson.independent, lesson.timed, ...lesson.reviews];
  add(materials.length === 6 && lesson.reviews.length === 2, 'Use exactly six material positions and two finite fresh reviews.');
  add(new Set(materials.map(m => m.id)).size === materials.length, 'Material IDs must be unique.');
  add(new Set(materials.map(m => m.context)).size === materials.length, 'Each position needs a different source passage.');
  add(stimuli.length === materials.length && new Set(stimuli.map(s => s.id)).size === stimuli.length, 'There must be one distinct table sidecar per material.');
  add(stimuli.every(s => materials.some(m => m.id === s.id)), 'Foreign table IDs are not allowed in this chain.');
  const questionIds = new Set<string>();
  for (const material of materials) {
    const path = material.id;
    const context = material.context || '';
    const words = context.match(/\b[A-Za-z]+(?:[-’'][A-Za-z]+)*\b/g) || [];
    add(words.length >= 180 && words.length <= 240, `${path}: passage is outside the local 180–240-word budget.`);
    add(!material.script, `${path}: this Reading chain does not provide audio.`);
    add(material.seconds === 180, `${path}: budget must be identified as the 180-second local task.`);
    add(material.questions?.length === 3, `${path}: three independently answerable cells are required.`);
    add(material.instruction.includes('NO MORE THAN TWO WORDS') && material.instruction.includes('from the text'), `${path}: print the source-word/two-word instruction.`);
    add(material.hint.trim() && material.checklist.length >= 2, `${path}: method and feedback checks must exist.`);
    if (material.id !== lesson.model.id) add(!material.model && !material.modelNotes, `${path}: model-only fields must not enter new practice.`);
    const stimulus = stimuli.find(s => s.id === material.id);
    if (!stimulus) {issues.push(`${path}: table sidecar is missing.`); continue;}
    add(stimulus.instruction === material.instruction, `${path}: table and material instructions must agree.`);
    issues.push(...validateTableStimulus(stimulus, {rowCount: 3, columnCount: 2, blankCount: 3, questions: (material.questions || []).map((q, i) => ({id: q.id, questionNumber: i + 1}))}).map(issue => `${path}/${issue.path}: ${issue.message}`));
    const projected = projectTableStimulus(stimulus);
    if (!projected.ok) continue;
    const blanks = projected.projection.blanks;
    add(new Set(blanks.map(blank => blank.columnId)).size >= 2, `${path}: blanks must require both column categories.`);
    for (const q of material.questions || []) {
      add(!questionIds.has(q.id), `${path}: question ID is reused across materials.`); questionIds.add(q.id);
      add(!q.options && q.accepted.length >= 1, `${q.id}: this is source-word entry, not options.`);
      const coordinate = blanks.find(blank => blank.cell.questionId === q.id);
      if (!coordinate) {issues.push(`${q.id}: question has no unique visible cell.`); continue;}
      add(q.prompt.includes(coordinate.rowLabel) && q.prompt.includes(coordinate.columnLabel), `${q.id}: prompt must identify the same row and column as the input.`);
      for (const answer of q.accepted) {
        add(/^[A-Za-z]+(?:[-][A-Za-z]+)*(?: [A-Za-z]+(?:[-][A-Za-z]+)*)?$/.test(answer), `${q.id}: expected a literal one/two-word source phrase, without digits or contractions.`);
        const escaped = answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        add(new RegExp(`\\b${escaped}\\b`).test(context), `${q.id}: accepted phrase is not verbatim in the source passage.`);
        add(![coordinate.cell.before, coordinate.cell.after].some(text => text && text.includes(answer)), `${q.id}: the same cell must not print its missing answer.`);
      }
      const quotes = [...q.why.matchAll(/“([^”]+)”/g)].map(match => match[1]);
      add(quotes.length > 0 && quotes.every(quote => context.includes(quote)), `${q.id}: feedback quotes must be exact source evidence.`);
    }
  }
  add(lesson.model.modelNotes?.length === 4 && !!lesson.model.model, 'The sole model must contain four explicit coach steps.');
  return issues;
}
