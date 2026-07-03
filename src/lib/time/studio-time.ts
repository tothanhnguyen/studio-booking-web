import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const STUDIO_TIME_ZONE = "Asia/Ho_Chi_Minh";

const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL_TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function toUtcFromStudioLocal(date: string, time: string): Date {
  if (!LOCAL_DATE_PATTERN.test(date) || !LOCAL_TIME_PATTERN.test(time)) {
    throw new RangeError("Invalid studio local date/time");
  }

  let utcDate: Date;
  let roundTrip: string;

  try {
    utcDate = fromZonedTime(`${date}T${time}:00`, STUDIO_TIME_ZONE);
    roundTrip = formatInTimeZone(utcDate, STUDIO_TIME_ZONE, "yyyy-MM-dd HH:mm");
  } catch {
    throw new RangeError("Invalid studio local date/time");
  }

  if (roundTrip !== `${date} ${time}`) {
    throw new RangeError("Invalid studio local date/time");
  }

  return utcDate;
}

export function toStudioDateKey(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError("Expected a valid Date");
  }

  return formatInTimeZone(date, STUDIO_TIME_ZONE, "yyyy-MM-dd");
}
