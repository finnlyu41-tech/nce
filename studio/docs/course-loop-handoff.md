# 全课程学习流程与路线闭环 · 交接

本批只完成 **NCE1 第 1–2 课的一组完整原创微目标、纯模型和独立预览**，供唯一发布负责人串行接线。没有改主导航、全局模型、Today、音频、打包或既有资料；没有推送、合并、部署。18 道题覆盖文字问句、肯定回答与请求重说，不等于第 1–2 课全部语言能力。

## 源码和范围

2026-10-02 本机只读定位的 `english-studio` 停在 `a49b061`，`english-ielts-map-20260930` 停在 `b46812e`。随后通过 GitHub ref API 与独立 fetch 核对两条指定远端分支，均为 `0ae75f9decab83a2969fed6ca6e6838585c217b6`。本批隔离 checkout 基于该点，分支 `codex/course-loop-20261002`；没有以 main 代替。`0ae75f9` 是源码证据，不是其已发布证明。已知 v25 固定站和运行源码仍按发布者记录：`https://a62c9ce1.finn-english-studio.pages.dev/`，`c64e3fa3a031b477a5c1cdf26172df9fd4206fcd`；本批未重验线上。

已检查两个已有本机路径及当前远端树中的 AGENTS、`.agents/skills`；均未找到可读项目规则。`.agents` 是忽略目录，远端缺失不能证明云端没有专用规则。Obsidian 技能所列两个本机根目录及连接器 `/Obsidian on Dropbox/AGENTS.md` 不可用，未创建替代库。既有仓库交接仍是上下文依据：`yesterday-demo-handoff.md`、`yesterday-review-adapter.md`、`ielts-release-integration-20261002.md`、`map-reliability-handoff.md`，以及各当前运行模型。

未读取凭据、会话数据库、用户学习记录或录音；未触碰其他工作树和 13 条真实时间验收档案。本地 Chrome 使用新建的任务专属空 profile，只访问本机预览。

## 实际覆盖与缺口

[348课次清单](course-loop-courses-coverage.csv)、[276教学组清单](course-loop-groups-coverage.csv)、[支持课程清单](course-loop-support-coverage.csv) 按资源、先试、讲解、独立题、反馈、延迟复习、路线和来源逐行列明；[审计输入与哈希](course-loop-audit.json) 可复算。CSV 为源码盘点，不是逐课真人验收记录。

| 当前对象 | 实际数量 | 本批判断 |
| --- | ---: | --- |
| 教材课次 | 一册144、二册96、三册60、四册48，共348 | 四册原书与经典教材工作区仍可用 |
| 教学组 | 72、96、60、48，共276 | 一册奇偶课共用听读组，不能重复计成288组 |
| 地图串联 | 一册72组+二册96组=168组，14章 | 余下108组可在经典教材入口学习，不是“不能学” |
| 漫画绑定 | 一册72组 | 其他册使用已有全文/原声回退；未声称新增漫画 |
| 共享语法 | 97知识点、28单元、168题 | 有真实内容与交互；同一题关联多课，不等于各课专属新题 |
| IELTS小课 | 每考试类别8课，16个session，66份去重材料 | 有逐步题目、原答/订正、有限延迟题；不是Finn确认的总量 |
| 其他保留内容 | 36原创备用课、11旧IELTS任务、37旧路线节点 | 明确为兼容/备用；不再把它们推出为多个推荐入口 |
| 地图起步/阶段/终点 | 3起步、14作品、12外部专项、3终点证据节点 | 作品/外部任务有真实表单，说明文字本身不是新试卷 |
| 已认可demo | yesterday独立流程 | 复用其先试/帮助/曝光/延迟规则依据；不冒称已逐课推广 |

逐课缺口主要是：没有教材组专属的前测及按错因安排的讲解；地图测验主要从已学课文抽句，后续加共享语法题；经典练习取共享讲解例句/练习的三个变体。它们可以训练回忆，不能因换抽句或换顺序就记作陌生情境迁移。当前源码没有逐组落实已认可的完整五步链，所以276行都标 `not-established-per-lesson`；这不抹掉既有真实题目、保存和排程。

