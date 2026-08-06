"use client";

import Image from "next/image";
import { ButtonLink, Chip } from "@/components/ui/Primitives";
import { useI18n } from "@/i18n/I18nProvider";
import type { CaseData, CaseLevel } from "@/lib/case-types";

export type CaseAccess = "available" | "locked" | "completed";

const LEVEL_TONE: Record<CaseLevel, "red" | "amber" | "green"> = {
  RED: "red",
  AMBER: "amber",
  GREEN: "green",
};

const TAB_COLOR: Record<CaseLevel, string> = {
  RED: "bg-danger",
  AMBER: "bg-warn",
  GREEN: "bg-success",
};

export function CaseFolder({
  caseData,
  progress,
  access = "available",
  revealDetails = true,
  prerequisiteCaseId,
}: {
  caseData: CaseData;
  progress?: number;
  access?: CaseAccess;
  revealDetails?: boolean;
  prerequisiteCaseId?: string;
}) {
  const imageModule = caseData.modules.step_1_image_forensics;
  const isLocked = access === "locked";
  const isCompleted = access === "completed";
  const { localizePath, t } = useI18n();

  return (
    <div className="group relative pt-4">
      <div className={`absolute left-6 top-0 h-6 w-40 max-w-[45%] border-[3px] border-border ${TAB_COLOR[caseData.level]} shadow-[3px_-2px_0_0_var(--color-accent)]`} aria-hidden>
        <span className="block px-3 py-0.5 font-mono text-[11px] font-black uppercase">{caseData.case_id}</span>
      </div>
      <article className={`relative border-[3px] border-border bg-surface shadow-[6px_6px_0_0_var(--color-warn),10px_10px_0_0_color-mix(in_oklab,var(--color-accent)_30%,transparent)] transition-[transform,box-shadow] duration-150 ${isLocked ? "opacity-70" : "group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"}`}>
        <div className="flex items-center gap-2 border-b-[3px] border-border bg-surface-2 px-4 py-2">
          <span className="font-mono text-[11px] font-bold uppercase text-ink-soft">{t("case.file")}</span>
          <Chip tone={isCompleted ? "green" : LEVEL_TONE[caseData.level]} className="ml-auto">{isCompleted ? t("case.completed") : isLocked ? t("case.locked") : caseData.level}</Chip>
        </div>
        <div className="relative px-4 pb-3 pt-6">
          <span className="absolute left-1/2 top-2 h-4 w-16 -translate-x-1/2 -rotate-3 border-2 border-ink bg-warn shadow-[2px_2px_0_0_var(--color-ink)]" aria-hidden />
          <div className="relative h-44 overflow-hidden border-[3px] border-border bg-background">
            {revealDetails ? (
              <Image src={imageModule.image_url} alt={t("case.imageAlt", { title: caseData.title })} fill loading="eager" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
            ) : (
              <div className="case-grid-bg grid h-full place-items-center p-5 text-center">
                <div>
                  <span className="inline-grid h-11 w-11 place-items-center border-[3px] border-info bg-info font-mono text-xl font-black text-info-foreground">?</span>
                  <p className="mt-3 font-mono text-xs font-black uppercase">{t("case.evidenceSealed")}</p>
                  <p className="mt-1 text-xs text-ink-soft">{t("case.sealedText")}</p>
                </div>
              </div>
            )}
          </div>
          <span className="absolute right-3 top-4 -rotate-3 border-[3px] border-danger bg-background px-1.5 py-0.5 font-mono text-[10px] font-black uppercase text-danger" aria-hidden>{revealDetails ? t("case.evidence") : t("case.classified")}</span>
        </div>
        <div className="px-4 pb-4">
          <div className="mb-2 flex flex-wrap gap-1.5">{caseData.theme.map((theme) => <Chip key={theme}>{theme}</Chip>)}</div>
          <h2 className="font-display text-lg font-black leading-tight">{caseData.title}</h2>
          {revealDetails ? <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{caseData.short_summary}</p> : <p className="mt-1.5 text-sm text-ink-soft">{t("case.hiddenSummary")}</p>}
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-ink-soft">
            <span>{caseData.duration_min} {t("case.minutes")}</span><span>3 {t("case.modules")}</span>
          </div>
          {typeof progress === "number" && <div className="mt-3 h-2 overflow-hidden rounded-[3px] border-2 border-ink bg-background"><div className="h-full bg-info" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} /></div>}
          {isLocked ? (
            <div className="mt-4 border-[3px] border-border bg-muted px-4 py-2 text-center text-sm font-bold text-ink-soft">
              {t("case.unlock", { caseId: prerequisiteCaseId ?? t("case.previous") })}
            </div>
          ) : (
            <ButtonLink href={localizePath(`/cases/${caseData.case_id}`)} tone={isCompleted ? "secondary" : "accent"} className="mt-4 w-full sm:w-auto">
              {isCompleted ? t("case.review") : t("case.investigate")} <span aria-hidden>-&gt;</span>
            </ButtonLink>
          )}
        </div>
      </article>
    </div>
  );
}
