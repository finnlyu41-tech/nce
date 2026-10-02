import type {SampleLesson} from '../../sample-sequence';
import {learningStages, type OfficialSource, type Requirement, type Variant} from '../../types';
import type {CurriculumBinding} from '../types';

export type Batch05Issue = {path: string; message: string};
const normal = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();
const roman = ['i', 'ii', 'iii', 'iv', 'v'];
const words = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;
/** Parse this batch's explicit authored layout; no semantic main-idea inference or learner-state access. */
export function batch05Headings(context: string): {headings: Array<{id: string; text: string}>; paragraphs: Array<{letter: string; text: string}>} {
  const headings: Array<{id: string; text: string}> = [], paragraphs: Array<{letter: string; text: string}> = [];
  for (const line of context.split('\n')) {
    const label = /^\s*([A-C])\s*$/.exec(line);
    if (label) {paragraphs.push({letter: label[1], text: ''}); continue;}
    const heading = /^\s*(i|ii|iii|iv|v)\.[ \t]+(.+)$/.exec(line);
    if (!paragraphs.length && heading) headings.push({id: heading[1], text: heading[2].trim()});
    else if (paragraphs.length) paragraphs[paragraphs.length - 1].text += '\n' + line;
  }
  return {headings, paragraphs: paragraphs.map(paragraph => ({...paragraph, text: paragraph.text.trim()}))};
}
export function batch05ListeningOptions(context: string): Array<{id: string; text: string}> {
  return [...context.matchAll(/^[ \t]*([A-C])[.)][ \t]+(.+)$/gm)].map(match => ({id: match[1], text: match[2].trim()}));
}
/** Finite content validation. Correct/total is this authored practice only; no Band/diagnosis is computed. */
export function validateBatch05Content(variant: Variant, lessons: readonly SampleLesson[], bindings: readonly CurriculumBinding[], sources: readonly OfficialSource[], requirements: readonly Requirement[]): Batch05Issue[] {
  const issues: Batch05Issue[] = [], fail = (path: string, message: string) => issues.push({path, message});
  if (variant !== 'academic' && variant !== 'general-training') return [{path: 'variant', message: 'Choose a supported exam category.'}];
  const ids = new Set<string>(), stimuli = new Set<string>(), knownSources = new Set(sources.map(source => source.id));
  for (const lesson of lessons) {
    const at = `lessons.${lesson.id}`, headingsTask = lesson.id === 'reading-headings';
    if ((!headingsTask && lesson.id !== 'listening-single-choice') || lesson.skill !== (headingsTask ? 'reading' : 'listening')) fail(at, 'Only single-answer listening and paragraph main-idea headings belong to this batch.');
    if (!lesson.title.trim() || !lesson.goal.trim() || lesson.explanation.length < 3 || !lesson.boundary.trim()) fail(at, 'Readable method, goal and limited-practice scope are required.');
    const materials = [lesson.model, lesson.guided, lesson.independent, lesson.timed, ...lesson.reviews];
    if (materials.length !== 6 || lesson.reviews.length !== 2) fail(at, 'Exactly six materials including two fresh reviews are required.');
    for (const [index, material] of materials.entries()) {
      const path = `${at}.${material.id}`, context = material.context || '', stimulus = headingsTask ? context : material.script;
      if (!material.id.trim() || ids.has(material.id)) fail(path, 'Each stage requires a unique material ID.');
      ids.add(material.id);
      if (!stimulus?.trim() || stimuli.has(stimulus)) fail(path, 'Each stage requires a distinct original stimulus.');
      if (stimulus) stimuli.add(stimulus);
      if (!context.trim() || !material.instruction.trim() || !material.hint.trim() || !material.checklist.length || material.seconds !== 180) fail(path, 'Full task sheet, instruction, neutral hint, checklist and local training budget are required.');
      if (!index ? !material.model || !material.modelNotes?.length : material.model !== undefined || material.modelNotes !== undefined) fail(path, 'Only the teaching model may contain visible model answers and coach notes.');
      if (!material.questions || material.questions.length !== 3 || new Set(material.questions.map(question => question.id)).size !== 3) fail(path, 'Three distinct single-answer items are required.');
      const parsed = headingsTask ? batch05Headings(context) : {headings: [], paragraphs: []};
      const options = headingsTask ? [] : batch05ListeningOptions(context);
      if (headingsTask) {
        if (material.script !== undefined || parsed.paragraphs.map(paragraph => paragraph.letter).join('|') !== 'A|B|C' || parsed.headings.map(heading => heading.id).join('|') !== roman.join('|') || new Set(parsed.headings.map(heading => normal(heading.text))).size !== 5) fail(path, 'Headings require three full labelled paragraphs and five complete unique roman-labelled headings.');
        if (!/main idea/i.test(material.instruction) || !/(?:once|not.*more than once)/i.test(material.instruction) || /may use.*more than once/i.test(material.instruction)) fail(path, 'Main-idea assignment and no heading reuse must be explicit.');
        if (new Set(material.questions?.map(question => question.accepted[0])).size !== 3) fail(path, 'Correct heading assignments must be distinct; a heading cannot be reused.');
        if (words(parsed.paragraphs.map(paragraph => paragraph.text).join(' ')) < 210 || words(parsed.paragraphs.map(paragraph => paragraph.text).join(' ')) > 270) fail(path, 'This batch explicitly uses 210–270 body words, not official passage-length calibration.');
      } else {
        if (options.map(option => option.id).join('|') !== 'A|B|C|A|B|C|A|B|C' || options.some(option => !option.text) || [0, 3, 6].some(start => new Set(options.slice(start, start + 3).map(option => normal(option.text))).size !== 3)) fail(path, 'Every listening item needs its own complete three-option bank in the visible task sheet.');
        if (words(material.script || '') < 90 || words(material.script || '') > 110) fail(path, 'This authored single-speaker batch uses 90–110 script words; actual audio remains unverified.');
        if (!/one/i.test(material.instruction)) fail(path, 'The single-answer instruction must be explicit.');
      }
      for (const [questionIndex, question] of (material.questions || []).entries()) {
        if (!question.prompt.trim() || !question.why.trim() || question.accepted.length !== 1) fail(path, 'Each item needs exactly one accepted identifier and a source explanation.');
        const quotes = [...question.why.matchAll(/“([^”]+)”/g)].map(match => match[1]);
        if (!quotes.length || quotes.some(quote => !stimulus?.includes(quote))) fail(path, 'Feedback must quote its actual stimulus exactly.');
        const expectedOptions = headingsTask ? roman : ['A', 'B', 'C'];
        if (question.options?.join('|') !== expectedOptions.join('|') || !expectedOptions.includes(question.accepted[0])) fail(path, 'Each item selects one identifier from the complete correct option bank.');
        if (headingsTask) {
          const paragraph = parsed.paragraphs[questionIndex];
          if (!paragraph || !new RegExp(`\\b[Pp]aragraph\\s+${paragraph.letter}\\b`).test(question.prompt) || !quotes.some(quote => paragraph.text.includes(quote))) fail(path, 'A heading item must identify its actual paragraph and quote evidence from that paragraph.');
        } else if (!context.includes(question.prompt)) fail(path, 'The original listening question stem must remain with its full option bank.');
      }
    }
    const binding = bindings.find(item => item.lessonId === lesson.id && item.variants.includes(variant));
    if (!binding) {fail(at, 'A variant-specific requirement binding is required.'); continue;}
    if (!binding.sourceIds.length || binding.sourceIds.some(id => !knownSources.has(id)) || !binding.sourceLocator.trim()) fail(at, 'Official source references must resolve.');
    const target = headingsTask ? (variant === 'academic' ? 'R06-A' : 'R06-GT') : 'L01';
    if (binding.requirementIds.join('|') !== target || !requirements.some(requirement => requirement.id === target && requirement.skill === lesson.skill && requirement.variants.includes(variant))) fail(at, 'Requirement family, skill and category must match the actual task.');
    if (binding.rights !== 'original-fictional' || binding.contentStatus !== 'authored-not-expert-reviewed' || binding.integrationStatus !== 'pending-owner-integration' || !binding.coverageBoundary.trim()) fail(at, 'Original provenance, limited coverage and candidate status stay explicit.');
    if (binding.delivery !== (headingsTask ? 'text' : 'device-tts') || !binding.content.path.startsWith('ielts-blueprint/curriculum/batch-05/') || !binding.content.symbol.trim()) fail(at, 'Concrete owned source and delivery must match.');
    const expected = {explain: [], model: [lesson.model.id], guided: [lesson.guided.id], independent: [lesson.independent.id], timed: [lesson.timed.id], feedback: [lesson.independent.id, lesson.timed.id], review: lesson.reviews.map(material => material.id)};
    if (Object.keys(binding.stages).length !== learningStages.length) fail(at, 'All seven stage bindings are required.');
    for (const stage of learningStages) if (!binding.stages[stage]?.activity.trim() || !binding.stages[stage]?.expectedEvidence.trim() || binding.stages[stage]?.materialIds.join('|') !== expected[stage].join('|')) fail(`${at}.${stage}`, 'Stage references must point to the actual material and evidence.');
  }
  return issues;
}
