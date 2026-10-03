# NCE1 115-120 source reading and authored tail

Status: `authored-pending-independent-blind-review`. Own expression: `awaiting-human-review`. Parent independent blind review and production QA remain pending. No commit, push, publication, or deployment was performed.

Code baseline supplied by parent: `7b7c1283d12f0c6d784478cda8353080598f6980`; source-only immutable snapshot accessed through `studio/dist-online` symlink to `/Users/finnlyu/Documents/Codex/2026-10-03/task-14/nce1-085-095/studio/dist-online`. Model and app indices read from the new checkout. Dist assets were read only.

Read the complete source JSON for each assigned lesson (including every row and internal sourceSha256), actual `studio/course-loop/model.mjs` factory, shared049-059 `authoring.mjs`, shared025-035 `content-contract.mjs`, `studio/app/textbook-grammar.ts`, relevant textbook-grammar.json entries, app illustration/page mappings, and dist-online/grammar/index.json. No AGENTS.md found in this repository; parent also reported none.

## Source and asset verification

- Textbook grammar catalog bytes hash: `7522d9c78e29e9becc17c4bbf786b442a65fbb0fa9875b985d117d90a41c54ad`.
- Grammar index bytes hash: `743c6993a7c624604aa8b7a78982f84f4344754485e0b5e4bec08444419ec6c2`; catalog field `7522d9c78e29e9becc17c4bbf786b442a65fbb0fa9875b985d117d90a41c54ad`.
- NCE1 source book PDF hash: `df385269f6502f201fc5689683f9163205202e8b0b735fd9a388b2c7982ba2b3`.

### 115-116

- Complete language JSON: 28 rows; internal source hash `47827536e71d3384ac4f53d949f441c1530cf9879902a5bc41780cf3d3f0f509`; file bytes hash `203eb862f08f9db7fe23bc7559bd99cbaa90c6d97e919c48654a7ea7a92cbfd6`.
- Grammar entry `NCE1-115`: `every / no / any / some`; paired section pages `[238, 239, 240]`. Illustration source hash matches the internal language hash; first-page image hash matches illustration pageSha256.
- All four original page images were actually inspected with view_image, not inferred from OCR or index names:

  - Source page237 (printed233): `a2a110835cd903d605db1fb49f144f3e3f0faf17e2632bcceea537bf4efbc78e`. 115 text and seven panels: person inquiry, window/thing inquiry, all people in garden, something invitation, none remaining.
  - Source page238 (printed234): `4ae5f450f0e6101b57c2ab64a58a0fb0825f6458ec188d04c307ae1bc1719442`. 115 notes explain some/any/no/every plus -one/-thing and none left; vocabulary distinguishes anyone/anything/nothing.
  - Source page239 (printed235): `e990a899d0fcc3cc6a5bf1142b7fc70380cfd09c19c22b3f3367689e1b9c1424`. 116 chart includes -one/-body/-thing/-where; pictures distinguish people versus objects, existing versus zero, everyone singular, and place words.
  - Source page240 (printed236): `8f64d992e09c193f6f77c15a9d1a4c4e469a6851f1ff6c6f99b617ec802c77a3`. 116 A rewrites not-any to no compounds; B gives zero replies for person/object/place; C changes They all to Everyone is; D gives have got something/nothing to-infinitive. Authored tasks use mixed evidence, not copied book questions; place words/have got are not exhaustive targets.

### 117-118

- Complete language JSON: 18 rows; internal source hash `f09e8d4c8fec24828b67e39b158a1ea4a7679af3c60038a6bd7798e4b050990b`; file bytes hash `112f6a493644c21621bbbbc4f93cdde3c790de69e66cbffea36ee178384a4957`.
- Grammar entry `NCE1-117`: `过去进行时`; paired section pages `[242, 243, 244]`. Illustration source hash matches the internal language hash; first-page image hash matches illustration pageSha256.
- All four original page images were actually inspected with view_image, not inferred from OCR or index names:

  - Source page241 (printed237): `8d5ba7b79d74556683ed9b6c3639e74385ab01310d87fd55c8efd5de88974af7`. 117 text/six panels pair ongoing backgrounds with dropped/found/phoned events and one earlier-completion had-already example. Coin story is source reading only; no medical guidance or coin-based transfer scene.
  - Source page242 (printed238): `38360e5a10bd43c59691e9d0c965a29c3121a3aa907a0cc7c2f46fdf7e52aa5b`. 117 notes explain past continuous using past be and the earlier-completion relationship, all/both apposition, and change wordplay.
  - Source page243 (printed239): `4d23a28011eee607eccf0a93131ddd9a5df8c9b75dc8af05e6f03df6ef85bdc3`. 118 m-r pictures include when event/background, just as, and dual-process while. Exercise A joins an event and background with when.
  - Source page244 (printed240): `f00d12cde67731adb6e0bd79a84aabe08d90ba06bef9fac5e058dc8c8ad472e5`. 118 B asks what was in progress at arrival; C asks the other person during a simultaneous activity. Authored banks use bounded intervals and role records to select meaning.

