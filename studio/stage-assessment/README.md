# 第1–6课首阶段候选

本目录是独立首阶段组件，基于两个发布分支共同的 `fb34b97c855c2c048faffe42cab3cf5cf94890c7`。仅新增本目录，没有改首页、map、main、共享 route、IELTStable 宿主、mini-task、placement 或 course-loop registry/next。唯一 publisher 接共享路由、Today 与持久 writer；本任务不 push、merge 或 deploy。

范围为 NCE1 第1–6课的九个目标：问归属、肯定短答、请求重说、my/your视角、否定归属、否定短答、介绍在场者、he/she指代、be+国籍。其他阶段未覆盖。

## 运行独立工程预览

```sh
cd studio/stage-assessment
npm ci --ignore-scripts
npm test
npm run check
npm run build
npm run dev
```

预览是内存中的现有 State 结构宿主示例，不创建 localStorage/IndexedDB/store。刷新或代码热更新会清空预览状态，请先导出；生产宿主必须接自己的已有持久 writer。预览不装载评阅组件、不录入假人工成绩、不访问麦克风、不上传数据、不更改时间。不部署本目录 dist 为正式网站验收。

## 文件

- `learner-pack.ts`：A–F原创学习者题面、中文角色事实卡和词义卡。没有答案、听力脚本或英文示例。
- `model.ts` / `types.ts`：严格版本/字段/事件重放、未见资格、固定时长、首答、帮助、评阅、修订、修补与真实间隔。
- `adapter.ts`：单一 State.drafts key、CAS持久保存确认、导出恢复、独立外评端口、最小 Today/route 目标接口。
- `StageAssessment.tsx`：学习者 UI，只收 LearnerPort。
- `ExaminerPanel.tsx`：仅在宿主授权合格外部评阅者后挂载；保留首评与第二复核。不是身份认证系统。
- `tests/`：全部为合成单元 fixture；不写13条自然时间档案，不替代真人或自然经过时间。
- `docs/INTEGRATION.md`：唯一 publisher 接入要求；`docs/QA.md`：已做与未做的验收。

## 材料身份和限制

按当前 Library 技能实际 materialize 并读到了以下版本，原件留在 Library。答案与人声脚本不复制到仓库或浏览器：

| 材料 | Library identity | 当前版本 | SHA-256 |
|---|---|---|---|
| acceptance-protocol.md | libfile_7f5d0aa8b75c8191b4b7ce6a33411a55 / file_000000008f1c820d90520bc16d183065 | 0 | 48e19fa0cc342b7f4cdb7a944e53a801e024d86404a5a37fcf4bcaae2f47172e |
| examiner-task-pack.md | libfile_10e9e65dce7c81919d5124fee086a59a / file_0000000057d081f58962ff09ad9e6388 | 0 | a4875bcfc51b55176fcf3fa38343a7d9423dc95fca5486c9d364b4d7dbb6364a |

固定 A/B/C/D 对应 T0/T1/T2/T3；E/F仅作未见替代和修补。每科消耗自己的题面；声明见过整卷则撤销整卷全部科目的未见资格，包括后来才披露的先前曝光。词义、名字可以看，英文提示、答案、翻译/AI帮助不能独立通过。中性重说只允许口语一次。题池用完必须新出题。

候选门槛是听读5/6且关键肯否/物主不反转；口写6/8、无零维度且全部目的正确。四科分别判断；没有适任外评则待人工，转写不是发音评分。临界、争议和T3通过须第二独立复核，否则单人暂评。评阅者在授权端逐项判断中文短答和自然同义英文，有限文字匹配不自动判错。

T0不能补造。T1首测失败不换名覆盖，修补另存。T2需最近相关学习/修补/检索后至少24小时；T3需有效T2且从最近相关活动再至少7×24小时。未知专项练习时间/导入历史不能证明无练习保持，只能从现在开始新可观察间隔。实测起点间隔由事件重放生成；以后专项练习撤销当前保持资格，不删除旧观察。

这是 R13 有限实现候选，尚需 publisher 接入持久保存、授权边界和独立产品QA。没有真人学习/人声质量/评分一致性/自然≥24h及≥7d结果；不能声称 R06 效果、IELTS Band、材料等值或学习收益。声音播放、录音及真实设备功能验收仍由另一线负责。
