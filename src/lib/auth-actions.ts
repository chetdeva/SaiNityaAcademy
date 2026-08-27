"use server";

import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

function safePath(path: string | null | undefined) {
  if (path && path.startsWith("/") && !path.startsWith("//")) return path;
  return null;
}

function homeFor(role: UserRole | undefined) {
  return role === "teacher" ? "/teacher" : "/student";
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safePath(String(formData.get("next") ?? ""));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  const role = data.user?.user_metadata?.role as UserRole | undefined;
  redirect(next || homeFor(role));
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "");
  const role = (String(formData.get("role") ?? "student") === "teacher" ? "teacher" : "student") as UserRole;

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? "";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, display_name: displayName },
      emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
    },
  });
  if (error) return { error: error.message };
  if (!data.session) return { needsConfirm: true };

  redirect(homeFor(role));
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
