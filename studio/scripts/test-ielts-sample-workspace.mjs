import assert from 'node:assert/strict';
import {readdir, mkdtemp, rm} from 'node:fs/promises';
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
        import * as classic from './app/model';
        import * as backup from './app/progress-file';
        import {IELTSSampleWorkspace as Workspace} from './app/ielts-sample-workspace';
        import {IELTSSampleSequence as Sequence} from './ielts-blueprint/sample-sequence-ui';
        import React from 'react';
        import {renderToStaticMarkup as render} from 'react-dom/server';
        export {p,m,c,n,classic,backup,Workspace,Sequence,React,render};
      `,
      resolveDir: rootPath,
      sourcefile: 'sample-workspace-check-entry.ts',
      loader: 'ts',
    },
    plugins: [{
      name: 'ssr-recorder-boundary',
      setup(builder) {
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
  const {p,m,c,n,classic,backup,Workspace,Sequence,React,render} =
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
  await test('before host storage is ready the wrapper shows loading and creates no blank writable course',()=>{const html=render(React.createElement(Workspace,{ready:false,state:base(),update(){throw Error('Loading must not write state')}}));assert.match(html,/正在读取本机学习记录/);assert(!html.includes('先选择考试类别'));assert(!html.includes('四课学习次序'))});
  await test('guided wrapper keeps category choice once and folds directories after selection',()=>{const unselected=render(React.createElement(Workspace,{ready:true,state:base(),update(){throw Error('Rendering must not write state')}}));assert.match(unselected,/先选择考试类别/);const state=act(m.emptySampleState(),{type:'select-variant',variant:'academic'}),raw=roundTrip(state),html=render(React.createElement(Workspace,{ready:true,state:{...base(),drafts:{[p.sampleProgressKey]:raw}},update(){throw Error('Rendering must not write state')}}));assert.match(html,/<details><summary>调整考试类别/);assert.match(html,/<details><summary>查看四课目录/);assert.match(html,/刷新可以继续/);assert.match(html,/备份不含录音/)});
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
        const id = `sample:${variant}:hub-${skill}`, target = `sample-${variant}-${skill}`;
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
    for (const task of [undefined, '', 'academic-reading', 'sample-academic', 'sample-academic-hub-reading', 'sample-gt-reading', 'sample-academic-vocabulary', 'sample-Academic-reading', ' sample-academic-reading', 'sample-academic-reading ', 'sample-academic-reading\n', 'sample-academic-reading\r', 'sample-academic-reading/next', 'sample-academic-reading?next=1', 'sample-academic-reading#next', 'sample-%61cademic-reading']) {
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
    assert(!html.includes('四课学习次序'));
    assert.equal(JSON.stringify(state), before);
  });
  console.log(`${checks - adapterChecks} recommendation/target checks and ${roundTrips - adapterRoundTrips} additional real-transition round trips passed`);
} finally {
  await rm(temp, {recursive: true, force: true});
}
