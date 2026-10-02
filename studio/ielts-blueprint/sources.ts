import type { OfficialSource } from './types';
import {registeredCurriculumSources} from './curriculum/registered';

const checkedAt = '2026-10-01';
const ielts = 'https://ielts.org';
const format = `${ielts}/take-a-test/test-types`;
const source = (id: string, title: string, url: string, scope: string, extra: Partial<OfficialSource> = {}): OfficialSource => ({
  id, title, url, scope, publisher: 'IELTS', checkedAt, verification: 'delegated-primary-research', ...extra,
});

/** Source access method is explicit: a delegated primary-source read is not a local full fetch. */
const baseSources: readonly OfficialSource[] = [
  source('delivery-2026', 'IELTS：考试交付更新', `${ielts}/news-and-insights/updates-to-ielts-test-delivery`, '2026年中起按市场撤纸笔；部分市场可选Writing on Paper；构念与评分不变。', { verification: 'direct-open', publicationDate: '2026-03-05', caveat: '市场时间表不同；必须核对实际报考中心。' }),
  source('listening-format', 'IELTS：Listening format', `${format}/ielts-academic-test/ielts-academic-format-listening`, '四部分/40题/一遍播放/约30分钟；六组官方题型及作答限制。', { verification: 'direct-open' }),
  source('reading-academic', 'IELTS：Academic Reading format', `${format}/ielts-academic-test/ielts-academic-format-reading`, '三部分/60分钟/40题；Academic文本和11组分类、作答规则。', { verification: 'direct-open' }),
  source('reading-general', 'IELTS：General Training Reading format', `${format}/ielts-general-training-test/ielts-general-training-format-reading`, 'GT日常、工作、长文三部分；8组分类与文本语境。', { verification: 'partial-fetch', caveat: '委托研究经官方索引读取；直接打开曾间歇失败。短清单不是排除其他GT题型的证据。' }),
  source('reading-general-bc', 'British Council：GT Reading practice', 'https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests/general-training/reading?language=en', 'GT题型并集，包括writer views/claims和sentence endings。', { publisher: 'British Council', verification: 'direct-open', caveat: '页面Reading栏目误放Listening示例；只用明确题型列表，不照抄示例结构。' }),
  source('scoring', 'IELTS：Scoring in detail', `${ielts}/take-a-test/your-results/ielts-scoring-in-detail`, '听读每正确题1分、不同Reading原始分参照、平均锚点和卷间变化；总分取整。', { verification: 'direct-open' }),
  source('listening-computer', 'IDP：Computer Listening preparation', 'https://ielts.idp.com/bangladesh/about/which-test-do-i-take/ielts-on-computer/listening-preparation', '电脑输入及结束后2分钟检查参照。', { publisher: 'IDP', caveat: '孟加拉地区页面；具体时长按市场、日期、报考中心再核实。' }),
  source('listening-map-idp', 'IDP：Listening map labelling', 'https://ielts.idp.com/prepare/article-master-ielts-listening-map-labelling', '图示填标的选项/词语模式；扩展题型列表含summary。', { publisher: 'IDP', publicationDate: '2024-11-27' }),
  source('samples-general', 'IELTS：General Training sample tasks', `${ielts}/take-a-test/preparation-resources/sample-test-questions/general-training-test`, '共享听力、summary题型及General样题入口。', { verification: 'partial-fetch', caveat: '委托研究核实官方索引/入口；全文获取曾失败，未声称完整阅读题库。' }),
  source('samples-academic', 'IELTS：Academic sample tasks', `${ielts}/take-a-test/preparation-resources/sample-test-questions/academic-test`, '官方样题入口；Speaking共用。'),
  source('test-types', 'IELTS：Test types', `${ielts}/take-a-test/test-types`, 'Listening共用、Reading/Writing按类别区别。'),
  source('listening-bc', 'British Council：Listening preparation', 'https://takeielts.britishcouncil.org/prepare/ielts-academic/listening', '无错题扣分、大小写/拼写/字数规则。', { publisher: 'British Council', caveat: '纸笔时间文字含占位符，不作为当前电脑计时依据。' }),
  source('reading-bc', 'British Council：Reading format', 'https://takeielts.britishcouncil.org/what-is-ielts/how-it-works/test-format/reading', '听读无错题扣分；阅读共同能力。', { publisher: 'British Council' }),
  source('reading-entry-idp', 'IDP：Academic Reading student book', 'https://info.ielts.idp.com/rs/561-EIU-022/images/IELTSFocus-AcademicReading-StudentBook.pdf', '阅读60分钟内完成答案输入，无额外抄答案时间。', { publisher: 'IDP', caveat: '较旧教学资料，无可靠文档日期；仅用稳定的无额外抄答案规则。' }),
  source('spelling-bc', 'British Council：British/American English', 'https://takeielts.britishcouncil.org/blog/british-or-american-english-ielts', '听读接受规范英美拼写。', { publisher: 'British Council', publicationDate: '2024-01-25' }),
  source('capitals-bc', 'British Council：Capital letters', 'https://takeielts.britishcouncil.org/blog/capital-letters-in-english-common-errors-and-how-to-fix-them', '听读允许全大写。', { publisher: 'British Council', publicationDate: '2025-09-01' }),
  source('speaking-format', 'IELTS：Speaking format', `${format}/ielts-academic-test/ielts-academic-format-speaking`, '11–14分钟，三部分及其条件，整场评价。', { caveat: '一个BC通用页面写11–15；采用IELTS格式页与专门准备页一致的11–14。' }),
  source('writing-academic', 'IELTS：Academic Writing format', `${format}/ielts-academic-test/ielts-academic-format-writing`, '两任务/60分钟/150及250词，Task2两倍权重；字数不足的证据限制。'),
  source('writing-general', 'IELTS：General Training Writing format', `${format}/ielts-general-training-test/ielts-general-training-format-writing`, '情境书信、三项要求、个人/半正式/正式语体；Task2与评分。', { verification: 'direct-open' }),
  source('criterion-weights', 'IELTS：Understanding IELTS scoring', `${ielts}/organisations/ielts-for-organisations/understanding-ielts-scoring`, '口语四维各25%；写作每task四维等权与任务加权。'),
  source('speaking-descriptors', 'IELTS：Speaking band descriptors', `${ielts}/cdn/ielts-guides/ielts-speaking-band-descriptors.pdf`, '完整官方口语等级描述；蓝图4–8短释仅用于导读。', { caveat: '访问于2026不等于2026修订版；未断言修订日期。' }),
  source('writing-descriptors', 'IELTS：Writing band descriptors', `${ielts}/cdn/ielts-guides/ielts-writing-band-descriptors.pdf`, 'Academic/GT TA、TR、CC、LR、GRA完整等级描述。', { publicationDate: '2023-05', caveat: 'May 2023更新；短释不能代替完整描述或算法评分。' }),
  source('speaking-criteria', 'IELTS：Speaking key assessment criteria', `${ielts}/cdn/ielts-guides/ielts-speaking-key-assessment-criteria.pdf`, 'FC/LR/GRA/P构念定义；发音、语流与可理解性。'),
  source('writing-criteria', 'IELTS：Writing key assessment criteria', `${ielts}/cdn/ielts-guides/ielts-writing-key-assessment-criteria.pdf`, 'TA/TR/CC/LR/GRA构念与不同Task1的要求。'),
  source('writing-demands', 'IELTS：Understand Task 2 prompts', `${ielts}/news-and-insights/ielts-writing-task-2-how-to-understand-ielts-question-prompts`, '按实际命令、范围、多问题及混合要求审题；不能套固定五类模板。', { publicationDate: '2023-02-01' }),
  source('writing-visuals-idp', 'IDP：Analyse Academic Task 1 visuals', 'https://ielts.idp.com/prepare/article-ielts-academic-writing-task-1-how-to-analyse-graphs', '线/柱/饼/表/组合/流程/地图教学覆盖标签。', { publisher: 'IDP', verification: 'partial-fetch', caveat: '委托研究核实官方搜索索引；整页可用性不稳定。' }),
];

