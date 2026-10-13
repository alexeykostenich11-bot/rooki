import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Нужен шапке сайта: показать «Войти» или «Кабинет», не делая все страницы динамическими. */
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(
    user ? { name: user.display_name, role: user.role } : {},
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
