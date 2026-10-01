export default function Loading() {
  return (
    <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]" aria-busy="true" aria-label="Loading session…">
      <div>
        <div className="skeleton aspect-video rounded-2xl" />
        <div className="mt-5 skeleton h-8 w-2/3" />
        <div className="mt-2 skeleton h-4 w-1/3" />
      </div>
      <div className="skeleton h-96 rounded-2xl" />
    </div>
  );
}
