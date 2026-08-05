import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseBriefingClient } from "@/components/cases/CaseBriefingClient";
import { AppShell } from "@/components/site/AppShell";
import { getCase, getCases } from "@/lib/cases";
import { en } from "@/i18n/messages/en";

export async function generateStaticParams() {
  return (await getCases()).map((caseData) => ({ case_id: caseData.case_id }));
}

export async function generateMetadata({ params }: { params: Promise<{ case_id: string }> }): Promise<Metadata> {
  const { case_id } = await params;
  const caseData = await getCase(case_id);
  return { title: caseData?.title ?? en["metadata.notFound.case"], description: caseData?.short_summary };
}

export default async function CaseBriefingPage({ params }: { params: Promise<{ case_id: string }> }) {
  const { case_id } = await params;
  const caseData = await getCase(case_id);
  if (!caseData) notFound();

  return (
    <AppShell>
      <CaseBriefingClient rawCaseData={caseData} />
    </AppShell>
  );
}
