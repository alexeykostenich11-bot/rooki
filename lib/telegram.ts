import "server-only";

const CHAT_IDS = [
  process.env.TELEGRAM_CHAT_ID_1 || "7723673046",
  process.env.TELEGRAM_CHAT_ID_2 || "8733658390",
  process.env.TELEGRAM_CHAT_ID_3 || "-1003636377506",
  process.env.TELEGRAM_CHAT_ID_4,
].filter(Boolean) as string[];

/** Сообщение владельцам сайта. Если бот не настроен, молча ничего не делает. */
export async function notifyAdmins(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await Promise.allSettled(
    CHAT_IDS.map((chat_id) =>
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, text }),
      })
    )
  );
}
