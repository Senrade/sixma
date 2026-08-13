"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardView } from "@/components/cases/DashboardView";
import type { CaseData } from "@/lib/case-types";
import {
  getLearningAchievementProgress,
  getStandardCases,
  type LearningAchievementId,
} from "@/lib/learning-achievements";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/messages/types";

interface CaseProgress {
  step: number;
  completedAt?: string;
}

const ACHIEVEMENT_TITLE_KEYS: Record<LearningAchievementId, MessageKey> = {
  "evidence-loop": "achievements.evidence.title",
  "method-transfer": "achievements.transfer.title",
  "full-spectrum": "achievements.investigator.title",
};

export function DashboardClient({ cases }: { cases: CaseData[] }) {
  const { localizePath, t } = useI18n();
  const [progress, setProgress] = useState<Record<string, CaseProgress> | null>(null);
  const standardCases = useMemo(() => getStandardCases(cases), [cases]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next: Record<string, CaseProgress> = {};
      for (const caseData of standardCases) {
        try {
          const storedStep = Number(
            window.localStorage.getItem(
              `unesco-mil-game:v2:${caseData.case_id}:current-step`,
            ),
          );
          const completedAt =
            window.localStorage.getItem(
              `veritas-case:${caseData.case_id}:completed-at`,
            ) ?? undefined;
          next[caseData.case_id] = {
            step: [1, 2, 3].includes(storedStep) ? storedStep : 0,
            completedAt,
          };
        } catch {
          next[caseData.case_id] = { step: 0 };
        }
      }
      setProgress(next);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [standardCases]);

  if (!progress) {
    return <p className="mt-8 font-mono text-sm">{t("dashboard.loading")}</p>;
  }

  const completedCaseIds = standardCases
    .filter((caseData) => progress[caseData.case_id]?.completedAt)
    .map((caseData) => caseData.case_id);
  const completed = completedCaseIds.length;
  const inProgress = standardCases.filter((caseData) => {
    const state = progress[caseData.case_id];
    return state?.step > 0 && !state.completedAt;
  }).length;
  const remaining = Math.max(standardCases.length - completed - inProgress, 0);
  const totalProgress = standardCases.reduce((sum, caseData) => {
    const state = progress[caseData.case_id];
    if (state?.completedAt) return sum + 100;
    if (state?.step > 0) return sum + ((state.step - 1) / 3) * 100;
    return sum;
  }, 0);
  const overallProgress = totalProgress / Math.max(standardCases.length, 1);
  const achievements = getLearningAchievementProgress(cases, completedCaseIds).map(
    (achievement) => ({
      ...achievement,
      title: t(ACHIEVEMENT_TITLE_KEYS[achievement.id]),
    }),
  );

  return (
    <DashboardView
      completed={completed}
      inProgress={inProgress}
      remaining={remaining}
      total={standardCases.length}
      overallProgress={overallProgress}
      achievements={achievements}
      achievementsHref={localizePath("/achievements")}
      labels={{
        progressTitle: t("dashboard.progressTitle"),
        progressDescription: t("dashboard.progressDescription"),
        completed: t("dashboard.completed"),
        inProgress: t("dashboard.inProgress"),
        remaining: t("dashboard.remaining"),
        learningPath: t("dashboard.learningPath"),
        caseProgress: t("dashboard.caseProgress"),
        achievementsTitle: t("dashboard.achievementsTitle"),
        achievementsDescription: t("dashboard.achievementsDescription"),
        earned: t("achievements.earned"),
        locked: t("achievements.locked"),
        viewAchievements: t("dashboard.viewAchievements"),
      }}
    />
  );
}
