# NCE1 61 / 63 / 65 独立盲解记录

本次仅阅读 `blind-prompts-061-065.json`，自行解答54题。没有读取答案、内容模块或matcher，没有调用checker。`blind-answers-061-065.json`按源题顺序提供54个主答案、合理变体与问题记录。脚本仅写入独立答案，并核对题目ID及数量。

## 优先处理的问题

1. **关闭屏幕用词**：`review-a-n65-clock-obligation`给定 `close the screen`。若指关闭屏幕电源，宜改为 `turn off the screen`；若指关闭界面窗口，宜改为 `close the window`。交付答案遵守现有规定。
2. **情境与时态冲突**：`review-b-n65-enjoy-reflexive`情境说“会玩得开心”，自然引导将来时，但题干要求一般现在时。建议改为“通常玩得开心”。交付答案为一般现在时。
3. **未明确时态**：`independent-n61-describe-condition`的 `Mina is looking pale`、`review-b-n61-describe-condition`的 `He is feeling ill`都能自然描述当前状态。若目标只接受 `looks` / `feels`，应明确一般现在时。
4. **缩写边界**：`What is the matter with` / `Do not` / `must not` / `cannot`都有自然的缩写形式，但题面“用……”可能被解读为逐字限定。建议统一说明是否允许标准缩写；`guided-n63-must-prohibition`明确要求“保留must not”，`independent-n63-negative-command`明确要求“以Do not开头”，本次没有把这些题的缩写列为合规变体。
5. **副词位置**：`now`可在句末、情态动词后或句首，`often`可在实义动词前或句末。钟点状语前置亦可在未要求固定主语开头的题中成立。主答案统一采用最常见语序，变体保留满足文字限制的其他语序。
6. **have got形式**：`He has got an earache` / `She has got a toothache` / `We have got a bad cold`表达相同事实，也使用have。若课程仅接收have/has + 症状，可明确限定结构。
7. **直接问人状况的语气**：`What is the matter with you?`在某些语境含责备意味。现有虚构剧本情境可成立，教学说明可提示语气。

## 限定处理

- 七点半、八点一刻、九点四十五、十一点四十五、两点整、六点半分别独立写为 `half past seven`、`a quarter past eight`、`a quarter to ten`、`a quarter to twelve`、`two o’clock`、`half past six`。
- 只填介词的题只输出 `in`、`at`、`from`，没有填写整句。
- 单数you使用 `yourself`，复数you使用 `yourselves`；we / they分别用 `ourselves` / `themselves`。
- 未引入please、地点、频率、原因等额外信息。所有问句保留一个英文问号。
- 合理英文与明确指定词组可能有边界差异；带此问题的条目已在issues中注明，由root统一决定提示与验证规则。

尚未进行factory接受性验证；该步骤由root执行。
