import assert from 'node:assert/strict';
import {readdir, readFile, mkdtemp, rm} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import path from 'node:path';
import os from 'node:os';

const root = new URL('../', import.meta.url);
const rootPath = fileURLToPath(root);
const sourceNames = [
  'app/ielts-sample-progress.ts',
  'app/ielts-sample-workspace.tsx',
  'app/ielts-sample-next.ts',
  'ielts-blueprint/sample-sequence-model.ts',
  'ielts-blueprint/sample-sequence-ui.tsx',
  'ielts-blueprint/sample-sequence.ts',
  'ielts-blueprint/types.ts',
];
const ts = (await import(new URL('node_modules/typescript/lib/typescript.js', root))).default;
const configPath = path.join(rootPath, 'tsconfig.json');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
const formatDiagnostics = diagnostics => ts.formatDiagnosticsWithColorAndContext(diagnostics, {
  getCanonicalFileName: file => file,
  getCurrentDirectory: () => rootPath,
  getNewLine: () => '\n',
});
assert.equal(config.error, undefined, config.error && formatDiagnostics([config.error]));
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, rootPath, {}, configPath);
assert.equal(parsed.errors.length, 0, formatDiagnostics(parsed.errors));
const program = ts.createProgram({
  rootNames: sourceNames.map(name => path.join(rootPath, name)),
  options: {...parsed.options, incremental: false, noEmit: true},
});
const diagnostics = ts.getPreEmitDiagnostics(program);
assert.equal(diagnostics.length, 0, formatDiagnostics(diagnostics));
console.log('PASS strict TypeScript checks for the real workspace, progress parser and sample source API');

// Keep the original sequence checks on the current source, alongside the host adapter checks.
await import('./test-ielts-sample-sequence.mjs');

const pnpm = new URL('node_modules/.pnpm/', root);
const builders = (await readdir(pnpm))
  .filter(name => /^esbuild@\d+\.\d+\.\d+$/.test(name))
  .sort((a, b) => b.localeCompare(a, undefined, {numeric: true}));
