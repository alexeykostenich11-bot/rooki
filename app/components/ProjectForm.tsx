"use client";

import { useActionState } from "react";
import { saveProject, type SaveState } from "../cabinet/actions";
import { LIMITS } from "@/lib/catalog";
import { Field, btnCls, cardCls, inputCls, textareaCls } from "./ui";

const initial: SaveState = {};

export function ProjectForm({
  projectId,
  data,
}: {
  projectId: string;
  data: { title: string; description: string; area_m2: string | null; duration_days: number | null; price_total: number | null };
}) {
  const [state, action, pending] = useActionState(saveProject.bind(null, projectId), initial);
  return (
    <form action={action} className={cardCls}>
      <div className="space-y-4">
        <Field label="Название проекта" hint="Например: Двушка 54 м² в новостройке, ремонт под ключ">
          <input name="title" defaultValue={data.title === "Новый проект" ? "" : data.title} required minLength={3} maxLength={100} className={inputCls} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Площадь, м²">
            <input name="area_m2" defaultValue={data.area_m2 ?? ""} inputMode="decimal" placeholder="54.5" className={inputCls} />
          </Field>
          <Field label="Срок, дней">
            <input name="duration_days" defaultValue={data.duration_days ?? ""} inputMode="numeric" placeholder="60" className={inputCls} />
          </Field>
          <Field label="Стоимость работ, ₽" hint="Без материалов">
            <input name="price_total" defaultValue={data.price_total ?? ""} inputMode="numeric" placeholder="650000" className={inputCls} />
          </Field>
        </div>
        <Field label="Что сделано" hint={`От 20 символов. Какие работы, какие сложности, что получилось.`}>
          <textarea name="description" rows={6} defaultValue={data.description} maxLength={LIMITS.projectDescMax} className={textareaCls} />
        </Field>
      </div>
      {state.error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700" role="alert">{state.error}</p>}
      {state.ok && <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">Сохранено.</p>}
      <button type="submit" disabled={pending} className={`${btnCls} mt-6`}>
        {pending ? "Сохраняем…" : "Сохранить проект"}
      </button>
    </form>
  );
}
