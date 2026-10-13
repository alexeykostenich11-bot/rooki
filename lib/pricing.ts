/**
 * Ориентиры за м², только работы, без материалов.
 * Меняй цифры здесь: калькулятор на сайте подхватит их сам.
 * Сверяй со своими последними сметами (СметаАН).
 */
export const PRICING_CONFIRMED = true;

export const repairTypes = [
  {
    id: "rough",
    title: "Черновой ремонт",
    hint: "Демонтаж, стяжка, штукатурка, электрика, сантехника",
    from: 9000, // ₽/м², работы
    to: 12000,
  },
  {
    id: "capital",
    title: "Капитальный ремонт",
    hint: "Черновой этап + чистовая отделка и плитка",
    from: 15000,
    to: 19000,
  },
  {
    id: "turnkey",
    title: "Под ключ",
    hint: "Всё от демонтажа до уборки, со сдачей квартиры",
    from: 20000,
    to: 25000,
  },
] as const;

/** Вторичка: добавляем демонтаж и подготовку, это дороже новостройки */
export const objectTypes = [
  { id: "new", title: "Новостройка", factor: 1 },
  { id: "secondary", title: "Вторичка", factor: 1.12 },
] as const;

export const MIN_AREA = 20;
export const MAX_AREA = 300;
