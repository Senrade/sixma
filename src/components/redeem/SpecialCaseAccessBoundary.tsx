"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AppShell } from "@/components/site/AppShell";
import { ButtonLink, Chip } from "@/components/ui/Primitives";
import { useI18n } from "@/i18n/I18nProvider";
import { SPECIAL_EVENT_CASE_ID } from "@/lib/demo-event";
import { hasDemoEventAccess } from "@/lib/demo-event-storage";

export function SpecialCaseAccessBoundary({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<"checking" | "granted" | "locked">("checking");
  const { localizePath, t } = useI18n();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAccess(hasDemoEventAccess() ? "granted" : "locked");
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (access === "checking") {
    return (
      <main className="case-grid-bg grid min-h-screen place-items-center px-4">
        <p className="font-mono text-sm font-black uppercase">{t("special.checkingAccess")}</p>
      </main>
    );
  }

  if (access === "locked") {
    return (
      <AppShell>
        <section className="case-grid-bg grid min-h-[70vh] place-items-center px-4 py-16">
          <div className="cyber-panel w-full max-w-xl p-6 sm:p-8">
            <Chip tone="amber">{t("special.cardRequired")}</Chip>
            <p className="mt-5 font-mono text-sm font-black uppercase text-danger">
              {SPECIAL_EVENT_CASE_ID}
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">{t("special.lockedTitle")}</h1>
            <p className="mt-4 leading-7 text-ink-soft">{t("special.lockedBody")}</p>
            <ButtonLink href={localizePath("/redeem")} tone="accent" className="mt-7">
              {t("special.redeemCard")}
            </ButtonLink>
          </div>
        </section>
      </AppShell>
    );
  }

  return children;
}
