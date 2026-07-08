"use client";

import { useState } from "react";
import { links } from "@/lib/links";
import { Section } from "./Section";

const socials = [
  {
    name: "Instagram",
    description: "Фото готовых объектов и процесс работ",
    href: links.instagram,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <rect
          x="2"
          y="2"
          width="20"
          height="20"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Telegram",
    description: "Канал с проектами и полезными материалами",
    href: links.telegram,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <path
          d="M21 4L3 11l7 2 2 7 9-16z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    description: "Напишите нам — ответим быстро",
    href: links.whatsapp,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <path
          d="M12 3a9 9 0 00-7.8 13.5L3 21l4.6-1.2A9 9 0 1012 3z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 10.5c.3.6 1.2 2.3 3 3.2 1 .5 1.8.7 2.2.8.4.1.8 0 1.1-.3l.7-.7c.2-.2.5-.2.7 0l1.3 1.2c.2.2.2.5 0 .7-.5.6-1.2 1.2-2 1.5-1 .4-2.1.3-3.5-.4-1.8-.9-3.3-2.5-4-4.2-.5-1.2-.6-2.2-.3-3 .2-.5.6-1 1-1.3.2-.2.5-.2.7 0l1 1.1c.2.2.2.5 0 .7l-.4.4c-.1.1-.1.3 0 .5z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

const gallery = [
  { src: "/projects/zelenaya-stena-1.jpg", caption: "Акцентная стена, гостиная", tag: "Готовый объект" },
  { src: "/projects/zelenaya-stena-2.jpg", caption: "Акцентная стена, деталь", tag: "Готовый объект" },
  { src: "/projects/vannaya-zerkalo.jpg", caption: "Санузел, зона умывальника", tag: "Готовый объект" },
  { src: "/projects/vannaya-dush.jpg", caption: "Санузел, душевая зона", tag: "Готовый объект" },
  { src: "/projects/rebristaya-panel-1.jpg", caption: "Рельефная стеновая панель", tag: "Готовый объект" },
  { src: "/projects/rebristaya-panel-2.jpg", caption: "Рельефная панель, деталь", tag: "Готовый объект" },
  { src: "/projects/mansarda.jpg", caption: "Мансардный этаж", tag: "Готовый объект" },
  { src: "/projects/lestnitsa-mramor.jpg", caption: "Холл, мрамор и шпон", tag: "Готовый объект" },
  { src: "/projects/gostinaya-proekt.jpg", caption: "Гостиная-кухня", tag: "Дизайн-проект" },
  { src: "/projects/kuhnya-proekt.jpg", caption: "Кухня", tag: "Дизайн-проект" },
];

export function Projects() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <Section
      id="projects"
      label="Наши проекты"
      title="Реальные объекты и дизайн-проекты"
      className="bg-neutral-50/60"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {gallery.map((item, index) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative aspect-square overflow-hidden rounded-2xl bg-neutral-100"
          >
            <img
              src={item.src}
              alt={item.caption}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-neutral-700 backdrop-blur-sm">
              {item.tag}
            </span>
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-left text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              {item.caption}
            </span>
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-950/90 p-4 backdrop-blur-sm"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            aria-label="Закрыть"
            onClick={() => setActiveIndex(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            ✕
          </button>
          <div
            className="max-h-[85vh] max-w-3xl overflow-hidden rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={gallery[activeIndex].src}
              alt={gallery[activeIndex].caption}
              className="max-h-[85vh] w-full object-contain"
            />
            <div className="bg-neutral-950 px-4 py-3 text-center text-sm text-white">
              {gallery[activeIndex].caption} · {gallery[activeIndex].tag}
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {socials.map((project, index) => (
          <a
            key={project.name}
            href={project.href}
            target={project.href.startsWith("http") ? "_blank" : undefined}
            rel={
              project.href.startsWith("http")
                ? "noopener noreferrer"
                : undefined
            }
            className="animate-fade-up group flex flex-col rounded-3xl border border-neutral-200/80 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.12)] md:p-8"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700 transition-colors group-hover:bg-neutral-950 group-hover:text-white">
              {project.icon}
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-neutral-950">
              {project.name}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-500">
              {project.description}
            </p>
            <span className="mt-5 text-sm font-medium text-neutral-400 transition-colors group-hover:text-neutral-950">
              Перейти →
            </span>
          </a>
        ))}
      </div>
    </Section>
  );
}
