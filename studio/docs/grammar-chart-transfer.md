# R24–26 bounded chart-comparison application

Base: `15505c43a1f35b8b7a60830b3bb7cc0e826f1d40` on both requested remote branches, containing `d717bad`. This is a local candidate only. D26 exposure correction is retained unchanged.

## Actual gap and scope

All 97 existing guides already have unit ownership. The `comparisons` unit checks same-level comparison, comparative forms, too/enough and manner, but has no data-grounded check of from/to versus by, percentage points versus relative change, or cross-sectional versus temporal claims. Its old IELTS-use/transfer text alone cannot demonstrate that learners can choose an accurate relationship from a new table. This batch closes that narrow application gap, not all remaining R24–26 or all 61 requirements.

The connection to Academic Writing Task 1 is an authored pedagogical inference: describing and summarising graph/table information is part of the official task, per [British Council Academic Writing practice guidance](https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests/academic/writing). All tables, prompts, explanations, distractors and paragraph examples here are original fictional material. This is a short skill component, not a complete timed 150-word task or band-score assessment.

## Implemented

- Four original teaching explanations and two meaning contrasts: from/to/by; percentage-point difference versus relative change; ratio and same-denominator comparison; cross-section, sample-size and cause boundaries.
- Three progressive tasks: interpret a 40%→50% change; repair a meaning-changing preposition; independently choose a comparison for a new 60%/30%/10% table. One current item and one main next action are shown.
- A third, different table asks for an independently chosen overview and supporting detail, not another set of supplied-word sentence assembly. The paragraph stays pending human review with concrete data, aggregation and inference checks.
- 26 finite reference strings across the three tasks and 12 explicit near-error feedback examples. Correct unlisted writing stays pending; even unlisted erroneous language stays honestly unchecked rather than pretending this finite matcher understands arbitrary semantics.
- New bounded draft namespace `grammar-chart-transfer-comparisons-v1` within existing `State.drafts`; saves step, exact current/first checked responses, help and paragraph. Edit cancels current feedback without replacing the first response. No changes to curriculum attempts, material exposure, Today, routing, homepage, capability scores or other owners' trees.

## File ownership and integration

Independent files: transfer/comparisons-chart.json; grammar-chart-transfer.ts; grammar-chart-transfer-ui.tsx; grammar-chart-transfer.css; its test, preview trio and this documentation/review evidence.

The only shared-source edit is two additive lines in `grammar-curriculum-ui.tsx` (import plus mount for the current unit). It was reported before implementation. `grammar-chart-transfer-ui-interface.patch` contains that exact tiny diff for reviewers; it is already part of this candidate, so do not apply it twice. All original unit data, 168 canonical questions, accepted answer sets, matcher and exposure-ledger source remain unchanged.

## Verification completed

`node scripts/test-grammar-chart-transfer.mjs --report` passes: 26 finite references, 12 explicit near errors, original 168 canonical and 158 accepted forms, 20 real production TSX handler events in an in-memory component harness. Tests cover all three failure/repair feedback branches, unknown natural writing pending, first-error retention after correction, current step and draft restoration by re-instantiating hooks, hint persistence, open paragraph/self-check persistence, answer bounds, unknown IDs and no writes to the curriculum ledger namespace. These are component/state tests, not browser evidence.

TypeScript passes using an ignored local path alias to the official lockfile-verified `ts-fsrs@5.4.2` package retained from the prior isolated QA. Unaliased checking reports only the shared node_modules' missing declared ts-fsrs dependency. No lockfile, dependency tree, permissions or paid API change.

`vite build --config previews/vite.chart-transfer.config.ts --configLoader runner` passes for the actual current GrammarCurriculum plus new workshop. It reports the existing large preview chunk; the preview imports the registered curriculum and its existing media. No learner audio was read/uploaded. An existing curriculum component-harness regression, if run without a stub for the newly imported child, needs that child stub; this is not a content or product failure and old compatibility assertions are not a release gate.

No-key independent review is in `grammar-chart-transfer-blind-review.json`. It found the unique constrained answers, supplied multiple natural comparison forms, and required denominator, Other-aggregate and largest/majority wording corrections; those corrections are implemented. Its initial imprecise 'share of modes' sentence is recorded honestly and not used as a canonical answer.

## Remaining browser acceptance — do not mark complete

Current selected environment exposes no CUA/browser-control tools. No actual 320/390 layout or browser-refresh result is claimed. The ready preview uses production components, initial synthetic state and an origin-specific preview key:

```sh
cd /Users/finnlyu/Documents/Codex/2026-10-03/task-4/grammar-transfer-worktree/studio
./node_modules/.bin/vite --config previews/vite.chart-transfer.config.ts --configLoader runner
```

Open `http://127.0.0.1:4296/previews/grammar-chart-transfer.html` in a fresh isolated test origin/session. One writer only; do not use original v21 or any real learner records. The preview's “进入图表应用” link scrolls directly to the production slot.

1. At 320 and 390, inspect tables, options, feedback, wrapping and textarea usability with screenshots. Do not infer layout from CSS or the component harness.
2. Choose exercise 1's first option, check and verify numerical-unit error feedback; then choose the second option. Verify the first error remains on the result after correction.
3. Continue to item 2. Enter `The bus share rose by 40% to 50% between 2016 and 2024.`; refresh before checking. Verify this same item/draft returns. Check the specific by/from error, correct to `from`, check and continue.
4. Item 3: use a hint, enter `The tram share was 30% higher than the bus share.`, refresh, then check. Verify hint and exact answer survive and feedback explains 39% versus 60%. Try a listed natural answer, then `Trams attracted twice the commuter share of buses.`; the last must show pending human review, not wrong or passed.
5. Continue to the different table. Write 2–3 original overview/detail sentences; refresh before saving. Verify paragraph and phase restored. Save for self-check: status must remain open-expression pending, with no score or mastery/transfer badge. Inspect Other and largest/majority criteria.
6. Read the explicit references and return to item 3. Verify work is retained and navigation does not mutate the ordinary comparisons round/ledger. Capture exact browser DOM, console and screenshots for root/publisher.

Only the authorized publisher integrates and releases after current-version browser acceptance. There was no push, merge or deployment by this author.
