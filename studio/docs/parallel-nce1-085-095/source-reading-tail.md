# 91、93、95 作者来源核读记录

状态：`authored-pending-independent-blind-review`。基线：`6b1faad2840bee06f9b824e72d5c551bb9acd273`。只新增本记录及 091、093、095 三个内容模块；无注册、commit、push、merge、deploy、模型或界面修改。

## 实际读取范围

逐项读取本 clone 的 `studio/dist-online/language/NCE1/91.json`、`93.json`、`95.json`，含全部英文、中文和 LRC row 时间。`languageSha256` 和 `sourceSha256` 使用 JSON 内部的原 LRC `sourceSha256`，没有用 JSON 文件本身的 SHA 代替：

| 课 | 内部 LRC sourceSha256 |
| --- | --- |
| 91 | `f688eacca781fecca359a7729389ffc2bea06fd709b6350f09c6ed7794aabecb` |
| 93 | `5ea7b0ef88ab0ab1b40914569b11fcd29e2c65dbf9f3989c2a0c99214c9ba9e6` |
| 95 | `5146bba81d784bebc115cb2d5449bfba3ddc2afe29fe17e4a72f03f1238225a0` |

从 `studio/app/data/textbook-grammar.json` 的 NCE1-91、93、95 entries 定位句型、书面练习和注释页，再用 `studio/dist-online/grammar/index.json` 取得实际图片。原课文漫画通过 `studio/dist-online/lesson-pages/index.json` 定位。以下 12 张图均已用 `view_image` 实际查看和逐页核读；扫描 pageKey 比书页印刷页码大四页。

| pageKey | 实际核读内容 | 图片 SHA256 / 文件名（.jpg） |
| --- | --- | --- |
| NCE1-189 | 91 Poor Ian! 原文及漫画（印刷185） | `ee50b60b8089ce13d31c050340c489dc2c98dcc239175684c6968ddb005d7659` |
| NCE1-190 | 91 词汇、No, not yet 完整形式、regards、否定回应注释 | `fb2f297bce9ec299e1068cadc44bf6f188b8fd001c68107fdacba709d0aac329` |
| NCE1-191 | 92 When will…? 的 today/tomorrow/the day after tomorrow 时间表和16项活动漫画 | `b24c2de8562a7187a9d105310b4a86a87931d7d10264172cad05381e7f25e704` |
| NCE1-192 | 92 A 的 will 缩写与 will not；B 的昨日与明日对照 | `0c923e92294d44f4b3fb3cfca6e0a1b653d987d9fd7b0da0d054b0bd1cec2f55` |
| NCE1-193 | 93 Our new neighbour 原文及8格漫画（印刷189） | `32ea8ee58ab6ba059aeb9f4e09c2df01a65d49718904cc6f3501e32676f60849` |
| NCE1-194 | 93 fly/flew/flown 词汇、next-door/R.A.F./and 注释与译文 | `9c19871226302310532c25e85cb95f28ffb4c8a46235591f1017ed9ce95ac4d8` |
| NCE1-195 | 94 When did you/will you go to…?，last/this/next/after next 时间表与城市漫画 | `83900456726150ece05dae0edd787633af771aa845fb479af6c8b0613edf4091` |
| NCE1-196 | 94 A 的过去句改 will；B 的否定原城市并报告正确城市，含 arrive from | `e657d238439cf9e48d378b2fa86c53895dec3129300e264e353fcb76489fed40` |
| NCE1-197 | 95 Tickets, please. 原文及8格漫画（印刷193） | `1a5757f60527b7843d431c68602687f92b7246e1746a55632fd5d5e01774dab7` |
| NCE1-198 | 95 had better/’d better、动词原形、in five hours’ time所有格等注释 | `4a0098ad13ea2a03bed75d1e26a87f5568334a2667f6c8dc2c6acd9b3fa1c39a` |
| NCE1-199 | 96 12个钟表，ago与in…time单复数表，When did/will句型与城市 | `ef5aeb773c09d51db8847fbfa6a54149c38d227e63513adb506d948921a83230` |
| NCE1-200 | 96 A had better改写；B 以’ll报告in…time的下一次行程 | `7be689e67b4bc136662f36d73378ad2eacded32de2eb4dd05f67e79373316586` |

