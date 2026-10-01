import assert from 'node:assert/strict';
import {mkdtemp, readFile, readdir, rm} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import path from 'node:path';
import os from 'node:os';

// Real ProgressSave TSX handlers and canonical adapters, with in-memory hooks,
// storage, locks and native-file surfaces. This is not browser/DOM/device QA.
const root = new URL('../', import.meta.url), rootPath = fileURLToPath(root);
const packages = new URL('node_modules/.pnpm/', root);
const builders = (await readdir(packages)).filter(name => /^esbuild@\d+\.\d+\.\d+$/.test(name)).sort((a,b) => b.localeCompare(a,undefined,{numeric:true}));
assert.ok(builders.length, 'Install the existing project dependencies.');
const {build} = await import(new URL(`${builders[0]}/node_modules/esbuild/lib/main.js`, packages));
const ts = (await import(new URL('node_modules/typescript/lib/typescript.js', root))).default;
const temporary = await mkdtemp(path.join(os.tmpdir(), 'english-progress-capability-ui-'));
const tests = [], test = (name, run) => tests.push({name, run});
const copy = value => JSON.parse(JSON.stringify(value));

try {
  const output = path.join(temporary, 'production.mjs');
  await build({stdin: {contents: `
    export * as capability from './app/capability-review-backup';
    export * as files from './app/progress-file';
    export * as demo from './public/demos/yesterday/model.mjs';
    export * as review from './public/demos/yesterday/review-adapter.mjs';
    export {initial, validateState} from './app/model';
    export * as flashcards from './app/flashcards';
  `, resolveDir: rootPath, sourcefile: 'progress-capability-ui-check.ts', loader: 'ts'}, bundle: true, platform: 'node', format: 'esm', target: 'node22', outfile: output, logLevel: 'silent'});
  const {capability, files, demo, review, initial, validateState, flashcards} = await import(pathToFileURL(output).href);
  const START = Date.now() - 3 * review.DAY_MS, NOW = START + 2 * review.DAY_MS;
  let completed = demo.initialState(START);
  completed = demo.showQuestion(completed, 'new-omar');
  completed = demo.useHint(completed, 'new-omar');
  completed = demo.submit(completed, 'new-omar', 1, START + 10);
  completed = demo.showQuestion(completed, 'new-may');
  completed = demo.submit(completed, 'new-may', 2, START + 20);
  completed = demo.finishDemo(completed, 'My saved original yesterday.', START + 30);
  const made = review.ensurePlan(review.emptySnapshot(), demo.completedDemo(completed, NOW), START + 30);
  assert.equal(made.ok, true);
  const plan = made.snapshot, rawDemo = JSON.stringify(completed), rawPlan = JSON.stringify(plan);
  const currentState = () => ({...copy(initial), drafts: {note: 'Current textbook original'}});
  const incomingState = () => ({...copy(initial), drafts: {note: 'Imported textbook original'}});

  // Extract the actual nested host callback, rather than reproducing its ordering,
  // conflict check or flashcard compatibility logic in the test implementation.
  const hostSource = await readFile(new URL('app/study-app.tsx', root), 'utf8');
  const hostAST = ts.createSourceFile('study-app.tsx', hostSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const callbacks = [];
  function visit(node) {if (ts.isFunctionDeclaration(node) && node.name?.text === 'restoreProgress') callbacks.push(node); ts.forEachChild(node, visit);}
  visit(hostAST); assert.equal(callbacks.length, 1, 'Find the real host restoreProgress callback');
  const hostFactorySource = `export function createHostRestore(dependencies) {
    const {stateRef, validateState, prepareFlashcardRestore, courseWords, storageMode, writeState, localStorage, KEY, setState, setPersisted, setStorageError, setStorageBlocked} = dependencies;
    ${callbacks[0].getText(hostAST)}
    return restoreProgress;
  }`;
  const hostFactoryCode = ts.transpileModule(hostFactorySource, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext}}).outputText;
  const {createHostRestore} = await import('data:text/javascript;base64,' + Buffer.from(hostFactoryCode).toString('base64'));
  function hostDependencies(state, writeState, options = {}) {
    const stateRef = {current: state}, setters = [], writes = [];
    return {stateRef, setters, writes, validateState, courseWords: [], storageMode: 'db', KEY: 'english-studio-v1',
      prepareFlashcardRestore: flashcards.prepareFlashcardRestore,
      writeState: async next => {writes.push(next); await writeState(next);},
      localStorage: globalThis.localStorage,
      setState: next => setters.push(['state', next]), setPersisted: next => setters.push(['persisted', next]),
      setStorageError: value => setters.push(['error', value]), setStorageBlocked: value => setters.push(['blocked', value]),
      ...options,
    };
  }

  class MemoryStorage {
    values = new Map(); events = []; failRead; failWrite; failRemove;
    constructor(entries = []) {this.values = new Map(entries);}
    getItem(key) {this.events.push(['get', key]); if (this.failRead?.(key)) throw Error('Memory storage read denied'); return this.values.get(key) ?? null;}
    setItem(key, value) {this.events.push(['set', key, String(value)]); if (this.failWrite?.(key, String(value))) throw Error('Memory storage write denied'); this.values.set(key, String(value));}
    removeItem(key) {this.events.push(['remove', key]); if (this.failRemove?.(key)) throw Error('Memory storage remove denied'); this.values.delete(key);}
    snapshot() {return [...this.values.entries()].sort(([a],[b]) => a.localeCompare(b));}
    seed(key, raw) {if (raw === null) this.values.delete(key); else this.values.set(key, raw);}
    get writes() {return this.events.filter(([kind]) => kind === 'set' || kind === 'remove');}
  }
  class MemoryLocks {
    tails = new Map(); requests = [];
    async request(name, options, fn) {
      this.requests.push(name); const previous = this.tails.get(name) || Promise.resolve();
      let release; this.tails.set(name, new Promise(resolve => {release = resolve;}));
      await previous;
      try {return await fn({name, mode: options.mode});} finally {release();}
    }
  }
  const populated = () => new MemoryStorage([[demo.storageKey, rawDemo], [review.STORAGE_KEY, rawPlan], ['unrelated-key', 'keep']]);
  async function environment(storage, run, locks = new MemoryLocks()) {
    const keys = ['window', 'navigator', 'localStorage', 'document', 'setTimeout'];
    const previous = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
    const oldNow = Date.now, oldCreate = URL.createObjectURL, oldRevoke = URL.revokeObjectURL;
    const urls = new Map(), env = {storage, locks, downloads: [], written: [], toasts: [], pickerCalls: [], events: [], calls: [], gesture: false};
    let nextURL = 1;
    const window = {
      matchMedia() {return {matches: false};},
      dispatchEvent(event) {env.events.push(event.type); return true;},
      async showSaveFilePicker(options) {
        env.pickerCalls.push({gesture: env.gesture, options});
        return {createWritable: async () => ({write: async file => {env.written.push(file);}, close: async () => {}, abort: async () => {}})};
      },
    };
    const document = {body: {appendChild() {}}, createElement(tag) {
      assert.equal(tag, 'a');
      return {href: '', download: '', click() {const file = urls.get(this.href); assert.ok(file instanceof File); env.downloads.push(file);}, remove() {}};
    }};
    Object.defineProperty(globalThis, 'window', {configurable: true, value: window});
    Object.defineProperty(globalThis, 'navigator', {configurable: true, value: {locks}});
    Object.defineProperty(globalThis, 'localStorage', {configurable: true, value: storage});
    Object.defineProperty(globalThis, 'document', {configurable: true, value: document});
    Object.defineProperty(globalThis, 'setTimeout', {configurable: true, value: callback => {callback(); return 0;}});
    URL.createObjectURL = file => {const key = `memory-file-${nextURL++}`; urls.set(key, file); return key;};
    URL.revokeObjectURL = key => urls.delete(key);
    Date.now = () => NOW;
    try {return await run(env);} finally {
      Date.now = oldNow; URL.createObjectURL = oldCreate; URL.revokeObjectURL = oldRevoke;
      for (const [key, descriptor] of previous) descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key];
    }
  }

  // Imports alone are substituted. The production component body, effects and
  // event handlers execute unchanged. File and restore decisions stay canonical.
  let source = (await readFile(new URL('app/progress-save.tsx', root), 'utf8')).replace(/^import .*;$/gm, '');
  const harness = `
    const ChevronDown=()=>null,Cloud=()=>null,Download=()=>null,FolderOpen=()=>null,testFragment='test-fragment',ONLINE=true;
    const Dialog=({open,children})=>open?testJSX('test-dialog',{},...children):null;
    const DialogContent=({children})=>testJSX('test-dialog-content',{},...children);
    const DialogHeader=({children})=>testJSX('test-dialog-header',{},...children);
    const DialogTitle=({children})=>testJSX('test-dialog-title',{},...children);
    const DialogDescription=({children})=>testJSX('test-dialog-description',{},...children);
    let activeRuntime;
    const useState=value=>activeRuntime.useState(value),useRef=value=>activeRuntime.useRef(value),useEffect=(fn,deps)=>activeRuntime.useEffect(fn,deps);
    const downloadProgress=(...args)=>activeRuntime.dependencies.downloadProgress(...args);
    const makeProgressFile=(...args)=>activeRuntime.dependencies.makeProgressFile(...args);
    const readProgressFile=(...args)=>activeRuntime.dependencies.readProgressFile(...args);
    const saveProgressToFiles=(...args)=>activeRuntime.dependencies.saveProgressToFiles(...args);
    const captureCapabilityReviewBackup=(...args)=>activeRuntime.dependencies.captureCapabilityReviewBackup(...args);
    const prepareCapabilityReviewRestore=(...args)=>activeRuntime.dependencies.prepareCapabilityReviewRestore(...args);
    const executeCapabilityReviewRestore=(...args)=>activeRuntime.dependencies.executeCapabilityReviewRestore(...args);
    const toast=Object.assign((...args)=>activeRuntime.dependencies.toast('notice',...args),{success:(...args)=>activeRuntime.dependencies.toast('success',...args),error:(...args)=>activeRuntime.dependencies.toast('error',...args)});
    function testJSX(type,props,...children){return {type,props:{...props,children:children.flat(Infinity).filter(child=>child!==null&&child!==undefined&&child!==false)}}}
    export function createRenderer(runtime){return props=>{activeRuntime=runtime;return runtime.render(ProgressSave,props)}}
  `;
  const code = ts.transpileModule(source + harness, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.React, jsxFactory: 'testJSX', jsxFragmentFactory: 'testFragment'}}).outputText;
  const ui = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
  const children = node => node && typeof node === 'object' ? node.props?.children || [] : [];
  const nodes = node => node && typeof node === 'object' ? [node, ...children(node).flatMap(nodes)] : [];
  const text = node => typeof node === 'string' || typeof node === 'number' ? String(node) : children(node).map(text).join('');
  const button = (view, label) => {const found = nodes(view.tree).find(node => node.type === 'button' && text(node) === label); assert.ok(found, `Missing button: ${label}`); return found;};
 function renderer(dependencies){
  const frames=new Map();let current,dirty=true,pending=[],renderRoot,props,tree,lateUpdates=0,focuses=0;
  const same=(a,b)=>a&&b&&a.length===b.length&&a.every((value,index)=>Object.is(value,b[index]));
  const runtime={dependencies,
   useState(initial){const frame=current,index=frame.index++;if(!frame.slots[index])frame.slots[index]={value:typeof initial==='function'?initial():initial};const slot=frame.slots[index];return [slot.value,change=>{if(!frame.mounted){lateUpdates++;return}const next=typeof change==='function'?change(slot.value):change;if(!Object.is(slot.value,next)){slot.value=next;dirty=true}}]},
   useRef(initial){const frame=current,index=frame.index++;if(!frame.slots[index])frame.slots[index]={value:{current:initial}};return frame.slots[index].value},
   useMemo(fn,deps){const frame=current,index=frame.index++,previous=frame.slots[index];if(!previous||!same(previous.deps,deps))frame.slots[index]={value:fn(),deps};return frame.slots[index].value},
   useEffect(fn,deps){const frame=current,index=frame.index++,previous=frame.slots[index];if(!previous||!same(previous.deps,deps)){const next={deps,cleanup:previous?.cleanup};frame.slots[index]=next;pending.push(()=>{next.cleanup?.();next.cleanup=fn()})}},
   render(Component,value){return component(Component,value,'root')},
  };
  function component(Component,value,key){let frame=frames.get(key);if(!frame||frame.Component!==Component){if(frame)dispose(frame);frame={Component,slots:[],index:0,mounted:true};frames.set(key,frame)}frame.index=0;frame.seen=true;const parent=current;current=frame;const node=Component(value);current=parent;return resolve(node,key)}
  function resolve(node,key){if(!node||typeof node!=='object')return node;if(typeof node.type==='function')return component(node.type,node.props,key+':'+node.type.name);if(node.props?.ref)node.props.ref.current??={focus(){focuses++}};return {...node,props:{...node.props,children:children(node).map((child,index)=>resolve(child,key+'.'+index))}}}
  function dispose(frame){frame.mounted=false;for(const slot of frame.slots)slot?.cleanup?.()}
  function flush(){let guard=0;while(dirty){assert(++guard<30,'Hook harness render loop');dirty=false;pending=[];for(const frame of frames.values())frame.seen=false;tree=renderRoot(props);for(const [key,frame] of frames)if(!frame.seen){dispose(frame);frames.delete(key)}const effects=pending;pending=[];for(const effect of effects)effect()}return tree}
  renderRoot=ui.createRenderer(runtime);
  return {mount(value){props=value;dirty=true;return flush()},update(value){props={...props,...value};dirty=true;return flush()},flush,
   async settle(){for(let i=0;i<8;i++){await Promise.resolve();if(dirty)flush()}return tree},
   get tree(){return tree},get lateUpdates(){return lateUpdates},get focuses(){return focuses},
   unmount(){for(const frame of frames.values())dispose(frame);frames.clear();dirty=false},
  };
 }

  function mount(env, options = {}) {
    let state = options.state || currentState();
    const restored = [], dependencies = {...files, ...capability, toast: (kind, message) => env.toasts.push({kind, message})};
    for (const name of ['captureCapabilityReviewBackup', 'prepareCapabilityReviewRestore', 'executeCapabilityReviewRestore']) {
      dependencies[name] = (...args) => {env.calls.push({name, args}); return capability[name](...args);};
    }
    const view = renderer(dependencies);
    let activeSettings;
    const host = hostDependencies(state, async () => {
      if (activeSettings.exact && options.failRollback) throw Error('Textbook rollback denied');
      if (!activeSettings.exact && options.failApply) throw Error('Textbook write denied');
    }, {setState: next => {state = next; view.update({state});}});
    const actualRestore = createHostRestore(host);
    const restore = async (incoming, settings) => {
      restored.push({incoming, settings, before: state});
      assert.equal(settings.expected, state, 'The host receives the actual expected state reference');
      activeSettings = settings;
      return actualRestore(incoming, settings);
    };
    view.mount({state, ready: options.ready ?? true, status: 'test-memory', restore});
    return {view, restored, get state() {return state;}};
  }
  async function click(host, env, label) {
    const target = button(host.view, label); assert.notEqual(target.props.disabled, true);
    env.gesture = true; let running;
    try {running = target.props.onClick();} finally {env.gesture = false;}
    await running; await host.view.settle();
  }
  async function open(host) {
    const trigger = nodes(host.view.tree).find(node => node.props?.['aria-label'] === '进度备份与恢复');
    assert.ok(trigger); trigger.props.onClick(); await host.view.settle();
  }
  async function choose(host, file) {
    const input = nodes(host.view.tree).find(node => node.type === 'input' && node.props.type === 'file');
    assert.ok(input); await input.props.onChange({target: {files: [file]}}); await host.view.settle();
  }
  const successes = env => env.toasts.filter(toast => toast.kind === 'success');
  const noWrites = storage => assert.equal(storage.writes.length, 0, 'Preview and export must not write learning storage');
  const captured = await environment(populated(), () => capability.captureCapabilityReviewBackup());
  assert.equal(captured.ok, true, captured.message);
  const completeFile = files.makeProgressFile(incomingState(), new Date(NOW), captured.backup);
  const legacyFile = files.makeProgressFile(incomingState(), new Date(NOW));

  test('synchronous capture reaches the native picker inside its click gesture and writes a real v2 file', async () => {
    await environment(populated(), async env => {
      const host = mount(env); await open(host);
      const target = button(host.view, '选择文件保存位置');
      env.gesture = true; const saving = target.props.onClick();
      assert.equal(env.pickerCalls.length, 1, 'No await may separate the click from the native picker');
      assert.equal(env.pickerCalls[0].gesture, true);
      assert.equal(env.calls[0].name, 'captureCapabilityReviewBackup');
      env.gesture = false; await saving; await host.view.settle();
      assert.equal(env.written.length, 1);
      const envelope = JSON.parse(await env.written[0].text());
      assert.equal(envelope.version, 2); assert.deepEqual(envelope.capability, captured.backup);
      const read = await files.readProgressFile(env.written[0]);
      assert.deepEqual(read.state, host.state); assert.deepEqual(read.capability, captured.backup);
      assert.match(text(host.view.tree), /已写入所选位置/); noWrites(env.storage); host.view.unmount();
    });
  });
  test('choosing a v2 file is a pure preflight, and only confirmation calls the real executor and host restore', async () => {
    await environment(new MemoryStorage([['unrelated-key', 'keep']]), async env => {
      const host = mount(env), before = env.storage.snapshot(); await open(host); await choose(host, completeFile);
      assert.match(text(host.view.tree), /恢复这份学习进度/);
      assert.equal(env.calls.filter(call => call.name === 'prepareCapabilityReviewRestore').length, 1);
      assert.equal(env.calls.filter(call => call.name === 'executeCapabilityReviewRestore').length, 0);
      assert.equal(host.restored.length, 0); assert.deepEqual(env.storage.snapshot(), before); noWrites(env.storage);
      await click(host, env, '确认替换并恢复');
      assert.equal(host.restored.length, 1); assert.equal(host.restored[0].settings.exact, undefined);
      assert.deepEqual(host.state.drafts, incomingState().drafts); assert.ok(validateState(host.state)); assert.equal(successes(env).length, 1);
      assert.deepEqual(env.events, ['english-studio-progress-restored']);
      const saved = capability.captureCapabilityReviewBackup(); assert.equal(saved.ok, true, saved.message);
      assert.deepEqual(saved.backup, captured.backup);
      assert.equal(env.storage.getItem('unrelated-key'), 'keep'); host.view.unmount();
    });
  });
  test('an old v1 file restores textbook state while preserving both capability namespaces byte-for-byte', async () => {
    await environment(populated(), async env => {
      const host = mount(env), before = env.storage.snapshot(); await open(host); await choose(host, legacyFile);
      assert.match(text(host.view.tree), /旧版文件.*保留当前已有记录/); noWrites(env.storage);
      await click(host, env, '确认替换并恢复');
      assert.deepEqual(host.state.drafts, incomingState().drafts); assert.deepEqual(env.storage.snapshot(), before);
      assert.match(successes(env)[0].message, /旧文件不含句子练习与自动复习.*原样保留/); host.view.unmount();
    });
  });
  test('invalid capability payloads stop at preflight without touching either storage or textbook state', async () => {
    await environment(populated(), async env => {
      const host = mount(env), before = env.storage.snapshot(), classic = host.state;
      await open(host); await choose(host, files.makeProgressFile(incomingState(), new Date(NOW), {version: 999}));
      assert.equal(host.restored.length, 0); assert.equal(host.state, classic); assert.deepEqual(env.storage.snapshot(), before);
      assert.equal(successes(env).length, 0); assert.ok(env.toasts.some(toast => toast.kind === 'error'));
      assert.ok(!nodes(host.view.tree).some(node => node.type === 'button' && text(node) === '确认替换并恢复'));
      noWrites(env.storage); host.view.unmount();
    });
  });
  test('undo is labelled as textbook rollback and cannot rewind a newer canonical review receipt', async () => {
    await environment(populated(), async env => {
      const host = mount(env), before = copy(host.state); await open(host); await choose(host, completeFile); await click(host, env, '确认替换并恢复');
      assert.match(text(host.view.tree), /恢复上一次替换前的教材记录/);
      assert.match(text(host.view.tree), /句子练习仍保留较新的作答与复习结果/);
      const taskId = `${review.PLAN_ID}@${plan.plan.dueAt}`;
      const result = await review.createReviewStore({storage: env.storage, locks: env.locks, now: () => NOW}).recordResult({taskId, resultId: taskId + ':result', outcome: 'passed', at: plan.plan.dueAt + 100});
      assert.equal(result.ok, true, result.message);
      const newer = env.storage.getItem(review.STORAGE_KEY);
      await click(host, env, '恢复上一次替换前的教材记录'); await click(host, env, '确认替换并恢复');
      assert.deepEqual(host.state.drafts, before.drafts); assert.equal(env.storage.getItem(review.STORAGE_KEY), newer);
      assert.match(successes(env).at(-1).message, /较新的作答和复习结果会保留/); host.view.unmount();
    });
  });
  test('capability read failure is explicit and still offers a clearly labelled textbook-only v1 export', async () => {
    await environment(populated(), async env => {
      env.storage.failRead = key => key === demo.storageKey;
      const host = mount(env); await click(host, env, '保存进度');
      assert.equal(env.downloads.length, 0); assert.equal(successes(env).length, 0);
      assert.ok(env.toasts.some(toast => toast.kind === 'error' && /保存未完成/.test(toast.message)));
      assert.match(text(host.view.tree), /仅保存教材记录/);
      await click(host, env, '仅保存教材记录');
      assert.equal(env.downloads.length, 1); const envelope = JSON.parse(await env.downloads[0].text());
      assert.equal(envelope.version, 1); assert.equal(Object.hasOwn(envelope, 'capability'), false);
      assert.deepEqual((await files.readProgressFile(env.downloads[0])).state, host.state);
      assert.match(text(host.view.tree), /仅包含教材记录，不含句子练习与自动复习/);
      noWrites(env.storage); host.view.unmount();
    });
  });
  test('a post-preview update is preserved and fails before the host applies any textbook record', async () => {
    await environment(populated(), async env => {
      const host = mount(env), original = host.state; await open(host); await choose(host, completeFile);
      const updated = JSON.stringify(demo.saveDraft(completed, 'Written in another tab after preview.'));
      env.storage.seed(demo.storageKey, updated);
      await click(host, env, '确认替换并恢复');
      assert.equal(host.restored.length, 0); assert.equal(host.state, original);
      assert.equal(env.storage.getItem(demo.storageKey), updated); noWrites(env.storage);
      assert.equal(successes(env).length, 0); assert.deepEqual(env.events, []);
      assert.match(env.toasts.at(-1).message, /恢复未完成/);
      assert.match(text(host.view.tree), /重新核对当前记录/); host.view.unmount();
    });
  });
  test('a real review write failure rolls both stores back and sends exact plus the applied reference to textbook rollback', async () => {
    await environment(new MemoryStorage([['unrelated-key', 'keep']]), async env => {
      const host = mount(env), original = host.state, before = env.storage.snapshot();
      await open(host); await choose(host, completeFile);
      env.storage.failWrite = key => key === review.STORAGE_KEY;
      await click(host, env, '确认替换并恢复');
      assert.equal(host.restored.length, 2);
      const [apply, rollback] = host.restored;
      assert.equal(apply.settings.expected, original); assert.equal(apply.settings.exact, undefined);
      assert.equal(rollback.incoming, original); assert.equal(rollback.settings.exact, true);
      assert.equal(rollback.settings.expected, rollback.before, 'Rollback guards the exact applied State reference');
      assert.notEqual(rollback.settings.expected, original);
      assert.equal(host.state, original); assert.deepEqual(env.storage.snapshot(), before);
      assert.deepEqual(env.locks.requests, [demo.storageKey, review.STORAGE_KEY].sort());
      assert.equal(successes(env).length, 0); assert.deepEqual(env.events, []);
      assert.match(env.toasts.at(-1).message, /恢复未完成/);
      assert.match(text(host.view.tree), /重新核对当前记录/); host.view.unmount();
    });
  });
  test('a rejected textbook write still runs guarded exact rollback without writing either capability namespace', async () => {
    await environment(new MemoryStorage(), async env => {
      const host = mount(env, {failApply: true}), original = host.state;
      await open(host); await choose(host, completeFile); await click(host, env, '确认替换并恢复');
      assert.equal(host.restored.length, 2);
      assert.deepEqual(host.restored[1].settings, {exact: true, expected: original});
      assert.equal(host.state, original); noWrites(env.storage);
      assert.equal(successes(env).length, 0); assert.deepEqual(env.events, []);
      assert.match(env.toasts.at(-1).message, /恢复未完成/); host.view.unmount();
    });
  });
  test('partial store or textbook rollback failures never claim success and expose the actual recovery payload', async () => {
    for (const failure of ['store', 'textbook']) await environment(new MemoryStorage(), async env => {
      const host = mount(env, {failRollback: failure === 'textbook'}), original = copy(host.state);
      await open(host); await choose(host, completeFile);
      env.storage.failWrite = key => key === review.STORAGE_KEY;
      if (failure === 'store') env.storage.failRemove = key => key === demo.storageKey;
      await click(host, env, '确认替换并恢复');
      assert.equal(successes(env).length, 0); assert.deepEqual(env.events, []);
      assert.match(env.toasts.at(-1).message, /恢复未完成/);
      assert.match(text(host.view.tree), /部分记录的回退未能确认.*下载恢复资料/);
      assert.ok(!nodes(host.view.tree).some(node => node.type === 'button' && text(node) === '恢复上一次替换前的教材记录'));
      await click(host, env, '下载恢复资料');
      assert.equal(env.downloads.length, 1);
      const file = env.downloads[0], recovery = JSON.parse(await file.text());
      assert.equal(file.name, 'English-Studio-restore-recovery.json');
      assert.equal(recovery.format, 'english-studio-recovery'); assert.equal(recovery.version, 1);
      assert.deepEqual(recovery.before.state, original);
      assert.equal(recovery.details.status, 'partial-failure');
      assert.deepEqual(recovery.details.recovery.original, {demo: null, review: null});
      assert.ok(recovery.details.recovery.attempted.demo);
      assert.ok(recovery.details.recovery.attempted.review);
      assert.deepEqual(recovery.details.recovery.current, {
        demo: env.storage.getItem(demo.storageKey), review: env.storage.getItem(review.STORAGE_KEY),
      });
      assert.equal(recovery.details.recovery.main, failure === 'textbook' ? 'rollback-failed' : 'rolled-back');
      assert.deepEqual(host.state.drafts, (failure === 'textbook' ? incomingState() : original).drafts);
      host.view.unmount();
    });
  });

  test('the actual host awaits persistence and leaves all State references and setters unchanged on rejection', async () => {
    await environment(new MemoryStorage(), async () => {
      const before = currentState(); let rejectWrite;
      const host = hostDependencies(before, () => new Promise((_resolve, reject) => {rejectWrite = reject;}));
      const restore = createHostRestore(host), saving = restore(incomingState(), {expected: before});
      assert.equal(host.writes.length, 1); assert.equal(host.stateRef.current, before); assert.deepEqual(host.setters, []);
      rejectWrite(Error('IndexedDB write denied'));
      await assert.rejects(saving, /IndexedDB write denied/);
      assert.equal(host.stateRef.current, before); assert.deepEqual(host.setters, []);
    });
  });
  test('the actual host rejects expected-reference conflicts and invalid incoming State before any persistence', async () => {
    await environment(new MemoryStorage(), async () => {
      const before = currentState(), host = hostDependencies(before, async () => {}), restore = createHostRestore(host);
      await assert.rejects(restore(incomingState(), {expected: copy(before)}), /已更新/);
      await assert.rejects(restore({...incomingState(), correct: 1, attempts: 0}, {expected: before}), /内容无效/);
      assert.deepEqual(host.writes, []); assert.deepEqual(host.setters, []); assert.equal(host.stateRef.current, before);
    });
  });
  test('the actual host exact rollback bypasses compatibility merging and restores a prior State without flashcards', async () => {
    await environment(new MemoryStorage(), async () => {
      const legacy = currentState(); assert.equal(legacy.flashcards, undefined);
      const live = flashcards.enrollFlashcard(incomingState(), {word: 'return', meaning: '返回', example: 'Return tomorrow.'}, [{kind: 'personal'}], NOW);
      let merges = 0;
      const host = hostDependencies(live, async () => {}, {prepareFlashcardRestore: (...args) => {merges++; return flashcards.prepareFlashcardRestore(...args);}});
      const restore = createHostRestore(host), ordinary = await restore(legacy, {expected: live});
      assert.equal(merges, 1); assert.equal(Object.keys(ordinary.flashcards.cards).length, 1);
      const exact = await restore(legacy, {exact: true, expected: ordinary});
      assert.equal(merges, 1, 'Exact rollback must not merge new flashcards back into the prior state');
      assert.equal(exact, legacy); assert.equal(host.stateRef.current, legacy); assert.equal(exact.flashcards, undefined);
      assert.equal(host.writes.at(-1), legacy); assert.deepEqual(host.setters.slice(-4), [['state', legacy], ['persisted', legacy], ['error', false], ['blocked', false]]);
    });
  });
  test('the actual legacy-storage host also preserves its in-memory State when persistence throws', async () => {
    await environment(new MemoryStorage(), async env => {
      env.storage.failWrite = () => true;
      const before = currentState(), host = hostDependencies(before, async () => {}, {storageMode: 'legacy'}), restore = createHostRestore(host);
      await assert.rejects(restore(incomingState(), {expected: before}), /write denied/);
      assert.equal(host.stateRef.current, before); assert.deepEqual(host.setters, []); assert.deepEqual(host.writes, []);
    });
  });

  let failures = 0;
  for (const {name, run} of tests) {
    try {await run(); console.log('PASS ' + name);} catch (error) {failures++; console.error('FAIL ' + name + '\n' + error.stack);}
  }
  console.log(`${tests.length - failures}/${tests.length} progress capability UI checks passed (real TSX and canonical adapters; in-memory hooks/storage/locks, not a browser).`);
  if (failures) process.exitCode = 1;
} finally {await rm(temporary, {recursive: true, force: true});}
