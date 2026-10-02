# 推荐起点的真实进入验收与最小修复

本批独立追加在稳定候选 `bd5d1f731dc4c2d7e1cf213485c75af903d47fa1` 后，不重写此前提交，不改 stage/video 作者已使用的基线。未 push、merge 或 deploy。

## 实际阻断

真实按钮检查发现：推荐的经典教材语法链接能打开对应资料，但继续进入原生地图学习时仍被章节前置条件阻挡。推荐卡和资料页可见不等于完成能力分流，手动全部解锁也不算能力证据。

| 代表 | 原推荐按钮 | 原生学习结果 | 修复后入口 / 最终实际路由 |
| --- | --- | --- | --- |
| 一册中段 foundation | `/#/nce/NCE1/25?tab=grammar` | “继续本课学习”至 `/map/#/learn/nce1-25`，显示“这一课还没有开放” | `/map/#/learn/nce1-25?access=1` → `/map/#/learn/nce1-25`，第25–26课真实课程训练 |
| 二册起点 bridge | `/#/nce/NCE2/1?tab=grammar` | “继续本课学习”至 `/map/#/learn/nce2-1`，显示同一锁定页 | `/map/#/learn/nce2-1?access=1` → `/map/#/learn/nce2-1`，第1课叙述教学 |

这两种结果代表不同文字证据下的有限起点，不是标定后的“低/高能力等级”。最高的短阅读样例沿原 `/#/ielts?tab=course&task=sample-academic-reading`，此前8组真实浏览器流程已验证进入现有“用通知找到依据”样例工作区，本批不重跑或扩大其证据范围。

## 最小接口与作用范围

新增 `entry-access.ts` 的 `placementEntryHref(state, map, now, online)` 只接受当前已明确选中的有效试学建议。通过已有 `parseRoute` / `mapUnitId` 找教材单元，再调用已有 `courseAccessHref`。已可访问的课不添加 intent；锁定的课使用已有单节点 `?access=1`。非教材的阅读样例沿原链接，离线使用原经典 hash 链接。

`PlacementProps` 仅新增可选 `trialHref?: string`，宿主传入真实试学目的地；没有改题面、阈值、首答、帮助、曝光、评分或推荐判定。`placementHostTasks` 用同一目的地为 Today 的 `placement:trial` 替换 href，诊断恢复项及其他队列保持原行为。共享生产源码只有 `app/today-practice.ts` 两处替换；其余改动在 `placement/**`。

没有改 map/content/main/model 或课程 selector。访问由既有 map host 在用户点击后消费，必须先确认现有 guarded map save；`unlockNode` 仅加入一个单元 ID。选择建议和查看 Today 时地图原文不变，不提前授予访问，不修改 `access.all`。课程自身进入时可能正常创建空训练草稿，或保存开始学习时间/位置；这些不是诊断写入或完成证据。

## 真实 UI 证据

已用两个真实 online Vite entry、全新本机 Chrome、合法的合成已完成诊断事件，以及实际“选择这个试学起点”/“打开建议的试学”按钮核验。既有课件目录仅作只读 fallback。没有点“全部解锁”，没有伪造地图通过记录。

- `entry-access-before-receipt.json`：稳定 bd5 生产构建上的两个实际经典资料 → 原生锁定页路径。
- `entry-access-after-receipt.json`：两个真实推荐按钮和 Today trial href 一致；保存确认后进入正确原生内容，access intent 从最终 URL 消费掉。
- 一册25–26课显示对应 a/an/物品位置目标及实际首题；二册1课显示叙述目标和真实听懂/看懂/自己用/检验教学步骤。
- 两次原 `access.all=false` 保持；仅加入目标 `nce1-25` 或 `nce2-1`。原一册7–8课记录、分数、完成、词卡及其他原 namespace 保留。目标没有 passed、检验 attempt 或自动成绩，chapter-14 仍 locked。
- 单节点访问保存故障：地图原文保留，intent 留在 URL，目标仍锁定，课程 workspace 未挂载；存储恢复后实际刷新，才成功打开一个目标课。见 `accessFailure` 字段。
- 零运行异常、零外部请求。五张390截图在 `entry-access-evidence/`，已逐图检查；修复前、两课进入和失败留锁均有证据，无横向溢出。
- 最终 scoped strict TypeScript 与两真实 Vite entry 构建通过，具体生产源码 hash 与构建资源 hash 在 `entry-access-build-receipt.json`。先前25项判定、8组完整诊断、6组合并验收保留，不重新宣称全量重跑。

复核（需既有依赖、资料、Chrome、本机端口权限）：

```sh
node studio/placement/tests/build-placement-host.mjs /tmp/placement-entry-access-site
PLACEMENT_ACCESS_PHASE=after PLACEMENT_TEST_MATERIALS=/path/to/existing/dist-online node studio/placement/tests/test-placement-entry-access-browser.mjs /tmp/placement-entry-access-site
```

`before` 模式需要稳定 bd5 的构建；不能对修复后构建运行 before 后声称发生旧阻断。

## 仍然有限的结论

本次修复证明所选试学课真实可进入，并保留访问与完成的区别。难度、阈值和建议课位未做人类学习者标定；听力、口语、自由写作与全面四科未测，不报 IELTS band，不把可进入或单节点开放当成掌握、四科分流完成或全部60项完成。正式合入/发布仍由唯一 publisher 决定。本批没有用户数据上传、新付费/API 权限或触及13时间档案。
