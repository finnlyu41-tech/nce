import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';
const root = path.dirname(fileURLToPath(import.meta.url)), cache = new Map();
async function moduleURL(file) {
    if (cache.has(file))
        return cache.get(file);
    let source = stripTypeScriptTypes(await fs.readFile(file, 'utf8'));
    for (const match of [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)]) {
        const child = path.resolve(path.dirname(file), match[1] + (path.extname(match[1]) ? '' : '.ts'));
        const resolved = await moduleURL(child);
        source = source.replaceAll(match[0], `from '${resolved}'`);
    }
    const url = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
    cache.set(file, url);
    return url;
}
const m = await import(await moduleURL(path.join(root, 'model.ts')));
const c = await import(await moduleURL(path.join(root, 'content.ts')));
let count = 0;
const check = (condition, message) => { assert.ok(condition, message); count++; };
const now = Date.now(), date = m.today(now), past = m.today(now - 86400000), earlier = m.today(now - 2 * 86400000);
check(c.nodes.length === 43, 'All 43 map nodes exist');
check(new Set(c.nodes.map(n => n.id)).size === 43, 'Node IDs unique');
for (const node of c.nodes) {
    const url = new URL(c.courseUrl(node), 'https://same-site.example/map/');
    check(url.origin === 'https://same-site.example' && url.pathname === '/' && url.hash.startsWith('#/'), 'Course links stay in the current site classic mode');
}
const seen = new Set();
for (const n of c.nodes) {
    check(n.requires.every(id => seen.has(id)), `${n.id} has topologically ordered prerequisites`);
    seen.add(n.id);
    if (['lesson', 'checkpoint'].includes(n.kind)) {
        for (let round = 0; round < 2; round++) {
            const qs = c.questionsFor(n, round);
            check(qs.length >= 3, `${n.id} has a real assessment`);
            check(m.grade(n, qs.map(q => q.answer), round).every(Boolean), 'Reference answers pass');
            check(!m.grade(n, qs.map(() => ''), round).some(Boolean), 'Empty answers cannot pass');
        }
        check(JSON.stringify(c.questionsFor(n, 0)) !== JSON.stringify(c.questionsFor(n, 1)), `${n.id} offers another question set`);
    }
}
let state = m.emptyProgress();
check(Object.values(m.statusMap(state)).filter(x => x === 'available').length === 1, 'Only first unlocked on fresh start');
check(m.statusMap(state).finish === 'locked', 'Finish never pre-unlocked');
check(m.submitQuiz(state, 'question') === state, 'Direct submission cannot bypass locked prerequisite');
const first = c.nodeById('first');
state.records.first = { ...m.emptyRecord(), answers: ['wrong', 'book', 'pen'] };
state = m.submitQuiz(state, 'first', now);
check(m.statusMap(state).question === 'locked', 'A wrong answer does not unlock');
state.records.first = { ...state.records.first, answers: c.questionsFor(first).map(q => q.answer), assisted: true };
state = m.submitQuiz(state, 'first', now);
check(m.statusMap(state).question === 'locked', 'Hints cannot unlock');
state.records.first = { ...state.records.first, assisted: false };
state = m.submitQuiz(state, 'first', now);
check(m.statusMap(state).question === 'available', 'An independent complete round unlocks next');
check(!m.due(first, state, now), 'No immediate review');
check(m.due(first, state, now + 86400000), 'Next day review appears');
const unchanged = JSON.stringify(state);
m.statusMap(state);
check(JSON.stringify(state) === unchanged, 'Browsing does not mutate records');
const repeated = structuredClone(state);
repeated.records.first.answers = ['wrong', 'wrong', 'wrong'];
let reviews = repeated;
for (let i = 0; i < 65; i++)
    reviews = m.submitQuiz(reviews, 'first', now);
check(m.statusMap(reviews).question === 'available', 'Bounded review history preserves earned unlocks');
check(reviews.records.first.attempts.length === 60, 'Review history stays bounded');
const evidence = (n) => ({ date, material: `New material ${n.id}`, work: '答案与原稿位于个人学习练习记录，本次独立作答并订正。', reviewer: 'Test reviewer', feedback: '检查了任务回应与组织，修正了原因与例子不相符的问题。', criteria: [true, true, true, true], unseen: true, timed: true, correct: '30', total: '40' });
for (const n of c.nodes.filter(n => ['lesson', 'checkpoint'].includes(n.kind) && n.stage !== 'skills')) {
    check(m.statusMap(state)[n.id] !== 'locked', `Foundation ${n.id} follows reachable path`);
    state.records[n.id] = { ...m.emptyRecord(), attempts: [{ at: now, round: 0, answers: c.questionsFor(n).map(q => q.answer), assisted: false }] };
}
for (const lane of c.lanes)
    check(m.statusMap(state)[c.nodes.find(n => n.lane === lane.id).id] === 'available', `Branch ${lane.id} opens independently`);
