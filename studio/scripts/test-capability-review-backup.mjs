// No browser/global localStorage is used. Run with Node's TS stripping enabled.
import test from 'node:test';
import assert from 'node:assert/strict';
import {buildCapabilityReviewBackup, captureCapabilityReviewBackup, validateCapabilityReviewBackup, prepareCapabilityReviewRestore, executeCapabilityReviewRestore} from '../app/capability-review-backup.ts';
import {storageKey as DEMO_KEY, initialState, goTo, showQuestion, submit, advanceIndependent, finishDemo, completedDemo, nextFresh} from '../public/demos/yesterday/model.mjs';
import {createDemoStore} from '../public/demos/yesterday/demo-store.mjs';
import {STORAGE_KEY as REVIEW_KEY, emptySnapshot, ensurePlan, recordResult, getDueTasks, createReviewStore} from '../public/demos/yesterday/review-adapter.mjs';
import {beginReview, currentReviewQuestion, showReviewQuestion, answerReview, advanceReview, reviewOutcome} from '../public/demos/yesterday/review-model.mjs';

const DAY = 86400000, BASE = Date.UTC(2026, 9, 1, 9), NOW = BASE + 15 * DAY;
const copy = value => JSON.parse(JSON.stringify(value));
class MemoryStorage {
  constructor(raw = {demo: null, review: null}) {
    this.values = new Map(); this.reads = []; this.writes = []; this.removes = [];
    if (raw.demo !== null) this.values.set(DEMO_KEY, raw.demo);
    if (raw.review !== null) this.values.set(REVIEW_KEY, raw.review);
  }
  getItem(key) {this.reads.push(key); this.onRead?.(key); return this.values.get(key) ?? null;}
  setItem(key, value) {this.writes.push({key, value}); const index = this.writes.length; this.onWrite?.(key, value, 'before', index); this.values.set(key, String(value)); this.onWrite?.(key, value, 'after', index);}
  removeItem(key) {this.removes.push(key); this.onRemove?.(key, 'before'); this.values.delete(key); this.onRemove?.(key, 'after');}
  raw() {return {demo: this.values.get(DEMO_KEY) ?? null, review: this.values.get(REVIEW_KEY) ?? null};}
}
class NamedLocks {
  constructor() {this.tails = new Map(); this.active = new Set(); this.entered = [];}
  async request(name, options, callback) {
    assert.equal(options.mode, 'exclusive');
    const previous = this.tails.get(name) ?? Promise.resolve(); let release;
    const tail = new Promise(resolve => {release = resolve;}); this.tails.set(name, tail);
    await previous; assert.equal(this.active.has(name), false); this.active.add(name); this.entered.push(name);
    try {return await callback({name, mode: 'exclusive'});}
    finally {this.active.delete(name); release(); if (this.tails.get(name) === tail) this.tails.delete(name);}
  }
}
function deferred() {let resolve; const promise = new Promise(done => {resolve = done;}); return {promise, resolve};}
function demo({draft = 'I went to the park. I did not go by bus.', choice = 1} = {}) {
  let state = goTo(initialState(BASE), 2);
  state = advanceIndependent(submit(showQuestion(state, 'new-omar'), 'new-omar', choice, BASE + 1000));
  state = advanceIndependent(submit(showQuestion(state, 'new-may'), 'new-may', 2, BASE + 2000));
  return finishDemo(state, draft, BASE + 3000);
}
const demoRoot = demo(), completion = completedDemo(demoRoot, BASE + 3000);
assert.ok(completion, 'fixture comes from actual completedDemo');
const planRoot = ensurePlan(emptySnapshot(), completion, BASE + 3000).snapshot;
const firstTask = getDueTasks(planRoot, planRoot.plan.dueAt)[0];
let session = beginReview(firstTask.taskId, [], 0, firstTask.dueAt);
for (let index = 0; index < 3; index++) {
  session = showReviewQuestion(session); session = answerReview(session, currentReviewQuestion(session).correct, firstTask.dueAt + index + 1);
  session = advanceReview(session, firstTask.dueAt + index + 1);
}
assert.equal(reviewOutcome(session), 'passed', 'fixture was graded by the actual review model');
const applied = recordResult(planRoot, {taskId: firstTask.taskId, resultId: `${firstTask.taskId}:result`, outcome: reviewOutcome(session), at: session.finishedAt}, session.finishedAt);
assert.equal(applied.ok, true);
const planLive = applied.snapshot, demoLive = {...demoRoot, reviewSession: session, reviewSeenIds: [...session.seenIds]};
const raw = (demoValue = demoLive, reviewValue = planLive, pretty = false) => ({demo: demoValue === null ? null : JSON.stringify(demoValue, null, pretty ? 2 : undefined), review: reviewValue === null ? null : JSON.stringify(reviewValue, null, pretty ? 2 : undefined)});
function bundle(pair = raw()) {const built = buildCapabilityReviewBackup(pair, NOW); assert.equal(built.ok, true, JSON.stringify(built)); return built.backup;}
const source = bundle();
const options = storage => ({storage, now: () => NOW});
function prepare(payload, storage) {const result = prepareCapabilityReviewRestore(payload, options(storage)); assert.equal(result.ok, true, JSON.stringify(result)); return result.prepared;}
const execute = (prepared, storage, extra = {}) => executeCapabilityReviewRestore(prepared, {storage, locks: new NamedLocks(), now: () => NOW, ...extra});

