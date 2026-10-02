# R47 all map writers: native file and concurrency acceptance

This supplements the frozen R46–47 delivery (63c07144 + 49ff216f). It uses the production built App in a new temporary headless Chrome 154 profile, a temporary localhost origin and synthetic records. Native localStorage and native Web Locks are used. The map candidate is an actual Chrome download saved on disk and uploaded via the DOM file input. No learner profile, recording, credential, session database, natural-time archive or browser clock was changed.

`browser-report.json`: **53 passing assertions**. Both restore-first and ordinary-save-first lock queues produce exactly one native write. Both request the identical named lock; neither commits while it is held; the losing stale snapshot rejects. Real expression autosave competing with restore retains the losing text for explicit retry. Same-page queued edits retain the latest input. Older step completion cannot clear newer typing. Quota rejection and absent locks preserve stored bytes, local expression/quiz input, native back and step position. Real chapter, mock and quiz writer UI waits for success before showing receipts. Native form writes, answer writes, navigation writes and restore all share the same lock.

`regression-real-files/browser-report.json`: **39 passing assertions** re-run against this integration. Actual textbook v2 export carries both capability namespaces and full notes/word sources/card/course drafts; downloaded-file upload restores exact answers/help/receipts/due. Legacy v1/plain main files preserve capability data. Newer live capability results survive older backups. Corrupt/future/invalid input, stale previews, native IDB failure and capability failure preserve/roll back the measured stores. Actual map download/rollback/upload, quota/retry/repeat and two restore confirmations still pass. All artifact SHA256 and tested source SHA256 entries were checked after copying the evidence here. The first delivery evidence remains unchanged.

Implementation: `map/progress-write.ts` is the independent shared-lock transaction. Compare, transform, validation, native write, readback and reference publication stay inside the lock. `progress-file-restore.ts` delegates to it. `Save` becomes `Promise<boolean>`; a page queue rebases only earlier confirmed own writes and invalidates queued consent on foreign events/restores. Main, learning, course and expression interface patches wait for confirmed success, retain input and prevent navigation after failed saves. Expression/quiz add only local input buffers required to avoid losing a controlled value on asynchronous rejection.

Integration base: fb34b97c855c2c048faffe42cab3cf5cf94890c7, with the first delivery cherry-picked as 43a8163/af14329. Speaking owner dependencies were copied into this isolated test integration as 422341c/1a18bab/8ddf57f, corresponding to original e669f3f7, c3a308b6 and 040beb75. **Do not apply those owner copies twice.** This delivery changes no speaking/media owner file; learning includes the supplied `onLeaveGuard` interface line. Preserve owner's pendingChange/pendingSave behavior when composing on the publisher's current UI head.

Validation: static and map Vite production builds, TypeScript check, progress-save, capability adapter 20/20, actual-source capability UI 26/26, map reliability 41/41, reviewer navigation 252/252, navigation and speaking retry model passed. `map/test-save.mjs` remains blocked by the existing stale test mock (11 missing exports, including useLayoutEffect, useContext, curriculum question helpers and media exports); this same failure was reproduced on the untouched first-phase baseline. It is not counted as passing. Native production-browser coverage above replaces no test result and is reported independently.

Repeat from studio after preparing the existing curriculum/dependencies:

```sh
node node_modules/vite/bin/vite.js build --config map/vite.config.ts --configLoader runner --mode online
node node_modules/vite/bin/vite.js build --config vite.static.config.ts --configLoader runner --mode online
node scripts/test-map-writers-browser-r47.mjs
node scripts/test-progress-file-browser-r46-47.mjs
node node_modules/typescript/bin/tsc --noEmit
```

Limits: concurrent guarantees require all writing tabs to run the upgraded shared-lock implementation. An old pre-upgrade synchronous tab cannot be forced to obey a new lock. Safari/iOS/iCloud picker/share sheets, deployment, actual disk exhaustion/power loss, user audio transport and natural elapsed-time archives were not tested here. Speaking owner's asynchronous native UI acceptance is separate; this tree preserves their exact implementation. No publication or remote branch write was performed.
