"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { LIMITS, SPECIALTIES, UNITS } from "@/lib/catalog";
import { one, query, tx } from "@/lib/db";
import { deleteObject, thumbKey } from "@/lib/storage";
import { notifyAdmins } from "@/lib/telegram";

export type SaveState = { error?: string; ok?: boolean };

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const intOrNull = (v: string, min: number, max: number) => {
  if (!v) return null;
  const n = Number(v.replace(",", "."));
  if (!Number.isFinite(n) || n < min || n > max) return NaN;
  return Math.round(n);
};
const numOrNull = (v: string, min: number, max: number) => {
  if (!v) return null;
  const n = Number(v.replace(",", "."));
  if (!Number.isFinite(n) || n < min || n > max) return NaN;
  return Math.round(n * 10) / 10;
};

/* ======================= Профиль и цены ======================= */

export async function saveProfile(_: SaveState, fd: FormData): Promise<SaveState> {
  const user = await requireUser(["master"]);

  const name = str(fd, "display_name");
  const specialties = fd.getAll("specialties").map(String).filter((s) => (SPECIALTIES as readonly string[]).includes(s));
  const exp = intOrNull(str(fd, "experience_years"), 0, 60);
  const city = str(fd, "city") || "Москва";
  const districts = str(fd, "districts");
  const team = str(fd, "team_type") === "crew" ? "crew" : "solo";
  const about = str(fd, "about");

  if (name.length < 2 || name.length > 60) return { error: "Укажите имя, от 2 до 60 символов" };
  if (Number.isNaN(exp)) return { error: "Опыт укажите числом лет от 0 до 60" };
  if (city.length > 80 || districts.length > 300) return { error: "Слишком длинный текст в поле города или районов" };
  if (about.length > LIMITS.aboutMax) return { error: `О себе: не больше ${LIMITS.aboutMax} символов` };

  const names = fd.getAll("price_name").map((v) => String(v).trim());
  const units = fd.getAll("price_unit").map(String);
  const amounts = fd.getAll("price_from").map((v) => String(v).trim());
  const prices: { name: string; unit: string; price: number }[] = [];
  for (let i = 0; i < names.length; i++) {
    if (!names[i] && !amounts[i]) continue;
    const price = Number(amounts[i]);
    if (!names[i] || names[i].length > 100) return { error: `Цены, строка ${i + 1}: укажите название работы` };
    if (!(UNITS as readonly string[]).includes(units[i])) return { error: `Цены, строка ${i + 1}: выберите единицу` };
    if (!Number.isInteger(price) || price < 0 || price > 10_000_000) {
      return { error: `Цены, строка ${i + 1}: цена должна быть целым числом в рублях` };
    }
    prices.push({ name: names[i], unit: units[i], price });
  }
  if (prices.length > LIMITS.maxPrices) return { error: `Не больше ${LIMITS.maxPrices} строк в прайсе` };

  const before = await one<{ status: string }>("select status from master_profiles where user_id = $1", [user.id]);

  await tx(async (c) => {
    await c.query("update users set display_name = $2 where id = $1", [user.id, name]);
    await c.query(
      `update master_profiles
          set specialties = $2, experience_years = $3, city = $4, districts = $5,
              team_type = $6, about = $7, updated_at = now(),
              status = case when status = 'rejected' then 'draft' else status end
        where user_id = $1`,
      [user.id, specialties, exp, city, districts, team, about]
    );
    await c.query("delete from master_prices where master_id = $1", [user.id]);
    for (let i = 0; i < prices.length; i++) {
      await c.query(
        "insert into master_prices (master_id, work_name, unit, price_from, sort) values ($1, $2, $3, $4, $5)",
        [user.id, prices[i].name, prices[i].unit, prices[i].price, i]
      );
    }
  });

  if (before?.status === "approved") {
    void notifyAdmins(`✏️ Мастер обновил опубликованную анкету: ${name}\n${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/masters/${user.id}`);
  }
  revalidatePath("/cabinet", "layout");
  revalidatePath("/masters");
  return { ok: true };
}

export async function submitProfile() {
  const user = await requireUser(["master"]);
  const p = await one<{ status: string; about: string; specialties: string[]; n: string }>(
    `select status, about, specialties,
            (select count(*) from master_prices where master_id = $1) as n
       from master_profiles where user_id = $1`,
    [user.id]
  );
  if (!p) redirect("/cabinet");
  const ready = p.about.length >= LIMITS.aboutMin && p.specialties.length > 0 && Number(p.n) > 0;
  if (ready && (p.status === "draft" || p.status === "rejected")) {
    await query(
      "update master_profiles set status = 'pending', submitted_at = now(), reject_reason = null where user_id = $1",
      [user.id]
    );
    void notifyAdmins(`🧰 Анкета мастера на проверке: ${user.display_name} (${user.email})`);
  }
  revalidatePath("/cabinet", "layout");
  redirect("/cabinet");
}

