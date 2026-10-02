import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {moduleURL as resolveModule} from './ielts-blueprint-loader.mjs';
const root=new URL('../ielts-blueprint/',import.meta.url);
const moduleURL=name=>resolveModule(new URL(name,root).pathname);
const m = await import(await moduleURL('sample-sequence-model.ts'));
const c = await import(await moduleURL('sample-sequence.ts'));
let checks = 0, clock = Date.UTC(2026, 9, 1, 8);
const check = (condition, message) => {assert.ok(condition, message); checks++;};
const act = (state, action, at = (clock += 100)) => {const result = m.transitionSample(state, action, at); assert.equal(result.issue, undefined, result.issue); return result.state;};
const deny = (state, action, at = (clock += 100)) => {const result = m.transitionSample(state, action, at); check(!!result.issue && result.state === state, `Rejected without mutation: ${action.type}`);};
const current = state => m.activeSampleMaterial(state);
function heard(state, id = `play-${clock}`) {
  const promptId = current(state).id;
  for (const type of ['audio-request', 'audio-start', 'audio-end', 'audio-confirm']) state = act(state, {type, playbackId: id, promptId});
  return state;
}
function answer(state, correct = true) {
  const material = current(state);
  if (material.questions) for (const q of material.questions) state = act(state, {type: 'answer', questionId: q.id, value: correct ? q.accepted[0] : 'not the answer'});
  else state = act(state, {type: 'response', value: 'I would like to join a reading group because I enjoy learning with other people. I usually have free time on Saturday mornings.'});
  return state;
}
function guided(variant, lessonId) {
  let state = act(m.emptySampleState(), {type: 'select-variant', variant});
  state = act(state, {type: 'open-lesson', lessonId});
  return act(act(state, {type: 'next'}), {type: 'next'});
}
function feedback(variant, lessonId, options = {}) {
  let state;
  if (options.initialState) {
    state = act(options.initialState, {type: 'select-variant', variant}); state = act(state, {type: 'open-lesson', lessonId});
    state = act(act(state, {type: 'next'}), {type: 'next'});
  } else state = guided(variant, lessonId);
  for (const stage of ['guided', 'independent', 'timed']) {
    check(m.sampleSession(state).stage === stage, 'Teacher-first sequence');
    if (stage === 'timed') state = act(state, {type: 'start-timed'});
    if (stage !== 'guided') state = act(state, {type: 'confirm-unseen', value: true});
    if (current(state).script) state = heard(state);
    state = answer(state); state = act(state, {type: 'submit'}); state = act(state, {type: 'next'});
  }
  check(m.sampleSession(state).stage === 'feedback', 'Feedback follows original responses');
  const lesson = m.selectedSampleLesson(state);
  if (lesson.timed.questions) for (const q of lesson.timed.questions) state = act(state, {type: 'correction-answer', questionId: q.id, value: q.accepted[0]});
  else state = act(state, {type: 'correction-response', value: 'Reading was the most popular activity, at sixty visits. Repair had twenty visits, while gardening recorded forty. These figures refer to visits rather than different people.'});
  state = act(state, {type: 'correction-note', value: 'I checked the evidence and revised the specific error. Human review is still needed for open responses.'});
  return act(state, {type: 'save-correction'});
}
function review(state, extra = {}) {
  clock = Math.max(clock + 100, m.sampleReviewDueAt(m.sampleSession(state)));
  state = act(state, {type: 'start-review'}, clock);
  state = act(state, {type: 'confirm-unseen', value: extra.unseen !== false});
  if (current(state).script) {state = heard(state); if (extra.replay) state = heard(state, `replay-${clock}`);}
  if (extra.hint) state = act(state, {type: 'hint'});
  state = answer(state, extra.correct !== false);
  return act(state, {type: 'submit'});
}

