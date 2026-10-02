"""Copy four exact, previously reviewed full-page renders; never rewrite the index."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def digest(data):
    return hashlib.sha256(data).hexdigest()


def package(images, pdfs, output):
    rows = json.loads((ROOT / 'app/data/source-review-r19-pages.json').read_text())
    staged = []
    checked_books = {}
    for row in rows:
        book = row['book']
        if book not in checked_books:
            actual = digest((pdfs / (book + '.pdf')).read_bytes())
            if actual != row['sourceBookSha256']:
                raise ValueError('Wrong original PDF edition: ' + book)
            checked_books[book] = actual
        data = (images / row['originalRenderFile']).read_bytes()
        if not data.startswith(b'\x89PNG\r\n\x1a\n') or digest(data) != row['imageSha256']:
            raise ValueError('Wrong full-page render: ' + row['originalRenderFile'])
        path = output / 'lesson-pages' / (row['imageSha256'] + '.png')
        if path.exists() and path.read_bytes() != data:
            raise ValueError('Conflicting existing page asset: ' + path.name)
        staged.append((path, data))
    manifest = {'schemaVersion': 1, 'scope': 'four exact supplemental source pages; raw index unchanged',
                'sources': checked_books, 'pages': [
                    {key: row[key] for key in ['book', 'lesson', 'pdfPage', 'src', 'imageSha256', 'sourceBookSha256']}
                    for row in rows]}
    # All source and destination checks precede writes. Atomic replacement
    # avoids exposing a partial individual image after an interrupted copy.
    for path, data in staged:
        if path.exists():
            continue
        path.parent.mkdir(parents=True, exist_ok=True)
        atomic_write(path, data)
    atomic_write(output / 'lesson-pages/review-r19-manifest.json',
                 (json.dumps(manifest, ensure_ascii=False, indent=2) + '\n').encode())
    return manifest


def atomic_write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as handle:
            temporary = Path(handle.name)
            handle.write(data)
        os.replace(temporary, path)
    finally:
        if temporary and temporary.exists():
            temporary.unlink()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-images', required=True, type=Path)
    parser.add_argument('--source-pdfs', required=True, type=Path)
    parser.add_argument('--output', default=ROOT / 'dist-online', type=Path)
    args = parser.parse_args()
    print(json.dumps(package(args.source_images, args.source_pdfs, args.output), ensure_ascii=False))
