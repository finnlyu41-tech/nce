"""Verify all seven declared stage WAVs against authored PCM hashes and both bundles."""
from pathlib import Path
import hashlib,importlib.util,re

def verify_audio(root,version,html,map_refs):
    source=Path(__file__).resolve().parent
    spec=importlib.util.spec_from_file_location('stage_audio_validation',source/'authoring/validate-audio.py');validation=importlib.util.module_from_spec(spec);spec.loader.exec_module(validation)
    inventory=validation.inventory();ledger=version.get('stage_007_012_audio_assets',{})
    assert len(inventory)==len(ledger)==7, 'Incomplete stage audio ledger'
    root_paths=set();map_paths=set();map_js='\n'.join((root/p).read_text()for p in map_refs if p.endswith('.js'))
    for row in inventory:
        stem=Path(row['file']).stem;paths=[p for p in ledger if re.fullmatch(r'assets/'+re.escape(stem)+r'-[a-zA-Z0-9_-]{8,}\.wav',p)]
        assert len(paths)==1,'Unknown or ambiguous stage audio filename'
        path=paths[0];raw=(root/path).read_bytes();original=(source/'audio'/row['file']).read_bytes();digest=row['sha256'];map_path='map/'+path
        assert raw==original and hashlib.sha256(raw).hexdigest()==ledger[path]==digest,'Stage audio hash mismatch'
        assert '/'+path in html and Path(path).name in map_js,'Stage audio absent from learner bundle'
        assert version['map_assets'].get(map_path)==digest and (root/map_path).read_bytes()==raw,'Map stage audio mismatch'
        root_paths.add(path);map_paths.add(map_path)
    assert root_paths==set(ledger),'Unknown stage ledger entry'
    return root_paths,map_paths
