import assert from 'node:assert/strict';
import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {stripTypeScriptTypes} from 'node:module';
import {loadTypeScript, moduleURL} from './ielts-blueprint-loader.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), file = relative => path.join(root, relative);
const [batch, projection, validation, sources, blueprint, catalog] = await Promise.all([
  loadTypeScript(file('ielts-blueprint/curriculum/batch-02.ts')),
  loadTypeScript(file('ielts-blueprint/curriculum/multi-select/projection.ts')),
  loadTypeScript(file('ielts-blueprint/curriculum/multi-select/validation.ts')),
  loadTypeScript(file('ielts-blueprint/sources.ts')),
  loadTypeScript(file('ielts-blueprint/blueprint.ts')),
  loadTypeScript(file('ielts-blueprint/sample-sequence.ts')),
]);
const variants = ['academic', 'general-training'];
const materials = lesson => [lesson.model, lesson.guided, lesson.independent, lesson.timed, ...lesson.reviews];
const cases = variants.flatMap(variant => batch.batch02NativeLessonsFor(variant).map(native => ({variant, native, lesson: projection.projectMultiSelectLesson(native)})));
const unique = new Map(cases.flatMap(({native}) => materials(native).map(material => [material.id, material])));
const sourceIds = new Set([...sources.officialSources, ...batch.batch02AdditionalSources].map(source => source.id));
const group = (name, run) => {run(); console.log(`PASS ${name}`);};

// Keys frozen only after a source/options-only independent pass, before revealing author keys.
// This is finite content review, not expert calibration or automated meaning inference.
const reviewed = {
  'ielts-l02-model': ['A', 'C'], 'ielts-l02-guided': ['B', 'D', 'F'],
  'ielts-l02-independent': ['B', 'E'], 'ielts-l02-timed': ['A', 'D'],
  'ielts-l02-review-a': ['A', 'C', 'F'], 'ielts-l02-review-b': ['B', 'D'],
  'ielts-r02-a-model': ['A', 'D', 'F'], 'ielts-r02-a-guided': ['B', 'E'],
  'ielts-r02-a-independent': ['A', 'C'], 'ielts-r02-a-timed': ['B', 'C', 'E'],
  'ielts-r02-a-review-a': ['B', 'D'], 'ielts-r02-a-review-b': ['C', 'E'],
  'ielts-r02-gt-model': ['A', 'D'], 'ielts-r02-gt-guided': ['B', 'D', 'F'],
  'ielts-r02-gt-independent': ['B', 'E'], 'ielts-r02-gt-timed': ['A', 'C', 'E'],
  'ielts-r02-gt-review-a': ['C', 'E'], 'ielts-r02-gt-review-b': ['A', 'C'],
};
const wrongInputs = task => {
  const correct = task.correctOptionIds, wrong = task.options.find(option => !correct.includes(option.id)).id;
  return [correct[0], Array(task.selectionCount).fill(correct[0]).join(' '), [...correct, wrong].join(' '), [...correct.slice(0, -1), 'Z'].join(' '), [...correct.slice(0, -1), wrong].join(' '), correct.join(','), correct.join(''), `${correct.join(' ')} please`];
};

group('1. Native complete sets, original stimuli, official references and seven-stage bindings validate', () => {
  assert.throws(() => batch.batch02LessonsFor(null), /Choose/);
  for (const {variant, native, lesson} of cases) {
    assert.deepEqual(validation.validateMultiSelectLesson(native), []);
    const binding = batch.batch02Coverage.find(item => item.lessonId === native.id && item.variants.includes(variant));
    assert.ok(binding);
    assert.ok(binding.sourceIds.length && binding.sourceIds.every(id => sourceIds.has(id)));
    assert.ok(binding.requirementIds.every(id => blueprint.ieltsBlueprint.requirements.some(requirement => requirement.id === id && requirement.variants.includes(variant) && requirement.skill === lesson.skill)));
    const expected = {explain: [], model: [lesson.model.id], guided: [lesson.guided.id], independent: [lesson.independent.id], timed: [lesson.timed.id], feedback: [lesson.independent.id, lesson.timed.id], review: lesson.reviews.map(material => material.id)};
    assert.deepEqual(Object.keys(binding.stages), Object.keys(expected));
    for (const [stage, ids] of Object.entries(expected)) assert.deepEqual(binding.stages[stage].materialIds, ids);
  }
  const bad = structuredClone(cases[0].native);
  bad.model.task.correctOptionIds = [bad.model.task.correctOptionIds[0], bad.model.task.correctOptionIds[0]];
  bad.reviews[0].stimulus = bad.independent.stimulus;
  bad.timed.task.options[0].quotes = ['not present in the source'];
  const issues = validation.validateMultiSelectLesson(bad);
  assert.ok(issues.some(issue => /complete answer|only the supported/.test(issue.message)));
  assert.ok(issues.some(issue => /distinct original/.test(issue.message)));
  assert.ok(issues.some(issue => /Evidence must quote/.test(issue.message)));
});

