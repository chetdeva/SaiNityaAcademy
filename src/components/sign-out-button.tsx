"use client";

import { ActionLoader, Spinner } from "@/components/action-loader";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth-actions";
import { useTransition } from "react";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <>
      <ActionLoader show={pending} label="Signing out…" />
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => startTransition(() => signOutAction())}
      >
        {pending ? <Spinner /> : null}
        Sign out
      </Button>
    </>
  );
}
