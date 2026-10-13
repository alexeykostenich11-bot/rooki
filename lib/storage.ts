import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

/**
 * Хранилище файлов.
 * - Если заданы S3_* переменные (Timeweb S3 и любой S3-совместимый): файлы лежат в бакете.
 * - Иначе: на диске в UPLOAD_DIR (подходит для разработки и обычного сервера с постоянным диском).
 */

const s3Enabled = Boolean(
  process.env.S3_BUCKET &&
    process.env.S3_ENDPOINT &&
    process.env.S3_ACCESS_KEY &&
    process.env.S3_SECRET_KEY
);

let client: S3Client | null = null;
function s3() {
  return (client ??= new S3Client({
    region: process.env.S3_REGION || "ru-1",
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    },
  }));
}

const uploadDir = () => path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || ".uploads");

function safeLocalPath(key: string): string | null {
  if (!/^[a-zA-Z0-9/_.-]+$/.test(key) || key.includes("..")) return null;
  const full = path.resolve(/*turbopackIgnore: true*/ uploadDir(), key);
  return full.startsWith(uploadDir() + path.sep) ? full : null;
}

export async function putObject(key: string, body: Buffer, contentType: string) {
  if (s3Enabled) {
    await s3().send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
    return;
  }
  const full = safeLocalPath(key);
  if (!full) throw new Error("Недопустимый ключ файла");
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, body);
}

export async function deleteObject(key: string) {
  try {
    if (s3Enabled) {
      await s3().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
      return;
    }
    const full = safeLocalPath(key);
    if (full) await fs.rm(full, { force: true });
  } catch (e) {
    console.error("Не удалось удалить файл", key, e);
  }
}

export async function readLocalObject(key: string): Promise<Buffer | null> {
  if (s3Enabled) return null;
  const full = safeLocalPath(key);
  if (!full) return null;
  try {
    return await fs.readFile(full);
  } catch {
    return null;
  }
}

/** Адрес картинки для <img>. Для S3 нужен S3_PUBLIC_URL, например https://bucket.s3.twcstorage.ru */
export function publicUrl(key: string): string {
  if (s3Enabled) {
    const base = (process.env.S3_PUBLIC_URL || "").replace(/\/$/, "");
    return `${base}/${key}`;
  }
  return `/api/media/${key}`;
}

export const thumbKey = (key: string) => key.replace(/\.webp$/, "-sm.webp");
