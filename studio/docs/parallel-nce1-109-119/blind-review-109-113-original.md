# NCE1 109–113 独立盲解审查

唯一输入：`blind-prompts-109-113.json`。未读取 module、key、matcher、tests 或其他 docs。共三个课程，每课18题，合计54题；全部给出按题干限定的英文答案。

## 总体结论

主要语义答案均可确定，没有发现必须凭外部背景才能作答的题。多数题明确了说话者、当前话题、数量类型及完整比较范围，双属性相反方向的干扰有效。少数题需要进一步限定教学语域或格式，避免把合理有限变体当成英语错误。

- 3题有可数复数的正式/口语边界：`diagnostic-n109-quantity-extreme`、`guided-n109-quantity-comparison`、`review-a-n109-quantity-extreme`。首选分别为fewest、fewer、fewest；less/least均在原备选中，口语用法已保留为变体。建议明确“按正式书面语的可数/不可数规范选择”，再据此限定评分。
- 4题要求“字母加短语”，却只示例了破折号。JSON保留空格、ASCII连字符、冒号这三种有限同义格式；大小写和普通句末标点按scope处理，无须重复穷举。
- `review-b-n113-zero-reference`中Some指三人中的一人，在当前选项下可成立，但实际One of更精确。One不在限定选项内，未扩大答案范围；改成两人有能力会更符合some的常见语用。
- 所有填空题共享“只写一个词”与“可用一个英文句号”并存的提示：并非语义歧义，但应明确该标点许可也覆盖单词答案，避免形式检查产生偶然拒绝。
- 否定陈述的is not / isn’t、have not / haven’t保留为有限变体；问句保持问号；不扩展为Nor、not so…as、cheaper（指定expensive题）等越出当前形式/词汇限定的自然表达。

## 自然表达与近错边界

句框内的I have got、none、than you have等均可成立；部分表达比实际口头回复更书面或重复，但与限定教学目的相符。`review-b-n111-degree-comparison`的重复this/that model让句子略显笨重，仍是自然且准确的受限合句。它的but建立“较低价格却较高质量”的预期反差，语义成立。

数字表与评分是题内约定，不应自行把“价格高”等同于“质量好”，或据生活经验改写“用时越长越难”的已给定义。以下逐题列出可辨认的近错边界，区别语义错误、形式越界与可接受变体。

## 迁移质量

并非所有后续情境都是数字模板：多列数据筛选、当前话题切换、角色换位、反向属性、附和与相反事实选择、助动词/时态切换、问句与非倒装输出都增加了实质决策。N109的三个repair题及independent极值题主要仍是物品/数字/标签替换；N111的repair极值题也仍偏价格极值模板。N111的耗时代理题和N113的瓶/壶题有有限语义迁移，不能称为完全换数字，但新增认知步骤较少。即便实质迁移题仍有强句框、固定词汇或备选，应按“受限识别与构句”评估，不能据此推断开放式口头迁移已经掌握。

## 逐题核对（54题）

