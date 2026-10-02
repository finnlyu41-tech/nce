# Blind review evidence

Independent solves: `/tmp/nce37-blind-solutions.json` was written before any content module was read. All 108 primary solutions match the existing matcher. Exact comparison output: `/tmp/nce37-blind-comparison.json`.

## Confirmed false rejections from preregistered blind variants

- `independent-n37-ask-plan`: `What's she going to do?` rejected although `What is she going to do?` accepted. Same subject, plan meaning, specified vocabulary and output form.
- `repair-n37-ask-plan`: `What's he going to do?` rejected although `What is he going to do?` accepted.
- `diagnostic-n41-quantity-unit`: `one bottle of water` rejected. Context explicitly says only one bottle; prompt asks for 一瓶水 and does not prescribe `a`.
- `repair-n41-quantity-unit`: `one loaf of bread` rejected under 一条面包.
- `review-b-n41-quantity-unit`: `one bar of chocolate` rejected under 一块巧克力.

## Language and scene issues

- `guided-n45-can-do`: expected `I can pump this tyre.` is intelligible but `pump up this tyre` / `pump this tyre up` is the usual inflation phrase. Both variants were tested after the blind file was written and rejected. Particle `up` completes the verb phrase rather than adding an unrelated modifier. Best fix: specify `pump up` and accept both particle positions, keeping `can + base form` unchanged.
- `repair-n37-ask-plan`: context says you ask the male student directly (`你向一个男学生询问他...`) yet prompt forces `he`. A direct question to that student naturally uses `you`; change context to asking a coordinator about that student to make expected `he` coherent. This was identified in postblind scene review.
- `review-b-n41-singular-existence`: finding a rope anchor does not explain the bird-existence question. Add a concrete reason to check for birds (e.g. avoiding disturbing a nest) or replace motivation.
- `repair-n47-ask-preference`: `朋友告诉你没吃过某种食物` is underspecified. If the food is honey, an established honey-preference question is incoherent; if another food, the clause adds no relevant information. Remove it or identify the other food and motivate the preference survey.

## Semantics that hold

- Quantity tasks correctly pluralize units while leaving mass nouns unpluralized.
- N41/N43 mass/plural there-be agreement and unknown/positive/zero facts are coherent. `not any` and `no` variants correctly preserve zero-stock meaning.
- `review-a-n47-ask-want`: `Do you want any juice?` is grammatical. `some` is a natural offer alternative, but prompt explicitly mandates neutral `any`; rejecting `some` is consequently a declared exercise boundary, not a false rejection. Consider making the survey/check setting clearer than a tea-table offer.
- Can tasks mostly give known or unknown capacity evidence and explicitly constrain ability; no need to broaden to requests, permission or willingness. `cannot`, `can't`, and `can not` are accepted; `cannot` remains the preferable teaching default.

## Novelty/transfer limit

All 54 independent/review-a/review-b tasks have different or varied fictional contexts, but supply subject, vocabulary, polarity and target speech act. They mostly test new lexical slots in already practiced structures. Concrete repeated answers: `review-a-n37-ask-plan` equals `guided-n37-ask-plan` (`What are you going to do?`); `review-b-n37-ask-plan` equals `diagnostic-n37-ask-plan` (`What are they going to do?`). This is valid controlled recall but does not independently demonstrate conversational transfer or original communicative problem-solving. The own/personal tasks correctly remain awaiting human review.

No lesson modules were modified.
