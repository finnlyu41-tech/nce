"""Verify the tail asset coexists with the unchanged four-page bundle."""
import argparse
import importlib.util
import json
from pathlib import Path
import shutil
import tempfile

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('tail_package', ROOT / 'scripts/package-source-review-r19-tail.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
row = json.loads((ROOT / 'app/data/source-review-r19-tail-pages.json').read_text())[0]
parser = argparse.ArgumentParser()
parser.add_argument('--source-images', required=True, type=Path)
parser.add_argument('--source-pdfs', required=True, type=Path)
args = parser.parse_args()
groups = []
with tempfile.TemporaryDirectory(prefix='r19-tail-package-') as temporary:
    root = Path(temporary); images = root / 'images'; pdfs = root / 'pdfs'; out = root / 'out'
    images.mkdir(); pdfs.mkdir()
    page = images / row['originalRenderFile']; shutil.copyfile(args.source_images / row['originalRenderFile'], page)
    pdf = pdfs / 'NCE2.pdf'; pdf.symlink_to((args.source_pdfs / 'NCE2.pdf').resolve())
    module.module.package(args.source_images, args.source_pdfs, out)
    original = {p.relative_to(out).as_posix(): p.read_bytes() for p in out.rglob('*') if p.is_file()}
    manifest = module.package(images, pdfs, out)
    assert all((out / p).read_bytes() == data for p, data in original.items())
    actual = out / 'lesson-pages' / (row['imageSha256'] + '.png')
    assert actual.read_bytes() == page.read_bytes(); assert module.module.digest(actual.read_bytes()) == row['imageSha256']
    assert len(manifest['pages']) == 1; assert manifest['pages'][0]['lesson'] == 83
    assert 'review-r19-tail-manifest.json' in [p.name for p in (out / 'lesson-pages').iterdir()]
    assert str(root) not in json.dumps(manifest)
    groups.append('exact PDF424 PNG and separate manifest added; four earlier assets/manifest bytes retained')
    snapshot = {p.relative_to(out).as_posix(): p.read_bytes() for p in out.rglob('*') if p.is_file()}
    module.package(images, pdfs, out)
    assert snapshot == {p.relative_to(out).as_posix(): p.read_bytes() for p in out.rglob('*') if p.is_file()}
    groups.append('idempotent tail packaging preserves all five pages and both manifests')
    good = page.read_bytes(); page.write_bytes(b'Corrupt render'); failed = root / 'failed-image'
    try: module.package(images, pdfs, failed); raise AssertionError('Accepted corrupt image')
    except ValueError: pass
    assert not failed.exists(); page.write_bytes(good)
    groups.append('wrong image SHA/signature rejected before writing')
    pdf.unlink(); pdf.write_bytes(b'Wrong edition'); failed = root / 'failed-pdf'
    try: module.package(images, pdfs, failed); raise AssertionError('Accepted wrong PDF')
    except ValueError: pass
    assert not failed.exists(); pdf.unlink(); pdf.symlink_to((args.source_pdfs / 'NCE2.pdf').resolve())
    groups.append('wrong PDF edition rejected before writing')
    actual.write_bytes(b'Conflicting existing asset'); saved = {p.relative_to(out).as_posix(): p.read_bytes() for p in out.rglob('*') if p.is_file()}
    try: module.package(images, pdfs, out); raise AssertionError('Overwrote conflicting image')
    except ValueError: pass
    assert saved == {p.relative_to(out).as_posix(): p.read_bytes() for p in out.rglob('*') if p.is_file()}
    groups.append('conflicting destination rejected; earlier bundle untouched')
print(json.dumps({'passed': len(groups), 'groups': groups}))
