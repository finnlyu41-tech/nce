# IELTS 表格主站接线 · 2026-10-02

两共享分支基线：`1cb23fdd47a297b41ed9458ab386c5ff786386dc`。独立树：`/tmp/nce-ielts-table-integration-20261002`；独立分支：`codex/ielts-table-integration-20261002`。
冻结内容076d307的16个文件保持逐文件无差异；本树对应内容提交 e3adbf88d3d4e2d5dc0ae8326f5ab2d3db969a03。六原创材料、作者153项预览证据不重写；作者预览与主站宿主证据分别保留。

运行接线修改三个既有文件，第三文件已获parent明确文件所有权：
- `curriculum/registered.ts` 注册唯一Academic表格课；A15、GT14，29合法session、174材料引用、126独立材料ID，保留原14课。
- `sample-sequence-ui.tsx` 真实语义表格、已填示范、提交首答/反馈/历史只读、独立订正、限时开始前隐藏材料；历史从已验证快照读文章、题干与表格。
- 表格raw按类别/课程/材料/动作/题号隔离；controlled父级精确回显才释放本地副本，不能把engine成功当磁盘保存。长度拒绝不截断，旧位置回调不写新课程。
- Academic专属课切GT前选择合法入口，保留全部旧session。
- `app/ielts-sample-workspace.tsx` 将样例进度与公开题面快照放入同次functional State更新，核两份期待raw；未知/冲突/不匹配题面保留原文并阻断覆盖。

新增纯函数 `app/ielts-table-context.ts`，namespace `ielts-table-context-v1` 存于既有State.drafts字符串，无新store/scorer/schema/调度。
快照保留完整原创文章、instruction、caption、行列、前后缀、题干；不存accepted/why/hint或未展示的限时/未来复验材料。
已有原答先于快照的旧记录标legacyReconstructed=true，页面和导出都保留“由当前冻结内容补建，不能证明当时题面”的边界。不会将补建升级为同期题面证据。
原整站Save/restore/undo原样运输该namespace，无共享ProgressSave/progress-file/State/model修改。

本机真实主站验证使用offline standalone、Vite4328与独占空Chrome154/CDP4330，不是作者预览或正式站。
核心：52项/139次原生逐字输入/5PNG；7阶段、保存刷新、Today、首答/订正/历史、旧阅读课、320/390与键盘focus均实际验证，runtime/console/resource错误0。
补充原备份：23项/3PNG；真默认home→课程→雅思专项→进入练习、A/GT切换、下载/预览/导入/撤销/刷新通过。该组在第三接线前明确context阻塞，原回执不覆盖。
快照接线后：45项/3PNG；新localhost独立origin输入前model/guided快照legacyfalse、单格原生输入和真导出；原127旧记录补建legacytrue，真import/undo/refresh及题面/原答/订正对应验证通过。新Today从另一课程resume只改当前选择，session/attempt/exposure未增；同课无变化回归1项/1PNG单独通过，sample raw/context/sessions全部字节或语义一致。
新快照导出7467字节SHA425cbd909dddfb120c3c1dd09c18814881c044730b326551c6f6ae1da22779ad；旧记录补建导出17522字节SHA2dbb1b5dc89eb8ad48cb3da1c29aeb9f99e64a0a1407deec752482297f8d3888，均经root独立读真实JSON/哈希核对。
source/SSR/controller11组/48真实parser往返、快照12组及严格类型通过；SSR/hooks不证明浏览器或磁盘。
接线后必需12项命令全部exit0：真实workspace125序列/24适配/11推荐/3教学UI/5原文/4历史/4目录、audio callbacks4、correction-feedback、原table内容、blueprint、原backup、autosave、Today、导航、注册批04/05及全项目TS。
两模式Vite构建通过，保留既有大chunk警告。数量断言与audio fixture useId最小更新，既有行为断言保留。初始数量/fixture/候选类型失败在交接记录列出，留存的原日志及接线前阻塞回执不作为最终已过证据。

证据目录：`/tmp/ielts-table-host-core-evidence/`、`/tmp/ielts-table-host-backup-existing-evidence/`、`/tmp/ielts-table-host-context-evidence/`、`/tmp/ielts-table-host-today-evidence/`、`/tmp/ielts-table-host-evidence/`。完整source SHA256在各回执。
复跑：`node scripts/test-ielts-table-host-source.mjs`；`node scripts/test-ielts-table-context.mjs`；`node scripts/test-ielts-sample-workspace.mjs`。真实浏览器分组命令在交接包及脚本；只用任务自身合成记录，不读取个人Chrome或真实用户数据。
保留原内容076包和当前接线差异，交publisher差异审查与发布；本线未push/merge/deploy。正式站浏览器、真机、真实音频、自然24小时及专家教学效果不在本证据范围；不换算IELTS Band或声称达标。
