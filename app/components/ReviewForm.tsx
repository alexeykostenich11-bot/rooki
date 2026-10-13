"use client";

import { FormEvent, useState } from "react";

export function ReviewForm() {
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    setStatus("sending");
    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          object: fd.get("object"),
          text: fd.get("text"),
          website: fd.get("website"),
          rating,
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

  const input =
    "h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50/50 px-4 text-base text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-950/5";

  if (status === "done") {
    return (
      <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 text-center md:p-8">
        <p className="text-lg font-semibold tracking-tight">Спасибо за отзыв!</p>
        <p className="mt-2 text-sm text-neutral-500">
          Мы проверим его и опубликуем на сайте в ближайшее время.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-neutral-200/80 bg-white p-6 md:p-8"
    >
      <h3 className="text-lg font-semibold tracking-tight">Оставить отзыв</h3>
      <p className="mt-1 text-sm text-neutral-500">
        Мы читаем каждый отзыв. Публикуем после проверки.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700">Оценка</p>
          <div className="flex gap-1" role="radiogroup" aria-label="Оценка">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} из 5`}
                onClick={() => setRating(n)}
                className={`text-3xl leading-none transition-colors ${
                  n <= rating ? "text-amber-400" : "text-neutral-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          name="name"
          required
          maxLength={60}
          placeholder="Ваше имя"
          className={input}
        />
        <input
          type="text"
          name="object"
          maxLength={100}
          placeholder="Какой ремонт делали, например: 2-комн., 58 м²"
          className={input}
        />
        <textarea
          name="text"
          required
          minLength={10}
          maxLength={1200}
          rows={4}
          placeholder="Расскажите, как всё прошло"
          className="w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-base text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-950/5"
        />
        {/* Ловушка для ботов, людям не видна */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-5 h-12 w-full rounded-full bg-neutral-950 text-sm font-medium text-white transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-60"
      >
        {status === "sending" ? "Отправляем…" : "Отправить отзыв"}
      </button>
      {status === "error" && (
        <p className="mt-3 text-sm text-red-500">
          Не получилось отправить. Попробуйте ещё раз или напишите нам в Telegram.
        </p>
      )}
      <p className="mt-3 text-xs text-neutral-400">
        Отправляя отзыв, вы разрешаете показать его на сайте с вашим именем.
      </p>
    </form>
  );
}
