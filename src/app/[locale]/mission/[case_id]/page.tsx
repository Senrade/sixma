import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MissionExperience } from "@/components/cases/MissionExperience";
import { getCase, getCases } from "@/lib/cases";
import { requireLocale } from "@/i18n/params";
import { getMessages } from "@/i18n/server";

export async function generateStaticParams() {
  const cases = await getCases();
  return cases.map((caseData) => ({ case_id: caseData.case_id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; case_id: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, case_id: caseId } = await params;
  const locale = requireLocale(localeParam);
  const [caseData, messages] = await Promise.all([getCase(caseId, locale), getMessages(locale)]);
  return { title: caseData ? messages["metadata.title.mission"].replace("{{caseId}}", caseData.case_id) : messages["metadata.notFound.mission"] };
}

export default async function MissionPage({
  params,
}: {
  params: Promise<{ locale: string; case_id: string }>;
}) {
  const { locale: localeParam, case_id: caseId } = await params;
  const caseData = await getCase(caseId, requireLocale(localeParam));

  if (!caseData) {
    notFound();
  }

  return <MissionExperience caseData={caseData} />;
}
