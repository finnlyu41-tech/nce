import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import worker from './pages-access.js';

const root = new URL('../dist-online/', import.meta.url);
const version = JSON.parse(await readFile(new URL('version.json', root), 'utf8'));
let assetCalls = 0;
const env = {ASSETS: {async fetch(request) {
  assetCalls++;
  assert.equal(request.headers.get('Authorization'), null, 'Stale credentials are removed');
  let path = new URL(request.url).pathname.slice(1);
  if (!path || path.endsWith('/')) path += 'index.html';
  try {
    const bytes = await readFile(new URL(path, root));
    return new Response(request.method === 'HEAD' ? null : bytes, {headers: {'Content-Type': path.endsWith('.js') ? 'application/javascript' : path.endsWith('.css') ? 'text/css' : 'text/html'}});
  } catch { return new Response('Not found', {status: 404}); }
}}};
const get = (path, options) => worker.fetch(new Request('https://test.example'+path, options), env);

const canonical = await get('/map?from=classic');
assert.equal(canonical.status, 308);
assert.equal(canonical.headers.get('Location'), '/map/?from=classic');
assert.equal(assetCalls, 0, 'Canonical URL is resolved before reading assets');
for (const path of ['/', '/map/', '/map/index.html', ...Object.keys(version.map_assets).map(p => '/'+p)]) {
  const response = await get(path, {headers: {Authorization: 'Basic obsolete-test-value'}});
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get('Content-Security-Policy'), /script-src 'self'/);
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  assert.equal(response.headers.get('WWW-Authenticate'), null);
  if (path.startsWith('/map/assets/')) assert.match(response.headers.get('Cache-Control'), /immutable/);
  else assert.equal(response.headers.get('Cache-Control'), 'no-cache');
}
assert.equal(await (await get('/map/', {method: 'HEAD'})).text(), '');
assert.equal((await get('/map/', {method: 'POST'})).status, 405);
assert.equal((await get('/map', {method: 'POST'})).status, 405);
for (const path of ['/map/main.tsx', '/map/model.ts', '/map/test-model.mjs', '/map/.env', '/map/assets/index-12345678.js.map', '/map/assets/unknown.js', '/map/unknown']) {
  const before = assetCalls;
  assert.equal((await get(path)).status, 404, path);
  assert.equal(assetCalls, before, 'Unpackaged paths never reach ASSETS');
}
assert.equal((await worker.fetch(new Request('http://test.example/map/'), env)).status, 426);
assert.equal((await worker.fetch(new Request('https://test.example/map/'), {})).status, 503);
console.log('Map packaging routes, redirects, GET/HEAD, cache, CSP, credentials and source isolation passed.');