| ID | 独立答案 | 近错边界/自然表达 | 迁移判断 |
|---|---|---|---|
| `diagnostic-n109-small-quantity` | many | 饼干按个数；much错误，2对通常20支持not many。 | 基线：计数少量 |
| `diagnostic-n109-quantity-comparison` | I have got less coffee than you have | 100<250且coffee为物质量；more反向，fewer不配物质量。 | 基线：物质量比较 |
| `diagnostic-n109-quantity-extreme` | fewest | 2为完整三人最小值；fewer是比较级，most反向；least有语域边界。 | 基线：计数极值 |
| `guided-n109-small-quantity` | much | milk为未分份物质量；many/few按个数不合。 | 支架：个数转物质量，结构仍模板 |
| `guided-n109-quantity-comparison` | I have got fewer books than you have | 3<8且books可数；more反向，less有口语语域边界。 | 支架：物质量转计数，结构仍模板 |
| `guided-n109-quantity-extreme` | least | 100为三壶最少物质量；fewest按个数，less非最高级。 | 支架：计数转物质量极值 |
| `independent-n109-small-quantity` | few | 实际提问eggs而非bread；very few自然，very little不配eggs。 | 实质迁移：双物品表与当前问项选择 |
| `independent-n109-quantity-comparison` | I have got more oranges than you have | 说话者甲6>乙4且只谈oranges；more正确，不受jam方向干扰。 | 实质迁移：角色换位、双属性与比较方向 |
| `independent-n109-quantity-extreme` | most | 完整三箱中B=9最大；most是极值，more不是。 | 偏模板：箱标签、数字与最大值替换 |
| `repair-n109-small-quantity` | little | 未分袋flour为物质量；very little，非few。 | 偏模板：材料与数量替换 |
| `repair-n109-quantity-comparison` | I have got more pencils than you have | 12>5且pencils可数；more正向，fewer/less反向。 | 偏模板：物品与数字替换，方向转正 |
| `repair-n109-quantity-extreme` | least | blue=150为三瓶最少物质量；least，非fewest或less。 | 偏模板：容器、数字与极值位置替换 |
| `review-a-n109-small-quantity` | much | 问paint物质量；不能根据brushes使用many。 | 实质迁移：数量类型干扰与当前问项 |
| `review-a-n109-quantity-comparison` | We have got less butter than you have | A代表we，120<200且butter为物质量；less，非fewer。 | 实质迁移：小组we角色与物质量干扰 |
| `review-a-n109-quantity-extreme` | fewest | B代表we，1为三组最少mistakes；fewest，least有语域边界。 | 实质迁移：错误计数和组发言人，仍强句框 |
| `review-b-n109-small-quantity` | many | 问envelopes个数；not many，纸的重量无关。 | 实质迁移：信封/纸两类数据选择 |
| `review-b-n109-quantity-comparison` | This jar has got more jam than that jar | this jar果酱300>100；jam为物质量，more，不能用饼干数量反转。 | 实质迁移：容器作主语及相反方向干扰 |
| `review-b-n109-quantity-extreme` | least | 奶酪100为三人最少物质量；least，番茄个数无关。 | 实质迁移：双属性完整三人范围 |
| `diagnostic-n111-degree-comparison` | This model is less expensive than that one | 240<400，指定expensive须less；cheaper虽自然但不在规定词汇内。 | 基线：价格比较 |
| `diagnostic-n111-degree-equality` | This pencil is as sharp as that one | sharp评级相等，肯定as sharp as；否定与记录不符。 | 基线：锋利程度相等 |
| `diagnostic-n111-degree-extreme` | most | B=700最高价；most，非more。 | 基线：价格极值 |
| `guided-n111-degree-comparison` | This book is cheaper than that one | 5<9且cheap限定-er；cheaper，非more cheap或less cheap。 | 支架：cheap词形-er与价格方向 |
| `guided-n111-degree-equality` | The blue car is not as clean as the red car | blue=2<red=5；not as clean as；not so clean as不满足指定as…as。 | 支架：不等关系与否定as…as |
| `guided-n111-degree-extreme` | least | A=2最不有趣；least，fewest不能修饰interesting。 | 支架：主观兴趣评分极值 |
| `independent-n111-degree-comparison` | This book is more difficult than that one | 报告难度8>4，more difficult；不能拿兴趣3<7选less。 | 实质迁移：两属性方向相反 |
| `independent-n111-degree-equality` | Is the boy as tall as the girl? | 必须问句Is the boy as tall as the girl?；用两名指定人物并保留问号。 | 实质迁移：年龄干扰、身高同等、改写问句 |
| `independent-n111-degree-extreme` | A — the most interesting | A兴趣9最高；不能据B难度9选择B，或改答difficult。 | 实质迁移：兴趣与难度选择、字母短语输出 |
| `repair-n111-degree-comparison` | This question is more difficult than that one | 题内定义耗时越长越难，10>3；more difficult，不能自行质疑代理变量后反向。 | 有限迁移：用完成时间作为已定义难度代理 |
| `repair-n111-degree-equality` | This model is not as good as that one | 质量3<8；not as good as，价格900>500不代表更好。 | 实质迁移：价格与质量反向，指定good |
| `repair-n111-degree-extreme` | C — the least expensive | C=60最低价；C加the least expensive，非A或most。 | 有限迁移：最低价格选择；仍数字极值模板 |
| `review-a-n111-degree-comparison` | This book is more interesting than that one | 报告兴趣8>5；more interesting，难度低不构成less interesting。 | 实质迁移：双属性选择和相反方向 |
| `review-a-n111-degree-equality` | The woman is not as tall as the man | woman170<man180；not as tall as，不能据年龄相同给肯定。 | 实质迁移：相同年龄干扰与身高不等 |
| `review-a-n111-degree-extreme` | A — the least difficult | A难度2最低；the least difficult，不能根据趣味8改用interesting。 | 实质迁移：双属性筛选及最小值选择 |
| `review-b-n111-degree-comparison` | This model is less expensive than that one, but that model is not as good as this one | 价格this更低，质量that更低；两分句均方向正确并用but；不能把that质量写肯定as good as。 | 实质迁移：同时比较价格/质量、第二分句反向角色、but合句 |
| `review-b-n111-degree-equality` | The red bag is as new as the blue bag | new按购入及使用状态定义为同等；as new as，重量差异无关。 | 实质迁移：new的非数值同等判断与重量干扰 |
| `review-b-n111-degree-extreme` | B — the most expensive | B价格800最高；the most expensive，不能按A质量9选A。 | 实质迁移：双属性方向反转且完整范围 |
| `diagnostic-n113-zero-reference` | no | no后接envelopes；none不是直接前置名词的限定词。 | 基线：no接名词 |
| `diagnostic-n113-possession-response` | So have I | 双方都有cake，正向have got；So have I，非So do I。 | 基线：have肯定附和 |
| `diagnostic-n113-auxiliary-response` | Neither can I | 双方都cannot swim；Neither can I，非So can I或Neither do I。 | 基线：can否定附和 |
| `guided-n113-zero-reference` | none | 已知milk不重复名词；none独立指代，no后缺名词。 | 支架：none独立指代与另一物品干扰 |
| `guided-n113-possession-response` | Neither have I | 双方无biscuits，否定have got；Neither have I。 | 支架：have否定附和 |
| `guided-n113-auxiliary-response` | So am I | 双方am tired；So am I，非So have I。 | 支架：am助动词选择 |
| `independent-n113-zero-reference` | None | 三名our helpers全不会；None of，非No of；Neither通常限两者。 | 实质迁移：三人范围、外部人物干扰、None of |
| `independent-n113-possession-response` | Neither have I | no magazines表达否定，虽然have got未加not也须Neither have I。 | 实质迁移：no词汇否定与当前物品筛选 |
| `independent-n113-auxiliary-response` | So did I | 当前met为一般过去肯定；So did I，不能回答游泳能力。 | 实质迁移：双事实筛选、一般过去did |
| `repair-n113-zero-reference` | no | 仅bottle中的milk为零；no milk，不能纳入jug作some。 | 有限迁移：容器内外范围与there is框架 |
| `repair-n113-possession-response` | I have not got any either | 非倒装，any承接small change，either表示相同否定；too不合，Neither have I不满足形式。 | 实质迁移：倒装转非倒装、省略指代、either |
| `repair-n113-auxiliary-response` | Neither do I | do not like为一般现在否定；Neither do I，非Neither have I。 | 实质迁移：一般现在否定do助动词 |
| `review-a-n113-zero-reference` | none | magazines为零且省略名词；none，书本4本不相关。 | 实质迁移：当前物品筛选与none指代 |
| `review-a-n113-possession-response` | I have got none | 双方chocolate事实相反；I have got none，不能以Neither附和肯定事实。 | 实质迁移：双方相反事实拒绝附和 |
| `review-a-n113-auxiliary-response` | Neither was I | 当前was not at church为过去be否定；Neither was I，非Neither did I。 | 实质迁移：地点干扰及过去be否定was |
| `review-b-n113-zero-reference` | Some | 三人中1人能换钞，限定选项Some；None反事实，Neither两者，Every of错误。 | 实质迁移：零项转部分、三人范围 |
| `review-b-n113-possession-response` | So have I | 当前cups双方都有；So have I，不能用sugar为零选Neither。 | 实质迁移：当前正向物品与负向干扰 |
| `review-b-n113-auxiliary-response` | So can I | 当前can swim双方都能；So can I，不能据不会开车选Neither。 | 实质迁移：同一助动词的肯否定事实筛选 |

## 交付与范围

`blind-answers-109-113.json`严格为54条数组，每条只有id、answer、variants、issues。8题带issue（3语域、4格式、1语用），其余46题issues为空。变体只包含原题允许的词汇/信息、有限格式和缩写形式；不把自由表达加入受限答案。审查只写这份Markdown及答案JSON，未提交。
