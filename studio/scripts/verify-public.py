"""Verify anonymous access and published hashes on this project's two URLs."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import argparse, hashlib, json, re, subprocess

ROOT = Path(__file__).resolve().parents[1]
TRANSPORT_RETRIES = []


def request(url, method='GET', stale_auth=False):
    command = ['curl', '--http1.1', '--max-time', '40', '-sS', '-X', method, '-w', '\n%{http_code}']
    if stale_auth:
        command += ['-H', 'Authorization: Basic bGVhcm5lcjp3cm9uZw==']  # Test-only wrong credentials.
    result = subprocess.run(command+[url], capture_output=True)
    # Retry one empty connection response, never an HTTP or hash failure.
    if result.returncode == 52:
        TRANSPORT_RETRIES.append({'url': url, 'curlCode': 52})
        result = subprocess.run(command+[url], capture_output=True)
    result.check_returncode()
    body, status = result.stdout.rsplit(b'\n', 1)
    return int(status), body


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('deployment')
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    assert re.fullmatch(r'https://[a-f0-9]{8}\.finn-english-studio\.pages\.dev', args.deployment)
    production = 'https://finn-english-studio.pages.dev'
    package = ROOT/'dist-online'
    version = json.loads((package/'version.json').read_text())
    manifest = json.loads((package/'materials/manifest.json').read_text())
    index = json.loads((package/'language/index.json').read_text())
    grammar = json.loads((package/'grammar/index.json').read_text())
    checks = []

    def verify(base, path, expected, status=200, method='GET', stale_auth=False):
        observed, body = request(base+path, method, stale_auth)
        assert observed == status, f'{base}{path}: {observed}, expected {status}'
        digest = hashlib.sha256(body).hexdigest()
        if expected is not None:
            assert digest == expected, 'Hash mismatch: '+base+path
        return {'url': base+path, 'method': method, 'staleAuth': stale_auth, 'status': observed, 'sha256': digest}

    def file_hash(path):
        return hashlib.sha256((package/path).read_bytes()).hexdigest()

    for base in [production, args.deployment]:
        for path in ['index.html', 'version.json', 'manifest.webmanifest', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'materials/manifest.json', 'language/index.json', 'language/dictionary.json', 'lesson-pages/index.json', 'speaking/topics.json', 'grammar/index.json']:
            checks.append(verify(base, '/' if path=='index.html' else '/'+path, file_hash(path)))
        checks.append(verify(base, '/', version['html_sha256'], stale_auth=True))
        for path in ['/README.md', '/.env', '/work/local-codex/SESSION.json', '/grammar/ocr.json', '/grammar/source.pdf']:
            checks.append(verify(base, path, None, status=404))
        checks.append(verify(base, '/', None, status=405, method='POST'))
        for book in ['NCE1', 'NCE2', 'NCE3', 'NCE4']:
            path=f'language/{book}/1.json'
            checks.append(verify(base, '/'+path, file_hash(path)))
            source=next(p for key,p in grammar['pages'].items() if key.startswith(book+'-'))
            checks.append(verify(base, source['src'], source['sha256']))
        sample=next(f for f in manifest['files'] if f['book']=='NCE1' and f['lesson']==1 and f['type']=='audio/mpeg')
        audio=b''
        for part in sample['parts']:
            status, body=request(base+part['path']);assert status==200;audio+=body
        assert hashlib.sha256(audio).hexdigest()==sample['sha256']
        checks.append({'url':base, 'material':sample['id'], 'status':200, 'sha256':sample['sha256']})
    # Small text assets are checked in full; unchanged 707 MB of textbook media
    # is checked locally, with online audio/PDF sampling rather than re-downloaded.
    def language_file(item):
        path, info=item
        return verify(production, '/language/'+path, info['sha256'])
    with ThreadPoolExecutor(max_workers=6) as pool:
        checks.extend(pool.map(language_file, index['files'].items()))
    pages=json.loads((package/'lesson-pages/index.json').read_text())
    with ThreadPoolExecutor(max_workers=6) as pool:
        checks.extend(pool.map(lambda item:verify(production,'/lesson-pages/'+item[0],item[1]['sha256']),pages['files'].items()))
    # Grammar paths are relative to the package root and may reuse lesson pages.
    # Those reused images have already been verified above.
    verified_urls={c['url'] for c in checks if c['status']==200}
    grammar_images=[item for item in grammar['files'].items() if production+'/'+item[0] not in verified_urls]
    with ThreadPoolExecutor(max_workers=6) as pool:
        checks.extend(pool.map(lambda item:verify(production,'/'+item[0],item[1]['sha256']),grammar_images))
    verified_images={c['url']:c['sha256'] for c in checks if c['status']==200}
    assert all(verified_images.get(production+p['src'])==p['sha256'] for p in grammar['pages'].values()), 'Grammar source image mismatch'
    grammar_image_count=sum(path.startswith('grammar/') for path in grammar['files'])
    result={'grammarSourcePagesVerified':len(grammar['pages']),'grammarImagesVerified':grammar_image_count,'lessonImagesVerified':len(pages['files']),'checkedAt':datetime.now(timezone.utc).isoformat(), 'access':'public', 'deployment':args.deployment, 'version':version, 'checks':checks, 'languageFilesVerified':len(index['files']), 'transportRetries':TRANSPORT_RETRIES}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps({'checks':len(checks), 'languageFilesVerified':len(index['files']), 'lessonImagesVerified':len(pages['files']), 'grammarSourcePagesVerified':len(grammar['pages']), 'grammarImagesVerified':grammar_image_count, 'deployment':args.deployment, 'access':'public'}))


if __name__ == '__main__':
    main()
