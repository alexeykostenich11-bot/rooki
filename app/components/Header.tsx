import { links } from "@/lib/links";
import { Logo } from "./Logo";
import { AuthLink } from "./AuthLink";
import { MobileMenu } from "./MobileMenu";

const navItems = [
  { href: "/#calc", label: "Калькулятор" },
  { href: "/#projects", label: "Проекты" },
  { href: "/#services", label: "Услуги" },
  { href: "/#process", label: "Процесс" },
  { href: "/masters", label: "Мастера" },
];

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-neutral-200/60 bg-white/80 backdrop-blur-xl safe-top">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 md:h-[4.5rem] md:px-8">
        <Logo showTagline className="min-w-0 shrink" />

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-neutral-500 transition-colors hover:text-neutral-950"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <AuthLink className="hidden rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-950 sm:inline-flex" />
          <a
            href={links.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-neutral-800 hover:shadow-lg hover:shadow-neutral-950/10 active:scale-[0.98] sm:inline-flex"
          >
            Связаться
          </a>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
