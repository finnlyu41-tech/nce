"""Package user-supplied books without modifying or extracting beside the originals.

Run from studio: python3 scripts/package-materials.py SOURCE_DIRECTORY
Only dist-online/materials is written. Optional Poppler tools inspect every PDF.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'dist-online' / 'materials'
CHUNK = 8 * 1024 ** 2
MAX_FILE = 200 * 1024 ** 2
MAX_FILES = 2000
COUNTS = {'NCE1': 144, 'NCE2': 96, 'NCE3': 60, 'NCE4': 48}
TYPES = {'.pdf': 'application/pdf', '.mp3': 'audio/mpeg', '.lrc': 'text/plain', '.txt': 'text/plain'}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def safe_zip_name(info):
    name = info.filename
    if not info.flag_bits & 0x800:
        try:
            name = name.encode('cp437').decode('gb18030')
        except (UnicodeError, LookupError):
            pass
    parts = PurePosixPath(name).parts
    if not parts or name.startswith('/') or '\\' in name or ':' in name or '..' in parts or '\x00' in name:
        raise ValueError('Unsafe ZIP entry: ' + repr(name))
    if stat.S_ISLNK(info.external_attr >> 16) or info.flag_bits & 1:
        raise ValueError('Symlinks and encrypted ZIP entries are not supported: ' + name)
    if info.file_size > MAX_FILE or info.file_size > max(1, info.compress_size) * 1000:
        raise ValueError('ZIP entry exceeds expansion limits: ' + name)
    return name


def source_entries(source, inventory):
    # Never follow symlinks, including directory symlinks.
    for folder, dirs, names in os.walk(source, followlinks=False):
        for name in dirs + names:
            if (Path(folder) / name).is_symlink():
                raise ValueError('Source contains a symlink: ' + name)
        dirs.sort()
        for name in sorted(names):
            path = Path(folder) / name
            relative = path.relative_to(source).as_posix()
            before = path.stat()
            if path.suffix.lower() == '.zip':
                with zipfile.ZipFile(path) as archive:
                    infos = archive.infolist()
                    if len(infos) > 10000 or sum(i.file_size for i in infos) > 4 * 1024 ** 3:
                        raise ValueError('ZIP exceeds archive limits: ' + relative)
                    decoded = [(i, safe_zip_name(i)) for i in infos]
                    if len({n for _, n in decoded}) != len(decoded):
                        raise ValueError('Duplicate ZIP entry names: ' + relative)
                    inventory['archives'].append({'name': relative, 'size': before.st_size,
                        'entries': len(infos), 'expandedSize': sum(i.file_size for i in infos)})
                    for info, entry in decoded:
                        if not info.is_dir():
                            # Reading through ZipFile also checks CRC; nothing is extracted.
                            yield relative + '/' + entry, archive.read(info)
            else:
                if path.suffix.lower() not in TYPES:
                    inventory['excluded'].append({'name': relative, 'size': before.st_size, 'reason': 'Unsupported file type'})
                    continue
                if not 0 < before.st_size <= MAX_FILE:
                    raise ValueError('Invalid source size: ' + relative)
                yield relative, path.read_bytes()
            after = path.stat()
            if (before.st_size, before.st_mtime_ns) != (after.st_size, after.st_mtime_ns):
                raise ValueError('Source changed during packaging: ' + relative)


def identify(name):
    matches = set(re.findall(r'NCE([1-4])', name, re.I) +
                  re.findall(r'新概念英语\s*第?([1-4])(?![-–][1-4])', name))
    if len(matches) != 1:
        raise ValueError('Cannot identify exactly one book: ' + name)
    book = 'NCE' + matches.pop()
    accent = 'us' if '美音' in name else 'uk' if '英音' in name else 'unknown'
    stem = PurePosixPath(name).stem
    match = re.match(r'^(?:Lesson\s*)?(\d{1,3})(?:[&＆](\d{1,3}))?(?=[^\d]|$)', stem, re.I)
    lessons = [int(n) for n in match.groups() if n] if match else []
    if any(n < 1 or n > COUNTS[book] for n in lessons):
        raise ValueError('Lesson out of range: ' + name)
    return book, accent, lessons


def decode_text(data, name):
    for encoding in ('utf-8-sig', 'gb18030', 'utf-16'):
        try:
            text = data.decode(encoding)
            if '\x00' not in text:
                return text, encoding
        except UnicodeError:
            pass
    raise ValueError('Unknown text encoding: ' + name)


def inspect_pdf(data):
    if not data.startswith(b'%PDF-'):
        raise ValueError('Invalid PDF signature')
    if not shutil.which('pdfinfo') or not shutil.which('pdftotext'):
        return {'textStatus': 'unchecked'}
    info = subprocess.run(['pdfinfo', '-'], input=data, capture_output=True, check=True).stdout.decode()
    text = subprocess.run(['pdftotext', '-', '-'], input=data, capture_output=True, check=True).stdout.decode('utf-8')
    pages = re.search(r'^Pages:\s+(\d+)', info, re.M)
    return {'pages': int(pages[1]), 'textStatus': 'extractable' if text.strip() else 'scan',
            'extractedCharacters': len(text.strip())}


def write_atomic(path, data):
    temporary = path.with_name(path.name + '.tmp')
    if path.is_symlink() or temporary.is_symlink():
        raise ValueError('Output symlink rejected')
    temporary.write_bytes(data)
    temporary.replace(path)


def package(source):
    source = source.resolve(strict=True)
    if not source.is_dir() or source == OUTPUT or source in OUTPUT.parents:
        raise ValueError('Choose the original materials directory, outside the build output')
    for parent in [OUTPUT, *OUTPUT.parents]:
        if parent.is_symlink():
            raise ValueError('Output symlink rejected')
    OUTPUT.mkdir(parents=True, exist_ok=True)
    lock = OUTPUT / '.pack.lock'
    with lock.open('x'):
        pass
    try:
        inventory = {'archives': [], 'excluded': [], 'sources': [], 'warnings': []}
        files, groups = [], {}
        for name, original in source_entries(source, inventory):
            suffix = PurePosixPath(name).suffix.lower()
            if suffix not in TYPES:
                inventory['excluded'].append({'name': name, 'size': len(original), 'reason': 'Unsupported file type'})
                continue
            if not 0 < len(original) <= MAX_FILE:
                raise ValueError('Invalid source size: ' + name)
            if len(files) >= MAX_FILES:
                raise ValueError('Too many materials; nothing was omitted silently')
            book, accent, named_lessons = identify(name)
            item = {'id': 'm_' + sha(name.encode())[:32], 'name': PurePosixPath(name).name,
                    'book': book, 'lesson': 0, 'type': TYPES[suffix], 'accent': accent}
            if len(item['name']) > 250:
                raise ValueError('Filename exceeds manifest limit: ' + name)
            data = original
            if suffix == '.pdf':
                item.update(inspect_pdf(data))
            else:
                pair_key = str(PurePosixPath(name).with_suffix(''))
                item['pairId'] = 'p_' + sha(pair_key.encode())[:32]
                item['sourceLessons'] = named_lessons
                group = groups.setdefault(pair_key, [])
                if any(f['type'] == item['type'] for f in group):
                    raise ValueError('Ambiguous same-stem pair: ' + name)
                group.append(item)
                item['lesson'] = named_lessons[0] if len(named_lessons) == 1 else 0
                if suffix in ('.lrc', '.txt'):
                    text, encoding = decode_text(data, name)
                    if len(text) > 50000 or len(data) > 200000:
                        raise ValueError('Text exceeds workspace limit: ' + name)
                    headers = sorted(set(int(n) for n in re.findall(r'\bLesson\s+(\d+)\b', text, re.I)))
                    if any(n < 1 or n > COUNTS[book] for n in headers):
                        raise ValueError('LRC heading is out of range: ' + name)
                    if any(n not in named_lessons for n in headers) and named_lessons:
                        raise ValueError('LRC heading disagrees with filename: ' + name)
                    if len(headers) == 1:
                        item['lesson'] = headers[0]
                    item['title'] = (re.search(r'\[ti:(.*?)\]', text) or [None, PurePosixPath(name).stem])[1][:120]
                    item['textFormat'] = 'lrc' if suffix == '.lrc' else 'text'
                    times = [int(m)*60+float(s) for m, s in re.findall(r'\[(\d+):(\d+(?:\.\d+)?)\]', text)]
                    if suffix == '.lrc' and not times:
                        raise ValueError('LRC has no timed lines: ' + name)
                    item['timedLines'] = len(times)
                    item['lastTimestamp'] = max(times, default=0)
                    item['encoding'] = 'utf-8'
                    data = text.encode('utf-8')
            item.update(size=len(data), sha256=sha(data), parts=[])
            folder = OUTPUT / item['sha256']
            if folder.is_symlink():
                raise ValueError('Output symlink rejected')
            folder.mkdir(exist_ok=True)
            for index, offset in enumerate(range(0, len(data), CHUNK)):
                part = data[offset:offset + CHUNK]
                filename = f'{index:04d}.bin'
                write_atomic(folder / filename, part)
                item['parts'].append({'path': f'/materials/{item["sha256"]}/{filename}', 'size': len(part)})
            files.append(item)
            inventory['sources'].append({'name': name, 'size': len(original), 'sha256': sha(original),
                                         'packagedSha256': item['sha256']})
        for name, group in groups.items():
            text = next((f for f in group if f['type'] == 'text/plain'), None)
            audio = next((f for f in group if f['type'].startswith('audio/')), None)
            if not text or not audio:
                inventory['warnings'].append('Unpaired material: ' + name)
            if text and audio:
                audio['lesson'] = text['lesson']
                audio['title'] = text['title']
            for f in group:
                if len(f['sourceLessons']) > 1:
                    f['lessonNote'] = ('文件名含合并课次；字幕仅标注第 %d 课，未提供偶数课独立字幕。' % f['lesson']
                                       if f['lesson'] else '合并课次未能唯一核定，请对照 PDF。')
        summary = {}
        for book in COUNTS:
            own = [f for f in files if f['book'] == book]
            summary[book] = {'pdf': sum(f['type'] == 'application/pdf' for f in own),
                             'audio': sum(f['type'].startswith('audio/') for f in own),
                             'text': sum(f['type'] == 'text/plain' for f in own),
                             'bytes': sum(f['size'] for f in own)}
            if not all(summary[book][t] for t in ('pdf', 'audio', 'text')):
                raise ValueError('Book is missing PDF, audio or text: ' + book)
        for accent, label in [('us', '美音'), ('uk', '英音')]:
            if not any(f['accent'] == accent and f['type'].startswith('audio/') for f in files):
                inventory['warnings'].append(label + '：所提供资料内未发现可播放音频。')
            else:
                for book, count in COUNTS.items():
                    found = {f['lesson'] for f in files if f['book'] == book and f['accent'] == accent and f['type'] == 'text/plain'}
                    expected = set(range(1, count + 1, 2 if book == 'NCE1' else 1))
                    missing = sorted(expected - found)
                    if missing:
                        inventory['warnings'].append(f'{book} {label}：未发现以下课次的独立字幕：' + ', '.join(map(str, missing)))
        files.sort(key=lambda f: (f['book'], f['lesson'], f['name']))
        manifest = {'version': 1, 'files': files, 'notices': inventory['warnings']}
        inventory['summary'] = summary
        inventory['packagedFiles'] = len(files)
        # Manifest is the commit point. An interrupted build cannot publish a partial index.
        write_atomic(OUTPUT / '.inventory.json', (json.dumps(inventory, ensure_ascii=False, indent=2)+'\n').encode())
        write_atomic(OUTPUT / 'manifest.json', (json.dumps(manifest, ensure_ascii=False, indent=2)+'\n').encode())
        referenced = {f['sha256'] for f in files}
        for folder in OUTPUT.iterdir():
            if re.fullmatch('[a-f0-9]{64}', folder.name) and folder.name not in referenced:
                if folder.is_symlink():
                    raise ValueError('Output symlink rejected')
                shutil.rmtree(folder)
        print(json.dumps({'files': len(files), 'summary': summary, 'warnings': inventory['warnings'],
                          'excluded': inventory['excluded']}, ensure_ascii=False, indent=2))
    finally:
        lock.unlink()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    args = parser.parse_args()
    package(args.source)
