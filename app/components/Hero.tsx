import { links } from "@/lib/links";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20 md:pt-36 md:pb-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-[360px] w-[min(800px,120vw)] -translate-x-1/2 rounded-full bg-neutral-100 blur-3xl sm:h-[480px]" />
        <div className="absolute top-32 right-0 h-48 w-48 rounded-full bg-neutral-50 blur-2xl sm:h-64 sm:w-64" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="animate-fade-up mb-5 text-xs font-medium tracking-[0.3em] text-neutral-400 uppercase sm:mb-6 sm:text-sm">
            {site.name} · {site.tagline}
          </p>
          <h1 className="animate-fade-up animation-delay-100 text-[1.75rem] leading-[1.15] font-semibold tracking-tight text-neutral-950 sm:text-4xl md:text-6xl md:leading-[1.08]">
            Управляем ремонтом от первой сметы до готового пространства.
          </h1>
          <p className="animate-fade-up animation-delay-200 mx-auto mt-5 max-w-2xl text-base leading-relaxed text-neutral-500 sm:mt-6 sm:text-lg md:mt-8 md:text-xl">
            Организуем ремонт квартир под ключ в Москве: смета, материалы,
            контроль работ и мебель.
          </p>

          <div className="animate-fade-up animation-delay-300 mt-8 flex flex-col gap-3 sm:mt-10 md:mt-12">
            <a
              href="#contact"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-neutral-950 px-7 text-sm font-medium text-white transition-all hover:bg-neutral-800 hover:shadow-xl hover:shadow-neutral-950/15 active:scale-[0.98] sm:w-auto sm:self-center"
            >
              Рассчитать стоимость
            </a>
            <a
              href="#projects"
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-neutral-200 bg-white px-7 text-sm font-medium text-neutral-950 transition-all hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98] sm:w-auto sm:self-center"
            >
              Посмотреть проекты
            </a>
            <a
              href={links.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-full items-center justify-center rounded-full px-4 text-sm font-medium text-neutral-500 transition-all hover:text-neutral-950 active:scale-[0.98] sm:w-auto sm:self-center sm:px-7"
            >
              <span className="sm:hidden">Написать руководителю →</span>
              <span className="hidden sm:inline">
                Связаться с руководителем проекта →
              </span>
            </a>
          </div>
        </div>

        <div className="animate-fade-up animation-delay-400 mx-auto mt-12 max-w-4xl sm:mt-16 md:mt-24">
          <div className="rounded-[1.75rem] border border-neutral-200/80 bg-white p-2 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.08)] sm:rounded-[2rem] md:rounded-[2.5rem]">
            <div className="rounded-[1.25rem] bg-neutral-50 p-6 sm:rounded-[1.5rem] sm:p-8 md:rounded-[2rem] md:p-12">
              <div className="grid gap-6 sm:grid-cols-3 sm:gap-4">
                {[
                  { value: "1", label: "ответственный за весь проект" },
                  { value: "15 мин", label: "ответ на заявку" },
                  { value: "100%", label: "прозрачная смета" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="border-b border-neutral-200/70 pb-5 text-center last:border-b-0 last:pb-0 sm:border-b-0 sm:pb-0 sm:text-left"
                  >
                    <p className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl md:text-4xl">
                      {item.value}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
