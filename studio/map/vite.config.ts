import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
export default defineConfig(({mode}) => ({
    root: fileURLToPath(new URL('.', import.meta.url)),
    plugins: [react()],
    publicDir: false,
    base: './',
    define: {__STUDIO_CLASSIC_URL__: JSON.stringify(mode === 'online' ? '/' : 'https://finn-english-studio.pages.dev/')},
    server: {host: '127.0.0.1', port: 4191, strictPort: true},
    build: {outDir: 'dist', emptyOutDir: true},
}));
