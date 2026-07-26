"use client";

import { fromZonedTime } from "date-fns-tz";
import { useState, type FormEvent } from "react";

import { createBlockedSlotAction } from "@/app/admin/blocked-slots/actions";
import { saveScheduleAction } from "@/app/admin/schedule/actions";
import { actionClassName } from "@/components/ui/action";
import { FormField } from "@/components/ui/form-field";

type RoomOption = Readonly<{ id: string; name: string }>;
type ActionResult = Readonly<{ ok: boolean; message: string }>;

const WEEKDAY_LABELS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

function minute(value: string): number {
  const [hour, minutes] = value.split(":").map(Number);
  return hour! * 60 + minutes!;
}

function ResultStatus({ result }: Readonly<{ result: ActionResult | null }>) {
  if (!result) return null;
  return (
    <p className={result.ok ? "ui-field__hint" : "ui-field__error"} role="status">
      {result.message}
    </p>
  );
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
    <div className="admin-schedule-grid">
      <form className="ui-surface admin-catalog-form" onSubmit={submitSchedule}>
        <h2 className="admin-schedule-form-heading">Giờ làm việc</h2>

        <FormField htmlFor="schedule-room" label="Phòng">
          <select id="schedule-room" name="roomId">
            {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
          </select>
        </FormField>

        <FormField htmlFor="schedule-weekday" label="Thứ trong tuần">
          <select id="schedule-weekday" name="weekday">
            {WEEKDAY_LABELS.map((label, index) => <option key={label} value={index}>{label}</option>)}
          </select>
        </FormField>

        <FormField hint="Phân cách bằng dấu phẩy." htmlFor="schedule-windows" label="Các khung giờ">
          <input defaultValue="09:00-12:00,13:00-21:00" id="schedule-windows" name="windows" />
        </FormField>

        <ResultStatus result={scheduleResult} />

        <button className={actionClassName("primary")} type="submit">Lưu giờ làm việc</button>
      </form>

      <form className="ui-surface admin-catalog-form" onSubmit={submitBlocked}>
        <h2 className="admin-schedule-form-heading">Chặn khung giờ</h2>

        <FormField htmlFor="blocked-room" label="Phòng">
          <select id="blocked-room" name="roomId">
            {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
          </select>
        </FormField>

        <FormField htmlFor="blocked-start" label="Bắt đầu">
          <input id="blocked-start" name="startTime" required type="datetime-local" />
        </FormField>

        <FormField htmlFor="blocked-end" label="Kết thúc">
          <input id="blocked-end" name="endTime" required type="datetime-local" />
        </FormField>

        <FormField htmlFor="blocked-reason" label="Lý do">
          <input id="blocked-reason" name="reason" required />
        </FormField>

        <ResultStatus result={blockedResult} />

        <button className={actionClassName("primary")} type="submit">Chặn lịch</button>
      </form>
    </div>
  );
}
