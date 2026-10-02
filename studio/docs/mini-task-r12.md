# R12 · Beginner mini-task candidate

Author branch: `codex/mini-task-r12-20261003`; isolated worktree: `/Users/finnlyu/Documents/Codex/2026-10-03/task-7/mini-task-worktree`. Base remote HEAD verified through read-only `git ls-remote`: **both** `codex/english-studio-online-20260926` and `codex/ielts-map-20260930` were `1cb23fdd47a297b41ed9458ab386c5ff786386dc`. Before refresh, local remote-tracking refs were `c6b9b0182317fba09d1957b9844d6edc63f51ac4`; local branch tips were `9b63f28` and `b46812e`. They were not treated as current remote HEAD. The candidate alone was fast-forwarded. No push, merge to publisher, deployment, upload or new paid service/permission.

No AGENTS.md found in the repository at the verified HEAD or existing worktree/ancestor locations. `capture-obsidian-insights` was read; neither known local Dropbox vault root was available here, so no replacement vault or duplicate state record was created. The source delegation and publisher status were read instead; this repository handoff is the authoritative task deliverable.

## Authored scope

Six distinct tasks cover the six registered paired groups, rotating listening / reading / speaking / writing / listening / reading. `mini-task/manifest.ts` explicitly lists lessons **1–12**, each target, graded prerequisite, task binding, reason for sharing with its paired lesson, and uncovered targets. Each lesson has a related micro-task binding; coverage is **partial-target**, not full lesson mastery. Even-numbered lessons reinforce the paired structures; the task never claims to test all textbook exercises. NCE1 13+ remains unauthored here. The old every-three-groups proposal was not modified or promoted into coverage.

| Group / lessons | Task | Skill | Track | Narrow target |
| --- | --- | --- | --- | --- |
| NCE1-1 / 1–2 | mini-n1-01 | Listening | Common foundation | Hear an object and fill one field |
| NCE1-3 / 3–4 | mini-n1-03 | Reading | Common foundation | Read my / not my and extract an owner |
| NCE1-5 / 5–6 | mini-n1-05 | Speaking | Common foundation | Introduce a person and state given nationality |
| NCE1-7 / 7–8 | mini-n1-07 | Writing | General Training preparation | Two-sentence occupation message |
| NCE1-9 / 9–10 | mini-n1-09 | Listening | Common foundation | Hear an explicitly stated current condition |
| NCE1-11 / 11–12 | mini-n1-11 | Reading | Common foundation | Extract colour using given owner and object |

All 30 materials are newly authored standalone scripts/passages/prompts: one guided, independent, repair and two delayed materials per task. No task is taken by array index from the IELTS hub. Track labels do not imply IELTS test equivalence: common tasks practice foundational actions relevant to both tracks; the short occupational message is **GT only**, never Academic Task 1. None is a full exam question or a band estimate. Intended beginner difficulty has **not** been calibrated. Delayed materials support near transfer with repeated core vocabulary; they do not establish general transfer or psychometric parallelism.

## Evidence and storage

`model.ts` uses a strict version/content-version/task-ID event envelope. It stores original submitted answers, help, transcript/audio exposure, original timestamps, separate correction drafts/revisions, limited modality receipts and the finite bank schedule. Only consecutive unsubmitted text edits compact; attempts and exposure do not. Unsupported/future/malformed/oversize records retain their raw text and block writing. First answers and duplicate submissions cannot be overwritten. Limits: 2,000 characters per input, 1,600 events and 256 KiB per task snapshot. Exhaustion/capacity errors remain explicit.

`adapter.ts` reads and writes **only existing `State.drafts`**, key `english-mini-task-v1:<groupId>`. All other State entries are re-read and preserved. It uses the existing `readStateSnapshot`, `writeState`/`writeLegacyState` compare-and-write guard, verifies read-back, rejects same-task conflicts, and retries concurrent unrelated State writes. Task ID and snapshot ID must agree. On first write it also verifies the graded prerequisite: the paired CL has reached `own`/`waiting` or later review. This is a saved learning-position prerequisite, not a map unlock, CEFR or IELTS qualification.

No CL original, map record/access, FSRS card/history, score, completion, attempt counter, user audio database or second progress database is changed. A task invitation, matched closed answer, recording, open text, or scheduled future test grants no such completion. UI queue failures retain pending input and can export unsaved **text** locally before reload. The component must be mounted with `key={taskId}` and its leave guard wired by the host.

The first delay starts after finishing the repair material (24h). A new A bank is consumed only on/after that date; finishing A schedules B after seven days. After B the task reports that fresh material is exhausted and requires new material; it never recycles a bank as new evidence. A wrong/helped result is preserved even when the learner moves on; neither interval nor exhaustion declares mastery. Tests simulate dates. No natural-delay learner evidence has been generated.

## Real media boundaries

Ten bundled WAV files are generated **offline** with the already installed macOS Samantha voice at 125 words/minute, from the original scripts. `audio/provenance.json` records durations, PCM checks, non-silence and SHA256. They are synthetic voices, not IELTS recordings; semantic human audition and learner difficulty calibration remain undone.

