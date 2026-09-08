import {test} from 'node:test';import assert from 'node:assert/strict';
import {Quizz} from '../server/quizz.js';import {validateQuiz,gameOptions,MAX_IMAGE_BYTES} from '../server/schema.js';import {BUILTIN_QUIZZES} from '../server/builtins.js';
const players=Array.from({length:128},(_,i)=>({id:'p'+i,number:i+1}));
test('ranking question prize agrees with the award; elimination retains its progressive ladder',()=>{
 const game=new Quizz(players.slice(0,1),null,{mode:'ranking',questionCount:10,seconds:15});
 for(let index=0;index<10;index++){
  assert.equal(game.snapshot('p0').gain,100000);
  const before=game.players[0].gain;game.action('p0','quizAnswer',{question:index,answer:game.correct});game.advance(15);
  assert.equal(game.players[0].gain-before,100000);game.advance(6);
 }
 assert.equal(game.players[0].gain,1000000);
 const elimination=new Quizz(players.slice(0,1),null,{mode:'elimination',questionCount:10,seconds:15});
 const first=elimination.gain;elimination.action('p0','quizAnswer',{question:0,answer:elimination.correct});elimination.advance(15);
 assert.equal(elimination.players[0].gain,first);elimination.advance(6);assert.ok(elimination.gain>first);
});
test('four trilingual starter packs contain 100 distinct questions, 25 per level, and lightweight flags',()=>{
 assert.equal(Object.keys(BUILTIN_QUIZZES).length,4);
 for(const [id,raw] of Object.entries(BUILTIN_QUIZZES)){
  const q=validateQuiz(raw);assert.equal(q.questions.length,100);
  assert.deepEqual([1,2,3,4].map(d=>q.questions.filter(x=>x.difficulty===d).length),[25,25,25,25]);
  for(const lang of ['en','fr','tl']){
   assert.ok(q.questions.every(x=>x.prompt[lang]&&x.answers.every(a=>a[lang])));
   assert.equal(new Set(q.questions.map(x=>id==='flags'?x.image:x.prompt[lang])).size,100);
  }
 }
 for(const q of BUILTIN_QUIZZES.flags.questions)assert.ok(Buffer.from(q.image.split(',')[1],'base64').length<MAX_IMAGE_BYTES);
});
test('rejects excessive question counts, images, executable formats and ambiguous answers',()=>{const q=structuredClone(BUILTIN_QUIZZES.fruits);q.questions=Array.from({length:1001},(_,i)=>({...q.questions[0],id:'q'+i}));assert.throws(()=>validateQuiz(q));q.questions=q.questions.slice(0,1);q.questions[0].answers[1]=q.questions[0].answers[0];assert.throws(()=>validateQuiz(q));for(const image of ['https://example.com/image.png','data:image/svg+xml;base64,PHN2Zz4=','data:image/png;base64,'+Buffer.alloc(100001).toString('base64')]){const bad=structuredClone(BUILTIN_QUIZZES.flags);bad.questions[0].image=image;assert.throws(()=>validateQuiz(bad));}assert.throws(()=>gameOptions({questionCount:11},10));});
test('128 players lock private answers; pause-independent timers and stale answers',()=>{const game=new Quizz(players,null,{questionCount:2,seconds:15});const correct=game.correct;game.action('p0','quizAnswer',{question:0,answer:correct});assert.equal(game.snapshot().question.correct,undefined);assert.equal(game.snapshot('p1').you.answer,null);assert.equal(game.snapshot('p0').you.answer,correct);assert.throws(()=>game.action('p0','quizAnswer',{question:0,answer:correct}));game.release('p1');game.advance(15);assert.equal(game.stage,'reveal');assert.equal(game.snapshot().question.correct,correct);assert.equal(game.players[0].score,1);game.advance(6);assert.equal(game.index,1);assert.throws(()=>game.action('p0','quizAnswer',{question:0,answer:0}));});
test('save and restore preserves order, lifeline, pending answer and timer',()=>{const game=new Quizz(players.slice(0,2),null,{questionCount:3});game.action('p0','quizFifty',{question:0});assert.ok(!game.players[0].hidden.includes(game.correct));assert.equal(game.players[0].hidden.length,2);assert.throws(()=>game.action('p0','quizFifty',{question:0}));game.advance(4);const restore=new Quizz(players,game.save());assert.deepEqual(restore.snapshot('p0'),game.snapshot('p0'));assert.equal(restore.save().questions,undefined);});
test('elimination preserves checkpoint and permits practice after an error',()=>{const game=new Quizz(players.slice(0,1),null,{mode:'elimination',questionCount:7,seconds:15});for(let i=0;i<5;i++){game.action('p0','quizAnswer',{question:i,answer:game.correct});game.advance(15);game.advance(6);}const safe=game.players[0].safe;assert.ok(safe>0);game.action('p0','quizAnswer',{question:5,answer:(game.correct+1)%4});game.advance(15);assert.equal(game.players[0].gain,safe);assert.equal(game.players[0].alive,false);game.advance(6);game.action('p0','quizAnswer',{question:6,answer:game.correct});game.advance(15);assert.equal(game.players[0].score,6);assert.equal(game.players[0].gain,safe);});
test('cooperative ties fail fairly, no votes do not pass, new arrivals wait one question',()=>{const game=new Quizz(players.slice(0,2),null,{mode:'cooperative',questionCount:2,seconds:15});game.action('p0','quizAnswer',{question:0,answer:game.correct});game.action('p1','quizAnswer',{question:0,answer:(game.correct+1)%4});game.addPlayer(players[2]);assert.equal(game.snapshot('p2').you.spectator,true);assert.throws(()=>game.action('p2','quizAnswer',{question:0,answer:game.correct}));game.advance(15);assert.equal(game.team.alive,false);game.advance(6);assert.equal(game.snapshot('p2').you.spectator,false);});
test('100-question selection is unique and a single player can complete a match',()=>{const quiz=structuredClone(BUILTIN_QUIZZES.fruits);quiz.questions=Array.from({length:100},(_,i)=>({...quiz.questions[i%10],id:'q'+i}));const game=new Quizz(players.slice(0,1),null,{quizId:'fruits',questionCount:100,seconds:15},{fruits:quiz});assert.equal(new Set(game.order).size,100);for(let i=0;i<100;i++){game.action('p0','quizAnswer',{question:i,answer:game.correct});game.advance(15);game.advance(6);}assert.equal(game.ended,true);assert.equal(game.players[0].gain,1000000);assert.equal(game.winner,'p0');});
