import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/site/AppShell";
import { ButtonLink, Card, Chip, SectionLabel } from "@/components/ui/Primitives";
import { getCase, getCases } from "@/lib/cases";

export async function generateStaticParams() {
  return (await getCases()).map((caseData) => ({ case_id: caseData.case_id }));
}

export async function generateMetadata({ params }: { params: Promise<{ case_id: string }> }): Promise<Metadata> {
  const { case_id } = await params;
  const caseData = await getCase(case_id);
  return { title: caseData ? `${caseData.case_id} Debrief` : "Debrief not found" };
}

export default async function DebriefPage({ params }: { params: Promise<{ case_id: string }> }) {
  const { case_id } = await params;
  const caseData = await getCase(case_id);
  if (!caseData) notFound();
  const traps = caseData.modules.step_2_text_highlight.traps;

  return <AppShell><section className="border-b-2 border-ink bg-success py-12 sm:py-16"><div className="mx-auto max-w-4xl px-4 text-center sm:px-6"><p className="font-mono text-sm font-black uppercase">Case debrief / {caseData.case_id}</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">Investigation complete</h1><p className="mx-auto mt-4 max-w-2xl text-lg">You inspected the evidence, challenged the rhetoric, and reconstructed the manipulation chain.</p></div></section><section className="py-12 sm:py-16"><div className="mx-auto max-w-4xl px-4 sm:px-6"><SectionLabel>What this case teaches</SectionLabel><h2 className="mt-3 text-3xl font-black">Carry the method forward</h2><Card tone="warn" className="mt-6 p-5 sm:p-7"><p className="text-sm font-black uppercase">Reflection question</p><p className="mt-3 text-xl font-bold">{caseData.dialogue_trigger.question}</p><p className="mt-4 leading-7">{caseData.dialogue_trigger.mil_insight}</p></Card><div className="mt-8 grid gap-4 sm:grid-cols-2">{traps.map((trap) => <div key={trap.trap_id} className="border-l-4 border-danger bg-surface-2 p-5"><div className="flex flex-wrap gap-2">{trap.weapon_type.map((weapon) => <Chip key={weapon} tone="red">{weapon}</Chip>)}</div><p className="mt-3 text-sm leading-6 text-ink-soft">{trap.socratic_quiz.explanation}</p></div>)}</div><div className="mt-8 flex flex-wrap gap-3"><ButtonLink href="/cases" tone="accent">Choose another case</ButtonLink><ButtonLink href={`/mission/${caseData.case_id}`} tone="secondary">Replay case</ButtonLink><ButtonLink href="/learn" tone="ghost">Knowledge hub</ButtonLink></div></div></section></AppShell>;
}
