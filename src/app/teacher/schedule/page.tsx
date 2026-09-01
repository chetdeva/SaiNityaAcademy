import { AvailabilityForm } from "@/components/availability-form";
import { WeekCalendar } from "@/components/week-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth";
import { SESSION_MINUTES } from "@/lib/constants";
import type { ClassSessionWithNames, TeacherAvailability } from "@/lib/types";

export default async function TeacherSchedulePage() {
  const { supabase, profile } = await requireProfile("teacher");
  const [{ data: sessions }, { data: availability }] = await Promise.all([
    supabase
      .from("class_sessions")
      .select("*, student:profiles!student_id(id, display_name)")
      .eq("teacher_id", profile.id)
      .eq("status", "scheduled")
      .order("start_at"),
    supabase.from("teacher_availability").select("*").eq("teacher_id", profile.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Schedule</h1>
        <p className="text-muted-foreground">
          Set weekly hours, then students book {SESSION_MINUTES}-minute slots.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <AvailabilityForm
            teacherId={profile.id}
            initial={(availability ?? []) as TeacherAvailability[]}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>This week</CardTitle>
        </CardHeader>
        <CardContent>
          <WeekCalendar sessions={(sessions ?? []) as ClassSessionWithNames[]} role="teacher" />
        </CardContent>
      </Card>
    </div>
  );
}
