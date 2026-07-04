"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { requireRole } from "@/features/auth/application/require-role";
import { DuplicateServiceSlugError, upsertService, type ServiceInput, setServiceActive } from "@/features/service/application/manage-service";
import type { AdminActionResult } from "@/app/admin/rooms/actions";

export async function saveServiceAction(input: ServiceInput): Promise<AdminActionResult> {
  try {
    await upsertService(await requireRole("ADMIN"), input);
    revalidatePath("/admin/services"); revalidatePath("/studios");
    return { ok: true, message: "Đã lưu dịch vụ." };
  } catch (error) {
    if (error instanceof DuplicateServiceSlugError) return { ok: false, message: error.message };
    if (error instanceof ZodError) return { ok: false, message: error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };
    throw error;
  }
}

export async function setServiceActiveAction(id: string, active: boolean): Promise<void> {
  await setServiceActive(await requireRole("ADMIN"), id, active);
  revalidatePath("/admin/services"); revalidatePath("/studios");
}
