import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadTypeScript} from './ielts-blueprint-loader.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const m=await loadTypeScript(path.join(root,'ielts-blueprint/blueprint.ts')),v=await loadTypeScript(path.join(root,'ielts-blueprint/validation.ts'));
let checks=0;const check=(truth,message)=>{assert.ok(truth,message);checks++};
check(v.validateBlueprint().length===0,'The declared baseline matrix is structurally valid');
const choice=m.requirementsFor(null);check(choice.needsVariantSelection&&choice.routes.academic&&choice.routes['general-training'],'Unselected route preserves both variants');
check(m.ieltsBlueprint.requirements.filter(r=>r.id.match(/^L\d\d$/)).length===13,'13 Listening instructional variants, not an official family count');
for(const suffix of ['A','GT'])check(m.ieltsBlueprint.requirements.filter(r=>r.id.match(new RegExp(`^R\\d\\d-${suffix}$`))).length===15,'Both Reading contexts retain all 15 variants');
check(m.requirementById('R04-GT').sources.some(s=>s.sourceId==='reading-general-bc'),'GT writer views have explicit GT inventory provenance');
check(m.requirementById('R08-GT').sources.some(s=>s.sourceId==='reading-general-bc'),'GT sentence endings are not dropped by a shorter list');
check(m.coverageFor('WA-TABLE','general-training')===undefined,'GT cannot inherit Academic visual coverage');
check(m.coverageFor('S-FULL','general-training').independent.status==='missing','Shared Speaking does not inherit Academic-only mock handoff');
check(m.coverageFor('S-FULL','academic').independent.codeEvidenceIds.includes('map-handoff'),'Academic handoff is recorded truthfully as partial');
check(!m.coverageFor('S-P','academic').model.codeEvidenceIds.includes('s-coach'),'Text organisation is not pronunciation model evidence');
check(m.coverageFor('S-FC','academic').model.materials.verifiedPerformanceAudioModels===0,'Three written skeletons are not three verified speech models');
for(const kind of ['academic','general-training']){const s=m.coverageSummary(kind);check(!s.coverageComplete&&s.learningEffect==='unverified'&&s.band===null,'Coverage summaries never infer learner mastery or Band');}
check(m.assessmentReference.rawScoreAnchors.generalTrainingReading.find(x=>x.band===6).raw===30&&m.assessmentReference.rawScoreAnchors.academicReading.find(x=>x.band===6).raw===23,'Reading average anchors remain variant specific');
check(!m.assessmentReference.rawScoreAnchors.listening.some(x=>x.band===6.5),'No manufactured half-band anchor');
check(m.deliveryReference.defaultMode==='computer'&&m.deliveryReference.readingExtraTransferMinutes===0&&!m.deliveryReference.writing.separateTaskLockouts,'Current mode and Writing suggested allocations retain their limits');
const bad=structuredClone(m.ieltsBlueprint);bad.requirements[0].stages.model.variantCoverage.academic={status:'implemented',codeEvidenceIds:['map-navigation'],gap:'fake navigation claim',materials:{assetIds:[],unit:'models',authoredCount:1,qaVerifiedCount:1,distinctSets:1,verifiedPerformanceAudioModels:0,note:'invalid claim'}};
check(v.validateBlueprint(bad).some(e=>e.message.includes('Navigation')),'Navigation cannot certify an implemented lesson');
const duplicate=structuredClone(m.ieltsBlueprint);duplicate.requirements.push(duplicate.requirements[0]);check(v.validateBlueprint(duplicate).some(e=>e.message.includes('Duplicate requirement')),'Duplicate IDs are rejected');
const now=Date.UTC(2026,9,1),first=now-4*86400000;
const base={requirementId:'R03-A',variant:'academic',stage:'independent',materialId:'original-passage-v1',promptId:'r-new-1',at:first,assistance:'none',response:{kind:'answers',reference:'local-original-first-answer'},conditions:{timed:false,unseen:true,delivery:'computer'},feedback:{author:'answer-key',reference:'reviewed-key+evidence-span',correction:'Explain the missing proposition, then repair'},outcome:'target-observed',materialContextPresent:true};
const req=m.requirementById('R03-A');
check(v.inspectPracticeEvidence(base,req,undefined,{now}).state==='fresh-transfer-recorded','Valid first output is a recorded practice signal, not a score');
const review={...base,stage:'review',materialId:'new-passage-v2',promptId:'r-new-2',at:now,previous:{promptId:base.promptId,at:base.at}};
check(v.inspectPracticeEvidence(review,req,base,{now}).state==='delayed-retention-recorded','A later distinct prompt/material can record delayed evidence');
check(!v.inspectPracticeEvidence({...review,promptId:base.promptId},req,base,{now}).recordValid,'Same prompt cannot establish transfer');
check(!v.inspectPracticeEvidence({...review,materialId:base.materialId},req,base,{now}).recordValid,'Same source material cannot establish transfer');
check(!v.inspectPracticeEvidence({...review,at:first+1000},req,base,{now}).recordValid,'Immediate retry is not delayed retention');
check(!v.inspectPracticeEvidence({...review,assistance:'model'},req,base,{now}).recordValid,'Model-assisted answer is not independent');
check(!v.inspectPracticeEvidence({...base,variant:'general-training'},req,undefined,{now}).recordValid,'Evidence stays within variant');
check(!v.inspectPracticeEvidence({...base,stage:'timed'},req,undefined,{now}).recordValid,'A timer label is not timed evidence');
check(!v.inspectPracticeEvidence({...base,at:now+1},req,undefined,{now}).recordValid,'Future evidence rejected');
check(v.inspectPracticeEvidence({...base,materialContextPresent:false},req,undefined,{now}).state!=='fresh-transfer-recorded','Contextless mistake rehearsal cannot show transfer');
check(!v.inspectPracticeEvidence({...base,conditions:{...base.conditions,delivery:'legacy-paper',market:'HK',testDate:'2026-09-01'}},req,undefined,{now}).recordValid,'Legacy delivery requires booking evidence as well as market/date');
const textSpeech={...base,requirementId:'S-P',response:{kind:'text',reference:'typed-transcript'},feedback:{author:'teacher',reference:'text-comment',correction:'a sentence repair'}};
check(v.inspectPracticeEvidence(textSpeech,m.requirementById('S-P'),undefined,{now}).unassessable.length>0&&v.inspectPracticeEvidence(textSpeech,m.requirementById('S-P'),undefined,{now}).state!=='fresh-transfer-recorded','Text cannot certify pronunciation');
check(v.inspectPracticeEvidence({...textSpeech,requirementId:'S-FC'},m.requirementById('S-FC'),undefined,{now}).unassessable.length>0,'Text cannot certify delivery fluency');
check(v.inspectPracticeEvidence({...textSpeech,response:{kind:'audio',reference:'original-take'},audioUsable:false},m.requirementById('S-P'),undefined,{now}).unassessable.length>0,'Unusable recording is not pronunciation evidence');
const visual={...base,requirementId:'W-TA-A',response:{kind:'text',reference:'original-draft'},feedback:{author:'teacher',reference:'comment-span',correction:'recheck the unit'}};
check(v.inspectPracticeEvidence(visual,m.requirementById('W-TA-A'),undefined,{now}).unassessable.length>0,'Missing visual blocks Academic TA claim');
check(v.inspectPracticeEvidence({...base,feedback:{...base.feedback,author:'self'}},req,undefined,{now}).state!=='fresh-transfer-recorded','Self-check is not reviewed correctness');
check(v.learningEvidenceSummary([],req,'academic',now).transfer==='unverified','No records means unverified');
check(v.learningEvidenceSummary([base,review],req,'academic',now).mastery==='not-inferred','Recorded evidence does not automatically establish mastery');

