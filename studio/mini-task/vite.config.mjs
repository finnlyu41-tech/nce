import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({root:fileURLToPath(new URL('../',import.meta.url)),plugins:[react()],server:{host:'127.0.0.1',port:5187},build:{outDir:'work/mini-task/preview',emptyOutDir:true,rollupOptions:{input:fileURLToPath(new URL('./preview.html',import.meta.url))}}});
