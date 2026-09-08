import {build} from 'esbuild';import {mkdir,readFile,writeFile} from 'node:fs/promises';
const manifest=JSON.parse(await readFile('retro-museum.json'));const bundle=async p=>(await build({entryPoints:[p],bundle:true,write:false,format:'iife',target:'chrome58',minify:true})).outputFiles[0].text;
const engine=await bundle('src/adapter.js'),client=await bundle('src/view.js'),css=await readFile('public/style.css','utf8');
const view='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head><body><div id="app"></div><script>'+client.replaceAll('</script','<\\/script')+'</script></body></html>';
await mkdir('dist',{recursive:true});await writeFile('dist/game.rmg.json',JSON.stringify({manifest,engine,view,assets:{},licenseText:await readFile('LICENSE','utf8')}));console.log('Built quizz');

await build({entryPoints:['src/editor.js'],bundle:true,format:'iife',target:'chrome58',minify:true,outfile:'public/editor.js'});