// Content audit: all original sets are distinct; shared skills are truly shared, writing is scoped.
for (const variant of ['academic', 'general-training']) {
  const lessons = c.sampleLessonsFor(variant);
  check(lessons.length === 10 && new Set(lessons.slice(0,4).map(l=>l.skill)).size === 4, 'Ten registered lessons preserve the original four skills');
  const sets = lessons.flatMap(c.sampleMaterials);
  check(new Set(sets.map(x => x.id)).size === sets.length, 'Unique material IDs within selected variant');
  check(new Set(sets.map(x => `${x.script || x.context || ''}|${x.instruction}`)).size === sets.length, 'Distinct actual stimuli, not reordered old answers');
  check(sets.every(x => x.seconds > 0 && x.checklist.length >= 2 && x.hint), 'Each mini has a concrete training and feedback task');
  check(lessons.every(l => l.model.model && l.model.modelNotes.length >= 2 && l.reviews.length === 2), 'Annotated models and two fresh followups');
}
check(c.sampleLessonsFor('academic').slice(0, 3).every((l, i) => l === c.sampleLessonsFor('general-training')[i]), 'Common listening/reading-method/speaking assets are shared');
check(c.sampleLessonsFor('academic')[3].independent.id !== c.sampleLessonsFor('general-training')[3].independent.id, 'Academic and GT writing never cross');
let blank = m.emptySampleState(); const pristine = JSON.stringify(blank);
deny(blank, {type: 'next'}); deny(blank, {type: 'select-variant', variant: 'guess'}); deny(blank, {type: 'submit'});
check(JSON.stringify(blank) === pristine && blank.variant === null, 'No default exam selection or browsing mutation');

// Audio: an event or button alone cannot claim listening; callbacks must belong to the current request.
let audio = guided('academic', 'hub-listening'); audio = answer(audio);
deny(audio, {type: 'submit'});
const promptId = current(audio).id;
deny(audio, {type: 'audio-end', playbackId: 'fake', promptId});
audio = act(audio, {type: 'audio-request', playbackId: 'failed', promptId});
audio = act(audio, {type: 'audio-fail', playbackId: 'failed', promptId, reason: 'No audible sound'});
deny(audio, {type: 'audio-confirm', playbackId: 'failed', promptId});
deny(audio, {type: 'audio-end', playbackId: 'failed', promptId}); deny(audio, {type: 'submit'});
audio = act(audio, {type: 'audio-request', playbackId: 'ended', promptId});
audio = act(audio, {type: 'audio-start', playbackId: 'ended', promptId});
audio = act(audio, {type: 'audio-end', playbackId: 'ended', promptId});
deny(audio, {type: 'submit'}); // TTS onend alone cannot tell whether output was audible.
audio = act(audio, {type: 'audio-confirm', playbackId: 'ended', promptId});
audio = act(audio, {type: 'submit'});
check(m.sampleSession(audio).attempts[0].playbackFailures === 1 && m.sampleSession(audio).attempts[0].playbackCount === 2, 'Failed playback and replay remain in original evidence');
deny(audio, {type: 'submit'}); deny(audio, {type: 'audio-confirm', playbackId: 'ended', promptId});

// No bypass around teaching, timed start, original response, or correction.
let timeline = guided('academic', 'hub-reading'); deny(timeline, {type: 'next'});
timeline = answer(timeline, false); timeline = act(timeline, {type: 'submit'}); deny(timeline, {type: 'next'});
timeline = answer(timeline); timeline = act(timeline, {type: 'submit'}); timeline = act(timeline, {type: 'next'});
timeline = answer(timeline); timeline = act(timeline, {type: 'submit'}); timeline = act(timeline, {type: 'next'});
deny(timeline, {type: 'submit'}); deny(timeline, {type: 'answer', questionId: 'cost', value: 'TRUE'});
timeline = act(timeline, {type: 'start-timed'}); timeline = answer(timeline);
clock += current(timeline).seconds * 1000 + 1; timeline = act(timeline, {type: 'submit'}, clock);
check(m.sampleSession(timeline).attempts.at(-1).withinTrainingTime === false, 'Expired timer preserves work and records overrun');
timeline = act(timeline, {type: 'next'}); deny(timeline, {type: 'save-correction'});

