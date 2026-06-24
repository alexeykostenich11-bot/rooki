import { links, phone } from "@/lib/links";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200/80 bg-white safe-bottom">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-end md:justify-between md:px-8 md:py-16">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-neutral-500">
            Москва и Московская область
          </p>
          <a
            href={`tel:${phone.tel}`}
            className="mt-2 inline-block text-sm font-medium text-neutral-950 transition-colors hover:text-neutral-600"
          >
            {phone.display}
          </a>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          {(
            [
              ["Instagram", links.instagram],
              ["Telegram", links.telegram],
              ["MAX", links.max],
              ["WhatsApp", links.whatsapp],
            ] as const
          ).map(([label, href]) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={
                href.startsWith("http") ? "noopener noreferrer" : undefined
              }
              className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-4 py-2.5 text-sm text-neutral-600 transition-all hover:border-neutral-300 hover:text-neutral-950 sm:justify-start"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
