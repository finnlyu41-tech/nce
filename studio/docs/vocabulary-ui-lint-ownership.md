# 词汇UI既有lint诊断归口

归口基线 `acfaffc6a8fe7033fca26c5c5b1dcb7c9bc0dce2`。本次94项缺口工作未修改以下两个UI文件或ESLint规则；诊断仍是3个错误、1个警告。本记录不把定向内容lint通过写作完整UI lint通过，也不顺手修复这些共享界面行为。

| 文件与位置 | 级别 | 规则 | 具体触发 | 本批改变 |
| --- | --- | --- | --- | --- |
| `app/textbook-vocabulary-ui.tsx:60:51` | 错误 | `react-hooks/set-state-in-effect` | 目录加载effect同步调用 `setError('')` | 否 |
| `app/textbook-vocabulary-ui.tsx:61:51` | 错误 | `react-hooks/set-state-in-effect` | 词典加载effect同步调用 `setDictionaryLoading(true)` | 否 |
| `app/word-lookup.tsx:22:35` | 错误 | `react-hooks/set-state-in-effect` | 路由effect同步调用 `setSelection(null)` | 否 |
| `app/textbook-vocabulary-ui.tsx:86:264` | 警告 | `@next/next/no-location-assign-relative-destination` | 本课地图入口使用相对地址的 `location.href` | 否 |

词形上一轮修复在 `word-lookup.tsx` 增加了导入，原冻结 `f23a75d` 的同一effect位于19:35，规则、列号、调用和错误数未变；这只是历史行号变化。本轮从 `acfaffc` 起未改两个UI文件，均可用 `git diff acfaffc -- studio/app/word-lookup.tsx studio/app/textbook-vocabulary-ui.tsx` 核对。

既有JSON诊断位于上一工作树的 `work/checkpoint-ui-lint.json`，对应SHA见 `docs/verification/vocabulary-reviewed-checkpoint.json`。复现命令：`pnpm exec eslint app/word-lookup.tsx app/textbook-vocabulary-ui.tsx --format json`。本轮必要的 `withdrawn` 误词头校正只在来源目录模型、核准词形及定向检查中实现，不修上述UI诊断。
