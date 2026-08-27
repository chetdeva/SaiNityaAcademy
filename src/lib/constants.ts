export const ACADEMY_NAME = "SaiNitya Academy";
export const ACADEMY_TZ = "Asia/Kolkata";
export const ACADEMY_TZ_OFFSET = "+05:30";

export const SESSION_MINUTES = 50;
export const JOIN_WINDOW_MINUTES = 10;
export const BOOKING_HORIZON_DAYS = 14;

export const DEFAULT_AVAILABILITY = {
  weekdays: [1, 2, 3, 4, 5] as number[],
  startTime: "16:00",
  endTime: "20:00",
};

export const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const GRADE3_UNITS = [
  { title: "Intro to multiplication", href: "https://www.khanacademy.org/math/cc-third-grade-math" },
  { title: "1-digit multiplication", href: "https://www.khanacademy.org/math/cc-third-grade-math" },
  { title: "Intro to division", href: "https://www.khanacademy.org/math/cc-third-grade-math" },
  { title: "Intro to area and perimeter", href: "https://www.khanacademy.org/math/cc-third-grade-math" },
  { title: "Fractions", href: "https://www.khanacademy.org/math/cc-third-grade-math" },
  { title: "Time, measurement, and graphs", href: "https://www.khanacademy.org/math/cc-third-grade-math" },
] as const;
