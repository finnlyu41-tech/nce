"""Run after existing standalone packager. Only owns these seven new WAVs.

Online copies exact hashed assets; offline embeds same bytes for existing CSP.
Private authoring scripts/reference answers are never copied to either package.
"""
from pathlib import Path
import base64,hashlib,importlib.util,json,shutil,sys
ROOT=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('r13_audio',ROOT/'authoring/validate-audio.py');validation=importlib.util.module_from_spec(spec);spec.loader.exec_module(validation)
online='--online' in sys.argv
source=Path('static-export/assets');out=Path('dist-online' if online else 'dist');html_path=out/'index.html';html=html_path.read_text();rows=[]
for item in validation.inventory():
    candidates=list(source.glob(Path(item['file']).stem+'-*.wav'))
    if len(candidates)!=1:raise ValueError('Missing or ambiguous new stage asset: '+item['file'])
    asset=candidates[0];data=asset.read_bytes();digest=hashlib.sha256(data).hexdigest();url='/assets/'+asset.name
    if digest!=item['sha256'] or url not in html:raise ValueError('Stage asset source/package binding failed: '+item['file'])
    rows.append((asset,data,url,digest))
for asset,data,url,digest in rows:
    if online:
        dest=out/'assets'/asset.name;dest.parent.mkdir(exist_ok=True);shutil.copyfile(asset,dest)
        if hashlib.sha256(dest.read_bytes()).hexdigest()!=digest:raise ValueError('Copied stage asset hash mismatch')
    else:html=html.replace(url,'data:audio/wav;base64,'+base64.b64encode(data).decode())
if not online:
    html_path.write_text(html)
    for _,_,url,_ in rows:
        if url in html:raise ValueError('Offline audio still references external asset')
else:
    path=out/'version.json';version=json.loads(path.read_text());version['stage_007_012_audio_assets']={'assets/'+a.name:d for a,_,_,d in rows};version['html_sha256']=hashlib.sha256(html_path.read_bytes()).hexdigest();path.write_text(json.dumps(version,indent=2)+'\n')
receipt={'mode':'online' if online else 'offline','files':[{'file':a.name,'sha256':d,'bytes':len(b)} for a,b,_,d in rows],'count':len(rows),'learnerDataRead':False,'humanStageDeliveryVerified':False,'htmlSha256':hashlib.sha256(html_path.read_bytes()).hexdigest()}
evidence=Path('work/stage-r13');evidence.mkdir(parents=True,exist_ok=True);(evidence/('package-audio-'+receipt['mode']+'.json')).write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
