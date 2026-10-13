import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { LoginForm } from "../components/AuthForm";
import { PageShell } from "../components/ui";

export const metadata: Metadata = { title: "Вход", robots: { index: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getCurrentUser()) redirect("/cabinet");
  const { next } = await searchParams;
  return (
    <>
      <Header />
      <PageShell>
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl md:text-4xl">Вход</h1>
        </header>
        <LoginForm next={next} />
      </PageShell>
      <Footer />
    </>
  );
}
