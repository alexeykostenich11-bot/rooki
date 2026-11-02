import { randomBytes, createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { redis } from './review-store';
import { isReviewOwner } from './review-moderation';

export const adminCookie = 'rooki_review_session';
const hash = (token: string) => createHash('sha256').update(token).digest('hex');
export async function createAdminLink() {
  const owner = process.env.TELEGRAM_REVIEW_OWNER_ID;
  if (!owner || !isReviewOwner(owner)) throw new Error('owner_unconfigured');
  const token = randomBytes(32).toString('hex');
  await redis(['SET', `rooki:review:login:${hash(token)}`, owner, 'EX', 900]);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rooki-remont.ru';
  return `${origin}/admin/reviews#access=${token}`;
}
export async function exchangeAdminLink(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const owner = await redis(['GETDEL', `rooki:review:login:${hash(token)}`]);
  if (!isReviewOwner(owner)) return null;
  const session = randomBytes(32).toString('hex');
  await redis(['SET', `rooki:review:session:${hash(session)}`, String(owner), 'EX', 43200]);
  return session;
}
export async function reviewAdmin() {
  const token = (await cookies()).get(adminCookie)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const owner = await redis(['GET', `rooki:review:session:${hash(token)}`]);
  return isReviewOwner(owner) ? String(owner) : null;
}
export async function logoutReviewAdmin() {
  const token = (await cookies()).get(adminCookie)?.value;
  if (token && /^[a-f0-9]{64}$/.test(token)) await redis(['DEL', `rooki:review:session:${hash(token)}`]);
}
export function sameOrigin(request: Request) {
  return request.headers.get('origin') === new URL(request.url).origin;
}
