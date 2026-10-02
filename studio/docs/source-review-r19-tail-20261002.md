尾批给六个未决词接入可核实的本课范围说明，并将 PDF424 以明确披露的内容关联展示在 NCE2 第83课下。六个原 ID 的完整条目仍待核，关闭数为0；五处原印字面未知保持 `null`。原 R19 冻结回执、词条及四页证据均保留。没有改词典、IPA、原创例句、词卡身份、排程或学习记录。

|对象／原页|确切疑点|已实现的安全呈现|仍未确认|
|---|---|---|---|
|any／NCE1 PDF88|词表中文首字缺墨|本页疑问／否定句中的不确定数量用法|不能把注释或相邻some倒填成原印缺字；全条目保持待核|
|regularly／NCE1 PDF292|简释尾文淡损|本页开窗主动／被动句中经常反复发生的频率|完整原印尾文及全条目|
|throw／NCE1 PDF294|“扔”“抛”之间原印标点不清|课文扔垃圾的物理动作，区别举办聚会等其它用法|不补原标点，不认证所有其它义项|
|ready／NCE1 PDF170＋169|词表“准备好的，完好的”中第二组缺本课独立用例|本课人或晚餐准备就绪|“完好的”两段释义关系；不把整组认作已确认|
|Lancaster／NCE2 PDF340|中文译名首字淡损|本课轰炸机型号名称|完整原印中文译名、具体失事机体／历史叙事；均不从博物馆资料补回|
|lorry／NCE2 PDF382|中文后字淡损|本课男孩搭便车去巴黎的货车|完整原印中文简释仍未知，不能由词典释义补字|
|PDF424／印刷384页|原页眉印 Unit4 Lesson80，内容接续83|在第83课下显示原图，同时明确“原印Lesson80／按正文与习题接续关联第83课”|不改原图；不是已验证的出版社勘误，不宣称原书印了83|

语义交叉核对使用出版者原站：[Merriam-Webster any](https://www.merriam-webster.com/dictionary/any)、[regularly](https://www.merriam-webster.com/dictionary/regularly)、[throw](https://www.merriam-webster.com/dictionary/throw)、[ready](https://www.merriam-webster.com/dictionary/ready)、[lorry](https://www.merriam-webster.com/dictionary/lorry)，以及 [RAF Museum Avro Lancaster 1](https://www.rafmuseum.org.uk/research/collections/avro-lancaster-1/)。这些资料支持上下文解释，不能恢复扫描缺字、替代原书词性标注或认证教材全部事实。Cambridge lorry访问403未用于证据。

PDF424 的关联由同一本原 PDF 422–425 页核对：422题头83及 Wentworth Lane／Patrick 正文；423题头83且 KS74–82复习在页尾起首；424接续该复习并以相同正文作动词填空；425题头83并有同一人物、事件的问题。关联依赖完整内容接续，不能只依据相邻页码。原印80、内容关联83、`publisherErratumVerified=false` 分别保存。

六词注释直接显示在各自已索引原词表页，标“本课范围说明（完整条目仍待核）”。它们解释可学习的局部用法，功能上的空白已填补；原印字段与完整义组的事实不确定性仍在，六 ID 不转为已验证。原队列五处扫描未知和完整义项分母 `null` 不变。PDF424 的练习入口可安全使用，但原出版社课号意图仍不作断言。

独占改动是两个尾批数据文件、纯函数／注释接点及其测试和打包器；没有改学习UI、首页、IELTS种子、排程、存储或原始 index/dictionary。读取投影仅给 NCE2-83追加一张完整原 PNG；其版 SHA、422/423两张支持页、PDF424图像 SHA／URL、生词页角色及同册唯一归属都必须匹配。重复支持页、重复目标页、错版、错误路径或把424放到第80课会被拒绝。所有旧标题、头词、forms、生词页及页面顺序保留。

通用本批打包器仅增加内部可选行集合与 manifest 名参数，旧四页默认输出的字节不变；尾批独立入口输出 `review-r19-tail-manifest.json`，保留原四页 manifest。部署前必须将新增 PNG 和尾批 manifest 与代码一起打包。合法原 PDF／审阅 PNG 位于本任务自有审计副本；也可使用交付的单图资产包。

```sh
node scripts/test-source-review-r19-tail.mjs
node scripts/test-source-review-r19-ui.mjs
python3 scripts/test-package-source-review-r19-tail.py --source-images ../../english-source-integrity-20261001/studio/work/source-integrity/unindexed-renders --source-pdfs ../../english-source-integrity-20261001/studio/work/source-integrity/pdf
python3 scripts/package-source-review-r19-tail.py --source-images ../../english-source-integrity-20261001/studio/work/source-integrity/unindexed-renders --source-pdfs ../../english-source-integrity-20261001/studio/work/source-integrity/pdf --output dist-online
```

历史 R19 测试基线将尾批补页当作共同读取投影，从而仍单独检查旧四页。旧冻结回执中“PDF424未关联”的结论是原批历史，不被改写；尾批回执记录本次内容关联。组件案例从60扩为67，包含新增六词与PDF424；仍不是实际浏览器验收。

作者重看11个相关物理整页，另有独立 reviewer 重看11张整页并比对说明、原字面及反例。各文件／原版／图像 SHA、初始确切疑点、六条范围说明及披露式关联见 [尾批回执](source-review-r19-tail-20261002.json)。全部原证据保留，本轮未重新查1392页。

本地8组尾批、67组件案例、5组尾批打包、旧R19 11组、旧来源8组、SF01 12组、SF02 14组、词库、15 FSRS场景、275词卡来源回调、类型及改动文件lint通过；在线／离线静态构建通过。原库仍为3626关联／3356词头、315词／420原创例句。本批0新卡／0新例句／0 IPA，六个模拟旧卡的四档FSRS、备份、刷新及跨日队列逐字段保持。测试没有读取用户真实学习数据。唯一publisher继续实际浏览器、移动端、HTTP/MIME和统一发布验收；本批没有推送、合并或上线。
