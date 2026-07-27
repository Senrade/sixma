import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CaseData } from "./case-types";

let casesPromise: Promise<CaseData[]> | undefined;

function hasValidCaseShape(value: unknown): value is CaseData {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<CaseData>;
  return (
    typeof candidate.case_id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.short_summary === "string" &&
    typeof candidate.duration_min === "number" &&
    Array.isArray(candidate.skills) &&
    Array.isArray(candidate.theme) &&
    typeof candidate.modules === "object" &&
    candidate.modules !== null
  );
}

async function readCases(): Promise<CaseData[]> {
  const filePath = path.join(process.cwd(), "public", "data", "cases.json");
  const fileContents = await readFile(filePath, "utf8");
  const parsed: unknown = JSON.parse(fileContents);

  if (!Array.isArray(parsed) || !parsed.every(hasValidCaseShape)) {
    throw new Error("Case data does not match the expected schema.");
  }

  return parsed;
}

export function getCases(): Promise<CaseData[]> {
  casesPromise ??= readCases();
  return casesPromise;
}

export async function getCase(caseId: string): Promise<CaseData | undefined> {
  const cases = await getCases();
  return cases.find((caseData) => caseData.case_id === caseId);
}
