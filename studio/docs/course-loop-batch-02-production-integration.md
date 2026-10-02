# CL02 production-host candidate on accepted v34

The local candidate registers NCE1 textbook groups 7-8, 9-10 and 11-12 in the real production host and completes the single successor path 1 -> 3 -> 5 -> 7 -> 9 -> 11 -> existing classic 13. This is implemented and locally tested, awaiting the sole publisher's review, combined QA and publication. No push, merge or deployment was performed by this owner.

Base: both specified release branches were fetched and checked at `075af33819f2c09dcf840ee118d24ea207e7da3f`, which records accepted v34 runtime `ff2cedbb7f315f00862e6f2151e8c18732571bac` / fixed `8b353d9b`. The latest documentation head differs from the runtime only in README and IELTS05 publication notes. The publisher confirmed it had not implemented CL02; the three-course registry confirmed that independently. Main was not substituted for either specified branch. The independent integration worktree was used throughout; publisher and original worktrees and the thirteen sealed natural-time profiles remain untouched.

Frozen original author content `8470b6af2a45020d34e137acaf55d69f75d20c28` was reapplied as `8f0c4bf43134b9fedf8f9943fc25a341be39ac01`. The three 18-task modules and their local matcher remain byte-identical to the author delivery, with the original 54-answer / 1402-probe independent AI review reused. No content or final matching rule changed. Earlier author coverage and handoff files remain historical candidate records, not the production registry or a claim that 276 groups have complete loops.

## Exact runtime change

Runtime integration commit: `38af412090b198fd029d146ff44532cbf7703f24` (eight files including five test-support/assertion updates).

| Runtime file | Change |
|---|---|
| `studio/course-loop/registry.mjs` | Three explicit imports and bindings appended after 1/3/5. Each binding uses the real `createCourseLoopModel` with the module's exported matcher. Coverage is never a registration source. |
| `studio/course-loop/host-contract.d.ts` | CourseId and source lesson/comic unions extend only to 7/9/11. Version-1 envelopes and action types stay compatible. |
| `studio/app/course-loop-next.ts` | Explicit successors for all six groups, with 11 continuing to the existing unregistered 13. Existing pending/due selection, advanced/reset routes and access-only behavior remain. |

No change was needed in Today, record mounting, selected-course parser, ordinary notes or guarded writer. The twelve keys are the existing patterns `nce-course-loop-v1:${groupId}` / `nce-course-loop-inputs-v1:${groupId}` for NCE1-1/3/5/7/9/11. The old default key still means lesson 1. Foreign envelopes and correction IDs are refused with raw retained; no implicit CL00 fallback or record migration was added.

Factory, UI, parser/writer, Today, backup/restore, map/media and FSRS sources were checked byte-equal to v34. IELTS files are unchanged. SourcePanel already uses the selected first lesson, exact language hash and authored clip labels; the selected original text, comic image and actual audio were tested. The v33 correction-refusal messages remain; no reducer, storage/CAS, scoring or scheduling algorithm was edited here.

## Verification

