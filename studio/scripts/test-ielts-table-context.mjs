import assert from 'node:assert/strict';
import {mkdtemp, readdir, rm} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import path from 'node:path';
import os from 'node:os';

const root = fileURLToPath(new URL('../', import.meta.url));
const ts = (await import(pathToFileURL(path.join(root, 'node_modules/typescript/lib/typescript.js')))).default;
const configFile = path.join(root, 'tsconfig.json'), config = ts.readConfigFile(configFile, ts.sys.readFile);
assert.equal(config.error, undefined);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
assert.equal(parsed.errors.length, 0);
const program = ts.createProgram({rootNames: [path.join(root, 'app/ielts-table-context.ts')],
  options: {...parsed.options, noEmit: true, incremental: false}});
const diagnostics = ts.getPreEmitDiagnostics(program);
assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, {
  getCanonicalFileName: name => name, getCurrentDirectory: () => root, getNewLine: () => '\n',
}));
const packages = path.join(root, 'node_modules/.pnpm');
const builder = (await readdir(packages)).filter(name => /^esbuild@\d+\.\d+\.\d+$/.test(name))
  .sort((a, b) => b.localeCompare(a, undefined, {numeric: true}))[0];
assert.ok(builder, 'Install the existing locked dependencies.');
const {build} = await import(pathToFileURL(path.join(packages, builder, 'node_modules/esbuild/lib/main.js')));
const temp = await mkdtemp(path.join(os.tmpdir(), 'ielts-table-context-'));
let groups = 0;
const copy = value => JSON.parse(JSON.stringify(value));
const check = async (name, run) => {await run(); groups++; console.log('PASS ' + name);};
try {
  const output = path.join(temp, 'model.mjs');
  await build({stdin: {contents: [
    "export * as h from './app/ielts-table-context';",
    "export * as p from './app/ielts-sample-progress';",
    "export * as m from './ielts-blueprint/sample-sequence-model';",
    "export * as c from './ielts-blueprint/sample-sequence';",
    "export * as b from './ielts-blueprint/curriculum/table-completion';",
    "export * as gt from './ielts-blueprint/curriculum/gt-table-options';",
    "export * as f from './app/progress-file';",
    "export {initial} from './app/model';",
  ].join('\n'), resolveDir: root, loader: 'ts'}, bundle: true, platform: 'node',
    format: 'esm', target: 'node22', outfile: output, logLevel: 'silent'});
  const {h, p, m, c, b, gt, f, initial} = await import(pathToFileURL(output));
  const lesson = b.tableCompletionLessonsFor('academic')[0], tableIds = c.sampleMaterials(lesson).map(item => item.id);
  let clock = Date.now() - 6 * 86_400_000, value = m.emptySampleState(), contextRaw;
  const act = action => {
    const result = m.transitionSample(value, action, clock += 10);
    assert.equal(result.issue, undefined, result.issue);
    value = result.state;
  };
  const capture = () => {
    const result = h.extendTableContext(value, contextRaw, clock);
    assert.equal(result.ok, true, result.reason);
    contextRaw = result.raw;
    return result.value;
  };
  const ready = raw => {
    const result = h.readTableContext(raw);
    assert.equal(result.status, 'ready', result.reason);
    return result.value;
  };
  const block = raw => {
    const result = h.readTableContext(raw);
    assert.equal(result.status, 'blocked');
    assert.equal(result.raw, raw);
  };
  const host = (progress = p.serializeSampleProgress(value, clock), raw = contextRaw) => ({
    ...copy(initial), drafts: {other: 'Keep unrelated original', [p.sampleProgressKey]: progress,
      ...(raw === undefined ? {} : {[h.tableContextKey]: raw})},
  });
  await check('strict helper types and missing namespace keep all fourteen legacy lessons per category unchanged', () => {
    assert.equal(h.readTableContext(undefined).status, 'empty');
    for (const variant of ['academic', 'general-training']) {
      const newGTIds = new Set(gt.gtTableOptionsLessonsFor(variant).map(item => item.id));
      const old = c.sampleLessonsFor(variant).filter(item => item.id !== lesson.id && !newGTIds.has(item.id));
      assert.equal(old.length, 14);
      for (const item of old) {
        let state = m.emptySampleState();
        for (const action of [{type: 'select-variant', variant}, {type: 'open-lesson', lessonId: item.id}, {type: 'next'}]) {
          const step = m.transitionSample(state, action, clock);
          assert.equal(step.issue, undefined); state = step.state;
        }
        const before = JSON.stringify(state), result = h.captureTableContext(state, undefined, clock);
        assert.equal(result.ok, true, result.reason); assert.equal(result.raw, undefined);
        assert.deepEqual(result.addedIds, []); assert.equal(JSON.stringify(state), before);
        const progress = p.serializeSampleProgress(state, clock), existing = host(progress, undefined);
        assert.equal(h.replaceSampleProgressWithTableContext(existing, progress, progress, undefined, undefined, clock), existing);
      }
    }
  });
  await check('first opened model and next guided task add only their literal public context through a dual-entry CAS', () => {
    act({type: 'select-variant', variant: 'academic'}); act({type: 'open-lesson', lessonId: lesson.id});
    const beforeProgress = p.serializeSampleProgress(value, clock), beforeHost = host(beforeProgress, undefined);
    act({type: 'next'}); const model = capture();
    assert.deepEqual(Object.keys(model.materials), [lesson.model.id]);
    const saved = h.replaceSampleProgressWithTableContext(beforeHost, beforeProgress,
      p.serializeSampleProgress(value, clock), undefined, contextRaw, clock);
    assert.notEqual(saved, beforeHost); assert.equal(saved.drafts[h.tableContextKey], contextRaw);
    assert.equal(saved.drafts.other, beforeHost.drafts.other);
    act({type: 'next'}); const guided = capture();
    assert.deepEqual(Object.keys(guided.materials), [lesson.model.id, lesson.guided.id]);
  });
  const answer = (material, wrong = false) => {
    for (const [index, question] of material.questions.entries()) {
      act({type: 'answer', questionId: question.id, value: question.accepted[0] + (wrong && index === 0 ? ' EXTRA' : '')});
    }
    act({type: 'submit'});
    capture();
  };
  await check('unstarted timed activation exports no future table or review bank', () => {
    answer(lesson.guided); act({type: 'next'}); capture();
    answer(lesson.independent); act({type: 'next'});
    const before = JSON.stringify(value), result = capture();
    assert.ok(m.sampleSession(value).drafts[lesson.timed.id]);
    assert.equal(m.sampleSession(value).drafts[lesson.timed.id].startedAt, 0);
    assert.deepEqual(Object.keys(result.materials), tableIds.slice(0, 3));
    assert.equal(JSON.stringify(value), before);
    assert.ok(!contextRaw.includes(lesson.timed.context));
    for (const item of lesson.reviews) assert.ok(!Object.hasOwn(result.materials, item.id));
  });
  await check('started timed, separate correction and two gated fresh reviews retain all six source snapshots', () => {
    act({type: 'start-timed'}); capture(); answer(lesson.timed, true); act({type: 'next'});
    const original = copy(m.sampleSession(value).attempts);
    for (const question of lesson.timed.questions) act({type: 'correction-answer', questionId: question.id, value: question.accepted[0]});
    act({type: 'correction-note', value: '保留原答并逐格核对行列、前后限定词与来源。'});
    act({type: 'save-correction'}); capture();
    assert.deepEqual(m.sampleSession(value).attempts, original);
    for (const review of lesson.reviews) {
      clock = m.sampleReviewDueAt(m.sampleSession(value)); act({type: 'start-review'}); capture();
      assert.equal(m.activeSampleMaterial(value).id, review.id); answer(review);
    }
    const archive = ready(contextRaw);
    assert.deepEqual(Object.keys(archive.materials), tableIds);
    assert.ok(Object.values(archive.materials).every(item => !item.legacyReconstructed));
  });
  await check('literal snapshots include complete articles, instruction, rows, columns, affixes and qids without reference fields', () => {
    const archive = ready(contextRaw);
    const references = new Set(['accepted', 'why', 'hint', 'model', 'modelNotes']);
    function noReferences(object) {
      if (object && typeof object === 'object') {
        for (const [key, item] of Object.entries(object)) {assert.ok(!references.has(key)); noReferences(item);}
      }
    }
    noReferences(archive);
    for (const material of c.sampleMaterials(lesson)) {
      const item = archive.materials[material.id];
      assert.equal(item.context, material.context); assert.equal(item.instruction, material.instruction);
      assert.deepEqual(copy(item.table), copy(b.tableCompletionStimulusFor(material.id)));
      assert.deepEqual(item.questions, material.questions.map(question => ({id: question.id, prompt: question.prompt})));
    }
  });
  await check('actual v1/v2 whole-site file round trips carry literal context and original evidence, not just static IDs', async () => {
    const state = host();
    for (const capability of [undefined, {version: 1, fixture: 'Opaque transport only'}]) {
      const file = f.makeProgressFile(state, new Date(clock), capability), text = await file.text();
      const restored = await f.readProgressFile(file); assert.deepEqual(restored.state, state);
      assert.equal(p.readSampleProgress(restored.state.drafts[p.sampleProgressKey], clock).status, 'ready');
      assert.deepEqual(ready(restored.state.drafts[h.tableContextKey]), ready(contextRaw));
      const encoded = JSON.parse(JSON.parse(text).state.drafts[h.tableContextKey]);
      for (const material of c.sampleMaterials(lesson)) {
        assert.equal(encoded.materials[material.id].context, material.context);
        assert.equal(encoded.materials[material.id].table.instruction, material.instruction);
      }
    }
  });
  await check('closed fields, future versions, unknown IDs and content mismatches block while retaining raw text', () => {
    for (const raw of ['', '{', 'null', '[]', ' '.repeat(2_000_001)]) block(raw);
    for (const change of [
      a => a.version++, a => a.future = true, a => a.materials.unknown = {},
      a => a.materials[tableIds[0]].context += ' changed', a => a.materials[tableIds[0]].instruction += ' changed',
      a => a.materials[tableIds[0]].table.version++, a => a.materials[tableIds[0]].table.rows[0].cells.purpose.after += ' changed',
      a => a.materials[tableIds[0]].table.columns.reverse(),
      a => a.materials[tableIds[0]].questions[0].prompt += ' changed',
      a => a.materials[tableIds[0]].questions[0].accepted = ['private reference'],
      a => delete a.materials[tableIds[0]].legacyReconstructed,
    ]) {const archive = copy(ready(contextRaw)); change(archive); block(JSON.stringify(archive));}
    const future = JSON.stringify({version: 2, materials: {}});
    const result = h.extendTableContext(value, future, clock); assert.equal(result.ok, false); assert.equal(result.raw, future);
  });
  await check('JSON object property order is immaterial and reading or unchanged extension never rewrites raw', () => {
    const reordered = object => Array.isArray(object) ? object.map(reordered) :
      object && typeof object === 'object' ? Object.fromEntries(Object.entries(object).reverse().map(([key, item]) => [key, reordered(item)])) : object;
    const raw = JSON.stringify(reordered(ready(contextRaw))), before = JSON.stringify(value);
    assert.equal(h.readTableContext(raw).status, 'ready');
    const result = h.extendTableContext(value, raw, clock); assert.equal(result.ok, true); assert.equal(result.raw, raw);
    assert.equal(JSON.stringify(value), before);
  });
  await check('both-entry conflicts, blocked old/new inputs, missing context and snapshot edits refuse an atomic write', () => {
    const progress = p.serializeSampleProgress(value, clock), state = host(progress), before = JSON.stringify(state);
    act({type: 'hint'}); const nextProgress = p.serializeSampleProgress(value, clock);
    const replace = (current, ep = progress, np = nextProgress, ec = contextRaw, nc = contextRaw) =>
      h.replaceSampleProgressWithTableContext(current, ep, np, ec, nc, clock);
    assert.equal(replace(state, 'different progress'), state); assert.equal(replace(state, progress, nextProgress, 'different context'), state);
    assert.equal(replace(state, progress, '{'), state); assert.equal(replace(state, progress, nextProgress, contextRaw, '{"version":2}'), state);
    assert.equal(h.replaceSampleProgressWithTableContext(state, progress, nextProgress, contextRaw, undefined, clock), state);
    const damagedProgress = host('{'), damagedContext = host(progress, '{"version":2}');
    assert.equal(replace(damagedProgress, '{'), damagedProgress);
    assert.equal(replace(damagedContext, progress, nextProgress, '{"version":2}', contextRaw), damagedContext);
    const changed = copy(ready(contextRaw)); changed.materials[tableIds[0]].legacyReconstructed = true;
    assert.equal(replace(state, progress, nextProgress, contextRaw, JSON.stringify(changed)), state);
    const missing = copy(ready(contextRaw)); delete missing.materials[tableIds[0]];
    assert.equal(replace(state, progress, nextProgress, contextRaw, JSON.stringify(missing)), state);
    const saved = replace(state); assert.notEqual(saved, state); assert.equal(saved.drafts[p.sampleProgressKey], nextProgress);
    assert.equal(saved.drafts[h.tableContextKey], contextRaw); assert.equal(saved.drafts.other, state.drafts.other);
    assert.equal(JSON.stringify(state), before);
  });
  await check('valid but unexposed snapshot ownership fails without repair or future disclosure', () => {
    const empty = m.emptySampleState(), result = h.extendTableContext(empty, contextRaw, clock);
    assert.equal(result.ok, false); assert.equal(result.raw, contextRaw);
    const emptyRaw = p.serializeSampleProgress(empty, clock), original = host(emptyRaw, undefined);
    assert.equal(h.replaceSampleProgressWithTableContext(original, emptyRaw, emptyRaw, undefined, contextRaw, clock), original);
  });
  await check('legacy current-reference reconstruction persists its explicit limitation and never upgrades its provenance', () => {
    const before = JSON.stringify(value), reconstructed = h.captureTableContext(value, undefined, clock);
    assert.equal(reconstructed.ok, true);
    const attempted = [...new Set(m.sampleSession(value).attempts.map(attempt => attempt.promptId))];
    assert.deepEqual(reconstructed.legacyReconstructedIds.sort(), attempted.sort());
    assert.match(h.legacyTableContextNotice, /旧记录.*当前冻结.*不能证明当时/);
    for (const id of attempted) assert.equal(ready(reconstructed.raw).materials[id].legacyReconstructed, true);
    assert.equal(h.extendTableContext(value, reconstructed.raw, clock).raw, reconstructed.raw);
    assert.equal(JSON.stringify(value), before);
  });
  await check('an unsupported context remains exportable byte-for-byte without permitting a downgrade', async () => {
    const raw = '{"version":99,"materials":{"unknown":"keep raw"}}', state = host(undefined, raw);
    const restored = await f.readProgressFile(f.makeProgressFile(state, new Date(clock)));
    assert.equal(restored.state.drafts[h.tableContextKey], raw); block(raw);
  });
  console.log(JSON.stringify({groups, publicTableContexts: 6, strictHelperTypes: true,
    realProgressFileRoundTrips: true, syntheticReviewClock: true, naturalDelay: false, browserQa: false}));
} finally {await rm(temp, {recursive: true, force: true});}
