# Source reading — NCE1 133–138 author line

Baseline: `7b7c1283d12f0c6d784478cda8353080598f6980` in isolated `nce1-133-143`; assets read only through supplied immutable subdirectory links. Scope: lesson modules 133, 135, 137 and this document. No shared engine, production registration, older freeze, or source assets edited.

Read in full: `course-loop/model.mjs`, `parallel-nce1-049-059/authoring.mjs`, `parallel-nce1-025-035/content-contract.mjs`; actual `app/course-loop-ui.tsx` SourcePanel and the current grammar/illustration metadata. The engine calls the exported module `matches`, and final exports bind the authored questions through existing `bindContent`. No new matcher or event engine.

SourcePanel’s actual guard checks loaded book, first lesson, and `result.sourceSha256 === lesson.source.languageSha256`. Both lesson hash fields therefore use the INTERNAL original LRC digest below, not the JSON-file digest. Actual source tests accept each correct pairing and reject cross-course/wrong book/wrong lesson/wrong digests.

All three complete original language JSONs, including title, introductory question, every body row and every timestamp, were read. All twelve listed original JPEGs were viewed with `view_image`, without substituting derived summaries. Catalog page indices are PDF pages; their printed footers are four less. First-page images: PDF 273/277/281 (printed 269/273/277).

## 133–134

- Complete language JSON: `dist-online/language/NCE1/133.json`; 22 original rows.
- Original LRC/internal source SHA256: `55cbe2fa9dd0a3d53f0a67e034cc0a723d3edf407fe58edadc42f74033ad94db`.
- Language JSON file SHA256 (not used as source identity): `4b95e74f0f6814dcbf99ee0268abaabb6428bc80ff0b0dc53efdbd9323a99855`.
- Authored module SHA256 at handoff: `72703ed4695a3d96e25446b1b301c529cb0118a5e44072664847da148e1fec39`.
- Grammar catalog: `NCE1-133`, last lesson `134`, title `间接引语：said / told`, pages `[274, 275, 276]`.

| Viewed PDF page | Role | SHA256 of actual JPEG bytes |
|---|---|---|
| 273 (printed 269) | original lesson text and comic | `9426b4f6b1c831559655a96e66be72fb95b45e475eb80949a7f8107f1f4f095b` |
| 274 (printed 270) | paired notes / patterns / written exercises | `290c87d8884bc4afec5d311870d67fec8a7fdfe1f46e8d365104cb95b3f793b4` |
| 275 (printed 271) | paired notes / patterns / written exercises | `daab4fe8db0bc96b7a179af40ea491fd1ff392634c53c20e8af9583a9884eccf` |
| 276 (printed 272) | paired notes / patterns / written exercises | `514ed55af6aacabb94b4c24a6d3ebae0ee4dfe81ad5690773b7caed6776adb9f` |

The first comic has the interview and newspaper report as two distinct scenes. The actual body contrasts original “I feel” with reported “she felt”, “have just made” with “had just made”, and original intention with reported “was going to”. The final newspaper sentence combines tiredness and not wanting another film; its negative only governs wanting. Notes on page 274 explain the past reporting comparison. Page 275 explicitly prints said/told, optional that, reported reading, we/their ownership and had finished. Page 276 separately practises past be, past continuous and past perfect. These paired text pages support the ongoing-action expansion; no claim that the 133 audio itself says the authored radio/carrying examples.

Teaching targets: reporting frame; reported time/state/process/completion; referents/ownership and compound negative scope. Every assessment is an original bounded context, not a copied exercise. Independent and delayed banks require selecting the speaker’s correct record, excluding later repair/finding events, distinguishing finished from still ongoing, and mapping two different referents. The text never says all English reports must backshift. Prompts explicitly specify past-only records or supplied current truth changes; ordinary present reports and simple past variants are identified as outside the requested form rather than universally wrong.

Clip endpoints are original row timestamps: 73.86→79.70 (told me report), 73.86→90.50 (completed film / intention report), 90.50→102.05 (combined tiredness / negative desire). Last row 102.05 has no reliable recorded end; it is only used as the previous clip’s endpoint, never assigned a guessed end.

## 135–136

- Complete language JSON: `dist-online/language/NCE1/135.json`; 25 original rows.
- Original LRC/internal source SHA256: `a1d765ddb3215a199f47e287f985a7db1f46f6296a58bfcbfbdd6bdd3b4c3ad5`.
- Language JSON file SHA256 (not used as source identity): `97781f274f9db8c7fdaf71a2ba24583635ae7563970fec23fc8062eaab41cddc`.
- Authored module SHA256 at handoff: `75b23b462e0c13c3ca9ebf8d928d3e3f704984c2de84d56801c72b4c75ee5daf`.
- Grammar catalog: `NCE1-135`, last lesson `136`, title `间接引语中的时态变化`, pages `[278, 279, 280]`.

| Viewed PDF page | Role | SHA256 of actual JPEG bytes |
|---|---|---|
| 277 (printed 273) | original lesson text and comic | `53824394819eac93dabf41ccc3cfddb2f48d4b92f8dda0cc4384a2894b78423d` |
| 278 (printed 274) | paired notes / patterns / written exercises | `ad8822b41623b8a50161a0fd75efe592e8d7dad26bf7e809c78d46f9317bb35b` |
| 279 (printed 275) | paired notes / patterns / written exercises | `2baeb246a1419d540674fbb37096fec94378a7e9fd21229cc459d95136ec7c75` |
| 280 (printed 276) | paired notes / patterns / written exercises | `e98604013903af57589b6c77cc1b0c41a91feb325714cffa119c0ed3c0fd03dd` |

