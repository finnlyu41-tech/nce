# Placement：真实宿主接入候选

已实施正常 Today 入口、真实路由、现有课程继续项、诊断持久化与导航保存护栏；publisher 只需审阅和串行合入本次独立提交。未 push、merge 或 deploy。旧 `publisher-integration.patch` 仅为第一轮历史材料，不应再应用。

## 基线与所有权

隔离分支 `codex/placement-host-after-mini-20261003` 从 mini 冻结宿主接口 `97e76c9201ce661ceeb94f15e19c52c40f76e8d4` 开始。该接口依赖 mini 内容 `40273eebea90fd5aa189b0facb96d24a402d3d62`，其 publisher 本机基线为 `605a6434612171a19666ff4a70c7f48d54be7914`；先前核验两发布分支均为 `424efc1869e98cd7b19afd2c1ab7cab0e8380b4b`。这不是已发布的宿主版本声明。

原 Placement 候选 `c2e5923fda1b85a2a79f73e4fafc9f280a4a00f7` 原样 cherry-pick 为 `420ef15f71001e1b0f86a8b975376f4224215a2b`。六个冻结文件 `content.ts`、`manifest.ts`、`model.ts`、`adapter.ts`、`placement-ui.tsx`、`placement.css` 与原候选逐字一致；题面 hash 和独立盲审仍见 `blind-review.json`。

本次共享生产文件只有 `app/navigation.ts`、`app/study-app.tsx`、`app/today-practice.ts`。新增宿主位于 `placement/host.tsx`、`host-progress.ts`、`host.css`。没有改 mini 源码、map 源码、course-loop/registry/next、首页源码或已存在的记录保存修复。mini → placement 接入顺序来自 mini 已冻结接口文档；通过只读材料核实，没有向 mini 作者发送协调消息。

## 实际行为

- `/#/placement` 由真实 StudyApp 接收。先保留 `useMiniTaskHostRoute` 的接受路由和异步护栏，再组合 Placement 的接受路由；mini 分支、已知任务 ID、原 online redirect 均保留。
- Today 新入口“已有基础？做个短诊断”追加到原课程建议之后；已有原课位仍为首项。已保存诊断恢复与用户明确选中的试学项沿原 adapter 接入。入口不强制诊断或解锁。
- 宿主读取既有 State 和 map，`courseDestination` 提供当前原课程继续链接。最终只有一个保守试学建议；选择短阅读后进入既有真实阅读样例工作区。诊断不授予 map 完成、分数或解锁。
- 输入草稿可即时显示；start/曝光、首答、帮助、继续、推荐选择等控制步骤必须等现有 guarded State writer 确认提交后显示。同步忙标记阻止重复控制点击。失败时保留输入、原证据及页面，提供重试与未保存输入备份。
- document 链接、hash 切换及真实浏览器返回均等待同一保存队列。失败不会卸载诊断；离页请求恢复原 hash，刷新/关页有原生未保存提示。重试保存同一输入后才能前进。
- 唯一诊断持久化仍是 `State.drafts['placement-text-v1']`；没有第二 store。宿主以原子 CAS 重读现有 State，合并其他 namespace 写入，同时拒绝同键恢复/并发改写、删改已提交事件历史及未知原文。原首答、曝光、帮助只能沿验证后的事件追加保留。

## 验证证据

`test-placement.mjs` 25 项全部通过；包括困难、帮助、跳过、熟题、暂停、订正与首答分离、池耗尽、未知/异常数据、CAS 及其他原记录保留。宿主 scoped strict TypeScript 通过。

使用生产 `vite.static.config.ts` / `map/vite.config.ts` 的 native loader 构建真实 online `standalone.tsx` 与 `map/main.tsx`，避免向链接依赖所属树写 `.vite-temp`。构建成功；原有大 bundle 提示仍在，构建 hash 见 `host-build-receipt.json`。

真实构建页面、全新本机 Chrome 配置、现有生产 IDB writer 的 8 组浏览器验收全部通过，见 `host-browser-receipt.json`：

1. map Today 正常入口进入诊断，原课程仍在首位。
2. 首答、曝光和部分输入经暂停与真实刷新后保持。
3. 六道新题只给一个建议；整个原 State（除诊断键）和 map 原文保持不变。
4. 用户选中建议后打开现有短阅读样例宿主。
5. 注入真实 readwrite 故障：保留输入与原记录、不产生首答或完成、阻止 document/hash/浏览器返回。
6. 恢复 writer 后同一输入提交一次，并可返回原一册7–8组。
7. mini 已知路由仍进入真实 mini workspace。
8. 生产 writer 保留其他并发草稿，拒绝同键恢复、历史替换及未知原文覆盖。

没有浏览器运行异常或外部请求。320/390/1280截图逐图检查，无横向溢出；保留三张图于 `host-evidence/`。故障图中的 `QA save failure` 来自合成测试注入。浏览器测试只读使用已有 standalone 资料目录作为未改变的课件 fallback，真实入口及 JS/CSS 均来自本次构建；并非新发布站点验收。

复核命令（需要已存在项目依赖、curriculum.json、Chrome 与本机端口权限）：

```sh
node studio/placement/tests/test-placement.mjs
node studio/node_modules/typescript/bin/tsc --noEmit --project studio/placement/tests/tsconfig.host.json
node studio/placement/tests/build-placement-host.mjs /tmp/placement-host-site
PLACEMENT_TEST_MATERIALS=/path/to/existing/dist-online node studio/placement/tests/test-placement-host-browser.mjs /tmp/placement-host-site
```

最终 patch/bundle 的精确 commit 与校验和见工作目录 `placement-host-delivery.json`。publisher 如已拥有原候选 c2，可在 mini 接口之后只 cherry-pick 本次宿主与验证提交，避免重复接原内容。共享三文件若已继续变化，串行检查最小 diff，不覆盖其他作者修改。

## 尚未完成

题库是未标定的有限文字题；难度、区分度、阈值和建议课位待真人验证。听力、口语、自由写作与全面四科能力尚无证据，不报 IELTS band，不据此关闭全部60项。正式合入及部署仍由唯一 publisher 决定和执行。本次没有用户数据上传、新付费或 API 权限，也未触及13时间档案。
