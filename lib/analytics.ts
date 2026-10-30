export const METRIKA_ID = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || 0);
export type Goal = "lead_success" | "lead_error" | "phone_click" | "messenger_click" | "calc_interaction";
type Ym = ((id: number, method: string, ...args: unknown[]) => void) & { a?: unknown[][]; l?: number };
declare global { interface Window { ym?: Ym } }
export function goal(name: Goal, params?: Record<string, string>) {
  try {
    if (METRIKA_ID > 0 && localStorage.getItem("rooki-analytics") === "yes") window.ym?.(METRIKA_ID, "reachGoal", name, params);
  } catch { /* Analytics must never block an enquiry. */ }
}
export function leadSource(form: string) {
  const params = new URLSearchParams(window.location.search);
  const campaign: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "yclid"]) {
    const value = params.get(key);
    if (value) campaign[key] = value.slice(0, 200);
  }
  let referrer = "";
  try { referrer = document.referrer ? new URL(document.referrer).hostname : ""; } catch {}
  return { form, page: window.location.pathname, referrer, ...campaign };
}
