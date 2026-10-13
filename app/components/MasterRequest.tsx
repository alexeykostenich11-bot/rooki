"use client";

import { FormEvent, useState } from "react";
import { btnCls, cardCls, inputCls } from "./ui";

/** Заявка на конкретного мастера: уходит команде ROOKI, мы связываем заказчика с мастером. */
export function MasterRequest({ masterName, masterId }: { masterName: string; masterId: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"), phone: fd.get("phone"), objectType: "Не указано", area: "Не указано", location: "Не указано",
          comment: `Заявка на мастера «${masterName}» (${masterId}). ${fd.get("comment") ?? ""}`,
        }),
      });
      if (res.ok) { setStatus("done"); form.reset(); } else setStatus("error");
    } catch { setStatus("error"); }
  }

  return (
    <form onSubmit={onSubmit} className={cardCls}>
      <h2 className="text-lg font-semibold">Связаться с мастером</h2>
      <p className="mt-1 text-sm text-neutral-500">Оставьте контакты, и мы свяжем вас с мастером в течение 15 минут.</p>
      <div className="mt-4 space-y-3">
        <input name="name" required placeholder="Ваше имя" autoComplete="name" className={inputCls} />
        <input name="phone" type="tel" required placeholder="+7 (___) ___-__-__" inputMode="tel" autoComplete="tel" className={inputCls} />
        <input name="comment" placeholder="Что нужно сделать (коротко)" className={inputCls} />
      </div>
      <button type="submit" disabled={status === "sending" || status === "done"} className={`${btnCls} mt-4 w-full`}>
        {status === "sending" ? "Отправляем…" : status === "done" ? "Заявка отправлена" : "Оставить заявку"}
      </button>
      {status === "error" && <p className="mt-2 text-sm text-red-600">Не получилось отправить. Напишите нам в Telegram.</p>}
    </form>
  );
}
