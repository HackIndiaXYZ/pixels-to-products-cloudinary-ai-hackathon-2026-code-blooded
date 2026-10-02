import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mt-24 text-center">
      <h1 className="text-2xl font-semibold">This Moment isn&apos;t available</h1>
      <p className="mt-2 text-muted">The session may have been removed, or the link is wrong.</p>
      <Link href="/" className="mt-6 inline-block rounded-lg bg-accent px-4 py-2.5 font-medium text-accent-fg">
        Ask the library
      </Link>
    </div>
  );
}
