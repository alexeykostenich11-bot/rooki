import { NextResponse } from "next/server";
import { sendToAll } from "@/lib/telegram";



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

    try {
      await sendToAll(message);
    } catch {
      return NextResponse.json(
        { error: "Telegram token not found" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
