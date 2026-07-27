"use client";

import { useCallback, useEffect, useState } from "react";
import ImageForensics from "../modules/ImageForensics";
import SortingGame from "../modules/SortingGame";
import TextHighlight from "../modules/TextHighlight";
import type {
  CaseData,
  SocraticQuiz,
} from "@/lib/case-types";

export type { CaseData } from "@/lib/case-types";

export type GameStep = 1 | 2 | 3;

export type GameCaseData = CaseData;

export interface GameControllerProps {
  caseData: GameCaseData;
  storageKey?: string;
  onCaseComplete?: () => void;
  onStepChange?: (step: GameStep) => void;
}

const FIRST_STEP: GameStep = 1;
const LAST_STEP: GameStep = 3;
const STORAGE_VERSION = "v2";

function parseStoredStep(value: string | null): GameStep | null {
  const parsedValue = Number(value);

  if (parsedValue === 1 || parsedValue === 2 || parsedValue === 3) {
    return parsedValue;
  }

  return null;
}

function readStoredStep(storageKey: string): GameStep | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return parseStoredStep(window.localStorage.getItem(storageKey));
  } catch {
    return null;
  }
}

function writeStoredStep(storageKey: string, step: GameStep): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, String(step));
  } catch {
    return;
  }
}

function getQuizQuestion(quiz: SocraticQuiz): string {
  return quiz.question ?? quiz.push_question ?? "";
}

export default function GameController({
  caseData,
  storageKey,
  onCaseComplete,
  onStepChange,
}: GameControllerProps) {
  const persistenceKey =
    storageKey ??
    `unesco-mil-game:${STORAGE_VERSION}:${caseData.case_id}:current-step`;
  const [currentStep, setCurrentStep] = useState<GameStep>(FIRST_STEP);
  const [hasRestoredStep, setHasRestoredStep] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let cancelled = false;
    const restoreTimer = window.setTimeout(() => {
      if (cancelled) {
        return;
      }

      const storedStep = readStoredStep(persistenceKey);

      if (storedStep !== null) {
        setCurrentStep(storedStep);
      }

      setHasRestoredStep(true);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(restoreTimer);
    };
  }, [persistenceKey]);

  useEffect(() => {
    if (!hasRestoredStep) {
      return;
    }

    writeStoredStep(persistenceKey, currentStep);
  }, [currentStep, hasRestoredStep, persistenceKey]);

  useEffect(() => {
    if (hasRestoredStep) {
      onStepChange?.(currentStep);
    }
  }, [currentStep, hasRestoredStep, onStepChange]);

  const handleStepComplete = useCallback(() => {
    setCurrentStep((step) => {
      const nextStep = Math.min(step + 1, LAST_STEP) as GameStep;
      writeStoredStep(persistenceKey, nextStep);
      return nextStep;
    });
  }, [persistenceKey]);

  const handleStepBack = useCallback(() => {
    setCurrentStep((step) => {
      const previousStep = Math.max(step - 1, FIRST_STEP) as GameStep;
      writeStoredStep(persistenceKey, previousStep);
      return previousStep;
    });
  }, [persistenceKey]);

  let activeModule: React.ReactNode;

  switch (currentStep) {
    case 1: {
      const imageModule = caseData.modules.step_1_image_forensics;
      activeModule = (
        <ImageForensics
          imageUrl={imageModule.image_url}
          contextText={imageModule.context_text}
          imageWidth={imageModule.image_width}
          imageHeight={imageModule.image_height}
          targetAnomalies={imageModule.target_anomalies.map((anomaly) => ({
            ...anomaly,
            socratic_quiz: anomaly.socratic_quiz
              ? {
                  question: getQuizQuestion(anomaly.socratic_quiz),
                  options: anomaly.socratic_quiz.options,
                  correct_option: anomaly.socratic_quiz.correct_option,
                  explanation: anomaly.socratic_quiz.explanation,
                }
              : undefined,
          }))}
          socraticQuiz={imageModule.socratic_quiz ? {
            question: getQuizQuestion(imageModule.socratic_quiz),
            options: imageModule.socratic_quiz.options,
            correct_option: imageModule.socratic_quiz.correct_option,
            explanation: imageModule.socratic_quiz.explanation,
          } : undefined}
          onComplete={handleStepComplete}
          onBack={handleStepBack}
        />
      );
      break;
    }
    case 2: {
      const textModule = caseData.modules.step_2_text_highlight;

      activeModule = (
        <TextHighlight
          postAuthor={textModule.simulated_post.author}
          postTime={textModule.simulated_post.time_posted}
          content={textModule.simulated_post.content}
          traps={textModule.traps}
          iouThreshold={0.7}
          onComplete={handleStepComplete}
          onBack={handleStepBack}
        />
      );
      break;
    }
    case 3: {
      const sortingModule = caseData.modules.step_3_sorting_game;

      activeModule = (
        <SortingGame
          taskInstruction={sortingModule.task_instruction}
          poolItems={sortingModule.pool_items.map((item) => ({
            id: item.item_id,
            text: item.text,
          }))}
          correctSequence={sortingModule.correct_sequence}
          validationFeedback={sortingModule.validation_feedback}
          onComplete={onCaseComplete ?? handleStepComplete}
          onBack={handleStepBack}
        />
      );
      break;
    }
  }

  return activeModule;
}
