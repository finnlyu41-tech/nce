# v21 grammar terminal Chinese full stop fix

## Fixed review baseline and handoff

- Baseline: `b46812edff731dabe9c302d2147698c34f132621` (v21).
- Branch: `codex/grammar-terminal-period-v21-20261001`.
- Independent worktree: `/Users/finnlyu/Documents/Codex/2026-10-01/task-4/english-grammar-punctuation-v21`.
- Recovery directory: `/tmp/english-grammar-terminal-period-v21-recovery-20261001/`.
- Recovery patch: `/tmp/english-grammar-terminal-period-v21-20261001.patch`.

The user reported U1, second question group, Q3: `We're at home.` passed but `We're at home。` showed pending review. The new regression first passed all 168 canonical answers and 137 explicit accepted entries on the fixed baseline, then failed on that exact Chinese-period answer. `before-fix.log` records this failing run; `after-fix.log` records the successful run after the small matcher change.

Only `studio/app/grammar-clause-answer.ts` changes production behavior. Its ordinary-grammar branch converts one **terminal** Chinese full stop, preserving trailing whitespace, in both the learner value and each reference. References are split using the existing spaced-slash alternative rule before normalization, including entries from `accepted`. This preserves the 40 canonical answers that already end in Chinese full stops, including their Chinese option explanations. The shared lesson matcher and strict U16/U27/U28 branches retain their existing behavior.

No progress schema or content-version migration is needed: both remain version 1. Learner text is stored unchanged. Existing read/check/finish paths all use the same matcher. Reopening an old checked response can now recognize equivalent final punctuation; **historical failed attempts retain their failed result**. Hints and assistance remain recorded. Seeing a unit or one passed group does not establish delayed evidence.

## Finite verification matrix

| Requirement | Evidence |
| --- | --- |
| Exact reported failure before implementation | ASCII `true`, Chinese `false`; failing regression exit 1 in `before-fix.log` |
| Current registered curriculum | 28 units; 168 canonical answers and all 137 explicit accepted entries pass |
| Terminal punctuation compatibility | 1,220 assertions: the 305 actual reference entries × canonical, case/space, English period, Chinese period variants |
| Recognition remains selective | 296 checks across the 148 actual distractor entries and their terminal-punctuation variants |
| Required forms, meaning and elements | 40 bounded answer counterexamples spanning all 28 units, including negation, tense, missing elements and nonterminal/repeated/fullwidth punctuation |
| Required commas and internal full stops | 43 finite checks from the 10 comma-sensitive IDs and two sentence-sensitive IDs; missing/moved/replaced boundaries still fail |
| Production progress | Every bounded counterexample is checked, reread with a forged matched boolean, and finished through the real progress functions; none passes a round |
| Existing learner records | Raw Chinese answer, hints, historical attempts, notes/cards/unrelated drafts, older/newer records, old plain JSON and v1/v2 backup payloads, alternate-set redo preserved |
| Production TSX handlers | Actual component source with simulated React hooks verifies U1 group 2 Q3 feedback and state updates |
| Real React DOM / Chrome | 12 cases in a fresh task-owned profile: U1 English/Chinese/curly-apostrophe positives, negation/tense/missing-be negatives, and U16/U27/U28 punctuation positives/negatives; reload preserves stored results; no runtime exceptions |
| Desktop/mobile evidence | `browser-evidence/u1-chinese-period-desktop.png`, `browser-evidence/u1-chinese-period-mobile.png`, and `browser-evidence/results.json` in recovery directory; tested 1280×900 and 390×844 without horizontal overflow |
| Existing regressions | Full curriculum, remaining batch `--integrated`, and progress-save scripts pass |
| Checks/build | `tsc --noEmit`, scoped ESLint, full online static build and actual curriculum preview build pass |

The counts above are assertion/reference-entry counts, not counts of distinct grammatical scenarios. The 40 counterexamples include natural English expressions that do not satisfy their constrained prompt or finite reference set. This fix does not make the finite reference matcher an open-ended grammar assessor. Ordinary questions retain their established treatment of internal ASCII punctuation; internal punctuation requirements are checked by the explicitly strict question IDs. Only the terminal Chinese full stop is newly normalized for ordinary grammar answers.

## Reproduce the checks

Use the repository's locked dependencies and Node 22.13 or newer. From `studio/`:

```sh
node scripts/test-grammar-terminal-period.mjs
node scripts/test-grammar-curriculum.mjs
node scripts/test-grammar-remaining.mjs --integrated
node scripts/test-progress-save.mjs
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js app/grammar-clause-answer.ts scripts/test-grammar-terminal-period.mjs scripts/test-grammar-terminal-period-browser.mjs
node map/prepare-curriculum.mjs
node node_modules/vite/bin/vite.js build --config vite.static.config.ts --configLoader runner --mode online
node node_modules/vite/bin/vite.js build --config previews/vite.grammar.config.ts --configLoader runner
```

The full online build needs the pre-existing `dist-online` material artifacts for `prepare:map`. In this independent worktree those artifacts and locked dependencies were linked read-only from the existing checkout; generation writes only this worktree's ignored `map/curriculum.json`. The initial missing-generated-map failure is preserved in `build-initial-missing-generated-map.log`; preparation and final successful build are recorded separately. Both final Vite builds report the repository's large-chunk warning.

For the browser check, serve `studio/work/grammar-curriculum-build/` at `127.0.0.1:4217`, open `/previews/grammar-curriculum.html` in a fresh task-owned Chrome profile with a localhost debugging port `4218`, then run:

```sh
node scripts/test-grammar-terminal-period-browser.mjs
```

`GRAMMAR_PERIOD_PREVIEW_ORIGIN` and `GRAMMAR_PERIOD_DEBUG_ORIGIN` allow other local ports. The script seeds synthetic progress in the preview's separate storage key, not in a learner's live application. It resumes the actual third item and exercises real textarea input, submission, feedback and reload.

The original author handoff ended before publication. The release owner integrated and published this patch on 2026-10-02 after the separate P0 production acceptance; see the linked production record below.

## Production integration

Integrated runtime `3a6e89cf3faf2534087ef2e001743450f2289153`, published as v23 at [486c9ea6](https://486c9ea6.finn-english-studio.pages.dev/). The actual production domain passed 12 bounded target cases reached through 72 native submissions, using a fresh synthetic profile and no storage injection. All raw answers and attempt judgments persisted after reload; no runtime exceptions. Final integrated v1/v2 P0 preview races also passed. Full source gates and both builds passed; both deployed URLs matched 44 exact resource hashes. These do not establish natural 24-hour evidence, real-device/audio acceptance or every grammar expression. Full scope and local evidence paths are in [the existing restore/integration handoff](studio/docs/progress-restore-cas.md#2026-10-02-接管与生产验收).
