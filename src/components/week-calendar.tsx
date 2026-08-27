import { formatDateTime } from "@/lib/slots";
import type { ClassSessionWithNames } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

function istDateKey(value: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(value);
}

function startOfWeekIst(anchor = new Date()) {
  const key = istDateKey(anchor);
  const [year, month, day] = key.split("-").map(Number);
  const utcNoon = new Date(Date.UTC(year, month - 1, day, 6, 30));
  const weekday = new Date(`${key}T12:00:00+05:30`).getUTCDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  utcNoon.setUTCDate(utcNoon.getUTCDate() + mondayOffset);
  return utcNoon;
}

export function WeekCalendar(props: {
  sessions: ClassSessionWithNames[];
  role: "student" | "teacher";
}) {
  const weekStart = startOfWeekIst();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setUTCDate(weekStart.getUTCDate() + i);
    return d;
  });

  return (
    <div className="grid gap-2 md:grid-cols-7">
      {days.map((day) => {
        const key = istDateKey(day);
        const items = props.sessions.filter((session) => {
          if (session.status !== "scheduled") return false;
          return istDateKey(new Date(session.start_at)) === key;
        });
        const label = new Intl.DateTimeFormat("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
          timeZone: "Asia/Kolkata",
        }).format(day);

        return (
          <div key={key} className="min-h-36 rounded-xl border bg-white p-2">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">{label}</p>
            <div className="space-y-2">
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground">No classes</p>
              ) : (
                items.map((session) => {
                  const href =
                    props.role === "teacher"
                      ? `/teacher/class/${session.id}`
                      : `/student/class/${session.id}`;
                  const name =
                    props.role === "teacher"
                      ? session.student?.display_name ?? "Student"
                      : session.teacher?.display_name ?? "Teacher";
                  return (
                    <Link
                      key={session.id}
                      href={href}
                      className={cn(
                        "block rounded-lg bg-teal-50 px-2 py-1.5 text-xs hover:bg-teal-100",
                      )}
                    >
                      <span className="font-medium">{name}</span>
                      <span className="mt-0.5 block text-muted-foreground">
                        {formatDateTime(session.start_at)}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
