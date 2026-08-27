import { ACADEMY_NAME } from "@/lib/constants";
import Link from "next/link";

export default function HomePage() {
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-white to-teal-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">
          Grade 3 math studio
        </p>
        <h1 className="mt-3 max-w-3xl text-5xl font-black tracking-tight text-slate-900 sm:text-6xl">
          {ACADEMY_NAME}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Join live Zoom class, book your tutor, and open Khan Academy, GeoGebra, and
          worksheets from one home screen.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center rounded-xl bg-orange-500 px-6 text-base font-semibold text-white hover:bg-orange-600"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center rounded-xl border bg-white px-6 text-base font-semibold hover:bg-slate-50"
          >
            Sign in
          </Link>
        </div>
        {!configured ? (
          <p className="mt-6 max-w-xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>, then run
            the SQL in <code>supabase/migrations</code>.
          </p>
        ) : null}
      </div>
    </main>
  );
}
