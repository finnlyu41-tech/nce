/** Local demo scheduling only. An outcome does not certify mastery or an IELTS Band. */
export const STORAGE_KEY = 'nce-capability-review:v1';
export const PLAN_ID = 'capability:yesterday-past:v1';
export const CAPABILITY_ID = 'yesterday-past';
export const DAY_MS = 24 * 60 * 60 * 1000;
export const LOCK_NAME = STORAGE_KEY;
const KIND = 'nce-capability-review';
const BACKUP_KIND = 'nce-capability-review-backup';
const MAX_TIME = 8640000000000000;
const isObject = value => typeof value === 'object' && value !== null && !Array.isArray(value);
const isTime = value => Number.isSafeInteger(value) && value > 0 && value <= MAX_TIME;
const isId = value => typeof value === 'string' && value.trim() === value && value.length > 0 && value.length <= 200;
const clone = value => JSON.parse(JSON.stringify(value));
class ReviewError extends Error {
  constructor(status, message) {super(message); this.status = status;}
}
const reject = (status, message) => {throw new ReviewError(status, message);};
const failure = (status, message, extra = {}) => ({ok: false, status, message, ...extra});
const caught = error => failure(error instanceof ReviewError ? error.status : 'invalid-data', error instanceof ReviewError ? error.message : 'The review data could not be validated.');
function keys(value, expected, label) {
  if (!isObject(value) || Object.keys(value).length !== expected.length || expected.some(key => !Object.hasOwn(value, key))) reject('invalid-data', `Invalid ${label} shape.`);
}
function clockTime(now) {
  if (!isTime(now)) reject('invalid-clock', 'The clock must provide a positive safe timestamp.');
  return now;
}
function addDays(at, days, status = 'invalid-data') {
  const due = at + days * DAY_MS;
  if (!isTime(at) || !isTime(due)) reject(status, 'The proposed interval exceeds the safe date range.');
  return due;
}
export function emptySnapshot() {
  return {kind: KIND, version: 1, namespace: STORAGE_KEY, revision: 0, createdAt: null, updatedAt: null, plan: null};
}
function assertSnapshot(value, now) {
  clockTime(now);
  keys(value, ['kind', 'version', 'namespace', 'revision', 'createdAt', 'updatedAt', 'plan'], 'review snapshot');
  if (value.kind !== KIND || value.version !== 1 || value.namespace !== STORAGE_KEY || !Number.isSafeInteger(value.revision) || value.revision < 0) reject('invalid-data', 'Wrong review namespace, version or revision.');
  if (value.plan === null) {
    if (value.revision !== 0 || value.createdAt !== null || value.updatedAt !== null) reject('invalid-data', 'An empty store cannot contain scheduling history.');
    return value;
  }
  const plan = value.plan;
  keys(plan, ['planId', 'capabilityId', 'completionId', 'completedAt', 'createdAt', 'updatedAt', 'dueAt', 'receipts'], 'plan');
  if (plan.planId !== PLAN_ID || plan.capabilityId !== CAPABILITY_ID || !isId(plan.completionId) || !Array.isArray(plan.receipts)) reject('invalid-data', 'Unknown capability plan or completion reference.');
  if ([plan.completedAt, plan.createdAt, plan.updatedAt].some(at => !isTime(at) || at > now) || plan.createdAt < plan.completedAt || plan.updatedAt < plan.createdAt || value.createdAt !== plan.createdAt || value.updatedAt !== plan.updatedAt) reject('invalid-data', 'Invalid, reversed or future completion/store time.');
  let dueAt = addDays(plan.completedAt, 1);
  const resultIds = new Set();
  for (const [index, receipt] of plan.receipts.entries()) {
    keys(receipt, ['resultId', 'taskId', 'outcome', 'at', 'dueAt', 'nextDueAt', 'revision'], 'result receipt');
    if (receipt.taskId !== `${PLAN_ID}@${dueAt}` || receipt.resultId !== `${receipt.taskId}:result` || resultIds.has(receipt.resultId) || !['passed', 'needs-practice'].includes(receipt.outcome) || receipt.revision !== index + 2) reject('invalid-data', 'Receipt identity, order or outcome is invalid.');
    if (!isTime(receipt.at) || receipt.at > now || receipt.at < dueAt || receipt.at < plan.createdAt || receipt.at > plan.updatedAt || receipt.dueAt !== dueAt) reject('invalid-data', 'Receipt was not applied to a real due occurrence.');
    const next = addDays(receipt.at, receipt.outcome === 'passed' ? 7 : 1);
    if (receipt.nextDueAt !== next) reject('invalid-data', 'Receipt interval does not match this demo proposal.');
    resultIds.add(receipt.resultId); dueAt = next;
  }
  if (value.revision !== plan.receipts.length + 1 || plan.dueAt !== dueAt) reject('invalid-data', 'Scheduling revision or due time disagrees with its receipts.');
  return value;
}
export function validateSnapshot(value, now = Date.now()) {
  try {assertSnapshot(value, now); return {ok: true, issues: []};}
  catch (error) {const result = caught(error); return {...result, issues: [result.message]};}
}
export function getDueTasks(snapshot, now = Date.now()) {
  assertSnapshot(snapshot, now);
  const plan = snapshot.plan;
  return plan && plan.dueAt <= now ? [{taskId: `${PLAN_ID}@${plan.dueAt}`, planId: PLAN_ID, capabilityId: CAPABILITY_ID, dueAt: plan.dueAt}] : [];
}
function taskTime(taskId) {
  if (typeof taskId !== 'string' || !taskId.startsWith(`${PLAN_ID}@`)) reject('invalid-input', 'Unknown review task.');
  const suffix = taskId.slice(PLAN_ID.length + 1), dueAt = Number(suffix);
  if (!isTime(dueAt) || String(dueAt) !== suffix) reject('invalid-input', 'Invalid occurrence timestamp.');
  return dueAt;
}
export function openPractice(task) {
  const taskId = isObject(task) ? task.taskId : task;
  taskTime(taskId);
  return `/demos/yesterday/?review=${encodeURIComponent(taskId)}`;
}
/** Pure immutable operations, also used by the browser adapter under a lock. */
export function ensurePlan(snapshot, input, now = Date.now()) {
  try {
    assertSnapshot(snapshot, now);
    if (!isObject(input)) reject('invalid-input', 'A real completion ID, timestamp and capability are required.');
    const {capabilityId, completionId, completedAt} = input;
    if (capabilityId !== CAPABILITY_ID || !isId(completionId) || !isTime(completedAt) || completedAt > now) reject('invalid-input', 'A real completion ID, timestamp and capability are required.');
    if (snapshot.plan) return {ok: true, status: 'already-exists', snapshot: clone(snapshot), changed: false};
    const plan = {planId: PLAN_ID, capabilityId: CAPABILITY_ID, completionId, completedAt, createdAt: now, updatedAt: now, dueAt: addDays(completedAt, 1, 'invalid-input'), receipts: []};
    return {ok: true, status: 'created', changed: true, snapshot: {kind: KIND, version: 1, namespace: STORAGE_KEY, revision: 1, createdAt: now, updatedAt: now, plan}};
  } catch (error) {return caught(error);}
}
export function recordResult(snapshot, input, now = Date.now()) {
  try {
    assertSnapshot(snapshot, now);
    if (!isObject(input)) reject('invalid-input', 'A reviewed demo outcome and a real timestamp are required.');
    const {taskId, resultId, outcome, at} = input;
    if (!['passed', 'needs-practice'].includes(outcome) || !isTime(at) || at > now) reject('invalid-input', 'A reviewed demo outcome and a real timestamp are required.');
    taskTime(taskId);
    if (resultId !== `${taskId}:result`) reject('invalid-input', 'The result ID must belong to this occurrence.');
    const plan = snapshot.plan;
    if (!plan) return failure('stale-task', 'No capability plan exists.', {snapshot: clone(snapshot)});
    const previous = plan.receipts.find(receipt => receipt.resultId === resultId);
    if (previous) return outcome === previous.outcome
      ? {ok: true, status: 'already-recorded', changed: false, snapshot: clone(snapshot), receipt: clone(previous)}
      : failure('result-conflict', 'The first result for this occurrence is retained.', {snapshot: clone(snapshot), receipt: clone(previous)});
    if (taskId !== `${PLAN_ID}@${plan.dueAt}`) return failure('stale-task', 'This is not the current review occurrence.', {snapshot: clone(snapshot)});
    if (now < plan.dueAt) return failure('not-due', 'This review has not reached its due time.', {snapshot: clone(snapshot)});
    if (at < plan.dueAt || at < plan.updatedAt) reject('invalid-input', 'The result time precedes the due task or a live update.');
    const nextDueAt = addDays(at, outcome === 'passed' ? 7 : 1, 'invalid-input');
    const receipt = {resultId, taskId, outcome, at, dueAt: plan.dueAt, nextDueAt, revision: snapshot.revision + 1};
    const next = clone(snapshot); next.revision = receipt.revision; next.updatedAt = now;
    next.plan = {...next.plan, dueAt: nextDueAt, updatedAt: now, receipts: [...next.plan.receipts, receipt]};
    assertSnapshot(next, now);
    return {ok: true, status: 'recorded', changed: true, snapshot: next, receipt};
  } catch (error) {return caught(error);}
}
function assertBackup(value, now) {
  keys(value, ['kind', 'version', 'namespace', 'exportedAt', 'snapshot'], 'backup');
  if (value.kind !== BACKUP_KIND || value.version !== 1 || value.namespace !== STORAGE_KEY || !isTime(value.exportedAt) || value.exportedAt > now) reject('invalid-data', 'Wrong backup namespace/version or future export date.');
  assertSnapshot(value.snapshot, now);
  if (value.snapshot.updatedAt !== null && value.exportedAt < value.snapshot.updatedAt) reject('invalid-data', 'Backup was exported before its stored history.');
  return value.snapshot;
}
function mergeBackup(live, backup, now) {
  const incoming = assertBackup(backup, now);
  if (!incoming.plan) return {ok: true, status: 'backup-noop', changed: false, snapshot: clone(live)};
  if (!live.plan) return {ok: true, status: 'restored', changed: true, snapshot: clone(incoming)};
  const a = live.plan, b = incoming.plan;
  if (['completionId', 'completedAt', 'createdAt'].some(key => a[key] !== b[key])) return failure('backup-conflict', 'The first live completion plan is retained.', {snapshot: clone(live)});
  const length = Math.min(a.receipts.length, b.receipts.length);
  for (let index = 0; index < length; index++) if (Object.keys(a.receipts[index]).some(key => a.receipts[index][key] !== b.receipts[index][key])) return failure('backup-conflict', 'A live result receipt cannot be overwritten by a backup.', {snapshot: clone(live)});
  if (incoming.revision <= live.revision) return {ok: true, status: incoming.revision < live.revision ? 'backup-older' : 'backup-noop', changed: false, snapshot: clone(live)};
  const merged = clone(incoming); merged.updatedAt = Math.max(live.updatedAt, incoming.updatedAt); merged.plan.updatedAt = merged.updatedAt;
  assertSnapshot(merged, now);
  return {ok: true, status: 'restored', changed: true, snapshot: merged};
}
function browserPort(name) {try {return name === 'storage' ? globalThis.localStorage : globalThis.navigator?.locks;} catch {return undefined;}}

