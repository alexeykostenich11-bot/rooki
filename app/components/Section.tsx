import { ReactNode } from "react";

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  label?: string;
  title?: string;
  description?: string;
};

export function Section({
  id,
  children,
  className = "",
  label,
  title,
  description,
}: SectionProps) {
  return (
    <section id={id} className={`section-padding ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8">
        {(label || title || description) && (
          <header className="mb-10 animate-fade-up md:mb-16">
            {label && (
              <p className="mb-3 text-xs font-medium tracking-wide text-neutral-400 uppercase sm:text-sm">
                {label}
              </p>
            )}
            {title && (
              <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl md:text-4xl md:leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-3 max-w-xl text-base leading-relaxed text-neutral-500 sm:mt-4 sm:text-lg">
                {description}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
