"use client";

import { useEffect, useState } from "react";

import { shareMoment, trackMoment } from "@/lib/moment-share";

// Share button for a Moment's landing page; a page view counts as an "open" for organizer Insights.
export function MomentActions({ segmentId, title, startS }: { segmentId: number; title: string; startS: number }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => trackMoment(segmentId, "open"), [segmentId]);

  async function share() {
    if ((await shareMoment({ segmentId, title, startS })) === "copied") setCopied(true);
  }

  return (
    <button type="button" onClick={share} className="rounded-xl bg-accent px-4 py-2.5 font-medium text-accent-fg">
      {copied ? "Link copied" : "Share this Moment"}
    </button>
  );
}
