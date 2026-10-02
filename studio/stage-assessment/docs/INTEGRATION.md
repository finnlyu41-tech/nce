# 唯一 publisher 接入合同

范围只限本目录。`stageTarget = 'stage-nce1-1-6'`，由 publisher 决定它在既有共享 route/Today 的位置。本实现没有写入共享宿主；请勿把本候选视为上线或全范围 R13 已通过。

## State.drafts 与 writer

只拥有 `stage-assessment-v1:NCE1-1-6`。每个操作在 adapter 内串行，并依托宿主现有持久 writer 实现跨页/跨标签CAS：在同一个 writer 锁内重新读取最新 State，比较本 key 的 `expectedRaw`，仅替换本 key，通过原 writer 写入并回读，然后才 resolve true。冲突或不可确认时返回 false/throw。不要先更新 React 状态后就报告保存成功，也不要自建 stage storage 或镜像到 map/FSRS/scores。

```tsx
const adapter = createStageAdapter({
  courseVersion: '<publisher frozen course commit>',
  read: readLatestExistingState,
  commit: async (expectedRaw, nextRaw) => {
    // Inside existing writer lock, including read-back confirmation:
    const fresh = await readLatestExistingState();
    const next = stateWithStageDraft(fresh, expectedRaw, nextRaw);
    return await existingDurableCommitAndConfirm(next);
  },
});
const learner = {
  load: adapter.load,
  learner: adapter.learner,
  exportEvidence: adapter.exportEvidence,
  restoreEvidence: adapter.restoreEvidence,
};
<StageAssessment port={learner} onReturn={publisherReturnToToday} />
```

以上 `readLatestExistingState`/`existingDurableCommitAndConfirm` 是合同中的宿主回调名，需 publisher 以既有 writer 绑定，不是本目录提供的假实现。adapter 已将已学过的相关 `State.nce` steps、1–2/3–4/5–6 course-loop drafts 保守识别为无基线条件。

将相关专项学习、修补、站内/站外练习和时间未知状态记入 `adapter.learner({type:'learning',skills:[...],kind:'complete'|'practice'|'repair'|'unknown',note})`。adapter 在执行时取实际 Date.now，不接收旧日期输入；学习完成声明仍是声明，不能自动替代既有课程证据。不要为本任务改 course-loop registry/next；publisher 接入相关事件时应复用原证据。未知历史可用 `interval-start` 从现在建立新间隔。

## 路由与 Today 最小接口

`stageRouteTarget(task)` 只识别上述 target，其他值返回 null。publisher 在自己的唯一 selector 内渲染 StageAssessment。

`stageTodayTasks(validState, realNow, publisherStageHref, publisherTodayHref)` 返回与既有 PracticeTask 兼容的任务：当前未提交则 resume；本科最新失败则 repair；有效前序观察、真实到期、存在未见题才 review。返回数组不会完成课程、改变路线或改任何状态。未到期/缺人工/题池耗尽不伪装为 review。损坏或未来时间记录会 throw，宿主应显示原始记录备份入口。

## 授权人工入口与听力施测

学习者页面只给 `LearnerPort`，不要给整个 adapter。授权评阅入口才可使用 `adapter.examiner` 或挂载 `ExaminerPanel`，并由宿主验证实际外部评阅者的教师/校准角色、合格性和独立性。`Reviewer.basis` 是校准与角色的最小依据，不要求真实姓名、不生成分析跟踪ID。

此模块没有新账号、权限数据库或后端身份认证；布尔字段与本地备份不是认证证明。不能让学习者通过自选角色/自评checkbox创建 authorizedReviewer，也不能把AI结果或转写填人工栏。在未绑定合格外评入口时，页面诚实待人工；这是默认预览状态。

验收员自行从当前 Library 材料获得脚本/答案。不能导入 examiner-task-pack 到学习者入口或静态公开资源。听力开始后、首次提交前，授权验收员通过 `recordDelivery` 保存人声方式、确实听见、每片段完整一次、固定声音的真人试听确认。未听见/断音则记录中断/无效，换未见题；不能把TTS、播放回调、音量条当作听力证据。

`recordReview(attemptId, review)` 在提交后保存人工六项事实判断或四维+交际目的。听/说必须 actualHeard。首评不能直接标 secondReview；第二次回调必须是独立评阅者并有不同校准依据；最多首评与复核两条原始记录。实际身份独立性依宿主授权/现场程序确认，前端字符串不同本身不证明第二个人。

人声听力和现场互动可在纸面/现场完成；不会据此声称站内麦克风、播放、录音比较或音频导出通过。无需录音/上传，不新增付费服务或联系人员。

## 导出、恢复、缺字段与时间

学习者首答草稿写入相同 key。每次打开题目先保存曝光事件，保存确认才渲染题面。3/4/4/7分钟按实际开题时间计时；刷新不重置期限。过期草稿修改被拒，原已确认草稿冻结；未确认输入可下载为 `counted:false` 文件，永不评分。中断先下载未确认输入，再保留已保存原答。订正另列 revisions，未覆盖 first。

`exportEvidence` 输出本 key 的原始字符串；损坏记录也可完整导出。空档没有数据则 raw:null，不能凭空恢复。`restoreEvidence` 严格验证、保留所有事件，只允许原事件完整前缀的续接，不允许覆写/分叉；完全相同则no-op。新恢复追加当前实际时间的 unknown 事件，使旧时间只作历史、不建立自然due。

**整站备份路径也必须接入**：宿主已有整站导出会包含 State.drafts。本目录不修改原备份模块；publisher 在整站恢复包含此 key 后，调用 `adapter.invalidateRestoredIntervals()`，再允许此组件使用。缺少这一步时不得宣称导入后自然间隔已验证。未来/倒序/重复事件、缺字段、未知字段、版本不支持均阻断；不要默认返回空记录或丢弃字段。

本地时间记录不是防篡改时间证明，题面在浏览器代码内也不是保密考试平台。真实未见与间隔需真人程序核对。测试提供合成 `now` 给纯函数验证边界；生产 adapter/UI没有 clock override 或旧日期参数。原13自然档案保持原样。

## 发布前必要实机验收

由 publisher 在实际宿主验证持久 writer失败/冲突、整站导出恢复、刷新/离开/Today返回计时不丢；由独立QA检查学习者和授权评阅入口隔离、答案未曝光。实际人声/互动/设备验收另线完成。之后按协议获得真人≥24h和≥7d证据，才能报告对应本学习者有限目标观察。未做前不关闭R06，不自动授予map、FSRS或IELTS分数。
