import { NextResponse } from "next/server";

const CHAT_IDS = [
  process.env.TELEGRAM_CHAT_ID_1 || "7723673046",
  process.env.TELEGRAM_CHAT_ID_2 || "8733658390",
  process.env.TELEGRAM_CHAT_ID_3 || "-1003636377506",
  process.env.TELEGRAM_CHAT_ID_4,
].filter(Boolean) as string[];

// Простая защита от спама: не больше 3 отзывов в час с одного адреса
const hits = new Map<string, { n: number; reset: number }>();
function allowed(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || h.reset < now) {
    hits.set(ip, { n: 1, reset: now + 3600_000 });
    return true;
  }
  h.n += 1;
  return h.n <= 3;
}

const clean = (v: unknown, max: number) =>
  String(v ?? "")
    .replace(/[\u0000-\u001f]+/g, " ")
    .trim()
    .slice(0, max);

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!allowed(ip)) {
      return NextResponse.json({ error: "too_many" }, { status: 429 });
    }

    const data = await request.json();

    // Скрытое поле-ловушка для ботов
    if (data.website) return NextResponse.json({ success: true });

    const name = clean(data.name, 60);
    const object = clean(data.object, 100);
    const text = clean(data.text, 1200);
    const rating = Math.min(5, Math.max(1, Number(data.rating) || 5));
    if (!name || text.length < 10) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "no_token" }, { status: 500 });
    }

    const snippet = `{ name: ${JSON.stringify(name)}, object: ${JSON.stringify(
      object || "Москва"
    )}, rating: ${rating}, text: ${JSON.stringify(text)} },`;

    const message = `⭐ Новый отзыв на сайте ROOKI (ждёт проверки)

Имя: ${name}
Объект: ${object || "-"}
Оценка: ${"★".repeat(rating)}${"☆".repeat(5 - rating)}

${text}

Чтобы опубликовать, добавьте в lib/reviews.ts строку (или напишите Claude «опубликуй отзыв»):
${snippet}`;

    await Promise.all(
      CHAT_IDS.map((chat_id) =>
        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id, text: message }),
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
