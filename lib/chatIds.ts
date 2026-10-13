/**
 * Кому слать уведомления в Telegram (заявки и отзывы).
 * Берём ВСЕ переменные вида TELEGRAM_CHAT_ID, TELEGRAM_CHAT_ID_1, _2, _3 ... _99
 * плюс список через запятую в TELEGRAM_CHAT_IDS. Повторы убираем.
 * Единственный источник правды: настройки Vercel. Убрали переменную, человек больше не получает сообщения.
 * Чтобы добавить человека или группу: заведите в Vercel новую переменную
 * (например TELEGRAM_CHAT_ID_5) со значением из номера чата и сделайте Redeploy.
 */
const fromEnv = Object.entries(process.env)
  .filter(([key, value]) => /^TELEGRAM_CHAT_ID(_\d+)?$/.test(key) && value)
  .map(([, value]) => String(value).trim());

const fromList = (process.env.TELEGRAM_CHAT_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const CHAT_IDS = Array.from(
  new Set([...fromEnv, ...fromList].filter(Boolean))
);
