import assert from 'node:assert/strict';
import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';
import {loadTypeScript, moduleURL} from './ielts-blueprint-loader.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), file = relative => path.join(root, relative);
const [batch, validator, sources, blueprint, catalog] = await Promise.all([
  loadTypeScript(file('ielts-blueprint/curriculum/batch-05.ts')),
  loadTypeScript(file('ielts-blueprint/curriculum/batch-05/validation.ts')),
  loadTypeScript(file('ielts-blueprint/sources.ts')), loadTypeScript(file('ielts-blueprint/blueprint.ts')),
  loadTypeScript(file('ielts-blueprint/sample-sequence.ts')),
]);
const variants = ['academic', 'general-training'];
const catalogRawBefore = await readFile(file('ielts-blueprint/sample-sequence.ts'), 'utf8');
const catalogCountsBefore = variants.map(variant => catalog.sampleLessonsFor(variant).length);
const targetLessons = variant => {
  const current = catalog.sampleLessonsFor(variant);
  return [...current, ...batch.batch05LessonsFor(variant).filter(lesson => !current.some(existing => existing.id === lesson.id))];
};
const materials = lesson => [lesson.model, lesson.guided, lesson.independent, lesson.timed, ...lesson.reviews];
const cases = variants.flatMap(variant => batch.batch05LessonsFor(variant).map(lesson => ({variant, lesson})));
const unique = new Map(cases.flatMap(({lesson}) => materials(lesson).map(material => [material.id, material])));
const allSources = [...sources.officialSources, ...batch.batch05AdditionalSources];
const normal = value => value.trim().replace(/\s+/g, ' ').toLowerCase();
const group = (name, run) => {run(); console.log(`PASS ${name}`);};

// Frozen after independent agents derived answers from keyless stimuli/instructions/items.
// The finite review is not expert calibration, real listening or automatic semantic inference.
const reviewed = {
  "ielts-l01-model": [
    [
      "B"
    ],
    [
      "C"
    ],
    [
      "A"
    ]
  ],
  "ielts-l01-guided": [
    [
      "C"
    ],
    [
      "B"
    ],
    [
      "B"
    ]
  ],
  "ielts-l01-independent": [
    [
      "A"
    ],
    [
      "A"
    ],
    [
      "C"
    ]
  ],
  "ielts-l01-timed": [
    [
      "B"
    ],
    [
      "A"
    ],
    [
      "C"
    ]
  ],
  "ielts-l01-review-a": [
    [
      "C"
    ],
    [
      "B"
    ],
    [
      "A"
    ]
  ],
  "ielts-l01-review-b": [
    [
      "B"
    ],
    [
      "C"
    ],
    [
      "A"
    ]
  ],
  "ielts-r06-a-model": [
    [
      "ii"
    ],
    [
      "iv"
    ],
    [
      "v"
    ]
  ],
  "ielts-r06-a-guided": [
    [
      "i"
    ],
    [
      "iv"
    ],
    [
      "v"
    ]
  ],
  "ielts-r06-a-independent": [
    [
      "iii"
    ],
    [
      "v"
    ],
    [
      "i"
    ]
  ],
  "ielts-r06-a-timed": [
    [
      "iv"
    ],
    [
      "iii"
    ],
    [
      "ii"
    ]
  ],
  "ielts-r06-a-review-a": [
    [
      "ii"
    ],
    [
      "iii"
    ],
    [
      "iv"
    ]
  ],
  "ielts-r06-a-review-b": [
    [
      "iv"
    ],
    [
      "v"
    ],
    [
      "ii"
    ]
  ],
  "ielts-r06-gt-model": [
    [
      "iii"
    ],
    [
      "v"
    ],
    [
      "i"
    ]
  ],
  "ielts-r06-gt-guided": [
    [
      "iv"
    ],
    [
      "v"
    ],
    [
      "ii"
    ]
  ],
  "ielts-r06-gt-independent": [
    [
      "v"
    ],
    [
      "i"
    ],
    [
      "iii"
    ]
  ],
  "ielts-r06-gt-timed": [
    [
      "ii"
    ],
    [
      "v"
    ],
    [
      "i"
    ]
  ],
  "ielts-r06-gt-review-a": [
    [
      "ii"
    ],
    [
      "iii"
    ],
    [
      "i"
    ]
  ],
  "ielts-r06-gt-review-b": [
    [
      "iv"
    ],
    [
      "i"
    ],
    [
      "v"
    ]
  ]
};

