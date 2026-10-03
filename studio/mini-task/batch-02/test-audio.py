"""Finite current batches packaging/verifier tests with owned synthetic fixtures."""
from pathlib import Path
import base64,copy,hashlib,json,runpy,shutil,subprocess,sys,tempfile
root=Path(__file__).resolve().parents[2];mini=root/'mini-task'
get=runpy.run_path(str(mini/'batch-02/audio_inventory.py'))['authored_audio'];rows=get(mini);verify=runpy.run_path(str(mini/'verify-audio.py'))['verify_audio'];checks=[]
for case in ['online','offline','missing','corrupt','unreferenced','unknown-provenance','count-mismatch']:
 with tempfile.TemporaryDirectory(prefix='mini-b02-package-') as folder:
  cwd=Path(folder);shutil.copytree(mini/'batch-02/audio',cwd/'mini-task/batch-02/audio');shutil.copytree(mini/'audio',cwd/'mini-task/audio');shutil.copyfile(mini/'audio-batches.json',cwd/'mini-task/audio-batches.json');shutil.copyfile(mini/'batch-02/audio_inventory.py',cwd/'mini-task/batch-02/audio_inventory.py');assets=cwd/'static-export/assets';assets.mkdir(parents=True);out=cwd/('dist' if case=='offline' else 'dist-online');out.mkdir();urls=[]
  for row in rows:
   name=Path(row['file']).stem+'-Test1234.wav';(assets/name).write_bytes((mini/row['file']).read_bytes());urls.append('/assets/'+name)
  html='/materials/protected.mp3 '+' '.join(urls);(out/'index.html').write_text(html);version={'version':'fixture','map_assets':{'map/assets/original.js':'protected'},'materials_count':556};(out/'version.json').write_text(json.dumps(version));(out/'protected.bin').write_bytes(b'original-resource');first=assets/urls[0].split('/')[-1]
  if case=='missing':first.unlink()
  if case=='corrupt':first.write_bytes(b'wrong')
  if case=='unreferenced':(out/'index.html').write_text(html.replace(urls[-1],''))
  if case=='unknown-provenance':
   p=cwd/'mini-task/batch-02/audio/provenance.json';v=json.loads(p.read_text());v['files'][0]['file']='unknown.wav';p.write_text(json.dumps(v))
  if case=='count-mismatch':
   p=cwd/'mini-task/audio-batches.json';v=json.loads(p.read_text());v['batches'][1]['count']+=1;p.write_text(json.dumps(v))
  before=(out/'index.html').read_bytes();r=subprocess.run([sys.executable,str(mini/'package-audio.py'),*(['--online'] if case!='offline' else [])],cwd=cwd,capture_output=True,text=True)
  assert (out/'protected.bin').read_bytes()==b'original-resource'
  if case not in ['online','offline']:assert r.returncode and (out/'index.html').read_bytes()==before and not (out/'assets').exists()
  elif case=='online':
   assert not r.returncode,r.stderr;v=json.loads((out/'version.json').read_text());ledger=v.pop('mini_audio_assets');assert v==version and len(ledger)==len(rows) and (out/'index.html').read_bytes()==before
   for p,digest in ledger.items():assert hashlib.sha256((out/p).read_bytes()).hexdigest()==digest
  else:
   assert not r.returncode,r.stderr;text=(out/'index.html').read_text();assert all(url not in text for url in urls) and text.count('data:audio/wav;base64,')==len(rows) and '/materials/protected.mp3' in text
   for row in rows:assert base64.b64encode((mini/row['file']).read_bytes()).decode() in text
  checks.append(case);print('PASS finite packaging '+case)
for case in ['valid','unknown-ledger','missing','hash','corrupt','unknown-map','missing-map-ref','missing-html-ref']:
 with tempfile.TemporaryDirectory(prefix='mini-b02-verifier-') as folder:
  out=Path(folder);(out/'assets').mkdir();(out/'map/assets').mkdir(parents=True);ledger={}
  for row in rows:
   p='assets/'+Path(row['file']).stem+'-Test1234.wav';raw=(mini/row['file']).read_bytes();(out/p).write_bytes(raw);(out/('map/'+p)).write_bytes(raw);ledger[p]=row['sha256']
  version={'mini_audio_assets':copy.deepcopy(ledger),'map_assets':{'map/'+p:d for p,d in ledger.items()}};js=';'.join('new URL(`'+Path(p).name+'`,import.meta.url)' for p in ledger);(out/'map/assets/index-Test1234.js').write_text(js);refs={'map/assets/index-Test1234.js','map/assets/index-Test1234.css'};html=' '.join('/'+p for p in ledger);first=next(iter(ledger))
  if case=='unknown-ledger':version['mini_audio_assets']['assets/unknown-Test1234.wav']='0'*64
  if case=='missing':(out/first).unlink()
  if case=='hash':version['mini_audio_assets'][first]='0'*64
  if case=='corrupt':(out/first).write_bytes(b'wrong')
  if case=='unknown-map':version['map_assets']['map/assets/unknown-Test1234.wav']='0'*64
  if case=='missing-map-ref':(out/'map/assets/index-Test1234.js').write_text(js.replace(Path(first).name,'missing'))
  if case=='missing-html-ref':html=html.replace('/'+first,'')
  try:allowed,map_paths=verify(out,version,html,refs)
  except (AssertionError,FileNotFoundError):assert case!='valid'
  else:assert case=='valid' and allowed==set(ledger) and len(map_paths)==len(rows)
  checks.append('verifier-'+case);print('PASS strict finite verifier '+case)
print('PASS '+str(len(checks))+' finite media packaging/whitelist groups; authored WAV count='+str(len(rows)))
