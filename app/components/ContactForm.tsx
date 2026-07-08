"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  
    const form = event.currentTarget;
  
    const formData = new FormData(form);
  
    const payload = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      area: formData.get("area"),
      comment: formData.get("comment"),
      objectType: "Не указано",
      location: "Не указано",
    };
  
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  
    if (response.ok) {
      setSubmitted(true);
      form.reset();
    } else {
      alert("Ошибка отправки заявки");
    }
  }

  return (
    <section id="contact" className="section-padding">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8">
        <div className="mx-auto max-w-xl">
          <header className="mb-8 animate-fade-up text-center sm:mb-10 md:mb-12">
            <p className="mb-3 text-xs font-medium tracking-wide text-neutral-400 uppercase sm:text-sm">
              Заявка
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl md:text-4xl">
              Получите предварительный расчёт
            </h2>
            <p className="mt-3 text-sm text-neutral-500 sm:mt-4 sm:text-base">
              Ответим в течение 15 минут.
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            className="animate-fade-up animation-delay-100 rounded-[1.75rem] border border-neutral-200/80 bg-white p-5 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.06)] sm:rounded-[2rem] sm:p-6 md:rounded-[2.5rem] md:p-8"
          >
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-neutral-700">
                  Имя
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Как к вам обращаться"
                  className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50/50 px-4 text-base text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-950/5"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-neutral-700">
                  Телефон
                </span>
                <input
                  type="tel"
                  name="phone"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+7 (___) ___-__-__"
                  className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50/50 px-4 text-base text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-950/5"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-neutral-700">
                  Площадь квартиры
                </span>
                <input
                  type="text"
                  name="area"
                  inputMode="numeric"
                  placeholder="Например, 65 м²"
                  className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50/50 px-4 text-base text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-950/5"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-neutral-700">
                  Комментарий
                </span>
                <textarea
                  name="comment"
                  rows={4}
                  placeholder="Расскажите о задаче или пожеланиях"
                  className="w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-base text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-950/5"
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-6 h-12 w-full rounded-full bg-neutral-950 text-sm font-medium text-white transition-all hover:bg-neutral-800 hover:shadow-xl hover:shadow-neutral-950/15 active:scale-[0.98] disabled:opacity-60"
              disabled={submitted}
            >
              {submitted
                ? "Заявка отправлена — скоро свяжемся"
                : "Получить предварительный расчёт"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
