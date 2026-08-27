import { AvailabilityForm } from "@/components/availability-form";
import { ResourceLaunchpad } from "@/components/resource-launchpad";
import { ShellCard } from "@/components/shell-card";
import { WeekCalendar } from "@/components/week-calendar";
import { ZoomUrlForm } from "@/components/zoom-url-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth";
import { formatDateTime } from "@/lib/slots";
import type { ClassSessionWithNames, TeacherAvailability } from "@/lib/types";
import Link from "next/link";

export default async function TeacherHomePage() {
  const { supabase, profile } = await requireProfile("teacher");
  const [{ data: sessions }, { data: availability }] = await Promise.all([
    supabase
      .from("class_sessions")
      .select("*, student:profiles!student_id(id, display_name)")
      .eq("teacher_id", profile.id)
      .eq("status", "scheduled")
      .gte("end_at", new Date().toISOString())
      .order("start_at", { ascending: true }),
    supabase.from("teacher_availability").select("*").eq("teacher_id", profile.id),
  ]);

  const upcoming = (sessions ?? []) as ClassSessionWithNames[];
  const students = Array.from(
    new Map(
      upcoming
        .filter((session) => session.student)
        .map((session) => [session.student!.id, session.student!]),
    ).values(),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Teacher dashboard</h1>
        <p className="text-muted-foreground">Schedule, launch the lesson pack, and review your roster.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Schedule matrix</CardTitle>
            <p className="text-sm text-muted-foreground">This week · Asia/Kolkata</p>
          </div>
          <Link href="/teacher/schedule" className="text-sm font-medium text-teal-700 hover:underline">
            Edit availability
          </Link>
        </CardHeader>
        <CardContent>
          <WeekCalendar sessions={(sessions ?? []) as ClassSessionWithNames[]} role="teacher" />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No bookings yet. Publish availability so students can book.
              </p>
            ) : (
              upcoming.slice(0, 6).map((session) => (
                <Link
                  key={session.id}
                  href={`/teacher/class/${session.id}`}
                  className="flex items-center justify-between rounded-xl border px-3 py-2 hover:bg-muted/50"
                >
                  <span>
                    <span className="block font-medium">{session.student?.display_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDateTime(session.start_at)}
                    </span>
                  </span>
                  <span className="text-sm text-teal-700">Open</span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Classroom setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ZoomUrlForm initialUrl={profile.default_zoom_url ?? ""} />
            <AvailabilityForm
              teacherId={profile.id}
              initial={(availability ?? []) as TeacherAvailability[]}
            />
          </CardContent>
        </Card>
      </div>

      <ResourceLaunchpad audience="teacher" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ShellCard title="Student deep-dive" description="Learning speed and weak areas land in a later release.">
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground">Booked students will appear here.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {students.map((student) => (
                <li key={student.id}>{student.display_name}</li>
              ))}
            </ul>
          )}
        </ShellCard>
        <ShellCard title="Real-time assessment" description="Push MCQs to the student screen during class.">
          <p className="text-sm">Use the GeoGebra quiz from the launchpad for now.</p>
        </ShellCard>
        <ShellCard title="Report card generator" description="Focus, understanding, and speed sliders after class." />
        <ShellCard title="Class recording archive" description="Zoom cloud recordings will be listed here." />
      </div>
    </div>
  );
}
