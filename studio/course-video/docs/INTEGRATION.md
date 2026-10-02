# 分课视频与个人笔记候选

用户已确认教师为胶学 · 刘羽Leo。只引用作者原视频及官方外链播放器，没有视频下载、重传、登录、付费或权限变更。

## 内容及范围

`sources.json` 是经过 `parseManifest` 严格校验的703个有课号分段，覆盖287课：第一册144课、第二册96课、第三册1–47课。研究原目录共有710分P；前言、准备、回顾和转至下册等无对应课号的7段没有冒充课程。第三册48–60课和第四册不显示视频入口。组合段按实际课号显示，尤其P168是121、123课，不能写成121–123课。每课可有多个视频分段，同一组合段可被不同实际课程引用。

研究文件在 `leo-nce-catalog.research.json` 和对应README；它核对的是目录题名、分P和作者信息。播放器参数另依据 https://player.bilibili.com/ 。没有完整视频听读或字幕内容证据，703段均没有summary字段，不展示“Leo视频总结”。已有教材讲解保留原有标注。以后只有明确 `video-content` 或 `transcript` 证据、原分P地址及核验范围才能增加summary；目录题名不能用作内容摘要证据。

## 最小宿主接口

- `CourseVideoHelp`: 接收 `courseId,book,lessons,phase,manifest,recordHelp,bindGuard` 及可选已有持久 `NotesPort`。`recordHelp():Promise<boolean>` 必须在帮助记录保存、回读成功后返回true。false/throw不会展示播放器、打开原视频或展示摘要。个人笔记的普通编辑不增加曝光。
- `CourseVideoHelp` 始终挂载，但只在learn/guided/feedback/repair/own/waiting/review-feedback渲染帮助。diagnostic/independent/review-a/review-b不渲染播放器、摘要、链接或笔记。宿主仍需把自己的考试阶段映射到隐藏状态。
- CL源类型新增 `video`，仅 `course-loop/model.mjs` 的learningSources和 `host-contract.d.ts` 的SourceKind追加一项。原text/audio/comic事件不改，通用parser继续验证有限事件并交给原model回放。video在题目未提交时如实标记hinted；访问本身没有提交、掌握、成绩、FSRS或复习通过授予。
- 旧map的UnitTeaching旁渲染组件，step3隐藏。调用已存在的 `noteQuizHelp` 并等待当前真实 `save` 收据。新videoGuard和原UnitTeaching/quiz/Speaking/CL guard分开保存、组合flush；不能让其中一个注册覆盖另一个。
- classic `NceStudio` 仅在grammar讲解标签渲染 `ClassicCourseVideoHelp`。现有练习有未提交independent/review回答时，保存既有pending goal的hinted字段；原答、原attempts不改变。精确video来源仍记录在笔记draft。学习讲解没有待答题时不制造作答或达标事件。

## 持久性

笔记唯一键为 `course-video-notes-v1:<courseId>:<book>:<实际视频课号组>:<BV>:<p>`，使用原 `State.drafts`。同一视频在不同实际课程中的笔记相互隔离。没有新localStorage命名空间。

adapter回读完整已有State；同一笔记raw不同即拒绝覆盖；其他课的更新合并保留。写入调用原offline-store的guarded DB事务或共享Web Lock legacy writer，锁内CAS、提交后回读确认，再发布通知。写期间的新输入继续排队，旧收据不能清掉更晚输入。失败保文本并可重试；冲突时只有先下载未保存内容，才能显式读取较新的版本。

classic同页保存成功后，只把本次已确认draft发布到已有React State，保证顶部ProgressSave就地导出包含它；不替换其它学习稿。帮助标记采用同样确认后发布。完整笔记文本与访问事件包含在现有整站进度文件中，可正常下载、恢复。没有后台上传或发送给B站。

## 路由组合与所有权

唯一新源码目录为 `studio/course-video/`。共享文件只在隔离副本给最小patch：

1. `app/course-loop-ui.tsx`: 组件、source:video和笔记flush接点。
2. `course-loop/model.mjs`、`course-loop/host-contract.d.ts`: 语义video枚举。
3. `map/learning.tsx`: 旧课程入口和组合guard。
4. `app/nce.tsx`: grammar入口、acceptedRoute及guard透传。
5. `app/study-app.tsx`: accepted-route最后一层和Nce透传。

`integration/online424-shared.patch` 针对online运行基线424efc1；`integration/mini-placement-bd5-shared.patch` 针对已冻结mini+placement组合bd5d1f7。两份是替代版本，不能都apply。publisher按其当前源码接最小触点，不覆盖整文件。

`useCourseVideoHostRoute(requested)` 应接在mini→placement→stage等宿主accepted route链末端；没有stage的已测组合是 `mini.route → placement.route → video.route`。最终StudyApp的redirect/模块分支、StudyWorkspace和NceStudio都用video.route，不能让Nce直接按raw hash卸载失败笔记。原mini/placement/stage守护保留，只有当前挂载的classic视频模块绑定此guard。document exits等待同一flush；hash/native history exits保留当前组件直到确认。stage最终组合尚未提供，不冒称已验。

## 可重复验收

```sh
node course-video/tests/test.mjs
node scripts/test-course-loop-host.mjs
node scripts/test-course-loop-ux.mjs
node scripts/test-progress-save.mjs
node node_modules/typescript/bin/tsc --noEmit --incremental false
node node_modules/vite/bin/vite.js build --config map/vite.config.ts --mode online
node node_modules/vite/bin/vite.js build --config vite.static.config.ts --mode online
node course-video/tests/browser.mjs
# integrated-browser.mjs只在bd5组合+对应最小patch已接线的独立QA树运行
node course-video/tests/integrated-browser.mjs
```

构建前沿原仓库 `prepare:map` 使用既有已打包教材准备curriculum；使用已有同版本依赖与资源。Chrome脚本启动全新合成profile，仅读取自己的localhost记录，使用原生输入、实际download和DOM文件restore，结束删除profile。故障测试只在该合成profile注入IDB put失败，不能称为真实quota故障。桌面CSS 320/390检查不等于真机或B站移动播放验收。

## 回退和发布

未独立push、合并或部署；仅交唯一publisher整合。19组合成模型/controller/manifest测试、online424实际12组和bd5组合实际8组通过，报告在qa。观看不计测验通过。实际B站完整播放/听感、视频摘要、stage最终组合、真实移动设备、自然间隔与学习收益未验。

回退前保存包含新版video事件和笔记的完整整站备份。旧CL parser不支持video事件，不能承诺旧版能读取新课程日志；不删video事件去伪装兼容，也不以旧版备份覆盖新版完整记录。
