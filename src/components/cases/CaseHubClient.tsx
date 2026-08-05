"use client";

import { useEffect, useMemo, useState } from "react";
import { Chip, Input } from "@/components/ui/Primitives";
import type { CaseData, CaseLevel } from "@/lib/case-types";
import { useI18n } from "@/i18n/I18nProvider";
import { FEATURED_DEMO_CASE_ID } from "@/lib/demo-case";
import { CaseFolder, type CaseAccess } from "./CaseFolder";

type Filter = "ALL" | CaseLevel;
type GameMode = "full-case" | "module-practice";

const FILTERS: Filter[] = ["ALL", "RED", "AMBER", "GREEN"];
const FILTER_LABELS = {
  ALL: "cases.filterAll",
  RED: "cases.filterRed",
  AMBER: "cases.filterAmber",
  GREEN: "cases.filterGreen",
} as const;

export function CaseHubClient({ cases }: { cases: CaseData[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [gameMode, setGameMode] = useState<GameMode>("full-case");
  const [completedCaseIds, setCompletedCaseIds] = useState<string[] | null>(null);
  const { t } = useI18n();
  const regularCases = useMemo(
    () => cases.filter((caseData) => caseData.case_id !== FEATURED_DEMO_CASE_ID),
    [cases],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const completed = cases.flatMap((caseData) => {
        try {
          return window.localStorage.getItem(`veritas-case:${caseData.case_id}:completed-at`)
            ? [caseData.case_id]
            : [];
        } catch {
          return [];
        }
      });
      setCompletedCaseIds(completed);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [cases]);

  const visibleCases = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return cases.filter((caseData) => {
      const matchesLevel = filter === "ALL" || caseData.level === filter;
      const matchesQuery = !normalized || [caseData.case_id, caseData.title, caseData.short_summary, ...caseData.theme]
        .some((value) => value.toLowerCase().includes(normalized));
      return matchesLevel && matchesQuery;
    });
  }, [cases, filter, query]);

  const getCaseAccess = (caseData: CaseData): CaseAccess => {
    if (completedCaseIds?.includes(caseData.case_id)) return "completed";
    if (caseData.case_id === FEATURED_DEMO_CASE_ID) return "available";
    const caseIndex = regularCases.findIndex((candidate) => candidate.case_id === caseData.case_id);
    if (caseIndex <= 0) return "available";
    return completedCaseIds?.includes(regularCases[caseIndex - 1].case_id) ? "available" : "locked";
  };

  return (
    <>
      <div className="mt-7 border-y-2 border-ink bg-surface-2 px-4 py-4">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_18.5rem] md:items-end">
          <div className="w-full">
            <label htmlFor="case-search" className="mb-1.5 block text-xs font-black uppercase">{t("cases.search")}</label>
            <Input id="case-search" aria-label={t("cases.search")} placeholder={t("cases.searchPlaceholder")} value={query} onChange={(event) => setQuery(event.target.value)} className="h-12 w-full" />
          </div>
          <div className="md:justify-self-end">
            <p className="mb-1.5 text-xs font-black uppercase">{t("cases.gameMode")}</p>
            <div className="inline-grid w-full grid-cols-2 rounded-[6px] border-2 border-ink bg-surface p-1 sm:w-auto" aria-label={t("cases.gameModeAria")}>
              <button type="button" onClick={() => setGameMode("full-case")} aria-pressed={gameMode === "full-case"} className={`min-h-10 px-4 text-sm font-black ${gameMode === "full-case" ? "bg-info text-info-foreground" : "text-ink-soft"}`}>{t("cases.fullCase")}</button>
              <button type="button" onClick={() => setGameMode("module-practice")} aria-pressed={gameMode === "module-practice"} className={`min-h-10 px-4 text-sm font-black ${gameMode === "module-practice" ? "bg-info text-info-foreground" : "text-ink-soft"}`}>{t("cases.practice")}</button>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" aria-label={t("cases.filter")}>
          {FILTERS.map((value) => (
            <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value} className={`min-h-10 rounded-[4px] border-2 border-ink px-3 text-xs font-black ${filter === value ? "bg-accent text-accent-foreground shadow-[2px_2px_0_0_var(--color-ink)]" : "bg-surface"}`}>
              {t(FILTER_LABELS[value])}
            </button>
          ))}
        </div>
      </div>

      {gameMode === "module-practice" ? (
        <div className="cyber-panel mt-8 p-6 sm:p-8">
          <Chip tone="amber">{t("cases.comingSoon")}</Chip>
          <h2 className="mt-4 text-2xl font-black">{t("cases.practiceTitle")}</h2>
          <p className="mt-2 max-w-2xl text-ink-soft">{t("cases.practiceText")}</p>
        </div>
      ) : completedCaseIds === null ? (
        <p className="mt-10 border-[3px] border-dashed border-border p-8 text-center font-bold">{t("cases.checking")}</p>
      ) : visibleCases.length > 0 ? (
        <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {visibleCases.map((caseData) => {
            const caseIndex = regularCases.findIndex((candidate) => candidate.case_id === caseData.case_id);
            const access = getCaseAccess(caseData);
            return (
              <CaseFolder
                key={caseData.case_id}
                caseData={caseData}
                access={access}
                revealDetails={access === "completed"}
                prerequisiteCaseId={caseIndex > 0 ? regularCases[caseIndex - 1].case_id : undefined}
              />
            );
          })}
        </div>
      ) : (
        <p className="mt-10 border-[3px] border-dashed border-border p-8 text-center font-bold">{t("cases.empty")}</p>
      )}
    </>
  );
}
