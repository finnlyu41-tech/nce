# NCE2 004–006：原源阅读与内容边界

以下为作者盲审前快照；模块hash/答案数/当时pending状态是历史记录。root最终有限变体与验收见author-review-004-006.md及delivery.json，不以该快照冒充最终hash。

作者仅新增三个单课模块与本文件。baseline `d717bad909d889fd305d667bd1d8530883aaf23a`；`book:NCE2`、`lessons:[4]`/`[5]`/`[6]`，不采用第一册奇偶配课。只读源根：`/Users/finnlyu/Documents/Codex/2026-10-03/task-14/nce1-133-143/studio/dist-online`。

已完整读取三份language JSON、三份原LRC、original materials manifest中第二册PDF及4–6课字幕/音频完整条目、对应textbook-grammar完整条目及lesson-structure.ts。按索引分别调用view_image阅读12张原扫描页。下方hash取实际文件字节并与索引核对。没有播放MP3或评测人的听感。

JSON文件hash只验证打包结果；模块metadata使用JSON内部sourceSha256，它与原LRC实际字节SHA256及manifest吻合，绝不以JSONdigest冒充教材源身份。第4/5/6课JSON分别13/12/14原行，正文分别12/11/13行。`splitLesson(rows, NCE2, packaged=true)`将首个课前问句分出，原row/time不改，不把问题当作本文第一句。

`nce-illustrations.json`仅有NCE1 source和entries；没有NCE2-4/5/6的panel/line映射。原扫描页中的插图已阅读，但不能声称漫画布局或逐句漫画渲染通过。未新增插图manifest。

原PDF manifest：`新概念英语2 实践与进步.pdf`，480页，scan，0 extractedCharacters，19,876,069 bytes，SHA256 `8e19ce05144e35257f551bb8e2c8a26920bb7790affb7105441a0b011731e201`。三个分块8,388,608 + 8,388,608 + 3,098,853 bytes。本作者阅读索引JPEG，未重拼PDF。

## 原页支持与取舍

第4课只读64–67（印刷24–27）：64有全文、词汇、注释、译文、摘要问题和原插图；65明确just/already/never/for及ever、so far、not yet，并对比正在与刚完成；66有still/not yet和already→yet问句练习，真正Special difficulties标题是Receive and Take；67有理解、句型、词汇选择，其中for/since、gone/never been有原页支持。三个目标为完成/尚未完成、经历与明确返回/未返回、持续至今的时长/起点。been to/gone to的返回教学是依据本文去向及经历练习写的文字比较，不冒称66难点专节讲了这一对照。本文has been there for six months表示持续在澳大利亚，不能误教为已返回；has never been abroad before在首次出国故事中指此前经历，原创Tess题明确尚未出发。Receive/Take未列为本组目标。

第5课只读68–71（印刷28–31）：68有本文、词汇、注释、译文、摘要问题、原插图；69明确过去特定时间（last month、last year、this morning、ago）与完成式（just/already/for/ever/never/not yet/lately/up till now）对照，并回指第3与第4课；70有时态填空及way/spare难点；71继续spare、多项选择及but/so句子结构。三个目标为封闭过去、截至现在累计/结果、同时保留两种时间边界的台账。下午且上午已结束/已关班次情境排除开放上午的自然完成式解；已完成项与未完成/计划项分开，部分数量不得重复加入总数。未完绿车用but对照，不充当已修两辆的因果。way/spare未列为本组目标。

第6课只读72–75（印刷32–35）：72有本文、词汇、注释、译文、摘要问题、原插图；73的A, The and Some包含单数单位/复数与材料、整体泛指、首次a与回指the，以及普通姓名/城市/街名；74继续冠词填空和构句练习，难点为动词加短词及knock；75有理解、结构、词汇选择和句序练习。三个目标为陌生首次引入/共同已知回指、a单位/some不定数量、泛指与给定普通姓名城市名。冠词任务说明共同可识别性和指代范围；后banks加入竞争人物/物资箱/实际与计划记录。quantity题要求明写a/some，并排除共同已知或现场可指认的特定物；泛指题明确整个类别。普通名字规则仅用于给定Nora/Leeds等，不扩展到河流、国名例外或所有专名。knock等难点未列为本组目标。

