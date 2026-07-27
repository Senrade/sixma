import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MissionExperience } from "@/components/cases/MissionExperience";
import { getCase, getCases } from "@/lib/cases";

export async function generateStaticParams() {
  const cases = await getCases();
  return cases.map((caseData) => ({ case_id: caseData.case_id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ case_id: string }>;
}): Promise<Metadata> {
  const { case_id: caseId } = await params;
  const caseData = await getCase(caseId);
  return { title: caseData ? `Mission ${caseData.case_id}` : "Mission not found" };
}

export default async function MissionPage({
  params,
}: {
  params: Promise<{ case_id: string }>;
}) {
  const { case_id: caseId } = await params;
  const caseData = await getCase(caseId);

  if (!caseData) {
    notFound();
  }

  return <MissionExperience caseData={caseData} />;
}
