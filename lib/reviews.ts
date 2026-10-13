/**
 * Опубликованные отзывы. Показываются на сайте в блоке «Отзывы».
 * Новые отзывы приходят в Telegram, после проверки их добавляют сюда
 * (строка для вставки уже лежит в сообщении).
 * Только настоящие отзывы и только с согласия клиента.
 */
export type Review = {
  name: string;
  object: string;
  text: string;
  /** 1–5 */
  rating?: number;
  source?: string;
};

export const reviews: Review[] = [];
