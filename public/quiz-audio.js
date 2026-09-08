// Original synthesized show cues: offline, bounded, and independent of timer updates.
export function quizWinners(q){
 if(!q?.ended||!q.winner)return [];
 if(q.mode==='cooperative')return q.team.alive?q.ranking.map(p=>p.id):[];
 const first=q.ranking[0];return q.ranking.filter(p=>p.gain===first.gain&&p.score===first.score).map(p=>p.id);
}
export function quizWon(q,role,id){
 if(!q?.ended||!q.winner)return false;
 if(role==='display')return true;
 if(q.you?.spectator)return false;
 if(q.mode==='cooperative')return q.team.alive;
 const best=q.ranking[0];return q.you?best?.gain===q.you.gain&&best?.score===q.you.score:quizWinners(q).includes(id);
}
export function quizCue(previous,q,role,id){
 if(!previous||!q)return null;
 if(q.ended&&!previous.ended)return quizWon(q,role,id)?'quizVictory':'quizFinish';
 if(q.index!==previous.index)return 'quizQuestion';
 if(q.stage==='reveal'&&previous.stage!=='reveal')return role==='controller'&&q.you?.answer!==q.question.correct?'quizWrong':'quizCorrect';
 return null;
}
export function playQuizCue(context,cue){
 if(!context||context.state!=='running')return ()=>{};
 const voices=[],bus=context.createGain();bus.gain.value=.65;bus.connect(context.destination);
 const stop=()=>{for(const voice of voices){try{voice.stop();}catch{}}bus.disconnect();};
 let remaining=0;
 function track(source,nodes){voices.push(source);remaining++;source.onended=()=>{source.disconnect();nodes.forEach(n=>n.disconnect());if(!--remaining)bus.disconnect();};}
 const notes=cue==='quizVictory'?[523,659,784,1047,784,1047,1319]:cue==='quizCorrect'?[523,659,784,1047]:cue==='quizWrong'?[220,165]:cue==='quizFinish'?[392,494,587,784]:[330,440,659];
 notes.forEach((hz,i)=>{const source=context.createOscillator(),gain=context.createGain(),at=context.currentTime+i*.14;source.type='triangle';source.frequency.value=hz;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.12,at+.014);gain.gain.exponentialRampToValueAtTime(.001,at+.35);source.connect(gain);gain.connect(bus);track(source,[gain]);source.start(at);source.stop(at+.36);});
 if(cue==='quizVictory'){
  // Many short, filtered, irregular noise bursts simulate an applauding audience.
  const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*.14),context.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/data.length*5);
  for(let i=0;i<64;i++){
   const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain(),at=context.currentTime+.25+i*.052+Math.random()*.04;
   source.buffer=buffer;source.playbackRate.value=.75+Math.random()*.5;filter.type='bandpass';filter.frequency.value=1100+Math.random()*1400;filter.Q.value=.6;gain.gain.value=(.12+Math.random()*.12)*Math.min(1,(64-i)/16);
   source.connect(filter);filter.connect(gain);gain.connect(bus);track(source,[filter,gain]);source.start(at);source.stop(at+.2);
  }
 }
 return stop;
}
