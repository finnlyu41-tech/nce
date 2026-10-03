# R12 mini batch02 merge candidate: NCE1 lessons13–24

Complete local authored candidate for six more paired groups, 30 original finite items. Original first six groups/lessons1–12 remain unchanged. Combined manifest now binds each lesson1–24 explicitly to one of12 paired-group task identities. This is partial micro-target coverage; R12 remains open.

Fixed release base: both `codex/english-studio-online-20260926` and `codex/ielts-map-20260930` were freshly verified as `7b7c1283d12f0c6d784478cda8353080598f6980` at start and handoff. Current public host version observed: `2026-10-03-grammar-exposure-v45`, with the original ten mini WAVs. First1–12 content/media from the earlier production batch are retained. Publisher local was8d7f0d1 at start and5ffaaf1a at final read-only patch check; that parallel author work was neither edited nor treated as the published head. The four-file mini patch applies cleanly to5ffaaf1a with `git apply --check --unidiff-zero` (zero-context minimal diff). Isolated branch: `codex/r12-mini-batch02-20261003`; worktree: `mini-task-batch02-worktree`. First13–18 freeze is `296ba28c54b1a1d9ae61f98c164d673bf72244aa`; last19–24 are incremental after it. No push, merge or deployment performed.

| Paired lessons | Task / skill | Taught context used | Explicit uncovered targets |
|---|---|---|---|
|13–14|mini-n1-13 / listening|Specified owner's colour; two speakers, same-colour relation, rejected suggestion, explicit two-colour record|Active colour questions, full possessive construction, human acoustic/delay evidence|
|15–16|mini-n1-15 / reading|Paired traveller messages; We/Our, negation, nationality/role/plural belongings, adjacent-group distractors|Singular a/an production, free nationality dialogue, full IELTS reading|
|17–18|mini-n1-17 / speaking|Introduce two named colleagues, shared plural occupation, affirmative/negative state|Active occupation questions, full pointing dialogue, human oral quality|
|19–20|mini-n1-19 / GT writing|Brief everyday note; current state and exact recipient group, singular/plural objects; third-person/group contrasts|Live state exchange, complete GT letter/quality, Academic writing|
|21–22|mini-n1-21 / listening|Single-object request and Which one selection; size/condition contrasts, correction of proposed property, different recipients|Active ownership questioning, independently producing whole dialogue, human acoustic/delay evidence|
|23–24|mini-n1-23 / reading|Original distribution messages; some/plural, Which ones, surface location, separate recipient groups, negation|Producing plural requests/questions/ones phrases, full IELTS reading|

Each task has teaching → hinted first material/retained first answer → feedback → new independent material → repair → due A/B → explicit finite-pool exhaustion. Repair repeats the independent information-processing mechanism with changed facts; this is no equal-difficulty claim. All materials are original standalone dialogues/notes/scenarios, not copied lesson or teacher recordings. Odd lesson source hashes and six actual even exercise-page image hashes are bound in `../evidence/source-bindings.json`. Additional small task vocabulary is explained before questions. Listening uses installed offline synthetic Samantha WAVs, explicitly uncalibrated/un-auditioned. Listening text fallback preserves help/exposure and cannot count independent listening. Speaking uses local QA audio only to verify selection/metadata behavior; no genuine learner-speech claim. Real learners' audio remains local/in memory, not persisted/uploaded; refresh requires file re-selection. Open speaking/writing are awaiting human review with no auto-quality/Band. Writing is GT preparatory communication; Academic is excluded.

## Ownership and interfaces

New owned subtree: `studio/mini-task/batch-02/`; new explicit finite inventory descriptor: `studio/mini-task/audio-batches.json`.

Only four existing mini-owned files change, with exact minimal diff in `../evidence/shared-mini.patch`:

- `mini-task/content.ts`: import/spread `batch02Tasks`; existing `getMiniTask`, `miniTaskForCourse`, route handling and task IDs remain the API.
- `mini-task/manifest.ts`: append twelve explicit lesson bindings and honest dynamic combined coverage.
- `mini-task/package-audio.py`: consume exactly the two authored finite inventories, total20 WAVs, with previous hash/reference checks retained.
- `mini-task/verify-audio.py`: require the exact20 authored hashes and corresponding root/map resources/references, no broad WAV whitelist.

