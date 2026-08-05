"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, cn } from "@/components/ui/Primitives";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/messages/types";
import type { LocalizableCaseData } from "@/lib/case-types";
import { WELCOME_SESSION_KEY } from "@/lib/demo-case";
import { useLocalizedCase } from "@/lib/use-localized-cases";

type StoryScene = {
  signal: MessageKey;
  title: MessageKey;
  body: MessageKey;
  source?: boolean;
};

const STORY_SCENES: readonly StoryScene[] = [
  { signal: "demoStory.signal1", title: "demoStory.title1", body: "demoStory.body1", source: true },
  { signal: "demoStory.signal2", title: "demoStory.title2", body: "demoStory.body2" },
  { signal: "demoStory.signal3", title: "demoStory.title3", body: "demoStory.body3" },
  { signal: "demoStory.signal4", title: "demoStory.title4", body: "demoStory.body4" },
];

export function DemoAwarenessStory({ caseData: rawCaseData }: { caseData: LocalizableCaseData }) {
  const { t } = useI18n();
  const caseData = useLocalizedCase(rawCaseData);
  const [activeScene, setActiveScene] = useState(0);
  const scene = STORY_SCENES[activeScene];
  const isFinalScene = activeScene === STORY_SCENES.length - 1;

  useEffect(() => {
    try {
      window.sessionStorage.setItem(WELCOME_SESSION_KEY, "true");
    } catch {
      // The awareness sequence remains usable when session storage is unavailable.
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" && !isFinalScene) {
        setActiveScene((current) => Math.min(current + 1, STORY_SCENES.length - 1));
      }
      if (event.key === "ArrowLeft") {
        setActiveScene((current) => Math.max(current - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFinalScene]);

  return (
    <main className="case-grid-bg relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="scanlines pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-1 bg-info" aria-hidden />

      <header className="relative z-10 flex min-h-16 items-center justify-between gap-4 border-b-2 border-border bg-background/95 px-4 sm:px-8">
        <Link href="/" className="font-display text-lg font-black">SIX<span className="text-accent">MA</span></Link>
        <span className="font-mono text-xs font-black uppercase text-info">{t("demoStory.debrief")}</span>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col px-4 py-8 sm:px-8 sm:py-12">
        <div className="flex items-center gap-2" aria-label={t("demoStory.progressAria", { current: activeScene + 1, total: STORY_SCENES.length })}>
          {STORY_SCENES.map((_, index) => (
            <span key={index} className={cn("h-1.5 flex-1 border border-border", index <= activeScene ? "bg-info" : "bg-surface-2")} />
          ))}
        </div>

        <div className="grid flex-1 place-items-center py-8 text-center sm:py-12">
          <div key={activeScene} className="story-reveal mx-auto max-w-5xl">
            <p className="font-mono text-xs font-black uppercase text-accent sm:text-sm">
              {String(activeScene + 1).padStart(2, "0")} / {t(scene.signal)}
            </p>
            <h1 className="mt-5 text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
              {t(scene.title)}
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-ink-soft sm:text-xl sm:leading-9">
              {t(scene.body)}
              {scene.source && caseData.source && (
                <>
                  {" "}{t("demoStory.sourceBefore")}{" "}
                  <a href={caseData.source.url} target="_blank" rel="noreferrer" className="font-black text-info underline decoration-2 underline-offset-4 hover:text-accent">
                    {t("demoStory.sourceLink")}
                  </a>{" "}
                  {t("demoStory.sourceAfter")}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex min-h-14 items-center justify-between gap-3 border-t-2 border-border pt-5">
          <Button tone="ghost" className={cn(activeScene === 0 && "invisible")} tabIndex={activeScene === 0 ? -1 : 0} onClick={() => setActiveScene((current) => Math.max(current - 1, 0))}>
            {t("demoStory.back")}
          </Button>
          {isFinalScene ? (
            <Link href="/" className="inline-flex min-h-12 items-center justify-center border-[3px] border-info bg-info px-5 font-mono text-sm font-black uppercase text-info-foreground shadow-[4px_4px_0_0_var(--color-accent)] transition-transform hover:-translate-y-px">
              {t("demoStory.join")}
            </Link>
          ) : (
            <Button className="min-h-12 px-5" onClick={() => setActiveScene((current) => Math.min(current + 1, STORY_SCENES.length - 1))}>
              {t("demoStory.continue")}
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}
