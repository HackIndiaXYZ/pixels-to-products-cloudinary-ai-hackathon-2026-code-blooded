// Browser-side helpers shared by every place a Moment can be shared from.

import { formatTime } from "@/lib/format";

// The branded landing page is what travels: it previews as a designed card (Open Graph) and links
// back to the full session, instead of a bare .mp4 that dead-ends in the chat.
export const momentPath = (segmentId: number) => `/m/${segmentId}`;

// Anonymous analytics for organizer Insights ("Moments that travel"); fire-and-forget.
export function trackMoment(segmentId: number, kind: "open" | "share"): void {
  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ segmentId, kind }),
    keepalive: true,
  }).catch(() => {});
}

// Native share sheet where available; otherwise copies the link. Resolves to "copied" so the UI can say so.
export async function shareMoment(m: { segmentId: number; title: string; startS: number }): Promise<"shared" | "copied"> {
  trackMoment(m.segmentId, "share");
  const url = `${window.location.origin}${momentPath(m.segmentId)}`;
  const text = `${m.title}, at ${formatTime(m.startS)}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: m.title, text, url });
      return "shared";
    } catch {
      // cancelled or unsupported payload: fall back to copying
    }
  }
  await navigator.clipboard.writeText(url);
  return "copied";
}
