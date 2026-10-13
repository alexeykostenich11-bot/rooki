/** Справочники для анкеты мастера. Меняй списки здесь. */

export const SPECIALTIES = [
  "Универсал (весь ремонт)",
  "Электрик",
  "Сантехник",
  "Плиточник",
  "Штукатур",
  "Маляр",
  "Мастер по полам",
  "Потолки (натяжные, гипсокартон)",
  "Монтаж гипсокартона",
  "Столяр, мебель",
  "Демонтаж",
  "Бригада под ключ",
] as const;

export const WORK_PRESETS = [
  "Демонтаж покрытий и перегородок",
  "Штукатурка стен",
  "Шпаклёвка и покраска стен",
  "Стяжка пола",
  "Укладка плитки на пол",
  "Укладка плитки на стены",
  "Укладка ламината",
  "Монтаж гипсокартона",
  "Натяжной потолок",
  "Электромонтаж, точка",
  "Сантехника, точка",
  "Монтаж дверей",
  "Поклейка обоев",
  "Ремонт под ключ",
];

export const UNITS = ["м²", "м.п.", "шт.", "точка", "объект", "час", "день"] as const;

export const TEAM_TYPES = {
  solo: "Работаю один",
  crew: "Бригада",
} as const;

export const STATUS_LABEL = {
  draft: "Черновик",
  pending: "На проверке",
  approved: "Опубликовано",
  rejected: "Отклонено",
} as const;

export type Status = keyof typeof STATUS_LABEL;

export const LIMITS = {
  maxPrices: 20,
  maxProjects: 30,
  maxPhotosPerProject: 12,
  maxUploadBytes: 10 * 1024 * 1024,
  aboutMin: 30,
  aboutMax: 2000,
  projectDescMax: 3000,
} as const;