group('1. Both single-answer formats, primary references and seven-stage bindings resolve; corrupt content fails', () => {
  assert.throws(() => batch.batch05LessonsFor(null), /Choose/);
  assert.throws(() => batch.batch05LessonsFor('unknown'), /Choose/);
  for (const variant of variants) assert.deepEqual(validator.validateBatch05Content(variant, batch.batch05LessonsFor(variant), batch.batch05Coverage, allSources, blueprint.ieltsBlueprint.requirements), []);
  const lessons = structuredClone(batch.batch05LessonsFor('academic'));
  lessons[0].reviews[0].id = lessons[0].independent.id;
  lessons[1].guided.questions[1].options = ['i'];
  lessons[1].timed.questions[1].accepted = [...lessons[1].timed.questions[0].accepted];
  lessons[0].timed.questions[0].accepted = ['A', 'B'];
  lessons[0].guided.context = lessons[0].guided.context.replace(/C\. [^\n]+/, 'D. incomplete bank');
  lessons[1].reviews[0].model = 'Early answer leak';
  lessons[0].reviews[1].context = undefined;
  const bindings = structuredClone(batch.batch05Coverage);
  bindings[0].sourceIds = ['not-an-official-source'];
  bindings[1].requirementIds = ['R06-GT'];
  bindings[1].stages.review.materialIds = [lessons[1].timed.id];
  const issues = validator.validateBatch05Content('academic', lessons, bindings, allSources, blueprint.ieltsBlueprint.requirements);
  for (const message of [/unique material/, /complete correct option bank/, /cannot be reused/, /exactly one accepted/, /complete three-option bank/, /Only the teaching model/, /Full task sheet/, /source references/, /family, skill and category/, /actual material/]) assert.ok(issues.some(issue => message.test(issue.message)), String(message));
});

group('2. Blind-reviewed single-choice and paragraph main-idea keys retain complete banks, exact evidence and no heading reuse', () => {
  assert.equal(unique.size, 18);
  assert.equal([...unique.values()].reduce((sum, material) => sum + material.questions.length, 0), 54, 'Includes models and guided items, not 54 independent exam items');
  assert.equal(Object.keys(reviewed).length, 18);
  const ownLessonIds = new Set(cases.map(({lesson}) => lesson.id));
  const previousStimuli = new Set(variants.flatMap(variant => catalog.sampleLessonsFor(variant).filter(lesson => !ownLessonIds.has(lesson.id)).flatMap(materials).map(material => material.script || material.context)));
  for (const material of unique.values()) {
    assert.deepEqual(material.questions.map(question => question.accepted.map(normal).sort()), reviewed[material.id].map(forms => forms.map(normal).sort()), material.id);
    assert.equal(previousStimuli.has(material.script || material.context), false, 'Old materials are not reused as a new type');
    const headingTask = !material.script, parsed = headingTask ? validator.batch05Headings(material.context) : null;
    if (headingTask) {
      assert.deepEqual(parsed.paragraphs.map(paragraph => paragraph.letter), ['A','B','C']);
      assert.deepEqual(parsed.headings.map(heading => heading.id), ['i','ii','iii','iv','v']);
      assert.equal(new Set(material.questions.map(question => question.accepted[0])).size, 3);
      assert.equal(parsed.headings.filter(heading => !material.questions.some(question => question.accepted[0] === heading.id)).length, 2);
      assert.match(material.instruction, /main idea/i); assert.match(material.instruction, /once/i);
      assert.doesNotMatch(material.instruction, /may use.*more than once/i);
    } else {
      const options = validator.batch05ListeningOptions(material.context);
      assert.deepEqual(options.map(option => option.id), ['A','B','C','A','B','C','A','B','C']);
      for (const start of [0,3,6]) assert.equal(new Set(options.slice(start,start+3).map(option=>normal(option.text))).size,3);
      assert.match(material.instruction, /one/i);
    }
    for (const [index, question] of material.questions.entries()) {
      assert.equal(question.accepted.length,1);
      assert.deepEqual(question.options, headingTask ? ['i','ii','iii','iv','v'] : ['A','B','C']);
      const quotes = [...question.why.matchAll(/“([^”]+)”/g)].map(match => match[1]), stimulus = material.script || material.context;
      assert.ok(quotes.length && quotes.every(quote => stimulus.includes(quote)), `${material.id}/${question.id}: quotes must be exact`);
      if (headingTask) assert.ok(quotes.some(quote => parsed.paragraphs[index].text.includes(quote)), 'A headline cannot be justified only by the heading bank');
      else assert.ok(material.context.includes(question.prompt), 'Question stems remain visible with their complete own bank');
    }
  }
});

