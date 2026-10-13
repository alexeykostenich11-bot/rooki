import { requireUser } from "@/lib/auth";
import { one, query } from "@/lib/db";
import { publicUrl } from "@/lib/storage";
import { ProfileForm, type ProfileData } from "../../components/ProfileForm";
import { Uploader } from "../../components/Uploader";
import { cardCls } from "../../components/ui";
import { removeAvatar } from "../actions";

export default async function ProfilePage() {
  const user = await requireUser(["master"]);
  const p = await one<Omit<ProfileData, "prices" | "display_name"> & { avatar_key: string | null }>(
    `select specialties, experience_years, city, districts, team_type, about, avatar_key
       from master_profiles where user_id = $1`,
    [user.id]
  );
  const prices = await query<{ work_name: string; unit: string; price_from: number }>(
    "select work_name, unit, price_from from master_prices where master_id = $1 order by sort",
    [user.id]
  );
  if (!p) return null;

  return (
    <div className="space-y-4">
      <div className={cardCls}>
        <h2 className="mb-4 text-lg font-semibold">Ваше фото</h2>
        <div className="flex flex-wrap items-center gap-4">
          {p.avatar_key ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={publicUrl(p.avatar_key)} alt="Ваше фото" className="h-24 w-24 rounded-3xl object-cover" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-neutral-100 text-3xl text-neutral-300">
              {user.display_name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="space-y-2">
            <Uploader kind="avatar" label={p.avatar_key ? "Заменить фото" : "Загрузить фото"} />
            {p.avatar_key && (
              <form action={removeAvatar}>
                <button className="text-sm text-neutral-500 underline hover:text-red-600">Удалить фото</button>
              </form>
            )}
          </div>
        </div>
      </div>
      <ProfileForm data={{ ...p, display_name: user.display_name, prices }} />
    </div>
  );
}
