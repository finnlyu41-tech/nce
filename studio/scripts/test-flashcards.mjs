import assert from 'node:assert/strict';
import {mkdir, readdir} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';

// Build the real model with its pinned FSRS dependency; do not replace the scheduler
// with a test double. esbuild is already present through the existing toolchain.
const root = new URL('../', import.meta.url);
const pnpmRoot = new URL('node_modules/.pnpm/', root);
const builders = (await readdir(pnpmRoot)).filter(name => /^esbuild@\d+\.\d+\.\d+$/.test(name));
builders.sort((a, b) => {
  const av = a.slice(8).split('.').map(Number), bv = b.slice(8).split('.').map(Number);
  for (let index = 0; index < 3; index++) if (av[index] !== bv[index]) return bv[index] - av[index];
  return 0;
});
assert(builders.length, 'Install the locked project dependencies before running flashcard checks');
const {build} = await import(new URL(`${builders[0]}/node_modules/esbuild/lib/main.js`, pnpmRoot));
const output = new URL('work/flashcards/model-test.mjs', root);
await mkdir(new URL('work/flashcards/', root), {recursive: true});
await build({
  stdin: {
    contents: "import * as flashcards from './app/flashcards.ts'; import * as model from './app/model.ts'; import * as progress from './app/progress-file.ts'; import * as ielts from './app/ielts-flashcard-examples.ts'; export {flashcards, model, progress, ielts};",
    resolveDir: fileURLToPath(root), sourcefile: 'flashcard-test-entry.ts', loader: 'ts',
  },
  bundle: true, platform: 'node', format: 'esm', target: 'node22',
  outfile: fileURLToPath(output), logLevel: 'silent',
});
const {flashcards: f, model: m, progress: p, ielts} = await import(pathToFileURL(fileURLToPath(output)).href);

const MINUTE = 60_000, DAY = 86_400_000;
const NOW = Date.parse('2026-10-01T23:59:30.000Z');
const tests = [];
const test = (name, run) => tests.push({name, run});
const snapshot = value => structuredClone(value);
const plain = value => JSON.parse(JSON.stringify(value));
const base = () => snapshot(m.initial);
const notes = state => Object.values(state.flashcards.notes);
const cards = state => Object.values(state.flashcards.cards);
const cardFor = (state, word, meaning, direction = 'recognition') => {
  const note = notes(state).find(item => item.word.trim().toLowerCase() === word.toLowerCase() && item.meaning === meaning);
  assert(note, `Missing note: ${word} / ${meaning}`);
  const card = cards(state).find(item => item.noteId === note.id && item.direction === direction);
  assert(card, `Missing ${direction} card: ${word} / ${meaning}`);
  return {note, card};
};
const word = (headword, meaning = `释义：${headword}`, example = `We use ${headword} every day.`) => ({word: headword, meaning, example});
const tokenFor = card => ({cardId: card.id, revision: card.revision});
function revealed(state, cardId) {
  const token = tokenFor(state.flashcards.cards[cardId]);
  const selected = f.selectFlashcard(state, cardId);
  const opened = f.revealFlashcard(selected, token);
  assert.deepEqual(opened.flashcards.session, {...token, revealed: true});
  return {state: opened, token};
}
function score(state, cardId, rating, now = NOW) {
  const opened = revealed(state, cardId);
  return f.rateFlashcard(opened.state, opened.token, rating, now);
}
function rejectedWithoutChange(state, action, message) {
  const before = snapshot(state);
  let result;
  try { result = action(); } catch { /* Rejection may be explicit or a no-op. */ }
  assert.deepEqual(state, before, `${message}: input state was mutated`);
  if (result !== undefined) assert.deepEqual(result, before, message);
}
function schedule(card) {
  const result = {...card};
  delete result.revision;
  return result;
}
function classicState(state) {
  const result = {...state};
  delete result.flashcards;
  return result;
}
function legacyFixture() {
  return {
    ...base(), completed: [1, 3], lastLesson: 3, scores: {'unit-1': 75},
    mistakes: {q1: {id: 'q1', type: 'input', prompt: 'I … happy.', answer: 'am', explanation: 'I am'}},
    personalWords: [
      {word: 'Bank', ipa: '/bæŋk/', meaning: '银行', example: 'The bank closes at five.'},
      {word: 'bank', meaning: '河岸', example: 'We sat on the bank.'},
      {word: 'reusable', meaning: '可重复使用的', example: 'This is a reusable bag.'},
    ],
    cards: {bank: {box: 4, due: NOW + 7 * DAY}, shadowword: {box: 2, due: NOW - 5 * DAY}},
    days: ['2026-09-27'], attempts: 3, correct: 2,
    drafts: {'expression-NCE1-1': '{"own":"This is my bag.","audio":"local-audio-key"}', 'ielts-writing': '我的草稿'},
    custom: [{id: 'one', title: '自备文字', text: 'Hello world.'}],
    nce: {'NCE1-1': {title: 'Excuse me!', text: 'Excuse me!', notes: '先听后说', steps: ['listen', 'words'], review: {checks: ['meaning'], checkedAt: NOW - DAY, dueAt: NOW + DAY}}},
    nceLast: {book: 'NCE1', lesson: 1}, nceEdition: 'standard',
  };
}

