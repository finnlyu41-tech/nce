Independent host candidate based on `c6b9b0182317fba09d1957b9844d6edc63f51ac4`; no push, merge or deployment. Eighteen explicit registry bindings preserve the old six keys/default and register 13–35 with each full content module and its local matcher. The continuation table reaches existing 37 while unfinished and due records keep priority.

Minimal production changes: `course-loop/registry.mjs`, `course-loop/host-contract.d.ts`, and the successor table in `app/course-loop-next.ts`. Only test adapters additionally changed. Model, SourcePanel, save/CAS/store, Today adapter and UI remain byte-identical to the base. Original frozen author trees remain intact; source-only `49db3ea` is cherry-picked as `5f6e17a` and fixes JSON/LRC identity without changing questions or matchers.

Validation: 46 host/CL00 + 35 old content/factory + 16 real source-contract tests pass, TypeScript and both static builds pass. Real native Chrome QA passes25 checks over old six and13/25/35, including draft refresh, original wrong answer/correction retention, independent keys, two-tab different-course saves, downloaded backup/native file restore, unsupported raw retention and source text/comic/audio metadata. Task5 separately passes all six25–35 actual SourcePanels on this build. Evidence is in `parallel-nce1-013-035-host-proof/` with hashes in the JSON manifest. QA records are synthetic and isolated; no natural24h/7d or learning claim.

Publisher owns UI: `map/learning.tsx:36` still selects `lessonPlan(unit).goal` for registered courses (visible in25 screenshot); use registered `lesson.goal` and rerun final UI acceptance. No UI file was changed here. R15 finite-pool Today omission is separately reproduced and will be a separate bounded selector commit.

Reproduction from studio (read-only shared `node_modules` and authorized source assets required):

```sh
node map/prepare-curriculum.mjs
node node_modules/typescript/bin/tsc --noEmit
node node_modules/vite/bin/vite.js build --config vite.static.config.ts --configLoader runner --mode online
node node_modules/vite/bin/vite.js build --config map/vite.config.ts --configLoader runner --mode online
node --test course-loop/parallel-nce1-013-035-host/test-boundaries.mjs course-loop/parallel-nce1-013-035-host/test-source-contract.mjs course-loop/batch-01/test-production-host.mjs course-loop/test-model.mjs
node course-loop/parallel-nce1-013-035-host/test-production-browser.mjs
```

Do not package into shared `dist-online` from this checkout. Builds above write only candidate `static-export` and `map/dist`; no complete media copies belong to delivery.