### 119-120

- Complete language JSON: 22 rows; internal source hash `497dfb8109fcf3f519912cf26ab7a7d8019e45be8cba384f950cbbb683964732`; file bytes hash `0dd039d41a0fad815bcdc0f57f32d91b3c98ef3c88780ac1dedc03cb978c5dbf`.
- Grammar entry `NCE1-119`: `过去完成时`; paired section pages `[246, 247, 248]`. Illustration source hash matches the internal language hash; first-page image hash matches illustration pageSha256.
- All four original page images were actually inspected with view_image, not inferred from OCR or index names:

  - Source page245 (printed241): `3d42bd806949ec0c393cd10b073896e970a5f43cddfa1d3f202c006b2e5b4b7f`. 119 text/seven panels include while background, after earlier entry then dining room, and already-gone state when George comes down. New scenes do not recycle thieves/parrot.
  - Source page246 (printed242): `3f3789045a9ebf40b12d8752b25cdfe32b5531fef98b423190cc00da05877d46`. 119 notes focus on as quickly as, colloquial question, animal pronouns and sleep; full past perfect teaching support must also use245 and paired120 rather than claim246 gives it.
  - Source page247 (printed243): `16c207ed546daaa0ceaeb498efefdef1a859b49b5651f5d71c720c360187db1b`. 120 s-x pictures give completed actions explaining a later outcome and after/before ordering; exercise A joins with after and had plus participle.
  - Source page248 (printed244): `44b6debb307efe23a231ce37ea6ed0d11a3f45c73179d7f3168366cfbdd1413b`. 120 A continuation, B just-now versus had-never-before experience, C had-already state explanation, and D after ordering. Negative prior-state target is a labeled extension from these states plus existing negation.

## Clip endpoints

Every clip start and end is a time on an actual source row. No final media duration was guessed. Endpoints denote row boundaries; endpoint rows are not claimed to play completely.

- 115: `37.8 -> 45.78`; actual zero-based rows `10 -> 13`.
- 115: `64.91 -> 77.87`; actual zero-based rows `18 -> 23`.
- 115: `49.22 -> 61.36`; actual zero-based rows `14 -> 17`.
- 117: `21.27 -> 31.54`; actual zero-based rows `4 -> 6`.
- 117: `69.9 -> 80.36`; actual zero-based rows `13 -> 15`.
- 117: `41.1 -> 52.56`; actual zero-based rows `8 -> 10`.
- 119: `74.22 -> 90.03999999999999`; actual zero-based rows `15 -> 18`.
- 119: `41.06 -> 47.68`; actual zero-based rows `9 -> 11`.
- 119: `80.22 -> 95.75`; actual zero-based rows `16 -> 19`.

117 parallel-process teaching is evidenced by paired118 C and the dual-process picture on243; audio41.1-52.56 only illustrates a while background plus event.119 prior-state negative tasks are explicitly labeled extensions of120 B/C and existing negation; its audio is completed-versus-still-present contrast, not literal negative past-perfect recording.

## Authored content and scope

- Three targets and18 original tasks per module: three each in diagnostic, guided, independent, repair, review-a and review-b; four reasoned near-wrong answers each (216 total). New fictional studios, exhibitions, craft clubs and event logs replace textbook scenes.
- 115 later banks require person/thing selection, mixed-location records, existing versus zero facts, group scope, and final partial-group contrast not everybody versus nobody. Partial scope explicitly transfers source everyone semantics plus existing negation. Natural some-questions, -one/-body synonyms, full/contraction forms and practising/practicing are finite accepted data.
- 117 later banks require interval inclusion, actor/group selection, brief events versus backgrounds, and overlap rather than sequence. Clause orders, optional commas and labelling/labeling are finite accepted data. Snapshot prompts explicitly omit time phrases; near-wrong simple past explanations apply to requested in-progress perspective, not every ordinary narrative.
- 119 later banks require past reference points and earlier completion versus later action, mixing actors and task states. Third target varies unfinished-at-check, completed-at-check and no-prior-experience-before-first-use. Before/after tasks explicitly request lesson had structure; simple past is not claimed universally wrong with clear chronology. Actual participles, contractions, already position, clause order and comma omission are finite accepted data.
- Content calls actual shared author/metadata, then final bindContent after accepted-data augmentation. No second matcher, factory, engine, registry or UI created or changed. All contentStatus fields pending independent blind review; own fields awaiting human review.

## Local author checks

Imported all three modules, bound each with createCourseLoopModel, and inspected an initial event state. Shared binder verified54 tasks, all stage banks, accepted answers and216 near-wrong boundaries. This is author checking, not independent blind review, browser testing, listening, pronunciation, mastery or deployment evidence. Parent owns independent blind and production QA.
