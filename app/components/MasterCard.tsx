import Link from "next/link";
import { publicUrl, thumbKey } from "@/lib/storage";

export type MasterCardData = {
  id: string; display_name: string; specialties: string[]; experience_years: number | null;
  city: string; districts: string; team_type: string; avatar_key: string | null;
  min_price: number | null; projects_n: string; cover: string | null;
};

export function MasterCard({ m }: { m: MasterCardData }) {
  return (
    <Link href={`/masters/${m.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-white transition-all hover:border-neutral-300 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.12)]">
      <div className="aspect-[4/3] bg-neutral-100">
        {m.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={publicUrl(thumbKey(m.cover))} alt={`Работа мастера ${m.display_name}`} className="h-full w-full object-cover" loading="lazy" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-3">
          {m.avatar_key ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={publicUrl(m.avatar_key)} alt="" className="h-11 w-11 rounded-2xl object-cover" loading="lazy" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
              {m.display_name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold tracking-tight text-neutral-950">{m.display_name}</p>
            <p className="truncate text-xs text-neutral-500">
              {m.team_type === "crew" ? "Бригада" : "Мастер"}
              {m.experience_years != null ? ` · опыт ${m.experience_years} л.` : ""}
            </p>
          </div>
        </div>
        <p className="line-clamp-2 text-sm text-neutral-600">{m.specialties.join(", ")}</p>
        <div className="mt-auto flex items-end justify-between gap-3 text-sm">
          <span className="truncate text-neutral-400">{m.districts || m.city}</span>
          {m.min_price != null && (
            <span className="shrink-0 font-semibold text-neutral-950">от {new Intl.NumberFormat("ru-RU").format(m.min_price)} ₽</span>
          )}
        </div>
        <p className="text-xs text-neutral-400">Проектов: {m.projects_n}</p>
      </div>
    </Link>
  );
}
