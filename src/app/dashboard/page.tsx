import type { Metadata } from "next";
import { DashboardClient } from "@/components/cases/DashboardClient";
import { AppShell } from "@/components/site/AppShell";
import { LocalizedPageIntro } from "@/components/site/LocalizedCopy";
import { getCases } from "@/lib/cases";
import { en } from "@/i18n/messages/en";

export const metadata: Metadata = { title: en["metadata.title.dashboard"] };

export default async function DashboardPage() {
  const cases = await getCases();
  return <AppShell><section className="case-grid-bg min-h-[70vh] py-12 sm:py-16"><div className="mx-auto max-w-7xl px-4 sm:px-6"><LocalizedPageIntro kicker="dashboard.kicker" title="dashboard.title" description="dashboard.intro" /><DashboardClient cases={cases} /></div></section></AppShell>;
}
