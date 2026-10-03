"""Strict owned finite audio whitelist; reject unknown names, bytes and refs."""
from pathlib import Path
import hashlib, io, json, mimetypes, re, wave, runpy

def verify_audio(root, version, html, map_refs, other_verified_map_paths=frozenset()):
    source=Path(__file__).resolve().parent
    inventory=source/'audio-inventory.py'
    if not inventory.exists(): inventory=source/'batch-02/audio_inventory.py'
    authored=runpy.run_path(str(inventory))['authored_audio'](source)
    ledger=version.get('mini_audio_assets',{})
    assert len(ledger)==len(authored), 'Mini audio ledger incomplete'
    root_paths=set();map_paths=set()
    map_js='\n'.join((root/p).read_text() for p in map_refs if p.endswith('.js'))
    for row in authored:
        stem=Path(row['file']).stem
        paths=[p for p in ledger if re.fullmatch(r'assets/'+re.escape(stem)+r'-[a-zA-Z0-9_-]{8,}\.wav',p)]
        assert len(paths)==1, 'Unknown/missing/ambiguous mini audio filename'
        path=paths[0];digest=row['sha256']
        assert ledger[path]==digest and '/'+path in html, 'Mini audio hash/reference mismatch'
        assert mimetypes.guess_type(path)[0] in ['audio/wav','audio/x-wav'], 'Mini audio MIME mismatch'
        raw=(root/path).read_bytes();original=(source/row['file']).read_bytes()
        assert raw==original and hashlib.sha256(raw).hexdigest()==digest, 'Mini audio bytes mismatch'
        with wave.open(io.BytesIO(raw)) as audio:
            assert audio.getnchannels()==row['channels'] and audio.getframerate()==row['sampleRate']
            assert audio.getsampwidth()==2 and abs(audio.getnframes()/audio.getframerate()-row['seconds'])<.00001
        map_path='map/'+path;name=Path(path).name
        assert name in map_js, 'Map JS missing finite audio reference'
        assert version['map_assets'].get(map_path)==digest and (root/map_path).read_bytes()==raw, 'Map finite audio bytes mismatch'
        root_paths.add(path);map_paths.add(map_path)
    assert root_paths==set(ledger), 'Unknown mini audio ledger entry'
    assert {p for p in version['map_assets'] if p.endswith('.wav')}==map_paths | set(other_verified_map_paths), 'Unknown map audio entry'
    return root_paths,map_paths