test('legacy undefined never reads either key, clock or lock, while allowing main apply', async () => {
  let reads = 0, clocks = 0, applies = 0;
  const storage = {getItem() {reads++; throw new Error('must not read');}, setItem() {throw new Error('must not write');}, removeItem() {throw new Error('must not delete');}};
  const result = prepareCapabilityReviewRestore(undefined, {storage, now() {clocks++; throw new Error('must not read time');}});
  assert.equal(result.status, 'legacy-preserved'); assert.equal(result.summary.included, false);
  const done = await executeCapabilityReviewRestore(result.prepared, {storage, locks: {request() {throw new Error('must not lock');}}, apply: () => {applies++;}, rollback() {}, now: () => {clocks++; throw new Error('must not clock');}});
  assert.equal(done.ok, true); assert.equal(done.status, 'legacy-preserved'); assert.equal(reads, 0); assert.equal(clocks, 0); assert.equal(applies, 1);
});

test('both namespaces capture, validate and roundtrip full answer/draft/session/receipt data', async () => {
  const origin = new MemoryStorage(raw()), captured = captureCapabilityReviewBackup(options(origin)); assert.equal(captured.ok, true);
  assert.equal(validateCapabilityReviewBackup(captured.backup, NOW).ok, true); assert.deepEqual(new Set(origin.reads), new Set([DEMO_KEY, REVIEW_KEY]));
  const target = new MemoryStorage(), prepared = prepare(captured.backup, target); assert.equal(target.writes.length, 0);
  const done = await execute(prepared, target); assert.equal(done.status, 'restored'); assert.equal(target.writes.length, 2); assert.equal(target.removes.length, 0);
  const rebuilt = captureCapabilityReviewBackup(options(target)); assert.equal(rebuilt.ok, true); assert.deepEqual(rebuilt.backup.stores, captured.backup.stores);
});

test('explicit null payloads preserve existing raw bytes and do not clear either namespace', async () => {
  const storage = new MemoryStorage(raw(demoLive, planLive, true)), before = storage.raw(), empty = bundle({demo: null, review: null});
  let applies = 0; const done = await execute(prepare(empty, storage), storage, {apply: () => {applies++;}, rollback() {}});
  assert.equal(done.status, 'retained'); assert.deepEqual(storage.raw(), before); assert.equal(storage.writes.length, 0); assert.equal(storage.removes.length, 0); assert.equal(applies, 1);
});

test('older compatible demo/review backup retains newer live raw bytes and receipts', async () => {
  const older = bundle(raw(demoRoot, planRoot)), storage = new MemoryStorage(raw(demoLive, planLive, true)), before = storage.raw();
  const done = await execute(prepare(older, storage), storage); assert.equal(done.status, 'retained'); assert.equal(done.summary.review, 'backup-older'); assert.deepEqual(storage.raw(), before); assert.equal(storage.writes.length, 0);
});

