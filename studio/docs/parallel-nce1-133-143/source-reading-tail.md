# Source reading: lessons 139–144 (tail author line)

Baseline supplied and preserved: `7b7c1283d12f0c6d784478cda8353080598f6980`. This author edited only lessons 139, 141, 143 and this record. No commit, app wiring, successor, matcher or event-engine change.

Read in full: `course-loop/model.mjs`, `parallel-nce1-049-059/authoring.mjs`, `parallel-nce1-025-035/content-contract.mjs`, and all original language JSON rows for 139, 141, 143. Read the current production `SourcePanel` binding guard and metadata shape. Visually inspected all twelve actual JPG pages using `view_image`; the first page for each group is the original comic/text, followed by notes and paired grammar/exercises. Asset directories remained immutable symlinks.

The `languageSha256` and `sourceSha256` fields intentionally equal the internal transcript/LRC source hash, not the language JSON file hash. Production guard requires book, first lesson and this internal hash. The scoped source test reconstructed and hashed the actual original LRC parts, verified comic and exercise bytes, and accepted matching source pairs while rejecting crossed pairs.

Original NCE1 textbook PDF source SHA-256: `df385269f6502f201fc5689683f9163205202e8b0b735fd9a388b2c7982ba2b3`.

## Actual inspected pages and verified bytes

| Group | PDF page (printed page) | Role | SHA-256 |
|---|---:|---|---|
| 139–140 | 285 (281) | odd lesson comic and original text | `08a6dd13bad2af234006ffb2bf1c7c683bc783178411557193b599ed2990a53b` |
| 139–140 | 286 (282) | odd lesson notes and translation | `b20704b70a6459ee93cfaf7d89d64e39084a1b7d40ebcbf70bda354c4d4dca34` |
| 139–140 | 287 (283) | paired even lesson pattern panels | `cf7f13f98beee638d918f0045e10f1a3536a3854961de315f9da1b3f2bc90578` |
| 139–140 | 288 (284) | paired even lesson written exercises | `5da1f948766fdf59289af945438f96184fc5ed5d5e6042f3aef841f734d556cf` |
| 141–142 | 289 (285) | odd lesson comic and original text | `4d7b76ea32a8c62fe4a0c84934c818c548490d92aec9a0e761ca3dc3b5409bc1` |
| 141–142 | 290 (286) | odd lesson notes and translation | `feee97b9cebfda84cbb6e0329baf5a80b4c11ebfcc5b39c5c70ae30324f27b82` |
| 141–142 | 291 (287) | paired even lesson pattern panels | `dc4fbe87c357bdaa2fd6449567f54099daa67a74748552409c817f65ab9490bc` |
| 141–142 | 292 (288) | paired even lesson written exercises | `ad9bbf4676d1ddb6dcd9353ef57c5a32e33c4fe4f4e6e3787ca74838a052a3a9` |
| 143–144 | 293 (289) | odd lesson comic and original text | `11ea5d3083ae402fe5bdd2dcdfc07f9fdfd13cff1a26ed180bc8fdad8af12886` |
| 143–144 | 294 (290) | odd lesson notes and translation | `6fe9cc9aa3586da438d13c0873099a85e001fab8c02e1d83106bd9e353e13a85` |
| 143–144 | 295 (291) | paired even lesson pattern panels | `273c6b88a73e5d561a20df0e95478fc4b18e93713405963e7d1dbf552782f14f` |
| 143–144 | 296 (292) | paired even lesson written exercises | `36821817ef51d405e208cc033f19a2dc0e8a20ad58f5d6c36f3ae2b5f85bdd6d` |

## Transcript identity

| Lesson | Internal original LRC source SHA-256 | JSON file SHA-256 (not the guard key) |
|---|---|---|
| 139 | `e3a665e4890dc56ec728e91bb13dcf3d6860ca1ed1d37777ae86eaacd3a2701e` | `f1e84ad2a461bc39dba710cb24c8f6c4b6e29947f757d8ca4aa6cef3f73fc785` |
| 141 | `cb6b93957730cd54c61dcc9f2304bb1b79dd408220586c7ce0e3e07673899f7a` | `f38bee1084b82a4ad9bb08a16d719bc62e0dfcf9f5c69e64b52b8a98a41def30` |
| 143 | `24e4e92d0154d1c7f99825b55a560b631f6babbe073d29eb339273ae508f8f09` | `dd5bc5b9fbf57c7d740b31aa87010f419669080f0c8bbe16e38626bc664817ac` |

## What the pages actually support

