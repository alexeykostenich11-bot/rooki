"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { btnGhostCls } from "./ui";

/** Загрузка фото по одному, с прогрессом. kind: avatar или project. */
export function Uploader({
  kind,
  projectId,
  multiple = false,
  label,
}: {
  kind: "avatar" | "project";
  projectId?: string;
  multiple?: boolean;
  label: string;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onChange() {
    const files = Array.from(input.current?.files ?? []);
    if (!files.length) return;
    setError(null);
    for (let i = 0; i < files.length; i++) {
      setBusy(`Загружаем ${i + 1} из ${files.length}…`);
      const fd = new FormData();
      fd.append("file", files[i]);
      fd.append("kind", kind);
      if (projectId) fd.append("projectId", projectId);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          setError(data.error || "Не удалось загрузить фото");
          break;
        }
      } catch {
        setError("Нет связи. Проверьте интернет и повторите.");
        break;
      }
    }
    setBusy(null);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  return (
    <div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple}
        onChange={onChange} className="sr-only" id={`up-${kind}-${projectId ?? "me"}`} />
      <label htmlFor={`up-${kind}-${projectId ?? "me"}`} className={`${btnGhostCls} cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}>
        {busy ?? label}
      </label>
      {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}
