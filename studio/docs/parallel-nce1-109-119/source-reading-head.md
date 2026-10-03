# NCE1 109–114 authored source reading

Authoring baseline: `7b7c1283d12f0c6d784478cda8353080598f6980`. This is source advancement, not a deployment claim. The current production code in this checkout was read, including `studio/course-loop/model.mjs`; the immutable `studio/dist-online` symlink was used only to read packaged source assets. No application code from that asset snapshot was used to author a second model or matcher.

Only `lesson-nce1-109.mjs`, `lesson-nce1-111.mjs`, `lesson-nce1-113.mjs` and this record are written by this author. All three modules import the existing `parallel-nce1-049-059/authoring.mjs` assembler and rebind finite accepted-answer data using `parallel-nce1-025-035/content-contract.mjs`. Both files were read in full. No shared model, host, UI, registry, storage, map, video or scheduler changes.

Status: `pending-independent-blind-review`. Each module contains 3 teaching targets, prerequisites, 18 original tasks (3 each in diagnostic, guided, independent, repair, review-a and review-b), and at least 4 reasoned near misses per task. Open expression remains `awaiting-human-review`. Parent carries out the factory, final key-free stem review and UI checks before any status advancement.

## Complete transcript and mapped page reading

The complete `language/NCE1/109.json` (27 rows), `111.json` (24 rows) and `113.json` (26 rows) were read. The following values are the **internal `sourceSha256`**, not a hash of serialized JSON bytes:

| Group | Internal transcript source hash |
| --- | --- |
| NCE1-109 | `469936066eba535b09e781b7dfb8d39f0a2106e89e2a2bfe6f2f7c75ef6c2f39` |
| NCE1-111 | `9c4f31455bad8d4bb0b238bd21707f540d738213424e858db1c2eba131c3ab98` |
| NCE1-113 | `2e43727befbe573b90ff4f383ddd7ae50a6149e9bb028ac2ea001594411faf38` |

Read `studio/app/data/textbook-grammar.json` entries NCE1-109 (quantity comparisons, pages 226–228), NCE1-111 (adjective comparison, 230–232) and NCE1-113 (none, 234–236), together with `dist-online/grammar/index.json` and `dist-online/lesson-pages/index.json`. Read the relevant `nce-pages.json` starts: 109=225, 110=227, 111=229, 112=231, 113=233, 114=235. Page numbers here are packaged PDF indices; printed textbook numbers run four lower. NCE1 edition hash: `df385269f6502f201fc5689683f9163205202e8b0b735fd9a388b2c7982ba2b3`.

Read `nce-illustrations.json` for the exact three transcript hashes and panel mappings. Original comic pages are 225, 229 and 233 and their hashes below equal each illustration's `pageSha256`. The 12 original full-page JPEGs were actually opened with `view_image`; no contact-sheet substitute or inferred image inspection. Every file byte hash was subsequently computed and matched its lesson-page entry. Grammar-index entries for each group's final three pages point to these same originals; the first comic page is accessed through the lesson-page/illustration mapping, not assumed to be in grammar/index.

| Viewed packaged page | Actual viewed image SHA-256 |
| --- | --- |
| 225 | `fe38edfba78636b4c71b06c6970615cc44e06284814fa9fd2302025738dba042` |
| 226 | `aaad1339071faa154d6036953de8960647c73a324c9b0bfbdb20f609d0c681c9` |
| 227 | `55138b6a4acb9b9030aa4f2c8e2810a63787722a84a8b3a0992c5c0a89d53c9c` |
| 228 | `38b90b4bd2ad14b78c6dd29e0606bd381851ee657ec9b73ba44c121bdf2529a2` |
| 229 | `e52724eae0a4d9f32603bd41f20b16d89874fd5bf4b1d59631a56f147e9b36f1` |
| 230 | `1e4ff2a721df56f4c9fd009898cf1b5bb92bc55aa8ed5d7a2099828ffabd9e18` |
| 231 | `b8d1c7459b4f2dfff5d8888466207939637fa0b0ece9b3311bcad3c663da2b48` |
| 232 | `c8e70a4af363a1a9d378fc5e8d02fe89bb340f5841583f8722540d7e11366113` |
| 233 | `c39ed2492290f0475ec971390ee646746e6230a42b460417f288028b8de053f1` |
| 234 | `7907904e34ef4995172090e046b9c7a10574ef8c4cf85f9bf9e75ecd8efb44bf` |
| 235 | `1b99d4cce5d59f49bf8e888eb7358c2a4b4b2ff67a5b41ba33af2b4fd682e8a6` |
| 236 | `43eeff4c73f55bddff286e3729366f945c0160f525a56eb8851a8f60eaf43dfd` |

