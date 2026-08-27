import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { UserRole } from "@/lib/types";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const isStudent = pathname.startsWith("/student");
  const isTeacher = pathname.startsWith("/teacher");

  if (!url || !key) {
    if (isStudent || isTeacher) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/";
      return NextResponse.redirect(redirect);
    }
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = (user?.user_metadata?.role as UserRole | undefined) ?? null;
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (!user && (isStudent || isTeacher)) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", pathname);
    return NextResponse.redirect(redirect);
  }

  if (user && isAuthPage) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = role === "teacher" ? "/teacher" : "/student";
    return NextResponse.redirect(redirect);
  }

  if (user && pathname === "/") {
    const redirect = request.nextUrl.clone();
    redirect.pathname = role === "teacher" ? "/teacher" : "/student";
    return NextResponse.redirect(redirect);
  }

  if (user && isStudent && role === "teacher") {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/teacher";
    return NextResponse.redirect(redirect);
  }

  if (user && isTeacher && role === "student") {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/student";
    return NextResponse.redirect(redirect);
  }

  return response;
}
