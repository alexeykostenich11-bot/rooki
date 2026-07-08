import { Section } from "./Section";

const steps = [
  "Заявка",
  "Консультация",
  "Замер",
  "Смета",
  "Договор",
  "Ремонт",
  "Сдача объекта",
];

export function HowWeWork() {
  return (
    <Section
      id="process"
      label="Как мы работаем"
      title="Прозрачный процесс из семи шагов"
      description="Каждый этап согласован заранее — вы всегда знаете, что происходит на объекте."
    >
      <div className="relative">
        <div className="hidden md:absolute md:top-8 md:right-8 md:left-8 md:block md:h-px md:bg-neutral-200" />

        <ol className="mobile-scroll-x flex gap-3 pb-2 md:grid md:grid-cols-7 md:gap-2 md:pb-0">
          {steps.map((step, index) => (
            <li
              key={step}
              className="animate-fade-up relative min-w-[8.5rem] snap-start md:min-w-0"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex h-full flex-col items-start gap-3 rounded-3xl border border-neutral-200/80 bg-white p-4 md:items-center md:border-0 md:bg-transparent md:p-0 md:text-center">
                <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-950 shadow-sm md:h-14 md:w-14 md:rounded-3xl">
                  {index + 1}
                </div>
                <p className="text-sm font-medium leading-snug text-neutral-700 md:max-w-[7rem] md:text-xs lg:text-sm">
                  {step}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-3 text-xs text-neutral-400 md:hidden">
          Листайте вправо →
        </p>
      </div>
    </Section>
  );
}
