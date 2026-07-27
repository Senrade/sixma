"use client";

import { useEffect, useState } from "react";
import { CaseFolder } from "@/components/cases/CaseFolder";
import { Card, Progress } from "@/components/ui/Primitives";
import type { CaseData } from "@/lib/case-types";

interface CaseProgress {
  step: number;
  completedAt?: string;
}

export function DashboardClient({ cases }: { cases: CaseData[] }) {
  const [progress, setProgress] = useState<Record<string, CaseProgress> | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next: Record<string, CaseProgress> = {};
      for (const caseData of cases) {
        try {
          const storedStep = Number(window.localStorage.getItem(`unesco-mil-game:v2:${caseData.case_id}:current-step`));
          const completedAt = window.localStorage.getItem(`veritas-case:${caseData.case_id}:completed-at`) ?? undefined;
          next[caseData.case_id] = { step: [1, 2, 3].includes(storedStep) ? storedStep : 0, completedAt };
        } catch {
          next[caseData.case_id] = { step: 0 };
        }
      }
      setProgress(next);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [cases]);

  if (!progress) return <p className="mt-8 font-mono text-sm">Loading progress from this device...</p>;

  const started = Object.values(progress).filter((item) => item.step > 0).length;
  const completed = Object.values(progress).filter((item) => item.completedAt).length;

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><p className="text-sm font-bold text-ink-soft">Available cases</p><p className="mt-2 text-4xl font-black">{cases.length}</p></Card>
        <Card tone="warn" className="p-5"><p className="text-sm font-bold">Started</p><p className="mt-2 text-4xl font-black">{started}</p></Card>
        <Card tone="success" className="p-5"><p className="text-sm font-bold">Completed</p><p className="mt-2 text-4xl font-black">{completed}</p></Card>
      </div>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {cases.map((caseData) => {
          const state = progress[caseData.case_id];
          const percentage = state.completedAt ? 100 : state.step > 0 ? Math.round(((state.step - 1) / 3) * 100) : 0;
          return <CaseFolder key={caseData.case_id} caseData={caseData} progress={percentage} />;
        })}
      </div>
      <div className="mt-12 border-t-2 border-ink pt-8">
        <h2 className="text-2xl font-black">Achievement progress</h2>
        <div className="mt-4 max-w-xl"><div className="flex justify-between text-sm font-bold"><span>Case investigator</span><span>{completed}/{cases.length}</span></div><Progress value={(completed / Math.max(cases.length, 1)) * 100} className="mt-2" /></div>
        <p className="mt-3 text-sm text-ink-soft">Complete every available investigation to earn this device-based achievement.</p>
      </div>
    </>
  );
}
