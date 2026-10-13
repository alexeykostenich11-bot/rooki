import { readLocalObject } from "@/lib/storage";

/** Отдаёт файлы с диска, когда S3 не настроен (разработка или сервер с постоянным диском). */
export async function GET(_: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const data = await readLocalObject(key.join("/"));
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
