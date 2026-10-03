# NCE1 lessons 7–12 stage candidate

This batch is based on frozen publisher source `d717bad909d889fd305d667bd1d8530883aaf23a`. It reuses the first-stage event engine, learner authority, original time limits, and the one host full-State CAS writer with readback. It does not replace first-stage content or records. Registered target: `stage-nce1-7-12`; draft key: `stage-assessment-v1:NCE1-7-12`.

New reading, listening, speaking, and writing scenarios ask for current occupation, explicit denial, current state, named ownership, colour, and unknown facts that need a question. Six packs use new names and facts. Familiar sentence construction is not evidence of independent four-skill mastery. Rubric thresholds are reused as a functional candidate; equivalent difficulty, natural 24-hour/7-day retention, human acoustic quality, actual interaction, and qualified manual assessment have not been validated.

The four learning workspaces and per-attempt correction workspace save their current draft as strictly versioned ordinary `learning/practice` events. They use the existing serialized adapter and writer. Same-workspace changes in another tab reject stale replacement; changes in other skills can merge. Failed saves keep input and offer an unconfirmed, uncounted draft download. Practice and correction update the affected skill's practice time. Separate revisions preserve submitted first answers.

`authoring/` is private authoring/QA input, not a learner import or web asset. It contains offline synthesis scripts and semantic reference facts. Seven WAVs were synthesized locally with the installed macOS Samantha English (US) voice. They have valid non-silent PCM and source bindings. They are synthetic learning aids, not human stage delivery. Using an assessment audio records reference help before exposing the player. No browser boolean, transcript, AI judgment, or media callback can create qualified external evidence; production examiner methods remain unavailable.

The existing standalone packager stays unchanged. After it completes, run `python3 stage-assessment/next-nce1-007-012/package-audio.py --online` for the online package, and the same command without `--online` for the portable single HTML. The owned script copies seven exact emitted WAVs online or embeds them as data URLs offline, respecting the existing CSP. It never copies private scripts or reference facts.

Owned source changes parameterize the stage metadata/model/adapter/host/restore/route. The shared Today/navigation/StudyApp wiring is a separate small interface patch for the publisher to apply serially. The mini → placement → stage → video accepted-route guard chain must remain unchanged.

Verification commands:

```sh
node --experimental-strip-types --test stage-assessment/tests/model.test.mjs stage-assessment/tests/adapter.test.mjs stage-assessment/tests/host.test.mjs stage-assessment/next-nce1-007-012/tests/protocol.test.mjs
python3 stage-assessment/next-nce1-007-012/tests/audio.test.py
node node_modules/typescript/bin/tsc --noEmit --incremental false
```

All fixtures, artificial failures, and pure-model timestamps are synthetic QA only. Browser runs use fresh temporary profiles and the real wall clock. No user profile, real learning record, recording, or natural archive is a source or deliverable.
