import { AchievementsClient } from "@/components/cases/AchievementsClient";
import { AppShell } from "@/components/site/AppShell";
import { LocalizedPageIntro } from "@/components/site/LocalizedCopy";
import { requireLocale } from "@/i18n/params";
import { getLocalizedMetadata, type LocalePageProps } from "@/i18n/metadata";
import { getCases } from "@/lib/cases";

export function generateMetadata({ params }: LocalePageProps) { return getLocalizedMetadata(params, "metadata.title.achievements"); }
export default async function AchievementsPage({ params }: { params: Promise<{ locale: string }> }) { const { locale: localeParam } = await params; const cases = await getCases(requireLocale(localeParam)); return <AppShell><section className="case-grid-bg min-h-[70vh] py-12 sm:py-16"><div className="mx-auto max-w-7xl px-4 sm:px-6"><LocalizedPageIntro kicker="achievements.kicker" title="achievements.title" description="achievements.intro" /><AchievementsClient cases={cases} /></div></section></AppShell>; }