test('legacy migration preserves original progress and never invents FSRS reviews', () => {
  const original = legacyFixture(), before = snapshot(original);
  assert(m.validateState(original), 'The fixture is a supported legacy backup');
  const migrated = f.migrateFlashcards(original, [word('bank', '教材银行释义'), word('reserve-only')], NOW);
  assert.deepEqual(original, before, 'Migration must not mutate the original backup');
  const {flashcards, ...legacy} = migrated;
  assert.deepEqual(legacy, original, 'Unrelated classic fields and personal words stay byte-for-byte equivalent');
  assert.equal(migrated.version, 1);
  assert.equal(flashcards.version, 1);
  assert.equal(flashcards.scheduler, 'ts-fsrs@5.4.2/v1');
  assert.deepEqual(flashcards.reviews, []);
  assert(cards(migrated).every(card => card.fsrs === undefined), 'Legacy boxes are not real FSRS histories');
  assert(!notes(migrated).some(note => note.word === 'reserve-only'), 'Browsing the reserve vocabulary does not enroll it');
  assert(!notes(migrated).some(note => note.meaning === '教材银行释义'), 'The reserve cannot overwrite stored personal meanings');
  assert.equal(cardFor(migrated, 'bank', '银行').card.due, NOW, 'A second legacy sense begins as a new card');
  const river = cardFor(migrated, 'bank', '河岸').card;
  assert.equal(river.due, original.cards.bank.due);
  assert.deepEqual(river.legacy, {key: 'bank', ...original.cards.bank});
  const missing = notes(migrated).find(note => note.word === 'shadowword');
  assert(missing?.incomplete, 'A missing definition is visible, rather than silently discarded or invented');
  const missingCard = cards(migrated).find(card => card.noteId === missing.id);
  assert.equal(missingCard.due, original.cards.shadowword.due);
  assert.deepEqual(missingCard.legacy, {key: 'shadowword', ...original.cards.shadowword});
  assert(m.validateState(migrated));
  assert.deepEqual(f.migrateFlashcards(migrated, [word('reserve-only')], NOW + 10 * DAY), migrated, 'Repeated loading cannot reset due dates or recreate cards');
});

