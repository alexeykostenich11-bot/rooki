import { Section } from "./Section";

const reasons = [
  {
    title: "Один ответственный за весь проект",
    description:
      "Личный менеджер ведёт ремонт от замера до сдачи — без передачи между подрядчиками.",
  },
  {
    title: "Прозрачная смета",
    description:
      "Фиксируем объём работ и стоимость до начала — без скрытых доплат по ходу.",
  },
  {
    title: "Контроль каждого этапа",
    description:
      "Проверяем качество на каждом шаге и держим сроки в фокусе.",
  },
  {
    title: "Фото и видеоотчёты",
    description:
      "Регулярные отчёты о прогрессе — вы всегда в курсе, даже удалённо.",
  },
  {
    title: "Помощь с материалами и мебелью",
    description:
      "Подбираем материалы, комплектуем объект и помогаем с мебелью под заказ.",
  },
];

export function WhyChooseUs() {
  return (
    <Section
      id="why"
      label="Почему выбирают нас"
      title="Ремонт без хаоса — с понятным процессом и одной точкой ответственности"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reasons.map((reason, index) => (
          <article
            key={reason.title}
            className="group animate-fade-up rounded-3xl border border-neutral-200/80 bg-white p-7 transition-all duration-300 hover:border-neutral-300 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.12)] md:p-8"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 text-sm font-medium text-neutral-500 transition-colors group-hover:bg-neutral-950 group-hover:text-white">
              {String(index + 1).padStart(2, "0")}
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-neutral-950">
              {reason.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              {reason.description}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}