经典 `learning-plan.ts` 按下一日午夜排程、以不同日/不同variant看间隔证据；地图 `model.ts` 使用至少24小时的模型。二者不能混写。现有地图先走完14章再分听读写说，尚未实现“数课轮换四科”的同一条推荐路线。IELTS小课先解释/示范再作答，仍不是诊断先行。

## 本课已经做出的内容

`course-loop/lesson-nce1-001.mjs` 包含六组各3题：先试、跟练、无提示新情境、订正后的另一情境、复习A、复习B；另有一份开放问答草稿和人工核对要求。全部新增情境是原创，教材正文、图像和音频没有复制进包。任务词义就地提供；独立题不增加新句法或强制新词记忆。独立文本输入对完整句子核对；请求重说为选择题，因此只能说明受限文字表现。

1. **先试**：不先展开讲解/答案。允许明确记录“暂时不会”，记为未答对而非静默跳过。真实首答不可覆盖；不会以“看过/练过”代替答案。
2. **针对性学习**：先展示本次错答或有帮助的目标，再补其余两点。这里接入既有课文、原声和漫画，听全篇了解场景，再回听三个原声片段；跟练有示范。
3. **撤提示**：进入不同情境后收起教材、句架与答案。每题有独立曝光ID；学习材料访问与测验题曝光分开记录。主动看提示/教材会把当前题记为有帮助。
4. **反馈重试**：保留首答，错误或有帮助的独立题要另存订正及原因；再做新的修补情境。修补错题可重试，保留全部原答，同题重试永不变成“首次新题”。开放草稿只记待人工核对；空稿记未记录。
5. **延迟复习**：实际结束后24小时才可开始A；三题真实完成后，无帮助新题全对按本地安排再隔7天，否则1天。B用完明确需要新材料，不能把同题包装成新迁移。打开页面、逾期、刷新均不补造作答。模块不发站外提醒。

这两个间隔是沿用demo的教学安排，不是已验证的掌握阈值。简单问答的答案句型会重复；题目情境与ID不同，结论仍局限在这些短句目标，不能推断完整听说能力或提分。

## 给父对话协调的精确接口

新增文件内已提供 [host-contract.d.ts](../course-loop/host-contract.d.ts)。推荐接入现有 `State.drafts['nce-course-loop-v1:NCE1-1']` 字符串，由宿主现有写入器和整站备份维护；**这是待所有权确认的接线提案，本批没有创建这个key，也没有读写任何存储**。不把dueAt再复制到地图、词卡FSRS或yesterday适配器。现有yesterday适配器硬编码单一能力，不能直接改ID套用。

| 待协调共享文件 | 需要的接口/行为 |
| --- | --- |
| `map/learning.tsx`、`map/course.tsx` | 对`nce1-1`挂载一次一题流程；将真实host snapshot传入，失败时留住输入；原先课程仍可访问 |
| `map/course.tsx`、`map/lesson-reader.tsx` | 学习阶段展开既有LessonReader；离开学习阶段收起。主动查看先提交`source`帮助事件再打开，返回后恢复原题 |
| `map/media.tsx` | 复用现有ClipButton，NCE1课1片段18.26–21.44、21.44–23.17、26.73–29.49秒；成功/失败仍按现有播放器，不改其callback。`source`只表示访问，不冒称可听成功 |
| `app/model.ts` / `app/progress-file.ts`、实际状态写入宿主 | 验证draft大小/版本、原文比较和失败回执；快照含所有事件、首答、订正、曝光及时间。以共同锁内的新鲜读取+预期raw/revision比较+写后回读确认；不可用和冲突不报已保存。未知新版本保留raw供恢复 |
| `map/current-route.tsx`、`map/content.ts`、`map/model.ts` | 由父对话协调单一推荐选择器及完成语义；纯`recommendation`只返回resume/review/continue-route/needs-new-material，不直接授予旧地图achieved/stable或改解锁 |
| `app/today-practice.ts`、`app/today-practice-ui.tsx` | 只读同一快照的到期/半途事项，恢复后与focus/storage等实际事件重读；不再创建第二份计划。此前口头占位名`capability-today.ts`不存在，此表是核实后的真实文件 |
| `scripts/package-standalone.py`及实际构建入口 | 由发布者决定模块集成方式；本地preview不是公开产品入口，不自动复制/加入白名单 |

