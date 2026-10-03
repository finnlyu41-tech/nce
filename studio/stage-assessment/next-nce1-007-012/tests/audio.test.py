import importlib.util,io,json,tempfile,unittest,wave
from pathlib import Path
MODULE=Path(__file__).resolve().parents[1]/'authoring/validate-audio.py'
spec=importlib.util.spec_from_file_location('audio_validation',MODULE);v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
class AudioTests(unittest.TestCase):
    def test_real_batch_pcm_hash_and_private_script_binding(self):self.assertEqual(len(v.inventory()),7)
    def test_zero_and_silent_pcm_are_rejected(self):
        for count in [0,44100]:
            b=io.BytesIO()
            with wave.open(b,'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(22050);w.writeframes(b'\0\0'*count)
            with self.assertRaises(ValueError):v.validate_pcm(b.getvalue())
    def test_truncated_actual_audio_is_rejected(self):
        data=(v.ROOT/'audio/listening-a.wav').read_bytes()
        with self.assertRaises((ValueError,EOFError)):v.validate_pcm(data[:-60000])
    def test_wrong_hash_and_foreign_path_are_rejected(self):
        for field,value in [('sha256','0'*64),('file','../listening-a.wav')]:
            with tempfile.TemporaryDirectory(prefix='r13-audio-unit-') as temp:
                root=Path(temp);(root/'audio').mkdir();(root/'authoring').mkdir();rows=json.loads((v.ROOT/'audio/provenance.json').read_text());rows['files'][0][field]=value;(root/'audio/provenance.json').write_text(json.dumps(rows));(root/'authoring/audio-scripts.json').write_bytes((v.ROOT/'authoring/audio-scripts.json').read_bytes())
                for name in v.NAMES:(root/'audio'/name).write_bytes((v.ROOT/'audio'/name).read_bytes())
                with self.assertRaises(ValueError):v.inventory(root)
if __name__=='__main__':unittest.main()
