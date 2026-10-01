import type { Metadata } from "next";

import { PasscodeForm } from "@/components/PasscodeForm";
import { Studio } from "@/components/Studio";
import { isOrganizer } from "@/lib/auth";

export const metadata: Metadata = { title: "Studio — Pravaha" };

export default async function StudioPage() {
  if (!(await isOrganizer())) return <PasscodeForm />;
  return (
    <>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Studio</h1>
      <p className="mt-1 text-muted">Upload raw recordings. Pravaha transcribes, chapters and indexes them.</p>
      <Studio />
    </>
  );
}
