# R12-A 原创表格填空组件与一条有限链

独立基线 `075af33819f2c09dcf840ee118d24ea207e7da3f`，分支 `codex/ielts-table-chain-20261002`，唯一生产集成仍归 publisher。第四/五批已在该基线登记，本轮不改其内容或宿主。

选择 R12-A：Academic Reading type 9 家族的 table form / 直接来源词变体。L09 是 Listening type 4 的表格分支；R12-GT 属 GT type 6 的表格形式。本次官方三页均 direct-open，GT 本段没有直接列出词表变体，不能声明本轮已验证该变体。仅 R12-A 有本轮一条内容链，不让用户未选类别时默认 Academic 或将其借给 GT。

官方 Academic 规定表格可留空或部分留空，来源词版依题面字数限制，答案可能不与原文同序。题面 `NO MORE THAN TWO WORDS from the text`、三行/两数据列/三个空格、六份短文和180秒均为本轮有限设计。原文与表格自写虚构，无数字、缩约或第三方题库，不从 short-answer 借用数字互换规则。

独占新增文件：`structured-table/{types,projection,validation}.ts`、`structured-table/table-stimulus.tsx` / `.css`；`curriculum/table-completion.ts` 和 `curriculum/table-completion/{reading-academic,stimuli,validation}.ts`；`table-preview/{index.html,main.tsx,vite.config.ts,preview-registry.ts}`；两个 `scripts/test-ielts-table-{content,browser}.mjs` 与本说明。共享 registry、sample 宿主、State/schema、storage/CAS、全局 UI 与发布名单不改。

表格 sidecar 通过 stimulus.id = material.id 配对，空格通过 questionId 绑定现有 SampleQuestion。真实 caption/thead/tbody、行列 th 与 headers 关系，不转换成无定位的文本列表。组件只接公开刺激和受控 raw 答案，不接 accepted/why/model，不评分或存储。普通文字格与空格是不同单元格类型，未知字段/版本和重复或缺失映射拒绝；答案原文交既有 controller/strict parser。

最小宿主接线：由 publisher 登记 Academic 一课并关联来源/七阶段绑定；在 model、current answers、correction、history 的材料渲染处先查询 `tableCompletionStimulusFor(material.id)`，命中时使用 `TableStimulusView`。原文 context 保留；未提交表格 input 用 draft.answers 或 correctionAnswers，onAnswer 只派发对应 answer/correction-answer 动作；已提交首答与 history 用 attempt.answers/readOnly，不显示当前已改草稿。计时未主动开始不展示新表或原文。旧材不命中继续既有路径。无新字段或迁移，主线上线名单/保存CAS/Today不归本补丁。

接口、盲审和实际独立预览回执随成品包冻结。设备录音不适用本阅读链，实际24小时与专家校准不以模型或截图代替。

官方：[Academic Reading](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading)、[GT Reading](https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-reading)、[Listening](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening)。

接口约束：`TableStimulus` 仅含公开表格，当前版本限定矩形单层表头与文字/单空格单元格，不支持合并单元格或多层表头。`projectTableStimulus` 返回忠实深复制、全部坐标与 qid 索引；`adaptTableAnswerAction` 保留原始字符串并拒绝未知 qid/字段及超过既有宿主500字符容量的输入。500是保存接口容量，独立于题面两词限制。组件不截断；预览把未保存的完整超长输入显式留在当前页，缩短后才保存，原保存值不受影响。

有限审查已冻结：三官方来源规格；六份完整去键文章/表格；初始18格盲审指出两处真实歧义。仅两格的 before/after 与题干六字段改变，文章与其余16格不变，随后两格差分盲审得到无未决歧义的18格完整集合。不是扩大 accepted 来掩盖题面；初始发现保留。组件独立契约复核包含16拒绝 fixture、深复制忠实性及 Date answers/前后限定文字可访问描述的定点修复。

源验证：六组新检查、39次真实 unchanged strict-parser 往返（仅内存登记候选课），既有教学序列125项回归、全项目 strict TypeScript、独立预览构建均通过。可选两文件宿主 patch 单独保存并通过虚拟源码 strict TypeScript，未写入共享宿主，不能把它记作生产 UI 集成或 CAS 回归。预览专用键 `ielts-table-preview:v1`，没有正式学习记录；使用真实 engine/parser 与当前 raw 检查，没有另造调度器或声称形式化跨标签锁保证。

复跑：在 studio 内运行 `node scripts/test-ielts-table-content.mjs`；预览用 `node node_modules/vite/bin/vite.js --config ielts-blueprint/table-preview/vite.config.ts --configLoader runner`。真实浏览器脚本使用空任务 Chrome 的 localhost CDP，并必须传入独立盲审冻结的 `TABLE_FROZEN_KEYS_FILE`；完整命令、截图和有限回执随成品包。

实际浏览器冻结：空任务 Chrome 的 localhost 独立预览，320/390/1280真实视口，153项检查、163个逐字符键入、14张PNG与5个学员attempt。覆盖真实表头/行列 headers 与原生可访问名称、局部横向滚动/Tab/Shift+Tab/焦点可见、500/501完整输入边界及缩短恢复、刷新原答、提交后只读、独立订正、计时主动开始前隐藏、坏/较新记录原文字节保留。最终 runtime、console.error、资源错误均0。修复记录保留：测试误将只读示范框当输入；Mac CDP全选未实际选中，经官方原生编辑命令加选区断言修复；真实预览提交后未呈现只读首答已改为读取首次attempt；独立预览内联favicon消除缺失图标请求。没有放宽功能断言来掩盖产品缺口。

复验两题使用 CDP-only 模拟 Date.now，实际24小时为false；不是长期保持证据。14PNG属于本机独立预览，不覆盖正式站或真机。人工读了有限窄屏焦点/桌面订正截图，不能替代真实读屏器或专家难度校准。生产类别/地图入口、主站保存锁与线上资源列表仍由唯一publisher集成验收，本包不标为生产已实现；L09、R12-GT和词表变体不因本链自动获得覆盖。
