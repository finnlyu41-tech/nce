"""Check the exact Pages upload whitelist and every material hash before release."""
from pathlib import Path
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]


def verify(root):
    manifest = json.loads((root / 'materials/manifest.json').read_text())
    assert manifest['version'] == 1 and 0 < len(manifest['files']) <= 2000, 'Empty or invalid manifest'
    allowed = {'index.html', 'version.json', 'robots.txt', '_headers', '_worker.js', '_routes.json', 'materials/manifest.json'}
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
    assert version['html_sha256'] == hashlib.sha256((root/'index.html').read_bytes()).hexdigest(), 'HTML hash mismatch'
    assert version['manifest_sha256'] == hashlib.sha256((root/'materials/manifest.json').read_bytes()).hexdigest(), 'Manifest hash mismatch'
    assert version['materials_count'] == len(ids), 'Material count mismatch'
    assert version['access'] == 'public', 'Public-access requirement missing'
    assert version['language_sha256'] == hashlib.sha256((root/'language/index.json').read_bytes()).hexdigest(), 'Language index mismatch'
    actual = set()
    for file in root.rglob('*'):
        assert not file.is_symlink(), 'Symlink rejected'
        if file.is_file():
            relative = file.relative_to(root).as_posix()
            assert relative in allowed, 'Unexpected upload file: ' + relative
            assert file.stat().st_size <= 25*1024**2, 'Cloudflare per-file limit exceeded'
            actual.add(relative)
    assert actual == allowed and len(actual) <= 20000, 'Upload whitelist incomplete or oversized'
    print(json.dumps({'verifiedFiles': len(actual), 'materials': len(ids), 'bytes': total, 'books': counts, 'translatedLines': lines, 'dictionaryWords': language['words']}, indent=2))


if __name__ == '__main__':
    verify(ROOT/'dist-online')