export const officialSources:readonly OfficialSource[]=(()=>{
  const byId=new Map<string,OfficialSource>();
  for(const item of [...baseSources,...registeredCurriculumSources]){
    const previous=byId.get(item.id);
    if(previous&&JSON.stringify(previous)!==JSON.stringify(item))throw new Error('Conflicting source identity: '+item.id);
    byId.set(item.id,item);
  }
  return [...byId.values()];
})();

export const assessmentReference = {
  provenance: 'scoring',
  rawScoreAnchors: {
    listening: [{ band: 5, raw: 16 }, { band: 6, raw: 23 }, { band: 7, raw: 30 }, { band: 8, raw: 35 }],
    academicReading: [{ band: 5, raw: 15 }, { band: 6, raw: 23 }, { band: 7, raw: 30 }, { band: 8, raw: 35 }],
    generalTrainingReading: [{ band: 4, raw: 15 }, { band: 5, raw: 23 }, { band: 6, raw: 30 }, { band: 7, raw: 35 }],
  },
  rawScoreNote: '官方公布的40题平均参照，边界随卷略有变化；没有完整0–40换算表，不插值半分，不转换短题/原创题成绩。',
  speakingCriteria: ['fluency-and-coherence', 'lexical-resource', 'grammatical-range-and-accuracy', 'pronunciation'],
  writingTask1Criteria: ['task-achievement', 'coherence-and-cohesion', 'lexical-resource', 'grammatical-range-and-accuracy'],
  writingTask2Criteria: ['task-response', 'coherence-and-cohesion', 'lexical-resource', 'grammatical-range-and-accuracy'],
  criterionWeight: 0.25,
  writingTaskWeightRatio: [1, 2],
  weightsProvenance: 'criterion-weights',
  underlength: '字数不足可能限制可供评价的语言证据；不编固定扣band公式或通用上限。',
  compositeBoundary: '列出权重是评分教学；没有有效人工评阅和相应证据，不计算口写合成分。Speaking没有按三部分分别等权计分。',
} as const;

export const deliveryReference = {
  defaultMode: 'computer',
  provenance: 'delivery-2026',
  readingMinutes: 60,
  readingExtraTransferMinutes: 0,
  listeningApproximateRecordingMinutes: 30,
  computerListeningCheckMinutesReference: 2,
  computerTimingProvenance: 'listening-computer',
  requiresBookingVerification: true,
  legacyPaper: { transferMinutesReference: 10, requires: ['market', 'testDate', 'bookingReference'], label: '历史/过渡纸笔条件；仅按实际报考条件启用' },
  writing: { totalMinutes: 60, task1SuggestedMinutes: 20, task2SuggestedMinutes: 40, task1MinimumWords: 150, task2MinimumWords: 250, separateTaskLockouts: false },
  speaking: { totalMinutes: [11, 14], part1Minutes: [4, 5], part2Minutes: [3, 4], part2PreparationSeconds: 60, part2LongTurnSecondsMaximum: 120, part3Minutes: [4, 5] },
} as const;
