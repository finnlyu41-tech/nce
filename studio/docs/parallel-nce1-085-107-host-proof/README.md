# NCE1 85–108 production host candidate

Final integration base: `7b7c1283d12f0c6d784478cda8353080598f6980` on both remote release branches at the last read. The candidate was first tested on `9d34b1f35aaf9ecfca3e534c5ecb953e46551a22`, then rebased without conflicts onto the newer grammar exposure / Today changes, rebuilt and retested. The retained `native-9d` and `delayed-native-9d` receipts refer only to that earlier base. `native51` is an earlier nine-new-group checkpoint, never the final 54-group result.

The 12 complete frozen modules add 216 questions to the existing 42 groups, yielding 54 registered groups / 972 questions. Full module namespaces, including each local matcher, enter the existing `createCourseLoopModel(content)`. Storage keys remain derived from distinct source group IDs. Existing course versions and records are unchanged. The final chain is 83→85→87→89→91→93→95→97→99→101→103→105→107→existing textbook 109. Unfinished/due priority and unknown-course fallback remain existing host behavior.

Only three production files differ from the base: `course-loop/registry.mjs`, CourseId/lesson/comic unions in `course-loop/host-contract.d.ts`, and successors in `app/course-loop-next.ts`. SourceKind retains video. Model, SourcePanel guard, placement, stage assessment, video, Today, navigation, CAS/IndexedDB/backup, FSRS and grammar exposure files match the current base. `frozen-file-binding.json` binds 406 protected base files and 158 frozen author files. Actual production model SHA256 is `4b3a67cf22c23f2d263af523ac6e314c37714f4b03784efbd935d695571daa57`.

Author provenance:

- 85–90: `c68630540e8197242839e1a96057bbae2d69fcca`; 91–96: `7cf1d01bc8c45bd857dc2e59613252bd1f8b47e8` (task14).
- 97–102: `b08805670d0a2fc5e7ec5d0210db98dd99f44cbd`; 103–108: `e4a2115499617a7aa597fce5470870473fd2a288` (task15).
- Authors' original modules, strict matchers, blind-review records and source metadata are preserved byte for byte. Their commit topology is recorded separately from rebased integration commits in delivery.json.

`production-node.tap` verifies real registry/factory integration, 54×54 record separation, video help captured before answers and mandatory corrections, old 42-group backup preservation, continuous successors, 54 finite-pool repair tasks, and separate 54×54 language/comic source guard matrices. `frozen-content-regression.tap` tests both frozen author content/source suites against the current actual factory. Legacy regression and regenerated audit preserve explicit old 42 groups / 756 tasks / 84 textbook numbers and all 276 not-established learner-acceptance flags. Maintenance rationale is recorded in LEGACY-AUDIT-MAINTENANCE.md.

Native validation uses the actual online classic/map builds and fresh temporary Chrome profiles. UI input, saved snapshots, original wrong answers, separate corrections, independent drafts, refresh, Today, ordinary notes, two tabs, real downloaded backups and real file restore are exercised. Source media is fetched from the existing read-only package. The audio checks confirm decoded blob metadata, selected seek position and clip bounds. Lesson 95's 86.16–88.77 selection contains a question only; lesson 99's 61.83–66.83 endpoint is a selection window, not an LRC row. Neither is claimed to reveal an answer or establish audibility.

The 85–96 construction prompts remain bounded practice, not spontaneous transfer. Lesson 87's later review keeps both unfinished and still-trying meanings; lesson 93's independent semantic choices are not renamed as open expression. Human expression remains pending. Synthetic backdated backup imports test both delayed banks with the browser clock unchanged; they do not establish natural 24h/7d retention. No third review bank, new repair UI, learner completion, published package, physical phone, hearing quality or learning gain is claimed.

Reproduction from `studio` with the existing read-only node_modules and dist-online links:

```sh
node node_modules/typescript/bin/tsc --noEmit
node node_modules/vite/bin/vite.js build --config vite.static.config.ts --configLoader runner --mode online
node node_modules/vite/bin/vite.js build --config map/vite.config.ts --configLoader runner --mode online
node --test course-loop/parallel-nce1-085-107-host/test-source-contract.mjs course-loop/parallel-nce1-085-107-host/test-boundaries.mjs course-loop/parallel-nce1-085-107-host/test-exhaustion.mjs
node course-loop/parallel-nce1-085-107-host/test-production-browser.mjs
NCE_HOST_PORT=57585 node course-loop/parallel-nce1-013-035-host/serve-built.mjs
```

The source suites use the repository's existing original source paths; preview server supports the existing source package. Do not run package-online into the shared read-only media directory. No push, merge, deployment, publisher checkout write, personal profile/learning-record access, or original 13-time profile modification occurred. Scope stops at lesson 108.

Final current-base results: 277/277 Node checks; 34/34 native UI checks plus 2/2 synthetic delayed-bank checks; zero browser runtime exceptions. Final receipts are native/receipt.json and delayed-native/receipt.json. Both QA profiles and local services were cleaned up. Remote heads were re-read at 2026-10-03 00:23:20 UTC and still matched the final base.
