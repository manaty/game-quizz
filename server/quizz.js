import {gameOptions} from './schema.js';
import {BUILTIN_QUIZZES} from './builtins.js';
const copy=x=>JSON.parse(JSON.stringify(x));
function random(n){const a=new Uint32Array(1),limit=4294967296-4294967296%n;do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%n;}
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=random(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
export class Quizz{
 constructor(players,saved,options={},bank=BUILTIN_QUIZZES){
  this.bank=bank;this.options=gameOptions(saved?.options||options,bank[(saved?.options||options).quizId||'flags']?.questions.length||0);
  this.quiz=bank[this.options.quizId];if(!this.quiz)throw Error('Unknown quiz.');
  this.players=players.map(p=>({id:p.id,number:p.number,score:0,gain:0,safe:0,alive:true,answer:null,used:false,hidden:[],spectator:false}));
  this.order=this.quiz.questions.map((_,i)=>i);if(this.options.order==='random')shuffle(this.order);this.order=this.order.slice(0,this.options.questionCount);
  this.index=0;this.stage='question';this.left=this.options.seconds;this.team={score:0,gain:0,safe:0,alive:true};this.winner=null;this.ended=false;this.revision=0;
  this.answerOrder=shuffle([0,1,2,3]);
  if(saved)for(const k of ['players','order','index','stage','left','team','winner','ended','revision','answerOrder'])this[k]=copy(saved[k]);
 }
 get question(){return this.quiz.questions[this.order[this.index]];}
 get correct(){return this.answerOrder.indexOf(this.question.correct);}
 get gain(){return Math.round(100*Math.pow(10000,(this.index+1)/this.order.length)/10)*10;}
 action(id,action,value){
  if(action==='hostTimeUp'){this.finish();return;}
  const p=this.players.find(p=>p.id===id);if(!p||p.spectator||this.stage!=='question'||this.ended)throw Error('Wait for the next question.');
  if(!value||value.question!==this.index)throw Error('This question has changed.');
  if(action==='quizFifty'){
   if(p.used||p.answer!==null)throw Error('Lifeline unavailable.');p.hidden=shuffle([0,1,2,3].filter(x=>x!==this.correct)).slice(0,2);p.used=true;return;
  }
  if(action!=='quizAnswer'||!Number.isInteger(value.answer)||value.answer<0||value.answer>3||p.hidden.includes(value.answer)||p.answer!==null)throw Error('Invalid answer.');
  p.answer=value.answer;
  // Fixed deadlines prevent a disconnected participant from pausing the class
  // and avoid giving early responders the answer before everyone has locked in.
 }
 reveal(){
  this.stage='reveal';this.left=6;this.revision++;
  for(const p of this.players.filter(p=>!p.spectator)){
   const correct=p.answer===this.correct;if(correct)p.score++;
   if(this.options.mode==='ranking'){if(correct)p.gain=Math.round(p.score*1000000/this.order.length);}
   else if(p.alive){if(correct){p.gain=this.gain;if((this.index+1)%5===0)p.safe=p.gain;}else{p.alive=false;p.gain=p.safe;}}
  }
  if(this.options.mode==='cooperative'&&this.team.alive){
   const votes=[0,0,0,0];for(const p of this.players)if(!p.spectator&&p.answer!==null)votes[p.answer]++;
   const max=Math.max(...votes),leaders=votes.map((v,i)=>v===max?i:-1).filter(i=>i>=0);
   const good=max>0&&leaders.length===1&&leaders[0]===this.correct;
   if(good){this.team.score++;this.team.gain=this.gain;if((this.index+1)%5===0)this.team.safe=this.team.gain;}else{this.team.alive=false;this.team.gain=this.team.safe;}
  }
 }
 advance(dt){
  if(this.ended)return false;this.left-=Math.max(0,Math.min(dt,60));if(this.left>0)return false;
  if(this.stage==='question'){this.reveal();return true;}
  if(this.index+1>=this.order.length){this.finish();return true;}
  this.index++;this.stage='question';this.left=this.options.seconds;this.answerOrder=shuffle([0,1,2,3]);this.revision++;
  for(const p of this.players){p.answer=null;p.hidden=[];p.spectator=false;}return true;
 }
 finish(){this.stage='finished';this.ended=true;this.left=0;this.revision++;const ranking=this.ranking();this.winner=ranking[0]?.id||null;}
 ranking(){return [...this.players].sort((a,b)=>b.gain-a.gain||b.score-a.score||a.number-b.number).map(({id,number,score,gain,alive})=>({id,number,score,gain,alive}));}
 snapshot(id){
  const p=this.players.find(p=>p.id===id),q=this.question,revealed=this.stage!=='question';
  return {title:this.quiz.title,mode:this.options.mode,index:this.index,total:this.order.length,stage:this.stage,left:Math.ceil(this.left),revision:this.revision,gain:this.gain,question:{prompt:q.prompt,image:q.image||null,answers:this.answerOrder.map(i=>q.answers[i]),...(revealed?{correct:this.correct,explanation:q.explanation}: {})},answered:this.players.filter(p=>p.answer!==null&&!p.spectator).length,participantCount:this.players.filter(p=>!p.spectator).length,ranking:this.ranking().slice(0,12),team:copy(this.team),you:p?copy(p):null,winner:this.winner,ended:this.ended};
 }
 addPlayer(p){if(!this.players.some(x=>x.id===p.id))this.players.push({id:p.id,number:p.number,score:0,gain:0,safe:0,alive:true,answer:null,used:false,hidden:[],spectator:true});}
 release(){}
 save(){return Object.fromEntries(['options','players','order','index','stage','left','team','winner','ended','revision','answerOrder'].map(k=>[k,copy(this[k])]));}
}
