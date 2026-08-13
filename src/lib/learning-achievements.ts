import type { CaseData } from "./case-types";
import { SPECIAL_EVENT_CASE_ID } from "./demo-event";

export type LearningAchievementId =
  | "evidence-loop"
  | "method-transfer"
  | "full-spectrum";

export interface LearningAchievementProgress {
  id: LearningAchievementId;
  current: number;
  target: number;
  earned: boolean;
}

export function getStandardCases(cases: CaseData[]): CaseData[] {
  return cases.filter((caseData) => caseData.case_id !== SPECIAL_EVENT_CASE_ID);
}

export function getLearningAchievementProgress(
  cases: CaseData[],
  completedCaseIds: string[],
): LearningAchievementProgress[] {
  const standardCaseIds = new Set(
    getStandardCases(cases).map((caseData) => caseData.case_id),
  );
  const completedUniqueCases = new Set(
    completedCaseIds.filter((caseId) => standardCaseIds.has(caseId)),
  ).size;

  return [
    {
      id: "evidence-loop",
      current: Math.min(completedUniqueCases, 1),
      target: 1,
      earned: completedUniqueCases >= 1,
    },
    {
      id: "method-transfer",
      current: Math.min(completedUniqueCases, 3),
      target: 3,
      earned: completedUniqueCases >= 3,
    },
    {
      id: "full-spectrum",
      current: Math.min(completedUniqueCases, 5),
      target: 5,
      earned: completedUniqueCases >= 5,
    },
  ];
}
