import { nodes, unitNodes, chapters, nodeById, questionsFor, type MapNode } from './content';
import { overallBand } from '../app/readiness';
import {unitById} from './curriculum';
import {validSpeakingRecord,type SpeakingRecord} from './speaking-model';
export const legacyStorageKey = 'wayfinder-ielts-map:v1';
export const storageKey = 'wayfinder-ielts-map:v2';
export const reviewDelay = 24 * 60 * 60 * 1000;
export type QuizProof = {
    at: number;
    round: number;
    answers: string[];
    assisted: boolean;
    heard?: number[];
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
    dimensions?: string[];
    revision?: string;
};
export type Mock = Evidence & {
    scores: string[];
    kind: 'academic';
    reference: string;
};
export type Project = {text:string; recording:string; reviewer:string; feedback:string; criteria:boolean[]; at:number};
export type ExpressionPractice = {step:number;guided:string;recall:string;hinted:boolean;checked:boolean};
export const emptyPractice = ():ExpressionPractice => ({step:0,guided:'',recall:'',hinted:false,checked:false});
export type NodeRecord = {
    startedAt?: number;
    studyStep?: number;
    questionIndex?: number;
    exampleIndex?: number;
    practice?: ExpressionPractice;
    speaking?: SpeakingRecord;
    project?: Project;
    round: number;
    answers: string[];
    assisted: boolean;
    heard?: number[];
    phase: 'learn' | 'challenge';
    attempts: QuizProof[];
    // Latest answer or hint exposure, including an unsubmitted round.
    quizHelpAt?: number;
    evidence?: Evidence;
    mock?: Mock;
    draft?: Record<string, string | number | boolean | boolean[] | string[]>;
};
export type Progress = {
    format: 'wayfinder-ielts-map';
    version: 2;
    updatedAt: number;
    records: Record<string, NodeRecord>;
    minimum: string;
    access?: { all: boolean; nodes: string[] };
    lastNode?: string;
    official?: {
        date: string;
        reference: string;
        scores: string[];
    };
};
export const emptyProgress = (): Progress => ({ format: 'wayfinder-ielts-map', version: 2, updatedAt: 0, records: {}, minimum: 'unconfirmed' });
export const emptyRecord = (): NodeRecord => ({ round: 0, answers: [], assisted: false, phase: 'learn', attempts: [] });
// Late recording callbacks merge into the latest text, including edits made while recording.
export function updateDraft(state:Progress,id:string,changes:NonNullable<NodeRecord['draft']>,defaults:NonNullable<NodeRecord['draft']>={}):Progress {
    const record=state.records[id]||emptyRecord();
    return {...state,records:{...state.records,[id]:{...record,draft:{...defaults,...record.evidence,...record.mock,...record.project,...record.draft,...changes}}}};
}
export const today = (at = Date.now()) => { const d = new Date(at); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export function validDate(date: string, at = Date.now()) { return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date && date <= today(at); }
export const normalize = (s: string) => s.toLowerCase().trim().replace(/[’‘]/g, "'").replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').replace(/\bcan't\b/g,'cannot').replace(/\bwon't\b/g,'will not').replace(/\b(\w+)n't\b/g,'$1 not').replace(/\bi'm\b/g,'i am').replace(/\b(\w+)'re\b/g,'$1 are').replace(/\b(\w+)'ve\b/g,'$1 have').replace(/\b(\w+)'ll\b/g,'$1 will');
export function grade(node: MapNode, answers: string[], round: number) { const qs = questionsFor(node, round); return qs.map((q, i) => [q.answer, ...q.accepted || []].flatMap(a=>a.split(/\s+\/\s+/)).some(a => normalize(a) === normalize(answers[i] || ''))); }
export const passedQuiz = (n: MapNode, p: QuizProof, at=Date.now()) => Number.isFinite(p.at) && p.at > 0 && p.at <= at && Number.isInteger(p.round) && p.round >= 0 && p.assisted === false && questionsFor(n, p.round).length > 0 && questionsFor(n,p.round).every((q,i)=>!q.clip || p.heard?.includes(i)) && grade(n, p.answers, p.round).every(Boolean);
const questionIdentity=(n:MapNode,p:QuizProof)=>JSON.stringify(questionsFor(n,p.round).map(q=>[q.prompt,q.answer,q.clip?.book,q.clip?.lesson,q.clip?.start]));
const reviewInterval=(passes:number)=>(passes>=4?21:passes>=2?7:1)*reviewDelay;
// Count independent reviews that were actually due. Raw attempts remain intact.
function reviewProofs(n:MapNode,state:Progress,at:number) {
    const record=state.records[n.id], passes:QuizProof[]=[];
    let previousAt=0,repairAt:number|undefined;
    for(const proof of record?.attempts||[]) {
        const validTime=Number.isFinite(proof.at)&&proof.at>0&&proof.at<=at&&proof.at>=previousAt;
        if(Number.isFinite(proof.at))previousAt=Math.max(previousAt,proof.at);
        if(!validTime||!passedQuiz(n,proof,at)) {
            passes.length=0;repairAt=validTime?proof.at:at;continue;
        }
        if(record?.quizHelpAt!==undefined&&proof.at<=record.quizHelpAt)continue;
        const prior=passes.at(-1);
        if(!prior||proof.at-prior.at>=reviewInterval(passes.length)&&questionIdentity(n,proof)!==questionIdentity(n,prior))passes.push(proof);
    }
    if(record?.quizHelpAt!==undefined&&(!Number.isFinite(record.quizHelpAt)||record.quizHelpAt>at||!passes.length)) {
        passes.length=0;repairAt=Number.isFinite(record.quizHelpAt)?Math.min(record.quizHelpAt,at):at;
    }
    // Legacy v2 cannot date unsubmitted help. Only an explicit restart dates that boundary.
    if(record?.assisted&&record.attempts.at(-1)?.round!==record.round) {
        passes.length=0;repairAt=at;
    }
    return {passes,repairAt};
}
export function stable(n:MapNode,state:Progress,at=Date.now()) {
    return reviewProofs(n,state,at).passes.length>=2;
}
// This validates the declared source only; it cannot independently verify a reviewer.
export function externalReviewer(source:string):boolean {
    const key=source.normalize('NFKC').trim().toLowerCase().replace(/[\s\p{P}\p{S}]+/gu,'');
    if(!key||/^(自评|自己|本人|自我评估|自我评价|自我评阅|自己评阅|self|myself|selfassessment|selfreview|selfevaluation|selfassessed|selfrated)$/.test(key))return false;
    return !/^(?:ai(?:chatgpt|claude|gemini|deepseek)?|人工智能|chatgpt(?:\d\w*)?|gpt(?:\d\w*)?|claude(?:\d\w*)?|gemini(?:\d\w*)?|deepseek)(?:评分|评阅|反馈|老师|评估|助手|ai|review|reviewer|assessment|feedback|assistant|teacher)?$/.test(key);
}
export function projectErrors(n:MapNode,p:Project,at=Date.now()) {
    const errors:string[]=[];
    const words=p.text.trim().match(/[a-z]+(?:['’-][a-z]+)*/gi)||[];
    const minimum=n.chapter!<6?Number(chapters[n.chapter!][3])*3:Number(chapters[n.chapter!][3]);
    if(words.length<minimum)errors.push(`先写出自己的表达（本章至少 ${minimum} 个英文单词，任务要求见上方）。`);
    if(p.recording.trim().length<3)errors.push('保留录音，填写录音文件名或保存位置。');
    if(!externalReviewer(p.reviewer))errors.push('请一位能判断本章表达的老师或伙伴听读作品，填写外部评阅者；自评或 AI 不能代替外评。');
    if(p.feedback.trim().length<20)errors.push('填写具体反馈和订正，至少 20 字。');
    if(p.criteria.length!==4||!p.criteria.every(x=>x===true))errors.push('完成四项作品检查。');
    if(!Number.isFinite(p.at)||p.at<=0||p.at>at)errors.push('作品记录时间无效。');
    return errors;
}
export const chapterProgress=(n:MapNode,s:Progress,at=Date.now())=>({learned:(n.members||[]).filter(id=>achieved(nodeById(id)!,s,at)).length,stable:(n.members||[]).filter(id=>stable(nodeById(id)!,s,at)).length,total:n.members?.length||0});
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
    if (['writing', 'speaking'].includes(n.lane || '') && !externalReviewer(e.reviewer))
        errors.push('口语和写作需要填写外部评阅者或机构，自评或 AI 不能代替外评。');
    if (['listening', 'reading'].includes(n.lane || '')) {
        const a = Number(e.correct), b = Number(e.total), full = n.id.endsWith('-full');
        if (!e.correct.trim() || !e.total.trim() || !Number.isInteger(a) || !Number.isInteger(b) || b < 8 || b > 40 || a < 0 || a > b)
            errors.push('填写有效的正确题数与总题数（8–40 题）。');
        else if (a / b < .75)
            errors.push('本节点练习门槛为 75%：先订正，再换新材料检验；这不是 IELTS 换分表。');
        if (full && (b !== 40 || !e.timed))
            errors.push('完整听读节点需要 40 题且按正式要求限时完成。');
    }
    if (['writing','speaking'].includes(n.lane||'') && (!e.dimensions || e.dimensions.length!==4 || e.dimensions.some(d=>d.trim().length<10))) errors.push('请保留四项评分维度各自的具体反馈（每项至少 10 字）。');
    if (!e.revision || e.revision.trim().length<10) errors.push('写明修订后的新题编号、复验结果和仍需修补的地方。');
    if(n.lane==='writing') {const words=e.work.match(/[a-z]+(?:['’-][a-z]+)*/gi)||[];const minimum=n.id==='writing-task-two'?250:n.id==='writing-task-one'?150:400;if(words.length<minimum)errors.push(`请在作答区保留实际英文原稿，本节点至少 ${minimum} 词；字数只检查任务完整性，不代表得分。`);}
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
    if (!externalReviewer(m.reviewer))
        e.push('填写口写外部评阅者或机构，自评或 AI 不能代替外评。');
    if (m.feedback.trim().length < 10 || m.work.trim().length < 10)
        e.push('保留具体反馈及原稿／录音的位置。');
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
    if (n.kind === 'course') return !!r.project && !projectErrors(n,r.project,at).length && (n.members||[]).every(id=>stable(nodeById(id)!,state,at));
    if (['lesson','checkpoint','starter','unit'].includes(n.kind))
        return r.attempts.some(p => passedQuiz(n, p,at));
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
// Access is a learner choice; only actual assessment evidence grants completion.
export function manuallyUnlocked(n:MapNode,state:Progress) {
    return !!state.access?.all || !!state.access?.nodes.includes(n.id) || !!n.parent && !!state.access?.nodes.includes(n.parent);
}
export function unlockNode(state:Progress,id:string):Progress {
    if(!nodeById(id)) return state;
    return {...state,access:{all:state.access?.all||false,nodes:[...new Set([...(state.access?.nodes||[]),id])]}};
}
export function startNode(state:Progress,id:string,at=Date.now()):Progress {
    if(!nodeById(id)||statusMap(state,at)[id]==='locked')return state;
    const record=state.records[id]||emptyRecord();
    return {...state,lastNode:id,records:{...state.records,[id]:{...record,startedAt:record.startedAt||at}}};
}
export function learningLabel(n:MapNode,state:Progress) {
    if(achieved(n,state))return n.kind==='unit' ? stable(n,state)?'已完成 · 已巩固':'已学 · 待巩固' : n.kind==='finish'?'模考准备度已达标':'已完成学习';
    const r=state.records[n.id];
    return r && (r.startedAt||r.attempts.length||r.draft||r.evidence||r.mock||r.project||r.answers.length) ? '学习中 · 尚未完成':'尚未学习';
}
export function noteQuizHelp(state:Progress,id:string,at=Date.now()):Progress {
    const node=nodeById(id);
    if(!node||statusMap(state,at)[id]==='locked'||!['lesson','checkpoint','starter','unit'].includes(node.kind)||!Number.isFinite(at)||at<=0)return state;
    const record=state.records[id]||emptyRecord(),checked=record.attempts.at(-1)?.round===record.round;
    return {...state,records:{...state.records,[id]:{...record,quizHelpAt:Math.max(record.quizHelpAt||0,at),assisted:record.assisted||!checked}}};
}
export function changeStudyStep(state:Progress,id:string,step:number,at=Date.now()):Progress {
    if(!Number.isInteger(step)||step<0||step>3||!nodeById(id)||statusMap(state,at)[id]==='locked')return state;
    const record=state.records[id]||emptyRecord();
    const next=step!==3&&record.phase==='challenge'?noteQuizHelp(state,id,at):state;
    return {...next,records:{...next.records,[id]:{...(next.records[id]||record),phase:step===3?'challenge':'learn',studyStep:step===3?record.studyStep:step}}};
}
export function restartQuiz(state:Progress,id:string,at=Date.now()):Progress {
    if(!nodeById(id)||statusMap(state,at)[id]==='locked'||!Number.isFinite(at)||at<=0)return state;
    const record=state.records[id]||emptyRecord();
    const legacyHelp=record.assisted&&record.attempts.at(-1)?.round!==record.round&&record.quizHelpAt===undefined;
    return {...state,records:{...state.records,[id]:{...record,...legacyHelp?{quizHelpAt:at}:{},phase:'challenge',round:record.round+1,answers:[],heard:[],assisted:false,questionIndex:0}}};
}
export function continueNode(state:Progress,at=Date.now()) {
    const status=statusMap(state,at),last=state.lastNode?nodeById(state.lastNode):undefined;
    if(last&&status[last.id]!=='locked'&&(!achieved(last,state,at)||due(last,state,at)))return last;
    if(last){const next=[...nodes,...unitNodes].find(n=>n.requires.includes(last.id)&&status[n.id]==='available');if(next)return next;}
    if(last?.parent){const siblings=(nodeById(last.parent)?.members||[]).map(id=>nodeById(id)!);const next=siblings.find(n=>due(n,state,at))||siblings.find(n=>status[n.id]==='available');if(next)return next;}
    return nodes.find(n=>due(n,state,at)&&status[n.id]!=='locked')||nodes.find(n=>status[n.id]==='available')||nodeById('finish')!;
}
export function statusMap(state: Progress, at = Date.now()) {
    const result: Record<string, 'locked' | 'available' | 'passed'> = {};
    for (const n of nodes) {
        const open = manuallyUnlocked(n,state) || n.requires.every(id => result[id] === 'passed');
        result[n.id] = achieved(n, state, at) ? 'passed' : open ? 'available' : 'locked';
        if(n.kind==='course') for(const id of n.members||[]) { const u=nodeById(id)!; const unitOpen=manuallyUnlocked(u,state)||(open&&u.requires.every(p=>result[p]==='passed')); result[id]=achieved(u,state,at)?'passed':unitOpen?'available':'locked'; }
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
export function due(n: MapNode, state: Progress, at = Date.now()): boolean {
    if(n.kind==='course')return (n.members||[]).some(id=>due(nodeById(id)!,state,at));
    const time=nextReviewAt(n,state,at);
    return time!==undefined&&time<=at;
}
export function nextReviewAt(n:MapNode,state:Progress,at=Date.now()) {
    const attempts=state.records[n.id]?.attempts||[];
    if(!attempts.some(p=>passedQuiz(n,p,at)))return undefined;
    const {passes,repairAt}=reviewProofs(n,state,at),last=passes.at(-1);
    return last?last.at+reviewInterval(passes.length):repairAt;
}
export function submitQuiz(state: Progress, id: string, at = Date.now()): Progress {
    const n = nodeById(id);
    if (!n || statusMap(state, at)[id] === 'locked' || !['lesson', 'checkpoint', 'starter', 'unit'].includes(n.kind))
        return state;
    const r = state.records[id] || emptyRecord();
    const attempt = { at, round: r.round, answers: [...r.answers], assisted: r.assisted, heard: [...(r.heard||[])] };
    // Preserve failures and help barriers as well as passes; export keeps the raw history.
    const attempts = [...r.attempts, attempt];
    return { ...state, updatedAt: at, records: { ...state.records, [id]: { ...r, attempts } } };
}
const recordLike = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const text = (x: unknown, max = 10000) => typeof x === 'string' && x.length <= max;
function validEvidence(e: unknown): e is Evidence {
    return recordLike(e) && ['date', 'material', 'work', 'reviewer', 'feedback', 'correct', 'total'].every(k => text(e[k])) && Array.isArray(e.criteria) && e.criteria.length <= 4 && e.criteria.every(x => typeof x === 'boolean') && typeof e.unseen === 'boolean' && typeof e.timed === 'boolean' && (e.dimensions===undefined||Array.isArray(e.dimensions)&&e.dimensions.length===4&&e.dimensions.every(d=>text(d))) && (e.revision===undefined||text(e.revision));
}
export function parseProgress(raw: string): Progress {
    if (raw.length > 6000000)
        throw new Error('进度文件过大。');
    const x = JSON.parse(raw);
    if (!recordLike(x) || x.format !== 'wayfinder-ielts-map' || x.version !== 2 || !recordLike(x.records) || !Number.isFinite(x.updatedAt) || !['unconfirmed', '0', '5.5', '6', '6.5', '7'].includes(String(x.minimum)))
        throw new Error(x?.version===1?'这是旧版地图备份。请保留原文件；旧的小测记录不能换算成新版课程掌握。':'这不是有效的学习地图进度文件。');
    const result = emptyProgress();
    result.minimum = String(x.minimum);
    result.updatedAt = Number(x.updatedAt);
    if(x.access!==undefined){
        const a=x.access;
        if(!recordLike(a)||typeof a.all!=='boolean'||!Array.isArray(a.nodes)||a.nodes.length>200||a.nodes.some(id=>typeof id!=='string'||!nodeById(id))||new Set(a.nodes).size!==a.nodes.length)throw new Error('解锁设置无效。');
        result.access={all:a.all,nodes:[...a.nodes] as string[]};
    }
    if(x.lastNode!==undefined){if(typeof x.lastNode!=='string'||!nodeById(x.lastNode))throw new Error('学习位置无效。');result.lastNode=x.lastNode;}
    for (const [id, v] of Object.entries(x.records)) {
        if (!nodeById(id) || !recordLike(v) || !Number.isInteger(v.round) || Number(v.round) < 0 || Number(v.round) > 100000 || !['learn', 'challenge'].includes(String(v.phase)) || typeof v.assisted !== 'boolean' || !Array.isArray(v.answers) || v.answers.length > 20 || v.answers.some(a => !text(a, 1000)) || !Array.isArray(v.attempts) || v.attempts.length > 100000)
            throw new Error('学习记录的结构不正确。');
        if(v.quizHelpAt!==undefined&&(!Number.isFinite(v.quizHelpAt)||Number(v.quizHelpAt)<=0||Number(v.quizHelpAt)>Date.now()))throw new Error('答案或提示查看时间无效。');
        if(v.startedAt!==undefined&&(!Number.isFinite(v.startedAt)||Number(v.startedAt)<=0||Number(v.startedAt)>Date.now()))throw new Error('学习开始时间无效。');
        if(v.studyStep!==undefined&&(!Number.isInteger(v.studyStep)||Number(v.studyStep)<0||Number(v.studyStep)>2))throw new Error('学习步骤无效。');
        if(v.exampleIndex!==undefined&&(!Number.isInteger(v.exampleIndex)||Number(v.exampleIndex)<0||Number(v.exampleIndex)>10))throw new Error('示范位置无效。');
        if(v.questionIndex!==undefined&&(!Number.isInteger(v.questionIndex)||Number(v.questionIndex)<0||Number(v.questionIndex)>19))throw new Error('答题位置无效。');
        if(v.practice!==undefined){const p=v.practice;if(nodeById(id)!.kind!=='unit'||!recordLike(p)||!Number.isInteger(p.step)||Number(p.step)<0||Number(p.step)>2||!text(p.guided,1000)||!text(p.recall,1000)||typeof p.hinted!=='boolean'||typeof p.checked!=='boolean')throw new Error('表达跟练记录无效。');}
        if(v.speaking!==undefined){const unit=unitById(id);if(!unit||!validSpeakingRecord(v.speaking,unit))throw new Error('逐句跟读记录无效或教材版本不符。');}
        for (const p of v.attempts)
            if (!recordLike(p) || !Number.isFinite(p.at) || Number(p.at) <= 0 || Number(p.at) > Date.now() || !Number.isInteger(p.round) || Number(p.round) < 0 || Number(p.round)>100000 || !Array.isArray(p.answers) || p.answers.length > 20 || p.answers.some(a => !text(a, 1000)) || typeof p.assisted !== 'boolean')
                throw new Error('检验记录无效。');
        for(const p of [v, ...v.attempts] as Record<string,unknown>[]) if(p.heard!==undefined && (!Array.isArray(p.heard)||p.heard.length>20||p.heard.some(i=>!Number.isInteger(i)||Number(i)<0||Number(i)>19))) throw new Error('听力记录无效。');
        if(v.project!==undefined) {const p=v.project;if(!recordLike(p)||!['text','recording','reviewer','feedback'].every(k=>text(p[k]))||!Array.isArray(p.criteria)||p.criteria.length!==4||p.criteria.some(x=>typeof x!=='boolean')||!Number.isFinite(p.at)||Number(p.at)<=0||Number(p.at)>Date.now())throw new Error('作品记录无效。');}
        if (v.evidence !== undefined && !validEvidence(v.evidence))
            throw new Error('评阅记录无效。');
        if (v.mock !== undefined) {
            const m = v.mock as Record<string, unknown>;
            if (!recordLike(m) || m.kind !== 'academic' || !text(m.reference) || !Array.isArray(m.scores) || m.scores.length !== 4 || m.scores.some(s => !text(s, 10)) || !validEvidence(m))
                throw new Error('模考记录无效。');
        }
        if(v.draft!==undefined){
            if(!recordLike(v.draft)||Object.keys(v.draft).length>20)throw new Error('草稿无效。');
            const kind=nodeById(id)!.kind;
            const strings=kind==='unit'?['note']:kind==='course'?['text','recording','reviewer','feedback']:['date','material','work','reviewer','feedback','correct','total','kind','reference','revision'];
            for(const [key,value] of Object.entries(v.draft)){
                const valid=strings.includes(key)?text(value):key==='criteria'&&kind!=='unit'?Array.isArray(value)&&value.length===4&&value.every(x=>typeof x==='boolean'):['scores','dimensions'].includes(key)&&['task','mock'].includes(kind)?Array.isArray(value)&&value.length===4&&value.every(x=>text(x,key==='scores'?10:2000)):['unseen','timed'].includes(key)&&['task','mock'].includes(kind)?typeof value==='boolean':key==='at'&&kind==='course'?typeof value==='number'&&Number.isFinite(value)&&value>0:false;
                if(!valid)throw new Error('草稿字段不正确。');
            }
        }
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
