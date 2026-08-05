"use client";

import { useMemo } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import type { LocalizableCaseData } from "./case-types";
import { localizeCase, localizeCases } from "./localize-case";

export function useLocalizedCase(caseData: LocalizableCaseData) {
  const { locale } = useI18n();

  return useMemo(
    () => localizeCase(caseData, locale),
    [caseData, locale],
  );
}

export function useLocalizedCases(cases: LocalizableCaseData[]) {
  const { locale } = useI18n();

  return useMemo(() => localizeCases(cases, locale), [cases, locale]);
}
