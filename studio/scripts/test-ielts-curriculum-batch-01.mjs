import assert from 'node:assert/strict';
import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';
import {loadTypeScript, moduleURL} from './ielts-blueprint-loader.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = relative => path.join(root, relative);
const [batch, validation, sources, blueprint, catalog] = await Promise.all([
  loadTypeScript(file('ielts-blueprint/curriculum/batch-01.ts')),
  loadTypeScript(file('ielts-blueprint/curriculum/validation.ts')),
  loadTypeScript(file('ielts-blueprint/sources.ts')),
  loadTypeScript(file('ielts-blueprint/blueprint.ts')),
  loadTypeScript(file('ielts-blueprint/sample-sequence.ts')),
]);
const variants = ['academic', 'general-training'];
const materials = lesson => [lesson.model, lesson.guided, lesson.independent, lesson.timed, ...lesson.reviews];
const cases = variants.flatMap(variant => batch.batch01LessonsFor(variant).map(lesson => ({variant, lesson})));
const allSources = [...sources.officialSources, ...batch.batch01AdditionalSources];
const uniqueMaterials = new Map(cases.flatMap(({lesson}) => materials(lesson).map(material => [material.id, material])));
const normal = text => text.trim().replace(/\s+/g, ' ').toLowerCase();
const group = (name, run) => {run(); console.log(`PASS ${name}`);};

// Independently checked against the authored recording, including rejected nearby distractors.
const listeningReview = {
  'ielts-l07-model': {answers: ['Newton', 'Saturday', '10:30', 'lamp'], rejects: ['Newten', 'Friday', '10:15', 'laptop']},
  'ielts-l07-guided': {answers: ['Wells', 'Tuesday', '12', 'helmet'], rejects: ['Wels', 'Friday', '15', 'lights']},
  'ielts-l07-independent': {answers: ['Morris', 'morning', '6', 'sorting'], rejects: ['Moris', 'afternoon', '8', 'shelving']},
  'ielts-l07-timed': {answers: ['Sutton', '14:20', 'vegetarian', 'apron'], rejects: ['Suton', '14:00', 'fish', 'gloves']},
  'ielts-l07-review-a': {answers: ['Reed', 'adult', 'west', '6'], rejects: ['Reid', 'family', 'main', '8']},
  'ielts-l07-review-b': {answers: ['Patel', 'Sunday', 'spade', '2'], rejects: ['Patell', 'Saturday', 'forks', '3']},
};

// Final keys after independent semantic review (not a strict blind or expert review).
// These freeze the reviewed verdicts; the test does not infer meaning automatically.
const readingReview = {
  'ielts-r04-a-model': ['NO', 'YES', 'NOT GIVEN'],
  'ielts-r04-a-guided': ['NO', 'NOT GIVEN', 'YES'],
  'ielts-r04-a-independent': ['NO', 'YES', 'YES'],
  'ielts-r04-a-timed': ['NO', 'NOT GIVEN', 'YES'],
  'ielts-r04-a-review-a': ['NO', 'YES', 'NOT GIVEN'],
  'ielts-r04-a-review-b': ['NOT GIVEN', 'NOT GIVEN', 'YES'],
  'ielts-r04-gt-model': ['NO', 'YES', 'NOT GIVEN'],
  'ielts-r04-gt-guided': ['YES', 'NOT GIVEN', 'NO'],
  'ielts-r04-gt-independent': ['YES', 'NO', 'YES'],
  'ielts-r04-gt-timed': ['YES', 'NO', 'NOT GIVEN'],
  'ielts-r04-gt-review-a': ['NOT GIVEN', 'NO', 'YES'],
  'ielts-r04-gt-review-b': ['YES', 'NOT GIVEN', 'NOT GIVEN'],
};

group('1. Content, official requirement and seven-stage bindings resolve; corrupt references fail', () => {
  for (const variant of variants) assert.deepEqual(validation.validateCurriculumContent(variant, batch.batch01LessonsFor(variant), batch.batch01Coverage, allSources, blueprint.ieltsBlueprint.requirements), []);
  assert.throws(() => batch.batch01LessonsFor(null), /Choose/);
  const lessons = structuredClone(batch.batch01LessonsFor('academic'));
  lessons[0].reviews[0].id = lessons[0].independent.id;
  assert.ok(validation.validateCurriculumContent('academic', lessons, batch.batch01Coverage, allSources, blueprint.ieltsBlueprint.requirements).some(issue => /duplicate material/.test(issue.message)));
  const broken = structuredClone(batch.batch01Coverage);
  broken[0].sourceIds = ['nonexistent-primary-source'];
  broken[1].stages.review.materialIds = [lessons[0].timed.id];
  broken[1].requirementIds = ['R04-GT'];
  const issues = validation.validateCurriculumContent('academic', batch.batch01LessonsFor('academic'), broken, allSources, blueprint.ieltsBlueprint.requirements);
  assert.ok(issues.some(issue => /Official source/.test(issue.message)));
  assert.ok(issues.some(issue => /Requirement ID/.test(issue.message)));
  assert.ok(issues.some(issue => issue.path.endsWith('.review')));
});

