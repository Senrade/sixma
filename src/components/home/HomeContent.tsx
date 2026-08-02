"use client";

import Image from "next/image";
import { CaseFolder } from "@/components/cases/CaseFolder";
import { AppShell } from "@/components/site/AppShell";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { ButtonLink, SectionLabel } from "@/components/ui/Primitives";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/messages/types";
import type { CaseData } from "@/lib/case-types";
import { FEATURED_DEMO_CASE_ID } from "@/lib/demo-case";
import { WelcomeGateway } from "./WelcomeGateway";

const AUDIENCES: Array<{ number: string; title: MessageKey; text: MessageKey }> = [
  { number: "01", title: "home.students", text: "home.studentsText" },
  { number: "02", title: "home.families", text: "home.familiesText" },
  { number: "03", title: "home.educators", text: "home.educatorsText" },
];

const INVESTIGATION_STEPS: Array<{ number: string; title: MessageKey; text: MessageKey }> = [
  { number: "01", title: "home.step1", text: "home.step1Text" },
  { number: "02", title: "home.step2", text: "home.step2Text" },
  { number: "03", title: "home.step3", text: "home.step3Text" },
];

export function HomeContent({ cases }: { cases: CaseData[] }) {
  const { t } = useI18n();
  const featuredCase = cases.find((caseData) => caseData.case_id === FEATURED_DEMO_CASE_ID) ?? cases[0];

  return (
    <AppShell>
      <WelcomeGateway />
      <section className="relative h-[calc(100svh-10rem)] min-h-[400px] max-h-[700px] overflow-hidden border-b-[3px] border-border bg-background">
        <Image
          src="/assets/hero-pixel.jpg"
          alt="A cyber investigator reviewing digital evidence"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[66%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,color-mix(in_oklab,var(--background)_92%,transparent)_38%,color-mix(in_oklab,var(--background)_30%,transparent)_78%)]" aria-hidden />
        <div className="scanlines absolute inset-0 opacity-40" aria-hidden />
        <div className="pixel-grid absolute inset-0 opacity-25" aria-hidden />

        <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 py-6 sm:px-6 sm:py-10">
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-black uppercase text-success sm:text-sm">
              <span className="signal-pulse mr-2 inline-block size-2 bg-success" aria-hidden />
              {t("home.kicker")}
            </p>
            <h1 className="text-glow mt-4 text-4xl font-black leading-[1.05] text-foreground sm:text-6xl lg:text-7xl">
              SIX<span className="text-glow-accent text-accent">MA</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-foreground sm:text-lg sm:leading-8">
              {t("home.description")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href={`/mission/${FEATURED_DEMO_CASE_ID}`} tone="accent" className="min-h-12 px-5 max-sm:w-full">{t("home.playDemo")}</ButtonLink>
              <ButtonLink href="/about" tone="ghost" className="min-h-12 px-5 max-sm:w-full">{t("nav.about")}</ButtonLink>
              <ButtonLink href="/redeem" tone="secondary" className="min-h-12 px-5 max-sm:w-full">{t("home.redeem")}</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section id="vision" className="scroll-mt-20 border-b-[3px] border-border bg-background py-14 sm:py-20">
        <ScrollReveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <SectionLabel>{t("home.whatLabel")}</SectionLabel>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{t("home.whatTitle")}</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-ink-soft">{t("home.whatText")}</p>
            </div>
            <div>
              <p className="font-mono text-xs font-black uppercase text-accent">{t("home.builtFor")}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {AUDIENCES.map((audience) => (
                  <article key={audience.number} className="cyber-panel min-h-48 p-5">
                    <span className="font-mono text-2xl font-black text-warn">{audience.number}</span>
                    <h3 className="mt-4 text-lg font-black text-info">{t(audience.title)}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink-soft">{t(audience.text)}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="border-b-[3px] border-border bg-surface/80 py-14 sm:py-18">
        <ScrollReveal className="pixel-grid mx-auto max-w-7xl px-4 sm:px-6">
          <SectionLabel>{t("home.howLabel")}</SectionLabel>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {INVESTIGATION_STEPS.map((step) => (
              <article key={step.number} className="border-[3px] border-border bg-background p-5 sm:p-6">
                <span className="font-mono text-3xl font-black text-warn">{step.number}</span>
                <h2 className="mt-3 text-xl font-black text-info">{t(step.title)}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{t(step.text)}</p>
              </article>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="case-grid-bg py-14 sm:py-20">
        <ScrollReveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionLabel>{t("home.casesLabel")}</SectionLabel>
              <h2 className="mt-3 text-3xl font-black">{t("home.casesTitle")}</h2>
            </div>
            <ButtonLink href="/cases" tone="secondary">{t("home.browseAll")}</ButtonLink>
          </div>
          <div className="mt-8 max-w-xl">
            {featuredCase && <CaseFolder caseData={featuredCase} revealDetails={false} />}
          </div>
        </ScrollReveal>
      </section>

      <section id="faq" className="scroll-mt-20 border-t-[3px] border-border bg-background py-14 sm:py-20">
        <ScrollReveal className="mx-auto max-w-5xl px-4 sm:px-6">
          <SectionLabel>{t("home.faqLabel")}</SectionLabel>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">{t("home.faqTitle")}</h2>
          <p className="mt-3 max-w-2xl text-ink-soft">{t("home.faqIntro")}</p>
          <FaqAccordion />
        </ScrollReveal>
      </section>
    </AppShell>
  );
}
