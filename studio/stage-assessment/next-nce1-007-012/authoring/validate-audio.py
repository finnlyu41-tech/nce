"""Validate the finite offline synthesis batch. Never reads learner state."""
from pathlib import Path
import array,hashlib,io,json,math,wave

ROOT=Path(__file__).resolve().parents[1]
NAMES={*(f'listening-{c}.wav' for c in 'abcdef'),'practice-listening.wav'}
def validate_pcm(data):
    with wave.open(io.BytesIO(data),'rb') as w:
        if (w.getnchannels(),w.getsampwidth(),w.getframerate())!=(1,2,22050):
            raise ValueError('PCM must be mono 16-bit 22050 Hz')
        count=w.getnframes();pcm=w.readframes(count)
        if count<=22050 or len(pcm)!=count*2:raise ValueError('Empty or truncated PCM')
    samples=array.array('h',pcm)
    rms=math.sqrt(sum(s*s for s in samples)/len(samples))
    if rms<=100 or max(abs(s) for s in samples)<=500:raise ValueError('Silent PCM')
    return count/22050,rms
def inventory(root=ROOT):
    rows=json.loads((root/'audio/provenance.json').read_text())['files']
    scripts=json.loads((root/'authoring/audio-scripts.json').read_text())['scripts']
    if {r['file'] for r in rows}!=NAMES or len(rows)!=len(NAMES):raise ValueError('Finite batch incomplete')
    for row in rows:
        if Path(row['file']).name!=row['file']:raise ValueError('Foreign namespace')
        data=(root/'audio'/row['file']).read_bytes()
        if len(data)!=row['bytes'] or hashlib.sha256(data).hexdigest()!=row['sha256']:raise ValueError('Audio digest mismatch')
        duration,rms=validate_pcm(data)
        if abs(duration-row['durationSeconds'])>1e-9 or abs(rms-row['pcmRms'])>1e-6:raise ValueError('PCM metadata mismatch')
        if row['humanVoice'] is not False or row['humanListenReviewVerified'] is not False:raise ValueError('Unsupported human claim')
        script=scripts[Path(row['file']).stem]
        if hashlib.sha256(script.encode()).hexdigest()!=row['sourceScriptSha256']:raise ValueError('Script binding mismatch')
    return rows
if __name__=='__main__':
    print(json.dumps({'count':len(inventory()),'pcmAndSourceHashesVerified':True,'humanVerified':False,'learnerDataRead':False}))