// Register only in memory: all real engine and parser code remains unchanged on disk.
const asURL = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const injectedCatalog = asURL(`
 import {sampleLessonsFor as existing,sampleSequence,sampleMaterials} from '${await moduleURL(file('ielts-blueprint/sample-sequence.ts'))}';
 import {batch05LessonsFor} from '${await moduleURL(file('ielts-blueprint/curriculum/batch-05.ts'))}';
 export {sampleSequence,sampleMaterials};
 export const sampleLessonsFor = variant => {
   const current = existing(variant);
   return [...current,...batch05LessonsFor(variant).filter(lesson => !current.some(item => item.id===lesson.id))];
 };
 export const sampleLessonById = (variant,id) => sampleLessonsFor(variant).find(lesson => lesson.id===id);
`);
async function instrument(relative, replacements) {
  let source = stripTypeScriptTypes(await readFile(file(relative), 'utf8'));
  for (const match of [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)]) {
    if (!match[1].startsWith('.')) continue;
    const child = replacements[match[1]] || await moduleURL(path.resolve(path.dirname(file(relative)), `${match[1]}.ts`));
    source = source.replaceAll(match[0], `from '${child}'`);
  }
  return asURL(source);
}
const engineURL = await instrument('ielts-blueprint/sample-sequence-model.ts', {'./sample-sequence': injectedCatalog});
const engine = await import(engineURL);
const progress = await import(await instrument('app/ielts-sample-progress.ts', {'../ielts-blueprint/sample-sequence': injectedCatalog, '../ielts-blueprint/sample-sequence-model': engineURL}));
let clock = Date.UTC(2026, 9, 2, 9), roundTrips = 0;
const restored = state => {
  const raw = progress.serializeSampleProgress(state, clock), read = progress.readSampleProgress(raw, clock);
  const expected = structuredClone(state);
  // Saving a correction clears this optional ID; JSON has no undefined value.
  // Ignore only that known absent property, while comparing every other field exactly.
  for (const session of Object.values(expected.sessions)) if (session.reviewPromptId === undefined) delete session.reviewPromptId;
  assert.equal(read.status, 'ready', read.reason); assert.deepEqual(read.value, expected); roundTrips++; return read.value;
};
const act = (state, action, at = clock + 100) => {
  clock = Math.max(clock, at); const result = engine.transitionSample(state, action, at);
  assert.equal(result.issue, undefined, `${action.type}: ${result.issue || ''}`); return restored(result.state);
};
const deny = (state, action, at = clock + 100) => {
  clock = Math.max(clock, at); const result = engine.transitionSample(state, action, at);
  assert.ok(result.issue, `${action.type} must preserve its existing guard`); assert.strictEqual(result.state, state);
};
const openGuided = (variant, lessonId) => {
  let state = act(engine.emptySampleState(), {type: 'select-variant', variant});
  state = act(state, {type: 'open-lesson', lessonId}); return act(act(state, {type: 'next'}), {type: 'next'});
};
const heard = state => {
  const promptId = engine.activeSampleMaterial(state).id, playbackId = `batch05-${clock}`;
  for (const type of ['audio-request', 'audio-start', 'audio-end', 'audio-confirm']) state = act(state, {type, promptId, playbackId});
  return state;
};
const rawCorrect = state => {
  for (const question of engine.activeSampleMaterial(state).questions) state = act(state, {type: 'answer', questionId: question.id, value: `  ${question.accepted[0].toLowerCase().replaceAll(' ', '  ')}  `});
  return state;
};
const wrongFirst = state => {
  state = rawCorrect(state); const material = engine.activeSampleMaterial(state), question = material.questions[0];
  return act(state, {type: 'answer', questionId: question.id, value: question.options ? question.options.find(option => !question.accepted.includes(option)) : `${question.accepted[0]} extra extra`});
};

