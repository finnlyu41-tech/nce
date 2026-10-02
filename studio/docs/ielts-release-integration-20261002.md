# IELTS completed batches: release-owner integration

Source content: batch 01 `58d83a9`, batch 02 `842f24c`, learner copy `566aa496a8fc42362772637cdb4926ca6921aede`, delivered by the verified integration handoff. The author’s 17 content, contract-test and documentation files are unchanged. This owner integrates the shared runtime on published UI source `d8eafef117889d2425415ab778cd5896113d5d68`.

The directory now has eight lessons in each explicit exam category. The existing version-1 `ielts-sample-sequence-v1` namespace accepts the 16 exact registered session keys, rejects unknown keys, and retains its raw-string, attempt, playback and size limits. Old aliases continue to open their original hub lesson. Today links use each actual lesson ID.

Multiple-answer tasks use controlled checkbox choices plus a visible raw-letter field. A wrong, incomplete, duplicate or malformed nonempty answer may be submitted and retained. Mounting and restoration never repair it; only explicit learner edits change it. The existing complete-group engine awards 0 or 1 to the whole group, retains each original attempt separately from correction, and makes no IELTS partial-mark or Band claim.

Narrow-viewport review moved each added lesson’s long scope note behind the named save/practice help button. The complete-group scoring limit remains beside model and feedback answers; the authored stimulus, keys and metadata are unchanged.

The interface shows full stimulus and options at the relevant step, coach notes once, and options’ reasons after submission or in the model. Timed stimuli remain hidden until the learner starts. Delayed review still requires the existing 24-hour interval and fresh material. Listening still requires real playback completion and the learner’s actual audible confirmation. No simulated audio or clock advancement is production acceptance evidence.

Source validation: both authored batches pass their six contract groups; the original sequence retains 125 checks; shared host, recovery, backup and Today regressions pass. Four added directory, selection, hidden-material and storage groups exercise 340 additional transition round trips. TypeScript and new-module lint pass; scoped legacy lint has no new findings. P0 restore, grammar matching and audio execution files equal UI v24.

Publication acceptance will be recorded after separate browser checks of the exact committed build, native backup/restore and the immutable and production origins. Content is original teaching material, not a full mock or expert-reviewed curriculum. Natural 24-hour retention, real-phone interaction, microphone quality and audibility require separate evidence.
