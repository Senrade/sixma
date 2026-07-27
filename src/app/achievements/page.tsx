import type { Metadata } from "next";
import { AchievementsClient } from "@/components/cases/AchievementsClient";
import { AppShell } from "@/components/site/AppShell";
import { SectionLabel } from "@/components/ui/Primitives";
import { getCases } from "@/lib/cases";

export const metadata: Metadata = { title: "Achievements" };
export default async function AchievementsPage() { const cases = await getCases(); return <AppShell><section className="case-grid-bg min-h-[70vh] py-12 sm:py-16"><div className="mx-auto max-w-7xl px-4 sm:px-6"><SectionLabel>This device</SectionLabel><h1 className="mt-3 text-4xl font-black sm:text-5xl">Achievements</h1><p className="mt-3 max-w-2xl text-lg text-ink-soft">Milestones are calculated from completed investigations stored in this browser.</p><AchievementsClient cases={cases} /></div></section></AppShell>; }
