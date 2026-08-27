import { JoinClassButton } from "@/components/join-class-button";
import { ResourceLaunchpad } from "@/components/resource-launchpad";
import { requireProfile } from "@/lib/auth";
import { formatDateTime } from "@/lib/slots";
import type { ClassSessionWithNames } from "@/lib/types";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function StudentClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, profile } = await requireProfile("student");
  const { data } = await supabase
    .from("class_sessions")
    .select("*, teacher:profiles!teacher_id(id, display_name)")
    .eq("id", id)
    .eq("student_id", profile.id)
    .maybeSingle();

  if (!data) notFound();
  const session = data as ClassSessionWithNames;

  return (
    <div className="space-y-6">
      <Link href="/student" className="text-sm text-teal-700 hover:underline">
        ← Back to dashboard
      </Link>
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Live class</p>
        <h1 className="text-2xl font-bold">
          {session.teacher?.display_name ?? "Teacher"} · {formatDateTime(session.start_at)}
        </h1>
        <div className="mt-4">
          <JoinClassButton session={session} large />
        </div>
      </div>
      <ResourceLaunchpad audience="student" />
    </div>
  );
}
