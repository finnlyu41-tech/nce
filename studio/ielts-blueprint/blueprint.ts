import { codeEvidence, baselineInventory } from './evidence';
import { listeningReadingRequirements, prerequisiteConcepts } from './listening-reading';
import { speakingWritingRequirements } from './speaking-writing';
import { officialSources, assessmentReference, deliveryReference } from './sources';
import { learningStages, type Blueprint, type CoverageSlot, type CoverageStatus, type Requirement, type Variant, type VariantSelection } from './types';
export { learningStages, skills, variants } from './types';
export type { Blueprint, CoverageSlot, Requirement, PracticeEvidence, Variant, VariantSelection } from './types';
export { baselineInventory, prerequisiteConcepts, assessmentReference, deliveryReference };

export const ieltsBlueprint: Blueprint = {
  version:1, auditedCommit:'e2efbd3296365bbf5e3a110b4178c19fb215b19d', auditedAt:'2026-10-01',
  sources:officialSources, evidence:codeEvidence, requirements:[...listeningReadingRequirements,...speakingWritingRequirements],
};

export const requirementById = (id: string): Requirement | undefined => ieltsBlueprint.requirements.find(r=>r.id===id);

/** Null is a real unanswered choice. It never falls back to the old Academic gate. */
export function requirementsFor(selection: VariantSelection) {
  const forVariant=(v:Variant)=>ieltsBlueprint.requirements.filter(r=>r.variants.includes(v));
  if (selection===null) return {selection,needsVariantSelection:true,shared:ieltsBlueprint.requirements.filter(r=>r.variants.length===2),routes:{academic:forVariant('academic'),'general-training':forVariant('general-training')}};
  if (!['academic','general-training'].includes(selection)) throw new Error('Unknown IELTS variant');
  return {selection,needsVariantSelection:false,shared:ieltsBlueprint.requirements.filter(r=>r.variants.length===2),route:forVariant(selection)};
}

export function coverageFor(id: string, variant: Variant): Record<string,CoverageSlot> | undefined {
  const requirement=requirementById(id);
  if (!requirement || !requirement.variants.includes(variant)) return undefined;
  return Object.fromEntries(learningStages.map(stage=>{
    const slot=requirement.stages[stage], selected=slot.variantCoverage[variant];
    // No fallback to a different variant's evidence, even for a shared requirement.
    if(!selected)throw new Error(`Missing variant coverage: ${id}/${stage}/${variant}`);
    return [stage,{...slot,...selected}];
  }));
}

export function coverageSummary(variant: Variant) {
  if (!['academic','general-training'].includes(variant)) throw new Error('Choose an IELTS variant to summarise');
  const requirements=ieltsBlueprint.requirements.filter(r=>r.variants.includes(variant));
  const slots=requirements.flatMap(r=>Object.values(coverageFor(r.id,variant)!));
  const counts: Record<CoverageStatus,number>={implemented:0,partial:0,missing:0};
  slots.forEach(s=>counts[s.status]++);
  const missingStages=requirements.flatMap(r=>learningStages.filter(stage=>coverageFor(r.id,variant)![stage].status!=='implemented').map(stage=>({requirementId:r.id,stage,plannedNodeId:r.stages[stage].plannedNodeId})));
  return {variant,requirements:requirements.length,stageSlots:slots.length,counts,coverageComplete:counts.implemented===slots.length&&slots.length>0,
    // Inventory is reported once. Per-row assets overlap and must never be summed.
    inventory:baselineInventory,missingStages,learningEffect:'unverified' as const,band:null,
    note:'蓝图结构可完整，训练内容覆盖仍有缺口。产品槽数、素材数和用户能力/正式Band分别报告。'};
}

export const learningContract = {
  productCoverage:'implemented / partial / missing; includes material quantity and QA uncertainty',
  evidenceStates:['unverified','practice-recorded','feedback-recorded','fresh-transfer-recorded','delayed-retention-recorded'],
  effectsVerifiedInThisAudit:false,
  suggestedReviewDelayMs:2*24*60*60*1000,
  reviewDelayAuthority:'product-design-choice',
  provisionalDepthTargets:{receptive:'20新题、至少两不同套、约80%和新限时混合题只是待教师验证的候选门槛；本模块不执行或兑换Band。',productive:'两不同无提示表现与一次延迟新题、按教师定义焦点复核是候选设计；不由点击或自查决定。'},
  defaultMissingEvidence:'未验证；不把空白、旧完成标志或看过页面转成掌握。',
} as const;
