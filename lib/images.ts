import "server-only";
import sharp from "sharp";

/**
 * Обработка загруженных фото: поворот по EXIF, уменьшение, перевод в webp.
 * Метаданные (в том числе геолокация съёмки) вырезаются.
 */
export async function processPhoto(input: Buffer) {
  const base = sharp(input, { limitInputPixels: 60_000_000, failOn: "error" }).rotate();
  const meta = await sharp(input, { limitInputPixels: 60_000_000 }).metadata();
  if (!meta.width || !meta.height || !["jpeg", "png", "webp"].includes(meta.format ?? "")) {
    throw new Error("Подойдут только фото JPG, PNG или WebP");
  }
  const full = await base
    .clone()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  const thumb = await base
    .clone()
    .resize({ width: 560, height: 420, fit: "cover" })
    .webp({ quality: 72 })
    .toBuffer();
  return { full, thumb };
}

export async function processAvatar(input: Buffer) {
  const meta = await sharp(input, { limitInputPixels: 60_000_000 }).metadata();
  if (!meta.width || !["jpeg", "png", "webp"].includes(meta.format ?? "")) {
    throw new Error("Подойдут только фото JPG, PNG или WebP");
  }
  const full = await sharp(input, { limitInputPixels: 60_000_000 })
    .rotate()
    .resize({ width: 480, height: 480, fit: "cover" })
    .webp({ quality: 80 })
    .toBuffer();
  return { full };
}
