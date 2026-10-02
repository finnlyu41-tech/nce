# Leo NCE video mapping: verified first batch

Verified 2026-10-02 against the official Bilibili uploader 胶学 (UID 1078480983), teacher 刘羽Leo.

This JSON maps Book 1 lessons 1–12, including multiple parts per lesson. Parts 1–2 are introduction/preparation. The full official playlist currently contains 199 parts. Mapping is based on current rendered catalog metadata, not a guessed arithmetic pattern. Individual external and embed URLs follow Bilibili's documented video/part pattern. Parts 3 and 18 were independently opened/clicked to confirm numbering.

## Integration
- Model lesson -> videos[]; support multiple lessons sharing one later video too
- Load iframe only after a user click; use autoplay=0 and danmaku=0; retain an always-visible official external link
- Prefer bvid+p; supplying cid overrides p per official documentation
- Source label: 胶学 · 刘羽Leo; link uploader profile and original video
- No guarantee of mobile/signed-out playback; show useful fallback rather than a blank player

## Notes and provenance
No actual video content summary is supplied. The metadata research is not a viewing/transcript review. Leave 视频总结 as 待核验/待补充. Original learning notes must be labeled 原创学习笔记 and grounded separately; user notes belong in a separate private editable section. Do not copy or rehost the teacher's full videos or teaching materials.

## Known coverage
Book 1 BV1xa411J7jJ; Book 2 lessons 1–48 BV1cu411r7pw; Book 2 lessons 49–96 BV1XA4y1o72C; Book 3 BV1zY4y187cK (current public title says updated through lesson 47). Book 4 not yet verified.

Official player documentation: https://player.bilibili.com/