The assets reside at `/lesson-pages/<actual viewed hash>.jpg` in the source snapshot. No image or source file was modified.

## Target support and bounded clips

All nine clip start and end values are existing timestamped transcript rows. Each end is the start of a subsequent source row; none claims the final audio duration. The author read transcripts and viewed originals; these metadata checks are not listening or pronunciation assessment.

| Group / target | Clip seconds | Recorded anchor and text boundary |
| --- | --- | --- |
| 109 small-quantity | 27.97–34.43 | Milk question and a little reply; have got + much/many, very little/few is **110 paired text extension**, pages 227–228. |
| 109 quantity-comparison | 37.46–48.29 | Two teaspoonfuls, less than that, one-and-a-half response. Direct noun more/less/fewer comparisons are **110 paired text extension**, pages 227–228. |
| 109 quantity-extreme | 69.46000000000001–74.67 | a few only, an illustrative countability anchor. the most/least/fewest has **text-only target support in 110**, pages 227–228; no claimed extreme audio example. |
| 111 degree-comparison | 45.99–53.06 | less expensive price comparison. cheap/cheaper and difficult comparisons are **112 paired text extension**, pages 231–232. |
| 111 degree-equality | 53.06–59.95 | not as good as. Affirmative as…as and tall/clean/new/sharp attributes are **112 paired text extension**, pages 231–232. |
| 111 degree-extreme | 30.53–38.79 | the most expensive in the shop. the least interesting and other property examples are **112 paired text extension**, pages 231–232. |
| 113 zero-reference | 31.97–36.51 | no small change, I am afraid. none and none of are separately in the complete transcript/234 notes; there is no is **114 paired text extension**, page 236. |
| 113 possession-response | 44.96–51.8 | I've got none, I haven't got any either. Positive So have I is the final source row at 82.96000000000001, with **no following LRC endpoint**: transcript/233 page and 114 page 235 are text support; no fabricated final clip. |
| 113 auxiliary-response | 56.84–62.94 | inability response and Neither can I. be/do/did/was and positive can changes are **114 paired text extension**, pages 234–236. |

## Evidence design and limits

109 separates uncountable material amounts from direct countable plurals, pair comparison direction from complete-group extremes, and the requested item from distractor inventory. Independent and delayed tasks change the operative item, speaking role and/or direction within mixed records. Two facts in one record intentionally can point in opposite directions; the relevant evidence must be selected. Natural have got contractions are finite accepted data. Number/measurement uses of less with countable units are outside this narrow direct-noun exercise and are not judged globally incorrect.

111 separates price from an independent quality/interest/difficulty attribute. Equal measurement and lower degree change whether as…as is affirmative or negative. Delayed review-b includes a combined report: this model's lower price and the other model's lower quality, rather than another one-clause price question. Extreme selection tasks require the correct item and degree phrase; they support bounded evidence selection, not spontaneous free-form comparison mastery. Some questions intentionally constrain the order of subjects; a reversed but logically equivalent comparison is outside that exact requested output, not globally bad English.

113 distinguishes no before a noun from none replacing an established item, and none of a scoped group from some of that group when an actual exception exists. Dialogues specify each person's facts. Positive and negative possession replies, a mismatch that requires a direct reply, current vs past auxiliaries, and current topic vs another shared fact provide operative contrasts. Numerical quantities need not be equal for both people to truthfully have some. The authoring tasks do not claim every alternative discourse reply is wrong; the stem limits the selected/three-word/inverted form where appropriate.

All own tasks request human review of genuine or explicitly fictional evidence, with first response and correction retained. The existing production model preserves that distinction: receipts report listening/pronunciation `not-tested`, mastery `not-assessed`. No blanket mastery claim is made.

## Local validation and outstanding work

All three modules imported successfully after content binding: 54 tasks, all six banks complete, three targets per bank, each stored accepted response matched, and every stored reasoned near miss was rejected by the shared matcher. Each module successfully bound to `createCourseLoopModel` and its initial state inspected successfully. All 12 actual original image hashes matched the source indices. No new matcher or model was added.

Remaining gate: parent independent final-stem blind review, broader factory/state/UI checks and any finite accepted-variant corrections they identify. Content status stays pending until that work is completed. This author stops after the three modules and this source record; no commit, push, merge or deployment.
