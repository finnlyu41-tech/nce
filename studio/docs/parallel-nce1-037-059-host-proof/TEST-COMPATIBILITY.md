# Independent legacy batch test repair

The immutable publisher base still had a six-only registry assertion in `batch-01/test-model-compat.mjs` although 18 groups were registered. New numbered groups also invalidated older unknown-course samples. This is a separate test-only commit, with no production changes.

The earliest six IDs and literal twelve keys stay explicit; old CL00/default/history assertions remain. All actual registry bindings, unique keys, selected envelopes and sidecars are validated dynamically. Unknown samples now use `__test_unknown_course__`, which cannot become a future numbered course. Successor expectations independently compute the odd NCE1 number plus two and require an existing node, rather than deriving expectations from the production successor helper. The fixture adapter lists each real module path and retains the production local matcher.

Changed test files: batch01 production-test-binding, test-model-compat, test-production-host; batch02 test-production-boundary and test-production-browser. The old native browser preserves its original six-course scenario, updates the registered 13 successor and records actual registry IDs separately. Syntax/import/bundle validation passed; that old driver was not rerun because the new isolated native acceptance already exercises the production host. A mistakenly included old preview-only harness failed in an initial expanded command; it is unchanged and is not one of the eight related Node files below.

All eight related Node files passed: 78/78, zero failures. Full output is `legacy-batch-regression.tap`.

```sh
node --test studio/course-loop/batch-01/test-content.mjs studio/course-loop/batch-01/test-correction-feedback.mjs studio/course-loop/batch-01/test-final-nationality.mjs studio/course-loop/batch-01/test-model-compat.mjs studio/course-loop/batch-01/test-production-host.mjs studio/course-loop/batch-02/test-content.mjs studio/course-loop/batch-02/test-production-model.mjs studio/course-loop/batch-02/test-production-boundary.mjs
```

Combined with the 52 new actual-host checks and 78 frozen content assertions, the candidate has 208 passing Node checks. Native production acceptance has 25 general checks plus two delayed-bank checks; all 27 passed with zero runtime exceptions.
