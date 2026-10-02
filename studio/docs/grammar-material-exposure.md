# Grammar material exposure correction

Base: `ae4a678bf0aac4dc1eef343d922d511a1dd8e52a` on both requested remote branches. The base still grants delayed evidence for A failed → B passed → A passed after 24 hours. No actual learner profiles or original 13 natural-time archives were read or changed.

## Implemented behavior

- Material identity uses exact displayed kind, prompt and choices. Renaming a question does not create unseen material. Answer/explanation edits alone do not make a task new.
- Starting a set conservatively records all three tasks as displayed, including unanswered tasks. The finite six-task ledger stays separate from the existing 12-attempt tail and survives refresh, export/import and repeated rounds.
- Only a first presentation of the second set, two independent passes, valid chronology and at least 24 elapsed hours can produce `延迟未见材料检验通过`. The result explicitly excludes unfamiliar-context transfer and IELTS capability claims.
- Prior failed material stays familiar. Both sets exhausted: `熟悉材料复习通过 · 待新材料`. Review, explanations and other units remain accessible.
- Old records without exposure metadata, malformed/partial history, unsupported content, missing prior rounds and omitted unit identity never imply unseen material. Current old-attempt grades/times remain unchanged; reading does not write or migrate the source string. Existing answer-matching and bounded attempt/response behavior are retained. No historical answer snapshots are invented where the previous schema did not store them.
- Hints/theory help still prevent independent evidence and survive reload. The existing backup namespace/version remains in use with additive material metadata; there is no automatic migration or historical grade rewrite.

## Required shared integration

`grammar-material-shared-interface.patch` is separate because publisher owns Today/route touchpoints. Its one functional hunk passes `unit` to the existing `beginGrammarRound` call in `grammar-workspace.tsx`; apply before enabling the changed policy so Today starts retain known material history. Its other hunk labels Today as review and states the exposure boundary. No homepage files changed. Missing this interface is conservative (unknown), but would unnecessarily discard known exposure completeness.

`grammar-material-test-contract.patch` updates existing test callers to pass their synthetic unit, replaces formerly optimistic recovery/unknown-history assertions, and composes the previously delivered explicit-reference/button-label test fix. Apply this combined patch instead of also applying `r24-26-test-ui-contract.patch`; if the publisher already applied that prior patch, compose only remaining hunks. No existing tests were edited in this commit.

## Verification

- `node scripts/test-grammar-material-exposure.mjs`: 28 units, 420 named boundary checks; observed A-failure/B/A, fresh A/B 24h-minus-1ms/exact, hint/theory, draft/active resume, unknown old history, overlap/renamed material, malformed history and 20-round/12-tail retention. Plus assertions for empty-string draft, array ledger, filtered invalid attempt, missing rounds and invented later first-exposure rounds.
- `node scripts/test-grammar-variants.mjs`: 168 canonical, all 158 accepted, 24 reasonable variants, 25 rejection boundaries; 147 production TSX answer events / 49 complete rounds. Canonical digest remains `0d0a0f94d8a72361e79c6730c88e6fe719da81b03dcaa52ba466ca8ca3d0fedc`; no grammar data or matcher file changed.
- Existing curriculum suite with the supplied test contract: 672 evidence checks, 87 production UI checks, 28/97/168 content and source coverage; backup roundtrip 149766 bytes. Exact identity increases synthetic backup size; it remains below 1 MB and the existing 25 MB import limit. Unit record bound is 20 KB.
- Existing clauses/remaining suites with composed contract and `--integrated`: frozen baseline content; 33 / 78 production answer events, 8 / 54 transfer callbacks, backup/future-version and malformed handling all passed.
- TypeScript passes using a local ignored ts-fsrs type alias to the already downloaded official lockfile-verified 5.4.2 package. The shared node_modules lacks that declared dependency; normal unaliased check reports that pre-existing missing dependency. No dependency/config/lockfile mutation or network/package upgrade.
- Real Chrome isolated preview at `127.0.0.1:4287`, production GrammarCurriculum component and synthetic-only fixtures: 5 complete rounds / 15 answer submissions (repeat, unseen, unknown, helped, repeat), draft and hint reload, exhausted-bank further practice. Six screenshots inspected; 320/390/1280 widths wrap without overflow. Test harness initially emitted a missing key warning; fixed locally. Browser extension warnings are distinct from the app. No real learner records, microphone, deployment or paid API.

Evidence is ignored under `studio/work/grammar-exposure`: browser DOM checkpoints, console, screenshots, synthetic fixtures and suite logs. Browser and Vite preview stopped after QA.

Natural 24-hour validation of the revised policy remains pending after publisher integration. Use a new explicitly isolated fresh-material scenario with real start/finish times and do not reuse or modify the original v21 evidence. A/B already exhausted cannot supply another unseen-material check; continue familiar review while waiting for genuinely new authored materials. No timer, reminder or fabricated time was added.
