"use client";
import { FormEvent, useRef, useState } from "react";
import { links, phone } from "@/lib/links";
import { goal, leadSource } from "@/lib/analytics";
import { LeadFields } from "./LeadFields";
export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const busy = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    const form = event.currentTarget;
    const fd = new FormData(form);
    setStatus("sending"); setError("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(20000), body: JSON.stringify({ name: fd.get("name"), phone: fd.get("phone"), area: fd.get("area"), location: fd.get("location"), comment: fd.get("comment"), website: fd.get("website"), consent: fd.get("consent") === "on", source: leadSource("contact") }) });
      const data = await response.json();
      if (!response.ok || data.success !== true) throw new Error(data.error || "Не удалось отправить заявку.");
      setStatus("done"); form.reset(); goal("lead_success", { form: "contact" });
    } catch (e) {
      setStatus("error"); setError(e instanceof Error && e.name !== "TimeoutError" && e.name !== "TypeError" ? e.message : "Не удалось подтвердить доставку. Позвоните или напишите нам."); goal("lead_error", { form: "contact" });
    } finally { busy.current = false; }
  }
  const input = "mt-2 h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-base outline-offset-4";
  return <section id="contact" className="section-padding"><div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-2 md:px-8">
    <div><p className="text-xs uppercase tracking-widest text-neutral-500">Обсудим ваш ремонт</p><h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Начните с разговора.<br />Рассчитаем следующий шаг.</h2><p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-600">Расскажите о квартире: что нужно сделать, где находится объект и когда хотите начать. Уточним детали и договоримся, как подготовить смету. Работаем в Москве и области; приоритет — объекты в пределах 25 минут от метро.</p><div className="mt-7 rounded-3xl border border-neutral-200 bg-white p-6"><p className="font-semibold">Алексей · ROOKI</p><a className="mt-3 block text-2xl font-medium" href={`tel:${phone.tel}`}>{phone.display}</a><p className="mt-3 text-sm text-neutral-500">Уже есть план квартиры? Пришлите его в WhatsApp вместе с пожеланиями к ремонту.</p><a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block rounded-full bg-neutral-950 px-6 py-3 text-sm text-white">Отправить план Алексею</a></div></div>
    <form onSubmit={submit} className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-8" aria-busy={status === "sending"}>
      {status === "done" ? <div role="status"><h3 className="text-xl font-semibold">Заявка доставлена команде</h3><p className="mt-3 text-sm text-neutral-600">Алексей свяжется с вами, чтобы уточнить детали. Если вопрос срочный, позвоните по номеру рядом.</p></div> : <>
        <h3 className="text-xl font-semibold">Оставить заявку на расчёт</h3><p className="mt-2 text-xs text-neutral-500">Обязателен только телефон и согласие. Остальное можно обсудить лично.</p>
        <div className="mt-5 space-y-4"><label className="block text-sm">Телефон<input className={input} name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={30} placeholder="+7 (985) 123-45-67" /></label><label className="block text-sm">Как к вам обращаться <span className="text-neutral-400">· необязательно</span><input className={input} name="name" autoComplete="name" maxLength={80} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm">Площадь<input className={input} name="area" inputMode="decimal" maxLength={30} placeholder="65 м²" /></label><label className="block text-sm">Метро, район или ЖК<input className={input} name="location" maxLength={120} placeholder="Метро и время в пути до объекта" /></label></div><label className="block text-sm">Что хотите сделать<textarea className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-base" name="comment" rows={3} maxLength={1000} placeholder="Новостройка или вторичка, вид ремонта, желаемый срок начала" /></label></div>
        <LeadFields /><button disabled={status === "sending"} className="mt-5 min-h-12 w-full rounded-full bg-neutral-950 px-5 text-sm font-medium text-white disabled:opacity-60">{status === "sending" ? "Отправляем…" : "Обсудить смету"}</button>
        {status === "error" && <div role="alert" className="mt-4 text-sm text-red-700"><p>{error}</p><a className="mt-2 inline-block underline" href={`tel:${phone.tel}`}>Позвонить: {phone.display}</a></div>}
      </>}
    </form>
  </div></section>;
}
