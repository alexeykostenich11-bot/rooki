"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

const UUID = /^[0-9a-f-]{36}$/i;
const reason = (fd: FormData) => String(fd.get("reason") ?? "").trim().slice(0, 500) || "Не прошла проверку";

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/masters");
  revalidatePath("/cabinet", "layout");
}

export async function approveProfile(userId: string) {
  await requireUser(["admin"]);
  if (!UUID.test(userId)) return;
  await query(
    "update master_profiles set status = 'approved', reject_reason = null, reviewed_at = now() where user_id = $1",
    [userId]
  );
  refresh();
}

export async function rejectProfile(userId: string, fd: FormData) {
  await requireUser(["admin"]);
  if (!UUID.test(userId)) return;
  await query(
    "update master_profiles set status = 'rejected', reject_reason = $2, reviewed_at = now() where user_id = $1",
    [userId, reason(fd)]
  );
  refresh();
}

export async function approveProject(projectId: string) {
  await requireUser(["admin"]);
  if (!UUID.test(projectId)) return;
  await query("update projects set status = 'approved', reject_reason = null, updated_at = now() where id = $1", [projectId]);
  refresh();
}

export async function rejectProject(projectId: string, fd: FormData) {
  await requireUser(["admin"]);
  if (!UUID.test(projectId)) return;
  await query("update projects set status = 'rejected', reject_reason = $2, updated_at = now() where id = $1", [projectId, reason(fd)]);
  refresh();
}
