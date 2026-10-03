# NCE1 109–113 刷新题干独立盲核（final）

唯一读取来源：刷新后的`blind-prompts-109-113.json`。未读取原始/canonical答案、任何其他docs、module、key、matcher或tests。逐题重新依当前scope/context/prompt核定，共54题：109、111、113各18题。原始问题的对照仅依据本轮授权说明与当前会话中已知的首次盲核结论。

## 结果

54题主要答案均可由题干确定。正式可数复数范围及Some的语用问题已解决；N109独立极值题加入相反属性后具有实际筛选步骤。当前仍有4题字母短语分隔符未限定，保留有限等价格式。没有必须补充外部背景才能作答的语义阻塞。

## 原问题是否解决

| 原问题 | 当前题干证据 | 结论 |
|---|---|---|
| 109可数复数less/least语域边界，涉及diagnostic极值、guided比较、review-a极值 | scope明确本次按正式书面语直接可数复数规范练fewer/fewest，并明确实际口语less/least不在练习范围且非一概不自然 | 已解决；三个口语变体不再进入final JSON；fewest/fewer/fewest为唯一当前范围答案 |
| 109独立极值偏箱标签/数字替换 | A苹果3/香蕉9，B苹果9/香蕉3，C苹果5/香蕉5；只汇报苹果 | 已解决该题模板弱点；B的两项极值相反，必须选当前属性，答案仍为most |
| 113末复习Some只指一名乘客，语用不够精确 | A不能，B/C两人都能，全组三人 | 已解决；Some自然且准确表示非全体的复数子集 |
| 111四题字母加短语只有破折号示例 | independent、repair、review-a、review-b极值仍要求字母加短语，无分隔符硬规定 | 仍存在形式边界；保留空格、ASCII连字符、冒号三种有限变体，无语义歧义 |

通用“只写一个词”与“可用一个英文句号”同时出现仍稍冗余，scope已给予标点许可；单词答案带可选句号应按这一许可理解，无须在variants中逐项穷举。

## 自然表达与范围

本轮不再把less books或least books/mistakes加入答案变体；这严格来自新增范围，不是把实际口语一概判错。I have got、none、than you have等受限表达均可成立。111的but合句重复this/that model略显笨重，但“this更便宜，而that质量不及this”语义成立，价格与品质具有预期反差。

仅保留规定词汇下的否定缩写、but前有无逗号及字母短语有限分隔格式。大小写、空白、撇号和允许的句末标点由scope覆盖，不无限扩写。Nor、not so…as、cheaper（指定expensive题）和Two（Some备选题）即使在其他场合可自然表达，也不加入当前受限答案。唯一问句完整保留英文问号。

## 迁移质量

刷新后的109独立极值由单列数值最大值转为苹果/香蕉相反极值的当前话题选择，不再只是换数字。109三个repair题仍偏物品、数值、方向或句内位置替换；111的repair极值仍偏价格极值模板。111耗时代理与113瓶/壶范围属于有限迁移。双属性筛选、角色换位、事实相反时拒绝附和、助动词/时态变化、问句与非倒装输出等具有实质决策。题框与备选仍很强，这些成绩代表受限识别/构句能力，不能直接等同开放式表达掌握。

## 逐题核对（54题）

