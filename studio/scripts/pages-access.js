// Public study site. Only the explicitly packaged static assets are served.
const headers = {
  'Cache-Control': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow',
  'Content-Security-Policy': "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src blob: data:; font-src data:; connect-src 'self'; frame-src blob:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(self), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
};
const reply = (body, status, extra = {}) => new Response(body, {status, headers: {...headers, ...extra}});
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return reply('HTTPS required', 426);
    if (!env.ASSETS) return reply('Study materials temporarily unavailable.', 503);
    if (!['GET', 'HEAD'].includes(request.method)) return reply('Method not allowed', 405, {Allow: 'GET, HEAD'});
    if (!['/', '/index.html', '/version.json', '/robots.txt', '/materials/manifest.json', '/language/dictionary.json', '/language/index.json'].includes(url.pathname) && !/^\/materials\/[a-f0-9]{64}\/[0-9]{4}\.bin$/.test(url.pathname) && !/^\/language\/NCE[1-4]\/[1-9]\d{0,2}\.json$/.test(url.pathname)) return reply('Not found', 404);
    try {
      // Old browsers may still send cached Basic credentials. Never forward them.
      const assetRequest = new Request(request);
      assetRequest.headers.delete('Authorization');
      const response = await env.ASSETS.fetch(assetRequest);
      const result = new Response(response.body, response);
      for (const [key, value] of Object.entries(headers)) result.headers.set(key, value);
      if (/^\/materials\/[a-f0-9]{64}\//.test(url.pathname) && response.ok) result.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      result.headers.delete('WWW-Authenticate');result.headers.delete('Vary');
      return result;
    } catch { return reply('Materials temporarily unavailable.', 503); }
  },
};