纯调用：`initialState(at)` → `transition(snapshot, action, at)` → `inspect(snapshot, now)`；`restore(raw, now)`失败返回原raw；`receipt(view, now)`给出有限证据；`recommendation(view, now)`不写状态。时间由宿主真实时钟传入，预览使用Date.now；测试注入时间仅在模型测试。

提交成功只生成候选快照。宿主应串行提交：保留当前输入，锁内重读并比对expectedRaw/revision，验证候选，写入并回读确认后再推进“已保存”的页面。冲突返回最新宿主状态，但不静默覆盖当前输入。重复按钮需复用同一候选/防重复事件；本模型会拒绝重复submit/finish，但宿主仍须处理异步pending。备份恢复应完整往返事件，而不是只保存最后正确句。连续未提交的草稿输入会合并为最新值，避免逐键膨胀；提交的首答、重试、帮助和订正事件不合并。

## 有限执行队列与验收

[26个有界批次](course-loop-batches.json) 将276既有组各列一次，是工程队列提案，不是Finn确认的总课时、必修总量或新课程数量。CL-00只做本课；CL-01做第3–8课的3组；CL-02做第9–16课的4组；CL-03做第17–24课的4组。后续按现有12组章节拆分。三/四册只作缺口补充队列，不强迫先刷完。

每批均须交真实题干/键/错因/独立材料/两组延迟材料、学习与测试曝光分离、保留原声和漫画的行为、保存失败及恢复测试，并在负责人精确构建上走通一次先试→学习→新题→订正→到期接口。只有具体内容与交互都验收后才将覆盖状态提升；没有空模板题算完成。

轮换提案为每3个教学组插入一个相称难度的小任务，依听→读→说→写轮换，每12组做阶段综合检验。同一继续按钮决定下一步，目录仅供按需查看；恢复未完输入、错题修补、真实到期优先。初章不能直接把初学者扔进较难的hub材料，需要先审前置条件或编写真正初阶任务。现有每类别8个IELTS小课按难度合适时复用；其他作者负责的新题型不重复创作。本批没有注册轮换节点或声称阶段检验内容已经齐备。

## 验证与交付状态

- **已实现**：18题、针对性学习顺序、首答/帮助/曝光、订正/重试、开放草稿标记、2组延迟复习、纯接口及内存预览；348/276/支持对象清单、源码哈希和有限批次。
- **已测**：23组Node内容/状态场景；4组覆盖/来源检查；Chrome 154新空profile上的8组真实页面验收（CDP鼠标与文字输入），涵盖先试隐藏、针对性讲解、无提示新题、首答订正门槛、修补重试、实际未来到期、待核对文案、零存储、刷新如实清空、360px局部无溢出、零运行异常。此局部预览不重复v25的320/390手机QA。
- **待整合**：持久保存/CAS/备份/跨页恢复、既有原声与漫画接入、Today与单一推荐路线、地图进度语义、四科插入与阶段检验、正式构建。preview明确刷新清空，不作为已完成产品。
- **待真人验证**：18题难度/歧义与真实初学者可用性、原声真实可听及手机操作、自然24小时与7天复习、自由口语及开放表达。没有学习提分或掌握承诺。

运行：

```sh
node --test studio/course-loop/test-model.mjs studio/course-loop/test-audit.mjs
node studio/course-loop/batches.mjs --check
node studio/course-loop/test-browser.mjs
```

浏览器测试只绑定127.0.0.1，创建自身profile，不访问正式站。`COURSE_LOOP_BROWSER`可指定Chrome可执行文件。本地证据位于忽略的`studio/work/course-loop-qa/receipt.json`和`preview-complete-360.png`；模型测试报告也只留work。源码清单不包含profile或教材媒体。父对话收到契约后协调唯一负责人`01a0fa39-c2a2-7239-87b4-b0a9c091f0ba`，串行集成与发布。