test('an unresolved legacy card can be completed without losing its due date', () => {
  const old = f.migrateFlashcards(legacyFixture(), [], NOW);
  const missing = notes(old).find(note => note.word === 'shadowword');
  const oldCard = cards(old).find(card => card.noteId === missing.id);
  rejectedWithoutChange(old, () => score(old, oldCard.id, 'good'), 'An incomplete note cannot earn a review');
  const completed = f.enrollFlashcard(old, word('shadowword', '自备词义', 'A user provided this definition.'), [{kind: 'personal'}], NOW);
  const entry = cardFor(completed, 'shadowword', '自备词义');
  assert.equal(entry.note.incomplete, undefined);
  assert.equal(entry.card.due, oldCard.due);
  assert.deepEqual(entry.card.legacy, oldCard.legacy);
  assert.equal(notes(completed).filter(note => note.word.toLowerCase() === 'shadowword').length, 1, 'Completing a missing definition must not leave a second queued placeholder');
  assert(m.validateState(completed));
});

test('the first actual review after migration starts FSRS history at one repetition', () => {
  const migrated = f.migrateFlashcards(legacyFixture(), [], NOW);
  const card = cardFor(migrated, 'bank', '河岸').card;
  const before = snapshot(migrated), next = score(migrated, card.id, 'good', card.due);
  assert.deepEqual(migrated, before);
  assert.equal(next.flashcards.cards[card.id].fsrs.reps, 1, 'Box four is not four historical reviews');
  assert.equal(next.flashcards.cards[card.id].fsrs.lapses, 0);
  assert.equal(next.flashcards.reviews.length, 1);
  assert.equal(next.flashcards.reviews[0].log.state, 0);
  assert.equal(next.flashcards.reviews[0].dueBefore, card.due);
  assert.deepEqual(next.flashcards.cards[card.id].legacy, card.legacy, 'The original scheduling snapshot remains available after a genuine rating');
  assert.deepEqual(classicState(next), classicState(migrated), 'Word recall does not rewrite course evidence, IELTS writing, scores or audio references');
  assert(m.validateState(next));
});

test('same senses share scheduling while retaining sources and examples; other senses remain independent', () => {
  const nceOne = {kind: 'nce', book: 'NCE1', lesson: 1};
  const nceTwo = {kind: 'nce', book: 'NCE2', lesson: 9};
  const ielts = {kind: 'ielts', topic: 'Environment', use: 'speaking'};
  let state = f.enrollFlashcard(base(), {...word('reusable', '可重复使用的', 'Use a reusable bag.'), sources: [nceOne]}, [], NOW);
  const first = cardFor(state, 'reusable', '可重复使用的');
  const due = first.card.due;
  state = score(state, first.card.id, 'easy', NOW);
  const scored = snapshot(state.flashcards.cards[first.card.id]);
  state = f.enrollFlashcard(state, word('  REUSABLE  ', '可重复使用的', 'A reusable bottle reduces waste.'), [nceTwo, ielts, nceOne], NOW + DAY);
  assert.equal(notes(state).length, 1);
  assert.equal(cards(state).length, 1);
  assert.deepEqual(state.flashcards.cards[first.card.id], scored, 'Adding another source cannot reset an existing schedule');
  const merged = cardFor(state, 'reusable', '可重复使用的').note;
  for (const source of [nceOne, nceTwo, ielts]) assert(merged.sources.some(item => JSON.stringify(item) === JSON.stringify(source)), `Missing source ${JSON.stringify(source)}`);
  assert.equal(merged.sources.filter(item => JSON.stringify(item) === JSON.stringify(nceOne)).length, 1);
  assert.deepEqual(new Set(merged.examples.map(item => item.en)), new Set(['Use a reusable bag.', 'A reusable bottle reduces waste.']));
  assert.equal(due, NOW);
  state = f.enrollFlashcard(state, word('reusable', '可复用的代码对象', 'A reusable component simplifies the app.'), [{kind: 'personal'}], NOW + DAY);
  assert.equal(notes(state).length, 2);
  assert.equal(cards(state).length, 2);
  assert.equal(cardFor(state, 'reusable', '可复用的代码对象').card.fsrs, undefined);
  assert(f.isFlashcardEnrolled(state, word('REUSABLE', '可重复使用的')));
  assert(!f.isFlashcardEnrolled(state, word('reusable', '未加入的新义项')));
  assert(m.validateState(state));
});