// Keep the original 37 checks, then exercise the actual trust boundaries with
// synthetic records. These are product evidence rules, never IELTS cutoffs.
const invalidValues=[null,undefined,false,0,'',[],{}, {...base,response:null},{...base,response:[]},{...base,feedback:null},{...base,conditions:true}];
for(const value of invalidValues){
  const result=v.inspectPracticeEvidence(value,m.requirementById('S-P'),undefined,{now});
  check(!result.recordValid&&result.state==='unverified'&&result.band===null,'Malformed/unknown evidence safely returns an unverified record');
}
check(!v.inspectPracticeEvidence(base,null,undefined,{now}).recordValid,'Missing requirement does not crash the unknown-entry boundary');
check(!v.inspectPracticeEvidence(base,req,undefined,null).recordValid,'Invalid inspection options do not silently turn into trusted defaults');
check(!v.inspectPracticeEvidence(base,req,undefined,{now:NaN}).recordValid,'Invalid inspection clock cannot bypass future-time validation');
check(!v.inspectPracticeEvidence(base,req,undefined,{now,history:{}}).recordValid,'History must be an actual array');
for(const records of [null,undefined,{},false]){
  const result=v.learningEvidenceSummary(records,req,'academic',now);
  check(result.issues.length>0&&result.firstAttemptsRecorded===0&&result.transfer==='unverified'&&result.retention==='unverified','Unknown record collections safely produce an empty, unverified summary');
}
const mixed=v.learningEvidenceSummary([null,base,{},false],req,'academic',now);
check(mixed.issues.length===2&&mixed.records.length===1&&mixed.firstAttemptsRecorded===1,'Malformed entries are reported without losing a separate valid attempt');
check(v.learningEvidenceSummary([base],null,'academic',now).transfer==='unverified','Unknown summary requirement is safe');
check(v.learningEvidenceSummary([base],req,'unknown',now).records.length===0,'An unknown route never falls back to Academic');

