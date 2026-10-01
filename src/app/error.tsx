"use client";

import Link from "next/link";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="mt-24 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted">
        This page hit an error. Videos you were watching are safe — try again, or go back to the library.
      </p>
      {error.digest && <p className="mt-2 text-xs text-muted">Reference: {error.digest}</p>}
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={() => retry()} className="rounded-lg bg-accent px-4 py-2.5 font-medium text-accent-fg">
          Try again
        </button>
        <Link href="/" className="rounded-lg border border-border px-4 py-2.5 font-medium">
          Library
        </Link>
      </div>
    </div>
  );
}
