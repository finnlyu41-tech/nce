# 全教材来源目标的有限审读队列

每个审读单元是现有教材目录中的册、课、规范词头。来源词头完成枚举后，再逐项审读该处打印的词性／释义目标、原创句、中译和搭配。此工作边界包含全部348课；纠正 `withdrawn` 分词误列后有3,614个来源词条、3,346个不同规范词头。目录引用386个词表页，另将27个目录空词表课次列为待核原页事项。

这些数值明确限定全现有教材的来源审读工作量。它们不是全书逐个打印义项的最终数量；不能把每个词头强制当成一个义项，也不能按字典逗号拆分生成分母。词头别名、错误分词、未打印词性、同义简释、多个真实目标和模糊扫描，都需要单列处理。

## 可重复生成

使用合法保留的现有本地教材资源和锁定依赖：

```sh
node scripts/audit-vocabulary-coverage.mjs --snapshot=<本地提交> --output-subdir=gaps94-final
pnpm plan:vocabulary-review
```

生成文件只写忽略目录 `work/vocabulary-coverage/gaps94-source-review/`：

- `source-word-review-queue.json`：所有来源词条的稳定ID、册课、原页／图片SHA、打印证据、已审目标及剩余义务。
- `source-page-reconciliation.json`：386页的全页枚举任务及27个目录空词表课次。
- `pending-source-word-ids.json`：未完成来源目标枚举的有限ID清单。
- `manifest.json`：审读单元分母、各状态计数、输入／输出SHA及不作全教材完成率声明的原因。

也可用 `--audit=<审计子目录>`、`--output=<队列子目录>` 保存中间快照。脚本检查审计输入和编译内容SHA，输入变化时要求重新审计；不读取学习记录、调用网络或改变排程。整套来源词表及衍生输入按项目README保留本地，不进入公开Git。

## 状态含义

`candidate-only` 表示存在双语词形候选，还需核对该来源的目标义、词性、中译和搭配。`target-content-present-source-inventory-pending` 表示已登记目标内容，但该处全部打印目标尚未完成枚举。`source-target-inventory-complete` 必须有实页枚举的完整来源账本、对应内容SHA及实际来源匹配证据；现有目录不能仅因查到例句而闭合。

`textbook-target-editorial-normalized`（如 `stale`、`indulge`）和旧语法规范目标单列，不替代原印目标完整性。`regularly` 淡印尾段保持未认证。`water ski` 的打印词头与既有规范 `waterski` 保留关联裁定事项，不能因自动词形命中改写原印记录。

旧本机OCR程序仅处理页面上方约45%，中文存在高置信度乱码且可漏掉页面下方词表。双语CPU OCR小样也会误读字词，只作为待核转录候选。原README所述完整 `reviewed.json` 输入未在当前可读的已检查工作区找到，因此不能从缓存恢复一个已认证的全书打印义项分母。有限队列的剩余ID是后续审读范围；全书义项总数与完成率须等全页核对完成后再建立。