const invalidPriors=[
  {...base,feedback:{...base.feedback,author:'self'}},
  {...base,feedback:undefined},
  {...base,materialContextPresent:false},
  {...base,conditions:{...base.conditions,unseen:false}},
  {...base,stage:'model'},
  {...base,stage:'guided'},
  {...base,response:{kind:'invalid',reference:'bad-kind'}},
  {...base,response:undefined},
  {...base,stage:'review'},
  {...base,assistance:'hint'},
  {...base,feedback:{author:'teacher',reference:'comment-without-repair'}},
  {...base,conditions:true},
];
for(const prior of invalidPriors){
  const result=v.inspectPracticeEvidence({...review,previous:{promptId:prior.promptId,at:prior.at}},req,prior,{now});
  check(result.state!=='delayed-retention-recorded'&&(result.issues.length>0||result.unassessable.length>0),'A target-observed string cannot certify an invalid or unassessable predecessor');
}
const audio={...base,requirementId:'S-P',materialId:'speech-prompt-1',promptId:'speech-1',response:{kind:'audio',reference:'usable-take-1'},audioUsable:true,feedback:{author:'teacher',reference:'listened-take-1',correction:'Repair the recorded consonant'}},
  audioReview={...audio,stage:'review',materialId:'speech-prompt-2',promptId:'speech-2',at:now,response:{kind:'audio',reference:'usable-take-2'},previous:{promptId:audio.promptId,at:audio.at}};
check(v.inspectPracticeEvidence(audioReview,m.requirementById('S-P'),audio,{now}).state==='delayed-retention-recorded','Usable reviewed audio can support a recorded pronunciation check');
for(const prior of [{...audio,response:{kind:'text',reference:'transcript'}},{...audio,audioUsable:false},{...audio,feedback:{...audio.feedback,author:'self'}},{...audio,materialContextPresent:false}]){
  check(v.inspectPracticeEvidence(audioReview,m.requirementById('S-P'),prior,{now}).state!=='delayed-retention-recorded','Pronunciation review rechecks predecessor audio, reviewer and context');
}
const visualPrior={...visual,promptVisualPresent:true},visualReview={...visualPrior,stage:'review',materialId:'new-visual',promptId:'new-task-1',at:now,previous:{promptId:visualPrior.promptId,at:visualPrior.at}};
check(v.inspectPracticeEvidence(visualReview,m.requirementById('W-TA-A'),{...visualPrior,promptVisualPresent:false},{now}).state!=='delayed-retention-recorded','A new chart cannot repair the absent original chart in prior TA evidence');
check(v.inspectPracticeEvidence(review,req,{...base,stage:'timed',conditions:{...base.conditions,timed:true}},{now}).state==='delayed-retention-recorded','A valid independent timed predecessor remains eligible');

