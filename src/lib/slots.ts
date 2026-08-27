import {
  ACADEMY_TZ_OFFSET,
  BOOKING_HORIZON_DAYS,
  SESSION_MINUTES,
} from "@/lib/constants";
import type { ClassSession, TeacherAvailability, TimeSlot } from "@/lib/types";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function istDate(year: number, month: number, day: number, minutes: number) {
  const hh = pad(Math.floor(minutes / 60));
  const mm = pad(minutes % 60);
  return new Date(
    `${year}-${pad(month)}-${pad(day)}T${hh}:${mm}:00${ACADEMY_TZ_OFFSET}`,
  );
}

function istYmd(offsetDays: number) {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  ist.setUTCDate(ist.getUTCDate() + offsetDays);
  return {
    year: ist.getUTCFullYear(),
    month: ist.getUTCMonth() + 1,
    day: ist.getUTCDate(),
    weekday: ist.getUTCDay(),
  };
}

export function generateOpenSlots(options: {
  teacherId: string;
  availability: TeacherAvailability[];
  booked: Pick<ClassSession, "teacher_id" | "start_at" | "status">[];
  from?: Date;
}): TimeSlot[] {
  const bookedStarts = new Set(
    options.booked
      .filter((row) => row.status === "scheduled" && row.teacher_id === options.teacherId)
      .map((row) => new Date(row.start_at).getTime()),
  );

  const now = options.from ?? new Date();
  const slots: TimeSlot[] = [];

  for (let dayOffset = 0; dayOffset < BOOKING_HORIZON_DAYS; dayOffset += 1) {
    const ymd = istYmd(dayOffset);
    const windows = options.availability.filter((row) => row.weekday === ymd.weekday);
    for (const window of windows) {
      const startMin = toMinutes(window.start_time.slice(0, 5));
      const endMin = toMinutes(window.end_time.slice(0, 5));
      for (let cursor = startMin; cursor + SESSION_MINUTES <= endMin; cursor += SESSION_MINUTES) {
        const start = istDate(ymd.year, ymd.month, ymd.day, cursor);
        const end = new Date(start.getTime() + SESSION_MINUTES * 60_000);
        if (start.getTime() <= now.getTime()) continue;
        if (bookedStarts.has(start.getTime())) continue;
        slots.push({ start, end, teacherId: options.teacherId });
      }
    }
  }

  return slots;
}

export function formatSlotRange(start: Date, end: Date) {
  const date = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(start);
  const time = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
  return `${date} · ${time.format(start)} – ${time.format(end)} IST`;
}

export function formatDateTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(date);
}