test('original IELTS starter content retains themes, uses and bilingual examples without duplicate queues', () => {
  const sourceWords = ielts.ieltsFlashcardExamples;
  assert.equal(sourceWords.length, 12);
  assert.match(ielts.ieltsFlashcardDescription, /原创/);
  assert.match(ielts.ieltsFlashcardDescription, /非 IELTS 官方/);
  assert.equal(new Set(sourceWords.flatMap(item => item.sources.map(source => source.topic))).size, 6);
  assert.deepEqual(new Set(sourceWords.flatMap(item => item.sources.map(source => source.use))), new Set(['speaking', 'writing', 'reading', 'listening']));
  let state = base();
  for (const item of sourceWords) state = f.enrollFlashcard(state, item, [], NOW);
  assert.equal(notes(state).length, 12);
  assert.equal(cards(state).length, 12);
  for (const item of sourceWords) {
    const entry = cardFor(state, item.word, item.meaning);
    assert.deepEqual(entry.note.examples, [{en: item.example, zh: item.exampleTranslation}]);
    assert.deepEqual(entry.note.sources, item.sources);
    assert.equal(entry.card.fsrs, undefined);
  }
  const enrolled = snapshot(state);
  for (const item of sourceWords) state = f.enrollFlashcard(state, item, [], NOW + DAY);
  assert.deepEqual(state.flashcards.cards, enrolled.flashcards.cards, 'Adding an example pack a second time cannot duplicate or restart schedules');
  assert.deepEqual(state.flashcards.notes, enrolled.flashcards.notes);
  assert.deepEqual(state.drafts, enrolled.drafts);
  assert.deepEqual(state.nce, enrolled.nce);
  assert(m.validateState(state));
});

test('all four ratings create real, distinct schedules and preview is read-only', () => {
  const initial = f.enrollFlashcard(base(), word('rating-word'), [], NOW);
  const card = cards(initial)[0], before = snapshot(initial);
  const preview = f.previewFlashcard(card, NOW);
  assert.deepEqual(initial, before);
  assert.deepEqual(preview.map(item => item.rating), ['again', 'hard', 'good', 'easy']);
  assert.equal(preview[0].due, NOW + MINUTE, 'Again schedules a short retry after forgetting');
  assert(preview[0].due < preview[1].due && preview[1].due < preview[2].due && preview[2].due < preview[3].due);
  assert.equal(preview[2].due, NOW + 10 * MINUTE, 'A first successful learning step is due after ten minutes');
  for (const [index, rating] of ['again', 'hard', 'good', 'easy'].entries()) {
    const next = score(initial, card.id, rating, NOW);
    const scheduled = next.flashcards.cards[card.id];
    assert.deepEqual(initial, before, `${rating}: scoring cannot mutate the previous React state`);
    assert.equal(scheduled.due, preview[index].due, `${rating}: preview and actual score agree`);
    assert.equal(scheduled.fsrs.reps, 1, `${rating}: the first real review is the first repetition`);
    assert.equal(scheduled.fsrs.last_review, NOW);
    assert.equal(scheduled.revision, card.revision + 1);
    assert.equal(next.flashcards.reviews.length, 1);
    const log = next.flashcards.reviews[0];
    assert.equal(log.rating, rating);
    assert.equal(log.log.rating, index + 1);
    assert.equal(log.reviewedAt, NOW);
    assert.equal(log.log.review, NOW);
    assert.equal(log.dueBefore, card.due);
    assert.equal(log.dueAfter, scheduled.due);
    assert.equal(log.log.state, 0, 'Legacy-free first review records the actual New state');
    assert(m.validateState(next), `${rating} produces a persistable state`);
  }
});

