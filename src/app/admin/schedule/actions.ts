"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/features/auth/application/require-role";
import { replaceWorkingHours } from "@/features/availability/application/manage-schedule";
import type { WorkingWindow } from "@/features/availability/application/availability-types";

export async function saveScheduleAction(input: { roomId: string; weekday: number; windows: WorkingWindow[] }) {
  try {
    await replaceWorkingHours(await requireRole("ADMIN"), input.roomId, input.weekday, input.windows);
    revalidatePath("/admin/schedule");
    return { ok: true, message: "Đã cập nhật giờ làm việc." } as const;
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Không thể cập nhật lịch." } as const;
  }
}
