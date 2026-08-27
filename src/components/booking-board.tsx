"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SESSION_MINUTES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime, formatSlotRange, generateOpenSlots } from "@/lib/slots";
import type { ClassSession, Profile, TeacherAvailability } from "@/lib/types";
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

  const mine = props.sessions.filter(
    (session) => session.student_id === props.studentId && session.status === "scheduled",
  );

  const slotsByTeacher = useMemo(() => {
    return props.teachers.map((teacher) => ({
      teacher,
      slots: generateOpenSlots({
        teacherId: teacher.id,
        availability: props.availability.filter((row) => row.teacher_id === teacher.id),
        booked: props.sessions,
      }),
    }));
  }, [props.teachers, props.availability, props.sessions]);

  async function book(teacher: Profile, start: Date, end: Date, replaceId?: string) {
    const key = `${teacher.id}-${start.toISOString()}`;
    setPendingSlot(key);
    setError(null);
    try {
      const supabase = createClient();
      if (replaceId) {
        const { error: cancelError } = await supabase
          .from("class_sessions")
          .update({ status: "cancelled" })
          .eq("id", replaceId)
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
    <div className="space-y-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Your classes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mine.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming classes yet. Book a slot below.</p>
          ) : (
            mine
              .slice()
              .sort((a, b) => a.start_at.localeCompare(b.start_at))
              .map((session) => {
                const teacher = props.teachers.find((row) => row.id === session.teacher_id);
                return (
                  <div
                    key={session.id}
                    className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{teacher?.display_name ?? "Teacher"}</p>
                      <p className="text-sm text-muted-foreground">{formatDateTime(session.start_at)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/student/class/${session.id}`}>Open</a>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={pendingSlot === session.id}
                        onClick={() => cancel(session.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                );
              })
          )}
        </CardContent>
      </Card>

      {slotsByTeacher.map(({ teacher, slots }) => (
        <Card key={teacher.id}>
          <CardHeader>
            <CardTitle>{teacher.display_name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {slots.length} open {SESSION_MINUTES}-minute slots in the next 14 days
            </p>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open slots. Ask the teacher to publish availability.</p>
            ) : (
              slots.slice(0, 24).map((slot) => {
                const key = `${teacher.id}-${slot.start.toISOString()}`;
                const replaceId = mine[0]?.id;
                return (
                  <div key={key} className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2">
                    <span className="text-sm">{formatSlotRange(slot.start, slot.end)}</span>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        size="xs"
                        disabled={pendingSlot === key}
                        onClick={() => book(teacher, slot.start, slot.end)}
                      >
                        Book
                      </Button>
                      {replaceId ? (
                        <Button
                          size="xs"
                          variant="outline"
                          disabled={pendingSlot === key}
                          onClick={() => book(teacher, slot.start, slot.end, replaceId)}
                        >
                          Move
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
