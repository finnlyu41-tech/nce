# Independent blind review: 091–095

## Method and deliverable

Read only `blind-prompts-091-095.json` as task evidence. Solved all 54 items (18 each for n91, n93, and n95) from their supplied scope, context, and prompt. No lesson modules, matcher, expected keys, tests, other documentation, or author work were consulted. No matcher was run.

`blind-answers-091-095.json` contains one primary answer per item, 132 bounded variants, and item-level issues. Primary answers retain the required people, action, lexical bank, direction, time, polarity, and requested sentence/question format. Variants include ordinary contractions, fronted time phrases, equivalent English clock readings, relative-time forms, and subject/time ellipsis in coordinated corrections. Case, whitespace, apostrophe shape, and the permitted omission of a final statement full stop are already covered by the supplied scope and are not mechanically multiplied into separate variants. All question answers retain one question mark.

## Main findings

**The grammatical tasks are mostly determinate.** The contexts clearly distinguish future from completed past events, unknown time from yes/no confirmation, and affirmative arrangements from cancellations. n93 correction tasks specify both the rejected city and the confirmed city. n95 clock tasks have calculable answers: a slow clock displaying 08:15 gives 08:25; a fast clock displaying 07:20 gives 07:15. The reliable readings are 09:17 for departure and 11:40 for current time.

**Natural bounded alternatives matter.** A future statement can use an ordinary contraction or put the time first without changing its meaning. `In two days` and `in two days' time` preserve the same stated delay. `Nine seventeen`, `seventeen past nine`, and `seventeen minutes past nine` name the same clock time. In the city corrections, the subject of the second clause can be omitted while retaining affirmative `will`, and one time expression can govern both clauses. A semicolon also permits two complete clauses in one sentence. These variants do not add facts.

**Two required time phrases are awkward.** `independent-n91-future-arrangement` and `review-b-n91-future-arrangement` require `the day after tomorrow in the morning/evening`. This is comprehensible, but long and less idiomatic than a simpler time expression. Reordering the same words as `in the morning/evening the day after tomorrow` preserves the fact. A smoother rewrite using `on the morning/evening of ...` may fall outside a strict lexical bank. If the exact phrase is the learning target, the instruction should make that deliberate restriction clear.

**Several context details need tightening.**

- `review-a-n93-journey-when` says equipment has been sent back, then asks when **they returned**; it also has awkward Chinese wording around the recorder. The prompt resolves the required people/action, but the story should explicitly describe the people returning, ideally with the equipment.
- `guided-n95-exact-clock-time` supplies a reliable departure time, yet the hint explains slow/fast clock correction. That hint is inapplicable here and could encourage an unnecessary adjustment.
- `diagnostic-n95-exact-clock-time` blends a boat notice with a train connection. The train question is clear, but the boat detail does little work and makes the setup harder to follow.
- `review-b-n91-future-when` motivates the question through completion of painting, but requests the time of painting itself. `When will you finish painting this room?` would answer the scheduling need more precisely, although it is outside the given lexical task.
- `review-a-n91-future-whether` uses `have a holiday` for taking time off tomorrow. That phrase is valid but less precise than `have a day off`, which the lexical constraint excludes.
- `independent-n91-future-when` uses the vague phrase `the new people` for new staff. It is valid enough to solve, but a more specific noun phrase would improve the context-to-language mapping.

`Telephone me` is valid but somewhat formal. `Will you ...?` can be heard as a request as well as confirmation; its supplied context fixes the intended confirmation reading. `It will snow tonight` is a prediction rather than an arrangement, so n91 contains two communicative uses of `will`. That is reasonable, but the shared task label should not imply identical intent.

**One city name is a lexical mismatch worth documenting.** `review-a-n93-future-destination-correction` uses Chinese 孟买 while requiring English `Bombay`. The answer retains the explicit English bank. A student using `Mumbai` would preserve the destination but depart from the specified wording; that should be treated as the scope restriction rather than a wrong geographical fact.

## Meaning and near-wrong boundaries

- Past records require `flew`, `went`, or `returned`. Past-time questions use `did` plus the base verb. A future answer or `has flown ... ago` does not preserve the intended tense.
- `The month/year after next` differs from `next month/year`. `In a month` differs from the calendar expression `next month`. `In twenty minutes` gives a delay; `within twenty minutes` gives a deadline range, and `for twenty minutes` gives a duration.
- `To`, `from`, and `in` are consequential: a departure city cannot become an arrival destination, and a place of stay cannot become a flight destination.
- A correction must retain both rejection and confirmation in one sentence. Merely naming the correct city loses the explicit correction; two full-stop-separated sentences lose the requested format. Ellipsis that drops the affirmative `will` entirely was excluded because that word is explicitly requested.
- Pronouns and possessives are fixed: `my car`, `his bags`, `telephone me`, and `wait for him` cannot be replaced with a different owner, caller, recipient, or awaited person.
- `Had better` takes a bare infinitive. `Be careful` requires `be`; `wait for him` requires `for`. Natural alternatives such as `should`, `call me`, `have a day off`, or `hurry up` were not admitted where they replace or extend the fixed phrase.
- `What time` asks for a clock time, while `When` can ask for a date. Valid general English alternatives need not satisfy this explicitly bounded task.

## Transfer and novelty

The later-stage contexts generally supply a new story, person, city, action, or time while keeping the same sentence skeleton. This can test retention and lexical substitution, but a new city or a label such as “unfamiliar setting” does not by itself establish structural or communicative novelty. The n93 city questions and destination corrections are particularly close to a substitution bank. n91 includes useful polarity and question-intent changes, yet many independent/review items still repeat the same future templates.

n95 provides stronger substantive transfer: the student must determine whether to add or subtract clock error, distinguish a departure time from current time, and distinguish future delay from past elapsed time. The exact-clock readings and the past/future contrasts are the clearest reasoning tasks in this set. The context separating a haircut from its booking also creates a real action boundary.

These are observations about the visible prompts only. They make no claim about hidden answer coverage, implementation, scoring behavior, or teaching content.

## Status

All 54 items are solved. No unresolved blocker prevents the blind deliverable. Remaining concerns are editorial clarity, variant policy, and how much transfer the repeated banks are intended to demonstrate.
