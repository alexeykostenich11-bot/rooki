/**
 * Опубликованные отзывы. Показываются на сайте в блоке «Отзывы».
 * Ранее опубликованные отзывы. Новые проходят модерацию в Telegram
 * и хранятся отдельно в Redis (review-store.ts).
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
