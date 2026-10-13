"use client";

import { useState } from "react";
import { Section } from "./Section";

const pairs = [
  {
    title: "Прихожая",
    before: "/before-after/prikhozhaya-do.jpg",
    after: "/before-after/prikhozhaya-posle.jpg",
  },
  {
    title: "Жилая комната",
    before: "/before-after/komnata-do.jpg",
    after: "/before-after/komnata-posle.jpg",
  },
];

function Pair({ title, before, after }: (typeof pairs)[number]) {
  const [pos, setPos] = useState(50);
  return (
    <figure className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white">
      <div className="relative aspect-[3/4] select-none bg-neutral-100">
        <img
          src={after}
          alt={`${title}, после ремонта`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <img
          src={before}
          alt={`${title}, до ремонта`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.4)]"
          style={{ left: `${pos}%` }}
        />
        <span className="absolute left-3 top-3 rounded-full bg-neutral-950/70 px-3 py-1 text-xs font-medium text-white">
          До
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-900">
          После
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={`Сравнить до и после: ${title}`}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="px-5 py-4 text-sm font-medium text-neutral-800">
        {title}
        <span className="ml-2 font-normal text-neutral-400">
          потяните, чтобы сравнить
        </span>
      </figcaption>
    </figure>
  );
}

const videos = [
  {
    src: "/video/obhod-kvartira.mp4",
    poster: "/video/obhod-kvartira.jpg",
    title: "Обход готовой квартиры",
  },
  {
    src: "/video/obhod-kollektor.mp4",
    poster: "/video/obhod-kollektor.jpg",
    title: "Сантехника и коллекторы изнутри",
  },
];

export function BeforeAfter() {
  return (
    <Section
      id="before-after"
      label="До и после"
      title="Как квартира меняется за время ремонта"
      description="Реальные объекты нашей бригады. Потяните ползунок, чтобы сравнить."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:mx-auto lg:max-w-3xl">
        {pairs.map((p) => (
          <Pair key={p.title} {...p} />
        ))}
      </div>

      <h3 className="mb-6 mt-16 text-xl font-semibold tracking-tight md:text-2xl">
        Видео с объектов
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:mx-auto lg:max-w-3xl">
        {videos.map((v) => (
          <figure
            key={v.src}
            className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white"
          >
            <video
              controls
              playsInline
              preload="none"
              poster={v.poster}
              className="aspect-[9/16] w-full bg-neutral-950 object-cover"
            >
              <source src={v.src} type="video/mp4" />
            </video>
            <figcaption className="px-5 py-4 text-sm font-medium text-neutral-800">
              {v.title}
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
