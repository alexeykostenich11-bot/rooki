"use client";
import { links, phone } from "@/lib/links";
export function ContactActions() {
  return <div className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-neutral-200 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden"><a href={`tel:${phone.tel}`} className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-neutral-950 text-sm font-medium text-white">Позвонить</a><a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className="flex min-h-12 flex-1 items-center justify-center rounded-full border border-neutral-300 text-sm font-medium">Написать</a></div>;
}
