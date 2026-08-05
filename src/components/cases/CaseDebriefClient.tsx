"use client";

import { LocalizedText } from "@/components/site/LocalizedCopy";
import { ButtonLink, Card, Chip, SectionLabel } from "@/components/ui/Primitives";
import type { LocalizableCaseData } from "@/lib/case-types";
import { useLocalizedCase } from "@/lib/use-localized-cases";

export function CaseDebriefClient({ rawCaseData }: { rawCaseData: LocalizableCaseData }) {
  const caseData = useLocalizedCase(rawCaseData);
  const traps = caseData.modules.step_2_text_highlight.traps;

  return (
    <>
      <section className="border-b-2 border-ink bg-success py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="font-mono text-sm font-black uppercase"><LocalizedText messageKey="debrief.kicker" replacements={{ caseId: caseData.case_id }} /></p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl"><LocalizedText messageKey="debrief.complete" /></h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg"><LocalizedText messageKey="debrief.summary" /></p>
        </div>
      </section>
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <SectionLabel><LocalizedText messageKey="debrief.label" /></SectionLabel>
          <h2 className="mt-3 text-3xl font-black"><LocalizedText messageKey="debrief.title" /></h2>
          <Card tone="warn" className="mt-6 p-5 sm:p-7">
            <p className="text-sm font-black uppercase"><LocalizedText messageKey="debrief.reflection" /></p>
            <p className="mt-3 text-xl font-bold">{caseData.dialogue_trigger.question}</p>
            <p className="mt-4 leading-7">{caseData.dialogue_trigger.mil_insight}</p>
          </Card>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {traps.map((trap) => (
              <div key={trap.trap_id} className="border-l-4 border-danger bg-surface-2 p-5">
                <div className="flex flex-wrap gap-2">{trap.weapon_type.map((weapon) => <Chip key={weapon} tone="red">{weapon}</Chip>)}</div>
                <p className="mt-3 text-sm leading-6 text-ink-soft">{trap.socratic_quiz.explanation}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/cases" tone="accent"><LocalizedText messageKey="debrief.anotherCase" /></ButtonLink>
            <ButtonLink href={`/mission/${caseData.case_id}`} tone="secondary"><LocalizedText messageKey="debrief.replay" /></ButtonLink>
            <ButtonLink href="/learn" tone="ghost"><LocalizedText messageKey="debrief.knowledgeHub" /></ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
