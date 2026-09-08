import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {validateQuiz} from './schema.js';
const sha=x=>createHash('sha256').update(x).digest('hex');
const contentEngine=readFileSync(new URL('../dist/content-engine.js',import.meta.url),'utf8');
// Generates data inside the reviewed, fixed engine. No submitted code is run.
export function packageQuiz(base,input,defaults={}){
 const quiz=validateQuiz(input),hash=sha(JSON.stringify(quiz)),id='quiz-'+hash.slice(0,16),assets={...base.assets};
 const prepared={...quiz,id,questions:quiz.questions.map(q=>{
  if(!q.image)return q;const [header,data]=q.image.split(','),type=header.slice(5).split(';')[0],path=sha(data)+(type==='image/png'?'.png':'.jpg');assets[path]={type,data};return {...q,image:'assets/'+path};
 })};
 const options={...base.manifest.options,quizId:{...base.manifest.options.quizId,values:[id],default:id},questionCount:{...base.manifest.options.questionCount,max:Math.min(100,quiz.questions.length),default:defaults.questionCount||Math.min(10,quiz.questions.length)}};
 if(defaults.difficultyMode==='mix'){delete options.difficultyMin;delete options.difficultyMax;options.questionCount.min=options.questionCount.max=options.questionCount.default=defaults.questionCount;}
 const title=typeof quiz.title==='string'?{en:quiz.title}:quiz.title;
 return {...base,manifest:{...base.manifest,id,title,description:{en:"A community questionnaire for The Million Quiz: "+title.en},author:quiz.author,options},engine:contentEngine+'\n;globalThis.RetroQuizBank='+JSON.stringify({[id]:prepared})+';\n;const __quizCreate=globalThis.RetroMuseumGame.create;globalThis.RetroMuseumGame.create=(players,saved,options)=>__quizCreate(players,saved,{...'+JSON.stringify(defaults)+',quizId:'+JSON.stringify(id)+',...options});',assets};
}
