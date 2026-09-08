import test from 'node:test';import assert from 'node:assert/strict';
import {quizCue,quizWon} from '../public/quiz-audio.js';
const q={index:0,stage:'question',ended:false,mode:'ranking',ranking:[{id:'a',gain:100,score:1},{id:'b',gain:100,score:1}],you:{id:'b',gain:100,score:1,answer:2},question:{correct:2}};
test('quiz sounds follow transitions, never heartbeats; tied and cooperative winners are celebrated',()=>{
 assert.equal(quizCue(q,{...q,left:5,revision:9},'display'),null);
 assert.equal(quizCue(q,{...q,stage:'reveal'},'controller','b'),'quizCorrect');
 assert.equal(quizCue(q,{...q,stage:'reveal',you:{answer:0}},'controller','b'),'quizWrong');
 const end={...q,ended:true,winner:'a',stage:'finished'};
 assert.equal(quizCue(q,end,'controller','b'),'quizVictory');
 assert.equal(quizCue(end,{...end,revision:99},'display'),null);
 assert.equal(quizWon({...end,you:{gain:0,score:0}},'controller','c'),false);
 assert.equal(quizWon({...end,mode:'cooperative',team:{alive:true},you:{id:'outside-top-12'}},'controller','outside-top-12'),true);
 assert.equal(quizWon({...end,mode:'cooperative',team:{alive:true},you:{spectator:true}},'controller','c'),false);
});
