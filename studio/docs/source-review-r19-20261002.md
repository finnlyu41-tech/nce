R19/21/22 本批将 62 个唯一来源疑点中的 51 项本课限定义解释、5 项字面词头映射接入现有原书图片说明，并补齐 4 张练习页及其编辑说明。保留 6 个完整条目未决；NCE2 PDF424 页眉推断也继续未决。它不修改全局词典、词头、IPA、卡片释义、FSRS 排程或学习记录。

这是一轮原页 AI 审阅与独立反例复核后的来源注释。`humanReview=false`，全印刷义项分母仍为 `null`；“关闭”只指原队列的来源限定解释／身份连接已接入，并非所有词义获人工验收。原冻结转写、原队列及原 PDF／图像字节保留。没有 OCR 补字、第三方卡组导入、新例句或外部学习数据传输。

|范围|本批结果|
|---|---|
|NCE1 18 ID|14 条本课说明；ready、any、regularly、throw 保留完整条目未决|
|NCE2 18 ID|16 条本课说明；Lancaster、lorry 保留扫描未知|
|NCE3/4 21 ID|21 条本课说明，原印词性和简释另行保留|
|身份映射 5 ID|jazz→Jazz、ex-→ex、water ski→waterski、lotto→Lotto、maître d’hôtel→maître d'hôtel；只绑定精确原页，不重命名|
|编辑说明 4 页|NCE2 L27/PDF172 put、L34/PDF201 页眉接续、L44/PDF241 两个句子；NCE4 L31/PDF216 sculptor|
|未接入的编辑推断|NCE2 PDF424 所印80／推断83，没有改写或搬页|

原队列有重叠：57 个解释项与 5 个身份项合为 62 个唯一 ID，5 个扫描未知 ID 已包含其中。接入后剩 6 个唯一 ID，扫描未知仍为 5 个。ready 的“准备好的”可在正文验证，整条第二段“完好的”分组仍不闭核。any 首字、regularly 尾段、throw 分隔符、Lancaster／lorry 的完整中文原印字段都没有从常识补回。

国籍的形容词释义明确标为教学展开，不认证语言义；Russian／Dutch 所在页没有它们的 car 实句或参考译文。single 只解释否定句中的“哪怕一张”；curtain 只解释窗帘材料；solid 只解释非液体食物；heaven 只解释惊讶感叹。metre 仍保存旧拼写和 ID，本课电表说明不能替换长度词的全局释义；fuse 不能建立等同 short circuit 的教学等式。future、rashly、dealer、rural、fossil man、envision 的原印词性保留；dimension、vole、carbonated 等原印译义与本课解释分别记录。

逐 ID 目标、反例、原印字段、版 SHA、原页 SHA、entry ID、原队列 SHA、独立权威词典链接和六个未决项见 [结构化回执](source-review-r19-20261002.json)。NCE3/4 的独立权威检索只使用出版者自有词典页面；其中 5 次 Cambridge 直接访问403的限制记录在原反例文件中，不能算成功下载。原作者／反例证据文件的 SHA 固定在回执，完整文件随本地 handoff evidence archive 提供。

应用只改 `source-review-batch1.ts` 的两个公共接点：读取投影增加补页；原页说明合并新注释。`source-review-r19.ts` 对版本、版 SHA、课号、图像 SHA、URL、词表页、唯一原词头及页归属做检查。补页以精确原 PNG 展示，旧页面顺序、标题、生词页集合和 forms 保持。重复 anchor／目标页、同册跨课页、词头大小写／空白／撇号重复都被拒绝或隐藏说明。原始 index、dictionary 文件没有改写。

旧来源测试仅更新共同读取投影的基线，让 SF01／SF02 的原词条修复继续独立比较；R19 测试另断言仅四个课程的显示页改变。目录仍为 3,626 来源关联／3,356 词头，原创内容仍为 315 词／420 例句。本批 0 新卡、0 新例句，已有 56 个模拟卡的四档真实 FSRS 排程、历史、释义、备份刷新和跨日队列逐字段保持。

验证命令（在 studio 内）：

```sh
node scripts/test-source-review-r19.mjs
node scripts/test-source-review-r19-ui.mjs
node scripts/test-source-review-batch1.mjs
node scripts/test-source-review-sf01.mjs
node scripts/test-source-review-sf02.mjs
node scripts/test-vocabulary.mjs
node scripts/test-flashcards.mjs
node scripts/test-flashcard-sources.mjs
node node_modules/typescript/bin/tsc --noEmit
```

独立打包器需合法原 PDF 和本轮已审完整 PNG；不调用通用打包器，不改 raw index。部署前必须将四张图片与代码一起打包。示例路径是本任务自有审阅副本：

```sh
python3 scripts/test-package-source-review-r19.py --source-images ../../english-source-integrity-20261001/studio/work/source-integrity/unindexed-renders --source-pdfs ../../english-source-integrity-20261001/studio/work/source-integrity/pdf
python3 scripts/package-source-review-r19.py --source-images ../../english-source-integrity-20261001/studio/work/source-integrity/unindexed-renders --source-pdfs ../../english-source-integrity-20261001/studio/work/source-integrity/pdf --output dist-online
```

也可使用 handoff 的四 PNG 及 manifest 资产包；须按 `src` 保持相对路径并校验每张 SHA。不需要重新渲染1392页。packager 会验证两本 PDF 版 SHA 和四个 PNG SHA／签名，全部输入和目标检查完成后才写文件；重复打包保持原字节，冲突目标拒绝覆盖。原图片和新注释都能通过现有课程原页入口到达。

60 项是实际 `LessonPages` 组件代码的状态／回调测试，另覆盖图片失败、`loadPages` 错版拒绝／重试／缓存／刷新，未宣称真实浏览器验收。既有离线界面不显示原书图片的行为保留；学习备份和卡片离线刷新恢复通过。在线／离线构建是本地验证；正式版浏览器、移动宽度及部署资产 HTTP/MIME 验证由唯一 publisher 继续。本批没有推送、合并或部署。

最终独立分支基线为 `424efc1869e98cd7b19afd2c1ab7cab0e8380b4b`（只读正式版 `2026-10-02-expression-repair-v39`）。原页证据作者以 v37 `c6b9b01` 开始；v38/v39 的首页／表达改动已核对无文件交叉，独立分支仅更新基线。完成 11 来源组、60 组件案例、5 打包组、8 旧来源组、12 SF01组、14 SF02组、15 FSRS场景、275 canonical callbacks、词库检查、类型／改变文件lint及在线／离线静态构建。独立 reviewer 再跑11组与60例并关闭4个绑定反例，原证据及最终应用文件SHA见结构化回执。