group('2. All 18 reviewed answer sets and 96 option rationales stay linked to their actual source', () => {
  assert.equal(unique.size, 18);
  assert.equal([...unique.values()].reduce((sum, material) => sum + material.task.options.length, 0), 96);
  assert.equal([...unique.values()].reduce((sum, material) => sum + material.task.selectionCount, 0), 42, 'Authored selections, not official marks or 42 independent questions');
  for (const material of unique.values()) {
    assert.deepEqual([...material.task.correctOptionIds].sort(), reviewed[material.id]);
    assert.deepEqual(material.task.options.filter(option => option.judgment === 'supported').map(option => option.id), reviewed[material.id]);
    assert.equal(material.seconds, 180);
    const words = material.stimulus.trim().split(/\s+/).length;
    assert.ok(material.id.startsWith('ielts-l02') ? words >= 70 && words <= 100 : words >= 100 && words <= 160);
    for (const option of material.task.options) {
      assert.ok(option.reason.trim());
      assert.ok(option.quotes.every(quote => material.stimulus.includes(quote)), `${material.id}/${option.id}`);
    }
  }
});

group('3. Text projection renders every choice and visibly teaches the whole set without a single-select', () => {
  for (const {native, lesson} of cases) for (const [index, material] of materials(lesson).entries()) {
    const original = materials(native)[index], question = material.questions[0];
    assert.equal(material.questions.length, 1, 'One complete multi-answer group, not one chosen letter');
    assert.equal(question.options, undefined, 'Existing options would incorrectly render a single-select');
    assert.equal(question.id, original.task.id);
    assert.match(material.instruction, /all selected letters.*separated by spaces/i);
    for (const option of original.task.options) {
      assert.ok(material.context.includes(`${option.id}. ${option.text}`));
      assert.ok(question.why.includes(`${option.id}：${option.reason}`), 'Feedback explains excluded choices as well as selected choices');
    }
    if (index === 0) for (const note of original.modelNotes) assert.ok(question.why.includes(note), 'Existing objective model UI displays why, not modelNotes');
    else assert.equal(material.model, undefined);
    if (native.skill === 'listening') {
      assert.equal(material.script, original.stimulus);
      assert.ok(!material.context.includes(original.stimulus));
    } else assert.ok(material.context.startsWith(original.stimulus));
  }
});

