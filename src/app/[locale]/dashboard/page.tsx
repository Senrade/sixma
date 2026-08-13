import { DashboardClient } from "@/components/cases/DashboardClient";
import { AppShell } from "@/components/site/AppShell";
import { LocalizedPageIntro } from "@/components/site/LocalizedCopy";
import { getCases } from "@/lib/cases";
import { requireLocale } from "@/i18n/params";
import { getLocalizedMetadata, type LocalePageProps } from "@/i18n/metadata";

export function generateMetadata({ params }: LocalePageProps) { return getLocalizedMetadata(params, "metadata.title.dashboard"); }

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const cases = await getCases(requireLocale(localeParam));
  return <AppShell><section className="case-grid-bg min-h-[70vh] py-12 sm:py-16"><div className="mx-auto max-w-7xl px-4 sm:px-6"><LocalizedPageIntro kicker="dashboard.kicker" title="dashboard.title" description="dashboard.intro" /><DashboardClient cases={cases} /></div></section></AppShell>;
}
