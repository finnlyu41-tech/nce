import {defineConfig} from 'vite';
export default defineConfig({base:'./',css:{postcss:{plugins:[]}},server:{fs:{allow:['..']}},build:{outDir:'dist',emptyOutDir:true}});
