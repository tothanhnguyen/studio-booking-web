"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { requireRole } from "@/features/auth/application/require-role";
import { DuplicateSlugError, upsertRoom, type RoomInput, setRoomActive } from "@/features/studio-room/application/manage-room";

export type AdminActionResult = Readonly<{ ok: boolean; message: string }>;

export async function saveRoomAction(input: RoomInput): Promise<AdminActionResult> {
  try {
    await upsertRoom(await requireRole("ADMIN"), input);
    revalidatePath("/admin/rooms"); revalidatePath("/studios");
    return { ok: true, message: "Đã lưu phòng studio." };
  } catch (error) {
    if (error instanceof DuplicateSlugError) return { ok: false, message: error.message };
    if (error instanceof ZodError) return { ok: false, message: error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };
    throw error;
  }
}

export async function setRoomActiveAction(id: string, active: boolean): Promise<void> {
  await setRoomActive(await requireRole("ADMIN"), id, active);
  revalidatePath("/admin/rooms"); revalidatePath("/studios");
}
