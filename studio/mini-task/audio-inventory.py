"""Exactly frozen batches01/02 plus this explicit authored batch03. No globs."""
import json,re,runpy
BANKS=['guided','independent','repair','delayed-a','delayed-b']
def authored_audio(mini_root):
    old=runpy.run_path(str(mini_root/'batch-02/audio_inventory.py'))['authored_audio'](mini_root)
    assert len(old)==20, 'Frozen first two batches required by batch03'
    spec=json.loads((mini_root/'batch-03/audio-batch.json').read_text())
    assert spec['version']==1 and spec['provenance']=='audio/provenance.json'
    assert spec['courseNumbers'] in [[25],[25,33]] and spec['count']==5*len(spec['courseNumbers'])
    rows=json.loads((mini_root/'batch-03/audio/provenance.json').read_text())['files']
    expected={f'mini-n1-{n:02d}-{b}.wav' for n in spec['courseNumbers'] for b in BANKS}
    assert len(rows)==spec['count'] and {r['file'] for r in rows}==expected, 'Missing/unknown batch03 WAV provenance'
    for r in rows:
        assert re.fullmatch(r'[a-f0-9]{64}',r['sha256'])
    combined=old+[{**r,'file':'batch-03/audio/'+r['file']} for r in rows]
    assert len({r['file'] for r in combined})==len(combined)
    return combined