每课独立；未将第5课当作第4课配套课，亦未将第6课与第7课配组。完整对应catalog条目附后，但没有以目录替代原图阅读。

## 片段合同

|课/目标|start→end秒|支持边界|
|---|---|---|
|004 present-result|15.95→20.73|原just received行到下一真实行；already/not yet另由65–66文字支持|
|004 experience-location|53.81→57.13|原never been abroad before行到下一真实行；返回/gone对照为文字派生|
|004 continuing-duration|23.12→26.50|原been there for six months行到下一真实行；since另见67文字|
|005 closed-past|38.96→45.61|原Yesterday carried行到下一真实行|
|005 up-to-now|50.86→56.05|原has sent行到下一真实行；Up to now为前一真实49.30行，未含在本clip|
|005 time-ledger|45.61→49.30|原covered行到下一真实行；过去/累计比较另外由68–69文字支持|
|006 reference-chain|18.76→22.36|原a beggar行到下一真实行；the回指另见28.41行/72–73文字|
|006 quantity-unit|22.36→26.54|原a meal/a glass行到下一真实行；some比较来自73文字|
|006 general-names|48.63→51.37|原Percy Buttons姓名行到下一真实行；泛指来自73文字|

所有start均为本课真实LRC行；end严格取下一真实行。004末行57.13、005末行60.95、006末行55.39均没有伪造end。片段可能为半句；文字比较不冒充MP3中已讲出的语法讲解。字幕manifest标accent us并有同课MP3同pair/sourceLessons:[n]，只作为身份依据，不证明真实听感或听力通过。

## 原创与评估边界

三个模块各3教学目标、18原创题，diagnostic/guided/independent/repair/review-a/review-b各3题，每题4条独立near-miss及理由。情境、教学解释、示例与任务均新撰写，没有将Tim/Scott/Percy本文直接抄作迁移题。后banks按竞争词库/记录选择状态、对象、数量、时间、冠词后构句；少量题kind/form=choice，4个完整句选项，只匹配正确选项。所给选项识别与有限构句不等于开放迁移。

`content(data, rows)`复用既有author/bindContent及module.matches，状态只用生产createCourseLoopModel，没有新matcher或第二状态模型。row[5]给逐题有限自然变体；规范化只沿用既有大小写、空白、撇号、合法句末标点。变体不改变时间、数量、角色、指代。独立/修补/延迟理解操作不以名词数字换皮计为迁移；同型构句仅作受控练习证据。

own均awaiting-human-review，最终开放表达需伙伴/老师读/听核对。到期模拟仅证明模型事件门槛与新bank调度，不证明自然24小时/7天保持、真实听力/口语/发音、人类效果、自由迁移或语言掌握。contentStatus仍authored-pending-independent-blind-review。未读取个人记录、录音、凭据或13份自然档案；未commit/push/deploy，未修改shared host/registry/UI/model/storage/map/FSRS/video或增加费用权限。

## 作者自检（不是盲审或自然间隔证据）

Node实际import三模块通过：每课18题、3目标、6组各3题。004/005/006分别33/34/30个有限接受字符串全部匹配；每课72条近错、合计216条全部拒绝。9个片段逐项与原JSON/LRC真实行start和下一行end一致。12张JPEG实际字节hash全部与原index相符。

使用生产createCourseLoopModel完成每课模拟：diagnostic→learn→guided错答/retry→independent保留错首答→feedback订正及原因→repair→own待人工核对→waiting；到期前review被拒绝；分别推进模拟时间至到期后完成review-a/review-b；用完两组后第三次review被拒绝并返回needs-new-material；restore通过，receipt.mastery保持not-assessed。未提交跳过、跟练错答直接next、未订正直接next都被拒绝且原state不变。`git diff --check`通过。该检查未创建第二状态模型，也未写测试harness。

## Byte-verified source identities

