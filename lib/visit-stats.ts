import { redis } from './review-store';
const moscowDay=(time:number)=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(time);
export async function recordVisit(visitor:string,event:string){
  const day=moscowDay(Date.now());
  await redis(['EVAL',`if not redis.call('SET',KEYS[1],'1','NX','EX',86400) then return 0 end; redis.call('SET',KEYS[2],ARGV[2],'NX'); redis.call('INCR',KEYS[3]); redis.call('INCR',KEYS[4]); redis.call('EXPIRE',KEYS[4],7776000); redis.call('PFADD',KEYS[5],ARGV[1]); redis.call('PFADD',KEYS[6],ARGV[1]); redis.call('EXPIRE',KEYS[6],7776000); return 1`,6,`rooki:stats:event:${event}`,'rooki:stats:started','rooki:stats:views',`rooki:stats:views:${day}`,'rooki:stats:visitors',`rooki:stats:visitors:${day}`,visitor,new Date().toISOString()]);
}
export async function visitStats(){
  const days=Array.from({length:7},(_,i)=>moscowDay(Date.now()-i*86400000));
  const [values,today,week,total]=await Promise.all([
    redis(['MGET','rooki:stats:started','rooki:stats:views',...days.map(d=>`rooki:stats:views:${d}`)]) as Promise<(string|null)[]>,
    redis(['PFCOUNT',`rooki:stats:visitors:${days[0]}`]),redis(['PFCOUNT',...days.map(d=>`rooki:stats:visitors:${d}`)]),redis(['PFCOUNT','rooki:stats:visitors']),
  ]);
  return {startedAt:values[0],today:{views:Number(values[2]||0),visitors:Number(today)},week:{views:values.slice(2).reduce((a,v)=>a+Number(v||0),0),visitors:Number(week)},total:{views:Number(values[1]||0),visitors:Number(total)}};
}
