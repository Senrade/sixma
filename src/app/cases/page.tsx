import type { Metadata } from "next";
import { CaseHubClient } from "@/components/cases/CaseHubClient";
import { AppShell } from "@/components/site/AppShell";
import { LocalizedPageIntro } from "@/components/site/LocalizedCopy";
import { getCases } from "@/lib/cases";

export const metadata: Metadata = { title: "Case Hub" };

export default async function CasesPage() {
  const cases = await getCases();
  return (
    <AppShell>
      <section className="case-grid-bg min-h-[70vh] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <LocalizedPageIntro kicker="cases.kicker" title="cases.title" description="cases.intro" />
          <CaseHubClient cases={cases} />
        </div>
      </section>
    </AppShell>
  );
}
