"use client";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { goal, METRIKA_ID } from "@/lib/analytics";
export function Analytics() {
  const [choice, setChoice] = useState<string | null>(null);
  const initialized = useRef(false);
  useEffect(() => {
    if (choice !== "yes" || window.ym) return;
    const queue: NonNullable<Window["ym"]> = function (...args: unknown[]) { (queue.a ||= []).push(args); };
    queue.l = Date.now();
    window.ym = queue;
  }, [choice]);
  useEffect(() => {
    try { setChoice(localStorage.getItem("rooki-analytics") || "ask"); } catch { setChoice("ask"); }
    const settings = () => setChoice("ask");
    const clicks = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      const href = link?.getAttribute("href") || "";
      if (href.startsWith("tel:")) goal("phone_click");
      else if (/^https:\/\/(t\.me|wa\.me|max\.ru)\//.test(href)) goal("messenger_click", { channel: new URL(href).hostname });
    };
    window.addEventListener("rooki-analytics-settings", settings);
    document.addEventListener("click", clicks);
    return () => { window.removeEventListener("rooki-analytics-settings", settings); document.removeEventListener("click", clicks); };
  }, []);
  if (!Number.isSafeInteger(METRIKA_ID) || METRIKA_ID <= 0) return null;
  function decide(value: "yes" | "no") {
    try { localStorage.setItem("rooki-analytics", value); } catch {}
    setChoice(value);
    if (value === "no" && initialized.current) { window.ym?.(METRIKA_ID, "destruct"); initialized.current = false; }
  }
  function init() {
    if (initialized.current || !window.ym) return;
    initialized.current = true;
    window.ym(METRIKA_ID, "init", { clickmap: false, trackLinks: false, webvisor: false, accurateTrackBounce: true, defer: true });
    const url = new URL(window.location.pathname, window.location.origin);
    const params = new URLSearchParams(window.location.search);
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "yclid"]) { const value = params.get(key); if (value) url.searchParams.set(key, value.slice(0, 200)); }
    let referer = "";
    try { referer = document.referrer ? new URL(document.referrer).origin : ""; } catch {}
    window.ym(METRIKA_ID, "hit", url.href, { referer, title: document.title });
  }
  return <>
    {choice === "yes" && <Script id="yandex-metrika" strategy="afterInteractive" src="https://mc.yandex.ru/metrika/tag.js" onReady={init} />}
    {choice === "ask" && <aside aria-label="Настройки статистики" className="fixed inset-x-4 bottom-24 z-[60] mx-auto max-w-lg rounded-2xl border border-neutral-200 bg-white p-5 text-sm shadow-lg md:bottom-4"><p>Разрешить Яндекс Метрике собирать статистику посещений и обращений? Имя, телефон и текст заявки в цели Метрики не передаём. <a className="underline" href="/privacy">Подробнее</a></p><div className="mt-4 flex gap-3"><button onClick={() => decide("yes")} className="rounded-full bg-neutral-950 px-5 py-2 text-white">Разрешить</button><button onClick={() => decide("no")} className="rounded-full border px-5 py-2">Без статистики</button></div></aside>}
  </>;
}
