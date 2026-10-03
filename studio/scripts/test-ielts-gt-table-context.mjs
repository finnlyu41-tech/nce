import assert from 'node:assert/strict';
import {mkdtemp, readdir, rm} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import path from 'node:path';
import os from 'node:os';

const root = fileURLToPath(new URL('../', import.meta.url));
const ts = (await import(pathToFileURL(path.join(root, 'node_modules/typescript/lib/typescript.js')))).default;
const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
assert.equal(config.error, undefined);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
assert.equal(parsed.errors.length, 0);
const program = ts.createProgram({rootNames: [path.join(root, 'app/ielts-gt-table-context.ts')],
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
const temp = await mkdtemp(path.join(os.tmpdir(), 'ielts-gt-table-context-'));
let groups = 0;
const copy = value => JSON.parse(JSON.stringify(value));
const check = async (name, run) => {await run(); groups++; console.log('PASS ' + name);};
try {
  const output = path.join(temp, 'model.mjs');
  await build({stdin: {contents: [
    "export * as h from './app/ielts-gt-table-context';",
    "export * as a from './app/ielts-table-context';",
    "export * as p from './app/ielts-sample-progress';",
    "export * as m from './ielts-blueprint/sample-sequence-model';",
    "export * as c from './ielts-blueprint/sample-sequence';",
    "export * as b from './ielts-blueprint/curriculum/gt-table-options';",
    "export * as ab from './ielts-blueprint/curriculum/table-completion';",
    "export * as f from './app/progress-file';",
    "export {initial} from './app/model';",
  ].join('\n'), resolveDir: root, loader: 'ts'}, bundle: true, platform: 'node',
    format: 'esm', target: 'node22', outfile: output, logLevel: 'silent'});
  const {h, a, p, m, c, b, ab, f, initial} = await import(pathToFileURL(output));
  const lesson = b.gtTableOptionsLessonsFor('general-training')[0];
  const allMaterials = c.sampleMaterials(lesson);
  let clock = Date.now() - 6 * 86_400_000, value = m.emptySampleState(), contextRaw;
  const act = action => {
    const result = m.transitionSample(value, action, clock += 10);
    assert.equal(result.issue, undefined, result.issue); value = result.state;
  };
  const capture = () => {
    const result = h.extendGTTableContext(value, contextRaw, clock);
    assert.equal(result.ok, true, result.reason); contextRaw = result.raw; return result.value;
  };
  const ready = raw => {
    const result = h.readGTTableContext(raw);
    assert.equal(result.status, 'ready', result.reason); return result.value;
  };
  const block = raw => {
    const result = h.readGTTableContext(raw);
    assert.equal(result.status, 'blocked'); assert.equal(result.raw, raw);
  };
  const host = (progress = p.serializeSampleProgress(value, clock), raw = contextRaw, academic) => ({
    ...copy(initial), drafts: {other: 'Keep unrelated original', [p.sampleProgressKey]: progress,
      ...(academic === undefined ? {} : {[a.tableContextKey]: academic}),
      ...(raw == null ? {} : {[h.gtTableContextKey]: raw})},
  });
  await check('strict types, explicit GT selection and missing namespace leave legacy sessions unchanged', () => {
    assert.equal(h.readGTTableContext(undefined).status, 'empty');
    assert.deepEqual(b.gtTableOptionsLessonsFor('academic'), []);
    for (const variant of ['academic', 'general-training']) {
      const old = c.sampleLessonsFor(variant).find(item => !b.gtTableOptionsLessonsFor(variant).includes(item) &&
        !ab.tableCompletionLessonsFor(variant).includes(item));
      let state = m.emptySampleState();
      for (const action of [{type: 'select-variant', variant}, {type: 'open-lesson', lessonId: old.id}, {type: 'next'}]) {
        const step = m.transitionSample(state, action, clock);
        assert.equal(step.issue, undefined); state = step.state;
      }
      const before = JSON.stringify(state), result = h.extendGTTableContext(state, undefined, clock);
      assert.equal(result.ok, true, result.reason); assert.equal(result.raw, undefined);
      assert.deepEqual(result.addedIds, []); assert.equal(JSON.stringify(state), before);
    }
  });
  await check('first opened model and guided task save literal public snapshots through triple-entry CAS', () => {
    act({type: 'select-variant', variant: 'general-training'}); act({type: 'open-lesson', lessonId: lesson.id});
    const progress = p.serializeSampleProgress(value, clock), before = host(progress, undefined);
    act({type: 'next'}); const model = capture();
    assert.deepEqual(Object.keys(model.materials), [lesson.model.id]);
    const saved = h.replaceSampleProgressWithGTTableContext(before, progress,
      p.serializeSampleProgress(value, clock), undefined, undefined, undefined, contextRaw, clock);
    assert.notEqual(saved, before); assert.equal(saved.drafts[h.gtTableContextKey], contextRaw);
    assert.equal(saved.drafts.other, before.drafts.other);
    act({type: 'next'}); capture();
    assert.deepEqual(Object.keys(ready(contextRaw).materials), [lesson.model.id, lesson.guided.id]);
  });
  const answer = material => {
    for (const question of material.questions) act({type: 'answer', questionId: question.id, value: question.accepted[0]});
    act({type: 'submit'}); capture();
  };
  await check('activated unstarted timed task exports no timed stimulus, options or future review bank', () => {
    answer(lesson.guided); act({type: 'next'}); capture(); answer(lesson.independent); act({type: 'next'});
    const before = JSON.stringify(value), result = capture();
    assert.equal(m.sampleSession(value).drafts[lesson.timed.id].startedAt, 0);
    assert.deepEqual(Object.keys(result.materials), allMaterials.slice(0, 3).map(item => item.id));
    assert.equal(JSON.stringify(value), before); assert.ok(!contextRaw.includes(lesson.timed.context));
    for (const review of lesson.reviews) assert.ok(!Object.hasOwn(result.materials, review.id));
    const started = copy(result); started.materials[lesson.timed.id] = {
      id: lesson.timed.id, instruction: lesson.timed.instruction, context: lesson.timed.context,
      ...copy(b.gtTableOptionsStimulusFor(lesson.timed.id)),
      questions: lesson.timed.questions.map(question => ({id: question.id, prompt: question.prompt})),
      legacyReconstructed: false,
    };
    const progress = p.serializeSampleProgress(value, clock), original = host(progress);
    assert.equal(h.replaceSampleProgressWithGTTableContext(original, progress, progress,
      undefined, undefined, contextRaw, JSON.stringify(started), clock), original);
  });
  await check('starting timed captures its public table and options without changing the canonical draft', () => {
    act({type: 'start-timed'}); const before = JSON.stringify(value); capture();
    assert.equal(JSON.stringify(value), before);
    assert.deepEqual(Object.keys(ready(contextRaw).materials), allMaterials.slice(0, 4).map(item => item.id));
  });
  await check('snapshot instruction, source, table, ordered options and public qids exactly match current GT content', () => {
    const archive = ready(contextRaw), references = new Set(['accepted', 'why', 'hint', 'model', 'modelNotes']);
    const noReferences = object => {
      if (object && typeof object === 'object') for (const [key, item] of Object.entries(object)) {
        assert.ok(!references.has(key), key); noReferences(item);
      }
    };
    noReferences(archive);
    for (const material of allMaterials.slice(0, 4)) {
      const item = archive.materials[material.id], source = b.gtTableOptionsStimulusFor(material.id);
      assert.equal(item.context, material.context); assert.equal(item.instruction, material.instruction);
      assert.deepEqual(copy(item.table), copy(source.table)); assert.deepEqual(item.options, copy(source.options));
      assert.deepEqual(item.questions, material.questions.map(question => ({id: question.id, prompt: question.prompt})));
      assert.equal(item.legacyReconstructed, false);
    }
  });
  await check('unknown fields, versions, IDs, altered articles/options/tables/qids and oversized input remain raw and blocked', () => {
    block('{'); block(' '.repeat(2_000_001)); block('{"version":2,"materials":{}}');
    const mutate = change => {const next = copy(ready(contextRaw)); change(next); block(JSON.stringify(next));};
    mutate(next => {next.future = 'keep';});
    mutate(next => {next.materials.unknown = copy(next.materials[lesson.model.id]);});
    mutate(next => {next.materials[lesson.model.id].accepted = ['A'];});
    mutate(next => {next.materials[lesson.model.id].context += ' altered';});
    mutate(next => {next.materials[lesson.model.id].instruction += ' altered';});
    mutate(next => {next.materials[lesson.model.id].table.caption += ' altered';});
    mutate(next => {next.materials[lesson.model.id].options[0].text += ' altered';});
    mutate(next => {next.materials[lesson.model.id].options[0].letter = 'Z';});
    mutate(next => {next.materials[lesson.model.id].options[0].why = 'reference';});
    mutate(next => {next.materials[lesson.model.id].options.reverse();});
    mutate(next => {next.materials[lesson.model.id].questions[0].id = 'foreign';});
    const raw = '{"version":99,"materials":{}}', result = h.extendGTTableContext(value, raw, clock);
    assert.equal(result.ok, false); assert.equal(result.raw, raw);
  });
  await check('property order and whitespace do not trigger rewrites or mutate canonical progress', () => {
    const reorder = object => Array.isArray(object) ? object.map(reorder) :
      object && typeof object === 'object' ? Object.fromEntries(Object.entries(object).reverse().map(([k, v]) => [k, reorder(v)])) : object;
    const raw = JSON.stringify(reorder(ready(contextRaw)), null, 2), before = JSON.stringify(value);
    assert.equal(h.readGTTableContext(raw).status, 'ready');
    const result = h.extendGTTableContext(value, raw, clock);
    assert.equal(result.ok, true); assert.equal(result.raw, raw); assert.equal(JSON.stringify(value), before);
  });
  await check('each raw draft conflict and malformed old/new context rejects the complete atomic write', () => {
    const progress = p.serializeSampleProgress(value, clock), original = host(progress), before = JSON.stringify(original);
    act({type: 'hint'}); const nextProgress = p.serializeSampleProgress(value, clock);
    const replace = (state, ep = progress, np = nextProgress, ea, na, eg = contextRaw, ng = contextRaw) =>
      h.replaceSampleProgressWithGTTableContext(state, ep, np, ea, na, eg, ng, clock);
    assert.equal(replace(original, 'stale'), original);
    assert.equal(replace(original, progress, nextProgress, 'stale Academic'), original);
    assert.equal(replace(original, progress, nextProgress, undefined, undefined, 'stale GT'), original);
    assert.equal(replace(original, progress, '{'), original);
    assert.equal(replace(original, progress, nextProgress, undefined, '{"version":2}'), original);
    assert.equal(replace(original, progress, nextProgress, undefined, undefined, contextRaw, '{"version":2}'), original);
    const damaged = host(progress, '{"version":2}');
    assert.equal(replace(damaged, progress, nextProgress, undefined, undefined, '{"version":2}'), damaged);
    const missing = copy(ready(contextRaw)); delete missing.materials[lesson.model.id];
    assert.equal(replace(original, progress, nextProgress, undefined, undefined, contextRaw, JSON.stringify(missing)), original);
    const provenance = copy(ready(contextRaw)); provenance.materials[lesson.model.id].legacyReconstructed = true;
    assert.equal(replace(original, progress, nextProgress, undefined, undefined, contextRaw, JSON.stringify(provenance)), original);
    const saved = replace(original); assert.notEqual(saved, original);
    assert.equal(saved.drafts[p.sampleProgressKey], nextProgress); assert.equal(saved.drafts[h.gtTableContextKey], contextRaw);
    assert.equal(saved.drafts.other, original.drafts.other); assert.equal(JSON.stringify(original), before);
  });
  await check('unexposed snapshots reject capture and GT-only backfill preserves explicit legacy provenance', () => {
    const empty = m.emptySampleState(), result = h.extendGTTableContext(empty, contextRaw, clock);
    assert.equal(result.ok, false); assert.equal(result.raw, contextRaw);
    const emptyRaw = p.serializeSampleProgress(empty, clock), original = host(emptyRaw, null);
    assert.equal(h.replaceSampleProgressWithGTTableContext(original, emptyRaw, emptyRaw,
      undefined, undefined, undefined, contextRaw, clock), original);
    const rebuilt = h.extendGTTableContext(value, undefined, clock);
    assert.equal(rebuilt.ok, true);
    assert.deepEqual(rebuilt.legacyReconstructedIds.sort(), [lesson.guided.id, lesson.independent.id].sort());
    const progress = p.serializeSampleProgress(value, clock), old = host(progress, null);
    const saved = h.replaceSampleProgressWithGTTableContext(old, progress, progress,
      undefined, undefined, undefined, rebuilt.raw, clock);
    assert.notEqual(saved, old); assert.equal(saved.drafts[h.gtTableContextKey], rebuilt.raw);
    assert.equal(saved.drafts[p.sampleProgressKey], progress);
    assert.equal(h.extendGTTableContext(value, rebuilt.raw, clock).raw, rebuilt.raw);
  });
  await check('GT-only backfill cannot bypass missing Academic snapshots', () => {
    const academicLesson = ab.tableCompletionLessonsFor('academic')[0];
    act({type: 'select-variant', variant: 'academic'}); act({type: 'open-lesson', lessonId: academicLesson.id}); act({type: 'next'});
    const progress = p.serializeSampleProgress(value, clock), missing = host(progress, null);
    assert.equal(h.replaceSampleProgressWithGTTableContext(missing, progress, progress,
      undefined, undefined, undefined, contextRaw, clock), missing);
    const academic = a.extendTableContext(value, undefined, clock); assert.equal(academic.ok, true);
    const original = host(progress, null, academic.raw), saved = h.replaceSampleProgressWithGTTableContext(original,
      progress, progress, academic.raw, academic.raw, undefined, contextRaw, clock);
    assert.notEqual(saved, original); assert.equal(saved.drafts[a.tableContextKey], academic.raw);
  });
  await check('v1/v2 whole-site progress file preserves literal GT snapshots and unsupported raw bytes', async () => {
    for (const raw of [contextRaw, '  {"version":99,"materials":{"future":"keep raw"}}\n']) {
      const academic = a.extendTableContext(value, undefined, clock); assert.equal(academic.ok, true);
      const state = host(undefined, raw, academic.raw);
      for (const capability of [undefined, {version: 1, fixture: 'Opaque transport only'}]) {
        const file = f.makeProgressFile(state, new Date(clock), capability), restored = await f.readProgressFile(file);
        assert.deepEqual(restored.state, state); assert.equal(restored.state.drafts[h.gtTableContextKey], raw);
      }
    }
  });
  console.log(JSON.stringify({groups, strictHelperTypes: true, tripleEntryCAS: true, timedHidden: true,
    realProgressFileRoundTrips: true, browserQa: false, naturalDelay: false}));
} finally {await rm(temp, {recursive: true, force: true});}
