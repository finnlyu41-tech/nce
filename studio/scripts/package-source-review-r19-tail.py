"""Package the exact PDF424 render separately, retaining the four-page manifest."""
import argparse
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('r19_package', ROOT / 'scripts/package-source-review-r19.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def package(images, pdfs, output):
    rows = json.loads((ROOT / 'app/data/source-review-r19-tail-pages.json').read_text())
    return module.package(images, pdfs, output, rows, 'review-r19-tail-manifest.json')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-images', required=True, type=Path)
    parser.add_argument('--source-pdfs', required=True, type=Path)
    parser.add_argument('--output', default=ROOT / 'dist-online', type=Path)
    args = parser.parse_args()
    print(json.dumps(package(args.source_images, args.source_pdfs, args.output), ensure_ascii=False))
