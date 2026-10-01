import Link from "next/link";

import { LibraryGrid } from "@/components/LibraryGrid";
import { SearchBar } from "@/components/SearchBar";
import { listLectures, popularTopics, type Lecture } from "@/lib/lectures";
import { log } from "@/lib/log";

export const dynamic = "force-dynamic";

async function loadLibrary(): Promise<{ lectures: Lecture[]; topics: string[] }> {
  try {
    const [lectures, topics] = await Promise.all([listLectures({ includeAll: false }), popularTopics()]);
    return { lectures, topics };
  } catch (error) {
    // The hero and search still render if the database is unreachable.
    log("home.library_failed", { error: error instanceof Error ? error.message : String(error) });
    return { lectures: [], topics: [] };
  }
}

export default async function Home() {
  const { lectures, topics } = await loadLibrary();

  return (
    <>
      <section className="pt-12 pb-10 sm:pt-20">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Ask your recordings.
          <br />
          <span className="text-accent">Watch the answer.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted">
          Every lecture and talk in this library — searchable by what was said, answerable in plain language, with
          every answer a clip of the moment it came from.
        </p>
        <div className="mt-8 max-w-2xl">
          <SearchBar />
          {topics.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted">Try:</span>
              {topics.map((t) => (
                <Link
                  key={t}
                  href={`/search?q=${encodeURIComponent(t)}`}
                  className="rounded-full border border-border bg-surface px-3 py-1 hover:border-accent"
                >
                  {t}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="library-heading">
        <h2 id="library-heading" className="mb-4 text-lg font-semibold">
          Library <span className="font-normal text-muted">· {lectures.length} sessions</span>
        </h2>
        <LibraryGrid lectures={lectures} />
      </section>
    </>
  );
}
