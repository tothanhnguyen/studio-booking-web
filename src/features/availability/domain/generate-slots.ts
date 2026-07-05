import { fromZonedTime } from "date-fns-tz";

import type { AvailableSlot, GenerateSlotsInput, TimeRange } from "@/features/availability/application/availability-types";
import { overlaps } from "@/features/availability/domain/overlap";

const SLOT_STEP_MINUTES = 15;
const MINUTE_MS = 60_000;

function pad(value: number): string { return String(value).padStart(2, "0"); }

function localMinuteToIso(date: string, minute: number, timezone: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new TypeError("date must use YYYY-MM-DD");
  const [, year, month, day] = match;
  const calendar = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)) + minute * MINUTE_MS);
  const localDateTime = `${calendar.getUTCFullYear()}-${pad(calendar.getUTCMonth() + 1)}-${pad(calendar.getUTCDate())}T${pad(calendar.getUTCHours())}:${pad(calendar.getUTCMinutes())}:00.000`;
  return fromZonedTime(localDateTime, timezone).toISOString();
}

function addMinutes(iso: string, minutes: number): string {
  return new Date(Date.parse(iso) + minutes * MINUTE_MS).toISOString();
}

export function generateAvailableSlots(input: GenerateSlotsInput): AvailableSlot[] {
  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes <= 0) throw new RangeError("durationMinutes must be a positive integer");
  if (!Number.isInteger(input.bufferMinutes) || input.bufferMinutes < 0) throw new RangeError("bufferMinutes must be a non-negative integer");
  const now = Date.parse(input.now);
  if (!Number.isFinite(now)) throw new TypeError("now must be an ISO instant");
  const occupied = [...input.blockedRanges, ...input.bookingRanges];
  const slots: AvailableSlot[] = [];

  for (const window of input.workingWindows) {
    if (!Number.isInteger(window.openMinute) || !Number.isInteger(window.closeMinute) || window.openMinute < 0 || window.closeMinute > 1440 || window.openMinute >= window.closeMinute) {
      throw new RangeError("Working windows must be valid minutes within one local day");
    }
    const latestStart = window.closeMinute - input.durationMinutes - input.bufferMinutes;
    const firstStart = Math.ceil(window.openMinute / SLOT_STEP_MINUTES) * SLOT_STEP_MINUTES;

    for (let minute = firstStart; minute <= latestStart; minute += SLOT_STEP_MINUTES) {
      const startTime = localMinuteToIso(input.date, minute, input.timezone);
      if (Date.parse(startTime) < now) continue;
      const endTime = addMinutes(startTime, input.durationMinutes);
      const bufferEndTime = addMinutes(endTime, input.bufferMinutes);
      const candidate: TimeRange = { startTime, endTime: bufferEndTime };
      if (occupied.some((range) => overlaps(candidate, range))) continue;
      slots.push({ startTime, endTime, bufferEndTime });
    }
  }

  return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
}
