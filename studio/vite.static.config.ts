import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath,URL} from 'node:url';
export default defineConfig(({mode})=>({plugins:[react()],define:{__STUDIO_ONLINE__:JSON.stringify(mode==='online')},resolve:{alias:{'@':fileURLToPath(new URL('.',import.meta.url))},dedupe:['react','react-dom']},build:{outDir:'static-export',emptyOutDir:true,rollupOptions:{input:'standalone.html'},cssCodeSplit:false}}));