group('2. All 24 form answers obey the printed field policy, source evidence and distractor checks', () => {
  for (const material of materials(batch.batch01LessonsFor('academic')[0])) {
    const reviewed = listeningReview[material.id];
    assert.deepEqual(material.questions.map(question => question.accepted[0]), reviewed.answers, material.id);
    assert.equal(material.questions.length, 4);
    assert.match(material.instruction, /^Complete the form\./);
    assert.match(material.context, /FORM/);
    assert.match(material.context, /____/);
    const wordCount = material.script.trim().split(/\s+/).length;
    assert.ok(wordCount >= 60 && wordCount <= 100, `${material.id}: short authored script, not an audio quality test`);
    material.questions.forEach((question, index) => {
      assert.ok(question.prompt.startsWith(`${index + 1}. `));
      assert.ok(material.context.includes(`${index + 1}. `));
      assert.match(question.prompt, /ONE (WORD|NUMBER)/);
      assert.ok(!question.accepted.map(normal).includes(normal(reviewed.rejects[index])));
      for (const answer of question.accepted) {
        if (question.prompt.includes('ONE WORD')) {
          assert.match(answer, /^[A-Za-z]+$/);
          assert.ok(material.script.toLowerCase().includes(answer.toLowerCase()));
          assert.ok(!question.accepted.map(normal).includes(normal(`the ${answer}`)), 'An extra word is not accepted');
          assert.ok(!material.hint.toLowerCase().includes(answer.toLowerCase()), 'The method hint does not supply the field answer');
        } else if (question.prompt.includes('HH:MM')) assert.match(answer, /^\d{2}:\d{2}$/);
        else assert.match(answer, /^\d+$/);
      }
      const quotes = [...question.why.matchAll(/“([^”]+)”/g)].map(match => match[1]);
      assert.ok(quotes.length > 0 && quotes.every(quote => material.script.includes(quote)), `${material.id}/${question.id}: exact original-script evidence`);
    });
    assert.equal(material.seconds, 180, 'Local training budget, not official question timing');
  }
});

group('3. Reviewed writer-view verdicts, source quotations and evidence order remain faithful', () => {
  assert.equal(Object.keys(readingReview).length, 12, 'Freeze all 12 independently reviewed passage keys');
  for (const {variant, lesson} of cases.filter(item => item.lesson.skill === 'reading')) {
    const patterns = new Set();
    for (const material of materials(lesson)) {
      assert.deepEqual(material.questions.map(question => question.accepted[0]), readingReview[material.id], material.id);
      assert.ok(material.id.startsWith(variant === 'academic' ? 'ielts-r04-a-' : 'ielts-r04-gt-'));
      const words = material.context.trim().split(/\s+/).length;
      assert.ok(words >= 80 && words <= 150, material.id);
      assert.equal(material.questions.length, 3);
      assert.equal(material.seconds, 150);
      let previous = -1;
      for (const question of material.questions) {
        assert.deepEqual(question.options, ['YES', 'NO', 'NOT GIVEN']);
        const quotes = [...question.why.matchAll(/“([^”]+)”/g)].map(match => match[1]);
        assert.ok(quotes.every(quote => material.context.includes(quote)), `${question.id}: exact authored-passage quote`);
        if (question.accepted[0] === 'NOT GIVEN') {
          assert.match(question.why, /没有|未|不能/);
        } else {
          assert.ok(quotes.length, `${question.id}: affirmative or opposing source evidence`);
          const position = Math.min(...quotes.map(quote => material.context.indexOf(quote)));
          assert.ok(position >= previous, `${material.id}: supported statements follow the passage, not a shuffled answer pattern`);
          previous = position;
        }
      }
      patterns.add(material.questions.map(question => question.accepted[0]).sort().join('|'));
    }
    assert.ok(patterns.size > 1, `${variant}: the independent bank cannot always be solved by assuming exactly one of each answer`);
  }
});