|File|SHA256|
|---|---|
|materials/manifest.json|`a9661a1a000654ffebb1eac3612ea6503b538d91332cde3c5cba159f43fa3730`|
|lesson-pages/index.json|`cdc8c2bfe160866267b5b6f1ee032d6e8d9f746895d4b3fed05baab0649e4596`|
|grammar/index.json|`743c6993a7c624604aa8b7a78982f84f4344754485e0b5e4bec08444419ec6c2`|
|studio/app/data/textbook-grammar.json|`7522d9c78e29e9becc17c4bbf786b442a65fbb0fa9875b985d117d90a41c54ad`|
|studio/app/data/nce-illustrations.json|`9481fd016c92ec6d785cb76cf847e719ea7cce77cf6d103ef1df8c596a634083`|
|studio/app/lesson-structure.ts|`d9db0207d132c4c66a0bf7f23ce587cf9b81a3bd0a1f365b6144b863f24e761c`|

|Lesson|JSON SHA256|Internal sourceSha256 = original LRC SHA256|
|---|---|---|
|4|`80ede7b620918d07a867cd192cb52a6de137f0e6e10096e750b33f86b30b2792`|`561741b3b5cbd7dc4189f5778bdd685e999ef73783e5fcb74dfe042c11fd925e`|
|5|`f6dd289408fc836355fae43c7cf74fb58986bf47e33b6ffe41ec3a3524129466`|`26b0b571d7f6158888130d13f1e3023adde25bd51f7a67fd6b612dbb7a728794`|
|6|`3f7d6951dc21426e8da11eb734daac5efa2d9aaca0e56f73c18a657d563eb2d9`|`e042b7f0d7d624b6e5f3b350c95d3ec6addb24a0a8fbf07bbb64415910a5b662`|

## Twelve individually viewed scans

|Lesson|Index page / printed page|Path|Byte SHA256|
|---|---|---|---|
|4|lesson-pages 64 / 24|`/lesson-pages/cb3d27e67e7a64d00309b3b9b3406a6ad144e2936b45fd60325da696e1a59d70.jpg`|`cb3d27e67e7a64d00309b3b9b3406a6ad144e2936b45fd60325da696e1a59d70`|
|4|lesson-pages 65 / 25|`/lesson-pages/dbb59fe4a5a8e83fe04d1238bfcdf66d51fa9638d69edb595be7b351b751107f.jpg`|`dbb59fe4a5a8e83fe04d1238bfcdf66d51fa9638d69edb595be7b351b751107f`|
|4|grammar 66 / 26|`/grammar/be3b5acc4f4fe5dc6ef8397ae4103e28fdeba2e4188583ded20e13c32ab82165.jpg`|`be3b5acc4f4fe5dc6ef8397ae4103e28fdeba2e4188583ded20e13c32ab82165`|
|4|grammar 67 / 27|`/grammar/fbc2728c28bad4d7882521ffb7800bdb6cba5a7f407f0ce096affc21dd98891c.jpg`|`fbc2728c28bad4d7882521ffb7800bdb6cba5a7f407f0ce096affc21dd98891c`|
|5|lesson-pages 68 / 28|`/lesson-pages/b1086977e650967bb5087a17aafb308f08fdcfc469a5b015bd94561d709bce36.jpg`|`b1086977e650967bb5087a17aafb308f08fdcfc469a5b015bd94561d709bce36`|
|5|lesson-pages 69 / 29|`/lesson-pages/0ba38c4ba79b99f74dcbcc4d73e095b4d75c85896bd99047b88f9e82d21ea4c2.jpg`|`0ba38c4ba79b99f74dcbcc4d73e095b4d75c85896bd99047b88f9e82d21ea4c2`|
|5|grammar 70 / 30|`/grammar/85394bf8f48781f91133ca098d78e3f22db1b14846f0332fbbdbd1ed86d8838d.jpg`|`85394bf8f48781f91133ca098d78e3f22db1b14846f0332fbbdbd1ed86d8838d`|
|5|grammar 71 / 31|`/grammar/52c0570d1d68c7e46f987a29a3cf90968d1ca7df53e8e2561a306ea32fcacf00.jpg`|`52c0570d1d68c7e46f987a29a3cf90968d1ca7df53e8e2561a306ea32fcacf00`|
|6|lesson-pages 72 / 32|`/lesson-pages/9df072b547efb5a9c1a43841b2c94e5cb36b710bdad25121f68007c9acbb5d45.jpg`|`9df072b547efb5a9c1a43841b2c94e5cb36b710bdad25121f68007c9acbb5d45`|
|6|lesson-pages 73 / 33|`/lesson-pages/6659125ab503253efbc98a48b9219b8317ecad3ceaaa5c2cb66bc45d4678e018.jpg`|`6659125ab503253efbc98a48b9219b8317ecad3ceaaa5c2cb66bc45d4678e018`|
|6|grammar 74 / 34|`/grammar/c66b74c702c62fc12f32dce05e3f90504b550830fd6dd13433419015adf9b305.jpg`|`c66b74c702c62fc12f32dce05e3f90504b550830fd6dd13433419015adf9b305`|
|6|grammar 75 / 35|`/grammar/58071a097468106de8a245a8ee92fc68e307abdfcbe0e910f2f64a9755d068b8.jpg`|`58071a097468106de8a245a8ee92fc68e307abdfcbe0e910f2f64a9755d068b8`|

