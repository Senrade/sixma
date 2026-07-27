import type { Metadata } from "next";
import { CaseHubClient } from "@/components/cases/CaseHubClient";
import { AppShell } from "@/components/site/AppShell";
import { SectionLabel } from "@/components/ui/Primitives";
import { getCases } from "@/lib/cases";

export const metadata: Metadata = { title: "Case Hub" };

export default async function CasesPage() {
  const cases = await getCases();
  return (
    <AppShell>
      <section className="case-grid-bg min-h-[70vh] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionLabel>Investigation archive</SectionLabel>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">Case Hub</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-soft">Choose a case and work through all three evidence-based modules.</p>
          <CaseHubClient cases={cases} />
        </div>
      </section>
    </AppShell>
  );
}