No new app/nav/Today/CL/UI wiring is required: published Today already inserts `miniPracticeTasks` before default course destination; published paired CL own/waiting callback and known mini route resolve new identities from the content registry. `State.drafts[miniDraftKey(taskId)]` (e.g. `english-mini-task-v1:NCE1-13`) remains the sole existing versioned snapshot host. `mini-task/model.ts`, `adapter.ts`, host/UI, leave guard, navigation, Today, registry, host-contract, course-loop-next, State/offline CAS writer, homepage/map titles and IELTS tablehost are byte-identical to fixed published source. No independent progress store or completion/FSRS/Band award is introduced. Publisher selects the next release label and performs integration/publication.

## Validation on actual final candidate packages

Evidence lives in `../evidence/final/`, with package content hashes, media ledger and native receipts.

- Original six and frozen first-three tasks compare deeply equal; original ten + frozen five WAV bytes compare exactly equal. Unchanged published host/model/CAS sources verified.
- Original-six + new-six model14 groups: original answers, help/exposure, refresh, text modality, helped independent trial excluded, open answers ungraded, real finite A/B clock boundaries, exhausted omission, foreign/future/corrupt raw preservation, no other learner-state mutations.
- Final blind packets30/30 reviewed without hints/references/keys/source/model/audio. Author subsequently compared20 independent closed answers successfully;10 open examples remain ungraded. First-three alignment corrections retained in historical records. Last-three21 guided prompt changed from unproved actual delivery to the supported requested size; final review confirms this sole prompt change and no remaining text answerability blocker.
- Fifteen finite media positive/negative packaging/verifier groups, exact20 WAVs. Empty PCM output from an initial sandbox `say` call was rejected before packaging; exact owned zero-frame files were removed and regenerated using the installed voice. Rejection receipt retained; all final files have nonzero real PCM, expected format and hashes. No whitelist was relaxed and no original resources were deleted.
- Actual normal map Today → each new known mini → first guided answer/feedback → new independent item, refresh originals/correction drafts, CL callback and Today resume. Existing real writer quota failure blocks UI/hash departure; retry saves retained draft. Speaking file re-selection after refresh enforced; no false quality score. Old mini/paired CL/unrelated draft/map records/cards/scores/FSRS state retain exact originals.
- Existing native JSON backup download, file preview and explicit confirmed restore preserve all six mini originals, CL drafts and cards. No audio bytes/blob URLs in backup.
- Real23 exhausted page shows finite-pool warning; real Today omits the exhausted identity and retains raw originals.
- All20 WAVs each return HTTP200 with WAV MIME and exact SHA at root and map (40 actual responses). Missing WAV404 yields honest unavailable/fallback and no exposure; restored playback emits ended. Both13 and21 actually play embedded data WAVs from desktop `file://` offline final package, save, refresh and submit. No external HTTP or runtime exceptions in native flows.
- 320/390px screenshots for13/17/19/23 without horizontal overflow. Human acoustic audition, real learner oral/writing evaluation, cross-device recording/codec behavior and natural delayed learning were not verified.
- Strict TypeScript and scoped lint with `--max-warnings 0` pass. First freeze historical lint had two harmless unused QA variables; both are removed in the incremental commit. Vite builds retain the existing large-chunk advisory, with no compilation failures. Whole online upload verification:1997 files,556 original material files and706959756 original material bytes, preserving resource hashes.
- Actual unchanged Today scheduler proves repair0/resume1/due2 precede fresh mini3.5, one identity, course fallback afterward and read-only recommendation. Navigation/resource-loader regressions pass.

Two pre-existing test-suite failures remain with exact published-base comparisons: Today44 passed/6 failed (existing placement-offer assumptions and one grammar delay assumption); CL13–24 content32 passed/1 failed (obsolete assertion that these now-published courses are unregistered). Candidate and untouched published-base copies have identical failure names/counts. These are not claimed passing, not silently rewritten, and should be reconciled by their owners. All new mini-specific checks pass independently.

## Handoff and remaining work

Root thread `01a0f25c-5e18-762f-ba8b-7de3421fc01a`; sole publisher `01a0fa39-c2a2-7239-87b4-b0a9c091f0ba`. No thread-message tool is callable in this execution context; final delegated result will notify the parent automatically. Provide this candidate/bundle to that sole publisher, preserving their parallel head rather than resetting it.

Do not close R12: only lesson1–24 paired micro-targets are now authored; lessons25 onward and other books/skills remain uncovered, as do the listed within-lesson goals. Difficulty calibration, human audio audition, human open oral/written evaluation and natural A/B retention evidence remain outstanding. Synthetic QA clocks and local synthetic selection fixtures are not learner performance evidence. No user records or natural lesson13 archive were read or altered; no uploads/new paid APIs/permissions.