The first comic shows interview, introduction, newspaper reading and final reaction. Original may/cannot/will have to/won’t let are reported as might/couldn’t/would have to/would not let. The original today/next week reference remains in the same-day newspaper; it does not justify an automatic time-word change. Page 278 lists the modal reporting shifts; 279 has will, cannot, may images; 280B/C/D independently practise future, positive ability, possibility. Positive ability is an honest paired-text extension.

Teaching targets: possibility without inflated certainty; ability without converting it into willingness or prediction; reported future, necessary action and scope of negation. New independent/delayed evidence varies tentative cancellation, mixed positive/negative lending possibilities, uncertain risk, inability versus planned action, compound positive/negative skill claims, necessity versus refusal, and reporting dates. Changed-day tasks explicitly give original and report weekdays and use the next day; the source’s unchanged next week is not treated as an error. may not is explicitly possibility of nonoccurrence, never permission denied.

Clip endpoints: 64.66→73.75 (might retire), 73.75→78.11 (couldn’t), 78.11→92.03 (would have to / would not let). They are actual consecutive source row times; no guessed terminal audio boundary.

## 137–138

- Complete language JSON: `dist-online/language/NCE1/137.json`; 20 original rows.
- Original LRC/internal source SHA256: `c2a4fc1d38b79d391862b5366c16a0be2b9cb82c1f08b9b41c980501614ae47e`.
- Language JSON file SHA256 (not used as source identity): `11d09913ed3fecc68364ec92a7f00c00b12027217a8d86323a11232a7d5127fc`.
- Authored module SHA256 at handoff: `b31f51e2ec875d7641dd9019c864d348d7a9c7720a78f682d6271f869fc9e817`.
- Grammar catalog: `NCE1-137`, last lesson `138`, title `if 条件句`, pages `[282, 283, 284]`.

| Viewed PDF page | Role | SHA256 of actual JPEG bytes |
|---|---|---|
| 281 (printed 277) | original lesson text and comic | `216a89a10a32fd049ad43a765934402c495ffb55c9e62e0b9efe272a1e36b3c6` |
| 282 (printed 278) | paired notes / patterns / written exercises | `b15681b328a49d92347d30cd29a61e7e94b8de03bd0620560c84a8396dc20823` |
| 283 (printed 279) | paired notes / patterns / written exercises | `53031fe372fd9da1fcf5c211e3d2cf5f134064054b59870079b8294d1e0ce1b3` |
| 284 (printed 280) | paired notes / patterns / written exercises | `59bdfcf05991cbeb1c130a13a5aa8799108399a6d1c26cd81cc1b4662faa1d47` |

The full first page shows a single dream scene and body dialogue. Its introductory question has would like / if she had, but the body repeatedly uses future-realis if win/spend with will results. Page 282 explicitly explains future conditions using present in the if clause and future in the main clause. Page 283 includes both affirmative and negative future results plus can conditions; page 284B practises future conditions, including multiple negative scopes, and 284C expressly practises conditional can. No second-conditional teaching target is invented from the introductory question.

Teaching targets: possible future condition and corresponding planned result; negative scope and conditional direction; paired-text conditional ability/permission using can. Independent and delayed banks select the correct branch from an unfamiliar schedule, distinguish unknown event from asserted completed fact, preserve cause/result direction, and distinguish permission or feasible travel/purchase from committed action. The if-will nearwrong explanations are bounded to ordinary predictive future events in these exact tasks and expressly exclude willingness readings; no universal prohibition is stated.

Clip endpoints: 36.85→48.11 (if win / will buy), 75.85→92.33 (spending condition and consequences), 56.54→65.43 (conditional logic). The third clip is labelled as a 137 conditional-logic illustration; can comes from paired 138 text, and is not claimed to occur in this audio. The terminal 92.33 row has no guessed end.

## Author validation and limits

54 original input tasks: six banks × three distinct targets per course. Each includes four reasoned counterexamples, criterion, feedback reason and substantive novelty context. Every own-expression section is `awaiting-human-review`. Finite variants include optional that, standard negative/modal/perfect contractions, coordinated complement that where natural, same-subject predicate ellipsis for the three applicable compounds, optional coordination commas, and either order of each conditional pair. The existing normalizer handles case, whitespace, straight/curly apostrophes, and an optional statement period. Question/statement punctuation limits are unchanged. Unlisted normal English is not treated as proof of linguistic error or lack of mastery.

Validation at author handoff: imports bind successfully; production-factory content tests passed the twelve available course/engine/cross-course checks. The thirteenth harness check was blocked only because root has not yet exported `blind-prompts-133-137.json`; author did not create, read or alter any blind material. Source suite: four tests passed, including original LRC assembly/hash, JSON digest distinction, actual SourcePanel guard, actual comic binding/image hash, paired image bytes and all clip boundary rows. Root still owns independent blind completion, production/browser QA and wiring decisions.

No audio playback or human hearing was audited; no listening/pronunciation success, retention or mastery is claimed. Natural 24-hour / 7-day retention remains unverified. Semicolons are not expanded across these single reported complements because detaching a clause can change whether the second claim is explicitly attributed to the original speaker; finite coordinate forms preserve the requested scope. Source pages and media are immutable and all work remains uncommitted.
