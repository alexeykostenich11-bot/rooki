import { ReactNode } from "react";

export const inputCls =
  "h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50/50 px-4 text-base text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-950/5";

export const textareaCls =
  "w-full resize-y rounded-2xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-base text-neutral-950 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-950/5";

export const btnCls =
  "inline-flex h-12 items-center justify-center rounded-full bg-neutral-950 px-7 text-sm font-medium text-white transition-all hover:bg-neutral-800 hover:shadow-xl hover:shadow-neutral-950/15 active:scale-[0.98] disabled:opacity-60";

export const btnGhostCls =
  "inline-flex h-11 items-center justify-center rounded-full border border-neutral-200 bg-white px-5 text-sm font-medium text-neutral-950 transition-all hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98] disabled:opacity-60";

export const cardCls =
  "rounded-[1.75rem] border border-neutral-200/80 bg-white p-5 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.06)] sm:rounded-[2rem] sm:p-6 md:p-8";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-neutral-700">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-neutral-400">{hint}</span>}
    </label>
  );
}

export function PageShell({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <main className="pt-16 md:pt-[4.5rem]">
      <section className="section-padding">
        <div
          className={`mx-auto w-full px-4 sm:px-6 md:px-8 ${wide ? "max-w-6xl" : "max-w-xl"}`}
        >
          {children}
        </div>
      </section>
    </main>
  );
}

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-neutral-100 text-neutral-600",
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[status] ?? STATUS_STYLE.draft}`}
    >
      {label}
    </span>
  );
}
