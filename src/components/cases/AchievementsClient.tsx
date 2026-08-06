"use client";

import { useEffect, useState } from "react";
import {
  AchievementsView,
  type AchievementTab,
} from "@/components/cases/AchievementsView";
import type { CaseData } from "@/lib/case-types";
import { getActiveDemoEventCard } from "@/lib/demo-event";
import { readDemoEventBadge } from "@/lib/demo-event-storage";
import {
  getLearningAchievementProgress,
  type LearningAchievementId,
} from "@/lib/learning-achievements";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/messages/types";

interface AchievementState {
  completedCaseIds: string[];
  hasEventBadge: boolean;
}

const ACHIEVEMENT_COPY_KEYS: Record<
  LearningAchievementId,
  { title: MessageKey; description: MessageKey }
> = {
  "evidence-loop": {
    title: "achievements.evidence.title",
    description: "achievements.evidence.description",
  },
  "method-transfer": {
    title: "achievements.transfer.title",
    description: "achievements.transfer.description",
  },
  "full-spectrum": {
    title: "achievements.investigator.title",
    description: "achievements.investigator.description",
  },
};

export function AchievementsClient({ cases }: { cases: CaseData[] }) {
  const { localizePath, t } = useI18n();
  const [state, setState] = useState<AchievementState | null>(null);
  const [activeTab, setActiveTab] = useState<AchievementTab>("learning");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const completedCaseIds: string[] = [];
      try {
        for (const caseData of cases) {
          if (
            window.localStorage.getItem(
              `veritas-case:${caseData.case_id}:completed-at`,
            )
          ) {
            completedCaseIds.push(caseData.case_id);
          }
        }
      } catch {
        completedCaseIds.length = 0;
      }
      setState({
        completedCaseIds,
        hasEventBadge: readDemoEventBadge() !== null,
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [cases]);

  if (!state) {
    return <p className="mt-8 font-mono text-sm">{t("dashboard.loading")}</p>;
  }

  const achievements = getLearningAchievementProgress(
    cases,
    state.completedCaseIds,
  ).map((achievement) => ({
    ...achievement,
    title: t(ACHIEVEMENT_COPY_KEYS[achievement.id].title),
    description: t(ACHIEVEMENT_COPY_KEYS[achievement.id].description),
  }));
  const activeCard = getActiveDemoEventCard();

  return (
    <AchievementsView
      activeTab={activeTab}
      onTabChange={setActiveTab}
      achievements={achievements}
      badge={{
        earned: state.hasEventBadge,
        title: t("badge.signalBreaker.title"),
        description: t("badge.signalBreaker.description"),
        artworkUrl: activeCard.artworkUrl,
        artworkAlt: t("redeem.cardArtAlt", { cardName: activeCard.name }),
      }}
      redeemHref={localizePath("/redeem")}
      labels={{
        tabListLabel: t("achievements.title"),
        learningTab: t("achievements.tabs.learning"),
        badgesTab: t("achievements.tabs.badges"),
        earned: t("achievements.earned"),
        locked: t("achievements.locked"),
        caseProgress: t("achievements.caseProgress"),
        badgeCount: t("achievements.badgeCount", {
          current: state.hasEventBadge ? 1 : 0,
          total: 1,
        }),
        badgeCollectionIntro: t("achievements.badgeCollectionIntro"),
        badgeLockedHint: t("achievements.badgeLockedHint"),
        redeemCard: t("achievements.redeemCard"),
      }}
    />
  );
}
