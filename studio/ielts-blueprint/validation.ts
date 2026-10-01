import { ieltsBlueprint, learningContract } from './blueprint';
import { learningStages, skills, variants, type Blueprint, type Requirement, type Variant } from './types';
export type ValidationIssue={path:string;message:string};
const unique=(xs:readonly string[])=>new Set(xs).size===xs.length;
const hasText=(x:unknown):x is string=>typeof x==='string'&&x.trim().length>0;
const time=(x:unknown):x is number=>typeof x==='number'&&Number.isSafeInteger(x)&&x>0&&x<=8640000000000000;

/** Structural truth checks, not an IELTS scoring engine. Missing coverage is a valid finding. */
export function validateBlueprint(blueprint:Blueprint=ieltsBlueprint):ValidationIssue[]{
  const issues:ValidationIssue[]=[],fail=(path:string,message:string)=>issues.push({path,message});
  if(blueprint.version!==1||!/^\d{4}-\d{2}-\d{2}$/.test(blueprint.auditedAt)||!/^[a-f0-9]{40}$/.test(blueprint.auditedCommit))fail('blueprint','Missing version/date/commit provenance');
  if(!unique(blueprint.sources.map(s=>s.id)))fail('sources','Duplicate source IDs');
  if(!unique(blueprint.evidence.map(e=>e.id)))fail('evidence','Duplicate evidence IDs');
  if(!unique(blueprint.requirements.map(r=>r.id)))fail('requirements','Duplicate requirement IDs');
  const sourceIds=new Set(blueprint.sources.map(s=>s.id)),refs=new Map(blueprint.evidence.map(e=>[e.id,e])),rids=new Set(blueprint.requirements.map(r=>r.id)),planIds:string[]=[];
  for(const s of blueprint.sources){
    try{const u=new URL(s.url);if(u.protocol!=='https:'||!['ielts.org','www.ielts.org','takeielts.britishcouncil.org','ielts.idp.com','info.ielts.idp.com'].includes(u.hostname))fail(`source.${s.id}`,'Not a recognised primary-source URL');}catch{fail(`source.${s.id}`,'Invalid URL')}
    if(!hasText(s.checkedAt)||!hasText(s.scope))fail(`source.${s.id}`,'Source needs access date and scope');
    if(s.verification==='partial-fetch'&&!hasText(s.caveat))fail(`source.${s.id}`,'Partial fetch needs an explicit limitation');
  }
  for(const e of blueprint.evidence){
    if(!hasText(e.path)||!hasText(e.symbol)||!hasText(e.anchor)||!hasText(e.limitation))fail(`evidence.${e.id}`,'Code proof needs path, symbol, anchor and limit');
    for(const id of e.supports)if(!rids.has(id))fail(`evidence.${e.id}`,'Unknown requirement support: '+id);
    for(const id of e.runtimeRefs||[])if(!refs.has(id))fail(`evidence.${e.id}`,'Unknown runtime reference: '+id);
    if(e.rights==='learner-provided-unverified'&&e.supports.length)fail(`evidence.${e.id}`,'Unverified historical bank must not certify content coverage');
  }
  for(const r of blueprint.requirements){
    if(!skills.includes(r.skill)||!r.variants.length||!unique(r.variants)||r.variants.some(v=>!variants.includes(v)))fail(r.id,'Invalid skill/variant');
    if(!hasText(r.explanation)||!hasText(r.diagnostic)||!r.sources.length)fail(r.id,'Requirement needs meaning, diagnosis and provenance');
    if(r.kind==='teaching-tag'&&r.taxonomy!=='product-teaching-tag')fail(r.id,'Product teaching tags are not an official exhaustive taxonomy');
    for(const v of r.variants)if(!r.sources.some(s=>s.variants.includes(v)))fail(r.id,`No source claim for ${v}`);
    for(const s of r.sources)if(!sourceIds.has(s.sourceId)||!hasText(s.locator))fail(r.id,'Unknown/incomplete source claim');
    if(Object.keys(r.stages).length!==learningStages.length)fail(r.id,'Exactly seven learning stages required');
    for(const stage of learningStages){
      const slot=r.stages[stage],p=`${r.id}.${stage}`;
      if(!slot){fail(p,'Missing stage');continue;}
      planIds.push(slot.plannedNodeId);
      if(slot.plannedNodeId!==`ielts-plan.${r.id}.${stage}`||!hasText(slot.activity)||!hasText(slot.expectedEvidence)||!hasText(slot.gap))fail(p,'Stage needs a distinct plan, actual activity target, evidence and gap');
      if(!Number.isSafeInteger(slot.plannedMinimum)||slot.plannedMinimum<1)fail(p,'Authoring minimum must be a positive product recommendation');
      for(const v of r.variants){
        const observed=slot.variantCoverage[v];
        if(!observed){fail(`${p}.${v}`,'Variant coverage absent');continue;}
        const evidence=observed.codeEvidenceIds.map(id=>refs.get(id));
        if(evidence.some(e=>!e))fail(p,'Unknown evidence reference');
        if(evidence.some(e=>e&&(!e.variants.includes(v)||!e.stages.includes(stage)||!e.supports.includes(r.id))))fail(`${p}.${v}`,'Evidence stage/requirement/variant does not match');
        const m=observed.materials;
        if(!Number.isSafeInteger(m.authoredCount)||m.authoredCount<0||m.qaVerifiedCount!==null&&(!Number.isSafeInteger(m.qaVerifiedCount)||m.qaVerifiedCount<0||m.qaVerifiedCount>m.authoredCount))fail(p,'Invalid/overstated material counts');
        if(!hasText(m.note)||!hasText(observed.gap))fail(p,'Quantity and coverage limitations must be explicit');
        if(observed.status==='missing'&&observed.codeEvidenceIds.length)fail(p,'Missing cannot hide declared support evidence');
        if(observed.status==='partial'&&!observed.codeEvidenceIds.length)fail(p,'Partial needs actual code proof');
        if(observed.status==='implemented'){
          if(!evidence.length||evidence.some(e=>e?.scope!=='local-practice'))fail(p,'Navigation, foundation and handoff cannot certify full local coverage');
          if(m.qaVerifiedCount===null||m.qaVerifiedCount<slot.plannedMinimum)fail(p,'Implemented requires reviewed material meeting declared authoring minimum');
          if(stage==='model'&&['S-P','S-FC'].includes(r.id)&&(!Number.isSafeInteger(m.verifiedPerformanceAudioModels)||m.verifiedPerformanceAudioModels<1))fail(p,'Text organisation/TTS is not a verified delivery/pronunciation performance model');
        }
      }
    }
  }
  if(!unique(planIds))fail('planIds','Planned stage IDs must be unique');
  return issues;
}

