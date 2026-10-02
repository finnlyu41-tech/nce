"""Strict negative tests for only the new finite resource validator."""
from pathlib import Path
import copy, json, runpy, shutil, tempfile
root=Path(__file__).resolve().parents[1]
verify=runpy.run_path(str(root/'mini-task/verify-audio.py'))['verify_audio']
ledger=json.loads((root/'dist-online/version.json').read_text())['mini_audio_assets']
for case in ['valid','unknown-ledger','missing','hash','corrupt','unknown-map','missing-map-ref','missing-html-ref']:
    with tempfile.TemporaryDirectory(prefix='r12-audio-verify-') as folder:
        out=Path(folder);(out/'assets').mkdir();(out/'map/assets').mkdir(parents=True)
        version={'mini_audio_assets':copy.deepcopy(ledger),'map_assets':{}}
        for p,digest in ledger.items():
            shutil.copyfile(root/'dist-online'/p,out/p);shutil.copyfile(root/'dist-online'/p,out/('map/'+p));version['map_assets']['map/'+p]=digest
        js=';'.join('new URL(`'+Path(p).name+'`,import.meta.url)' for p in ledger)
        (out/'map/assets/index-Test1234.js').write_text(js);refs={'map/assets/index-Test1234.js','map/assets/index-Test1234.css'}
        html=' '.join('/'+p for p in ledger);first=next(iter(ledger))
        if case=='unknown-ledger':version['mini_audio_assets']['assets/unknown-Test1234.wav']='0'*64
        if case=='missing':(out/first).unlink()
        if case=='hash':version['mini_audio_assets'][first]='0'*64
        if case=='corrupt':(out/first).write_bytes(b'wrong')
        if case=='unknown-map':version['map_assets']['map/assets/unknown-Test1234.wav']='0'*64
        if case=='missing-map-ref':(out/'map/assets/index-Test1234.js').write_text(js.replace(Path(first).name,'absent'))
        if case=='missing-html-ref':html=html.replace('/'+first,'')
        try:allowed,map_paths=verify(out,version,html,refs)
        except (AssertionError,FileNotFoundError):assert case!='valid',case
        else:assert case=='valid' and allowed==set(ledger) and map_paths=={'map/'+p for p in ledger},case
        print('PASS strict audio verifier '+case)
print('PASS 8 finite audio whitelist/hash/reference negative groups')