test('queue progresses through new, learning, review, overdue and future states', () => {
  let state = f.enrollFlashcard(base(), word('new-word'), [], NOW);
  state = f.enrollFlashcard(state, word('learning-word'), [], NOW);
  state = f.enrollFlashcard(state, word('review-word'), [], NOW);
  const learning = cardFor(state, 'learning-word', '释义：learning-word').card;
  const review = cardFor(state, 'review-word', '释义：review-word').card;
  state = score(state, learning.id, 'again', NOW);
  state = score(state, review.id, 'easy', NOW);
  assert.deepEqual(f.getFlashcardQueue(state, NOW).map(entry => entry.note.word), ['new-word'], 'Future learning and review cards are withheld until due');
  assert.deepEqual(f.flashcardSummary(state, NOW), {due: 1, new: 1, review: 0, learning: 0, total: 3});
  const atLearning = f.getFlashcardQueue(state, NOW + MINUTE);
  assert.deepEqual(atLearning.map(entry => entry.phase), ['learning', 'new']);
  assert.equal(atLearning[0].card.id, learning.id);
  assert.deepEqual(f.flashcardSummary(state, NOW + MINUTE), {due: 2, new: 1, review: 0, learning: 1, total: 3});
  state = score(state, learning.id, 'good', NOW + MINUTE);
  const secondStepDue = state.flashcards.cards[learning.id].due;
  state = score(state, learning.id, 'good', secondStepDue);
  assert.equal(state.flashcards.cards[learning.id].fsrs.state, 2, 'Two successful learning steps graduate to Review');
  const late = Math.max(state.flashcards.cards[learning.id].due, state.flashcards.cards[review.id].due) + 3 * DAY;
  const overdue = f.getFlashcardQueue(state, late);
  assert.equal(overdue.length, 3);
  assert.deepEqual(overdue.map(entry => entry.phase), ['review', 'review', 'new']);
  assert(overdue.slice(0, 2).every(entry => entry.card.due <= late));
  const forgetting = score(state, review.id, 'again', late);
  assert.equal(forgetting.flashcards.cards[review.id].fsrs.state, 3, 'Forgetting a review card enters Relearning');
  assert.equal(forgetting.flashcards.cards[review.id].fsrs.lapses, 1);
  const hard = score(state, review.id, 'hard', late);
  assert.equal(hard.flashcards.cards[review.id].fsrs.state, 2, 'Hard is a successful recall, not a lapse');
  assert.equal(hard.flashcards.cards[review.id].fsrs.lapses, 0);
  assert.deepEqual(f.flashcardSummary(state, late), {due: 3, new: 1, review: 2, learning: 0, total: 3});
});

test('flipping and revisions block premature, stale and repeated scores', () => {
  const state = f.enrollFlashcard(base(), word('guard-word'), [], NOW);
  const card = cards(state)[0], token = tokenFor(card);
  rejectedWithoutChange(state, () => f.rateFlashcard(state, token, 'good', NOW), 'A score requires selecting and revealing the card');
  const selected = f.selectFlashcard(state, card.id);
  rejectedWithoutChange(selected, () => f.rateFlashcard(selected, token, 'good', NOW), 'A selected face-down card cannot be scored');
  rejectedWithoutChange(selected, () => f.revealFlashcard(selected, {...token, revision: token.revision + 1}), 'A stale reveal token cannot flip the current card');
  const opened = f.revealFlashcard(selected, token);
  rejectedWithoutChange(opened, () => f.rateFlashcard(opened, token, 'manual', NOW), 'Unrecognized ratings cannot write a manual or fake review');
  const next = f.rateFlashcard(opened, token, 'good', NOW);
  rejectedWithoutChange(next, () => f.rateFlashcard(next, token, 'good', NOW), 'A double click cannot produce a second review');
  rejectedWithoutChange(next, () => f.revealFlashcard(next, token), 'An earlier revision cannot reveal the newly scheduled card');
  assert.equal(next.flashcards.reviews.length, 1);
});

