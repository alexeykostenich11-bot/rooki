"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  MAX_AREA,
  MIN_AREA,
  objectTypes,
  repairTypes,
} from "@/lib/pricing";
import { Section } from "./Section";

const rub = (n: number) =>
  new Intl.NumberFormat("ru-RU").format(Math.round(n / 1000) * 1000);

export function Calculator() {
  const [area, setArea] = useState(50);
  const [repairId, setRepairId] = useState<string>(repairTypes[2].id);
  const [objectId, setObjectId] = useState<string>(objectTypes[0].id);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );

  const repair = repairTypes.find((r) => r.id === repairId)!;
  const object = objectTypes.find((o) => o.id === objectId)!;

  const { low, high } = useMemo(
    () => ({
      low: area * repair.from * object.factor,
      high: area * repair.to * object.factor,
    }),
    [area, repair, object]
  );

  const summary = `Калькулятор: ${repair.title}, ${object.title}, ${area} м², работы ${rub(low)}–${rub(high)} ₽`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          phone: fd.get("phone"),
          area: `${area} м²`,
          objectType: object.title,
          location: "Не указано",
          comment: summary,
        }),
      });
      if (response.ok) {
        setStatus("done");
        form.reset();
      } else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Section
      id="calc"
      label="Калькулятор"
      title="Прикиньте стоимость ремонта за минуту"
      description="Ориентир по работам. Точную смету с материалами сделаем после замера."
    >
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-7 rounded-3xl border border-neutral-200/80 bg-white p-6 md:p-8">
          <div>
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-sm font-medium text-neutral-700">
                Площадь квартиры
              </span>
              <span className="text-2xl font-semibold tracking-tight">
                {area} м²
              </span>
            </div>
            <input
              type="range"
              min={MIN_AREA}
              max={MAX_AREA}
              step={1}
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              aria-label="Площадь, м²"
              className="h-2 w-full cursor-pointer accent-neutral-950"
            />
            <div className="mt-1 flex justify-between text-xs text-neutral-400">
              <span>{MIN_AREA} м²</span>
              <span>{MAX_AREA} м²</span>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-neutral-700">
              Вид ремонта
            </p>
            <div className="grid gap-2">
              {repairTypes.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRepairId(r.id)}
                  aria-pressed={repairId === r.id}
                  className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                    repairId === r.id
                      ? "border-neutral-950 bg-neutral-950 text-white"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <span className="block text-sm font-semibold">{r.title}</span>
                  <span
                    className={`block text-xs ${
                      repairId === r.id ? "text-neutral-300" : "text-neutral-500"
                    }`}
                  >
                    {r.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-neutral-700">Квартира</p>
            <div className="grid grid-cols-2 gap-2">
              {objectTypes.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setObjectId(o.id)}
                  aria-pressed={objectId === o.id}
                  className={`h-11 rounded-full border text-sm font-medium transition-all ${
                    objectId === o.id
                      ? "border-neutral-950 bg-neutral-950 text-white"
                      : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  {o.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col rounded-3xl border border-neutral-200/80 bg-neutral-950 p-6 text-white md:p-8"
        >
          <p className="text-sm text-neutral-400">Работы, ориентировочно</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {rub(low)} – {rub(high)} ₽
          </p>
          <p className="mt-2 text-xs leading-relaxed text-neutral-400">
            Без материалов. Итог зависит от дизайн-проекта, состояния стен и
            инженерки. Точную цену фиксируем в смете до начала работ.
          </p>

          <div className="mt-6 space-y-3">
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              placeholder="Ваше имя"
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base text-white outline-none placeholder:text-neutral-500 focus:border-white/30"
            />
            <input
              type="tel"
              name="phone"
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder="+7 (___) ___-__-__"
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base text-white outline-none placeholder:text-neutral-500 focus:border-white/30"
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending" || status === "done"}
            className="mt-4 h-12 w-full rounded-full bg-white text-sm font-medium text-neutral-950 transition-all hover:bg-neutral-200 active:scale-[0.98] disabled:opacity-60"
          >
            {status === "sending"
              ? "Отправляем…"
              : status === "done"
                ? "Заявка отправлена — скоро свяжемся"
                : "Получить точную смету"}
          </button>
          {status === "error" && (
            <p className="mt-3 text-sm text-red-400">
              Не получилось отправить. Напишите нам в Telegram.
            </p>
          )}
          <p className="mt-auto pt-6 text-xs text-neutral-500">
            Перезвоним в течение 15 минут и уточним детали.
          </p>
        </form>
      </div>
    </Section>
  );
}
