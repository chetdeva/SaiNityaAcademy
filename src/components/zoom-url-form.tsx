"use client";

import { ActionLoader, Spinner } from "@/components/action-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ZoomUrlForm(props: { initialUrl: string }) {
  const router = useRouter();
  const [url, setUrl] = useState(props.initialUrl);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ default_zoom_url: url || null })
        .eq("id", user.id);
      if (updateError) throw updateError;
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save Zoom URL");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <ActionLoader show={pending} label="Saving Zoom link…" />
      <div className="space-y-1.5">
        <Label htmlFor="zoom">Default Zoom join URL</Label>
        <Input
          id="zoom"
          placeholder="https://zoom.us/j/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={pending}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button onClick={save} disabled={pending} variant="outline">
        {pending ? <Spinner /> : null}
        {pending ? "Saving…" : "Save Zoom link"}
      </Button>
    </div>
  );
}
