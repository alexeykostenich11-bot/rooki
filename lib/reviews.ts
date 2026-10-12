/**
 * Отзывы клиентов. Пока список пустой, блок на сайте не показывается.
 * Добавляй только настоящие отзывы (с согласия клиента), по образцу:
 * { name: "Анна", object: "2-комн., 58 м², Москва", text: "...", source: "Авито" }
 */
export type Review = {
  name: string;
  object: string;
  text: string;
  source?: string;
};

export const reviews: Review[] = [];
