"use client";

import { ActionLoader, Spinner } from "@/components/action-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACADEMY_NAME } from "@/lib/constants";
import { signInAction, signUpAction } from "@/lib/auth-actions";
import type { UserRole } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function AuthForm(props: { mode: "login" | "signup" }) {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<UserRole>("student");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    setInfo(null);

    startTransition(async () => {
      const result =
        props.mode === "signup" ? await signUpAction(formData) : await signInAction(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result && "needsConfirm" in result && result.needsConfirm) {
        setInfo("Check your email to confirm the account, then sign in.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ActionLoader
        show={pending}
        label={props.mode === "login" ? "Signing you in…" : "Creating your account…"}
      />
      <input type="hidden" name="next" value={searchParams.get("next") ?? ""} />
      <input type="hidden" name="role" value={role} />
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
            <Input id="name" name="displayName" required disabled={pending} />
          </div>
          <div className="space-y-1.5">
            <Label>I am a</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["student", "teacher"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={pending}
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
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={props.mode === "login" ? "current-password" : "new-password"}
          minLength={6}
          required
          disabled={pending}
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
        {pending ? <Spinner /> : null}
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