// Delay/freshness/hints/replays: none can manufacture retained skill or a Band.
let closed = feedback('academic', 'hub-reading');
deny(closed, {type: 'start-review'}, m.sampleReviewDueAt(m.sampleSession(closed)) - 1);
closed = review(closed);
check(m.sampleLessonReceipt(closed, clock).delayed === 'local-target-observed', 'Correct, fresh, unassisted, delayed two-item result is narrowly observed');
const proof = m.sampleSession(closed).attempts.at(-1);
check(proof.promptId === 'hub-r-review-a' && proof.at >= m.sampleSession(closed).correctedAt + m.SAMPLE_REVIEW_DELAY, 'Fresh prompt and timestamp retained');
clock = m.sampleReviewDueAt(m.sampleSession(closed));
closed = act(closed, {type: 'answer', questionId: 'locks', value: 'FALSE'}); closed = act(closed, {type: 'submit'});
check(m.sampleLessonReceipt(closed, clock).delayed === 'assisted', 'Same prompt resubmission never becomes new retention evidence');
let hinted = review(feedback('academic', 'hub-reading'), {hint: true});
check(m.sampleLessonReceipt(hinted, clock).delayed === 'assisted', 'Hinted delayed answer remains practice');
let familiar = review(feedback('academic', 'hub-reading'), {unseen: false});
check(m.sampleLessonReceipt(familiar, clock).delayed === 'assisted', 'No unseen attestation means no fresh result');
let wrong = review(feedback('academic', 'hub-reading'), {correct: false});
check(m.sampleLessonReceipt(wrong, clock).delayed === 'needs-repair', 'Latest new-material errors remain visible');
let replayed = review(feedback('academic', 'hub-listening'), {replay: true});
check(m.sampleLessonReceipt(replayed, clock).delayed === 'assisted', 'Replayed listening cannot count as one-play independent evidence');
let exhausted = review(review(feedback('academic', 'hub-reading')));
clock = m.sampleReviewDueAt(m.sampleSession(exhausted)); deny(exhausted, {type: 'start-review'}, clock);
check(!m.sampleLessonReceipt(exhausted, clock).freshReviewAvailable, 'Finite followups stop rather than rotating old prompts as new');
for (const variant of ['academic', 'general-training']) for (const skill of ['speaking', 'writing']) {
  const open = review(feedback(variant, `hub-${skill}`));
  const result = m.sampleLessonReceipt(open, clock);
  check(result.delayed === 'awaiting-human-review' && result.band === null && result.mastery === 'not-assessed', 'Open response stays unassessed after correct sequence and self correction');
}
const switched = act(closed, {type: 'select-variant', variant: 'general-training'});
check(m.sampleSession(switched).attempts.length === 0 && m.sampleSession(act(switched, {type: 'select-variant', variant: 'academic'})).attempts.length > 0, 'Variant switch preserves separate host-owned temporary records');
for (const skill of ['listening', 'reading', 'speaking']) {
  const first = review(feedback('academic', `hub-${skill}`));
  let cross = feedback('general-training', `hub-${skill}`, {initialState: first});
  check(m.sampleSession(cross).attempts.filter(a => ['independent', 'timed'].includes(a.stage)).every(a => !a.fresh), 'Shared prompts do not become fresh after switching exam variant');
  clock = m.sampleReviewDueAt(m.sampleSession(cross)); cross = act(cross, {type: 'start-review'}, clock);
  check(current(cross).id.endsWith('review-b'), 'Cross-variant review skips the already-exposed first followup');
}
const academicWriting = review(feedback('academic', 'hub-writing'));
const generalWriting = feedback('general-training', 'hub-writing', {initialState: academicWriting});
check(m.sampleSession(generalWriting).attempts.filter(a => ['independent', 'timed'].includes(a.stage)).every(a => a.fresh && a.materialId.startsWith('hub-wg-')), 'Different Task 1 materials remain fresh in their correct variant');
console.log(`${checks} checks passed: original four-lesson teaching sequence, variant separation, audible playback, timing, fresh delayed prompts, assistance, finite materials and no invented Band/mastery.`);
