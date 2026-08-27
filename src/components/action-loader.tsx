import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-4 animate-spin", className)} aria-hidden />;
}

export function ActionLoader(props: { show: boolean; label?: string }) {
  if (!props.show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-white px-6 py-5 shadow-lg">
        <Spinner className="size-8 text-teal-700" />
        <p className="text-sm font-medium text-slate-800">{props.label ?? "Loading…"}</p>
      </div>
    </div>
  );
}
