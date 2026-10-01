import { codeEvidence } from './evidence';
import { learningStages, type CoverageSlot, type LearningStage, type Requirement, type SourceRef, type Variant } from './types';
export const both: readonly Variant[] = ['academic','general-training'];
export const academic: readonly Variant[] = ['academic'];
export const general: readonly Variant[] = ['general-training'];
export const sourceRef = (sourceId: string, locator: string, variants: readonly Variant[], claim: SourceRef['claim'] = 'format'): SourceRef => ({ sourceId, locator, variants, claim });
export type Seed = Omit<Requirement, 'stages' | 'priority' | 'prerequisiteConcepts' | 'errorTags'> & {
  priority?: Requirement['priority'];
  plan: Record<LearningStage, string>;
  minimum?: Partial<Record<LearningStage, number>>;
  prerequisiteConcepts?: readonly string[];
  errorTags?: readonly string[];
};
const stageUnit = (stage: LearningStage, kind: Requirement['kind']): CoverageSlot['materials']['unit'] => stage === 'model' ? 'models' : stage === 'explain' ? 'explanations' : stage==='feedback'&&kind==='question-type'?'items':['guided','feedback','review'].includes(stage) ? 'workflows' : kind === 'question-type' ? 'items' : 'prompts';

function inventory(ids: string[], stage: LearningStage, seed: Seed): CoverageSlot['materials'] {
  const refs = codeEvidence.filter(e => ids.includes(e.id));
  const local = refs.filter(e => e.scope === 'local-practice');
  const promptAssets = [...new Set(local.flatMap(e => e.artifactIds || []).filter(id=>/^ielts-[lrws]\d+$/.test(id)))];
  const coachModels = local.some(e=>e.id==='s-coach') ? (seed.id==='S-P1'?['speaking-model-1']:seed.id==='S-P2'?['speaking-model-2']:seed.id==='S-P3'?['speaking-model-3']:['speaking-model-1','speaking-model-2','speaking-model-3']) : [];
  const assets = stage==='model' ? [...promptAssets.filter(id=>id.startsWith('ielts-w')).map(id=>`${id}.sample`),...coachModels] : promptAssets;
  const authoredCount = stage === 'explain' ? local.length ? 1 : 0
    : stage === 'model' ? assets.length
    : stage === 'guided' ? local.some(e => e.id === 's-coach') ? 1 : 0
    : stage==='feedback'&&seed.kind==='question-type'?assets.length : ['feedback','review'].includes(stage) ? local.length ? 1 : 0 : assets.length;
  return { assetIds: assets, unit: stageUnit(stage, seed.kind), authoredCount, qaVerifiedCount: authoredCount ? null : 0, distinctSets: null, verifiedPerformanceAudioModels:0,
    note: (stage==='model'&&seed.skill==='speaking'?'口语模型量仅为文本组织骨架/设备TTS；有效语流/发音表现录音已核实量=0。 ':'')+'模型.sample与题目ID分开；工作流计1不代表反馈已评阅。基础桥接/外部交接不加专门素材量。鲜题集合与QA量未知，不能推断学习效果。' };
}

/** A plan is not an implemented lesson. Existing support earns at most partial here. */
export function makeRequirement(seed: Seed): Requirement {
  const { plan, minimum, priority = 'P0', prerequisiteConcepts = [], errorTags = [], ...metadata } = seed;
  const stages = {} as Record<LearningStage, CoverageSlot>;
  for (const stage of learningStages) {
    const refs = codeEvidence.filter(e => e.supports.includes(seed.id) && e.stages.includes(stage) && seed.variants.some(v => e.variants.includes(v)));
    const ids = refs.map(e => e.id);
    const gap = refs.length ? refs.map(e => e.limitation).join(' ') : `尚无已核实的${stage}专门内容、可运行活动及证据。`;
    const variantCoverage=Object.fromEntries(seed.variants.map(v=>{
      const variantRefs=refs.filter(e=>e.variants.includes(v)), variantIds=variantRefs.map(e=>e.id);
      return [v,{status:variantRefs.length?'partial':'missing',codeEvidenceIds:variantIds,gap:variantRefs.length?variantRefs.map(e=>e.limitation).join(' '):`本类别没有已核实的${stage}专门内容与证据。`,materials:inventory(variantIds,stage,seed)}];
    })) as CoverageSlot['variantCoverage'];
    const closed = seed.kind === 'question-type';
    const plannedMinimum = minimum?.[stage] ?? (closed && stage === 'guided' ? 3 : closed && ['independent','timed'].includes(stage) ? 5 : 1);
    const expectedEvidence = stage === 'feedback' ? `${seed.feedbackMode}：原作答/原稿/录音的证据定位、具体原因、修订与新题重试；不把改稿覆盖原尝试。`
      : stage === 'review' ? `延迟后换材料/话题的第一遍无提示产出；记录原问题是否再次出现。间隔是课程选择，未验证时保持“未验证”。`
      : stage === 'independent' || stage === 'timed' ? '保留新材料与题号、首答、实际支持/用时条件及反馈来源；看到模型、重播或AI改写要标辅助。'
      : '可读/可播放的真实内容及理解或产出检查；仅存在规划文字不算学过。';
    stages[stage] = { status: refs.length ? 'partial' : 'missing', plannedNodeId: `ielts-plan.${seed.id}.${stage}`, activity: plan[stage], expectedEvidence,
      codeEvidenceIds: ids, gap, materials: inventory(ids, stage, seed), plannedMinimum, variantCoverage };
  }
  return { ...metadata, priority, prerequisiteConcepts, errorTags, stages };
}