test('conflicting first answers, drafts and canonical result receipts reject before any write', () => {
  const failedResult = recordResult(planRoot, {taskId: firstTask.taskId, resultId: `${firstTask.taskId}:result`, outcome: 'needs-practice', at: session.finishedAt}, session.finishedAt).snapshot;
  const cases = [bundle(raw({...demo({choice: 0}), reviewSession: session, reviewSeenIds: session.seenIds}, planLive)), bundle(raw({...demo({draft: 'A different unfinished diary.'}), reviewSession: session, reviewSeenIds: session.seenIds}, planLive)), bundle(raw(demoLive, failedResult))];
  for (const [index, payload] of cases.entries()) {const storage = new MemoryStorage(raw()), before = storage.raw(), result = prepareCapabilityReviewRestore(payload, options(storage)); assert.equal(result.ok, false); assert.equal(result.status, index === 2 ? 'review-conflict' : 'demo-conflict'); assert.deepEqual(storage.raw(), before); assert.equal(storage.writes.length, 0);}
});

test('stale preparation rejects latest raw mismatch before main apply', async () => {
  const storage = new MemoryStorage(), prepared = prepare(source, storage); storage.values.set(DEMO_KEY, JSON.stringify(demo({draft: 'Another tab typed this.'})));
  const before = storage.raw(); let applied = false; const done = await execute(prepared, storage, {apply: () => {applied = true;}, rollback() {}});
  assert.equal(done.status, 'stale-prepared'); assert.equal(applied, false); assert.deepEqual(storage.raw(), before); assert.equal(storage.writes.length, 0);
});

test('dual restore holds the actual shared two-key locks against both existing single-key writers', {timeout: 2000}, async () => {
  const storage = new MemoryStorage(), locks = new NamedLocks(), entered = deferred(), release = deferred(), prepared = prepare(source, storage);
  const restoring = execute(prepared, storage, {locks, apply: async () => {entered.resolve(); await release.promise;}, rollback() {}});
  await entered.promise;
  const demoStore = createDemoStore({storage, locks, now: () => NOW}), reviewStore = createReviewStore({storage, locks, now: () => NOW});
  let demoFinished = false, reviewFinished = false;
  const writingDemo = demoStore.save(demo({draft: 'Stale tab draft.'}), null).then(result => {demoFinished = true; return result;});
  const writingReview = reviewStore.ensurePlan({...completion, completionId: 'stale-tab-completion'}).then(result => {reviewFinished = true; return result;});
  try {await Promise.resolve(); assert.deepEqual(locks.active, new Set([DEMO_KEY, REVIEW_KEY])); assert.equal(demoFinished, false); assert.equal(reviewFinished, false);}
  finally {release.resolve();}
  assert.equal((await restoring).ok, true); assert.equal((await writingDemo).status, 'tab-conflict'); assert.equal((await writingReview).status, 'already-exists');
  assert.deepEqual(JSON.parse(storage.raw().review).plan.receipts, planLive.plan.receipts);
});

test('setItem failure before/after either write rolls back both raw values with confirmation', async () => {
  for (const original of [{demo: null, review: null}, raw(demoRoot, planRoot, true)]) for (const which of [1, 2]) for (const phase of ['before', 'after']) {
    const storage = new MemoryStorage(original), before = storage.raw(), prepared = prepare(source, storage);
    storage.onWrite = (key, value, point, index) => {if (index === which && point === phase) throw new Error(`write-${which}-${phase}`);};
    const done = await execute(prepared, storage); assert.equal(done.ok, false); assert.equal(done.status, 'rolled-back'); assert.deepEqual(storage.raw(), before); assert.deepEqual(done.recovery.original, before); assert.equal(done.recovery.main, 'not-applied'); assert.ok(done.recovery.errors.some(error => error.includes(`write-${which}-${phase}`)));
    if (original.demo !== null) assert.equal(storage.removes.length, 0, 'nonempty raw rollback restores exact bytes instead of deleting either key');
  }
});

test('one-off readback exception rolls back, persistent readback exception reports partial recovery', async () => {
  for (const persistent of [false, true]) {
    const storage = new MemoryStorage(), prepared = prepare(source, storage); let written = false, failures = 0;
    storage.onWrite = () => {written = true;}; storage.onRead = key => {if (written && key === DEMO_KEY && (persistent || failures === 0)) {failures++; throw new Error('readback-fault');}};
    const done = await execute(prepared, storage); assert.equal(done.ok, false); assert.equal(done.status, persistent ? 'partial-failure' : 'rolled-back'); assert.ok(done.recovery.errors.some(error => error.includes('readback-fault')));
    if (persistent) {assert.equal(Object.hasOwn(done.recovery.current, 'demo'), false); assert.ok(done.recovery.attempted.demo);}
    else assert.deepEqual(storage.raw(), {demo: null, review: null});
  }
});