export async function removeAvatar() {
  const user = await requireUser(["master"]);
  const row = await one<{ avatar_key: string | null }>("select avatar_key from master_profiles where user_id = $1", [user.id]);
  if (row?.avatar_key) {
    await deleteObject(row.avatar_key);
    await query("update master_profiles set avatar_key = null, updated_at = now() where user_id = $1", [user.id]);
  }
  revalidatePath("/cabinet", "layout");
}

/* ======================= Проекты ======================= */

async function ownProject(userId: string, projectId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(projectId)) return null;
  return one<{ id: string; status: string }>("select id, status from projects where id = $1 and master_id = $2", [projectId, userId]);
}

export async function createProject() {
  const user = await requireUser(["master"]);
  const n = await one<{ n: string }>("select count(*) as n from projects where master_id = $1", [user.id]);
  if (Number(n?.n ?? 0) >= LIMITS.maxProjects) redirect("/cabinet/projects");
  const row = await one<{ id: string }>(
    "insert into projects (master_id, title) values ($1, 'Новый проект') returning id",
    [user.id]
  );
  redirect(`/cabinet/projects/${row!.id}`);
}

export async function saveProject(projectId: string, _: SaveState, fd: FormData): Promise<SaveState> {
  const user = await requireUser(["master"]);
  const project = await ownProject(user.id, projectId);
  if (!project) return { error: "Проект не найден" };

  const title = str(fd, "title");
  const description = str(fd, "description");
  const area = numOrNull(str(fd, "area_m2"), 1, 5000);
  const days = intOrNull(str(fd, "duration_days"), 1, 1500);
  const total = intOrNull(str(fd, "price_total"), 0, 1_000_000_000);

  if (title.length < 3 || title.length > 100) return { error: "Название проекта: от 3 до 100 символов" };
  if (description.length > LIMITS.projectDescMax) return { error: `Описание: не больше ${LIMITS.projectDescMax} символов` };
  if (Number.isNaN(area)) return { error: "Площадь укажите числом, например 54.5" };
  if (Number.isNaN(days)) return { error: "Срок укажите числом дней" };
  if (Number.isNaN(total)) return { error: "Стоимость работ укажите числом в рублях" };

  await query(
    `update projects
        set title = $2, description = $3, area_m2 = $4, duration_days = $5, price_total = $6,
            updated_at = now(),
            status = case when status in ('approved', 'rejected') then 'pending' else status end
      where id = $1`,
    [projectId, title, description, area, days, total]
  );
  if (project.status === "approved") {
    void notifyAdmins(`✏️ Проект изменён и ждёт повторной проверки: «${title}» (${user.display_name})`);
  }
  revalidatePath("/cabinet", "layout");
  revalidatePath("/masters");
  return { ok: true };
}

export async function submitProject(projectId: string) {
  const user = await requireUser(["master"]);
  const project = await ownProject(user.id, projectId);
  if (!project) redirect("/cabinet/projects");
  const row = await one<{ title: string; description: string; photos: string }>(
    `select title, description, (select count(*) from project_photos where project_id = $1) as photos
       from projects where id = $1`,
    [projectId]
  );
  const ready = row && row.title !== "Новый проект" && row.description.length >= 20 && Number(row.photos) > 0;
  if (ready && (project.status === "draft" || project.status === "rejected")) {
    await query("update projects set status = 'pending', reject_reason = null, updated_at = now() where id = $1", [projectId]);
    void notifyAdmins(`📸 Проект на проверке: «${row.title}» (${user.display_name})`);
  }
  revalidatePath("/cabinet", "layout");
  redirect(`/cabinet/projects/${projectId}`);
}

export async function deleteProject(projectId: string) {
  const user = await requireUser(["master"]);
  const project = await ownProject(user.id, projectId);
  if (!project) redirect("/cabinet/projects");
  const photos = await query<{ storage_key: string }>("select storage_key from project_photos where project_id = $1", [projectId]);
  await query("delete from projects where id = $1", [projectId]);
  for (const p of photos) {
    await deleteObject(p.storage_key);
    await deleteObject(thumbKey(p.storage_key));
  }
  revalidatePath("/cabinet", "layout");
  revalidatePath("/masters");
  redirect("/cabinet/projects");
}

export async function deletePhoto(photoId: string) {
  const user = await requireUser(["master"]);
  if (!/^[0-9a-f-]{36}$/i.test(photoId)) return;
  const row = await one<{ storage_key: string; project_id: string }>(
    `select ph.storage_key, ph.project_id
       from project_photos ph join projects p on p.id = ph.project_id
      where ph.id = $1 and p.master_id = $2`,
    [photoId, user.id]
  );
  if (!row) return;
  await query("delete from project_photos where id = $1", [photoId]);
  await deleteObject(row.storage_key);
  await deleteObject(thumbKey(row.storage_key));
  // Проект без фото не может оставаться опубликованным
  await query(
    `update projects set status = 'draft', updated_at = now()
      where id = $1 and status in ('approved', 'pending')
        and not exists (select 1 from project_photos where project_id = $1)`,
    [row.project_id]
  );
  revalidatePath("/cabinet", "layout");
  revalidatePath("/masters");
}
