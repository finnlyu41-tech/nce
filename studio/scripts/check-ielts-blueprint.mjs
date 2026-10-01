import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {loadTypeScript} from './ielts-blueprint-loader.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),repo=path.dirname(root);
const {ieltsBlueprint:b,coverageFor,coverageSummary,baselineInventory}=await loadTypeScript(path.join(root,'ielts-blueprint/blueprint.ts'));
const {validateBlueprint}=await loadTypeScript(path.join(root,'ielts-blueprint/validation.ts'));
const {learningStages}=await loadTypeScript(path.join(root,'ielts-blueprint/types.ts'));
const issues=validateBlueprint(b),blobs=new Map();
const readProof=p=>{
  if(!blobs.has(p))blobs.set(p,execFileSync('git',['show',`${b.auditedCommit}:studio/${p}`],{cwd:repo,encoding:'utf8',maxBuffer:16*1024*1024}));
  return blobs.get(p);
};
for(const e of b.evidence){
  try{if(!readProof(e.path).includes(e.anchor))issues.push({path:e.id,message:'Evidence anchor missing in pinned commit'});}
  catch{issues.push({path:e.id,message:'Evidence file missing in pinned commit'});}
}
const data=JSON.parse(readProof('app/data/ielts.json'));
const byId=new Map([...data.listening.questions,...data.reading.questions,...data.writing,...data.speaking].map(item=>[item.id,item]));
const tfng=q=>q.options?.join('|')==='TRUE|FALSE|NOT GIVEN';
const same=(actual,expected)=>JSON.stringify(actual)===JSON.stringify(expected);
if(!same(data.listening.questions.map(q=>q.id),baselineInventory.listening.itemIds)||data.listening.questions.some(q=>q.type!=='choice'))issues.push({path:'listening',message:'Audited eight single-choice IDs changed'});
if(!same(data.reading.questions.filter(q=>!tfng(q)).map(q=>q.id),baselineInventory.reading.multipleChoiceItemIds)||!same(data.reading.questions.filter(tfng).map(q=>q.id),baselineInventory.reading.identifyingInformationItemIds))issues.push({path:'reading',message:'Audited 4MC / 4TFNG inventory does not match'});
if(!same(data.writing.map(q=>q.id),baselineInventory.writing.promptIds)||!same(data.speaking.map(q=>q.id),baselineInventory.speaking.originalFallbackPromptIds))issues.push({path:'productive',message:'Original prompt inventory mismatch'});
for(const e of b.evidence)for(const id of e.artifactIds||[])if(id.startsWith('ielts-')&&!byId.has(id))issues.push({path:e.id,message:'Unresolved original artifact ID: '+id});
for(const r of b.requirements)for(const v of r.variants)for(const slot of Object.values(coverageFor(r.id,v)))for(const id of slot.materials.assetIds){
  if(id.endsWith('.sample')&&!byId.get(id.slice(0,-7))?.sample)issues.push({path:r.id,message:'Model reference has no actual sample: '+id});
  if(/^ielts-[lrws]\d+$/.test(id)&&!byId.has(id))issues.push({path:r.id,message:'Material ID does not exist: '+id});
}
const legacy=await loadTypeScript(path.join(root,'app/ielts-blueprint.ts'));
const nodeIds=new Set(legacy.blueprintNodes.filter(n=>['listening','reading','speaking','writing'].includes(n.id)).flatMap(n=>n.tasks.map(t=>`${n.id}-${t.id}`)));
for(const r of b.requirements)for(const id of r.currentMapNodeIds)if(!nodeIds.has(id))issues.push({path:r.id,message:'Unresolved current map node: '+id});

const summaries=['academic','general-training'].map(v=>coverageSummary(v));
const compact=s=>({variant:s.variant,requirements:s.requirements,stageSlots:s.stageSlots,counts:s.counts,coverageComplete:s.coverageComplete,learningEffect:s.learningEffect,band:s.band});
console.log(JSON.stringify({valid:issues.length===0,auditedCommit:b.auditedCommit,requirements:b.requirements.length,evidence:b.evidence.length,summaries:summaries.map(compact),issues},null,2));
if(issues.length)process.exit(1);