139–140: page 285 presents the mistaken telephone identity, a current wife’s query about whether help is needed, an unknown future finishing time, and an unknown conversation topic. Page 286 explains these embedded clauses. Page 287 contrasts whether/reason, whether/content and whether/time; page 288 retains original question tense when the speaker currently wants information, including a past event under a present main clause. The authored targets distinguish `if/whether`, `what/why` (including what as subject as a marked prior-structure combination), and `when` plus an outer direct question. Current reporting does not force past backshift. Each context specifies speaker/addressee when person matters.

141–142: page 289 provides Sally’s externally caused invitation as a genuine past passive event, but her excitement and the lady’s clothing are descriptions of state and are not used as evidence of repair/notification events. Page 290 explains the invitation’s be + participle and separately identifies the clothing phrase. Page 291 supplies current regular repair/correction and a completed station meeting. Page 292 explicitly contrasts regular present actions with past actions. Present passive routines are therefore an honest paired-142 extension. Every authored event has an explicit process or action record; negatives and questions retain recipients, not merely a plausible surface string.

143–144: page 293/LRC provides visitors’ completed requests and baskets already placed, while the sign provides printed future passive wording. Page 294 covers vocabulary and the past coverage description. Page 295/296 contrasts already complete, not yet complete and a future action, including singular/plural forms and irregular participles. The three authored targets retain this contrast; questions, never and future negatives extend it into bounded new contexts. A rescue context explicitly says nobody has been rescued, preventing ambiguity between none and not all.

Transcript differences are preserved: 141 JSON uses “middle-age” while print uses “middle-aged”; 143 JSON has “little baskets” where the printed story has “litter baskets”. Authored tasks do not silently repair source assets or score these transcription differences.

## Valid source clip windows

| Lesson / target | LRC row start → next existing row | Honest support |
|---|---|---|
| 139 whether | 58.11 → 66.16 | whether help is needed |
| 139 content | 66.16 → 70.67 | unknown conversation topic |
| 139 time | 54.72 → 58.11 | unknown future finishing time |
| 141 present | 17.91 → 26.47 | past invitation contrast; current routine form is on 142 print |
| 141 past | 17.91 → 26.47 | genuine past invitation event |
| 141 scope | 17.91 → 26.47 | affirmative passive base; authored negative/questions are new situations |
| 143 perfect | 49.55 → 58.99 | completed basket placement |
| 143 not-yet | 42.5 → 49.55 | affirmative completed request contrast; not-yet pattern is on 144 print |
| 143 future | 42.5 → 49.55 | completed-passive contrast only; future form uses final printed text and 144 print |

The final 143 LRC row begins at 94.49000000000001 and has no next row. No endpoint was guessed, and no clip is presented as hearing the final future passive. Audio playback/audibility, listening ability, pronunciation, and natural 24h/7d retention are not audited.

## Authored evidence and finite acceptance

Three modules contain 18 original tasks each: six banks of three covering all three targets. Seven tasks ask for unfamiliar semantic selection (139: two, 141: three, 143: two); the other 47 tasks require bounded sentence construction. Selection evidence and construction evidence are distinct, so the 18 tasks per module do not represent 18 new constructed sentences. Independent and delayed tasks also introduce recipient roles, unknown-versus-known information, current reporting of a past event, mixed event logs, present routine versus one past event, completed versus pending work, never versus yesterday, and future negation. These require meaning decisions in addition to changing nouns or numbers. Four reasoned near misses per task give 216 boundaries.

Metadata and row authoring use the existing helper, and exports are rebound using the existing content contract after finite authored variants and choice options are added. No matcher or state engine is added. Permitted alternatives include case/spacing/apostrophe normalization, natural contractions, if/whether where the query is whether, natural date placement, already/yet placement, and optional `by` agents only when the prompt permits. 139 what-as-subject, 141 passive questions/negatives, and 143 never/questions/future negatives explicitly combine existing subject-question, be-question, negation and never structures with the lesson target rather than claim direct teaching on the original paired pages. Each scope now lists only alternatives relevant to that group. Pronouns do not drift between speakers; bounded prompts require a stated subject. Statements and direct questions retain different punctuation requirements; tasks request one sentence, never multi-period answers.

Scoped `test-source.mjs` passed four checks on 139/141/143. A separate smoke traversal used the unchanged `createCourseLoopModel` for all 18 tasks/course through both delayed banks; canonical answers passed, all listed alternatives matched, and all 216 near misses rejected. Own expression remains `awaiting-human-review`; content remains authored pending independent blind review. Root owns independent blind review, complete production/browser QA and route integration. No NCE1-145 or cross-book unlock is manufactured.
