# NCE1 25–36 独立内容交接

六组候选模块位于 `studio/course-loop/parallel-nce1-025-035/`。每组18道原创题，六个bank各3题，3段针对性讲解及1个待人工开放表达任务。覆盖25–26的a/the与单数位置、27–28的复数物品位置、29–30的must与指令、31–32的单数进行时、33–34的复数进行时、35–36的Where位置及移动方向。练习限定句型迁移，不把文字匹配当听说能力、自由表达掌握或Band。

## 基线与所有权

原冻结基线：`d9c7c48a7d419c230be06bf81cc956d63b124649`。恢复时两发布分支均核为 `94d38ab2a2bc42b803ddd951473b154f9c8a5bbd`；保留已有独立worktree，没有改用main或重写课程。整合方须按其最新head重新验证共享宿主。

仅新增本内容目录、`studio/tests/parallel-nce1-025-035*`、`studio/docs/parallel-nce1-025-035*`。没有改registry、类型、main、Today、存储、CAS、FSRS、公共模型、已有候选或原13时间档案；没有读取个人学习记录/录音/凭据。只读共享原教材资源，没有复制大媒体或新增store。两处已知本机Obsidian目录均不可用，没有创建替代记录。

## 接口与整合

每个 `lesson-nce1-0xx.mjs` 导出 `lesson / questions / byId / questionsFor / matches`，直接传入真正 `createCourseLoopModel(content)`。必须保留模块的局部 `matches`；不在宿主重建或放宽checker。本批没有共享接口变更。

唯一整合发布负责人为 `01a0fa39-c2a2-7239-87b4-b0a9c091f0ba`。由负责人显式导入六组，更新课程及source联合类型，接入正确单一路线。需要把相邻候选23接到25，再按25→27→29→31→33→35推进至既有37；依其他课程的实际发布状态验收，不能仅注册本批后跳过13–24。按现有registry生成独立键 `nce-course-loop-v1:NCE1-25` / `nce-course-loop-inputs-v1:NCE1-25` 等，保留原答及来源帮助记录。未注册候选不能作为生产保存验收。

内容version均为1，尚未在生产注册产生本批记录。题干或matcher再次变更时，需重新做对应最终无答案键审阅。本目录的preview仅用相同生产factory在页面内存运行；刷新即清空，演示时间不等于自然24h/7d，不能当正式保存或宿主验收。

## 验证与边界

最终逐课程内容/文件哈希、盲审统计、factory回归统计和历史问题见 `parallel-nce1-025-035-proof/final-validation.json`。旧前半批1147 cases/3合理拒绝报告保留在 `prereconnect-final-blind-report-025-029.json`，新版 `final-blind-report-025-029.json` 才是恢复后当前结果。独立审阅者只收到无答案题面，先冻结首答和预期，再通过实际factory提交探测；原首答和历史失败不覆盖。

已有六组隔离预览、对应课文/漫画与音频metadata、320/390视口证据复用；`resume-evidence-reuse.json`说明绑定和局限。31/33/35题面保持原最终版本，848条最终挑战在恢复后重新通过。最新25/27/29题干及matcher通过独立案例和factory验证，不宣称新增生产UI或真实保存验收。六组LRC/audio/comic字节哈希已重新只读核验；偶数课来自教材语法页及配对metadata，不假设有独立偶数课字幕或原声。

重现（Node22；无需安装依赖）：

```sh
NCE_SOURCE_ROOT=/path/to/existing/dist-online node --test --test-concurrency=1 studio/tests/parallel-nce1-025-035-content.test.mjs studio/tests/parallel-nce1-025-035-model.test.mjs studio/tests/parallel-nce1-025-035-blind.test.mjs studio/course-loop/test-model.mjs
```

隔离预览：`NCE_SOURCE_ROOT=/path/to/existing/dist-online node studio/tests/parallel-nce1-025-035-preview-server.mjs`，打开输出的本机URL。原浏览器验收可用 `parallel-nce1-025-035-browser.mjs` 在独立临时Chrome档案重现，不使用用户档案。

待整合方验收：最新registry/类型/路线、真实单一路线与Today、每课保存及sidecar隔离、CAS失败保留输入、备份恢复、source mismatch拒绝及发布构建。待真人验证：自然间隔、可听原声、实体手机和开放表达。作者不push/merge/deploy，不宣称学习效果或提分。