## v28 accepted first-course host integration

Runtime 09a0211206a0a807bd767b432cdc3c6b66c432eb, version 2026-10-02-course-loop-host-v28; fixed deployment https://3acf093f.finn-english-studio.pages.dev and existing production https://finn-english-studio.pages.dev agree. Both existing release refs fast-forwarded atomically from v27 at 07:10:43 UTC, no force push. The accepted v27 checkpoint remains immutable at https://d9165822.finn-english-studio.pages.dev, runtime 753b1280aa7f88bb47fe27e825e0db77638fe421, version 2026-10-02-guarded-autosave-v27.

CL-00 cbee91e was integrated as unchanged authored content at f941a809; actual host wiring is the separate 09a0211 change. Only NCE1 lessons 1–2 now use this continuous text practice: diagnosis, targeted teaching, guided retry, independent originals, separate correction/reason, new-context repair, own expression and delayed new banks. The first exposure and every transition must be confirmed in existing State.drafts before presentation advances. Correction inputs use a second entry in the same drafts dictionary and whole-site backup. Envelope/version/capacity failures preserve raw; full-State transaction guards protect namespace writes, unrelated entries rebase, and same-course conflicts preserve/export queued inputs. Late focus reads recheck epochs, input revisions and confirmed references. Failed-save typing stays queued, new typing invalidates an earlier pending export, and leaving waits for confirmation. No independent database or scheduler was created.

The existing media player, verified language rows, original audio and source-bound comic are reused. Source access is recorded before showing help and the panel closes at each new question. The shared next selector drives Today and map continuation; waiting recommends a successor while keeping advanced routes, original access gates and map completion separate. Neither course viewing nor constrained text answers produces FSRS grades, map passes, hearing proof, speaking approval or Band.

The collection-import writer now shares the guarded protocol: audio and State commit in one compare/write transaction, the workspace serializes it with pending ordinary saves, acknowledges the committed baseline, and preserves later local edits. The native boundary case imports real text/audio while another page's course draft survives, without false counter/save conflict.

Accepted on local, fixed deployment and production separately: 13 native course groups, 3 native writer-boundary groups, 3 v1/v2 restore-race groups, 5 ordinary save/label/FSRS-undo groups; Runtime exceptions 0. Also 19 real IndexedDB/Web Lock cases, 23 finite model cases, 4 source coverage audits, 8 host/selector boundary groups, 49 Today regressions, 14 ordinary merge groups, 26 TSX/backup source adapter cases, strict TypeScript and online/map/offline builds. Provider Production/main and 44 public SHA256 checks match; 1950 files passed the publishing allowlist. Eleven protected files remain byte-equal to v26, including FSRS, progress file/UI, IELTS parser/model/callback fix and map media.

Evidence is course-loop-deploy-receipt.json, course-loop-public-hashes.json, course-loop-real-store-receipt.json, course-loop-protected-source-equality.json and twelve native receipt directories. QA-only interruptions remain available: navigation before confirmation triggered the real before-unload guard; rollback control text and repeated-download filenames were corrected; foreground focus correctly loaded fresh course state, so the bounded stale-tab test uses actual native input in a background tab; an old autosave driver had captured the prior model stage before guided persistence, now explicitly waits for the durable guided session. No production source changed for these driver repairs. An early push gate refused before network/write when the last receipt was absent.

Limits: original audio loaded and playback was requested, without independent human hearing or pronunciation confirmation. 24h/new-bank/7d mechanics use a disclosed backdated native backup fixture, not naturally elapsed retention. CSS 320/390 viewports are not iPhone/Safari tests. Thirteen sealed natural-time profiles and original author/worktrees remain untouched. IELTS batch03 c7165dc, four mobile P2 items and source-integrity 6524493 proposals are separate queued candidates, not runtime changes or completed broad coverage. Source-integrity evidence-only copies are archived locally; 12 source associations, 6 editorial suggestions and overlapping 5 mapping/5 scan/57 explanation queues remain unapplied. No learning-site engineering ledger was added; the parent owns the user-visible Space record.
