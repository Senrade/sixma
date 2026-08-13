import { useId, useState } from "react";
import type { ModuleGuideDefinition } from "@/lib/module-guides";
import { useI18n } from "@/i18n/I18nProvider";

export function ModuleGuide({
  guide,
  defaultExpanded = true,
}: {
  guide: ModuleGuideDefinition;
  defaultExpanded?: boolean;
}) {
  const { t } = useI18n();
  const title = t(guide.title);
  const stepsId = useId();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section
      className="mb-4 border-l-4 border-info bg-info/10 px-4 py-3"
      aria-label={t("module.guide.aria", { title })}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] font-black uppercase text-info">
          {t("module.guide.label", { number: guide.number })}
        </p>
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls={stepsId}
          onClick={() => setIsExpanded((expanded) => !expanded)}
          className="shrink-0 font-mono text-[11px] font-black uppercase text-info underline decoration-2 underline-offset-2"
        >
          {isExpanded ? t("module.guide.hide") : t("module.guide.show")}
        </button>
      </div>
      <p className="mt-1 text-sm font-black text-ink">{t(guide.summary)}</p>
      {isExpanded && (
        <ol id={stepsId} className="mt-2 grid gap-1 text-sm leading-6 text-ink-soft sm:grid-cols-2 sm:gap-4">
          {guide.steps.map((step, index) => (
            <li key={step} className="flex gap-2">
              <span className="font-mono font-black text-info">{index + 1}.</span>
              <span>{t(step)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
