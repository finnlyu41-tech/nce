# NCE1 85–96 content delivery

Exact author baseline: `6b1faad2840bee06f9b824e72d5c551bb9acd273`. Both publish refs were independently read and resolved to this SHA before authoring. The reported running v43 SHA `bf6ea10567a379846dea7a6f40f68c8937889d7c` differs only in release documentation; the production factory, UI and map implementation match.

This folder accompanies six content-only modules for 85/87/89/91/93/95. First three and last three are frozen separately. Each group has three stated targets, prerequisites and source-based teaching, eighteen original constrained tasks across diagnostic/guided/independent/repair/review-a/review-b, reasoned near misses, preserved first answers, bounded correction and an open task awaiting human review. The existing author assembler and bindContent are reused; the sole scoring/event engine is production createCourseLoopModel with each exported module.matches.

## Owner integration

Follow `integration-plan.json` against the latest host. Add module imports to the existing registry, extend the narrow CourseId/source lesson/comic unions, and add the single successor chain. Preserve all existing entries, newer source kinds, the serialized writer, current SourcePanel guard, Today, storage, FSRS and video work. No registry/host/UI/map changes are included here.

The existing 83→85 route is already present. Missing new successors deliberately preserve the current route under the real selector. The temporary bundler registry in preview-server is explicitly QA only. Never cite that override as production registration or deployed continuity.

## Reproduction

From studio, with the existing dependencies and original packaged assets at dist-online:

```sh
NCE_CONTENT_IDS=85,87,89 node --test course-loop/parallel-nce1-085-095/test-content.mjs course-loop/parallel-nce1-085-095/test-source.mjs course-loop/parallel-nce1-085-095/test-scope.mjs
NCE_CONTENT_IDS=85,87,89 NCE_PREVIEW_IDS=85,87,89 NCE_PROOF_SUFFIX=-085-089 node course-loop/parallel-nce1-085-095/test-browser.mjs
```

Use 91,93,95 and suffix -091-095 for the second batch; omit content filters for combined validation. Final validation requires independent blind files; the draft-only NCE_ALLOW_PENDING_BLIND switch cannot establish blind completion. Source evidence records the LRC JSON internal sourceSha256, raw packaged LRC parts, JSON transport hashes, actual comic binding/row counts and original paired exercise page hashes. Every clip endpoint is a real LRC row timestamp. The 95 relative-time clip stops before the final answer; its label identifies the textual answer and paired 96 rule accurately.

`test-scope` proves author ownership against the frozen baseline and deliberately expects the new modules to be unwired. These assertions apply to the author delivery, not the integrated host. Owner integration requires its own registry/type/successor and real production route checks.

## Evidence limits

The tests exercise factory transitions with a controlled clock, 24h/7d due arithmetic, early-review blocking, assistance markings, nonfresh repair retries, finite bank exhaustion and cross-course/raw restoration guards. They do not demonstrate natural elapsed-time retention. Browser evidence uses fresh disposable profiles and unchanged real Workspace/AudioSpace, first wrong answer, separate correction, reload and narrow viewports. Audio evidence is decoding/seek/play API behavior; actual audibility was not audited. Physical phone and keyboard, human open expression, pronunciation, all four skills and learning gains remain unverified. No personal learner data was read.

Local commits/patches/bundles are candidates for root's host integration and the sole publisher. No push, merge, deployment or published-new-content claim is made.

Independent review also notes that these are scaffolded sentence-construction tasks. Many stems provide the intended structure and vocabulary, so successful matching supports bounded construction and morphology rather than spontaneous tense selection. Contrasting evidence, information gaps, direction, clock correction and for/since distinctions add meaning practice. This delivery does not claim that every task introduces a distinct grammar structure or demonstrates unprompted transfer. The final 87 review task combines two independent pieces of evidence in one report, replacing a near-identical person swap.
