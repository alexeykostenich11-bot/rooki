import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { LIMITS, STATUS_LABEL } from "@/lib/catalog";
import { query } from "@/lib/db";
import { publicUrl, thumbKey } from "@/lib/storage";
import { StatusBadge, btnCls, cardCls } from "../../components/ui";
import { createProject } from "../actions";

export default async function ProjectsPage() {
  const user = await requireUser(["master"]);
  const rows = await query<{
    id: string; title: string; status: keyof typeof STATUS_LABEL; cover: string | null; photos: string;
  }>(
    `select p.id, p.title, p.status,
            (select storage_key from project_photos where project_id = p.id order by sort limit 1) as cover,
            (select count(*) from project_photos where project_id = p.id) as photos
       from projects p where p.master_id = $1 order by p.created_at desc`,
    [user.id]
  );

  return (
    <div className="space-y-4">
      <div className={cardCls}>
        <h2 className="text-lg font-semibold">Ваши проекты</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Покажите выполненные работы: фото, площадь, срок, что делали. Проекты с хорошими фото заказчики открывают чаще всего.
        </p>
        {rows.length < LIMITS.maxProjects && (
          <form action={createProject}>
            <button className={`${btnCls} mt-5`}>+ Добавить проект</button>
          </form>
        )}
      </div>

      {rows.length === 0 && (
        <div className="rounded-3xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
          Проектов пока нет. Добавьте первый.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map((r) => (
          <Link key={r.id} href={`/cabinet/projects/${r.id}`}
            className="group overflow-hidden rounded-3xl border border-neutral-200/80 bg-white transition-all hover:border-neutral-300 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.12)]">
            <div className="aspect-[4/3] bg-neutral-100">
              {r.cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={publicUrl(thumbKey(r.cover))} alt="" className="h-full w-full object-cover" loading="lazy" />
              )}
            </div>
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-neutral-950">{r.title}</p>
                <p className="text-xs text-neutral-400">Фото: {r.photos}</p>
              </div>
              <StatusBadge status={r.status} label={STATUS_LABEL[r.status]} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