// Compatibility harness: import the unchanged real engine, override its catalog in memory only.
const asURL = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const injectedCatalog = asURL(`
  import {sampleLessonById as existing} from '${await moduleURL(file('ielts-blueprint/sample-sequence.ts'))}';
  import {batch02LessonsFor} from '${await moduleURL(file('ielts-blueprint/curriculum/batch-02.ts'))}';
  export const sampleLessonById = (variant, id) => existing(variant, id) || batch02LessonsFor(variant).find(lesson => lesson.id === id);
`);
const engineSource = stripTypeScriptTypes(await readFile(file('ielts-blueprint/sample-sequence-model.ts'), 'utf8'));
assert.match(engineSource, /from\s+['"]\.\/sample-sequence['"]/);
const engine = await import(asURL(engineSource.replace(/from\s+['"]\.\/sample-sequence['"]/, `from '${injectedCatalog}'`)));
let clock = Date.UTC(2026, 9, 1, 8);
const act = (state, action, at = (clock += 100)) => {
  const result = engine.transitionSample(state, action, at); assert.equal(result.issue, undefined, `${action.type}: ${result.issue || ''}`); return result.state;
};
const deny = (state, action, at = (clock += 100)) => {const result = engine.transitionSample(state, action, at); assert.ok(result.issue); assert.strictEqual(result.state, state);};
const openGuided = (variant, lessonId) => {
  let state = act(engine.emptySampleState(), {type: 'select-variant', variant});
  state = act(state, {type: 'open-lesson', lessonId});
  return act(act(state, {type: 'next'}), {type: 'next'});
};
const heard = state => {
  const promptId = engine.activeSampleMaterial(state).id, playbackId = `play-${clock}`;
  for (const type of ['audio-request', 'audio-start', 'audio-end', 'audio-confirm']) state = act(state, {type, promptId, playbackId});
  return state;
};
const answer = (state, raw) => act(state, {type: 'answer', questionId: engine.activeSampleMaterial(state).questions[0].id, value: raw});
const correct = state => answer(state, engine.activeSampleMaterial(state).questions[0].accepted[0]);

function matchingCheckpoints(variant, lesson) {
  let state = openGuided(variant, lesson.id);
  const checkpoints = new Map();
  for (const stage of ['guided', 'independent', 'timed']) {
    if (stage === 'timed') state = act(state, {type: 'start-timed'});
    if (lesson.skill === 'listening') state = heard(state);
    checkpoints.set(engine.activeSampleMaterial(state).id, structuredClone(state));
    state = act(correct(state), {type: 'submit'});
    state = act(state, {type: 'next'});
  }
  const question = lesson.timed.questions[0];
  state = act(state, {type: 'correction-answer', questionId: question.id, value: question.accepted[0]});
  state = act(state, {type: 'correction-note', value: 'I checked the complete set and its separate source evidence.'});
  state = act(state, {type: 'save-correction'});
  for (const review of lesson.reviews) {
    clock = Math.max(clock + 100, engine.sampleReviewDueAt(engine.sampleSession(state)));
    state = act(state, {type: 'start-review'}, clock);
    if (lesson.skill === 'listening') state = heard(state);
    checkpoints.set(review.id, structuredClone(state));
    state = act(correct(state), {type: 'submit'});
  }
  return checkpoints;
}

group('4. Real matching accepts every complete permutation and retains wrong count/duplicates/unknown raw answers', () => {
  for (const {variant, native, lesson} of cases) {
    const checkpoints = matchingCheckpoints(variant, lesson);
    for (const material of materials(native)) {
      const task = material.task, permutations = projection.completeSetAnswers(task);
      assert.equal(permutations.length, task.selectionCount === 2 ? 2 : 6);
      for (const accepted of permutations) {
        const raw = `  ${accepted.toLowerCase().replaceAll(' ', '  ')}  `;
        assert.equal(projection.inspectMultiSelectEntry(task, raw).matches, true);
        const checkpoint = checkpoints.get(material.id);
        // Teaching models are not submitted. Every actual practice/review permutation
        // is checked from a checkpoint reached through the unchanged real flow.
        if (checkpoint) {
          const next = act(answer(checkpoint, raw), {type: 'submit'}), result = engine.sampleSession(next).attempts.at(-1);
          assert.equal(result.matched, true);
          assert.equal(result.correct, 1); assert.equal(result.total, 1);
          assert.equal(result.answers[task.id], raw);
        }
      }
      for (const raw of wrongInputs(task)) {
        assert.equal(projection.inspectMultiSelectEntry(task, raw).matches, false);
        const checkpoint = checkpoints.get(material.id);
        if (checkpoint) {
          const next = act(answer(checkpoint, raw), {type: 'submit'}), result = engine.sampleSession(next).attempts.at(-1);
          assert.equal(result.matched, false); assert.equal(result.correct, 0); assert.equal(result.total, 1);
          assert.equal(result.answers[task.id], raw, 'No silent extraction, deduplication, truncation to one letter or sorting');
          if (result.stage === 'guided') deny(next, {type: 'next'});
        }
      }
    }
  }
});

group('5. Four actual variant/course flows preserve first answers, timing, correction and delayed new groups', () => {
  for (const {variant, native, lesson} of cases) {
    let state = openGuided(variant, lesson.id);
    state = answer(state, native.guided.task.correctOptionIds[0]);
    if (lesson.skill === 'listening') {deny(state, {type: 'submit'}); state = heard(state);}
    state = act(state, {type: 'submit'});
    const first = structuredClone(engine.sampleSession(state).attempts[0]);
    assert.equal(first.matched, false); deny(state, {type: 'next'});
    state = act(correct(state), {type: 'submit'});
    assert.deepEqual(engine.sampleSession(state).attempts[0], first);
    state = act(state, {type: 'next'});
    assert.equal(engine.activeSampleMaterial(state).id, lesson.independent.id);
    state = act(state, {type: 'confirm-unseen', value: true});
    state = correct(state); if (lesson.skill === 'listening') state = heard(state);
    state = act(state, {type: 'submit'});
    state = act(state, {type: 'next'});
    deny(state, {type: 'answer', questionId: lesson.timed.questions[0].id, value: 'A'});
    state = act(state, {type: 'start-timed'}); state = act(state, {type: 'confirm-unseen', value: true});
    state = answer(state, Array(native.timed.task.selectionCount).fill(native.timed.task.correctOptionIds[0]).join(' '));
    if (lesson.skill === 'listening') state = heard(state);
    state = act(state, {type: 'submit'}); const timed = structuredClone(engine.sampleSession(state).attempts.at(-1));
    assert.equal(timed.matched, false); assert.equal(timed.withinTrainingTime, true);
    state = act(state, {type: 'next'});
    const question = lesson.timed.questions[0];
    state = act(state, {type: 'correction-note', value: 'I matched each selected option to its scope and source.'});
    state = act(state, {type: 'correction-answer', questionId: question.id, value: native.timed.task.correctOptionIds[0]});
    deny(state, {type: 'save-correction'});
    state = act(state, {type: 'correction-answer', questionId: question.id, value: question.accepted[0]});
    state = act(state, {type: 'save-correction'});
    assert.deepEqual(engine.sampleSession(state).attempts.find(attempt => attempt.stage === 'timed'), timed);
    deny(state, {type: 'start-review'}, engine.sampleReviewDueAt(engine.sampleSession(state)) - 1);
    for (const [index, review] of lesson.reviews.entries()) {
      clock = Math.max(clock + 100, engine.sampleReviewDueAt(engine.sampleSession(state)));
      state = act(state, {type: 'start-review'}, clock); assert.equal(engine.activeSampleMaterial(state).id, review.id);
      state = act(state, {type: 'confirm-unseen', value: true});
      if (index) state = act(state, {type: 'hint'});
      state = correct(state); if (lesson.skill === 'listening') state = heard(state);
      state = act(state, {type: 'submit'});
      assert.equal(engine.sampleLessonReceipt(state, clock).delayed, index ? 'assisted' : 'local-target-observed');
      assert.equal(engine.sampleLessonReceipt(state, clock).band, null); assert.equal(engine.sampleLessonReceipt(state, clock).mastery, 'not-assessed');
    }
    clock = engine.sampleReviewDueAt(engine.sampleSession(state)); deny(state, {type: 'start-review'}, clock);
    assert.equal(engine.sampleLessonReceipt(state, clock).freshReviewAvailable, false);
    if (variant === 'academic' && lesson.skill === 'listening') {
      state = act(state, {type: 'select-variant', variant: 'general-training'}); state = act(state, {type: 'open-lesson', lessonId: lesson.id});
      state = act(act(state, {type: 'next'}), {type: 'next'}); state = act(state, {type: 'confirm-unseen', value: true});
      state = act(heard(correct(state)), {type: 'submit'}); assert.equal(engine.sampleSession(state).attempts[0].fresh, false);
    }
  }
});

group('6. Exposure identities, source access and owner integration/scoring boundaries remain explicit', () => {
  const a = batch.batch02NativeLessonsFor('academic'), gt = batch.batch02NativeLessonsFor('general-training');
  assert.strictEqual(a[0], gt[0]);
  const ids = new Set(materials(a[1]).map(material => material.id));
  assert.ok(materials(gt[1]).every(material => !ids.has(material.id)));
  assert.equal(new Set([...unique.values()].map(material => material.stimulus)).size, 18);
  assert.equal(batch.batch02AdditionalSources.find(source => source.id === 'reading-general-multi-idp').verification, 'partial-fetch');
  assert.equal(batch.batch02ResponseContract.checkUnit, 'complete-selection-group');
  assert.equal(batch.batch02ResponseContract.nativeCheckboxes, 'not-implemented');
  assert.equal(batch.batch02ResponseContract.officialPerAnswerScoring, 'not-implemented');
  for (const binding of batch.batch02Coverage) {assert.equal(binding.integrationStatus, 'pending-owner-integration'); assert.equal(binding.contentStatus, 'authored-not-expert-reviewed');}
  assert.equal(catalog.sampleSequence.id, 'willow-hub-four-lessons'); assert.equal(catalog.sampleSequence.version, 1);
  for (const variant of variants) for (const id of ['hub-listening', 'hub-reading', 'hub-speaking', 'hub-writing']) assert.ok(catalog.sampleLessonById(variant, id));
});

console.log('IELTS batch 02: 6 groups passed; 18 original multi-answer groups / 96 options. Complete-set text input only; native UI, official per-answer marks and real delivery remain unverified.');
