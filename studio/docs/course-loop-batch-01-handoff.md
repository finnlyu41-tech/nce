# 相邻两组课程闭环内容交接

已实现的是新概念第1册第3–4课和第5–6课的原创受限文字微课，各18题，共36题。本批只新增内容、纯测试、审阅预览及覆盖差分；没有修改共享模型、导航、Today、播放器、存储、map或FSRS，没有推送、合并或部署。

已测：49项Node测试（本批26项、原CL00模型23项）和13项真实桌面Chrome点击/输入检查。盲审先独立解答36题，再核对9处修订题和6道国籍题，未读答案键。3处物主蕴含问题已修正并复核；自然介绍变体已接受；国籍题最后明确只用主语、be和国籍形容词。最后这条收紧经作者与测试核对，没有额外独立盲审，不算真人或专家验收。

待整合：唯一发布负责人实现共享课程绑定，再验证正式保存、备份、路线、教材媒体和手机。待真人验证：开放表达和自然间隔复习。受限新情境表现不能推出听说能力、长期掌握或雅思提分。

## 基线与所有权

- 仓库：`finnlyu41-tech/nce`，已核对指定`codex/english-studio-online-20260926`和`codex/ielts-map-20260930`，没有以main替代。
- 运行代码：`0f347924d1ed114df83fa1cc6dd98ff5f3ae5d34`。
- 工作树基线：`53487c8614e24b95096989c25db22576dc0cfc82`，与运行代码只差README及`course-ux-mobile-integration.md`两份文档。
- 本地独立分支：`codex/course-loop-cl01-20261002`；既有CL00交接分支、包和其他工作树未修改。
- 唯一发布负责人：cloud task `01a0fa39-c2a2-7239-87b4-b0a9c091f0ba`。父对话`01a0f25c-5e18-762f-ba8b-7de3421fc01a`协调共享接口所有权。
- 已核对已知本机树、祖先目录及指定Git树，未找到适用AGENTS或可读`.agents/skills`。`.agents`被忽略，不能声称掌握cloud专属规则。Obsidian当前AGENTS不可用，不另建状态库；本交接承接既有仓库记录。
- 未读取凭据、会话数据库、用户学习记录或录音；未碰13条真实时间验收档案。

## 两组实质内容

| 组 | 目标 | 先尝试 / 跟练 / 无提示 / 修补 / 复习A / 复习B | 开放表达 |
|---|---|---|---|
| NCE1-3（教材3–4） | 明确说话者/物主的my与your；This is not my…；No, it is not等缩写 | 每环节3道明确情境题，18个不同题ID及情境 | 拿错物品的两句自选对话，待人工核对 |
| NCE1-5（教材5–6） | This is介绍人物；明确事实下的he/she主语；be+国籍形容词 | 每环节3道明确情境题，18个不同题ID及情境 | 真实或明确虚构的人物介绍，未知身份信息不猜，待人工核对 |

3–4课从归还借书、认领钥匙变为代存大衣、维修店交付手机、检票失物，再变为工作坊、打印票、误送外套、打包、公共充电区。5–6课从在场朋友变为线上通话、活动接待、图书馆、邻居拜访；新人物、指代事实、国籍组合变化。盲解确认不是只调换选项位置，目标句式仍是同一受限结构，不声称更广泛迁移。

讲解按前测中需要帮助或错误的目标排序。无提示阶段先保存首答，三题结束再反馈；错误或曾查看帮助的题须订正并写原因。修补重试不会变成首次曝光。初次复习24小时，独立正确的新题后7天，有帮助或错误后1天；两组复习材料用尽，模型要求补新题，不将旧题重用作陌生证据。时间验证为纯模型模拟。

国籍题明确使用形容词及有限短句结构；`He is a German.`可能是有效的名词句，不等于本任务匹配失败就判整句英文错误。介绍题接受独立审阅提出的`Everyone, this is…`及明确是朋友时名字前后两种`my friend`表达；有限键不能覆盖所有自然开放介绍，后者保持待人工核对。

## 保留教材的准确连接

内容只引用已有教材资产，不复制课文或音频。`source`包含`groupId/route/mapRoute/languagePath/languageSha256/comicKey/clips[{target,label,start,end}]`。`book`在lesson顶层，教材入口用`lesson.lessons[0]`。

| 组 | LRC/漫画源标识SHA256 | 三段边界秒 |
|---|---|---|
| NCE1-3 | `83b94c8bdb3bc463856aa465fc3510c43461ea343318e57586ca98759373f8a1` | ownership 17.56–22；reject 33.72–37.39；respond 42.56–45.69 |
| NCE1-5 | `583b4623ebba86ac0f68a08831b55fb8fafc56e9168b48ce392c7a9da531c6ab` | introduce 19.72–23.61；reference 26.55–28.99；nationality 32.54–34.56 |

边界已对照已有LRC元数据及现有漫画sourceSha256；没有播放听感QA。宿主须加载3或5课，对照实际`language.sourceSha256`连接对应漫画，并使用内容提供的`clip.label`。不能沿用第1课或ask/confirm/repeat固定标签。预览清楚显示媒体尚待宿主接入。

## 发布负责人需要的最小共享契约

这些共享文件均未修改，已先报告父对话并得到“留给publisher”的所有权答复。

