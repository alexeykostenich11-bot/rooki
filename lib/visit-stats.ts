import { redis } from './review-store';
const moscowDay=(time:number)=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(time);
export async function recordVisit(event:string){
  const day=moscowDay(Date.now());
  await redis(['EVAL',`if not redis.call('SET',KEYS[1],'1','NX','EX',86400) then return 0 end; redis.call('SET',KEYS[2],ARGV[1],'NX'); redis.call('INCR',KEYS[3]); redis.call('INCR',KEYS[4]); redis.call('EXPIRE',KEYS[4],7776000); return 1`,4,`rooki:stats:event:${event}`,'rooki:stats:started','rooki:stats:views',`rooki:stats:views:${day}`,new Date().toISOString()]);
}
export async function visitStats(){
  const days=Array.from({length:7},(_,i)=>moscowDay(Date.now()-i*86400000));
  const values=await redis(['MGET','rooki:stats:started','rooki:stats:views',...days.map(d=>`rooki:stats:views:${d}`)]) as (string|null)[];
  return {startedAt:values[0],today:{views:Number(values[2]||0)},week:{views:values.slice(2).reduce((a,v)=>a+Number(v||0),0)},total:{views:Number(values[1]||0)}};
}
