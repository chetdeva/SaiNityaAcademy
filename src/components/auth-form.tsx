"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACADEMY_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AuthForm(props: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setInfo(null);

    try {
      const supabase = createClient();
      if (props.mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role, display_name: displayName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setInfo("Check your email to confirm the account, then sign in.");
          return;
        }
        router.replace(role === "teacher" ? "/teacher" : "/student");
        router.refresh();
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      const next = searchParams.get("next");
      const signedRole = (data.user?.user_metadata?.role as UserRole | undefined) ?? "student";
      router.replace(next || (signedRole === "teacher" ? "/teacher" : "/student"));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-semibold tracking-wide text-teal-700 uppercase">
          {ACADEMY_NAME}
        </p>
        <h1 className="mt-1 text-2xl font-bold">
          {props.mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {props.mode === "login"
            ? "Sign in to join class, schedule sessions, and open lesson tools."
            : "Students and teachers share one app, with different dashboards."}
        </p>
      </div>

      {props.mode === "signup" ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>I am a</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["student", "teacher"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium capitalize ${
                    role === option
                      ? "border-teal-600 bg-teal-50 text-teal-800"
                      : "hover:bg-muted"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete={props.mode === "login" ? "current-password" : "new-password"}
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {searchParams.get("error") === "confirm" && !error ? (
        <p className="text-sm text-destructive">
          Email confirmation failed. Open the latest email or sign in if the account is already confirmed.
        </p>
      ) : null}
      {info ? <p className="text-sm text-teal-700">{info}</p> : null}

      <Button type="submit" className="h-10 w-full" disabled={pending}>
        {pending ? "Please wait…" : props.mode === "login" ? "Sign in" : "Sign up"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {props.mode === "login" ? (
          <>
            New here?{" "}
            <Link className="font-medium text-teal-700 hover:underline" href="/signup">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link className="font-medium text-teal-700 hover:underline" href="/login">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
