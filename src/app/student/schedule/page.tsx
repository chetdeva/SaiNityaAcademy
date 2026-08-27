import { BookingBoard } from "@/components/booking-board";
import { WeekCalendar } from "@/components/week-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth";
import type { ClassSession, ClassSessionWithNames, Profile, TeacherAvailability } from "@/lib/types";

export default async function StudentSchedulePage() {
  const { supabase, profile } = await requireProfile("student");

  const [{ data: teachers }, { data: availability }, { data: mySessions }, { data: occupied }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("role", "teacher"),
      supabase.from("teacher_availability").select("*"),
      supabase
        .from("class_sessions")
        .select("*, teacher:profiles!teacher_id(id, display_name)")
        .eq("student_id", profile.id),
      supabase.rpc("list_occupied_slots"),
    ]);

  const occupiedSessions = ((occupied ?? []) as { teacher_id: string; start_at: string }[]).map(
    (row) =>
      ({
        id: `${row.teacher_id}-${row.start_at}`,
        teacher_id: row.teacher_id,
        student_id: "",
        start_at: row.start_at,
        end_at: row.start_at,
        zoom_join_url: null,
        status: "scheduled" as const,
        created_at: row.start_at,
      }) satisfies ClassSession,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Class scheduler</h1>
        <p className="text-muted-foreground">Book, cancel, or move a class against tutor availability.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>This week</CardTitle>
        </CardHeader>
        <CardContent>
          <WeekCalendar sessions={(mySessions ?? []) as ClassSessionWithNames[]} role="student" />
        </CardContent>
      </Card>
      <BookingBoard
        studentId={profile.id}
        teachers={(teachers ?? []) as Profile[]}
        availability={(availability ?? []) as TeacherAvailability[]}
        sessions={[...occupiedSessions, ...((mySessions ?? []) as ClassSession[])]}
      />
    </div>
  );
}
