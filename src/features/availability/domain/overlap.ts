import type { TimeRange } from "@/features/availability/application/availability-types";

function instant(value: string): number {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new TypeError(`Invalid instant: ${value}`);
  return parsed;
}

export function overlaps(a: TimeRange, b: TimeRange): boolean {
  const aStart = instant(a.startTime);
  const aEnd = instant(a.endTime);
  const bStart = instant(b.startTime);
  const bEnd = instant(b.endTime);
  if (aStart >= aEnd || bStart >= bEnd) throw new RangeError("Time ranges must have a positive duration");
  return aStart < bEnd && bStart < aEnd;
}