export type EvidenceInspection={recordValid:boolean;issues:string[];unassessable:string[];state:'unverified'|'practice-recorded'|'feedback-recorded'|'fresh-transfer-recorded'|'delayed-retention-recorded';band:null};

type EvidenceObject=Record<string,unknown>;
type EvidenceRequirement=Pick<Requirement,'id'|'variants'|'feedbackMode'>;
export type EvidenceOptions={now?:number;reviewDelayMs?:number;history?:readonly unknown[]};
const object=(x:unknown):EvidenceObject|undefined=>typeof x==='object'&&x!==null&&!Array.isArray(x)?x as EvidenceObject:undefined;
const oneOf=(x:unknown,values:readonly string[]):x is string=>typeof x==='string'&&values.includes(x);
const independentStage=(x:unknown)=>oneOf(x,['independent','timed','review']);
const evidenceRequirement=(x:unknown):x is EvidenceRequirement=>{
  const r=object(x);
  return !!r&&hasText(r.id)&&Array.isArray(r.variants)&&r.variants.length>0&&r.variants.every(v=>oneOf(v,variants))&&oneOf(r.feedbackMode,['answer-key','human-text','human-audio','conditions-check']);
};
const calendarDate=(x:unknown)=>{
  if(typeof x!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(x))return false;
  const date=new Date(x+'T00:00:00Z');
  return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===x;
};
const inspection=(issues:string[]=[],unassessable:string[]=[]):EvidenceInspection=>({recordValid:issues.length===0,issues,unassessable,state:'unverified',band:null});

