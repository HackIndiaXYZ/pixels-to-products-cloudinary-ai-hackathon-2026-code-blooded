"use client";

import { useEffect, useState } from "react";

type State = "loading" | "tracking" | "ready" | "failed";

const POLL_MS = 3000;
const MAX_POLLS = 40;

// The vertical Moment player. Requesting the URL is what makes Cloudinary build the clip, and its AI
// tracking-crop answers 423 while it analyses the video, so this waits and retries instead of showing
// a broken player. Mount it only when the clip should start generating.
export function MomentClip({ url }: { url: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let attempt = 0; attempt < MAX_POLLS && !cancelled; attempt++) {
        try {
          const res = await fetch(url, { method: "HEAD" });
          if (res.ok) break;
          if (res.status !== 423) {
            if (!cancelled) setState("failed");
            return;
          }
          if (!cancelled) setState("tracking");
        } catch {
          break; // HEAD blocked (e.g. CORS): let the <video> element try directly
        }
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
      if (!cancelled) setSrc(url);
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-black">
      {state !== "ready" && (
        <p className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-white/80" aria-live="polite">
          {state === "loading" && "Generating your clip — trimming, cropping to the speaker and adding captions…"}
          {state === "tracking" && "Cloudinary's AI is finding the speaker in this session — first time only, a few seconds…"}
          {state === "failed" && "This clip is taking a while. Try again in a moment."}
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
  );
}
