"use client";

import { useEffect, useMemo, useState } from "react";
import { Chip, Input } from "@/components/ui/Primitives";
import type { CaseData, CaseLevel } from "@/lib/case-types";
import { CaseFolder, type CaseAccess } from "./CaseFolder";

type Filter = "ALL" | CaseLevel;
type GameMode = "full-case" | "module-practice";

const FILTERS: Filter[] = ["ALL", "RED", "AMBER", "GREEN"];

export function CaseHubClient({ cases }: { cases: CaseData[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [gameMode, setGameMode] = useState<GameMode>("full-case");
  const [completedCaseIds, setCompletedCaseIds] = useState<string[] | null>(null);

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
    const caseIndex = cases.findIndex((candidate) => candidate.case_id === caseData.case_id);
    if (caseIndex <= 0) return "available";
    return completedCaseIds?.includes(cases[caseIndex - 1].case_id) ? "available" : "locked";
  };

  return (
    <>
      <div className="mt-7 border-y-2 border-ink bg-surface-2 py-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-end">
          <div>
            <label htmlFor="case-search" className="mb-1.5 block text-xs font-black uppercase">Search investigations</label>
            <Input id="case-search" aria-label="Search cases" placeholder="Title, case ID, or topic" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-black uppercase">Game mode</p>
            <div className="inline-grid w-full grid-cols-2 rounded-[6px] border-2 border-ink bg-surface p-1 sm:w-auto" aria-label="Select game mode">
              <button type="button" onClick={() => setGameMode("full-case")} aria-pressed={gameMode === "full-case"} className={`min-h-10 px-4 text-sm font-black ${gameMode === "full-case" ? "bg-ink text-background" : "text-ink-soft"}`}>Full case</button>
              <button type="button" onClick={() => setGameMode("module-practice")} aria-pressed={gameMode === "module-practice"} className={`min-h-10 px-4 text-sm font-black ${gameMode === "module-practice" ? "bg-ink text-background" : "text-ink-soft"}`}>Module practice</button>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter by threat level">
          {FILTERS.map((value) => (
            <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value} className={`min-h-10 rounded-[4px] border-2 border-ink px-3 text-xs font-black ${filter === value ? "bg-accent text-accent-foreground shadow-[2px_2px_0_0_var(--color-ink)]" : "bg-surface"}`}>
              {value}
            </button>
          ))}
        </div>
      </div>

      {gameMode === "module-practice" ? (
        <div className="mt-8 rounded-[8px] border-2 border-ink bg-surface p-6 shadow-[6px_6px_0_0_var(--color-ink)] sm:p-8">
          <Chip tone="amber">Coming soon</Chip>
          <h2 className="mt-4 text-2xl font-black">Practice individual modules</h2>
          <p className="mt-2 max-w-2xl text-ink-soft">Module practice will unlock after a full case is completed. For now, every investigation follows the complete evidence-to-explanation learning sequence.</p>
        </div>
      ) : completedCaseIds === null ? (
        <p className="mt-10 border-2 border-dashed border-ink p-8 text-center font-bold">Checking investigation access...</p>
      ) : visibleCases.length > 0 ? (
        <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {visibleCases.map((caseData) => {
            const caseIndex = cases.findIndex((candidate) => candidate.case_id === caseData.case_id);
            const access = getCaseAccess(caseData);
            return (
              <CaseFolder
                key={caseData.case_id}
                caseData={caseData}
                access={access}
                revealDetails={access === "completed"}
                prerequisiteCaseId={caseIndex > 0 ? cases[caseIndex - 1].case_id : undefined}
              />
            );
          })}
        </div>
      ) : (
        <p className="mt-10 border-2 border-dashed border-ink p-8 text-center font-bold">No case files match this search.</p>
      )}
    </>
  );
}