test('undo restores the prior schedule and removes only the latest actual review', () => {
  let state = f.enrollFlashcard(base(), word('undo-one'), [], NOW);
  state = f.enrollFlashcard(state, word('undo-two'), [], NOW);
  const one = cardFor(state, 'undo-one', '释义：undo-one').card;
  const two = cardFor(state, 'undo-two', '释义：undo-two').card;
  state = score(state, one.id, 'easy', NOW);
  const before = snapshot(state), twoBefore = snapshot(state.flashcards.cards[two.id]);
  state = score(state, two.id, 'again', NOW + MINUTE);
  assert.equal(state.flashcards.reviews.length, 2);
  const reverted = f.undoFlashcardReview(state);
  assert.deepEqual(schedule(reverted.flashcards.cards[two.id]), schedule(twoBefore));
  assert.deepEqual(reverted.flashcards.cards[one.id], before.flashcards.cards[one.id]);
  assert.deepEqual(reverted.flashcards.reviews, before.flashcards.reviews);
  assert(reverted.flashcards.cards[two.id].revision > state.flashcards.cards[two.id].revision, 'Undo advances the revision instead of re-enabling the previous click token');
  rejectedWithoutChange(reverted, () => f.rateFlashcard(reverted, tokenFor(twoBefore), 'again', NOW + MINUTE), 'A stale click cannot be replayed after undo');
  assert.equal(reverted.flashcards.undo, undefined, 'Undo is limited to one most recent score');
  assert(m.validateState(reverted));
  rejectedWithoutChange(reverted, () => f.undoFlashcardReview(reverted), 'The same undo cannot remove older unrelated reviews');
});

test('reverse cards have their own schedule and cannot change the forward card', () => {
  let state = f.enrollFlashcard(base(), word('direction-word', '双向词义'), [], NOW);
  const forward = cards(state)[0];
  state = score(state, forward.id, 'easy', NOW);
  const forwardBefore = snapshot(state.flashcards.cards[forward.id]);
  state = f.addReverseCard(state, forward.noteId, NOW + DAY);
  const reverse = cardFor(state, 'direction-word', '双向词义', 'production').card;
  assert.notEqual(reverse.id, forward.id);
  assert.equal(reverse.fsrs, undefined);
  assert.equal(reverse.due, NOW + DAY);
  state = score(state, reverse.id, 'again', NOW + DAY);
  assert.deepEqual(state.flashcards.cards[forward.id], forwardBefore);
  assert.equal(state.flashcards.cards[reverse.id].fsrs.reps, 1);
  assert.equal(cards(f.addReverseCard(state, forward.noteId, NOW + 2 * DAY)).length, 2, 'Repeatedly adding the reverse direction cannot duplicate it');
  assert(m.validateState(state));
});

test('JSON refresh and progress backups retain the face, schedule, sources and real logs', async () => {
  let state = f.enrollFlashcard(base(), {...word('backup-word'), sources: [{kind: 'nce', book: 'NCE3', lesson: 51}, {kind: 'ielts', topic: 'Study', use: 'writing'}]}, [], NOW);
  const card = cards(state)[0];
  state = score(state, card.id, 'good', NOW);
  state = revealed(state, card.id).state;
  const json = plain(state);
  assert(m.validateState(json));
  assert.deepEqual(json, state);
  assert.deepEqual(f.migrateFlashcards(json, [], NOW + DAY), state, 'Offline refresh cannot reset the card or erase an open answer');
  const savedAt = new Date(NOW);
  const restored = await p.readProgressFile(p.makeProgressFile(state, savedAt));
  assert.deepEqual(restored, {state, savedAt: savedAt.toISOString()}, 'The new namespace passes through the established backup envelope without field loss');
  assert.deepEqual((await p.readProgressFile(new Blob([JSON.stringify(state)]))).state, state, 'Plain version-one state JSON remains readable');
});

