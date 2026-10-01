import {createReviewStore, getDueTasks, openPractice, STORAGE_KEY} from '../public/demos/yesterday/review-adapter.mjs';
import type {PracticeTask} from './today-practice';

export const capabilityReviewStorageKey = STORAGE_KEY;
export type CapabilityPractice = {tasks: PracticeTask[]; error: string};

/** Read the demo's canonical schedule. The learning home never creates a plan or result. */
export async function readCapabilityPractice(now: number, online = true, storage?: Pick<Storage, 'getItem' | 'setItem'>): Promise<CapabilityPractice> {
  if (!online) return {tasks: [], error: ''};
  try {
    const store = createReviewStore({now: () => now, ...(storage === undefined ? {} : {storage})});
    const result = await store.read();
    if (!result.ok || !('snapshot' in result)) throw Error('Review storage could not be read.');
    const tasks: PracticeTask[] = getDueTasks(result.snapshot, now).map(task => ({
      id: task.taskId,
      title: '回想昨天发生的事',
      reason: '上次的句子练习已到回想时间，先用三道小题检验。',
      method: '从已保存的位置继续；先自己回答，再看依据。',
      evidence: '保存首答、提示和下次复习时间；同题复做会标明，不折算为课程掌握或雅思分数。',
      href: openPractice(task), returnHref: '/map/', priority: 2, at: task.dueAt, kind: 'review',
    }));
    return {tasks, error: ''};
  } catch {
    return {tasks: [], error: '「昨天的事」复习计划暂时无法读取，原记录保留。其他学习仍可继续。'};
  }
}

export function includeCapabilityPractice(tasks: PracticeTask[], extra: PracticeTask[]): PracticeTask[] {
  const unique = new Map(tasks.map(task => [task.id, task]));
  for (const task of extra) if (!unique.has(task.id)) unique.set(task.id, task);
  return [...unique.values()].sort((a, b) => a.priority - b.priority || a.at - b.at || a.id.localeCompare(b.id));
}
