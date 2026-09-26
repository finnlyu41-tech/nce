import importlib.util
from pathlib import Path
import stat
import tempfile
import unittest
from unittest.mock import patch
import zipfile

spec = importlib.util.spec_from_file_location('pack', Path(__file__).with_name('package-materials.py'))
pack = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pack)


class PackageSafety(unittest.TestCase):
    def test_zip_traversal_and_links(self):
        for name in ['../escape.mp3', '/absolute.mp3', 'a/../../escape', 'C:/escape', 'a\\..\\escape']:
            with self.subTest(name=name), self.assertRaises(ValueError):
                pack.safe_zip_name(zipfile.ZipInfo(name))
        entry = zipfile.ZipInfo('safe-looking.mp3')
        entry.external_attr = (stat.S_IFLNK | 0o777) << 16
        with self.assertRaises(ValueError):
            pack.safe_zip_name(entry)

    def test_archive_expansion_limit(self):
        entry = zipfile.ZipInfo('NCE1/001.mp3')
        entry.file_size, entry.compress_size = 1000000, 1
        with self.assertRaises(ValueError):
            pack.safe_zip_name(entry)

    def test_ambiguous_book_not_guessed(self):
        with self.assertRaises(ValueError):
            pack.identify('NCE1/NCE2/01.mp3')
        self.assertEqual(pack.identify('NCE1-美音/001&002－title.mp3'), ('NCE1', 'us', [1, 2]))
        self.assertEqual(pack.identify('NCE2/unknown.mp3')[2], [])

    def test_failed_build_keeps_previous_manifest(self):
        with tempfile.TemporaryDirectory() as tmp:
            source, output = Path(tmp)/'source', Path(tmp)/'output'
            source.mkdir(); output.mkdir()
            (source/'NCE1').mkdir()
            (source/'NCE1/01.lrc').write_text('[00:01]Lesson 2\n')
            manifest = output/'manifest.json'
            manifest.write_text('{"previous": true}')
            with patch.object(pack, 'OUTPUT', output), self.assertRaises(ValueError):
                pack.package(source)
            self.assertEqual(manifest.read_text(), '{"previous": true}')
            self.assertFalse((output/'.pack.lock').exists())


if __name__ == '__main__':
    unittest.main()
