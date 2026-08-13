"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ButtonLink, Chip } from "@/components/ui/Primitives";
import { useI18n } from "@/i18n/I18nProvider";
import { readDemoEventBadge } from "@/lib/demo-event-storage";
import { getActiveDemoEventCard } from "@/lib/demo-event";

export function DemoEventBadgeCallout() {
  const [earned, setEarned] = useState(false);
  const { localizePath, t } = useI18n();
  const activeCard = getActiveDemoEventCard();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setEarned(readDemoEventBadge() !== null);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (!earned) return null;

  return (
    <section className="mt-8 grid gap-5 border-[3px] border-success bg-success p-5 text-success-foreground shadow-[6px_6px_0_0_var(--color-ink)] sm:grid-cols-[7rem_1fr] sm:items-center sm:p-6">
      <div className="relative mx-auto aspect-[5/7] w-24 overflow-hidden border-[3px] border-ink bg-surface sm:w-28">
        <Image
          src={activeCard.artworkUrl}
          alt={t("redeem.cardArtAlt", { cardName: activeCard.name })}
          fill
          sizes="112px"
          unoptimized
          className="object-cover object-top"
        />
      </div>
      <div>
        <Chip tone="green">{t("badge.earned")}</Chip>
        <h2 className="mt-3 text-2xl font-black">{t("badge.signalBreaker.title")}</h2>
        <p className="mt-2 leading-7">{t("badge.signalBreaker.description")}</p>
        <ButtonLink href={localizePath("/achievements")} tone="secondary" className="mt-5">
          {t("badge.viewCollection")}
        </ButtonLink>
      </div>
    </section>
  );
}
