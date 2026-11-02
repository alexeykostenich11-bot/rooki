import { randomUUID } from 'node:crypto';
import type { Review } from './reviews';

export type StoredReview = Review & { id: string; status: 'pending' | 'published' | 'rejected'; createdAt: string; moderatedAt?: string; moderatedBy?: string };
export function reviewStorageReady() {
  return Boolean((process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) && (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN));
}
export async function redis(command: (string | number)[]) {
  if (!reviewStorageReady()) throw new Error('review_storage_unconfigured');
  const response = await fetch((process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)!, {
    method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(8000),
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  if (!response.ok) throw new Error('review_storage_failed');
  const data = await response.json();
  if (data.error) throw new Error('review_storage_failed');
  return data.result;
}
export async function savePendingReview(review: Review) {
  const item: StoredReview = { ...review, id: randomUUID(), status: 'pending', createdAt: new Date().toISOString() };
  await redis(['EVAL', `redis.call('SET',KEYS[1],ARGV[1]); redis.call('ZADD',KEYS[2],ARGV[2],KEYS[1]); return 1`, 2, `rooki:review:${item.id}`, 'rooki:reviews:all', JSON.stringify(item), Date.now()]);
  return item;
}
// The decision and public index update are atomic; repeated button presses are harmless.
export async function moderateReview(id: string, status: 'published' | 'rejected', actor: string, allowChange = false) {
  return await redis(['EVAL', `local raw=redis.call('GET',KEYS[1]); if not raw then return 'missing' end; local r=cjson.decode(raw); if r.status~='pending' and ARGV[5]~='yes' then return r.status end; r.status=ARGV[1]; r.moderatedBy=ARGV[2]; r.moderatedAt=ARGV[3]; redis.call('SET',KEYS[1],cjson.encode(r)); if ARGV[1]=='published' then redis.call('ZADD',KEYS[2],ARGV[4],KEYS[1]) else redis.call('ZREM',KEYS[2],KEYS[1]) end; return ARGV[1]`, 2, `rooki:review:${id}`, 'rooki:reviews:published', status, actor, new Date().toISOString(), Date.now(), allowChange ? 'yes' : 'no']) as string;
}
export async function allReviews(): Promise<StoredReview[]> {
  const keys = await redis(['ZREVRANGE', 'rooki:reviews:all', 0, 199]) as string[];
  if (!keys.length) return [];
  const records = await redis(['MGET', ...keys]) as (string | null)[];
  return records.flatMap(raw => raw ? [JSON.parse(raw) as StoredReview] : []);
}
export async function publishedReviews(): Promise<Review[]> {
  if (!reviewStorageReady()) return [];
  const keys = await redis(['ZREVRANGE', 'rooki:reviews:published', 0, 99]) as string[];
  if (!keys.length) return [];
  const records = await redis(['MGET', ...keys]) as (string | null)[];
  return records.flatMap(raw => {
    if (!raw) return [];
    const r = JSON.parse(raw) as StoredReview;
    return r.status === 'published' ? [{ name: r.name, object: r.object, text: r.text, rating: r.rating }] : [];
  });
}
