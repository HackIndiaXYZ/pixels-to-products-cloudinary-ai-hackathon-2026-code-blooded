"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { MomentButton } from "@/components/MomentButton";
import { Snippet } from "@/components/ResultCard";
import { formatTime } from "@/lib/format";
import type { SnippetPart } from "@/lib/highlight";
import type { TimedWord } from "@/lib/segments";
import { clipUrl, thumbUrl } from "@/lib/media";

type Citation = {
  n: number;
  segmentId: number;
  lectureId: string;
  publicId: string;
  title: string;
  speaker: string | null;
  startS: number;
  endS: number;
  chapterTitle: string | null;
  durationS: number | null;
  words: TimedWord[];
  snippet: SnippetPart[];
};

type Reel = { url: string; durationS: number; clips: number } | null;

type AskResponse =
  | { status: "answered"; answer: string; citations: Citation[]; reel: Reel }
  | { status: "not_found" | "fallback"; answer: null; citations: Citation[]; reel?: Reel };

type State = { kind: "loading" } | { kind: "error"; message: string } | { kind: "done"; data: AskResponse };

export function AskAnswer({ question }: { question: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (res.status === 429) return setState({ kind: "error", message: "You've asked a lot — try again in a few minutes." });
        if (!res.ok) return setState({ kind: "error", message: "Ask is unavailable right now — the moments below still work." });
        setState({ kind: "done", data: await res.json() });
      })
      .catch((e) => {
        if (e.name !== "AbortError") setState({ kind: "error", message: "Couldn't reach Pravaha. Check your connection." });
      });
    return () => controller.abort();
  }, [question]);

  return (
    <section aria-labelledby="answer-heading" aria-live="polite" className="mt-6 rounded-3xl border border-border bg-surface p-5 sm:p-6">
      <h2 id="answer-heading" className="text-sm font-semibold tracking-wide text-accent uppercase">
        Answer from your library
      </h2>

      {state.kind === "loading" && (
        <div className="mt-4 space-y-2.5" aria-label="Finding the moments that answer this…">
          <div className="skeleton h-4 w-11/12" />
          <div className="skeleton h-4 w-10/12" />
          <div className="skeleton h-4 w-7/12" />
          <p className="pt-2 text-sm text-muted">Finding the moments that answer this…</p>
        </div>
      )}

      {state.kind === "error" && <p className="mt-3 text-muted">{state.message}</p>}

      {state.kind === "done" && <AnswerBody data={state.data} />}
    </section>
  );
}

function AnswerBody({ data }: { data: AskResponse }) {
  return (
    <>
      {data.status === "answered" && <AnswerText text={data.answer} />}
      {data.status === "not_found" && (
        <p className="mt-3 text-lg">That isn&apos;t covered in this library yet.</p>
      )}
      {data.status === "fallback" && (
        <p className="mt-3 text-muted">Here are the most relevant moments.</p>
      )}
      {data.reel && data.reel.clips > 1 && <AnswerReel reel={data.reel} />}
      {data.citations.length > 0 && (
        <ol className="mt-5 grid gap-3 md:grid-cols-2">
          {data.citations.map((c) => (
            <li key={c.segmentId} id={`cite-${c.n}`} className="scroll-mt-24 rounded-2xl">
              <CitationCard c={c} />
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

// The cited moments stitched into one video by Cloudinary — watch the whole answer, across sessions.
function AnswerReel({ reel }: { reel: NonNullable<Reel> }) {
  const [playing, setPlaying] = useState(false);
  if (playing) {
    return <video src={reel.url} className="mt-5 aspect-video w-full rounded-2xl bg-black" controls autoPlay playsInline />;
  }
  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="mt-5 flex w-full items-center gap-4 rounded-2xl border border-accent/40 bg-accent/10 p-4 text-left hover:bg-accent/15"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-accent-fg">▶</span>
      <span>
        <span className="block font-semibold">Watch the answer</span>
        <span className="text-sm text-muted">
          {reel.clips} moments stitched into one <span className="tabular">{formatTime(reel.durationS)}</span> video
        </span>
      </span>
    </button>
  );
}

// Renders "…early stopping [2]." with [n] as chips that jump to (and pulse) their clip card.
function AnswerText({ text }: { text: string }) {
  const parts = text.split(/(\[\d+\])/g);
  function focus(n: string) {
    const el = document.getElementById(`cite-${n}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("pulse");
    void el.offsetWidth; // restart the animation
    el.classList.add("pulse");
  }
  return (
    <p className="mt-3 text-lg leading-relaxed">
      {parts.map((part, i) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (!match) return <span key={i}>{part}</span>;
        return (
          <button
            key={i}
            type="button"
            onClick={() => focus(match[1]!)}
            aria-label={`Source ${match[1]}`}
            className="mx-0.5 inline-grid min-h-6 min-w-6 place-items-center rounded-full bg-accent px-1.5 align-text-top text-xs font-semibold text-accent-fg"
          >
            {match[1]}
          </button>
        );
      })}
    </p>
  );
}

function CitationCard({ c }: { c: Citation }) {
  const [playing, setPlaying] = useState(false);
  return (
    <article className="h-full rounded-2xl border border-border bg-bg p-3">
      <div className="relative overflow-hidden rounded-xl bg-black">
        {playing ? (
          <video src={clipUrl(c.publicId, c.startS, c.endS)} className="aspect-video w-full" controls autoPlay playsInline />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="group block w-full" aria-label={`Play ${c.title} at ${formatTime(c.startS)}`}>
            <Image
              src={thumbUrl(c.publicId, c.startS)}
              alt=""
              width={640}
              height={360}
              unoptimized
              className="aspect-video w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
            />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-12 place-items-center rounded-full bg-white/90 text-black shadow-lg">▶</span>
            </span>
          </button>
        )}
        <span className="absolute top-2 left-2 grid size-6 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-fg">
          {c.n}
        </span>
      </div>
      <p className="mt-2.5 font-medium">{c.title}</p>
      <p className="text-sm text-muted">
        {c.speaker ?? "Unknown speaker"} · <span className="tabular">{formatTime(c.startS)}</span>
      </p>
      <p className="mt-1.5 line-clamp-3 text-sm">
        “<Snippet parts={c.snippet} />”
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/watch/${c.lectureId}?t=${Math.floor(c.startS)}`}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:border-accent"
        >
          Open full session
        </Link>
        <MomentButton
          lectureId={c.lectureId}
          publicId={c.publicId}
          title={c.title}
          startS={c.startS}
          endS={c.endS}
          durationS={c.durationS}
          words={c.words}
        />
      </div>
    </article>
  );
}
