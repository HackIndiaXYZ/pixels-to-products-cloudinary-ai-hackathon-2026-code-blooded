"use client";

import { useRef, useState } from "react";

import { formatTime } from "@/lib/format";
import { momentUrl } from "@/lib/media";

type Props = {
  publicId: string;
  lectureId: string;
  title: string;
  startS: number;
  endS: number;
  durationS?: number | null;
  label?: string;
  className?: string;
};

// "Share as Moment": a vertical, AI-cropped, subtitled clip of exactly this moment, shared as a link.
// Native <dialog> + Web Share API — no modal or share library.
export function MomentButton({ publicId, lectureId, title, startS, endS, durationS, label, className }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const [copied, setCopied] = useState(false);
  const url = momentUrl(publicId, startS, endS, { durationS });
  const sessionPath = `/watch/${lectureId}?t=${Math.floor(startS)}`;

  function show() {
    setState("loading");
    setCopied(false);
    setOpen(true); // mounting the <video> is what asks Cloudinary to generate the clip
    dialog.current?.showModal();
  }

  async function share() {
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
        onClose={() => setOpen(false)}
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
              {state === "loading"
                ? "Generating your clip — trimming, cropping to the speaker and adding subtitles…"
                : "This clip is taking a while. Close and try again in a moment."}
            </p>
          )}
          {open && (
            <video
              src={url}
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
