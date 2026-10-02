/** Editorial prerequisites for this finite candidate, NOT a calibrated proficiency scale. */
export const placementManifest = {
 id: 'placement-text-v1', version: 1, contentVersion: 1,
 calibration: 'pending-human-validation', maxQuestions: 6, pools: ['a', 'b'],
 dimensions: [
  {id:'basic', label:'理解日常短句', prerequisite:[], count:2},
  {id:'narrative', label:'时间、原因与句子连接', prerequisite:['basic'], count:2},
  {id:'reading', label:'短文中的证据与未给信息', prerequisite:['basic','narrative'], count:2},
 ],
 entries: [
  {id:'starter', requires:[], href:'/#/nce/NCE1/1?tab=grammar', label:'从一册第 1–2 课补基础'},
  {id:'foundation', requires:['basic'], href:'/#/nce/NCE1/25?tab=grammar', label:'试学一册第 25–26 课，核对句式'},
  {id:'bridge', requires:['basic','narrative'], href:'/#/nce/NCE2/1?tab=grammar', label:'试学二册第 1 课，核对叙述'},
  {id:'reading-preview', requires:['basic','narrative','reading'], href:'/#/ielts?tab=course&task=sample-academic-reading', label:'试学短阅读样例'},
 ],
 skillPrerequisites: [
  {skill:'reading', required:['独立理解未见短文','分辨有证据、矛盾与未给信息'], measured:'仅两段受限短文，最多支持试学'},
  {skill:'listening', required:['未见原声的独立听懂与信息核对'], measured:'未测'},
  {skill:'speaking', required:['自发表达、互动、发音与流利度的人工核对'], measured:'未测'},
  {skill:'writing', required:['未见任务的自由写作与人工核对'], measured:'未测'},
 ],
 fallback:'诊断缺失、用过帮助、跳过或证据不足时保留原路线；可补具体薄弱项。',
 limits:'未测听力、口语、自由写作、发音和完整考试表现；不提供 IELTS band，不授予课程完成或解锁。',
} as const;
export type Dimension = 'basic'|'narrative'|'reading';
export type EntryId = typeof placementManifest.entries[number]['id'];
