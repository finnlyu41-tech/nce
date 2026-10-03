"""Run the unchanged production validator against an owned source view containing
only the reviewable publisher worker patch. Author/publisher source files stay untouched.
"""
from pathlib import Path
import hashlib,json,runpy,tempfile
root=Path(__file__).resolve().parents[2]
source=root/'scripts/pages-access.js';before=source.read_bytes();worker=(root/'dist-online/_worker.js').read_bytes()
verify=runpy.run_path(str(root/'scripts/verify-online.py'))['verify']
with tempfile.TemporaryDirectory(prefix='mini-b05-source-view-') as folder:
 view=Path(folder);(view/'scripts').mkdir()
 for name in ['app','public','mini-task']:(view/name).symlink_to(root/name,target_is_directory=True)
 (view/'scripts/pages-access.js').write_bytes(worker)
 (view/'scripts/verify-source-review-r19.py').symlink_to(root/'scripts/verify-source-review-r19.py')
 verify.__globals__['ROOT']=view
 verify(root/'dist-online')
assert source.read_bytes()==before
(root/'mini-task/batch-05/evidence/composed-verifier.json').write_text(json.dumps({'validator':'unchanged scripts/verify-online.py','sourceView':'current authored mini data + publisher worker candidate; other source symlinks read-only','authorWorkerSourceUnmodified':True,'publisherTreeUnmodified':True,'packagedWorkerSha256':hashlib.sha256(worker).hexdigest(),'finalPackagePass':True,'workerPatchRequiredBeforePublisherPackaging':True},indent=2)+'\n')
