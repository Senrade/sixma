import Image from "next/image";
import { CaseFolder } from "@/components/cases/CaseFolder";
import { AppShell } from "@/components/site/AppShell";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { ScrollReveal } from "@/components/site/ScrollReveal";
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
          preload
          sizes="100vw"
          className="object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 bg-slate-950/45" aria-hidden />
        <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl items-end px-4 pb-14 pt-20 sm:px-6 lg:pb-16">
          <div className="max-w-3xl">
            <p className="mb-4 font-mono text-sm font-black uppercase text-amber-300">Media literacy, learned by doing</p>
            <h1 className="font-display text-4xl font-black leading-[1.05] sm:text-6xl lg:text-7xl">
              Veritas.Lab
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-100 sm:text-xl">
              An interactive media-literacy game for students, families, and educators. Work through realistic cases before the same pressure appears in real life.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/cases" tone="accent" className="min-h-12 px-5 text-base">Open case hub</ButtonLink>
              <ButtonLink href="/redeem" tone="secondary" className="min-h-12 px-5 text-base">Redeem card</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-ink bg-background py-14 sm:py-18">
        <ScrollReveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <SectionLabel className="lg:text-sm">What it is</SectionLabel>
              <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl lg:text-[2.5rem]">Practice the pause before you trust or share</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-ink-soft lg:text-lg lg:leading-8">Veritas.Lab turns misinformation patterns into short investigations. Players inspect the source material, identify the persuasive technique, and trace how an unsupported claim grows.</p>
            </div>
            <div>
              <p className="font-mono text-xs font-black uppercase text-danger lg:text-sm">Built for</p>
              <div className="mt-3 grid gap-px border-2 border-ink bg-ink sm:grid-cols-3">
                {[
                  ["Students", "Build verification habits before reacting to viral content."],
                  ["Families", "Discuss scams, emotional pressure, and suspicious claims together."],
                  ["Educators", "Use compact cases for guided media-literacy practice."],
                ].map(([audience, copy]) => (
                  <article key={audience} className="bg-surface p-5">
                    <h3 className="text-lg font-black lg:text-xl">{audience}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink-soft lg:text-base lg:leading-7">{copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="border-b-2 border-ink bg-accent py-12">
        <ScrollReveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionLabel className="lg:text-sm">How an investigation works</SectionLabel>
          <div className="mt-6 grid gap-px border-2 border-ink bg-ink md:grid-cols-3">
            {[
              ["01", "Inspect evidence", "Locate visual inconsistencies instead of trusting first impressions."],
              ["02", "Question the claim", "Mark the exact language that pushes fear or faulty reasoning."],
              ["03", "Trace the chain", "Rebuild the sequence used to move a person from hook to harm."],
            ].map(([number, title, copy]) => (
              <div key={number} className="bg-background p-5 sm:p-6">
                <span className="font-mono text-sm font-black text-danger">{number}</span>
                <h2 className="mt-3 text-xl font-black lg:text-2xl">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-soft lg:text-base lg:leading-7">{copy}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="case-grid-bg py-14 sm:py-18">
        <ScrollReveal className="mx-auto max-w-7xl px-4 sm:px-6">
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
        </ScrollReveal>
      </section>

      <section id="faq" className="scroll-mt-20 border-t-2 border-ink bg-background py-14 sm:py-18">
        <ScrollReveal className="mx-auto max-w-5xl px-4 sm:px-6">
          <SectionLabel>Questions and answers</SectionLabel>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Frequently asked questions</h2>
          <p className="mt-3 max-w-2xl text-ink-soft">How case progression, evidence practice, and this independent project work.</p>
          <FaqAccordion />
        </ScrollReveal>
      </section>
    </AppShell>
  );
}