- 101/101 Node content, real-factory, selected-host, old CL00/CL01 and correction-feedback tests; zero skips/failures. The selected host is bundled from actual app/registry/parser/Today sources, with no v30 source replacement. Test-only `fixtureForId` now explicitly imports all six registered modules rather than falling through to lesson 5.
- Existing 49/49 Today cases, 19/19 actual Chrome storage/CAS checks, 8 host and 9 UX groups, progress-file round trips, navigation checks and 15 FSRS behavior scenarios passed.
- TypeScript and both real classic/map online builds passed. This local environment reads existing dependencies and assets only; Vite `--configLoader runner` avoids writing temporary config bundles through the borrowed dependency symlink. Large-bundle notices are unchanged-scope build notices, not acceptance of a new performance target.
- Core native UI: 22/22 groups, zero Runtime exceptions. Fresh localhost Chrome QA profile; genuine mouse/keyboard/file upload/download. Six independent draft/sidecar namespaces survive refresh; Today has six distinct pending links; ordinary note survives separate selected-tab writes. Every course completes 12 actual UI attempts, retains originals and lesson-7 correction, and follows 1 -> 3 -> 5 -> 7 -> 9 -> 11 -> real classic13. Actual downloaded six-course pending/finished backups restore their exact strings. Imported unsupported content version, foreign envelope and foreign correction ID block lesson 7 without erasing raw or changing lesson 9. Original text, comic images, real decoded audio/seek and three selected clip labels pass for each new group. No audibility was asserted.
- Core 320/390 CSS viewport checks cover all three new waiting workspaces and six-course records, with no horizontal page overflow. Screenshots were also inspected. This is desktop Chrome emulation, not a physical phone/Safari result.
- Supplemental native review: 2/2 groups, zero Runtime exceptions, cover all three new courses' A and B banks and Today earliest-due order. The actual downloaded QA backup is copied, timestamps explicitly backdated, then imported through the genuine restore UI. The browser clock is unchanged. Each new bank is completed through native inputs; independent banks schedule seven days and the lesson-7 helped B bank schedules one day. These results are synthetic-time host evidence, not natural retention or learning gains.

The browser driver records transport/readiness retries. Earlier failed attempts were retained: choice/input assumptions, native selection/focus, panel/dialog readiness, navigated contexts and leaving before a review-next save confirmed. Test-driver preparation was corrected; no runtime or content source was changed for these attempts. Final evidence counts only accepted runs. General save guards were obeyed, never bypassed.

`studio/work/course-loop-batch-02-integration/` contains local logs and fresh synthetic proofs. The handoff package includes accepted native receipts/screenshots/actual QA backup files, separate supplemental-review receipt, protected-source equality and a driver-history summary. Browser profiles, dependencies, generated map data, textbook/audio assets, real user data and sealed profiles are excluded.

Reproduce from repo root after installing the existing project dependencies, preparing the usual source-bound map JSON and building classic/map online assets:

```sh
node --test --test-concurrency=1 studio/course-loop/batch-02/test-content.mjs studio/course-loop/batch-02/test-production-model.mjs studio/course-loop/batch-02/test-production-boundary.mjs studio/course-loop/batch-01/test-content.mjs studio/course-loop/batch-01/test-model-compat.mjs studio/course-loop/batch-01/test-final-nationality.mjs studio/course-loop/batch-01/test-production-host.mjs studio/course-loop/batch-01/test-correction-feedback.mjs studio/course-loop/test-model.mjs
node studio/course-loop/batch-02/test-production-browser.mjs
CL02_REVIEW_BACKUP=/absolute/path/to/the/new-QA-finished-six-course-backup.json node studio/course-loop/batch-02/test-production-browser.mjs
```

`CL02_ASSET_ROOT` may point to the existing published-material asset directory. The native script requires installed Chrome/Chromium (`CHROME_BIN` override), only localhost, and always creates/removes its own new profile. Its default run creates the QA finished backup; supplemental mode reads only that explicitly selected QA file. It never queries an existing browser or recording store.

## Handoff status and acceptance boundary

- **Implemented:** three new group content modules, real six-course binding, separate existing namespaces, single successor route and shared Today/records mounting.
- **Tested:** source/type/build/model regressions and the bounded local native cases above. Unknown/cross-course raw preservation, actual backup restore and limited narrow viewports have direct UI evidence.
- **Pending integration/publication:** sole publisher `01a0fa39-c2a2-7239-87b4-b0a9c091f0ba` reviews the minimal runtime diff and combines it serially with its current branch. Root's separate cloud QA remains independent. Publisher must rebuild/package and accept exact immutable/production origins before claiming deployment. Do not apply author content twice if already cherry-picked; runtime patch `38af412` applies after the unchanged author payload. Final verification/docs commit adds no runtime edits.
- **Pending human evidence:** teacher/learner free expression, natural 24-hour/seven-day delay, physical device and sound quality. No score/Band or learning improvement is promised.

No product blocker was found in the requested bounded scope. The wider curriculum inventory and finite-batch proposal retain their prior status; this integration does not declare full-course coverage.
