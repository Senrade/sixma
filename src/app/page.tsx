import Image from "next/image";
import { CaseFolder } from "@/components/cases/CaseFolder";
import { AppShell } from "@/components/site/AppShell";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { ButtonLink, SectionLabel } from "@/components/ui/Primitives";
import { getCases } from "@/lib/cases";

export default async function Home() {
  const cases = await getCases();
  const featuredCase = cases[0];

  return (
    <AppShell>
      <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden border-b-2 border-ink bg-slate-950 text-white">
        <Image
          src={featuredCase.spotted_url}
          alt="A marked-up investigation image from the featured case"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 bg-slate-950/45" aria-hidden />
        <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl items-end px-4 pb-16 pt-24 sm:px-6 lg:pb-20">
          <div className="max-w-3xl">
            <p className="mb-4 font-mono text-sm font-black uppercase text-amber-300">Media literacy, learned by doing</p>
            <h1 className="font-display text-4xl font-black leading-[1.05] sm:text-6xl lg:text-7xl">
              Veritas.Lab
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-100 sm:text-xl">
              Investigate manipulated media, challenge persuasive traps, and reconstruct how misinformation spreads.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/cases" tone="accent">Open case hub</ButtonLink>
              <ButtonLink href={`/cases/${featuredCase.case_id}`} tone="secondary">View featured case</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-ink bg-accent py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionLabel>How an investigation works</SectionLabel>
          <div className="mt-6 grid gap-px border-2 border-ink bg-ink md:grid-cols-3">
            {[
              ["01", "Inspect evidence", "Locate visual inconsistencies instead of trusting first impressions."],
              ["02", "Question the claim", "Mark the exact language that pushes fear or faulty reasoning."],
              ["03", "Trace the chain", "Rebuild the sequence used to move a person from hook to harm."],
            ].map(([number, title, copy]) => (
              <div key={number} className="bg-background p-5 sm:p-6">
                <span className="font-mono text-sm font-black text-danger">{number}</span>
                <h2 className="mt-3 text-xl font-black">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="case-grid-bg py-14 sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionLabel>Case files</SectionLabel>
              <h2 className="mt-3 text-3xl font-black">Start the first investigation</h2>
            </div>
            <ButtonLink href="/cases" tone="secondary">Browse all cases</ButtonLink>
          </div>
          <div className="mt-7 max-w-xl">
            {cases.slice(0, 1).map((caseData) => <CaseFolder key={caseData.case_id} caseData={caseData} revealDetails={false} />)}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 border-t-2 border-ink bg-background py-14 sm:py-18">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <SectionLabel>Questions and answers</SectionLabel>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Frequently asked questions</h2>
          <p className="mt-3 max-w-2xl text-ink-soft">How case progression, evidence practice, and this independent project work.</p>
          <FaqAccordion />
        </div>
      </section>
    </AppShell>
  );
}
