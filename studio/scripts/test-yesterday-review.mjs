import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {STORAGE_KEY, PLAN_ID, CAPABILITY_ID, DAY_MS, LOCK_NAME, emptySnapshot, validateSnapshot, ensurePlan, recordResult, getDueTasks, openPractice, createReviewStore} from '../public/demos/yesterday/review-adapter.mjs';
let checks = 0;
async function check(name, fn) {await fn(); checks++; console.log(`✓ ${name}`);}
const copy = value => JSON.parse(JSON.stringify(value));
class MemoryStorage {
  constructor() {this.values = new Map(); this.writes = 0; this.accessed = [];}
  getItem(key) {this.accessed.push(key); return this.values.get(key) ?? null;}
  setItem(key, value) {this.accessed.push(key); this.writes++; this.values.set(key, String(value));}
}
class SharedLocks {
  constructor() {this.tail = Promise.resolve(); this.active = 0; this.maxActive = 0; this.names = [];}
  async request(name, options, callback) {
    const previous = this.tail; let release;
    this.tail = new Promise(resolve => {release = resolve;});
    await previous; this.active++; this.maxActive = Math.max(this.maxActive, this.active); this.names.push(name);
    try {assert.equal(options.mode, 'exclusive'); return await callback({name, mode: 'exclusive'});}
    finally {this.active--; release();}
  }
}
const start = Date.UTC(2026, 9, 1, 23, 59);
const completion = at => ({completionId: 'actual-completion-1', completedAt: at, capabilityId: CAPABILITY_ID});
const taskResult = (task, at, outcome = 'passed') => ({taskId: task.taskId, resultId: `${task.taskId}:result`, outcome, at});
function fixture(at = start) {
  let clock = at;
  const storage = new MemoryStorage(), locks = new SharedLocks();
  return {storage, locks, setTime: at => {clock = at;}, time: () => clock, store: createReviewStore({storage, locks, now: () => clock})};
}
const initial = ensurePlan(emptySnapshot(), completion(start), start).snapshot;
await check('empty store is valid and produces no occurrence', () => {assert.ok(validateSnapshot(emptySnapshot(), start).ok); assert.deepEqual(getDueTasks(emptySnapshot(), start), []);});
await check('initial plan is immutable, due exactly 24 elapsed hours later', () => {
  const before = emptySnapshot(), result = ensurePlan(before, completion(start), start);
  assert.equal(before.plan, null); assert.equal(result.status, 'created'); assert.equal(result.snapshot.plan.planId, PLAN_ID); assert.equal(result.snapshot.plan.dueAt, start + DAY_MS); assert.equal(result.snapshot.revision, 1);
  const again = ensurePlan(result.snapshot, {...completion(start + 99), completionId: 'new-click'}, start + 99);
  assert.equal(again.status, 'already-exists'); assert.deepEqual(again.snapshot, result.snapshot);
});
await check('canonical due occurrence opens only a relative practice URL', () => {
  assert.deepEqual(getDueTasks(initial, start + DAY_MS - 1), []);
  const task = getDueTasks(initial, start + DAY_MS)[0]; assert.equal(task.taskId, `${PLAN_ID}@${start + DAY_MS}`);
  assert.equal(openPractice(task), `/demos/yesterday/?review=${encodeURIComponent(task.taskId)}`); assert.equal(openPractice(task.taskId), openPractice(task));
  assert.throws(() => openPractice(`${PLAN_ID}@01`)); assert.throws(() => openPractice('foreign-task')); assert.throws(() => getDueTasks({}, start));
});
await check('pass schedules seven days, needs-practice one day, with no mastery inference', () => {
  const task = getDueTasks(initial, start + DAY_MS)[0];
  for (const outcome of ['passed', 'needs-practice']) {
    const result = recordResult(initial, taskResult(task, start + DAY_MS, outcome), start + DAY_MS);
    assert.equal(result.status, 'recorded'); assert.equal(result.snapshot.plan.dueAt, start + DAY_MS + (outcome === 'passed' ? 7 : 1) * DAY_MS);
    assert.equal(result.snapshot.plan.receipts.length, 1); assert.equal(result.snapshot.revision, 2); assert.ok(validateSnapshot(result.snapshot, start + DAY_MS).ok);
    assert.equal(Object.hasOwn(result.snapshot, 'mastery'), false); assert.equal(Object.hasOwn(result.snapshot, 'band'), false);
  }
  assert.equal(initial.plan.receipts.length, 0);
});
await check('same-result retries retain original outcome/time and conflicts never overwrite', () => {
  const task = getDueTasks(initial, start + DAY_MS)[0], applied = recordResult(initial, taskResult(task, start + DAY_MS), start + DAY_MS);
  const repeated = recordResult(applied.snapshot, taskResult(task, start + 2 * DAY_MS), start + 2 * DAY_MS);
  assert.equal(repeated.status, 'already-recorded'); assert.deepEqual(repeated.receipt, applied.receipt); assert.deepEqual(repeated.snapshot, applied.snapshot);
  const conflict = recordResult(applied.snapshot, taskResult(task, start + 2 * DAY_MS, 'needs-practice'), start + 2 * DAY_MS);
  assert.equal(conflict.ok, false); assert.equal(conflict.status, 'result-conflict'); assert.deepEqual(conflict.snapshot, applied.snapshot);
});
await check('early, forged, stale and backdated results cannot complete an occurrence', () => {
  const task = getDueTasks(initial, start + DAY_MS)[0];
  assert.equal(recordResult(initial, taskResult(task, start), start).status, 'not-due');
  assert.equal(recordResult(initial, taskResult(task, start), start + DAY_MS).status, 'invalid-input');
  assert.equal(recordResult(initial, taskResult(task, start + DAY_MS + 1), start + DAY_MS).status, 'invalid-input');
  assert.equal(recordResult(initial, {...taskResult(task, start + DAY_MS), resultId: 'alternate-result'}, start + DAY_MS).status, 'invalid-input');
  const other = {taskId: `${PLAN_ID}@${start + 3 * DAY_MS}`};
  assert.equal(recordResult(initial, taskResult(other, start + 3 * DAY_MS), start + 3 * DAY_MS).status, 'stale-task');
  assert.equal(recordResult(emptySnapshot(), taskResult(task, start + DAY_MS), start + DAY_MS).status, 'stale-task');
});
await check('missed days remain one overdue task; next review starts from actual result time', () => {
  const late = start + 20 * DAY_MS, tasks = getDueTasks(initial, late);
  assert.equal(tasks.length, 1); assert.equal(tasks[0].dueAt, start + DAY_MS);
  const applied = recordResult(initial, taskResult(tasks[0], late), late); assert.equal(applied.snapshot.plan.receipts.length, 1); assert.equal(applied.snapshot.plan.dueAt, late + 7 * DAY_MS);
});
await check('UTC durations survive cross-year, leap-day, timezone and DST changes', () => {
  const times = [Date.UTC(2026, 11, 31, 23, 59), Date.UTC(2024, 1, 28, 23, 59), Date.parse('2026-03-08T01:30:00-05:00'), Date.parse('2026-11-01T01:30:00-04:00')], oldTZ = process.env.TZ;
  try {for (const zone of ['UTC', 'America/New_York', 'Asia/Tokyo']) {process.env.TZ = zone; for (const at of times) {const snapshot = ensurePlan(emptySnapshot(), completion(at), at).snapshot; assert.equal(snapshot.plan.dueAt - at, DAY_MS); assert.equal(getDueTasks(snapshot, at + DAY_MS).length, 1);}}}
  finally {if (oldTZ === undefined) delete process.env.TZ; else process.env.TZ = oldTZ;}
});
await check('completion timestamps, capability IDs and safe date bounds are required', () => {
  for (const payload of [null, {}, {planSaved: true}, {...completion(start), capabilityId: 'another'}, {...completion(start), completionId: ''}, {...completion(start), completedAt: start + 1}, {...completion(start), completedAt: -1}, {...completion(start), completedAt: 1.5}]) assert.equal(ensurePlan(emptySnapshot(), payload, start).ok, false);
  const maximum = 8640000000000000; assert.equal(ensurePlan(emptySnapshot(), completion(maximum - 1), maximum).ok, false);
  assert.equal(ensurePlan(emptySnapshot(), completion(start), NaN).status, 'invalid-clock');
});
await check('ready/read do not save; refresh/exit/reentry retains actual plan and receipts', async () => {
  const f = fixture(); assert.equal((await f.store.ready()).status, 'ready'); assert.equal(f.storage.writes, 0); assert.equal((await f.store.ensurePlan(completion(start))).status, 'created');
  const reentered = createReviewStore({storage: f.storage, locks: f.locks, now: f.time}); assert.deepEqual((await reentered.read()).snapshot, (await f.store.read()).snapshot);
  f.setTime(start + DAY_MS); const task = getDueTasks((await reentered.read()).snapshot, f.time())[0]; await reentered.recordResult(taskResult(task, f.time()));
  const afterExit = createReviewStore({storage: f.storage, locks: f.locks, now: f.time}); assert.equal((await afterExit.read()).snapshot.plan.receipts.length, 1); assert.deepEqual(getDueTasks((await afterExit.read()).snapshot, f.time()), []);
});
await check('old demo flags are never read or imported as real completion', async () => {
  const f = fixture(); f.storage.values.set('nce-demo-yesterday-v1', JSON.stringify({planSaved: true, demoPlanSaved: true}));
  await f.store.ready(); assert.equal((await f.store.read()).snapshot.plan, null); assert.equal((await f.store.ensurePlan({demoPlanSaved: true})).ok, false);
  assert.ok(f.storage.accessed.every(key => key === STORAGE_KEY)); assert.equal(f.storage.writes, 0);
});
await check('actual legacy completion time is retained, including an overdue task', async () => {
  const f = fixture(), oldCompletion = start - 3 * DAY_MS, created = await f.store.ensurePlan(completion(oldCompletion));
  assert.equal(created.snapshot.plan.dueAt, oldCompletion + DAY_MS); assert.equal(getDueTasks(created.snapshot, start).length, 1);
});
await check('repeated/concurrent creation never reschedules the first completion', async () => {
  const f = fixture(), second = createReviewStore({storage: f.storage, locks: f.locks, now: f.time});
  const results = await Promise.all([f.store.ensurePlan(completion(start)), second.ensurePlan({...completion(start - DAY_MS), completionId: 'other-tab'}), f.store.ensurePlan(completion(start))]);
  assert.equal(results.filter(result => result.status === 'created').length, 1); assert.equal(f.storage.writes, 1); assert.equal(f.locks.maxActive, 1);
  assert.equal((await second.read()).snapshot.plan.completedAt, start); assert.ok(f.locks.names.every(name => name === LOCK_NAME));
});
await check('competing tabs reread live data and the first saved result wins', async () => {
  const f = fixture(); await f.store.ensurePlan(completion(start));
  const second = createReviewStore({storage: f.storage, locks: f.locks, now: f.time}), stale = (await second.read()).snapshot;
  f.setTime(start + DAY_MS); const task = getDueTasks(stale, f.time())[0];
  const results = await Promise.all([f.store.recordResult(taskResult(task, f.time(), 'needs-practice')), second.recordResult(taskResult(task, f.time(), 'passed')), second.recordResult(taskResult(task, f.time(), 'needs-practice'))]);
  assert.deepEqual(results.map(result => result.status), ['recorded', 'result-conflict', 'already-recorded']);
  const live = (await second.read()).snapshot; assert.equal(live.plan.receipts.length, 1); assert.equal(live.plan.receipts[0].outcome, 'needs-practice'); assert.equal(live.plan.dueAt, f.time() + DAY_MS); assert.equal(f.storage.writes, 2);
  const before = f.storage.getItem(STORAGE_KEY); assert.equal((await second.ensurePlan({...completion(start), completionId: 'cached-demo'})).status, 'already-exists'); assert.equal(f.storage.getItem(STORAGE_KEY), before);
});
await check('queued writes capture payloads before waiting for the shared lock', async () => {
  const f = fixture(), payload = completion(start), creating = f.store.ensurePlan(payload); payload.completionId = 'changed-while-waiting'; payload.completedAt = start - DAY_MS;
  assert.equal((await creating).snapshot.plan.completionId, 'actual-completion-1');
  f.setTime(start + DAY_MS); const task = getDueTasks((await f.store.read()).snapshot, f.time())[0], answer = taskResult(task, f.time()), saving = f.store.recordResult(answer); answer.outcome = 'needs-practice'; answer.at = start + 2 * DAY_MS;
  assert.equal((await saving).receipt.outcome, 'passed');
  const backup = (await f.store.exportBackup()).backup, target = fixture(f.time()), restoring = target.store.restoreBackup(backup); backup.snapshot.plan.completionId = 'changed-backup';
  assert.equal((await restoring).snapshot.plan.completionId, 'actual-completion-1');
});
await check('without reliable locks there are no writes; readonly export remains available', async () => {
  for (const locks of [null, {}, {request: async () => {}}, {request: async (name, options, callback) => callback(null)}, {request: async (name, options, callback) => callback({name, mode: 'shared'})}, {request: async () => {throw new Error('unavailable');}}]) {
    const storage = new MemoryStorage(), store = createReviewStore({storage, locks, now: () => start});
    assert.equal((await store.ready()).ok, false); assert.equal((await store.ensurePlan(completion(start))).status, 'locks-unavailable'); assert.equal(storage.writes, 0);
    assert.equal((await store.read()).ok, true); assert.equal((await store.exportBackup()).ok, true);
  }
});
await check('storage/clock failures and unconfirmed writes never claim saved success', async () => {
  const locks = new SharedLocks(); assert.equal((await createReviewStore({storage: null, locks, now: () => start}).ensurePlan(completion(start))).status, 'storage-unavailable');
  assert.equal((await createReviewStore({storage: {getItem() {throw new Error('disabled');}, setItem() {}}, locks, now: () => start}).ready()).status, 'storage-error');
  for (const now of [() => NaN, () => start + 0.5, 123, () => {throw new Error('clock');}]) assert.equal((await createReviewStore({storage: new MemoryStorage(), locks, now}).ensurePlan(completion(start))).status, 'invalid-clock');
  const storage = new MemoryStorage(); storage.setItem = () => {}; assert.equal((await createReviewStore({storage, locks, now: () => start}).ensurePlan(completion(start))).status, 'storage-error'); assert.equal(storage.getItem(STORAGE_KEY), null);
});
await check('failed writes retain raw; write-then-throw recovers idempotently on reread', async () => {
  const f = fixture(); await f.store.ensurePlan(completion(start)); f.setTime(start + DAY_MS);
  const raw = f.storage.getItem(STORAGE_KEY), task = getDueTasks(JSON.parse(raw), f.time())[0], write = f.storage.setItem.bind(f.storage);
  f.storage.setItem = () => {throw new Error('quota');}; const failed = await f.store.recordResult(taskResult(task, f.time()));
  assert.equal(failed.ok, false); assert.equal(failed.status, 'storage-error'); assert.equal(failed.raw, raw); assert.equal(f.storage.getItem(STORAGE_KEY), raw);
  f.storage.setItem = (key, value) => {write(key, value); throw new Error('after-write');}; assert.equal((await f.store.recordResult(taskResult(task, f.time()))).ok, false); f.storage.setItem = write;
  const retry = await f.store.recordResult(taskResult(task, f.time())); assert.equal(retry.status, 'already-recorded'); assert.equal(retry.snapshot.plan.receipts.length, 1);
});
await check('malformed/future/forged scheduling data is refused without clearing raw', async () => {
  const bad = [null, {}, {version: 1, demoPlanSaved: true}];
  for (const mutate of [s => {s.createdAt = start + 1; s.plan.createdAt = start + 1;}, s => {s.updatedAt = start + 1; s.plan.updatedAt = start + 1;}, s => {s.plan.completedAt = start + 1;}, s => {s.plan.dueAt++;}, s => {s.revision++;}, s => {s.plan.receipts = {};}, s => {s.namespace = 'legacy-progress';}, s => {s.plan.mastery = true;}]) {const value = copy(initial); mutate(value); bad.push(value);}
  for (const value of bad) {
    const f = fixture(), raw = JSON.stringify(value); f.storage.values.set(STORAGE_KEY, raw);
    const read = await f.store.read(); assert.equal(read.status, 'invalid-data'); assert.equal(read.raw, raw); assert.equal((await f.store.ensurePlan(completion(start))).ok, false); assert.equal(f.storage.getItem(STORAGE_KEY), raw); assert.equal(f.storage.writes, 0);
  }
  const f = fixture(); f.storage.values.set(STORAGE_KEY, '{bad json'); assert.equal((await f.store.read()).status, 'invalid-data'); assert.equal(f.storage.getItem(STORAGE_KEY), '{bad json');
});
await check('future receipts, wrong intervals, duplicate receipts and revisions are invalid', () => {
  const due = start + DAY_MS, task = getDueTasks(initial, due)[0], valid = recordResult(initial, taskResult(task, due), due).snapshot;
  for (const mutate of [s => {s.plan.receipts[0].at = due + 1;}, s => {s.plan.receipts[0].nextDueAt++;}, s => {s.plan.receipts.push(copy(s.plan.receipts[0]));}, s => {s.plan.receipts[0].revision = 100;}, s => {s.plan.receipts[0].at = start;}]) {const bad = copy(valid); mutate(bad); assert.equal(validateSnapshot(bad, due).ok, false);}
});
await check('clock rewind cannot reinterpret a saved future update as a valid plan', async () => {
  const f = fixture(); await f.store.ensurePlan(completion(start)); const raw = f.storage.getItem(STORAGE_KEY); f.setTime(start - 1);
  assert.equal((await f.store.read()).status, 'invalid-data'); assert.equal((await f.store.ensurePlan(completion(start - 2))).ok, false); assert.equal(f.storage.getItem(STORAGE_KEY), raw);
});
const history = fixture(); await history.store.ensurePlan(completion(start)); const rootBackup = (await history.store.exportBackup()).backup;
history.setTime(start + DAY_MS); const firstTask = getDueTasks((await history.store.read()).snapshot, history.time())[0]; await history.store.recordResult(taskResult(firstTask, history.time())); const firstBackup = (await history.store.exportBackup()).backup;
history.setTime(start + 8 * DAY_MS); const secondTask = getDueTasks((await history.store.read()).snapshot, history.time())[0]; await history.store.recordResult(taskResult(secondTask, history.time(), 'needs-practice')); const fullBackup = (await history.store.exportBackup()).backup;
await check('old and empty backups cannot roll back newer live receipts or schedule', async () => {
  const before = history.storage.getItem(STORAGE_KEY), writes = history.storage.writes;
  for (const backup of [rootBackup, firstBackup]) {const result = await history.store.restoreBackup(backup); assert.equal(result.status, 'backup-older'); assert.equal(result.snapshot.revision, 3); assert.equal(result.snapshot.plan.dueAt, start + 9 * DAY_MS);}
  assert.equal((await history.store.restoreBackup({...fullBackup, snapshot: emptySnapshot()})).status, 'backup-noop'); assert.equal(history.storage.getItem(STORAGE_KEY), before); assert.equal(history.storage.writes, writes);
});
await check('compatible longer backup merges and retains every applied live receipt on reentry', async () => {
  const f = fixture(history.time()); f.storage.values.set(STORAGE_KEY, JSON.stringify(firstBackup.snapshot));
  const result = await f.store.restoreBackup(JSON.stringify(fullBackup)); assert.equal(result.status, 'restored'); assert.equal(result.snapshot.revision, 3); assert.deepEqual(result.snapshot.plan.receipts[0], firstBackup.snapshot.plan.receipts[0]);
  const reentered = createReviewStore({storage: f.storage, locks: f.locks, now: f.time}); assert.deepEqual((await reentered.read()).snapshot, result.snapshot); assert.equal((await reentered.restoreBackup(firstBackup)).status, 'backup-older');
});
await check('receipt property order does not create a false backup conflict', async () => {
  const reordered = copy(fullBackup); reordered.snapshot.plan.receipts = reordered.snapshot.plan.receipts.map(receipt => Object.fromEntries(Object.entries(receipt).reverse()));
  const before = history.storage.getItem(STORAGE_KEY), result = await history.store.restoreBackup(reordered); assert.equal(result.status, 'backup-noop'); assert.equal(history.storage.getItem(STORAGE_KEY), before);
});
await check('empty live store restores complete own backup without inventing completions', async () => {
  const f = fixture(history.time()), result = await f.store.restoreBackup(fullBackup);
  assert.equal(result.status, 'restored'); assert.deepEqual(result.snapshot, fullBackup.snapshot); assert.equal(result.snapshot.plan.receipts.length, 2); assert.equal(result.snapshot.plan.completedAt, start);
});
await check('conflicting receipt histories and completion roots never overwrite live storage', async () => {
  const conflict = copy(firstBackup), receipt = conflict.snapshot.plan.receipts[0]; receipt.outcome = 'needs-practice'; receipt.nextDueAt = receipt.at + DAY_MS; conflict.snapshot.plan.dueAt = receipt.nextDueAt; assert.equal(validateSnapshot(conflict.snapshot, history.time()).ok, true);
  const otherRoot = copy(rootBackup); otherRoot.snapshot.plan.completionId = 'another-completion'; const before = history.storage.getItem(STORAGE_KEY);
  for (const backup of [conflict, otherRoot]) assert.equal((await history.store.restoreBackup(backup)).status, 'backup-conflict'); assert.equal(history.storage.getItem(STORAGE_KEY), before);
});
await check('future, forged, foreign and malformed backups are rejected while raw is retained', async () => {
  const before = history.storage.getItem(STORAGE_KEY), cases = [null, '{}', '{invalid', {...fullBackup, kind: 'nce-demo-yesterday-v1'}, {...fullBackup, namespace: 'global-progress'}, {...fullBackup, version: 2}, {...fullBackup, exportedAt: history.time() + 1}];
  const forged = copy(fullBackup); forged.snapshot.revision = 999; cases.push(forged);
  for (const backup of cases) {assert.equal((await history.store.restoreBackup(backup)).ok, false); assert.equal(history.storage.getItem(STORAGE_KEY), before);}
});
await check('valid backup cannot silently overwrite corrupt live storage', async () => {
  const f = fixture(history.time()); f.storage.values.set(STORAGE_KEY, '{corrupt live'); assert.equal((await f.store.restoreBackup(fullBackup)).status, 'invalid-data'); assert.equal(f.storage.getItem(STORAGE_KEY), '{corrupt live'); assert.equal(f.storage.writes, 0);
});
await check('concurrent restore/result preserves the first applied live receipt', async () => {
  const f = fixture(start + DAY_MS); f.storage.values.set(STORAGE_KEY, JSON.stringify(initial)); const task = getDueTasks(initial, f.time())[0];
  const results = await Promise.all([f.store.recordResult(taskResult(task, f.time(), 'needs-practice')), f.store.restoreBackup(firstBackup)]);
  assert.equal(results[0].status, 'recorded'); assert.equal(results[1].status, 'backup-conflict'); assert.equal((await f.store.read()).snapshot.plan.receipts[0].outcome, 'needs-practice');
});
await check('adapter never clears storage, sends data, grades content or requests background rights', async () => {
  const source = await readFile(new URL('../public/demos/yesterday/review-adapter.mjs', import.meta.url), 'utf8'); assert.doesNotMatch(source, /removeItem\(|\.clear\(|fetch\(|Notification|serviceWorker|setInterval\(|content\.mjs|model\.mjs|nce-demo-yesterday-v1/);
});
console.log(`Yesterday review adapter: ${checks} checks passed.`);
