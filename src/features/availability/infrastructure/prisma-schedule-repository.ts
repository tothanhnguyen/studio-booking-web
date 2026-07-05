import type { PrismaClient } from "@/generated/prisma/client";
import { formatInTimeZone } from "date-fns-tz";
import type { WorkingWindow } from "@/features/availability/application/availability-types";
import type { BlockedSlotRecord, CreateBlockedSlotData, ScheduleRepository, WorkingHourRecord } from "@/features/availability/application/schedule-repository";

export class PrismaScheduleRepository implements ScheduleRepository {
  constructor(private readonly client: PrismaClient) {}

  async listWorkingHours(roomId: string): Promise<WorkingHourRecord[]> {
    return this.client.workingHour.findMany({ where: { roomId, isActive: true }, orderBy: [{ weekday: "asc" }, { openMinute: "asc" }], select: { id: true, roomId: true, weekday: true, openMinute: true, closeMinute: true } });
  }

  async replaceWorkingHours(roomId: string, weekday: number, windows: readonly WorkingWindow[]): Promise<void> {
    const sorted = [...windows].sort((a, b) => a.openMinute - b.openMinute);
    if (sorted.some((window, index) => index > 0 && window.openMinute < sorted[index - 1]!.closeMinute)) throw new RangeError("Working windows overlap");
    await this.client.$transaction(async (tx) => {
      await tx.workingHour.deleteMany({ where: { roomId, weekday } });
      if (windows.length) await tx.workingHour.createMany({ data: windows.map((window) => ({ ...window, roomId, weekday })) });
    });
  }

  async listBlockedSlots(roomId?: string): Promise<BlockedSlotRecord[]> {
    const rows = await this.client.blockedSlot.findMany({ where: roomId ? { roomId } : undefined, orderBy: { startTime: "asc" }, select: { id: true, roomId: true, startTime: true, endTime: true, reason: true } });
    return rows.map((row) => ({ ...row, startTime: row.startTime.toISOString(), endTime: row.endTime.toISOString() }));
  }

  async createBlockedSlot(input: CreateBlockedSlotData): Promise<BlockedSlotRecord> {
    if (Date.parse(input.startTime) >= Date.parse(input.endTime)) throw new RangeError("Blocked slot end must be after start");
    const timezone = "Asia/Ho_Chi_Minh";
    if (formatInTimeZone(input.startTime, timezone, "yyyy-MM-dd") !== formatInTimeZone(new Date(Date.parse(input.endTime) - 1), timezone, "yyyy-MM-dd")) throw new RangeError("Blocked slot must stay within one local day");
    const row = await this.client.blockedSlot.create({ data: { ...input, startTime: new Date(input.startTime), endTime: new Date(input.endTime) }, select: { id: true, roomId: true, startTime: true, endTime: true, reason: true } });
    return { ...row, startTime: row.startTime.toISOString(), endTime: row.endTime.toISOString() };
  }

  async deleteBlockedSlot(id: string): Promise<void> { await this.client.blockedSlot.delete({ where: { id } }); }
}
