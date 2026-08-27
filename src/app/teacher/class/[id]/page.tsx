import { JoinClassButton } from "@/components/join-class-button";
import { ResourceLaunchpad } from "@/components/resource-launchpad";
import { ShellCard } from "@/components/shell-card";
import { requireProfile } from "@/lib/auth";
import { formatDateTime } from "@/lib/slots";
import type { ClassSessionWithNames } from "@/lib/types";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function TeacherClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, profile } = await requireProfile("teacher");
  const { data } = await supabase
    .from("class_sessions")
    .select("*, student:profiles!student_id(id, display_name)")
    .eq("id", id)
    .eq("teacher_id", profile.id)
    .maybeSingle();

  if (!data) notFound();
  const session = data as ClassSessionWithNames;

  return (
    <div className="space-y-6">
      <Link href="/teacher" className="text-sm text-teal-700 hover:underline">
        ← Back to dashboard
      </Link>
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Session</p>
        <h1 className="text-2xl font-bold">
          {session.student?.display_name ?? "Student"} · {formatDateTime(session.start_at)}
        </h1>
        <div className="mt-4">
          <JoinClassButton session={session} large />
        </div>
      </div>
      <ResourceLaunchpad audience="teacher" />
      <div className="grid gap-4 md:grid-cols-2">
        <ShellCard
          title="Student deep-dive"
          description={`${session.student?.display_name ?? "Student"} — historical performance arrives in a later release.`}
        />
        <ShellCard title="Post-class notes" description="Focus, understanding, and speed sliders." />
      </div>
    </div>
  );
}
