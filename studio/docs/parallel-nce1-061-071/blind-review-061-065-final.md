# NCE1 61 / 63 / 65 最新题干独立复核

本轮仅重新阅读同一个 `blind-prompts-061-065.json` 的最新无key题干，并在自己先前独立答案上修订。没有读取content、matcher、accepted或其他答案文件，也未调用checker。初版答案完整保存为 `blind-answers-061-065-original.json`，初版说明保留在 `blind-review-061-065.md`。最新交付仍为 `blind-answers-061-065.json`，共54题且ID顺序与最新题干一致。

## 已消除的问题

- **屏幕动作**：最新题干明确关闭屏幕电源并给定 `turn off the screen`。主答案现为 `I must turn off the screen at two o’clock.`；保留同义的钟点前置形式，删除旧 `close the screen` 答案。
- **单数you时态**：最新情境改为“描述他平时玩得开心的情况”，明确一般现在时且不加频率词。`You enjoy yourself.`与情境一致；旧时态冲突记录清除。
- **标准缩写**：61与63的scope明确允许题内词组标准缩写。原有What’s / Don’t / mustn’t / can’t变体仍成立；新增 `Visitors mustn’t touch these models.` 和 `Don’t remove this tape.`，将较低层提示中的“保留must not”“以Do not开头”理解为保留肯否与指令结构。为避免后续学习者只看局部提示而误解，可以同步写成“保留must not的禁止含义，可缩写”和“以Do not或Don’t开头”；这仅是文字清晰度建议，最新scope已说明实际边界。
- **身体状况形式**：61的scope明确接纳保留事实的have got及感受/外观进行时。保留已有 `Mina is looking pale.`、`He is feeling ill.`；补 `They are feeling tired.` 与相应is/are缩写。have got及其缩写也继续保留。
- **cannot形式边界**：最新scope明确标准缩写，故保留 `cannot` / `can’t`；原先的非缩写拼法 `can not`撤出变体。该拼法在英文中可以成立，但当前独立交付采用题目明说的形式及标准缩写。

## 再核语序和钟点

- 未要求固定开头的钟点题可用时间状语前置，如 `At half past seven I must arrive.`、`At a quarter to ten they must meet.`、`At a quarter to twelve we must leave.`、`At two o’clock I must turn off the screen.`、`At half past six she must arrive.`。没有增加任何事实；主答案使用常见的主语起句顺序。
- Nina题明确“以Nina开头”，故没有时间状语前置变体。
- `We must turn off the lights now.`、`We must now turn off the lights.`、`Now we must turn off the lights.`均符合未限定开头的题干。
- Ravi题明确“以Ravi开头”，保留 `Ravi must wait here now.` / `Ravi must now wait here.`，排除Now起句。
- `She often paints here.` / `She paints here often.`均自然且完整保留习惯事实；未将always/usually移动为生硬的句末写法。
- 六个钟点重新独立核为七点半、八点一刻、十点差一刻、十二点差一刻、两点整、六点半；各句使用原形must动作、at与规定钟点表达。

## 剩余记录

没有需要阻止交付的题干歧义。`What is the matter with you?`仍可能随语境带责备语气，但现有虚构广播剧情境可以成立。复数主语 `We have a bad cold.` 可表达各自患重感冒，也符合给定词组。

本轮仅完成独立语言判断、题干限制复核与54题ID/数量核对。factory接受性验证仍由root执行。