for (const n of c.nodes.filter(n => n.stage === 'skills')) {
    check(m.statusMap(state)[n.id] === 'available', `${n.id} becomes available`);
    if (n.kind === 'lesson')
        state.records[n.id] = { ...m.emptyRecord(), attempts: [{ at: now, round: 0, answers: c.questionsFor(n).map(q => q.answer), assisted: false }] };
    else {
        const e = evidence(n);
        check(m.evidenceErrors(n, e).length === 0, 'Complete skill evidence passes');
        check(m.evidenceErrors(n, { ...e, criteria: [true, false, true, true] }).length > 0, 'Missing criteria blocks');
        check(m.evidenceErrors(n, { ...e, unseen: false }).length > 0, 'Familiar materials cannot qualify');
        if (['writing', 'speaking'].includes(n.lane))
            check(m.evidenceErrors(n, { ...e, reviewer: '' }).length > 0, 'No reviewer blocks oral/written branch');
        else
            check(m.evidenceErrors(n, { ...e, correct: '20' }).length > 0, 'Below local threshold blocks');
        state.records[n.id] = { ...m.emptyRecord(), evidence: e };
    }
}
check(m.statusMap(state)['mock-one'] === 'available', 'All four branches converge');
const mock = (material, date) => ({ ...evidence({ id: 'mock' }), kind: 'academic', scores: ['6.5', '6.5', '6.5', '6.5'], reference: 'Corresponding paper score table', material, date });
const a = mock('Paper A', past), b = mock('Paper B', date);
check(m.mockErrors(a, 'unconfirmed').length > 0, 'Unconfirmed section targets block finish');
state.minimum = '6';
state.records['mock-one'] = { ...m.emptyRecord(), mock: a };
check(m.statusMap(state)['mock-two'] === 'available', 'First valid mock opens second');
state.records['mock-two'] = { ...m.emptyRecord(), mock: { ...b, material: 'Paper A' } };
check(m.statusMap(state).finish === 'locked', 'Repeated paper blocks');
state.records['mock-two'].mock = { ...b, date: past };
check(m.statusMap(state).finish === 'locked', 'Same day blocks separate verification');
state.records['mock-two'].mock = { ...b, scores: ['6.5', '6.5', '5.5', '6.5'] };
check(m.statusMap(state).finish === 'locked', 'Low section score blocks');
state.records['mock-two'].mock = b;
check(m.statusMap(state).finish === 'passed', 'Two qualified mocks confirm preparation');
check(!m.officialReached(state), 'Mocks never become official results');
state.official = { date, reference: 'Test official score reference', scores: ['6.5', '6.5', '6', '6.5'] };
check(m.officialReached(state), 'Qualifying official result can be recorded');
for (const change of [{ date: '2099-01-01' }, { date: '2026-02-30' }, { reviewer: '' }, { feedback: '' }, { timed: false }, { unseen: false }, { kind: 'general' }, { scores: ['6.2', '7', '7', '7'] }, { scores: ['9', '9', '9', ''] }, { scores: ['9', '9', '9', 'NaN'] }])
    check(m.mockErrors({ ...b, ...change }, '6').length > 0, 'Invalid mock rejected');
check(m.overallBand([6.5, 6.5, 5, 7]) === 6.5, 'Official rounding example');
check(m.overallBand([6.5, 6.5, 5.5, 6]) === 6, 'Round below threshold');
const roundtrip = m.parseProgress(m.exportProgress(state));
check(JSON.stringify(roundtrip.records) === JSON.stringify(state.records), 'All evidence and drafts roundtrip');
state.records['writing-feedback'].evidence.reviewer = '';
check(m.statusMap(state).finish === 'locked', 'Revised invalid source evidence relocks downstream');
state.records['writing-feedback'].evidence.reviewer = 'Test reviewer';
state.minimum = '7';
check(m.statusMap(state).finish === 'locked', 'Tightening minimum re-evaluates results');
state.minimum = '6';
const poisoned = { ...state, records: { ...state.records, constructor: m.emptyRecord() } };
assert.throws(() => m.parseProgress(JSON.stringify(poisoned)));
count++;
for (const invalid of ['{}', 'null', '[]', '{broken', JSON.stringify({ ...state, version: 2 }), JSON.stringify({ ...state, records: { first: { ...m.emptyRecord(), answers: [{}] } } }), JSON.stringify({ ...state, records: { first: { ...m.emptyRecord(), attempts: [{ at: now + 100000, round: 0, answers: ['bag', 'book', 'pen'], assisted: false }] } } })]) {
    assert.throws(() => m.parseProgress(invalid));
    count++;
}
check(m.parseProgress(m.exportProgress(m.emptyProgress())).minimum === 'unconfirmed', 'No implicit institution requirement');
console.log(`${count} checks passed: 43 nodes, dependency graph, independent/hinted checks, four branches, evidence gates, two-mock summit, revision invalidation and safe progress roundtrip.`);
if (process.argv.includes('--fixtures')) {
    const dir = path.join(root, '..', 'work', 'map-verification');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'ready-for-mock.json'), m.exportProgress({ ...state, official: undefined, records: Object.fromEntries(Object.entries(state.records).filter(([id]) => !id.startsWith('mock-'))) }));
    await fs.writeFile(path.join(dir, 'full-test-progress.json'), m.exportProgress(state));
    console.log('Synthetic test fixtures saved only in ignored work/map-verification.');
}
