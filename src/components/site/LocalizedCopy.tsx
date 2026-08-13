"use client";

import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/messages/types";
import { cn, SectionLabel } from "@/components/ui/Primitives";

export function LocalizedText({ messageKey, replacements }: { messageKey: MessageKey; replacements?: Record<string, string | number> }) {
  const { t } = useI18n();
  return t(messageKey, replacements);
}

export function LocalizedPageIntro({
  kicker,
  title,
  description,
  descriptionClassName,
}: {
  kicker: MessageKey;
  title: MessageKey;
  description: MessageKey;
  descriptionClassName?: string;
}) {
  const { t } = useI18n();

  return (
    <>
      <SectionLabel>{t(kicker)}</SectionLabel>
      <h1 className="text-glow mt-3 text-4xl font-black sm:text-5xl">{t(title)}</h1>
      <p className={cn("mt-3 max-w-2xl text-lg text-ink-soft", descriptionClassName)}>{t(description)}</p>
    </>
  );
}
