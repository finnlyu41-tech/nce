"""Inline the production Vite build into one portable HTML file."""
from pathlib import Path
import re, urllib.parse, sys, json, hashlib, shutil
online = '--online' in sys.argv
base = Path('static-export')
s = (base / 'standalone.html').read_text()
m = re.search(r'<script[^>]*src="([^"]+)"[^>]*></script>', s)
js = (base / m.group(1).lstrip('/')).read_text().replace('</script', '<\\/script')
s = s[:m.start()] + s[m.end():]
m = re.search(r'<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>', s)
css = (base / m.group(1).lstrip('/')).read_text().replace('</style', '<\\/style')
s = s[:m.start()] + '<style>' + css + '</style>' + s[m.end():]
s = s.replace('href="/favicon.svg"', 'href="data:image/svg+xml,' + urllib.parse.quote(Path('public/favicon.svg').read_text()) + '"')
csp = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; media-src blob: data:; font-src data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"
if online:
    csp = "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src blob: data:; font-src data:; connect-src 'self'; frame-src blob:; object-src 'none'; base-uri 'none'; form-action 'none'"
s = s.replace('<head>', '<head><meta http-equiv="Content-Security-Policy" content="'+csp+'">')
s = s.replace('</body>', '<script type="module">' + js + '</script></body>')
out = Path('dist-online' if online else 'dist')
out.mkdir(exist_ok=True)
(out/'index.html').write_text(s)
if online:
    (out/'drive-config.json').unlink(missing_ok=True)
    (out/'materials').mkdir(exist_ok=True)
    if not (out/'materials/manifest.json').exists():
        shutil.copyfile('public/materials/manifest.json',out/'materials/manifest.json')
    # Local inventory is evidence, never an upload asset.
    if (out/'materials/.inventory.json').exists():
        evidence = Path('work/local-codex')
        evidence.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(out/'materials/.inventory.json', evidence/'materials-inventory.json')
        (out/'materials/.inventory.json').unlink()
    shutil.copyfile('scripts/pages-access.js', out/'_worker.js')
    (out/'_routes.json').write_text(json.dumps({'version':1,'include':['/*'],'exclude':[]})+'\n')
    (out/'robots.txt').write_text('User-agent: *\nDisallow: /\n')
    (out/'_headers').write_text('/*\n  Content-Security-Policy: '+csp+"; frame-ancestors 'none'\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  X-Frame-Options: DENY\n  Cross-Origin-Opener-Policy: same-origin-allow-popups\n  Permissions-Policy: camera=(), microphone=(self), geolocation=()\n  X-Robots-Tag: noindex, nofollow\n  Cache-Control: no-cache\n")
    (out/'version.json').write_text(json.dumps({'version':'2026-09-27-recording-feedback-v1','html_sha256':hashlib.sha256(s.encode()).hexdigest(),'manifest_sha256':hashlib.sha256((out/'materials/manifest.json').read_bytes()).hexdigest(),'materials_count':len(json.loads((out/'materials/manifest.json').read_text())['files']),'access':'public','pages_sha256':hashlib.sha256((out/'lesson-pages/index.json').read_bytes()).hexdigest(),'speaking_sha256':hashlib.sha256((out/'speaking/topics.json').read_bytes()).hexdigest(),'language_sha256':hashlib.sha256((out/'language/index.json').read_bytes()).hexdigest()},indent=2)+'\n')
print('Created '+str(out/'index.html'))
