"use client";

import { useEffect, useState } from "react";
import { Card, Chip } from "@/components/ui/Primitives";
import type { CaseData } from "@/lib/case-types";

export function AchievementsClient({ cases }: { cases: CaseData[] }) {
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
    { title: "First investigation", description: "Complete one full case.", earned: count >= 1 },
    { title: "Case investigator", description: "Complete every currently available case.", earned: count >= cases.length && cases.length > 0 },
    { title: "Evidence habit", description: "Return to the knowledge hub after an investigation.", earned: false },
  ];

  return <div className="mt-8 grid gap-5 md:grid-cols-3">{achievements.map((achievement) => <Card key={achievement.title} tone={achievement.earned ? "success" : "muted"} className="p-5"><Chip tone={achievement.earned ? "green" : "neutral"}>{achievement.earned ? "Earned" : "Locked"}</Chip><h2 className="mt-4 text-xl font-black">{achievement.title}</h2><p className="mt-2 text-sm leading-6">{achievement.description}</p></Card>)}</div>;
}
