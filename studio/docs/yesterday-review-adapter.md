# Yesterday demo review adapter

`public/demos/yesterday/review-adapter.mjs` is a standalone local scheduling model and browser storage adapter. It does not grade answers, change demo content or map progress, schedule background work, claim mastery, or calculate IELTS Bands.

The one capability is `yesterday-past`, with stable plan ID `capability:yesterday-past:v1`. The version 1 store has its own key and Web Locks name, `nce-capability-review:v1`. No other storage key is read or written.

## API

```js
import {createReviewStore, CAPABILITY_ID, getDueTasks, openPractice} from './review-adapter.mjs';
const store = createReviewStore({storage: localStorage, locks: navigator.locks, now: Date.now});
const ready = await store.ready();
const current = await store.read();
if (current.ok) {
  const tasks = getDueTasks(current.snapshot, Date.now());
  const relativeURL = tasks[0] ? openPractice(tasks[0]) : null;
}
const plan = await store.ensurePlan({completionId: 'real-demo-completion-id', completedAt: Date.now(), capabilityId: CAPABILITY_ID});
// The caller supplies an outcome only after its separate practice/grading flow.
const result = await store.recordResult({taskId, resultId: `${taskId}:result`, outcome: 'passed', at: Date.now()});
const exported = await store.exportBackup();
const restored = await store.restoreBackup(exported.backup); // object or JSON string
```

Every store method returns a promise for `{ok, status, message?, snapshot?, receipt?, backup?, raw?, changed?}`. Failure never deletes or silently resets stored data. Only a successful `created`, `recorded` or `restored` mutation confirms a persisted change. `ready` confirms the lock/read path; it cannot guarantee that a later storage write will succeed. `read` and `exportBackup` remain available without locks for inspection and recovery. UI refresh on `storage` events belongs to the caller: reread the store instead of applying a tab's cached snapshot.

Pure exports are `emptySnapshot()`, `validateSnapshot(snapshot, now)`, `ensurePlan(snapshot, input, now)`, `recordResult(snapshot, input, now)`, `getDueTasks(snapshot, now)` and `openPractice(taskIdOrTask)`. The two operation functions return immutable result objects without persistence. `validateSnapshot` returns `{ok, issues}`. `getDueTasks` and `openPractice` reject malformed input with an error: use successfully read/validated snapshots. `openPractice` returns only `/demos/yesterday/?review=<encoded taskId>`; opening a URL neither completes nor grades an occurrence.

## Schedule and identity

- Initial completion creates a plan once, due at `completedAt + 24 hours`. Repeated completion calls return the existing plan and cannot move its due date or replace its completion reference.
- A due occurrence is `{taskId: planId + '@' + dueAt, planId, capabilityId, dueAt}`. Before due, `getDueTasks` returns `[]`; after due, the current occurrence remains until an actual result is saved. Missed calendar days do not fabricate completions or extra occurrences.
- A result must identify the real current due occurrence. Its canonical result ID is `taskId + ':result'`. Its timestamp cannot precede the task or live update, or be in the future. Passing schedules `at + 7 days`; needing practice schedules `at + 24 hours`. These are demo teaching proposals, not validated retention or mastery thresholds.
- Same-result retries with the same outcome return the first immutable receipt, including its original timestamp. A competing outcome returns `result-conflict`, retaining the first receipt. Unknown/stale occurrences and early results never modify storage.
- Numeric times are positive safe integer UTC epoch milliseconds within JavaScript's date range. Intervals are elapsed durations; timezone changes and DST do not change them. Created, updated, completion, result and backup export times cannot be future. Due times may be future only when the validated interval chain generates them.

The snapshot is `{kind: 'nce-capability-review', version: 1, namespace, revision, createdAt, updatedAt, plan}`. An empty snapshot has revision 0, null times and a null plan. A created plan has revision 1; each applied receipt increments it once. A plan contains its immutable completion fields, creation/update times, current due time and ordered receipts. Receipt fields are `{resultId, taskId, outcome, at, dueAt, nextDueAt, revision}`. Validation recomputes the entire schedule from its root and receipts, rejecting fabricated due times, revisions, duplicate receipts, malformed shapes and future history.

## Storage, legacy and backup boundaries

Mutations capture JSON input before waiting, acquire `navigator.locks.request(STORAGE_KEY, {mode: 'exclusive'}, callback)`, validate the exclusive lock, reread the latest localStorage value, apply the pure operation, write once and confirm exact readback. All tabs using this adapter serialize on that name. No unlocked read-modify-write fallback is used. An injected lock port must provide those same exclusive-lock semantics; the adapter cannot certify an arbitrary port's implementation. Blocked/rejected locks, unavailable storage, malformed data and unconfirmed writes fail closed. A write may occur before an exception: the UI must reread and use the canonical receipt before retrying. The adapter never clears raw data to recover. It owns only its namespace; code bypassing it can still tamper with browser storage.

Statuses include `ready`, `read`, `created`, `already-exists`, `recorded`, `already-recorded`, `result-conflict`, `not-due`, `stale-task`, `exported`, `restored`, `backup-older`, `backup-noop`, `backup-conflict`, `invalid-input`, `invalid-data`, `invalid-clock`, `locks-unavailable`, `storage-unavailable`, and `storage-error`. Check `ok` before treating an operation as successful. A readonly successful `read` does not imply writable storage. Diagnostic `raw`, when available on failures, can be offered for manual recovery and must never be injected into HTML without escaping.

Old demo `planSaved`/`demoPlanSaved` booleans are only suggestions. They are not read here, cannot form a valid snapshot, and cannot create receipts. The UI must supply an actual completion ID and actual completion timestamp to import an eligible legacy completion; it must not invent completion from a flag, click or lesson opening.

Backups are exclusively `{kind: 'nce-capability-review-backup', version: 1, namespace: STORAGE_KEY, exportedAt, snapshot}`. Restore validates both backup and current live snapshot while holding the lock. An empty live store can accept a valid backup. With a live plan, completion roots must agree and receipt histories must share an identical prefix. A longer compatible history preserves every applied live receipt; an old backup is a no-op and cannot roll back due time or revision. Conflicting roots or receipts are rejected. Corrupt live storage is preserved and blocks restore; recovery/replacement requires a separate explicit UI decision rather than a reset hidden in this adapter.

Run `node scripts/test-yesterday-review.mjs` for injected-clock, shared-lock and storage-failure tests. No learner records or browser services are needed.
