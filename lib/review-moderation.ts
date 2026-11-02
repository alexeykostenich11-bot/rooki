import { timingSafeEqual } from 'node:crypto';
export function isReviewOwner(id: unknown) {
  const owner = process.env.TELEGRAM_REVIEW_OWNER_ID?.trim();
  return Boolean(owner && /^\d+$/.test(owner) && String(id) === owner);
}
export function validWebhookSecret(value: string | null) {
  const secret = process.env.TELEGRAM_REVIEW_WEBHOOK_SECRET;
  if (!secret || !value) return false;
  const a = Buffer.from(secret), b = Buffer.from(value);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function parseReviewAction(data: unknown) {
  if (typeof data !== 'string') return null;
  const match = /^review:(publish|reject):([a-f0-9-]{36})$/.exec(data);
  return match ? { id: match[2], status: match[1] === 'publish' ? 'published' as const : 'rejected' as const } : null;
}
export async function telegramCall(method: string, body: object) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('telegram_unconfigured');
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST', signal: AbortSignal.timeout(8000),
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error('telegram_failed');
  return result.result;
}
