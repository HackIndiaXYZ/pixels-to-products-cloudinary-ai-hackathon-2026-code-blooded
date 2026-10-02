# Observability — Pravaha

The bar: **"What happened to this session / this question?"** answerable from logs alone in under a minute.

## Logging

`src/lib/log.ts` — one function, `log(event, fields)` → `console.log(JSON.stringify({ ts, event, ...fields }))`. Vercel function logs are the viewer (filter by `lectureId` or `event`).

| Event | Fields |
|---|---|
| `upload.signed` | `lectureId` |
| `webhook.rejected` | `reason` (signature / stale / parse) |
| `webhook.received` | `lectureId`, `infoKind`, `infoStatus` |
| `ingest.done` / `ingest.failed` | `lectureId`, `segments`, `ms` / `error` |
| `ask.done` | `status` (answered / not_found / fallback), `retrieved`, `cited`, `dropped`, `ms` |
| `ask.rate_limited` | `scope` (ip / global) |
| `ai.error` | `kind` (`unconfigured` or the error name), `message`, `ms` — Ask fell back to clips |

Never logged: transcript text, questions verbatim (only length), IPs, secrets.

## The numbers that matter before the demo

- Upload → `ready` time (from `upload.signed` → `ingest.done`)
- Ask status mix — a rising `fallback` or `not_found` share means a broken prompt or retrieval
- `dropped` citations per answer — how often the model tried to cite something it wasn't given (should be ~0)

## Error tracking, tracing, monitoring

Vercel's function logs and analytics. No Sentry, no tracing backend — `lectureId` on every line is the trace at this scale. Considered and declined, not forgotten.

## v3 events

| Event | Fields |
|---|---|
| `ai.done` / `ai.model_failed` | `task` (ask, study_pack), `model`, `ms`, `error` |
| `study_pack.done` / `study_pack.failed` | `lectureId`, `model`, `concepts`, `quiz`, `highlights` |
| `moment.warmup` | `lectureId`, `status` (Cloudinary tracking-crop pre-warm) |
| `insights.log_failed` | `error` |

`ai.model_failed` followed by `ai.done` on another model is the fallback chain working; a run of `ai.model_failed` across the whole chain means the provider is down (Ask is then serving clips).
