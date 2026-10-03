# IELTS 原创情境词义第二批 · 本地冻结交接

2026-10-03，R19/R20/R21/R22 词汇完整性线的有限内容交付。独占本批新数据、测试及证据；发布与部署由唯一 publisher 统一处理。本批没有独立 push、merge 或 deploy。

## 基线与分母

本批开始时 fetch 真实远端，两发布分支 `codex/english-studio-online-20260926` 与 `codex/ielts-map-20260930` 均为 `15505c43a1f35b8b7a60830b3bb7cc0e826f1d40`。已核候选父提交 `d717bad909d889fd305d667bd1d8530883aaf23a` 及本地 WARMUP 产物收据。隔离分支 `codex/ielts-vocabulary-batch02-20261003` 以真实远端为起点；未编辑共享主目录。

`node scripts/audit-ielts-vocabulary-batch02.mjs` 调用现有全目录审计并写入可复算汇总 `docs/verification/ielts-vocabulary-batch02-coverage.json`，绑定输入文件及资源摘要。它读取已冻结目录和来源台账，不重新调查 PDF 或使用用户学习记录。

| 口径 | 实际数量 | 限制 |
| --- | ---: | --- |
| 全目录课程 | 348 | 教材课程目录 |
| 规范教材词头 | 3,356 | 非义项数 |
| 教材词头出现记录 | 3,626 | 同词跨课可重复 |
| 有双语候选词头 / 出现记录 | 3,057 / 3,279 | 候选词形不证明语义或教材来源核定 |
| 已登记原创教材词头 / 例句义项 | 315 / 420 | 审校子集，不能当全教材分母 |
| 未登记到原创例句表的教材词头 | 3,041 | 不等于教材没有例句 |
| 已声明教材目标义项 | 275 | 来源测试覆盖的有限目标集 |
| 全教材打印义项 / 全 IELTS 词义总量 | 未知 / 未定义 | 不计算伪全覆盖百分比 |

冻结 R19 主表 56 项（51 interpretation、5 identity）；尾表六项 `regularly / throw / any / ready / lancaster / lorry` 全义未确认，其中五项完整打印释义为空。本批关闭零项，不用原创情境替代合法教材原始证据。来源 owner 的数据和审校范围均保持原状。

## 本批实际覆盖

新增 24 个原创词义，四用途各六个：

- 听力：eligible、entry requirement、application、deadline、proof of identity、valid；对应报名资格、申请提交、时间与证件、车票限制。
- 口语：supportive、practical experience、responsibility、compromise、rewarding、belonging；对应工作经历、协作与归属感。
- 阅读：representative、finding、scope、limitation、distinguish、plausible；对应研究样本、发现、范围、局限、分类与解释可信程度。
- 写作：percentage point、percentage increase、remain stable、peak、marginal、substantial；对应百分点与相对增幅、趋势及程度。

每项有选义短语题面、真实用途、情境、准确释义、自然双语原创例句、双语搭配、消歧和本站原创来源标签。全部为本项目撰写的教学材料；例句数字和背景为虚构，不是 IELTS 官方试题、教材原句、收费/共享牌组或用户记录。

先前 12 种子及上线首批 48 项 payload 完全不变，SHA-256 为 `2b42bd1a7e5077bb8d0e1e6c495e999ff94903a6172629c31dae228e4a8d74d0`。新增提示未重复旧 60。接线后集合 84 项，双语例句/搭配/IELTS 来源均 84；明确消歧 72，旧 12 种子仍未补显式消歧。本批不是全部61需求或 R19/R20/R21/R22 的完成声明。

## 审校与验收

独立 `ielts_batch02_review` 首轮仅收到 id、词头、英文题面和英文例句，未看到中文答案，24 项盲审为 18 pass、5 pass_with_note、1 needs_revision。保留原盲审记录和输入；随后逐项对照全部释义、中文、搭配、题面和消歧，修订并重新读取后 24/24 pass。修订：课程准入对象、下午截止时间、双方周末让步背景、学院录取统计对象、car journeys 不猜本人驾驶。两个百分比义项的 2 个百分点与 20% 相对增幅分别核准。签字证据绑定最终数据 hash，修改数据会使内容测试失败。