group('3. Real engine preserves single-letter answers and wrong duplicate headings with original first attempts', () => {
  for (const {variant, lesson} of cases) {
    let state = openGuided(variant, lesson.id); state = wrongFirst(state);
    if (lesson.skill === 'reading') {state = rawCorrect(state); const q=engine.activeSampleMaterial(state).questions; state=act(state,{type:'answer',questionId:q[1].id,value:q[0].accepted[0]});}
    if (lesson.skill === 'listening') {
      deny(state, {type: 'submit'});
      const promptId = engine.activeSampleMaterial(state).id, playbackId = `failed-${clock}`;
      state = act(state, {type: 'audio-request', promptId, playbackId});
      state = act(state, {type: 'audio-fail', promptId, playbackId, reason: 'Finite model test: no sound.'});
      deny(state, {type: 'submit'}); state = heard(state);
    }
    state = act(state, {type: 'submit'}); const original = structuredClone(engine.sampleSession(state).attempts[0]);
    assert.equal(original.correct, 2); assert.equal(original.total, 3); assert.equal(original.matched, false);
    assert.deepEqual(original.answers, engine.activeSampleDraft(state).answers); deny(state, {type: 'next'});
    state = act(rawCorrect(state), {type: 'submit'});
    assert.deepEqual(engine.sampleSession(state).attempts[0], original);
    assert.equal(engine.sampleSession(state).attempts.at(-1).correct, 3);
    if (lesson.skill === 'listening') assert.equal(original.playbackFailures, 1);
  }
});

group('4. Four variant/course chains retain timing, separate correction, delayed new prompts and finite review', () => {
  for (const {variant, lesson} of cases) {
    let state = openGuided(variant, lesson.id); state = rawCorrect(state);
    if (lesson.skill === 'listening') state = heard(state);
    state = act(act(state, {type: 'submit'}), {type: 'next'});
    assert.equal(engine.activeSampleMaterial(state).id, lesson.independent.id);
    state = act(state, {type: 'confirm-unseen', value: true}); state = rawCorrect(state);
    if (lesson.skill === 'listening') state = heard(state);
    state = act(act(state, {type: 'submit'}), {type: 'next'});
    deny(state, {type: 'answer', questionId: lesson.timed.questions[0].id, value: 'premature'});
    state = act(state, {type: 'start-timed'}); state = act(state, {type: 'confirm-unseen', value: true}); state = wrongFirst(state);
    if (lesson.skill === 'listening') state = heard(state);
    state = act(state, {type: 'submit'}, engine.activeSampleDraft(state).startedAt + lesson.timed.seconds * 1000 + 1);
    const timed = structuredClone(engine.sampleSession(state).attempts.at(-1));
    assert.equal(timed.withinTrainingTime, false); assert.equal(timed.correct, 2);
    state = act(state, {type: 'next'}); state = act(state, {type: 'correction-note', value: 'I checked the source, task instruction and each item separately.'});
    for (const question of lesson.timed.questions) state = act(state, {type: 'correction-answer', questionId: question.id, value: question.accepted[0]});
    const first = lesson.timed.questions[0];
    state = act(state, {type: 'correction-answer', questionId: first.id, value: 'not-the-source'}); deny(state, {type: 'save-correction'});
    state = act(state, {type: 'correction-answer', questionId: first.id, value: first.accepted[0]}); state = act(state, {type: 'save-correction'});
    assert.deepEqual(engine.sampleSession(state).attempts.find(attempt => attempt.stage === 'timed'), timed);
    const day = 24 * 60 * 60 * 1000;
    assert.equal(engine.sampleReviewDueAt(engine.sampleSession(state)), engine.sampleSession(state).correctedAt + day);
    deny(state, {type: 'start-review'}, engine.sampleSession(state).correctedAt + day - 1);
    for (const [index, review] of lesson.reviews.entries()) {
      const session = engine.sampleSession(state), previous = session.attempts.filter(attempt => attempt.stage === 'review').at(-1);
      const due = Math.max(session.correctedAt, previous?.at || 0) + day;
      assert.equal(engine.sampleReviewDueAt(session), due);
      state = act(state, {type: 'start-review'}, due);
      assert.equal(engine.activeSampleMaterial(state).id, review.id); state = act(state, {type: 'confirm-unseen', value: true});
      if (index) state = act(state, {type: 'hint'});
      state = rawCorrect(state); if (lesson.skill === 'listening') state = heard(state); state = act(state, {type: 'submit'});
      assert.equal(engine.sampleLessonReceipt(state, clock).delayed, index ? 'assisted' : 'local-target-observed');
      assert.equal(engine.sampleLessonReceipt(state, clock).band, null); assert.equal(engine.sampleLessonReceipt(state, clock).mastery, 'not-assessed');
    }
    deny(state, {type: 'start-review'}, engine.sampleReviewDueAt(engine.sampleSession(state)));
    assert.equal(engine.sampleLessonReceipt(state, clock).freshReviewAvailable, false);
    if (variant === 'academic' && lesson.skill === 'listening') {
      state = act(state, {type: 'select-variant', variant: 'general-training'}); state = act(state, {type: 'open-lesson', lessonId: lesson.id});
      state = act(act(state, {type: 'next'}), {type: 'next'}); state = act(state, {type: 'confirm-unseen', value: true});
      state = act(heard(rawCorrect(state)), {type: 'submit'}); assert.equal(engine.sampleSession(state).attempts[0].fresh, false);
    }
  }
});

