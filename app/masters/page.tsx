import type { Metadata } from "next";
import Link from "next/link";
import { SPECIALTIES } from "@/lib/catalog";
import { query } from "@/lib/db";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { MasterCard, type MasterCardData } from "../components/MasterCard";
import { btnCls, btnGhostCls, inputCls } from "../components/ui";

export const metadata: Metadata = {
  title: "Мастера",
  description: "Каталог проверенных мастеров по ремонту: фото работ, цены и опыт.",
};
export const dynamic = "force-dynamic";

const PAGE = 24;
const SORTS: Record<string, string> = {
  new: "mp.reviewed_at desc nulls last",
  price: "min_price asc nulls last",
  projects: "projects_n desc, mp.reviewed_at desc nulls last",
};

export default async function MastersPage({
  searchParams,
}: {
  searchParams: Promise<{ spec?: string; q?: string; sort?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const spec = (SPECIALTIES as readonly string[]).includes(sp.spec ?? "") ? sp.spec! : "";
  const q = (sp.q ?? "").trim().slice(0, 60);
  const sort = SORTS[sp.sort ?? ""] ? sp.sort! : "new";
  const page = Math.max(1, Number(sp.page) || 1);

  const params: unknown[] = [];
  const where = ["mp.status = 'approved'"];
  if (spec) { params.push(spec); where.push(`$${params.length} = any(mp.specialties)`); }
  if (q) { params.push(`%${q.replace(/[%_]/g, "")}%`); where.push(`(mp.districts ilike $${params.length} or mp.city ilike $${params.length})`); }
  params.push(PAGE + 1, (page - 1) * PAGE);

  let rows: MasterCardData[] = [];
  let failed = false;
  try {
    rows = await query<MasterCardData>(
      `select u.id, u.display_name, mp.specialties, mp.experience_years, mp.city, mp.districts, mp.team_type, mp.avatar_key,
              (select min(price_from) from master_prices where master_id = mp.user_id) as min_price,
              (select count(*) from projects pr where pr.master_id = mp.user_id and pr.status = 'approved') as projects_n,
              (select ph.storage_key from projects pr join project_photos ph on ph.project_id = pr.id
                where pr.master_id = mp.user_id and pr.status = 'approved'
                order by pr.created_at desc, ph.sort limit 1) as cover
         from master_profiles mp join users u on u.id = mp.user_id
        where ${where.join(" and ")}
        order by ${SORTS[sort]}
        limit $${params.length - 1} offset $${params.length}`,
      params
    );
  } catch (e) {
    console.error(e);
    failed = true;
  }
  const hasNext = rows.length > PAGE;
  const list = rows.slice(0, PAGE);
  const qs = (p: number) => {
    const u = new URLSearchParams();
    if (spec) u.set("spec", spec);
    if (q) u.set("q", q);
    if (sort !== "new") u.set("sort", sort);
    if (p > 1) u.set("page", String(p));
    const s = u.toString();
    return s ? `/masters?${s}` : "/masters";
  };

  return (
    <>
      <Header />
      <main className="pt-16 md:pt-[4.5rem]">
        <section className="section-padding">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8">
            <header className="mb-8">
              <p className="mb-3 text-xs font-medium tracking-wide text-neutral-400 uppercase sm:text-sm">Каталог</p>
              <h1 className="max-w-2xl text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl md:text-4xl">Мастера по ремонту</h1>
              <p className="mt-3 max-w-xl text-neutral-500">Фото реальных работ, цены и опыт. Все анкеты проверяет команда ROOKI.</p>
            </header>

            <form className="mb-8 grid gap-3 sm:grid-cols-[1fr_1fr_12rem_auto]">
              <select name="spec" defaultValue={spec} className={inputCls} aria-label="Специальность">
                <option value="">Все специальности</option>
                {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <input name="q" defaultValue={q} placeholder="Район или метро" className={inputCls} aria-label="Район" />
              <select name="sort" defaultValue={sort} className={inputCls} aria-label="Сортировка">
                <option value="new">Сначала новые</option>
                <option value="price">Сначала дешевле</option>
                <option value="projects">Больше проектов</option>
              </select>
              <button className={btnCls}>Найти</button>
            </form>

            {failed ? (
              <p className="rounded-3xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">Каталог временно недоступен. Попробуйте позже.</p>
            ) : list.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-neutral-300 p-10 text-center">
                <p className="text-neutral-600">{spec || q ? "По этим условиям мастеров пока нет." : "Каталог только запускается. Первые мастера появятся здесь совсем скоро."}</p>
                <Link href="/signup?role=master" className={`${btnCls} mt-5`}>Я мастер, хочу в каталог</Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((m) => <MasterCard key={m.id} m={m} />)}
              </div>
            )}

            {(page > 1 || hasNext) && (
              <div className="mt-8 flex justify-center gap-3">
                {page > 1 && <Link href={qs(page - 1)} className={btnGhostCls}>← Назад</Link>}
                {hasNext && <Link href={qs(page + 1)} className={btnGhostCls}>Дальше →</Link>}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
