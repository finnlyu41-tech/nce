"""Exercise the real packager against authorized, exact original PDF/render fixtures."""
import argparse
import importlib.util
import json
from pathlib import Path
import shutil
import tempfile

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('r19_package', ROOT / 'scripts/package-source-review-r19.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
rows = json.loads((ROOT / 'app/data/source-review-r19-pages.json').read_text())
parser = argparse.ArgumentParser()
parser.add_argument('--source-images', required=True, type=Path)
parser.add_argument('--source-pdfs', required=True, type=Path)
args = parser.parse_args()
groups = []
with tempfile.TemporaryDirectory(prefix='r19-package-test-') as temporary:
    area = Path(temporary)
    images, pdfs, out = area / 'images', area / 'pdfs', area / 'out'
    images.mkdir(); pdfs.mkdir()
    for row in rows:
        shutil.copyfile(args.source_images / row['originalRenderFile'], images / row['originalRenderFile'])
    for book in {r['book'] for r in rows}:
        (pdfs / (book + '.pdf')).symlink_to((args.source_pdfs / (book + '.pdf')).resolve())
    out.mkdir(); sentinel = out / 'index-preserved.txt'; sentinel.write_text('Unrelated raw bundle')
    manifest = module.package(images, pdfs, out)
    for row in rows:
        data = (out / 'lesson-pages' / (row['imageSha256'] + '.png')).read_bytes()
        assert module.digest(data) == row['imageSha256']
        assert data == (args.source_images / row['originalRenderFile']).read_bytes()
    assert len(manifest['pages']) == 4
    assert sentinel.read_text() == 'Unrelated raw bundle'
    assert str(area) not in json.dumps(manifest)
    groups.append('four exact original PNGs, PDFs, manifest and unrelated files retained')
    before = {p.relative_to(out).as_posix(): p.read_bytes() for p in out.rglob('*') if p.is_file()}
    assert module.package(images, pdfs, out) == manifest
    assert before == {p.relative_to(out).as_posix(): p.read_bytes() for p in out.rglob('*') if p.is_file()}
    groups.append('idempotent packaging preserves every output byte')
    # Corrupt the last page: earlier pages must not be copied before validation.
    last = images / rows[-1]['originalRenderFile']; original = last.read_bytes(); last.write_bytes(b'Not a reviewed PNG')
    failed = area / 'failed-image'
    try: module.package(images, pdfs, failed); raise AssertionError('Accepted bad page')
    except ValueError: pass
    assert not failed.exists(); last.write_bytes(original)
    groups.append('last-page corruption fails before any output write')
    pdf = pdfs / 'NCE4.pdf'; pdf.unlink(); pdf.write_bytes(b'Wrong edition')
    failed = area / 'failed-pdf'
    try: module.package(images, pdfs, failed); raise AssertionError('Accepted wrong PDF')
    except ValueError: pass
    assert not failed.exists(); pdf.unlink(); pdf.symlink_to((args.source_pdfs / 'NCE4.pdf').resolve())
    groups.append('wrong later PDF edition fails before any output write')
    first = out / 'lesson-pages' / (rows[0]['imageSha256'] + '.png'); first.write_bytes(b'Conflicting destination')
    snapshot = {p.relative_to(out).as_posix(): p.read_bytes() for p in out.rglob('*') if p.is_file()}
    try: module.package(images, pdfs, out); raise AssertionError('Overwrote conflicting asset')
    except ValueError: pass
    assert snapshot == {p.relative_to(out).as_posix(): p.read_bytes() for p in out.rglob('*') if p.is_file()}
    groups.append('conflicting destination is never overwritten')
print(json.dumps({'passed': len(groups), 'groups': groups}))
