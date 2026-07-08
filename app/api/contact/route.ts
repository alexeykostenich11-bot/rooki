import { NextResponse } from "next/server";

const CHAT_IDS = [
  process.env.TELEGRAM_CHAT_ID_1 || "7723673046", // Алексей
  process.env.TELEGRAM_CHAT_ID_2 || "8733658390", // Друг
  process.env.TELEGRAM_CHAT_ID_3 || "-1003636377506", // Группа
  process.env.TELEGRAM_CHAT_ID_4, // Четвёртый (если добавишь)
].filter(Boolean) as string[];

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const message = `
🔥 Новая заявка с сайта ROOKI

👤 Имя: ${data.name || "-"}
📞 Телефон: ${data.phone || "-"}
🏠 Тип объекта: ${data.objectType || "-"}
📐 Площадь: ${data.area || "-"}
📍 Район / Метро: ${data.location || "-"}

💬 Комментарий:
${data.comment || "-"}
`;

    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "Telegram token not found" },
        { status: 500 }
      );
    }

    await Promise.all(
      CHAT_IDS.map((chatId) =>
        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
          }),
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}