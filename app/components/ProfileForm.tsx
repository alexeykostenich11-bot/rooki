"use client";

import { useActionState, useState } from "react";
import { saveProfile, type SaveState } from "../cabinet/actions";
import { LIMITS, SPECIALTIES, TEAM_TYPES, UNITS, WORK_PRESETS } from "@/lib/catalog";
import { Field, btnCls, btnGhostCls, cardCls, inputCls, textareaCls } from "./ui";

export type ProfileData = {
  display_name: string;
  specialties: string[];
  experience_years: number | null;
  city: string;
  districts: string;
  team_type: "solo" | "crew";
  about: string;
  prices: { work_name: string; unit: string; price_from: number }[];
};

const initial: SaveState = {};

export function ProfileForm({ data }: { data: ProfileData }) {
  const [state, action, pending] = useActionState(saveProfile, initial);
  const [rows, setRows] = useState(
    data.prices.length ? data.prices : [{ work_name: "", unit: "м²", price_from: 0 }]
  );

  return (
    <form action={action} className="space-y-4">
      <div className={cardCls}>
        <h2 className="mb-5 text-lg font-semibold">О вас</h2>
        <div className="space-y-4">
          <Field label="Имя или название бригады">
            <input name="display_name" defaultValue={data.display_name} required minLength={2} maxLength={60} className={inputCls} />
          </Field>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-neutral-700">Специальность</legend>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((s) => (
                <label key={s} className="cursor-pointer">
                  <input type="checkbox" name="specialties" value={s} defaultChecked={data.specialties.includes(s)} className="peer sr-only" />
                  <span className="inline-block rounded-full border border-neutral-200 px-3.5 py-2 text-sm text-neutral-700 transition-all peer-checked:border-neutral-950 peer-checked:bg-neutral-950 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-neutral-950/30">
                    {s}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Опыт, лет">
              <input name="experience_years" type="number" min={0} max={60} defaultValue={data.experience_years ?? ""} inputMode="numeric" className={inputCls} />
            </Field>
            <Field label="Как работаете">
              <select name="team_type" defaultValue={data.team_type} className={inputCls}>
                {Object.entries(TEAM_TYPES).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </Field>
            <Field label="Город">
              <input name="city" defaultValue={data.city} maxLength={80} className={inputCls} />
            </Field>
            <Field label="Районы, метро, выезд" hint="Например: Москва, Котельники, Люберцы, до МКАД">
              <input name="districts" defaultValue={data.districts} maxLength={300} className={inputCls} />
            </Field>
          </div>

          <Field label="О себе" hint={`От ${LIMITS.aboutMin} символов. Чем занимаетесь, чем отличаетесь, какие объекты берёте.`}>
            <textarea name="about" rows={6} defaultValue={data.about} maxLength={LIMITS.aboutMax} className={textareaCls} />
          </Field>
        </div>
      </div>

      <div className={cardCls}>
        <h2 className="text-lg font-semibold">Цены на работы</h2>
        <p className="mb-5 mt-1 text-sm text-neutral-500">
          Укажите цену «от» за работу, без материалов. Заказчики увидят её в вашей анкете.
        </p>

        <datalist id="work-presets">
          {WORK_PRESETS.map((w) => <option key={w} value={w} />)}
        </datalist>

        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_7rem_8rem_auto]">
              <input name="price_name" list="work-presets" defaultValue={r.work_name} placeholder="Вид работ" maxLength={100}
                className={`${inputCls} col-span-2 sm:col-span-1`} />
              <select name="price_unit" defaultValue={r.unit} className={inputCls} aria-label="Единица">
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
              <input name="price_from" type="number" min={0} max={10000000} step={1} defaultValue={r.price_from || ""}
                placeholder="от, ₽" inputMode="numeric" className={inputCls} aria-label="Цена от, рублей" />
              <button type="button" onClick={() => setRows(rows.filter((_, j) => j !== i))}
                aria-label="Удалить строку" className="col-span-2 h-12 rounded-2xl border border-neutral-200 px-4 text-sm text-neutral-500 hover:text-red-600 sm:col-span-1">
                Убрать
              </button>
            </div>
          ))}
        </div>

        {rows.length < LIMITS.maxPrices && (
          <button type="button" onClick={() => setRows([...rows, { work_name: "", unit: "м²", price_from: 0 }])}
            className={`${btnGhostCls} mt-4`}>
            + Добавить строку
          </button>
        )}
      </div>

      {state.error && <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700" role="alert">{state.error}</p>}
      {state.ok && <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">Сохранено.</p>}

      <button type="submit" disabled={pending} className={btnCls}>
        {pending ? "Сохраняем…" : "Сохранить анкету и цены"}
      </button>
    </form>
  );
}
