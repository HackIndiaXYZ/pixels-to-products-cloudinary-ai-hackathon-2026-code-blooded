"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { StatusBadge } from "@/components/StatusBadge";
import { UploadForm } from "@/components/UploadForm";
import { formatTime } from "@/lib/format";

type Session = {
  id: string;
  title: string;
  speaker: string | null;
  status: "processing" | "ready" | "transcript_failed";
  visibility: "unlisted" | "public";
  durationS: number | null;
};

export function Studio() {
  const [sessions, setSessions] = useState<Session[] | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/lectures", { cache: "no-store" });
    if (res.ok) setSessions(await res.json());
  }, []);

  useEffect(() => {
    // Initial fetch; setState happens after the await, so this doesn't cascade renders.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  // NFR2: never a silent black box — poll while anything is still processing.
  const anyProcessing = sessions?.some((s) => s.status === "processing");
  useEffect(() => {
    if (!anyProcessing) return;
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [anyProcessing, refresh]);

  async function setVisibility(id: string, visibility: Session["visibility"]) {
    setSessions((list) => list?.map((s) => (s.id === id ? { ...s, visibility } : s)) ?? null);
    const res = await fetch(`/api/lectures/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visibility }),
    });
    if (!res.ok) refresh();
  }

  async function signOut() {
    await fetch("/api/organizer/session", { method: "DELETE" });
    window.location.reload();
  }

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
      <div>
        <UploadForm onUploaded={refresh} />
        <button onClick={signOut} className="mt-4 text-sm text-muted hover:text-fg">
          Sign out
        </button>
      </div>

      <section aria-labelledby="sessions-heading">
        <h2 id="sessions-heading" className="text-lg font-semibold">
          Sessions
        </h2>
        {sessions === null ? (
          <div className="mt-4 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-16" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="mt-4 text-muted">No sessions yet — upload your first recording.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
            {sessions.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/watch/${s.id}`} className="block truncate font-medium hover:text-accent">
                    {s.title}
                  </Link>
                  <p className="text-sm text-muted">
                    {s.speaker ?? "Unknown speaker"}
                    {s.durationS ? <span className="tabular"> · {formatTime(s.durationS)}</span> : null}
                  </p>
                </div>
                <StatusBadge status={s.status} />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={s.visibility === "public"}
                    disabled={s.status !== "ready"}
                    onChange={(e) => setVisibility(s.id, e.target.checked ? "public" : "unlisted")}
                    className="size-4 accent-[var(--accent)]"
                  />
                  {s.visibility === "public" ? "Public" : "Unlisted"}
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
