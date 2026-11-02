import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { redis, reviewStorageReady, savePendingReview } from '@/lib/review-store';
import { telegramCall } from '@/lib/review-moderation';
import { sameOrigin } from '@/lib/review-admin';
const clean = (v: unknown, max: number) => typeof v === 'string' ? v.replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, max) : '';
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && !sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const raw = await request.text();
  if (raw.length > 10000) return NextResponse.json({ error: 'oversized' }, { status: 413 });
  let data;
  try { data = JSON.parse(raw); } catch { return NextResponse.json({ error: 'invalid' }, { status: 400 }); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  if (data.website) return NextResponse.json({ success: true });
  const name = clean(data.name, 60), object = clean(data.object, 100), text = clean(data.text, 1200), rating = Number(data.rating);
  if (!name || text.length < 10 || !Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  if (!reviewStorageReady() || !process.env.TELEGRAM_REVIEW_OWNER_ID || !process.env.TELEGRAM_REVIEW_WEBHOOK_SECRET) return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const key = 'rooki:review:rate:' + createHash('sha256').update(ip + ':' + Math.floor(Date.now() / 3600000)).digest('hex');
    const count = await redis(['EVAL', `local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],3600) end; return n`, 1, key]) as number;
    if (count > 3) return NextResponse.json({ error: 'too_many' }, { status: 429 });
    const item = await savePendingReview({ name, object: object || 'Москва', rating, text });
    try {
      await telegramCall('sendMessage', {
        chat_id: process.env.TELEGRAM_REVIEW_OWNER_ID,
        text: `⭐ Отзыв ROOKI · На проверке\n\nИмя: ${name}\nОбъект: ${object || '—'}\nОценка: ${rating}/5\n\n${text}\n\nПубликуйте после проверки, что автор работал с ROOKI.`,
        reply_markup: { inline_keyboard: [[{ text: '✅ Опубликовать', callback_data: `review:publish:${item.id}` }, { text: '❌ Отклонить', callback_data: `review:reject:${item.id}` }]] },
      });
    } catch { console.error('[reviews] saved_pending_notification_failed', item.id); }
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'temporary_failure' }, { status: 503 }); }
}
