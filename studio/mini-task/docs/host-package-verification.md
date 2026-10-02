# R12 final host/package candidate

Final source/interface freeze: `9863195973ab3b858f4520e7ed4732a1babc797e`, publisher base `febb408a5777b0fef77ba5f0b5d8f7dd57e1902d`. The earlier tested source freeze `f716870258ca5e909f60092d11d18ad884667c50` remains available on `codex/r12-source-frozen-92`; the final publisher increment changes only two release documents. All51 source/content files match the tested freeze byte for byte, so existing exact-package evidence applies unchanged. This supersedes the earlier 605a-base status in the frozen route contract; the interface is unchanged. Rebase preserved publisher's current Speaking exit, callback-bound async leave guards, map writer and `Promise<boolean>` save semantics. Original 35 files from `2a793313818ee5badb893c29c9f3616a1a83270d` match byte for byte.

Source commits, in serial order:

1. `df5aaf699c7b11553005dc525a1f72ba31e582e8`: frozen original content.
2. `74cc687fe8a4134cb239f7f18036c0cbdc8ecd6c`: six shared host interfaces plus own host component.
3. `df858af9406c66ed1d365bcc3e4f960ed9884db4`: exact ten-WAV packaging, finite negative tests, local-file host returns; only shared packager hook.
4. `9863195973ab3b858f4520e7ed4732a1babc797e`: two explicitly authorized verification-tool adapters and own finite verifier/negative tests.

The subsequent evidence commit changes only new test/evidence/document files. Placement can base on the source freeze immediately, preserving the interfaces in `host-route-contract.md`; publisher serially integrates mini before placement and performs final deployment/production acceptance. No push, merge or deployment was performed here.

Actual product fix: the old standalone packager inlined JS without copying its new root WAV references. `package-audio.py` validates all ten exact provenance hashes/references before writing, then copies the online assets or embeds identical offline bytes. It does not replace other asset rules or read learner storage. Online `version.json` gains a ten-entry `mini_audio_assets` ledger. Map Vite output retains its ten WAV dependencies.

Verification-tool adaptation: the legacy data-URL loader now uses TypeScript AST ranges to preserve only actual source `import.meta.url` expressions; ordinary strings/comments remain unchanged. `verify-online.py` retains every original JS/CSS, material, image, translation and upload whitelist check, adding only the finite authored WAV set with exact original bytes, provenance hash, WAV format, MIME type, map JS reference and HTML/ledger reference. Unknown, missing, changed-hash and unreferenced assets fail. Original tool failures remain in `../evidence/host/legacy-*-failure.txt`.

Final exact packages passed:

- Native headless Chrome, fresh synthetic profile, actual `dist-online` HTTP host: normal map Today → mini → saved paired CL → CL mini callback → Today resume → immutable original answer → mini waiting → original next CL nce1-3.
- Actual IndexedDB quota rejection: Today, paired course, header, record link, hash change and native same-document browser back retain the mounted mini input and previously saved raw. Retry and actual refresh restore/save the original independent answer.
- Real `HTMLAudioElement.play/ended` with packaged WAVs; deliberately missing actual HTTP WAV cannot record exposure or enable submission. Restored WAV does. All ten responses return HTTP200 `audio/x-wav` and exact original hashes.
- Actual Chrome desktop `file:` offline package direct mini route uses embedded WAV bytes, real play/ended, local save, refresh draft recovery and submit. This verifies direct mini operation; offline Today intentionally does not recommend minis, and other browsers' file storage behavior was not tested.
- 1280/390/320 host widths have no horizontal overflow. Runtime exceptions and external HTTP requests: zero. No microphone permission, uploads or user browser profile reads.
- Strict TypeScript and scoped lint: pass. Mini model/host/content19, Today49, CL host8/UX9, navigation, loader semantics, finite packaging5, finite audio whitelist8: pass. Whole online upload1970 files /556 original materials and all original resource hashes: pass.
- Original CL00 model23, CL01 content11, CL02 content6/model18: pass. Historical CL01 compatibility suite:14pass/1fail; item12 hardcodes only six registered groups, while publisher baseline already registers18. A pristine92 worktree with the same generated curriculum fixture reproduces14/1. Both logs are retained. The first baseline attempt lacked ignored generated curriculum and is separately labeled; it was rerun with the fixture. No registry/course-author file was changed to suppress this existing failure.

Committed text logs normalize trailing whitespace; original raw command logs remain in ignored `work/r12-host`. Evidence lives in `../evidence/host/`; package SHA256s and exact source freeze are in `artifact-integrity.json`, real UI/media receipts in `receipt.json`. Reproduce from `studio` with existing dependencies and prepared original material assets: build classic online + map online, run `python3 scripts/package-standalone.py --online`, `python3 scripts/verify-online.py`; then build classic offline and run the packager without `--online`. Serve `dist-online` at127.0.0.1:5197 and run `node scripts/test-mini-task.mjs`, followed by `node scripts/test-mini-task-host-browser.mjs` using native Chrome and a fresh synthetic profile. The browser script temporarily renames only its owned delayed-A WAV and restores it in `finally`.

Scope remains partial targets for explicit lessons1–12 sharing six paired-group tasks,30 original finite items. Text-content blind review30/30 and closed-answer comparison20 are preserved. Open oral/written responses remain awaiting external review with no quality/Band scores; no human acoustic audit, difficulty calibration, natural-delay or learner-effectiveness evidence is claimed. CL, map mastery and FSRS cannot receive completion from this task.
