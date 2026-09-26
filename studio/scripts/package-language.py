"""Align reference translations to the provided LRC; extract an offline dictionary.

Inputs are local, read-only snapshots. Never upload the source corpus or private
learning records. Output goes only to the ignored Pages upload directory.
"""
from pathlib import Path
import argparse, csv, hashlib, json, re

ROOT = Path(__file__).resolve().parents[1]
normalize = lambda s: re.sub('[^a-z0-9]', '', s.lower())


def rows(text):
    result = []
    for raw in text.splitlines():
        stamps = re.findall(r'\[(\d+):(\d+(?:\.\d+)?)\]', raw)
        if not stamps:
            continue
        en, *zh = re.sub(r'\[\d+:\d+(?:\.\d+)?\]', '', raw).strip().split('|')
        for minutes, seconds in stamps:
            result.append({'en': en.strip(), 'zh': '|'.join(zh).strip(), 'time': int(minutes)*60+float(seconds)})
    return sorted(result, key=lambda row: row['time'])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('translations', type=Path)
    parser.add_argument('dictionary', type=Path)
    parser.add_argument('corrections', type=Path)
    args = parser.parse_args()
    out = ROOT/'dist-online/language'
    out.mkdir(parents=True, exist_ok=True)
    corrections = json.loads(args.corrections.read_text())
    manifest = json.loads((ROOT/'dist-online/materials/manifest.json').read_text())
    index = {'version': 1, 'translationSource': 'https://nce.mleo.site', 'translationNote': '参考中译来自原项目字幕，机器翻译，已核对分句对应；不作为官方译文。', 'dictionarySource': 'https://github.com/skywind3000/ECDICT', 'dictionaryLicense': (ROOT/'vendor/ECDICT-LICENSE.txt').read_text(), 'files': {}}
    words, tokens = set(), []

    def collect(text):
        found = re.findall(r"[A-Za-z]+(?:['’][A-Za-z]+)*", text)
        words.update(w.lower().replace('’', "'") for w in found)
        tokens.extend(w.lower().replace('’', "'") for w in found)

    def write(path, data):
        target = out/path
        target.parent.mkdir(parents=True, exist_ok=True)
        raw = json.dumps(data, ensure_ascii=False, separators=(',', ':')).encode()
        target.write_bytes(raw)
        index['files'][path] = {'sha256': hashlib.sha256(raw).hexdigest(), 'size': len(raw)}

    total = 0
    for item in manifest['files']:
        if item['type'] != 'text/plain':
            continue
        original = b''.join((ROOT/('dist-online'+p['path'])).read_bytes() for p in item['parts'])
        assert hashlib.sha256(original).hexdigest() == item['sha256']
        reference = (args.translations/f'{item["book"]}-{item["lesson"]}.lrc').read_text('utf-8-sig')
        lookup = {normalize(row['en']): row['zh'] for row in rows(reference) if row['zh']}
        aligned = rows(original.decode('utf-8-sig'))
        for i, row in enumerate(aligned):
            override = corrections.get(f'{item["book"]}-{item["lesson"]}-{i}')
            if override:
                assert override['en'] == row['en'], 'Correction source changed'
            row['zh'] = override['zh'] if override else lookup.get(normalize(row['en']), '')
            assert row['zh'] and re.search('[\u3400-\u9fff]', row['zh']), f'Missing translation: {item["id"]} line {i}'
            collect(row['en'])
        total += len(aligned)
        write(f'{item["book"]}/{item["lesson"]}.json', {'version': 1, 'book': item['book'], 'lesson': item['lesson'], 'sourceSha256': item['sha256'], 'rows': aligned})
    for name in ['lessons', 'book-companion', 'ielts']:
        collect((ROOT/f'app/data/{name}.json').read_text())
    dictionary = {}
    with args.dictionary.open(newline='') as source:
        for row in csv.DictReader(source):
            word = row['word'].lower().replace('’', "'")
            if word not in words:
                continue
            meaning = '\n'.join(row['translation'].replace('\\n', '\n').splitlines()[:4])[:600]
            if not meaning:
                continue
            ipa = row['phonetic'].replace('ә', 'ə').replace("'", 'ˈ').replace(',', 'ˌ').replace(':', 'ː').replace('g', 'ɡ')
            # Standardize legacy short-vowel notation, preserving long vowels.
            ipa = re.sub(r'i(?!ː)', 'ɪ', ipa); ipa = re.sub(r'u(?!ː)', 'ʊ', ipa)
            dictionary[word] = {'word': row['word'], 'ipa': ipa[:100], 'meaning': meaning}
    # Course-authored entries supply contextual senses and validated IPA where present.
    for lesson in json.loads((ROOT/'app/data/lessons.json').read_text()):
        for word in lesson['vocab']:
            key = word['word'].lower()
            if key not in dictionary:
                dictionary[key] = {k: word.get(k, '') for k in ['word', 'ipa', 'meaning']}
    write('dictionary.json', {'version': 1, 'source': index['dictionarySource'], 'accent': '词典音标以英音为主，教材录音为美音。', 'license': index['dictionaryLicense'], 'words': dictionary})
    index.update(lessons=sum(1 for p in index['files'] if p!='dictionary.json'), lines=total, words=len(dictionary), sourceDictionarySha256=hashlib.sha256(args.dictionary.read_bytes()).hexdigest())
    (out/'index.json').write_text(json.dumps(index, ensure_ascii=False, indent=2)+'\n')
    missing = sorted(words-dictionary.keys())
    print(json.dumps({'lessons': index['lessons'], 'translatedLines': total, 'dictionaryWords': len(dictionary), 'tokenCoverage': round(sum(t in dictionary for t in tokens)/len(tokens)*100, 2), 'unlistedWords': missing}, ensure_ascii=False))


if __name__ == '__main__':
    main()
