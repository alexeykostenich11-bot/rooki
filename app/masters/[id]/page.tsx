import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { one, query } from "@/lib/db";
import { publicUrl, thumbKey } from "@/lib/storage";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { MasterRequest } from "../../components/MasterRequest";
import { cardCls } from "../../components/ui";

export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f-]{36}$/i;

type Master = {
  id: string; display_name: string; specialties: string[]; experience_years: number | null; city: string;
  districts: string; team_type: string; about: string; avatar_key: string | null;
};

async function load(id: string) {
  if (!UUID.test(id)) return null;
  return one<Master>(
    `select u.id, u.display_name, mp.specialties, mp.experience_years, mp.city, mp.districts, mp.team_type, mp.about, mp.avatar_key
       from master_profiles mp join users u on u.id = mp.user_id
      where mp.user_id = $1 and mp.status = 'approved'`,
    [id]
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const m = await load(id).catch(() => null);
  if (!m) return { title: "Мастер не найден" };
  return { title: `${m.display_name}: ${m.specialties[0] ?? "мастер по ремонту"}`, description: m.about.slice(0, 160) };
}

const rub = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

export default async function MasterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await load(id);
  if (!m) notFound();

  const prices = await query<{ work_name: string; unit: string; price_from: number }>(
    "select work_name, unit, price_from from master_prices where master_id = $1 order by sort", [id]
  );
  const projects = await query<{
    id: string; title: string; description: string; area_m2: string | null; duration_days: number | null; price_total: number | null;
  }>(
    `select id, title, description, area_m2, duration_days, price_total
       from projects where master_id = $1 and status = 'approved' order by created_at desc`, [id]
  );
  const photos = projects.length
    ? await query<{ project_id: string; storage_key: string }>(
        "select project_id, storage_key from project_photos where project_id = any($1) order by sort", [projects.map((p) => p.id)]
      )
    : [];

  return (
    <>
      <Header />
      <main className="pt-16 md:pt-[4.5rem]">
        <section className="section-padding">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8">
            <Link href="/masters" className="text-sm text-neutral-500 hover:text-neutral-950">← Все мастера</Link>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
              <div className="space-y-6">
                <div className={cardCls}>
                  <div className="flex items-center gap-4">
                    {m.avatar_key ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={publicUrl(m.avatar_key)} alt={m.display_name} className="h-20 w-20 rounded-3xl object-cover" />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-neutral-100 text-2xl text-neutral-400">{m.display_name.slice(0, 1).toUpperCase()}</div>
                    )}
                    <div>
                      <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">{m.display_name}</h1>
                      <p className="text-sm text-neutral-500">
                        {m.team_type === "crew" ? "Бригада" : "Мастер"}
                        {m.experience_years != null ? ` · опыт ${m.experience_years} лет` : ""} · {m.districts || m.city}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {m.specialties.map((s) => <span key={s} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">{s}</span>)}
                  </div>
                  {m.about && <p className="mt-5 whitespace-pre-line text-neutral-700">{m.about}</p>}
                </div>

                {prices.length > 0 && (
                  <div className={cardCls}>
                    <h2 className="mb-4 text-lg font-semibold">Цены на работы</h2>
                    <dl className="divide-y divide-neutral-100">
                      {prices.map((p, i) => (
                        <div key={i} className="flex items-baseline justify-between gap-4 py-3">
                          <dt className="text-neutral-700">{p.work_name}</dt>
                          <dd className="shrink-0 font-semibold text-neutral-950">от {rub(p.price_from)} ₽ / {p.unit}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-3 text-xs text-neutral-400">Цены ориентировочные, без материалов. Точная стоимость зависит от объекта.</p>
                  </div>
                )}

                {projects.map((p) => (
                  <div key={p.id} className={cardCls}>
                    <h2 className="text-lg font-semibold">{p.title}</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      {[p.area_m2 && `${Number(p.area_m2)} м²`, p.duration_days && `${p.duration_days} дн.`, p.price_total != null && `работы ${rub(p.price_total)} ₽`].filter(Boolean).join(" · ")}
                    </p>
                    {p.description && <p className="mt-3 whitespace-pre-line text-neutral-700">{p.description}</p>}
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {photos.filter((ph) => ph.project_id === p.id).map((ph, i) => (
                        <a key={ph.storage_key} href={publicUrl(ph.storage_key)} target="_blank" rel="noopener noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={publicUrl(thumbKey(ph.storage_key))} alt={`${p.title}, фото ${i + 1}`} className="aspect-[4/3] w-full rounded-2xl object-cover" loading="lazy" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <aside className="lg:sticky lg:top-24 lg:self-start">
                <MasterRequest masterName={m.display_name} masterId={m.id} />
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
