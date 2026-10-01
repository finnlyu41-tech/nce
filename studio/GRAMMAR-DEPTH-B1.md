# 语法深化 B1 · 2026-10-01

独立分支 `codex/grammar-depth-b1-20261001`；基线 `7a5aa38d7c8f5f0e20357b31502d4389d682b864`。已实际核对线上版本为 `2026-10-01-yesterday-demo-v12`。首轮语法已在此基线内，本地深化交付由唯一主线串行发布。

## 精确范围与后续批次

原8单元和25个关联知识点保持原文。初始未深化72点逐项记录在 [coverage-plan.json](app/data/grammar-curriculum/coverage-plan.json)，保留真实 guideId、entryId、关联位置、阶段、先修、对比、用途、覆盖范围与剩余边界。implemented 仅指本地实现；planned 不进入完整课程，不等于已发布或掌握。

| 批次 | 基本信息 | 时间关系 | 语气与逻辑 | 长句与变换 | 合计 |
| --- | ---: | ---: | ---: | ---: | ---: |
| B1 · 高频结构：安排、被动、转述、补语与否定范围 | 3 | 3 | 4 | 10 | 20 |
| B2 · 补齐日常基础、过去叙述与词句搭配 | 10 | 7 | 6 | 0 | 23 |
| B3 · 依据推断、扩展时体、限定与假设 | 0 | 6 | 5 | 6 | 17 |
| B4 · 非谓语、信息焦点与综合改写 | 0 | 1 | 0 | 11 | 12 |
| 合计 | 13 | 17 | 15 | 27 | 72 |

本轮执行B1的20点，后52点明确保留计划。综合单元可联用不同阶段知识，guide原阶段不重新归类。过去叙述细分背景与先后、时间基点、旧习惯，避免把8点挤入同一套练习。

### B1 · 高频结构：安排、被动、转述、补语与否定范围

| 单元源ID | 建议先修 | 对比与用途 | guide ID 精确范围 |
| --- | --- | --- | --- |
| `plan-timeline` · 将来安排与时间条件 | `present-time`, `linking-ideas` | 事前打算、当场决定、已确认安排与未来时间从句；用途：plan, progress | `going-to`, `will`, `future-choice`, `time-clause` |
| `passive-focus` · 被动、交付与安排别人做事 | `sentence-core`, `past-present-perfect`, `modal-choice` | 动作焦点、时态与被动、双宾语路径、使役与待处理状态；用途：describe, progress | `passive`, `passive-forms`, `passive-double`, `causative`, `need-doing` |
| `reported-perspective` · 转述与间接询问 | `questions-negation`, `past-present-perfect` | 原话与转述视角、陈述语序、命令与请求；用途：ask, story, reason | `object-clause`, `reported`, `indirect-question`, `reported-commands` |
| `verb-complements` · 动词后接什么与表达目的 | `sentence-core`, `modal-choice` | 动名词、to do、介词后doing、目的主体与结构意义；用途：describe, plan, reason | `gerund`, `verb-patterns`, `verb-prepositions`, `purpose` |
| `negative-precision` · 不定指代与否定范围 | `noun-reference`, `questions-negation` | 没有任何一个、不是全部、两者都不与不定指代；用途：describe, compare, reason | `none`, `indefinite`, `negative-scope` |

### B2 · 补齐日常基础、过去叙述与词句搭配

