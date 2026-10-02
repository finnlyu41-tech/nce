# NCE1 13–24 六组有限内容交接

六组原创模块各18题，共108题，18段针对性讲解和6个待人工核对的开放表达。六个bank依次为诊断、跟练、撤提示换情境、订正后新题、延迟A、延迟B，各3题。首答、帮助、订正原因与重试曝光由原生产事件引擎保留。本线不注册、不发布，也不实现另一套存储。

## 基线与所有权

- 工作树：`codex/parallel-nce1-013-023-20261002`；冻结基线 `d9c7c48a7d419c230be06bf81cc956d63b124649`，初始核对的两个指定发布分支均为此head。
- 三组历史检查点：`48ce25f`。保留该commit与旧证据；其中15组旧的酒店否定短答已被当前our共同物品题替换，旧报告不能代表最终108题。
- 交付前只读复核：`codex/english-studio-online-20260926`、`codex/ielts-map-20260930`均为 `c6b9b0182317fba09d1957b9844d6edc63f51ac4`。从该head取得的生产 `model.mjs` 与本线逐字相同，SHA256为 `c6afb5d61fd46dd2fc351d8d01f039c21d2b2084eb0dd93a283ebe0ba6012a2c`。没有将本线rebase/merge到新head。
- 只写 `studio/course-loop/parallel-nce1-013-023/` 和 `studio/docs/parallel-nce1-013-023-*`。未改registry、公共类型、主路线、Today、CAS、FSRS或共享模型；未读取个人学习记录、录音、凭据或原13条时间profile。
- 本机祖先与工作树未找到适用AGENTS或`.agents/skills`；既有Obsidian规则入口不可用，没有另建知识库。沿用仓库交接入口。
- 唯一整合发布负责人：task `01a0fa39-c2a2-7239-87b4-b0a9c091f0ba`；本线没有push、merge或deploy。

## 教材目标与准确来源

| 节点/教材课 | 本批受限目标 | 原教材语法页 |
|---|---|---|
| nce1-13 / 13–14 | 单件颜色问句；his/her明确所属与当前颜色；it回答颜色 | 30–32 |
| nce1-15 / 15–16 | 按音素选a/an；多人Are国籍/职业问句；we/they短答及our复数物品 | 34–36 |
| nce1-17 / 17–18 | their jobs职业问句；they are+复数职业；多人指示距离、状态与否定 | 38–40 |
| nce1-19 / 19–20 | am/is/are状态；him/her/us/them接收者；be状态问句与短答 | 42–44 |
| nce1-21 / 21–22 | his/her/our/their物主限定词；Give me a/an单件物品；Which名词/one与颜色选择 | 46–48 |
| nce1-23 / 23–24 | Give+宾格+some+复数物品；Which复数名词/ones；ones按位置选择多件 | 50–52 |

每课`lesson.source`绑定自己的groupId、languagePath、原课文sourceSha256、漫画key、三段clip标签与准确原行时间边界。原课文、音轨和漫画只引用原资源，没有复制整套媒体。偶数课练习目标不冒称在奇数课录音直接出现：相关clip标签/supportNote明确这一点。六个漫画页文件字节hash与索引、原课文sourceSha及语法页已直接核对。完整元数据和逐文件hash在`parallel-nce1-013-023-frozen.json`。

练习为手写场景，限定格式会在不同bank重复；例如六次their jobs问句仍是同一受限结构，不能把18题说成18种新句式。不同群体、物主、物品数量、状态、接收对象与位置提供已明确的事实变化，不以匹配结果推断广泛迁移或提分。

## 直接绑定接口与整合接点

六个`lesson-nce1-013/015/017/019/021/023.mjs`均导出：

```js
import * as content from '../course-loop/parallel-nce1-013-023/lesson-nce1-013.mjs';
const model = createCourseLoopModel(content);
// content.lesson, content.questions, content.byId, content.questionsFor, content.matches
```