test('main apply failure invokes rollback; main rollback failure is explicitly partial', async () => {
  for (const rollbackFails of [false, true]) {
    const storage = new MemoryStorage(), prepared = prepare(source, storage); let main = 'before', rolled = 0;
    const done = await execute(prepared, storage, {apply() {main = 'changed'; throw new Error('main-apply-fault');}, rollback() {rolled++; if (rollbackFails) throw new Error('main-rollback-fault'); main = 'before';}});
    assert.equal(done.status, rollbackFails ? 'partial-failure' : 'rolled-back'); assert.equal(done.recovery.main, rollbackFails ? 'rollback-failed' : 'rolled-back'); assert.equal(rolled, 1); assert.equal(main, rollbackFails ? 'changed' : 'before'); assert.equal(storage.writes.length, 0); assert.deepEqual(storage.raw(), {demo: null, review: null});
  }
});

test('local write failure also rolls back already-applied main state', async () => {
  const storage = new MemoryStorage(), prepared = prepare(source, storage); let main = 'before';
  storage.onWrite = (key, value, point, index) => {if (index === 2 && point === 'after') throw new Error('second-write-after');};
  const done = await execute(prepared, storage, {apply() {main = 'changed';}, rollback() {main = 'before';}});
  assert.equal(done.status, 'rolled-back'); assert.equal(done.recovery.main, 'rolled-back'); assert.equal(main, 'before'); assert.deepEqual(storage.raw(), {demo: null, review: null});
});

test('unconfirmed rollback and unrelated raw writer are preserved as explicit partial failures', async () => {
  for (const conflict of [false, true]) {
    const storage = new MemoryStorage(), prepared = prepare(source, storage), foreign = JSON.stringify(demo({draft: 'Another writer owns this text.'}));
    storage.onWrite = (key, value, point, index) => {if (index === 1 && point === 'after') {if (conflict) storage.values.set(DEMO_KEY, foreign); else throw new Error('after-first-write');}};
    if (!conflict) storage.onRemove = () => {throw new Error('rollback-remove-fault');};
    const done = await execute(prepared, storage); assert.equal(done.ok, false); assert.equal(done.status, 'partial-failure'); assert.ok(done.recovery.original); assert.ok(done.recovery.attempted); assert.equal(done.recovery.current.demo, storage.raw().demo);
    if (conflict) {assert.equal(storage.raw().demo, foreign); assert.ok(done.recovery.errors.length >= 2);}
  }
});

test('concurrent tokens serialize and stale second restore never reapplies main', async () => {
  const storage = new MemoryStorage(), locks = new NamedLocks(), first = prepare(source, storage), second = prepare(source, storage); let applies = 0;
  const results = await Promise.all([execute(first, storage, {locks, apply: () => {applies++;}, rollback() {}}), execute(second, storage, {locks, apply: () => {applies++;}, rollback() {}})]);
  assert.equal(results[0].ok, true); assert.equal(results[1].status, 'stale-prepared'); assert.equal(applies, 1); assert.equal(storage.writes.length, 2);
});

test('same prepared token cannot execute concurrently or be reused after execution', {timeout: 2000}, async () => {
  const storage = new MemoryStorage(), entered = deferred(), release = deferred(), prepared = prepare(source, storage);
  const running = execute(prepared, storage, {apply: async () => {entered.resolve(); await release.promise;}, rollback() {}}); await entered.promise;
  try {assert.equal((await execute(prepared, storage)).status, 'restore-in-progress');} finally {release.resolve();}
  assert.equal((await running).ok, true); assert.equal((await execute(prepared, storage)).status, 'invalid-prepared');
});

