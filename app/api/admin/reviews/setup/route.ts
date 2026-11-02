import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { redis, reviewStorageReady } from '@/lib/review-store';
import { telegramCall } from '@/lib/review-moderation';
import { createAdminLink } from '@/lib/review-admin';
import { initialReview } from '@/lib/initial-review';
export async function GET(){
  return new Response('<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>Подключение отзывов ROOKI</title><body style="font:16px Arial;background:#f5f5f7;padding:60px 24px"><main style="max-width:500px;margin:auto;background:white;border:1px solid #ddd;border-radius:24px;padding:32px"><p>ROOKI · настройка владельца</p><h1>Подключить отзывы</h1><p>Одноразовая настройка базы, Telegram и первого подтверждённого отзыва. Секрет не даёт доступ к остальным настройкам сайта.</p><form method="post"><label>Ключ настройки<input type="password" name="setup" required autocomplete="off" style="display:block;margin:16px 0;width:90%;padding:12px"></label><button style="background:#111;color:white;border:0;border-radius:30px;padding:14px 24px">Подключить</button></form></main></body></html>',{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'"}});
}
// One-time installation endpoint. Never returns the bot or database credentials.
export async function POST(request:Request){
  let actual=request.headers.get('x-rooki-setup');
  if(!actual&&request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')){
    if(request.headers.get('origin')!==new URL(request.url).origin)return NextResponse.json({error:'forbidden'},{status:403});
    const body=await request.text();if(body.length>200)return NextResponse.json({error:'invalid'},{status:400});
    actual=new URLSearchParams(body).get('setup');
  }
  const expected=process.env.ROOKI_REVIEW_SETUP_SECRET;
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
