# V47 — finite NCE1 courses, mini tasks and the main learning entry

Runtime `d717bad909d889fd305d667bd1d8530883aaf23a`, package version `2026-10-03-local-warmup`.

[Production learning home](https://finn-english-studio.pages.dev/map/), [fixed deployment](https://4b0b3e3c.finn-english-studio.pages.dev/map/).

## Delivered behavior

72 paired NCE1 course groups now cover lessons 1–144 with 1,296 finite authored closed tasks. Mini batches cover partial targets in lessons 1–36 across 18 paired groups; 30 original synthetic WAVs are packaged online and embedded in the desktop offline artifact. This is bounded sentence practice and mini content, not complete four-skill coverage or learner mastery.

Fresh users enter the real three-question audio warmup. Its primary exit opens formal lessons 1–2 directly. Alphabet practice is optional, explicitly explained, and returns directly to the main lesson. Main-course access and navigation are saved before leaving; a failed write keeps the user on the current page for retry. Access never awards course grades, completion or FSRS evidence.

A chosen placement course or reading sample retains its actual destination. Actual course drafts replace duplicate trial offers. The first-course presentation prioritizes corrections, separates original answers from corrections, keeps one answer-history control, and names the next course clearly. Free answers remain awaiting human review.

## Verification

The final 2,017-file package was locally checked against every frozen size and SHA256. All TypeScript checks, 9 current-route model cases, 8 host checks and 9 UI checks passed. The new modules have no scoped lint warnings; shared learning/main files introduced no diagnostics compared with their baseline. Historical tests and archives were retained; old-record compatibility is not a release gate under the current new-user product direction.

Both fixed and production origins match the frozen runtime and five shell/version/script/style hashes. Each origin passed 60 WAV GET hash/MIME and 60 HEAD checks, unknown-path rejection and the frozen source-resource checks. The existing Worker allowlist is finite. GET pronunciation configuration was checked; no paid assessment POST was performed.

Seven actual Chrome groups on production passed with zero Runtime exceptions and zero out-of-origin HTTP requests:

- Fresh default home, actual original audio completion, warmup result and direct formal-course exit.
- Owned-browser access-write failure: no grant, stay on current page, unchanged original warmup answers, successful retry.
- Formal-course draft save and refresh.
- Formal diagnostic/teaching/guided/independent wrong answer/correction refresh/repair/free answer/review schedule and the real next lessons 3–4.
- Optional alphabet and immediate return to the main course without alphabet completion.
- Actual selected lessons 25–26, draft refresh and one primary home continuation at that course.
- Actual selected reading sample, with no competing first-course route card.

320/390 screenshots and native controls passed without horizontal overflow. These are desktop Chrome viewport checks, not physical-phone acceptance. Authored answer keys and one owned-browser storage-failure fixture were used solely for QA. They are not evidence of real learning improvement or human acoustic quality.

## Remaining scope

Natural 24-hour/7-day learning evidence, human listening/pronunciation, open speaking/writing review and difficulty calibration remain unverified. Later mini lessons and remaining books/targets are not claimed complete. F6 remains open: when the complete Today queue is paused, an optional placement offer may still appear. This release does not close all 61 requirements or establish four-skill completeness.

The original frozen local C66/C72/MINI/MINI03/WARMUP checkpoints and old publisher tree remain retained. Public deployment was authorized by Finn's direct confirmation on 2026-10-03 at 04:03:10 UTC. The previously rejected V45 docs-only push was retried exactly once under this new confirmation and succeeded; the current runtime then fast-forwarded both existing release branches and deployed through the existing Pages project. No identity, credential, permission or network configuration changed.

Machine evidence is retained under `release-takeover-20261002/AUTHORIZED-PUBLISH-20261003/`: `V47-production-acceptance.json`, provider and push/deploy receipts, both-origin public hashes and the seven-group production native receipt/screenshots. The runtime commit is separate from the following documentation-only release-record commit; documentation does not require redeployment.