// Copies of one recorded attempt are not another exposure. A different stage,
// requirement or variant cannot turn a known material into a new first attempt.
const sameAttempt=(a:EvidenceObject,b:EvidenceObject)=>{
  const ar=object(a.response),br=object(b.response);
  return hasText(ar?.reference)&&ar.reference===br?.reference&&['requirementId','variant','stage','promptId','materialId','at'].every(key=>a[key]===b[key]);
};
const nestedEvidenceFields:readonly (readonly [string,readonly string[]])[]=[
  ['response',['kind','reference']],['conditions',['timed','unseen','delivery','market','testDate','bookingReference']],['feedback',['author','reference','correction']],['previous',['promptId','at']],
];
const sameEvidence=(a:EvidenceObject,b:EvidenceObject)=>sameAttempt(a,b)&&['assistance','outcome','materialContextPresent','audioUsable','promptVisualPresent'].every(key=>a[key]===b[key])&&nestedEvidenceFields.every(([key,fields])=>{
  const av=a[key],bv=b[key],ao=object(av),bo=object(bv);
  return av===undefined&&bv===undefined||!!ao&&!!bo&&fields.every(field=>ao[field]===bo[field]);
});
const knownExposure=(record:EvidenceObject,history:readonly unknown[])=>history.some(value=>{
  const previous=object(value);
  if(!previous||previous===record||sameAttempt(record,previous))return false;
  const repeated=hasText(record.promptId)&&record.promptId===previous.promptId||hasText(record.materialId)&&record.materialId===previous.materialId;
  // An undated exposure cannot establish that the current prompt was unseen.
  return repeated&&(!time(previous.at)||!time(record.at)||previous.at<=record.at);
});

