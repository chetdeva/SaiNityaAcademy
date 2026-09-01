"use client";

import { ActionLoader, Spinner } from "@/components/action-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BOOKING_HORIZON_DAYS, SESSION_MINUTES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import {
  addIstDays,
  formatDayLabel,
  formatSlotTime,
  formatWeekRange,
  generateOpenSlots,
  isInIstWeek,
  istDateKey,
  startOfWeekIst,
  weekDaysIst,
} from "@/lib/slots";
import type { ClassSession, Profile, TeacherAvailability, TimeSlot } from "@/lib/types";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function fallbackZoomUrl(teacher: Profile) {
  return teacher.default_zoom_url || process.env.NEXT_PUBLIC_DEMO_ZOOM_URL || null;
}

export function BookingBoard(props: {
  studentId: string;
  teachers: Profile[];
  availability: TeacherAvailability[];
  sessions: ClassSession[];
}) {
  const router = useRouter();
  const [pendingSlot, setPendingSlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const thisWeek = useMemo(() => startOfWeekIst(), []);
  const weekStart = useMemo(() => addIstDays(thisWeek, weekOffset * 7), [thisWeek, weekOffset]);
  const days = useMemo(() => weekDaysIst(weekStart), [weekStart]);
  const lastBookableWeek = useMemo(
    () => startOfWeekIst(new Date(Date.now() + BOOKING_HORIZON_DAYS * 24 * 60 * 60 * 1000)),
    [],
  );
  const canGoPrev = weekOffset > 0;
  const canGoNext = addIstDays(weekStart, 7).getTime() <= lastBookableWeek.getTime();
  const weekTitle = weekOffset === 0 ? "This week" : formatWeekRange(weekStart);

  const mine = props.sessions.filter(
    (session) => session.student_id === props.studentId && session.status === "scheduled",
  );
  const replaceId = mine[0]?.id;

  const calendars = useMemo(() => {
    return props.teachers.map((teacher) => {
      const slots = generateOpenSlots({
        teacherId: teacher.id,
        availability: props.availability.filter((row) => row.teacher_id === teacher.id),
        booked: props.sessions,
      }).filter((slot) => isInIstWeek(slot.start, weekStart));

      const booked = props.sessions.filter(
        (session) =>
          session.student_id === props.studentId &&
          session.teacher_id === teacher.id &&
          session.status === "scheduled" &&
          isInIstWeek(new Date(session.start_at), weekStart),
      );

      return { teacher, slots, booked };
    });
  }, [props.teachers, props.availability, props.sessions, props.studentId, weekStart]);

  async function book(teacher: Profile, start: Date, end: Date, moveId?: string) {
    const key = `${teacher.id}-${start.toISOString()}`;
    setPendingSlot(key);
    setError(null);
    try {
      const supabase = createClient();
      if (moveId) {
        const { error: cancelError } = await supabase
          .from("class_sessions")
          .update({ status: "cancelled" })
          .eq("id", moveId)
          .eq("student_id", props.studentId);
        if (cancelError) throw cancelError;
      }
      const { error: insertError } = await supabase.from("class_sessions").insert({
        teacher_id: teacher.id,
        student_id: props.studentId,
        start_at: start.toISOString(),
        end_at: end.toISOString(),
        zoom_join_url: fallbackZoomUrl(teacher),
        status: "scheduled",
      });
      if (insertError) throw insertError;
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not book this slot");
    } finally {
      setPendingSlot(null);
    }
  }

  async function cancel(id: string) {
    setPendingSlot(id);
    setError(null);
    try {
      const supabase = createClient();
      const { error: cancelError } = await supabase
        .from("class_sessions")
        .update({ status: "cancelled" })
        .eq("id", id)
        .eq("student_id", props.studentId);
      if (cancelError) throw cancelError;
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel");
    } finally {
      setPendingSlot(null);
    }
  }

  return (
    <div className="space-y-4">
      <ActionLoader show={Boolean(pendingSlot)} label="Updating your schedule…" />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{weekTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Asia/Kolkata · {SESSION_MINUTES}-minute classes
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canGoPrev}
              aria-label="Previous week"
              onClick={() => setWeekOffset((offset) => offset - 1)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canGoNext}
              aria-label="Next week"
              onClick={() => setWeekOffset((offset) => offset + 1)}
            >
              Next
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {calendars.length === 0 ? (
            <p className="text-sm text-muted-foreground">No teachers yet. Ask a tutor to sign up.</p>
          ) : (
            calendars.map(({ teacher, slots, booked }) => (
              <div key={teacher.id} className="space-y-3">
                {props.teachers.length > 1 ? (
                  <h2 className="text-sm font-semibold">{teacher.display_name}</h2>
                ) : null}
                <WeekGrid
                  days={days}
                  slots={slots}
                  booked={booked}
                  teacher={teacher}
                  pendingSlot={pendingSlot}
                  replaceId={replaceId}
                  onBook={book}
                  onCancel={cancel}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function WeekGrid(props: {
  days: Date[];
  slots: TimeSlot[];
  booked: ClassSession[];
  teacher: Profile;
  pendingSlot: string | null;
  replaceId?: string;
  onBook: (teacher: Profile, start: Date, end: Date, moveId?: string) => void;
  onCancel: (id: string) => void;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-7">
      {props.days.map((day) => {
        const key = istDateKey(day);
        const open = props.slots.filter((slot) => istDateKey(slot.start) === key);
        const booked = props.booked.filter((session) => istDateKey(new Date(session.start_at)) === key);
        const empty = open.length === 0 && booked.length === 0;

        return (
          <div key={key} className="min-h-36 rounded-xl border bg-white p-2">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">{formatDayLabel(day)}</p>
            <div className="space-y-2">
              {empty ? <p className="text-xs text-muted-foreground">No slots</p> : null}

              {booked.map((session) => (
                <div key={session.id} className="rounded-lg bg-teal-50 px-2 py-1.5 text-xs">
                  <p className="font-medium">{props.teacher.display_name}</p>
                  <p className="text-muted-foreground">
                    {formatSlotTime(new Date(session.start_at), new Date(session.end_at))}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <Button variant="outline" size="xs" asChild>
                      <a href={`/student/class/${session.id}`}>Open</a>
                    </Button>
                    <Button
                      variant="destructive"
                      size="xs"
                      disabled={Boolean(props.pendingSlot)}
                      onClick={() => props.onCancel(session.id)}
                    >
                      {props.pendingSlot === session.id ? <Spinner className="size-3" /> : null}
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}

              {open.map((slot) => {
                const slotKey = `${props.teacher.id}-${slot.start.toISOString()}`;
                return (
                  <div key={slotKey} className="rounded-lg border px-2 py-1.5">
                    <p className="text-xs font-medium">{formatSlotTime(slot.start, slot.end)}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <Button
                        size="xs"
                        disabled={Boolean(props.pendingSlot)}
                        onClick={() => props.onBook(props.teacher, slot.start, slot.end)}
                      >
                        {props.pendingSlot === slotKey ? <Spinner className="size-3" /> : null}
                        Book
                      </Button>
                      {props.replaceId ? (
                        <Button
                          size="xs"
                          variant="outline"
                          disabled={Boolean(props.pendingSlot)}
                          onClick={() =>
                            props.onBook(props.teacher, slot.start, slot.end, props.replaceId)
                          }
                        >
                          {props.pendingSlot === slotKey ? <Spinner className="size-3" /> : null}
                          Move
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
