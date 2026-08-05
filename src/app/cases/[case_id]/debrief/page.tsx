import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/site/AppShell";
import { CaseDebriefClient } from "@/components/cases/CaseDebriefClient";
import { DemoAwarenessStory } from "@/components/cases/DemoAwarenessStory";
import { getCase, getCases } from "@/lib/cases";
import { FEATURED_DEMO_CASE_ID } from "@/lib/demo-case";
import { en } from "@/i18n/messages/en";

export async function generateStaticParams() {
  return (await getCases()).map((caseData) => ({ case_id: caseData.case_id }));
}

export async function generateMetadata({ params }: { params: Promise<{ case_id: string }> }): Promise<Metadata> {
  const { case_id } = await params;
  const caseData = await getCase(case_id);
  return { title: caseData ? en["metadata.title.debrief"].replace("{{caseId}}", caseData.case_id) : en["metadata.notFound.debrief"] };
}

export default async function DebriefPage({ params }: { params: Promise<{ case_id: string }> }) {
  const { case_id } = await params;
  const caseData = await getCase(case_id);
  if (!caseData) notFound();
  if (caseData.case_id === FEATURED_DEMO_CASE_ID) {
    return <DemoAwarenessStory caseData={caseData} />;
  }
  return <AppShell><CaseDebriefClient rawCaseData={caseData} /></AppShell>;
}
