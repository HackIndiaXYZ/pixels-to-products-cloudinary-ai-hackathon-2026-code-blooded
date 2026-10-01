export default function Loading() {
  return (
    <div className="mt-4" aria-busy="true" aria-label="Searching the library…">
      <div className="skeleton h-14 rounded-2xl" />
      <div className="mt-6 skeleton h-40 rounded-3xl" />
      <div className="mt-8 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
