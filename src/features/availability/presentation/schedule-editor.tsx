"use client";

import { fromZonedTime } from "date-fns-tz";
import { useState, type FormEvent } from "react";

import { createBlockedSlotAction } from "@/app/admin/blocked-slots/actions";
import { saveScheduleAction } from "@/app/admin/schedule/actions";

type RoomOption = Readonly<{ id: string; name: string }>;
type ActionResult = Readonly<{ ok: boolean; message: string }>;

function minute(value: string): number {
  const [hour, minutes] = value.split(":").map(Number);
  return hour! * 60 + minutes!;
}

export function ScheduleEditor({ rooms }: Readonly<{ rooms: RoomOption[] }>) {
  const [scheduleResult, setScheduleResult] = useState<ActionResult | null>(null);
  const [blockedResult, setBlockedResult] = useState<ActionResult | null>(null);

  async function submitSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const data = new FormData(event.currentTarget);
      const raw = String(data.get("windows"));
      const windows = raw.split(",").filter(Boolean).map((window) => {
        const [open, close] = window.trim().split("-");
        if (!open || !close) throw new Error("Khung giờ phải có dạng 09:00-12:00.");
        return { openMinute: minute(open), closeMinute: minute(close) };
      });
      setScheduleResult(await saveScheduleAction({ roomId: String(data.get("roomId")), weekday: Number(data.get("weekday")), windows }));
    } catch (error) {
      setScheduleResult({ ok: false, message: error instanceof Error ? error.message : "Khung giờ không hợp lệ." });
    }
  }

  async function submitBlocked(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBlockedResult(await createBlockedSlotAction({
      roomId: String(data.get("roomId")),
      startTime: fromZonedTime(String(data.get("startTime")), "Asia/Ho_Chi_Minh").toISOString(),
      endTime: fromZonedTime(String(data.get("endTime")), "Asia/Ho_Chi_Minh").toISOString(),
      reason: String(data.get("reason")),
    }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form className="grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5" onSubmit={submitSchedule}>
        <h2 className="text-xl font-semibold">Giờ làm việc</h2>
        <label className="grid gap-1 text-sm">Phòng<select name="roomId" className="rounded-lg border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] p-2 text-[var(--color-text)]">{rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label>
        <label className="grid gap-1 text-sm">Thứ trong tuần<select name="weekday" className="rounded-lg border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] p-2 text-[var(--color-text)]">{["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"].map((label, index) => <option key={label} value={index}>{label}</option>)}</select></label>
        <label className="grid gap-1 text-sm">Các khung giờ<input name="windows" defaultValue="09:00-12:00,13:00-21:00" className="rounded-lg border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] p-2 text-[var(--color-text)]" /><span className="text-xs text-[var(--color-text-muted)]">Phân cách bằng dấu phẩy.</span></label>
        {scheduleResult && <p role="status" className={scheduleResult.ok ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}>{scheduleResult.message}</p>}
        <button className="rounded-full bg-[var(--color-action)] px-4 py-2 font-semibold text-[var(--color-on-action)] hover:bg-[var(--color-action-hover)]">Lưu giờ làm việc</button>
      </form>

      <form className="grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5" onSubmit={submitBlocked}>
        <h2 className="text-xl font-semibold">Chặn khung giờ</h2>
        <label className="grid gap-1 text-sm">Phòng<select name="roomId" className="rounded-lg border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] p-2 text-[var(--color-text)]">{rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label>
        <label className="grid gap-1 text-sm">Bắt đầu<input required name="startTime" type="datetime-local" className="rounded-lg border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] p-2 text-[var(--color-text)]" /></label>
        <label className="grid gap-1 text-sm">Kết thúc<input required name="endTime" type="datetime-local" className="rounded-lg border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] p-2 text-[var(--color-text)]" /></label>
        <label className="grid gap-1 text-sm">Lý do<input required name="reason" className="rounded-lg border border-[var(--color-control-border)] bg-[var(--color-surface-raised)] p-2 text-[var(--color-text)]" /></label>
        {blockedResult && <p role="status" className={blockedResult.ok ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}>{blockedResult.message}</p>}
        <button className="rounded-full bg-[var(--color-action)] px-4 py-2 font-semibold text-[var(--color-on-action)] hover:bg-[var(--color-action-hover)]">Chặn lịch</button>
      </form>
    </div>
  );
}
