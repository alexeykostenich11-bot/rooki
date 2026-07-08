"use client";

import { useState } from "react";
import { links } from "@/lib/links";
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
    title: "Дизайн-проект",
    description: "Планировка, визуализация и спецификация материалов до начала работ.",
    hasModal: true,
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

const designProjectPoints = [
  "Обмер помещения и разработка планировочных решений",
  "3D-визуализация каждой комнаты с подбором материалов и мебели",
  "Спецификация: полный список материалов с артикулами для закупки",
  "Чертежи для монтажа: электрика, сантехника, потолки, полы",
  "Авторский надзор на этапе ремонта — сверяем с проектом на месте",
];

export function Services() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Section
      id="services"
      label="Наши услуги"
      title="Полный цикл — от черновых работ до готового интерьера"
      className="bg-neutral-50/60"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service, index) => {
          const content = (
            <>
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-neutral-950">
                  {service.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
                  {service.description}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="h-px w-full bg-neutral-100 transition-colors group-hover:bg-neutral-200" />
                {service.hasModal && (
                  <span className="ml-4 shrink-0 text-sm font-medium text-neutral-400 transition-colors group-hover:text-neutral-950">
                    Подробнее →
                  </span>
                )}
              </div>
            </>
          );

          const className =
            "animate-fade-up group flex flex-col justify-between rounded-3xl border border-neutral-200/60 bg-white p-7 text-left transition-all duration-300 hover:border-neutral-300 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.1)] md:p-8";
          const style = { animationDelay: `${index * 80}ms` };

          if (service.hasModal) {
            return (
              <button
                key={service.title}
                type="button"
                onClick={() => setModalOpen(true)}
                className={className}
                style={style}
              >
                {content}
              </button>
            );
          }

          return (
            <article key={service.title} className={className} style={style}>
              {content}
            </article>
          );
        })}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-950/60 p-4 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-7 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-2xl font-semibold tracking-tight text-neutral-950">
                Дизайн-проект
              </h3>
              <button
                type="button"
                aria-label="Закрыть"
                onClick={() => setModalOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-950"
              >
                ✕
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              Прежде чем начать ремонт, важно увидеть итоговый результат и
              избежать переделок. Разрабатываем полный пакет документов, по
              которому вы и бригада будете ориентироваться на всех этапах.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {designProjectPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-neutral-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-950" />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={links.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-medium text-white transition-all hover:bg-neutral-800 active:scale-[0.98]"
              >
                Обсудить в Telegram
              </a>
              <a
                href="#contact"
                onClick={() => setModalOpen(false)}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-neutral-200 px-6 text-sm font-medium text-neutral-950 transition-all hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98]"
              >
                Оставить заявку
              </a>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
