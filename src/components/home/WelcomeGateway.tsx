"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageSwitch } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/Primitives";
import { useI18n } from "@/i18n/I18nProvider";
import { FEATURED_DEMO_CASE_ID, WELCOME_SESSION_KEY } from "@/lib/demo-case";

type GatewayState = "checking" | "open" | "closed";

export function WelcomeGateway() {
  const router = useRouter();
  const { t } = useI18n();
  const [state, setState] = useState<GatewayState>("checking");
  const [pendingDestination, setPendingDestination] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setState(window.sessionStorage.getItem(WELCOME_SESSION_KEY) ? "closed" : "open");
      } catch {
        setState("open");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (state !== "open") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [state]);

  const navigate = (href: string) => {
    if (pendingDestination) return;

    try {
      window.sessionStorage.setItem(WELCOME_SESSION_KEY, "true");
    } catch {
      // Navigation remains available when session storage is unavailable.
    }
    setPendingDestination(href);
    router.push(href);
  };

  if (state === "closed") return null;

  if (state === "checking") {
    return <div className="fixed inset-0 z-[100] bg-background" aria-hidden />;
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-background p-3 sm:p-6">
      <div className="case-grid-bg absolute inset-0 opacity-70" aria-hidden />
      <div className="scanlines pointer-events-none absolute inset-0 opacity-45" aria-hidden />

      <div className="relative grid min-h-full place-items-center">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-title"
          aria-describedby="welcome-description"
          className="welcome-terminal w-full max-w-4xl overflow-hidden border-[3px] border-info bg-background shadow-[8px_8px_0_0_var(--color-accent)]"
        >
          <header className="flex min-h-12 items-center justify-between gap-4 border-b-[3px] border-info bg-surface-2 px-4 py-2">
            <div className="flex items-center gap-3">
              <span className="grid size-7 place-items-center border-2 border-info bg-info text-sm font-black text-info-foreground" aria-hidden>S</span>
              <span className="font-mono text-xs font-black uppercase text-info">SIXMA</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden font-mono text-xs font-bold text-success sm:inline">● {t("welcome.online")}</span>
              <LanguageSwitch className="[&_select]:h-9 [&_select]:min-w-28 [&_select]:border-2" />
            </div>
          </header>

          <div className="relative px-5 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
            <span className="absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-accent" aria-hidden />
            <span className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-accent" aria-hidden />

            <p className="font-mono text-xs font-black uppercase text-accent sm:text-sm">{t("welcome.eyebrow")}</p>
            <h1 id="welcome-title" className="mt-4 max-w-3xl text-3xl font-black leading-tight text-foreground sm:text-5xl lg:text-6xl">
              {t("welcome.title")}
            </h1>
            <p id="welcome-description" className="mt-5 max-w-2xl text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
              {t("welcome.description")}
            </p>

            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              <Button autoFocus disabled={Boolean(pendingDestination)} tone="primary" className="min-h-14 w-full px-5 text-base" onClick={() => navigate(`/mission/${FEATURED_DEMO_CASE_ID}`)}>
                {pendingDestination === `/mission/${FEATURED_DEMO_CASE_ID}` ? t("welcome.opening") : t("welcome.play")}
              </Button>
              <Button disabled={Boolean(pendingDestination)} tone="secondary" className="min-h-14 w-full px-5" onClick={() => navigate("/redeem")}>
                {pendingDestination === "/redeem" ? t("welcome.opening") : t("welcome.redeem")}
              </Button>
              <Button disabled={Boolean(pendingDestination)} tone="ghost" className="min-h-14 w-full px-5" onClick={() => navigate("/about")}>
                {pendingDestination === "/about" ? t("welcome.opening") : t("welcome.about")}
              </Button>
            </div>

            <p className="mt-5 font-mono text-xs leading-5 text-muted-foreground">{t("welcome.cardPrompt")}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
