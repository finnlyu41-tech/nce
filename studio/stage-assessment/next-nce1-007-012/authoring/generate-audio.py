"""Existing local macOS voices; no API, payment, user recording or clock change."""
import hashlib,json,math,struct,subprocess,wave
from pathlib import Path
root=Path(__file__).resolve().parent.parent
source=json.loads((root/'authoring/audio-scripts.json').read_text())
ledger=[]
for name,text in source['scripts'].items():
 path=root/'audio'/f'{name}.wav'
 if not path.exists():
  subprocess.run(['/usr/bin/say','-v','Samantha (English (US))','-r','125','--file-format=WAVE','--data-format=LEI16@22050','-o',str(path),text],check=True)
 with wave.open(str(path),'rb') as f:
  assert f.getsampwidth()==2 and f.getnchannels()==1 and f.getframerate()==22050 and f.getnframes()>22050
  raw=f.readframes(f.getnframes());values=struct.unpack('<'+'h'*(len(raw)//2),raw);rms=math.sqrt(sum(v*v for v in values)/len(values));duration=len(values)/22050
  assert rms>100 and max(abs(v) for v in values)>500,'Reject zero/silent PCM'
 ledger.append({'file':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size,'durationSeconds':duration,'pcmRms':rms,'sourceScriptSha256':hashlib.sha256(text.encode()).hexdigest(),'voice':'Samantha (English (US))','method':'installed macOS offline synthesis','humanVoice':False,'humanListenReviewVerified':False})
 print('PASS',path.name,round(duration,2),'seconds; nonzero PCM; offline synthesized')
(root/'audio/provenance.json').write_text(json.dumps({'scope':'new synthetic learning audio; not human stage-delivery evidence','files':ledger},indent=2)+'\n')
