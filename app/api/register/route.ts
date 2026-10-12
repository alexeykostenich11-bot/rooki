import { NextResponse } from "next/server";

const CHAT_IDS = [
  process.env.TELEGRAM_CHAT_ID_1 || "7723673046", // Алексей
  process.env.TELEGRAM_CHAT_ID_2 || "8733658390", // Друг
  process.env.TELEGRAM_CHAT_ID_3 || "-1003636377506", // Группа
  process.env.TELEGRAM_CHAT_ID_4,
].filter(Boolean) as string[];

const clean = (v: unknown, max = 500) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Ловушка для ботов: настоящие люди это поле не видят и не заполняют
    if (clean(data.website)) return NextResponse.json({ success: true });

    const role = data.role === "master" ? "master" : "customer";
    const name = clean(data.name, 100);
    const phone = clean(data.phone, 30);

    if (!name || phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { success: false, error: "Укажите имя и телефон" },
        { status: 400 }
      );
    }

    const fields =
      role === "master"
        ? {
            "Специальность": clean(data.specialty, 100),
            "Опыт": clean(data.experience, 50),
            "Город / район": clean(data.city, 100),
            "Бригада": clean(data.team, 50),
            "О себе": clean(data.comment, 1000),
          }
        : {
            "Тип объекта": clean(data.objectType, 100),
            "Площадь": clean(data.area, 50),
            "Район / метро": clean(data.city, 100),
            "Когда начать": clean(data.startDate, 100),
            "Комментарий": clean(data.comment, 1000),
          };

    const title =
      role === "master"
        ? "🧰 Новая регистрация МАСТЕРА"
        : "🏠 Новая регистрация ЗАКАЗЧИКА";

    const message =
      `${title}\n\n👤 Имя: ${name}\n📞 Телефон: ${phone}\n` +
      Object.entries(fields)
        .map(([k, v]) => `${k}: ${v || "-"}`)
        .join("\n");

    const tasks: Promise<Response>[] = [];

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token) {
      for (const chatId of CHAT_IDS) {
        tasks.push(
          fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: message }),
          })
        );
      }
    }

    // Google Таблица через Apps Script (см. docs/google-sheets-register.md)
    const sheetUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (sheetUrl) {
      tasks.push(
        fetch(sheetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: new Date().toLocaleString("ru-RU", {
              timeZone: "Europe/Moscow",
            }),
            role: role === "master" ? "Мастер" : "Заказчик",
            name,
            phone,
            ...fields,
          }),
        })
      );
    }

    if (tasks.length === 0) {
      return NextResponse.json(
        { success: false, error: "Не настроены Telegram и Google Таблица" },
        { status: 500 }
      );
    }

    const results = await Promise.allSettled(tasks);
    const ok = results.some((r) => r.status === "fulfilled" && r.value.ok);
    if (!ok) {
      return NextResponse.json({ success: false }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
