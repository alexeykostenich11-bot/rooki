import { CHAT_IDS } from "@/lib/chatIds";

/**
 * Отправляет сообщение всем получателям и записывает в логи Vercel,
 * кому не дошло и почему (например "chat not found", "bot was kicked",
 * "group chat was upgraded to a supergroup chat").
 */
export async function sendToAll(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("no_token");

  const results = await Promise.all(
    CHAT_IDS.map(async (chat_id) => {
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id, text }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.ok === false) {
          console.error(
            `[telegram] не доставлено в ${chat_id}: ${data?.description ?? res.status}` +
              (data?.parameters?.migrate_to_chat_id
                ? ` (новый номер группы: ${data.parameters.migrate_to_chat_id})`
                : "")
          );
          return false;
        }
        return true;
      } catch (e) {
        console.error(`[telegram] ошибка отправки в ${chat_id}:`, e);
        return false;
      }
    })
  );
  console.log(`[telegram] доставлено ${results.filter(Boolean).length} из ${CHAT_IDS.length}`);
  return results;
}
