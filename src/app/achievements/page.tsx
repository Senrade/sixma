import type { Metadata } from "next";
import { AchievementsClient } from "@/components/cases/AchievementsClient";
import { AppShell } from "@/components/site/AppShell";
import { LocalizedPageIntro } from "@/components/site/LocalizedCopy";
import { en } from "@/i18n/messages/en";
import { getCases } from "@/lib/cases";

export const metadata: Metadata = { title: en["metadata.title.achievements"] };
export default async function AchievementsPage() { const cases = await getCases(); return <AppShell><section className="case-grid-bg min-h-[70vh] py-12 sm:py-16"><div className="mx-auto max-w-7xl px-4 sm:px-6"><LocalizedPageIntro kicker="achievements.kicker" title="achievements.title" description="achievements.intro" /><AchievementsClient cases={cases} /></div></section></AppShell>; }
