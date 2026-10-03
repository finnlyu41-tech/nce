"""Check the exact Pages upload whitelist and every material hash before release."""
from pathlib import Path
import hashlib
import json
import re
import runpy

ROOT = Path(__file__).resolve().parents[1]


def verify(root):
    manifest = json.loads((root / 'materials/manifest.json').read_text())
    assert manifest['version'] == 1 and 0 < len(manifest['files']) <= 2000, 'Empty or invalid manifest'
    allowed = {'index.html', 'version.json', 'robots.txt', '_headers', '_worker.js', '_routes.json', 'materials/manifest.json'}
    app_manifest = json.loads((root/'manifest.webmanifest').read_text())
    assert app_manifest['display'] == 'standalone' and app_manifest['id'] == '/' and app_manifest['scope'] == '/'
    assert app_manifest['start_url'] == '/#/today'
    html = (root/'index.html').read_text()
    assert 'rel="manifest" href="/manifest.webmanifest"' in html
    assert 'rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png"' in html
    assert "manifest-src 'self'" in html and "manifest-src 'self'" in (root/'_headers').read_text()
    allowed.add('manifest.webmanifest')
    icons = {'icons/apple-touch-icon.png': 180, 'icons/icon-192.png': 192, 'icons/icon-512.png': 512}
    assert {icon['src'] for icon in app_manifest['icons']} == {'/icons/icon-192.png', '/icons/icon-512.png'}
    for path, dimension in icons.items():
        png = (root/path).read_bytes()
        assert png[:8] == b'\x89PNG\r\n\x1a\n' and png[12:16] == b'IHDR', 'Invalid app icon'
        assert int.from_bytes(png[16:20], 'big') == int.from_bytes(png[20:24], 'big') == dimension, 'Wrong app icon size'
        allowed.add(path)
    ids = set()
    total = 0
    counts = {f'NCE{i}': {'application/pdf': 0, 'text/plain': 0, 'audio/mpeg': 0} for i in range(1, 5)}
    for item in manifest['files']:
        assert item['id'] not in ids, 'Duplicate ID'
        ids.add(item['id'])
        assert re.fullmatch('[a-f0-9]{64}', item['sha256']), 'Invalid digest'
        assert 0 < item['size'] <= 200*1024**2 and 0 < len(item['parts']) <= 25, 'Material limit exceeded'
        digest, size = hashlib.sha256(), 0
        for i, part in enumerate(item['parts']):
            relative = f'materials/{item["sha256"]}/{i:04d}.bin'
            assert part['path'] == '/' + relative and 0 < part['size'] <= 8*1024**2, 'Invalid part'
            file = root / relative
            assert not file.is_symlink(), 'Symlink rejected'
            data = file.read_bytes()
            assert len(data) == part['size'], 'Truncated part: ' + relative
            digest.update(data)
            size += len(data)
            allowed.add(relative)
        assert size == item['size'] and digest.hexdigest() == item['sha256'], 'Integrity failure: ' + item['id']
        counts[item['book']][item['type']] += 1
        total += size
    assert all(all(k.values()) for k in counts.values()), 'A book is incomplete'
    assert (root/'_worker.js').read_bytes() == (ROOT/'scripts/pages-access.js').read_bytes(), 'Access Worker missing or stale'
    assert json.loads((root/'_routes.json').read_text()) == {'version': 1, 'include': ['/*'], 'exclude': []}, 'Some routes bypass the upload whitelist'
    language = json.loads((root/'language/index.json').read_text())
    assert language['version'] == 1 and language['lessons'] == 276, 'Language support incomplete'
    allowed.add('language/index.json')
    lines = 0
    for path, info in language['files'].items():
        assert path == 'dictionary.json' or re.fullmatch(r'NCE[1-4]/[1-9]\d{0,2}\.json', path), 'Unexpected language asset'
        raw = (root/'language'/path).read_bytes()
        assert len(raw) == info['size'] and hashlib.sha256(raw).hexdigest() == info['sha256'], 'Language asset hash mismatch'
        data = json.loads(raw)
        if path != 'dictionary.json':
            original = next(f for f in manifest['files'] if f['book'] == data['book'] and f['lesson'] == data['lesson'] and f['type'] == 'text/plain')
            assert data['sourceSha256'] == original['sha256'], 'Translation linked to wrong edition'
            assert data['rows'] and all(r['en'] and r['zh'] and isinstance(r['time'], (float, int)) for r in data['rows']), 'Missing bilingual line'
            lines += len(data['rows'])
        else:
            assert len(data['words']) == language['words'] and data['words']['handbag']['ipa'], 'Dictionary incomplete'
        allowed.add('language/'+path)
    assert lines == language['lines'], 'Translation count mismatch'
    version = json.loads((root/'version.json').read_text())
    demo_files = {'demos/yesterday/'+name for name in ['index.html', 'styles.css', 'app.mjs', 'model.mjs', 'content.mjs', 'bootstrap.mjs', 'demo-store.mjs', 'review-adapter.mjs', 'review-content.mjs', 'review-controller.mjs', 'review-model.mjs']}
    assert set(version['demo_assets']) == demo_files, 'Demo bundle incomplete'
    for path, digest in version['demo_assets'].items():
        assert (root/path).read_bytes() == (ROOT/'public'/path).read_bytes(), 'Demo differs from verified source'
        assert hashlib.sha256((root/path).read_bytes()).hexdigest() == digest, 'Demo asset hash mismatch'
        allowed.add(path)
    map_html = (root/'map/index.html').read_bytes()
    assert version['map_html_sha256'] == hashlib.sha256(map_html).hexdigest(), 'Map HTML hash mismatch'
    allowed.add('map/index.html')
    map_refs = {'map/'+path.removeprefix('./') for path in re.findall(r'(?:src|href)="(\./assets/[^"?]+)"', map_html.decode())}
    stage_allowed, stage_map = runpy.run_path(str(ROOT/'stage-assessment/next-nce1-007-012/verify-audio.py'))['verify_audio'](root, version, html, map_refs)
    allowed.update(stage_allowed)
    mini_allowed, mini_map = runpy.run_path(str(ROOT/'mini-task/verify-audio.py'))['verify_audio'](root, version, html, map_refs, stage_map)
    allowed.update(mini_allowed)
    assert map_refs | mini_map | stage_map == set(version['map_assets']) and len(map_refs) >= 2, 'Map bundle references incomplete'
    assert all(label in html for label in ['学习空间导航','学习地图','课程','复习','记录']) and '/map/' in html, 'Shared learning navigation is incomplete'
    for path, digest in version['map_assets'].items():
        assert re.fullmatch(r'map/assets/[a-zA-Z0-9_-]+-[a-zA-Z0-9_-]{8,}\.(?:js|css)', path) or path in mini_map | stage_map, 'Unexpected map asset'
        assert hashlib.sha256((root/path).read_bytes()).hexdigest() == digest, 'Map asset hash mismatch'
        allowed.add(path)
    assert version['html_sha256'] == hashlib.sha256((root/'index.html').read_bytes()).hexdigest(), 'HTML hash mismatch'
    assert version['manifest_sha256'] == hashlib.sha256((root/'materials/manifest.json').read_bytes()).hexdigest(), 'Manifest hash mismatch'
    assert version['materials_count'] == len(ids), 'Material count mismatch'
    assert version['access'] == 'public', 'Public-access requirement missing'
    assert version['language_sha256'] == hashlib.sha256((root/'language/index.json').read_bytes()).hexdigest(), 'Language index mismatch'
    pages = json.loads((root/'lesson-pages/index.json').read_text())
    mapping = json.loads((ROOT/'app/data/nce-pages.json').read_text())
    assert pages['version'] == 1 and len(pages['lessons']) == 348
    allowed.add('lesson-pages/index.json')
    assert len(pages['files']) == 696
    assert pages.get('vocabulary',{}).get('version') == 1
    assert pages['vocabulary']['lessons'] == 348
    vocabulary_count = 0
    vocabulary_words = json.loads((root/'language/dictionary.json').read_text())['words']
    for book, info in mapping.items():
        original = next(f for f in manifest['files'] if f['book']==book and f['type']=='application/pdf')
        assert pages['sources'][book] == info['sourceSha256'] == original['sha256']
        for lesson, start in info['starts'].items():
            lesson_pages = pages['lessons'][book+'-'+lesson]['pages']
            vocabulary = pages['lessons'][book+'-'+lesson]['vocabulary']
            assert vocabulary['pages'] and set(vocabulary['pages']) <= {p['page'] for p in lesson_pages}
            words = vocabulary['words']
            assert isinstance(words,list) and len(words) <= 100
            assert len({w['word'].lower() for w in words}) == len(words)
            assert words or (book=='NCE1' and int(lesson)%2==0), 'Unexpected missing textbook word list'
            assert all(w['word'].lower() in vocabulary_words and isinstance(w['forms'],list) and all(isinstance(f,str) for f in w['forms']) for w in words)
            vocabulary_count += len(words)
            assert [p['page'] for p in lesson_pages] == [start,start+1]
            for p in lesson_pages:
                assert p['src'] == '/lesson-pages/'+p['sha256']+'.jpg'
                assert p['sha256']+'.jpg' in pages['files']
    assert vocabulary_count == pages['vocabulary']['entries']
    for name, info in pages['files'].items():
        assert re.fullmatch(r'[a-f0-9]{64}\.jpg',name)
        raw=(root/'lesson-pages'/name).read_bytes()
        assert raw[:2] == b'\xff\xd8' and len(raw)==info['bytes'] and hashlib.sha256(raw).hexdigest()==info['sha256']
        allowed.add('lesson-pages/'+name)
    allowed.update(runpy.run_path(str(ROOT/'scripts/verify-source-review-r19.py'))['verify_pages'](root, pages))
    speaking=json.loads((root/'speaking/topics.json').read_text())
    assert speaking['version']==1 and len(speaking['topics'])==66
    assert sum(len(t['questions']) for t in speaking['topics'])==238
    assert all(q['en'] and q['zh'] for t in speaking['topics'] for q in t['questions'])
    assert all(set(t)<= {'id','part','title','topic','questions'} for t in speaking['topics'])
    assert all(set(q)=={'en','zh','sourceRow'} for t in speaking['topics'] for q in t['questions'])
    allowed.add('speaking/topics.json')
    assert version['pages_sha256']==hashlib.sha256((root/'lesson-pages/index.json').read_bytes()).hexdigest()
    assert version['speaking_sha256']==hashlib.sha256((root/'speaking/topics.json').read_bytes()).hexdigest()
    grammar_raw = (root/'grammar/index.json').read_bytes()
    grammar = json.loads(grammar_raw)
    catalog_raw = (ROOT/'app/data/textbook-grammar.json').read_bytes()
    catalog = json.loads(catalog_raw)
    assert grammar['version'] == 1 and len(catalog['entries']) == 276
    assert grammar['catalogSha256'] == hashlib.sha256(catalog_raw).hexdigest(), 'Grammar index is stale'
    assert version['grammar_sha256'] == hashlib.sha256(grammar_raw).hexdigest(), 'Grammar build hash mismatch'
    assert grammar['sources'] == pages['sources'], 'Grammar PDF edition mismatch'
    required_pages = {f'{e["book"]}-{p}' for e in catalog['entries'] for p in e['pages']}
    assert set(grammar['pages']) == required_pages, 'Missing or extra grammar source page'
    allowed.add('grammar/index.json')
    for reference in grammar['pages'].values():
        assert reference['src'].lstrip('/') in grammar['files']
        assert reference['sha256'] == grammar['files'][reference['src'].lstrip('/')]['sha256']
    for path, info in grammar['files'].items():
        assert re.fullmatch(r'(?:grammar|lesson-pages)/[a-f0-9]{64}\.jpg', path)
        raw = (root/path).read_bytes()
        assert raw[:2] == b'\xff\xd8' and len(raw) == info['bytes'] and hashlib.sha256(raw).hexdigest() == info['sha256'], 'Grammar image mismatch'
        assert path.endswith(info['sha256']+'.jpg')
        allowed.add(path)
    actual = set()
    for file in root.rglob('*'):
        assert not file.is_symlink(), 'Symlink rejected'
        if file.is_file():
            relative = file.relative_to(root).as_posix()
            assert relative in allowed, 'Unexpected upload file: ' + relative
            assert file.stat().st_size <= 25*1024**2, 'Cloudflare per-file limit exceeded'
            actual.add(relative)
    assert actual == allowed and len(actual) <= 20000, 'Upload whitelist incomplete or oversized'
    print(json.dumps({'verifiedFiles': len(actual), 'materials': len(ids), 'bytes': total, 'books': counts, 'translatedLines': lines, 'dictionaryWords': language['words'], 'lessonImages':len(pages['files']), 'speakingPrompts':238, 'textbookVocabularyEntries':vocabulary_count, 'grammarGroups':len(catalog['entries']), 'grammarSourcePages':len(grammar['pages'])}, indent=2))


if __name__ == '__main__':
    verify(ROOT/'dist-online')
