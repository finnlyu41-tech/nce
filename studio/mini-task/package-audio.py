"""Package only this finite mini-task WAV batch after the existing HTML packager.

Online copies the exact emitted assets referenced by the inlined classic JS.
Offline embeds the same bytes as data URLs for the existing single-file CSP.
No source content, learner state or other packaged materials are rewritten.
"""
from pathlib import Path
import base64
import hashlib
import json
import shutil
import sys

online = '--online' in sys.argv
source = Path('static-export/assets')
output = Path('dist-online' if online else 'dist')
html_path = output / 'index.html'
html = html_path.read_text()
provenance = json.loads(Path('mini-task/audio/provenance.json').read_text())
rows = []
for authored in provenance['files']:
    stem = Path(authored['file']).stem
    candidates = list(source.glob(stem + '-*.wav'))
    if len(candidates) != 1:
        raise RuntimeError('Missing/ambiguous emitted mini audio: ' + stem)
    asset = candidates[0]
    data = asset.read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    if digest != authored['sha256']:
        raise RuntimeError('Mini audio source mismatch: ' + stem)
    url = '/assets/' + asset.name
    if url not in html:
        raise RuntimeError('Classic HTML does not reference mini audio: ' + stem)
    rows.append((asset, data, url, digest))
if len(rows) != 10:
    raise RuntimeError('This batch must package exactly ten original WAVs')

for asset, data, url, digest in rows:
    if online:
        destination = output / 'assets' / asset.name
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(asset, destination)
        if hashlib.sha256(destination.read_bytes()).hexdigest() != digest:
            raise RuntimeError('Mini audio output verification failed')
    else:
        html = html.replace(url, 'data:audio/wav;base64,' + base64.b64encode(data).decode())
if online:
    version_path = output / 'version.json'
    version = json.loads(version_path.read_text())
    version['mini_audio_assets'] = {'assets/' + a.name: digest for a, _, _, digest in rows}
    version_path.write_text(json.dumps(version, ensure_ascii=False, indent=2) + '\n')
if not online:
    html_path.write_text(html)
    if '/assets/mini-n1-' in html:
        raise RuntimeError('Offline mini audio still references an external asset')

receipt = {'mode': 'online' if online else 'offline', 'files': [
    {'file': a.name, 'sha256': digest, 'bytes': len(data)} for a, data, _, digest in rows
], 'count': len(rows), 'learnerDataRead': False}
evidence = Path('work/r12-host')
evidence.mkdir(parents=True, exist_ok=True)
(evidence / ('package-audio-' + receipt['mode'] + '.json')).write_text(json.dumps(receipt, indent=2) + '\n')
print('Packaged 10 verified mini-task WAVs (' + receipt['mode'] + ')')