const middle={...review,at:now-2*86400000},last={...review,materialId:'third-passage',promptId:'r-new-3',previous:{promptId:middle.promptId,at:middle.at}};
check(v.inspectPracticeEvidence(last,req,middle,{now,history:[base,middle]}).state==='delayed-retention-recorded','A complete chain of valid fresh delayed checks remains eligible');
check(v.inspectPracticeEvidence(last,req,middle,{now}).state!=='delayed-retention-recorded','A previous review needs its own root evidence, not only its label');
check(v.inspectPracticeEvidence(last,req,middle,{now,history:[{...base,feedback:undefined},middle]}).state!=='delayed-retention-recorded','An invalid root is not laundered through an otherwise good middle review');
const chainSummary=v.learningEvidenceSummary([last,middle,base],req,'academic',now);
check(chainSummary.firstAttemptsRecorded===3&&chainSummary.retention==='recorded-needs-verification','Whole-history review validation is independent of input order');
check(v.learningEvidenceSummary([base,structuredClone(base),review],req,'academic',now).retention==='recorded-needs-verification','Identical stored copies do not make a prior link contradictory');
check(v.learningEvidenceSummary([base,{...base,feedback:{...base.feedback,author:'self'}},review],req,'academic',now).retention==='unverified','Conflicting records with one prior link are not silently resolved by array order');
check(v.inspectPracticeEvidence(review,req,base,{now,history:[{...base,feedback:{...base.feedback,author:'self'}}]}).state!=='delayed-retention-recorded','Supplying a preferred prior cannot override conflicting evidence in the complete history');

check(!v.inspectPracticeEvidence({...base,at:now},req,base,{now}).recordValid,'Independent stage rejects a known earlier prompt/material');
check(!v.inspectPracticeEvidence({...base,stage:'timed',at:now,conditions:{...base.conditions,timed:true}},req,base,{now}).recordValid,'Timed stage also rejects a known earlier prompt/material');
check(!v.inspectPracticeEvidence({...base,promptId:'new-question-on-seen-passage',at:now},req,base,{now}).recordValid,'Changing only the question ID does not make a seen passage fresh');
check(!v.inspectPracticeEvidence({...base,materialId:'another-passage',at:now},req,base,{now}).recordValid,'Changing only the material ID does not make a known prompt fresh');
const olderGuided={...base,stage:'guided',assistance:'hint',materialId:review.materialId,promptId:'older-guided',at:first-86400000};
check(!v.inspectPracticeEvidence(review,req,base,{now,history:[olderGuided,base]}).recordValid,'Review checks all history, not only its linked predecessor');
const crossRequirement={...base,requirementId:'R01-A',stage:'model',assistance:'model',outcome:'unreviewed'};
check(v.learningEvidenceSummary([crossRequirement,{...base,at:now}],req,'academic',now).transfer==='unverified','A different requirement cannot certify the same exposed material as a new first attempt');
const shared=m.requirementById('L01'),academicListening={...base,requirementId:'L01'},generalListening={...academicListening,variant:'general-training',at:now};
for(const records of [[academicListening,generalListening],[generalListening,academicListening]]){
  const result=v.learningEvidenceSummary(records,shared,'general-training',now);
  check(result.firstAttemptsRecorded===0&&result.transfer==='unverified','Shared Listening material remains seen after a variant switch, regardless of array order');
}
check(!v.inspectPracticeEvidence(generalListening,shared,academicListening,{now}).recordValid,'Direct inspection also checks exposure across variants');
check(!v.inspectPracticeEvidence({...base,at:now},req,undefined,{now,history:[{materialId:base.materialId,promptId:'seen-with-no-time'}]}).recordValid,'An undated known exposure cannot establish freshness');
check(v.learningEvidenceSummary([{...base,at:now},base],req,'academic',now).firstAttemptsRecorded===1,'A later repetition does not erase or inflate the genuine earlier first attempt');
check(v.learningEvidenceSummary([base,structuredClone(base)],req,'academic',now).firstAttemptsRecorded===1,'Duplicate copies count one recorded first attempt');
check(v.learningEvidenceSummary([base,{...base,response:{...base.response,reference:'different-output-same-time'}}],req,'academic',now).firstAttemptsRecorded===0,'Conflicting simultaneous uses cannot both establish a first attempt');

