SF01 是一个只补两个来源关联的本地候选，分支 `codex/source-fixes-sf01-20261002`，基线 `075af33819f2c09dcf840ee118d24ea207e7da3f`。开始时正式站与 v34 固定部署 `8b353d9b` 的版本回读完全一致，运行源码为 `ff2cedbb7f315f00862e6f2151e8c18732571bac`；教材索引和词典哈希均与 6524493 审查所用输入一致。独立 Git 库和工作树保留在本任务目录；没有修改发布树或原审查树。

| 本地补入关联 | 实际原页与字面 | 上下文复核 | 最小处理 |
| --- | --- | --- | --- |
| NCE1-51:snow | PDF106／印页102，右列第1行，v. 下雪 | PDF105 是 Lesson51 A pleasant climate，问句与末尾天气描述支持下雪动词 | 在 January 前插入 snow |
| NCE3-58:balcony | PDF287／印页261，右列第5行，n. 阳台 | PDF286 是 Lesson58 A spot of bother，正文描述从公寓阳台进入 | 在 ransack 后插入 balcony；fussy 仍待审 |

本轮实际整页重看上述4张原图，核对 SHA、页眉、词表与课文关联；不重扫1392页。打印词性与释义只作为证据。词表入口继续使用既有 ECDICT 词典释义，不覆盖个人释义、例句或既有卡片身份；字典释义不能被称为整条打印释义。新增记录的 forms=[]，不推测或批量加入屈折形式。

来源投影要求精确教材版、PDF物理页、图像SHA、图像URL、词表页角色与唯一插入锚点同时匹配。重复加载或已有相同补入行不重复追加；冲突词形、重复／缺失锚点、错序行、错误页或版本会阻断，原输入不被部分修改。两组原页与原词表页面集合保持原样。旧 low→NCE1L103、assail→NCE4L9 和 PDF199 说明继续保留。

本地词表为3618个来源关联、3348个归一化词条（基线3616／3346）。315个原创词头、420条例句与12个雅思辅助词卡不变；不自动加入任何学习队列。两词在原NCE关联表、本地备用课程词表、原创例句库和雅思辅助池均无同名词条，既有全局词典已有两词。针对已从其他来源保存的同词同释义卡，测试确认仅补来源、原note/card ID、绝对到期、Again/Good日志、个人例句和撤销仍保留；不同释义独立。没有读取实际个人学习存储，不把合成State检查称为浏览器旧记录验收。

剩余来源关联为 hobble、solitary、heavily、bargain hunter、virtual、a little、fussy、enjoy，共8项，原提案保留。bargain hunter、a little 还缺当前词典入口；本批不添加未经源义项与保存身份策略核对的释义或新例句。10项是本次基线尚未发布采纳的提案；只有这2项在本地实现，发布状态仍为未发布。

62个唯一未决来源ID保持原集合，本轮解决该集合中的ID为0。5条局部扫描未知与57条解释有重叠，另有5项身份映射；不把67行相加当唯一ID数。新增两个漏录关联原本不在该集合，不能据此从62减2。全部释义确认分母仍为null，humanReview=false，Egypt撤回事项不再处理。

5个尚未采纳编辑建议均保持：NCE2 PDF201 页眉33／上下文34、PDF424 印80／推断83、PDF172 put/with、PDF241 两句／一句、NCE4 PDF216 scuptor/sculptor。这些页没有当前运行索引入口；原页说明接线将涉及页表／练习范围，本批不加入。PDF424的印刷与推断尤其分开保留，不能以人名或连续性替换印刷课号。局部练习差异不扩充扫描未知词队列。

12组SF01来源／身份／备份测试、8组既有来源回归、15个FSRS场景、275个已注册目标回调、词表和例句检查、严格类型及5个变更代码文件lint通过。例句检查中的词形候选统计不等于义项验收。测试入口：从studio运行 `node scripts/test-source-review-sf01.mjs`；该测试使用实际基线Git源码及已回读的公开索引／词典，其他行为样例为合成State。回归需要既有依赖及dist-online教材数据；原教材图像和日志保留在ignored `work/source-fixes-sf01/`。详细输入哈希、62 ID集合、保留项和日志哈希见[证据清单](source-review-sf01-20261002.json)。

精确改动为 `app/data/source-review-sf01.ts`、`app/source-review-batch1.ts`、`scripts/test-source-review-sf01.mjs`、`scripts/test-source-review-batch1.mjs`、`scripts/test-vocabulary.mjs` 及本批两份同名文档。UI、FSRS实现、保存／CAS、IELTS、CL01和依赖没有差异。没有push、merge或部署；唯一发布负责人仍为01a0fa39-c2a2-7239-87b4-b0a9c091f0ba。
