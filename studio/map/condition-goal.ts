import {questionsFor,type MapNode} from './content';

/** Explain each existing node's own rule; never grant or alter evidence. */
export function conditionGoal(node:MapNode){
 switch(node.kind){
  case 'course':return '完成本章 12 组学习、隔至少 24 小时换题巩固，并提交自己的口头与书面作品及评阅反馈。';
  case 'starter':return '先听懂和认形，通过点击作答完成起步检验。这里不要求先会打英文。';
  case 'unit':return `地图检验：收起提示，独立答对本组 ${questionsFor(node).length} 道检验题；有原声的题需实际播放。连续练习与自己的表达另行记录，不代替地图检验。`;
  case 'lesson':return `在不看提示的情况下，独立完成 ${questionsFor(node).length} 道知识点检验。`;
  case 'checkpoint':return '换一组混合题，全部独立答对，解锁下一段路线。';
  case 'task':return node.mission?.assignment?.check||'按本任务要求完成作品，并保留评阅与修订证据。';
  case 'mock':return '完成整套 Academic 新题，总分至少 6.5，并满足已确认的单项要求。';
  case 'finish':return '两套模考达到准备度参考；正式成绩单确认最终结果。';
  default:return '按这一站列出的检验条件完成实际练习。';
 }
}
