import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {realpathSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const previewRoot = path.dirname(fileURLToPath(import.meta.url));
const sampleSequenceFile = realpathSync(path.resolve(previewRoot, '../sample-sequence.ts'));
const previewRegistry = path.resolve(previewRoot, 'preview-registry.ts');

export default defineConfig({
  root: previewRoot,
  plugins: [
    {
      name: 'table-preview-registry',
      enforce: 'pre',
      resolveId(source, importer) {
        if (source !== './curriculum/registered' || !importer) return null;
        try {
          if (realpathSync(importer.split('?')[0]) === sampleSequenceFile) return previewRegistry;
        } catch { /* Virtual or unrelated imports retain their normal resolution. */ }
        return null;
      },
    },
    react(),
  ],
  resolve: {alias: {'@': path.resolve(previewRoot, '../..')}},
  cacheDir: '/tmp/nce-ielts-table-preview-vite-cache',
  server: {host: '127.0.0.1', port: 4326, strictPort: true},
  preview: {host: '127.0.0.1', port: 4326, strictPort: true},
  build: {outDir: '/tmp/nce-ielts-table-preview-build', emptyOutDir: true},
});
