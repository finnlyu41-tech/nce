# V48 — optional diagnosis can defer; Today retains a course return

Runtime `03427c50a26499a3661ab5143dc50c5e94cf13b8`, package `2026-10-03-today-defer-v48`.

[Production](https://finn-english-studio.pages.dev/map/) · [fixed deployment](https://f1cc4cfd.finn-english-studio.pages.dev/map/).

The optional placement offer now says “可选诊断” / “做短诊断（可选）” and has a defer control. When the entire skippable queue is deferred, the main action returns to the current read-only course destination; without a safe destination, it returns to the catalogue. “恢复推荐顺序” restores the existing task order. Defer applies to the current page arrangement; leaving, reentering or refreshing restores recommendations from real saved records.

Only Today presentation, its focused checks and the author's handoff changed. Priority selectors, courses, mini content, FSRS, storage transactions, map routes, audio and video did not change. No completion, score, review date or automatic unlock is created by deferral.

50 Today checks pass, including controlled-time due-review priority and restoring the full unfiltered queue. Full TypeScript and all online/map/offline builds pass. Today UI retains its one baseline lint diagnostic with no new diagnostic.

The final 2,017-file package was checked against every frozen SHA256. Local and production Chrome each passed 10 real groups, including: fresh warmup and access-save failure/retry; current draft save/refresh; the whole queue including the optional offer deferred; direct return to the same saved course draft; priority restored after reentry; declining an unstarted diagnosis; selecting an answer, pausing, returning, refreshing and deferring all pending items; reopening the paused diagnosis with the same saved choice; formal correction/repair/review scheduling; optional alphabet return; actual placement course and reading-sample continuation. Zero Runtime exceptions and zero out-of-origin HTTP requests occurred. 320/390/1440 screenshots had no horizontal overflow.

Both production and fixed origins match runtime and five shell hashes; each passed 60 WAV hash/MIME and 60 HEAD checks plus finite-path denial and source-resource checks. The unchanged 30 synthetic WAVs are bounded media, not verified human acoustic learning evidence.

This resolves the F6 full-queue defer defect and supersedes V47's open-F6 note. It does not close the whole 61-item requirement list or complete four-skill learning, natural24h/7d evidence, physical-phone or human learning validation. Old test failures/coverage errata remain preserved; historical learning-record compatibility is not a release gate.

Publisher evidence lives in `release-takeover-20261002/V48-TODAY-DEFER-20261003/`: integration scope, model/TS/lint logs, local frozen artifacts, provider and push/deploy receipts, both-origin public hashes, and local/production native receipts/screenshots. Author `b89c98b2ea08aba4be03c00d87e2b4edd5066e4e` was cleanly integrated on the already published records head `15505c43a1f35b8b7a60830b3bb7cc0e826f1d40` as runtime `03427c50a26499a3661ab5143dc50c5e94cf13b8`. The following documentation-only commit does not require another deployment.