assert.ok(builders.length, 'Install the existing project dependencies before running this test.');
const {build} = await import(new URL(`${builders[0]}/node_modules/esbuild/lib/main.js`, pnpm));
const temp = await mkdtemp(path.join(os.tmpdir(), 'english-ielts-sample-check-'));
try {
  const output = path.join(temp, 'checks.cjs');
  await build({
    stdin: {
      contents: `
        import * as p from './app/ielts-sample-progress';
        import * as m from './ielts-blueprint/sample-sequence-model';
        import * as c from './ielts-blueprint/sample-sequence';
        import * as n from './app/ielts-sample-next';
        import * as route from './app/navigation';
        import * as multi from './ielts-blueprint/curriculum/batch-02';
        import {SampleMultiSelectInput as Selection} from './ielts-blueprint/sample-multi-select-ui';
        import * as classic from './app/model';
        import * as backup from './app/progress-file';
        import {IELTSSampleWorkspace as Workspace} from './app/ielts-sample-workspace';
        import {IELTSSampleSequence as Sequence} from './ielts-blueprint/sample-sequence-ui';
        import React from 'react';
        import {renderToStaticMarkup as render} from 'react-dom/server';
        export {p,m,c,n,route,multi,Selection,classic,backup,Workspace,Sequence,React,render};
      `,
      resolveDir: rootPath,
      sourcefile: 'sample-workspace-check-entry.ts',
      loader: 'ts',
    },
    plugins: [{
      name: 'ssr-recorder-boundary',
      setup(builder) {
        // The real Today adapter imports mini media. Preserve each module's URL
        // when this Node-only probe bundles that dependency into CommonJS.
        builder.onLoad({filter: /mini-task\/(?:batch-\d+\/)?content\.ts$/}, async args => {
          let contents = await readFile(args.path, 'utf8');
          const source = ts.createSourceFile(args.path, contents, ts.ScriptTarget.Latest, true), ranges=[];
          function visit(node) {
            if (ts.isPropertyAccessExpression(node) && node.name.text === 'url' &&
                ts.isMetaProperty(node.expression) && node.expression.keywordToken === ts.SyntaxKind.ImportKeyword)
              ranges.push([node.getStart(source), node.end]);
            ts.forEachChild(node, visit);
          }
          visit(source);
          for (const [start,end] of ranges.reverse()) contents=contents.slice(0,start)+JSON.stringify(pathToFileURL(args.path).href)+contents.slice(end);
          return {contents,loader:'ts'};
        });
        // These assertions cover text state and SSR. Audio capture and browser effects
        // belong to the existing recording tests and are not simulated as working here.
        builder.onResolve({filter: /^\./}, args => {
          const resolved = path.resolve(args.resolveDir, args.path);
          if (resolved === path.join(rootPath, 'app/recording-feedback')) {
            return {path: resolved, namespace: 'recorder-contract'};
          }
        });
        builder.onLoad({filter: /.*/, namespace: 'recorder-contract'}, () => ({
          contents: 'export function Recorder(){return null}',
          loader: 'tsx',
        }));
      },
    }],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node22',
    jsx: 'automatic',
    outfile: output,
    logLevel: 'silent',
  });
  const {p,m,c,n,route,multi,Selection,classic,backup,Workspace,Sequence,React,render} =
    (await import(pathToFileURL(output).href)).default;
  const DAY=86_400_000,START=Date.now()-60*DAY;let clock=START,checks=0,roundTrips=0;
  const test=async(name,run)=>{await run();checks++;console.log('PASS '+name)};
  function renderAt(element,at){const original=Date.now;Date.now=()=>at;try{return render(element)}finally{Date.now=original}}
  const base=()=>structuredClone(classic.initial);
  function roundTrip(state,now=clock){const raw=p.serializeSampleProgress(state,now),read=p.readSampleProgress(raw,now);assert.equal(read.status,'ready',read.reason);assert.deepEqual(read.value,JSON.parse(JSON.stringify(state)));roundTrips++;return raw;}
  function act(state,action,at=(clock+=10)){const result=m.transitionSample(state,action,at);assert.equal(result.issue,undefined,result.issue);roundTrip(result.state,at);return result.state;}
  function heard(state){const promptId=m.activeSampleMaterial(state).id,playbackId='play-'+clock;for(const type of ['audio-request','audio-start','audio-end','audio-confirm'])state=act(state,{type,promptId,playbackId});return state;}
  function answer(state){const material=m.activeSampleMaterial(state);if(material.questions)for(const q of material.questions)state=act(state,{type:'answer',questionId:q.id,value:q.accepted[0]});else state=act(state,{type:'response',value:'I would like to learn with other people because we can share practical ideas. Last week I joined a reading group with a friend and we enjoyed discussing a short story.'});return state;}
  function start(variant='academic',lessonId='hub-reading'){let state=act(m.emptySampleState(),{type:'select-variant',variant});state=act(state,{type:'open-lesson',lessonId});return act(act(state,{type:'next'}),{type:'next'});}
  function closed(variant,lessonId,initial){let state=initial?act(act(initial,{type:'select-variant',variant}),{type:'open-lesson',lessonId}):act(act(m.emptySampleState(),{type:'select-variant',variant}),{type:'open-lesson',lessonId});state=act(act(state,{type:'next'}),{type:'next'});
   for(const stage of ['guided','independent','timed']){if(stage==='timed')state=act(state,{type:'start-timed'});if(stage!=='guided')state=act(state,{type:'confirm-unseen',value:true});if(m.activeSampleMaterial(state).script)state=heard(state);state=act(answer(state),{type:'submit'});state=act(state,{type:'next'});}
   const material=m.selectedSampleLesson(state).timed;if(material.questions)for(const q of material.questions)state=act(state,{type:'correction-answer',questionId:q.id,value:q.accepted[0]});else state=act(state,{type:'correction-response',value:'I have checked the prompt carefully and revised my short response. The main point is now clear, while my vocabulary and grammar still need feedback from a teacher.'});state=act(state,{type:'correction-note',value:'核对实际要求，已修正一处错误；开放回答仍等待人工评阅。'});return act(state,{type:'save-correction'});}
  function review(state){clock=m.sampleReviewDueAt(m.sampleSession(state));state=act(state,{type:'start-review'},clock);state=act(state,{type:'confirm-unseen',value:true});if(m.activeSampleMaterial(state).script)state=heard(state);return act(answer(state),{type:'submit'});}
  const fixture=closed('academic','hub-reading');
  const mutate=(value,fn)=>{const raw=JSON.parse(roundTrip(value));fn(raw);return JSON.stringify(raw)};
  function blocked(raw,now=clock){const result=p.readSampleProgress(raw,now);assert.equal(result.status,'blocked');assert.equal(result.raw,raw);return result;}
  await test('an absent namespace starts empty without creating or mutating State',()=>{const state=base(),before=JSON.stringify(state);assert.equal(p.readSampleProgress(undefined).status,'empty');assert.equal(JSON.stringify(state),before);assert.equal(state.drafts[p.sampleProgressKey],undefined)});
  await test('empty or malformed stored text is retained rather than silently reset',()=>{for(const raw of ['', '{', 'null', '[]', 'true'])blocked(raw)});
  await test('future envelope, content, state versions and unknown sequences remain read-only',()=>{for(const fn of [x=>x.version++,x=>x.contentVersion++,x=>x.value.version++,x=>x.sequenceId='future-sequence'])blocked(mutate(fixture,fn))});
  await test('unknown fields, audio payloads, unknown sessions and material ids are rejected intact',()=>{for(const fn of [x=>x.audio='data:audio/wav;base64,private',x=>x.value.recording={},x=>x.value.sessions['academic:unknown']={},x=>x.value.sessions['academic:hub-reading'].exposures.push('unknown')])blocked(mutate(fixture,fn))});
  await test('future and reversed timestamps never become delayed success',()=>{blocked(mutate(fixture,x=>x.value.sessions['academic:hub-reading'].correctedAt=clock+1));blocked(mutate(fixture,x=>x.value.sessions['academic:hub-reading'].attempts[1].at=1))});
  await test('objective result cannot disagree with stored original answers',()=>{blocked(mutate(fixture,x=>x.value.sessions['academic:hub-reading'].attempts[0].correct=0));blocked(mutate(fixture,x=>x.value.sessions['academic:hub-reading'].attempts[0].answers.cost='wrong'))});
  await test('JSON property order is irrelevant while a fabricated timer origin is rejected',()=>{const reordered=mutate(fixture,x=>{const draft=x.value.sessions['academic:hub-reading'].drafts['hub-r-guided'];draft.answers=Object.fromEntries(Object.entries(draft.answers).reverse())});assert.equal(p.readSampleProgress(reordered,clock).status,'ready');blocked(mutate(fixture,x=>{const timed=x.value.sessions['academic:hub-reading'].attempts.find(a=>a.stage==='timed');timed.startedAt++;timed.elapsedMs--}))});
  await test('missing exposure, missing original draft or lost hint history cannot be upgraded',()=>{blocked(mutate(fixture,x=>x.value.sessions['academic:hub-reading'].exposures=[]));blocked(mutate(fixture,x=>delete x.value.sessions['academic:hub-reading'].drafts['hub-r-guided']));blocked(mutate(fixture,x=>x.value.sessions['academic:hub-reading'].attempts[0].hinted=true))});
  await test('all four lessons in both variants round-trip through every real transition',()=>{for(const variant of ['academic','general-training'])for(const skill of ['listening','reading','speaking','writing']){const result=review(closed(variant,'hub-'+skill));roundTrip(result);const receipt=m.sampleLessonReceipt(result,clock);assert.equal(receipt.band,null);assert.equal(receipt.mastery,'not-assessed');if(['speaking','writing'].includes(skill))assert.equal(receipt.delayed,'awaiting-human-review')}});
  await test('open responses cannot acquire an objective score or human verification in the saved format',()=>{const state=closed('academic','hub-speaking');blocked(mutate(state,x=>x.value.sessions['academic:hub-speaking'].attempts[0].matched=true));blocked(mutate(state,x=>x.value.sessions['academic:hub-speaking'].attempts[0].feedback='human-reviewed'))});
  await test('cross-variant shared exposures remain seen while writing remains variant-specific',()=>{for(const skill of ['listening','reading','speaking','writing']){const first=review(closed('academic','hub-'+skill)),second=closed('general-training','hub-'+skill,first);roundTrip(second);const attempts=m.sampleSession(second).attempts.filter(a=>a.stage==='independent'||a.stage==='timed');assert(attempts.every(a=>a.fresh===(skill==='writing')))}});
  await test('a prompt merely opened in another variant cannot acquire fresh evidence here',()=>{let first=start('academic','hub-reading');first=act(answer(first),{type:'submit'});first=act(first,{type:'next'});const second=closed('general-training','hub-reading',first);blocked(mutate(second,x=>x.value.sessions['general-training:hub-reading'].attempts.find(a=>a.stage==='independent').fresh=true))});
  await test('a forged second fresh result for an already answered material is rejected',()=>{const state=review(fixture);blocked(mutate(state,x=>{const session=x.value.sessions['academic:hub-reading'];session.attempts.push({...session.attempts.at(-1),at:session.attempts.at(-1).at+1})}),clock+1)});
  await test('interrupted playback restores as failed while preserving answers, requests, exposures and assistance',()=>{let state=start('academic','hub-listening');state=answer(state);state=act(state,{type:'hint'});const promptId=m.activeSampleMaterial(state).id;state=act(state,{type:'audio-request',promptId,playbackId:'interrupted'});state=act(state,{type:'audio-start',promptId,playbackId:'interrupted'});const before=structuredClone(state),raw=roundTrip(state),loaded=p.readSampleProgress(raw,clock);assert.equal(m.activeSampleDraft(loaded.value).playbacks[0].status,'playing','Reading alone must not rewrite a currently live player');const recovered=p.recoverSamplePlayback(loaded.value);assert.equal(recovered.interrupted,1);assert.deepEqual(state,before);assert.equal(m.activeSampleDraft(recovered.value).playbacks.length,1);assert.equal(m.activeSampleDraft(recovered.value).playbacks[0].status,'failed');assert.equal(m.usableSampleAudio(m.activeSampleDraft(recovered.value)),false);assert.deepEqual(m.activeSampleDraft(recovered.value).answers,m.activeSampleDraft(state).answers);assert.deepEqual(m.sampleSession(recovered.value).exposures,m.sampleSession(state).exposures);assert.equal(m.activeSampleDraft(recovered.value).hinted,true);assert(m.transitionSample(recovered.value,{type:'submit'},clock).issue);roundTrip(recovered.value);state=heard(recovered.value);state=act(state,{type:'submit'});assert.equal(m.sampleSession(state).attempts[0].playbackCount,2);assert.equal(m.sampleSession(state).attempts[0].playbackFailures,1)});
  await test('completed audible playback is not downgraded by a refresh and failed playback cannot claim audible',()=>{const state=heard(start('academic','hub-listening')),recovered=p.recoverSamplePlayback(state);assert.equal(recovered.interrupted,0);assert.equal(recovered.value,state);blocked(mutate(state,x=>{const draft=Object.values(x.value.sessions['academic:hub-listening'].drafts).at(-1);draft.playbacks[0].status='failed'}))});
  await test('oversize raw records are rejected without truncation or data loss',()=>{blocked(' '.repeat(2_000_001))});
  await test('backup round trip naturally includes the optional namespace and preserves unrelated progress',async()=>{const state={...base(),drafts:{old:'keep old draft', [p.sampleProgressKey]:roundTrip(fixture)},days:['2026-01-01'],attempts:1,correct:0};const file=backup.makeProgressFile(state),restored=await backup.readProgressFile(file);assert.deepEqual(restored.state,state);assert.equal(p.readSampleProgress(restored.state.drafts[p.sampleProgressKey],clock).status,'ready')});
  await test('compare-and-swap merges only this key and refuses restore/newer-format overwrite',()=>{const original={...base(),drafts:{other:'keep'}},raw=roundTrip(fixture),saved=p.replaceSampleProgress(original,undefined,raw,clock);assert.equal(saved.drafts.other,'keep');assert.equal(original.drafts[p.sampleProgressKey],undefined);const restored={...saved,drafts:{...saved.drafts,[p.sampleProgressKey]:'{"version":2}'}};assert.equal(p.replaceSampleProgress(restored,raw,raw,clock),restored);assert.equal(p.replaceSampleProgress(restored,restored.drafts[p.sampleProgressKey],raw,clock),restored);assert.equal(p.replaceSampleProgress(saved,raw,'invalid',clock),saved)});
  await test('two same-event controlled updates keep their sequence without overwriting other state',()=>{let first=act(m.emptySampleState(),{type:'select-variant',variant:'academic'}),second=act(first,{type:'next'});const raw1=roundTrip(first),raw2=roundTrip(second);let host={...base(),drafts:{other:'untouched'}};host=p.replaceSampleProgress(host,undefined,raw1,clock);host=p.replaceSampleProgress(host,raw1,raw2,clock);assert.equal(host.drafts[p.sampleProgressKey],raw2);assert.equal(host.drafts.other,'untouched')});
  await test('blocked wrapper renders recovery guidance without mounting writable questions',()=>{for(const raw of ['{','{"version":2}']){const state={...base(),drafts:{[p.sampleProgressKey]:raw}},html=render(React.createElement(Workspace,{ready:true,state,update(){throw Error('Rendering must not write state')}}));assert.match(html,/原始内容仍在/);assert.match(html,/不会自动清空/);assert(!html.includes('先选择考试类别'));assert(!html.includes('记录原始作答'));assert.equal(state.drafts[p.sampleProgressKey],raw)}});
  await test('before host storage is ready the wrapper shows loading and creates no blank writable course',()=>{const html=render(React.createElement(Workspace,{ready:false,state:base(),update(){throw Error('Loading must not write state')}}));assert.match(html,/正在读取本机学习记录/);assert(!html.includes('先选择考试类别'));assert(!html.includes('课程学习次序'))});
  await test('guided wrapper keeps category choice once and folds directories after selection',()=>{const unselected=render(React.createElement(Workspace,{ready:true,state:base(),update(){throw Error('Rendering must not write state')}}));assert.match(unselected,/先选择考试类别/);const state=act(m.emptySampleState(),{type:'select-variant',variant:'academic'}),raw=roundTrip(state),html=render(React.createElement(Workspace,{ready:true,state:{...base(),drafts:{[p.sampleProgressKey]:raw}},update(){throw Error('Rendering must not write state')}}));assert.match(html,/切换考试类别/);assert.match(html,/查看课程目录 · 15 课/);assert(!html.includes('<details>'));assert.match(html,/刷新可以继续/);assert.match(html,/备份不含录音/)});
  await test('after correction, guided UI offers the next lesson while an undued review stays unavailable',()=>{const state=closed('academic','hub-reading'),html=renderAt(React.createElement(Sequence,{value:state,guidedFlow:true}),clock);assert.match(html,/继续下一课/);assert(!html.includes('打开一份没接触过的复验题'))});
  await test('a due fresh review is the sole primary continuation instead of competing with the next lesson',()=>{const html=renderAt(React.createElement(Sequence,{value:fixture,guidedFlow:true}),m.sampleReviewDueAt(m.sampleSession(fixture)));assert.match(html,/打开一份没接触过的复验题/);assert(!html.includes('继续下一课'))});
  console.log(`${checks} adapter boundary checks and ${roundTrips} real-transition storage round trips passed`);

  const adapterChecks = checks, adapterRoundTrips = roundTrips;
  const stored = value => ({...base(), drafts: {other: 'Keep this note', [p.sampleProgressKey]: roundTrip(value)}});
  function freeze(value) {
    if (value && typeof value === 'object') {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  }
  function continueIn(value, variant, lessonId) {
    // The production presenter selects an existing entry before switching away
    // from an Academic-only lesson; keep each serialized intermediate valid.
    if(value.variant && !c.sampleLessonById(variant,value.lessonId)) value=act(value,{type:'open-lesson',lessonId:'hub-listening'});
    value = act(value, {type: 'select-variant', variant});
    value = act(value, {type: 'open-lesson', lessonId});
    return act(act(value, {type: 'next'}), {type: 'next'});
  }
  await test('sample recommendations stay empty before any lesson activity', () => {
    for (const state of [base(), stored(m.emptySampleState()), stored(act(m.emptySampleState(), {type: 'select-variant', variant: 'academic'}))]) {
      assert.deepEqual(n.samplePracticeTasks(state, clock, true), []);
    }
  });
  await test('a partial answer resumes its saved lesson without gaining completion evidence', () => {
    let value = start('academic', 'hub-reading');
    const question = m.activeSampleMaterial(value).questions[0];
    value = act(value, {type: 'answer', questionId: question.id, value: question.accepted[0]});
    const [task, ...extra] = n.samplePracticeTasks(stored(value), clock, true);
    assert.deepEqual(extra, []);
    assert.equal(task.id, 'sample:academic:hub-reading');
    assert.equal(task.kind, 'resume');
    assert.equal(task.priority, 1);
    assert.equal(m.sampleSession(value).attempts.length, 0);
    assert.equal(m.activeSampleDraft(value).submittedAt, 0);
  });
  await test('a saved correction stays out of recommendations until its exact 24-hour due time', () => {
    const value = closed('academic', 'hub-reading');
    const state = stored(value), due = m.sampleReviewDueAt(m.sampleSession(value));
    assert.equal(due, m.sampleSession(value).correctedAt + DAY);
    assert.deepEqual(n.samplePracticeTasks(state, clock, true), []);
    assert.deepEqual(n.samplePracticeTasks(state, due - 1, true), []);
    const [task, ...extra] = n.samplePracticeTasks(state, due, true);
    assert.deepEqual(extra, []);
    assert.equal(task.kind, 'review');
    assert.equal(task.priority, 2);
    assert.equal(task.at, due);
  });
  await test('an opened delayed review resumes instead of requesting a different new material', () => {
    let value = closed('general-training', 'hub-writing');
    clock = m.sampleReviewDueAt(m.sampleSession(value));
    value = act(value, {type: 'start-review'}, clock);
    const material = m.activeSampleMaterial(value).id;
    const state = stored(value), before = JSON.stringify(state);
    const tasks = n.samplePracticeTasks(state, clock, false);
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].kind, 'resume');
    assert.equal(tasks[0].priority, 1);
    assert.equal(JSON.stringify(state), before);
    assert.equal(m.activeSampleMaterial(value).id, material);
  });
  await test('an incorrect timed result keeps feedback as a repair recommendation', () => {
    let value = start('academic', 'hub-reading');
    for (const stage of ['guided', 'independent']) {
      if (stage === 'independent') value = act(value, {type: 'confirm-unseen', value: true});
      value = act(act(answer(value), {type: 'submit'}), {type: 'next'});
    }
    value = act(value, {type: 'start-timed'});
    value = act(value, {type: 'confirm-unseen', value: true});
    value = answer(value);
    value = act(value, {type: 'answer', questionId: m.activeSampleMaterial(value).questions[0].id, value: 'An incorrect answer'});
    value = act(act(value, {type: 'submit'}), {type: 'next'});
    const tasks = n.samplePracticeTasks(stored(value), clock, true);
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].kind, 'repair');
    assert.equal(tasks[0].priority, 0);
    assert.equal(m.sampleSession(value).correctedAt, 0);
  });
  await test('all saved categories and lessons have exact routes and a usable return route', () => {
    let value = m.emptySampleState();
    const variants = ['academic', 'general-training'], skills = ['listening', 'reading', 'speaking', 'writing'];
    for (const variant of variants) for (const skill of skills) value = continueIn(value, variant, 'hub-' + skill);
    const state = stored(value);
    for (const online of [false, true]) {
      const prefix = online ? '/' : '', tasks = n.samplePracticeTasks(state, clock, online);
      assert.equal(tasks.length, 8);
      assert.equal(new Set(tasks.map(task => task.id)).size, 8);
      for (const variant of variants) for (const skill of skills) {
        const id = `sample:${variant}:hub-${skill}`, target = `sample-${variant}-hub-${skill}`;
        const task = tasks.find(task => task.id === id);
        assert.ok(task, id);
        assert.equal(task.href, `${prefix}#/ielts?tab=course&task=${target}`);
        assert.equal(task.returnHref, `${prefix}#/today`);
        assert.deepEqual(n.sampleTarget(target), {variant, lessonId: 'hub-' + skill});
      }
    }
  });
  await test('two exhausted review materials do not create another old-question recommendation', () => {
    const value = review(review(closed('academic', 'hub-reading')));
    const session = m.sampleSession(value), state = stored(value);
    const attempts = session.attempts.filter(attempt => attempt.stage === 'review');
    assert.equal(attempts.length, 2);
    assert.equal(new Set(attempts.map(attempt => attempt.promptId)).size, 2);
    assert.equal(m.sampleLessonReceipt(value, clock).freshReviewAvailable, false);
    assert.deepEqual(n.samplePracticeTasks(state, m.sampleReviewDueAt(session) + DAY, true), []);
  });
  await test('reading and skipping recommendations do not alter any host or learning record', () => {
    const state = stored(closed('academic', 'hub-listening'));
    const before = JSON.stringify(state), value = p.readSampleProgress(state.drafts[p.sampleProgressKey], clock).value;
    const due = m.sampleReviewDueAt(m.sampleSession(value));
    freeze(state);
    const tasks = n.samplePracticeTasks(state, due, true);
    assert.equal(tasks.length, 1);
    const skipped = new Set([tasks[0].id]);
    assert.deepEqual(tasks.filter(task => !skipped.has(task.id)), []);
    assert.deepEqual(n.samplePracticeTasks(state, due, true), tasks);
    assert.equal(JSON.stringify(state), before);
  });
  await test('bad and future sample records remain visible failures instead of becoming empty progress', () => {
    for (const raw of ['', '{', '{"version":2}', mutate(fixture, envelope => envelope.contentVersion++)]) {
      const state = freeze({...base(), drafts: {other: 'Keep this note', [p.sampleProgressKey]: raw}});
      assert.throws(() => n.samplePracticeTasks(state, clock, true), error => error instanceof Error && error.message.length > 0);
      assert.equal(state.drafts[p.sampleProgressKey], raw);
      assert.equal(state.drafts.other, 'Keep this note');
    }
  });
  await test('target parsing rejects incomplete, extra and malformed identifiers', () => {
    for (const task of [undefined, '', 'academic-reading', 'sample-academic', 'sample-gt-reading', 'sample-academic-vocabulary', 'sample-Academic-reading', ' sample-academic-reading', 'sample-academic-reading ', 'sample-academic-reading\n', 'sample-academic-reading\r', 'sample-academic-reading/next', 'sample-academic-reading?next=1', 'sample-academic-reading#next', 'sample-%61cademic-reading']) {
      assert.equal(n.sampleTarget(task), undefined, JSON.stringify(task));
    }
  });
  await test('a pending explicit target shows only a loading state without exposing another lesson', () => {
    const state = stored(start('academic', 'hub-reading')), before = JSON.stringify(state);
    const html = render(React.createElement(Workspace, {
      ready: true, state, task: 'sample-general-training-writing',
      update() {throw Error('Server rendering must not select or save a target');},
      onTargetOpened() {throw Error('Server rendering must not acknowledge opening a target');},
    }));
    assert.match(html, /正在回到这次练习/);
    assert(!html.includes('记录原始作答'));
    assert(!html.includes('课程学习次序'));
    assert.equal(JSON.stringify(state), before);
  });
  console.log(`${checks - adapterChecks} recommendation/target checks and ${roundTrips - adapterRoundTrips} additional real-transition round trips passed`);

  const teachingChecks = checks, teachingRoundTrips = roundTrips;
  const escapeHTML = text => text.replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;'}[character]));
  function modelStage(variant, lessonId) {
    let value = act(m.emptySampleState(), {type: 'select-variant', variant});
    value = act(value, {type: 'open-lesson', lessonId});
    return act(value, {type: 'next'});
  }
  function renderReadOnly(value) {
    const state = freeze(stored(value)), before = JSON.stringify(state);
    const html = renderAt(React.createElement(Workspace, {
      ready: true, state,
      update() {throw Error('Reading teaching content must not save or change learning state');},
    }), clock);
    assert.equal(JSON.stringify(state), before);
    return html;
  }
  await test('Academic and GT listening/reading models show numbered prompts before their matching answer and evidence', () => {
    for (const variant of ['academic', 'general-training']) for (const skill of ['listening', 'reading']) {
      const value = modelStage(variant, 'hub-' + skill), material = m.activeSampleMaterial(value);
      const html = renderReadOnly(value);
      const questions = html.match(/<ol aria-label="示范题目">([\s\S]*?)<\/ol>/);
      const solutions = html.match(/<ol aria-label="示范答案与依据">([\s\S]*?)<\/ol>/);
      assert.ok(questions, `${variant} ${skill}: show the original model questions`);
      assert.ok(solutions, `${variant} ${skill}: show each answer with its evidence`);
      assert.ok(questions.index < solutions.index, 'All numbered questions precede the numbered answers');
      const prompts = [...questions[1].matchAll(/<li\b([^>]*)>([\s\S]*?)<\/li>/g)];
      const answers = [...solutions[1].matchAll(/<li\b([^>]*)>([\s\S]*?)<\/li>/g)];
      assert.equal(prompts.length, material.questions.length);
      assert.equal(answers.length, material.questions.length);
      material.questions.forEach((question, index) => {
        const id = `${material.id}-${question.id}`;
        assert.ok(prompts[index][1].includes(`id="${id}"`), 'Keep the original material and question identity');
        assert.equal(prompts[index][2], escapeHTML(question.prompt));
        assert.ok(answers[index][1].includes(`aria-describedby="${id}"`), 'Each answer refers to its own question');
        assert.ok(answers[index][2].includes(`<strong lang="en">${escapeHTML(question.accepted[0])}</strong>`));
        assert.ok(answers[index][2].includes(escapeHTML(question.why)));
        assert.equal(html.split(escapeHTML(question.prompt)).length - 1, 1, 'Do not repeat the full question beside an answer');
      });
      assert.ok(!html.includes(escapeHTML(material.model)), 'Do not repeat the unlabelled answer summary');
      for (const note of material.modelNotes) assert.ok(!html.includes(escapeHTML(note)), 'The per-question evidence replaces duplicate model notes');
    }
  });
  await test('speaking and writing models keep their existing text and teaching notes in both categories', () => {
    for (const variant of ['academic', 'general-training']) for (const skill of ['speaking', 'writing']) {
      const value = modelStage(variant, 'hub-' + skill), material = m.activeSampleMaterial(value);
      assert.equal(material.questions, undefined);
      const html = renderReadOnly(value);
      assert.ok(html.includes(escapeHTML(material.model)));
      for (const note of material.modelNotes) assert.ok(html.includes(escapeHTML(note)));
      assert.ok(!html.includes('aria-label="示范题目"'));
      assert.ok(!html.includes('aria-label="示范答案与依据"'));
    }
  });
  await test('unsubmitted independent listening/reading tasks keep solutions hidden while read-only rendering preserves records', () => {
    for (const variant of ['academic', 'general-training']) for (const skill of ['listening', 'reading']) {
      let value = start(variant, 'hub-' + skill);
      if (skill === 'listening') value = heard(value);
      value = act(act(answer(value), {type: 'submit'}), {type: 'next'});
      const material = m.activeSampleMaterial(value), draft = m.activeSampleDraft(value);
      assert.equal(m.sampleSession(value).stage, 'independent');
      assert.equal(draft.submittedAt, 0);
      assert.deepEqual(draft.answers, {});
      const html = renderReadOnly(value);
      assert.ok(!html.includes('aria-label="示范答案与依据"'));
      assert.ok(!html.includes('这次作答已记录'));
      for (const question of material.questions) {
        assert.ok(html.includes(escapeHTML(question.prompt)), 'The learner still gets the complete question');
        assert.ok(!html.includes(escapeHTML(question.why)), 'Do not expose the answer explanation before submission');
        if (!question.options) assert.ok(!html.includes(escapeHTML(question.accepted[0])), 'Listening answers remain hidden');
      }
      if (material.script) assert.ok(!html.includes(escapeHTML(material.script)), 'Independent listening keeps its transcript hidden');
      if (skill === 'reading') {
        const selects = [...html.matchAll(/<select\b[^>]*>([\s\S]*?)<\/select>/g)];
        assert.equal(selects.length, material.questions.length);
        for (const select of selects) {
          const selected = [...select[1].matchAll(/<option\b[^>]*\bselected=""[^>]*>([\s\S]*?)<\/option>/g)];
          assert.deepEqual(selected.map(option => option[1]), ['请选择'], 'The correct choice must not be preselected');
        }
      }
    }
  });
  console.log(`${checks - teachingChecks} teaching UI groups and ${roundTrips - teachingRoundTrips} additional real-transition round trips passed`);

  const textChecks = checks, textRoundTrips = roundTrips;
  const fullAcademic = 'Cooking recorded the highest attendance at 75 visits, compared with 30 for painting. Photography attracted 45 visits.';
  const shortAcademic = 'Cooking was highest: 75 visits. Painting had 30.';
  function independentOpen(variant = 'academic', skill = 'writing') {
    const value = start(variant, 'hub-' + skill);
    return act(act(answer(value), {type: 'submit'}), {type: 'next'});
  }
  function feedbackOpen(variant = 'academic', skill = 'writing') {
    let value = independentOpen(variant, skill);
    for (const stage of ['independent', 'timed']) {
      if (stage === 'timed') value = act(value, {type: 'start-timed'});
      value = act(act(answer(value), {type: 'submit'}), {type: 'next'});
    }
    return act(value, {type: 'correction-note', value: '按题目补充相关信息，内容与语言仍需人工核对。'});
  }
  const invalidResponses = [
    [' \n\t ', /空白/],
    ['...!? —', /没有英文/],
    ['75 30 45 2.5%', /没有英文/],
    ['这里只有中文内容。', /没有英文/],
    ['hello '.repeat(20), /重复同一个词或片段/],
    ['Cooking was popular. Cooking was popular.', /重复同一个词或片段/],
    ['Visit at 10:30. Visit at 10:30.', /重复同一个词或片段/],
  ];
  await test('text reference counting includes numeric values and common abbreviations consistently', () => {
    for (const [text, expected] of [[fullAcademic, 17], [shortAcademic, 8], ['75 30 1,200 2.5% 10:30', 5], ['U.S.A. U.K. e.g. Dr. p.m.', 5], ["I don't re-write words.", 4], ['... ！？', 0]]) {
      assert.equal(m.sampleWordCount(text), expected, text);
    }
  });
  await test('both reported Academic responses and short GT/speaking originals save for human review without a word floor', () => {
    for (const [variant, skill, response] of [['academic', 'writing', fullAcademic], ['academic', 'writing', shortAcademic], ['general-training', 'writing', 'Could I borrow a brush?'], ['academic', 'speaking', 'I can join.']]) {
      let value = act(independentOpen(variant, skill), {type: 'response', value: response});
      const html = renderReadOnly(value);
      assert.ok(html.includes(`${m.sampleWordCount(response)} 个词或数字`));
      assert.ok(html.includes('计数仅作参考'));
      assert.ok(html.includes('原稿待人工核对'));
      assert.ok(!html.includes('至少 15 个'));
      value = act(value, {type: 'submit'});
      const attempt = m.sampleSession(value).attempts.at(-1);
      assert.equal(attempt.response, response);
      assert.equal(attempt.correct, null);
      assert.equal(attempt.matched, null);
      assert.equal(attempt.feedback, 'self-review-awaiting-human');
      assert.equal(m.sampleLessonReceipt(value, clock).band, null);
      assert.equal(m.sampleLessonReceipt(value, clock).mastery, 'not-assessed');
      const read = p.readSampleProgress(roundTrip(value), clock);
      assert.equal(read.status, 'ready');
      assert.equal(m.activeSampleDraft(read.value).response, response);
    }
  });
  await test('limited text refusals identify the missing item, retain the original, and allow a direct corrected resubmission', () => {
    const initial = independentOpen();
    for (const [response, message] of invalidResponses) {
      const value = act(initial, {type: 'response', value: response}), before = JSON.stringify(value);
      const rejected = m.transitionSample(value, {type: 'submit'}, (clock += 10));
      assert.match(rejected.issue, message);
      assert.match(rejected.issue, /原稿保留/);
      assert.equal(rejected.state, value);
      assert.equal(JSON.stringify(value), before);
      const restored = p.readSampleProgress(roundTrip(value), clock);
      assert.equal(restored.status, 'ready');
      assert.equal(m.activeSampleDraft(restored.value).response, response);
      const fixed = act(act(restored.value, {type: 'response', value: shortAcademic}), {type: 'submit'});
      assert.equal(m.sampleSession(fixed).attempts.length, m.sampleSession(initial).attempts.length + 1);
      assert.equal(m.sampleSession(fixed).attempts.at(-1).response, shortAcademic);
    }
  });
  await test('correction uses the same limited text rules and keeps rejected drafts editable', () => {
    const initial = feedbackOpen();
    for (const [response, message] of invalidResponses) {
      const value = act(initial, {type: 'correction-response', value: response}), before = JSON.stringify(value);
      const rejected = m.transitionSample(value, {type: 'save-correction'}, (clock += 10));
      assert.match(rejected.issue, message);
      assert.equal(rejected.issue, m.sampleResponseIssue(response));
      assert.equal(rejected.state, value);
      assert.equal(JSON.stringify(value), before);
      assert.equal(m.sampleSession(p.readSampleProgress(roundTrip(value), clock).value).correctionResponse, response);
    }
    for (const response of [fullAcademic, shortAcademic]) {
      let value = act(initial, {type: 'correction-response', value: response});
      const html = renderReadOnly(value);
      assert.ok(html.includes(escapeHTML(m.selectedSampleLesson(value).timed.instruction)));
      assert.ok(html.includes(`${m.sampleWordCount(response)} 个词或数字`));
      assert.ok(html.includes('订正原稿待人工核对'));
      value = act(value, {type: 'save-correction'});
      assert.equal(m.sampleSession(value).correctionResponse, response);
      assert.equal(m.sampleSession(value).stage, 'review');
      assert.equal(m.sampleReviewDueAt(m.sampleSession(value)), m.sampleSession(value).correctedAt + DAY);
      assert.equal(p.readSampleProgress(roundTrip(value), clock).status, 'ready');
    }
  });
  await test('new text checks and abbreviation counts do not invalidate historically accepted originals or corrections', () => {
    const value = closed('academic', 'hub-writing');
    const originals = ['I am in the U.S.A. and U.K. with Dr. A.B. and friends.', 'hello '.repeat(15).trim()];
    for (const response of originals) {
      assert.ok((response.match(/[a-z]+(?:['’-][a-z]+)*/gi) || []).length >= 15, 'This text met the original saved-record rule');
      const raw = mutate(value, envelope => {
        const session = envelope.value.sessions['academic:hub-writing'];
        for (const attempt of session.attempts) attempt.response = response;
        for (const draft of Object.values(session.drafts)) if (draft.submittedAt) draft.response = response;
        session.correctionResponse = response;
      });
      const read = p.readSampleProgress(raw, clock);
      assert.equal(read.status, 'ready', read.reason);
      assert.deepEqual(JSON.parse(p.serializeSampleProgress(read.value, clock)).value, JSON.parse(raw).value);
      assert.equal(m.sampleSession(read.value).correctionResponse, response);
    }
  });
  console.log(`${checks - textChecks} original-text groups and ${roundTrips - textRoundTrips} additional real-transition round trips passed`);

  const historyChecks = checks, historyRoundTrips = roundTrips;
  function historySection(html) {
    const match = html.match(/<div id="sample-answer-history" hidden="">([\s\S]*?)<\/div><\/section>/);
    assert.ok(match, 'Saved history stays hidden behind a named button until requested');
    assert.ok(!/<(?:button|input|select|textarea)\b/.test(match[1]), 'History has no mutation controls');
    return match[1];
  }
  function noReferencesInHistory(history, lesson) {
    for (const material of c.sampleMaterials(lesson)) {
      for (const text of [material.model, ...(material.modelNotes || []), ...(material.questions || []).map(question => question.why)]) {
        if (text) assert.ok(!history.includes(escapeHTML(text)), 'Reference answers and explanations stay out of personal history');
      }
    }
    for (const material of lesson.reviews) {
      assert.ok(!history.includes(escapeHTML(material.title)), 'Unopened review materials remain hidden');
      for (const text of [material.context, material.script]) if (text) assert.ok(!history.includes(escapeHTML(text)));
      for (const question of material.questions || []) assert.ok(!history.includes(escapeHTML(question.prompt)));
    }
    assert.ok(!history.includes('参考：'));
  }
  await test('the 24-hour wait exposes saved answers and their source context without revealing reference answers or future materials', () => {
    let value = start('academic', 'hub-reading');
    value = act(act(answer(value), {type: 'submit'}), {type: 'next'});
    value = act(value, {type: 'hint'});
    for (const stage of ['independent', 'timed']) {
      if (stage === 'timed') value = act(value, {type: 'start-timed'});
      for (const question of m.activeSampleMaterial(value).questions) value = act(value, {type: 'answer', questionId: question.id, value: 'FALSE'});
      value = act(act(value, {type: 'submit'}), {type: 'next'});
    }
    const lesson = m.selectedSampleLesson(value);
    for (const question of lesson.timed.questions) value = act(value, {type: 'correction-answer', questionId: question.id, value: question.accepted[0]});
    value = act(value, {type: 'correction-note', value: '我把费用关系看反了，下次逐项核对具体数字。'});
    value = act(value, {type: 'save-correction'});
    const session = m.sampleSession(value), due = m.sampleReviewDueAt(session), before = JSON.stringify(value);
    assert.ok(clock < due);
    const history = historySection(renderReadOnly(value));
    assert.match(history, /3 次作答/);
    assert.match(history, /曾用提示/);
    assert.match(history, /尚未到 24 小时/);
    assert.match(history, /\d{4}\/\d{2}\/\d{2}/);
    for (const attempt of session.attempts) {
      const source = c.sampleMaterials(lesson).find(material => material.id === attempt.promptId);
      assert.ok(history.includes(escapeHTML(source.title)));
      assert.ok(history.includes(escapeHTML(source.instruction)));
      for (const text of [source.context, source.script]) if (text) assert.ok(history.includes(escapeHTML(text)));
      assert.ok(history.includes(`dateTime="${new Date(attempt.at).toISOString()}"`));
      for (const question of source.questions) {
        assert.ok(history.includes(escapeHTML(question.prompt)));
        assert.ok(history.includes(`我的原答：<span lang="en">${escapeHTML(attempt.answers[question.id])}</span>`));
      }
    }
    assert.ok(history.includes('我的订正'));
    assert.ok(history.includes(escapeHTML(session.correctionNote)));
    assert.ok(history.includes(`dateTime="${new Date(session.correctedAt).toISOString()}"`));
    for (const question of lesson.timed.questions) assert.ok(history.includes(`我的订正：<span lang="en">${escapeHTML(session.correctionAnswers[question.id])}</span>`));
    noReferencesInHistory(history, lesson);
    assert.equal(JSON.stringify(value), before);
    assert.equal(m.sampleReviewDueAt(m.sampleSession(value)), due);
  });
  await test('registered matching and sentence histories retain complete submitted stimuli and survive backup without exposing review banks', async () => {
    for (const variant of ['academic', 'general-training']) for (const id of ['listening-matching', 'reading-sentence-completion']) {
      const value = closed(variant, id), lesson = m.selectedSampleLesson(value), session = m.sampleSession(value);
      const before = JSON.stringify(value), due = m.sampleReviewDueAt(session), history = historySection(renderReadOnly(value));
      for (const attempt of session.attempts) {
        const material = c.sampleMaterials(lesson).find(item => item.id === attempt.promptId);
        assert.ok(history.includes(escapeHTML(material.instruction)));
        for (const text of [material.context, material.script]) if (text) assert.ok(history.includes(escapeHTML(text)));
        for (const question of material.questions) assert.ok(history.includes(escapeHTML(attempt.answers[question.id])));
      }
      noReferencesInHistory(history, lesson);
      const restored = await backup.readProgressFile(backup.makeProgressFile(stored(value)));
      const read = p.readSampleProgress(restored.state.drafts[p.sampleProgressKey], clock);
      assert.equal(read.status, 'ready');
      assert.equal(historySection(renderReadOnly(read.value)), history);
      assert.equal(m.sampleReviewDueAt(m.sampleSession(read.value)), due);
      assert.equal(JSON.stringify(value), before);
    }
  });
  await test('an early imported correction draft never exposes unsubmitted timed material in history', () => {
    for (const id of ['listening-matching', 'reading-sentence-completion']) {
      const value = continueIn(m.emptySampleState(), 'academic', id), lesson = m.selectedSampleLesson(value);
      m.sampleSession(value).correctionNote = 'Imported pending note without a timed attempt';
      const read = p.readSampleProgress(roundTrip(value), clock);
      assert.equal(read.status, 'ready');
      const history = historySection(renderReadOnly(read.value));
      for (const text of [lesson.timed.title, lesson.timed.instruction, lesson.timed.context, lesson.timed.script]) if (text) assert.ok(!history.includes(escapeHTML(text)));
      assert.equal(m.sampleSession(read.value).correctionNote, m.sampleSession(value).correctionNote);
    }
  });
  await test('personal text history and correction survive the real whole-site backup and refresh path in both categories', async () => {
    for (const variant of ['academic', 'general-training']) for (const skill of ['speaking', 'writing']) {
      const value = closed(variant, 'hub-' + skill), state = stored(value), session = m.sampleSession(value);
      const before = historySection(renderReadOnly(value)), due = m.sampleReviewDueAt(session);
      for (const attempt of session.attempts) assert.ok(before.includes(escapeHTML(attempt.response)));
      assert.ok(before.includes(escapeHTML(session.correctionResponse)));
      assert.ok(before.includes(escapeHTML(session.correctionNote)));
      noReferencesInHistory(before, m.selectedSampleLesson(value));
      const restored = await backup.readProgressFile(backup.makeProgressFile(state));
      assert.equal(restored.state.drafts[p.sampleProgressKey], state.drafts[p.sampleProgressKey]);
      const read = p.readSampleProgress(restored.state.drafts[p.sampleProgressKey], clock);
      assert.equal(read.status, 'ready');
      assert.deepEqual(m.sampleSession(read.value), JSON.parse(JSON.stringify(session)));
      assert.equal(m.sampleReviewDueAt(m.sampleSession(read.value)), due);
      assert.equal(historySection(renderReadOnly(read.value)), before);
    }
  });
  console.log(`${checks - historyChecks} read-only history groups and ${roundTrips - historyRoundTrips} additional real-transition round trips passed`);
  const integrationChecks=checks,integrationRoundTrips=roundTrips;
  await test('registered directory has fifteen lessons per category, thirty legal sessions and one hundred thirty-two unique materials',()=>{
    const refs=['academic','general-training'].flatMap(variant=>c.sampleLessonsFor(variant).flatMap(c.sampleMaterials));
    assert.equal(refs.length,180);assert.equal(new Set(refs.map(material=>material.id)).size,132);
    let value=m.emptySampleState();
    for(const variant of ['academic','general-training'])for(const lesson of c.sampleLessonsFor(variant))value=continueIn(value,variant,lesson.id);
    assert.equal(Object.keys(value.sessions).length,30);roundTrip(value);
    for(const task of n.samplePracticeTasks(stored(value),clock,true)){
      const parsed=route.parseRoute(task.href.slice(1)),target=n.sampleTarget(parsed.task);
      assert.equal(task.id,`sample:${target.variant}:${target.lessonId}`);
      assert(parsed.task.endsWith(target.lessonId));
    }
    for(const key of ['academic:unknown','academic:hub-reading:extra','gt:hub-reading'])blocked(mutate(value,x=>{x.value.sessions[key]={}}));
    const raw=roundTrip(value),saved={...base(),drafts:{other:'unchanged',[p.sampleProgressKey]:raw}};
    const restored=backup.readProgressFile(backup.makeProgressFile(saved));
    return restored.then(result=>{assert.deepEqual(result.state,saved);assert.equal(p.readSampleProgress(result.state.drafts[p.sampleProgressKey],clock).status,'ready')});
  });
  await test('new complete-group responses preserve duplicate and malformed originals through the real save parser',()=>{
    for(const variant of ['academic','general-training'])for(const raw of [' A A C ','A, C','Z A','A','A B C D']){
      let value=start(variant,'reading-multiple-answers');const material=m.activeSampleMaterial(value),id=material.questions[0].id;
      value=act(value,{type:'answer',questionId:id,value:raw});value=act(value,{type:'submit'});
      const first=m.sampleSession(value).attempts[0];assert.equal(first.answers[id],raw);assert.equal(first.matched,false);assert.equal(first.correct,0);assert.equal(first.total,1);
      value=act(value,{type:'answer',questionId:id,value:material.questions[0].accepted[0]});value=act(value,{type:'submit'});
      assert.equal(m.sampleSession(value).attempts[0].answers[id],raw);assert.equal(m.sampleSession(value).attempts[1].matched,true);roundTrip(value);
    }
  });
  await test('checkbox controls show raw strings without mount writes or duplicate repair, and edits use the existing scalar',()=>{
    const task=multi.batch02NativeLessonsFor('academic')[1].guided.task;
    const nodes=node=>[node,...(node&&typeof node==='object'?React.Children.toArray(node.props?.children).flatMap(nodes):[])];
    for(const raw of [' A A C ','A, C','Z A','a b','']){
      const writes=[],tree=Selection({task,rawAnswer:raw,onChange:value=>writes.push(value)}),html=render(tree);
      assert.equal(writes.length,0);assert(html.includes(`value="${escapeHTML(raw)}"`));
      const boxes=nodes(tree).filter(node=>node?.type==='input'&&node.props.type==='checkbox');assert.equal(boxes.length,task.options.length);
      if([' A A C ','A, C','Z A'].includes(raw))assert(boxes.every(box=>box.props.disabled));
      if(raw===''){boxes[0].props.onChange({target:{checked:true}});assert.deepEqual(writes,[task.options[0].id]);}
    }
  });
  await test('new models show coach notes once while independent, timed-before-start and unexposed review content stay hidden',()=>{
    for(const variant of ['academic','general-training'])for(const lesson of c.sampleLessonsFor(variant).slice(4)){
      const value=modelStage(variant,lesson.id),html=renderReadOnly(value);
      for(const note of lesson.model.modelNotes)assert.equal(html.split(escapeHTML(note)).length-1,1);
      for(const later of [lesson.guided,lesson.independent,lesson.timed,...lesson.reviews])assert(!html.includes(escapeHTML(later.title)));
      const independent=act(act(heardIfNeeded(answer(start(variant,lesson.id))),{type:'submit'}),{type:'next'});
      const own=renderReadOnly(independent);for(const q of lesson.independent.questions)assert(!own.includes(escapeHTML(q.why)));
      const timed=act(act(heardIfNeeded(answer(independent)),{type:'submit'}),{type:'next'});
      const beforeStart=renderReadOnly(timed);assert.match(beforeStart,/开始训练计时/);
      const native=multi.batch02NativeLessonsFor(variant).find(item=>item.id===lesson.id);
      const stimulus=native?native.timed.stimulus:lesson.timed.context||lesson.timed.script;
      assert(!beforeStart.includes(escapeHTML(stimulus)),'A timed stimulus remains hidden until the learner starts the timer');
      assert(!beforeStart.includes('sample-multi-select"'),'Timed checkbox choices remain unmounted before the timer starts');
      for(const q of lesson.timed.questions)assert(!beforeStart.includes(escapeHTML(q.why)));
      for(const later of lesson.reviews)assert(!beforeStart.includes(escapeHTML(later.title)));
    }
  });
  function heardIfNeeded(value){return m.activeSampleMaterial(value).script?heard(value):value}
  console.log(`${checks-integrationChecks} integrated-directory/selection groups and ${roundTrips-integrationRoundTrips} additional real-transition round trips passed`);
} finally {
  await rm(temp, {recursive: true, force: true});
}
