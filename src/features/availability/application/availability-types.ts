export type TimeRange = Readonly<{
  startTime: string;
  endTime: string;
}>;

export type WorkingWindow = Readonly<{
  openMinute: number;
  closeMinute: number;
}>;

export type AvailableSlot = Readonly<{
  startTime: string;
  endTime: string;
  bufferEndTime: string;
}>;

export type GenerateSlotsInput = Readonly<{
  date: string;
  timezone: string;
  workingWindows: readonly WorkingWindow[];
  durationMinutes: number;
  bufferMinutes: number;
  blockedRanges: readonly TimeRange[];
  bookingRanges: readonly TimeRange[];
  now: string;
}>;
