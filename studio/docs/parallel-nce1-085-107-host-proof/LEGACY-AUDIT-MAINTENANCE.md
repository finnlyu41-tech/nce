# Test-only legacy and inventory maintenance

The immutable integration base is `9d34b1f35aaf9ecfca3e534c5ecb953e46551a22`. This change updates tests and derived inventory records for 54 actual registered groups; it does not modify model, video, placement, stage assessment, production registry, interfaces, selectors, or frozen author content.

## Baseline diagnosis

The base audit inputs and outputs were restored with `git show` into `/tmp/nce51-pristine-9d34b1f`, including its relative imports. The temporary tree uses the existing dependency installation through a read-only dependency link. No base source was substituted with candidate source.

Running `node course-loop/audit.mjs --check` there failed with `Stale audit: docs/course-loop-audit.json`. All three preceding CSV comparisons passed. Regeneration in the temporary tree confirmed identical inventory counts and exactly these stale provenance entries:

| Source | Stored base digest | Actual base digest |
| --- | --- | --- |
| `course-loop/model.mjs` | `c6afb5d61fd46dd2fc351d8d01f039c21d2b2084eb0dd93a283ebe0ba6012a2c` | `4b3a67cf22c23f2d263af523ac6e314c37714f4b03784efbd935d695571daa57` |
| `app/navigation.ts` | `59509d24b69401a1184a7542fdbcb5f73f82db501fe26bef020dee78bd72cd40` | `9ce5b136f15fef94505873ad9973895c07af913cdbe2753e9e2056d6a80058c0` |
| `stage-assessment/route.ts` | Missing | `6dfd38105f0e6b38c252091dbf89aaf092b50ea6e7b3cdabf77493fbe6cc0f42` |

Diagnostic records remain in `/tmp/nce51-pristine-audit-check.log`, `/tmp/nce51-pristine-recorded-audit.json`, and `/tmp/nce51-pristine-audit-diff.json`. The last file confirms unchanged counts and no removed provenance entries.

The initial 51-binding candidate run of the eight legacy test files passed 76 of 78 assertions. Two assertions were obsolete under capabilities already present in the fresh base:

- Today includes `placement:offer` with `kind: 'course'`, so counting every task of that kind produced two results. The test now selects textbook recommendations with both `kind === 'course'` and the `course:` ID prefix, then retains the exact count of one, destination URL, and state immutability checks. The placement offer remains independent.
- The model byte comparison was pinned to `ff2cedbb7f315f00862e6f2151e8c18732571bac`, which predates the authorized `video` source kind. The test now pins the exact fresh base above and still compares the entire file byte for byte. Its default-export, state-sequence, source, hint, correction, review, and envelope assertions remain.

## Changed files

- `course-loop/batch-01/production-test-binding.mjs`: adds the 12 real module paths for lessons 85–107, including 91/93/95 only after their frozen modules arrived.
- `course-loop/batch-01/test-production-host.mjs`: selects the single textbook recommendation by its existing `course:` ID prefix.
- `course-loop/batch-02/test-production-model.mjs`: updates the immutable model-byte baseline to the exact fresh base.
- `course-loop/test-audit.mjs`: derives registration counts from the actual registry and retains an explicit literal list of the original 42 bindings, their 756 tasks and 84 source course numbers. No assertions were removed or skipped.
- `docs/course-loop-courses-coverage.csv`, `docs/course-loop-groups-coverage.csv`, and `docs/course-loop-audit.json`: regenerated with the existing audit tool. `docs/course-loop-support-coverage.csv` was regenerated and remained byte-identical because its inventory was already current.

`course-loop/audit.mjs` is unchanged. Its normal generation records 276 teaching groups, 54 registered groups, 222 unregistered groups, 108 associated textbook course numbers, and 972 registered tasks. All 276 groups retain `approvedFiveStepLoop = not-established-per-lesson`; registration never implies learner acceptance, natural retention, mastery, or learning gain. IELTS inventory remains 29 sessions and 126 distinct materials.

## Final validation

The eight legacy files are `batch-01/test-content.mjs`, `test-correction-feedback.mjs`, `test-final-nationality.mjs`, `test-model-compat.mjs`, `test-production-host.mjs`, and `batch-02/test-content.mjs`, `test-production-model.mjs`, `test-production-boundary.mjs`.

- `legacy-batch-regression.tap`: 78 tests passed, zero failures, cancellations, skips or todos.
- `audit-regression.tap`: all 7 audit tests passed, zero failures, cancellations, skips or todos.
- `git diff --check`: passed.

These are local test and source-inventory results. They make no learner acceptance or published-release claim. No commit or publisher communication was performed by this maintainer.
