# NCE1 37–60 production host candidate

Final immutable base: `febb408a5777b0fef77ba5f0b5d8f7dd57e1902d` (both current formal release heads). Testing began on publisher v40 local candidate `92f777d7d4c61811689b353263d7d59076b4e507`; the final rebase adds only the publisher's two release documentation files, and all tested production bytes remain identical. The tested branch is retained as `codex/nce1-037-059-host-tested-92f777d`. Both formal remote heads were `424efc1869e98cd7b19afd2c1ab7cab0e8380b4b` at start. The v40 bundle SHA256 was `2e003d701d97e866bfb2db60864f5bec1c7a004eb731ad6da45b1e8d04c3102f`. No main baseline or publisher checkout was changed.

Imported frozen author commits, in order: `1713614bd7b859fa503c46093a1138179cfddad8`, `374fb251f725d5db692ab4422edef1b6b8b89e38`, `ee34333bb530debe268ed203eb9bec338cb33736`. Their 24 source/content/test files remain byte-identical; see `frozen-file-binding.json`. This adds 12 groups and 216 tasks to the existing 18 groups, yielding 30 groups / 540 tasks.

Production ownership is exactly registry, host-contract CourseId/source lesson/comic unions, and course-loop-next. Registry passes each full imported module, including its local matcher, to the existing factory. Routing extends 35→37→39→41→43→45→47→49→51→53→55→57→59→61, with unfinished/due priority, advanced/reset routes and R15 finite-pool repair preserved. Unknown successor IDs retain a valid destination. Old keys/defaults and saved raw are unchanged. SourceKind is untouched; retain the video owner's subsequent extension when combining branches.

The model, SourcePanel, IndexedDB store, progress backup/CAS, Today, FSRS and latest asynchronous map save code are byte-identical to the immutable base. Read-only node_modules/material symlinks share existing assets; no media are copied or published.

Validation:

- TypeScript and both actual classic/map production builds succeeded. `built-artifact-binding.json` binds their output bytes.
- 52 actual-host checks passed: thirty-course isolation, all normal successors, pending/due ordering, real backup validator, R15 failed/helped/independent exhaustion, source and comic 30×30 guard matrices, source LRC bytes and timestamps.
- 78 frozen content/near-miss/blind/source assertions passed. `test-frozen-037-content.mjs` keeps original 37–48 assertions while replacing its pre-registration memory-injection adapter with actual registered bindings and replacing its now-registered unknown sample with a stable sentinel. Frozen original files are preserved.
- Actual built native browser: 25/25 passed, zero runtime exceptions. Five representative courses (35/37/47/49/59) retain first wrong answers and corrections, drafts on refresh, independent two-tab writes, native downloaded/restored backups, rejected future/foreign raw and ordinary notes. Normal current-course 35→37, 47→49 and 59→61 each use a current-only synthetic file plus the real map restore UI, so other pending courses cannot mask successor behavior. Real text/comic/blob audio metadata and seek passed for 37/49/59. 320/390 CSS viewport checks passed.
- Two additional actual native checks cover both delayed banks for 37/49/59. Backdated synthetic QA files enter only via the real restore UI; browser clock is unchanged. Assisted answers retain their one-day interval. This is no evidence of natural elapsed retention.

Native receipts and screenshots are in `native/` and `delayed-native/`. Temporary fresh Chrome profiles and their servers were cleaned. QA JSON files contain only this run's fictional records. Earlier driver attempts corrected test selectors and ordering assumptions; no production change resulted. The first heading assertion targeted the workspace instead of the real map heading; source access updated pending timestamps; the map's current route had to be established through native file restore rather than assumed from a course view.

Reproduction from studio (with existing read-only dependencies/assets):

```sh
node ./node_modules/typescript/bin/tsc --noEmit
node ./node_modules/vite/bin/vite.js build --config vite.static.config.ts --configLoader runner --mode online
node ./node_modules/vite/bin/vite.js build --config map/vite.config.ts --configLoader runner --mode online
node --test course-loop/parallel-nce1-037-059-host/test-source-contract.mjs course-loop/parallel-nce1-037-059-host/test-boundaries.mjs course-loop/parallel-nce1-037-059-host/test-exhaustion.mjs
node course-loop/parallel-nce1-037-059-host/test-production-browser.mjs
NCE_HOST_PORT=57437 node course-loop/parallel-nce1-013-035-host/serve-built.mjs
```

Preview route: `http://127.0.0.1:57437/map/#/learn/nce1-37?access=1`. Output directories are checkout-local and ignored. Do not run package-online against the shared media symlink.

No push, merge or deployment. Published origin, natural24h/7d, physical phone, audibility, human expression review and learning gains remain unverified. The old `9310cb98a5d345f29bc345c6960aae0450effcc4` candidate and all author worktrees are retained.
