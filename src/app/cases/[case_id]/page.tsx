import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/site/AppShell";
import { ButtonLink, Chip, SectionLabel } from "@/components/ui/Primitives";
import { getCase, getCases } from "@/lib/cases";

export async function generateStaticParams() {
  return (await getCases()).map((caseData) => ({ case_id: caseData.case_id }));
}

export async function generateMetadata({ params }: { params: Promise<{ case_id: string }> }): Promise<Metadata> {
  const { case_id } = await params;
  const caseData = await getCase(case_id);
  return { title: caseData?.title ?? "Case not found", description: caseData?.short_summary };
}

export default async function CaseBriefingPage({ params }: { params: Promise<{ case_id: string }> }) {
  const { case_id } = await params;
  const caseData = await getCase(case_id);
  if (!caseData) notFound();

  const modules = [
    ["01", "Inspect the image", "Find a visual anomaly and explain why it is meaningful."],
    ["02", "Analyze the language", "Select the exact passage that uses a persuasive trap."],
    ["03", "Reconstruct the chain", "Place each stage of the manipulation in order."],
  ];

  return (
    <AppShell>
      <section className="border-b-2 border-ink bg-surface-2 py-10 sm:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="flex flex-wrap gap-2"><Chip tone="red">{caseData.level}</Chip><Chip>{caseData.case_id}</Chip></div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">{caseData.title}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">{caseData.short_summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">{caseData.skills.map((skill) => <Chip key={skill} tone="blue">{skill}</Chip>)}</div>
            <div className="mt-8 flex flex-wrap gap-3"><ButtonLink href={`/mission/${caseData.case_id}`} tone="accent">Begin investigation</ButtonLink><ButtonLink href="/cases" tone="secondary">Back to hub</ButtonLink></div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] border-2 border-ink bg-background shadow-[8px_8px_0_0_var(--color-ink)]">
            <Image src={caseData.modules.step_1_image_forensics.image_url} alt={`Primary evidence for ${caseData.title}`} fill sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" preload />
            <span className="absolute right-4 top-4 -rotate-3 border-2 border-danger bg-background px-3 py-1 font-mono text-xs font-black uppercase text-danger">Unverified</span>
          </div>
        </div>
      </section>
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionLabel>Case briefing</SectionLabel>
          <div className="mt-5 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div><h2 className="text-2xl font-black">The situation</h2><p className="mt-3 leading-7 text-ink-soft">{caseData.story_context}</p><p className="mt-4 font-mono text-sm font-bold">Estimated time: {caseData.duration_min} minutes</p></div>
            <div className="grid gap-px border-2 border-ink bg-ink sm:grid-cols-3">{modules.map(([number, title, copy]) => <div key={number} className="bg-surface p-5"><span className="font-mono text-sm font-black text-danger">{number}</span><h3 className="mt-2 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-ink-soft">{copy}</p></div>)}</div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
