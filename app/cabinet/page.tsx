import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { LIMITS, STATUS_LABEL } from "@/lib/catalog";
import { one, query } from "@/lib/db";
import { StatusBadge, btnCls, btnGhostCls, cardCls } from "../components/ui";
import { submitProfile } from "./actions";

export default async function CabinetHome() {
  const user = await requireUser();

  if (user.role === "admin") {
    return (
      <div className={cardCls}>
        <p className="text-neutral-600">Вы вошли как администратор.</p>
        <Link href="/admin" className={`${btnCls} mt-4`}>Открыть проверку анкет</Link>
      </div>
    );
  }

  if (user.role === "customer") {
    return (
      <div className="space-y-4">
        <div className={cardCls}>
          <h2 className="text-lg font-semibold">Добро пожаловать</h2>
          <p className="mt-2 text-neutral-600">
            Вы можете смотреть анкеты мастеров, их работы и цены. Оставляйте заявку на мастера прямо на его странице.
          </p>
          <Link href="/masters" className={`${btnCls} mt-5`}>Смотреть мастеров</Link>
        </div>
        <div className="rounded-3xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-500">
          Скоро здесь появятся личные сообщения с мастерами, отзывы и избранное.
        </div>
      </div>
    );
  }

  const p = await one<{
    status: keyof typeof STATUS_LABEL; reject_reason: string | null; about: string;
    specialties: string[]; avatar_key: string | null;
  }>("select status, reject_reason, about, specialties, avatar_key from master_profiles where user_id = $1", [user.id]);
  const prices = await one<{ n: string }>("select count(*) as n from master_prices where master_id = $1", [user.id]);
  const projects = await query<{ status: keyof typeof STATUS_LABEL }>("select status from projects where master_id = $1", [user.id]);

  const checks = [
    { ok: (p?.specialties.length ?? 0) > 0, text: "Выбрана специальность" },
    { ok: (p?.about.length ?? 0) >= LIMITS.aboutMin, text: `Рассказ о себе (от ${LIMITS.aboutMin} символов)` },
    { ok: Number(prices?.n ?? 0) > 0, text: "Указана хотя бы одна цена" },
    { ok: Boolean(p?.avatar_key), text: "Загружено ваше фото (желательно)", optional: true },
    { ok: projects.some((x) => x.status === "approved" || x.status === "pending"), text: "Добавлен проект с фото (желательно)", optional: true },
  ];
  const ready = checks.filter((c) => !("optional" in c)).every((c) => c.ok);

  return (
    <div className="space-y-4">
      <div className={cardCls}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Статус анкеты</h2>
          {p && <StatusBadge status={p.status} label={STATUS_LABEL[p.status]} />}
        </div>
        <p className="mt-3 text-sm text-neutral-600">
          {p?.status === "approved" && "Ваша анкета опубликована в каталоге мастеров. Заказчики её видят."}
          {p?.status === "pending" && "Мы проверяем анкету, обычно это занимает до суток. После проверки она появится в каталоге."}
          {p?.status === "draft" && "Заполните анкету и отправьте на проверку. Пока она видна только вам."}
          {p?.status === "rejected" && "Анкета отклонена. Исправьте замечания и отправьте снова."}
        </p>
        {p?.status === "rejected" && p.reject_reason && (
          <p className="mt-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700">Причина: {p.reject_reason}</p>
        )}

        <ul className="mt-5 space-y-2 text-sm">
          {checks.map((c) => (
            <li key={c.text} className="flex items-start gap-2">
              <span className={c.ok ? "text-emerald-600" : "text-neutral-300"}>{c.ok ? "✓" : "○"}</span>
              <span className={c.ok ? "text-neutral-700" : "text-neutral-500"}>{c.text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/cabinet/profile" className={btnGhostCls}>Заполнить анкету и цены</Link>
          <Link href="/cabinet/projects" className={btnGhostCls}>Мои проекты</Link>
          {(p?.status === "draft" || p?.status === "rejected") && (
            <form action={submitProfile}>
              <button disabled={!ready} className={btnCls}>Отправить на проверку</button>
            </form>
          )}
          {p?.status === "approved" && (
            <Link href={`/masters/${user.id}`} className={btnCls}>Открыть мою страницу</Link>
          )}
        </div>
        {!ready && (p?.status === "draft" || p?.status === "rejected") && (
          <p className="mt-3 text-xs text-neutral-400">Кнопка станет активной, когда выполнены обязательные пункты выше.</p>
        )}
      </div>
    </div>
  );
}