function inspectFields(value:unknown,requirement:EvidenceRequirement,now:number,history:readonly unknown[]):EvidenceInspection{
  const record=object(value);
  if(!record)return inspection(['Practice evidence must be an object']);
  const result=inspection(),{issues,unassessable}=result,response=object(record.response),conditions=object(record.conditions),feedback=object(record.feedback),previous=object(record.previous);
  if(record.requirementId!==requirement.id||!oneOf(record.variant,requirement.variants))issues.push('Requirement/variant mismatch');
  if(!oneOf(record.stage,learningStages)||!oneOf(record.assistance,['none','hint','model'])||!oneOf(record.outcome,['unreviewed','needs-repair','target-observed']))issues.push('Unknown stage/support/outcome');
  if(!hasText(record.materialId)||!hasText(record.promptId)||!hasText(response?.reference)||!oneOf(response?.kind,['answers','text','audio','external-artifact']))issues.push('Missing actual prompt/material/output reference');
  if(!time(record.at)||!time(now)||record.at>now)issues.push('Invalid/future attempt time');
  if(record.conditions!==undefined&&(!conditions||typeof conditions.timed!=='boolean'||typeof conditions.unseen!=='boolean'))issues.push('Invalid practice conditions');
  if(independentStage(record.stage)&&(record.assistance!=='none'||conditions?.unseen!==true))issues.push('Independent evidence requires a fresh first attempt without hints/model');
  if(independentStage(record.stage)&&knownExposure(record,history))issues.push('Known prompt/material exposure does not establish a fresh first attempt');
  if(record.stage==='timed'&&conditions?.timed!==true)issues.push('Timed conditions not recorded');
  if(conditions&&!oneOf(conditions.delivery,['computer','computer-writing-on-paper','legacy-paper']))issues.push('Unknown delivery mode');
  if(conditions?.delivery==='legacy-paper'&&(!hasText(conditions.market)||!calendarDate(conditions.testDate)||!hasText(conditions.bookingReference)))issues.push('Legacy paper conditions require market, a valid calendar date and booking evidence');
  if(record.previous!==undefined&&(!previous||!hasText(previous.promptId)||!time(previous.at)))issues.push('Invalid previous-attempt reference');
  if(record.materialContextPresent!==true)unassessable.push('Original text/audio/prompt context unavailable');
  if(requirement.feedbackMode==='human-audio'&&(response?.kind!=='audio'||record.audioUsable!==true))unassessable.push('Speech delivery/pronunciation requires usable original audio and capable review');
  if((requirement.id==='W-TA-A'||requirement.id.startsWith('WA-'))&&record.promptVisualPresent!==true)unassessable.push('Academic visual accuracy cannot be reviewed without the original visual');
  if(record.feedback!==undefined&&(!feedback||!hasText(feedback.reference)||!hasText(feedback.correction)||!oneOf(feedback.author,['answer-key','self','teacher','examiner'])))issues.push('Feedback needs evidence, author and a specific repair');
  const capableFeedback=!!feedback&&(requirement.feedbackMode==='answer-key'?oneOf(feedback.author,['answer-key','teacher']):requirement.feedbackMode==='conditions-check'?oneOf(feedback.author,['answer-key','teacher','examiner']):oneOf(feedback.author,['teacher','examiner']));
  if(record.outcome==='target-observed'&&!capableFeedback)unassessable.push('No appropriate answer-key/human review supporting target observation');
  result.recordValid=issues.length===0;
  return result;
}

function priorLink(record:EvidenceObject,requirement:EvidenceRequirement,history:readonly unknown[],suppliedPrior:unknown,delay:number){
  const previous=object(record.previous),issues:string[]=[];
  const matching=history.filter(value=>{
    const candidate=object(value);
    return candidate&&candidate.requirementId===requirement.id&&candidate.variant===record.variant&&candidate.promptId===previous?.promptId&&candidate.at===previous?.at;
  });
  const candidates=suppliedPrior===undefined?matching:[suppliedPrior,...matching];
  const prior=object(candidates[0]);
  // Ambiguous records with the same link may contain contradictory outcomes.
  const unambiguous=candidates.length===1||!!prior&&candidates.length>1&&candidates.every(value=>{const copy=object(value);return !!copy&&sameEvidence(prior,copy);});
  if(!previous||!prior||!unambiguous||prior.requirementId!==requirement.id||prior.variant!==record.variant||previous.promptId!==prior.promptId||previous.at!==prior.at)issues.push('Delayed check must link one real prior record of this requirement/variant');
  else{
    if(record.promptId===prior.promptId||record.materialId===prior.materialId)issues.push('Same prompt/material does not establish fresh transfer');
    if(!time(prior.at)||!time(record.at)||record.at<=prior.at||!Number.isSafeInteger(delay)||delay<=0||record.at-prior.at<delay)issues.push('No positive delayed interval yet; interval is a curriculum choice');
  }
  return {prior,issues};
}

