import { AppHeader } from "@/components/app-header";
import { requireProfile } from "@/lib/auth";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireProfile("student");
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-teal-50">
      <AppHeader name={profile.display_name} role="student" />
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
