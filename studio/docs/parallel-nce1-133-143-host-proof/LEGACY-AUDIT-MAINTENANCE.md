# Test-only maintenance for the 72-group host

This candidate extends frozen 66-group base `9ae39452c8b0c529539bb685ffeb39add02ca0bf` with six real modules for 133/135/137/139/141/143. Earlier 42-, 54-, and 66-group proof records remain historical and were not rewritten.

## Scoped changes

- `course-loop/batch-01/production-test-binding.mjs`: adds exactly six explicit real fixture paths under `parallel-nce1-133-143`. Fixtures still expose the actual production registry factory and content Map; no placeholder or fallback content is used.
- `course-loop/test-audit.mjs`: preserves all original assertions, including explicit old 42/756/84 and old 54/972/108 prefixes and complete keys. Additional assertions preserve the explicit old 66-course prefix, 1,188 tasks, 132 source course numbers, every full snapshot/input key and source group ID, plus uniqueness of its 132 keys. Actual registry totals remain dynamically derived.
- `course-loop/batch-01/test-production-host.mjs`: contains one separately authorized endpoint correction. The independent expected destination is `chapter-6` at lesson 143, and remains the next odd lesson at every earlier numbered course. Existence, actual recommendation, continuation URL, unique `course:` Today task, unchanged state and absence of map achievement assertions all remain.
- `docs/course-loop-courses-coverage.csv`, `docs/course-loop-groups-coverage.csv`, and `docs/course-loop-audit.json`: regenerated using the unchanged existing audit generator and actual registry.

No production registry, selector, interface, model, video/SourceKind, reader, D26, writer, UI, storage, frozen author directory or generator was edited by this maintainer. Other production changes visible in the shared tree belong to the root host integration scope.

## Chapter endpoint finding

The first legacy run passed 77 of 78 assertions. The single failure was the old independent arithmetic expectation `nce1-145` after lesson 143; that nonexistent course is beyond the 144-lesson NCE1 inventory. The real next node is the existing `chapter-6` project. Root authorization permitted only the test expectation correction above, with every other assertion retained. The original failing run remains in `legacy-before-terminal-boundary.tap`; the final rerun is `legacy-batch-regression.tap`.

## Inventory and identity checks

Canonical inventory remains 348 textbook course numbers and 276 teaching groups. Registration now comprises all 72 NCE1 groups, with 204 groups from the remaining books unregistered, 144 associated textbook course numbers and 1,296 registered tasks. Every one of the 276 rows retains `not-established-per-lesson` and no learner outcome is inferred from registration.

`course-loop-support-coverage.csv` was normally regenerated and remained byte-identical to both the pre-run file and frozen 66-group base. SHA-256: `e37b6fdd649b1edddeff84a371bfdbfac31bd0278d6369874dbc56c0eacac9fe`. IELTS inventory remains 29 sessions and 126 distinct materials.

The production model SHA-256 remains `4b3a67cf22c23f2d263af523ac6e314c37714f4b03784efbd935d695571daa57`; full-file comparisons confirm equality with the established `9d34b1f` and `7b7c1283` bases. The existing exact-byte model guard and placement-aware `course:` Today filter were preserved.

## Evidence

- `legacy-batch-regression.tap`: final run of the original eight legacy batch files, all 78 assertions pass without failures, cancellations, skips or todos.
- `audit-regression.tap`: all seven audit assertions, including canonical reproducibility through `audit.mjs --check`, pass without failures, cancellations, skips or todos.
- `legacy-fixture-inventory.json`: all 72 helper models and content Maps are identical to their actual registry bindings. Synthetic first-answer submissions pass for all 72, including old 42/54/66 and new six; all 144 full storage keys are distinct and question counts sum to 1,296.
- `legacy-audit-inventory.json`: records actual inventory counts, complete base SHA, model byte identity and support CSV byte identity.
- `git diff --check`: passes.

These are local regression and synthetic QA results. They do not establish learner acceptance, listening, free-expression quality, natural retention, mastery or learning gain. No commit or publisher communication was performed by this maintainer.
