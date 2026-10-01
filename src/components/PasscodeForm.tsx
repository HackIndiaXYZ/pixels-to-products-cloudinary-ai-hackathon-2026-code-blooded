"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PasscodeForm() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/organizer/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else setError("That passcode isn't right.");
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-16 max-w-sm rounded-2xl border border-border bg-surface p-6">
      <h1 className="text-xl font-semibold">Organizer Studio</h1>
      <p className="mt-1 text-sm text-muted">Upload and publish sessions for your library.</p>
      <label htmlFor="passcode" className="mt-6 block text-sm font-medium">
        Passcode
      </label>
      <input
        id="passcode"
        type="password"
        autoComplete="current-password"
        value={passcode}
        onChange={(e) => setPasscode(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-border bg-bg px-3 py-2.5"
        required
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-failed">
          {error}
        </p>
      )}
      <button
        disabled={busy}
        className="mt-5 w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-accent-fg disabled:opacity-60"
      >
        {busy ? "Checking…" : "Enter Studio"}
      </button>
    </form>
  );
}
