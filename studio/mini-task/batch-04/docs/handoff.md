R12 batch04 已完成第37–48课六个正式配对组的小任务；生产候选仅接入 mini 内容、绑定与有限音频清单。前18组、原课程循环与首页/Today/路由保持冻结字节。不能把每组一个部分目标任务说成每课所有目标或全部雅思技能完成。

| 配对课 | 任务 | 学习动作 |
|---|---|---|
| 37/38 | 听力 | 分清当前工作、下一步计划与确认颜色 |
| 39/40 | 阅读 | 核对物品处置、接收人和禁令，计划不当完成 |
| 41/42 | 口语 | 报告已核实的带单位物品，询问另处未知存量 |
| 43/44 | GT写作 | 更新库存短讯，有、核实零与待查分别处理 |
| 45/46 | 听力 | 一般能力与本件任务边界，询问计划不当能力确认 |
| 47/48 | 阅读 | 通常偏好、本次需求与旧订单分开 |

每组教学→有提示→独立新材料→修补→延迟A/B，共5份原创有限材料。12课显式绑定到6个唯一任务；同组共享原有 `State.drafts`，不重复授予进度。听/读仅核对ABC事实；口/写开放自然表达均待人工，未自动评内容、质量、Band。书写仅GT起步短讯，没有Academic图表。播放、文字稿帮助、受限文字与真实本机录音元数据仍由原模型分别记录；音频字节不保存、不上传。

宿主接口沿用冻结生产API，无额外接线：`miniTaskForCourse('nce1-37')` → `mini-n1-37`，其他奇数课39/41/43/45/47同理。原通用路由 `/#/mini-task/mini-n1-37`；原课程own/waiting出口回调自动发现内容。快照键 `english-mini-task-v1:NCE1-37`，使用原writer/CAS/备份/离开守卫。Today既有priority3.5与去重逻辑保持不变；修补/未完/到期优先，新课随后。小任务不能授予CL/map/FSRS完成或移动主课。池耗尽原提示与Today移除已实测。

共享精确修改仅3文件：`mini-task/content.ts` 新import/spread；`mini-task/manifest.ts` 新import/spread；`mini-task/audio-inventory.py` 严格追加37/45的10段WAV，冻结旧30段并拒绝未知/重复/缺失/数量不符。现有打包、验证与通用宿主已消费清单，不修改publisher首页/Today/路由、registry、host-contract、course-loop-next或IELTS tablehost。独占 `mini-task/batch-04/` 包含内容、manifest、音频、盲审、测试与证据。

基线：开工两远端为9fbda716；测试冻结为publisher d717bad909d889fd305d667bd1d8530883aaf23a。交付前重新读取，两远端及publisher均15505c43a1f35b8b7a60830b3bb7cc0e826f1d40，其与冻结只差两份文档，生产代码相同。候选以d717bad为父，由唯一publisher 01a0fa39-c2a2-7239-87b4-b0a9c091f0ba最终接入和发布。无需把未授权历史兼容当新用户门槛；当前保存、刷新和续学仍验证。

验证结果见 `../evidence/final/`：26组模型/宿主检查（旧18任务+新6及身份/Today），15组严格音频打包与失效检查，12组原生Chrome实际最终包检查；六组首答/反馈/修订刷新、真实保存失败与出口阻断/重试、课程回调/Today恢复、既有备份下载/文件恢复、耗尽提醒、真实404无播放记录、40段根/地图共80个HTTP200/MIME/SHA、37/45离线data WAV播放/保存/刷新。320/390各四种技能8张截图，无横向溢出，四种页面已逐技能查看截图。空记录新用户实际Today通向热身/主课，无提前mini快照或强制诊断。TypeScript、所改TS lint、生产root/map构建和全包2037文件/556原素材核验通过。415受保护文件原字节相同。

内容盲审只给材料和题干：30/30可作答，20闭题答案一致，10开放例答不评分，0必要修订。43修补交换正负句的可数性分配，宏观“当前有/核实无”对齐但不声称逐句平行或等难。单位词在教学中备齐；真人难度、学习效果、真人听感、自然跨日A/B尚未验证。声音是本机既有Samantha离线合成；真实播放/PCM检查不替代人工听辨。口语测试用本任务合成WAV验证本机流程，不伪称真实学生录音。仅使用独立合成QA档案；task19用户档案与自然lesson13封存档未读未动。

复测（studio下）：`node mini-task/batch-04/test-model.mjs`、`test-today.mjs`、`test-source.mjs`、`test-isolation.mjs`、`test-blind.mjs`；`python3 mini-task/batch-04/test-audio.py`；`node node_modules/typescript/bin/tsc --noEmit`。先生产构建offline→package-standalone、online root+map→package-standalone --online→verify-online。为浏览器使用本任务独立本机5200静态服务，运行`test-native.mjs`/`test-newuser.mjs`。不要在别的作者worktree运行会写fixture/packet的旧批测试。离线声音脚本只使用已安装系统语音，无网络服务或新增费用。

交付范围为37–48；后续49–144及其他61项由root继续调度，不能据此宣布全部需求完成。候选冻结后未push、merge、deploy。完整bundle与共享精确patch由root目录delivery.json列出。
