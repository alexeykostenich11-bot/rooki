import { links } from "@/lib/links";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

const navItems = [
  { href: "#services", label: "Услуги" },
  { href: "#process", label: "Процесс" },
  { href: "#projects", label: "Проекты" },
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
          <a
            href={links.whatsapp}
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
