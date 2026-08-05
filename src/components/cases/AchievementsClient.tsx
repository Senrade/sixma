"use client";

import { useEffect, useState } from "react";
import { Card, Chip } from "@/components/ui/Primitives";
import type { LocalizableCaseData } from "@/lib/case-types";
import { useI18n } from "@/i18n/I18nProvider";

export function AchievementsClient({ cases }: { cases: LocalizableCaseData[] }) {
  const { t } = useI18n();
  const [completed, setCompleted] = useState<number | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      let total = 0;
      try {
        for (const caseData of cases) if (window.localStorage.getItem(`veritas-case:${caseData.case_id}:completed-at`)) total += 1;
      } catch { total = 0; }
      setCompleted(total);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [cases]);

  const count = completed ?? 0;
  const achievements = [
    { id: "first", title: t("achievements.first.title"), description: t("achievements.first.description"), earned: count >= 1 },
    { id: "investigator", title: t("achievements.investigator.title"), description: t("achievements.investigator.description"), earned: count >= cases.length && cases.length > 0 },
    { id: "evidence", title: t("achievements.evidence.title"), description: t("achievements.evidence.description"), earned: false },
  ];

  return <div className="mt-8 grid gap-5 md:grid-cols-3">{achievements.map((achievement) => <Card key={achievement.id} tone={achievement.earned ? "success" : "muted"} className="p-5"><Chip tone={achievement.earned ? "green" : "neutral"}>{achievement.earned ? t("achievements.earned") : t("achievements.locked")}</Chip><h2 className="mt-4 text-xl font-black">{achievement.title}</h2><p className="mt-2 text-sm leading-6">{achievement.description}</p></Card>)}</div>;
}
