import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {BUILTIN_QUIZZES} from '../server/builtins.js';
import {Quizz} from '../server/quizz.js';
import {packageQuiz} from '../server/package-quiz.js';
import {GameRuntime} from '@manaty/retro-museum-sdk/runtime';

test('every starter bank supports each complete level and an exact 100-question family mix',()=>{
 for(const [quizId,bank] of Object.entries(BUILTIN_QUIZZES)){
  for(let d=1;d<=4;d++){
   const game=new Quizz([{id:'a',number:1}],null,{quizId,questionCount:25,difficultyMin:d,difficultyMax:d});
   assert.equal(new Set(game.order).size,25);assert.ok(game.order.every(i=>bank.questions[i].difficulty===d));
  }
  const game=new Quizz([{id:'a',number:1}],null,{quizId,questionCount:100,seconds:15,difficultyMode:'mix',difficultyWeights:[25,25,25,25]});
  assert.deepEqual([1,2,3,4].map(d=>game.order.filter(i=>bank.questions[i].difficulty===d).length),[25,25,25,25]);
  for(let i=0;i<100;i++){game.action('a','quizAnswer',{question:i,answer:game.correct});game.advance(15);game.advance(6);}
  assert.equal(game.ended,true);assert.equal(game.players[0].gain,1000000);
 }
});

test('downloadable authoring files equal native banks and selected packages run 100 questions',async()=>{
 const base=JSON.parse(await readFile(new URL('../dist/game.rmg.json',import.meta.url)));
 assert.ok(Buffer.byteLength(base.engine)<512*1024);
 for(const [id,quiz] of Object.entries(BUILTIN_QUIZZES)){
  assert.deepEqual(JSON.parse(await readFile(new URL('../quizzes/'+id+'.quiz.json',import.meta.url))),quiz);
  const pack=packageQuiz(base,quiz,{questionCount:100});
  const runtime=new GameRuntime(pack,[{id:'a',number:1}]);
  try{assert.equal(runtime.snapshot().total,100);}finally{runtime.dispose();}
 }
});
