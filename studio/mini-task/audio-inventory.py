"""Exactly frozen batches01–03 plus explicit authored batch04. No globs."""
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
    assert len(combined)==30, 'Frozen first three complete batches required by batch04'
    spec4=json.loads((mini_root/'batch-04/audio-batch.json').read_text())
    assert spec4['version']==1 and spec4['provenance']=='audio/provenance.json'
    assert spec4['courseNumbers']==[37,45] and spec4['count']==10
    rows4=json.loads((mini_root/'batch-04/audio/provenance.json').read_text())['files']
    expected4={f'mini-n1-{n:02d}-{b}.wav' for n in spec4['courseNumbers'] for b in BANKS}
    assert len(rows4)==10 and {r['file'] for r in rows4}==expected4, 'Missing/unknown batch04 WAV provenance'
    for r in rows4: assert re.fullmatch(r'[a-f0-9]{64}',r['sha256'])
    combined += [{**r,'file':'batch-04/audio/'+r['file']} for r in rows4]
    assert len({r['file'] for r in combined})==len(combined)
    return combined
