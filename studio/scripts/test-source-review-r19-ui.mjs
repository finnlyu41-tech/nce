import assert from 'node:assert/strict';
import {mkdir,readFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url),pnpm=new URL('node_modules/.pnpm/',root);
const version=(await readdir(pnpm)).find(n=>/^esbuild@\d+\.\d+\.\d+$/.test(n));
const {build}=await import(new URL(version+'/node_modules/esbuild/lib/main.js',pnpm));
const work=new URL('work/r19/ui/',root);await mkdir(work,{recursive:true});
const mocks={
 react:"export const useEffect=()=>{};export function useState(v){const h=globalThis.__r19ui,i=h.cursor++;if(!(i in h.states))h.states[i]=v;return [h.states[i],value=>h.states[i]=typeof value==='function'?value(h.states[i]):value]}",
 'react/jsx-runtime':"export const Fragment='Fragment';export const jsx=(type,props)=>({type,props:props||{}});export const jsxs=jsx;",
 'lucide-react':"export const Volume2='Volume2',ChevronLeft='ChevronLeft',ChevronRight='ChevronRight';",
 './word-lookup':"export const WordText='WordText',WordLookupButton='WordLookupButton';",
 './navigation':"export const navigate=()=>{};",'./speech':"export const speak=()=>{};",'./playback-speed':"export const PlaybackSpeed='PlaybackSpeed';",
 './network':"export async function readJsonResource(path){globalThis.__r19reads.push(path);if(path!=='/lesson-pages/index.json')throw Error('Unexpected path');return structuredClone(globalThis.__r19index)};",
};
async function bundle(name,online){
 const out=new URL(name+'.mjs',work);
 await build({stdin:{contents:"export {LessonPages,loadPages} from './app/lesson-context';export {withReviewedSourceAssociations} from './app/source-review-batch1';export * from './app/source-review-r19';export * from './app/source-review-r19-tail';",loader:'ts',resolveDir:fileURLToPath(root)},bundle:true,format:'esm',platform:'node',target:'node22',jsx:'automatic',outfile:fileURLToPath(out),logLevel:'silent',plugins:[{name:'component-state-harness',setup(b){b.onResolve({filter:/.*/},args=>args.path==='./runtime-mode'?{path:args.path,namespace:'r19-runtime'}:Object.hasOwn(mocks,args.path)?{path:args.path,namespace:'r19-mock'}:undefined);b.onLoad({filter:/.*/,namespace:'r19-runtime'},()=>({contents:'export const ONLINE='+online+';',loader:'js'}));b.onLoad({filter:/.*/,namespace:'r19-mock'},args=>({contents:mocks[args.path],loader:'js'}));}}]});return import(out);
}
const m=await bundle('online',true),offline=await bundle('offline',false);
const raw=JSON.parse(await readFile(new URL('dist-online/lesson-pages/index.json',root))),index=m.withReviewedSourceAssociations(raw);
const elements=node=>!node||typeof node!=='object'?[]:Array.isArray(node)?node.flatMap(elements):[node,...elements(node.props?.children)];
let cases=0;
for(const r of [...m.reviewedR19SourceNotes,...m.reviewedR19SupplementalPages,...m.reviewedR19TailNotes,...m.reviewedR19TailPages]){
 const l=index.lessons[r.book+'-'+r.lesson],position=l.pages.findIndex(p=>p.page===r.pdfPage);
 globalThis.__r19ui={states:[index,position,false],cursor:0};const tree=m.LessonPages({book:r.book,lesson:r.lesson}),nodes=elements(tree);
 const note=nodes.find(n=>n.props?.role==='note');assert(note);assert(note.props.children.includes(r.text));assert.equal(nodes.find(n=>n.type==='img').props.src,l.pages[position].src);
 assert.equal(nodes.find(n=>n.type==='a').props.href,l.pages[position].src);
 if(position){nodes.find(n=>n.props?.['aria-label']==='上一张原书图片').props.onClick();assert.equal(globalThis.__r19ui.states[1],position-1)}
 cases++;
}
const r=m.reviewedR19SupplementalPages[0],l=index.lessons[r.book+'-'+r.lesson];globalThis.__r19ui={states:[index,l.pages.length-1,true],cursor:0};assert(elements(m.LessonPages({book:r.book,lesson:r.lesson})).some(n=>n.props?.role==='status'&&n.props.children.includes('图片加载失败')));
globalThis.__r19ui={states:[index,0,false],cursor:0};assert.equal(offline.LessonPages({book:r.book,lesson:r.lesson}),null);
globalThis.__r19reads=[];globalThis.__r19index=structuredClone(raw);globalThis.__r19index.sources.NCE2='0'.repeat(64);await assert.rejects(m.loadPages());
globalThis.__r19index=raw;const loaded=await m.loadPages();assert.deepEqual(loaded,index);assert.equal(await m.loadPages(),loaded);assert.equal(globalThis.__r19reads.length,2);
globalThis.__r19index=structuredClone(raw);globalThis.__r19index.sources.NCE4='0'.repeat(64);await assert.rejects(m.loadPages(true));globalThis.__r19index=raw;assert.deepEqual(await m.loadPages(),index);assert.equal(globalThis.__r19reads.length,4);
delete globalThis.__r19ui;delete globalThis.__r19reads;delete globalThis.__r19index;
console.log(JSON.stringify({componentCases:cases,groups:['actual LessonPages renders exact note, original image link and previous navigation for 56 accepted notes, six scoped uncertainty notes, four original editorial pages and one disclosed content association','image failure message and existing offline behavior retained','actual loadPages rejects wrong edition, retries, caches and refreshes'],realBrowserEvidence:false}));
