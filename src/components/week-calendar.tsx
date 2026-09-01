import {
  formatDateTime,
  formatDayLabel,
  istDateKey,
  startOfWeekIst,
  weekDaysIst,
} from "@/lib/slots";
import type { ClassSessionWithNames } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function WeekCalendar(props: {
  sessions: ClassSessionWithNames[];
  role: "student" | "teacher";
}) {
  const days = weekDaysIst(startOfWeekIst());

  return (
    <div className="grid gap-2 md:grid-cols-7">
      {days.map((day) => {
        const key = istDateKey(day);
        const items = props.sessions.filter((session) => {
          if (session.status !== "scheduled") return false;
          return istDateKey(new Date(session.start_at)) === key;
        });

        return (
          <div key={key} className="min-h-36 rounded-xl border bg-white p-2">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              {formatDayLabel(day)}
            </p>
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
