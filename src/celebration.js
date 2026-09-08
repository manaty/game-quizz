export function celebration(){
 const colors=['#ffd66e','#ff78b9','#6de6ff','#a9ffaf'];
 const sparks=Array.from({length:3},(_,burst)=>`<div class="firework firework-${burst}">${Array.from({length:16},(_,i)=>`<i style="--angle:${i*22.5}deg;--delay:${burst*.65}s;--color:${colors[burst]}"></i>`).join('')}</div>`).join('');
 const confetti=Array.from({length:32},(_,i)=>`<i class="paper" style="--left:${(i*31)%100}%;--delay:${(i%8)*.14}s;--drift:${(i%2?1:-1)*(25+i%5*15)}px;--color:${colors[i%4]}"></i>`).join('');
 return `<div class="celebration" aria-hidden="true">${sparks}${confetti}</div>`;
}
