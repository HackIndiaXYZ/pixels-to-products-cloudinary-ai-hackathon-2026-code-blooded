import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MomentActions } from "@/components/MomentActions";
import { MomentClip } from "@/components/MomentClip";
import { SearchBar } from "@/components/SearchBar";
import { formatTime } from "@/lib/format";
import { getMoment } from "@/lib/lectures";
import { momentUrl, SHARE_CARD, shareCardUrl } from "@/lib/media";

type Props = { params: Promise<{ segmentId: string }> };

const QUOTE_MAX = 200;

async function load(segmentId: string) {
  // Segment ids are BIGSERIAL; anything else is a bad link, not a database error.
  if (!/^\d{1,15}$/.test(segmentId)) return null;
  return getMoment(Number(segmentId));
}

const quote = (text: string) => (text.length > QUOTE_MAX ? `${text.slice(0, QUOTE_MAX - 1).trimEnd()}…` : text);

// The growth loop (docs/VISION.md): a shared Moment previews as a designed card and lands on a page
// that plays the clip and leads back into the full session and the library.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const moment = await load((await params).segmentId);
  if (!moment) return { title: "Moment not found — Pravaha" };

  const { lecture } = moment;
  const at = formatTime(moment.startS);
  const title = `${lecture.title}, at ${at}`;
  const subtitle = [lecture.speaker, at].filter(Boolean).join(" · ");
  const image = shareCardUrl(lecture.publicId, moment.startS, { title: lecture.title, subtitle });
  const listed = lecture.status === "ready" && lecture.visibility === "public";

  return {
    title: `${title} — Pravaha`,
    description: `“${quote(moment.text)}”`,
    // Unlisted sessions stay shareable by link but out of search engines.
    robots: listed ? undefined : { index: false, follow: false },
    openGraph: {
      type: "video.other",
      siteName: "Pravaha",
      title,
      description: `“${quote(moment.text)}”`,
      url: `/m/${moment.id}`,
      images: [{ url: image, ...SHARE_CARD, alt: `${lecture.title} — ${subtitle}` }],
      videos: [
        {
          url: momentUrl(lecture.publicId, moment.startS, moment.endS, { durationS: lecture.durationS, words: moment.words }),
          type: "video/mp4",
          width: 720,
          height: 1280,
        },
      ],
    },
    twitter: { card: "summary_large_image", title, description: `“${quote(moment.text)}”`, images: [image] },
  };
}

export default async function MomentPage({ params }: Props) {
  const moment = await load((await params).segmentId);
  if (!moment) notFound();

  const { lecture } = moment;
  const sessionHref = `/watch/${lecture.id}?t=${Math.floor(moment.startS)}`;

  return (
    <article className="mt-6 grid items-start gap-8 md:grid-cols-[minmax(0,360px)_1fr]">
      <div className="mx-auto w-full max-w-[360px]">
        <MomentClip
          url={momentUrl(lecture.publicId, moment.startS, moment.endS, { durationS: lecture.durationS, words: moment.words })}
        />
      </div>

      <div>
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">
          Moment · <span className="tabular">{formatTime(moment.startS)}</span>
        </p>
        <blockquote className="mt-3 border-l-4 border-accent pl-4 text-xl leading-relaxed sm:text-2xl">
          “{moment.text}”
        </blockquote>
        <h1 className="mt-5 text-lg font-semibold">{lecture.title}</h1>
        <p className="text-muted">
          {lecture.speaker ?? "Unknown speaker"}
          {moment.chapterTitle ? ` · ${moment.chapterTitle}` : ""}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={sessionHref} className="rounded-xl border border-border px-4 py-2.5 font-medium hover:border-accent">
            Watch the full session
          </Link>
          <MomentActions segmentId={moment.id} title={lecture.title} startS={moment.startS} />
        </div>

        <section aria-labelledby="ask-heading" className="mt-10 rounded-2xl border border-border bg-surface p-5">
          <h2 id="ask-heading" className="font-semibold">
            Ask the library
          </h2>
          <p className="mt-1 text-sm text-muted">
            Every answer is a clip of the moment it was said — from this session and every other one.
          </p>
          <div className="mt-4">
            <SearchBar />
          </div>
        </section>
      </div>
    </article>
  );
}
