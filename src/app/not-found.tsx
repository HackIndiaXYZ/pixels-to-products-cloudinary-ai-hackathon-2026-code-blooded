import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mt-24 text-center">
      <h1 className="text-2xl font-semibold">Nothing here</h1>
      <p className="mt-2 text-muted">That page doesn&apos;t exist. Try asking the library instead.</p>
      <Link href="/" className="mt-6 inline-block rounded-lg bg-accent px-4 py-2.5 font-medium text-accent-fg">
        Back to the library
      </Link>
    </div>
  );
}
