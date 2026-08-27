import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";
import { NextResponse } from "next/server";

function safeNext(path: string | null) {
  if (path && path.startsWith("/") && !path.startsWith("//")) return path;
  return null;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = safeNext(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=confirm`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=confirm`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.user_metadata?.role as UserRole | undefined) ?? "student";
  const next = nextParam ?? (role === "teacher" ? "/teacher" : "/student");

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const base =
    !isLocal && forwardedHost ? `https://${forwardedHost}` : origin;

  return NextResponse.redirect(`${base}${next}`);
}
