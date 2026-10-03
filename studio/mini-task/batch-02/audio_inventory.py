"""Read exactly the two authored mini batches, never glob media or learner data."""
from pathlib import Path
import json, re
BANKS=['guided','independent','repair','delayed-a','delayed-b']
def authored_audio(mini_root):
    spec=json.loads((mini_root/'audio-batches.json').read_text())
    assert spec['version']==1 and len(spec['batches'])==2
    assert spec['batches'][0]=={'provenance':'audio/provenance.json','courseNumbers':[1,9],'count':10}
    second=spec['batches'][1]
    assert second['provenance']=='batch-02/audio/provenance.json'
    assert second['courseNumbers'] in [[13],[13,21]] and second['count']==5*len(second['courseNumbers'])
    output=[]
    for batch in spec['batches']:
        path=mini_root/batch['provenance'];rows=json.loads(path.read_text())['files']
        expected={f'mini-n1-{number:02d}-{bank}.wav' for number in batch['courseNumbers'] for bank in BANKS}
        assert len(rows)==batch['count'] and {r['file'] for r in rows}==expected, 'Missing/unknown finite WAV provenance'
        for row in rows:
            assert re.fullmatch(r'[a-f0-9]{64}',row['sha256'])
            output.append({**row,'file':(path.parent.relative_to(mini_root)/row['file']).as_posix()})
    assert len({r['file'] for r in output})==len(output)
    return output
