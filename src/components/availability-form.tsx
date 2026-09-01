"use client";

import { ActionLoader, Spinner } from "@/components/action-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_AVAILABILITY, SESSION_MINUTES, WEEKDAY_LABELS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { TeacherAvailability } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export function AvailabilityForm(props: {
  teacherId: string;
  initial: TeacherAvailability[];
}) {
  const router = useRouter();
  const [weekdays, setWeekdays] = useState<number[]>(() => {
    const unique = [...new Set(props.initial.map((row) => row.weekday))];
    return unique.length ? unique : DEFAULT_AVAILABILITY.weekdays;
  });
  const [startTime, setStartTime] = useState(
    props.initial[0]?.start_time.slice(0, 5) ?? DEFAULT_AVAILABILITY.startTime,
  );
  const [endTime, setEndTime] = useState(
    props.initial[0]?.end_time.slice(0, 5) ?? DEFAULT_AVAILABILITY.endTime,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const summary = useMemo(
    () =>
      weekdays
        .slice()
        .sort()
        .map((d) => WEEKDAY_LABELS[d].slice(0, 3))
        .join(", "),
    [weekdays],
  );

  function toggleDay(day: number) {
    setWeekdays((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day],
    );
  }

  async function save() {
    setPending(true);
    setError(null);
    try {
      if (weekdays.length === 0) throw new Error("Pick at least one weekday");
      if (endTime <= startTime) throw new Error("End time must be after start time");
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("teacher_availability")
        .delete()
        .eq("teacher_id", props.teacherId);
      if (deleteError) throw deleteError;
      const rows = weekdays.map((weekday) => ({
        teacher_id: props.teacherId,
        weekday,
        start_time: `${startTime}:00`,
        end_time: `${endTime}:00`,
      }));
      const { error: insertError } = await supabase.from("teacher_availability").insert(rows);
      if (insertError) throw insertError;
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save availability");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <ActionLoader show={pending} label="Saving availability…" />
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {WEEKDAY_LABELS.map((label, index) => (
          <button
            key={label}
            type="button"
            disabled={pending}
            onClick={() => toggleDay(index)}
            className={`rounded-lg border px-2 py-2 text-xs font-medium ${
              weekdays.includes(index)
                ? "border-teal-600 bg-teal-50 text-teal-800"
                : "text-muted-foreground"
            }`}
          >
            {label.slice(0, 3)}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="start">Window start (IST)</Label>
          <Input id="start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} disabled={pending} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end">Window end (IST)</Label>
          <Input id="end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={pending} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Open {summary || "no days"} · {startTime}–{endTime} IST · {SESSION_MINUTES}-minute classes
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button onClick={save} disabled={pending}>
        {pending ? <Spinner /> : null}
        {pending ? "Saving…" : "Save availability"}
      </Button>
    </div>
  );
}
