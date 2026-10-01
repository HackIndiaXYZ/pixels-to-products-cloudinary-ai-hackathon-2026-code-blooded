// ts_headline wraps matches in these markers (see search.ts). Splitting on them yields plain-text parts that
// React renders as text nodes — transcript content never becomes HTML, so there's nothing to escape.
export const HIT_START = "⟦";
export const HIT_END = "⟧";

export type SnippetPart = { text: string; hit: boolean };

export function splitHighlights(snippet: string): SnippetPart[] {
  const parts: SnippetPart[] = [];
  const re = new RegExp(`${HIT_START}([^${HIT_END}]*)${HIT_END}`, "g");
  let last = 0;
  for (const match of snippet.matchAll(re)) {
    if (match.index > last) parts.push({ text: snippet.slice(last, match.index), hit: false });
    if (match[1]) parts.push({ text: match[1], hit: true });
    last = match.index + match[0].length;
  }
  if (last < snippet.length) parts.push({ text: snippet.slice(last), hit: false });
  return parts;
}
