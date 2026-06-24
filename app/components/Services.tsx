import { Section } from "./Section";

const services = [
  {
    title: "Черновой ремонт",
    description: "Подготовка помещения: стяжка, штукатурка, разводка коммуникаций.",
  },
  {
    title: "Капитальный ремонт",
    description: "Полная перепланировка пространства с заменой всех инженерных систем.",
  },
  {
    title: "Ремонт под ключ",
    description: "От демонтажа до финальной уборки — вы получаете готовую квартиру.",
  },
  {
    title: "Комплектация материалами",
    description: "Подбор и закупка материалов с контролем качества и сроков поставки.",
  },
  {
    title: "Мебель под заказ",
    description: "Проектирование и изготовление мебели под ваш интерьер и задачи.",
  },
];

export function Services() {
  return (
    <Section
      id="services"
      label="Наши услуги"
      title="Полный цикл — от черновых работ до готового интерьера"
      className="bg-neutral-50/60"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service, index) => (
          <article
            key={service.title}
            className="animate-fade-up group flex flex-col justify-between rounded-3xl border border-neutral-200/60 bg-white p-7 transition-all duration-300 hover:border-neutral-300 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.1)] md:p-8"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-neutral-950">
                {service.title}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
                {service.description}
              </p>
            </div>
            <div className="mt-6 h-px w-full bg-neutral-100 transition-colors group-hover:bg-neutral-200" />
          </article>
        ))}
      </div>
    </Section>
  );
}
