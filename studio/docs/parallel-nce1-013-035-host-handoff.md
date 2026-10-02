Final candidate is rebased onto current remote `fb34b97c855c2c048faffe42cab3cf5cf94890c7`. Earlier c6b9b018 checkpoint is preserved in `codex/nce1-013-035-host-c6b9-checkpoint-20261002`. Final evidence: `parallel-nce1-013-035-host-final.json` and its proof folder:103 Node tests and31 native checks pass, TypeScript and both builds pass. Rebased wiring commit87891bb, separate R15 selector commitab313f0; source correction18b1601 maps exactly to49db3ea. Only three production files differ from current remote. No UI, model or save/store edits.

R15 keeps needs-new-material as an explicit repair task returning this course, without inventing a third bank or blocking later-course choice. Native backup import returns13/25 and retains37; two distinct review banks also submit/save through real UI for13/25/35. Backdated QA timestamps are synthetic, browser clock unchanged. Existing nonreview Today method/priority1 is unchanged; publisher can refine materials/manual-review wording separately.

Publisher still needs registered `getCourseBinding(node.id).lesson.goal` in `map/learning.tsx:36`; the outer heading currently comes from old lessonPlan. Final screenshots show this. Frozen pre-registration content tests intentionally assert exclusion and belong to original author checkpoints; the integration command below is the current registered host contract. SourcePanel guard unchanged; JSON byte hashes remain separate from LRC identities.

The following text and earlier proof folders describe the preserved original baseline checkpoint:

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
