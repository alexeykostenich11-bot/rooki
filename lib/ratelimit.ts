/**
 * Простой счётчик попыток в памяти процесса. Хватает для одного сервера:
 * защищает вход и регистрацию от подбора пароля и спама.
 * Если сайт запустят на нескольких серверах, заменить на счётчик в БД или Redis.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function hit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
  }
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}

export function reset(key: string) {
  buckets.delete(key);
}
