import { NextResponse } from "next/server";
import { sendToAll } from "@/lib/telegram";



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

    try {
      await sendToAll(message);
    } catch {
      return NextResponse.json({ error: "no_token" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
