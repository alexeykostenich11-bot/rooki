import { LEGAL_CONFIRMED } from "@/lib/legal";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="pt-16 md:pt-[4.5rem]">
        <section className="section-padding">
          <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 md:px-8">
            {!LEGAL_CONFIRMED && (
              <p className="mb-8 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                Черновик. Перед запуском заполните данные оператора в файле lib/legal.ts и покажите текст юристу.
              </p>
            )}
            <h1 className="mb-8 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">{title}</h1>
            <div className="space-y-4 leading-relaxed text-neutral-700 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-neutral-950 [&_li]:ml-5 [&_li]:list-disc">
              {children}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
