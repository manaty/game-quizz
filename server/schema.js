export const MAX_IMAGE_BYTES=100000,MAX_QUESTIONS=100,MAX_QUIZ_BYTES=14000000;
const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
function text(x,max,label){if(typeof x==='string'){if(!x.trim()||x.length>max)throw Error(label);return x.trim();}if(!object(x)||!x.en||Object.keys(x).some(k=>!['en','fr','tl'].includes(k)))throw Error(label);return Object.fromEntries(Object.entries(x).map(([k,v])=>[k,text(v,max,label)]));}
export function imageData(value){
 if(value==null||value==='')return null;
 if(typeof value!=='string'||value.length>134000)throw Error('Image: maximum 100 KB.');
 const m=/^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
 if(!m||m[2].length%4)throw Error('Use a PNG or JPEG image.');
 const bytes=typeof Buffer!=='undefined'?Uint8Array.from(Buffer.from(m[2],'base64')):Uint8Array.from(atob(m[2]),c=>c.charCodeAt(0));
 if(bytes.length>MAX_IMAGE_BYTES)throw Error('Image: maximum 100 KB.');
 if(m[1]==='png'&&![137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b)||m[1]==='jpeg'&&!(bytes[0]===255&&bytes[1]===216&&bytes[2]===255))throw Error('Invalid image content.');
 let width=0,height=0;const u16=i=>bytes[i]*256+bytes[i+1],u32=i=>bytes[i]*16777216+bytes[i+1]*65536+bytes[i+2]*256+bytes[i+3];
 if(m[1]==='png'&&bytes.length>=33&&String.fromCharCode(...bytes.slice(12,16))==='IHDR'){width=u32(16);height=u32(20);}
 if(m[1]==='jpeg'){for(let i=2;i+8<bytes.length;){if(bytes[i]!==255)break;const marker=bytes[i+1];if(marker===218||marker===217)break;const size=u16(i+2);if(size<2||i+2+size>bytes.length)break;if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)){height=u16(i+5);width=u16(i+7);break;}i+=2+size;}}
 if(!width||!height||width>2048||height>2048)throw Error('Image dimensions must be 1–2048 pixels.');
 return value;
}
export function validateQuiz(input){
 if(!object(input)||input.schemaVersion!==1)throw Error('Expected a version 1 quiz.');
 if(!/^[a-z][a-z0-9-]{2,60}$/.test(input.id))throw Error('Use an ID with lowercase letters, digits and hyphens.');
 if(!Array.isArray(input.questions)||input.questions.length<1||input.questions.length>MAX_QUESTIONS)throw Error('A quiz needs 1–100 questions.');
 const seen=new Set();
 const questions=input.questions.map((q,i)=>{
  if(!object(q)||!Array.isArray(q.answers)||q.answers.length!==4||!Number.isInteger(q.correct)||q.correct<0||q.correct>3)throw Error('Question '+(i+1)+': four answers and one correct answer required.');
  const id=q.id||'q'+(i+1);if(typeof id!=='string'||!/^[a-zA-Z0-9_-]{1,60}$/.test(id)||seen.has(id))throw Error('Question IDs must be unique.');seen.add(id);
  const answers=q.answers.map(a=>text(a,300,'Answer too long or empty.'));
  for(const lang of ['en','fr','tl'])if(new Set(answers.map(a=>localized(a,lang).toLowerCase())).size!==4)throw Error('Question '+(i+1)+': answers must be distinct.');
  return {id,prompt:text(q.prompt,1200,'Question text required (maximum 1200 characters).'),answers,correct:q.correct,explanation:q.explanation?text(q.explanation,1500,'Explanation too long.'):null,image:imageData(q.image)};
 });
 return {schemaVersion:1,id:input.id,title:text(input.title,120,'Title required.'),author:text(input.author||'Anonymous',100,'Invalid author.'),language:['en','fr','tl'].includes(input.language)?input.language:'en',questions};
}
export function localized(value,lang='en'){return typeof value==='string'?value:value?.[lang]||value?.en||'';}
export function gameOptions(value={},available=100){
 const mode=value.mode??'ranking',questionCount=value.questionCount??Math.min(10,available),seconds=value.seconds??30,order=value.order??'random';
 if(!['ranking','elimination','cooperative'].includes(mode)||!Number.isInteger(questionCount)||questionCount<1||questionCount>Math.min(100,available)||![15,30,45,60,90].includes(seconds)||!['random','authored'].includes(order))throw Error('Invalid quiz settings or more questions requested than available.');
 return {quizId:value.quizId||'flags',mode,questionCount,seconds,order};
}
