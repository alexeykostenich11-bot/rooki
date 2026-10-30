import { NextResponse } from "next/server";
import { sendToAll } from "@/lib/telegram";
import { leadMessage, parseLead } from "@/lib/contact";
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host") || new URL(request.url).host;
  if (origin) {
    let originHost = "";
    try { originHost = new URL(origin).host; } catch {}
    if (originHost !== host) return NextResponse.json({ error: "Недопустимый источник запроса." }, { status: 403 });
  }
  if (Number(request.headers.get("content-length") || 0) > 12000) return NextResponse.json({ error: "Заявка слишком большая." }, { status: 413 });
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 12000) return NextResponse.json({ error: "Заявка слишком большая." }, { status: 413 });
    body = JSON.parse(text);
  } catch { return NextResponse.json({ error: "Не удалось прочитать заявку." }, { status: 400 }); }
  const parsed = parseLead(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    const results = await sendToAll(leadMessage(parsed.lead));
    if (!results.some(Boolean)) return NextResponse.json({ error: "Не удалось доставить заявку. Позвоните Алексею или напишите в мессенджер." }, { status: 502 });
    return NextResponse.json({ success: true });
  } catch {
    console.error("[contact] delivery unavailable");
    return NextResponse.json({ error: "Сервис заявок временно недоступен. Позвоните Алексею или напишите в мессенджер." }, { status: 503 });
  }
}
