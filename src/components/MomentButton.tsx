"use client";

import { useRef, useState } from "react";

import type { TimedWord } from "@/lib/segments";

import { formatTime } from "@/lib/format";
import { momentUrl } from "@/lib/media";

type Props = {
  publicId: string;
  lectureId: string;
  title: string;
  startS: number;
  endS: number;
  durationS?: number | null;
  words?: TimedWord[];
  segmentId?: number;
  label?: string;
  className?: string;
};

// "Share as Moment": a vertical, AI-cropped, subtitled clip of exactly this moment, shared as a link.
// Native <dialog> + Web Share API — no modal or share library.
export function MomentButton({ publicId, lectureId, title, startS, endS, durationS, words, segmentId, label, className }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const openRef = useRef(false);
  const [src, setSrc] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "tracking" | "ready" | "failed">("loading");
  const [copied, setCopied] = useState(false);
  const url = momentUrl(publicId, startS, endS, { durationS, words });
  const sessionPath = `/watch/${lectureId}?t=${Math.floor(startS)}`;

  // Asking for the URL is what makes Cloudinary build the clip. Its AI tracking-crop answers 423 while it
  // analyses the video, so wait and retry instead of showing a broken player.
  async function prepare() {
    for (let attempt = 0; attempt < 40 && openRef.current; attempt++) {
      try {
        const res = await fetch(url, { method: "HEAD" });
        if (res.ok) break;
        if (res.status !== 423) return setState("failed");
        setState("tracking");
      } catch {
        break; // HEAD blocked (e.g. CORS): let the <video> element try directly
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    if (openRef.current) setSrc(url);
  }

  // Anonymous analytics for organizer Insights ("Moments that travel"); fire-and-forget.
  function track(kind: "open" | "share") {
    if (!segmentId) return;
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segmentId, kind }),
      keepalive: true,
    }).catch(() => {});
  }

  function show() {
    track("open");
    setState("loading");
    setCopied(false);
    setSrc(null);
    openRef.current = true;
    dialog.current?.showModal();
    void prepare();
  }

  async function share() {
    track("share");
    const text = `${title} — at ${formatTime(startS)}. Full session: ${window.location.origin}${sessionPath}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // cancelled or unsupported payload — fall back to copying
      }
    }
    await navigator.clipboard.writeText(`${url}\n${text}`);
    setCopied(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={show}
        className={className ?? "rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:border-accent"}
      >
        {label ?? "Share as Moment"}
      </button>
      <dialog
        ref={dialog}
        onClose={() => {
          openRef.current = false;
          setSrc(null);
        }}
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
        className="m-auto w-[min(92vw,380px)] rounded-3xl border border-border bg-surface p-4 text-fg backdrop:bg-black/60"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">
            Moment · <span className="tabular">{formatTime(startS)}</span>
          </p>
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close" className="px-2 text-xl">
            ×
          </button>
        </div>
        <div className="relative mt-3 aspect-[9/16] overflow-hidden rounded-2xl bg-black">
          {state !== "ready" && (
            <p className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-white/80">
              {state === "loading" && "Generating your clip — trimming, cropping to the speaker and adding captions…"}
              {state === "tracking" && "Cloudinary's AI is finding the speaker in this session — first time only, a few seconds…"}
              {state === "failed" && "This clip is taking a while. Close and try again in a moment."}
            </p>
          )}
          {src && (
            <video
              src={src}
              className="relative h-full w-full object-cover"
              controls
              autoPlay
              playsInline
              onCanPlay={() => setState("ready")}
              onError={() => setState("failed")}
            />
          )}
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-muted">{title}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={share} className="rounded-xl bg-accent px-3 py-2.5 font-medium text-accent-fg">
            {copied ? "Link copied" : "Share"}
          </button>
          <a href={sessionPath} className="rounded-xl border border-border px-3 py-2.5 text-center font-medium">
            Full session
          </a>
        </div>
      </dialog>
    </>
  );
}
