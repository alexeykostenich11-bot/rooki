import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { redis, reviewStorageReady } from '@/lib/review-store';
import { telegramCall } from '@/lib/review-moderation';
import { createAdminLink } from '@/lib/review-admin';
import { initialReview } from '@/lib/initial-review';
// One-time installation endpoint. Never returns the bot or database credentials.
export async function POST(request:Request){
  const expected=process.env.ROOKI_REVIEW_SETUP_SECRET,actual=request.headers.get('x-rooki-setup');
  if(!expected||!actual||Buffer.byteLength(expected)!==Buffer.byteLength(actual)||!timingSafeEqual(Buffer.from(expected),Buffer.from(actual)))return NextResponse.json({error:'forbidden'},{status:403});
  if(!reviewStorageReady())return NextResponse.json({error:'storage_unconfigured'},{status:503});
  try{
    if(await redis(['GET','rooki:reviews:setup-complete']))return NextResponse.json({error:'already_configured'},{status:409});
    const origin=process.env.NEXT_PUBLIC_SITE_URL||'https://www.rooki-remont.ru';
    const url=new URL('/api/telegram/reviews',origin).href;
    const info=await telegramCall('getWebhookInfo',{});
    if(info.url&&info.url!==url)return NextResponse.json({error:'existing_webhook_requires_migration'},{status:409});
    const secret=process.env.TELEGRAM_REVIEW_WEBHOOK_SECRET;
    if(!secret||!process.env.TELEGRAM_REVIEW_OWNER_ID)return NextResponse.json({error:'moderation_unconfigured'},{status:503});
    await telegramCall('setWebhook',{url,secret_token:secret,allowed_updates:['message','callback_query']});
    await redis(['EVAL',`if redis.call('EXISTS',KEYS[1])==0 then redis.call('SET',KEYS[1],ARGV[1]); redis.call('ZADD',KEYS[2],ARGV[2],KEYS[1]); redis.call('ZADD',KEYS[3],ARGV[2],KEYS[1]); end; return 1`,3,`rooki:review:${initialReview.id}`,'rooki:reviews:all','rooki:reviews:published',JSON.stringify(initialReview),Date.now()]);
    const adminLink=await createAdminLink();
    await telegramCall('sendMessage',{chat_id:process.env.TELEGRAM_REVIEW_OWNER_ID,text:'ROOKI: кабинет отзывов подключён. Отзыв Анжелики опубликован с оценкой 5/5. Для нового входа отправьте /reviews. Ссылка личная, действует 15 минут.',reply_markup:{inline_keyboard:[[{text:'Открыть кабинет',url:adminLink}]]}});
    await redis(['SET','rooki:reviews:setup-complete',new Date().toISOString(),'NX']);
    return NextResponse.json({ok:true,webhook:url},{headers:{'Cache-Control':'no-store'}});
  }catch{return NextResponse.json({error:'setup_failed'},{status:503});}
}