test('unstable capture/preparation and malformed/future payloads fail without writes', () => {
  for (const api of [captureCapabilityReviewBackup, opts => prepareCapabilityReviewRestore(source, opts)]) {
    const storage = new MemoryStorage(raw()); let demoReads = 0;
    storage.onRead = key => {if (key === DEMO_KEY && ++demoReads === 2) storage.values.set(DEMO_KEY, JSON.stringify(demo({draft: 'Changed between reads.'})));};
    const result = api(options(storage)); assert.equal(result.ok, false); assert.ok(['capture-conflict', 'prepare-conflict'].includes(result.status)); assert.equal(storage.writes.length, 0);
  }
  const invalid = [null, {}, {...source, version: 2}, {...source, exportedAt: NOW + 1}, {...source, stores: {wrongNamespace: null}}];
  const badDemo = copy(source); badDemo.stores[DEMO_KEY].attempts[0].at = NOW + 1; invalid.push(badDemo);
  for (const payload of invalid) assert.equal(validateCapabilityReviewBackup(payload, NOW).ok, false);
});

test('unacquired locks, missing rollback hook and corrupt live data cannot claim restored', async () => {
  for (const locks of [{}, {request: async () => undefined}, {request: async (name, opts, cb) => cb(null)}]) {
    const storage = new MemoryStorage(), done = await execute(prepare(source, storage), storage, {locks}); assert.ok(done && !done.ok); assert.equal(done.status, 'locks-unavailable'); assert.equal(storage.writes.length, 0);
  }
  const storage = new MemoryStorage(), prepared = prepare(source, storage); assert.equal((await execute(prepared, storage, {apply() {}})).status, 'invalid-hooks'); assert.equal(storage.writes.length, 0);
  const corrupt = new MemoryStorage({demo: '{bad raw', review: JSON.stringify(planLive)}), before = corrupt.raw(); assert.equal(prepareCapabilityReviewRestore(source, options(corrupt)).ok, false); assert.deepEqual(corrupt.raw(), before);
});

test('real legacy nextFresh correction survives capture/validate/restore despite key order', async () => {
  const oldState = nextFresh(initialState(BASE)), payload = bundle(raw(oldState, null));
  assert.equal(validateCapabilityReviewBackup(payload, NOW).ok, true);
  const storage = new MemoryStorage(), done = await execute(prepare(payload, storage), storage);
  assert.equal(done.ok, true); assert.deepEqual(JSON.parse(storage.raw().demo).correction, oldState.correction); assert.equal(storage.raw().review, null);
});

test('reordered object fields are equivalent and retain live bytes', async () => {
  const reorder = value => Array.isArray(value) ? value.map(reorder) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).reverse().map(([key, entry]) => [key, reorder(entry)])) : value;
  assert.equal(validateCapabilityReviewBackup(reorder(source), NOW).ok, true);
  const storage = new MemoryStorage(raw(reorder(demoLive), reorder(planLive), true)), before = storage.raw();
  const done = await execute(prepare(source, storage), storage); assert.equal(done.status, 'retained'); assert.deepEqual(storage.raw(), before); assert.equal(storage.writes.length, 0);
});

test('unknown top/nested fields remain rejected rather than silently normalised away', () => {
  for (const mutate of [payload => {payload.extra = true;}, payload => {payload.stores[DEMO_KEY].correction.extra = true;}, payload => {payload.stores[DEMO_KEY].attempts[0].extra = true;}, payload => {payload.stores[DEMO_KEY].reviewSession.extra = true;}, payload => {payload.stores[REVIEW_KEY].extra = true;}]) {
    const bad = copy(source); mutate(bad); const storage = new MemoryStorage(raw()), before = storage.raw();
    assert.equal(validateCapabilityReviewBackup(bad, NOW).ok, false); assert.equal(prepareCapabilityReviewRestore(bad, options(storage)).ok, false); assert.deepEqual(storage.raw(), before); assert.equal(storage.writes.length, 0);
  }
});

test('valid early demo without optional fields or explicit attempt flags gains safe defaults', async () => {
  const bare = {version: 1, createdAt: BASE, attempts: [{id: 'first-noah', choice: 1, at: BASE + 1000}], hints: []}, payload = bundle({demo: JSON.stringify(bare), review: null});
  assert.equal(validateCapabilityReviewBackup(payload, NOW).ok, true);
  const storage = new MemoryStorage(), done = await execute(prepare(payload, storage), storage); assert.equal(done.ok, true);
  const restored = JSON.parse(storage.raw().demo); assert.equal(restored.draft, ''); assert.equal(restored.reviewSession, null); assert.equal(restored.finishedAt, null); assert.equal(restored.attempts.length, 1);
  assert.deepEqual(restored.attempts[0], {...bare.attempts[0], correct: false, hinted: false, repeated: false}); assert.equal(storage.raw().review, null);
});