/** Checks supplied records only. A fresh claim still needs content/teacher verification. */
export function inspectPracticeEvidence(value:unknown,requirement:Requirement,prior?:unknown,options:EvidenceOptions={}):EvidenceInspection{
  if(!evidenceRequirement(requirement))return inspection(['Unknown requirement/feedback contract']);
  const config=object(options),optionIssues:string[]=[];
  if(!config)optionIssues.push('Invalid inspection options');
  const now=config?.now===undefined?Date.now():config.now,delay=config?.reviewDelayMs===undefined?learningContract.suggestedReviewDelayMs:config.reviewDelayMs;
  if(!time(now))optionIssues.push('Invalid inspection time');
  if(typeof delay!=='number'||!Number.isSafeInteger(delay)||delay<=0)optionIssues.push('Product review interval must be positive');
  if(config?.history!==undefined&&!Array.isArray(config.history))optionIssues.push('Evidence history must be an array');
  const history:readonly unknown[]=[...(Array.isArray(config?.history)?config.history:[]),...(prior===undefined?[]:[prior])];
  const result=inspectFields(value,requirement,typeof now==='number'?now:NaN,history),record=object(value);
  result.issues.push(...optionIssues);
  if(record?.stage==='review'){
    // Iteration permits a genuine chain of delayed checks without recursive
    // stack failures. Every predecessor must itself have assessable evidence.
    let cursor=record,supplied=prior,first=true;
    const visited=new Set<EvidenceObject>([record]);
    while(cursor.stage==='review'){
      const link=priorLink(cursor,requirement,history,supplied,typeof delay==='number'?delay:NaN);
      if(link.issues.length){
        if(first)result.issues.push(...link.issues);
        else result.unassessable.push('Prior delayed check has no valid linked independent evidence');
        break;
      }
      const predecessor=link.prior!;
      if(visited.has(predecessor)){result.unassessable.push('Prior evidence chain is cyclic');break;}
      visited.add(predecessor);
      const checked=inspectFields(predecessor,requirement,typeof now==='number'?now:NaN,history);
      if(!checked.recordValid||checked.unassessable.length||!independentStage(predecessor.stage)||predecessor.outcome!=='target-observed'){
        result.unassessable.push('Prior independent target lacks valid conditions, context/output or appropriate review');
        break;
      }
      cursor=predecessor;supplied=undefined;first=false;
    }
  }
  result.recordValid=result.issues.length===0;
  if(result.recordValid&&record){
    result.state=record.feedback!==undefined?'feedback-recorded':'practice-recorded';
    if(independentStage(record.stage)&&record.outcome==='target-observed'&&!result.unassessable.length)result.state=record.stage==='review'?'delayed-retention-recorded':'fresh-transfer-recorded';
  }
  return result;
}

export function learningEvidenceSummary(records:unknown,requirement:Requirement,variant:Variant,now=Date.now()){
  const issues:string[]=[],history:readonly unknown[]=Array.isArray(records)?records:[];
  if(!Array.isArray(records))issues.push('Evidence records must be an array');
  if(!evidenceRequirement(requirement))issues.push('Unknown requirement/feedback contract');
  if(!oneOf(variant,variants)||evidenceRequirement(requirement)&&!requirement.variants.includes(variant))issues.push('Requirement/variant mismatch');
  if(!time(now))issues.push('Invalid inspection time');
  history.forEach((record,index)=>{if(!object(record))issues.push(`Record ${index} must be an object`);});
  const matching=!evidenceRequirement(requirement)||issues.some(message=>message==='Requirement/variant mismatch')?[]:history.filter((value):value is EvidenceObject=>{
    const record=object(value);return !!record&&record.requirementId===requirement.id&&record.variant===variant;
  });
  // Freshness checks see the entire history, before requirement/variant filters.
  const inspected=matching.map(record=>({record,inspection:inspectPracticeEvidence(record,requirement,undefined,{now,history})}));
  return {requirementId:evidenceRequirement(requirement)?requirement.id:'',variant,records:inspected,issues,
    firstAttemptsRecorded:new Set(inspected.filter(x=>x.inspection.recordValid&&!x.inspection.unassessable.length&&independentStage(x.record.stage)).map(x=>x.record.promptId)).size,
    transfer:inspected.some(x=>x.inspection.state==='fresh-transfer-recorded')?'recorded-needs-verification':'unverified',
    retention:inspected.some(x=>x.inspection.state==='delayed-retention-recorded')?'recorded-needs-verification':'unverified',
    mastery:'not-inferred',band:null};
}