| 单元源ID | 建议先修 | 对比与用途 | guide ID 精确范围 |
| --- | --- | --- | --- |
| `reference-ownership` · 指代、归属与拥有 | `sentence-core`, `noun-reference` | 人称主宾格、所有格及have与be的职责；用途：describe, ask | `pronouns`, `possession`, `have` |
| `basic-descriptions` · 性质、来源与距离 | `reference-ownership`, `comparisons` | 形容词位置、两种来源句型、实际距离与范围；用途：describe, ask, compare | `adjectives`, `origin`, `distance` |
| `giving-directions` · 指示、地点与时间定位 | `questions-negation`, `reference-ownership`, `plan-timeline` | 双宾语对象、指示、地点路径及时间介词；用途：ask, advise, plan | `double-object`, `place`, `imperative`, `time-prepositions` |
| `past-background` · 过去状态、背景与先后 | `past-present-perfect`, `present-time`, `plan-timeline` | 状态与动作、背景与事件、过去参照前的已完成；用途：story, progress | `past-be`, `past-continuous`, `past-perfect` |
| `time-perspective` · 时间标记与观察基点 | `past-present-perfect`, `past-background` | already/yet的预期与位置；ago现在基点与before过去基点；用途：story, progress | `already-yet`, `ago-before` |
| `habit-change` · 旧习惯、习惯于与说话者评价 | `past-background`, `verb-complements` | used to do、be used to doing与always进行时；用途：describe, story, reason | `used-to`, `be-used-to`, `always-continuous` |
| `linked-vocabulary` · 搭配、例外与程度变化 | `noun-reference`, `comparisons`, `linking-ideas`, `verb-complements` | 小品词位置、例外范围、相同与不同、程度结果与同步变化；用途：describe, compare, reason | `phrasal-verbs`, `except`, `same-different`, `so-such`, `double-comparison` |

### B3 · 依据推断、扩展时体、限定与假设

| 单元源ID | 建议先修 | 对比与用途 | guide ID 精确范围 |
| --- | --- | --- | --- |
| `modal-evidence` · 依据、可能性与过去能力 | `modal-choice`, `past-background` | 确定度、现在与过去推断、一般能力与一次成功、未实现可能；用途：reason, advise, story | `may`, `deduction-now`, `deduction-past`, `past-ability`, `could-have` |
| `extended-timeline` · 将来过程、截止点与安排 | `past-background`, `plan-timeline` | 未来某时过程、届时完成与即将或按安排发生；用途：progress, plan, story | `future-continuous`, `future-perfect`, `future-be` |
| `duration-perspective` · 持续过程与不同参照点 | `past-background`, `past-present-perfect`, `extended-timeline` | 持续到现在、过去或未来；持续过程与完成结果；用途：progress, story, plan | `perfect-continuous`, `past-perfect-continuous`, `future-perfect-continuous` |
| `relative-reference` · 限定对象与补充信息 | `noun-reference`, `negative-precision` | 限定对象、宾语关系词省略与逗号补充信息；用途：describe, reason | `relative`, `relative-omission`, `non-defining` |
| `hypothetical-condition` · 现实、假设与过去反事实 | `linking-ideas`, `past-background`, `modal-evidence` | 现实可能、现在假设、过去未发生与as if视角；用途：plan, reason, story | `condition-unreal`, `condition-past`, `as-if` |

### B4 · 非谓语、信息焦点与综合改写

| 单元源ID | 建议先修 | 对比与用途 | guide ID 精确范围 |
| --- | --- | --- | --- |
| `requests-nonfinite` · 非谓语的参与者与时间 | `verb-complements`, `passive-focus`, `relative-reference` | 要求谁做、主动与被动、分词附加动作、独立主语与先后；用途：describe, advise, story | `object-to`, `nonfinite`, `nonfinite-passive`, `participle`, `absolute` |
| `information-focus` · 内容焦点与评价表达 | `reported-perspective`, `relative-reference`, `passive-focus`, `modal-evidence` | 形式it、that角色、可能性评价、倒装强调与客观转述；用途：reason, describe | `formal-it`, `that-clauses`, `likely`, `inversion`, `reporting-passive` |
| `structure-rewrite` · 守住原意的综合改写 | `requests-nonfinite`, `information-focus`, `hypothetical-condition`, `extended-timeline`, `duration-perspective` | 主语、时间、主被动、肯否、程度与谓语位置；用途：reason, compare, progress | `verb-review`, `rewrite` |

## 真实关联与有限覆盖

NCE2原有173次guide映射，其中非首位77次，涉及45个guide、53个教材入口。原8单元覆盖其中22次；B1新增28次、13个guide、25个入口；合并后为50次、26个guide、37个入口，仍有27次、19个guide、22个入口待后续深化。入口集合重叠，不能简单相加。这是代表内容关联范围，不能推断学习者掌握情况。

本轮新增5个完整代表单元，关联20个此前未深化的guide；新增41项形式/意义/条件、34组对比例句、38处错例说明、30题和60级提示。合计13单元、45个关联guide、78题，仍不代表45份guide的全部细项已穷尽。

