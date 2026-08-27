import { AppHeader } from "@/components/app-header";
import { requireProfile } from "@/lib/auth";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireProfile("teacher");
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader name={profile.display_name} role="teacher" />
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
