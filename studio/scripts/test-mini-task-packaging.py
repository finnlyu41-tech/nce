"""Finite owned packaging fixture; never opens learner storage."""
from pathlib import Path
import base64, hashlib, json, shutil, subprocess, sys, tempfile
root = Path(__file__).resolve().parents[1]
provenance = json.loads((root/'mini-task/audio/provenance.json').read_text())
checks = []
for mode in ['online', 'offline', 'missing', 'corrupt', 'unreferenced']:
    with tempfile.TemporaryDirectory(prefix='r12-mini-pack-') as folder:
        cwd = Path(folder)
        (cwd/'mini-task/audio').mkdir(parents=True)
        shutil.copyfile(root/'mini-task/audio/provenance.json',cwd/'mini-task/audio/provenance.json')
        assets = cwd/'static-export/assets';assets.mkdir(parents=True)
        out = cwd/('dist-online' if mode != 'offline' else 'dist');out.mkdir()
        urls=[]
        for row in provenance['files']:
            stem=Path(row['file']).stem;name=stem+'-Test1234.wav'
            data=(root/'mini-task/audio'/Path(row['file']).name).read_bytes()
            (assets/name).write_bytes(data);urls.append('/assets/'+name)
        html='original material /materials/preserved.mp3 '+ ' '.join(urls)
        (out/'index.html').write_text(html)
        version={'version':'fixture','map_assets':{'map/assets/test.js':'untouched'},'materials_count':926,'language_sha256':'protected'}
        (out/'version.json').write_text(json.dumps(version))
        (out/'protected.bin').write_bytes(b'preserve')
        if mode=='missing': (assets/urls[0].split('/')[-1]).unlink()
        if mode=='corrupt': (assets/urls[0].split('/')[-1]).write_bytes(b'wrong')
        if mode=='unreferenced': (out/'index.html').write_text(html.replace(urls[0],''))
        before=(out/'index.html').read_bytes()
        result=subprocess.run([sys.executable,str(root/'mini-task/package-audio.py'),*(['--online'] if mode!='offline' else [])],cwd=cwd,capture_output=True,text=True)
        assert (out/'protected.bin').read_bytes()==b'preserve'
        if mode in ['missing','corrupt','unreferenced']:
            assert result.returncode!=0
            assert (out/'index.html').read_bytes()==before
            assert not (out/'assets').exists()
            assert json.loads((out/'version.json').read_text())==version
        elif mode=='online':
            assert result.returncode==0,result.stderr
            actual=json.loads((out/'version.json').read_text());ledger=actual.pop('mini_audio_assets')
            assert actual==version and len(ledger)==10
            assert (out/'index.html').read_bytes()==before
            assert len(list((out/'assets').iterdir()))==10
            for name,digest in ledger.items():assert hashlib.sha256((out/name).read_bytes()).hexdigest()==digest
        else:
            assert result.returncode==0,result.stderr
            text=(out/'index.html').read_text();assert all(u not in text for u in urls)
            assert text.count('data:audio/wav;base64,')==10 and '/materials/preserved.mp3' in text
            for row in provenance['files']:
                data=(root/'mini-task/audio'/Path(row['file']).name).read_bytes()
                assert base64.b64encode(data).decode() in text
            assert json.loads((out/'version.json').read_text())==version
        checks.append(mode);print('PASS finite packaging '+mode)
print('PASS 5 owned finite packaging/negative fixture groups')
