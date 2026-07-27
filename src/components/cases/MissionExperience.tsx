"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import GameController, {
  type GameStep,
} from "@/components/controllers/GameController";
import { Progress } from "@/components/ui/Primitives";
import type { CaseData } from "@/lib/case-types";

const STEP_LABELS = ["Inspect", "Analyze", "Reconstruct"] as const;

export function MissionExperience({ caseData }: { caseData: CaseData }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<GameStep>(1);

  const handleComplete = useCallback(() => {
    try {
      window.localStorage.setItem(
        `veritas-case:${caseData.case_id}:completed-at`,
        new Date().toISOString(),
      );
    } catch {
      // Completion still works when storage is unavailable.
    }

    router.push(`/cases/${caseData.case_id}/debrief`);
  }, [caseData.case_id, router]);

  return (
    <main className="case-grid-bg min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b-2 border-ink bg-background px-3 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Link
            href={`/cases/${caseData.case_id}`}
            className="inline-flex min-h-10 items-center rounded-[6px] border-2 border-ink bg-surface px-3 text-sm font-bold text-ink shadow-[3px_3px_0_0_var(--color-ink)] hover:bg-accent"
          >
            <span aria-hidden>&lt;-</span>
            <span className="ml-2 hidden sm:inline">Exit mission</span>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate font-mono text-xs font-black uppercase text-danger">
                {caseData.case_id} / {STEP_LABELS[currentStep - 1]}
              </p>
              <span className="shrink-0 font-mono text-xs text-ink-soft">
                Step {currentStep} of 3
              </span>
            </div>
            <Progress
              value={(currentStep / 3) * 100}
              className="mt-1.5 h-2 bg-surface [&>div]:bg-info"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-2 py-4 sm:px-4 sm:py-6">
        <GameController
          caseData={caseData}
          onStepChange={setCurrentStep}
          onCaseComplete={handleComplete}
        />
      </div>
    </main>
  );
}
