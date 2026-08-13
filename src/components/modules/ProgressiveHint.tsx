import { useId, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { gameButtonSecondary } from "./moduleStyles";

interface ProgressiveHintProps {
  hints: string[];
  available: boolean;
}

export function ProgressiveHint({ hints, available }: ProgressiveHintProps) {
  const { t } = useI18n();
  const hintId = useId();
  const [revealedCount, setRevealedCount] = useState(0);

  if (!available || hints.length === 0) {
    return null;
  }

  const hasMoreHints = revealedCount < hints.length;

  return (
    <div className="mt-3 border-l-4 border-info bg-info/10 px-3 py-3">
      {revealedCount > 0 && (
        <div id={hintId} role="status" aria-live="polite">
          <p className="font-mono text-[11px] font-black uppercase text-info">
            {t("module.hint.label", { current: revealedCount, total: hints.length })}
          </p>
          <p className="mt-1 text-sm font-bold leading-6 text-ink">
            {hints[revealedCount - 1]}
          </p>
        </div>
      )}
      {hasMoreHints && (
        <button
          type="button"
          aria-controls={revealedCount > 0 ? hintId : undefined}
          onClick={() => setRevealedCount((count) => count + 1)}
          className={`${revealedCount > 0 ? "mt-3" : ""} ${gameButtonSecondary}`}
        >
          {revealedCount === 0
            ? t("module.hint.show")
            : t("module.hint.next")}
        </button>
      )}
    </div>
  );
}