| 精确文件 | 所需接口 / 不变量 |
|---|---|
| `studio/course-loop/model.mjs` | 内容绑定factory；初次曝光取本内容diagnostic[0].id；source学习ID取lesson.id。旧默认导出仍绑定CL00，事件和默认输出逐字兼容。 |
| `studio/course-loop/host-contract.d.ts` | 有限课程/源ID类型扩展；Snapshot version1及事件结构保留。 |
| 发布负责人新建有限registry文件 | 仅显式注册`nce1-1/3/5`，未知ID抛出/显示可恢复错误，不能fallback为CL00；覆盖CSV不作为注册表。 |
| `studio/app/course-loop-progress.ts` | selected-course模型、byId、2个draft键绑定；旧常量、默认调用签名及CL00键保持原样。现有2MiB有限格式、同课冲突、异条目rebase、守护写入和readback仍由原宿主负责。未知或跨课记录原文保留，不重置。 |
| `studio/app/course-loop-ui.tsx` | Workspace接收显式courseId，默认CL00；SourcePanel用lesson.book、lessons[0]、实际sourceSha和clip.label。每题帮助/源码曝光先记录，切题收起教材；保存失败队列不另实现。 |
| `studio/app/course-loop-next.ts` | 保留单一推荐、优先恢复/到期；链1→3→5→7，7仍是既有map/教材入口，不能假装新闭环。保留锁课access意图；点击不授予map通过。 |
| `studio/app/course-loop-summary.ts` | 选定课程派生摘要，单独显示各课未提交/已保存事实及自身复习，不合并成map/FSRS证据。 |
| `studio/app/course-loop-summary-ui.tsx` | 依据selected-course摘要显示，保留v30等待页可恢复原答/帮助/订正。 |
| `studio/app/today-practice.ts` | 读取显式注册的有限课程，统一任务选择；不复制独立计时器。 |
| `studio/map/learning.tsx` | 挂载registry中1/3/5的Workspace；其他课走既有教材流程。 |
| `studio/map/main.tsx` | 单一推荐使用既有选择入口，保留高级map路径/访问语义。 |

两课需要的存储键分别为`nce-course-loop-v1:NCE1-3`、`nce-course-loop-inputs-v1:NCE1-3`以及对应`NCE1-5`。它们只是契约建议，未向任何用户记录写入。CL00仍为`nce-course-loop-v1:NCE1-1`和`nce-course-loop-inputs-v1:NCE1-1`。建议绑定接口或在原签名末尾加默认courseId，避免改变现有第一/第二参数的意义。跨课sidecar中的题ID必须拒绝，不做自动归类。

`model-fixture.mjs`仅供Node测试和本机审阅：读取原v30模型，在内存改3处绑定，不写模型副本。宿主parser fixture也只读/改内存导入及键，移除存储依赖；仅调用pure parser，从不调用read/commit。它们不能导入生产app；生产factory和registry仍由publisher实现。

## 复现与证据

在studio的上层仓库根目录执行：

```sh
node --test studio/course-loop/test-model.mjs studio/course-loop/batch-01/test-content.mjs studio/course-loop/batch-01/test-model-compat.mjs
node studio/course-loop/batch-01/test-preview.mjs
```

预览测试绑定本机127.0.0.1，使用独立临时Chrome资料，运行后清理自己创建的资料。测试通过原生CDP点击和insertText走完两组，不注入浏览器时钟，不接触用户Chrome资料或正式站点。页面使用v30原审阅renderer的内存课程绑定，明确输入刷新会清空；不是正式v30 UI、保存、手机或媒体验收。截图已实际查看。

证据在交接包`evidence/`：`node-tests.log`、`receipt.json`、`nce1-3-complete.png`、`nce1-5-complete.png`和三份仅题目的盲审输入。回执记录Chrome版本、原模型/renderer SHA256、13项检查及零运行异常。测试26项涉及内容完整性、盲解答案、来源hash、旧默认字节兼容、跨课/未知ID拒绝、格式容量、帮助/首答/订正/曝光、复习模拟和sidecar隔离；另运行旧23项模型回归。

## 覆盖差分和有限下一批

覆盖仍为348教材课、276教学组；map序列168组，另108组已有classic教材入口。新差分CSV保留`0ae75f9`盘点基线，并附`0f347924`及本批覆盖字段，不宣称重审了其余全部引擎。CL00=1组已由publisher整合；本批=2组仅本地内容实现；其余273组不增加闭环已实现声明。1组CL00对应2教材课，本批2组对应4教材课；课程与教学组不混数。

既有26有限批次只是执行提案，不是Finn确认的总量/时间。原CL-01提案有3/5/7三组，现在仅3/5完成本地准备，不能把CL-01全标完成。建议下一有限批只做7–8课，沿用相同六题库/保留教材/开放待审边界，通过后再接9–16课；雅思轮换和阶段检验继续复用已存在16次IELTS、checkpoint支持，不新建多入口或重复作者的雅思题。

串行整合验收：选定课程/题/source/sidecar全隔离；CL00原键、老动作及失败保护不回归；原文/原声/漫画确实加载本课；独立首答保留，帮助或错误需订正；路线上仅一个下一步，1→3→5后正确回到既有7入口；等待/Today到期显示为本课自己的事实；map/FSRS证据独立；未知备份/课程保留原文；publisher在正式构建上重新测保存、冲突恢复、播放和手机。自然24小时和自由表达另由真人完成，不从模拟日志推断。
