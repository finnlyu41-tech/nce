import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const previewRoot=path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  root:previewRoot,
  plugins:[react()],
  resolve:{alias:{'@':path.resolve(previewRoot,'../..')}},
  cacheDir:'/tmp/nce-ielts-blueprint-preview-cache',
  server:{host:'127.0.0.1',port:4315,strictPort:true},
  build:{outDir:'/tmp/nce-ielts-blueprint-preview-build',emptyOutDir:true},
});