B1每guide证据在 depth-b1/*.coverage.json：形式、意义、使用条件、对比例句、错例及真实题目ID均可定位；scope/remaining说明已教和未穷尽的边界。新例句为本站原创；NCE联系来自既有真实映射，IELTS仅是练习用途，没有官方考纲或分数预测。

## 接口与进度

保留 GrammarUnit / GrammarPractice / State.drafts 及开放表达接口。接线仅 app/grammar-curriculum.ts 导入5个独立对象；不改model、导航、今日路线、录音或闪卡。原8单元、题目ID及grammarCurriculumVersion=1保持一致；新单元使用原grammar-curriculum-v1-<unitId>可选草稿键，不清除旧证据。

识别同时辨析形式、意义与理由；改错保留明确的信息；造句换到未在教学展示的新情境并给必要词语。提示两级且保留跟练标记，重做切换实际变体。开放表达沿现有课次/目标与待核对状态，有限参考匹配不替代自由表达准确性判定。

## 校对参考

仅核对边界，不复制例句：未来形式可重叠，见 [British Council · Future forms](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/future-forms-will-be-going-present-continuous)；普通时间从句与特殊will，见 [British Council · Time and if clauses](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/verbs-time-clauses-if-clauses)。转述视角及非机械后移，见 [Cambridge · Indirect speech](https://dictionary.cambridge.org/us/grammar/british-grammar/reported-speech-indirect-speech)；安排别人做与自己做，见 [Cambridge · Have something done](https://dictionary.cambridge.org/us/grammar/british-grammar/have-something-done)。

## 验证记录

最终本地检查通过：

- TypeScript全项目类型检查与变更代码ESLint。
- test-grammar-curriculum.mjs：13单元、78题、39次实际组件答题，提交前反馈隔离、两层提示、重做、24小时边界、未来时间、旧进度兼容；真实保存/导入往返样本13626字节。
- test-grammar-depth.mjs：原8内容指纹不变，72台账精确、20条证据引用、后52点仍计划，先修无环，348课次检索、非首guide目标、30新题、陌生造句与React列表键唯一。
- 既有教材语法、学习闭环与进度保存回归通过。
- 独立预览、经典在线、经典离线及map在线构建通过；保留既有Vite大包提示。经典与预览包逐一核对包含最终30题题干，避免最后内容修订遗漏。
- 两位内容作者互审，第三位审查全部30新题；发现的照抄造句、过于明显的干扰、重复改错及可成立英语错例均已修正。

浏览器验收未完成：浏览器控制通道和Codex app工具连接关闭，无法实测本轮320/390像素页面、地址恢复与真实跳转。上面39次交互来自实际TSX的内存事件环境，不是浏览器截图或真机。主线发布前需补浏览器验收，不声称本轮已上线。

本地预览：

```sh
cd studio
node node_modules/vite/bin/vite.js --config previews/vite.grammar.config.ts --configLoader runner --port 4198 --strictPort
# http://127.0.0.1:4198/previews/grammar-curriculum.html
node node_modules/typescript/bin/tsc --noEmit
node scripts/test-grammar-curriculum.mjs
node scripts/test-grammar-depth.mjs
node scripts/test-textbook-grammar.mjs
node scripts/test-learning-plan.mjs
node scripts/test-progress-save.mjs
```

测试使用已有发布工作树的只读依赖（包含锁定ts-fsrs 5.4.2），没有改依赖清单、全局schema或主工作树。生成课次仅复制公开JSON到本独立工作树。构建和验证摘要在忽略目录 work/grammar-depth-b1/；每条内容/审查线的恢复副本在/tmp。

执行中整个task-4目录曾缺失，但Git分支和登记保留。仅从本工作树原index恢复相同路径，再从作者保留的正文恢复新文件、回读与重跑验证，没有清理其它工作树或覆盖主仓库。当前没有文件恢复阻塞。

交付仅本地分支与patch；不push、merge或deploy，由唯一主线在浏览器验收后串行整合。Codex app消息通道关闭时，提交摘要与本交接文档作为主线交付依据。
