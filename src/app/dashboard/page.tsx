import type { Metadata } from "next";
import { DashboardClient } from "@/components/cases/DashboardClient";
import { AppShell } from "@/components/site/AppShell";
import { SectionLabel } from "@/components/ui/Primitives";
import { getCases } from "@/lib/cases";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const cases = await getCases();
  return <AppShell><section className="case-grid-bg min-h-[70vh] py-12 sm:py-16"><div className="mx-auto max-w-7xl px-4 sm:px-6"><SectionLabel>This device</SectionLabel><h1 className="mt-3 text-4xl font-black sm:text-5xl">Investigation dashboard</h1><p className="mt-3 max-w-2xl text-ink-soft">Your current test-build progress is stored only in this browser. Account sync will be added with the secure backend.</p><DashboardClient cases={cases} /></div></section></AppShell>;
}
