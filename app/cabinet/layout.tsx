import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logout } from "../auth-actions";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";

export const metadata: Metadata = { title: "Кабинет", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CabinetLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const tabs =
    user.role === "master"
      ? [
          { href: "/cabinet", label: "Обзор" },
          { href: "/cabinet/profile", label: "Анкета и цены" },
          { href: "/cabinet/projects", label: "Проекты" },
        ]
      : [{ href: "/cabinet", label: "Обзор" }];

  return (
    <>
      <Header />
      <main className="pt-16 md:pt-[4.5rem]">
        <section className="section-padding">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 md:px-8">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
                  {user.role === "master" ? "Кабинет мастера" : user.role === "admin" ? "Админ" : "Кабинет заказчика"}
                </p>
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">{user.display_name}</h1>
              </div>
              <form action={logout}>
                <button className="rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-600 transition-colors hover:text-neutral-950">
                  Выйти
                </button>
              </form>
            </div>
            <nav className="mb-8 flex gap-2 overflow-x-auto">
              {tabs.map((t) => (
                <Link key={t.href} href={t.href}
                  className="shrink-0 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:text-neutral-950">
                  {t.label}
                </Link>
              ))}
            </nav>
            {children}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
