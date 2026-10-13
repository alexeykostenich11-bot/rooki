import { reviews } from "@/lib/reviews";
import { ReviewForm } from "./ReviewForm";
import { Section } from "./Section";

const facts = [
  {
    title: "Юридическое лицо и офис",
    text: "Работаем официально, есть офис в Москве. Вы знаете, к кому прийти.",
  },
  {
    title: "Договор и смета до старта",
    text: "Объём, цена и сроки фиксируются заранее. Что не вошло в смету, обсуждаем до начала работ.",
  },
  {
    title: "О нас писал Hi Home",
    text: "Публикация в журнале Hi Home, который распространяется в аэропортах и бизнес-центрах.",
  },
  {
    title: "Отчёты с объекта",
    text: "Регулярные фото и видео, чтобы вы видели ход работ, даже если вы не в городе.",
  },
];

export function Trust() {
  return (
    <Section
      id="trust"
      label="Почему нам доверяют"
      title="Не частная бригада без договора, а компания с ответственностью"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((f) => (
          <article
            key={f.title}
            className="rounded-3xl border border-neutral-200/80 bg-white p-6"
          >
            <h3 className="text-base font-semibold tracking-tight text-neutral-950">
              {f.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              {f.text}
            </p>
          </article>
        ))}
      </div>

      <div id="reviews" className="mt-12 scroll-mt-24">
        <h3 className="mb-6 text-xl font-semibold tracking-tight md:text-2xl">
          Отзывы клиентов
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <figure
              key={r.name + r.object + r.text.slice(0, 12)}
              className="rounded-3xl border border-neutral-200/80 bg-neutral-50 p-6"
            >
              {r.rating ? (
                <p className="mb-3 text-lg leading-none text-amber-400" aria-label={`Оценка ${r.rating} из 5`}>
                  {"★".repeat(r.rating)}
                  <span className="text-neutral-300">{"★".repeat(5 - r.rating)}</span>
                </p>
              ) : null}
              <blockquote className="text-sm leading-relaxed text-neutral-700">
                {r.text}
              </blockquote>
              <figcaption className="mt-4 text-xs text-neutral-500">
                <span className="font-medium text-neutral-800">{r.name}</span>
                {" · "}
                {r.object}
                {r.source ? ` · ${r.source}` : ""}
              </figcaption>
            </figure>
          ))}
          <div className={reviews.length === 0 ? "md:col-span-2 lg:col-span-3 lg:max-w-xl" : ""}>
            {reviews.length === 0 && (
              <p className="mb-4 text-sm text-neutral-500">
                Здесь появятся отзывы наших клиентов. Работали с нами? Расскажите, как всё прошло.
              </p>
            )}
            <ReviewForm />
          </div>
        </div>
      </div>
    </Section>
  );
}
