# R12 mini-task batch05：NCE1 49–60

候选提供49/51/53/55/57/59六个正式配对组的部分已教微目标，12课显式绑定；听、读、说、写、听、读依次轮换。每组5份原创材料：有提示练习、独立尝试、修补、延迟A/B，共30份。口写10题允许自然替代表达，质量待外评；其余20题只核对受限证据与语义条件。全部难度未校准，不产生Band、课程/地图/FSRS完成或全目标覆盖。

教学目标分别是共有水果的喜好与省略否定、虚构来源/气候资料的已知与未知、日常否定与未知动作提问、GT作息联络短讯、平常/此刻活动对照、库存整组要求与允许替代。GT短讯不充当Academic图表写作。教材奇数课文本与偶数课12张实际页图已核对，来源哈希在`evidence/source-bindings.json`。听力使用本批10个原创本机合成WAV；真实播放与文字模拟分开记录。口语仅保存本机录音元数据，刷新后提示重新选择音频；没有真人声学评分或上传。

## 文件所有权与依赖

- 作者基线：`6de5d1d99bda7f42ab4b5c07bde9d0a74a2b7f5f`，由publisher `03427c50a26499a3661ab5143dc50c5e94cf13b8`加冻结batch04 `fbe72ad207a9f848b9ce43a01aa822e78f17c3e8`构成。
- 新文件仅在`studio/mini-task/batch-05/`。三个共享入口仅追加batch05：`content.ts`、`manifest.ts`、`audio-inventory.py`；共享入口差异为15行新增、1行替换。
- 不修改registry、host-contract、course-loop-next、Today、首页、地图标题、IELTS tablehost、既有mini adapter/model/UI或旧批内容。
- publisher已经通过`1a2e484`接入冻结batch04，并通过`46ad498c87414a0372969c845d32db27047de3e9`增加batch04精确音频允许项。不要重复cherry-pick作者基线的batch04导入提交；只接本批最终单提交或从作者基线生成的batch05补丁。
- 最终只读publisher intake为`cecc2ec996c7f4da2a27d45bee406e5c66d7694c`；两个远端分支当时均为`ba6eeed71de8390e1ed4f76801cc0a7fe22bef1b`。新增词汇与独立口语修补文件未被本批覆盖；本批包运行验证基于上述034主机加冻结04，工作器来源46，不冒充已验证cecc合包或Cloudflare发布。

## 必须由唯一publisher接的工作器补丁

`publisher-worker.patch`基于实际publisher 46工作器，加入本批49/57的10个哈希WAV在root/map的20个精确允许地址，MIME为audio/wav，不增加通配路径、权限或新服务。已对publisher cecc只读`git apply --check`通过。作者和publisher的`studio/scripts/pages-access.js`均未被本任务修改。

作者测试包的`dist-online/_worker.js`包含候选20地址；未打补丁的作者源工作器因此与包不同，普通verify-online的源包一致门槛会拒绝。`verify-composed-package.py`建立本任务临时源视图，把候选工作器交给**未修改的**生产verify-online检查；2057文件、556份原材料和706959756原材料字节检查通过。publisher必须应用该补丁再按常规生产构建与verify-online，不能跳过源包一致门槛。若重新构建改变音频哈希，按最终version.json重生精确20地址后复验。

可只读生成该补丁：在studio运行`node mini-task/batch-05/prepare-worker.mjs <publisher-repository>`。该脚本只读取给定仓库，写本任务工作器补丁/证据及本任务测试包。已接补丁的publisher无需再次执行生成器。

## 接口与状态

已有通用路由消费新增miniTasks：`/map/#/mini/mini-n1-49`等；配对课程为`nce1-49`至`nce1-59`，奇偶课共享一组现有`State.drafts`键，例如`english-mini-task-v1:NCE1-49`。沿已有写入/CAS、备份和离开守卫，不建立第二进度库。原答、帮助、接触、修订与版本快照保留；看提示不算独立、未播放音频不算真实听力；5份用尽后提示有限池耗尽，不重复伪装新独立材料。

不需要新增Today或CL共享接线。已部署通用Today把mini置于修补/未完/到期之后、新课之前（priority3.5），按配对组去重；已有CL own/waiting出口回调消费本批。每课绑定代表有部分目标小任务，不代表每课都有四技能、全教材目标或雅思标准测量。

## 验证与内容盲审

- `test-model.mjs`：32组，包含原01–12六组、13–48十八组及本批六组的联合身份与状态、帮助/接触、延迟边界、耗尽、原答隔离、刷新、开放产出待评、备份和Today优先级。
- `test-today.mjs`：实际生产调度优先级与去重；`test-source.mjs`：6文本及12偶数页图；`test-scope.mjs`：独占路径、30组唯一身份、12新绑定和GT/开放边界。
- `test-audio.py`：15个包/严格音频清单案例；合计50个WAV。TypeScript及本批相关ESLint通过。
- 真正盲审包`blind-packet-all.json` SHA256 `072ddd93a0ce4760880f7b92282efdeca377c357a534d8685749df7c418a537e`；独立reviewer只见30份材料/题干，20个封闭键全部匹配，10个开放题自然替代待人评，最终必要修订0。初审促成49/51/53/55四份有目的修补材料重写，最终49对话明确Ken/Mia目标对象；55禁止从新作息反推永不洗杯。历史盲包仅用于审计，运行内容取最终content.ts。
- 实际最终Pages工作器handler配本地ASSETS：50个WAV×root/map×GET/HEAD，共200方法检查；8未知路径拒绝与POST405。未声称真实Cloudflare部署。
- 原生Chrome当前包12组：真实第一尝试/反馈/换材料、保存失败守卫/重试/刷新、CL出口与Today、既有JSON备份下载/预览/恢复、耗尽、缺失音频不计接触、真实播放以及49/57直接file离线播放/刷新/提交。音频为任务合成测试素材，未读取用户录音。运行异常0、外部HTTP0。备份按钮等待IndexedDB就绪后再点击，产品实现未为测试修改。
- 冷启动新用户实际Today进入主课/热身，没有未学mini快照或强制诊断。320/390宽8截图无横溢出，320的听读说写四图已人工目视核对。

最终成功日志、原生收据、8截图、哈希绑定在`evidence/final/`，工作器收据在`evidence/worker-runtime.json`。仅任务自有合成profile参与验证；不交付浏览器profile、备份样本原始载荷、用户记录或音频。

复验入口（studio）：`node mini-task/batch-05/test-model.mjs`、`test-today.mjs`、`test-source.mjs`、`test-scope.mjs`、`test-blind.mjs`与`python3 mini-task/batch-05/test-audio.py`。原生检查可启动`node mini-task/batch-05/preview-worker.mjs 5202`后依次运行`test-worker.mjs`、`test-native.mjs`、`test-newuser.mjs`；使用新的本任务profile。线上/离线生产构建及map构建使用`--configLoader runner`避免写借用依赖。未执行旧批写入测试或旧文件字节兼容门槛。

唯一publisher `01a0fa39-c2a2-7239-87b4-b0a9c091f0ba`完成共享入口与工作器接入后，负责当前全部并发改动的统一release gate和发布。本任务未push、merge或deploy；61–144后续课、难度校准、真人听感、自然延迟效果与开放产出质量仍未完成。