group('4. Variant exposure identities and genuinely different stage stimuli are retained', () => {
  assert.equal(uniqueMaterials.size, 18, 'One shared listening bank and two separate reading banks');
  assert.equal([...uniqueMaterials.values()].reduce((total, material) => total + material.questions.length, 0), 60, 'Authored count includes model and guided questions, not 60 independent test questions');
  const a = batch.batch01LessonsFor('academic'), gt = batch.batch01LessonsFor('general-training');
  assert.strictEqual(a[0], gt[0], 'Changing variant does not manufacture fresh listening prompts');
  assert.equal(a[1].id, gt[1].id, 'Shared course identity; distinct variant session and materials');
  const academicIds = new Set(materials(a[1]).map(material => material.id));
  assert.ok(materials(gt[1]).every(material => !academicIds.has(material.id)));
  assert.equal(new Set([...uniqueMaterials.values()].map(material => material.script || material.context)).size, 18);
  for (const {lesson} of cases) for (const material of [lesson.guided, lesson.independent, lesson.timed, ...lesson.reviews]) {
    assert.equal(material.model, undefined);
    assert.equal(material.modelNotes, undefined);
  }
});

// Load the exact existing engine and replace ONLY its catalog import in memory.
// This is a data compatibility test. Production catalog/save/Today integration is still pending.
const asURL = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const catalogOverride = asURL(`
  import {sampleLessonById as existing} from '${await moduleURL(file('ielts-blueprint/sample-sequence.ts'))}';
  import {batch01LessonsFor} from '${await moduleURL(file('ielts-blueprint/curriculum/batch-01.ts'))}';
  export const sampleLessonById = (variant, id) => existing(variant, id) || batch01LessonsFor(variant).find(lesson => lesson.id === id);
`);
const engineSource = stripTypeScriptTypes(await readFile(file('ielts-blueprint/sample-sequence-model.ts'), 'utf8'));
assert.match(engineSource, /from\s+['"]\.\/sample-sequence['"]/);
const engine = await import(asURL(engineSource.replace(/from\s+['"]\.\/sample-sequence['"]/, `from '${catalogOverride}'`)));
let clock = Date.UTC(2026, 9, 1, 8);
const act = (state, action, at = (clock += 100)) => {
  const result = engine.transitionSample(state, action, at);
  assert.equal(result.issue, undefined, `${action.type}: ${result.issue || ''}`);
  return result.state;
};
const deny = (state, action, at = (clock += 100)) => {
  const result = engine.transitionSample(state, action, at);
  assert.ok(result.issue, `Expected ${action.type} to be refused`);
  assert.strictEqual(result.state, state, 'Refused action preserves original state');
};
const answer = (state, wrong = false) => {
  for (const question of engine.activeSampleMaterial(state).questions) state = act(state, {type: 'answer', questionId: question.id, value: wrong ? 'not the answer' : `  ${question.accepted[0].toUpperCase()}  `});
  return state;
};
const heard = state => {
  const promptId = engine.activeSampleMaterial(state).id, playbackId = `play-${clock}`;
  for (const type of ['audio-request', 'audio-start', 'audio-end', 'audio-confirm']) state = act(state, {type, promptId, playbackId});
  return state;
};

group('5. Real existing engine accepts all four variant/course chains with original answers and delayed new reviews', () => {
  for (const {variant, lesson} of cases) {
    let state = act(engine.emptySampleState(), {type: 'select-variant', variant});
    state = act(state, {type: 'open-lesson', lessonId: lesson.id});
    assert.equal(engine.sampleSession(state).stage, 'explain');
    state = act(state, {type: 'next'});
    assert.equal(engine.activeSampleMaterial(state).id, lesson.model.id);
    deny(state, {type: 'submit'});
    state = act(state, {type: 'next'});
    state = answer(state, true);
    if (lesson.skill === 'listening') {
      deny(state, {type: 'submit'});
      const promptId = engine.activeSampleMaterial(state).id, failedId = `failed-${clock}`;
      state = act(state, {type: 'audio-request', playbackId: failedId, promptId});
      state = act(state, {type: 'audio-fail', playbackId: failedId, promptId, reason: 'simulated unavailable voice'});
      deny(state, {type: 'submit'});
      const playbackId = `ended-${clock}`;
      for (const type of ['audio-request', 'audio-start', 'audio-end']) state = act(state, {type, playbackId, promptId});
      deny(state, {type: 'submit'});
      state = act(state, {type: 'audio-confirm', playbackId, promptId});
    }
    state = act(state, {type: 'submit'});
    const first = structuredClone(engine.sampleSession(state).attempts[0]);
    assert.equal(first.matched, false);
    assert.equal(first.total, lesson.guided.questions.length);
    if (lesson.skill === 'listening') {
      assert.equal(first.audioUsable, true);
      assert.equal(first.playbackFailures, 1);
      assert.equal(first.playbackCount, 2, 'The failed request is retained alongside ended/audible playback');
    }
    deny(state, {type: 'next'});
    state = answer(state);
    state = act(state, {type: 'submit'});
    assert.deepEqual(engine.sampleSession(state).attempts[0], first, 'A corrected guided answer does not overwrite its original');
    state = act(state, {type: 'next'});
    assert.equal(engine.activeSampleMaterial(state).id, lesson.independent.id);
    state = act(state, {type: 'confirm-unseen', value: true});
    state = answer(state);
    if (lesson.skill === 'listening') state = heard(state);
    state = act(state, {type: 'submit'});
    assert.equal(engine.sampleSession(state).attempts.at(-1).fresh, true);
    state = act(state, {type: 'next'});
    deny(state, {type: 'answer', questionId: lesson.timed.questions[0].id, value: 'early answer'});
    state = act(state, {type: 'start-timed'});
    state = act(state, {type: 'confirm-unseen', value: true});
    state = answer(state, true);
    if (lesson.skill === 'listening') state = heard(state);
    state = act(state, {type: 'submit'});
    const timed = structuredClone(engine.sampleSession(state).attempts.at(-1));
    assert.equal(timed.withinTrainingTime, true);
    assert.equal(timed.matched, false);
    state = act(state, {type: 'next'});
    for (const question of lesson.timed.questions) state = act(state, {type: 'correction-answer', questionId: question.id, value: question.accepted[0]});
    state = act(state, {type: 'correction-note', value: 'I checked the source claim, its scope and the requested field.'});
    state = act(state, {type: 'save-correction'});
    assert.deepEqual(engine.sampleSession(state).attempts.find(attempt => attempt.stage === 'timed'), timed);
    deny(state, {type: 'start-review'}, engine.sampleReviewDueAt(engine.sampleSession(state)) - 1);
    for (const [index, review] of lesson.reviews.entries()) {
      clock = Math.max(clock + 100, engine.sampleReviewDueAt(engine.sampleSession(state)));
      state = act(state, {type: 'start-review'}, clock);
      assert.equal(engine.activeSampleMaterial(state).id, review.id);
      state = act(state, {type: 'confirm-unseen', value: true});
      if (index === 1) state = act(state, {type: 'hint'});
      state = answer(state);
      if (lesson.skill === 'listening') state = heard(state);
      state = act(state, {type: 'submit'});
      assert.equal(engine.sampleLessonReceipt(state, clock).delayed, index === 0 ? 'local-target-observed' : 'assisted');
      assert.equal(engine.sampleLessonReceipt(state, clock).band, null);
      assert.equal(engine.sampleLessonReceipt(state, clock).mastery, 'not-assessed');
    }
    clock = engine.sampleReviewDueAt(engine.sampleSession(state));
    deny(state, {type: 'start-review'}, clock);
    assert.equal(engine.sampleLessonReceipt(state, clock).freshReviewAvailable, false);
    if (lesson.skill === 'listening' && variant === 'academic') {
      // The other variant cannot re-label the same listening exposure as new.
      state = act(state, {type: 'select-variant', variant: 'general-training'});
      state = act(state, {type: 'open-lesson', lessonId: lesson.id});
      state = act(act(state, {type: 'next'}), {type: 'next'});
      state = act(state, {type: 'confirm-unseen', value: true});
      state = heard(answer(state));
      state = act(state, {type: 'submit'});
      assert.equal(engine.sampleSession(state).attempts[0].fresh, false);
    }
  }
});

group('6. Metadata stays unregistered/ungraded and the original four-course identities still exist', () => {
  assert.equal(catalog.sampleSequence.id, 'willow-hub-four-lessons');
  assert.equal(catalog.sampleSequence.version, 1);
  for (const variant of variants) for (const id of ['hub-listening', 'hub-reading', 'hub-speaking', 'hub-writing']) assert.ok(catalog.sampleLessonById(variant, id), `Legacy ${variant}/${id} is preserved`);
  for (const item of batch.batch01Coverage) {
    assert.equal(item.integrationStatus, 'pending-owner-integration');
    assert.equal(item.contentStatus, 'authored-not-expert-reviewed');
    assert.equal(item.rights, 'original-fictional');
    assert.ok(!Object.hasOwn(item, 'band') && !Object.hasOwn(item, 'mastery'), 'Content metadata has no learner outcome');
  }
});

console.log('IELTS batch 01: 6 groups passed; 18 original materials / 60 authored questions. Catalog, save, Today, browser, audio and real 24h acceptance are separate.');
