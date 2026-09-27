"""Render read-only textbook pages; bind verified page mapping to exact source hashes."""
from pathlib import Path
import argparse, hashlib, json, io
import pypdfium2 as pdfium

parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, required=True)
parser.add_argument('--out', type=Path, default=Path('dist-online/lesson-pages'))
args = parser.parse_args()
mapping = json.loads(Path('app/data/nce-pages.json').read_text())
manifest = json.loads(Path('dist-online/materials/manifest.json').read_text())
sources = {hashlib.sha256(p.read_bytes()).hexdigest():p for p in args.source.glob('*.pdf')}
args.out.mkdir(parents=True, exist_ok=True)
index = {'version':1, 'lessons':{}, 'sources':{}, 'files':{}}
for book, info in mapping.items():
    source = sources.get(info['sourceSha256'])
    assert source, f'{book}: exact source PDF not found'
    doc = pdfium.PdfDocument(source)
    assert len(doc) == info['pageCount']
    index['sources'][book] = info['sourceSha256']
    for lesson, start in sorted(info['starts'].items(), key=lambda item:int(item[0])):
        title = next((f.get('title','') for f in manifest['files'] if f['book']==book and f.get('lesson')==int(lesson)), '')
        entry = {'title':title, 'pages':[]}
        for number in [start, start+1]:
            page = doc[number-1]
            image = page.render(scale=1500/page.get_width()).to_pil().convert('RGB')
            output = io.BytesIO(); image.save(output,format='JPEG',quality=84,optimize=True)
            raw = output.getvalue(); digest = hashlib.sha256(raw).hexdigest()
            name = digest+'.jpg'; (args.out/name).write_bytes(raw)
            index['files'][name] = {'sha256':digest,'bytes':len(raw)}
            entry['pages'].append({'page':number,'src':'/lesson-pages/'+name,'sha256':digest})
            page.close()
        index['lessons'][book+'-'+lesson] = entry
    doc.close()
    print(book, len(info['starts']), 'lessons rendered',flush=True)
(args.out/'index.json').write_text(json.dumps(index,ensure_ascii=False,separators=(',',':'))+'\n')
print('Packaged',len(index['lessons']),'lessons;',len(index['files']),'images')
