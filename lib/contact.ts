export type Lead = { name: string; phone: string; area: string; objectType: string; location: string; comment: string; source: Record<string, string> };
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
export function parseLead(input: unknown): { lead: Lead } | { error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { error: "Проверьте данные заявки." };
  const data = input as Record<string, unknown>;
  if (data.website) return { error: "Не удалось отправить заявку. Свяжитесь с нами по телефону." };
  const digits = clean(data.phone, 40).replace(/\D/g, "");
  if (!/^[78]\d{10}$/.test(digits)) return { error: "Укажите российский телефон из 11 цифр, начиная с +7 или 8." };
  if (data.consent !== true) return { error: "Нужно согласие на обработку данных заявки." };
  const source: Record<string, string> = {};
  if (data.source && typeof data.source === "object" && !Array.isArray(data.source)) {
    for (const key of ["form", "page", "referrer", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "yclid"]) { const value = clean((data.source as Record<string, unknown>)[key], 200); if (value) source[key] = value; }
  }
  return { lead: { name: clean(data.name, 80) || "Не указано", phone: "+7" + digits.slice(1), area: clean(data.area, 60), objectType: clean(data.objectType, 80), location: clean(data.location, 120), comment: clean(data.comment, 1200), source } };
}
export function leadMessage(lead: Lead) {
  return ["Новая заявка с сайта ROOKI", `Имя: ${lead.name}`, `Телефон: ${lead.phone}`, `Объект: ${lead.objectType || "Не указано"}`, `Площадь: ${lead.area || "Не указано"}`, `Район: ${lead.location || "Не указано"}`, "", lead.comment || "Без комментария", "", "Источник обращения:", ...Object.entries(lead.source).map(([key, value]) => `${key}: ${value}`)].join("\n");
}