group('5. Dynamic combined catalog capacity round-trips every legal session without changing actual registration', () => {
  let state = engine.emptySampleState();
  for (const variant of variants) {
    state = act(state, {type: 'select-variant', variant});
    assert.equal(targetLessons(variant).length, new Set([...catalog.sampleLessonsFor(variant),...batch.batch05LessonsFor(variant)].map(lesson=>lesson.id)).size);
    for (const lesson of targetLessons(variant)) {
      state = act(state, {type: 'open-lesson', lessonId: lesson.id});
      state = act(state, {type: 'next'}); // Opening alone is read only; the model step creates its actual session/draft.
    }
  }
  assert.equal(Object.keys(state.sessions).length, variants.reduce((sum,variant)=>sum+targetLessons(variant).length,0));
  const raw = progress.serializeSampleProgress(state, clock), corrupt = JSON.parse(raw);
  corrupt.value.sessions['academic:not-a-course'] = structuredClone(Object.values(state.sessions)[0]);
  assert.equal(progress.readSampleProgress(JSON.stringify(corrupt), clock).status, 'blocked');
  assert.equal(progress.readSampleProgress(raw, clock).raw, raw);
  const targetIDs=new Set(variants.flatMap(variant=>targetLessons(variant).flatMap(materials).map(material=>material.id)));
  const currentIDs=new Set(variants.flatMap(variant=>catalog.sampleLessonsFor(variant).flatMap(materials).map(material=>material.id)));
  assert.equal(targetIDs.size,currentIDs.size+[...unique.keys()].filter(id=>!currentIDs.has(id)).length);
  assert.deepEqual(variants.map(variant => catalog.sampleLessonsFor(variant).length), catalogCountsBefore);
  assert.equal(readFileSync(file('ielts-blueprint/sample-sequence.ts'), 'utf8'), catalogRawBefore, 'The test does not write actual registration; owner may register this batch without duplicate injection');
});

group('6. Variant identities, candidate status, complete task presentation and official assessment boundaries stay explicit', () => {
  assert.equal(blueprint.ieltsBlueprint.requirements.length,100);
  const a=batch.batch05LessonsFor('academic'),gt=batch.batch05LessonsFor('general-training');
  assert.strictEqual(a[0],gt[0]);
  const aIds=new Set(materials(a[1]).map(material=>material.id));assert.ok(materials(gt[1]).every(material=>!aIds.has(material.id)));
  assert.equal(new Set([...unique.values()].map(material=>material.script||material.context)).size,18);
  const forbidden=/\b(?:L01|R06|TTS|schema|namespace|catalog)\b|尚未接入|课程投影|correct\/total|参考字符串|抓取失败/;
  for(const {lesson} of cases) for(const text of [lesson.title,lesson.goal,lesson.boundary,...lesson.explanation,...materials(lesson).flatMap(material=>[material.instruction,material.hint,...material.checklist,...(material.modelNotes||[]),...material.questions.flatMap(question=>[question.prompt,question.why])])]) assert.equal(forbidden.test(text),false,lesson.id);
  for(const binding of batch.batch05Coverage){assert.equal(binding.integrationStatus,'pending-owner-integration');assert.equal(binding.contentStatus,'authored-not-expert-reviewed');}
  assert.equal(batch.batch05ResponseContract.rawAnswer,'preserved-string');assert.equal(batch.batch05ResponseContract.band,null);
  assert.equal(batch.batch05ResponseContract.headingReuse,'not-permitted');
  assert.ok(batch.batch05AdditionalSources.every(source=>source.verification==='direct-open'));
  assert.equal(catalog.sampleSequence.id,'willow-hub-four-lessons');assert.equal(catalog.sampleSequence.version,1);
  // The real existing renderer always displays context and retains it with the original attempt.
  const ui=readFileSync(file('ielts-blueprint/sample-sequence-ui.tsx'),'utf8');
  assert.match(ui,/native\?\(m\.script\?undefined:native\.stimulus\):m\.context/);
  assert.match(ui,/context\(m, true\)/);assert.match(ui,/q\.options\.map/);
  assert.match(ui,/value: event\.target\.value/);
});

console.log(`IELTS batch 05: 6 groups passed; 18 original materials / 54 authored items; ${roundTrips} real parser round trips with in-memory registration. Production integration, browser, actual audio and real 24h retention are unverified.`);
