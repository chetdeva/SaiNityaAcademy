"use client";

import { Button } from "@/components/ui/button";
import { getJoinState, msUntilJoinOpens } from "@/lib/join-window";
import type { ClassSession } from "@/lib/types";
import { Video } from "lucide-react";
import { useEffect, useState } from "react";

function formatCountdown(ms: number) {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function JoinClassButton(props: {
  session: Pick<ClassSession, "start_at" | "end_at" | "status" | "zoom_join_url">;
  large?: boolean;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const state = getJoinState(props.session, now);
  const remaining = msUntilJoinOpens(props.session, now);

  if (state === "cancelled") {
    return (
      <Button disabled className={props.large ? "h-14 px-8 text-lg" : undefined}>
        Class cancelled
      </Button>
    );
  }

  if (state === "ended") {
    return (
      <Button disabled className={props.large ? "h-14 px-8 text-lg" : undefined}>
        Class ended
      </Button>
    );
  }

  if (state === "upcoming") {
    return (
      <Button disabled className={props.large ? "h-14 px-8 text-lg" : undefined}>
        Join Class in {formatCountdown(remaining)}
      </Button>
    );
  }

  if (state === "missing_link") {
    return (
      <Button disabled className={props.large ? "h-14 px-8 text-lg" : undefined}>
        Waiting for Zoom link
      </Button>
    );
  }

  return (
    <Button
      className={
        props.large
          ? "h-14 bg-orange-500 px-8 text-lg text-white hover:bg-orange-600"
          : "bg-orange-500 text-white hover:bg-orange-600"
      }
      asChild
    >
      <a href={props.session.zoom_join_url ?? undefined} target="_blank" rel="noreferrer">
        <Video />
        Join Class
      </a>
    </Button>
  );
}
