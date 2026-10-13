import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { LIMITS, STATUS_LABEL } from "@/lib/catalog";
import { one, query } from "@/lib/db";
import { publicUrl, thumbKey } from "@/lib/storage";
import { ConfirmButton } from "../../../components/ConfirmButton";
import { ProjectForm } from "../../../components/ProjectForm";
import { Uploader } from "../../../components/Uploader";
import { StatusBadge, btnCls, cardCls } from "../../../components/ui";
import { deletePhoto, deleteProject, submitProject } from "../../actions";

export default async function ProjectEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(["master"]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const p = await one<{
    id: string; title: string; description: string; area_m2: string | null; duration_days: number | null;
    price_total: number | null; status: keyof typeof STATUS_LABEL; reject_reason: string | null;
  }>("select * from projects where id = $1 and master_id = $2", [id, user.id]);
  if (!p) notFound();

  const photos = await query<{ id: string; storage_key: string }>(
    "select id, storage_key from project_photos where project_id = $1 order by sort", [id]
  );
  const canSubmit = (p.status === "draft" || p.status === "rejected") &&
    p.title !== "Новый проект" && p.description.length >= 20 && photos.length > 0;

  return (
    <div className="space-y-4">
      <Link href="/cabinet/projects" className="text-sm text-neutral-500 hover:text-neutral-950">← Все проекты</Link>

      <div className={cardCls}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Статус проекта</h2>
          <StatusBadge status={p.status} label={STATUS_LABEL[p.status]} />
        </div>
        <p className="mt-2 text-sm text-neutral-600">
          {p.status === "draft" && "Проект виден только вам. Заполните данные, добавьте фото и отправьте на проверку."}
          {p.status === "pending" && "Проект на проверке. После одобрения он появится на вашей странице."}
          {p.status === "approved" && "Проект опубликован. Если вы изменитесь или добавите фото, он снова пройдёт проверку."}
          {p.status === "rejected" && "Проект отклонён. Исправьте и отправьте снова."}
        </p>
        {p.status === "rejected" && p.reject_reason && (
          <p className="mt-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700">Причина: {p.reject_reason}</p>
        )}
        {(p.status === "draft" || p.status === "rejected") && (
          <form action={submitProject.bind(null, id)} className="mt-4">
            <button disabled={!canSubmit} className={btnCls}>Отправить на проверку</button>
            {!canSubmit && (
              <p className="mt-2 text-xs text-neutral-400">Нужны название, описание от 20 символов и хотя бы одно фото.</p>
            )}
          </form>
        )}
      </div>

      <ProjectForm projectId={id} data={{ title: p.title, description: p.description, area_m2: p.area_m2, duration_days: p.duration_days, price_total: p.price_total }} />

      <div className={cardCls}>
        <h2 className="mb-1 text-lg font-semibold">Фото</h2>
        <p className="mb-4 text-sm text-neutral-500">
          До {LIMITS.maxPhotosPerProject} фото, JPG или PNG до 10 МБ. Первое фото станет обложкой проекта.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((ph, i) => (
            <div key={ph.id} className="relative overflow-hidden rounded-2xl bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={publicUrl(thumbKey(ph.storage_key))} alt={`Фото ${i + 1}`} className="aspect-[4/3] w-full object-cover" loading="lazy" />
              {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-neutral-950/80 px-2.5 py-1 text-[11px] text-white">Обложка</span>}
              <form action={deletePhoto.bind(null, ph.id)} className="absolute right-2 top-2">
                <ConfirmButton message="Удалить это фото?" className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] text-neutral-700 hover:text-red-600">
                  Удалить
                </ConfirmButton>
              </form>
            </div>
          ))}
        </div>
        {photos.length < LIMITS.maxPhotosPerProject && (
          <div className="mt-4"><Uploader kind="project" projectId={id} multiple label="+ Добавить фото" /></div>
        )}
      </div>

      <form action={deleteProject.bind(null, id)}>
        <ConfirmButton message="Удалить проект вместе с фото? Это нельзя отменить." className="text-sm text-neutral-500 underline hover:text-red-600">
          Удалить проект
        </ConfirmButton>
      </form>
    </div>
  );
}
