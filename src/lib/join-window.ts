import { JOIN_WINDOW_MINUTES } from "@/lib/constants";
import type { ClassSession } from "@/lib/types";

export type JoinState = "upcoming" | "open" | "ended" | "cancelled" | "missing_link";

export function getJoinState(
  session: Pick<ClassSession, "start_at" | "end_at" | "status" | "zoom_join_url">,
  now = new Date(),
): JoinState {
  if (session.status === "cancelled") return "cancelled";
  const start = new Date(session.start_at);
  const end = new Date(session.end_at);
  const opensAt = new Date(start.getTime() - JOIN_WINDOW_MINUTES * 60_000);
  if (now >= end) return "ended";
  if (now < opensAt) return "upcoming";
  if (!session.zoom_join_url) return "missing_link";
  return "open";
}

export function msUntilJoinOpens(
  session: Pick<ClassSession, "start_at">,
  now = new Date(),
) {
  const start = new Date(session.start_at);
  const opensAt = new Date(start.getTime() - JOIN_WINDOW_MINUTES * 60_000);
  return Math.max(0, opensAt.getTime() - now.getTime());
}
