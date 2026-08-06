"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Card, Chip } from "@/components/ui/Primitives";
import type { CaseData } from "@/lib/case-types";
import { useI18n } from "@/i18n/I18nProvider";
import { SPECIAL_EVENT_CASE_ID } from "@/lib/demo-event";
import { readDemoEventBadge } from "@/lib/demo-event-storage";

interface AchievementState {
  completedCaseIds: string[];
  hasEventBadge: boolean;
}

export function AchievementsClient({ cases }: { cases: CaseData[] }) {
  const { t } = useI18n();
  const [state, setState] = useState<AchievementState | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const completedCaseIds: string[] = [];
      try {
        for (const caseData of cases) {
          if (window.localStorage.getItem(`veritas-case:${caseData.case_id}:completed-at`)) {
            completedCaseIds.push(caseData.case_id);
          }
        }
      } catch {
        completedCaseIds.length = 0;
      }
      setState({ completedCaseIds, hasEventBadge: readDemoEventBadge() !== null });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [cases]);

  const standardCases = cases.filter((caseData) => caseData.case_id !== SPECIAL_EVENT_CASE_ID);
  const completedCaseIds = state?.completedCaseIds ?? [];
  const completedStandardCases = standardCases.filter((caseData) =>
    completedCaseIds.includes(caseData.case_id)
  ).length;
  const achievements = [
    { id: "first", title: t("achievements.first.title"), description: t("achievements.first.description"), earned: completedCaseIds.length >= 1 },
    { id: "investigator", title: t("achievements.investigator.title"), description: t("achievements.investigator.description"), earned: completedStandardCases >= standardCases.length && standardCases.length > 0 },
    { id: "evidence", title: t("achievements.evidence.title"), description: t("achievements.evidence.description"), earned: false },
    { id: "signal-breaker", title: t("badge.signalBreaker.title"), description: t("badge.signalBreaker.description"), earned: state?.hasEventBadge ?? false, artworkUrl: "/assets/cards/card-5.svg" },
  ];

  return <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{achievements.map((achievement) => <Card key={achievement.id} tone={achievement.earned ? "success" : "muted"} className="relative overflow-hidden p-5">{"artworkUrl" in achievement && achievement.artworkUrl && achievement.earned && <div className="relative mb-4 aspect-[5/7] w-20 overflow-hidden border-[3px] border-ink bg-surface"><Image src={achievement.artworkUrl} alt="" fill sizes="80px" className="object-cover object-top" /></div>}<Chip tone={achievement.earned ? "green" : "neutral"}>{achievement.earned ? t("achievements.earned") : t("achievements.locked")}</Chip><h2 className="mt-4 text-xl font-black">{achievement.title}</h2><p className="mt-2 text-sm leading-6">{achievement.description}</p></Card>)}</div>;
}