图片均位于 `studio/dist-online/lesson-pages/<SHA>.jpg`。

## 原声与配套练习边界

91 的原声有 I’ll/We’ll miss、When will the new people move into…、Will you see Ian today。`will not/won’t`、更完整的活动和时间表来自92课配套，不冒充91课原声。三目标为肯定/否定未来安排、未知执行时间、未知行动是否发生；一般过去和现在完成在本组作先修，不扩大为本组通过项。

93 的原声明确对照 `will fly…next month`、`the month after next…`、`flew…a week ago`、`return…the week after next`。`When did/will` 和否定错误城市、肯定正确城市来自94课配套。原创纠错将教材两句改为一个复合句，以适应现有单句匹配边界，同时允许完整从句、重复主语、but后的平行省略和and…instead等有限同义形式。`arrive from` 保留出发地关系，`go/fly/return to` 保留目的地关系。

95 原声有 `had better go back…now`、`What time will…`、`nineteen minutes past eight / eight nineteen`、`clock’s ten minutes slow` 和最后一句 `In five hours’ time!`。96页提供更多had better行动、钟表读取和ago/in…time对照。快钟减时为原创反向迁移，未声明在原声中出现。钟点题接受等值的数字顺读、past/to、quarter形式；题干要求英文时间词，避免将数字时刻表抄写当作读取。

全部 clip 起止值均来自实际 JSON rows：

| 课/目标 | start–end（秒） | 实际覆盖/边界 |
| --- | --- | --- |
| 91 future-arrangement | 47.83–62.21 | I’ll miss him、相关邻居陈述及We’ll all miss him |
| 91 future-when | 62.21–74.22 | When will…move into、I think…day after tomorrow |
| 91 future-whether | 74.22–83.09 | Will you see Ian today、Yes, I will |
| 93 journey-time | 28.29–52.15 | next month、month after next、a week ago、week after next行程 |
| 93 journey-when | 42.31–52.15 | flew过去与will return未来；When did/will问法另来自94 |
| 93 future-destination-correction | 28.29–38.62 | will fly到不同城市；否定纠错结构另来自94 |
| 95 had-better-advice | 60.69–65.8 | We had better go back…now |
| 95 exact-clock-time | 23.44–31.52 | What time will…、nineteen minutes past eight |
| 95 relative-time | 86.16–88.77 | 仅When’s the next train?问句片段；不包含末句回答音频 |

95 的末行 `In five hours’ time!` 起点为88.77秒，但 JSON 无下一LRC row，因此没有伪造其音频终点。该回答引用已核 LRC 文字；in…time和ago规则由96配套页支持。第三 clip label 同样明确这一限制。

## 内容完成与作者自检

每模块有3个教学目标、先修说明和1项等待真人核验的 own 任务；diagnostic、guided、independent、repair、review-a、review-b各3题，共18原创封闭任务。每题有至少4个带reason的近错边界。不同阶段包含信息缺口、出发/目的地关系、取消安排、报告档案、部分关闭与休假未决关系、接待纠错、快慢钟计算和守钥匙/共同出发等任务条件。

使用已有 `author/metadata` 装配，并在补变体后重新 `bindContent`，没有新建评分模型。补入有限合理缩写、时间前置、后天早晚的of短语、had better的now语序、will纠错的平行省略和in…time可省time形式；陈述标点/大小写/直弯撇号仍由既有contract处理。

作者本地导入检查：三模块均18题、3目标、6阶段齐全；所有accepted匹配，所有counterexample拒绝，最终重绑定无冲突。这是内容自检，不替代父代理独立无key盲解、实际factory/UI/source复核。当前内容状态仍为 `authored-pending-independent-blind-review`；没有宣称真人听说通过或自然24小时/7天复习完成。
