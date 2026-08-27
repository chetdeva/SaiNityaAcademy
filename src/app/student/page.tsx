import { JoinClassButton } from "@/components/join-class-button";
import { ResourceLaunchpad } from "@/components/resource-launchpad";
import { ShellCard } from "@/components/shell-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireProfile } from "@/lib/auth";
import { GRADE3_UNITS } from "@/lib/constants";
import { formatDateTime } from "@/lib/slots";
import type { ClassSessionWithNames } from "@/lib/types";
import Link from "next/link";

export default async function StudentHomePage() {
  const { supabase, profile } = await requireProfile("student");
  const { data } = await supabase
    .from("class_sessions")
    .select("*, teacher:profiles!teacher_id(id, display_name, default_zoom_url)")
    .eq("student_id", profile.id)
    .eq("status", "scheduled")
    .gte("end_at", new Date().toISOString())
    .order("start_at", { ascending: true })
    .limit(1);

  const nextClass = (data?.[0] ?? null) as ClassSessionWithNames | null;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-teal-500 to-orange-400 p-6 text-white shadow-sm sm:p-8">
        <p className="text-sm font-medium text-white/80">Hi {profile.display_name.split(" ")[0]} 👋</p>
        <h1 className="mt-1 text-3xl font-black">Ready for math class?</h1>
        {nextClass ? (
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-white/80">Next class with {nextClass.teacher?.display_name}</p>
              <p className="text-lg font-semibold">{formatDateTime(nextClass.start_at)}</p>
            </div>
            <JoinClassButton session={nextClass} large />
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-white/90">No class on the calendar yet.</p>
            <Link
              href="/student/schedule"
              className="mt-3 inline-flex h-12 items-center rounded-xl bg-white px-5 font-semibold text-teal-800"
            >
              Book a class
            </Link>
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Milestone roadmap</CardTitle>
            <p className="text-sm text-muted-foreground">Khan Academy Grade 3 math units</p>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {GRADE3_UNITS.map((unit, index) => (
              <a
                key={unit.title}
                href={unit.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border bg-white px-3 py-2 hover:border-teal-300"
              >
                <span className="text-xs font-semibold text-teal-700">Unit {index + 1}</span>
                <span className="block text-sm font-medium">{unit.title}</span>
              </a>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignment locker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="https://drive.google.com/file/d/1OMD61NC9TX61TV8qUZIyeDiC6UTr7dj3/view?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl border p-3 hover:border-orange-300"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">Homework sheet</p>
                <Badge>Pending</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Open in Google Drive</p>
            </a>
            <a
              href="https://drive.google.com/file/d/1B8TS3nLbwh1bYgA7MQtSMxHsXo-rikHK/view?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl border p-3 hover:border-teal-300"
            >
              <p className="font-medium">Class activity</p>
              <p className="text-sm text-muted-foreground">Worksheet for live class</p>
            </a>
          </CardContent>
        </Card>
      </div>

      <ResourceLaunchpad audience="student" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ShellCard title="Reward tracker" description="Points, badges, and leaderboard ranking.">
          <div className="flex items-end gap-3">
            <div>
              <p className="text-3xl font-black text-orange-500">0</p>
              <p className="text-xs text-muted-foreground">stars</p>
            </div>
            <p className="text-sm text-muted-foreground">Earn stars after live classes in a later release.</p>
          </div>
        </ShellCard>
        <ShellCard title="Daily math quest" description="A one-question warm-up each day.">
          <p className="text-sm">Today’s puzzle unlocks with the quest engine (not in MVP).</p>
        </ShellCard>
        <ShellCard title="Concept mastery" description="Fractions, algebra, and geometry proficiency.">
          <div className="space-y-2">
            {["Fractions", "Multiplication", "Geometry"].map((topic) => (
              <div key={topic}>
                <div className="mb-1 flex justify-between text-xs">
                  <span>{topic}</span>
                  <span>0%</span>
                </div>
                <Progress value={0} />
              </div>
            ))}
          </div>
        </ShellCard>
        <ShellCard title="Project showcase" description="Certificates and solved challenge problems." />
        <ShellCard title="Subscription wallet" description="Class credits, renewal date, and payments." />
        <ShellCard title="Tutor messages" description="Use Zoom chat during class for now." />
      </div>
    </div>
  );
}
