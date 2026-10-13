import "server-only";
import crypto from "node:crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { one, query } from "./db";

export const SESSION_COOKIE = "rk_session";
const SESSION_DAYS = 30;

export type Role = "master" | "customer" | "admin";
export type CurrentUser = {
  id: string;
  email: string;
  role: Role;
  display_name: string;
};

/* ---------- пароли ---------- */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = crypto.scryptSync(password, Buffer.from(saltB64, "base64"), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

/* ---------- сессии ---------- */

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000);
  await query("insert into sessions (user_id, token_hash, expires_at) values ($1, $2, $3)", [
    userId,
    sha256(token),
    expires,
  ]);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Secure-cookie работает только по HTTPS; если сайт временно открыт по http, не включаем
    secure: process.env.NODE_ENV === "production" && !(process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("http://"),
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await query("delete from sessions where token_hash = $1", [sha256(token)]);
  store.delete(SESSION_COOKIE);
}

/** Текущий пользователь или null. В пределах одного запроса запрос в БД делается один раз. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return one<CurrentUser>(
    `select u.id, u.email, u.role, u.display_name
       from sessions s join users u on u.id = s.user_id
      where s.token_hash = $1 and s.expires_at > now()`,
    [sha256(token)]
  );
});

export async function requireUser(roles?: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect("/cabinet");
  return user;
}

/* ---------- прочее ---------- */

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Чистит просроченные сессии. Вызывается изредка при входе. */
export async function purgeExpiredSessions() {
  await query("delete from sessions where expires_at < now()");
}
