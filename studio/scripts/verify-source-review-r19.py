"""Allow only the five reviewed supplemental PNGs and their exact manifests."""
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]


def verify_pages(root, pages):
    allowed = set()
    html = (root / 'index.html').read_text()
    for data_name, manifest_name in [
        ('source-review-r19-pages.json', 'review-r19-manifest.json'),
        ('source-review-r19-tail-pages.json', 'review-r19-tail-manifest.json'),
    ]:
        rows = json.loads((ROOT / 'app/data' / data_name).read_text())
        assert len(rows) == (4 if data_name == 'source-review-r19-pages.json' else 1)
        sources = {}
        for row in rows:
            assert pages['sources'][row['book']] == row['sourceBookSha256'], 'Supplemental page wrong edition'
            sources[row['book']] = row['sourceBookSha256']
            relative = 'lesson-pages/' + row['imageSha256'] + '.png'
            assert row['src'] == '/' + relative and row['src'] in html, 'Unreferenced supplemental PNG'
            assert relative not in allowed, 'Duplicate supplemental PNG'
            data = (root / relative).read_bytes()
            assert data.startswith(b'\x89PNG\r\n\x1a\n') and hashlib.sha256(data).hexdigest() == row['imageSha256'], 'Wrong supplemental PNG bytes'
            allowed.add(relative)
        expected = {'schemaVersion': 1, 'scope': 'four exact supplemental source pages; raw index unchanged' if len(rows) == 4 else 'supplemental source pages; raw index unchanged', 'sources': sources, 'pages': [{key: row[key] for key in ['book', 'lesson', 'pdfPage', 'src', 'imageSha256', 'sourceBookSha256']} for row in rows]}
        relative = 'lesson-pages/' + manifest_name
        assert json.loads((root / relative).read_text()) == expected, 'Wrong supplemental page manifest'
        allowed.add(relative)
    assert len(allowed) == 7
    return allowed
