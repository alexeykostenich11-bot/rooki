import { NextResponse } from 'next/server';
import { isReviewOwner, parseReviewAction, telegramCall, validWebhookSecret } from '@/lib/review-moderation';
import { moderateReview } from '@/lib/review-store';

export async function POST(request: Request) {
  if (!validWebhookSecret(request.headers.get('x-telegram-bot-api-secret-token'))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const raw = await request.text();
  if (raw.length > 20000) return NextResponse.json({ error: 'oversized' }, { status: 413 });
  let update;
  try { update = JSON.parse(raw); } catch { return NextResponse.json({ error: 'invalid' }, { status: 400 }); }
  const message = update?.message;
  if (message?.chat?.type === 'private' && /^\/reviews(?:@\w+)?(?:\s|$)/i.test(message.text || '') && isReviewOwner(message.from?.id)) {
    try {
      const { createAdminLink } = await import('@/lib/review-admin');
      await telegramCall('sendMessage', { chat_id: message.chat.id, text: 'Личный кабинет отзывов ROOKI. Ссылка одноразовая, действует 15 минут. Не пересылайте её.', reply_markup: { inline_keyboard: [[{ text: 'Открыть отзывы', url: await createAdminLink() }]] } });
      return NextResponse.json({ok:true});
    } catch { return NextResponse.json({error:'temporary_failure'},{status:503}); }
  }
  // Return only the sender's own ID, in a private chat. Never grant moderation here.
  if (message?.chat?.type === 'private' && /^\/myid(?:@\w+)?(?:\s|$)/i.test(message.text || '') && Number.isSafeInteger(message.from?.id) && message.from.id > 0) {
    try {
      await telegramCall('sendMessage', {
        chat_id: message.chat.id,
        text: `Ваш Telegram ID: ${message.from.id}\n\nПередайте это число для настройки модерации ROOKI. Команда не предоставляет права публикации.`,
      });
      return NextResponse.json({ ok: true });
    } catch { return NextResponse.json({ error: 'temporary_failure' }, { status: 503 }); }
  }
  const q = update?.callback_query;
  if (!q) return NextResponse.json({ ok: true });
  if (!isReviewOwner(q.from?.id)) {
    await telegramCall('answerCallbackQuery', { callback_query_id: q.id, text: 'Подтвердить отзыв может только Алексей.', show_alert: true });
    return NextResponse.json({ ok: true });
  }
  const action = parseReviewAction(q.data);
  if (!action) return NextResponse.json({ ok: true });
  try {
    const status = await moderateReview(action.id, action.status, String(q.from.id));
    await telegramCall('answerCallbackQuery', { callback_query_id: q.id, text: status === 'published' ? 'Отзыв опубликован на сайте' : status === 'rejected' ? 'Отзыв отклонён' : 'Отзыв не найден' });
    if (q.message) await telegramCall('editMessageReplyMarkup', { chat_id: q.message.chat.id, message_id: q.message.message_id, reply_markup: { inline_keyboard: [] } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'temporary_failure' }, { status: 503 });
  }
}