if(process.argv.includes('--write-report')){
  const labels={explain:'解释',model:'示范',guided:'引导',independent:'独立',timed:'限时',feedback:'反馈',review:'复习'},status={implemented:'已实现',partial:'部分',missing:'缺失'};
  const clean=s=>String(s).replaceAll('|','/').replaceAll('\n',' ');
  const proofLink=id=>{const e=b.evidence.find(x=>x.id===id),line=readProof(e.path).slice(0,readProof(e.path).indexOf(e.anchor)).split('\n').length;return `[${id}](https://github.com/finnlyu41-tech/nce/blob/${b.auditedCommit}/studio/${e.path}#L${line})`;};
  let md=`# IELTS 官方要求→教学→练习→反馈→复习覆盖\n\n由 \`node scripts/check-ielts-blueprint.mjs --write-report\` 生成。基线 \`${b.auditedCommit}\`，核验 ${b.auditedAt}。所有规划位是教学规格，不是已接线页面。\n\n`;
  md+='100项是产品追踪要求/教学标签，不是100种官方题型。Listening 13、Reading 15个教学变体分别按来源展开；Reading两类单独审计。写作视觉/功能/essay命令可重叠，不能称穷尽的官方分类。\n\n';
  md+='| 类别 | 要求行 | 七阶段槽 | 已实现 | 部分 | 缺失 | 用户迁移/保持 |\n| --- | ---: | ---: | ---: | ---: | ---: | --- |\n';
  for(const s of summaries)md+=`| ${s.variant} | ${s.requirements} | ${s.stageSlots} | ${s.counts.implemented} | ${s.counts.partial} | ${s.counts.missing} | 未验证 |\n`;
  md+='\n覆盖状态说明：部分表示存在基础支持、短练习、工具或外部交接，不能把它读成该类型已完整教练到。QA未知是“尚未核实”，不等于0个或已通过。新蓝图文件本身没有提升基线覆盖。\n\n';
  md+='唯一基线库存：Listening 1段可重播TTS/8单选；Reading 1篇/4MC+4TFNG，GT专门材料0；Writing 3原创题/3未评分参考；Speaking 6原创备用题、3文本组织骨架，有效口头表现模型已核实0。历史66组/238题是脚本声明，payload/权利待核，不计可用鲜题量。32地图overview节点含12四科assignment、2模考及正式终点；168NCE是基础能力。素材会跨要求重复引用，逐行数量不得求和。\n\n';
  for(const v of ['academic','general-training']){
    md+=`## ${v}\n\n| ID / 要求 | 分类 | ${learningStages.map(s=>labels[s]).join(' | ')} | 当前地图位置 | 代码证据 |\n| --- | --- | ${learningStages.map(()=> '---').join(' | ')} | --- | --- |\n`;
    for(const r of b.requirements.filter(r=>r.variants.includes(v))){
      const slots=coverageFor(r.id,v),eids=[...new Set(learningStages.flatMap(s=>slots[s].codeEvidenceIds))];
      md+=`| ${r.id} ${clean(r.title)} | ${r.taxonomy} | ${learningStages.map(s=>{const c=slots[s];return `${status[c.status]} · ${c.materials.authoredCount}${c.materials.unit} / QA${c.materials.qaVerifiedCount??'未知'}`}).join(' | ')} | ${r.currentMapNodeIds.join(', ')||'未接该类别'} | ${eids.map(proofLink).join(' ')} |\n`;
    }
  }
  md+='\n## 细节与验收\n\n七阶段活动、每阶段规划位、局限、素材ID、数量单位、外部交接和官方来源关系见同目录CSV及`studio/ielts-blueprint/`原数据。独立/限时最小素材量是课程authoring建议，不是Band阈值。\n\n`--require-complete` 是内容完整性验收：当前应失败，因为没有任何类型具备七阶段全面QA内容；普通校验通过仅证明矩阵真实、引用有效。新增样例单列，不回写已发布基线覆盖。\n\n';
  md+='正式分数依据IELTS成绩报告。纯文本不评发音/真实语流；缺图不能评Academic数据准确性；旧全卷登记与真实评阅分开。学习数据尚未读取，学习效果为未验证。\n\n## 官方来源\n\n';
  for(const s of b.sources)md+=`- [${s.title}](${s.url}) · 核验${s.checkedAt} · ${s.verification}。${s.caveat||''}\n`;
  const headers=['requirement_id','skill','variant','taxonomy','stage','status','planned_node_id','current_map_nodes','activity','expected_evidence','planned_minimum_product_choice','material_unit','authored_count','qa_verified_count','fresh_sets_verified','performance_audio_models_verified','material_ids','code_evidence','gap','official_sources'];
  const csvCell=x=>`"${String(x??'unknown').replaceAll('"','""')}"`;
  const rows=[headers];
  for(const r of b.requirements)for(const v of r.variants)for(const stage of learningStages){const c=coverageFor(r.id,v)[stage];rows.push([r.id,r.skill,v,r.taxonomy,stage,c.status,c.plannedNodeId,r.currentMapNodeIds.join(';'),c.activity,c.expectedEvidence,c.plannedMinimum,c.materials.unit,c.materials.authoredCount,c.materials.qaVerifiedCount,c.materials.distinctSets,c.materials.verifiedPerformanceAudioModels,c.materials.assetIds.join(';'),c.codeEvidenceIds.map(id=>{const e=b.evidence.find(x=>x.id===id);return `${e.path}#${e.symbol}`}).join(';'),c.gap,r.sources.filter(s=>s.variants.includes(v)).map(s=>`${b.sources.find(x=>x.id===s.sourceId).url} :: ${s.locator} :: ${s.claim}`).join(';')]);}
  await fs.mkdir(path.join(root,'docs'),{recursive:true});
  await fs.writeFile(path.join(root,'docs/ielts-blueprint-coverage.md'),md);
  await fs.writeFile(path.join(root,'docs/ielts-blueprint-coverage.csv'),'\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\n')+'\n');
  console.log(`Wrote coverage report and ${rows.length-1} variant/stage CSV rows.`);
}
if(process.argv.includes('--require-complete')&&summaries.some(s=>!s.coverageComplete)){
  console.error('Coverage is incomplete. The metadata audit is valid; missing/partial teaching stages remain.');process.exit(2);
}