test('restoring older backups preserves current FSRS; newer namespace restores exactly', () => {
  let current = f.enrollFlashcard(base(), word('retained-word'), [], NOW);
  const retained = cards(current)[0];
  current = score(current, retained.id, 'easy', NOW);
  const incoming = {...base(), drafts: {'ielts-writing': '旧备份里合法的写作草稿'}, personalWords: [word('retained-word'), word('added-word')], cards: {'retained-word': {box: 0, due: NOW - DAY}, 'added-word': {box: 3, due: NOW + DAY}}};
  const original = snapshot(current), oldBefore = snapshot(incoming);
  const merged = f.prepareFlashcardRestore(current, incoming, [], NOW + MINUTE);
  assert.deepEqual(current, original);
  assert.deepEqual(incoming, oldBefore);
  assert.deepEqual(merged.flashcards.cards[retained.id], original.flashcards.cards[retained.id], 'Legacy box cannot reset a real FSRS schedule');
  assert.deepEqual(merged.flashcards.reviews, original.flashcards.reviews);
  assert.equal(cardFor(merged, 'added-word', '释义：added-word').card.due, incoming.cards['added-word'].due);
  assert.deepEqual(merged.drafts, incoming.drafts, 'Classic fields follow the explicit selected backup');
  assert(m.validateState(merged));
  const complete = f.enrollFlashcard(base(), word('complete-backup-word'), [], NOW + DAY);
  const completeBefore = snapshot(complete);
  assert.deepEqual(f.prepareFlashcardRestore(current, complete, [], NOW + 2 * DAY), completeBefore, 'An explicit newer complete backup has authority over its namespace');
});

test('invalid namespaces and malicious backup structures are rejected without modifying live data', async () => {
  const enrolled = f.enrollFlashcard(base(), word('valid-word'), [], NOW);
  const valid = score(enrolled, cards(enrolled)[0].id, 'easy', NOW);
  const original = snapshot(valid);
  const cardId = cards(valid)[0].id, noteId = cards(valid)[0].noteId;
  const invalid = [
    null, [], {version: 999},
    {...valid.flashcards, version: 2},
    {...valid.flashcards, scheduler: 'unknown-scheduler'},
    {...valid.flashcards, notes: null},
    {...valid.flashcards, cards: {...valid.flashcards.cards, [cardId]: null}},
    {...valid.flashcards, cards: {...valid.flashcards.cards, [cardId]: {...valid.flashcards.cards[cardId], due: Infinity}}},
    {...valid.flashcards, cards: {...valid.flashcards.cards, [cardId]: {...valid.flashcards.cards[cardId], noteId: 'absent-note'}}},
    {...valid.flashcards, cards: {...valid.flashcards.cards, [cardId]: {...valid.flashcards.cards[cardId], fsrs: {...valid.flashcards.cards[cardId].fsrs, reps: -1}}}},
    {...valid.flashcards, notes: {...valid.flashcards.notes, [noteId]: {...valid.flashcards.notes[noteId], sources: [{kind: 'nce', book: 'NCE1', lesson: 145}]}}},
    {...valid.flashcards, notes: JSON.parse('{"__proto__":{"word":"evil"}}')},
    {...valid.flashcards, reviews: [{...valid.flashcards.reviews[0], rating: 'manual'}]},
    {...valid.flashcards, session: {cardId, revision: 999, revealed: true}},
  ];
  for (const flashcards of invalid) {
    const changed = {...snapshot(valid), flashcards};
    let accepted = false;
    try { accepted = m.validateState(changed); } catch { /* A thrown validation also cannot authorize restore. */ }
    assert.equal(accepted, false, `Invalid namespace accepted: ${JSON.stringify(flashcards)}`);
    await assert.rejects(p.readProgressFile(new Blob([JSON.stringify(changed)])), 'A backup cannot bypass namespace validation');
    rejectedWithoutChange(valid, () => f.prepareFlashcardRestore(valid, changed, [], NOW + DAY), 'Malformed restore cannot replace the current flashcards');
    assert.deepEqual(valid, original);
  }
  for (const missing of ['notes', 'cards', 'reviews']) {
    const changed = snapshot(valid); delete changed.flashcards[missing];
    assert(!m.validateState(changed), `Missing ${missing} must fail`);
  }
  for (const changed of [
    {...snapshot(valid), version: 2},
    {...snapshot(valid), personalWords: [{...word('invalid-source'), sources: [{kind: 'nce', book: 'NCE4', lesson: 49}]}]},
    {...snapshot(valid), personalWords: [{...word('invalid-translation'), exampleTranslation: 'x'.repeat(1001)}]},
  ]) {
    assert(!m.validateState(changed));
    await assert.rejects(p.readProgressFile(new Blob([JSON.stringify(changed)])));
    rejectedWithoutChange(valid, () => f.prepareFlashcardRestore(valid, changed, [], NOW + DAY), 'Unsupported classic state or malformed word metadata cannot overwrite live progress');
  }
  assert.equal({}.word, undefined, 'Rejected prototype keys do not pollute global objects');
});

