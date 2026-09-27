"""Package verified grammar source pages, reusing existing lesson images when possible."""
from pathlib import Path
import argparse
import hashlib
import io
import json
import pypdfium2 as pdfium

parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, required=True)
parser.add_argument('--out', type=Path, default=Path('dist-online'))
args = parser.parse_args()
catalog_path = Path('app/data/textbook-grammar.json')
catalog = json.loads(catalog_path.read_text())
mapping = json.loads(Path('app/data/nce-pages.json').read_text())
lessons = json.loads((args.out/'lesson-pages/index.json').read_text())
sources = {hashlib.sha256(p.read_bytes()).hexdigest(): p for p in args.source.glob('*.pdf')}
existing = {}
for key, entry in lessons['lessons'].items():
    book = key.split('-')[0]
    assert lessons['sources'][book] == mapping[book]['sourceSha256']
    for page in entry['pages']:
        existing[(book, page['page'])] = page
output = args.out/'grammar'
output.mkdir(parents=True, exist_ok=True)
index = {'version': 1, 'catalogSha256': hashlib.sha256(catalog_path.read_bytes()).hexdigest(),
         'sources': {book: info['sourceSha256'] for book, info in mapping.items()}, 'pages': {}, 'files': {}}
for book, info in mapping.items():
    source = sources.get(info['sourceSha256'])
    assert source, f'{book}: exact source PDF missing; do not guess an edition'
    pages = sorted({p for e in catalog['entries'] if e['book'] == book for p in e['pages']})
    doc = pdfium.PdfDocument(source)
    assert len(doc) == info['pageCount']
    for number in pages:
        assert 1 <= number <= len(doc)
        previous = existing.get((book, number))
        if previous:
            src, digest = previous['src'], previous['sha256']
            raw = (args.out/src.lstrip('/')).read_bytes()
            assert hashlib.sha256(raw).hexdigest() == digest
        else:
            page = doc[number-1]
            bitmap = page.render(scale=1500/page.get_width())
            image = bitmap.to_pil().convert('RGB')
            data = io.BytesIO()
            image.save(data, format='JPEG', quality=84, optimize=True)
            raw = data.getvalue()
            digest = hashlib.sha256(raw).hexdigest()
            src = '/grammar/'+digest+'.jpg'
            (output/(digest+'.jpg')).write_bytes(raw)
            image.close()
            bitmap.close()
            page.close()
        index['pages'][f'{book}-{number}'] = {'src': src, 'sha256': digest}
        index['files'][src.lstrip('/')] = {'sha256': digest, 'bytes': len(raw)}
    doc.close()
    assert hashlib.sha256(source.read_bytes()).hexdigest() == info['sourceSha256'], 'Source changed during packaging'
    print(book, len(pages), 'grammar pages', flush=True)
temporary = output/'index.json.tmp'
temporary.write_text(json.dumps(index, ensure_ascii=False, separators=(',', ':'))+'\n')
temporary.replace(output/'index.json')
print('Packaged', len(index['pages']), 'source pages;', sum(p['src'].startswith('/lesson-pages/') for p in index['pages'].values()), 'reused lesson images')
