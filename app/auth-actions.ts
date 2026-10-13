"use server";

import { redirect } from "next/navigation";
import {
  EMAIL_RE,
  clientIp,
  createSession,
  destroySession,
  hashPassword,
  purgeExpiredSessions,
  verifyPassword,
} from "@/lib/auth";
import { one, tx } from "@/lib/db";
import { hit, reset } from "@/lib/ratelimit";
import { notifyAdmins } from "@/lib/telegram";

export type FormState = { error?: string };

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

// Заглушка, чтобы время ответа не выдавало, есть ли такая почта
const DUMMY_HASH = hashPassword("dummy-password-for-timing");

export async function signup(_: FormState, fd: FormData): Promise<FormState> {
  if (str(fd, "website")) redirect("/"); // ловушка для ботов

  const ip = await clientIp();
  if (!hit(`signup:${ip}`, 8, 60 * 60 * 1000)) {
    return { error: "Слишком много попыток. Попробуйте через час." };
  }

  const role = str(fd, "role") === "master" ? "master" : "customer";
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");

  if (name.length < 2 || name.length > 60) return { error: "Укажите имя, от 2 до 60 символов" };
  if (!EMAIL_RE.test(email) || email.length > 120) return { error: "Проверьте адрес почты" };
  if (password.length < 8 || password.length > 100) {
    return { error: "Пароль должен быть от 8 символов" };
  }
  if (fd.get("consent") !== "on") {
    return { error: "Нужно согласие на обработку персональных данных" };
  }

  let userId: string;
  try {
    userId = await tx(async (c) => {
      const res = await c.query(
        `insert into users (email, password_hash, role, display_name, consent_at)
         values ($1, $2, $3, $4, now()) returning id`,
        [email, hashPassword(password), role, name]
      );
      const id = res.rows[0].id as string;
      if (role === "master") await c.query("insert into master_profiles (user_id) values ($1)", [id]);
      return id;
    });
  } catch (e) {
    if ((e as { code?: string }).code === "23505") {
      return { error: "Эта почта уже зарегистрирована. Войдите или восстановите доступ у администратора." };
    }
    console.error(e);
    return { error: "Не получилось создать аккаунт. Попробуйте ещё раз." };
  }

  await createSession(userId);
  void notifyAdmins(`🆕 Новый ${role === "master" ? "МАСТЕР" : "заказчик"} на сайте: ${name} (${email})`);
  redirect("/cabinet");
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const ip = await clientIp();
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const key = `login:${ip}:${email}`;

  if (!hit(key, 8, 15 * 60 * 1000)) {
    return { error: "Слишком много попыток входа. Подождите 15 минут." };
  }

  const user = await one<{ id: string; password_hash: string; role: string }>(
    "select id, password_hash, role from users where lower(email) = $1",
    [email]
  );
  const ok = verifyPassword(password, user?.password_hash ?? DUMMY_HASH) && Boolean(user);
  if (!ok || !user) return { error: "Неверная почта или пароль" };

  reset(key);
  if (Math.random() < 0.05) await purgeExpiredSessions();
  await createSession(user.id);

  const next = str(fd, "next");
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : null;
  redirect(safeNext ?? (user.role === "admin" ? "/admin" : "/cabinet"));
}

export async function logout() {
  await destroySession();
  redirect("/");
}
