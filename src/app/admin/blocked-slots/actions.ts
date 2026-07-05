"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/features/auth/application/require-role";
import { createBlockedSlot, deleteBlockedSlot } from "@/features/availability/application/manage-schedule";

export async function createBlockedSlotAction(input: { roomId: string; startTime: string; endTime: string; reason: string }) {
  try {
    await createBlockedSlot(await requireRole("ADMIN"), input);
    revalidatePath("/admin/blocked-slots");
    return { ok: true, message: "Đã chặn khung giờ." } as const;
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Không thể chặn lịch." } as const;
  }
}

export async function deleteBlockedSlotAction(id: string): Promise<void> {
  await deleteBlockedSlot(await requireRole("ADMIN"), id);
  revalidatePath("/admin/blocked-slots");
}