/** All writes are a fresh read-modify-write under the shared Web Locks name. */
export function createReviewStore(options = {}) {
  const config = isObject(options) ? options : {}, storage = Object.hasOwn(config, 'storage') ? config.storage : browserPort('storage'), locks = Object.hasOwn(config, 'locks') ? config.locks : browserPort('locks'), now = config.now === undefined ? Date.now : config.now;
  const currentTime = () => {
    if (typeof now !== 'function') reject('invalid-clock', 'Provide now as a clock function.');
    try {return clockTime(now());} catch (error) {if (error instanceof ReviewError) throw error; reject('invalid-clock', 'The clock could not provide a timestamp.');}
  };
  function readAt(at) {
    let raw;
    try {
      if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') return failure('storage-unavailable', 'Local review storage is unavailable.');
      raw = storage.getItem(STORAGE_KEY);
      if (raw !== null && typeof raw !== 'string') reject('invalid-data', 'Local storage returned a non-string value.');
      const snapshot = raw === null ? emptySnapshot() : assertSnapshot(JSON.parse(raw), at);
      return {ok: true, status: 'read', snapshot, raw};
    } catch (error) {return failure(error instanceof ReviewError ? error.status : error instanceof SyntaxError ? 'invalid-data' : 'storage-error', 'The saved review was not changed; its data could not be read or validated.', {raw});}
  }
  async function read() {try {return readAt(currentTime());} catch (error) {return caught(error);}}
  function save(result) {
    if (!result.ok || !result.changed) return result;
    let raw;
    try {
      raw = JSON.stringify(result.snapshot); storage.setItem(STORAGE_KEY, raw);
      const saved = storage.getItem(STORAGE_KEY);
      if (saved !== raw) return failure('storage-error', 'The review write could not be confirmed.', {raw: saved});
      return result;
    } catch {
      try {raw = storage.getItem(STORAGE_KEY);} catch {raw = undefined;}
      return failure('storage-error', 'The review write failed or could not be confirmed; existing data was not cleared.', {raw});
    }
  }
  async function locked(operation) {
    try {
      if (!locks || typeof locks.request !== 'function') return failure('locks-unavailable', 'Reliable cross-tab review saving requires Web Locks.');
      let result;
      await locks.request(LOCK_NAME, {mode: 'exclusive'}, lock => {
        if (!lock || lock.name !== LOCK_NAME || lock.mode !== 'exclusive') return;
        const at = currentTime(), live = readAt(at);
        result = live.ok ? save(operation(live.snapshot, at)) : live;
        return result;
      });
      return result || failure('locks-unavailable', 'An exclusive review lock was not acquired.');
    } catch (error) {return error instanceof ReviewError ? caught(error) : failure('locks-unavailable', 'The exclusive review lock could not complete.');}
  }
  return {
    ready: () => locked(snapshot => ({ok: true, status: 'ready', snapshot, changed: false})), read,
    async ensurePlan(input) {
      try {const captured = clone(input); return await locked((snapshot, at) => ensurePlan(snapshot, captured, at));}
      catch {return failure('invalid-input', 'Completion input could not be captured.');}
    },
    async recordResult(input) {
      try {const captured = clone(input); return await locked((snapshot, at) => recordResult(snapshot, captured, at));}
      catch {return failure('invalid-input', 'Result input could not be captured.');}
    },
    async exportBackup() {
      try {
        const at = currentTime(), live = readAt(at);
        return live.ok ? {ok: true, status: 'exported', snapshot: live.snapshot, backup: {kind: BACKUP_KIND, version: 1, namespace: STORAGE_KEY, exportedAt: at, snapshot: clone(live.snapshot)}} : live;
      } catch (error) {return caught(error);}
    },
    async restoreBackup(value) {
      try {
        const captured = typeof value === 'string' ? value : JSON.stringify(value);
        return await locked((snapshot, at) => {try {return mergeBackup(snapshot, JSON.parse(captured), at);} catch (error) {return caught(error);}});
      } catch {return failure('invalid-data', 'Backup input could not be captured.');}
    },
  };
}
