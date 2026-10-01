import { type JourneyMission } from '../app/ielts-journey-content';
import { blueprintResources, blueprintNodes } from '../app/ielts-blueprint';
import {units, chapters, unitById, unitQuestions, starters, starterQuestions, sourceLabel, type MapQuestion, type StarterBank} from './curriculum';
export {units, chapters, unitById, starters, sourceLabel} from './curriculum';
declare const __STUDIO_CLASSIC_URL__: string;
export const originalSite = typeof __STUDIO_CLASSIC_URL__ === 'string' ? __STUDIO_CLASSIC_URL__ : '/';
export const resources = blueprintResources;
export type Stage = 'starter' | 'foundation' | 'bridge' | 'skills' | 'summit';
export type MapNode = {
    id: string;
    title: string;
    subtitle: string;
    kind: 'lesson' | 'checkpoint' | 'task' | 'mock' | 'finish' | 'course' | 'unit' | 'starter';
    unitId?: string;
    chapter?: number;
    project?: string;
    parent?: string;
    stage: Stage;
    lane?: string;
    requires: string[];
    mission?: JourneyMission;
    members?: string[];
    minutes: number;
};
export const stages: {
    id: Stage;
    title: string;
    description: string;
    eyebrow: string;
}[] = [
    { id: 'starter', title: '零基础，也能开始', description: '中文带路：先听、认形、模仿，再进入课文。', eyebrow: '01 · FIRST WORDS' },
    { id: 'foundation', title: '新概念一册 · 生活的语言', description: '72 组课文与配套练习，按六个章节逐步展开。', eyebrow: '02 · EVERYDAY ENGLISH' },
    { id: 'bridge', title: '新概念二册 · 连成自己的话', description: '96 课、八个章节，把听读变成叙述与表达。', eyebrow: '03 · CONNECT IDEAS' },
    { id: 'skills', title: '四条路，同一个目标', description: '听、读、写、说分别推进；四条分支通过后汇合。', eyebrow: '04 · BUILD YOUR SKILLS' },
    { id: 'summit', title: '让完整表现，抵达 6.5', description: '用两套新试卷验证准备度，再记录正式成绩。', eyebrow: '05 · THE SUMMIT' },
];
export const lanes = [{ id: 'listening', title: '听力', en: 'LISTENING', color: '#27857e' }, { id: 'reading', title: '阅读', en: 'READING', color: '#597cc3' }, { id: 'writing', title: '写作', en: 'WRITING', color: '#b47c46' }, { id: 'speaking', title: '口语', en: 'SPEAKING', color: '#916da8' }];
export const nodes: MapNode[] = [];
let previous: string[] = [];
for (const s of starters) {
    nodes.push({id:s.id,title:s.title,subtitle:s.subtitle,kind:'starter',stage:'starter',requires:previous,minutes:10});
    previous=[s.id];
}
export const unitNodes: MapNode[] = [];
for (let i=0;i<chapters.length;i++) {
    const book=i<6?'NCE1':'NCE2';
    const members=units.filter(u=>u.book===book).slice((i<6?i:i-6)*12,(i<6?i+1:i-5)*12);
    const id=`chapter-${i+1}`;
    const chapter: MapNode={id,title:chapters[i][0],subtitle:chapters[i][1],kind:'course',stage:i<6?'foundation':'bridge',requires:previous,minutes:0,chapter:i,project:chapters[i][2],members:members.map(u=>u.id)};
    nodes.push(chapter);
    members.forEach((u,index)=>unitNodes.push({id:u.id,title:u.title,subtitle:sourceLabel(u),kind:'unit',stage:chapter.stage,requires:index?[members[index-1].id]:[],parent:id,unitId:u.id,minutes:book==='NCE1'?25:40}));
    previous=[id];
}
const exits: string[] = [];
for (const lane of lanes) {
    let requires = previous;
    for (const task of blueprintNodes.find(n=>n.id===lane.id)!.tasks) {
        const id=`${lane.id}-${task.id}`;
        const mission:JourneyMission={id,stage:lane.id as JourneyMission['stage'],title:task.title,outcome:task.check,minutes:lane.id==='writing'?60:30,assignment:task};
        nodes.push({id,title:task.title,subtitle:task.check,kind:'task',stage:'skills',lane:lane.id,requires,mission,minutes:mission.minutes});
        requires=[id];
    }
    exits.push(...requires);
}
nodes.push({ id: 'mock-one', title: '第一套完整模考', subtitle: '四项放到一起，找到仍需修补的地方。', kind: 'mock', stage: 'summit', requires: exits, minutes: 180 }, { id: 'mock-two', title: '第二套新题复验', subtitle: '另一套没做过的 Academic 完整试卷。', kind: 'mock', stage: 'summit', requires: ['mock-one'], minutes: 180 }, { id: 'finish', title: 'IELTS 6.5', subtitle: '准备就绪，再用正式成绩确认抵达。', kind: 'finish', stage: 'summit', requires: ['mock-two'], minutes: 0 });
export const nodeById = (id: string) => nodes.find(n => n.id === id) || unitNodes.find(n=>n.id===id);
export function questionsFor(node: MapNode, round = 0, bank?:StarterBank): MapQuestion[] {
    if (node.kind === 'unit') return unitQuestions(unitById(node.id)!, round);
    if (node.kind === 'starter') return starterQuestions(node.id, round, bank);
    return [];
}
export function courseUrl(node: MapNode) {
    const u=unitById(node.id) || (node.members?.[0] ? unitById(node.members[0]):undefined);
    if(u) return `${originalSite}#/nce/${u.book}/${u.lesson}?tab=grammar`;
    const c = node.mission?.course;
    if (c)
        return `${originalSite}#/nce/${c.book}/${c.lesson}?tab=grammar&goal=${c.goal}`;
    const c2 = node.mission?.assignment?.course?.route;
    if (c2)
        return `${originalSite}#/${c2.view}${c2.book ? `/${c2.book}/${c2.lesson || 1}` : ''}?${new URLSearchParams(Object.entries({ tab: c2.tab, task: c2.task }).filter(([, v]) => v) as [
            string,
            string
        ][]).toString()}`;
    return `${originalSite}#/nce/NCE1/1?tab=listen`;
}
