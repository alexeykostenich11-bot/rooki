"use client";

import { useEffect, useState } from "react";
import { links } from "@/lib/links";

const navItems = [
  { href: "#why", label: "О нас" },
  { href: "#services", label: "Услуги" },
  { href: "#process", label: "Процесс" },
  { href: "#projects", label: "Проекты" },
  { href: "#contact", label: "Заявка" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-950 transition-colors hover:bg-neutral-50"
      >
        <span className="relative block h-3.5 w-4">
          <span
            className={`absolute left-0 h-0.5 w-4 bg-current transition-all ${open ? "top-[6px] rotate-45" : "top-0"}`}
          />
          <span
            className={`absolute left-0 top-[6px] h-0.5 w-4 bg-current transition-all ${open ? "opacity-0" : "opacity-100"}`}
          />
          <span
            className={`absolute left-0 h-0.5 w-4 bg-current transition-all ${open ? "top-[6px] -rotate-45" : "top-[12px]"}`}
          />
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-neutral-950/20 backdrop-blur-sm" />
      )}

      <div
        className={`fixed inset-x-4 top-[4.75rem] z-50 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_24px_80px_-12px_rgba(0,0,0,0.18)] transition-all duration-300 md:hidden ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <nav className="flex flex-col p-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3.5 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-950"
            >
              {item.label}
            </a>
          ))}
          <a
            href={links.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="mt-1 rounded-2xl bg-neutral-950 px-4 py-3.5 text-center text-base font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Связаться в WhatsApp
          </a>
        </nav>
      </div>
    </div>
  );
}
