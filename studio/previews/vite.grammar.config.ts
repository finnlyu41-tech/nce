import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({
 root:fileURLToPath(new URL('../',import.meta.url)),plugins:[react()],publicDir:false,cacheDir:'work/grammar-vite-cache',
 define:{__STUDIO_ONLINE__:'false'},
 resolve:{alias:{'@':fileURLToPath(new URL('../',import.meta.url))},dedupe:['react','react-dom']},
 server:{host:'127.0.0.1',port:4197,strictPort:true},
 build:{outDir:'work/grammar-curriculum-build',emptyOutDir:true,rollupOptions:{input:'previews/grammar-curriculum.html'}},
});
