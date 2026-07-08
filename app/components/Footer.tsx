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

      <div className="border-t border-neutral-200/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-4 py-10 sm:justify-start sm:px-6 md:px-8">
          {(
            [
              ["/qr/qr-site.svg", "Сайт", "rooki-remont.ru"],
              ["/qr/qr-instagram.svg", "Instagram", "@rooki.remont"],
              ["/qr/qr-telegram.svg", "Telegram", "@rooki_remont"],
            ] as const
          ).map(([src, label, sub]) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className="h-20 w-20 overflow-hidden rounded-xl border border-neutral-200 p-1.5">
                <img src={src} alt={`QR-код: ${label}`} className="h-full w-full" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-neutral-700">{label}</p>
                <p className="text-[11px] text-neutral-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
