const LABELS = {
  processing: { text: "Processing", color: "bg-processing" },
  ready: { text: "Ready", color: "bg-ready" },
  transcript_failed: { text: "Not searchable", color: "bg-failed" },
} as const;

export function StatusBadge({ status }: { status: keyof typeof LABELS }) {
  const { text, color } = LABELS[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium">
      <span aria-hidden className={`size-2 rounded-full ${color}`} />
      {text}
    </span>
  );
}