通过的必要检查：

```sh
node scripts/audit-ielts-vocabulary-batch02.mjs
node scripts/test-ielts-vocabulary-batch02.mjs
node scripts/test-ielts-vocabulary-r20.mjs
node scripts/test-flashcards.mjs
node scripts/test-flashcard-sources.mjs
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js app/data/ielts-vocabulary-batch02.ts app/ielts-flashcard-examples.ts scripts/audit-ielts-vocabulary-batch02.mjs scripts/test-ielts-vocabulary-batch02.mjs scripts/test-ielts-vocabulary-r20.mjs scripts/test-flashcard-sources.mjs scripts/test-flashcards.mjs
node map/prepare-curriculum.mjs
node node_modules/vite/bin/vite.js build --config vite.static.config.ts --configLoader runner --mode online --outDir work/ielts-vocabulary-batch02/build
```

新测试验证 24 个真实组件翻面回调、翻面前例句隐藏、翻面后双语/搭配、英中搜索、旧 60 内容及实际 FSRS 卡片/历史不变、新记录真实进度文件生成及读回、84 项重复添加幂等。旧首批 48 内容 hash 和 12 种子 hash 仍通过；原15个调度行为场景、275个来源目标真实回调及来源隔离测试通过。没有更改 FSRS 算法、排程、namespace、主页、用户记录或原 NCE 数据/UI。

真实 IAB 浏览器在全新 `http://127.0.0.1:4177/standalone.html#/words?tab=review` 本地 origin 验收：0 张起步，单独加入新百分点卡→正面英文→翻面释义与双语例句/搭配/原创来源→刷新仍保留 1 张及已翻面状态；批量加入后 84 张，当前新卡未重置；英文 percentage 检索两义、中文身份证明检索一个新义；对新卡 Good 后刷新，84 总卡、83 首次回想及撤销评分入口保留。390×844 页面无横向溢出（clientWidth=scrollWidth=390）。截图位于忽略目录 `work/ielts-vocabulary-batch02/desktop-flipped.jpg` 与 `mobile-flipped.jpg`。桌面下载/系统保存选择器未另做人工文件写入验收；实际进度文件生成/读回由模型合同测试验证。构建通过，仅已有大 chunk 警告。

## 文件归属和整合

内容交付文件（六个新文件）：

- `app/data/ielts-vocabulary-batch02.ts`
- `scripts/audit-ielts-vocabulary-batch02.mjs`
- `scripts/test-ielts-vocabulary-batch02.mjs`
- `docs/ielts-vocabulary-batch02.md`
- `docs/verification/ielts-vocabulary-batch02-review.json`
- `docs/verification/ielts-vocabulary-batch02-coverage.json`

最小接线另列为第二个 commit，仅四文件：

- `app/ielts-flashcard-examples.ts`：导入/追加24，集合介绍计数更新。
- `scripts/test-flashcards.mjs`、`scripts/test-flashcard-sources.mjs`：现有集合计数60→84。
- `scripts/test-ielts-vocabulary-r20.mjs`：仍固定首批48/种子12/内容hash/旧卡保持断言；首次批幂等针对原60，当前集合和bulk回调断言84，并逐个核旧卡不被重置。

两个提交必须按内容→接线顺序一起整合；内容提交独立尚未接入集合，新增验收测试需要接线提交。若 publisher 基线又前进，仅人工重放这四处小接线并重新运行上述验收，不覆盖他人数据/UI。构建需 publisher 自己的已授权源资产与锁定依赖；本批临时依赖及在线源产物链接仅只读复用，未提交或输出到共享目录。未声明关闭源码不明缺口，没有重做冻结 PDF 来源工作。