The UI hides the listening transcript until a saved help/transcript action. A normal listening submission requires the actual HTML audio element's `ended` event; this is a material-contact receipt, not proof of comprehension. Browser tests play the exact built WAVs. Replays are recorded. Transcript/help invalidates independent evidence; selecting text mode clearly changes modality to text.

Speaking uses a learner-chosen **local** audio file, playable in the page, plus validated duration/size metadata. It requests no microphone permission and has no upload call. Audio bytes are not saved in State or persisted elsewhere. Refresh keeps the metadata but requires reselecting the original local file to submit an active speaking item. A file is evidence of a local oral artifact only; content, pronunciation and quality await external review. The synthetic QA file tests the player and storage boundary, not real learner speech. The explicit written fallback records text and never oral evidence. Open speaking/writing has `matched: null`, `awaiting-external-review`, no automatic score and no unique-reference matching.

## Publisher interfaces and exact shared diff

Only the new mini-task tree, new UI/CSS, new test scripts and this document belong to this branch. Registry, host-contract, course-loop-next, homepage/map titles and IELTS table host were untouched.

- `miniTaskForCourseExit(state, courseId, now)` → eligible remaining task `{taskId,title,href}` or `null`.
- `miniPracticeTasks(state, now, online)` → unique `PracticeTask`-compatible records. Initial tasks have priority **3.5** (existing repair/resume/due work first; new word/course work later). Saved task resumes use 1, due task reviews 2. Waiting/exhausted tasks are omitted; invalid saved raw exposes a recovery task. Offline emits none.
- `miniTaskHref(taskId)` → `/#/mini-task/<taskId>`.
- `parseMiniTaskRoute(hash)` → known `{view:'mini-task',taskId}` or `null` for unknown/unwritten routes.
- `MiniTaskWorkspace` props: `{taskId, onLeaveGuard?, onContinue?(confirmedRead)}`; mount with a task key. `onContinue` receives confirmed existing State via the read object; the publisher selects the existing course route.

`mini-task/publisher-wiring.patch` contains the precise minimal shared change, **not applied to source**:

1. In `today-practice.ts`, import the new adapter and append its records through existing `add()` **before sorting and before default `courseDestination`**. Existing deduplication remains in force.
2. In `course-loop-ui.tsx`, add optional `onMiniTask(confirmedState, courseId)` and a button at `own`/`waiting` only when the adapter offers a task. It uses the existing flush/re-read/conflict checks before the callback. The original continuation remains available.

The patch was applied only to temporary copies, both shared files typechecked, and the real Today model verified for priority, six unique group tasks, read-only behavior and original course fallback. Original shared file bytes were compared unchanged. **Publisher must add the independent hash route and callback using its current host router**, then apply/rebase the patch and run its final production package/QA. This branch does not edit the router or perform that publish step.

## Validation

- Independent AI reviewer saw only `blind-packet.json` (no reference keys): 30/30 answerable, no critical blockers. `blind-review.json` preserves the original findings/limitations. Author comparison matched all **20 closed keys**; 10 open answers remain ungraded.
- Blind findings resolved in final content: state prompts specify the actual heard word; the GT repair prompt is self-contained about order/direct inquiry; ambiguous ownership prompts state that the speakers refer to the same object. Reviewer concerns about near transfer, track scope and no calibration are retained above.
- `test-mini-task.mjs`: **19 groups**, strict snapshots, all six state flows, graded prerequisites, original/help/refresh/correction behavior, finite A/B, target-ID isolation, actual guarded legacy writer, stale writes, unrelated concurrent State preservation, no CL/map/FSRS/completion mutations, blind-key comparison.
- `test-mini-task-wiring.mjs`: exact patch in copies, both patched shared TypeScript files, six unique Today tasks, priority/read-only/fallback behavior, unchanged shared originals.
- `test-mini-task-browser.mjs`: exact built preview in fresh synthetic Chrome profile; six task flows, actual audio playback, local file player, textual fallback, persisted original/correction draft across actual reload, no changed CL/map/FSRS, 1280/390/320 screenshots and zero runtime exceptions/remote HTTP requests. See [validation receipt](../mini-task/evidence/validation.json), [browser receipt](../mini-task/evidence/browser-validation.json) and [320px screenshot](../mini-task/evidence/width-320.png).
- `tsc --noEmit`, lint of all new TS/TSX/MJS files, and Vite production preview build. Build uses `--configLoader native` to avoid writing through borrowed dependency symlinks.
- Original CL00 model, CL01 content/model compatibility, CL02 content/production-model, CL host/UX, and Today **49/49** checks passed. Existing generated `map/curriculum.json` was copied from the publisher's verified source worktree solely as an ignored test prerequisite (the repository does not include packaged textbook output). No generated map or dependency tree is committed.

Reproduce from `studio`: `node scripts/test-mini-task.mjs`, `node scripts/test-mini-task-wiring.mjs`, `node node_modules/vite/bin/vite.js build --config mini-task/vite.config.mjs --configLoader native`. For isolated browser QA serve `work/mini-task/preview` on `http://127.0.0.1:5187`, then `node scripts/test-mini-task-browser.mjs`. The preview is a test entry, not the final product route. It remains prerequisite-gated and contains no automatic learner seed.
