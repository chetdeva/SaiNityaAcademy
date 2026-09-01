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

export function istDateKey(value: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(value);
}

export function startOfWeekIst(anchor = new Date()) {
  const key = istDateKey(anchor);
  const [year, month, day] = key.split("-").map(Number);
  const utcNoon = new Date(Date.UTC(year, month - 1, day, 6, 30));
  const weekday = new Date(`${key}T12:00:00+05:30`).getUTCDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  utcNoon.setUTCDate(utcNoon.getUTCDate() + mondayOffset);
  return utcNoon;
}

export function addIstDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(date.getUTCDate() + days);
  return next;
}

export function weekDaysIst(weekStart: Date) {
  return Array.from({ length: 7 }, (_, i) => addIstDays(weekStart, i));
}

export function isInIstWeek(value: Date, weekStart: Date) {
  const keys = new Set(weekDaysIst(weekStart).map(istDateKey));
  return keys.has(istDateKey(value));
}

export function formatDayLabel(day: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(day);
}

export function formatWeekRange(weekStart: Date) {
  const weekEnd = addIstDays(weekStart, 6);
  const fmt = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
  return `${fmt.format(weekStart)} – ${fmt.format(weekEnd)}`;
}

export function formatSlotTime(start: Date, end: Date) {
  const time = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
  return `${time.format(start)} – ${time.format(end)}`;
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
