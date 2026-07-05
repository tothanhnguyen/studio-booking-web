import { formatInTimeZone } from "date-fns-tz";
import { z } from "zod";

import type { Actor } from "@/features/auth/application/current-actor";
import { ForbiddenError } from "@/features/auth/application/require-role";
import type { WorkingWindow } from "@/features/availability/application/availability-types";
import type { CreateBlockedSlotData, ScheduleRepository } from "@/features/availability/application/schedule-repository";

const roomIdSchema = z.uuid();
const windowSchema = z.object({ openMinute: z.number().int().min(0).max(1439), closeMinute: z.number().int().min(1).max(1440) }).refine((value) => value.openMinute < value.closeMinute, "Giờ đóng cửa phải sau giờ mở cửa.");
const blockedSlotSchema = z.object({ roomId: z.uuid(), startTime: z.iso.datetime(), endTime: z.iso.datetime(), reason: z.string().trim().min(2, "Cần nhập lý do chặn lịch.") });

export type BlockedSlotInput = z.input<typeof blockedSlotSchema>;
type ScheduleWriter = Pick<ScheduleRepository, "replaceWorkingHours" | "createBlockedSlot" | "deleteBlockedSlot">;

function assertAdmin(actor: Actor) { if (actor.role !== "ADMIN") throw new ForbiddenError(); }

export function createScheduleManager(repository: ScheduleWriter) {
  return {
    async replaceWorkingHours(actor: Actor, roomId: string, weekday: number, input: readonly WorkingWindow[]) {
      assertAdmin(actor);
      roomIdSchema.parse(roomId);
      z.number().int().min(0).max(6).parse(weekday);
      const windows = input.map((window) => windowSchema.parse(window)).sort((a, b) => a.openMinute - b.openMinute);
      if (windows.some((window, index) => index > 0 && window.openMinute < windows[index - 1]!.closeMinute)) throw new RangeError("Các khung giờ làm việc không được chồng lấn.");
      await repository.replaceWorkingHours(roomId, weekday, windows);
    },
    async createBlockedSlot(actor: Actor, input: BlockedSlotInput) {
      assertAdmin(actor);
      const parsed = blockedSlotSchema.parse(input);
      if (Date.parse(parsed.startTime) >= Date.parse(parsed.endTime)) throw new RangeError("Thời gian kết thúc phải sau thời gian bắt đầu.");
      const timezone = "Asia/Ho_Chi_Minh";
      if (formatInTimeZone(parsed.startTime, timezone, "yyyy-MM-dd") !== formatInTimeZone(new Date(Date.parse(parsed.endTime) - 1), timezone, "yyyy-MM-dd")) {
        throw new RangeError("Slot bị chặn phải nằm trong cùng một ngày local.");
      }
      return repository.createBlockedSlot(parsed as CreateBlockedSlotData);
    },
    async deleteBlockedSlot(actor: Actor, blockedSlotId: string) {
      assertAdmin(actor);
      await repository.deleteBlockedSlot(z.uuid().parse(blockedSlotId));
    },
  };
}

async function manager() {
  const [{ PrismaScheduleRepository }, { prisma }] = await Promise.all([
    import("@/features/availability/infrastructure/prisma-schedule-repository"), import("@/lib/db/prisma"),
  ]);
  return createScheduleManager(new PrismaScheduleRepository(prisma));
}

export async function replaceWorkingHours(actor: Actor, roomId: string, weekday: number, windows: readonly WorkingWindow[]) { return (await manager()).replaceWorkingHours(actor, roomId, weekday, windows); }
export async function createBlockedSlot(actor: Actor, input: BlockedSlotInput) { return (await manager()).createBlockedSlot(actor, input); }
export async function deleteBlockedSlot(actor: Actor, id: string) { return (await manager()).deleteBlockedSlot(actor, id); }
