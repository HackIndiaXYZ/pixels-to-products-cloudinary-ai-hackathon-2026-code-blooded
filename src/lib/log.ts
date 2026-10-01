// Structured logs, one JSON line per event (docs/OBSERVABILITY.md). Never pass transcript text, questions or IPs.
export function log(event: string, fields: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ ts: new Date().toISOString(), event, ...fields }));
}
