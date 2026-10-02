# Learning UI: narrow-screen navigation and first review action

This independent batch is based on `c6b9b0182317fba09d1957b9844d6edc63f51ac4`. At intake, fresh `git ls-remote` confirmed both requested release refs at that commit. At closeout both refs were `ce91bebc609c61227538f79dda3c487bcbee4fb5` (publisher's v38 documentation successor). All six code paths changed here are unchanged between those two commits. No main branch, publisher files, user records, session databases, credentials, or sealed natural-time profiles were used.

## Changes and file ownership

- `app/grammar-curriculum-ui.tsx` / `.css`: keep search directly available; group the three secondary stage/purpose/book filters behind one control, with an active-filter count. The first unit now fits substantially higher on a 320px screen. Existing filters, clear action, questions, progress and delayed checks retain their behavior.
- `app/flashcard-ui.tsx` / `.css`: expose the existing original IELTS enrollment action in the empty state; omit an empty personal-word panel; remove a repeated pre-flip instruction; make license attribution a sibling of the playback/settings disclosure. Keep the self-rating limitation, browser save scope, source merging and real local review-time explanation.
- New `app/ielts-practice.css`: at <=640px show the overview and all four skill tabs, including the currently selected writing task. Desktop tabs retain their existing layout.
- Shared interface only in `app/ielts.tsx`: import the new CSS and add `ielts-practice-tabs` to the existing `TabsList`. A separate exact interface diff is supplied for the publisher; no writing/speaking content or recording logic changes.

No edits to homepage/today queue, map main/current-route/style, course registration, recording components, progress save/restore, vocabulary data, grammar data, or IELTS example data. Privacy, recording consent, backup exclusions and honest score/learning-effect limits remain intact.

## Evidence and verification

Local evidence root: `/Users/finnlyu/Documents/Codex/2026-10-03/task-2/qa/`.

- Before screenshots: `before/` (vocabulary, index, grammar list/unit, IELTS writing, review, records); `before-rest/` (IELTS initial task chooser); `before-map/` (locked lesson and settings). Initial screenshot-driver selector/route mistakes are retained as failures, not claimed as application defects.
- `after/observations.json`: 30 actual Chrome screenshots across ten screen types at CSS widths 320, 390 and 1440, height 900. Zero Runtime exceptions and no whole-document horizontal overflow. Screens include vocabulary, index, grammar, IELTS chooser/writing, review, records, lesson gate and settings.
- `interactions-r4/actions.json`: five completed targeted UI groups. All five IELTS tabs fit within 320px with >=44px control height; reading/writing tabs open, and an actual typed writing draft survives reload. Grammar filter/clear actions restore all 28 units; native practice controls reach question two and preserve the typed draft through reload. Twelve original IELTS cards enroll through the newly exposed action, reveal, accept Good with a receipt, preserve the exact graded card on repeat enrollment, undo to the original ID/schedule with an increased stale-operation revision, and survive reload. Attribution is a sibling and the self-rating restriction remains visible. Actual registered course and Academic task bodies were also inspected at 320/390/1440 after native actions in the new synthetic profile. No state-store injection or clock changes.
- Grammar select change was exercised through the visible form control's standard DOM change event after the headless native OS popup did not accept CDP keys. Native OS select-popup behavior is unverified. Buttons and text entry use native CDP input.
- `tsc --noEmit`, online and offline Vite builds, and `git diff --check` pass. The map build also passes against the base and matches its published source asset name; map code is untouched.
- Existing flashcard checks pass all 15 behavior scenarios plus source/real component callback checks (275 registered canonical source-headword callbacks). Existing grammar content, filters, practice, 87 UI answer/status checks and persistence checks pass. Guided learning checks retain 276 lesson boundaries and existing expression/draft/record behavior.
- `lint-baseline.json`: the three changed TSX files retain exactly the baseline's 13 strict ESLint errors and 2 warnings (existing effects/types/unused imports), with no new findings. Strict ESLint is therefore not claimed fully clean.

These are local Chrome viewport and synthetic-record results, not iPhone/Safari, audio-quality, natural-spacing, complete lesson-by-lesson, or post-deployment acceptance. This batch does not mark all R38–42/49 or all sixty requirements complete. The sole publisher must integrate and check the final deployed binding; this task does not push, merge or deploy.

No application blocker remains for this batch. Broader backup/recording/curriculum work stays with its existing owners. Obsidian root rules were unavailable at the known local paths and Dropbox path, so no substitute memory directory or duplicate status store was created.
