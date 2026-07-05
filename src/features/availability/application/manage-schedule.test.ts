import { describe, expect, it, vi } from "vitest";

import { ForbiddenError } from "@/features/auth/application/require-role";
import { createScheduleManager } from "@/features/availability/application/manage-schedule";

const admin = { id: "admin-1", role: "ADMIN" as const };
const customer = { id: "customer-1", role: "CUSTOMER" as const };

describe("schedule management", () => {
  it("rejects overlapping working windows", async () => {
    const repository = { replaceWorkingHours: vi.fn(), createBlockedSlot: vi.fn(), deleteBlockedSlot: vi.fn() };
    const manager = createScheduleManager(repository);
    await expect(manager.replaceWorkingHours(admin, "2189c3be-fcb5-4dd9-8957-feb14f170ab8", 1, [
      { openMinute: 540, closeMinute: 720 },
      { openMinute: 700, closeMinute: 800 },
    ])).rejects.toThrow("chồng lấn");
    expect(repository.replaceWorkingHours).not.toHaveBeenCalled();
  });

  it("allows adjacent working windows", async () => {
    const repository = { replaceWorkingHours: vi.fn().mockResolvedValue(undefined), createBlockedSlot: vi.fn(), deleteBlockedSlot: vi.fn() };
    const manager = createScheduleManager(repository);
    await manager.replaceWorkingHours(admin, "2189c3be-fcb5-4dd9-8957-feb14f170ab8", 1, [
      { openMinute: 540, closeMinute: 720 },
      { openMinute: 720, closeMinute: 800 },
    ]);
    expect(repository.replaceWorkingHours).toHaveBeenCalledOnce();
  });

  it("rejects blocked slots crossing a local date boundary", async () => {
    const repository = { replaceWorkingHours: vi.fn(), createBlockedSlot: vi.fn(), deleteBlockedSlot: vi.fn() };
    const manager = createScheduleManager(repository);
    await expect(manager.createBlockedSlot(admin, {
      roomId: "2189c3be-fcb5-4dd9-8957-feb14f170ab8",
      startTime: "2026-07-06T16:30:00.000Z",
      endTime: "2026-07-06T17:30:00.000Z",
      reason: "Bảo trì",
    })).rejects.toThrow("cùng một ngày");
  });

  it("rejects non-admin actors", async () => {
    const manager = createScheduleManager({ replaceWorkingHours: vi.fn(), createBlockedSlot: vi.fn(), deleteBlockedSlot: vi.fn() });
    await expect(manager.deleteBlockedSlot(customer, "2189c3be-fcb5-4dd9-8957-feb14f170ab8")).rejects.toBeInstanceOf(ForbiddenError);
  });
});
