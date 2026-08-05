"use client";

import { useEffect, useState } from "react";
import { CaseFolder } from "@/components/cases/CaseFolder";
import { Card, Progress } from "@/components/ui/Primitives";
import type { LocalizableCaseData } from "@/lib/case-types";
import { useI18n } from "@/i18n/I18nProvider";
import { useLocalizedCases } from "@/lib/use-localized-cases";

interface CaseProgress {
  step: number;
  completedAt?: string;
}

export function DashboardClient({ cases: rawCases }: { cases: LocalizableCaseData[] }) {
  const { t } = useI18n();
  const cases = useLocalizedCases(rawCases);
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

  if (!progress) return <p className="mt-8 font-mono text-sm">{t("dashboard.loading")}</p>;

  const started = Object.values(progress).filter((item) => item.step > 0).length;
  const completed = Object.values(progress).filter((item) => item.completedAt).length;

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><p className="text-sm font-bold text-ink-soft">{t("dashboard.availableCases")}</p><p className="mt-2 text-4xl font-black">{cases.length}</p></Card>
        <Card tone="warn" className="p-5"><p className="text-sm font-bold">{t("dashboard.started")}</p><p className="mt-2 text-4xl font-black">{started}</p></Card>
        <Card tone="success" className="p-5"><p className="text-sm font-bold">{t("dashboard.completed")}</p><p className="mt-2 text-4xl font-black">{completed}</p></Card>
      </div>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {cases.map((caseData, caseIndex) => {
          const state = progress[caseData.case_id];
          const percentage = state.completedAt ? 100 : state.step > 0 ? Math.round(((state.step - 1) / 3) * 100) : 0;
          const previousCase = caseIndex > 0 ? cases[caseIndex - 1] : undefined;
          const previousCompleted = previousCase ? Boolean(progress[previousCase.case_id]?.completedAt) : true;
          const access = state.completedAt ? "completed" : previousCompleted ? "available" : "locked";
          return <CaseFolder key={caseData.case_id} caseData={caseData} progress={percentage} access={access} revealDetails={Boolean(state.completedAt)} prerequisiteCaseId={previousCase?.case_id} />;
        })}
      </div>
      <div className="mt-12 border-t-2 border-ink pt-8">
        <h2 className="text-2xl font-black">{t("dashboard.achievementProgress")}</h2>
        <div className="mt-4 max-w-xl"><div className="flex justify-between text-sm font-bold"><span>{t("dashboard.caseInvestigator")}</span><span>{completed}/{cases.length}</span></div><Progress value={(completed / Math.max(cases.length, 1)) * 100} className="mt-2" /></div>
        <p className="mt-3 text-sm text-ink-soft">{t("dashboard.achievementHint")}</p>
      </div>
    </>
  );
}
