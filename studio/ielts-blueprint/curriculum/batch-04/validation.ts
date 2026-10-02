import type {SampleLesson} from '../../sample-sequence';
import {learningStages, type OfficialSource, type Requirement, type Variant} from '../../types';
import type {CurriculumBinding} from '../types';

export type Batch04Issue = {path: string; message: string};
const normal = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();
/** Preserve labelled paragraph boundaries; this is not semantic matching or a learner-input parser. */
export function batch04Paragraphs(context: string): Array<{letter: string; text: string}> {
  const paragraphs: Array<{letter: string; text: string}> = [];
  for (const line of context.split('\n')) {
    // A sentence beginning with the article "A" is not a paragraph label.
    const label = /^\s*([A-D])(?:[.)](?:[ \t]+(.*))?|[ \t]{2,}(.*)|[ \t]*)$/.exec(line);
    if (label) paragraphs.push({letter: label[1], text: label[2] || label[3] || ''});
    else if (paragraphs.length) paragraphs[paragraphs.length - 1].text += '\n' + line;
  }
  return paragraphs.map(paragraph => ({...paragraph, text: paragraph.text.trim()}));
}
/** Finite authoring validation, with no state read/write, automatic error diagnosis or Band conversion. */
export function validateBatch04Content(variant: Variant, lessons: readonly SampleLesson[], bindings: readonly CurriculumBinding[], sources: readonly OfficialSource[], requirements: readonly Requirement[]): Batch04Issue[] {
  const issues: Batch04Issue[] = [], fail = (path: string, message: string) => issues.push({path, message});
  if (variant !== 'academic' && variant !== 'general-training') return [{path: 'variant', message: 'Choose a supported exam category.'}];
  const ids = new Set<string>(), stimuli = new Set<string>(), knownSources = new Set(sources.map(source => source.id));
  for (const lesson of lessons) {
    const at = `lessons.${lesson.id}`, matching = lesson.id === 'reading-information-matching';
    if ((!matching && lesson.id !== 'listening-sentence-completion') || lesson.skill !== (matching ? 'reading' : 'listening')) fail(at, 'Only paragraph information matching and listening sentence completion belong to this batch.');
    if (!lesson.title.trim() || !lesson.goal.trim() || lesson.explanation.length < 3 || !lesson.boundary.trim()) fail(at, 'Readable method, goal and limited-practice scope are required.');
    const materials = [lesson.model, lesson.guided, lesson.independent, lesson.timed, ...lesson.reviews];
    if (materials.length !== 6 || lesson.reviews.length !== 2) fail(at, 'Exactly six materials including two fresh reviews are required.');
    for (const [index, material] of materials.entries()) {
      const path = `${at}.${material.id}`, stimulus = matching ? material.context : material.script;
      if (ids.has(material.id) || !material.id.trim()) fail(path, 'Each stage requires a unique material ID.');
      ids.add(material.id);
      if (!stimulus?.trim() || stimuli.has(stimulus)) fail(path, 'Each stage requires a distinct original stimulus.');
      if (stimulus) stimuli.add(stimulus);
      if (!material.instruction.trim() || !material.hint.trim() || !material.checklist.length || material.seconds !== 180) fail(path, 'Instructions, neutral hint, checklist and local training budget are required.');
      if (!index ? !material.model || !material.modelNotes?.length : material.model !== undefined || material.modelNotes !== undefined) fail(path, 'Only the teaching model may contain visible model answers and coach notes.');
      if (!material.questions || material.questions.length !== 3 || new Set(material.questions.map(question => question.id)).size !== 3) fail(path, 'Three distinct information items or sentence gaps are required.');
      const paragraphs = matching ? batch04Paragraphs(material.context || '') : [];
      if (matching && (material.script !== undefined || paragraphs.map(paragraph => paragraph.letter).join('|') !== 'A|B|C|D' || paragraphs.some(paragraph => !paragraph.text))) fail(path, 'Reading matching requires four full labelled paragraphs in the original context.');
      if (matching && !/more than once/i.test(material.instruction + ' ' + material.context)) fail(path, 'This batch explicitly states paragraph reuse.');
      for (const question of material.questions || []) {
        if (!question.prompt.trim() || !question.why.trim() || !question.accepted.length || new Set(question.accepted.map(normal)).size !== question.accepted.length) fail(path, 'Each item needs nonduplicate accepted forms and a source explanation.');
        const quotes = [...question.why.matchAll(/“([^”]+)”/g)].map(match => match[1]);
        if (!quotes.length || quotes.some(quote => !stimulus?.includes(quote))) fail(path, 'Feedback must quote its actual source exactly.');
        if (matching) {
          if (question.options?.join('|') !== 'A|B|C|D' || question.accepted.length !== 1 || !/^[A-D]$/.test(question.accepted[0]) || question.prompt.includes('_____')) fail(path, 'Every information item chooses one letter from the same full paragraph list.');
          const selected = paragraphs.find(paragraph => paragraph.letter === question.accepted[0]);
          if (!selected || !quotes.some(quote => selected.text.includes(quote))) fail(path, 'A matched paragraph must contain the quoted supporting evidence.');
        } else {
          if (question.options !== undefined || !material.script?.trim() || !question.prompt.includes('_____')) fail(path, 'Listening sentence completion requires recorded text and a genuine sentence gap.');
          for (const answer of question.accepted) if (!/^[A-Za-z]+(?: [A-Za-z]+)?$/.test(answer) || !new RegExp(`(^|[^a-z])${normal(answer)}($|[^a-z])`).test(normal(material.script || ''))) fail(path, 'This authored batch uses only unchanged one/two-word ordinary recorded phrases.');
        }
      }
    }
    const binding = bindings.find(item => item.lessonId === lesson.id && item.variants.includes(variant));
    if (!binding) {fail(at, 'A variant-specific requirement binding is required.'); continue;}
    if (!binding.sourceIds.length || binding.sourceIds.some(id => !knownSources.has(id)) || !binding.sourceLocator.trim()) fail(at, 'Official source references must resolve.');
    if (!binding.requirementIds.length || binding.requirementIds.some(id => !requirements.some(requirement => requirement.id === id && requirement.skill === lesson.skill && requirement.variants.includes(variant)))) fail(at, 'Requirement skill and category must match.');
    if (binding.rights !== 'original-fictional' || binding.contentStatus !== 'authored-not-expert-reviewed' || binding.integrationStatus !== 'pending-owner-integration' || !binding.coverageBoundary.trim()) fail(at, 'Provenance, limited coverage and pending registration stay explicit.');
    if (binding.delivery !== (matching ? 'text' : 'device-tts') || !binding.content.path.startsWith('ielts-blueprint/curriculum/batch-04/') || !binding.content.symbol.trim()) fail(at, 'Concrete owned source and delivery must match.');
    const expected = {explain: [], model: [lesson.model.id], guided: [lesson.guided.id], independent: [lesson.independent.id], timed: [lesson.timed.id], feedback: [lesson.independent.id, lesson.timed.id], review: lesson.reviews.map(material => material.id)};
    if (Object.keys(binding.stages).length !== learningStages.length) fail(at, 'All seven stage bindings are required.');
    for (const stage of learningStages) if (!binding.stages[stage]?.activity.trim() || !binding.stages[stage]?.expectedEvidence.trim() || binding.stages[stage]?.materialIds.join('|') !== expected[stage].join('|')) fail(`${at}.${stage}`, 'Stage references must point to the actual material and evidence.');
  }
  return issues;
}
