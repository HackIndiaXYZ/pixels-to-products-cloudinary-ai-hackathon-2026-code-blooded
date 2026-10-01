// Ask smoke eval (docs/AI_EVALUATION.md): runs tests/eval/ask-questions.json against a deployed Pravaha.
// Usage: APP_URL=https://<app> pnpm eval:ask
import { readFileSync } from "node:fs";

const base = process.env.APP_URL;
if (!base) throw new Error("Set APP_URL to the deployed app, e.g. APP_URL=https://pravaha.vercel.app");

const { questions } = JSON.parse(readFileSync(new URL("../tests/eval/ask-questions.json", import.meta.url), "utf8"));
const rows = [];

for (const { q, answerable, expectTitle } of questions) {
  if (q.startsWith("REPLACE")) continue;
  const started = Date.now();
  const res = await fetch(`${base}/api/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: q }),
  });
  const body = await res.json();
  const cited = body.citations?.length ?? 0;
  const titles = (body.citations ?? []).map((c) => c.title);
  const pass = answerable
    ? body.status === "answered" && cited > 0 && (!expectTitle || titles.some((t) => t.includes(expectTitle)))
    : body.status === "not_found";
  rows.push({ pass: pass ? "PASS" : "FAIL", status: body.status ?? res.status, cited, ms: Date.now() - started, q: q.slice(0, 60) });
  if (answerable && body.answer) console.log(`\n${q}\n  → ${body.answer}\n  sources: ${titles.join(" | ")}`);
}

console.table(rows);
const answerable = rows.filter((_, i) => questions.filter((x) => !x.q.startsWith("REPLACE"))[i].answerable);
console.log(`\nPassed ${rows.filter((r) => r.pass === "PASS").length}/${rows.length} · fallbacks: ${rows.filter((r) => r.status === "fallback").length} · answerable with citations: ${answerable.filter((r) => r.cited > 0).length}/${answerable.length}`);
console.log("Now read each answer above against its clips and record citation precision in docs/AI_EVALUATION.md.");
