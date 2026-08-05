import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import type {
  CaseData,
  CaseTranslationMap,
  LocalizableCaseData,
} from "./case-types";
import { validateCaseTranslations } from "./localize-case";

let casesPromise: Promise<LocalizableCaseData[]> | undefined;

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

function hasValidTranslationMap(value: unknown): value is CaseTranslationMap {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readCases(): Promise<LocalizableCaseData[]> {
  const dataDirectory = path.join(process.cwd(), "public", "data");
  const [caseContents, vietnameseContents] = await Promise.all([
    readFile(path.join(dataDirectory, "cases.json"), "utf8"),
    readFile(path.join(dataDirectory, "cases.vi.json"), "utf8"),
  ]);
  const parsedCases: unknown = JSON.parse(caseContents);
  const parsedVietnamese: unknown = JSON.parse(vietnameseContents);

  if (!Array.isArray(parsedCases) || !parsedCases.every(hasValidCaseShape)) {
    throw new Error("Case data does not match the expected schema.");
  }

  if (!hasValidTranslationMap(parsedVietnamese)) {
    throw new Error("Vietnamese case translations must be keyed by case ID.");
  }

  const caseIds = new Set(parsedCases.map((caseData) => caseData.case_id));
  const translationIds = Object.keys(parsedVietnamese);
  const unknownTranslationId = translationIds.find((caseId) => !caseIds.has(caseId));

  if (unknownTranslationId) {
    throw new Error(`Vietnamese translation has no matching case: ${unknownTranslationId}.`);
  }

  const localizedCases = parsedCases.map((caseData) => {
    const translation = parsedVietnamese[caseData.case_id];
    if (!translation) {
      throw new Error(`Missing Vietnamese translation for case ${caseData.case_id}.`);
    }

    return {
      ...caseData,
      translations: { vi: translation },
    };
  });

  localizedCases.forEach(validateCaseTranslations);

  return localizedCases;
}

export function getCases(): Promise<LocalizableCaseData[]> {
  casesPromise ??= readCases();
  return casesPromise;
}

export async function getCase(
  caseId: string,
): Promise<LocalizableCaseData | undefined> {
  const cases = await getCases();
  return cases.find((caseData) => caseData.case_id === caseId);
}