| ID | 独立答案 | 近错边界/自然表达 | 迁移判断 |
|---|---|---|
| `diagnostic-n109-small-quantity` | many | 饼干按个数，2相对通常20为少量；not many，非much。 | 基线：计数少量 |
| `diagnostic-n109-quantity-comparison` | I have got less coffee than you have | 未分份coffee为物质量且100<250；less，非fewer或more。 | 基线：物质量比较 |
| `diagnostic-n109-quantity-extreme` | fewest | 完整三人范围中2本最少；fewest，least被正式可数复数规范排除。 | 基线：计数极值 |
| `guided-n109-small-quantity` | much | 未分份milk为物质量，20相对200少；not much，非many。 | 支架：个数转物质量，仍强模板 |
| `guided-n109-quantity-comparison` | I have got fewer books than you have | books按个数，3<8；fewer，less不在本次正式可数复数规范范围。 | 支架：物质量转计数，仍强模板 |
| `guided-n109-quantity-extreme` | least | 完整三壶范围中100毫升最少；least tea，非fewest或比较级less。 | 支架：物质量极值 |
| `independent-n109-small-quantity` | few | 问eggs而非bread；very few eggs，非very little。 | 实质迁移：双物品与问项选择 |
| `independent-n109-quantity-comparison` | I have got more oranges than you have | 甲是I，橙子6>4；more，果酱方向相反不可沿用。 | 实质迁移：角色、双属性与方向选择 |
| `independent-n109-quantity-extreme` | most | 三箱全部列齐，B苹果9最多、香蕉3最少；必须most apples，非fewest或more。 | 实质迁移：苹果/香蕉相反极值，必须选当前列 |
| `repair-n109-small-quantity` | little | 面粉未分袋，为物质量；very little flour，非few。 | 偏模板：材料与数量替换 |
| `repair-n109-quantity-comparison` | I have got more pencils than you have | 12支>5支；more pencils，非fewer或反向less。 | 偏模板：物品与数字替换、正向比较 |
| `repair-n109-quantity-extreme` | least | 三瓶中blue=150毫升最少；least juice，非fewest、less。 | 偏模板：容器、数字与极值位置替换 |
| `review-a-n109-small-quantity` | much | 问paint物质量；not much，brushes个数不决定词形。 | 实质迁移：计数与物质量干扰 |
| `review-a-n109-quantity-comparison` | We have got less butter than you have | A代表we，黄油120<200为物质量；less，不能按杯子8>4选more。 | 实质迁移：小组we角色及反向数据干扰 |
| `review-a-n109-quantity-extreme` | fewest | B代表we，错误1为三组最少计数；fewest，least不在正式可数复数范围。 | 实质迁移：错误计数与组发言人，仍强句框 |
| `review-b-n109-small-quantity` | many | 问envelopes个数，2相对20少；not many，纸500克无关。 | 实质迁移：信封/纸数据筛选 |
| `review-b-n109-quantity-comparison` | This jar has got more jam than that jar | 主语this jar，果酱300>100；more jam，不能沿用饼干2<6的方向。 | 实质迁移：容器作主语、相反方向干扰 |
| `review-b-n109-quantity-extreme` | least | 三人奶酪100最少为物质量；least cheese，不能按番茄8最多选most。 | 实质迁移：双属性完整三人范围 |
| `diagnostic-n111-degree-comparison` | This model is less expensive than that one | 240<400且指定expensive；less expensive，改答cheaper越出规定词汇。 | 基线：价格比较 |
| `diagnostic-n111-degree-equality` | This pencil is as sharp as that one | sharp均4级；肯定as sharp as，否定不符合记录。 | 基线：锋利程度同等 |
| `diagnostic-n111-degree-extreme` | most | B=700最高价且三台完整；most expensive，非more。 | 基线：价格極值 |
| `guided-n111-degree-comparison` | This book is cheaper than that one | 5<9且cheap限定-er；cheaper，非less cheap或more cheap。 | 支架：cheap的-er词形及方向 |
| `guided-n111-degree-equality` | The blue car is not as clean as the red car | blue清洁2<red5；not as clean as；not so…as越出规定结构。 | 支架：否定as…as |
| `guided-n111-degree-extreme` | least | A兴趣2最低；least interesting，fewest不能修饰形容词。 | 支架：兴趣评分极值 |
| `independent-n111-degree-comparison` | This book is more difficult than that one | 指定报告难度8>4；more difficult，不能沿用兴趣3<7的方向。 | 实质迁移：兴趣/难度相反方向 |
| `independent-n111-degree-equality` | Is the boy as tall as the girl? | 保留boy/girl，身高相等；Is the boy as tall as the girl?，须问号。 | 实质迁移：年龄干扰、身高同等、问句输出 |
| `independent-n111-degree-extreme` | A — the most interesting | 兴趣最高A=9；A加the most interesting，不据B难度9选B。 | 实质迁移：属性选择、字母短语输出 |
| `repair-n111-degree-comparison` | This question is more difficult than that one | 题内明确耗时越长越难，10>3；more difficult，不凭常识反转定义。 | 有限迁移：完成时间作题内定义的难度代理 |
| `repair-n111-degree-equality` | This model is not as good as that one | 质量3<8；not as good as，售价900>500不构成质量更好。 | 实质迁移：价格与质量反向，good比较 |
| `repair-n111-degree-extreme` | C — the least expensive | 最低售价C=60；C加the least expensive，非A或most。 | 有限迁移：选最低价格，仍数字极值模板 |
| `review-a-n111-degree-comparison` | This book is more interesting than that one | 报告兴趣8>5；more interesting，不据难度2<6选less。 | 实质迁移：双属性选择及相反方向 |
| `review-a-n111-degree-equality` | The woman is not as tall as the man | woman170<man180；not as tall as，年龄相同不能推断身高相同。 | 实质迁移：年龄同等干扰与身高不等 |
| `review-a-n111-degree-extreme` | A — the least difficult | 难度最低A=2；A加the least difficult，不改答趣味。 | 实质迁移：双属性最小值筛选 |
| `review-b-n111-degree-comparison` | This model is less expensive than that one, but that model is not as good as this one | 第一分句this价更低；第二分句that质量更低；less expensive和not as good as，but连接。 | 实质迁移：同时比较两属性、第二分句换位、but合句 |
| `review-b-n111-degree-equality` | The red bag is as new as the blue bag | new按购入及使用状态定义同等；as new as，重量差异无关。 | 实质迁移：new的非数值同等判定及重量干扰 |
| `review-b-n111-degree-extreme` | B — the most expensive | 价格最高B=800；B加the most expensive，不按A质量9选A。 | 实质迁移：价格/质量反向、完整范围 |
| `diagnostic-n113-zero-reference` | no | no限定名词envelopes；none不能直接前置该名词。 | 基线：no接名词 |
| `diagnostic-n113-possession-response` | So have I | 双方都有cake，原句have got；So have I，非So do I。 | 基线：have肯定附和 |
| `diagnostic-n113-auxiliary-response` | Neither can I | 双方cannot swim；Neither can I，非So can I。 | 基线：can否定附和 |
| `guided-n113-zero-reference` | none | 已知milk省略名词；none指代零量，no后缺名词。 | 支架：none指代及其他物品干扰 |
| `guided-n113-possession-response` | Neither have I | 双方无biscuits，have got否定；Neither have I。 | 支架：have否定附和 |
| `guided-n113-auxiliary-response` | So am I | 双方am tired；So am I，非So have I。 | 支架：am助动词选择 |
| `independent-n113-zero-reference` | None | 三名helpers都不能且顾客不在范围；None of，非Neither of或No of。 | 实质迁移：三人范围、外部人物干扰、None of |
| `independent-n113-possession-response` | Neither have I | 当前magazines均0；no为否定词，故Neither have I而非So have I。 | 实质迁移：no的词汇否定及物品选择 |
| `independent-n113-auxiliary-response` | So did I | 当前met Alex yesterday为一般过去肯定；So did I，不回答swim。 | 实质迁移：双事实选择与过去did |
| `repair-n113-zero-reference` | no | 只汇报bottle，milk为0；no milk，不能加入jug得到some。 | 有限迁移：瓶/壶范围与there is框架 |
| `repair-n113-possession-response` | I have not got any either | 非倒装且省略small change；I have not got any either，非too或Neither have I。 | 实质迁移：倒装转非倒装、指代省略、either |
| `repair-n113-auxiliary-response` | Neither do I | do not like为一般现在否定；Neither do I，非have或can。 | 实质迁移：一般现在否定do |
| `review-a-n113-zero-reference` | none | 当前magazines为0且省略名词；none，另有书本4本不影响。 | 实质迁移：物品筛选与none指代 |
| `review-a-n113-possession-response` | I have got none | 当前chocolate双方相反；I have got none，不能Neither附和肯定。 | 实质迁移：相反事实必须拒绝附和 |
| `review-a-n113-auxiliary-response` | Neither was I | was not at church为过去be否定；Neither was I，非Neither did I。 | 实质迁移：地点干扰及过去be否定was |
| `review-b-n113-zero-reference` | Some | 三人中B/C两人能，A不能；Some of，非None、Neither、No或Every。 | 实质迁移：零量转部分、三人范围 |
| `review-b-n113-possession-response` | So have I | 当前cups双方都有；So have I，不据sugar为0选Neither。 | 实质迁移：正向当前物品与负向干扰 |
| `review-b-n113-auxiliary-response` | So can I | 当前can swim双方都能；So can I，不据不会开车选Neither。 | 实质迁移：同一助动词的肯否定事实选择 |

## 交付统计

final JSON为54条数组，各条严格包含id、answer、variants、issues。9题含有限变体，共19个；4题有issue，均为111字母短语分隔格式，其余50题issues为空。两个新文件为`blind-answers-109-113-final.json`与`blind-review-109-113-final.md`；未覆盖原始、original或canonical文件，未提交。
