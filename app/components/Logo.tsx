import { site } from "@/lib/site";

type LogoProps = {
  className?: string;
  showTagline?: boolean;
};

export function Logo({ className = "", showTagline = false }: LogoProps) {
  return (
    <a
      href="#"
      className={`group inline-flex items-center gap-2.5 transition-opacity hover:opacity-80 ${className}`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-950 text-sm font-semibold text-white md:h-9 md:w-9 md:rounded-2xl">
        R
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-base font-semibold tracking-[0.18em] text-neutral-950 md:text-lg">
          {site.name}
        </span>
        {showTagline && (
          <span className="mt-1 text-[10px] font-medium tracking-wide text-neutral-400 uppercase md:text-[11px]">
            {site.tagline}
          </span>
        )}
      </span>
    </a>
  );
}