## Original per-lesson manifest entries

```json
{
  "id": "m_b73a534a1f2811c2975ced539d60cbca",
  "name": "04－An Exciting Trip.lrc",
  "book": "NCE2",
  "lesson": 4,
  "type": "text/plain",
  "accent": "us",
  "pairId": "p_70de003a290749bd249adba746fb12d4",
  "sourceLessons": [
    4
  ],
  "title": "An Exciting Trip",
  "textFormat": "lrc",
  "timedLines": 13,
  "lastTimestamp": 57.13,
  "encoding": "utf-8",
  "size": 820,
  "sha256": "561741b3b5cbd7dc4189f5778bdd685e999ef73783e5fcb74dfe042c11fd925e",
  "parts": [
    {
      "path": "/materials/561741b3b5cbd7dc4189f5778bdd685e999ef73783e5fcb74dfe042c11fd925e/0000.bin",
      "size": 820
    }
  ]
}
```

```json
{
  "id": "m_94a42e384c3f45f9235e2b8daa37f9db",
  "name": "04－An Exciting Trip.mp3",
  "book": "NCE2",
  "lesson": 4,
  "type": "audio/mpeg",
  "accent": "us",
  "pairId": "p_70de003a290749bd249adba746fb12d4",
  "sourceLessons": [
    4
  ],
  "size": 1288082,
  "sha256": "a44a9e032685c3f12eb24d23d17d675086c0768a98446f7da6ecb6d36b712aa5",
  "parts": [
    {
      "path": "/materials/a44a9e032685c3f12eb24d23d17d675086c0768a98446f7da6ecb6d36b712aa5/0000.bin",
      "size": 1288082
    }
  ],
  "title": "An Exciting Trip"
}
```

```json
{
  "id": "m_3a2686c0a753fe70cdc431e80e466e87",
  "name": "05－No Wrong Numbers.lrc",
  "book": "NCE2",
  "lesson": 5,
  "type": "text/plain",
  "accent": "us",
  "pairId": "p_ed4ad30ae36cce64957801db223f105e",
  "sourceLessons": [
    5
  ],
  "title": "No Wrong Numbers",
  "textFormat": "lrc",
  "timedLines": 12,
  "lastTimestamp": 60.95,
  "encoding": "utf-8",
  "size": 858,
  "sha256": "26b0b571d7f6158888130d13f1e3023adde25bd51f7a67fd6b612dbb7a728794",
  "parts": [
    {
      "path": "/materials/26b0b571d7f6158888130d13f1e3023adde25bd51f7a67fd6b612dbb7a728794/0000.bin",
      "size": 858
    }
  ]
}
```

