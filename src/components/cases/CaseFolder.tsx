import Image from "next/image";
import { ButtonLink, Chip } from "@/components/ui/Primitives";
import type { CaseData, CaseLevel } from "@/lib/case-types";

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

export function CaseFolder({ caseData, progress }: { caseData: CaseData; progress?: number }) {
  const imageModule = caseData.modules.step_1_image_forensics;

  return (
    <div className="group relative pt-4">
      <div className={`absolute left-6 top-0 h-6 w-40 max-w-[45%] rounded-t-[8px] border-2 border-ink ${TAB_COLOR[caseData.level]} shadow-[3px_-2px_0_0_var(--color-ink)]`} aria-hidden>
        <span className="block px-3 py-0.5 font-mono text-[11px] font-black uppercase">{caseData.case_id}</span>
      </div>
      <article className="relative rounded-[8px] border-2 border-ink bg-surface shadow-[6px_6px_0_0_var(--color-ink)] transition-[transform,box-shadow] duration-150 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[8px_8px_0_0_var(--color-ink)]">
        <div className="flex items-center gap-2 border-b-2 border-ink bg-surface-2 px-4 py-2">
          <span className="font-mono text-[11px] font-bold uppercase text-ink-soft">Investigation file</span>
          <Chip tone={LEVEL_TONE[caseData.level]} className="ml-auto">{caseData.level}</Chip>
        </div>
        <div className="relative px-4 pb-3 pt-6">
          <span className="absolute left-1/2 top-2 h-4 w-16 -translate-x-1/2 -rotate-3 border-2 border-ink bg-warn shadow-[2px_2px_0_0_var(--color-ink)]" aria-hidden />
          <div className="relative h-44 overflow-hidden rounded-[6px] border-2 border-ink bg-background">
            <Image src={imageModule.image_url} alt={`Evidence for ${caseData.title}`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
          </div>
          <span className="absolute right-3 top-4 -rotate-6 border-2 border-danger px-1.5 py-0.5 font-mono text-[10px] font-black uppercase text-danger" aria-hidden>Evidence</span>
        </div>
        <div className="px-4 pb-4">
          <div className="mb-2 flex flex-wrap gap-1.5">{caseData.theme.map((theme) => <Chip key={theme}>{theme}</Chip>)}</div>
          <h2 className="font-display text-lg font-black leading-tight">{caseData.title}</h2>
          <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{caseData.short_summary}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-ink-soft">
            <span>{caseData.duration_min} min</span><span>3 modules</span>
          </div>
          {typeof progress === "number" && <div className="mt-3 h-2 overflow-hidden rounded-[3px] border-2 border-ink bg-background"><div className="h-full bg-info" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} /></div>}
          <ButtonLink href={`/cases/${caseData.case_id}`} className="mt-4 w-full sm:w-auto">Open case <span aria-hidden>-&gt;</span></ButtonLink>
        </div>
      </article>
    </div>
  );
}
