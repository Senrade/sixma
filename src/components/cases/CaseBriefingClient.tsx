"use client";

import Image from "next/image";
import { LocalizedText } from "@/components/site/LocalizedCopy";
import { ButtonLink, Chip, SectionLabel } from "@/components/ui/Primitives";
import { useI18n } from "@/i18n/I18nProvider";
import type { LocalizableCaseData } from "@/lib/case-types";
import { MODULE_GUIDE_LIST } from "@/lib/module-guides";
import { useLocalizedCase } from "@/lib/use-localized-cases";

export function CaseBriefingClient({ rawCaseData }: { rawCaseData: LocalizableCaseData }) {
  const caseData = useLocalizedCase(rawCaseData);
  const { t } = useI18n();

  return (
    <>
      <section className="border-b-2 border-ink bg-surface-2 py-10 sm:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="flex flex-wrap gap-2"><Chip tone="red">{caseData.level}</Chip><Chip>{caseData.case_id}</Chip></div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">{caseData.title}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">{caseData.short_summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">{caseData.skills.map((skill) => <Chip key={skill} tone="blue">{skill}</Chip>)}</div>
            <div className="mt-8 flex flex-wrap gap-3"><ButtonLink href={`/mission/${caseData.case_id}`} tone="accent"><LocalizedText messageKey="briefing.begin" /></ButtonLink><ButtonLink href="/cases" tone="secondary"><LocalizedText messageKey="briefing.back" /></ButtonLink></div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] border-2 border-ink bg-background shadow-[8px_8px_0_0_var(--color-ink)]">
            <Image src={caseData.modules.step_1_image_forensics.image_url} alt={t("briefing.imageAlt", { title: caseData.title })} fill sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" preload />
            <span className="absolute right-4 top-4 -rotate-3 border-2 border-danger bg-background px-3 py-1 font-mono text-xs font-black uppercase text-danger"><LocalizedText messageKey="briefing.unverified" /></span>
          </div>
        </div>
      </section>
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionLabel><LocalizedText messageKey="briefing.label" /></SectionLabel>
          <div className="mt-5 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div><h2 className="text-2xl font-black"><LocalizedText messageKey="briefing.situation" /></h2><p className="mt-3 leading-7 text-ink-soft">{caseData.story_context}</p><p className="mt-4 font-mono text-sm font-bold"><LocalizedText messageKey="briefing.estimatedTime" replacements={{ minutes: caseData.duration_min }} /></p></div>
            <div className="grid gap-px border-2 border-ink bg-ink sm:grid-cols-3">{MODULE_GUIDE_LIST.map((guide) => <div key={guide.number} className="bg-surface p-5"><span className="font-mono text-sm font-black text-danger">{guide.number}</span><h3 className="mt-2 font-black"><LocalizedText messageKey={guide.title} /></h3><p className="mt-2 text-sm leading-6 text-ink-soft"><LocalizedText messageKey={guide.summary} /></p></div>)}</div>
          </div>
        </div>
      </section>
    </>
  );
}
