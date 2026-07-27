"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Primitives";
import type { CaseData, CaseLevel } from "@/lib/case-types";
import { CaseFolder } from "./CaseFolder";

type Filter = "ALL" | CaseLevel;
const FILTERS: Filter[] = ["ALL", "RED", "AMBER", "GREEN"];

export function CaseHubClient({ cases }: { cases: CaseData[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const visibleCases = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return cases.filter((caseData) => {
      const matchesLevel = filter === "ALL" || caseData.level === filter;
      const matchesQuery = !normalized || [caseData.case_id, caseData.title, caseData.short_summary, ...caseData.theme]
        .some((value) => value.toLowerCase().includes(normalized));
      return matchesLevel && matchesQuery;
    });
  }, [cases, filter, query]);

  return (
    <>
      <div className="mt-7 flex flex-col gap-3 border-y-2 border-ink bg-surface-2 py-4 sm:flex-row sm:items-center">
        <Input aria-label="Search cases" placeholder="Search case files" value={query} onChange={(event) => setQuery(event.target.value)} className="sm:max-w-sm" />
        <div className="flex flex-wrap gap-2" aria-label="Filter by threat level">
          {FILTERS.map((value) => (
            <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value} className={`min-h-10 rounded-[4px] border-2 border-ink px-3 text-xs font-black ${filter === value ? "bg-ink text-background" : "bg-surface"}`}>
              {value}
            </button>
          ))}
        </div>
      </div>
      {visibleCases.length > 0 ? (
        <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {visibleCases.map((caseData) => <CaseFolder key={caseData.case_id} caseData={caseData} />)}
        </div>
      ) : (
        <p className="mt-10 border-2 border-dashed border-ink p-8 text-center font-bold">No case files match this search.</p>
      )}
    </>
  );
}