test('absolute due times survive a midnight boundary and local timezone changes', () => {
  const previousTimezone = process.env.TZ;
  try {
    for (const timezone of ['UTC', 'America/New_York', 'Pacific/Kiritimati', 'Pacific/Honolulu']) {
      process.env.TZ = timezone;
      let state = f.enrollFlashcard(base(), word('midnight-word'), [], NOW);
      const card = cards(state)[0];
      state = score(state, card.id, 'again', NOW);
      const due = NOW + MINUTE;
      assert.equal(state.flashcards.cards[card.id].due, due, `${timezone}: the next calendar date cannot change a one-minute interval`);
      assert.equal(f.getFlashcardQueue(state, due - 1).length, 0);
      assert.equal(f.getFlashcardQueue(state, due).length, 1);
      const log = state.flashcards.reviews[0];
      assert.equal(log.localDate, timezone === 'Pacific/Kiritimati' ? '2026-10-02' : '2026-10-01', 'The review date reflects the event\'s local day');
      assert.equal(log.timeZone, Intl.DateTimeFormat().resolvedOptions().timeZone);
      assert.equal(log.reviewedAt, NOW);
      assert.equal(log.log.review, NOW);
      assert.equal(log.utcOffsetMinutes, new Date(NOW).getTimezoneOffset());
      const refreshed = plain(state);
      process.env.TZ = timezone === 'Pacific/Kiritimati' ? 'Pacific/Honolulu' : 'Pacific/Kiritimati';
      assert.equal(f.migrateFlashcards(refreshed, [], due).flashcards.cards[card.id].due, due);
      assert.equal(f.getFlashcardQueue(refreshed, due).length, 1, 'Changing local time zone cannot push back a due card');
      assert.deepEqual(refreshed.flashcards.reviews, state.flashcards.reviews, 'A saved local review date records the original event');
    }
  } finally {
    if (previousTimezone === undefined) delete process.env.TZ; else process.env.TZ = previousTimezone;
  }
});

test('a backward clock cannot write impossible review time or mutate the previous schedule', () => {
  let state = f.enrollFlashcard(base(), word('clock-word'), [], NOW);
  const card = cards(state)[0];
  state = score(state, card.id, 'easy', NOW);
  const opened = revealed(state, card.id);
  const before = snapshot(opened.state);
  assert.throws(() => f.previewFlashcard(opened.state.flashcards.cards[card.id], NOW - MINUTE));
  assert.throws(() => f.rateFlashcard(opened.state, opened.token, 'good', NOW - MINUTE));
  assert.deepEqual(opened.state, before);
  assert.equal(opened.state.flashcards.reviews.length, 1);
  assert(m.validateState(opened.state));
});

let failures = 0;
for (const {name, run} of tests) {
  try { await run(); console.log(`PASS ${name}`); }
  catch (error) { failures++; console.error(`FAIL ${name}\n${error.stack || error}`); }
}
if (failures) {
  console.error(`Flashcard checks failed: ${failures}/${tests.length}.`);
  process.exitCode = 1;
} else {
  console.log(`Flashcard checks passed: ${tests.length} behavior scenarios covering migration, sources, genuine FSRS ratings, queue, undo, duplicate guards, backups and time boundaries.`);
}