for(const stage of ['explain','model','guided','feedback'])check(v.learningEvidenceSummary([{...base,stage,outcome:'unreviewed'}],req,'academic',now).firstAttemptsRecorded===0,'Presentation/guidance/feedback labels do not count as independent first answers');
const unreviewed={...base,feedback:undefined,outcome:'unreviewed'},unreviewedSummary=v.learningEvidenceSummary([unreviewed],req,'academic',now);
check(unreviewedSummary.firstAttemptsRecorded===1&&unreviewedSummary.transfer==='unverified','An actual fresh unreviewed first answer is counted without inferring correctness');
check(v.learningEvidenceSummary([{...base,materialContextPresent:false}],req,'academic',now).firstAttemptsRecorded===0,'A contextless record does not count as an assessable independent answer');
check(v.learningEvidenceSummary([{...base,feedback:{...base.feedback,author:'self'}}],req,'academic',now).firstAttemptsRecorded===0,'A claimed target with only self feedback does not inflate assessable first answers');
check(!v.inspectPracticeEvidence({...review,at:first},req,base,{now,reviewDelayMs:0}).recordValid,'A zero interval cannot establish delayed retention');
check(!v.inspectPracticeEvidence(review,req,base,{now,reviewDelayMs:0}).recordValid,'A zero configured product delay is not a valid retention rule even for later timestamps');
check(!v.inspectPracticeEvidence({...review,at:first},req,base,{now,reviewDelayMs:1}).recordValid,'Retention must occur strictly after its predecessor');
check(!v.inspectPracticeEvidence(review,req,base,{now,reviewDelayMs:-1}).recordValid,'Negative product review intervals are rejected');

const legacy={...base,conditions:{...base.conditions,delivery:'legacy-paper',market:'HK',testDate:'2024-02-29',bookingReference:'provided-booking'}};
check(v.inspectPracticeEvidence(legacy,req,undefined,{now}).recordValid,'A real leap date is accepted without asserting booking availability');
for(const testDate of ['2026-99-99','2026-02-31','2025-02-29','2026-9-01','2026-09-01T00:00:00Z','not-a-date'])check(!v.inspectPracticeEvidence({...legacy,conditions:{...legacy.conditions,testDate}},req,undefined,{now}).recordValid,'Legacy booking dates must be real ISO calendar dates');
const noPerformance=structuredClone(m.ieltsBlueprint),speechRequirement=noPerformance.requirements.find(r=>r.id==='S-FC');
speechRequirement.stages.model.variantCoverage.academic={status:'implemented',codeEvidenceIds:['s-coach'],gap:'synthetic invalid performance claim',materials:{...speechRequirement.stages.model.variantCoverage.academic.materials,qaVerifiedCount:speechRequirement.stages.model.plannedMinimum,authoredCount:speechRequirement.stages.model.plannedMinimum,verifiedPerformanceAudioModels:undefined}};
check(v.validateBlueprint(noPerformance).some(issue=>issue.message.includes('performance model')),'Absent verified audio count cannot bypass the speech performance model boundary');
console.log(`${checks} IELTS blueprint boundary checks passed.`);
