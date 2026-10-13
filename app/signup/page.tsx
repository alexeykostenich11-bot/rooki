import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { SignupForm } from "../components/AuthForm";
import { PageShell } from "../components/ui";

export const metadata: Metadata = {
  title: "Регистрация",
  description: "Создайте кабинет мастера или заказчика ROOKI.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  if (await getCurrentUser()) redirect("/cabinet");
  const { role } = await searchParams;
  const initialRole = role === "master" ? "master" : "customer";
  return (
    <>
      <Header />
      <PageShell>
        <header className="mb-8 text-center">
          <p className="mb-3 text-xs font-medium tracking-wide text-neutral-400 uppercase sm:text-sm">Регистрация</p>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl md:text-4xl">
            {initialRole === "master" ? "Покажите свои работы заказчикам" : "Найдите проверенного мастера"}
          </h1>
        </header>
        <SignupForm initialRole={initialRole} />
      </PageShell>
      <Footer />
    </>
  );
}
