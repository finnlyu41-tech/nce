import { nodes, nodeById, questionsFor, type MapNode } from './content';
import { overallBand } from '../app/readiness';
export const storageKey = 'wayfinder-ielts-map:v1';
export type QuizProof = {
    at: number;
    round: number;
    answers: string[];
    assisted: boolean;
};
export type Evidence = {
    date: string;
    material: string;
    work: string;
    reviewer: string;
    feedback: string;
    criteria: boolean[];
    unseen: boolean;
    timed: boolean;
    correct: string;
    total: string;
};
export type Mock = Evidence & {
    scores: string[];
    kind: 'academic';
    reference: string;
};
export type NodeRecord = {
    round: number;
    answers: string[];
    assisted: boolean;
    phase: 'learn' | 'challenge';
    attempts: QuizProof[];
    evidence?: Evidence;
    mock?: Mock;
    draft?: Record<string, string | boolean | boolean[] | string[]>;
};
export type Progress = {
    format: 'wayfinder-ielts-map';
    version: 1;
    updatedAt: number;
    records: Record<string, NodeRecord>;
    minimum: string;
    official?: {
        date: string;
        reference: string;
        scores: string[];
    };
};
export const emptyProgress = (): Progress => ({ format: 'wayfinder-ielts-map', version: 1, updatedAt: 0, records: {}, minimum: 'unconfirmed' });
export const emptyRecord = (): NodeRecord => ({ round: 0, answers: [], assisted: false, phase: 'learn', attempts: [] });
export const today = (at = Date.now()) => { const d = new Date(at); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export function validDate(date: string, at = Date.now()) { return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date && date <= today(at); }
export const normalize = (s: string) => s.toLowerCase().trim().replace(/[’‘]/g, "'").replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ');
export function grade(node: MapNode, answers: string[], round: number) { const qs = questionsFor(node, round); return qs.map((q, i) => [q.answer, ...q.accepted || []].some(a => normalize(a) === normalize(answers[i] || ''))); }
export const passedQuiz = (n: MapNode, p: QuizProof) => p.at > 0 && p.at <= Date.now() && !p.assisted && questionsFor(n, p.round).length > 0 && grade(n, p.answers, p.round).every(Boolean);
export function criteriaFor(n: MapNode): string[] {
    const lane = n.lane;
    if (lane === 'writing')
        return ['回应任务，覆盖题目要求', '组织有清楚的推进与衔接', '词汇恰当，评阅问题已修订', '语法与标点问题已修订'];
    if (lane === 'speaking')
        return ['流利与连贯：能持续展开并回应', '词汇：用词清楚，能换种说法', '语法：表达可理解，已修订主要问题', '发音：评阅者能听懂，已重练问题'];
    return ['按题目要求独立完成新材料', '核对答案并标出每题的证据', '解释错误原因并完成订正', '用另一组新题检查同类问题'];
}
export function evidenceErrors(n: MapNode, e: Evidence, at = Date.now()): string[] {
    const errors: string[] = [];
    if (!validDate(e.date, at))
        errors.push('填写真实的完成日期，不能晚于今天。');
    if (e.material.trim().length < 3)
        errors.push('写明使用的材料和题目编号。');
    if (e.work.trim().length < 10)
        errors.push('保留作答、原稿或录音的位置及摘要（至少 10 字）。');
    if (e.feedback.trim().length < 10)
        errors.push('记录具体反馈和修订内容（至少 10 字）。');
    if (e.criteria.length !== 4 || !e.criteria.every(x => x === true))
        errors.push('先完成四项达标条件。');
    if (!e.unseen)
        errors.push('请用未做过的新材料完成检验。');
    if (['writing', 'speaking'].includes(n.lane || '') && !e.reviewer.trim())
        errors.push('口语和写作需要填写评阅者或机构，不能用自查代替。');
    if (['listening', 'reading'].includes(n.lane || '')) {
        const a = Number(e.correct), b = Number(e.total), full = n.id.endsWith('-full');
        if (!e.correct.trim() || !e.total.trim() || !Number.isInteger(a) || !Number.isInteger(b) || b < 8 || b > 40 || a < 0 || a > b)
            errors.push('填写有效的正确题数与总题数（8–40 题）。');
        else if (a / b < .75)
            errors.push('本节点练习门槛为 75%：先订正，再换新材料检验；这不是 IELTS 换分表。');
        if (full && (b !== 40 || !e.timed))
            errors.push('完整听读节点需要 40 题且按正式要求限时完成。');
    }
    if (n.id === 'writing-feedback' && !e.timed)
        errors.push('两篇写作需在 60 分钟内完成。');
    return errors;
}
export function mockErrors(m: Mock, minimum: string, at = Date.now()): string[] {
    const e: string[] = [];
    if (!validDate(m.date, at))
        e.push('完成日期无效或晚于今天。');
    if (m.kind !== 'academic')
        e.push('目标是 Academic，不能使用 General Training 记录。');
    if (m.material.trim().length < 3 || m.reference.trim().length < 3)
        e.push('填写完整试卷名称与听读换分依据。');
    if (!m.unseen || !m.timed)
        e.push('使用没做过的新试卷，并按考试要求限时完成四项。');
    if (!m.reviewer.trim() || m.feedback.trim().length < 10 || m.work.trim().length < 10)
        e.push('保留口写评阅者、具体反馈及原稿／录音的位置。');
    if (m.scores.length !== 4 || m.scores.some(x => !x.trim() || !Number.isFinite(Number(x)) || Number(x) < 0 || Number(x) > 9 || Number(x) * 2 % 1 !== 0))
        e.push('四项分数须为 0–9 的整分或半分。');
    if (!['0', '5.5', '6', '6.5', '7'].includes(minimum))
        e.push('先确认接收机构的单项要求，或明确选择没有单项要求。');
    if ((overallBand(m.scores.map(Number)) ?? 0) < 6.5)
        e.push('本次总分未达到 6.5。保留记录，修补后再提交新结果。');
    if (m.scores.some(x => Number(x) < Number(minimum)))
        e.push('有单项未达到你设定的要求。');
    return e;
}
export function achieved(n: MapNode, state: Progress, at = Date.now()): boolean {
    const r = state.records[n.id];
    if (n.kind === 'finish')
        return isReady(state, at);
    if (!r)
        return false;
    if (n.kind === 'lesson' || n.kind === 'checkpoint')
        return r.attempts.some(p => passedQuiz(n, p));
    if (n.kind === 'task')
        return !!r.evidence && !evidenceErrors(n, r.evidence, at).length;
    if (!r.mock || mockErrors(r.mock, state.minimum, at).length)
        return false;
    if (n.id === 'mock-two') {
        const first = state.records['mock-one']?.mock;
        return !!first && r.mock.date > first.date && normalize(r.mock.material) !== normalize(first.material);
    }
    return true;
}
// Always re-derive prerequisites: a hash URL or imported completion flag grants nothing.
export function statusMap(state: Progress, at = Date.now()) {
    const result: Record<string, 'locked' | 'available' | 'passed'> = {};
    for (const n of nodes) {
        const open = n.requires.every(id => result[id] === 'passed');
        result[n.id] = !open ? 'locked' : achieved(n, state, at) ? 'passed' : 'available';
    }
    return result;
}
export function isReady(state: Progress, at = Date.now()) {
    const a = nodeById('mock-one')!, b = nodeById('mock-two')!;
    return achieved(a, state, at) && achieved(b, state, at);
}
export function officialReached(state: Progress, at = Date.now()) {
    const o = state.official;
    return !!o && validDate(o.date, at) && !!o.reference.trim() && o.scores.length === 4 && o.scores.every(s => s.trim() !== '' && Number.isFinite(Number(s)) && Number(s) >= 0 && Number(s) <= 9 && Number(s) * 2 % 1 === 0) && ['0', '5.5', '6', '6.5', '7'].includes(state.minimum) && o.scores.every(s => Number(s) >= Number(state.minimum)) && (overallBand(o.scores.map(Number)) || 0) >= 6.5;
}
export function due(n: MapNode, state: Progress, at = Date.now()) {
    const attempts = state.records[n.id]?.attempts || [];
    const last = attempts.at(-1);
    return !!last && attempts.some(a => passedQuiz(n, a)) && (!passedQuiz(n, last) || today(last.at) < today(at));
}
export function submitQuiz(state: Progress, id: string, at = Date.now()): Progress {
    const n = nodeById(id);
    if (!n || statusMap(state, at)[id] === 'locked' || !['lesson', 'checkpoint'].includes(n.kind))
        return state;
    const r = state.records[id] || emptyRecord();
    const attempt = { at, round: r.round, answers: r.answers, assisted: r.assisted };
    let attempts = [...r.attempts, attempt].slice(-60);
    const proof = r.attempts.findLast(p => passedQuiz(n, p));
    if (proof && !attempts.some(p => passedQuiz(n, p)))
        attempts = [proof, ...attempts.slice(-59)];
    return { ...state, updatedAt: at, records: { ...state.records, [id]: { ...r, attempts } } };
}
const recordLike = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const text = (x: unknown, max = 10000) => typeof x === 'string' && x.length <= max;
function validEvidence(e: unknown): e is Evidence {
    return recordLike(e) && ['date', 'material', 'work', 'reviewer', 'feedback', 'correct', 'total'].every(k => text(e[k])) && Array.isArray(e.criteria) && e.criteria.length <= 4 && e.criteria.every(x => typeof x === 'boolean') && typeof e.unseen === 'boolean' && typeof e.timed === 'boolean';
}
export function parseProgress(raw: string): Progress {
    if (raw.length > 2000000)
        throw new Error('进度文件过大。');
    const x = JSON.parse(raw);
    if (!recordLike(x) || x.format !== 'wayfinder-ielts-map' || x.version !== 1 || !recordLike(x.records) || !Number.isFinite(x.updatedAt) || !['unconfirmed', '0', '5.5', '6', '6.5', '7'].includes(String(x.minimum)))
        throw new Error('这不是有效的学习地图进度文件。');
    const result = emptyProgress();
    result.minimum = String(x.minimum);
    result.updatedAt = Number(x.updatedAt);
    for (const [id, v] of Object.entries(x.records)) {
        if (!nodeById(id) || !recordLike(v) || !Number.isInteger(v.round) || Number(v.round) < 0 || Number(v.round) > 100000 || !['learn', 'challenge'].includes(String(v.phase)) || typeof v.assisted !== 'boolean' || !Array.isArray(v.answers) || v.answers.length > 20 || v.answers.some(a => !text(a, 1000)) || !Array.isArray(v.attempts) || v.attempts.length > 60)
            throw new Error('学习记录的结构不正确。');
        for (const p of v.attempts)
            if (!recordLike(p) || !Number.isFinite(p.at) || Number(p.at) <= 0 || Number(p.at) > Date.now() || !Number.isInteger(p.round) || Number(p.round) < 0 || !Array.isArray(p.answers) || p.answers.length > 20 || p.answers.some(a => !text(a, 1000)) || typeof p.assisted !== 'boolean')
                throw new Error('检验记录无效。');
        if (v.evidence !== undefined && !validEvidence(v.evidence))
            throw new Error('评阅记录无效。');
        if (v.mock !== undefined) {
            const m = v.mock as Record<string, unknown>;
            if (!recordLike(m) || m.kind !== 'academic' || !text(m.reference) || !Array.isArray(m.scores) || m.scores.length !== 4 || m.scores.some(s => !text(s, 10)) || !validEvidence(m))
                throw new Error('模考记录无效。');
        }
        if (v.draft !== undefined && (!recordLike(v.draft) || Object.keys(v.draft).length > 20 || Object.values(v.draft).some(a => !(text(a) || typeof a === 'boolean' || Array.isArray(a) && a.length <= 4 && a.every(b => typeof b === 'boolean' || text(b, 1000))))))
            throw new Error('草稿无效。');
        result.records[id] = v as unknown as NodeRecord;
    }
    if (x.official !== undefined) {
        const o = x.official;
        if (!recordLike(o) || !text(o.date, 10) || !text(o.reference, 500) || !Array.isArray(o.scores) || o.scores.length !== 4 || o.scores.some(a => !text(a, 10)))
            throw new Error('成绩记录无效。');
        result.official = o as Progress['official'];
    }
    return result;
}
export function exportProgress(s: Progress) { return JSON.stringify({ ...s, updatedAt: Date.now() }, null, 2); }
export { overallBand };
