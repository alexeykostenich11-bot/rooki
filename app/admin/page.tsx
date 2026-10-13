import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { publicUrl, thumbKey } from "@/lib/storage";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { btnCls, cardCls, inputCls } from "../components/ui";
import { approveProfile, approveProject, rejectProfile, rejectProject } from "./actions";

export const metadata: Metadata = { title: "Проверка анкет", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const rub = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

function RejectForm({ action }: { action: (fd: FormData) => Promise<void> }) {
  return (
    <form action={action} className="flex flex-1 gap-2">
      <input name="reason" placeholder="Причина отказа (увидит мастер)" className={`${inputCls} h-11`} />
      <button className="h-11 shrink-0 rounded-full border border-red-200 px-4 text-sm text-red-700 hover:bg-red-50">Отклонить</button>
    </form>
  );
}

export default async function AdminPage() {
  await requireUser(["admin"]);

  const profiles = await query<{
    user_id: string; display_name: string; email: string; specialties: string[]; experience_years: number | null;
    city: string; districts: string; team_type: string; about: string;
  }>(
    `select mp.user_id, u.display_name, u.email, mp.specialties, mp.experience_years, mp.city, mp.districts, mp.team_type, mp.about
       from master_profiles mp join users u on u.id = mp.user_id
      where mp.status = 'pending' order by mp.submitted_at`
  );
  const prices = profiles.length
    ? await query<{ master_id: string; work_name: string; unit: string; price_from: number }>(
        "select master_id, work_name, unit, price_from from master_prices where master_id = any($1) order by sort", [profiles.map((p) => p.user_id)]
      )
    : [];

  const projects = await query<{
    id: string; title: string; description: string; area_m2: string | null; duration_days: number | null;
    price_total: number | null; display_name: string;
  }>(
    `select p.id, p.title, p.description, p.area_m2, p.duration_days, p.price_total, u.display_name
       from projects p join users u on u.id = p.master_id where p.status = 'pending' order by p.updated_at`
  );
  const photos = projects.length
    ? await query<{ project_id: string; storage_key: string }>(
        "select project_id, storage_key from project_photos where project_id = any($1) order by sort", [projects.map((p) => p.id)]
      )
    : [];

  const published = await query<{ user_id: string; display_name: string; email: string }>(
    `select mp.user_id, u.display_name, u.email from master_profiles mp join users u on u.id = mp.user_id
      where mp.status = 'approved' order by mp.reviewed_at desc nulls last limit 30`
  );

  return (
    <>
      <Header />
      <main className="pt-16 md:pt-[4.5rem]">
        <section className="section-padding">
          <div className="mx-auto w-full max-w-4xl space-y-10 px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Проверка</h1>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Анкеты на проверке ({profiles.length})</h2>
              {profiles.length === 0 && <p className="text-sm text-neutral-500">Новых анкет нет.</p>}
              {profiles.map((p) => (
                <div key={p.user_id} className={cardCls}>
                  <p className="text-lg font-semibold">{p.display_name} <span className="text-sm font-normal text-neutral-400">{p.email}</span></p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {p.specialties.join(", ")} · {p.team_type === "crew" ? "бригада" : "один"} · опыт {p.experience_years ?? "не указан"} · {p.districts || p.city}
                  </p>
                  <p className="mt-3 whitespace-pre-line text-sm text-neutral-700">{p.about}</p>
                  <ul className="mt-3 space-y-1 text-sm text-neutral-600">
                    {prices.filter((x) => x.master_id === p.user_id).map((x, i) => (
                      <li key={i}>{x.work_name}: от {rub(x.price_from)} ₽ / {x.unit}</li>
                    ))}
                  </ul>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <form action={approveProfile.bind(null, p.user_id)}><button className={`${btnCls} h-11`}>Одобрить</button></form>
                    <RejectForm action={rejectProfile.bind(null, p.user_id)} />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Проекты на проверке ({projects.length})</h2>
              {projects.length === 0 && <p className="text-sm text-neutral-500">Новых проектов нет.</p>}
              {projects.map((p) => (
                <div key={p.id} className={cardCls}>
                  <p className="text-lg font-semibold">{p.title} <span className="text-sm font-normal text-neutral-400">{p.display_name}</span></p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {[p.area_m2 && `${Number(p.area_m2)} м²`, p.duration_days && `${p.duration_days} дн.`, p.price_total != null && `работы ${rub(p.price_total)} ₽`].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-3 whitespace-pre-line text-sm text-neutral-700">{p.description}</p>
                  <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {photos.filter((ph) => ph.project_id === p.id).map((ph) => (
                      <a key={ph.storage_key} href={publicUrl(ph.storage_key)} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={publicUrl(thumbKey(ph.storage_key))} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" loading="lazy" />
                      </a>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <form action={approveProject.bind(null, p.id)}><button className={`${btnCls} h-11`}>Одобрить</button></form>
                    <RejectForm action={rejectProject.bind(null, p.id)} />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Опубликованные мастера</h2>
              {published.length === 0 && <p className="text-sm text-neutral-500">Пока никого.</p>}
              {published.map((p) => (
                <div key={p.user_id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-neutral-200/80 bg-white p-4">
                  <div>
                    <Link href={`/masters/${p.user_id}`} className="font-medium underline">{p.display_name}</Link>
                    <span className="ml-2 text-sm text-neutral-400">{p.email}</span>
                  </div>
                  <RejectForm action={rejectProfile.bind(null, p.user_id)} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
