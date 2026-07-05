import type { WorkingWindow } from "@/features/availability/application/availability-types";

export type WorkingHourRecord = WorkingWindow & Readonly<{ id: string; roomId: string; weekday: number }>;
export type BlockedSlotRecord = Readonly<{ id: string; roomId: string; startTime: string; endTime: string; reason: string }>;
export type CreateBlockedSlotData = Omit<BlockedSlotRecord, "id">;

export interface ScheduleRepository {
  listWorkingHours(roomId: string): Promise<WorkingHourRecord[]>;
  replaceWorkingHours(roomId: string, weekday: number, windows: readonly WorkingWindow[]): Promise<void>;
  listBlockedSlots(roomId?: string): Promise<BlockedSlotRecord[]>;
  createBlockedSlot(input: CreateBlockedSlotData): Promise<BlockedSlotRecord>;
  deleteBlockedSlot(id: string): Promise<void>;
}
