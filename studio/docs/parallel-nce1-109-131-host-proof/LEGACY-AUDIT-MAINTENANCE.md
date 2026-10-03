# Test-only maintenance for the 66-group host

This candidate extends the unpublished 54-group tip `24e4fc7ff3500ded304df52a7734acc6cdc46079`, whose published ancestor is `7b7c1283d12f0c6d784478cda8353080598f6980`. The prior 54-group audit passed `--check`; that measured history remains in the preceding host proof. No pristine 42-group audit was rerun or rewritten for this change.

## Changes in this maintenance scope

- `course-loop/batch-01/production-test-binding.mjs`: adds all 12 explicit real module paths for 109/111/113/115/117/119 and 121/123/125/127/129/131. Fixtures continue to use the actual registered factory and exported content; no placeholder, fallback matcher, reconstructed reducer, or replacement registry was introduced.
- `course-loop/test-audit.mjs`: retains every existing assertion, including the original 42-course literal, 756 tasks and 84 textbook course numbers. Additional assertions preserve the explicit original 54-course prefix, 972 tasks, 108 textbook course numbers, every complete snapshot/input key, group binding and all 108 distinct original keys. Registry totals remain dynamically derived rather than pinned to the current batch size.
- `docs/course-loop-courses-coverage.csv`, `docs/course-loop-groups-coverage.csv`, and `docs/course-loop-audit.json`: regenerated normally using the unchanged audit tool and actual registry.

`docs/course-loop-support-coverage.csv` was regenerated and remained byte-identical to both its pre-run content and the 54-group base. Its SHA-256 is `e37b6fdd649b1edddeff84a371bfdbfac31bd0278d6369874dbc56c0eacac9fe`; IELTS support remains 29 sessions and 126 distinct materials.

The production model SHA-256 remains `4b3a67cf22c23f2d263af523ac6e314c37714f4b03784efbd935d695571daa57`. Independent whole-file comparisons confirmed byte equality with both `9d34b1f35aaf9ecfca3e534c5ecb953e46551a22` and published `7b7c1283d12f0c6d784478cda8353080598f6980`. The existing exact-byte test pin and precise `course:` Today filtering were preserved.

No production model, registry, selector, SourceKind/video, reader, D26, writer, UI, storage, or frozen author directory was edited by this maintainer. Production registry/interface/successor changes in the shared tree belong to the separate host integration scope. The audit tool itself is unchanged.

## Validation

- `legacy-batch-regression.tap`: the original eight batch test files pass all 78 assertions, with zero failures, cancellations, skips or todos. Their registry-wide fixture, cross-envelope, sidecar and key-isolation checks run against all 66 current bindings.
- `audit-regression.tap`: all 7 audit tests pass, with zero failures, cancellations, skips or todos; its reproducibility assertion runs the existing audit tool with `--check`.
- `legacy-fixture-inventory.json`: explicitly confirms the actual factory and content Map identity for every binding, including old 42, old 54 and new 12. All 66 synthetic first-answer submissions pass; their 132 complete storage keys are distinct and their question counts total 1,188.
- `git diff --check`: passes.

Canonical inventory remains 348 textbook course numbers and 276 real teaching groups: 66 registered groups, 210 unregistered groups, 132 associated textbook course numbers and 1,188 registered tasks. All 276 rows retain `not-established-per-lesson`; registration and synthetic QA do not infer learner acceptance, hearing, free expression, natural retention, mastery or learning gain.

No commit or publisher communication was performed by this maintainer. The root agent will review and commit this scope separately from production integration.
