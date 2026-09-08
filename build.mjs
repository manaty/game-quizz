import {build} from 'esbuild';import {mkdir,readFile,writeFile} from 'node:fs/promises';
const randomPlugin={name:'isolated-random',setup(b){b.onResolve({filter:/^node:crypto$/},()=>({path:'random',namespace:'isolated'}));b.onLoad({filter:/.*/,namespace:'isolated'},()=>({contents:'export function randomInt(max){const a=new Uint32Array(1),limit=4294967296-(4294967296%max);do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%max;}',loader:'js'}));}};
const manifest=JSON.parse(await readFile('retro-museum.json'));const bundle=async p=>(await build({entryPoints:[p],bundle:true,write:false,format:'iife',target:'chrome58',minify:true,plugins:[randomPlugin]})).outputFiles[0].text;
const engine=await bundle('src/adapter.js'),client=await bundle('src/view.js'),css=await readFile('public/style.css','utf8');
const view='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head><body><div id="app"></div><script>'+client.replaceAll('</script','<\\/script')+'</script></body></html>';
await mkdir('dist',{recursive:true});await writeFile('dist/game.rmg.json',JSON.stringify({manifest,engine,view,assets:{},licenseText:await readFile('LICENSE','utf8')}));console.log('Built quizz');

await build({entryPoints:['src/editor.js'],bundle:true,format:'iife',target:'chrome58',minify:true,outfile:'public/editor.js'});
