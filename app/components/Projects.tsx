import { links } from "@/lib/links";
import { Section } from "./Section";

const projects = [
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

export function Projects() {
  return (
    <Section
      id="projects"
      label="Наши проекты"
      title="Смотрите реальные объекты в соцсетях"
      className="bg-neutral-50/60"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {projects.map((project, index) => (
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
      <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {[
          "https://res.cloudinary.com/dfy58ww6t/image/upload/f_auto,q_auto/IMG_20260624_233731_xn2ghn",
          "https://res.cloudinary.com/dfy58ww6t/image/upload/f_auto,q_auto/IMG_20260624_233759_hjo2hs",
        ].map((src, i) => (
          <div key={i} className="mb-4 overflow-hidden rounded-2xl">
            <img
              src={src}
              alt={`Проект ${i + 1}`}
              className="w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        ))}
      </div>
    </Section>
  );
}
