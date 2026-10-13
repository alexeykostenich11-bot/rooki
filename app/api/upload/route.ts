import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { LIMITS } from "@/lib/catalog";
import { one, query } from "@/lib/db";
import { processAvatar, processPhoto } from "@/lib/images";
import { hit } from "@/lib/ratelimit";
import { deleteObject, putObject, publicUrl, thumbKey } from "@/lib/storage";

export const dynamic = "force-dynamic";

const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(request: Request) {
  // Защита от запросов с чужих сайтов
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return fail("Запрос отклонён", 403);

  const user = await getCurrentUser();
  if (!user || user.role !== "master") return fail("Войдите как мастер", 401);
  if (!hit(`upload:${user.id}`, 80, 60 * 60 * 1000)) return fail("Слишком много загрузок, попробуйте позже", 429);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Не удалось прочитать файл");
  }
  const file = form.get("file");
  const kind = String(form.get("kind") ?? "");
  if (!(file instanceof File) || file.size === 0) return fail("Выберите файл");
  if (file.size > LIMITS.maxUploadBytes) return fail("Файл больше 10 МБ. Уменьшите фото и повторите.");

  const buffer = Buffer.from(await file.arrayBuffer());
  const id = crypto.randomUUID();

  try {
    if (kind === "avatar") {
      const { full } = await processAvatar(buffer);
      const key = `avatars/${user.id}/${id}.webp`;
      await putObject(key, full, "image/webp");
      const old = await one<{ avatar_key: string | null }>("select avatar_key from master_profiles where user_id = $1", [user.id]);
      await query("update master_profiles set avatar_key = $2, updated_at = now() where user_id = $1", [user.id, key]);
      if (old?.avatar_key) await deleteObject(old.avatar_key);
      return NextResponse.json({ ok: true, url: publicUrl(key) });
    }

    if (kind === "project") {
      const projectId = String(form.get("projectId") ?? "");
      if (!/^[0-9a-f-]{36}$/i.test(projectId)) return fail("Проект не найден");
      const project = await one<{ id: string; status: string; n: string }>(
        `select p.id, p.status, (select count(*) from project_photos where project_id = p.id) as n
           from projects p where p.id = $1 and p.master_id = $2`,
        [projectId, user.id]
      );
      if (!project) return fail("Проект не найден", 404);
      if (Number(project.n) >= LIMITS.maxPhotosPerProject) {
        return fail(`В проекте не больше ${LIMITS.maxPhotosPerProject} фото`);
      }
      const { full, thumb } = await processPhoto(buffer);
      const key = `projects/${projectId}/${id}.webp`;
      await putObject(key, full, "image/webp");
      await putObject(thumbKey(key), thumb, "image/webp");
      await query(
        `insert into project_photos (project_id, storage_key, sort)
         values ($1, $2, coalesce((select max(sort) + 1 from project_photos where project_id = $1), 0))`,
        [projectId, key]
      );
      // Новое фото в опубликованном проекте отправляет проект на повторную проверку
      if (project.status === "approved") {
        await query("update projects set status = 'pending', updated_at = now() where id = $1", [projectId]);
      }
      return NextResponse.json({ ok: true, url: publicUrl(thumbKey(key)) });
    }

    return fail("Неизвестный тип загрузки");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.startsWith("Подойдут")) return fail(msg);
    console.error("Ошибка загрузки", e);
    return fail("Не удалось обработать фото. Попробуйте другой файл (JPG или PNG).", 422);
  }
}