生产factory直接接收模块；保留模块自己的`matches`。本地matcher只处理大小写、空白、弯引号和题目允许的末尾标点，不移除否定、人称、时态、内部词或标点；不使用NFKC。问句须一个?或？；陈述允许无标点或单个句号/感叹号，问号不会被吞掉。有限未匹配不能被宿主改写成“任何自然英文都错误”。

发布方需要的共享修改仅为显式注册六课、扩展`CourseId`及source课号/comicKey联合类型，并把单一路线接成11→13→15→17→19→21→23→旧25。现有registry键规则继续生成各课`nce-course-loop-v1:NCE1-n`和`nce-course-loop-inputs-v1:NCE1-n`；本线没有创建或写这些正式键。未知/跨课原文必须保持可恢复。没有新factory或存储接口要求。

内容测试中的“候选未注册”断言刻意冻结本线基线；发布方注册后须改成正向宿主集成验收，不能将冻结断言当作新课正式保存、路线或Today通过的证据。所有整合应在发布方当前head重新验证。

## 最终审阅与复现

两个独立AI审阅者只读取题干、情境与自己的Boolean探测结果，无答案键或课程源码。最终108首答全部通过；2092探测（616正例、1476反例）无不匹配、无未解决问题。13/15/17为792例，19/21/23为1300例；最后our题24例、she/is题38例。最终题干SHA256分别为 `b1c09ecaf7613b74797693da03857d69e5d27a36afbf366b1e7c5ec6596428a2` 和 `5bb606abbd284188ce8e25797821f9a9572246516702bf25ef138b0e011253bd`。

保留最初歧义与修复记录：接受颜色of/所有格自然变体与What're；明确be/给定词范围，Give的双宾语顺序，Which两词短句与ones位置短语，移除新repair题冒称重写旧题的说明。最后our题限定主语起句，she题明确不增加now；这些最后题干变动全部复核。自然works/feel/to结构和同义词若不在受限题范围，可用于人工核对的开放表达，不称为错误英文。

从仓库根运行（Node22；资产根是已有教材包，只读共享）：

```sh
NCE_ASSET_ROOT=/absolute/path/to/studio/dist-online node --test \
  studio/course-loop/parallel-nce1-013-023/test-content.mjs \
  studio/course-loop/parallel-nce1-013-023/test-source.mjs \
  studio/course-loop/test-model.mjs
```

最终62项全部通过：33项内容/直接生产factory/隔离，6项源资产，23项原CL00回归。覆盖帮助、首答不可覆盖、订正与原因、重试非fresh、合成24h/7d/1d、两套题用尽、跨课和未来版本原文保留。未变换生产模型源码或建立fixture store。

```sh
NCE_ASSET_ROOT=/absolute/path/to/studio/dist-online node \
  studio/course-loop/parallel-nce1-013-023/test-preview.mjs
# 只重测变动课程：另设 NCE_PREVIEW_COURSES=15,19
# 手工审阅：使用同目录preview-server.mjs输出的127.0.0.1 URL
```

隔离浏览器原六课36项检查通过；最后变动15/19另跑12项通过，均零运行异常。真实原课文与对应漫画加载、独立题撤示范、延迟反馈、错误首答与订正并存、开放待人工、刷新清空及无localStorage/IndexedDB写入都检查过；320/390 CSS视口截图已实际查看。Chrome使用本线新建临时资料并清理，未读用户浏览器资料。页面只有内存答题，没有正式host/store，延迟题的正确性与到期流程用真实factory合成时间测试，未通过页面伪造自然24h。

交付包含合并增量patch、两commit mbox、当前源码与hash manifest、当前prompt-only材料/独立首答/最终探测，以及单独标注的历史证据。`parallel-nce1-013-023-checkpoint-1.json`保持历史内容不改，最终状态以`parallel-nce1-013-023-frozen.json`为准。

待发布方验收正式registry、保存/CAS、Today、路线和原声播放；待真人验收开放表达、自然24h/7d、实际听感与实体手机。本线没有学习效果或Band声明，六组到此有界结束。