```json
{
  "id": "m_736c96f5ff8c3ad9b5a46d9bb5bbe06c",
  "name": "05－No Wrong Numbers.mp3",
  "book": "NCE2",
  "lesson": 5,
  "type": "audio/mpeg",
  "accent": "us",
  "pairId": "p_ed4ad30ae36cce64957801db223f105e",
  "sourceLessons": [
    5
  ],
  "size": 1424337,
  "sha256": "c3e1ebfa0249ad88b097302c79be04a7fa36c345cbc85a7a90e74a89ed5f907e",
  "parts": [
    {
      "path": "/materials/c3e1ebfa0249ad88b097302c79be04a7fa36c345cbc85a7a90e74a89ed5f907e/0000.bin",
      "size": 1424337
    }
  ],
  "title": "No Wrong Numbers"
}
```

```json
{
  "id": "m_39417918d6b649f4c0fda31368374701",
  "name": "06－Percy Buttons.lrc",
  "book": "NCE2",
  "lesson": 6,
  "type": "text/plain",
  "accent": "us",
  "pairId": "p_ae63a04acadba8916b3758f765099bc9",
  "sourceLessons": [
    6
  ],
  "title": "Percy Buttons",
  "textFormat": "lrc",
  "timedLines": 14,
  "lastTimestamp": 55.39,
  "encoding": "utf-8",
  "size": 820,
  "sha256": "e042b7f0d7d624b6e5f3b350c95d3ec6addb24a0a8fbf07bbb64415910a5b662",
  "parts": [
    {
      "path": "/materials/e042b7f0d7d624b6e5f3b350c95d3ec6addb24a0a8fbf07bbb64415910a5b662/0000.bin",
      "size": 820
    }
  ]
}
```

```json
{
  "id": "m_36ed385a9c8574a9dad10c9d865a856d",
  "name": "06－Percy Buttons.mp3",
  "book": "NCE2",
  "lesson": 6,
  "type": "audio/mpeg",
  "accent": "us",
  "pairId": "p_ae63a04acadba8916b3758f765099bc9",
  "sourceLessons": [
    6
  ],
  "size": 1271361,
  "sha256": "b228d3e9639ba66ab2fe0209852a55898ba65f73ef89728da6b37461e169c0ef",
  "parts": [
    {
      "path": "/materials/b228d3e9639ba66ab2fe0209852a55898ba65f73ef89728da6b37461e169c0ef/0000.bin",
      "size": 1271361
    }
  ],
  "title": "Percy Buttons"
}
```

## Read textbook-grammar entries

```json
{
  "id": "NCE2-4",
  "book": "NCE2",
  "lesson": 4,
  "lastLesson": 4,
  "unit": 1,
  "title": "现在完成时",
  "category": "tense",
  "terms": "what has happened present perfect",
  "sections": [
    {
      "section": "Key structures · 关键句型",
      "page": 65
    },
    {
      "section": "Special difficulties · 难点",
      "page": 66
    }
  ],
  "pages": [
    65,
    66,
    67
  ],
  "references": []
}
```

```json
{
  "id": "NCE2-5",
  "book": "NCE2",
  "lesson": 5,
  "lastLesson": 5,
  "unit": 1,
  "title": "一般过去时与现在完成时",
  "category": "tense",
  "terms": "happened has happened",
  "sections": [
    {
      "section": "Key structures · 关键句型",
      "page": 69
    },
    {
      "section": "Special difficulties · 难点",
      "page": 70
    },
    {
      "section": "Sentence structure · 句子结构",
      "page": 71
    }
  ],
  "pages": [
    69,
    70,
    71
  ],
  "references": []
}
```

```json
{
  "id": "NCE2-6",
  "book": "NCE2",
  "lesson": 6,
  "lastLesson": 6,
  "unit": 1,
  "title": "冠词与 some",
  "category": "noun",
  "terms": "a the some",
  "sections": [
    {
      "section": "Key structures · 关键句型",
      "page": 73
    },
    {
      "section": "Special difficulties · 难点",
      "page": 74
    },
    {
      "section": "Sentence structure · 句子结构",
      "page": 75
    }
  ],
  "pages": [
    73,
    74,
    75
  ],
  "references": []
}
```
